from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from collections import Counter
import cv2
import numpy as np
import os
import traceback
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'my_precious_secret_key')

# ── MongoDB Setup ──
MONGO_URI = os.environ.get('MONGO_URI', "mongodb+srv://admin:Agrillink1126@cluster0.fsdgysa.mongodb.net/?appName=Cluster0")
if MONGO_URI:
    try:
        client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
        db = client.get_database("agrilink")
        scans_collection = db.get_collection("scans")
        users_collection = db.get_collection("users")
        products_collection = db.get_collection("products")
        orders_collection = db.get_collection("orders")
        
        # Create indexes
        users_collection.create_index([("email", 1)], unique=True)
        users_collection.create_index([("location", "2dsphere")])
        products_collection.create_index([("pickup_location", "2dsphere")])
        
        print("Successfully connected to MongoDB and ensured indexes")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        scans_collection = users_collection = products_collection = orders_collection = None
else:
    print("Warning: MONGO_URI not found in .env. MongoDB integration disabled.")
    scans_collection = users_collection = products_collection = orders_collection = None

# ── Auth Middleware ──
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'error': 'Token is invalid!', 'details': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# Use the converted model file
MODEL_PATH = "model_fixed.pt"

if os.path.exists(MODEL_PATH):
    try:
        model = YOLO(MODEL_PATH)
        print(f"Successfully loaded model from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading {MODEL_PATH}: {e}")
        model = None
else:
    print(f"Warning: {MODEL_PATH} not found.")
    model = None

# ── Breed/Variety mapping based on YOLO class names ──
BREED_MAP = {
    "Apple": ["Fuji", "Gala", "Red Delicious"],
    "Red Apple": ["Fuji", "Gala", "Red Delicious"],
    "Green Apple": ["Granny Smith", "Golden Delicious"],
    "Banana": ["Cavendish", "Robusta"],
    "Orange": ["Nagpur Mandarin", "Valencia"],
    "Tomato": ["Roma", "Cherry", "Hybrid"],
    "Onion": ["Nashik Red", "White Onion"],
    "Potato": ["Kufri Jyoti", "Kufri Pukhraj"],
    "Grapes": ["Thompson Seedless", "Sharad Seedless"],
    "Lemon": ["Kagzi Nimbu", "Seedless"],
    "Carrot": ["Pusa Kesar", "Nantes"],
    "Mango": ["Alphonso", "Kesar", "Langra"],
    "Guava": ["Allahabad Safeda", "Pink Flesh"],
    "Pomegranate": ["Bhagwa", "Ganesh"],
    "Capsicum": ["California Wonder", "Hybrid"],
}

# Minimum confidence to accept a detection (0-1 scale)
MIN_CONFIDENCE = 0.30

# If one class has >= this fraction of total detections, treat rest as noise
DOMINANT_CLASS_THRESHOLD = 0.40

# Known visual confusion pairs — when both appear, keep the one with higher
# average confidence and re-label the confused one
CONFUSION_GROUPS = [
    {"Apple", "Tomato", "Jujube"},    # Red round fruits often confused
    {"Orange", "Tomato"},              # Orange-red round items
    {"Lemon", "Guava"},                # Yellow-green items
]


def get_base_name(raw_name):
    """Strip quality suffix: 'Banana-Fresh' -> 'Banana', 'Jujube-Rottens' -> 'Jujube'"""
    import re
    clean = re.sub(r'-?[Ff]resh$', '', raw_name)
    clean = re.sub(r'-?[Rr]otten[s]?$', '', clean)
    return clean.strip()


def get_quality(raw_name):
    """Extract quality from name: 'Banana-Fresh' -> 'Fresh'"""
    lower = raw_name.lower()
    if "rotten" in lower:
        return "Rotten"
    return "Fresh"


def guess_breed(base_name, quality):
    """Return a likely breed/variety for the detected item."""
    breeds = BREED_MAP.get(base_name, None)
    if breeds:
        # For simplicity, return the first (most common) variety
        # In production, a secondary classifier would determine this
        return breeds[0]
    return "Common"


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
        
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    
    try:
        # Read image
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"error": "Could not decode image"}), 400

        # Run YOLO detection
        results = model(img)
        
        # Get all detections with confidence
        boxes = results[0].boxes
        all_classes = boxes.cls.tolist()
        all_confs = boxes.conf.tolist()
        all_names = [model.names[int(c)] for c in all_classes]
        
        # ─── Step 1: Filter by minimum confidence ───
        filtered = [
            (name, conf) for name, conf in zip(all_names, all_confs)
            if conf >= MIN_CONFIDENCE
        ]
        
        if not filtered:
            return jsonify({
                "items": [],
                "confidence": 0,
                "status": "complete"
            })
        
        names_filtered = [f[0] for f in filtered]
        confs_filtered = [f[1] for f in filtered]
        
        # ─── Step 1.5: Confusion Resolution ───
        # Calculate average confidence per base class
        base_class_confs = {}
        for name, conf in filtered:
            base = get_base_name(name)
            if base not in base_class_confs:
                base_class_confs[base] = []
            base_class_confs[base].append(conf)
            
        avg_base_confs = {b: sum(c)/len(c) for b, c in base_class_confs.items()}
        
        # Determine re-mapping for confused classes
        relabel_map = {}
        for group in CONFUSION_GROUPS:
            present = [b for b in base_class_confs.keys() if b in group]
            if len(present) > 1:
                # Pick the class with the highest average confidence as the "true" class
                winner = max(present, key=lambda b: avg_base_confs[b])
                for loser in present:
                    if loser != winner:
                        relabel_map[loser] = winner
                        print(f"  [Confusion] Re-labeling {loser} -> {winner} (conf: {avg_base_confs[loser]:.2f} vs {avg_base_confs[winner]:.2f})")
        
        # Apply re-labeling
        relabeled = []
        for name, conf in filtered:
            base = get_base_name(name)
            if base in relabel_map:
                quality = get_quality(name)
                # Reconstruct name, e.g., "Apple-Fresh"
                new_name = f"{relabel_map[base]}-{quality}"
                relabeled.append((new_name, conf))
            else:
                relabeled.append((name, conf))
        
        filtered = relabeled
        names_filtered = [f[0] for f in filtered]
        confs_filtered = [f[1] for f in filtered]
        
        # ─── Step 2: Dominant class suppression ───
        base_counts = Counter([get_base_name(n) for n in names_filtered])
        total_detections = len(names_filtered)
        
        dominant_base, dominant_count = base_counts.most_common(1)[0]
        dominant_ratio = dominant_count / total_detections
        
        if dominant_ratio >= DOMINANT_CLASS_THRESHOLD and len(base_counts) > 1:
            suppressed = []
            for name, conf in filtered:
                base = get_base_name(name)
                if base == dominant_base:
                    suppressed.append((name, conf))
                elif conf > 0.60:
                    suppressed.append((name, conf))
                else:
                    print(f"  [Suppressed] {name} (conf={conf:.2f}) - dominant={dominant_base}")
            
            filtered = suppressed
            names_filtered = [f[0] for f in filtered]
            confs_filtered = [f[1] for f in filtered]
        
        # ─── Step 3: Count and aggregate ───
        item_counts = Counter(names_filtered)
        avg_conf = sum(confs_filtered) / len(confs_filtered) * 100 if confs_filtered else 0
        
        # Per-class average confidence
        class_confs = {}
        for name, conf in filtered:
            if name not in class_confs:
                class_confs[name] = []
            class_confs[name].append(conf)
        
        output_items = []
        for raw_name, count in item_counts.items():
            base_name = get_base_name(raw_name)
            quality = get_quality(raw_name)
            breed = guess_breed(base_name, quality)
            item_conf = sum(class_confs[raw_name]) / len(class_confs[raw_name]) * 100
            
            output_items.append({
                "name": raw_name,
                "baseName": base_name,
                "count": count,
                "quality": quality,
                "breed": breed,
                "confidence": round(item_conf, 1),
            })
            
        response_data = {
            "items": output_items,
            "confidence": round(avg_conf, 1),
            "totalDetections": total_detections,
            "filteredDetections": len(filtered),
            "dominantClass": dominant_base,
            "status": "complete"
        }

        # Save to MongoDB if available
        if scans_collection is not None and len(output_items) > 0:
            scan_record = {
                "timestamp": datetime.now(timezone.utc),
                "items": output_items,
                "confidence": round(avg_conf, 1),
                "totalDetections": total_detections,
                "filteredDetections": len(filtered),
                "dominantClass": dominant_base
            }
            try:
                scans_collection.insert_one(scan_record)
                print("Scan result saved to MongoDB")
            except Exception as e:
                print(f"Error saving to MongoDB: {e}")

        return jsonify(response_data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Detection failed: {str(e)}"}), 500

@app.route('/scans', methods=['GET'])
def get_scans():
    if scans_collection is None:
        return jsonify({"error": "MongoDB not configured"}), 500
    try:
        # Fetch last 50 scans, sorted by newest first
        scans = list(scans_collection.find().sort("timestamp", -1).limit(50))
        # Convert ObjectId and datetime to string for JSON serialization
        for scan in scans:
            scan["_id"] = str(scan["_id"])
            if "timestamp" in scan and isinstance(scan["timestamp"], datetime):
                scan["timestamp"] = scan["timestamp"].isoformat()
        return jsonify(scans)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch scans: {str(e)}"}), 500

# ── E-commerce APIs ──

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing required fields (email, password)'}), 400
            
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'User with this email already exists'}), 400
            
        hashed_password = generate_password_hash(data['password'])
        
        # Parse location if provided
        location = None
        if data.get('longitude') is not None and data.get('latitude') is not None:
            location = {
                "type": "Point",
                "coordinates": [float(data['longitude']), float(data['latitude'])]
            }
            
        new_user = {
            'name': data.get('name', ''),
            'email': data['email'],
            'password_hash': hashed_password,
            'role': data.get('role', 'customer'), # 'farmer' or 'customer'
            'phone': data.get('phone', ''),
            'address': data.get('address', ''),
            'city': data.get('city', ''),
            'district': data.get('district', ''),
            'state': data.get('state', ''),
            'pincode': data.get('pincode', ''),
            'location': location,
            'created_at': datetime.now(timezone.utc)
        }
        
        result = users_collection.insert_one(new_user)
        return jsonify({'message': 'User created successfully', 'user_id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing credentials'}), 400
            
        user = users_collection.find_one({'email': data['email']})
        if not user or not check_password_hash(user['password_hash'], data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
            
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.now(timezone.utc) + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    try:
        user_data = dict(current_user)
        user_data['_id'] = str(user_data['_id'])
        user_data.pop('password_hash', None)
        if isinstance(user_data.get('created_at'), datetime):
            user_data['created_at'] = user_data['created_at'].isoformat()
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        # Fetch all active products
        products = list(products_collection.find({'status': {'$ne': 'sold_out'}}).sort("created_at", -1))
        for product in products:
            product['_id'] = str(product['_id'])
            product['farmer_id'] = str(product['farmer_id'])
            if 'scan_id' in product and product['scan_id']:
                product['scan_id'] = str(product['scan_id'])
            product['created_at'] = product['created_at'].isoformat() if isinstance(product.get('created_at'), datetime) else product.get('created_at')
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
@token_required
def create_product(current_user):
    try:
        if current_user.get('role') != 'farmer':
            return jsonify({'error': 'Only farmers can create products'}), 403
            
        data = request.json
        if not data or not data.get('crop_name') or not data.get('price_per_kg') or not data.get('quantity_available'):
            return jsonify({'error': 'Missing required fields'}), 400
            
        pickup_location = None
        if data.get('pickup_longitude') is not None and data.get('pickup_latitude') is not None:
            pickup_location = {
                "type": "Point",
                "coordinates": [float(data['pickup_longitude']), float(data['pickup_latitude'])]
            }
            
        new_product = {
            'farmer_id': str(current_user['_id']),
            'scan_id': data.get('scan_id'),
            'crop_name': data['crop_name'],
            'quantity_available': float(data['quantity_available']),
            'price_per_kg': float(data['price_per_kg']),
            'quality_grade': data.get('quality_grade', 'Standard'),
            
            'pickup_address': data.get('pickup_address', current_user.get('address', '')),
            'pickup_city': data.get('pickup_city', current_user.get('city', '')),
            'pickup_district': data.get('pickup_district', current_user.get('district', '')),
            'pickup_state': data.get('pickup_state', current_user.get('state', '')),
            'pickup_pincode': data.get('pickup_pincode', current_user.get('pincode', '')),
            'pickup_location': pickup_location or current_user.get('location'),
            
            'status': 'active',
            'created_at': datetime.now(timezone.utc)
        }
        
        result = products_collection.insert_one(new_product)
        return jsonify({'message': 'Product created', 'product_id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['GET'])
@token_required
def get_orders(current_user):
    try:
        user_id = str(current_user['_id'])
        query = {'farmer_id': user_id} if current_user.get('role') == 'farmer' else {'customer_id': user_id}
        orders = list(orders_collection.find(query).sort("created_at", -1))
        
        for order in orders:
            order['_id'] = str(order['_id'])
            order['created_at'] = order['created_at'].isoformat() if isinstance(order.get('created_at'), datetime) else order.get('created_at')
        return jsonify(orders), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
@token_required
def create_order(current_user):
    try:
        if current_user.get('role') != 'customer':
            return jsonify({'error': 'Only customers can place orders'}), 403
            
        data = request.json
        if not data or not data.get('product_id') or not data.get('quantity_booked'):
            return jsonify({'error': 'Missing required fields'}), 400
            
        product = products_collection.find_one({'_id': ObjectId(data['product_id'])})
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        quantity_booked = float(data['quantity_booked'])
        if quantity_booked > product.get('quantity_available', 0):
            return jsonify({'error': 'Not enough quantity available'}), 400
            
        total_price = quantity_booked * product.get('price_per_kg', 0)
        
        new_order = {
            'customer_id': str(current_user['_id']),
            'farmer_id': product['farmer_id'],
            'product_id': str(product['_id']),
            'quantity_booked': quantity_booked,
            'total_price': total_price,
            
            'delivery_address': data.get('delivery_address', current_user.get('address', '')),
            'delivery_city': data.get('delivery_city', current_user.get('city', '')),
            'delivery_district': data.get('delivery_district', current_user.get('district', '')),
            'delivery_state': data.get('delivery_state', current_user.get('state', '')),
            'delivery_pincode': data.get('delivery_pincode', current_user.get('pincode', '')),
            
            'pickup_address': product.get('pickup_address', ''),
            'pickup_city': product.get('pickup_city', ''),
            'pickup_district': product.get('pickup_district', ''),
            'pickup_state': product.get('pickup_state', ''),
            'pickup_pincode': product.get('pickup_pincode', ''),
            
            'status': 'pending',
            'created_at': datetime.now(timezone.utc)
        }
        
        # Update product quantity
        new_quantity = product['quantity_available'] - quantity_booked
        status = 'sold_out' if new_quantity <= 0 else 'active'
        products_collection.update_one(
            {'_id': ObjectId(data['product_id'])},
            {'$set': {'quantity_available': new_quantity, 'status': status}}
        )
        
        result = orders_collection.insert_one(new_order)
        return jsonify({'message': 'Order created', 'order_id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Starting AgriLink AI Server with model: {MODEL_PATH}")
    app.run(host='0.0.0.0', port=5000)

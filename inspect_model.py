import joblib

try:
    data = joblib.load("model.pkl")
    if isinstance(data, dict):
        if 'model' in data:
            print(f"Type of data['model']: {type(data['model'])}")
            if hasattr(data['model'], 'predict'):
                print("data['model'] has predict!")
            if hasattr(data['model'], 'names'):
                print(f"data['model'] has names: {data['model'].names}")
except Exception as e:
    print(f"Error: {e}")

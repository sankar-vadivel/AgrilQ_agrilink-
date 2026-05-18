from pymongo import MongoClient
import certifi

MONGO_URI = "PASTE_YOUR_MONGODB_STRING_HERE"

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000
)

print(client.server_info())
print("MongoDB connected successfully")
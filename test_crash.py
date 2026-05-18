from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
import joblib
from collections import Counter
import traceback

# Simulation to see where it crashes
MODEL_PATH = "model.pkl"
data = joblib.load(MODEL_PATH)
print(f"Loaded data type: {type(data)}")

# Create a dummy image
img = np.zeros((100, 100, 3), dtype=np.uint8)

try:
    resized = cv2.resize(img, (64, 64)) 
    flat_img = resized.flatten().reshape(1, -1)
    print(f"Shape: {flat_img.shape}")
    
    # This will likely fail if data is dict
    prediction = data.predict(flat_img)
    print(f"Prediction: {prediction}")
except Exception as e:
    print("Caught expected error:")
    traceback.print_exc()

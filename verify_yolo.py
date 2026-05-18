from ultralytics import YOLO
import sys

try:
    model = YOLO("model.pkl")
    print("SUCCESS: Loaded model.pkl as YOLO")
    print(f"Names: {model.names}")
except Exception as e:
    print(f"FAILED: {e}")
    sys.exit(1)

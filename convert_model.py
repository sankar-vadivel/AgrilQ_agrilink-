import joblib
import torch

try:
    data = joblib.load("model.pkl")
    torch.save(data, "model_fixed.pt")
    print("SUCCESS: Converted model.pkl to model_fixed.pt")
except Exception as e:
    print(f"FAILED: {e}")

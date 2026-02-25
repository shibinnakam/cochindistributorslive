import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def test_anomaly_logic():
    # Simulate historical data (mostly normal 8-hour stays)
    data = [
        {"duration_minutes": 480, "arrival_deviation": 10},
        {"duration_minutes": 475, "arrival_deviation": 5},
        {"duration_minutes": 490, "arrival_deviation": 15},
        {"duration_minutes": 485, "arrival_deviation": 2},
        {"duration_minutes": 30, "arrival_deviation": 60},  # Suspicious: Short stay, late arrival
        {"duration_minutes": 470, "arrival_deviation": 8},
        {"duration_minutes": 5, "arrival_deviation": 120},  # Suspicious: Very short stay
    ]
    
    df = pd.DataFrame(data)
    
    model = IsolationForest(contamination=0.2, random_state=42)
    model.fit(df)
    
    predictions = model.predict(df)
    scores = model.decision_function(df)
    
    print("Verification Results:")
    for i, (pred, score) in enumerate(zip(predictions, scores)):
        status = "Suspicious" if pred == -1 else "Normal"
        anomaly_perc = int((0.5 - score) * 100)
        print(f"Record {i}: Duration={data[i]['duration_minutes']} min, Status={status}, Score={anomaly_perc}%")

if __name__ == "__main__":
    test_anomaly_logic()

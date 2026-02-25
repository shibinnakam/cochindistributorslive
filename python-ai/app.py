from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

app = Flask(__name__)
CORS(app)

# Path to save the model
MODEL_PATH = "isolation_forest_model.joblib"

# Initialize model
def get_model():
    if os.path.exists(MODEL_PATH):
        try:
            return joblib.load(MODEL_PATH)
        except Exception:
            return IsolationForest(contamination=0.1, random_state=42)
    return IsolationForest(contamination=0.1, random_state=42)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({"success": False, "error": "No features provided"}), 400

        features_list = data['features'] # List of dicts or list of lists
        
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(features_list)
        
        # Features expected: [duration_minutes, arrival_deviation, scan_interval, short_stay_count]
        # For now, let's assume the Node backend sends these 4 features
        
        model = get_model()
        
        # Train on the provided data if it's large enough, or just use for prediction
        # In a real scenario, we'd have a separate training loop
        # For this research implementation, we fit on the fly if needed or just predict
        
        if len(df) < 5:
            # Not enough data to really "detect" anomalies relative to itself
            # Return a default neutral score
            return jsonify({
                "success": True, 
                "results": [{"score": 0.5, "status": "Normal"}] * len(df)
            })

        # Fit/Predict
        # Isolation Forest returns -1 for anomalies and 1 for normal
        model.fit(df)
        predictions = model.predict(df)
        
        # Decision function returns a score where lower values are more anomalous
        scores = model.decision_function(df)
        
        # Normalize scores to 0-100 range (higher = more suspicious)
        # decision_function returns values roughly in [-0.5, 0.5]
        # We want to map this so that low values (anomaly) -> high percentage
        
        results = []
        for pred, score in zip(predictions, scores):
            # Simple mapping: -0.5 to 0.5 -> 100 to 0
            # Higher anomaly score means more suspicious
            anomaly_percentage = max(0, min(100, int((0.5 - score) * 100)))
            
            status = "Normal" if pred == 1 else "Suspicious"
            if anomaly_percentage > 70:
                status = "Suspicious"
            
            results.append({
                "score": anomaly_percentage,
                "status": status
            })

        return jsonify({"success": True, "results": results})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(port=5001, debug=True)

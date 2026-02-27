from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os
import face_recognition
import cv2
import requests
from io import BytesIO

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
            return IsolationForest(contamination=0.1, random_state=42, n_estimators=100)
    return IsolationForest(contamination=0.1, random_state=42, n_estimators=100)


def rule_based_analysis(row):
    """
    Rule-based anomaly detection aligned with the research paper.
    Uses feature vector x = [d, a, i, s] as per Equations (6)-(9).

    Scenarios:
    - d < 5 min  → Suspicious (score 90%) — proxy attendance / scan & leave
    - d < 15 min → Suspicious (score 80%) — short stay indicator s=1 per Eq(9)
    - d < 30 min → Suspicious (score 65%) — abnormally short work session
    - a > 180 min (3hr late) → adds suspicion
    - s >= 1 (short_stay_count from history) → boosts score
    - d >= 30 min, normal arrival → Normal (score ≤ 25%)
    """
    duration = row.get('duration_minutes', 0)
    arrival_dev = row.get('arrival_deviation', 0)
    short_stay = row.get('short_stay_count', 0)

    score = 0
    reasons = []

    # Rule 1: Very short duration (< 5 min) — proxy attendance / scan & leave
    if duration < 5:
        score = max(score, 90)
        reasons.append("Very short stay (<5 min)")
    # Rule 2: Short stay per paper's indicator function 1[d < 15]
    elif duration < 15:
        score = max(score, 80)
        reasons.append("Short stay (<15 min)")
    # Rule 3: Abnormally short work session
    elif duration < 30:
        score = max(score, 65)
        reasons.append("Short work session (<30 min)")
    # Rule 4: Below half-day
    elif duration < 120:
        score = max(score, 40)
        reasons.append("Less than 2 hours")
    else:
        # Normal duration — low score based on how close to full day
        full_day_minutes = 480  # 8 hours
        ratio = min(duration / full_day_minutes, 1.0)
        score = max(0, int(25 * (1 - ratio)))

    # Rule 5: Very late arrival (> 3 hours from 9 AM)
    if arrival_dev > 180:
        score = max(score, score + 10, 60)
        reasons.append("Very late arrival (>3hr from 9AM)")
    elif arrival_dev > 120:
        score = max(score, score + 5)
        reasons.append("Late arrival (>2hr from 9AM)")

    # Rule 6: Historical short stay pattern
    if short_stay >= 3:
        score = min(100, score + 15)
        reasons.append(f"Repeated short stays ({short_stay} times)")
    elif short_stay >= 1 and duration < 30:
        score = min(100, score + 10)
        reasons.append(f"Short stay with history ({short_stay} prev)")

    # Threshold τ = 70% as per paper Equation (5)
    status = "Suspicious" if score > 70 else "Normal"

    return {"score": score, "status": status, "reasons": reasons}


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({"success": False, "error": "No features provided"}), 400

        features_list = data['features']  # List of dicts
        df = pd.DataFrame(features_list)

        # Features: [duration_minutes, arrival_deviation, scan_interval, short_stay_count]
        # As per paper Equations (6)-(9)

        if len(df) < 5:
            # Cold Start: Not enough data for ML-based Isolation Forest
            # Use rule-based analysis per paper Section VI.E
            results = []
            for _, row in df.iterrows():
                result = rule_based_analysis(row)
                results.append(result)
            return jsonify({"success": True, "results": results})

        # Sufficient data — Use Isolation Forest ML (Paper Section III)
        model = get_model()

        # Fit the model on the data
        model.fit(df)
        predictions = model.predict(df)

        # Decision function: lower values = more anomalous
        # Paper Equation (3): s(x,n) = 2^(-E[h(x)]/c(n))
        scores = model.decision_function(df)

        results = []
        for idx, (pred, ml_score) in enumerate(zip(predictions, scores)):
            # Paper Equation (4): score% = max(0, min(100, floor((0.5 - f(x)) * 100)))
            anomaly_percentage = max(0, min(100, int((0.5 - ml_score) * 100)))

            # Also run rule-based check
            row = df.iloc[idx]
            rule_result = rule_based_analysis(row)

            # Combine: take the higher score between ML and rules
            final_score = max(anomaly_percentage, rule_result["score"])

            # Paper Equation (5): Suspicious if score% > τ (70%) OR ŷ = -1
            status = "Normal"
            if pred == -1 or final_score > 70:
                status = "Suspicious"

            results.append({
                "score": final_score,
                "status": status,
                "ml_score": anomaly_percentage,
                "rule_score": rule_result["score"],
                "reasons": rule_result["reasons"]
            })

        # Save model for future use
        try:
            joblib.dump(model, MODEL_PATH)
        except Exception:
            pass

        return jsonify({"success": True, "results": results})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/verify-face', methods=['POST'])
def verify_face():
    try:
        data = request.get_json()
        if not data or 'capturedImage' not in data or 'registeredImage' not in data:
            return jsonify({"success": False, "error": "Missing image paths"}), 400

        # Note: In a real production setup, these would be absolute paths or URLs
        # Node server sends /uploads/attendance/...
        # We need to reach the Node file system
        
        backend_url = os.environ.get("BACKEND_URL", "http://localhost:5000")
        
        def load_image(img_path):
            if img_path.startswith("http"):
                response = requests.get(img_path)
                return face_recognition.load_image_file(BytesIO(response.content))
            else:
                # Assume it's a relative path from the project root
                # project_root/backend/uploads/...
                full_path = os.path.join("..", "backend", img_path.lstrip("/"))
                return face_recognition.load_image_file(full_path)

        captured_img = load_image(data['capturedImage'])
        registered_img = load_image(data['registeredImage'])

        # Find face encodings
        captured_encodings = face_recognition.face_encodings(captured_img)
        registered_encodings = face_recognition.face_encodings(registered_img)

        if not captured_encodings:
            return jsonify({"success": True, "isVerified": False, "score": 0, "message": "No face found in captured image"})
        if not registered_encodings:
            return jsonify({"success": True, "isVerified": False, "score": 0, "message": "No face found in registered profile photo"})

        # Compare faces
        results = face_recognition.compare_faces([registered_encodings[0]], captured_encodings[0])
        distance = face_recognition.face_distance([registered_encodings[0]], captured_encodings[0])[0]
        
        # distance: lower is better. 0.6 is a common threshold for face_recognition
        is_verified = bool(results[0])
        score = float(max(0, (1 - distance) * 100))

        return jsonify({
            "success": True, 
            "isVerified": is_verified, 
            "score": score,
            "distance": float(distance)
        })

    except Exception as e:
        print(f"Face verification error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(port=5001, debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.cluster import KMeans
import joblib
import os
import time
import requests
from io import BytesIO
import cv2
from PIL import Image
import base64

# Import face_recognition only if available
try:
    import face_recognition
    HAS_FACE_REC = True
except ImportError:
    HAS_FACE_REC = False

app = Flask(__name__)
CORS(app)

# Path to save the model
MODEL_PATH = "isolation_forest_model.joblib"

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "online",
        "message": "AI Behavior Analysis Service is Running",
        "version": "1.1.0",
        "endpoints": ["/analyze", "/compare", "/health"]
    })

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
    Enhanced Rule-based anomaly detection.
    Features: [duration_minutes, arrival_deviation, scan_interval, short_stay_count, inter_arrival_time, frequency_score]
    """
    duration = row.get('duration_minutes', 0)
    arrival_dev = row.get('arrival_deviation', 0)
    short_stay = row.get('short_stay_count', 0)
    inter_arrival = row.get('inter_arrival_time', 0)
    frequency = row.get('frequency_score', 1)

    score = 0
    reasons = []

    # Proxy Detection: Burst Scans (High Frequency + Low Inter-Arrival)
    if frequency > 3 and inter_arrival < 5000: # 3+ unique cards in 60s, <5s gap
        score = max(score, 95)
        reasons.append(f"Proxy Alert: Burst scans detected ({frequency} cards, {inter_arrival/1000:.1f}s gap)")
    elif inter_arrival < 2000: # <2s gap between scans
        score = max(score, 85)
        reasons.append("Extreme proximity scan (<2s gap)")

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
    
    # Rule 5: Very late arrival (> 3 hours from 9 AM)
    if arrival_dev > 180:
        score = max(score, 60)
        reasons.append("Very late arrival (>3hr from 9AM)")

    # Rule 6: Historical short stay pattern
    if short_stay >= 3:
        score = min(100, score + 15)
        reasons.append(f"Repeated short stays ({short_stay} times)")

    # Threshold τ = 70%
    status = "Suspicious" if score > 70 else "Normal"

    return {"score": score, "status": status, "reasons": reasons}


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return jsonify({"success": False, "error": "No features provided"}), 400

        features_list = data['features']
        df = pd.DataFrame(features_list)

        # Ensure all columns exist
        for col in ['duration_minutes', 'arrival_deviation', 'scan_interval', 'short_stay_count', 'inter_arrival_time', 'frequency_score']:
            if col not in df.columns:
                df[col] = 0

        if len(df) < 2:
            results = []
            for _, row in df.iterrows():
                result = rule_based_analysis(row)
                results.append(result)
            return jsonify({"success": True, "results": results})

        model = get_model()
        model.fit(df)
        predictions = model.predict(df)
        scores = model.decision_function(df)

        results = []
        for idx, (pred, ml_score) in enumerate(zip(predictions, scores)):
            anomaly_percentage = max(0, min(100, int((0.5 - ml_score) * 100)))
            row = df.iloc[idx]
            rule_result = rule_based_analysis(row)

            final_score = max(anomaly_percentage, rule_result["score"])
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

        try:
            joblib.dump(model, MODEL_PATH)
        except Exception:
            pass

        return jsonify({"success": True, "results": results})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/compare', methods=['POST'])
def compare():
    """
    Research Paper Endpoint: Compares 5 algorithms.
    """
    try:
        data = request.get_json()
        features_list = data.get('features', [])
        if not features_list:
            return jsonify({"success": False, "error": "No data"}), 400
        
        df = pd.DataFrame(features_list)
        results = {}

        # 1. Isolation Forest
        start = time.time()
        iforest = IsolationForest(contamination=0.1, random_state=42).fit(df)
        results['Isolation Forest'] = {
            "time_ms": (time.time() - start) * 1000,
            "anomalies": int((iforest.predict(df) == -1).sum())
        }

        # 2. Local Outlier Factor
        start = time.time()
        lof = LocalOutlierFactor(n_neighbors=min(20, len(df)-1), contamination=0.1).fit_predict(df)
        results['LOF'] = {
            "time_ms": (time.time() - start) * 1000,
            "anomalies": int((lof == -1).sum())
        }

        # 3. One-Class SVM
        start = time.time()
        ocsvm = OneClassSVM(nu=0.1, kernel="rbf", gamma=0.1).fit(df)
        results['OCSVM'] = {
            "time_ms": (time.time() - start) * 1000,
            "anomalies": int((ocsvm.predict(df) == -1).sum())
        }

        # 4. K-Means (Distance-based anomaly)
        start = time.time()
        kmeans = KMeans(n_clusters=2, random_state=42).fit(df)
        distances = np.min(kmeans.transform(df), axis=1)
        threshold = np.percentile(distances, 90)
        results['K-Means'] = {
            "time_ms": (time.time() - start) * 1000,
            "anomalies": int((distances > threshold).sum())
        }

        # 5. Rule-Based
        start = time.time()
        rule_anomalies = 0
        for _, row in df.iterrows():
            if rule_based_analysis(row)["status"] == "Suspicious":
                rule_anomalies += 1
        results['Rule-Based'] = {
            "time_ms": (time.time() - start) * 1000,
            "anomalies": rule_anomalies
        }

        return jsonify({"success": True, "comparison": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/verify-face', methods=['POST'])
def verify_face():
    if not HAS_FACE_REC:
        return jsonify({"success": False, "error": "Face recognition library not installed"}), 501
        
    try:
        data = request.get_json()
        if not data or 'capturedImage' not in data or 'registeredImage' not in data:
            return jsonify({"success": False, "error": "Missing image paths"}), 400
        
        def load_image(img_path):
            if img_path.startswith("http"):
                response = requests.get(img_path)
                return face_recognition.load_image_file(BytesIO(response.content))
            else:
                # Fallback for local testing
                full_path = os.path.join("..", "backend", img_path.lstrip("/"))
                return face_recognition.load_image_file(full_path)

        captured_img = load_image(data['capturedImage'])
        registered_img = load_image(data['registeredImage'])

        captured_encodings = face_recognition.face_encodings(captured_img)
        registered_encodings = face_recognition.face_encodings(registered_img)

        if not captured_encodings:
            return jsonify({"success": True, "isVerified": False, "score": 0, "message": "No face found in captured image"})
        if not registered_encodings:
            return jsonify({"success": True, "isVerified": False, "score": 0, "message": "No face found in registered profile photo"})

        results = face_recognition.compare_faces([registered_encodings[0]], captured_encodings[0])
        distance = face_recognition.face_distance([registered_encodings[0]], captured_encodings[0])[0]
        
        is_verified = bool(results[0])
        score = float(max(0, (1 - distance) * 100))

        return jsonify({
            "success": True, 
            "isVerified": is_verified, 
            "score": score,
            "distance": float(distance)
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

def get_image_from_data(data):
    if data.startswith('data:image'):
        data = data.split(',')[1]
    img_data = base64.b64decode(data)
    nparr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

@app.route('/visual-search', methods=['POST'])
def visual_search():
    """
    Visual Search Endpoint: Matches a query image against a list of product images.
    Expects: { "query_image": "base64...", "targets": [ {"id": "...", "image_url": "..."}, ... ] }
    """
    try:
        data = request.get_json()
        if not data or 'query_image' not in data or 'targets' not in data:
            return jsonify({"success": False, "error": "Missing query_image or targets"}), 400

        # Load query image
        query_img = get_image_from_data(data['query_image'])
        if query_img is None:
            return jsonify({"success": False, "error": "Invalid query image"}), 400

        # Extract features from query image
        orb = cv2.ORB_create(nfeatures=500)
        kp_query, des_query = orb.detectAndCompute(query_img, None)
        
        if des_query is None:
            return jsonify({"success": True, "matches": [], "message": "No features found in query image"})

        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches_results = []

        for target in data['targets']:
            try:
                # Load target image from URL
                target_url = target['image_url']
                response = requests.get(target_url, timeout=5)
                target_img = cv2.imdecode(np.frombuffer(response.content, np.uint8), cv2.IMREAD_COLOR)
                
                if target_img is None:
                    continue

                kp_target, des_target = orb.detectAndCompute(target_img, None)
                if des_target is None:
                    continue

                # Match descriptors
                matches = bf.match(des_query, des_target)
                # Sort them in the order of their distance
                matches = sorted(matches, key=lambda x: x.distance)
                
                # Use a combined score: count of good matches and average distance
                good_matches = [m for m in matches if m.distance < 50]
                score = len(good_matches)
                
                if score > 5: # Minimum threshold for matches
                    matches_results.append({
                        "id": target['id'],
                        "score": score,
                        "match_count": len(matches)
                    })
            except Exception as e:
                print(f"Error processing target {target.get('id')}: {e}")
                continue

        # Sort results by score descending
        matches_results = sorted(matches_results, key=lambda x: x['score'], reverse=True)

        return jsonify({
            "success": True,
            "matches": matches_results[:10]  # Return top 10 matches
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)

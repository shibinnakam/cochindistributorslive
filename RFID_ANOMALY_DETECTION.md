# AI-Driven Behavioral Anomaly Detection for RFID-Based Attendance Verification

---

## 1. System Objective

The goal of the system is to improve traditional RFID attendance systems by detecting **attendance fraud and abnormal behavior** such as:

* Buddy punching (proxy attendance)
* Burst card scanning
* Extremely short attendance sessions
* Abnormal arrival or exit patterns
* Repeated suspicious attendance behavior

Instead of simply recording attendance, the system analyzes **employee behavioral patterns using Artificial Intelligence and rule-based logic** to identify suspicious activities.

---

## 2. System Architecture

The system consists of **five major components**.

### 1. RFID Data Collection Layer

This layer collects attendance data from RFID hardware.

Components:

* RFID Reader (MFRC522 or similar)
* Microcontroller (ESP8266 / ESP32)
* RFID Cards
* LCD display for feedback

Each scan records:

| Field       | Description                |
| ----------- | -------------------------- |
| employee_id | Unique employee identifier |
| card_uid    | RFID card UID              |
| timestamp   | Scan time                  |
| reader_id   | Location of scanner        |
| event_type  | IN or OUT                  |

Example:

| Employee | Time     | Event |
| -------- | -------- | ----- |
| EMP101   | 08:32:10 | IN    |
| EMP101   | 17:58:20 | OUT   |

The microcontroller sends this data to the backend server.

---

## 3. Backend Attendance Processing System

The backend server manages attendance records.

Recommended stack (based on your project):

* **Node.js** backend
* **MongoDB** database
* REST API communication

### Backend Responsibilities

* Verify RFID UID
* Store attendance logs
* Determine IN / OUT events
* Send data to AI analysis service
* Provide admin dashboard data

---

## 4. AI Behavior Analysis Service

The AI analysis service runs separately using **Python**.

Location in your project:
`python-ai/app.py`

This module analyzes attendance behavior using a **Hybrid Detection Framework**.

The framework combines:
1. Rule-Based Detection
2. Machine Learning Anomaly Detection

---

## 5. Feature Extraction Module

Before AI analysis, the system extracts behavioral features from attendance logs.

Features used in your system:

| Feature           | Description                               |
| ----------------- | ----------------------------------------- |
| frequency_score   | Number of RFID scans in short time window |
| scan_interval     | Time gap between scans                    |
| duration_minutes  | Total time employee stayed                |
| arrival_deviation | Difference from expected arrival time     |
| short_stay_count  | Number of past short attendance events    |

---

## 6. Rule-Based Detection Engine

The rule engine detects **known suspicious patterns** immediately.
It produces a **Suspicion Score from 0 to 100**.

### Rule 1: Burst Card Scanning
**Condition:** `frequency_score > 3 AND scan_interval < 5 seconds`
**Meaning:** One person may be scanning multiple cards.
**Score:** 85–95

### Rule 2: Extreme Scan Proximity
**Condition:** `scan_interval < 2 seconds`
**Meaning:** Cards scanned almost instantly.
**Score:** 70–85

### Rule 3: Extremely Short Stay
**Condition:** `duration_minutes < 5`
**Meaning:** Employee scanned and immediately left.
**Score:** 90

### Rule 4: Suspicious Short Attendance
**Condition:** `duration_minutes < 15`
**Score:** 80

### Rule 5: Very Late Arrival
**Condition:** `arrival_deviation > 180 minutes`
**Meaning:** Employee arrives more than **3 hours late**.
**Score:** 70

### Rule 6: Suspicious Historical Behavior
**Condition:** `short_stay_count >= 3`
**Meaning:** Repeated abnormal attendance.
**Score Increment:** +10

---

## 7. Machine Learning Anomaly Detection

The system uses **Isolation Forest** as the primary ML model.

**Purpose:** Detect behavior that deviates from normal attendance patterns.

Isolation Forest is suitable because:
* No labeled fraud dataset needed
* Effective for anomaly detection
* Works well with small datasets

---

### ML Output
Prediction values:
```
1 → Normal
-1 → Anomaly
```
ML also produces an **anomaly percentage score**.
Example: `ml_score = 82`

---

## 8. Hybrid Decision Engine

The final decision combines both engines.

Current logic in your system:
```python
final_score = max(anomaly_percentage, rule_result["score"])
```

Improved version (Optional):
```python
final_score = (0.6 * rule_score) + (0.4 * ml_score)
```

Final classification:
```python
status = "Normal"
if prediction == -1 or final_score > 70:
    status = "Suspicious"
```

---

## 9. Behavioral Scenarios Handled

### Scenario 1 — Proxy Attendance
Employee gives RFID card to friend.
**Detected by:** rapid scan frequency and scan proximity.

### Scenario 2 — Employees Arriving Together Normally
If time difference varies naturally, system marks as **normal behavior**.

### Scenario 3 — Short Attendance
Marked suspicious only if duration is severely short or if repeated.

### Scenario 4 — Exit Pattern Monitoring
If exits always occur within exactly 1 second repeatedly, system flags anomaly.

---

## 10. Admin Monitoring Dashboard

The system provides an admin dashboard displaying:
* employee attendance records
* suspicious attendance alerts
* anomaly scores
* historical attendance patterns

---

## 11. System Workflow

1. **RFID Card Scan**
2. **Microcontroller sends data**
3. **Backend verifies UID**
4. **Attendance stored in database**
5. **AI Feature Extraction**
6. **Rule-Based Analysis**
7. **Machine Learning Detection**
8. **Hybrid Decision Engine**
9. **Status Generated (Normal / Suspicious)**
10. **Admin Dashboard Alert**

---

## 12. Mathematical Model for Anomaly Scoring

The proposed system utilizes a hybrid mathematical model combining deterministic rule-based evaluation with stochastic anomaly scoring from the Isolation Forest algorithm.

### 12.1 Rule-Based Scoring Function
Let $F = \{f_1, f_2, ..., f_n\}$ be the set of extracted behavioral features for a given attendance session. The rule-based engine applies a set of conditional functions $C = \{c_1, c_2, ..., c_m\}$, where each condition maps to a predefined penalty score $P_i$.

The Rule-Based Suspicion Score ($S_{rule}$) is defined as the maximum penalty triggered by the feature set:
$$S_{rule}(F) = \max_{i=1}^{m} \big( P_i \cdot \mathbb{I}(c_i(F)) \big)$$
Where $\mathbb{I}(c_i(F))$ is an indicator function that returns $1$ if the condition $c_i$ is met (e.g., duration < 5 mins), and $0$ otherwise.

### 12.2 Isolation Forest Anomaly Score
The Isolation Forest isolates observations by randomly selecting a feature and then randomly selecting a split value between the maximum and minimum values of the selected feature. 

Let $h(x)$ be the path length of observation $x$ from the root node to a terminating node in an Isolation Tree. The expected path length $E(h(x))$ across all trees provides a measure of normality.
The anomaly score $S_{ML}(x)$ for an attendance record $x$ given a dataset of size $n$ is calculated as:
$$S_{ML}(x) = 2^{-\frac{E(h(x))}{c(n)}}$$
Where $c(n)$ is the average path length of an unsuccessful search in a Binary Search Tree:
$$c(n) = 2H(n-1) - \frac{2(n-1)}{n}$$
*(where $H(i)$ is the harmonic number).*
* If $S_{ML} \approx 1$, the instance is highly anomalous.
* If $S_{ML} \ll 0.5$, the instance is considered normal.
In the system implementation, this is normalized to a percentage scale ($0$ to $100$).

### 12.3 Hybrid Decision Function
To capitalize on both domain knowledge (rules) and unsupervised learning (ML), the final Hybrid Anomaly Score ($S_{final}$) is derived. In our maximal-risk approach, it takes the upper bound of both models:
$$S_{final}(x) = \max \big( S_{rule}(x), S_{ML}(x) \big)$$

The final binary classification status $y_{pred}$ is decided by a predefined threshold $\tau$ (e.g., $\tau = 70$):
$$y_{pred} = \begin{cases} 
1 \text{ (Suspicious)}, & \text{if } S_{final}(x) > \tau \\
0 \text{ (Normal)}, & \text{if } S_{final}(x) \le \tau 
\end{cases}$$

---

## 13. System Evaluation Metrics

To scientifically validate the effectiveness of the proposed behavioral detection framework, standard classification metrics must be evaluated against a labeled benchmark dataset.

The outcomes of predictions are categorized into a Confusion Matrix:
* **True Positives (TP):** Fraudulent attendance correctly flagged as suspicious.
* **True Negatives (TN):** Normal attendance correctly identified as normal.
* **False Positives (FP) [Type I Error]:** Normal attendance incorrectly flagged as suspicious (False Alarm).
* **False Negatives (FN) [Type II Error]:** Fraudulent attendance missed by the system.

### 13.1 Precision (Positive Predictive Value)
Precision measures the system's exactness. It answers: *Out of all attendance records flagged as suspicious, how many were actually fraudulent?*
$$\text{Precision} = \frac{TP}{TP + FP}$$

### 13.2 Recall (Sensitivity / True Positive Rate)
Recall measures the system's completeness. It answers: *Out of all actual fraudulent scenarios, how many did the system successfully catch?*
$$\text{Recall} = \frac{TP}{TP + FN}$$

### 13.3 F1-Score
The F1-Score is the harmonic mean of Precision and Recall. It provides a single metric that balances both concerns.
$$\text{F1-Score} = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

### 13.4 Overall Accuracy
Accuracy represents the total proportion of correct predictions across both normal and suspicious records.
$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

---

## 14. Conclusion

Traditional RFID attendance systems only verify RFID cards and cannot trace behaviors inherently mapping to fraudulent attendance practices such as proxy scanning or buddy punching. The proposed system improves attendance security by integrating **AI-based behavioral anomaly detection with rule-based logic**.

By analyzing attendance patterns such as scan timing, work duration, and employee correlation, the system can detect suspicious activities while minimizing false alarms. This hybrid approach enhances the reliability, transparency, and effectiveness of attendance management systems.

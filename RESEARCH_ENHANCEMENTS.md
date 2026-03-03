# Research Project: AI-Driven Anomaly Detection for RFID Attendance
**Scholar:** Shibin Saji  
**Topic:** Behavioral Anomaly Detection for Proxy Attendance Prevention

## 1. Mathematical Formulation (Enhanced)
The behavioral feature vector $\mathbf{x}$ for each attendance record is defined as:
$$\mathbf{x} = [d, a, i, s, t, f]$$
Where:
*   $d$: **Duration** (minutes) - Eq(6)
*   $a$: **Arrival Deviation** (minutes from 9:00 AM) - Eq(7)
*   $i$: **Scan Interval** (average days between scans) - Eq(8)
*   $s$: **Short Stay Count** (historical frequency of $d < 15$) - Eq(9)
*   $t$: **Inter-Arrival Time** (ms between consecutive scans at same reader) - **[NOVELTY]**
*   $f$: **Frequency Score** (unique UIDs scanned in 60s window) - **[NOVELTY]**

## 2. Proxy Detection Logic (Novelty)
To combat "Buddy Punching," we implemented a Burst-Scan detection algorithm:
1.  **Temporal Proximity**: If $t < 2000ms$, high probability of a single person scanning multiple cards.
2.  **Density Analysis**: If $f > 3$ within $60s$, flagged as bulk proxy attendance.

## 3. Algorithm Comparison (Benchmarking)
The system benchmarks the primary **Isolation Forest** against four other methodologies:

| Algorithm | Complexity | Best For | Implementation |
| :--- | :--- | :--- | :--- |
| **Isolation Forest** | $O(n)$ | High-dim outliers | `sklearn.ensemble.IForest` |
| **Local Outlier Factor** | $O(n^2)$ | Local density | `sklearn.neighbors.LOF` |
| **One-Class SVM** | $O(n^3)$ | Complex boundaries | `sklearn.svm.OCSVM` |
| **K-Means Cluster** | $O(nk)$ | Global outliers | `sklearn.cluster.KMeans` |
| **Rule-Based System** | $O(1)$ | Known patterns | Custom Heuristics |

## 4. Real-time Implementation
Integrated into the `Admin Attendance Dashboard` with real-time Socket.io alerts for "Suspicious" status, enabling immediate supervisor intervention.

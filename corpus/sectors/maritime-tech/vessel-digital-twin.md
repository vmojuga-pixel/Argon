# Offshore Vessel Predictive Maintenance (Digital Twin)
## Problem
Kapal offshore (OSV/AHTS) downtime USD 50k-100k/hari. Rule-based monitoring gagal detect anomali enjin sebelum rosak.
## Solution
Isolation Forest anomaly detection pada telemetri IoT (RPM, exhaust temp, vibration, oil pressure). Auto-generate maintenance alert + component prediction.
## Real Source
- Isolation Forest (scikit-learn)
- DNV digital twin guidelines
- Rolls-Royce Marine predictive maintenance
## Metrics
Anomaly recall 94%, false alarm 5%, latency <50ms

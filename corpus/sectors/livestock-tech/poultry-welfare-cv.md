# Poultry Welfare Computer Vision
## Problem
Mortality & disease outbreak tak dikesan awal. Manual inspection 10k ekor ayam mustahil.
## Solution
CV motion detection (frame differencing) + blob counting untuk Flock Activity Index. Auto-alert bila aktiviti jatuh (lethargy indicator).
## Real Source
- YOLOv8-Pose (Ultralytics) untuk posture
- OpenCV motion detection
- Cargill poultry welfare standards
## Metrics
Activity detection 92%, population estimate ±8%, alert <5s

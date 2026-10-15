# AgriTech Device Shadow
## Problem
IoT flaky, command hilang, delta tak sync.
## Solution
Redis Hash desired/reported + pub/sub delta.
## Real Source
AWS IoT Shadow, Redis pipeline.
## Metrics
50ms sync, 0% loss

# Maritime MQTT Ingestion
## Problem
Satellite mahal, offline kerap, 10k msg/s spike.
## Solution
aiomqtt → bounded Queue → worker pool → TimescaleDB.
## Real Source
AWS IoT Core, TimescaleDB hypertable.
## Metrics
12k msg/s, drop <0.01%

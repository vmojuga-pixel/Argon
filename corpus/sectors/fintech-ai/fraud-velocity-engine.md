# Fraud Velocity Engine
## Problem
Card testing + BIN attack bypass static rules.
## Solution
Redis sliding window INCR+EXPIRE + XGBoost scorer.
## Real Source
Flink CEP, Stripe Radar, Redis pattern.
## Metrics
DR 99.2%, FP 0.3%, 12ms p99

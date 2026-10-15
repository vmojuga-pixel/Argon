# Production Infra — Part 2: Docker + Kubernetes

## Dockerfile (Multi-Stage Build)
Stage 1 (builder): python:3.11-slim
  - apt-get gcc + libpq-dev
  - pip install --no-cache-dir -r requirements.txt
Stage 2 (production): python:3.11-slim
  - useradd -m -u 1000 appuser
  - COPY --from=builder site-packages + bin
  - USER appuser (WAJIB non-root)
  - CMD uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4 --log-level warning

## Principles
- Multi-stage => smaller image, no build tools in prod
- Non-root user => container escape tidak dapat root host access
- --workers 4 => 4 uvicorn processes, utilize multi-core CPU
- --log-level warning => lower log noise in production

## K8s Deployment YAML
spec:
  replicas: 3                        # HA
  selector.matchLabels: { app: ai-engine }
  template:
    containers:
    - name: ai-engine
      image: registry.yourdomain.com/unicorn/ai-engine:latest
      ports: [{ containerPort: 8000 }]
      resources:
        requests: { memory: 512Mi, cpu: 250m }
        limits:   { memory: 2Gi,   cpu: 1000m }
      livenessProbe:  httpGet /health :8000 delay 15s period 20s
      readinessProbe: httpGet /health :8000 delay 5s  period 10s
      envFrom: [{ secretRef: { name: unicorn-env-secrets } }]
---
Service: ClusterIP, port 80 -> 8000

## Why
- Resource limits => 1 pod tak boleh hog whole node
- Liveness => auto-restart kalau crash
- Readiness => no traffic until ready
- ClusterIP => internal only, external via Ingress

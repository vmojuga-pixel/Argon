# Epoch 63 | production-infra


---
## EPOCH #63 // 2026-10-16T05:01:06.946Z
### Topik
Low-Latency Intelligent Virtual Assistant (IVA) API Gateway connecting CRM, Order Management & Ticketing
### Kod v1
```javascript
```
# Dockerfile
FROM node:14 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:14
WORKDIR /app
COPY --from=builder /app/build/ .
EXPOSE 3000
CMD ["node", "index.js"]

# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 15
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

# hpa.yaml
apiVersion: autoscaling/v2beta2
kind: Horizontal
```
### Kritikan + Sandbox v1
1. Tidak ada resource limit pada deployment.
2. Versi Node.js sudah usang.
3. Tidak ada error handling pada probe.
Sandbox: Lulus static analysis (tiada pattern berbahaya)
### Kod v2
```javascript
```
# Dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20
WORKDIR /app
COPY --from=builder /app/build/ .
EXPOSE 3000
CMD ["node", "index.js"]

# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 15
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path
```
Sandbox v2: Lulus static analysis (tiada pattern berbahaya)
### Breakthrough
1. Dockerfile menggunakan multi-stage build untuk memisahkan proses build dan runtime. 
2. Deployment.yaml mengatur aplikasi dengan 3 replicas, resource limit, dan liveness/readiness probe. 
3. Perlu tambahkan path dan port pada readinessProbe di deployment.yaml. 
4. Image name pada deployment.yaml harus sesuai dengan nama image yang dihasilkan oleh Dockerfile.

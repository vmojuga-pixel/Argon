# Epoch 65 | production-infra


---
## EPOCH #65 // 2026-10-16T05:31:01.072Z
### Topik
Automated Multi-Source Data Cleaning, Normalization, Model Validation & Zero-Downtime Production Deployment
### Kod v1
```javascript
```
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Data cleaning & normalization
df = pd.read_csv('data.csv')
df = df.dropna() 
scaler = StandardScaler()
df[['feature1', 'feature2']] = scaler.fit_transform(df[['feature1', 'feature2']])

# Model deployment with canary releases
from sklearn.externals import joblib
joblib.dump(model, 'model.joblib')

# Real-time validation & feedback
import numpy as np
new_data = np.array([[1, 2]])
new_data = scaler.transform(new_data)
prediction = model.predict(new_data)
print(accuracy_score([0], prediction))
```
```
### Kritikan + Sandbox v1
1. Tidak ada penanganan error saat membaca file 'data.csv'.
2. Model RandomForestClassifier tidak didefinisikan sebelum digunakan.
3. Variabel 'model' tidak terdefinisi saat digunakan dalam joblib.dump.
Sandbox: Lulus static analysis (tiada pattern berbahaya)
### Kod v2
```javascript
```
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.externals import joblib
import numpy as np

try:
    df = pd.read_csv('data.csv')
except FileNotFoundError:
    print("File not found")

df = df.dropna() 
scaler = StandardScaler()
df[['feature1', 'feature2']] = scaler.fit_transform(df[['feature1', 'feature2']])

X = df.drop('target', axis=1)
y = df['target']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier()
model.fit(X_train, y_train)

joblib.dump(model, 'model.joblib')

new_data = np.array([[1, 2]])
new_data = scaler.transform(new_data)
prediction = model.predict(new_data)
print(accuracy_score([0], prediction))
```
```
Sandbox v2: Lulus static analysis (tiada pattern berbahaya)
### Breakthrough
1. Import necessary libraries 
2. Read data 
3. Preprocess data 
4. Split data 
5. Train model 
6. Save model 
7. Make prediction 
8. Evaluate model

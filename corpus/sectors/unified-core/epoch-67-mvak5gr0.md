# Epoch 67 | unified-core


---
## EPOCH #67 // 2026-10-16T05:59:31.596Z
### Topik
test-quality-gate
### Kod v1
```javascript
```python
def quality_control(produk):
    if produk["kualiti"] >= 90:
        return True
    else:
        return False

def testing_process(pengujian):
    if pengujian["status"] == "lulus":
        return True
    else:
        return False

def customer_satisfaction(pelanggan):
    if pelanggan["kepuasan"] >= 80:
        return True
    else:
        return False
```
```
### Kritikan + Sandbox v1
1. Fungsi tidak fleksibel untuk ambil keputusan berdasarkan nilai ambang berbeza.
2. Kod berulang untuk if-else yang boleh dipermudah.
3. Tiada pengecualian untuk data tidak lengkap atau ralat input.
Sandbox: Lulus static analysis (tiada pattern berbahaya)
### Kod v2
```javascript
```python
def check_threshold(data, field, threshold):
    return data.get(field, 0) >= threshold

def quality_control(produk):
    try:
        return check_threshold(produk, "kualiti", 90)
    except Exception as e:
        print(f"Error: {e}")
        return False

def testing_process(pengujian):
    try:
        return pengujian.get("status") == "lulus"
    except Exception as e:
        print(f"Error: {e}")
        return False

def customer_satisfaction(pelanggan):
    try:
        return check_threshold(pelanggan, "kepuasan", 80)
    except Exception as e:
        print(f"Error: {e}")
        return False
```
```
Sandbox v2: Lulus static analysis (tiada pattern berbahaya)
### Breakthrough
1. Fungsi `check_threshold` dapat digunakan kembali. 
2. Pengendalian kesalahan pada fungsi `quality_control`, `testing_process`, dan `customer_satisfaction` serupa. 
3. Kod boleh dioptimumkan dengan pengabstrakan pengendalian kesalahan. 
4. Fungsi-fungsi tersebut boleh dibuat lebih fleksibel untuk pelbagai jenis data masukan.

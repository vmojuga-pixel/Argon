
---
## OVERLORD EPOCH #7 // 2026-10-14T23:00:23.946Z
- Topic: Argon SaaS multi-tenant rate limiting
- Services: 1

```javascript
Untuk implementasi rate limiting pada Argon SaaS multi-tenant, beberapa pendekatan bisa digunakan. Berikut adalah beberapa strategi yang umum digunakan:

1. **Token Bucket Algorithm**: Setiap tenant memiliki bucket token yang diisi dengan token-token yang mewakili request yang dapat dilakukan dalam suatu periode waktu. Setiap kali request diterima, satu token diambil dari bucket. Jika bucket kosong, request ditolak sampai token baru tersedia.

2. **Leaky Bucket Algorithm**: Mirip dengan token bucket, tapi bucket diisi terus dengan token baru dengan laju tertentu, dan request yang masuk mengurangi jumlah token. Jika bucket kosong, request harus menunggu sampai token tersedia.

3. **Fixed Window Algorithm**: Dalam suatu periode waktu (window), setiap tenant hanya dapat melakukan sejumlah request tertentu. Jika jumlah request melebihi batas, request tambahan ditolak sampai periode waktu berikutnya.

4. **Sliding Window Algorithm**: Pengembangan dari fixed window, dimana window waktu terus bergeser berdasarkan request terakhir. Ini memberikan batasan yang lebih halus dan adil.

### Contoh Implementasi dengan Token Bucket Algorithm

Berikut adalah contoh sederhana implementasi token bucket algorithm dalam Python:

```python
import time
from threading import Lock

class TokenBucket:
    def __init__(self, rate, capacity):
        self.rate = rate  # token per detik
        self.capacity = capacity  # jumlah token maksimum
        self.last_update = time.time()
        self.tokens = capacity
        self.lock = Lock()

    def consume(self, amount=1):
        with self.lock:
            now = time.time()
            elapsed_time = now - self.last_update
            self.tokens = min(self.capacity, self.tokens + elapsed_time * self.rate)
            self.last_update = now

            if self.tokens >= amount:
                self.tokens -= amount
                return True
            else:
                return False

# Contoh penggunaan
bucket = TokenBucket(rate=5, capacity=10)  # 5 request per detik, max 10 request

def handle_request(tenant_id):
    if bucket.consume():
        print(f"Request from tenant {tenant_id} accepted")
    else:
        print(f"Request from tenant {tenant_id} rejected due to rate limiting")

# Simulasi request
for _ in range(15):
    handle_request("tenant1")
    time.sleep(0.1)  # Simulasi request datang setiap 0.1 detik
```

### Multi-Tenant

Untuk mendukung multi-tenant, Anda bisa memiliki satu bucket per tenant, atau mengelompokkan tenant ke dalam kategori dan memberikan bucket untuk setiap kategori. Pemilihan strategi tergantung pada kebutuhan dan kebijakan rate limiting yang diinginkan.

```python
class MultiTenantRateLimiter:
    def __init__(self):
        self.buckets = {}

    def add_tenant(self, tenant_id, rate, capacity):
        self.buckets[tenant_id] = TokenBucket(rate, capacity)

    def handle_request(self, tenant_id):
        if tenant_id in self.buckets:
            bucket = self.buckets[tenant_id]
   
```

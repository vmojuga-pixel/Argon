
---
## OVERLORD EPOCH #6 // 2026-10-14T22:45:23.946Z
- Topic: Stripe webhook signature verification
- Services: 1

```javascript
**Stripe Webhook Signature Verification**
=====================================

Stripe provides a secure way to verify webhook requests using a signature verification mechanism. This ensures that the requests are genuine and not tampered with during transmission.

**Verification Steps**
--------------------

1. **Retrieve the Stripe-Signature header**: Get the `Stripe-Signature` header from the webhook request.
2. **Compute the expected signature**: Compute the expected signature using the Stripe secret key and the request payload.
3. **Compare the signatures**: Compare the expected signature with the provided `Stripe-Signature` header.

**Code (Node.js)**
```javascript
const crypto = require('crypto');

function verifyStripeWebhook(request, stripeSecretKey) {
  const stripeSignature = request.headers['stripe-signature'];
  const payload = JSON.stringify(request.body);

  const computedSignature = crypto.createHmac('sha256', stripeSecretKey)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(stripeSignature), Buffer.from(computedSignature));
}

// Example usage:
const express = require('express');
const app = express();

app.post('/stripe-webhook', (req, res) => {
  const stripeSecretKey = 'your_stripe_secret_key';
  if (verifyStripeWebhook(req, stripeSecretKey)) {
    // Process the webhook request
    console.log(req.body);
    res.status(200).send('Webhook verified');
  } else {
    res.status(401).send('Invalid signature');
  }
});
```
**Code (Python)**
```python
import hmac
import hashlib

def verify_stripe_webhook(request, stripe_secret_key):
    stripe_signature = request.headers.get('Stripe-Signature')
    payload = json.dumps(request.json, separators=(',', ':'))

    computed_signature = hmac.new(stripe_secret_key.encode(), payload.encode(), hashlib.sha256).hexdigest()

    return hmac.compare_digest(stripe_signature, computed_signature)

# Example usage:
from flask import Flask, request

app = Flask(__name__)

@app.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    stripe_secret_key = 'your_stripe_secret_key'
    if verify_stripe_webhook(request, stripe_secret_key):
        # Process the webhook request
        print(request.json)
        return 'Webhook verified', 200
    else:
        return 'Invalid signature', 401
```
```

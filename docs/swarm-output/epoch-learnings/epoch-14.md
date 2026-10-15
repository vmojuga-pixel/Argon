
---
## OVERLORD EPOCH #14 // 2026-10-15T00:45:23.948Z
- Topic: Stripe webhook signature verification
- Services: 1

```javascript
**Stripe Webhook Signature Verification**

To verify the signature of a Stripe webhook, you need to follow these steps:

### Step 1: Retrieve the Stripe-Signature Header

Get the `Stripe-Signature` header from the webhook request.

### Step 2: Compute the Expected Signature

Compute the expected signature using the Stripe secret key and the request payload.

### Step 3: Compare the Signatures

Compare the expected signature with the provided `Stripe-Signature` header.

### Example Code (Node.js)

```javascript
const crypto = require('crypto');

function verifyStripeWebhook(request, stripeSecretKey) {
  const stripeSignature = request.headers['stripe-signature'];
  const payload = JSON.stringify(request.body);

  const computedSignature = crypto
    .createHmac('sha256', stripeSecretKey)
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
    // Webhook is valid, process the event
    console.log(req.body);
    res.status(200).send({ received: true });
  } else {
    res.status(400).send({ error: 'Invalid signature' });
  }
});
```

### Example Code (Python)

```python
import hmac
import hashlib

def verify_stripe_webhook(request, stripe_secret_key):
    stripe_signature = request.headers.get('Stripe-Signature')
    payload = request.get_data(as_text=True)

    computed_signature = hmac.new(
        stripe_secret_key.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(stripe_signature, computed_signature)

# Example usage:
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    stripe_secret_key = 'your_stripe_secret_key'
    if verify_stripe_webhook(request, stripe_secret_key):
        # Webhook is valid, process the event
        print(request.get_json())
        return jsonify({ 'received': True }), 200
    else:
        return jsonify({ 'error': 'Invalid signature' }), 400
```
```

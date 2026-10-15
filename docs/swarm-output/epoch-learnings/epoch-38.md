
---
## OVERLORD EPOCH #38 // 2026-10-15T06:45:13.795Z
- Topic: Stripe webhook signature verification
- Services: 1

```javascript
**Stripe Webhook Signature Verification**

To verify the signature of a Stripe webhook, you need to:

### Step 1: Retrieve the Stripe-Signature Header

Get the `Stripe-Signature` header from the webhook request.

### Step 2: Compute the Expected Signature

Compute the expected signature using the Stripe secret key and the request payload.

### Step 3: Compare the Signatures

Compare the expected signature with the provided `Stripe-Signature` header.

### Code (Node.js)

```javascript
const crypto = require('crypto');

function verifyStripeWebhookSignature(stripeSecretKey, payload, stripeSignature) {
  const computedSignature = crypto.createHmac('sha256', stripeSecretKey)
    .update(payload, 'utf8', 'hex')
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(stripeSignature));
}

// Example usage:
const stripeSecretKey = 'whsec_1234567890';
const payload = JSON.stringify({ /* webhook payload */ });
const stripeSignature = 'sha256=...'; // from the Stripe-Signature header

const isValid = verifyStripeWebhookSignature(stripeSecretKey, payload, stripeSignature);

if (isValid) {
  console.log('Webhook signature is valid');
} else {
  console.log('Webhook signature is invalid');
}
```

### Code (Python)

```python
import hmac
import hashlib

def verify_stripe_webhook_signature(stripe_secret_key, payload, stripe_signature):
  computed_signature = hmac.new(stripe_secret_key.encode(), payload.encode(), hashlib.sha256).hexdigest()
  return hmac.compare_digest(computed_signature, stripe_signature.split('=')[1])

# Example usage:
stripe_secret_key = 'whsec_1234567890'
payload = '{"id": "..."}'  # webhook payload
stripe_signature = 'sha256=...'  # from the Stripe-Signature header

is_valid = verify_stripe_webhook_signature(stripe_secret_key, payload, stripe_signature)

if is_valid:
  print('Webhook signature is valid')
else:
  print('Webhook signature is invalid')
```
```

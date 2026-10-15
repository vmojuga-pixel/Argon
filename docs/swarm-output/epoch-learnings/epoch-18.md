
---
## OVERLORD EPOCH #18 // 2026-10-15T01:45:23.953Z
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

function verifyStripeWebhookSignature(stripeSecretKey, payload, stripeSignature) {
  const computedSignature = crypto.createHmac('sha256', stripeSecretKey)
    .update(payload, 'utf8', 'hex')
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(stripeSignature));
}

// Example usage:
const stripeSecretKey = 'whsec_...';
const payload = JSON.stringify({ /* webhook payload */ });
const stripeSignature = '...';

const isValid = verifyStripeWebhookSignature(stripeSecretKey, payload, stripeSignature);

if (isValid) {
  console.log('Webhook signature is valid');
} else {
  console.log('Webhook signature is invalid');
}
```

### Example Code (Python)

```python
import hmac
import hashlib

def verify_stripe_webhook_signature(stripe_secret_key, payload, stripe_signature):
  computed_signature = hmac.new(stripe_secret_key.encode(), payload.encode(), hashlib.sha256).hexdigest()
  return hmac.compare_digest(computed_signature, stripe_signature)

# Example usage:
stripe_secret_key = 'whsec_...'
payload = '{"id": "..."}'
stripe_signature = '...'

is_valid = verify_stripe_webhook_signature(stripe_secret_key, payload, stripe_signature)

if is_valid:
  print('Webhook signature is valid')
else:
  print('Webhook signature is invalid')
```
```

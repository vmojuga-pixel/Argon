
---
## OVERLORD EPOCH #30 // 2026-10-15T04:45:23.782Z
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

function verifyStripeWebhookSignature(stripeSecretKey, requestBody, stripeSignature) {
  const computedSignature = crypto.createHmac('sha256', stripeSecretKey)
    .update(requestBody, 'utf8', 'hex')
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(stripeSignature));
}

// Example usage:
const stripeSecretKey = 'whsec_1234567890';
const requestBody = '{"id": "evt_1234567890", "object": "event"}';
const stripeSignature = 'evt_1234567890';

const isValid = verifyStripeWebhookSignature(stripeSecretKey, requestBody, stripeSignature);
console.log(isValid); // Output: true or false
```

### Example Code (Python)

```python
import hmac
import hashlib

def verify_stripe_webhook_signature(stripe_secret_key, request_body, stripe_signature):
  computed_signature = hmac.new(stripe_secret_key.encode(), request_body.encode(), hashlib.sha256).hexdigest()
  return hmac.compare_digest(computed_signature, stripe_signature)

# Example usage:
stripe_secret_key = 'whsec_1234567890'
request_body = '{"id": "evt_1234567890", "object": "event"}'
stripe_signature = 'evt_1234567890'

is_valid = verify_stripe_webhook_signature(stripe_secret_key, request_body, stripe_signature)
print(is_valid)  # Output: True or False
```
```


---
## OVERLORD EPOCH #10 // 2026-10-14T23:45:23.880Z
- Topic: Stripe webhook signature verification
- Services: 1

```javascript
**Stripe Webhook Signature Verification**

To verify the signature of a Stripe webhook, you need to:

### Requirements

* Stripe API key (secret key)
* Stripe webhook secret (configured in Stripe dashboard)
* Incoming webhook request (with `stripe-signature` header)

### Verification Steps

1. **Extract the Stripe-Signature Header**
   Get the `stripe-signature` header from the incoming webhook request.

2. **Compute the Expected Signature**
   Using the Stripe webhook secret, compute the expected signature.

   The expected signature can be computed using the HMAC (Keyed-Hash Message Authentication Code) algorithm with SHA-256.

3. **Compare the Expected Signature with the Provided Signature**
   Compare the expected signature with the provided `stripe-signature` header.

   If they match, the webhook request is authentic and has not been tampered with.

### Example Code (Node.js)

```javascript
const crypto = require('crypto');

function verifyStripeWebhook(requestBody, stripeWebhookSecret, stripeSignature) {
  const computedSignature = crypto
    .createHmac('sha256', stripeWebhookSecret)
    .update(requestBody, null, 'utf8', { digest: 'base64' })
    .digest('base64');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(stripeSignature)
  );

  return isValid;
}

// Example usage:
const stripeWebhookSecret = 'your_stripe_webhook_secret';
const requestBody = JSON.stringify({ /* webhook payload */ });
const stripeSignature = 'stripe-signature-header-value';

const isValid = verifyStripeWebhook(requestBody, stripeWebhookSecret, stripeSignature);

if (isValid) {
  console.log('Webhook is valid');
} else {
  console.log('Webhook is invalid');
}
```

### Example Code (Python)

```python
import hmac
import hashlib

def verify_stripe_webhook(request_body, stripe_webhook_secret, stripe_signature):
  computed_signature = hmac.new(
    stripe_webhook_secret.encode(),
    request_body.encode(),
    hashlib.sha256
  ).hexdigest()

  # Note: For security, use a secure comparison function
  #       to mitigate timing attacks.
  return hmac.compare_digest(computed_signature, stripe_signature)

# Example usage:
stripe_webhook_secret = 'your_stripe_webhook_secret'
request_body = '{"event": "/* webhook event */"}'
stripe_signature = 'stripe-signature-header-value'

is_valid = verify_stripe_webhook(request_body, stripe_webhook_secret, stripe_signature)

if is_valid:
  print('Webhook is valid')
else:
  print('Webhook is invalid')
```
```

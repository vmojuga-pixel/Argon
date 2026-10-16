
---
## OVERLORD EPOCH #52 // 2026-10-16T04:00:37.146Z
- Topic: Stripe Webhook Signature Verification as Source of Truth
- Services: 1

```javascript
**Stripe Webhook Signature Verification**
=====================================

Stripe provides a secure way to verify webhook requests using a signature verification mechanism. This ensures that the requests are genuine and not tampered with during transmission.

**Why Verify Webhook Signatures?**
--------------------------------

Verifying webhook signatures is crucial to prevent:

*   **Replay attacks**: Intercepting and retransmitting valid webhook requests.
*   **Tampering**: Modifying webhook request data during transmission.

**Verification Process**
----------------------

Here's a step-by-step guide to verifying Stripe webhook signatures:

### 1. Retrieve the Stripe-Signature Header

Extract the `Stripe-Signature` header from the webhook request.

### 2. Get the Webhook Secret

Retrieve the webhook secret from the Stripe dashboard or using the Stripe API.

### 3. Compute the Expected Signature

Using the webhook secret and the request payload, compute the expected signature using the HMAC (Keyed-Hashing for Message Authentication) algorithm with SHA-256.

### 4. Compare the Expected Signature with the Provided Signature

Compare the expected signature with the provided signature in the `Stripe-Signature` header.

### 5. Verify the Signature

If the signatures match, verify that the request payload has not been tampered with.

**Example Code (Node.js)**
-------------------------

```javascript
const crypto = require('crypto');

function verifyStripeWebhook(request, webhookSecret) {
    const stripeSignature = request.headers['stripe-signature'];
    const payload = JSON.stringify(request.body);

    const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(stripeSignature),
        Buffer.from(computedSignature)
    );
}

// Example usage:
const request = {
    headers: {
        'stripe-signature': 'computed_signature_value',
    },
    body: {
        // webhook payload
    },
};

const webhookSecret = 'whsec_1234567890';

const isValid = verifyStripeWebhook(request, webhookSecret);

if (isValid) {
    console.log('Webhook signature is valid');
} else {
    console.log('Webhook signature is invalid');
}
```

**Example Code (Python)**
-------------------------

```python
import hmac
import hashlib

def verify_stripe_webhook(request, webhook_secret):
    stripe_signature = request.headers.get('stripe-signature')
    payload = json.dumps(request.body, separators=(',', ':'))

    computed_signature = hmac.new(
        webhook_secret.encode(),
        payload.encode(),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(stripe_signature, computed_signature)

# Example usage:
request = {
    'headers': {
        'stripe-signature': 'computed_signature_value',
    },
    'body': {
        # webhook payload
    },
}

webhook_secret = 'whsec_1234567890'

is_valid = verify_stripe_webhook(request, webh
```

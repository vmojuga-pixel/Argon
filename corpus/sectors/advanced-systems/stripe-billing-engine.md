# Stripe Billing Engine
## Problem
Double charge bila timeout, state drift.
## Solution
Idempotency key + PaymentIntent + webhook reconcile.
## Real Source
Stripe idempotency, webhook sig.
## Metrics
0 double charge

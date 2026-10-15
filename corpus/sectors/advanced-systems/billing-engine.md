# Advanced Systems — Part 3: Unified Billing & Subscription

## 3-Layer Billing Architecture
1. Subscription manager (onboard + usage record)
2. Webhook handler (source of truth)
3. Daily aggregator (cron)

## 1. Subscription Manager
Onboard tenant:
  - stripe.Customer.create(name, email, metadata={tenant_id})
  - stripe.Subscription.create(items=[{price}], payment_behavior="default_incomplete")
  - Return client_secret for frontend confirm
Report usage:
  - stripe.SubscriptionItem.create_usage_record(subscription_item_id, quantity, action, idempotency_key)
  - **IDEMPOTENCY KEY WAJIB** => prevent double-charge on retry

## 2. Webhook Handler (The Source of Truth)
NEVER trust frontend. Only Stripe webhook.
Verify: stripe.Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
Events:
  - invoice.paid => tenant status ACTIVE, log invoice
  - invoice.payment_failed => status PAST_DUE, trigger email
  - customer.subscription.deleted => status CANCELED
  - checkout.session.completed => add top-up credits
Signature fail => HTTP 401, don't process.

## 3. Daily Usage Aggregator (Cron Job)
Pattern: aggregate 24h => single API call to Stripe.
  - Query DB for active IoT devices per tenant
  - Idempotency key: f"usage_iot_{tenant_id}_{date_str}"
  - action="set" (daily snapshot) vs "increment"
  - Schedule: Celery Beat / APScheduler / K8s CronJob

## Why Unicorn-Grade
- Idempotency => no double-charge on network retry
- Signature verify => no fake "Enterprise" activation
- Daily aggregation => 1M IoT events become 1 API call
- Metadata linking => webhook knows tenant_id directly

## Price IDs Pattern
prices = {"startup": "price_xxx", "enterprise": "price_yyy", "unicorn": "price_zzz"}
metered_price_id = "price_iot_device_metered"

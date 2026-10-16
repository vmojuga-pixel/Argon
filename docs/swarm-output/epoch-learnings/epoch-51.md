
---
## OVERLORD EPOCH #51 // 2026-10-16T00:00:56.884Z
- Topic: Stripe Metered Billing with Idempotency Key to Prevent Double-Charge
- Services: 1

```javascript
To implement Stripe Metered Billing with an idempotency key to prevent double-charging, you'll need to follow these steps:

**Step 1: Create a Customer and Subscription in Stripe**

Create a customer and subscription in Stripe using the Stripe API. Make sure to include the `idempotency_key` parameter to prevent duplicate charges.

```python
import stripe

stripe.api_key = 'YOUR_STRIPE_SECRET_KEY'

customer = stripe.Customer.create(
    email='customer@example.com',
    idempotency_key='cus_12345'
)

subscription = stripe.Subscription.create(
    customer=customer.id,
    items=[
        {
            'price': 'price_12345',
            'quantity': 1,
        }
    ],
    idempotency_key='sub_12345',
    metered_billing=True
)
```

**Step 2: Track Usage and Create Invoices**

Track usage for the customer and create invoices using the Stripe API. Use the `idempotency_key` parameter to prevent duplicate invoices.

```python
usage = stripe.UsageRecord.create(
    subscription_item=subscription.items[0].id,
    quantity=10,
    idempotency_key='usage_12345'
)

invoice = stripe.Invoice.create(
    customer=customer.id,
    idempotency_key='inv_12345',
    auto_advance=True
)
```

**Step 3: Handle Webhooks and Update Customer**

Handle webhooks from Stripe to update the customer's subscription and invoice status. Use the `idempotency_key` parameter to prevent duplicate updates.

```python
def handle_webhook(request):
    event = stripe.Webhook.construct_event(
        request['body'],
        request['sig_header'],
        'YOUR_STRIPE_WEBHOOK_SECRET'
    )

    if event.type == 'invoice.paid':
        # Update customer subscription and invoice status
        customer = stripe.Customer.retrieve(event.data.object.customer)
        subscription = stripe.Subscription.retrieve(customer.default_source)
        # Update subscription and invoice status
        pass
```

**Idempotency Key Best Practices**

1. **Use a unique idempotency key**: Use a unique idempotency key for each request to prevent duplicate charges.
2. **Store idempotency keys**: Store idempotency keys in your database to keep track of requests.
3. **Retry failed requests**: Retry failed requests with the same idempotency key to ensure idempotence.

**Example Code**

Here's an example code snippet that demonstrates Stripe Metered Billing with idempotency keys:
```python
import stripe

stripe.api_key = 'YOUR_STRIPE_SECRET_KEY'

def create_customer(email):
    idempotency_key = 'cus_' + email
    customer = stripe.Customer.create(
        email=email,
        idempotency_key=idempotency_key
    )
    return customer

def create_subscription(customer_id):
    idempotency_key = 'sub_' + customer_id
    subscription = stripe.Subscription.create(
        customer=customer_id,
        items=[
            {
                'price': 'price_12345',
                'quantity': 1,
            }
        ],
        idempotency_key=idempotency_key,
        metered_billing=True
    )
    return subscription


```

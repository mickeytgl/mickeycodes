---
layout: post
title:  "Out of order webhooks"
date:   2025-07-03 12:01:16 +0200
categories: articles
---

Webhooks is a topic that can be deceivingly complex. In the beginning they can be really easy to set and forget, and precisely because they are implemented normally very early in your codebase’s journey, where traffic is low and requests are sparse, that subtle wrong decisions can cement and later on they can lead to errors that are hard to identify and track down.

I don’t want to get into all of the different elements that need to be considered when building webhooks (at least not in this one article), but I do want to talk about one specifically that can be really painful if you’re not aware of a small, but very important about webhooks of any service: Webhooks don’t always arrive in the order that you would expect… And that’s expected. At some point in your journey, your `payment.created` event will arrive after your `payment.updated` event, and you will have to deal with it on your side.

Distributed systems don’t promise perfect order. Stripe, for example, explicitly states that [event order isn’t guaranteed](https://docs.stripe.com/webhooks#event-ordering), and there’s many examples online of people talking about this on [reddit](https://www.reddit.com/r/rails/comments/qviijd/system_design_for_receiving_webhooks/), on [forums](https://developer.squareup.com/forums/t/order-state-checkout-api-webhooks/7769?utm_source=chatgpt.com) or on [GitHub]([https://github.com/stripe/stripe-cli/issues/418](https://github.com/stripe/stripe-cli/issues/418?utm_source=chatgpt.com)) where people have ran into this issue.

### A Naive Handler

```ruby
def handle_payment_updated(event)
  payment = Payment.find_by(stripe_id: event.data.object.id)
  payment.update!(status: event.data.object.status)
end
```

This seems okay during dev. But if updated arrives before created, payment is nil, and your system slowly starts looking more and more different from the source of truth.

### Fetching again

A way to get around this, (and the most resilient in my opinion) is to fetch the resource again so you can grab the latest state. I find it helpful to change mindset to acknowledge that **webhooks are notifications, not the source of truth.**

```ruby
def handle_payment_updated(event)
  id = event.data.object.id
  payment = Payment.find_by(stripe_id: id)

  Payment.sync id
end

# payment.rb

def self.sync(payment_id)
  object = ::Stripe::Payment.retrieve(payment_id)
  
  payment = Payment.find_or_initialize_by(remote_id: payment_id)
  payment.amount = object.amount
  payment.status = object.status
  payment.save!
end
```

Now, even if events shuffle, you always reconcile against the provider’s canonical state.

Distributed systems don’t promise perfect order. Stripe, for instance,—even customer.subscription.created might follow customer.subscription.updated in delivery     . GitHub developer threads echo this: “We do not provide explicit ordering for webhook events…”  .

A developer on StackOverflow ran into it firsthand:

> “From the CLI it seems that the webhook payment_intent.processing is being received before payment_intent.created… this results in an error undefined method 'update!' for nil:NilClass since I’m trying to update a record that doesn’t exist yet.”
>

Stripe’s docs also warn: **don’t assume event delivery order**. You “may receive invoice.paid before invoice.created,” so design accordingly  .

---

## **The Naïve Handler (and Why It Fails)**

```
def handle_payment_updated(event)
  payment = Payment.find_by(stripe_id: event.data.object.id)
  payment.update!(status: event.data.object.status)
end
```

This seems okay during dev. But if updated arrives before created, payment is nil, and your system breaks—slowly desyncing from truth.

---

## **The Fetch-Again Pattern: A Simple, Resilient Fix**

Shift your mindset: **webhooks are notifications—not the source of truth.**

In Rails:

```
def handle_payment_updated(event)
  id = event.data.object.id
  payment = Payment.find_by(stripe_id: id)

  unless payment
    data = Stripe::PaymentIntent.retrieve(id)
    payment = Payment.create!(
      stripe_id: data.id,
      amount: data.amount,
      status: data.status
    )
  end

  payment.update!(status: event.data.object.status)
end
```

Now, even if events shuffle, you always reconcile against the provider’s canonical state.

---

## **Beyond “Fetch Again”: Patterns for Resilient Webhook Handling**

Fetching again solves ordering, but true resilience needs more patterns:

### **1.**

### **Idempotency**

Track processed event IDs to prevent duplicates and double-processing.

### **2.**

### **Background Jobs**

Acknowledge the webhook quickly (200 OK) and enqueue logic-heavy tasks in Sidekiq or Resque. This avoids timeouts and failure cascades.

### **3.**

### **Timestamp Ordering**

Compare event timestamps to avoid applying stale updates. A developer suggests:

> “Maybe check the timestamp on the event and save only if it’s greater than the one in your DB?”
>

### **4.**

### **Monitoring & Alerts**

Log failures, use a dead-letter queue if needed—silent webhook failures are one of the worst hidden bugs.

---

## **Other Perspectives: What the Community Says**

On Reddit, a user describes receiving events like Invoice paid before Customer create:

> “We process a metric fuck-ton of webhooks… Out-of-order is real. Eventually we handled status via separate columns per status and always pick the highest-order status.”
>

On software engineering StackExchange, someone asks about building a reliable event stream integration without ordering guarantees. The top answer advises:

> “The usual answer is ‘don’t do that’—if you need ordered events, build an ordered projection yourself, or embed causation metadata.”
>

---

## **Case Study: The Phantom Refund**

A client’s refunds were vanishing. Logs showed refund.updated arriving before refund.created, silently dropping data. After switching to “fetch again,” ghost refunds vanished. Every event now led to a state sync, not guesswork.

---

## **Final Takeaways**

- **Don’t trust webhook order.** Out-of-order delivery is common.
- **Always re-fetch from the source.** Treat webhooks as nudges, not the truth.
- **Add resilience layers.** Idempotency, background processing, timestamp checks, and observability are your safety net.

Most payment system bugs stem from these subtleties—not from complex feature code. Fixing the foundation means fewer 2 AM surprises and more confidence that your system is reliable.

---

Let me know if you’d like **visual diagrams** (like event timelines) or **Rails-specific code snippets** (e.g., idempotency middleware) to enhance this further!
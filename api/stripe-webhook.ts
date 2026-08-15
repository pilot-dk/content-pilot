import type { IncomingMessage } from 'node:http'
import type Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from './_lib/types'
import { getStripe } from './_lib/stripe'
import { getSupabaseAdmin } from './_lib/supabaseAdmin'

// Stripe requires the raw, unparsed request body to verify the webhook
// signature — Vercel supports this same `config.api.bodyParser` opt-out for
// any /api function, not just Next.js API routes.
export const config = { api: { bodyParser: false } }

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function statusFromStripe(status: Stripe.Subscription.Status): 'active' | 'past_due' | 'canceled' {
  if (status === 'active' || status === 'trialing') return 'active'
  if (status === 'past_due' || status === 'unpaid') return 'past_due'
  return 'canceled'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || typeof signature !== 'string' || !webhookSecret) {
    res.status(400).json({ error: 'Missing webhook signature or secret.' })
    return
  }

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    const rawBody = await readRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    res.status(400).json({ error: `Webhook signature verification failed: ${err instanceof Error ? err.message : err}` })
    return
  }

  const admin = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id ?? session.metadata?.supabase_user_id
        if (userId) {
          await admin.from('subscriptions').upsert({
            user_id: userId,
            email: session.customer_details?.email ?? null,
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null),
            stripe_subscription_id:
              typeof session.subscription === 'string' ? session.subscription : (session.subscription?.id ?? null),
            status: 'active',
          })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const status = statusFromStripe(subscription.status)
        const periodEndSeconds = subscription.items.data[0]?.current_period_end
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
        const userId = subscription.metadata?.supabase_user_id

        const patch = {
          status,
          stripe_subscription_id: subscription.id,
          ...(periodEndSeconds ? { current_period_end: new Date(periodEndSeconds * 1000).toISOString() } : {}),
        }

        if (userId) {
          await admin.from('subscriptions').update(patch).eq('user_id', userId)
        } else {
          // Fall back to matching by Stripe customer id if metadata wasn't propagated.
          await admin.from('subscriptions').update(patch).eq('stripe_customer_id', customerId)
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Webhook handling failed.' })
    return
  }

  res.status(200).json({ received: true })
}

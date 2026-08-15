import type { VercelRequest, VercelResponse } from './_lib/types.js'
import { getStripe } from './_lib/stripe.js'
import { getSupabaseAdmin, getUserFromAuthHeader } from './_lib/supabaseAdmin.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await getUserFromAuthHeader(req.headers.authorization)
  if (!user) {
    res.status(401).json({ error: 'Not signed in.' })
    return
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID
  if (!priceId) {
    res.status(500).json({ error: 'Billing is not configured yet.' })
    return
  }

  const siteUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`

  try {
    const stripe = getStripe()
    const admin = getSupabaseAdmin()
    const { data: existing } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: existing?.stripe_customer_id ?? undefined,
      customer_email: existing?.stripe_customer_id ? undefined : (user.email ?? undefined),
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: `${siteUrl}/settings?checkout=success`,
      cancel_url: `${siteUrl}/settings?checkout=cancelled`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Something went wrong.' })
  }
}

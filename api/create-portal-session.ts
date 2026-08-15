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

  const siteUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`

  try {
    const admin = getSupabaseAdmin()
    const { data } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!data?.stripe_customer_id) {
      res.status(400).json({ error: 'No billing account found yet — subscribe first.' })
      return
    }

    const stripe = getStripe()
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${siteUrl}/settings`,
    })

    res.status(200).json({ url: portalSession.url })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Something went wrong.' })
  }
}

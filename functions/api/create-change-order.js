import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ==========================================
    // 1. STRIPE WEBHOOK HANDLER
    // ==========================================
    if (url.pathname === '/api/stripe-webhook') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      const signature = request.headers.get('stripe-signature');
      const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
      const stripeKey = env.STRIPE_SECRET_KEY;

      if (!signature || !webhookSecret) {
        return new Response('Missing webhook signature or secret', { status: 400 });
      }

      const stripe = new Stripe(stripeKey);
      const rawBody = await request.text();
      let event;

      try {
        event = await stripe.webhooks.constructEventAsync(
          rawBody,
          signature,
          webhookSecret
        );
      } catch (err) {
        return new Response(`Webhook Signature Verification Failed: ${err.message}`, { status: 400 });
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const changeOrderId = session.metadata?.changeOrderId;

        if (changeOrderId && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
          const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

          const { error } = await supabase
            .from('change_orders')
            .upsert({
              id: changeOrderId,
              client_name: session.metadata?.clientName || null,
              status: 'approved',
              payment_status: 'paid',
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent,
              authorized_at: new Date().toISOString(),
              billing_option: 'stripe_checkout'
            }, { onConflict: 'id' });

          if (error) {
            console.error('Supabase update failed:', error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ==========================================
    // 2. CHECKOUT SESSION CREATION
    // ==========================================
    if (url.pathname === '/api/create-change-order' || url.pathname.endsWith('/create-change-order')) {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers, status: 204 });
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const { changeOrderId, clientName, requestTitle, amount, returnUrl } = body;
          const stripeKey = env.STRIPE_SECRET_KEY;

          if (!stripeKey) {
            return new Response(
              JSON.stringify({ error: 'STRIPE_SECRET_KEY not configured' }),
              { headers, status: 500 }
            );
          }

          const stripe = new Stripe(stripeKey);

          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: `Change Order: ${requestTitle}`,
                    description: `ScopeShield out-of-scope order #${changeOrderId} for ${clientName}`,
                  },
                  unit_amount: Math.round(Number(amount) * 100),
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${returnUrl || `${url.origin}/`}?session_id={CHECKOUT_SESSION_ID}&status=paid`,
            cancel_url: `${returnUrl || `${url.origin}/`}?status=cancelled`,
            metadata: {
              changeOrderId: String(changeOrderId),
              clientName: String(clientName),
            },
          });

          return new Response(
            JSON.stringify({
              success: true,
              mode: 'live',
              checkoutUrl: session.url,
              sessionId: session.id,
            }),
            { headers, status: 200 }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers, status: 500 }
          );
        }
      }

      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { headers, status: 405 });
    }

    // ==========================================
    // 3. SPA STATIC ASSET FALLBACK
    // ==========================================
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Assets binding not found', { status: 500 });
  }
};

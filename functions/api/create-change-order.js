import Stripe from 'stripe';

export async function onRequestPost(context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const { request, env } = context;
    const body = await request.json();
    const { changeOrderId, clientName, requestTitle, amount, returnUrl } = body;

    const stripeKey = env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      return new Response(
        JSON.stringify({
          success: true,
          mode: 'simulation',
          checkoutUrl: `https://checkout.stripe.com/pay/cs_test_mock_${Date.now()}`,
          message: 'Simulation mode. Add STRIPE_SECRET_KEY in Cloudflare Pages settings for live checkout.'
        }),
        { headers, status: 200 }
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
      success_url: `${returnUrl || 'https://scope-shield-57o.pages.dev'}?session_id={CHECKOUT_SESSION_ID}&status=paid`,
      cancel_url: `${returnUrl || 'https://scope-shield-57o.pages.dev'}?status=cancelled`,
      metadata: {
        changeOrderId,
        clientName,
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

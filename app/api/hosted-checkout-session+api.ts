
import { CURRENCY } from "@/utils/config";
import stripeServer from "@/utils/stripe-server";

export async function POST(req: Request) {
  try {
    const packageOrder: any = await req.json();
    //console.log("PackageOrder", packageOrder);
    const origin = req.headers.get('origin') || '';
    const stripe = await stripeServer(packageOrder.STRIPE_SECRET_KEY);
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      submit_type: 'pay',
      line_items: [{
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: packageOrder.title,
            description: packageOrder.description,
          },
          unit_amount: formatAmountForStripe(packageOrder.amount, CURRENCY),
        },
        quantity: 1,
      }],
      customer: packageOrder.StripeID || undefined,
      metadata: {
        OrderId: packageOrder.OrderId.toString(),
        PackageId: packageOrder.PackageId,
      },
         success_url: `${origin}/pages/result?session_id={CHECKOUT_SESSION_ID}?session_key={STRIPE_SECRET_KEY}`,
         cancel_url: `${origin}/`,
      ui_mode: 'hosted',
    });

    return Response.json({
      client_secret: checkoutSession.client_secret,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      session_key: packageOrder.STRIPE_SECRET_KEY
    });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function formatAmountForStripe(amount: number, currency: string): number {
  let numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency: boolean = true;
  for (let part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}
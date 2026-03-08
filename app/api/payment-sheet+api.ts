
import { CURRENCY } from "@/utils/config";
import stripeServer from "@/utils/stripe-server";

export async function POST(req: Request) {
  const body = await req.json();
  const { amount, packageInfo } = body;

  if (!packageInfo || !amount || !packageInfo.STRIPE_SECRET_KEY || !packageInfo.STRIPE_PUBLISHABLE_KEY) {
    return new Response(JSON.stringify({ error: "Invalid request payload" }), { status: 400 });
  }

  const stripe = await stripeServer(packageInfo.STRIPE_SECRET_KEY);
  let customerId = packageInfo.StripeID;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: packageInfo.Customer.name,
      email: packageInfo.Customer.email,
      phone: packageInfo.Customer.phone,
    });
    customerId = customer.id;
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customerId },
    { apiVersion: "2025-04-30.basil" }
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: CURRENCY,
    customer: customerId,
    metadata: {
      OrderId: packageInfo.OrderId,
      PackageId: packageInfo.PackageId,
    },
    automatic_payment_methods: { enabled: true },
  });

  return Response.json({
    paymentIntentClientSecret: paymentIntent.client_secret,
    paymentIntent: paymentIntent,
    ephemeralKey: ephemeralKey.secret,
    customerId: customerId,
    publishableKey: packageInfo.STRIPE_PUBLISHABLE_KEY,
  });
}




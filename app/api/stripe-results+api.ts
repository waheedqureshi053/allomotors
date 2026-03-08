
import stripeServer from "@/utils/stripe-server";
import type { Stripe } from "stripe";

// export async function GET(req: Request) {

//     const session_id = new URL(req.url).searchParams.get("session_id");
//     const STRIPE_SECRET_KEY = new URL(req.url).searchParams.get("session_key");
//     if (!session_id) {
//         throw new Error("Please provide a valid session_id (`cs_test_...`)");
//     }

//     const stripe = stripeServer(STRIPE_SECRET_KEY!);
//     const checkoutSession: Stripe.Checkout.Session =
//         await stripe?.checkout?.sessions?.retrieve(session_id, {
//             expand: ["line_items", "payment_intent"],
//         });

//     return Response.json(checkoutSession);
// }


export async function GET(req: Request) {

    const session_id = new URL(req.url).searchParams.get("session_id");
    const STRIPE_SECRET_KEY = new URL(req.url).searchParams.get("session_key");
    if (!session_id) {
        throw new Error("Please provide a valid session_id (`cs_test_...`)");
    }

    const stripe: Stripe = await stripeServer(STRIPE_SECRET_KEY!);
    const checkoutSession: Stripe.Checkout.Session =
        await stripe.checkout.sessions.retrieve(session_id, {
            expand: ["line_items", "payment_intent"],
        });

    return Response.json(checkoutSession);
}
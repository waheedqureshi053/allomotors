import Stripe from "stripe";

export default async function stripeServer(STRIPE_SECRET_KEY: string) {
  //process.env.STRIPE_SECRET_KEY as string
  let stripe = new Stripe(STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(), 
    apiVersion: "2026-01-28.clover", // Use the correct value for apiVersion
    appInfo: {
      name: "AlloMotors",
    },
  });
  return stripe;
}



// import Stripe from "stripe";
// export default async function stripeServer(STRIPE_SECRET_KEY: string) {
//   //process.env.STRIPE_SECRET_KEY as string
//   let stripe = new Stripe(STRIPE_SECRET_KEY, {
//   httpClient: Stripe.createFetchHttpClient(), 
//   apiVersion: "2025-04-30.basil",
//   appInfo: {
//     name: "AlloMotors",
//   },
// });
//   return stripe
// }

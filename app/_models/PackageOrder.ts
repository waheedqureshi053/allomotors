interface PackageOrder {
  PackageId: string;
  OrderId: number;
  amount: number;
  title: string;
  description: string;
  StripeID?: string;
  StripePlanID?: string;
  Customer: CustomerInfo
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  stripeResponse: StripeResponse
}

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

interface StripeResponse {
  Customer: string;
  EphemeralKey: string;
  PaymentIntent: string;
  PublishableKey: string;
}

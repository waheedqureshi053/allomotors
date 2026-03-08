import { router } from "expo-router";
import { Alert } from "react-native";
import CheckoutButton from "./checkout-button";
import { CURRENCY } from "@/utils/config";

interface CheckoutScreenProps {
  amount: number;
  packageInfo: any;
   onPaymentSuccess?: () => void;
   onPaymentError?: (error: unknown) => void;
}


async function openPaymentModal(
  amount: number,
  packageInfo: any,
   onPaymentSuccess?: () => void,
   onPaymentError?: (error: any) => void
): Promise<void> {
  try {
    const response = await fetch("/api/hosted-checkout-session", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        PackageId: packageInfo.PackageId,
        OrderId: packageInfo.OrderId,
        amount: amount,
        title: packageInfo.title,
        description: packageInfo.description,
        Customer: {
          name: packageInfo.Customer.name,
          email: packageInfo.Customer.email,
          phone: packageInfo.Customer.phone || ''
        },
        StripeID: packageInfo.StripeID,
        StripePlanID: packageInfo.StripePlanID,
        STRIPE_SECRET_KEY: packageInfo.STRIPE_SECRET_KEY,
        STRIPE_PUBLISHABLE_KEY: packageInfo.STRIPE_PUBLISHABLE_KEY,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.url) {
      throw new Error("No URL returned from the server");
    }

    console.log("OpenPaymentModal URL for Checkout-Session", data.url);

    // Navigate to the checkout URL
    router.push(data.url);
    // // Open the Stripe checkout page in the browser
    // const result = await WebBrowser.openBrowserAsync(data.url);

    // Listen for when the browser closes
    if (data.type === 'cancel') {
      // User closed the browser
      console.log("Payment was canceled by user");
    } else {
      // Payment might have been completed
      onPaymentSuccess?.();
    }

  } catch (error) {
    console.error("Error during payment initialization:", error);
    //Alert.alert("Payment Error", "Failed to initialize payment");
    onPaymentError?.(error);
  }
}

export default function CheckoutForm({
  amount,
  packageInfo,
  onPaymentSuccess,
  onPaymentError,
}: CheckoutScreenProps) {
  return (
    //onPaymentSuccess, onPaymentError
    <CheckoutButton
      onPress={() => openPaymentModal(amount, packageInfo, onPaymentSuccess, onPaymentError,)}
      title={`Payer €${amount.toFixed(2)}`} // Changed to French and EUR
      accessibilityLabel="Proceed to payment"
    />
  );
}
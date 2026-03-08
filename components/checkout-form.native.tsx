import { ActivityIndicator, Alert, Text, useColorScheme, View } from "react-native";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import CheckoutButton from "./checkout-button";
import { getAuthToken } from "@/app/_services/apiConfig";
import { router } from "expo-router";
import { Colors } from '@/constants/theme';
// type PackageOrder = {
//   PackageId: string;
//   OrderId: number;
//   amount: number;
//   title: string;
//   description: string;
//   StripeID?: string;
//   StripePlanID?: string;
//   Customer: {
//     name: string;
//     email: string;
//     phone?: string;
//   };
//   STRIPE_SECRET_KEY: string;
//   STRIPE_PUBLISHABLE_KEY: string;
// };

type PaymentSheetParams = {
  paymentIntent: {
    id: string;
    client_secret: string;
    metadata: {
      OrderId: number;
      PackageId: string;
    };
  };
  ephemeralKey: string;
  customer: string;
};

type CheckoutScreenProps = {
  amount: number;
  packageInfo: any;
  onPaymentSuccess?: (paymentIntent: any) => void;
  onPaymentError?: (error: any) => void;
};

async function fetchPaymentSheetParams(amount: number, packageInfo: any): Promise<PaymentSheetParams> {
  const response = await fetch(`/api/payment-sheet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
      packageInfo,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch payment sheet parameters");
  }
  return response.json();
}

export default function CheckoutScreen({
  amount,
  packageInfo,
  onPaymentSuccess,
  onPaymentError,
}: CheckoutScreenProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [readyToPay, setReadyToPay] = useState(false);
  //const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const colorScheme = useColorScheme();
  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
       //const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams(amount, packageInfo);
      // setPaymentIntent(paymentIntent);
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Allo Motors",
        customerId: packageInfo.stripeResponse.Customer,
        customerEphemeralKeySecret: packageInfo.stripeResponse.EphemeralKey,
        paymentIntentClientSecret: packageInfo.stripeResponse.PaymentIntent, // paymentIntent.client_secret,
        allowsDelayedPaymentMethods: true,
        returnURL: Linking.createURL("stripe-redirect"),
        defaultBillingDetails: {
          name: packageInfo.Customer.name,
          email: packageInfo.Customer.email,
          phone: packageInfo.Customer.phone || "",
        },
        applePay: {
          merchantCountryCode: "FR",
        },
      });

      if (error) {
        console.error("Stripe init error:", error);
        onPaymentError?.(error);
      } else {
        setReadyToPay(true);
      }
    } catch (error: any) {
      console.error("Initialization failed:", error);
      onPaymentError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    if (!readyToPay) return;
    setLoading(true);
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        console.error("Payment failed:", error);
        onPaymentError?.(error);
        return;
      }
      const token = await getAuthToken();
      const res = await fetch("https://api.allomotors.fr/api/Account/UpdatePurchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ID: packageInfo.OrderId, //paymentIntent.metadata.OrderId,
          PackageID: packageInfo.PackageId, // paymentIntent.metadata.PackageId,
          TransID: packageInfo.stripeResponse.PaymentIntent, // paymentIntent.id,
          Status: "Paid",
        }),
      });
      const result = await res.json();
      console.log("Purchase updated:", result);
      onPaymentSuccess?.(packageInfo.stripeResponse.PaymentIntent);
    } catch (error: any) {
      console.error("Post-payment processing failed:", error);
      onPaymentSuccess?.(packageInfo.stripeResponse.PaymentIntent); // Still mark as successful
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, [amount, packageInfo]);

  if (!amount) return null;

  return (
    <>
      {readyToPay && !loading ? (
        <CheckoutButton
          onPress={openPaymentSheet}
          disabled={!readyToPay}
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].success,
          }}
          title={`Payer €${amount.toFixed(2)}`}
        />
      ) : (
        <View className="p-5 flex flex-row items-center justify-center mb-20">
          <ActivityIndicator size="small" color={Colors[colorScheme ?? "light"].text} />
          <Text className="ml-5" style={{ color: Colors[colorScheme ?? "light"].text }}>
            Chargement...
          </Text>
        </View>
      )}
    </>
  );
}
import * as Linking from "expo-linking";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { useSession } from "@/app/_services/ctx";

const merchantId = Constants.expoConfig?.plugins?.find(
  (p) => p[0] === "@stripe/stripe-react-native"
)?.[1].merchantIdentifier;

if (!merchantId) {
  throw new Error('Missing Expo config for "@stripe/stripe-react-native"');
}

export default function ExpoStripeProvider(
  props: Omit<
    React.ComponentProps<typeof StripeProvider>,
    "publishableKey" | "merchantIdentifier"
  >
) {
  const { company } = useSession();
  // useFocusEffect(
  //   useCallback(() => {
  //     GetCompany();
  //   }, [])
  // );
  //process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  return (
    <StripeProvider
      publishableKey={company?.StripePubKey || ""}
      merchantIdentifier={merchantId}
      urlScheme={Linking.createURL("/").split(":")[0]}
      {...props}
    />
  );
}
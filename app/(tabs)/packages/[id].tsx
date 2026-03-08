import { getAuthToken } from "@/app/_services/apiConfig";
import { useSession } from "@/app/_services/ctx";
import { useGlobalStyles } from "@/app/_styles/globalStyle";
import CheckoutForm from "@/components/checkout-form";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { formatDecimal } from "@/utils/helperFunction";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
}
export default function PackageScreen() {
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { id, item } = useLocalSearchParams();
    const parsedData = useMemo(() => {
        return typeof item === 'string' ? JSON.parse(decodeURIComponent(item)) : null;
    }, [item]); 
    const { user, GetCompany, company } = useSession();
    const [loading, setLoading] = useState(false);
    const [packageDetails, setPackageDetails] = useState<any | null>(null); 
    const [amount, setAmount] = useState<number>(0);
    const [TVAPrice, setTVAPrice] = useState<number>(0); 
    useFocusEffect(
        useCallback(() => {
            GetCompany();
        }, [])
    );
    const makePurchase = async () => {
        setLoading(true);
        try {
            const token = await getAuthToken();
            if (!token) {
                throw new Error("Failed to retrieve authentication token");
            }

            const response = await fetch('https://api.allomotors.fr/api/Account/MakePurchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ID: 0,
                    PackageID: parsedData?.ID,
                    TransID: "",
                    Status: "Pending"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data) {
                console.log("MakePurchase Response:", data);
                const price = parsedData?.Price || 0;
                const tva = company?.TVA || 0;
                const calculatedTVA = (price * tva) / 100;
                const totalAmount = price + (tva ? calculatedTVA : 0);

                setTVAPrice(calculatedTVA);
                setAmount(totalAmount);
                setPackageDetails({
                    ID: data.ID,
                    StripeID: data.StripeID,
                    StripePlanID: data.StripePlanID,
                    PackageId: parsedData?.ID || 0,
                    OrderId: data?.ID || 0,
                    amount: price,
                    description: parsedData?.Features || 'Default Package description',
                    title: parsedData?.Title || 'Package',
                    Customer: {
                        name: user?.Name || 'John Doe',
                        email: user?.Username || '',
                        phone: '',
                    },
                    STRIPE_SECRET_KEY: company?.StripeSecKey || '',
                    STRIPE_PUBLISHABLE_KEY: company?.StripePubKey || '',
                    stripeResponse: data.stripeResponse
                });
            }
        } catch (error) {
            console.error("Purchase error:", error);
            Alert.alert("Erreur", "Échec du traitement de l'achat. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    } 
    useFocusEffect(
        React.useCallback(() => {
            if (parsedData?.ID) {
                makePurchase();
            }
        }, [parsedData?.ID])
    );
    const handlePaymentSuccess = () => {
        console.log("Payment was successful!");
        setTimeout(() => {
            router.replace("/pages/result");
        }, 500);
        //Alert.alert("Success Confrimation Page", "Your payment was successful!");
        // Navigate to success screen or perform other actions
    };
    const handlePaymentError = (error: any) => {
        console.warn("Payment error:", error);

        if (error?.code === 'Canceled') {
            // User canceled the payment, don't show an alert
            console.log("User canceled the payment flow.");
            return;
        }

        // Show actual error to the user
        Alert.alert("Échec du paiement", error?.localizedMessage || "Une erreur s'est produite.");
    };
    const goBack = () => {
        navigation.goBack();
        console.log("Back button pressed");
    };
    if (!parsedData) return null;
    return (
        <ScrollView className="flex-1"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={[styles.background]}
            contentContainerStyle={{ marginTop: insets.top }}>
            <View className="flex-1 p-5">
                <View className="flex flex-row items-start gap-5 mb-5">
                    <View>
                        <TouchableOpacity style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
                            onPress={() => { goBack() }}>
                            <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1">
                        <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>Presque Termine!</ThemedText>
                        <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0 }]}>Vernez vos details de palement avant de proceder.</ThemedText>
                    </View>
                </View>
                <View style={[styles.card]}>
                    <View className="flex items-center justify-between mb-10 flex-1">
                        <View className="mb-4">
                            <Ionicons name="cart-outline" size={60} color={Colors[colorScheme ?? 'light'].text} />
                        </View>
                        <ThemedText style={[styles.fontBold, styles.colorDanger, { fontSize: FONT_SIZES.xl }]}>{parsedData?.Title}</ThemedText>
                        <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Le plan selectionne pour votre achat</ThemedText>
                    </View>
                    <View className="flex flex-row items-center mb-5">
                        <View className="flex flex-row items-start gap-3 flex-1">
                            <View className="">
                                <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                    <Ionicons name="card" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                </View>
                            </View>
                            <View className="flex-1">
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 16 }]}>Credits</ThemedText>
                                <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Nombre total de credits inclus</ThemedText>
                            </View>
                        </View>
                        <View>
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.lg }]}>{parsedData?.Qty}</ThemedText>
                        </View>
                    </View>
                    <View className="flex flex-row items-center mb-5">
                        <View className="flex flex-row items-start gap-3 flex-1">
                            <View className="">
                                <View className="rounded-md w-14 flex items-center" style={[styles.btnIconSM, styles.primary]}>
                                    <FontAwesome name="euro" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                </View>
                            </View>
                            <View className="flex-1">
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 16 }]}>Prix</ThemedText>
                                <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Le Cout du plan selectionne</ThemedText>
                            </View>
                        </View>
                        <View>
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.lg }]}>{formatDecimal(parsedData?.Price)}€</ThemedText>
                        </View>
                    </View>
                    <View className="flex flex-row items-center mb-5">
                        <View className="flex flex-row items-start gap-3 flex-1">
                            <View className="">
                                <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                    <FontAwesome name="euro" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                </View>
                            </View>
                            <View className="flex-1">
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 16 }]}>TVA (si professionnel)</ThemedText>
                                <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Taxe appliquee a votre achat</ThemedText>
                            </View>
                        </View>
                        <View>
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.lg }]}>{formatDecimal(TVAPrice)}€</ThemedText>
                        </View>
                    </View>
                    <View className="border-b border-gray-300 mb-5"></View>
                    <View className="flex flex-row items-center mb-5">
                        <View className="flex flex-row items-start gap-3 flex-1">
                            <View className="flex-1">
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.lg }]}>Net Total</ThemedText>
                                <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm }]}>Montant final a payer</ThemedText>
                            </View>
                        </View>
                        <View>
                            <ThemedText style={[styles.fontBold, styles.colorDanger, { fontSize: 30, lineHeight: 30 }]}>{formatDecimal(amount)}€</ThemedText>
                        </View>
                    </View>
                    {packageDetails ?
                        <CheckoutForm
                            amount={amount}
                            packageInfo={packageDetails}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                        />
                        : (

                            <View className="p-5 flex flex-row items-center justify-center mb-20">
                                <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />
                                <Text className="ml-5" style={{ color: Colors[colorScheme ?? 'light'].text }}>Loading...</Text>
                            </View>
                        )
                    }
                    <View className="mb-10"></View>
                </View>
            </View>
        </ScrollView>
    );
}
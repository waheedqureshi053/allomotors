
import { ScrollView, TouchableOpacity, useColorScheme } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStyles } from "../_styles/globalStyle";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react"; 
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../_services/ctx";
import { apiCall } from "../_services/api";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

export default function PurchasesScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [IsPaymentButtonVisible, setIsPaymentButtonVisible] = useState(false);
    const { user, company, GetCompany } = useSession();
    const [Purchases, setPurchases] = useState<any[]>([]);
    const LoadClientPurchases = async () => {
        setLoading(true);

        try {
            const response = await apiCall(
                'POST',
                '/Account/LoadClientPurchase',
                null,
                {
                    pageIndex: 1,
                    pageSizeSelected: 10,
                }
            );

            const data = response?.data;
            console.log('✅ Success:', data?.obj?.dataList || []);

            // Example if you want to store it:
            // setPurchases(data?.obj?.dataList || []);

        } catch (error) {
            console.error('LoadClientPurchase error:', error);
        } finally {
            setLoading(false);
        }
    };


    // const LoadClientPurchases = async () => {
    //     setLoading(true);
    //     const token = await getAuthToken();
    //     try {
    //         const response = await fetch('https://api.allomotors.fr/api/Account/LoadClientPurchase', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: JSON.stringify({
    //                 pageIndex: 1,
    //                 pageSizeSelected: 10,
    //             })
    //         });
    //         const data = await response.json();

    //         //setPurchases(data.obj.dataList);
    //         console.log('✅ Success:', data.obj.dataList);
    //     } catch (error: any) {
    //         console.error("LoadAllAdverts error:", error);
    //     }
    // };
    const GetCompanyInfo = async () => {
        const userRoles = user?.Roles || [];
        if (!userRoles.includes('DenyPayment')) {
            setIsPaymentButtonVisible(true);
            return;
        };
        await GetCompany();
        console.log("Company Attributes DoPayment", company?.Attributes?.DoPayment);
        console.log("userRoles", userRoles);
        if (userRoles.includes('DenyPayment') && !company?.Attributes?.DoPayment) {
            setIsPaymentButtonVisible(false);
        } else {
            setIsPaymentButtonVisible(true);
        }
    }
    const goBack = () => {
        router.back();
    };

    useFocusEffect(
        React.useCallback(() => {
            GetCompanyInfo();
            LoadClientPurchases();
        }, [])
    );

    const PurchaseRow = ({ label, value, isLast = false }: { label: string, value: string, isLast?: boolean }) => (
        <View
            className="flex-row items-center py-2"
            style={{
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: '#ddd',
            }}
        >
            <View className="flex-1 pr-2">
                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>
                    {label}
                </ThemedText>
            </View>
            <ThemedText style={{ fontSize: FONT_SIZES.md }}>{value}</ThemedText>
        </View>
    );


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
                        <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>Achats</ThemedText>
                        <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0 }]}>Historique des achats</ThemedText>
                    </View>
                </View>
                {Purchases?.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.card,
                            {
                                borderRadius: 16,
                                padding: 16,
                                backgroundColor: Colors[colorScheme ?? 'light'].card,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 4,
                                marginBottom: 20,
                            },
                        ]}
                    >
                        <PurchaseRow label="📅 Date d'achat" value={new Date(item.PurchaseDate).toLocaleDateString('fr-FR')} />
                        <PurchaseRow label="📦 Emballer" value={item?.tblDataPackage?.Title} />
                        <PurchaseRow label="💰 Prix Total" value={item?.Price} />
                        <PurchaseRow label="🧾 TVA (si professionnel)" value={item?.TVA} />
                        <PurchaseRow label="💵 Montant net" value={item?.NetAmount} />
                        <PurchaseRow label="🔢 Crédits" value={item?.Qty} />
                        <PurchaseRow label="✅ Statut de paiement" value={item?.Status} isLast />
                    </View>
                ))}

                {IsPaymentButtonVisible && Purchases.length == 0 ? (
                    <View className="flex flex-1 flex-col items-center justify-center mt-10">
                        <View className="mt-10">
                            <ThemedText type='subtitle' style={[styles.textCenter]}>Vous n'avez pas encore effectué d'achat ? Commencez à explorer !</ThemedText>
                        </View>
                        <TouchableOpacity onPress={() => { router.push('/packages') }}
                            className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4 mt-5" style={[styles.danger]}>
                            <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].white} />
                            <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold]}>Voir les offres</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="flex flex-1 flex-col items-center justify-center mt-10">
                        <View className="mt-10">
                            <ThemedText type='subtitle' style={[styles.textCenter]}>Vous n’avez effectué aucun achat.</ThemedText>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
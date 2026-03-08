import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStyles } from "../_styles/globalStyle";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { apiCall } from "../_services/api";
import { useSession } from "../_services/ctx";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

export default function BuyerRequestScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const router = useRouter();
    const [Requests, setRequests] = useState<any[]>([]);
    const { user } = useSession();
    const [isPressed, setPressed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState<string>("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const listRef = useRef<FlatList<any>>(null);
    const onEndReachedCalledRef = useRef(false);
    const baseURL = 'https://allomotors.fr/Content/WebData/UF/thumb2_';

    const processCatalogData = useCallback((data: any[]) => {
        return data?.map((item) => {
            let parsedAttributes: any = {};
            if (item?.Attributes) {
                if (typeof item.Attributes === "string") {
                    try {
                        parsedAttributes = item.Attributes ? JSON.parse(item.Attributes) : {};
                    } catch (error) {
                        console.error("JSON parse error for Attributes:", error);
                        parsedAttributes = {};
                    }
                } else if (typeof item.Attributes === "object") {
                    parsedAttributes = item.Attributes;
                }
            }
            return {
                ...item,
                Attributes: parsedAttributes,
                PhotoURL: parsedAttributes?.IconURL,
                // Add a unique key combining ID and index if needed
                uniqueKey: `${item.ID}-${Math.random().toString(36).substr(2, 9)}`
            };
        });
    }, []);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        getRequests();
    }, []);


    const getRequests = useCallback(async (loadMore = false) => {
    if (loading) return;
    if (loadMore && !hasMore) return;

    setLoading(true);

    const currentPage = loadMore ? Math.max(1, page) : 1;

    try {
        const response = await apiCall(
            'POST',
            '/Account/LoadRequests',
            null,
            {
                iView: 'list',
                maxSize: 5,
                totalCount: 0,
                pageIndex: currentPage,
                pageSizeSelected: 10,
                Page: 'Request',
                AgentStatus: null,
            }
        );

        const totalCount = response?.data?.obj?.dataCount || 0;
        const dataList = response?.data?.obj?.dataList || [];
        const newCatalogs = processCatalogData(dataList);

        if (loadMore) {
            setRequests(prev => {
                const updated = [...prev, ...newCatalogs];

                // ✅ Proper check
                setHasMore(updated.length < totalCount);

                return updated;
            });

            setPage(prev => prev + 1);
        } else {
            setRequests(newCatalogs);
            setPage(2);

            // ✅ Proper check
            setHasMore(newCatalogs.length < totalCount);
        }

    } catch (error) {
        console.error('LoadRequests error:', error);
        setHasMore(false);
    } finally {
        setLoading(false);
        setRefreshing(false);
        onEndReachedCalledRef.current = false;
    }
}, [loading, hasMore, page, processCatalogData]);

    
    const loadMoreData = useCallback(() => {
        if (!loading && hasMore && !onEndReachedCalledRef.current) {
            //console.log('Loading more data...');
            onEndReachedCalledRef.current = true;
            getRequests(true);
        }
    }, [loading, hasMore, getRequests]);
    // useEffect(() => {
    //     // console.log('Current state:', {
    //     //     loading,
    //     //     hasMore,
    //     //     page,
    //     //     catalogCount: Requests.length
    //     // });
    // }, [loading, hasMore, page, Requests]);
    useFocusEffect(
        React.useCallback(() => {
            setPage(1);
            setHasMore(true);
            getRequests();
        }, [])
    );
    const goBack = () => {
        router.back();
    };
    const Customstyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            paddingHorizontal: 16,
            paddingTop: 16,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        headerSubtitle: {
            fontSize: 16,
            color: '#666',
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: '700',
            color: Colors[colorScheme ?? 'light'].text,
        },
        profileButton: {
            backgroundColor: Colors[colorScheme ?? 'light'].danger,
            borderRadius: 50,
            padding: 8,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
        },
        statItem: {
            alignItems: 'center',
        },
        statValue: {
            fontSize: 24,
            fontWeight: '700',
            color: Colors[colorScheme ?? 'light'].text,
            marginBottom: 4,
        },
        statLabel: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].text,
        },
        filterContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        filterTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: Colors[colorScheme ?? 'light'].light,
            marginRight: 12,
        },
        filterButton: {
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: Colors[colorScheme ?? 'light'].light,
            marginRight: 8,
        },
        filterButtonActive: {
            backgroundColor: Colors[colorScheme ?? 'light'].danger,
        },
        filterButtonText: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].white,
            fontWeight: '500',
        },
        filterButtonTextActive: {
            color: 'white',
        },
        searchContainer: {
            flexDirection: 'row',
            marginBottom: 16,
        },
        searchBox: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginRight: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
        },
        searchPlaceholder: {
            fontSize: 16,
            color: '#999',
            marginLeft: 8,
        },
        sortButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#e3f2fd',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        sortButtonText: {
            fontSize: 16,
            color: '#1a73e8',
            fontWeight: '500',
            marginLeft: 8,
        },
        listContent: {
            paddingBottom: 100,
        },
        transactionCard: {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        statusIndicator: {
            backgroundColor: Colors[colorScheme ?? 'light'].lighter,
            borderRadius: 8,
            paddingVertical: 4,
            paddingHorizontal: 12,
        },
        statusText: {
            fontSize: 14,
            fontWeight: '600',
        },
        transactionDate: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].text,
        },
        vehicleTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors[colorScheme ?? 'light'].text,
            marginBottom: 16,
        },
        infoContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        infoSection: {
            flex: 1,
        },
        infoLabel: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].light,
            marginBottom: 4,
        },
        infoValue: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors[colorScheme ?? 'light'].text,
            marginBottom: 4,
        },
        commissionText: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].success,
            fontWeight: '500',
        },
        dividerVertical: {
            width: 1,
            backgroundColor: Colors[colorScheme ?? 'light'].light,
            marginHorizontal: 16,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme ?? 'light'].light,
            paddingTop: 16,
        },
        amountContainer: {},
        amountLabel: {
            fontSize: 14,
            color: Colors[colorScheme ?? 'light'].text,
        },
        amountValue: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors[colorScheme ?? 'light'].danger,
        },
        actionContainer: {},
        addButton: {
            position: 'absolute',
            bottom: 30,
            right: 30,
            backgroundColor: '#1a73e8',
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 6,
        },
    });

    const ReturnStatusInFrench = (status: string) => {
        switch (status) {
            case 'Accepted': return 'Accepté';
            case 'Delivered': return 'Livré';
            case 'Sold': return 'Vendu';
            case 'Completed': return 'Terminé';
            case 'Pending': return 'En attente';
            case 'Cancelled': return 'Annulé';
            case 'Rejected': return 'Rejeté';
            default: return status;
        }
    }
    
const formatAmount = (value: any) => {
    const number = Number(value);
    if (isNaN(number)) return "0.00";
    return number.toFixed(2);
};

    const [selectedFilter, setSelectedFilter] = useState('all');

    const renderTransactionItem = ({ item }: { item: any }) => {

    const advertAttributes = item.AdvertAttributes ? JSON.parse(item.AdvertAttributes) : {};

    const formatDate = (dateString: any) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <TouchableOpacity
            style={Customstyles.transactionCard}
            key={item.uniqueKey}
            onPress={() => {
                router.push({
                    pathname: "/pages/buyer-request-detail",
                    params: { id: item.ID, item: JSON.stringify(item) }
                })
            }}
        >

            {/* Top Section */}
            <View className="mb-2">
                <View className="flex flex-row gap-3">
                    {advertAttributes?.IconURL ? (
                        <Image
                            className="rounded"
                            resizeMode="cover"
                            source={{ uri: `${baseURL}${advertAttributes?.IconURL}` }}
                            style={{ width: 45, height: 45 }}
                        />
                    ) : (
                        <Ionicons name="car-sport" size={28} color={Colors[colorScheme ?? 'light'].light} />
                    )}

                    <View className="flex-1">
                        <ThemedText type="subtitle">
                            {item.AdvertTitle || "No Title"}
                        </ThemedText>

                        <ThemedText
                            type="default"
                            style={[styles.colorLight, { lineHeight: 16, fontSize: FONT_SIZES.sm }]}
                        >
                            {advertAttributes?.SaleArea || ""}
                        </ThemedText>
                    </View>
                </View>
            </View>

            {/* Info Section */}
            <View style={Customstyles.infoContainer}>
                <View style={Customstyles.infoSection}>

                    <Text style={Customstyles.infoLabel}>Acheteur</Text>
                    <View
                        style={[
                            item?.BuyerStatus === 'Accepted'
                                ? styles.success
                                : item?.BuyerStatus === 'Rejected'
                                    ? styles.danger
                                    : styles.warning
                        ]}
                    >
                        <Text style={Customstyles.statusText}>
                            {ReturnStatusInFrench(item?.BuyerStatus)}
                        </Text>
                    </View>

                    <Text className="mt-2 pb-1" style={Customstyles.infoLabel}>Vendeur</Text>
                    <View
                        style={[
                            item?.OwnerStatus === 'Accepted'
                                ? styles.success
                                : item?.OwnerStatus === 'Rejected'
                                    ? styles.danger
                                    : styles.warning
                        ]}
                    >
                        <Text style={Customstyles.statusText}>
                            {ReturnStatusInFrench(item?.OwnerStatus)}
                        </Text>
                    </View>

                    <Text className="mt-2 pb-1" style={Customstyles.infoLabel}>d'administrateur</Text>
                    <View
                        style={[
                            item?.Status === 'Accepted'
                                ? styles.success
                                : item?.Status === 'Rejected'
                                    ? styles.danger
                                    : styles.warning
                        ]}
                    >
                        <Text style={Customstyles.statusText}>
                            {ReturnStatusInFrench(item?.Status)}
                        </Text>
                    </View>
                </View>

                <View style={Customstyles.dividerVertical} />

                {/* Right Section */}
                <View style={Customstyles.infoSection}>

                    <View
                        style={{
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: Colors[colorScheme ?? 'light'].light,
                            marginBottom: 5
                        }}
                    >
                        <ThemedText style={[styles.colorSuccess, { lineHeight: 16 }]}>
                            {item?.RequestType === "Proposal" ? "Proposition" : "Demande"} Offre
                        </ThemedText>

                        <ThemedText
                            type="default"
                            style={{ textAlign: 'right', fontSize: FONT_SIZES.xs }}
                        >
                            {formatDate(item.EnteredOn)}
                        </ThemedText>
                    </View>

                    <ThemedText type="default" style={{ textAlign: 'right', fontSize: FONT_SIZES.sm }}>
                        Prix: {formatAmount(item?.Attributes?.SellingPrice)}
                    </ThemedText>

                    {(user?.Roles.includes("View_Commission") ||
                        user?.Roles.includes("Admin") ||
                        item?.RequestOwnerID == user?.UserId) && (
                            <>
                                <ThemedText
                                    type="default"
                                    style={{
                                        textAlign: 'right',
                                        fontSize: FONT_SIZES.xs,
                                        color: Colors[colorScheme ?? 'light'].success
                                    }}
                                >
                                    Ach Comm: {formatAmount(item?.Attributes?.BuyersCommission)}
                                </ThemedText>

                                {item.Duration > 0 && (
                                    <ThemedText type="default" style={{ textAlign: 'right', fontSize: FONT_SIZES.sm }}>
                                        Frais de durée: {formatAmount(item?.Attributes?.DurationAmount)}
                                    </ThemedText>
                                )}

                                <ThemedText type="default" style={{ textAlign: 'right', fontSize: FONT_SIZES.sm }}>
                                    Crédit: {formatAmount(item?.Attributes?.CreditAmount)}
                                </ThemedText>

                                <ThemedText type="default" style={{ textAlign: 'right', fontSize: FONT_SIZES.sm }}>
                                    Comptant: {formatAmount(item?.Attributes?.CashAmount)}
                                </ThemedText>
                            </>
                        )}

                    {item?.AdvertOwnerID === user?.UserId && (
                        <ThemedText
                            type="default"
                            style={{
                                textAlign: 'right',
                                fontSize: FONT_SIZES.xs,
                                color: Colors[colorScheme ?? 'light'].success
                            }}
                        >
                            Vend Comm: {formatAmount(item?.Attributes?.SellersCommission)}
                        </ThemedText>
                    )}

                    {item?.MeetingDate && (
                        <View>
                            <ThemedText style={{ textAlign: 'right', fontSize: FONT_SIZES.xs }}>
                                Date de réunion
                            </ThemedText>

                            <ThemedText
                                type="subtitle"
                                style={{ textAlign: 'right', fontSize: FONT_SIZES.sm }}
                            >
                                {formatDate(item?.MeetingDate)}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>

            {/* Footer */}
            <View style={Customstyles.footer}>
                <View style={Customstyles.amountContainer}>
                    <Text style={Customstyles.amountLabel}>Total </Text>

                    {item?.AdvertOwnerID !== user?.UserId ? (
                        <Text style={Customstyles.amountValue}>
                            €{formatAmount(item?.Attributes?.SellingPriceFinal)}
                        </Text>
                    ) : (
                        <Text style={Customstyles.amountValue}>
                            €{formatAmount(item?.Attributes?.SellingPrice)}
                        </Text>
                    )}
                </View>

                <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>

        </TouchableOpacity>
    );
};

    if (loading) {
        return (
            <View style={[styles.background, styles.flexOne, styles.justifyCenter, styles.itemCenter]}>
                <View className="flex flex-row items-center justify-center">
                    <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />
                    <Text className="ml-5" style={{ color: Colors[colorScheme ?? 'light'].text }}>
                        Chargement...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[Customstyles.container, { paddingTop: insets.top }]}>
            <View className="flex flex-row items-start gap-5 my-5">
                <View>
                    <TouchableOpacity style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
                        onPress={() => { goBack() }}>
                        <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                    </TouchableOpacity>
                </View>
                <View className="flex-1">
                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>Gérer Demande</ThemedText>
                    <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0 }]}>Acheteur</ThemedText>
                </View>
            </View>
            <FlatList
                ref={listRef}
                data={Requests}
                renderItem={renderTransactionItem}
                keyExtractor={item => item.uniqueKey}
                contentContainerStyle={Customstyles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.5}
                onMomentumScrollBegin={() => (onEndReachedCalledRef.current = false)}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                windowSize={11}
                initialNumToRender={10}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors[colorScheme ?? "light"].primary]}
                    />
                }
            />
        </View>
    )



}
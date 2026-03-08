import { useSession } from "@/app/_services/ctx";
import { useGlobalStyles } from "@/app/_styles/globalStyle";
import { AdCardComponent } from "@/components/AdCardComponent";
import AdvertStatusModal from "@/components/AdvertStatusModal";
import CustomImageCarousal from "@/components/ImageSlider/CustomImageCarousal";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { formatNODecimal } from "@/utils/helperFunction";
import { Entypo, Feather, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePathname, useSearchParams } from "expo-router/build/hooks";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trackEvent } from "../_services/analytics";
import { apiCall } from "../_services/api";
import { getAuthToken } from "../_services/apiConfig";
export default function AdvertDetailScreen() {
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const { user } = useSession();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [Slides, setSlides] = React.useState<{ image: string }[]>([]);
    const params = useSearchParams();
    const id = params.get("id");
    const page = params.get("page");
    const [parsedData, setparsedData] = useState<any>();
    const [currentStatus, setCurrentStatus] = useState(parsedData?.Status);
    const statusOptions = [
        // { label: "En attente", value: "Pending" },
        { label: "Actif", value: "Active" },
        { label: "Inactif", value: "InActive" },
        // { label: "Vendu", value: "Sold" },
    ];
    const SliderStyles = StyleSheet.create({
        container: {
            flex: 1,
            //paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        carouselContainer: {
            marginBottom: 20,
        },
    });
    const goBack = () => {
        console.log(router.canGoBack());
        if (router.canGoBack())
            router.back();
    };
    const UpdateViews = async (id: any) => {
        if (id) {
            try {
                const token = await getAuthToken();
                const response = await fetch('https://api.allomotors.fr/api/Account/UpdateViews?id=' + id, {
                    method: 'POST',
                    headers: {
                        'Accept': '*/*',
                        'Authorization': `Bearer ${token}`
                    },
                    body: null, // or use an empty string: body: ''
                });
                if (!response.ok) {
                    console.error('Failed to update views:', response.status);
                } else {
                    console.log('Views updated successfully');
                }

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
            }
        }
    }
    useEffect(() => {
        console.log('itemGuid :', id);
        GetAdvert(id);
        if (page == "public_catalogs")
            fetchAds("App Advert Detail Particulier");
        else
            fetchAds("App Advert Detail Pro");
    }, [id]);
    const GetAdvert = async (id: any) => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await apiCall('POST', `/Account/LoadAdvertDetails/${id}`, null, null);
            const data = response.data.obj; //  await response.json();
            data.Attributes = JSON.parse(data.Attributes);
            data.OwnerAttributes = JSON.parse(data?.OwnerAttributes);
            //console.log("GetAdvert Phone No:", data.OwnerAttributes);
            //console.log("LoadAdvertDetails OwnerUserType:", data?.OwnerType);
            const baseURL = 'https://allomotors.fr/Content/WebData/UF/thumb2_';
            const slideImages: { image: string }[] = [];
            setCurrentStatus(data?.Status);
            if (data?.Attributes?.IconURL)
                slideImages.push({ image: `${baseURL}${data.Attributes.IconURL}` });
            if (data?.FrontLeftURL)
                slideImages.push({ image: `${baseURL}${data.FrontLeftURL}` });
            if (data?.RightRearURL)
                slideImages.push({ image: `${baseURL}${data.RightRearURL}` });
            if (data?.DriversIntURL)
                slideImages.push({ image: `${baseURL}${data.DriversIntURL}` });
            if (data?.PassengersIntURL)
                slideImages.push({ image: `${baseURL}${data.PassengersIntURL}` });
            if (data?.RightProfileURL)
                slideImages.push({ image: `${baseURL}${data.RightProfileURL}` });
            if (data?.LeftProfileURL)
                slideImages.push({ image: `${baseURL}${data.LeftProfileURL}` });
            if (Array.isArray(data?.tblFiles)) {
                data.tblFiles.forEach((file: any) => {
                    if (file?.FileName) {
                        slideImages.push({ image: `${baseURL}${file.FileName}` });
                    }
                });
            }

            // Qureshi property check kr EnteredBy
            setparsedData(data);
            //console.log("AdvertDetailScreen data:", data);

            trackEvent('advert_viewed', {
                reference: data?.Reference,
                price: data?.Attributes?.SellingPrice,
            });

            setSlides(slideImages);
        } catch (error) {
            console.error("Failed to fetch advert:", error);
        } finally {
            setLoading(false);
        }
    };
    const [allAds, setAllAds] = useState<any>([]);
    const fetchAds = async (page: any) => {
        console.log("✅ page:", page);
        const response = await apiCall('POST', '/Account/LoadPublicAds', {
            Page: page,
        }, {});
        const data = response?.data;
        setAllAds(data.obj);
        console.log("✅ allAds", data);
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!parsedData?.ID) return;
        console.log("UpdateAdvertStatusSoft status:", newStatus);
        let obj = {
            ID: parseInt(parsedData?.ID),
            Status: newStatus,
            Title: ''
        };
        setLoading(true);
        try {
            const response = await apiCall('POST', `/Account/UpdateAdvertStatusSoft/`, null, obj);
            console.log("UpdateAdvertStatusSoft data:", response.data);
            if (response.data.statusCode == 1)
                setCurrentStatus(newStatus);
            Alert.alert("Success", "Status updated successfully.");
        } catch (error) {
            console.error("Failed to update advert:", error);
            Alert.alert("Error", "Failed to update status.");
        } finally {
            setLoading(false);
        }
    };
    const initializeChat = async (id: any) => {
        try {
            const response = await apiCall("POST", `/Account/InitAdvertChat/${id}`, null, null);
            // console.log("Advert Owner_OwnerID:", parsedData?.Owner_OwnerID);
            // console.log("Advert Owner Type:", parsedData?.OwnerUserType);
            console.log("Advert Owner@OwnerID", parsedData?.Owner_OwnerID);
            console.log("Advert Owner@Type", parsedData?.OwnerType);
            console.log("@EnteredBy", parsedData?.EnteredBy);

            if (parsedData?.OwnerType == "Particulier" || (parsedData?.OwnerType == "Pro Lite" && parsedData?.Owner_OwnerID)) {
                router.push(`/chats/${parsedData?.Owner_OwnerID}?itemGuid=${parsedData?.ItemGuid}`)
            }
            else {
                router.push(`/chats/${user?.OwnerID}?itemGuid=${parsedData?.ItemGuid}`)
            }

        } catch (error) {
            console.error("Failed to initialize chat:", error);
        }
    }
    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    };
    const makePhoneCall = async (phoneNumber: string) => {
        const formattedNumber =
            Platform.OS === 'android'
                ? `tel:${phoneNumber}`
                : `telprompt:${phoneNumber}`;

        const supported = await Linking.canOpenURL(formattedNumber);

        if (!supported) {
            Alert.alert('Erreur', 'Impossible de passer cet appel');
            return;
        }

        await Linking.openURL(formattedNumber);
    };

    const handleCall = (phoneNumber: string) => {
        if (!phoneNumber) {
            Alert.alert('Info', 'Aucun numéro de téléphone disponible');
            return;
        }

        Alert.alert(
            'Appeler',
            `Voulez-vous appeler ${phoneNumber} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Appeler', onPress: () => makePhoneCall(phoneNumber) }
            ],
            { cancelable: true }
        );
    };


    const getStatusColor = () => {
        return parsedData?.Status == 'Pending' ? Colors[colorScheme ?? 'light'].warning :
            parsedData?.Status == 'InActive' ? Colors[colorScheme ?? 'light'].warning :
                parsedData?.Status == 'Active' ? Colors[colorScheme ?? 'light'].success :
                    parsedData?.Status == 'Sold' ? Colors[colorScheme ?? 'light'].danger :
                        Colors[colorScheme ?? 'light'].primary;
    };
    const pathname = usePathname();
      
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
        <ScrollView className="flex-1"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={[styles.background]}
            contentContainerStyle={{ marginTop: insets.top, marginBottom: insets.bottom }}>
            <View>
                {user?.Roles?.includes('Commercial') || user?.Roles?.includes('SupportAdmin') || user?.Roles?.includes('Admin') || user?.UserId == parsedData?.EnteredBy ?
                    <AdvertStatusModal
                        LoggedInUser={user}
                        parsedData={parsedData}
                        statusOptions={statusOptions}
                        status={currentStatus}
                        setStatus={setCurrentStatus}
                        loading={loading}
                        UpdateAdvertStatusSoft={handleStatusUpdate}
                    />
                    : null}
            </View>
            <View className="absolute top-5 left-5 z-10">
                <TouchableOpacity style={[styles.btnIcon, styles.btnShadow, styles.roundedCircle, styles.primary]}
                    onPress={() => { goBack() }}>
                    <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                </TouchableOpacity>
            </View>
            <View className="mb-3 mt-5" style={[SliderStyles.container]}>
                {Slides && Slides.length > 0 && <CustomImageCarousal data={Slides} autoPlay={false} pagination={false} dotColor={Colors[colorScheme ?? 'light'].light} />}
            </View>
            <View className="flex-1 p-5 mb-5">
                <View className="flex flex-wrap flex-row items-center gap-4 mb-5">
                    <View className="flex-1">
                        <View className="flex flex-row items-start mb-2">
                            <View
                                style={{ opacity: parsedData?.Status != 'Active' && parsedData?.Status != 'InActive' ? 0.7 : 1 }}
                            >
                                <View style={[{
                                    backgroundColor: getStatusColor(),
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderRadius: 10,
                                    paddingVertical: 4,
                                    paddingHorizontal: 8,
                                }]}>
                                    <Ionicons
                                        name={
                                            parsedData?.Status == 'Pending' ? "time-outline" :
                                                parsedData?.Status == 'InActive' ? 'eye-off-outline' :
                                                    parsedData?.Status == 'Active' ? 'checkmark-circle-outline' :
                                                        parsedData?.Status == 'Sold' ? 'cart-outline' : "help-outline"
                                        }
                                        size={12}
                                        color="white"
                                    />
                                    <Text style={[{
                                        color: 'white',
                                        fontSize: 10,
                                        fontWeight: '600',
                                        marginLeft: 4
                                    }]}>
                                        {parsedData?.Status != 'Active' && parsedData?.Status != 'InActive' ?
                                            parsedData?.Status == 'Pending' ? 'En attente' :
                                                parsedData?.Status == 'InActive' ? 'Inactif' :
                                                    parsedData?.Status == 'Active' ? 'Actif' :
                                                        parsedData?.Status == 'Sold' ? 'Vendu' : parsedData?.Status
                                            :
                                            currentStatus === 'Active' ? 'Actif' : 'Inactif'
                                        }
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>{parsedData?.Title}</ThemedText>
                        <View className="flex flex-wrap flex-row items-center gap-2">
                            {parsedData?.Reference && (
                                <>
                                    <TouchableOpacity onPress={() => { }} activeOpacity={0.7}>
                                        <ThemedText type="default" style={[styles.colorDanger, styles.fontBold, { fontSize: FONT_SIZES.xs }]}>
                                            Ref: {parsedData?.Reference}
                                        </ThemedText>
                                    </TouchableOpacity>
                                    <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>|</ThemedText>
                                </>

                            )}
                            {parsedData?.Attributes?.SaleArea && (
                                <>
                                    <View>
                                        <ThemedText style={[styles.colorLight, styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 20 }]}>{parsedData?.Attributes?.SaleArea}</ThemedText>
                                    </View>
                                    {/* <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>|</ThemedText> */}
                                </>
                            )}

                            {/* <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Vue(s)  */}

                            {user?.Roles?.includes('Commercial') ?
                                <>
                                    <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>|</ThemedText>
                                    <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>(Yes)</ThemedText>
                                </>
                                : null}
                        </View>

                    </View>
                    <View>
                        {parsedData?.Attributes?.HidePrice ? (
                            <>
                                <ThemedText style={[styles.colorDanger, styles.fontBold, { fontSize: 18, lineHeight: 18 }]}> **** </ThemedText>
                            </>
                        ) :
                            (
                                <ThemedText style={[styles.colorDanger, styles.fontBold, { fontSize: 18, lineHeight: 18 }]}>{formatNODecimal(parsedData?.SellingPrice) || 0}€</ThemedText>
                            )}
                    </View>
                </View>

                {allAds && allAds.length > 0 && (
                    <>
                        {allAds.map((item: any, index: number) => (
                            <View className="mb-5">
                                <AdCardComponent key={index} ad={item} IsLandscape={true} />
                            </View>
                        ))}
                    </>
                )}


                <View className="flex flex-row items-center gap-3 mb-5">
                    {(parsedData?.SaleAssistance != true && parsedData?.IsPublic == true) && (
                        <>
                            <View className="flex-1 p-2 flex flex-wrap flex-row items-center gap-2 rounded-md" style={[styles.lighter]}>
                                <View className="flex-1 flex flex-wrap flex-row items-center">
                                    <View className="flex-1">
                                        <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}
                                            lightColor={Colors[colorScheme ?? 'light'].light}
                                            darkColor={Colors[colorScheme ?? 'light'].light} >
                                            Vendeur:
                                        </ThemedText>
                                        <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 18 }]}
                                            lightColor={Colors[colorScheme ?? 'light'].light}
                                        >
                                            {parsedData?.OwnerAttributes?.Phone || 'NA'}
                                        </ThemedText>
                                    </View>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => handleCall(parsedData?.OwnerAttributes?.Phone || '')}
                                        className="p-1 rounded-full" style={[styles.danger]}>
                                        <MaterialCommunityIcons name="phone" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}

                    {(parsedData?.OwnerAttributes?.AgentPhone && parsedData?.IsPublic == false) && (
                        <>
                            <View className="flex-1 p-2 flex flex-wrap flex-row items-center gap-2 rounded-md" style={[styles.lighter]}>
                                <View className="flex-1 flex flex-wrap flex-row items-center">
                                    {/* <View className="rounded-full p-2" style={[styles.lighter]}>
                                    <Ionicons name="person" size={20} color={Colors[colorScheme ?? 'light'].light} />
                                </View> */}
                                    <View className="flex-1">
                                        <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}
                                            lightColor={Colors[colorScheme ?? 'light'].light}
                                            darkColor={Colors[colorScheme ?? 'light'].light} >
                                            Commercial:
                                        </ThemedText>
                                        {/* <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 15 }]}
                                            lightColor={Colors[colorScheme ?? 'light'].light}>
                                            {parsedData?.OwnerAttributes?.AgentName || 'NA'}
                                        </ThemedText> */}
                                        <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 18 }]}
                                            lightColor={Colors[colorScheme ?? 'light'].light} >
                                            {parsedData?.OwnerAttributes?.AgentPhone || 'NA'}
                                        </ThemedText>
                                    </View>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => handleCall(parsedData?.OwnerAttributes?.AgentPhone || '')}
                                        className="p-1 rounded-full" style={[styles.danger]}>
                                        <MaterialCommunityIcons name="phone" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                <View className="flex flex-wrap flex-row items-center mb-5 gap-3 flex-1">
                    <View className="rounded-md flex flex-row items-center gap-3 flex-1 p-2" style={[styles.lighter]}>
                        <MaterialCommunityIcons name="car-shift-pattern" size={20} color={Colors[colorScheme ?? 'light'].light} />
                        <View className="flex-1">
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light}>{parsedData?.Attributes?.gearbox_type || 'NA'}</ThemedText>
                        </View>
                    </View>
                    <View className="rounded-md flex flex-row items-center gap-3 flex-1 p-2" style={[styles.lighter]}>
                        <MaterialCommunityIcons name="ev-station" size={20} color={Colors[colorScheme ?? 'light'].light} />
                        <View className="flex-1">
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light} >{parsedData?.Attributes?.energy || 'NA'}</ThemedText>
                        </View>
                    </View>
                </View>
                <View className="flex flex-wrap flex-row items-center mb-5 gap-3 flex-1">
                    <View className="rounded-md flex flex-row items-center gap-3 flex-1 p-2" style={[styles.lighter]}>
                        <Ionicons name="speedometer-outline" size={20} color={Colors[colorScheme ?? 'light'].light} />
                        <View className="flex-1">
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light}>{parsedData?.Mileage || 'NA'} KM</ThemedText>
                        </View>
                    </View>
                    <View className="rounded-md flex flex-row items-center gap-3 flex-1 p-2" style={[styles.lighter]}>
                        <Ionicons name="car-sport-outline" size={20} color={Colors[colorScheme ?? 'light'].light} />
                        <View className="flex-1">
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light}>{parsedData?.Attributes?.commercial_horsepower || 'NA'}</ThemedText>
                        </View>
                    </View>
                </View>
                <View className="flex flex-wrap flex-row items-center mb-5 gap-3 flex-1">
                    <View className="rounded-md flex flex-row items-center gap-3 flex-1 p-2" style={[styles.lighter]}>
                        <MaterialCommunityIcons name="ev-station" size={20} color={Colors[colorScheme ?? 'light'].light} />
                        <View className="flex-1">
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light}>{parsedData?.Attributes?.cylinder_in_litres}</ThemedText>
                        </View>
                    </View>
                    <View className="rounded-md flex flex-row items-center gap-3 flex-1 p-2" style={[styles.lighter]}>
                        <Ionicons name="calendar-outline" size={20} color={Colors[colorScheme ?? 'light'].light} />
                        <View className="flex-1">
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light}>{parsedData?.Attributes?.FirstRegDate && parsedData?.Attributes?.FirstRegDate !== "0001-01-01T00:00:00" && formatDate(parsedData?.Attributes?.FirstRegDate)}</ThemedText>
                        </View>
                    </View>
                </View>

                {page == 'catelogs' && (
                    <View className="flex flex-row items-center justify-between gap-3 mb-5">
                        {parsedData?.EnteredBy !== user?.UserId && parsedData?.EnteredBy !== user?.OwnerID && (
                            <>
                                <View className="flex-1">
                                    <TouchableOpacity onPress={() => initializeChat(parsedData?.ID)}
                                        className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4" style={[styles.primary, styles.btnShadow]}>
                                        <Ionicons name="chatbubble-ellipses" size={24} color={Colors[colorScheme ?? 'light'].white} />
                                        <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold]}>Discussion</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                        {parsedData?.EnteredBy && user?.UserId !== parsedData?.EnteredBy && (
                            <View className="flex-1">
                                <TouchableOpacity onPress={() => { router.push({ pathname: "/pages/request-form", params: { id: parsedData.ID, item: JSON.stringify(parsedData) } }) }}
                                    className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4" style={[styles.danger, styles.btnShadow]}>
                                    <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].white} />
                                    <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold]}>Acheter</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                

                {parsedData?.Description && parsedData.Description.length > 1 && (
                    <View style={[styles.card, { padding: 0 }]}>
                        <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                            <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.xs }]}>Description</ThemedText>
                        </View>
                        <View style={[{ padding: 15 }]}>
                            <ThemedText style={[styles.text, { fontSize: FONT_SIZES.sm }]}>{parsedData?.Description}</ThemedText>
                        </View>
                    </View>
                )}

                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.xs }]}>Informations générales</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        {/* <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="calendar-number-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Numéro de plaque d'immatriculation</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.num_plaque}</ThemedText>
                            </View>
                        </View> */}
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <SimpleLineIcons name="badge" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Marque</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.make}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialCommunityIcons name="car" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Modèle complet</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.full_model}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialCommunityIcons name="car" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>modèle</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.Model}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                    <Ionicons name="document-text-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Version complète</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.full_version}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <FontAwesome6 name="clipboard" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Version</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.Version}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="analytics-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Phase</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.phase}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.xs }]}>Informations provenant du vendeur</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="warning-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Témoins d'alerte</ThemedText>
                                </View>
                            </View>
                            <View >
                                {parsedData?.Attributes?.voyant_moteur_ou_autres === true ? <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].danger} /> :
                                    <Feather name="circle" size={20} color={Colors[colorScheme ?? 'light'].light} />}
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="refresh-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Révision , Historique , Entretien</ThemedText>
                                </View>
                            </View>
                            <View>
                                {parsedData?.Attributes?.revisee_ou_historique === true ? <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].danger} /> :
                                    <Feather name="circle" size={20} color={Colors[colorScheme ?? 'light'].light} />}
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <FontAwesome5 name="wind" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Climatisation</ThemedText>
                                </View>
                            </View>
                            <View>
                                {parsedData?.Attributes?.climatisation === true ? <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].danger} /> :
                                    <Feather name="circle" size={20} color={Colors[colorScheme ?? 'light'].light} />}
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <FontAwesome6 name="car-side" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Bruit du train roulant ou autres ( AV / AR )</ThemedText>
                                </View>
                            </View>
                            <View>

                                {parsedData?.Attributes?.bruit_train_roulant_ou_autres === true ? <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].danger} /> :
                                    <Feather name="circle" size={20} color={Colors[colorScheme ?? 'light'].light} />}
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialIcons name="car-crash" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Accident</ThemedText>
                                </View>
                            </View>
                            <View>
                                {parsedData?.Attributes?.accident === true ? <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].danger} /> :
                                    <Feather name="circle" size={20} color={Colors[colorScheme ?? 'light'].light} />}

                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Entypo name="dots-three-horizontal" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Rayure ou impacte</ThemedText>
                                </View>
                            </View>
                            <View>
                                {parsedData?.Attributes?.rayure_ou_impacte === true ? <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].danger} /> :
                                    <Feather name="circle" size={20} color={Colors[colorScheme ?? 'light'].light} />}

                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="checkmark" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Contrôle technique</ThemedText>
                                </View>
                            </View>
                            <View>
                                {parsedData?.Attributes?.controle_technique === true ? <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].danger} /> :
                                    <Feather name="circle" size={20} color={Colors[colorScheme ?? 'light'].light} />}

                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="key-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Double des clés</ThemedText>
                                </View>
                            </View>
                            <View>
                                {parsedData?.Attributes?.double_des_cles === true ? <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].danger} /> :
                                    <Feather name="circle" size={20} color={Colors[colorScheme ?? 'light'].light} />}

                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialCommunityIcons name="car-wash" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Finition</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Finishing}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.danger]}>
                                        <MaterialCommunityIcons name="road-variant" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Kilométrage</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Mileage} KM</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.danger]}>
                                        <Ionicons name="receipt-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Type de taxe</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.TaxType}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-center gap-3 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.danger]}>
                                        <MaterialCommunityIcons name="car-estate" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Origine du véhicule</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.VehicleOrigion}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.xs }]}>Segment</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="car" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Type de véhicule</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.type}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialIcons name="electric-bolt" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Énergie</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.energy}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <FontAwesome5 name="slack-hash" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Code de boîte de vitesses</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.gearbox_code}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <FontAwesome5 name="slack-hash" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Code moteur TecDoc</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.tecdoc_engine_code}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="calendar-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Date de première immatriculation</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.FirstRegDate && parsedData?.Attributes?.FirstRegDate !== "0001-01-01T00:00:00" && formatDate(parsedData?.Attributes?.FirstRegDate)}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="calendar-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Date d'immatriculation SIV</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.LastRegDate && parsedData?.Attributes?.LastRegDate !== "0001-01-01T00:00:00" && formatDate(parsedData?.Attributes?.LastRegDate)}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.xs }]}>Moteur</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialCommunityIcons name="ev-station" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Cylindre (litres)</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.cylinder_in_litres}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialCommunityIcons name="water-pump" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Nombre de cylindres</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.nb_of_cylinders}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <FontAwesome5 name="code" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Code moteur</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.engine_code}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="settings-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Moteur de version</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.version_engine}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Feather name="box" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Capacité cubique</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.cubic_capacity}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="car" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Puissance (kW)</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.kw_power}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <FontAwesome5 name="arrows-alt-h" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Distribution</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.transmission_type}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="water-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>AdBlue</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.adblue}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.xs }]}>Injection</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="water-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Étiquette d'injection</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.injection_label}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="settings-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Nombre de vannes</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.nb_of_valves}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="power" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Puissance commerciale cheval</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.commercial_horsepower}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <FontAwesome5 name="wind" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Nombre de turbocompresseurs</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.nb_of_turbo}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialIcons name="filter-list-alt" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Filtre particulaire</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.particulate_filter}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="water-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Type d'injection</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.injection_type}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.xs }]}>Boite de vitesse</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="settings-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Type de boîte de vitesses</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.gearbox_type}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialCommunityIcons name="water-pump" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Nombre de vitesses</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.nb_of_gears}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
                <View className="mb-5" style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.xs }]}>Chassis</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        {/* <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="car" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>châssis</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.chassis}</ThemedText>
                            </View>
                        </View> */}
                        {/* <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <Ionicons name="barcode-outline" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>NUMÉRO DE SÉRIE</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end" >
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.vin}</ThemedText>
                            </View>
                        </View> */}
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialCommunityIcons name="door" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Nombre de portes</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.nb_of_doors}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1 w-[60%]">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <MaterialCommunityIcons name="ship-wheel" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Entraînement par roue</ThemedText>
                                </View>
                            </View>
                            <View className="flex-1 items-end">
                                <ThemedText style={[{ fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>{parsedData?.Attributes?.wheel_drive}</ThemedText>
                            </View>
                        </View>
                        {/* <View className="flex flex-row items-center mb-5 gap-3">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.lighter]}>
                                        <SimpleLineIcons name="directions" size={16} color={Colors[colorScheme ?? 'light'].light} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]}>Transmission intégrale</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]}>{parsedData?.Attributes?.version_wheel_drive}</ThemedText>
                            </View>
                        </View> */}
                    </View>
                </View>

            </View>
        </ScrollView>
    );
}
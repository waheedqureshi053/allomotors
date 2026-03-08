import { useGlobalStyles } from "@/app/_styles/globalStyle";
import { Entypo, Feather, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import {  useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomImageCarousal from "@/components/ImageSlider/CustomImageCarousal";
import { StyleSheet } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useSession } from "@/app/_services/ctx";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
export default function PackageScreen() {
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const { user } = useSession();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [Slides, setSlides] = React.useState<{ image: string }[]>([]);
    const { id, item } = useLocalSearchParams();
    //const [parsedData, setParsedData] = React.useState<any>(null);

    const parsedData = useMemo(() => {
        return typeof item === 'string' ? JSON.parse(decodeURIComponent(item)) : null;
    }, [item]);
    const data = [
        {
            image: require('../../../assets/img/login-car.png')
        },
        {
            image: require('../../../assets/img/login-car.png')
        },
        {
            image: require('../../../assets/img/login-car.png')
        },
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
    useEffect(() => {
        if (!parsedData) return;
        const baseURL = 'https://allomotors.fr/Content/WebData/UF/';
        const slideImages: { image: string }[] = [];
        if (parsedData?.PhotoURL)
            slideImages.push({ image: `${baseURL}${parsedData.PhotoURL}` });
        if (parsedData?.Attributes?.IconURL)
            slideImages.push({ image: `${baseURL}${parsedData.Attributes.IconURL}` });
        if (parsedData?.FrontLeftURL)
            slideImages.push({ image: `${baseURL}${parsedData.FrontLeftURL}` });
        if (parsedData?.RightRearURL)
            slideImages.push({ image: `${baseURL}${parsedData.RightRearURL}` });
        if (parsedData?.DriversIntURL)
            slideImages.push({ image: `${baseURL}${parsedData.DriversIntURL}` });
        if (parsedData?.PassengersIntURL)
            slideImages.push({ image: `${baseURL}${parsedData.PassengersIntURL}` });
        if (parsedData?.RightProfileURL)
            slideImages.push({ image: `${baseURL}${parsedData.RightProfileURL}` });
        if (parsedData?.LeftProfileURL)
            slideImages.push({ image: `${baseURL}${parsedData.LeftProfileURL}` });

        //setSlides(slideImages); // ✅ correctly update state
        //console.log(Slides);
        //console.log(parsedData);
    }, [parsedData]);

    return (
        <ScrollView className="flex-1"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={[styles.background]}
            contentContainerStyle={{ marginTop: insets.top }}>
            <View className="absolute top-5 left-5 z-10">
                <TouchableOpacity style={[styles.btnIcon, styles.btnShadow, styles.roundedCircle, styles.primary]}
                    onPress={() => { goBack() }}>
                    <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                </TouchableOpacity>
            </View>
            <View className="mb-20" style={[SliderStyles.container]}>
                {Slides && Slides.length > 0 && <CustomImageCarousal data={Slides} autoPlay={false} pagination={false} dotColor={Colors[colorScheme ?? 'light'].light} />}
            </View>
            <View className="flex-1 p-5">
                <View className="mb-5">
                    <View className="flex flex-wrap flex-row items-start gap-3 mb-5">
                        <View className="flex-1">
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>{parsedData?.Title}</ThemedText>
                            <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm }]}>{parsedData?.Description}</ThemedText>
                        </View>
                        <View>
                            <ThemedText style={[styles.colorDanger, styles.fontBold, { fontSize: 18, lineHeight: 18 }]}>{parsedData?.SellingPrice}€</ThemedText>
                        </View>
                    </View>
                    <View className="flex flex-wrap flex-row items-center mb-5 gap-2 flex-1">
                        <View className="rounded-md flex flex-row items-center gap-1 flex-1">
                            <MaterialCommunityIcons name="car-shift-pattern" size={20} color={Colors[colorScheme ?? 'light'].light} />
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light}>{parsedData?.Attributes?.gearbox_type || 'NA'}</ThemedText>
                        </View>
                        <View className="rounded-md flex flex-row items-center gap-1 flex-1">
                            <MaterialCommunityIcons name="ev-station" size={20} color={Colors[colorScheme ?? 'light'].light} />
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light} >{parsedData?.Attributes?.energy || 'NA'}</ThemedText>
                        </View>
                        <View className="rounded-md flex flex-row items-center gap-1 flex-1">
                            <Ionicons name="speedometer-outline" size={20} color={Colors[colorScheme ?? 'light'].light} />
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light}>{parsedData?.Mileage || 'NA'} KM</ThemedText>
                        </View>
                        <View className="rounded-md flex flex-row items-center gap-1" >
                            <Ionicons name="car-sport-outline" size={20} color={Colors[colorScheme ?? 'light'].light} />
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xs }]} lightColor={Colors[colorScheme ?? 'light'].light}>{parsedData?.Attributes?.commercial_horsepower || 'NA'}</ThemedText>
                        </View>
                    </View>
                    {user?.UserId !== parsedData?.EnteredBy && (
                        <View className="flex flex-row items-center justify-between gap-3">
                            <View className="flex-1">
                                <TouchableOpacity onPress={async () => { await router.push(`/chats/${parsedData?.EnteredBy}`) }}
                                    //     {
                                    //     pathname: "/pages/chat", params: { id: parsedData?.EnteredBy }
                                    // }
                                    className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4" style={[styles.primary]}>
                                    <Ionicons name="chatbubble-ellipses" size={24} color={Colors[colorScheme ?? 'light'].white} />
                                    <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold]}>Discussion</ThemedText>
                                </TouchableOpacity>
                            </View>
                            {/* <View className="flex-1">
                            <TouchableOpacity onPress={() => { }}
                                className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4" style={[styles.danger]}>
                                <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].white} />
                                <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold]}>Acteter</ThemedText>
                            </TouchableOpacity>
                        </View> */}
                        </View>
                    )}
                </View>

                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.md }]}>Informations générales</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="calendar-number-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Numéro de plaque d'immatriculation</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.voyant_moteur_ou_autres}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <SimpleLineIcons name="badge" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Marque</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.revisee_ou_historique}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialCommunityIcons name="car" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Modèle complet</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.climatisation}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialCommunityIcons name="car" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>modèle</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.bruit_train_roulant_ou_autres}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="document-text-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Version complète</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.accident}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <FontAwesome6 name="clipboard" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Version</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.accident}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="analytics-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Phase</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.accident}</ThemedText>
                            </View>
                        </View>

                    </View>
                </View>


                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.md }]}>Informations provenant du vendeur</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="warning-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Témoins d'alerte</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.voyant_moteur_ou_autres}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="refresh-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Révision , Historique , Entretien</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.revisee_ou_historique}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <FontAwesome5 name="wind" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Climatisation</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.climatisation}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <FontAwesome6 name="car-side" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Bruit du train roulant ou autres ( AV / AR )</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.bruit_train_roulant_ou_autres}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialIcons name="car-crash" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Accident</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.accident}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Entypo name="dots-three-horizontal" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Rayure ou impacte</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.rayure_ou_impacte}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="checkmark" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Contrôle technique</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.controle_technique}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="key-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Double des clés</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.double_des_cles}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialCommunityIcons name="car-wash" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Finition</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Finishing}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.danger]}>
                                        <MaterialCommunityIcons name="road-variant" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Kilométrage</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Mileage} KM</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.danger]}>
                                        <Ionicons name="receipt-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Type de taxe</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.TaxType}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.danger]}>
                                        <MaterialCommunityIcons name="car-estate" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Origine du véhicule</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.VehicleOrigion}</ThemedText>
                            </View>
                        </View>

                    </View>
                </View>


                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.md }]}>Segment</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="car" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Type de véhicule</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.voyant_moteur_ou_autres}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialIcons name="electric-bolt" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Énergie</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.revisee_ou_historique}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <FontAwesome5 name="slack-hash" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Code de boîte de vitesses</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.climatisation}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <FontAwesome5 name="slack-hash" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Code moteur TecDoc</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.bruit_train_roulant_ou_autres}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="calendar-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>First Registration Date</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.accident}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="calendar-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>SIV Registration Date</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.rayure_ou_impacte}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>


                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.md }]}>Moteur</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialCommunityIcons name="ev-station" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Cylindre (litres)</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.voyant_moteur_ou_autres}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialCommunityIcons name="water-pump" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Nombre de cylindres</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.revisee_ou_historique}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <FontAwesome5 name="code" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Code moteur</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.climatisation}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="settings-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Moteur de version</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.bruit_train_roulant_ou_autres}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Feather name="box" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Capacité cubique</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.accident}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="car" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Puissance (kW)</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.rayure_ou_impacte}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <FontAwesome5 name="arrows-alt-h" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Distribution</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.rayure_ou_impacte}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="water-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>AdBlue</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.rayure_ou_impacte}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.md }]}>Injection</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="water-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Étiquette d'injection</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.voyant_moteur_ou_autres}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="settings-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Nombre de vannes</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.revisee_ou_historique}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="power" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Puissance commerciale cheval</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.climatisation}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <FontAwesome5 name="wind" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Nombre de turbocompresseurs</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.bruit_train_roulant_ou_autres}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialIcons name="filter-list-alt" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Filtre particulaire</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.accident}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="water-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Type d'injection</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.rayure_ou_impacte}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.md }]}>Boite de vitesse</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="settings-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Type de boîte de vitesses</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.voyant_moteur_ou_autres}</ThemedText>
                            </View>
                        </View>

                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialCommunityIcons name="water-pump" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Nombre de vitesses</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.revisee_ou_historique}</ThemedText>
                            </View>
                        </View>


                    </View>
                </View>


                <View style={[styles.card, { padding: 0 }]}>
                    <View className="flex my-5 px-5 py-2 flex-1" style={[styles.danger, { width: "80%", borderTopRightRadius: 50, borderBottomRightRadius: 50 }]}>
                        <ThemedText style={[styles.fontBold, styles.colorWhite, { fontSize: FONT_SIZES.md }]}>Chassis</ThemedText>
                    </View>
                    <View style={[{ padding: 15 }]}>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="car" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>châssis</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.voyant_moteur_ou_autres}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <Ionicons name="barcode-outline" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>NUMÉRO DE SÉRIE</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.revisee_ou_historique}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialCommunityIcons name="door" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Nombre de portes</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.climatisation}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <MaterialCommunityIcons name="ship-wheel" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Entraînement par roue</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.bruit_train_roulant_ou_autres}</ThemedText>
                            </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                            <View className="flex flex-row items-start items-center gap-3 flex-1">
                                <View className="">
                                    <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                        <SimpleLineIcons name="directions" size={16} color={Colors[colorScheme ?? 'light'].white} />
                                    </View>
                                </View>
                                <View className="flex-1">
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>Transmission intégrale</ThemedText>
                                </View>
                            </View>
                            <View>
                                <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{parsedData?.Attributes?.accident}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>





            </View>
        </ScrollView>
    );
}
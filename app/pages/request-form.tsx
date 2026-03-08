import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { wrapAttributes } from "@/utils/attributes";
import { formatDecimal, formatNODecimal } from "@/utils/helperFunction";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as SignalR from '@microsoft/signalr';
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Switch } from "react-native-switch";
import { apiCall } from "../_services/api";
import { useSession } from "../_services/ctx";
import { useGlobalStyles } from "../_styles/globalStyle";

type DurationOption = {
  Percentage: number;
  Value: number;
};
export default function VehicleRequestScreen() {
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const params = useSearchParams();
    const id = params.get("id");
    const item = params.get("item");
    const parsedData = useMemo(() => {
        return typeof item === 'string' ? JSON.parse(item) : null;
    }, [item]);
    const { session, user, GetCompany, company, GetProfile, profile } = useSession();
    const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState<number>(0);
    const [TVAPrice, setTVAPrice] = useState<number>(0);
    const [isConfirm, setIsConfirm] = useState(false);
    const [durationOptions] = useState<DurationOption[]>([
        { Percentage: 0, Value: 30 },
        { Percentage: 0.02, Value: 60 },
    ]);
    const [RequestTypeOptions, setTaxTypeOptions] = useState([
        { value: "Request", label: "Demande" },
        { value: "Proposal", label: "Proposition" },
    ]);
    const InitialForm: any = { 
        AdvertID: Number(id),
        Disabled: false,
        BuyersCommission: 0,
        SellersCommission: 0,
        SellingPrice: 0,
        SellingPriceFinal: 0,
        CreditAmount: 0,
        CashAmount: 0,
        Duration: 30,
        DurationPercentage: 0.02,
        DurationAmount: 0,
        TotalAmount: 0,
        Remaining: 0,
        RequestType: "Request"
    };
    const [selectedDuration, setSelectedDuration] = useState<number>(30);
    const [formData, setFormData] = useState(InitialForm);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [PricePin, setPricePin] = useState<string>('');
    const [pricePinValidated, setPricePinValidated] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [IsPaymentButtonVisible, setIsPaymentButtonVisible] = useState(false);
    const validatePin = () => {
        const errors: { [key: string]: string } = {};
        if (!PricePin?.trim()) errors.PricePin = "Le code PIN est requis.";
        if (PricePin?.length !== 4) {
            errors.PricePinLength = "Le code PIN doit contenir exactement 4 chiffres.";
        }
        return errors;
    };
    const validatePricePin = () => {
        const validationErrors = validatePin();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        if (parsedData?.Attributes?.PricePin === PricePin) {
            setPricePinValidated(true);
            ///Alert.alert("Alright!", "Validation completed");
        } else {
            setPricePinValidated(false);
            Alert.alert("Oups !", "Échec de la validation");
        }
    };
    const validate = () => {
        const errors: { [key: string]: string } = {};
        //if (!formData.SellingPrice?.trim()) errors.SellingPrice = "Le Selling Price est requis.";
        if (!formData.SellingPrice) errors.SellingPrice = "Le prix de vente est requis.";
        return errors;
    };
    const validateForm = () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    };

    useFocusEffect(
        useCallback(() => {
            GetCompany();
        }, [])
    );
    useFocusEffect(
        useCallback(() => {
            LoadUserProfile();
            //LoadProfile(user?.UserId);
        }, [user])
    );

    useEffect(() => {
        formData.SellingPrice = parsedData?.SellingPrice || 0;
        ChangeDurationOption(formData.Duration);
        //console.log("parsedData?.Attributes?.SellingPrice:", parsedData?.SellingPrice || 0);
    }, [company, parsedData]);

    useEffect(() => {
        if (session?.token) {
            const newConnection = new SignalR.HubConnectionBuilder()
                .withUrl("https://api.allomotors.fr/realtimeHub", {
                    accessTokenFactory: () => session?.token ?? "",
                    transport: SignalR.HttpTransportType.WebSockets,
                })
                .withAutomaticReconnect()
                .configureLogging(SignalR.LogLevel.Information)
                .build();
            newConnection.on("UpdateUser", (dataObj) => {
                try {

                    LoadUserProfile();
                } catch (error) {
                    return;
                }
            });
            newConnection.onclose(async (error) => {
                //console.error("Connection closed:", error);
                setTimeout(async () => {
                    try {
                        await newConnection.start();
                        //console.log("Reconnected to SignalR!");
                    } catch (err) {
                        console.error("Reconnect failed:", err);
                    }
                }, 5000);
            });
            newConnection.start()
                .then(() => console.log("Connected to SignalR hub"))
                .catch((error) => console.log("Connection failed:", error));
            setConnection(newConnection);
            return () => {
                newConnection.stop();
            };
        }
    }, [session?.token]);
    const LoadUserProfile = async () => {
        await GetProfile(user?.UserId);
    }
    const LoadProfile = async (userId: any) => {
        if (userId) {
            setLoading(true);
            try {
                const response = await apiCall('get', `/Account/LoadProfile?userID=${userId}`, null, null);
                if (response.status == 200 || response.status == 204 || response.statusText == 'Ok') {
                    setCurrentUser(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }
    }
    const getCommission = (advert: any, dealer: string, companyAttributes: any): number => {
        try {
            //console.log("companyAttributes:", companyAttributes);
            const attributes = companyAttributes;
            const commission = parseFloat(attributes[`${dealer}Commission`]) || 0;
            const commissionType = attributes[`${dealer}CommissionType`];

            console.log("✅ formData?.SellingPrice:", formData?.SellingPrice);
            if (commissionType === "Percentage") {
                return (commission / 100) * Number(formData?.SellingPrice || 0);  //(advert?.Attributes?.SellingPrice || 0);
            }
            return commission;
        } catch (error) {
            console.error('Commission calculation error:', error);
            return 0;
        }
    };
    




   

    const calcAdvertRequest = (
        advert: any,
        duration: number,
        user: any,
        durationOptions: DurationOption[],
        companyAttributes: string,
        isConfirm: boolean,
        sellingPrice: number | string,
        requestType: string
    ): any => {

        const priceNum = Number(sellingPrice) || 0;

        const request: any = {
            AdvertID: Number(id),
            Disabled: isConfirm,
            BuyersCommission: 0,
            SellersCommission: 0,
            SellingPrice: priceNum,
            SellingPriceFinal: 0,
            Duration: duration,
            DurationPercentage: 0,
            DurationAmount: 0,
            CreditAmount: 0,
            CashAmount: 0,
            TotalAmount: 0,
            Remaining: 0,
            RequestType: requestType
        };

        // Commissions
        request.BuyersCommission = getCommission(advert, 'Buyers', companyAttributes);
        request.SellersCommission = getCommission(advert, 'Sellers', companyAttributes);

        request.SellingPriceFinal = priceNum + request.BuyersCommission;

        // Duration
        const durationOption = durationOptions.find(opt => opt.Value === duration);
        const userBalance = user?.ScanBalance || 0;

        request.CreditAmount = Math.min(userBalance, request.SellingPriceFinal);

        if (request.CreditAmount > 0) {
            request.DurationPercentage = durationOption?.Percentage || 0;
            request.DurationAmount = request.CreditAmount * request.DurationPercentage;
            request.SellingPriceFinal += request.DurationAmount;
        }

        // Cash / Credit balance
        if (request.SellingPriceFinal <= userBalance) {
            request.CreditAmount = request.SellingPriceFinal;
            request.CashAmount = 0;
        } else {
            request.CreditAmount = userBalance;
            request.CashAmount = request.SellingPriceFinal - userBalance;
        }

        request.TotalAmount = request.CreditAmount + request.CashAmount;
        request.Remaining = Math.max(0, request.SellingPriceFinal - request.TotalAmount);

        request.Disabled =
            request.Disabled ||
            request.CreditAmount > userBalance ||
            request.SellingPriceFinal !== request.TotalAmount;

        return request;
    };

    const ChangeDurationOption = (duration: number) => {
        setSelectedDuration(duration);

        const updatedForm = {
            ...formData,
            Duration: duration,
            // make sure SellingPrice stays correct
            SellingPrice:
                formData.RequestType === "Proposal"
                    ? formData.SellingPrice
                    : parsedData?.Attributes?.SellingPrice || 0
        };

        const AdvertRequest = calcAdvertRequest(
            parsedData,
            duration,
            profile,
            durationOptions,
            company?.Attributes!,
            isConfirm,
            updatedForm.SellingPrice,
            formData.RequestType // pass the most recent form values
        );

        setFormData(AdvertRequest);
    };
    const ChangeRequestType = (value: string) => {
        const isProposal = value === "Proposal";

        const updatedForm = {
            ...formData,
            RequestType: value,
            SellingPrice: isProposal
                ? formData.SellingPrice     // keep custom price
                : parsedData?.Attributes?.SellingPrice || 0
        };

        // Recalculate full AdvertRequest using updated values
        const recalculated = calcAdvertRequest(
            parsedData,
            selectedDuration,
            profile,
            durationOptions,
            company?.Attributes!,
            isConfirm,
            updatedForm.SellingPrice,
            value
        );

        setFormData(recalculated);
    };
    const CalcProposalAmount = (price: string) => {
        const finalPrice = formData.RequestType === "Proposal"
            ? price
            : parsedData?.Attributes?.SellingPrice || 0;

        const recalculated = calcAdvertRequest(
            parsedData,
            selectedDuration,
            profile,
            durationOptions,
            company?.Attributes!,
            isConfirm,
            finalPrice,
            formData.RequestType
        );

        setFormData(recalculated);
    };
    const handleFormSubmit = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            // Clone form data (avoid mutating state directly)
            let objData = { ...formData };

            // Reset duration fields if no credit
            if (objData.CreditAmount === 0) {
                objData.Duration = 0;
                objData.DurationAmount = 0;
                objData.DurationPercentage = 0;
            }

            // Wrap attributes as required by API
            const payload = wrapAttributes(objData, 'AdvertRequest');
            console.log('Request Payload:', payload);

            const response = await apiCall(
                'POST',
                '/Account/SaveRequest',
                null,
                payload
            );

            const result = response?.data;
            console.log('SaveRequest Response:', result);

            switch (result) {
                case 1:
                    setFormData(InitialForm);
                    Alert.alert('Demande envoyée', 'Votre demande a bien été envoyée');
                    router.push('/(tabs)/catalogs');
                    break;

                case 2:
                    Alert.alert(
                        'Solde insuffisant',
                        "Vous n'avez pas un solde suffisant pour demander cette annonce"
                    );
                    break;

                case 7:
                    Alert.alert(
                        'Déjà demandé',
                        'Vous avez déjà demandé cette annonce'
                    );
                    break;

                case 8:
                    Alert.alert(
                        'Déjà vendu',
                        'Cette annonce est déjà vendue'
                    );
                    break;

                default:
                    Alert.alert('Erreur', 'Quelque chose a mal tourné');
                    break;
            }

        } catch (error) {
            console.error('SaveRequest Error:', error);
            Alert.alert('Erreur', 'Une erreur s’est produite.');
        } finally {
            setLoading(false);
        }
    };

    // const handleFormSubmit = async () => {
    //     const validationErrors = validate();
    //     if (Object.keys(validationErrors).length > 0) {
    //         setErrors(validationErrors);
    //         return;
    //     }
    //     setLoading(true);
    //     try {
    //         let objData = formData;
    //         const token = await getAuthToken();
    //         if (formData.CreditAmount == 0) {
    //             objData.Duration = 0;
    //             objData.DurationAmount = 0;
    //             objData.DurationPercentage = 0;
    //         }
    //         let obj = wrapAttributes(objData, 'AdvertRequest');
    //         console.log(objData);
    //         const response = await fetch(`https://api.allomotors.fr/api/Account/SaveRequest`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: JSON.stringify(obj),
    //         });
    //         const data = await response.json();
    //         console.log(data);
    //         switch (data) {
    //             case 1:
    //                 setFormData(InitialForm);
    //                 Alert.alert('Demande envoyée', 'Votre demande a bien été envoyée');
    //                 router.push('/(tabs)/catalogs');
    //                 break;
    //             case 2:
    //                 Alert.alert('Solde insuffisant', `Vous n'avez pas un solde suffisant pour demander cette annonce`);
    //                 break;
    //             case 7:
    //                 Alert.alert('Déjà demandé', `Vous avez déjà demandé cette annonce`);
    //                 break;
    //             case 8:
    //                 Alert.alert('Déjà vendu', 'Cette annonce est déjà vendue');
    //                 break;
    //             default:
    //                 Alert.alert('Erreur', 'Quelque chose a mal tourné');
    //                 break;
    //         }

    //     } catch (error) {
    //         console.log(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const goBack = () => {
        navigation.goBack();
    };

    if (loading || !parsedData || !company || !profile) {
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
            contentContainerStyle={{ marginTop: insets.top }}>
            <View className="flex-1 p-5">
                <TouchableOpacity className="absolute top-5 left-5 z-10" style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
                    onPress={() => { goBack() }}>
                    <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                </TouchableOpacity>
                <View className="mb-5 flex items-center">
                    {/* <View className="flex flex-row items-center justify-center p-5" style={[styles.danger, styles.btnShadow, { width: 70, height: 70, borderRadius: 50 }]}> 
                        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5233/5233738.png' }} style={{ width: 50, height: 50 }} />
                    </View> */}
                    <View className="p-2 rounded-lg"
                        style={[styles.lighter]}
                    >
                        <View className='flex flex-row gap-0'>
                            {RequestTypeOptions != null && RequestTypeOptions.length > 0 && (
                                <>
                                    {RequestTypeOptions.map((item: any, index: number) => ( 
                                        <TouchableOpacity className='mb-0 p-2 text-center rounded-lg flex flex-row justify-center gap-0'
                                            style={[formData.RequestType === item?.value ? styles.danger : styles.lighter]}
                                            key={index}
                                            onPress={() => ChangeRequestType(item?.value)}>
                                            {formData.RequestType === item?.value && <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].white} />}
                                            <ThemedText type='default'
                                                style={[styles.fontBold, styles.textCenter]}
                                                lightColor={formData.RequestType === item?.value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}
                                                darkColor={formData.RequestType === item?.value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].white}
                                            > {item?.label} </ThemedText>

                                        </TouchableOpacity>
                                    ))}
                                </>
                            )
                            }
                        </View>

                    </View>
                </View>
                <View className="mb-5">
                    <ThemedText type="default" style={[styles.textCenter, styles.fontBold, { fontSize: FONT_SIZES.xxl, lineHeight: 30, marginBottom: 5 }]}>Confirmer la demande!!</ThemedText>
                    <ThemedText type="default"
                        style={[styles.textCenter, { fontSize: FONT_SIZES.xs, lineHeight: 15, color: Colors[colorScheme ?? 'light'].light }]}>
                        Vous pouvez sélectionner deux modes de paiement simultanément. Le montant choisi dans « Crédit » sera directement déduit de votre solde disponible. Attention : le solde sera complété en comptant.
                    </ThemedText>
                </View>
                <View style={[styles.card]}>
                    {parsedData?.Attributes?.HidePrice == true && pricePinValidated == false ? (
                        <>
                            <ThemedText type="subtitle" style={[styles.fontBold, styles.textCenter, { marginBottom: 20 }]}>Entrez le PIN pour voir le prix</ThemedText>
                            <ThemedText type="title" style={[styles.colorDanger, styles.fontBold, styles.textCenter]}> **** </ThemedText>
                            <View className="mb-4">
                                <ThemedText type="default" className="mb-2"> Entrer le code PIN</ThemedText>
                                <TextInput style={[styles.input]}
                                    placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                    underlineColorAndroid="transparent"
                                    placeholder="Code"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={() => { validatePricePin() }}
                                    secureTextEntry
                                    value={PricePin}
                                    onChangeText={(text) => setPricePin(text)} />
                                {errors.PricePin && <Text className="text-red-500">{errors.PricePin}</Text>}
                                {errors.PricePinLength && <Text className="text-red-500">{errors.PricePinLength}</Text>}
                                <View className="my-5">
                                    <TouchableOpacity onPress={() => { validatePricePin() }}
                                        className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4"
                                        style={[styles.primary]}>
                                        <Ionicons name="key" size={24} color={Colors[colorScheme ?? 'light'].white} />
                                        <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold]}>Valider</ThemedText>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </>
                    ) :
                        <>
                            {formData.RequestType === "Proposal" ? (
                                <View className="mb-4">
                                    <ThemedText type="default" className="mb-2">Prix *</ThemedText>
                                    <TextInput style={[styles.input]}
                                        placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                        underlineColorAndroid="transparent"
                                        placeholder="Prix"
                                        keyboardType="numeric"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onBlur={(e) => CalcProposalAmount(formData.SellingPrice.toString() ?? 0)}
                                        value={formData.SellingPrice.toString() ?? 0}
                                        onChangeText={(text) => CalcProposalAmount(text)} />
                                    {errors.SellingPrice && <Text className="text-red-500">{errors.SellingPrice}</Text>}
                                    <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}></ThemedText>
                                </View>
                            ) : (

                                <View className="flex flex-row items-center mb-5">
                                    <View className="flex flex-row items-center gap-3 flex-1 w-[60%]">
                                        <View className="">
                                            <View className="rounded-md flex items-center" style={[styles.btnIconSM, styles.primary]}>
                                                <FontAwesome name="euro" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                            </View>
                                        </View>
                                        <View className="flex-1">
                                            <ThemedText type="default" style={[styles.fontBold]}>Prix</ThemedText>
                                        </View>
                                    </View>
                                    <View className="flex-1 items-end">
                                        <ThemedText type="default" style={[styles.fontBold]}>{formatNODecimal(parsedData?.SellingPrice) || 0}€</ThemedText>
                                    </View>
                                </View>
                            )}
                            {/* <View className="flex flex-row items-center mb-5">
                                <View className="flex flex-row items-center gap-3 flex-1  w-[60%]">
                                    <View className="">
                                        <View className="rounded-md flex items-center" style={[styles.btnIconSM, styles.primary]}>
                                            <FontAwesome name="percent" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <ThemedText type="default" style={[styles.fontBold]}>Commission de acheteur</ThemedText>
                                    </View>
                                </View>
                                <View className="flex-1 items-end">
                                    <ThemedText type="default" style={[styles.fontBold]}>{formatDecimal(formData.BuyersCommission) || 0}€</ThemedText>
                                </View>
                            </View> */}

                            {/* {formData.DurationAmount > 0 && ( */}
                            <View className="flex flex-row items-center mb-5">
                                <View className="flex flex-row items-center gap-3 flex-1  w-[60%]">
                                    <View className="">
                                        <View className="rounded-md flex items-center" style={[styles.btnIconSM, styles.primary]}>
                                            <FontAwesome name="calendar" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <ThemedText type="default" style={[styles.fontBold]}>Pour {formData.Duration} jours</ThemedText>
                                        {/* <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Le Cout du plan selectionne</ThemedText> */}
                                    </View>
                                </View>
                                <View className="flex-1 items-end">
                                    <ThemedText type="default" style={[styles.fontBold]}>{formatDecimal(formData.DurationAmount) || 0}€</ThemedText>
                                </View>
                            </View>
                            {/*)}*/}
                            <View className="flex flex-row items-center mb-5">
                                <View className="flex flex-row items-center gap-3 flex-1  w-[60%]">
                                    <View className="">
                                        <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                            <Ionicons name="card" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <ThemedText type="default" style={[styles.fontBold]}>Montant comptant</ThemedText>
                                        {/* <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Nombre total de credits inclus</ThemedText> */}
                                    </View>
                                </View>
                                <View className="flex-1 items-end">
                                    <ThemedText type="default" style={[styles.fontBold]}>{formatDecimal(formData.CashAmount) || 0}€</ThemedText>
                                </View>
                            </View>
                            <View className="flex flex-row items-center mb-5">
                                <View className="flex flex-row items-center gap-3 flex-1 w-[60%]">
                                    <View className="">
                                        <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                            <FontAwesome name="euro" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <ThemedText type="default" style={[styles.fontBold]}>Montant crédit</ThemedText>
                                        {/* <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Taxe appliquee a votre achat</ThemedText> */}
                                    </View>
                                </View>
                                <View className="flex-1 items-end">
                                    <ThemedText type="default" style={[styles.fontBold,]}>{formatDecimal(formData.CreditAmount) || 0}€</ThemedText>
                                </View>
                            </View>
                            <View className="border-b border-gray-300 mb-5"></View>
                            <View className="flex flex-row items-center mb-5">
                                <View className="flex flex-row items-start gap-3 flex-1 w-[60%]">
                                    <View className="flex-1">
                                        <ThemedText type="default" style={[styles.fontBold,]}>Montant Total</ThemedText>
                                        <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.sm }]}>Montant final a payer</ThemedText>
                                    </View>
                                </View>
                                <View className="flex-1 items-end">
                                    <ThemedText type="default" style={[styles.fontBold, styles.colorDanger, { fontSize: FONT_SIZES.lg }]}>{formatDecimal(formData.SellingPriceFinal) || 0}€</ThemedText>
                                </View>
                            </View>
                            {formData.CreditAmount > 0 && (
                                <View>
                                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.sm, marginBottom: 5 }]}>Sélectionner la durée:</ThemedText>
                                    {durationOptions.map((item: any, index: number) => (
                                        <TouchableOpacity
                                            className="mb-5"
                                            style={[styles.button, selectedDuration === item?.Value ? styles.danger : styles.lighter]}
                                            key={index}
                                            onPress={() => { ChangeDurationOption(item?.Value) }}>
                                            <ThemedText type='default'
                                                lightColor={selectedDuration === item?.Value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}
                                                darkColor={selectedDuration === item?.Value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}>
                                                {`${item.Value} jours (${item.Percentage * 100}%)`}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            <View className="flex flex-row items-center gap-2 mb-5">
                                <View className="flex-1">
                                    <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Je suis d'accord avec la composition du paiement telle que spécifiée ci-dessus.</ThemedText>
                                </View>
                                <View>
                                    <Switch
                                        value={isConfirm}
                                        onValueChange={(val) => setIsConfirm(val)} // console.log(val)}
                                        //disabled={false}
                                        activeText={'Yes'}
                                        inActiveText={'No'}
                                        circleSize={30}
                                        barHeight={30}
                                        circleBorderWidth={0}
                                        backgroundActive={Colors[colorScheme ?? 'light'].success}
                                        backgroundInactive={Colors[colorScheme ?? 'light'].light}
                                        circleActiveColor={Colors[colorScheme ?? 'light'].light}
                                        circleInActiveColor={Colors[colorScheme ?? 'light'].success}
                                        //renderInsideCircle={() => <CustomComponent />} // custom component to render inside the Switch circle (Text, Image, etc.)
                                        changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                                        innerCircleStyle={{ alignItems: "center", justifyContent: "center" }} // style for inner animated circle for what you (may) be rendering inside the circle
                                        //outerCircleStyle={{}} // style for outer animated circle
                                        renderActiveText={isConfirm}
                                        renderInActiveText={isConfirm === false}
                                        switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                        switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                        switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                        switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                    />
                                </View>
                            </View>
                            <View className="flex-1 mb-5">
                                <TouchableOpacity onPress={() => { handleFormSubmit() }} disabled={isConfirm === false}
                                    className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4" style={[isConfirm ? styles.success : styles.light]}>
                                    <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].white} />
                                    <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold]}>Confirmer</ThemedText>
                                </TouchableOpacity>
                            </View>
                            <ThemedText type="default" style={[styles.textCenter, { fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>La demande sera envoyée au propriétaire de l'annonce pour approbation.</ThemedText>
                        </>}
                </View>
            </View>
        </ScrollView>
    );
}
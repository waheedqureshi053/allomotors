import { ActivityIndicator, Button, Image, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { useGlobalStyles } from "../_styles/globalStyle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useMemo, useState } from "react"; 
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Switch } from "react-native-switch";
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from "../_services/uploadService";
import { useSession } from "../_services/ctx";
import { wrapAttributes } from "@/utils/attributes";
import { Alert } from "react-native";
import { getAuthToken } from "../_services/apiConfig";
import { apiCall } from "../_services/api";
import { getCommission } from "@/utils/helperFunction";
import { Picker } from '@react-native-picker/picker';
import { useSearchParams } from "expo-router/build/hooks"; 
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

interface SearchObj {
    [key: string]: any;
}

interface CategoryItem {
    InfoType: string;
    [key: string]: any;
}

interface InfoTypeItem {
    Title: string;
}
type InfoTypesData = {
    [key: string]: CategoryItem[];
};


export default function NewAdvertScreen() {
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const insets = useSafeAreaInsets();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [isVisibleSaleAreaPicker, setIsVisibleSaleAreaPicker] = useState(false);
    const [isVisibleVehicleOriginPicker, setIsVisibleVehicleOriginPicker] = useState(false);
    const { session, user, company, profile, GetProfile } = useSession();
    const [allCategoriesList, setAllCategoriesList] = useState<CategoryItem[]>([]);
    const [infoTypesData, setInfoTypesData] = useState<InfoTypesData>({});
    const [VehicleOrigionOptions, setVehicleOrigionOptions] = useState<any>([]);
    const [SaleAreaOptions, setSaleAreaOptions] = useState<any>([]);
    const [infoTypes, setInfoTypes] = useState<any>([{ Title: "Main", IsChecked: false }, { Title: "AdvertTypes", IsChecked: false }, { Title: "Brands", IsChecked: false }, { Title: "Models", IsChecked: false }, { Title: "Finishings", IsChecked: false }, { Title: "Versions", IsChecked: false }, { Title: "Fuels", IsChecked: false }, { Title: "Gearboxes", IsChecked: false }, { Title: "VehicleTypes", IsChecked: false }, { Title: "NumberOfDoors", IsChecked: false }, { Title: "NumberOfPlaces", IsChecked: false }, { Title: "Permits", IsChecked: false }, { Title: "Colors", IsChecked: false }, { Title: "Equipment", IsChecked: false }, { Title: "Features", IsChecked: false }, { Title: "VehicleConditions", IsChecked: false }, { Title: "AirBags", IsChecked: false }, { Title: "EmissionClasses", IsChecked: false }, { Title: "SparePartsDurations", IsChecked: false }, { Title: "Sellerie", IsChecked: false }, { Title: "VehicleOrigion", IsChecked: false }, { Title: "SaleArea", IsChecked: false }]);
    const PathURL = 'https://allomotors.fr/Content/WebData/UF/';
    const params = useSearchParams();
    const id = params.get("id");
    const item = params.get("item");
    let AdvertData = {};
    const parsedData: any = useMemo(() => {
        //AdvertData = expandAttributes(item!,AdvertData, 'Advert');
        return typeof item === 'string' ? JSON.parse(item) : null;
    }, [item]);

    const steps = [
        { id: 1, name: "Véhicule" },
        { id: 2, name: "Options" },
        { id: 3, name: "Prix" },
        { id: 3, name: "Fichiers" },
    ];
    const [step, setStep] = useState(1);
    const initialFormData = {
        ID: parsedData.ID ? parsedData.ID : 0,
        CarPlateNum: parsedData.CarPlateNum ? parsedData.CarPlateNum : '',
        Title: parsedData.Title ? parsedData.Title : '',
        SaleArea: parsedData?.Attributes?.SaleArea ? parsedData?.Attributes?.SaleArea : '',
        Finishing: parsedData.Finishing ? parsedData.Finishing : '',
        Mileage: parsedData?.Mileage ? parsedData?.Mileage : '0',
        VehicleOrigion: parsedData?.Attributes?.VehicleOrigion ? parsedData?.Attributes?.VehicleOrigion : '',
        TaxType: parsedData?.Attributes?.TaxType ? parsedData?.Attributes?.TaxType : '8.5',
        Description: parsedData.Description ? parsedData.Description : '',
        SellingPrice: parsedData?.Attributes?.SellingPrice ? parsedData?.Attributes?.SellingPrice : '',
        SellingPriceFinal: parsedData?.Attributes?.SellingPriceFinal ? parsedData?.Attributes?.SellingPriceFinal : 0,
        BuyersCommission: parsedData?.Attributes?.BuyersCommission ? parsedData?.Attributes?.BuyersCommission : 0,
        HidePrice: parsedData?.Attributes?.HidePrice ? parsedData?.Attributes?.HidePrice : false,
        PricePin: parsedData?.Attributes?.PricePin ? parsedData?.Attributes?.PricePin : '',
        SellerPhone: parsedData?.Attributes?.SellerPhone ? parsedData?.Attributes?.SellerPhone : '',
        //Status: 'Pro',
        voyant_moteur_ou_autres: parsedData?.Attributes?.voyant_moteur_ou_autres ? parsedData?.Attributes?.voyant_moteur_ou_autres : false,
        revisee_ou_historique: parsedData?.Attributes?.revisee_ou_historique ? parsedData?.Attributes?.revisee_ou_historique : false,
        climatisation: parsedData?.Attributes?.climatisation ? parsedData?.Attributes?.climatisation : false,
        bruit_train_roulant_ou_autres: parsedData?.Attributes?.bruit_train_roulant_ou_autres ? parsedData?.Attributes?.bruit_train_roulant_ou_autres : false,
        accident: parsedData?.Attributes?.accident ? parsedData?.Attributes?.accident : false,
        rayure_ou_impacte: parsedData?.Attributes?.rayure_ou_impacte ? parsedData?.Attributes?.rayure_ou_impacte : false,
        controle_technique: parsedData?.Attributes?.controle_technique ? parsedData?.Attributes?.controle_technique : false,
        double_des_cles: parsedData?.Attributes?.double_des_cles ? parsedData?.Attributes?.double_des_cles : false,
        IconURL: parsedData?.Attributes?.IconURL ? parsedData?.Attributes?.IconURL : null,
        FrontLeftURL: parsedData.FrontLeftURL ? parsedData.FrontLeftURL : null,
        RightRearURL: parsedData.RightRearURL ? parsedData.RightRearURL : null,
        DriversIntURL: parsedData.DriversIntURL ? parsedData.DriversIntURL : null,
        PassengersIntURL: parsedData.PassengersIntURL ? parsedData.PassengersIntURL : null,
        RightProfileURL: parsedData.RightProfileURL ? parsedData.RightProfileURL : null,
        LeftProfileURL: parsedData.LeftProfileURL ? parsedData.LeftProfileURL : null,
        tblFiles: parsedData.tblFiles.length > 0 ? parsedData.tblFiles : [],
        CategoryID: parsedData.CategoryID ? parsedData.CategoryID : 3,
        Category: parsedData.Category ? parsedData.Category : "Convertible",
        Advert: parsedData.Advert ? parsedData.Advert : "Convertible",
        progress: parsedData.progress ? parsedData.progress : 0,
        IsLoading: parsedData.IsLoading ? parsedData.IsLoading : true,
        IsPublic: parsedData.IsPublic ? parsedData.IsPublic : false,
        AttributesArray: parsedData.AttributesArray ? parsedData.AttributesArray : [],
        AdvertType: parsedData.AdvertType ? parsedData.AdvertType : "Car",
        HasApiMeta: parsedData.HasApiMeta ? parsedData.HasApiMeta : false,
        Status: parsedData?.Status
    };
    const [formData, setFormData] = useState(initialFormData);
    const handleNextStep = () => {
        const validationErrors = validate();
        if (validationErrors && Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setLoading(false);
            return;
        }
        else {
            setErrors({});
        }
        setStep(step + 1);
    };
    const handlePreviousStep = () => {
        setStep(step - 1);
    }
    const [statusOptions, SetStatusOptions] = useState([
        { id: true, name: "Public" },
        { id: false, name: "Pro" },
    ]);
    const [TaxTypeOptions, setTaxTypeOptions] = useState([
        { id: "0", name: "0" },
        { id: "8.5", name: "8.5" },
    ]);
    const goBack = () => {
        router.back();
    };
    const validate = () => {
        const errors: { [key: string]: string } = {};

        if (step === 1) {
            // if (!formData.CarPlateNum?.trim()) errors.CarPlateNum = "Le numéro de plaque est requis.";
            if (!formData.Title?.trim()) errors.Title = "Le titre est requis.";
            if (!formData.Mileage) errors.Mileage = "Le kilométrage est requis.";
        }
        else if (step === 2) {
            // Add validations here if needed
        }
        else if (step === 3) {
            if (!formData.SellingPrice?.trim()) errors.SellingPrice = "Le prix de vente est requis.";

            if (formData.HidePrice) {
                if (!formData.PricePin?.trim())
                    errors.PricePin = "Le code PIN du prix est requis.";
                if (formData.PricePin.length !== 4) {
                    errors.PricePinLength = "Le code PIN doit contenir exactement 4 chiffres.";
                }
            }
        }
        else if (step === 4) {
            // if (!formData.SellerPhone?.trim()) errors.SellerPhone = "Le numéro de téléphone du vendeur est requis.";
        }
        else {
            // No validation
        }

        return errors;
    };

    const handleFormSubmit = async () => {
        setLoading(true);
        try {
            //console.log(formData);
            let objData = formData;

            console.log(allCategoriesList[0]?.Title);
            console.log(allCategoriesList[0]?.ID);
            objData.Advert = allCategoriesList[0]?.Title;
            objData.CategoryID = allCategoriesList[0].ID;
            const category = allCategoriesList.find(s => s.ID === objData.CategoryID);
            if (category)
                objData.Category = category.Title;
            const token = await getAuthToken();
            objData.BuyersCommission = getCommission(formData, 'Buyers', company?.Attributes!);
            objData.SellingPriceFinal = Number(formData.SellingPrice) + objData.BuyersCommission;
            objData.ID = parsedData.ID;
            let obj = wrapAttributes(objData, 'Advert');
            console.log(objData);
            const response = await fetch(`https://api.allomotors.fr/api/Account/SaveAdvert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(obj),
            });
            const data = await response.json();
            //console.log(data);
            switch (data.statusCode) {
                case 1:
                    setFormData(initialFormData);
                    setStep(1);
                    router.push('/pages/client-adverts');
                    //updateUser('QRCode');
                    break;
                case 2:
                    Alert.alert('Info', `Les informations de l'annonce ont été mises à jour`);
                    //router.navigate('/(tabs)/setting');
                    break;
                case 3:
                    Alert.alert('Info', 'Annonce déjà ajoutée');
                    break;
                case 4:
                    Alert.alert('Avertissement', `Le solde de l'annonce a expiré`);
                    break;
                default:
                    Alert.alert('Erreur', 'Quelque chose a mal tourné');
                    break;
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    const fetchCategories = async () => {
        try {
            const token = await getAuthToken();
            const response = await fetch('https://api.allomotors.fr/api/Account/LoadSimpleCategorysList', {
                method: 'POST',
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            const data = await response.json();
            if (data.statusCode == 1) {
                // const jData: CategoryItem[] = await response.json();
                const jData: any = await data?.data;
                setAllCategoriesList(jData);

                const newInfoTypesData: InfoTypesData = {};
                infoTypes.forEach((listItem: any) => {
                    newInfoTypesData[`InfoTypes_${listItem.Title}`] = jData.filter(
                        (s: any) => s.InfoType === listItem.Title
                    );
                });

                setInfoTypesData(newInfoTypesData);
                setVehicleOrigionOptions(newInfoTypesData?.InfoTypes_VehicleOrigion);
                setSaleAreaOptions(newInfoTypesData?.InfoTypes_SaleArea);
                // console.log("newInfoTypesData", newInfoTypesData);
                // console.log("VehicleOrigionOptions", VehicleOrigionOptions);
            }
        } catch (err: any) {
            console.log(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };
    const getCarMeta = async (carId: any) => {
        try {
            setLoading(true);
            const response = await fetch(`https://api.allomotors.fr/api/Account/GetCarMeta/${carId}`, {
                method: 'POST',
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json', // Optional, depending on backend requirements
                },
                body: '', // Empty body as in your curl request
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ Car Meta Data:', data);

            let FabData = await mergeObjects(formData, data?.fabdata);
            setFormData(previousObject => ({
                ...previousObject,
                ...FabData
            }));
            setFormData((prev) => ({
                ...prev,
                HasApiMeta: true,
                Title: data?.fabdata?.make + " " + data?.fabdata?.full_model,
                FirstRegDate: data?.siv.b4_date_prem_immat,
                LastRegDate: data?.siv.b4_date_immat_siv,
            }))
            console.log("After merge Advert", formData);
        } catch (error) {
            setFormData((prev) => ({
                ...prev,
                HasApiMeta: false
            }))
            console.error('Error fetching car meta:', error);
            //throw error;
        } finally {
            setLoading(false);
        }
    }
    const mergeObjects = async (targetObj: any, sourceObj: any) => {
        Object.keys(sourceObj).forEach((key) => {
            targetObj[key] = sourceObj[key];
        });
        return targetObj;
    }
    useFocusEffect(
        React.useCallback(() => {
            ///console.log("testing Value ", parsedData?.Mileage)
            fetchCategories();
        }, [])
    );
    useEffect(() => {
        LoadProfile(user?.UserId);
        if (formData.CarPlateNum && formData.CarPlateNum.length > 0)
            getCarMeta(formData.CarPlateNum);
    }, [user, formData.CarPlateNum]);
    const DeleteFile = async (data: any, index: number) => {
        setFormData((prev) => ({
            ...prev,
            tblFiles: prev.tblFiles.filter((_: any, i: any) => i !== index),
        }));
    };
    const pickAndUploadImage = async (formDataKey: string) => {
        //setIsUploadButton(false);
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            //setIsUploadButton(true);
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });
        if (result.canceled) {
            //setIsUploadButton(true);
            return;
        }
        const photoUri = result.assets[0].uri;
        if (!result.canceled) {
            const obj = { height: 200, width: 200, folder: 'UF' }; // Example object
            try {
                setLoading(true);
                const response = await uploadFile(photoUri, obj.folder, session?.token ?? ''); // Ensure 'token' is the correct property name
                //console.log(response);
                setFormData((prev: any) => ({
                    ...prev,
                    [formDataKey]: response.FileName
                }));
                setLoading(false);
                //setIsUploadButton(true);
            } catch (error) {
                console.log(error);
                Alert.alert('Erreur', 'Échec du téléchargement de la photo');
                setLoading(false);
            } finally {
                //setIsUploadButton(true);
                setLoading(false);
            }
        }
    };
    const UploadMutipleImages = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission requise',
                    `AlloMotors a besoin d'accéder à votre bibliothèque multimédia pour télécharger les documents et images du véhicule.`,
                    [{ text: `D'accord`, onPress: () => console.log('Permission denied') }]
                );
                return;
            }
            // if (!permissionResult.granted) {
            //     console.warn("Permission denied");
            //     return;
            // }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All, // Supports both images and files
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (result.canceled || !result.assets.length) {
                console.warn("No file selected");
                return;
            }

            setLoading(true);

            const uploadedAttachments = await Promise.all(
                result.assets.map(async (file) => {
                    return await uploadFile(file.uri, "UF", session?.token ?? "");
                })
            );

            console.log(uploadedAttachments);
            setFormData((prev: any) => ({
                ...prev,
                tblFiles: [...prev.tblFiles, ...uploadedAttachments],
            }));
        } catch (error) {
            console.error("Upload Failed:", error);
        } finally {
            setLoading(false);
        }
    };
    const LoadProfile = async (userId: any) => {
        if (userId) {
            setLoading(true);
            try {
                const response = await apiCall('get', `/Account/LoadProfile?userID=${userId}`, null, null);
                if (response.status == 200 || response.status == 204 || response.statusText == 'Ok') {

                    setFormData({ ...formData, SellerPhone: response.data.Phone });
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }
    }
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View className="mb-5">
                        <ThemedText type="default" className="mb-2">Publique ou Professionel</ThemedText>
                        <View className='flex flex-row flex-wrap items-center gap-2 mb-2'>
                            {statusOptions.map((item: any, index: number) => (
                                <TouchableOpacity
                                    style={[styles.button, formData.IsPublic === item?.id ? styles.primary : styles.lighter]}
                                    key={index}
                                    onPress={() => setFormData({ ...formData, IsPublic: item?.id })}>
                                    <ThemedText type='default' lightColor={formData.IsPublic === item?.id ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light} darkColor={formData.IsPublic === item?.id ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}> {item?.name} </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Numéro de plaque d'immatriculation *</ThemedText>
                            <View className="relative">
                                <TextInput style={[styles.input]}
                                    placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                    underlineColorAndroid="transparent"
                                    placeholder="Numéro de plaque d'immatriculation"
                                    value={formData.CarPlateNum}
                                    onChangeText={(text) => setFormData({ ...formData, CarPlateNum: text })} />
                                {/* <Ionicons name="search" size={24} color="gray" className='absolute top-3 left-3' /> */}
                                <TouchableOpacity disabled={loading} onPress={() => { getCarMeta(formData.CarPlateNum) }} style={[styles.primary]} className='p-2 rounded-lg absolute top-2 right-3'>
                                    {loading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="search" size={18} color="white" />}
                                </TouchableOpacity>
                            </View>
                            {errors.CarPlateNum && <Text className="text-red-500">{errors.CarPlateNum}</Text>}
                            {formData.HasApiMeta && <ThemedText type="default" style={[styles.colorSuccess, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Recherche rencontrée avec méta</ThemedText>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Insérer la plaque d'immatriculation.</ThemedText>
                        </View>
                        {/* <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Titre de l'annonce *</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Titre"
                                value={formData.Title}
                                onChangeText={(text) => setFormData({ ...formData, Title: text })} />
                            {errors.Title && <Text className="text-red-500">{errors.Title}</Text>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Insérer le titre de l'annonce</ThemedText>
                        </View> */}
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Sélectionnez Zone de vente</ThemedText>
                            <View style={styles.pickerContainer}>
                                {Platform.OS === 'ios' ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => setIsVisibleSaleAreaPicker(true)}
                                            style={{
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                                borderRadius: 8,
                                                paddingVertical: 12,
                                                paddingHorizontal: 12,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ color: formData.SaleArea ? Colors[colorScheme ?? 'light'].text : '#9EA0A4', fontSize: 16 }}>
                                                {formData.SaleArea || '--- Sélectionner ---'}
                                            </Text>
                                            <Text style={{ fontSize: 16, color: Colors[colorScheme ?? 'light'].light }}>▼</Text>
                                        </TouchableOpacity>

                                        <Modal visible={isVisibleSaleAreaPicker} animationType="slide" transparent>
                                            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                                <View style={{ backgroundColor: '#DDD', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10, }}>
                                                        <Button title="Done" onPress={() => setIsVisibleSaleAreaPicker(false)} />
                                                    </View>
                                                    <Picker
                                                        selectedValue={formData.SaleArea}
                                                        onValueChange={(itemValue) =>
                                                            setFormData({ ...formData, SaleArea: itemValue })
                                                        }
                                                    >
                                                        <Picker.Item label="--- Sélectionner ---" value={''} key={null} />
                                                        {SaleAreaOptions.map((item: any) => (
                                                            <Picker.Item color="black" key={item.Title} label={item.Title} value={item.Title} />
                                                        ))}
                                                    </Picker>
                                                </View>
                                            </View>
                                        </Modal>
                                    </>
                                ) : (
                                    <View style={{
                                        borderWidth: 1,
                                        borderColor: '#ccc',
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                    }}>
                                        <Picker className="rounded-md"
                                            mode="dialog"
                                            selectedValue={formData.SaleArea}
                                            onValueChange={(itemValue, itemIndex) => setFormData({ ...formData, SaleArea: itemValue })}
                                            dropdownIconColor={Colors[colorScheme ?? 'light'].light}
                                            style={styles.picker}>
                                            <Picker.Item color="black" label="--- Sélectionner ---" value={''} key={null} />
                                            {SaleAreaOptions.map((item: any) => (
                                                <Picker.Item color="black" key={item.Title} label={item.Title} value={item.Title} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                                {errors.SaleArea && <Text className="text-red-500">{errors.SaleArea}</Text>}
                                {/* {errors.categoryId && <Text style={[styles.colorError]}>{errors.categoryId} Zone de vente </Text>} */}
                            </View>
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Finition</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Finition"
                                value={formData.Finishing}
                                onChangeText={(text) => setFormData({ ...formData, Finishing: text })} />
                            {errors.Finishing && <Text className="text-red-500">{errors.Finishing}</Text>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Précisez la finition du véhicule (GT Line, S Line,...)</ThemedText>
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Kilométrage *</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Enter le kilométrage"
                                keyboardType="numeric"
                                value={String(formData.Mileage)}
                                //value={formData.Mileage}
                                onChangeText={(text) => setFormData({ ...formData, Mileage: text })} />
                            {errors.Mileage && <Text className="text-red-500">{errors.Mileage}</Text>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Insérer le kilométrage du véhicule en kilomètres.</ThemedText>
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Sélectionnez Origine du véhicule</ThemedText>
                            <View style={styles.pickerContainer}>
                                {Platform.OS === 'ios' ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => setIsVisibleVehicleOriginPicker(true)}
                                            style={{
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                                borderRadius: 8,
                                                paddingVertical: 12,
                                                paddingHorizontal: 12,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ color: formData.VehicleOrigion ? Colors[colorScheme ?? 'light'].text : '#9EA0A4', fontSize: 16 }}>
                                                {formData.VehicleOrigion || '--- Sélectionner ---'}
                                            </Text>
                                            <Text style={{ fontSize: 16, color: Colors[colorScheme ?? 'light'].light }}>▼</Text>
                                        </TouchableOpacity>

                                        <Modal visible={isVisibleVehicleOriginPicker} animationType="slide" transparent>
                                            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                                <View style={{ backgroundColor: '#DDD', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10, }}>
                                                        <Button title="Done" onPress={() => setIsVisibleVehicleOriginPicker(false)} />
                                                    </View>
                                                    <Picker
                                                        selectedValue={formData.VehicleOrigion}
                                                        onValueChange={(itemValue) =>
                                                            setFormData({ ...formData, VehicleOrigion: itemValue })
                                                        }
                                                    >
                                                        <Picker.Item color="black" label="--- Sélectionner ---" value={''} key={null} />
                                                        {VehicleOrigionOptions.map((item: any) => (
                                                            <Picker.Item color="black" key={item.Title} label={item.Title} value={item.Title} />
                                                        ))}
                                                    </Picker>
                                                </View>
                                            </View>
                                        </Modal>
                                    </>
                                ) : (
                                    <View style={{
                                        borderWidth: 1,
                                        borderColor: '#ccc',
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                    }}>
                                        <Picker className="rounded-md"
                                            selectedValue={formData.VehicleOrigion}
                                            onValueChange={(itemValue, itemIndex) => setFormData({ ...formData, VehicleOrigion: itemValue })}
                                            dropdownIconColor={Colors[colorScheme ?? 'light'].light}
                                            style={styles.picker}>
                                            <Picker.Item label="--- Sélectionner ---" value={null} key={null} />
                                            {VehicleOrigionOptions.map((item: any) => (
                                                <Picker.Item key={item.Title} label={item.Title} value={item.Title} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                                {errors.VehicleOrigion && <Text className="text-red-500">{errors.VehicleOrigion}</Text>}
                                {/* {errors.categoryId && <Text style={[styles.colorError]}>{errors.categoryId} Zone de vente </Text>} */}
                            </View>
                        </View>
                        {/* <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Origine du véhicule</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Origine du véhicule"
                                value={formData.VehicleOrigion}
                                onChangeText={(text) => setFormData({ ...formData, VehicleOrigion: text })} />
                            {errors.VehicleOrigion && <Text className="text-red-500">{errors.VehicleOrigion}</Text>}
                        </View> */}
                        <TouchableOpacity className="py-4 mb-5" onPress={handleNextStep}
                            disabled={loading}
                            style={[styles.button, styles.primary, loading && styles.danger]} >
                            {loading ? (<ActivityIndicator size="small" color='white' />) : (
                                <ThemedText type="default" lightColor="#fff" darkColor="#fff"
                                    className="text-white font-bold text-center">Procéder</ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
                );
            case 2:
                return (
                    <View>
                        <View className="flex flex-row items-center gap-2" style={[styles.card]}>
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Témoins d'alerte</ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Indique si le voyant d'alerte du moteur ou d'autres alertes sont actifs.</ThemedText>
                            </View>
                            <View>
                                <Switch
                                    value={formData.voyant_moteur_ou_autres}
                                    onValueChange={(val) => setFormData({ ...formData, voyant_moteur_ou_autres: val })} // console.log(val)}
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
                                    renderActiveText={formData.voyant_moteur_ou_autres}
                                    renderInActiveText={formData.voyant_moteur_ou_autres === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>
                        <View className="flex flex-row items-center gap-2" style={[styles.card]}>
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Révision , Historique , Entretie</ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Indique si le véhicule est entretenu ou a un historique documenté</ThemedText>
                            </View>
                            <View>
                                <Switch
                                    value={formData.revisee_ou_historique}
                                    onValueChange={(val) => setFormData({ ...formData, revisee_ou_historique: val })} // console.log(val)}
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
                                    renderActiveText={formData.revisee_ou_historique}
                                    renderInActiveText={formData.revisee_ou_historique === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>
                        <View className="flex flex-row items-center gap-2" style={[styles.card]}>
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Climatisation</ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Précise si le système de climatisation est fonctionnel</ThemedText>
                            </View>
                            <View>
                                <Switch
                                    value={formData.climatisation}
                                    onValueChange={(val) => setFormData({ ...formData, climatisation: val })} // console.log(val)}
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
                                    renderActiveText={formData.climatisation}
                                    renderInActiveText={formData.climatisation === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>
                        <View className="flex flex-row items-center gap-2" style={[styles.card]}>
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Bruit du train roulant ou autres ( AV / AR )</ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Indique la présence de bruit provenant du châssis ou d'autres composants</ThemedText>
                            </View>
                            <View>
                                <Switch
                                    value={formData.bruit_train_roulant_ou_autres}
                                    onValueChange={(val) => setFormData({ ...formData, bruit_train_roulant_ou_autres: val })} // console.log(val)}
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
                                    renderActiveText={formData.bruit_train_roulant_ou_autres}
                                    renderInActiveText={formData.bruit_train_roulant_ou_autres === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>
                        <View className="flex flex-row items-center gap-2" style={[styles.card]}>
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Accident</ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Indique si le véhicule a été impliqué dans un accident</ThemedText>
                            </View>
                            <View>
                                <Switch
                                    value={formData.accident}
                                    onValueChange={(val) => setFormData({ ...formData, accident: val })} // console.log(val)}
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
                                    renderActiveText={formData.accident}
                                    renderInActiveText={formData.accident === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>
                        <View className="flex flex-row items-center gap-2" style={[styles.card]}>
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Rayure ou impacte</ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Précise s'il y a des rayures ou des impacts sur le véhicule</ThemedText>
                            </View>
                            <View>
                                <Switch
                                    value={formData.rayure_ou_impacte}
                                    onValueChange={(val) => setFormData({ ...formData, rayure_ou_impacte: val })} // console.log(val)}
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
                                    renderActiveText={formData.rayure_ou_impacte}
                                    renderInActiveText={formData.rayure_ou_impacte === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>
                        <View className="flex flex-row items-center gap-2" style={[styles.card]}>
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Contrôle technique</ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Montre l'état de l'inspection technique du véhicule</ThemedText>
                            </View>
                            <View>
                                <Switch
                                    value={formData.controle_technique}
                                    onValueChange={(val) => setFormData({ ...formData, controle_technique: val })} // console.log(val)}
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
                                    renderActiveText={formData.controle_technique}
                                    renderInActiveText={formData.controle_technique === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>
                        <View className="flex flex-row items-center gap-2" style={[styles.card]}>
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Double des clés</ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Indique si les clés de rechange sont disponibles pour le véhicule</ThemedText>
                            </View>
                            <View>
                                <Switch
                                    value={formData.double_des_cles}
                                    onValueChange={(val) => setFormData({ ...formData, double_des_cles: val })} // console.log(val)}
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
                                    renderActiveText={formData.double_des_cles}
                                    renderInActiveText={formData.double_des_cles === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>

                        <View className="flex flex-row justify-between gap-5 mb-10">
                            <View className="flex-1">
                                <TouchableOpacity className="py-4" onPress={() => handlePreviousStep()}
                                    disabled={loading}
                                    style={[styles.button, styles.lighter, loading && styles.danger]} >
                                    {loading ? (<ActivityIndicator size="small" color='white' />) : (
                                        <ThemedText type="default" style={[styles.colorLight]}
                                            className="text-white font-bold text-center">Précédente</ThemedText>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <View className="flex-1">
                                <TouchableOpacity className="py-4" onPress={() => handleNextStep()}
                                    disabled={loading}
                                    style={[styles.button, styles.primary, loading && styles.danger]} >
                                    {loading ? (<ActivityIndicator size="small" color='white' />) : (
                                        <ThemedText type="default" lightColor="#fff" darkColor="#fff"
                                            className="text-white font-bold text-center">Procéder</ThemedText>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                );
            case 3:
                return (
                    <View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Description</ThemedText>
                            <TextInput style={[styles.input, { height: 200, textAlignVertical: 'top' }]}
                                multiline={true}  // This is crucial for multi-line input
                                numberOfLines={4}  // Works on Android to set initial number of lines
                                returnKeyType="default"  // Changes the return key to "default" instead of "done"
                                blurOnSubmit={false}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Description"
                                value={formData.Description}
                                onChangeText={(text) => setFormData({ ...formData, Description: text })} />
                            {errors.Description && <Text className="text-red-500">{errors.Description}</Text>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Autres informations à propos du véhicules</ThemedText>
                        </View>
                        <ThemedText type="default" className="mb-2">TVA (si professionnel)</ThemedText>
                        <View className='flex flex-row flex-wrap items-center gap-2 mb-4'>
                            {TaxTypeOptions.map((item: any, index: number) => (
                                <TouchableOpacity
                                    style={[styles.button, formData.TaxType === item?.name ? styles.primary : styles.lighter]}
                                    key={index}
                                    onPress={() => setFormData({ ...formData, TaxType: item?.id })}>
                                    <ThemedText type='default' lightColor={formData.TaxType === item?.name ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light} darkColor={formData.TaxType === item?.name ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}> {item?.name} % </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="mb-5">
                            <ThemedText type="default" className="mb-2">Prix de vente *</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Enter le prix de vente"
                                keyboardType="numeric"
                                value={formData.SellingPrice}
                                onChangeText={(text) => setFormData({ ...formData, SellingPrice: text })} />

                            {errors.SellingPrice && <Text className="text-red-500">{errors.SellingPrice}</Text>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Entrez le prix de vente souhaité / prix affiché avec commission de Allomotors</ThemedText>
                        </View>

                        <View className="flex flex-row items-center gap-2 mb-2">
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Visibilité du prix sur le catalogue * </ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Masquer le prix</ThemedText>
                                {errors.HidePrice && <Text className="text-red-500">{errors.HidePrice}</Text>}
                            </View>
                            <View>
                                <Switch
                                    value={formData.HidePrice}
                                    onValueChange={(val) => setFormData({ ...formData, HidePrice: val })} // console.log(val)}
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
                                    renderActiveText={formData.HidePrice}
                                    renderInActiveText={formData.HidePrice === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>
                        {formData.HidePrice && (
                            <View className="mb-4">
                                <ThemedText type="default" className="mb-2">Prix PIN *</ThemedText>
                                <TextInput style={[styles.input]}
                                    placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                    underlineColorAndroid="transparent"
                                    placeholder="Enter le code PIN prix"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={formData.PricePin}
                                    onChangeText={(text) => setFormData({ ...formData, PricePin: text })} />
                                {errors.PricePin && <Text className="text-red-500">{errors.PricePin}</Text>}
                                {errors.PricePinLength && <Text className="text-red-500">{errors.PricePinLength}</Text>}

                                <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Code secret pour voir le prix.</ThemedText>
                            </View>
                        )
                        }
                        {/* <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Votre numéro de téléphone</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Votre numéro de téléphone"
                                keyboardType="numeric"
                                value={formData.SellerPhone}
                                onChangeText={(text) => setFormData({ ...formData, SellerPhone: text })} />
                            {errors.SellerPhone && <Text className="text-red-500">{errors.SellerPhone}</Text>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Entrez le numéro de téléphone qui sera disponible pour les acheteurs intéressés pour un contact rapide. Vous pouvez laisser vide si vous ne souhaitez pas afficher votre numéro.</ThemedText>
                        </View> */}
                        <View className="flex flex-row justify-between gap-5 mb-10">
                            <View className="flex-1">
                                <TouchableOpacity className="py-4" onPress={() => handlePreviousStep()}
                                    disabled={loading}
                                    style={[styles.button, styles.lighter, loading && styles.danger]} >
                                    {loading ? (<ActivityIndicator size="small" color='white' />) : (
                                        <ThemedText type="default" style={[styles.colorLight]}
                                            className="text-white font-bold text-center">Précédente</ThemedText>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <View className="flex-1">
                                <TouchableOpacity className="py-4" onPress={() => handleNextStep()}
                                    disabled={loading}
                                    style={[styles.button, styles.primary, loading && styles.danger]} >
                                    {loading ? (<ActivityIndicator size="small" color='white' />) : (
                                        <ThemedText type="default" lightColor="#fff" darkColor="#fff"
                                            className="text-white font-bold text-center">Procéder</ThemedText>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                );
            case 4:
                return (
                    <View>
                        <ThemedText type="subtitle" className="mb-4 text-center">Image de couverture</ThemedText>
                        <View className="flex flex-row items-start gap-5 mb-2">
                            <View className="mb-4 text-center flex-1">
                                <TouchableOpacity onPress={() => { pickAndUploadImage("IconURL") }}>
                                    <View className="rounded-xl mb-2 m-auto" style={[styles.relativePosition, styles.primary, { width: 150 }]} >
                                        <Image
                                            source={{ uri: formData.IconURL ? `${PathURL}${formData.IconURL}` : "https://i.pinimg.com/474x/e8/ee/07/e8ee0728e1ba12edd484c111c1f492f2.jpg" }}
                                            style={{ width: 140, height: 140, margin: 5, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                        {formData.IconURL ? <TouchableOpacity onPress={() => { setFormData({ ...formData, IconURL: null }) }} style={[styles.danger, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                            <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].white} />
                                        </TouchableOpacity> : null}
                                    </View>
                                </TouchableOpacity>
                                <ThemedText type="default" className="text-center mb-2">Icône/photo de profil</ThemedText>
                                {errors.IconURL && <Text className="text-red-500">{errors.IconURL}</Text>}
                            </View>
                        </View>
                        <ThemedText type="subtitle" className="mb-4 text-center">Photos du véhicule - conseillé</ThemedText>
                        <View className="flex flex-row items-start gap-5 mb-2">
                            <View className="mb-4 text-center flex-1">
                                <TouchableOpacity onPress={() => { pickAndUploadImage("FrontLeftURL") }}>
                                    <View className="rounded-xl mb-2 m-auto" style={[styles.relativePosition, styles.primary, { width: 150 }]} >
                                        <Image
                                            source={{ uri: formData.FrontLeftURL ? `${PathURL}${formData.FrontLeftURL}` : "https://allomotors.fr/Content/CarFront.jpg" }}
                                            style={{ width: 140, height: 140, margin: 5, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                        {formData.FrontLeftURL ? <TouchableOpacity onPress={() => { setFormData({ ...formData, FrontLeftURL: null }) }} style={[styles.danger, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                            <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].white} />
                                        </TouchableOpacity> : null}
                                    </View>
                                </TouchableOpacity>
                                <ThemedText type="default" className="mb-2 text-center">Avant</ThemedText>
                                {errors.FrontLeftURL && <Text className="text-red-500">{errors.FrontLeftURL}</Text>}
                            </View>
                            <View className="mb-4 text-center flex-1">
                                <TouchableOpacity onPress={() => { pickAndUploadImage("RightRearURL") }}>
                                    <View className="rounded-xl mb-2 m-auto" style={[styles.relativePosition, styles.primary, { width: 150 }]} >
                                        <Image
                                            source={{ uri: formData.RightRearURL ? `${PathURL}${formData.RightRearURL}` : "https://allomotors.fr/Content/CarRear.jpg" }}
                                            style={{ width: 140, height: 140, margin: 5, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                        {formData.RightRearURL ? <TouchableOpacity onPress={() => { setFormData({ ...formData, RightRearURL: null }) }} style={[styles.danger, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                            <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].white} />
                                        </TouchableOpacity> : null}
                                    </View>
                                </TouchableOpacity>
                                <ThemedText type="default" className="text-center mb-2">Arrière</ThemedText>
                                {errors.RightRearURL && <Text className="text-red-500">{errors.RightRearURL}</Text>}
                            </View>
                        </View>
                        <View className="flex flex-row items-start gap-5 mb-2">
                            <View className="mb-4 text-center flex-1">
                                <TouchableOpacity onPress={() => { pickAndUploadImage("DriversIntURL") }}>
                                    <View className="rounded-xl mb-2 m-auto" style={[styles.relativePosition, styles.primary, { width: 150 }]} >
                                        <Image
                                            source={{ uri: formData.DriversIntURL ? `${PathURL}${formData.DriversIntURL}` : "https://allomotors.fr/Content/Carinterior.jpg" }}
                                            style={{ width: 140, height: 140, margin: 5, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                        {formData.DriversIntURL ? <TouchableOpacity onPress={() => { setFormData({ ...formData, DriversIntURL: null }) }} style={[styles.danger, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                            <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].white} />
                                        </TouchableOpacity> : null}
                                    </View>
                                </TouchableOpacity>
                                <ThemedText type="default" className="mb-2 text-center">Intérieur du conducteur</ThemedText>
                                {errors.DriversIntURL && <Text className="text-red-500">{errors.DriversIntURL}</Text>}
                            </View>
                            <View className="mb-4 text-center flex-1">
                                <TouchableOpacity onPress={() => { pickAndUploadImage("PassengersIntURL") }}>
                                    <View className="rounded-xl mb-2 m-auto" style={[styles.relativePosition, styles.primary, { width: 150 }]} >
                                        <Image
                                            source={{ uri: formData.PassengersIntURL ? `${PathURL}${formData.PassengersIntURL}` : "https://allomotors.fr/Content/Carinterior.jpg" }}
                                            style={{ width: 140, height: 140, margin: 5, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                        {formData.PassengersIntURL ? <TouchableOpacity onPress={() => { }} style={[styles.danger, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                            <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].white} />
                                        </TouchableOpacity> : null}
                                    </View>
                                </TouchableOpacity>
                                <ThemedText type="default" className="text-center mb-2">Intérieur des passagers</ThemedText>
                                {errors.PassengersIntURL && <Text className="text-red-500">{errors.PassengersIntURL}</Text>}
                            </View>
                        </View>
                        <View className="flex flex-row items-start gap-5 mb-2">
                            <View className="mb-4 text-center flex-1">
                                <TouchableOpacity onPress={() => { pickAndUploadImage("RightProfileURL") }}>
                                    <View className="rounded-xl mb-2 m-auto" style={[styles.relativePosition, styles.primary, { width: 150 }]} >
                                        <Image
                                            source={{ uri: formData.RightProfileURL ? `${PathURL}${formData.RightProfileURL}` : "https://allomotors.fr/Content/CarRight.jpg" }}
                                            style={{ width: 140, height: 140, margin: 5, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                        {formData.RightProfileURL ? <TouchableOpacity onPress={() => { setFormData({ ...formData, RightProfileURL: null }) }} style={[styles.danger, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                            <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].white} />
                                        </TouchableOpacity> : null}
                                    </View>
                                </TouchableOpacity>
                                <ThemedText type="default" className="mb-2 text-center">Droite</ThemedText>
                                {errors.RightProfileURL && <Text className="text-red-500">{errors.RightProfileURL}</Text>}
                            </View>
                            <View className="mb-4 text-center flex-1">
                                <TouchableOpacity onPress={() => { pickAndUploadImage("LeftProfileURL") }}>
                                    <View className="rounded-xl mb-2 m-auto" style={[styles.relativePosition, styles.primary, { width: 150 }]} >
                                        <Image
                                            source={{ uri: formData.LeftProfileURL ? `${PathURL}${formData.LeftProfileURL}` : "https://allomotors.fr/Content/CarLeft.jpg" }}
                                            style={{ width: 140, height: 140, margin: 5, borderRadius: 10 }}
                                            resizeMode="cover"
                                        />
                                        {formData.FrontLeftURL ? <TouchableOpacity onPress={() => { setFormData({ ...formData, LeftProfileURL: null }) }} style={[styles.danger, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                            <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].white} />
                                        </TouchableOpacity> : null}
                                    </View>
                                </TouchableOpacity>
                                <ThemedText type="default" className="text-center mb-2">Gauche</ThemedText>
                                {errors.LeftProfileURL && <Text className="text-red-500">{errors.LeftProfileURL}</Text>}
                            </View>
                        </View>
                        <ThemedText type="subtitle" className="mb-4 text-center">Photos de voiture - complémentaire(s)</ThemedText>
                        {formData && formData?.tblFiles && formData?.tblFiles?.length > 0 &&
                            <ScrollView className="rounded-md mb-4" horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={[styles.primary, { width: '100%', height: 125 }]} >
                                <View style={[styles.primary, { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 10, paddingHorizontal: 10 }]}>
                                    {formData?.tblFiles.map((item: any, index: any) => (
                                        <View style={[styles.relativePosition]} key={index}>
                                            {item?.FileType != 'image' ?
                                                (
                                                    <View style={[styles.danger, styles.justifyCenter, styles.itemCenter, { width: 100, height: 100, margin: 5, borderRadius: 10 }]}>
                                                        <Ionicons name="document-outline" size={90} color={Colors[colorScheme ?? 'light'].white} />
                                                    </View>
                                                ) : <Image key={index}
                                                    source={{ uri: item.FileName ? `${PathURL}${item.FileName}` : "https://allomotors.fr/Content/CarRight.jpg" }}
                                                    style={{ width: 100, height: 100, margin: 5, borderRadius: 10 }}
                                                    resizeMode="cover"
                                                />
                                            }
                                            <TouchableOpacity onPress={() => DeleteFile(item, index)}
                                                style={[styles.white, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                                <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].danger} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        }
                        <View className="flex flex-row justify-center gap-5 mb-10">
                            <TouchableOpacity className="py-4" onPress={() => UploadMutipleImages()}
                                disabled={loading}
                                style={[styles.button, styles.lighter, loading && styles.danger]} >
                                {loading ? (<ActivityIndicator size="small" color='white' />) : (
                                    <ThemedText type="default" style={[styles.colorLight]}
                                        className="text-white font-bold text-center">Ajouter d'autres photos</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View className="flex flex-row justify-between gap-5 mb-10">
                            <View className="flex-1">
                                <TouchableOpacity className="py-4" onPress={() => handlePreviousStep()}
                                    disabled={loading}
                                    style={[styles.button, styles.lighter, loading && styles.danger]} >
                                    {loading ? (<ActivityIndicator size="small" color='white' />) : (
                                        <ThemedText type="default" style={[styles.colorLight]}
                                            className="text-white font-bold text-center">Précédente</ThemedText>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <View className="flex-1">
                                <TouchableOpacity className="py-4 px-2" onPress={() => { handleFormSubmit() }}
                                    disabled={loading}
                                    style={[styles.button, styles.primary, loading && styles.danger]} >
                                    {loading ? (<ActivityIndicator size="small" color='white' />) : (
                                        <View className="flex flex-row items-center gap-2">
                                            <Ionicons name="save-outline" size={18} color={Colors[colorScheme ?? 'light'].white} />
                                            <ThemedText type="default" lightColor="#fff" darkColor="#fff" className="text-white font-bold text-center">Sauvegarder</ThemedText>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            default:
                return null;
        }
    };
    return (
        <ScrollView className="flex-1"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={[styles.background]}
            contentContainerStyle={{
                marginTop: insets.top, marginBottom: insets.bottom,
                paddingHorizontal: 20, paddingBottom: 20
            }}>
            <View className="flex flex-row items-start gap-5 mb-4 mt-5">
                <View>
                    <TouchableOpacity style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
                        onPress={() => { goBack() }}>
                        <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                    </TouchableOpacity>
                </View>
                <View className="flex-1">
                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.lg }]}>Mettre à jour l'annonce</ThemedText>
                    <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0, lineHeight: 16 }]}>Mettre à jour le formulaire et soumettre</ThemedText>
                </View>
            </View>
            <View className="flex flex-row flex-wrap items-start gap-1 mb-4">
                {steps.map((item: any, index: number) => (
                    <View key={index} className="flex flex-column items-center flex-1 gap-2">
                        <View className={`rounded-md flex items-center justify-center py-2 px-4`}
                            style={{ backgroundColor: step >= index + 1 ? Colors[colorScheme ?? 'light'].danger : Colors[colorScheme ?? 'light'].light }}>
                            <Text className="text-white">{index + 1}</Text>
                        </View>
                        <View>
                            <ThemedText type="default" style={[styles.colorLight, styles.textCenter, { fontSize: FONT_SIZES.sm, lineHeight: 16 }]}>{item.name}</ThemedText>
                        </View>
                    </View>
                ))}
            </View>
            {renderStep()}
        </ScrollView>
    );
}
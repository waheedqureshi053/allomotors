
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { wrapAttributes } from '@/utils/attributes';
import { getCommission } from '@/utils/helperFunction';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Switch } from 'react-native-switch';
import { apiCall } from '../_services/api';
import { useSession } from '../_services/ctx';
import { uploadFile } from '../_services/uploadService';
import { useGlobalStyles } from '../_styles/globalStyle';

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
    const { session, user, company } = useSession();
    const [allCategoriesList, setAllCategoriesList] = useState<CategoryItem[]>([]);
    const [infoTypesData, setInfoTypesData] = useState<InfoTypesData>({});
    const [VehicleOrigionOptions, setVehicleOrigionOptions] = useState<any>([]);
    const [SaleAreaOptions, setSaleAreaOptions] = useState<any>([]);
    const [infoTypes, setInfoTypes] = useState<any>([{ Title: "Main", IsChecked: false }, { Title: "AdvertTypes", IsChecked: false }, { Title: "Brands", IsChecked: false }, { Title: "Models", IsChecked: false }, { Title: "Finishings", IsChecked: false }, { Title: "Versions", IsChecked: false }, { Title: "Fuels", IsChecked: false }, { Title: "Gearboxes", IsChecked: false }, { Title: "VehicleTypes", IsChecked: false }, { Title: "NumberOfDoors", IsChecked: false }, { Title: "NumberOfPlaces", IsChecked: false }, { Title: "Permits", IsChecked: false }, { Title: "Colors", IsChecked: false }, { Title: "Equipment", IsChecked: false }, { Title: "Features", IsChecked: false }, { Title: "VehicleConditions", IsChecked: false }, { Title: "AirBags", IsChecked: false }, { Title: "EmissionClasses", IsChecked: false }, { Title: "SparePartsDurations", IsChecked: false }, { Title: "Sellerie", IsChecked: false }, { Title: "VehicleOrigion", IsChecked: false }, { Title: "SaleArea", IsChecked: false }]);
    const scrollRef = useRef<ScrollView>(null);
    const [AdvertSubmittedAs, setAdvertSubmittedAs] = useState<string | null>(null);
    //const [ServiceSubmittedAs, setServiceSubmittedAs] = useState<string | null>(null);

    const PathURL = 'https://allomotors.fr/Content/WebData/UF/';
    // const steps : any = [
    //     // { id: 1, name: "Véhicule" },
    //     // { id: 2, name: "Options" },
    //     // { id: 3, name: "Prix" },
    //     // { id: 4, name: "Fichiers" },
    //     // { id: 5, name: "Publier" },
    // ];

    const [steps, setStepsList] = useState<any>([]);
    const [step, setStep] = useState(1);
    const scrollToTop = () => {
        scrollRef.current?.scrollTo({
            y: 0,
            animated: true,
        });
    };
    // Camera states
    const [showCamera, setShowCamera] = useState(false);
    const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
    const [currentFormDataKey, setCurrentFormDataKey] = useState<string>('');
    const cameraRef = useRef<CameraView>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const cameraFormKeyRef = useRef<string | null>(null);
    const initialFormData = {
        ID: 0,
        CarPlateNum: '',
        Title: '',
        SaleArea: '',
        Finishing: '',
        Mileage: '',
        VehicleOrigion: '',
        TaxType: '8.5',
        Description: '',
        SellingPrice: '',
        SellingPriceFinal: 0,
        BuyersCommission: 0,
        HidePrice: false,
        SaleAssistance: false,
        PricePin: '',
        SellerPhone: '',
        //Status: 'Pro',
        voyant_moteur_ou_autres: false,
        revisee_ou_historique: false,
        climatisation: false,
        bruit_train_roulant_ou_autres: false,
        accident: false,
        rayure_ou_impacte: false,
        controle_technique: false,
        double_des_cles: false,
        IconURL: null,
        FrontLeftURL: null,
        RightRearURL: null,
        DriversIntURL: null,
        PassengersIntURL: null,
        RightProfileURL: null,
        LeftProfileURL: null,
        tblFiles: [],
        CategoryID: 3,
        Category: "Convertible",
        Advert: "Convertible",
        progress: 0,
        IsLoading: true,
        IsPublic: false,
        AttributesArray: [],
        AdvertType: "Car",
        HasApiMeta: false
    };
    const [formData, setFormData] = useState(initialFormData);
    const router = useRouter();
    const handleNextStep = () => {
        const validationErrors = validate();
        if (validationErrors && Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setLoading(false);
            return;
        } else {
            setErrors({});
        }
        setStep(step + 1);

    };
    const handlePreviousStep = () => {
        setStep(step - 1);
    }
    useEffect(() => {
        scrollToTop();
    }, [step]);
    const [statusOptions, SetStatusOptions] = useState([
        { id: true, name: "Public" },
        { id: false, name: "Pro" },
    ]);
    const [TaxTypeOptions, setTaxTypeOptions] = useState([
        { id: "0", name: "0" },
        { id: "8.5", name: "8.5" },
    ]);

    const goBack = () => {
        //const hasFormData = Object.values(formData).some((value) => value !== null && value !== '');
        const hasFormData =
            formData.Title?.trim() ||
            formData.Mileage?.trim() ||
            formData.SellingPrice?.trim() ||
            formData.Description?.trim() ||
            formData.IconURL;

        if (hasFormData) {
            Alert.alert(
                "Quitter la page ?",
                "Vous avez des informations non enregistrées. Voulez-vous vraiment quitter ?",
                [
                    {
                        text: "Annuler",
                        style: "cancel",
                    },
                    {
                        text: "Quitter",
                        style: "destructive",
                        onPress: () => router.back(),
                    },
                ]
            );
        } else {
            router.back();
        }
    };
    const localStyles = StyleSheet.create({
        cameraContainer: {
            flex: 1,
            backgroundColor: 'black',
        },
        camera: {
            flex: 1,
        },
        cameraControls: {
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: 20,
        },
        flipButton: {
            padding: 15,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 50,
        },
        captureButton: {
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
        },
        captureButtonInner: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'white',
            borderWidth: 2,
            borderColor: 'black',
        },
        closeButton: {
            padding: 15,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 50,
        },
        cameraPermissionContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        permissionText: {
            color: 'white',
            textAlign: 'center',
            marginBottom: 20,
        },
        permissionButton: {
            backgroundColor: '#007AFF',
            padding: 15,
            borderRadius: 10,
        },
        permissionButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
    });
    const validate = () => {
        const errors: { [key: string]: string } = {};
        if (step === 1) {
            if (!formData.Title?.trim()) errors.Title = "Le titre est requis.";
            if (!formData.Mileage) errors.Mileage = "Le kilométrage est requis.";
            else if (!/^\d+(\.\d{1,2})?$/.test(formData.Mileage)) {
                errors.Mileage = "Le kilométrage doit contenir uniquement des chiffres (0-9).";
            }
        } else if (step === 2) {
            // No validation for step 2
        } else if (step === 3) {
            if (!formData.SellingPrice?.trim()) errors.SellingPrice = "Le prix de vente est requis.";
            else if (!/^\d+(\.\d{1,2})?$/.test(formData.SellingPrice)) {
                errors.SellingPrice = "Le prix de vente doit contenir uniquement des chiffres (0-9).";
            }
            if (user?.UserType != "Particulier" && formData.IsPublic != true) {
                if (formData.HidePrice) {
                    if (!formData.PricePin?.trim())
                        errors.PricePin = "Le code PIN du prix est requis.";
                    if (formData.PricePin.length < 4 || formData.PricePin.length > 4) {
                        errors.PricePinLength = "Le code PIN doit contenir exactement 4 chiffres.";
                    }
                }
            }
        } else if (step === 4) {
            if (!formData.IconURL) errors.IconURL = "La miniature est requise, veuillez télécharger une miniature pour la publicité.";
        } else if (step === 5) {
            if (user?.UserType != 'Particulier')
                if (AdvertSubmittedAs === null || AdvertSubmittedAs === undefined) errors.IsPublic = "Veuillez sélectionner Public ou Professionnel";
        }
        return errors;
    };
    // Enhanced Image Picker with Camera
    const pickAndUploadImage = async (formDataKey: string) => {
        Alert.alert(
            'Choisir une source',
            "D'où voulez-vous prendre la photo?",
            [
                {
                    text: 'Appareil photo',
                    onPress: () => takePhotoWithCamera(formDataKey),
                },
                {
                    text: 'Galerie',
                    onPress: () => pickFromGallery(formDataKey),
                },
                { text: 'Annuler', style: 'cancel' },
            ]
        );
    };
    const takePhotoWithCamera = async (formDataKey: string) => {
        if (!cameraPermission?.granted) {
            const permissionResult = await requestCameraPermission();
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission requise',
                    "L'accès à la caméra est nécessaire."
                );
                return;
            }
        }

        setShowCamera(true);
        cameraFormKeyRef.current = formDataKey;
    };
    const pickFromGallery = async (formDataKey: string) => {
        try {
            const permissionResult =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission requise',
                    "AlloMotors a besoin d'accéder à votre bibliothèque multimédia."
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (result.canceled) return;

            await uploadSelectedImage(result.assets[0].uri, formDataKey);
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('Erreur', "Impossible d'accéder à la galerie");
        }
    };
    const capturePhoto = async () => {
        if (!cameraRef.current || !cameraFormKeyRef.current) return;

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
            });

            setShowCamera(false);

            if (photo) {
                await uploadSelectedImage(
                    photo.uri,
                    cameraFormKeyRef.current
                );
            }

            cameraFormKeyRef.current = null;
        } catch (error) {
            console.error('Camera capture error:', error);
            Alert.alert('Erreur', 'Impossible de prendre la photo');
        }
    };
    const uploadSelectedImage = async (
        photoUri: string,
        formDataKey: string
    ) => {
        try {
            setLoading(true);

            const response = await uploadFile(
                photoUri,
                'UF',
                session?.token ?? ''
            );

            setFormData(prev => ({
                ...prev,
                [formDataKey]: response.FileName,
            }));

            Alert.alert('Succès', 'Image téléchargée avec succès');
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Erreur', "Échec du téléchargement de la photo");
        } finally {
            setLoading(false);
        }
    };
    const renderCamera = () => {
        if (!cameraPermission) {
            return <View />;
        }

        if (!cameraPermission.granted) {
            return (
                <View style={localStyles.cameraPermissionContainer}>
                    <Text style={localStyles.permissionText}>Nous avons besoin de votre permission pour utiliser la caméra</Text>
                    <TouchableOpacity onPress={requestCameraPermission} style={localStyles.permissionButton}>
                        <Text style={localStyles.permissionButtonText}>Accorder la permission</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={localStyles.cameraContainer}>
                <CameraView
                    style={localStyles.camera}
                    facing={cameraType}
                    ref={cameraRef}
                >
                    <View style={localStyles.cameraControls}>
                        <TouchableOpacity
                            style={localStyles.flipButton}
                            onPress={() => setCameraType(current => (current === 'back' ? 'front' : 'back'))}
                        >
                            <Ionicons name="camera-reverse" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={localStyles.captureButton}
                            onPress={capturePhoto}
                        >
                            <View style={localStyles.captureButtonInner} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={localStyles.closeButton}
                            onPress={() => setShowCamera(false)}
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        );
    };
    const handleFormSubmit = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            // Clone to avoid mutating state directly
            let objData: any = { ...formData };

            // Category handling
            const selectedCategory = allCategoriesList[0];
            if (selectedCategory) {
                objData.Advert = selectedCategory.Title;
                objData.CategoryID = selectedCategory.ID;
                objData.Category = selectedCategory.Title;
            }

            // Commission calculation
            objData.BuyersCommission = getCommission(
                formData,
                'Buyers',
                company?.Attributes!
            );

            objData.SellingPriceFinal =
                Number(formData.SellingPrice) + objData.BuyersCommission;


            const userType = user?.UserType;
            const isParticulier = userType === 'Particulier';
            const isProLite = userType === 'Pro Lite';
            const isAdmin = userType === 'Admin';
            const hasSaleAssistance = objData.SaleAssistance === true;
            //// if (user?.UserType === 'Particulier')

            /* ---- Hide Price ---- */
            // objData.HidePrice = isParticulier
            //     ? true
            //     : objData.IsPublic === true
            //         ? false
            //         : objData.HidePrice;

            /* ---- Is Public ---- */
            if (isParticulier || isProLite || isAdmin) {
                if (hasSaleAssistance)
                    objData.IsPublic = false;
            }
            console.log("🎯 SaleAssistance: ", hasSaleAssistance);
            console.log("🎯 IsPublic: ", objData.IsPublic);

            //console.log("SaleAssistance", objData.SaleAssistance);
            // Wrap payload
            const payload = wrapAttributes(objData, 'Advert');
            console.log("Submited data:", payload);
            // API call
            const response = await apiCall(
                'POST',
                '/Account/SaveAdvert',
                null,
                payload
            );
            const data = response?.data;
            console.log('SaveAdvert response:', data);
            switch (data?.statusCode) {
                case 1:
                    setFormData(initialFormData);
                    setStep(1);
                    router.push('/pages/client-adverts');
                    break;

                case 2:
                    Alert.alert('Info', `Les informations de l'annonce ont été mises à jour`);
                    break;

                case 3:
                    Alert.alert('Info', 'Annonce déjà ajoutée');
                    break;
                // case 4:
                //     Alert.alert('Avertissement', `Le solde de l'annonce a expiré`);
                //     break;
                case 5:
                    Alert.alert("Annonce déjà vendue", "Cette annonce est déjà vendue. Vous ne pouvez pas modifier une annonce vendue.");
                    break;

                default:
                    Alert.alert('Erreur', 'Quelque chose a mal tourné');
                    break;
            }
        } catch (error) {
            console.error('SaveAdvert error:', error);
            Alert.alert('Erreur', 'Impossible d’enregistrer l’annonce');
        } finally {
            setLoading(false);
        }
    };
    const fetchCategories = async () => {
        setLoading(true);

        try {
            const response = await apiCall(
                'POST',
                '/Account/LoadSimpleCategorysList',
                null,
                {} // empty body as required by API
            );

            const data = response?.data;

            if (data?.statusCode === 1) {
                const jData: any[] = data?.data || [];

                setAllCategoriesList(jData);

                const newInfoTypesData: InfoTypesData = {};

                infoTypes.forEach((listItem: any) => {
                    newInfoTypesData[`InfoTypes_${listItem.Title}`] = jData.filter(
                        (s: any) => s.InfoType === listItem.Title
                    );
                });

                setInfoTypesData(newInfoTypesData);
                setVehicleOrigionOptions(newInfoTypesData?.InfoTypes_VehicleOrigion || []);
                setSaleAreaOptions(newInfoTypesData?.InfoTypes_SaleArea || []);
            }

        } catch (error: any) {
            console.error(
                'LoadSimpleCategorysList error:',
                error?.message || error
            );
        } finally {
            setLoading(false);
        }
    };
    const getCarMeta = async (carId: any) => {
        console.log("Pressed", carId);
        setLoading(true);

        try {
            const response = await apiCall(
                'POST',
                `/Account/GetCarMeta/${carId}`,
                null,
                null // no body required
            );

            console.log("Finished Pressed Call", carId);

            const data = response?.data;
            console.log('✅ Car Meta Data:', data);

            if (!data?.fabdata) {
                setFormData(initialFormData);
                Alert.alert(
                    'Oups!',
                    `les données de la voiture ne sont pas trouvées, veuillez vérifier à nouveau le numéro de plaque d'immatriculation.`
                );
                return;
            }

            const FabData = await mergeObjects(formData, data.fabdata);

            setFormData(prev => ({
                ...prev,
                ...FabData,
                HasApiMeta: true,
                Title: `${data?.fabdata?.make || ''} ${data?.fabdata?.full_model || ''}`,
                FirstRegDate: data?.siv?.b4_date_prem_immat,
                LastRegDate: data?.siv?.b4_date_immat_siv,
            }));

            console.log("After merge Advert", formData);

        } catch (error) {
            console.error('GetCarMeta error:', error);
            setFormData(prev => ({
                ...prev,
                HasApiMeta: false
            }));
        } finally {
            setLoading(false);
        }
    };
    const mergeObjects = async (targetObj: any, sourceObj: any) => {
        Object.keys(sourceObj).forEach((key) => {
            targetObj[key] = sourceObj[key];
        });
        return targetObj;
    };
    useFocusEffect(
        React.useCallback(() => {
            fetchCategories();
        }, [])
    );
    useEffect(() => {
        LoadProfile(user?.UserId);
        setStepsList([
            { id: 1, name: "Véhicule" },
            { id: 2, name: "Options" },
            { id: 3, name: "Prix" },
            { id: 4, name: "Fichiers" },
            { id: 5, name: "Publier" },
        ]);

        // if (user?.UserType == 'Particulier' || user?.UserType == 'Pro Lite') {
        //     setStepsList([
        //         { id: 1, name: "Véhicule" },
        //         { id: 2, name: "Options" },
        //         { id: 3, name: "Prix" },
        //         { id: 4, name: "Fichiers" },
        //         { id: 5, name: "Publier" },
        //     ]);
        // } else {
        //     setStepsList([
        //         { id: 1, name: "Véhicule" },
        //         { id: 2, name: "Options" },
        //         { id: 3, name: "Prix" },
        //         { id: 4, name: "Fichiers" }
        //     ]);
        // }

        if (user?.UserType == 'Particulier' || AdvertSubmittedAs == null || AdvertSubmittedAs == "Public") {

            formData.IsPublic = true;
        }



        // if (user?.UserType == 'Particulier' || user?.UserType == 'Pro Lite' || ServiceSubmittedAs == null || ServiceSubmittedAs == "Unverified") {
        //     formData.SaleAssistance = false;
        // }

        // console.log("🎯 SaleAssistance: ", formData.SaleAssistance);
        // console.log("🎯 IsPublic: ", formData.IsPublic);
    }, [user]);

    const DeleteFile = async (data: any, index: number) => {
        setFormData((prev) => ({
            ...prev,
            tblFiles: prev.tblFiles.filter((_, i) => i !== index),
        }));
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

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
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
    };
    const [isInputFocused, setIsInputFocused] = useState(false);
    const handleSearch = () => {
        Keyboard.dismiss();
        getCarMeta(formData.CarPlateNum);
    };
    const ChangeIsPublic = (IsPublic: boolean) => {
        //setFormData({ ...formData, IsPublic: IsPublic });
        setFormData((prev: any) => ({ ...prev, IsPublic: IsPublic }))
        console.log(formData);
    }

    const ToggleFreeService = (value: boolean) => {
        //setFormData({ ...formData, SaleAssistance: !formData.SaleAssistance });
        setFormData((prev: any) => ({ ...prev, SaleAssistance: value }))
        if(value){
            setAdvertSubmittedAs('Pro');
            setFormData((prev: any) => ({ ...prev, IsPublic: false }))
        }
        else
        {
            setAdvertSubmittedAs('Public');
            setFormData((prev: any) => ({ ...prev, IsPublic: true }))
        }

        console.log(formData);
    }

    const ToggleAdvertType = (value : string) => {
        setAdvertSubmittedAs(value);
        setFormData((prev: any) => ({ ...prev, IsPublic: value == 'Public' ? true : false }))
        if(value == 'Public'){
            setFormData((prev: any) => ({ ...prev, SaleAssistance: false }))
        }
        console.log(formData);
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View className="mb-5">
                        {/* {user?.UserType !== 'Particulier' && (
                            <>
                                <ThemedText type="default" className="mb-2">
                                    Publique ou Professionel
                                </ThemedText>

                                <View className="flex flex-column gap-3">
 
                                    <TouchableOpacity
                                        className="p-3 rounded-md flex flex-row justify-center"
                                        style={[
                                            AdvertSubmittedAs === 'Public'
                                                ? styles.danger
                                                : styles.lighter
                                        ]}
                                        onPress={() => {
                                            setAdvertSubmittedAs('Public');
                                            setFormData({ ...formData, IsPublic: true });
                                        }}
                                    >
                                        <ThemedText
                                            style={[styles.textCenter, { fontWeight: 'bold' }]}
                                            lightColor={
                                                AdvertSubmittedAs === 'Public'
                                                    ? Colors[colorScheme ?? 'light'].white
                                                    : Colors[colorScheme ?? 'light'].light
                                            }
                                            darkColor={
                                                AdvertSubmittedAs === 'Public'
                                                    ? Colors[colorScheme ?? 'light'].white
                                                    : Colors[colorScheme ?? 'light'].light
                                            }
                                        >
                                            Page publique - PARTICULIER
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <ThemedText
                                        style={[
                                            styles.textCenter,
                                            { fontSize: FONT_SIZES.md, fontWeight: 'bold', lineHeight: 17 }
                                        ]}
                                    >
                                        Or
                                    </ThemedText>
 
                                    <TouchableOpacity
                                        className="mb-5 p-3 rounded-md flex flex-row justify-center"
                                        style={[
                                            AdvertSubmittedAs === 'Pro'
                                                ? styles.danger
                                                : styles.lighter
                                        ]}
                                        onPress={() => {
                                            setAdvertSubmittedAs('Pro');
                                            setFormData({ ...formData, IsPublic: false });
                                        }}
                                    >
                                        <ThemedText
                                            style={[styles.textCenter, { fontWeight: 'bold' }]}
                                            lightColor={
                                                AdvertSubmittedAs === 'Pro'
                                                    ? Colors[colorScheme ?? 'light'].white
                                                    : Colors[colorScheme ?? 'light'].light
                                            }
                                            darkColor={
                                                AdvertSubmittedAs === 'Pro'
                                                    ? Colors[colorScheme ?? 'light'].white
                                                    : Colors[colorScheme ?? 'light'].light
                                            }
                                        >
                                            C'est pour Pro
                                        </ThemedText>
                                    </TouchableOpacity>

                                </View>

                                {errors.IsPublic && (
                                    <Text className="text-red-500">{errors.IsPublic}</Text>
                                )}
                            </>
                        )} */}

                        <View className="mb-4 mt-2">
                            <ThemedText type="default" className="mb-2">Numéro de plaque d'immatriculation *</ThemedText>
                            <View className="relative">
                                <TextInput style={[styles.input]}
                                    placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                    underlineColorAndroid="transparent"
                                    placeholder="Numéro de plaque d'immatriculation"
                                    value={formData.CarPlateNum}
                                    onChangeText={(text) => setFormData({ ...formData, CarPlateNum: text })}
                                    onFocus={() => setIsInputFocused(true)}
                                    onBlur={() => {
                                        setIsInputFocused(false);
                                        handleSearch();
                                    }}
                                    onSubmitEditing={() => handleSearch()}
                                    returnKeyType="search"
                                />
                                <TouchableOpacity disabled={loading}
                                    onPress={() => handleSearch()}
                                    style={[styles.primary]}
                                    className='flex flex-row items-center gap-2 justify-center p-2 rounded-lg absolute top-2 right-3'>
                                    {loading ? <ActivityIndicator size="small" color="white" /> :
                                        <Ionicons name="search" size={18} color="white" />
                                    }
                                </TouchableOpacity>
                            </View>
                            {errors.CarPlateNum && <Text className="text-red-500">{errors.CarPlateNum}</Text>}
                            {formData.HasApiMeta && <ThemedText type="default" style={[styles.colorSuccess, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Recherche rencontrée avec méta</ThemedText>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Insérer la plaque d'immatriculation.</ThemedText>
                        </View>

                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Titre de l'annonce *</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Titre"
                                value={formData.Title}
                                onChangeText={(text) => setFormData({ ...formData, Title: text })} />
                            {errors.Title && <Text className="text-red-500">{errors.Title}</Text>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Insérer le titre de l'annonce</ThemedText>
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Sélectionnez ville</ThemedText>
                            <View style={styles.pickerContainer}>
                                {Platform.OS === 'ios' ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => setIsVisibleSaleAreaPicker(true)}
                                            style={{
                                                borderWidth: 1,
                                                borderColor: Colors[colorScheme ?? 'light'].light,
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
                                                        <Picker.Item color="black" label="--- Sélectionner ---" value={''} key={null} />
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
                                        borderColor: Colors[colorScheme ?? 'light'].light,
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
                                keyboardType="number-pad"
                                value={formData.Mileage}
                                onChangeText={(text) => setFormData({ ...formData, Mileage: text })} />
                            {errors.Mileage && <Text className="text-red-500">{errors.Mileage}</Text>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Insérer le kilométrage du véhicule en kilomètres.</ThemedText>
                        </View>
                        <View className="mb-5">
                            <ThemedText type="default" className="mb-2">Sélectionnez Origine du véhicule</ThemedText>
                            <View style={styles.pickerContainer}>
                                {Platform.OS === 'ios' ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => setIsVisibleVehicleOriginPicker(true)}
                                            style={{
                                                borderWidth: 1,
                                                borderColor: Colors[colorScheme ?? 'light'].light,
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
                                        borderColor: Colors[colorScheme ?? 'light'].light,
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
                            </View>
                        </View>

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
                        {/* Step 3 content remains the same formData.SaleAssistance != true && styles.warning,*/}

                        {/* {(user?.UserType == 'Particulier' || user?.UserType == 'Pro Lite') && (
                            <View className="flex flex-column items-center gap-4 mb-5 p-5 rounded-lg" style={[{ borderWidth: 1, borderColor: formData.SaleAssistance != true ? Colors[colorScheme ?? 'light'].warning : Colors[colorScheme ?? 'light'].success }]}>
                                <View>
                                    <Switch
                                        value={formData.SaleAssistance}
                                        onValueChange={(val) => setFormData({ ...formData, SaleAssistance: val })}
                                        circleSize={30}
                                        barHeight={30}
                                        circleBorderWidth={0}
                                        backgroundActive={Colors[colorScheme ?? 'light'].success}
                                        backgroundInactive={Colors[colorScheme ?? 'light'].light}
                                        circleActiveColor={Colors[colorScheme ?? 'light'].light}
                                        circleInActiveColor={Colors[colorScheme ?? 'light'].success}
                                        changeValueImmediately={true}
                                        innerCircleStyle={{ alignItems: "center", justifyContent: "center" }}
                                        renderActiveText={formData.SaleAssistance}
                                        renderInActiveText={formData.SaleAssistance === false}
                                        switchLeftPx={7}
                                        switchRightPx={7}
                                        switchWidthMultiplier={2}
                                        switchBorderRadius={30}
                                    />
                                </View>
                                <View className="flex-1 flex flex-column gap-1 justify-center items-center">
                                    <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22, textAlign: 'center' }]}>Service Allomotors ( 100% gratuit)</ThemedText>
                                    <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15, textAlign: 'center' }]}>Je souhaite mandater AlloMotors pour vendre mon véhicule à leur réseau d’acheteurs professionnels.</ThemedText>
                                    {errors.SaleAssistance && <Text className="text-red-500">{errors.SaleAssistance}</Text>}
                                </View>

                            </View>
                        )} */}

                        {/* {(user?.UserType == 'Particulier' || user?.UserType == 'Pro Lite') && (
                            <View className="flex flex-row items-center gap-2 mb-5 p-2 rounded" style={[formData.SaleAssistance != true && styles.warning, { borderColor: Colors[colorScheme ?? 'light'].warning }]}>
                                <View className="flex-1">
                                    <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Service Allomotors ( 100% gratuit)</ThemedText>
                                    <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Je souhaite mandater AlloMotors pour vendre mon véhicule à leur réseau d’acheteurs professionnels.</ThemedText>
                                    {errors.SaleAssistance && <Text className="text-red-500">{errors.SaleAssistance}</Text>}
                                </View>
                                <View>
                                    <Switch
                                        value={formData.SaleAssistance}
                                        onValueChange={(val) => setFormData({ ...formData, SaleAssistance: val })}
                                        circleSize={30}
                                        barHeight={30}
                                        circleBorderWidth={0}
                                        backgroundActive={Colors[colorScheme ?? 'light'].success}
                                        backgroundInactive={Colors[colorScheme ?? 'light'].light}
                                        circleActiveColor={Colors[colorScheme ?? 'light'].light}
                                        circleInActiveColor={Colors[colorScheme ?? 'light'].success}
                                        changeValueImmediately={true}
                                        innerCircleStyle={{ alignItems: "center", justifyContent: "center" }}
                                        renderActiveText={formData.SaleAssistance}
                                        renderInActiveText={formData.SaleAssistance === false}
                                        switchLeftPx={7}
                                        switchRightPx={7}
                                        switchWidthMultiplier={2}
                                        switchBorderRadius={30}
                                    />
                                </View>
                            </View>
                        )} */}


                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Description</ThemedText>
                            <TextInput style={[styles.input, { height: 200, textAlignVertical: 'top' }]}
                                multiline={true}
                                numberOfLines={4}
                                returnKeyType="default"
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
                        <View className='flex flex-row flex-wrap items-center gap-2 mb-7'>
                            {TaxTypeOptions.map((item: any, index: number) => (
                                <TouchableOpacity
                                    style={[styles.button, formData.TaxType === item?.name ? styles.primary : styles.lighter]}
                                    key={index}
                                    onPress={() => setFormData({ ...formData, TaxType: item?.id })}>
                                    <ThemedText type='default' lightColor={formData.TaxType === item?.name ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light} darkColor={formData.TaxType === item?.name ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}> {item?.name} % </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Prix de vente * </ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Enter le prix de vente"
                                keyboardType="number-pad"
                                value={formData.SellingPrice}
                                onChangeText={(text) => setFormData({ ...formData, SellingPrice: text })} />
                            {errors.SellingPrice && <Text className="text-red-500">{errors.SellingPrice}</Text>}
                            <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}>Entrez le prix de vente souhaité / prix affiché avec commission de Allomotors</ThemedText>
                        </View>

                        <View className="flex flex-row items-center gap-2 mb-7">
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Visibilité du prix sur le catalogue </ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Masquer le prix</ThemedText>
                                {errors.HidePrice && <Text className="text-red-500">{errors.HidePrice}</Text>}
                            </View>
                            <View>
                                <Switch
                                    value={formData.HidePrice}
                                    onValueChange={(val) => setFormData({ ...formData, HidePrice: val })}
                                    circleSize={30}
                                    barHeight={30}
                                    circleBorderWidth={0}
                                    backgroundActive={Colors[colorScheme ?? 'light'].success}
                                    backgroundInactive={Colors[colorScheme ?? 'light'].light}
                                    circleActiveColor={Colors[colorScheme ?? 'light'].light}
                                    circleInActiveColor={Colors[colorScheme ?? 'light'].success}
                                    changeValueImmediately={true}
                                    innerCircleStyle={{ alignItems: "center", justifyContent: "center" }}
                                    renderActiveText={formData.HidePrice}
                                    renderInActiveText={formData.HidePrice === false}
                                    switchLeftPx={7}
                                    switchRightPx={7}
                                    switchWidthMultiplier={2}
                                    switchBorderRadius={30}
                                />
                            </View>
                        </View>

                        {formData.HidePrice && (
                            <View className="mb-7">
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
                        )}



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
                                <ThemedText type="default" className="text-center mb-2">Image du véhicule</ThemedText>
                                {errors.IconURL && <Text className="text-red-500 text-center" >{errors.IconURL}</Text>}
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
                                <ThemedText type="default" className="mb-2 text-center">Intérieur du véhicule conducteur</ThemedText>
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
                                        {formData.PassengersIntURL ? <TouchableOpacity onPress={() => { setFormData({ ...formData, PassengersIntURL: null }) }} style={[styles.danger, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                            <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].white} />
                                        </TouchableOpacity> : null}
                                    </View>
                                </TouchableOpacity>
                                <ThemedText type="default" className="text-center mb-2">Intérieur du véhicule passager</ThemedText>
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
                                        {formData.LeftProfileURL ? <TouchableOpacity onPress={() => { setFormData({ ...formData, LeftProfileURL: null }) }} style={[styles.danger, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
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

                        {/* {(user?.UserType == 'Particulier' || user?.UserType == 'Pro Lite') ? (
                            <>
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
                            </>
                        ) : (
                            <>
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
                            </>
                        )} */}
                    </View>
                )
            case 5:
                return (
                    <View>

                        {/* {(user?.UserType == 'Particulier' || user?.UserType == 'Pro Lite') && (
                            <>
                                <View className="flex-1 flex flex-column gap-1 mb-10 justify-center items-center">
                                    <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.lg, lineHeight: 30, textAlign: 'center' }]}>Service Allomotors ( 100% gratuit)</ThemedText>
                                    <ThemedText type="default" style={[{ fontSize: FONT_SIZES.md, lineHeight: 20, textAlign: 'center' }]}>Je souhaite mandater AlloMotors pour vendre mon véhicule à leur réseau d’acheteurs professionnels.</ThemedText>
                                </View>
                                <View className="flex flex-column items-center gap-4 mb-10 p-5 rounded-lg flex-1" 
                                style={[{ borderWidth: 1, borderColor: formData.SaleAssistance != true ? Colors[colorScheme ?? 'light'].warning : Colors[colorScheme ?? 'light'].success }]}>
                                    <View>
                                        <>
                                            <View className="flex flex-column gap-3"> 
                                                <TouchableOpacity
                                                    className="p-3 rounded-md flex flex-row justify-center"
                                                    style={[
                                                        ServiceSubmittedAs === 'Unverified'
                                                            ? styles.danger
                                                            : styles.lighter
                                                    ]}
                                                    onPress={() => {
                                                        setServiceSubmittedAs('Unverified');
                                                        setFormData({ ...formData, SaleAssistance: false });
                                                    }}
                                                >
                                                    <ThemedText
                                                        style={[styles.textCenter, { fontWeight: 'bold' }]}
                                                        lightColor={
                                                            ServiceSubmittedAs === 'Unverified'
                                                                ? Colors[colorScheme ?? 'light'].white
                                                                : Colors[colorScheme ?? 'light'].light
                                                        }
                                                        darkColor={
                                                            ServiceSubmittedAs === 'Unverified'
                                                                ? Colors[colorScheme ?? 'light'].white
                                                                : Colors[colorScheme ?? 'light'].light
                                                        }
                                                    >
                                                        Public Listing (Unverified)
                                                        Sell it yourself
                                                    </ThemedText>
                                                </TouchableOpacity>
                                                <ThemedText
                                                    style={[
                                                        styles.textCenter,
                                                        { fontSize: FONT_SIZES.md, fontWeight: 'bold', lineHeight: 40 }
                                                    ]}
                                                >
                                                    Or
                                                </ThemedText>
 
                                                <TouchableOpacity
                                                    className="p-3 rounded-md flex flex-row justify-center"
                                                    style={[
                                                        ServiceSubmittedAs === 'Verified'
                                                            ? styles.danger
                                                            : styles.lighter
                                                    ]}
                                                    onPress={() => {
                                                        setServiceSubmittedAs('Verified');
                                                        setFormData({ ...formData, SaleAssistance: true });
                                                    }}
                                                >
                                                    <ThemedText
                                                        style={[styles.textCenter, { fontWeight: 'bold' }]}
                                                        lightColor={
                                                            ServiceSubmittedAs === 'Verified'
                                                                ? Colors[colorScheme ?? 'light'].white
                                                                : Colors[colorScheme ?? 'light'].light
                                                        }
                                                        darkColor={
                                                            ServiceSubmittedAs === 'Verified'
                                                                ? Colors[colorScheme ?? 'light'].white
                                                                : Colors[colorScheme ?? 'light'].light
                                                        }
                                                    >
                                                        Verified by AlloMotors and
                                                        We help sell your vehicle
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            </View>
                                            {errors.SaleAssistance && <Text className="text-red-500">{errors.SaleAssistance}</Text>}
                                        </>
                                    </View>
                                </View>
                            </>
                        )} */}

                        {user?.UserType !== 'Particulier' && user?.UserType !== 'Pro Lite' && (
                            <>
                                <ThemedText type="default" className="mb-2">
                                    Publique ou Professionel
                                </ThemedText>

                                <View className="flex flex-column gap-3 mb-10">
                                    {/* PUBLIC */}
                                    <TouchableOpacity
                                        className="p-3 rounded-md flex flex-row justify-center"
                                        style={[
                                            AdvertSubmittedAs === 'Public'
                                                ? styles.danger
                                                : styles.lighter
                                        ]}
                                        onPress={() => {
                                            ToggleAdvertType('Public');
                                            // setAdvertSubmittedAs('Public');
                                            // setFormData({ ...formData, IsPublic: true });
                                        }}
                                    >
                                        <ThemedText
                                            style={[styles.textCenter, { fontWeight: 'bold' }]}
                                            lightColor={
                                                AdvertSubmittedAs === 'Public'
                                                    ? Colors[colorScheme ?? 'light'].white
                                                    : Colors[colorScheme ?? 'light'].light
                                            }
                                            darkColor={
                                                AdvertSubmittedAs === 'Public'
                                                    ? Colors[colorScheme ?? 'light'].white
                                                    : Colors[colorScheme ?? 'light'].light
                                            }
                                        >
                                            Page publique - PARTICULIER
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <ThemedText
                                        style={[
                                            styles.textCenter,
                                            { fontSize: FONT_SIZES.md, fontWeight: 'bold', lineHeight: 17 }
                                        ]}
                                    >
                                        Or
                                    </ThemedText>

                                    {/* PRO */}
                                    <TouchableOpacity
                                        className="p-3 rounded-md flex flex-row justify-center"
                                        style={[
                                            AdvertSubmittedAs === 'Pro'
                                                ? styles.danger
                                                : styles.lighter
                                        ]}
                                        onPress={() => {
                                            ToggleAdvertType('Pro');
                                            // setAdvertSubmittedAs('Pro');
                                            // setFormData({ ...formData, IsPublic: false });
                                        }}
                                    >
                                        <ThemedText
                                            style={[styles.textCenter, { fontWeight: 'bold' }]}
                                            lightColor={
                                                AdvertSubmittedAs === 'Pro'
                                                    ? Colors[colorScheme ?? 'light'].white
                                                    : Colors[colorScheme ?? 'light'].light
                                            }
                                            darkColor={
                                                AdvertSubmittedAs === 'Pro'
                                                    ? Colors[colorScheme ?? 'light'].white
                                                    : Colors[colorScheme ?? 'light'].light
                                            }
                                        >
                                            C'est pour Pro
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <View>
                                        {errors.IsPublic && (
                                            <Text className="text-red-500 text-center">{errors.IsPublic}</Text>
                                        )}
                                    </View>
                                </View>

                            </>
                        )}
                        {(user?.UserType == 'Particulier' || user?.UserType == 'Pro Lite') && (
                            <View className="flex flex-row items-center gap-2 mb-10 p-2 rounded" style={[formData.SaleAssistance != true && styles.warning, { borderColor: Colors[colorScheme ?? 'light'].warning }]}>
                                <View className="flex-1">
                                    <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Service AlloMotors ( 100% gratuit)</ThemedText>
                                    <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Voulez-vous être accompagné par AlloMotors pour vendre votre véhicule via son réseau d’acheteurs professionnels?</ThemedText>
                                    <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Service rapide et sécurisé.</ThemedText>
                                    {errors.SaleAssistance && <Text className="text-red-500">{errors.SaleAssistance}</Text>}
                                </View>
                                <View>
                                    <Switch
                                        value={formData.SaleAssistance}
                                        //onValueChange={(val) => setFormData({ ...formData, SaleAssistance: val })}
                                        onValueChange={(val) => ToggleFreeService(val)}
                                        circleSize={30}
                                        barHeight={30}
                                        circleBorderWidth={0}
                                        backgroundActive={Colors[colorScheme ?? 'light'].success}
                                        backgroundInactive={Colors[colorScheme ?? 'light'].light}
                                        circleActiveColor={Colors[colorScheme ?? 'light'].light}
                                        circleInActiveColor={Colors[colorScheme ?? 'light'].success}
                                        changeValueImmediately={true}
                                        innerCircleStyle={{ alignItems: "center", justifyContent: "center" }}
                                        renderActiveText={formData.SaleAssistance}
                                        renderInActiveText={formData.SaleAssistance === false}
                                        switchLeftPx={7}
                                        switchRightPx={7}
                                        switchWidthMultiplier={2}
                                        switchBorderRadius={30}
                                    />
                                </View>
                            </View>
                        )}
                        <View className="flex flex-row justify-between gap-5">
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
    // If camera is showing, render camera instead of main content
    if (showCamera) {
        return renderCamera();
    }
    return (
        <KeyboardAvoidingView style={[styles.flexOne]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            contentContainerStyle={[styles.background, { marginTop: insets.top, paddingBottom: insets.bottom }]}>
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    backgroundColor: Colors[colorScheme ?? 'light'].background, flexGrow: 1,
                    paddingHorizontal: 15, paddingTop: insets.top, paddingBottom: insets.bottom + 20
                }}
            >
                <View className="flex flex-row items-start gap-5 mb-4 mt-5">
                    <View>
                        <TouchableOpacity style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
                            onPress={() => { goBack() }}>
                            <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1">
                        <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.lg }]}>Créer une nouvelle annonce</ThemedText>
                        <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0, lineHeight: 16 }]}>Remplissez le formulaire pour créer une nouvelle annonce</ThemedText>
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
        </KeyboardAvoidingView>
    );
}
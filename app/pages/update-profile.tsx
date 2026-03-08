import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useGlobalStyles } from '../_styles/globalStyle';
import { useSession } from '../_services/ctx';
import { Feather, Ionicons } from '@expo/vector-icons'; 
import { apiCall } from '../_services/api';
import { vmSearchObj } from '../_models/vmSearch';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../_services/uploadService'; 
import { router } from 'expo-router';
import { Switch } from "react-native-switch";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

const UpdateProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const { logout, user, session, setUser } = useSession();
    const searchObj = new vmSearchObj();
    const [userName, setUserName] = useState(user?.Username);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDOB] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState(user?.Email);
    const [title, setTitle] = useState('');
    const [qrbalance, setQRbalance] = useState('');
    const [ownerID, setOwnerID] = useState('');
    const [defaultLanguage, setDefaultLanguage] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState(user?.UserId);
    const [mobilePin, setMobilePin] = useState('');
    const [Gender, setGender] = useState('');
    const [Profile, setProfile] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [isUploadButton, setIsUploadButton] = useState(true)
    const [PhotoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [attributes, setAttributes] = useState<any>('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [SendEmailNotifications, setSendEmailNotifications] = useState<boolean>(false);
    const validate = () => {
        const errors: { [key: string]: string } = {};
        if (!firstName?.trim()) errors.firstName = "Le prénom est requis.";
        if (!lastName?.trim()) errors.lastName = "Le nom de famille est requis.";
        if (!phone?.trim()) errors.phone = "Le numéro de téléphone est requis.";
        if (!address?.trim()) errors.address = "L'adresse est requise.";
        return errors;
    };

    const pickAndUploadImage = async () => {
        setIsUploadButton(false);
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            setIsUploadButton(true);
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });
        if (result.canceled) {
            setIsUploadButton(true);
            return;
        }
        const photoUri = result.assets[0].uri;
        if (!result.canceled) {
            const obj = { height: 200, width: 200, folder: 'UF' }; // Example object
            try {
                setLoading(true);
                const response = await uploadFile(photoUri, obj.folder, session?.token ?? ''); // Ensure 'token' is the correct property name
                console.log(response);
                setAttributes((prev: any) => ({
                    ...prev,
                    PhotoURL: response.FileName
                }));
                setPhotoUrl(`https://api.allomotors.fr/Content/WebData/UF/${response.FileName}`);
                setPhotoUri(null);
                setLoading(false);
                setIsUploadButton(true);
                // Optionally handle the response, e.g., set a state or navigate
            } catch (error) {
            } finally {
                setIsUploadButton(true);
                setLoading(false);
            }
        }
    };
    const UpdateProfile = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsUploadButton(false);
        setLoading(true);
        let NewAttributes = attributes ? JSON.stringify(attributes) : null;
        console.log(NewAttributes);
        const data = {
            UserName: userName,
            FirstName: firstName,
            LastName: lastName,  // Fixed incorrect property name
            Phone: phone,
            Dob: dob || null,  // Ensures null if undefined
            Address: address,
            CreateDate: new Date().toISOString(),
            LastLoginDate: new Date().toISOString(),
            IsLockedOut: false,
            IsApproved: true,
            Email: email,
            UserId: userId,
            Title: title,
            Qrbalance: qrbalance || 0,
            Password: password,
            OwnerID: ownerID || null,
            Attributes: NewAttributes,
            DefaultLanguage: defaultLanguage || '',
            MobilePin: mobilePin || '',
            SendEmailNotifications: SendEmailNotifications,
        };

        try {
            const response = await apiCall('post', '/Account/UpdateUser', new vmSearchObj(), data);
            if (response.status === 200 || response.status === 204 || response.statusText === 'Ok') {
                if (user) {
                    Alert.alert('Profil mis à jour', 'Le profil a été mis à jour avec succès.');
                    // await setStorageItemAsync('user', JSON.stringify(user));
                    setErrors({});
                }
            }
        } catch (error) {
            console.error("Update Profile Error:", error);
            Alert.alert('Échec de la mise à jour', 'Veuillez apporter quelques modifications et réessayer.');
        } finally {
            setIsUploadButton(true);
            setLoading(false);
        }
    };
    const signOut = async () => {
        await logout();
    }
    const LoadProfile = async (userId: any) => {
        if (userId) {
            setLoading(true);
            try {
                const response = await apiCall('get', `/Account/LoadProfile?userID=${userId}`, null, null);
                console.log("LoadProfile Response:", response);
                if (response.status == 200 || response.status == 204 || response.statusText == 'Ok') {

                    if (response.data?.Attributes) {
                        try {
                            response.data.Attributes = JSON.parse(response.data.Attributes) || {};
                            console.log(response.data.Attributes);
                        } catch (error) {
                            console.error("Failed to parse Attributes JSON:", error);
                            response.data.Attributes = {}; // Fallback to empty object
                        }
                    }

                    if (response.data && response.data.Attributes) {
                        setAttributes(response.data.Attributes);

                        if (response.data?.Attributes?.PhotoURL)
                            setPhotoUrl(`https://allomotors.fr/Content/WebData/UF/${response.data?.Attributes?.PhotoURL}`);
                        else
                            setPhotoUrl(null);
                        console.log(response.data.Attributes.PhotoURL);
                    }
                    setProfile(response.data);
                    setUserName(response.data.UserName);
                    setFirstName(response.data.FirstName);
                    setLastName(response.data.LastName);
                    setPhone(response.data.Phone);
                    setDOB(response.data.Dob);
                    setAddress(response.data.Address);
                    setEmail(response.data.Email);
                    setUserId(response.data.UserId);
                    setTitle(response.data.Title);
                    setQRbalance(response.data.Qrbalance);
                    setPassword(response.data.Password);
                    setOwnerID(response.data.OwnerID);
                    setDefaultLanguage(response.data.DefaultLanguage);
                    setMobilePin(response.data.MobilePin);
                    setSendEmailNotifications(response.data.SendEmailNotifications);

                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }
    }
    useEffect(() => {
        LoadProfile(user?.UserId);
    }, [user]);

    const DeleteAccount = async () => {
        try {
            setLoading(true);
            const response = await apiCall('post', `/Account/DeleteUser`, new vmSearchObj(), null);
            if (response.status == 200 || response.status == 204 || response.statusText == 'Ok') {
                Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
                await signOut();
                setLoading(false);
            }
        }
        catch (error) {
            console.error("Failed to fetch data:", error);
            setLoading(false);
        }
    }
    // Function to show confirmation dialog
    const confirmDeleteAccount = () => {
        Alert.alert(
            'Confirmer la suppression',
            'Cette action supprimera définitivement toutes vos données et votre compte de nos serveurs. Une fois supprimé, vous n\'aurez plus accès à Allo Motors.',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    onPress: () => DeleteAccount(), // Changed to French function name
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };
    const sampleItem = {
        MsgType: "AdClick",
        FullPath: "https://dev.allomotors.fr//Content/WebData/UF/",
        ChatAttributes: {
            AdvertAttributes: {
                IconURL: "bd87f570-41c6-4fcf-a56b-363d71188f2f-Citroen%20C3.png"
            },
            Title: "Luxury Car for Sale - Limited Offer!",
            Category: "Allomotors & Vehicles",
            ItemGuid: "12345-abcde"
        }
    };
    const goBack = () => {
        router.back();
    }
    return (
        // <KeyboardAvoidingView style={[styles.flexOne]} keyboardVerticalOffset={100}
        //     behavior={Platform.OS === 'ios' ? 'padding' : 'height'} contentContainerStyle={[styles.background, { marginTop: insets.top }]}>
        //     <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 15 }}>
        <KeyboardAvoidingView style={[styles.flexOne]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            contentContainerStyle={[styles.background, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    backgroundColor: Colors[colorScheme ?? 'light'].background, flexGrow: 1, justifyContent: 'center',
                    paddingHorizontal: 15, marginTop: insets.top, paddingBottom: insets.bottom
                }}
            >

                <View style={[styles.flexOne]}>
                    <View style={[styles.primary, styles.itemCenter, styles.justifyCenter, styles.relativePosition, { padding: 20, borderRadius: 10, marginTop: 20 }]}>
                        <TouchableOpacity style={[styles.flexRow, styles.itemCenter, styles.justifyCenter, styles.roundedCircle, styles.absolutePosition, 
                        { top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: Colors[colorScheme ?? 'light'].white }]}
                            onPress={() => { goBack() }}>
                            <Ionicons name="chevron-back" size={18} color="black" />
                        </TouchableOpacity>

                        {/* <TouchableOpacity
                            style={[styles.flexRow, styles.itemCenter, styles.justifyCenter, styles.roundedCircle, styles.absolutePosition, { top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: Colors[colorScheme ?? 'light'].white }]}
                            onPress={signOut} >
                            <Feather name="log-out" size={18} color="black" style={[styles.fontBold]} />
                        </TouchableOpacity> */}

                        <View style={[styles.relativePosition, { marginBottom: 10, }]}>
                            {photoUri ? <Image style={[styles.roundedCircle]} source={{ uri: photoUri }}
                                resizeMode="cover" width={100} height={100} /> :
                                PhotoUrl && PhotoUrl != "" ? <Image style={[styles.roundedCircle]} source={{ uri: PhotoUrl }}
                                    resizeMode="cover" width={100} height={100} />
                                    :
                                    <Image style={[styles.roundedCircle, { height: 100, width: 100, tintColor: 'white' }]} source={require('../../assets/img/avatar.png')}
                                        resizeMode="cover" />
                            }
                            {isUploadButton && (
                                <TouchableOpacity style={[styles.roundedCircle, styles.absolutePosition, { padding: 5, backgroundColor: Colors[colorScheme ?? 'light'].warning, bottom: 5, right: 0 }]}
                                    onPress={pickAndUploadImage} >
                                    <Feather name="camera" size={10} color="black" className='font-bold' />
                                </TouchableOpacity>
                            )}
                        </View>
                        <ThemedText type='subtitle' lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.textCenter, styles.fontBold]}> {Profile?.FirstName || ""} {Profile?.LastName || ""} </ThemedText>
                        <ThemedText type='default' lightColor={Colors[colorScheme ?? 'light'].lighter} style={[styles.textCenter]}> {Profile?.UserName || ""} </ThemedText>
                    </View>
                    <View style={[{ marginVertical: 20 }]}>
                        <View style={[{ marginBottom: 10 }]}>
                            <Text style={[styles.text]}>Prénom</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                placeholder="Prénom"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                            {errors.firstName && <Text style={[styles.colorDanger, { marginLeft: 15 }]}>{errors.firstName}</Text>}
                        </View>
                        <View style={[{ marginBottom: 10 }]}>
                            <Text style={[styles.text]}>Nom de famille</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                placeholder="Nom de famille"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                            {errors.lastName && <Text style={[styles.colorDanger, { marginLeft: 15 }]}>{errors.lastName}</Text>}
                        </View>
                        <View style={[{ marginBottom: 10 }]}>
                            <Text style={[styles.text]}>Numéro de téléphone</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                placeholder="Numéro de téléphone"
                                value={phone}
                                onChangeText={setPhone}
                            />
                            {errors.phone && <Text style={[styles.colorDanger, { marginLeft: 15 }]}>{errors.phone}</Text>}
                        </View>
                        <View style={[{ marginBottom: 10 }]}>
                            <Text style={[styles.text]}>Adresse</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                placeholder="Adresse"
                                value={address}
                                onChangeText={setAddress}
                            />
                            {errors.address && <Text style={[styles.colorDanger, { marginLeft: 15 }]}>{errors.address}</Text>}
                        </View>
                        <View className="flex flex-row items-center gap-2 mb-5">
                            <View className="flex-1">
                                <ThemedText type="defaultSemiBold" style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 22 }]}>Notifications par e-mail </ThemedText>
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Nous vous enverrons une notification par email concernant les mises à jour de vos annonces à différentes étapes </ThemedText>
                                {errors.HidePrice && <Text className="text-red-500">{errors.HidePrice}</Text>}
                            </View>
                            <View>
                                <Switch
                                    value={SendEmailNotifications}
                                    onValueChange={(val) => setSendEmailNotifications(val)} // console.log(val)}
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
                                    renderActiveText={SendEmailNotifications}
                                    renderInActiveText={SendEmailNotifications === false}
                                    switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                                    switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                                    switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                                    switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                                />
                            </View>
                        </View>

                    </View>
                    <View>
                        <TouchableOpacity style={[styles.button, { paddingHorizontal: 15, paddingVertical: 15, backgroundColor: Colors[colorScheme ?? 'light'].primary, marginBottom: 15 }]}
                            onPress={UpdateProfile}>
                            <ThemedText type='default' lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.textCenter, styles.fontBold]}>Mettre à jour</ThemedText>
                        </TouchableOpacity>
                        {/* <View className='flex flex-row items-center mb-4'>
                            <View className='h-0.5 flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].lighter }}></View>
                            <ThemedText className='mx-2'>Ou</ThemedText>
                            <View className='h-0.5 flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].lighter }}></View>
                        </View>
                        <TouchableOpacity style={[styles.button, { paddingHorizontal: 15, paddingVertical: 15, backgroundColor: Colors[colorScheme ?? 'light'].danger, marginBottom: 20 }]}
                            onPress={confirmDeleteAccount}>
                            <ThemedText type='default' lightColor={Colors[colorScheme ?? 'light'].white} darkColor={Colors[colorScheme ?? 'light'].white} style={[styles.textCenter, styles.fontBold]}>Compte supprimé</ThemedText>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default UpdateProfileScreen
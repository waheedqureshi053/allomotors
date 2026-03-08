import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalStyles } from './_styles/globalStyle';
import { useSession } from './_services/ctx';
import { router } from 'expo-router';
import { Switch } from 'react-native-switch';
import { Ionicons } from '@expo/vector-icons';
import { wrapAttributes } from '@/utils/attributes';
import { apiCall } from './_services/api';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

const SignUp = () => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES, } = useGlobalStyles();
    const { register } = useSession();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    //const [groupOptions, SetGroupOptions] = useState<any>();
    const [userGroups, setUserGroups] = useState<any[]>([]);
    const [genderOptions, setGenderOptions] = useState([
        { id: "Male", name: "Monsieur" },
        { id: "Female", name: "Madame" },
        { id: "NA", name: "Ne spécifiez pas" },
    ]);
    const steps = [
        { id: 1, name: "Compte" },
        { id: 2, name: "Infos" },
        { id: 3, name: "Personnel" },
        { id: 4, name: "Sécurité" },
    ];
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        UserGroupID: 0,
        UserType: '',
        Type: '',
        DefaultLanguage: 'fr',
        UserName: '',
        Email: '',
        Phone: '',
        Address: '',
        City: '',
        State: '',
        PostalCode: '',
        RegNum: '',
        Title: '',
        Gender: 'Male',
        FirstName: '',
        LastName: '',
        Newsletters: false,
        Password: '',
        Password2: '',
        Terms: false,
    });
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
    };
    const validatePassword = (password: string) => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push("Au moins 8 caractères");
        }
        if (!/[a-z]/.test(password)) {
            errors.push("Une lettre minuscule est manquante");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("Une lettre majuscule est manquante");
        }
        if (!/[0-9]/.test(password)) {
            errors.push("Un chiffre est manquant");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push("Un caractère spécial est manquant");
        }

        return errors;
    };
    const handleValidation = () => {
        const passwordErrors = validatePassword(formData.Password);
        const newErrors: any = {};
        if (passwordErrors.length > 0) {
            newErrors.Password = passwordErrors.join(", ");
        }
        if (formData.Password !== formData.Password2) {
            newErrors.Password2 = "Les mots de passe ne correspondent pas";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validate = () => {
        const errors: { [key: string]: string } = {};
        if (step === 1) {
            if (!formData.UserGroupID || formData.UserGroupID == 0) errors.UserGroupID = "Le groupe d'utilisateur est requis.";
        } else if (step === 2) {
            if (!formData.Email?.trim()) errors.Email = "Email est requis.";
            if (!emailRegex.test(formData.Email.trim()))
                errors.Email = "Email n'est pas valide.";
            if (!formData.Address?.trim()) errors.Address = "L'adresse est requise.";
            if (!formData.City?.trim()) errors.City = "La ville est requise.";
            if (!formData.State?.trim()) errors.State = "Le pays est requis.";
            if (!formData.PostalCode?.trim()) errors.PostalCode = "Le code postal est requis.";
            if (!formData.Phone?.trim()) errors.Phone = "Le numéro de téléphone est requis.";
            if (formData.UserGroupID != 3) {
                if (!formData.RegNum) errors.RegNum = "Le numéro d'enregistrement est requis.";
                if (!formData.Title) errors.Title = "Le nom de l'entreprise est requis.";
            }
        } else if (step === 3) {
            if (!formData.FirstName?.trim()) errors.FirstName = "Le prénom est requis.";
            if (!formData.LastName?.trim()) errors.LastName = "Le nom de famille est requis.";
        } else if (step === 4) {
            if (!formData.Password?.trim()) errors.Password = "Le mot de passe est requis.";
            if (!formData.Password2?.trim()) errors.Password2 = "La confirmation du mot de passe est requise.";
            if (!formData.Terms) errors.Terms = "Les conditions doivent être acceptées.";
        } else {
        }
        return errors;
    };
    const handleRegister = async () => {
        if (handleValidation()) {
            setLoading(true);
            try {
                const validationErrors = validate();
                if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors);
                    return;
                }
                formData.UserType = userGroups.find((item: any) => item.Id == formData.UserGroupID)?.Title;
                formData.UserName = formData.Email;
                console.log("Data to Register User:", formData);
                let obj = wrapAttributes(formData, 'User');
                console.log(obj);
                await register(obj);
            }
            catch (error) {
                console.log(error);
            }
            finally {
                setLoading(false);
            }
        }
    };
    const goBack = () => {
        router.back();
    };
    const LoadUserGroupsList = async () => {
        setLoading(true);
        try {
            const response = await apiCall(
                'GET',
                '/Account/LoadUserGroupsList',
                null,
                null
            );
            console.log('API Response:', response?.data[0]);

            let groups = response?.data;

            //Safety: handle JSON string response
            if (typeof groups === 'string') {
                groups = JSON.parse(groups);
            }


            if (Array.isArray(groups)) {
                //const activeGroups = groups.filter((group: any) => group.IsPublic == true ); 
                const allowedDisplayNames = ['Particulier', 'Pro', 'Pro+', 'Pro Lite', 'Pro lite'];
                const sortOrder = ['Particulier', 'Pro Lite', 'Pro lite', 'Pro+', 'Pro'];
                // Filter public groups with allowed DisplayNames
                const UserGroupsList = groups.filter(function (s: any) {
                    //return s.IsPublic === true && allowedDisplayNames.includes(s.DisplayName);
                    return allowedDisplayNames.includes(s.DisplayName);
                    //return s;
                });

                // Split Permissions into array
                UserGroupsList.forEach((listItem: any) => {
                    listItem.PermissionsArr = listItem.Permissions ? listItem.Permissions.split(",") : [];
                });

                // Sort the array according to custom order
                UserGroupsList.sort(function (a: any, b: any) {
                    return sortOrder.indexOf(a.DisplayName) - sortOrder.indexOf(b.DisplayName);
                });
                setUserGroups(UserGroupsList);
                //console.log('Filtered User Groups:', UserGroupsList);
            } else {
                console.warn('Expected array but received:', groups);
            }

        } catch (error) {
            console.error('Failed to fetch user groups list:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        LoadUserGroupsList();
    }, []);
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View>
                        <ThemedText type='title' style={[{ marginTop: 10, fontSize: 35, fontWeight: 'bold', lineHeight: 35, textAlign: 'center' }]}>Créer un compte</ThemedText>
                        <ThemedText type='default' style={[{ fontSize: FONT_SIZES.xs, textAlign: 'center', lineHeight: 15, }]}>Profitez d'une expérience personnalisée avec du contenu lié à votre activité et à vos intérêts sur notre service.</ThemedText>
                        <View className='mt-10 mb-5'>
                            <ThemedText type="default" className="mb-2">Publique ou Professionel</ThemedText>
                            <View className='flex flex-column gap-2'>
                                {userGroups != null && userGroups.length > 0 && (
                                    <>
                                        {userGroups.map((item: any, index: number) => (
                                            <TouchableOpacity className='mb-3 p-4 text-center rounded-md flex flex-row justify-center gap-3'
                                                style={[formData.UserGroupID === item?.Id ? styles.danger : styles.lighter]}
                                                key={index}
                                                onPress={() => setFormData({ ...formData, UserGroupID: item?.Id })}>
                                                {formData.UserGroupID === item?.Id && <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].white} />}
                                                <ThemedText type='default'
                                                    style={[styles.fontBold, styles.textCenter]}
                                                    lightColor={formData.UserGroupID === item?.Id ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}
                                                    darkColor={formData.UserGroupID === item?.Id ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].white}
                                                > {item?.DisplayName} </ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                )
                                }
                            </View>
                            <ThemedText type='default' style={[{ color: Colors[colorScheme ?? 'light'].light, fontSize: FONT_SIZES.xs, lineHeight: 15, }]}>
                                Agissez-vous dans le cadre professionnel ? Créez plutôt un compte Pro !
                            </ThemedText>
                            {errors.UserGroupID && <Text className="text-red-500">{errors.UserGroupID}</Text>}
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
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Email</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Email"
                                autoCapitalize='none'
                                value={formData.Email}
                                onChangeText={(text) => setFormData({ ...formData, Email: text })} />
                            {errors.Email && <Text className="text-red-500">{errors.Email}</Text>}
                        </View>
                        {formData.UserGroupID != 3 ? (
                            <>
                                <View className="mb-4">
                                    <ThemedText type="default" className="mb-2">Numéro d'enregistrement de l'entreprise</ThemedText>
                                    <TextInput style={[styles.input]}
                                        placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                        underlineColorAndroid="transparent"
                                        placeholder="Numéro d'enregistrement de l'entreprise"
                                        value={formData.RegNum}
                                        onChangeText={(text) => setFormData({ ...formData, RegNum: text })} />
                                    {errors.RegNum && <Text className="text-red-500">{errors.RegNum}</Text>}
                                </View>
                                <View className="mb-4">
                                    <ThemedText type="default" className="mb-2">Titre de l'entreprise</ThemedText>
                                    <TextInput style={[styles.input]}
                                        placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                        underlineColorAndroid="transparent"
                                        placeholder="Titre de l'entreprise"
                                        value={formData.Title}
                                        onChangeText={(text) => setFormData({ ...formData, Title: text })} />
                                    {errors.Title && <Text className="text-red-500">{errors.Title}</Text>}
                                </View>
                            </>
                        )
                            : null
                        }
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Téléphone</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Téléphone"
                                keyboardType='phone-pad'
                                value={formData.Phone}
                                onChangeText={(text) => setFormData({ ...formData, Phone: text })} />
                            {errors.Phone && <Text className="text-red-500">{errors.Phone}</Text>}
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Adresse</ThemedText>
                            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                multiline={true}
                                numberOfLines={4}
                                returnKeyType="default"
                                blurOnSubmit={false}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Adresse"
                                value={formData.Address}
                                onChangeText={(text) => setFormData({ ...formData, Address: text })} />
                            {errors.Address && <Text className="text-red-500">{errors.Address}</Text>}
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Ville</ThemedText>
                            {/* Ville  */}
                            
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Ville"
                                value={formData.City}
                                onChangeText={(text) => setFormData({ ...formData, City: text })} />
                            {errors.City && <Text className="text-red-500">{errors.City}</Text>}
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Pays</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Pays"
                                value={formData.State}
                                onChangeText={(text) => setFormData({ ...formData, State: text })} />
                            {errors.State && <Text className="text-red-500">{errors.State}</Text>}
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Code postal</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Code postal"
                                value={formData.PostalCode}
                                onChangeText={(text) => setFormData({ ...formData, PostalCode: text })} />
                            {errors.PostalCode && <Text className="text-red-500">{errors.PostalCode}</Text>}
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
                        <ThemedText type="default" className="mb-2">Le genre</ThemedText>
                        <View className='flex flex-column gap-2 mb-4'>
                            {genderOptions.map((item: any, index: number) => (
                                <TouchableOpacity className='rounded-md flex flex-row flex-start p-3 gap-3'
                                    style={[formData.Gender === item?.id ? styles.danger : styles.lighter]}
                                    key={index}
                                    onPress={() => setFormData({ ...formData, Gender: item?.id })}>
                                    {formData.Gender === item?.id && <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].white} />}
                                    <ThemedText type='default'
                                        style={[styles.fontBold]}
                                        lightColor={formData.Gender === item?.id ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}
                                        darkColor={formData.Gender === item?.id ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}>
                                        {item?.name}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Prénom</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Prénom"
                                value={formData.FirstName}
                                onChangeText={(text) => setFormData({ ...formData, FirstName: text })} />
                            {errors.FirstName && <Text className="text-red-500">{errors.FirstName}</Text>}
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Nom de famille</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Nom de famille"
                                value={formData.LastName}
                                onChangeText={(text) => setFormData({ ...formData, LastName: text })} />
                            {errors.LastName && <Text className="text-red-500">{errors.LastName}</Text>}
                        </View>
                        <View className="flex flex-row items-center gap-2 mb-5">
                            <View className="flex-1">
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>
                                    Recevez nos newsletters sur les nouvelles fonctionnalités, les offres promotionnelles actuelles et les tendances de recherche.
                                </ThemedText>
                                {errors.Newsletter && <Text className="text-red-500">{errors.Newsletter}</Text>}
                            </View>
                            <View>
                                <Switch
                                    value={formData.Newsletters}
                                    onValueChange={(val) => setFormData({ ...formData, Newsletters: val })}
                                    activeText={'Yes'}
                                    inActiveText={'No'}
                                    circleSize={30}
                                    barHeight={30}
                                    circleBorderWidth={0}
                                    backgroundActive={Colors[colorScheme ?? 'light'].success}
                                    backgroundInactive={Colors[colorScheme ?? 'light'].light}
                                    circleActiveColor={Colors[colorScheme ?? 'light'].light}
                                    circleInActiveColor={Colors[colorScheme ?? 'light'].success}
                                    changeValueImmediately={true}
                                    innerCircleStyle={{ alignItems: "center", justifyContent: "center" }}
                                    renderActiveText={formData.Newsletters}
                                    renderInActiveText={formData.Newsletters === false}
                                    switchLeftPx={7}
                                    switchRightPx={7}
                                    switchWidthMultiplier={2}
                                    switchBorderRadius={30}
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
                                            className="text-white font-bold text-center uppercase">Procéder</ThemedText>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );
            case 4:
                return (
                    <View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Mot de passe</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Mot de passe"
                                secureTextEntry
                                autoCapitalize='none'
                                value={formData.Password}
                                onChangeText={(text) => setFormData({ ...formData, Password: text })} />
                            {errors.Password && <Text className="text-red-500">{errors.Password}</Text>}
                            {validatePassword(formData.Password).map((e, i) => (
                                <Text key={i} className="text-xs text-red-500">• {e}</Text>
                            ))}
                        </View>
                        <View className="mb-4">
                            <ThemedText type="default" className="mb-2">Confirmer le mot de passe</ThemedText>
                            <TextInput style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                underlineColorAndroid="transparent"
                                placeholder="Confirmer le mot de passe"
                                secureTextEntry
                                autoCapitalize='none'
                                value={formData.Password2}
                                onChangeText={(text) => setFormData({ ...formData, Password2: text })} />
                            {errors.Password2 && <Text className="text-red-500">{errors.Password2}</Text>}
                        </View>
                        <View className="flex flex-row items-center gap-2 mb-2">
                            <View className="flex-1">
                                <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>
                                    Je suis d'accord.
                                </ThemedText>
                                {errors.Terms && <Text className="text-red-500">{errors.Terms}</Text>}
                            </View>
                            <View>
                                <Switch
                                    value={formData.Terms}
                                    onValueChange={(val) => setFormData({ ...formData, Terms: val })}
                                    activeText={'Yes'}
                                    inActiveText={'No'}
                                    circleSize={30}
                                    barHeight={30}
                                    circleBorderWidth={0}
                                    backgroundActive={Colors[colorScheme ?? 'light'].success}
                                    backgroundInactive={Colors[colorScheme ?? 'light'].light}
                                    circleActiveColor={Colors[colorScheme ?? 'light'].light}
                                    circleInActiveColor={Colors[colorScheme ?? 'light'].success}

                                    changeValueImmediately={true}
                                    innerCircleStyle={{ alignItems: "center", justifyContent: "center" }}
                                    renderActiveText={formData.Terms}
                                    renderInActiveText={formData.Terms === false}
                                    switchLeftPx={7}
                                    switchRightPx={7}
                                    switchWidthMultiplier={2}
                                    switchBorderRadius={30}
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
                                <TouchableOpacity className="py-4 px-2" onPress={() => { handleRegister() }}
                                    disabled={loading}
                                    style={[styles.button, styles.primary, loading && styles.danger]} >
                                    {loading ? (<ActivityIndicator size="small" color='white' />) : (
                                        <View className="flex flex-row items-center gap-2">
                                            <ThemedText type="default" lightColor="#fff" darkColor="#fff"
                                                className="text-white font-bold text-center">Inscription</ThemedText>
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
        <KeyboardAvoidingView style={[styles.flexOne]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            contentContainerStyle={[styles.background, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <ScrollView 
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, backgroundColor: Colors[colorScheme ?? 'light'].background, paddingHorizontal: 15, paddingTop: insets.top }}>
                <View className='position-relative p-5'>
                    <View style={[styles.background, { marginBottom: 10 }]}>
                        <Image source={require('../assets/img/logo-trans.png')} resizeMode="contain" tintColor={Colors[colorScheme ?? "light"].light} style={{ width: "100%", height: 80 }} />
                    </View>
                    <TouchableOpacity style={[styles.btnIcon, styles.roundedCircle, styles.primary, styles.absolutePosition, { top: 30, left: 10, zIndex: 10 }]}
                        onPress={() => { goBack() }}>
                        <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                    </TouchableOpacity>
                </View>
                <View className="flex flex-row flex-wrap items-center gap-2 mb-4">
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
                {loading ? (
                    <View style={[styles.background, styles.flexOne, styles.justifyCenter, styles.itemCenter]}>
                        <View className="flex flex-row items-center justify-center">
                            <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />
                            <Text className="ml-5" style={{ color: Colors[colorScheme ?? 'light'].text }}>
                                Chargement...
                            </Text>
                        </View>
                    </View>
                ) : (
                    <>
                        {renderStep()}
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
export default SignUp
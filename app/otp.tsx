
import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { useGlobalStyles } from "./_styles/globalStyle"; 
import { ScrollView } from "react-native";
import { ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

export default function OTPScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const [loading, setLoading] = useState(false);
    const Customstyles = StyleSheet.create({
        container: {
            width: 'auto',
            height: 'auto',
            borderRadius: 10,
            //marginTop: 30,
            padding: 15,
            backgroundColor: Colors[colorScheme ?? 'light'].lighter,
            justifyContent: "center",
            alignItems: "center",
        },
        pinCodeContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            margin: 5,
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            justifyContent: "center",
            alignItems: "center",
        },
        pinCodeText: {
            fontSize: FONT_SIZES.xl,
            fontWeight: "bold",
            color: Colors[colorScheme ?? 'light'].text,
        },
        focusStick: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: Colors[colorScheme ?? 'light'].danger,
        },
        activePinCodeContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            justifyContent: "center",
            alignItems: "center",
        },
        inactivePinCodeContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            justifyContent: "center",
            alignItems: "center",
        },
        placeholderText: {
            fontSize: FONT_SIZES.xl,
            fontWeight: "bold",
            color: Colors[colorScheme ?? 'light'].light,
        },
        filledPinCodeContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            justifyContent: "center",
            alignItems: "center",
        },
        disabledPinCodeContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: Colors[colorScheme ?? 'light'].primary,
            justifyContent: "center",
            alignItems: "center",
        },
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState({
        Email: '',
        OTP: ''
    });

    const validateOTP = () => {
        const errors: { [key: string]: string } = {};
        if (!formData.Email?.trim()) errors.Email = "L'email est requis.";
        if (!formData.OTP?.trim() || formData.OTP.length !== 4) {
            errors.OTP = "Le code de vérification (OTP) est requis et doit contenir 4 chiffres.";
        }
        return errors;
    };

    const validateGetOTP = () => {
        const errors: { [key: string]: string } = {};
        if (!formData.Email?.trim()) errors.Email = "Email est requis.";
        return errors;
    };


    const handleVerifyOTP = async () => {
        setLoading(true);
        try {
            const validationErrors = validateOTP();
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
            let obj = {
                OTP: formData.OTP,
                Email: formData.Email,
                UserName: formData.Email
            };
            const response: any = await fetch("https://allomotors.fr/Api/Account/VerifyOTP", {
                method: "POST",
                headers: {
                    'Accept': '*/*',
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(obj),
            });
            const data = await response.json();
            console.log(data);
            Alert.alert("Vérification réussie", "Vérification effectuée avec succès, veuillez vous connecter à votre compte.");
            router.replace("/sign-in");

            // console.log(response);
            // if (response?.statusCode == 1) {
            //     Alert.alert("Successfully Verified", "Verification successful please login to your account");
            //     router.replace("/sign-in");
            // }
            // else if (response?.statusCode == 2) {
            //     Alert.alert("OTP Expired!", "OTP Expired, please get a new one");
            //     router.replace("/sign-in");
            // }
            // else {
            //     Alert.alert("Terminé!", "Le mot de passe a été mis à jour, veuillez vous connecter.");
            // }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    };
    const GetOTP = async () => {
        setLoading(true);
        try {
            const validationErrors = validateGetOTP();
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
            let obj = {
                Email: formData.Email,
                UserName: formData.Email
            };
            const response = await fetch("https://allomotors.fr/Api/Account/GetOTP", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(obj),
            });
            const data = await response.json();
            console.log(data);
            if (data.statusCode == 1) {
                Alert.alert("OTP envoyé avec succès", "Le code de vérification a été envoyé à votre adresse e-mail.");
            } else {
                Alert.alert("Oups!", "Une erreur s'est produite, veuillez réessayer.");
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={[styles.flexOne]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            contentContainerStyle={[styles.background, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    backgroundColor: Colors[colorScheme ?? 'light'].background, flexGrow: 1, justifyContent: 'center',
                    paddingHorizontal: 15, paddingTop: insets.top
                }}
            >
                <View className="flex flex-col justify-center">
                    <View className="mb-10 flex items-center">
                        <View className="flex flex-row items-center justify-center p-5" style={[styles.danger, styles.btnShadow, { width: 100, height: 100, borderRadius: 50 }]}>
                            <Ionicons name="lock-open" size={60} color={Colors[colorScheme ?? 'light'].white} />
                        </View>
                    </View>
                    <View className="mb-5">
                        <ThemedText type="title" style={[styles.textCenter]}>Vérification par e-mail</ThemedText>
                        <ThemedText type="default"
                            style={[styles.textCenter, { fontSize: FONT_SIZES.md, lineHeight: 18, color: Colors[colorScheme ?? 'light'].light }]}>
                            Nous avons envoyé un code de vérification à votre adresse e-mail. Veuillez entrer le code ci-dessous pour vérifier votre compte.
                        </ThemedText>
                    </View>
                    <View className="mb-3">
                        <ThemedText type="default" className="mb-2">Email</ThemedText>
                        <TextInput style={[styles.input]}
                            placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                            underlineColorAndroid="transparent"
                            autoCorrect={false}
                            autoCapitalize='none'
                            keyboardType="email-address"
                            placeholder="Email"
                            value={formData.Email}
                            onChangeText={(text) => setFormData({ ...formData, Email: text })} />
                        {errors.Email && <Text className="text-red-500">{errors.Email}</Text>}
                    </View>
                    <View className="mb-5">
                        <ThemedText type="default" className="mb-2">OTP Code</ThemedText>
                        <OtpInput
                            numberOfDigits={4}
                            focusColor={Colors[colorScheme ?? 'light'].danger}
                            autoFocus={false}
                            hideStick={true}
                            placeholder="******"
                            blurOnFilled={true}
                            disabled={false}
                            type="numeric"
                            secureTextEntry={false}
                            focusStickBlinkingDuration={500}
                            onFocus={() => console.log("Focused")}
                            onBlur={() => { console.log("Blurred : ", formData.OTP) }}
                            onTextChange={(text) => { setFormData({ ...formData, OTP: text }); console.log(formData.OTP) }}
                            onFilled={(text) => { setFormData({ ...formData, OTP: text }); console.log(`OTP is ${formData.OTP}`) }}
                            textInputProps={{
                                accessibilityLabel: "One-Time Password",
                            }}
                            textProps={{
                                accessibilityRole: "text",
                                accessibilityLabel: "OTP digit",
                                allowFontScaling: false,
                            }}
                            theme={{
                                containerStyle: Customstyles.container,
                                pinCodeContainerStyle: Customstyles.pinCodeContainer,
                                pinCodeTextStyle: Customstyles.pinCodeText,
                                focusStickStyle: Customstyles.focusStick,
                                focusedPinCodeContainerStyle: Customstyles.activePinCodeContainer,
                                placeholderTextStyle: Customstyles.placeholderText,
                                filledPinCodeContainerStyle: Customstyles.filledPinCodeContainer,
                                disabledPinCodeContainerStyle: Customstyles.disabledPinCodeContainer,
                            }}
                        />

                        {errors.OTP && <Text className="text-red-500">{errors.OTP}</Text>}
                    </View>
                    <TouchableOpacity
                        className='rounded-md'
                        style={[styles.danger, styles.btnShadow,
                        { width: '100%', paddingVertical: 15, borderRadius: 5, margin: 'auto', marginBottom: 10 }]}
                        onPress={() => { handleVerifyOTP(); }} disabled={loading}>
                        {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].white} />) : (
                            <ThemedText type="defaultSemiBold" style={[styles.colorWhite, { textAlign: 'center' }]}>Vérifier</ThemedText>
                        )}
                    </TouchableOpacity>
                    <View className='flex flex-row items-center mb-3'>
                        <View className='h-0.5 flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].lighter }}></View>
                        <ThemedText className='mx-2'>Ou</ThemedText>
                        <View className='h-0.5 flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].lighter }}></View>
                    </View>
                    <TouchableOpacity
                        className='rounded-md mb-5'
                        style={[styles.lighter,
                        { width: '100%', paddingVertical: 15, borderRadius: 5, margin: 'auto' }]}
                        onPress={() => { GetOTP(); }} disabled={loading}>
                        {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />) : (
                            <Text style={[styles.text, { textAlign: 'center' }]}>Obtenir un nouveau OTP</Text>
                        )}
                    </TouchableOpacity>




                    <View className='flex flex-row justify-center'>
                        <Link href={'/sign-in'} asChild>
                            <TouchableOpacity >
                                <ThemedText type="link">Retour à la connexion</ThemedText>
                            </TouchableOpacity>
                        </Link>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
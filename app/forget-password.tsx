
import { Alert, Platform, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { useGlobalStyles } from "./_styles/globalStyle";
import { ScrollView } from "react-native";
import { ActivityIndicator } from "react-native";
import { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

export default function ForgetPassScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { styles } = useGlobalStyles();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState({
        Email: ''
    });
    const validateGetOTP = () => {
        const errors: { [key: string]: string } = {};
        if (!formData.Email?.trim()) errors.Email = "Email est requis.";
        return errors;
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
                Alert.alert("Oups !", "Une erreur s'est produite, veuillez réessayer.");
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
                contentContainerStyle={{
                    backgroundColor: Colors[colorScheme ?? 'light'].background, flexGrow: 1, justifyContent: 'center',
                    paddingHorizontal: 15, paddingTop: insets.top
                }}
            >
                <View className="flex flex-col justify-center">
                    <View className="mb-10 flex items-center">
                        <View className="flex flex-row items-center justify-center p-5" style={[styles.danger, styles.btnShadow, { width: 100, height: 100, borderRadius: 50 }]}>
                            <FontAwesome name="envelope-open-o" size={60} color={Colors[colorScheme ?? 'light'].white} />
                        </View>
                    </View>
                    <View className="mb-5">
                        <ThemedText type="title" style={[styles.textCenter]}>Récupérez votre mot de passe oublié</ThemedText>
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

                    <TouchableOpacity
                        style={[styles.danger, styles.btnShadow,
                        { width: '100%', paddingVertical: 15, borderRadius: 5, margin: 'auto', marginBottom: 10 }]}
                        onPress={() => { GetOTP(); }} disabled={loading}>
                        {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].white} />) : (
                            <ThemedText type="defaultSemiBold" style={[styles.colorWhite, { textAlign: 'center' }]}>Soumettre</ThemedText>
                        )}
                    </TouchableOpacity>
                    <View className='flex flex-row items-center mb-3'>
                        <View className='h-0.5 flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].lighter }}></View>
                        <ThemedText className='mx-2'>Ou</ThemedText>
                        <View className='h-0.5 flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].lighter }}></View>
                    </View>
                    <TouchableOpacity
                        className='mb-5'
                        style={[styles.lighter,
                        { width: '100%', paddingVertical: 15, borderRadius: 5, margin: 'auto' }]}
                        onPress={() => { router.replace('/otp') }} disabled={loading}>
                        {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />) : (
                            <Text style={[styles.text, { textAlign: 'center' }]}>Vérification par e-mail</Text>
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
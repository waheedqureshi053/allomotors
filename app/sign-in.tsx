import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalStyles } from './_styles/globalStyle';
import { useSession } from './_services/ctx';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from '@/components/Checkbox';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

const SignIn = () => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES, } = useGlobalStyles();
    const { login } = useSession();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    useEffect(() => {
        const loadSavedCredentials = async () => {
            try {
                const savedEmail = await AsyncStorage.getItem('email');
                const savedPassword = await AsyncStorage.getItem('password');

                if (savedEmail && savedPassword) {
                    setEmail(savedEmail);
                    setPassword(savedPassword);
                    setRememberMe(true);
                }
            } catch (error) {
                console.error('Error loading saved credentials:', error);
            }
        };
        loadSavedCredentials();
    }, []);
    const validate = () => {
        const errors: { [key: string]: string } = {};
        if (!email?.trim()) errors.email = "Email est requis.";
        if (!password?.trim()) errors.password = "Le mot de passe est requis.";
        return errors;
    };
    const handleLogin = async () => {
        setLoading(true);
        try {
            if (rememberMe) {
                await AsyncStorage.multiSet([
                    ['email', email],
                    ['password', password],
                ]);
            } else {
                // Clear saved credentials if "Remember Me" is unchecked
                await AsyncStorage.multiRemove(['email', 'password']);
            }
            const validationErrors = validate();
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
            await login(email, password);
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
            contentContainerStyle={[styles.background, {paddingBottom: insets.bottom, paddingTop: insets.top}]}
            >
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    flexGrow: 1, 
                    // justifyContent: 'center',
                    paddingHorizontal: 15,
                    paddingVertical: insets.bottom
                }}
            >
                {/* marginTop: insets.top, paddingBottom: insets.bottom */}
                <Image source={require('../assets/img/network.png')} resizeMode='contain' style={{ height: 150, width: '100%', margin: 'auto' }} />
                <ThemedText type='title' style={[{ fontSize: 35, fontWeight: 'bold', lineHeight: 35, textAlign: 'center', marginTop: 20 }]}>Se connecter</ThemedText>
                <ThemedText style={[{ fontSize: FONT_SIZES.md, fontWeight: 'bold', textAlign: 'center' }]}>ALLO MOTORS</ThemedText>
                <View style={{ marginTop: 20 }}>
                    <View style={{ marginBottom: 10 }}>
                        <TextInput
                            style={[styles.input]}
                            placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                            placeholder='Email'
                            autoCapitalize='none'
                            value={email}
                            onChangeText={(text) => setEmail(text)} />
                        {errors.email && <Text style={[styles.colorDanger, { marginLeft: 15 }]}>{errors.email}</Text>}
                    </View>
                    <View style={{ marginBottom: 10 }}>
                        <View className='flex flex-row justify-end'>
                            <Link href={'/forget-password'} asChild>
                                <TouchableOpacity >
                                    <ThemedText type='link'>Mot de passe oublié ?</ThemedText>
                                </TouchableOpacity>
                            </Link>
                        </View>
                        <View className='position-relative'>
                            <TextInput
                                style={[styles.input]}
                                placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                                placeholder='Mot de passe'
                                secureTextEntry={!showPassword}
                                autoCapitalize='none'
                                value={password}
                                onChangeText={(text) => setPassword(text)} />
                            <TouchableOpacity style={[styles.btnPasswordEye]} onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={24} color={Colors[colorScheme ?? 'light'].light} />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={[styles.colorDanger, { marginLeft: 15 }]}>{errors.password}</Text>}
                    </View>
                    <View className='flex flex-row items-center justify-start gap-2 mb-4'>
                        <Checkbox
                            checked={rememberMe}
                            onPress={() => setRememberMe(!rememberMe)}
                        />
                        <ThemedText>Remember Password</ThemedText>
                    </View>
                    <TouchableOpacity
                        style={[styles.primary, styles.btnShadow,
                        { width: '100%', paddingVertical: 15, borderRadius: 5, margin: 'auto', marginBottom: 10 }]}
                        onPress={handleLogin} disabled={loading}>
                        {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].white} />) : (
                            <ThemedText type='defaultSemiBold' style={[styles.colorWhite, { textAlign: 'center' }]}>Se connecter</ThemedText>
                        )}
                    </TouchableOpacity>
                    <View className='flex flex-row items-center mb-3'>
                        <View className='flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].light, height: 1 }}></View>
                        <ThemedText className='mx-2'>Ou</ThemedText>
                        <View className='flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].light, height: 1 }}></View>
                    </View>
                    <TouchableOpacity
                        style={[styles.lighter,
                        { width: '100%', paddingVertical: 15, borderRadius: 5, margin: 'auto', marginBottom: 10, }]}
                        onPress={() => router.push('/sign-up')}>
                        <Text style={[styles.text, { textAlign: 'center', fontWeight: 'bold' }]}>Inscription</Text>
                    </TouchableOpacity>
                    <View className='flex flex-row justify-center py-4'>
                        <Link href={'/public-catalogs'} asChild>
                            <TouchableOpacity >
                                <ThemedText type='link' style={[{ fontSize: FONT_SIZES.lg, fontWeight: 'bold', textAlign: 'center' }]}>Catalogue Particulier</ThemedText>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
export default SignIn

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform,
    useColorScheme,
    Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useGlobalStyles } from '../_styles/globalStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { useSession } from '../_services/ctx';
import { expo } from '../../app.json'
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

const AppInfoScreen = () => {
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { company } = useSession();
    // App Info
    const appVersion = expo?.version;
    const appName = 'Allo Motors';

    const goBack = () => {
        navigation.goBack();
    };
    // Open URL
    const openLink = (url: any) => {
        Linking.openURL(url).catch((err) => console.error("Error opening link:", err));
    };

    // Send Email
    const sendEmail = () => {
        Linking.openURL('mailto:contact@allomotors.fr?subject=App Feedback');
    };

    // Rate App
    const rateApp = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('itms-apps://itunes.apple.com/app/idYOUR_APP_ID?action=write-review');
        } else {
            Linking.openURL('market://details?id=com.allmotorsi.app');
        }
    };

    return (
        <ScrollView className="flex-1"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={[styles.background]}
            contentContainerStyle={{ marginTop: insets.top, marginBottom: insets.bottom }}>
            <View className="flex-1 p-5">
                <TouchableOpacity className="absolute top-5 left-5 z-10" style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
                    onPress={() => { goBack() }}>
                    <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                </TouchableOpacity>
                <View className="mb-5 flex items-center">
                    <View className="flex flex-row items-center justify-center p-5" style={[styles.danger, styles.btnShadow, { width: 70, height: 70, borderRadius: 5 }]}>
                        {/* <Ionicons name="checkmark" size={30} color={Colors[colorScheme ?? 'light'].white} /> */}
                        <Image source={require('../../assets/img/logo-trans.png')} resizeMode="contain" tintColor={Colors[colorScheme ?? "light"].white} style={{ width: 60, height: 60 }} />
                    </View>
                </View>
                <View className="mb-5">
                    <ThemedText type="default" style={[styles.textCenter, styles.fontBold, { fontSize: FONT_SIZES.xxl, lineHeight: 30, marginBottom: 5 }]}>{appName}</ThemedText>
                    <ThemedText type="default"
                        style={[styles.textCenter, { fontSize: FONT_SIZES.xs, lineHeight: 15, color: Colors[colorScheme ?? 'light'].light }]}>
                        Version {appVersion}
                    </ThemedText>
                </View>

                {/* App Details */}
                <View style={[styles.card]}>
                    <View className="flex flex-row items-center mb-5">
                        <View className="flex flex-row items-center gap-3 flex-1">
                            <View className="">
                                <View className="rounded-md flex items-center" style={[styles.btnIconSM, styles.lighter]}>
                                    <Feather name="info" size={20} color={Colors[colorScheme ?? 'light'].light} />
                                </View>
                            </View>
                            <View className="flex-1">
                                <ThemedText type="default" style={[styles.fontBold]}>À propos de l’application</ThemedText>
                            </View>
                        </View>
                    </View>
                    <ThemedText type="default">
                        {company?.Attributes?.description ? company?.Attributes?.Description : 'Description non trouvée'}
                    </ThemedText>
                </View>
                {/* Developer Info */}
                <View style={[styles.card]}>
                    <View className="flex flex-row items-center mb-5">
                        <View className="flex flex-row items-center gap-3 flex-1">
                            <View className="">
                                <View className="rounded-md flex items-center" style={[styles.btnIconSM, styles.lighter]}>
                                    <Feather name="tool" size={20} color={Colors[colorScheme ?? 'light'].light} />
                                </View>
                            </View>
                            <View className="flex-1">
                                <ThemedText type="default" style={[styles.fontBold]}>Besoin d’aide !</ThemedText>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={sendEmail} className='py-4 px-4 rounded flex items-center' style={styles.danger}>
                        <ThemedText type="default" lightColor='#fff'>✉️ Contacter le support</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Rate & Share */}
                <View style={[styles.card]}>
                    <View className="flex flex-row items-center mb-5">
                        <View className="flex flex-row items-center gap-3 flex-1">
                            <View className="">
                                <View className="rounded-md flex items-center" style={[styles.btnIconSM]}>
                                    <Ionicons name="star" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                </View>
                            </View>
                            <View className="flex-1">
                                <ThemedText type="default" style={[styles.fontBold]}>L’application vous plaît ?</ThemedText>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={rateApp} className='py-4 px-4 rounded flex items-center' style={styles.primary}>
                        <ThemedText type="default" lightColor='#fff'>⭐ Notez-nous</ThemedText>
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
    );
};


export default AppInfoScreen;
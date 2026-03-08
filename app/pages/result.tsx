import { useGlobalStyles } from "@/app/_styles/globalStyle";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; 
import { ScrollView, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; 

export default function PackageResultScreen() {
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const ContinueToHome = async () => {
        router.replace('/(tabs)/setting');
    }
    
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={[styles.background]}
            contentContainerStyle={{ marginTop: insets.top, flex: 1, justifyContent: 'center' }}>
            <View className="flex items-center justify-center p-5" >
                <View className="rounded-full p-5 flex items-center justify-center mb-5 m-auto" style={{ backgroundColor: Colors[colorScheme ?? 'light'].success }}    >
                    <Ionicons name="checkmark-outline" size={80} color={Colors[colorScheme ?? 'light'].white} />
                </View>
                <View className="">
                    <ThemedText type="title" style={[styles.fontBold, styles.textCenter, { fontSize: FONT_SIZES.xl }]}>Congratulations</ThemedText>
                    <ThemedText type="default" style={[styles.textCenter]}>Your Package has been successfully Activated. Now you can add Advert to our catalog</ThemedText>
                </View>
                <View className="flex flex-row items-center justify-center mt-10">
                    <TouchableOpacity style={[styles.button, { paddingHorizontal: 15, paddingVertical: 15, backgroundColor: Colors[colorScheme ?? 'light'].primary, marginBottom: 30 }]}
                        onPress={ContinueToHome}>
                        <ThemedText type='default' lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.textCenter, styles.fontBold]}>Continue</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* <View>Status: {paymentIntent.status}</View>
                <View>Checkout Session response:</View>
                <PrintObject content={data} /> */}
            </View>
        </ScrollView>
    );
}
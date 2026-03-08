import { useColorScheme } from "react-native";
import { View } from "react-native";
import { useGlobalStyles } from "../_styles/globalStyle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { StyleSheet } from "react-native";
import {  GestureHandlerRootView } from "react-native-gesture-handler";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

export default function ZoomModalScreen() {
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const insets = useSafeAreaInsets();
    const { url } = useLocalSearchParams<{ url: string }>();
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(true);

    console.log('Image URL:', url); // Verify URL format
    useEffect(() => {
        console.log(url);
    }, [url]);
    const Customstyles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors[colorScheme ?? 'light'].primary,
        },
        image: {
            width: '100%',
            height: '100%',
        },
        errorText: {
            color: 'white',
            fontSize: 18,
        },
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[Customstyles.container, styles.primary, styles.flexOne, styles.itemCenter, styles.justifyCenter, { paddingTop: insets.top }]}>
                {loading && (
                    <View style={[styles.flexOne, styles.itemCenter, styles.justifyCenter]}>
                        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].white} />
                    </View>
                )}
                {url && !imageError ? (
                    <ImageZoom
                        source={{ uri: url }}
                        style={Customstyles.image}
                        minScale={0.5}
                        maxScale={5}
                        isDoubleTapEnabled
                        isPinchEnabled
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            console.log('Image loading failed');
                            setImageError(true);
                            setLoading(false);
                        }}
                    />
                ) : (
                    <ThemedText type="default" style={styles.colorDanger}>
                        {imageError ? 'Failed to load image' : 'No image URL provided'}
                    </ThemedText>
                )}
            </View>
        </GestureHandlerRootView>
    )
}
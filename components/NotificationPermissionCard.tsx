import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Switch } from "react-native-switch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogLevel, OneSignal } from 'react-native-onesignal';
import * as Notifications from "expo-notifications";
import { useGlobalStyles } from "@/app/_styles/globalStyle";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";

export default function NotificationPermissionCard({
    SaveOSignalAcception,
    colorScheme
}) {
    //const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const [notificationEnabled, setNotificationEnabled] = useState(false);

    useEffect(() => {
        loadPermission();
    }, []);

    const loadPermission = async () => {
        try {

            const stored = await AsyncStorage.getItem("isNotificationGrant");

            if (stored !== null) {
                setNotificationEnabled(stored === "true");
                return;
            }

            const status = await OneSignal.Notifications.getPermissionAsync();

            setNotificationEnabled(status);

        } catch (error) {
            console.log("Load notification permission error:", error);
        }
    };

    const toggleNotification = async (value: boolean) => {

        try {

            if (value) {

                const permission = await OneSignal.Notifications.requestPermission(true);

                if (permission) {
                    setNotificationEnabled(true);

                    await AsyncStorage.setItem("isNotificationGrant", "true");

                    SaveOSignalAcception(true);
                }

            } else {

                setNotificationEnabled(false);

                await AsyncStorage.setItem("isNotificationGrant", "false");

                SaveOSignalAcception(false);

            }

        } catch (error) {
            console.log("Toggle notification error:", error);
        }
    };

   

    return (
        <View className="flex flex-row items-center gap-2 mb-3">
            <View className="flex-1">

                <ThemedText
                    type="defaultSemiBold"
                    style={[
                        styles.fontBold,
                        { fontSize: FONT_SIZES.sm, lineHeight: 22 }
                    ]}
                >
                    Notifications
                </ThemedText>

                <ThemedText
                    type="default"
                    style={{ fontSize: FONT_SIZES.xs, lineHeight: 15 }}
                >
                    Allow the app to send you important alerts and updates.
                </ThemedText>

            </View>

            <View>
                <Switch
                    value={notificationEnabled}
                    onValueChange={toggleNotification}
                    activeText={"Yes"}
                    inActiveText={"No"}
                    circleSize={30}
                    barHeight={30}
                    circleBorderWidth={0}
                    backgroundActive={Colors[colorScheme ?? "light"].success}
                    backgroundInactive={Colors[colorScheme ?? "light"].light}
                    circleActiveColor={Colors[colorScheme ?? "light"].light}
                    circleInActiveColor={Colors[colorScheme ?? "light"].success}
                    changeValueImmediately={true}
                    innerCircleStyle={{ alignItems: "center", justifyContent: "center" }}
                    switchLeftPx={7}
                    switchRightPx={7}
                    switchWidthMultiplier={2}
                    switchBorderRadius={30}
                />
            </View>
        </View>
    );
}
import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function ChatsLayout() {
    const colorScheme = useColorScheme();
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[userId]" options={{
                            animation: 'none',
                            headerShown: true,
                            headerBackVisible: false,
                            headerShadowVisible: false,
                            contentStyle: {
                              marginHorizontal: 0,
                              marginVertical: 0,
                              paddingHorizontal: 0,
                              paddingVertical: 0,
                              margin: 0,
                              padding: 0,
                            },
                            headerStyle: {
                              backgroundColor: Colors[colorScheme ?? 'light'].primary,
                            },
                            // headerLeft: () => (
                            //   <> </>
                            // ),
                            headerTitle: () => (
                              <>
            
                              </>
                            ),
                          }} />
        </Stack>
    );
}
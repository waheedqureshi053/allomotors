import analytics from '@react-native-firebase/analytics';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, usePathname, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import AppVersionCheck from '@/components/AppVersionCheck';
import AutoScreenTracker from '@/components/AutoScreenTracker';
import ExpoStripeProvider from '@/components/StripeProvider.web';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { LogBox, Platform, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SessionProvider from './_services/ctx';
import { useGlobalStyles } from './_styles/globalStyle';
import "./global.css";

export const unstable_settings = {
  anchor: '(tabs)',
};


LogBox.ignoreLogs([
  "Warning: ...",
  "ERROR: ...",
  'Support for defaultProps will be removed from memo components',
  'Could not load RNOneSignal native module. Make sure native dependencies are properly linked.',
  '[Error: Uncaught (in promise, id: 9) Error: OneSignal native module not loaded]',
  '[Error: Uncaught (in promise, id: 13) Error: OneSignal native module not loaded]',

]); // Ignore log notification by message
LogBox.ignoreAllLogs();



// Ignore specific warnings/errors
LogBox.ignoreLogs([
  "Could not load RNOneSignal native module",
  "NOBRIDGE" // optional, hides all NOBRIDGE errors
]);

// function GlobalButton() {
//   const colorScheme = useColorScheme();
//   const { styles, FONT_SIZES } = useGlobalStyles();
//   const navigation = useNavigation();
//   const route = navigation.getState()?.routes;

//   const segments = useSegments();
//   console.log(segments);
//   // Check if we're on a screen where we want to hide tabs
//   const shouldHidebtnAdvert = segments.some((segment : any) =>
//     segment === 'chats' || segment === 'setting' || segment === '[id]' ||
//    segment === 'update-profile' || segment === 'request-form' || segment === '[url]' ||
//    segment === 'buyer-request' || segment === 'buyer-request-detail' || segment === 'public-catalogs' ||
//    segment === 'update-advert' || segment === 'advert-detail' || segment === 'new-advert' ||
//    segment === 'sign-in' || segment === 'sign-up' || segment === 'forget-password' || segment === 'otp' ||
//    segment === 'onboarding' || segment === 'about-app'
//   ) && segments.length > 1; // Only hide for nested routes like [id]
//   console.log("Current Route :", route?.[route.length - 1].name)
//   if (shouldHidebtnAdvert) {
//     return null;
//   }

//   // List of routes where button should be hidden
//   const hiddenRoutes = [
//     'sign-in',
//     'sign-up',
//     'forget-password',
//     'otp',
//     'new-advert', // Add your settings route name
//     'update-advert',
//     '[url]', // For nested tab route
//     '[id]',
//     'update-profile',
//     'request-form',
//     'onboarding',
//     'advert-detail',
//     'buyer-request',
//     'buyer-request-detail',
//     'public-catalogs',
//   ];

//   // Check if current route should hide the button
//   if (!route) return null; // or some other default value

//   const shouldHideButton = hiddenRoutes.some(hiddenRoute =>
//     route?.[route.length - 1].name === hiddenRoute || 
//     route?.[route.length - 1]?.name.includes(hiddenRoute)
//   );
//   if (shouldHideButton) return null;

//   return (
//     <TouchableOpacity onPress={() => { router.push("/pages/new-advert") }} className='flex flex-column items-center flex-1' style={[styles.btnShadow, styles.danger, styles.itemCenter, styles.justifyCenter, { width: 70, height: 70, position: 'absolute', bottom: 140, right: 20, borderRadius: 50, padding: 10 }]}>
//       <Feather name="plus" size={20} color={Colors[colorScheme ?? 'light'].white} />
//       <ThemedText type='default' style={[{ fontSize: FONT_SIZES.xs, lineHeight: 13, textAlign: 'center' }]} lightColor={Colors[colorScheme ?? 'light'].white} darkColor={Colors[colorScheme ?? 'light'].white} className=''>Ajouter voiture</ThemedText>
//     </TouchableOpacity>
//   );
// }

function GlobalButton() {
  const segments = useSegments();
  const pathname = usePathname();
  // const router = useRouter();
  const { styles, FONT_SIZES } = useGlobalStyles();
  const colorScheme = useColorScheme();

  // 1. Define routes where the button MUST be hidden
  const hiddenRoutes = [
    'sign-in', 'sign-up', 'forget-password', 'otp',
    'onboarding', 'new-advert', 'update-advert',
    'update-profile', 'request-form', 'chats', 'setting',
    'buyer-request', 'buyer-request-detail', 'public-catalogs',
    'advert-detail'
  ];

  // 2. Logic: Hide if ANY current segment matches our hidden list
  // This handles dynamic routes like [id] or [url] automatically
  const shouldHide = segments.some(segment =>
    hiddenRoutes.includes(segment) ||
    segment === '[id]' ||
    segment === '[url]'
  );

  // 3. Extra check: Hide if pathname explicitly starts with a sensitive route
  const isSpecialDetail = pathname.includes('advert-detail') || pathname.includes('buyer-request');

  if (shouldHide || isSpecialDetail) {
    return null;
  }

  return (
    <TouchableOpacity onPress={() => { router.push("/pages/new-advert") }} className='flex flex-column items-center flex-1' style={[styles.btnShadow, styles.danger, styles.itemCenter, styles.justifyCenter, { width: 70, height: 70, position: 'absolute', bottom: 140, right: 20, borderRadius: 50, padding: 10 }]}>
      <Feather name="plus" size={20} color={Colors[colorScheme ?? 'light'].white} />
      <ThemedText type='default' style={[{ fontSize: FONT_SIZES.xs, lineHeight: 13, textAlign: 'center' }]} lightColor={Colors[colorScheme ?? 'light'].white} darkColor={Colors[colorScheme ?? 'light'].white} className=''>Ajouter voiture</ThemedText>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const initAnalytics = async () => {
      await analytics().setAnalyticsCollectionEnabled(true);

      await analytics().logEvent(`${Platform.OS}_initialise_event`, {
        working: true
      });
    };

    initAnalytics();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SessionProvider>
          <ExpoStripeProvider>
            <Stack>
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="public-catalogs" options={{ headerShown: false }} />
              <Stack.Screen name="sign-up" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="forget-password" options={{ headerShown: false }} />
              <Stack.Screen name="otp" options={{ headerShown: false }} />
              <Stack.Screen name="pages/result" options={{ headerShown: false }} />
              <Stack.Screen name="pages/update-profile" options={{ headerShown: false }} />
              <Stack.Screen name="pages/purchases" options={{ headerShown: false }} />
              <Stack.Screen name="pages/buyer-request" options={{ headerShown: false }} />
              <Stack.Screen name="pages/buyer-request-detail" options={{ headerShown: false }} />
              <Stack.Screen name="pages/client-adverts" options={{ headerShown: false }} />
              <Stack.Screen name="pages/new-advert" options={{ headerShown: false }} />
              <Stack.Screen name="pages/update-advert" options={{ headerShown: false }} />
              <Stack.Screen name="pages/advert-detail" options={{ headerShown: false }} />
              <Stack.Screen name="pages/request-form" options={{ headerShown: false }} />
              <Stack.Screen name="pages/about-app" options={{ headerShown: false }} />
              <Stack.Screen name="zoom/[url]" options={{
                animation: 'none',
                headerShadowVisible: false,
                presentation: 'fullScreenModal',
                title: '',
                headerStyle: {
                  backgroundColor: Colors[colorScheme ?? 'light'].primary,
                },
                headerLeft: () => (
                  <></>
                ),
                headerRight: () => (
                  <TouchableOpacity style={{ padding: 5 }} onPress={() => { router.back() }}>
                    <Ionicons name="close-circle-outline" size={30} color={Colors[colorScheme ?? 'light'].white} />
                  </TouchableOpacity>
                ),
              }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <AutoScreenTracker />
            <GlobalButton />
            <AppVersionCheck />
            <StatusBar style="auto" backgroundColor={Colors[colorScheme ?? 'light'].background} />
          </ExpoStripeProvider>
        </SessionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>

    // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    //   <Stack>
    //     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    //     <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    //   </Stack>
    //   <StatusBar style="auto" />
    // </ThemeProvider>
  );
}

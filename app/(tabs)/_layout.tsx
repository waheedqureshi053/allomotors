import { Redirect, router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '../_services/ctx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import * as Notifications from "expo-notifications";
import TabBar from '@/components/TabBar';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [IsPaymentButtonVisible, setIsPaymentButtonVisible] = useState(false);
  const { IsReady, session, setSession, user, setUser, company, GetCompany } = useSession();
  const [isCatalog, setIsCatalog] = useState(false);
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true, // ✅ required
      shouldShowList: true,   // ✅ required
    }),
  });

  OneSignal.Debug.setLogLevel(LogLevel.Verbose);

  OneSignal.initialize("c2913845-086d-4c4a-bbac-0b64c9f3b537");

  OneSignal.Notifications.requestPermission(true);

  OneSignal.Notifications.addEventListener('click', async (event: any) => {
    try {
      console.log("OneSignal: notification clicked:", event);
      let page = event?.notification?.additionalData?.page
      let userId = event?.notification?.additionalData?.UserId;
      let ObjId = event?.notification?.additionalData?.ObjId;
      let dbObj = event?.notification?.additionalData?.dbObj;

      console.log("Notification UserId", userId);
      console.log("Notification ObjId", ObjId);

      if (page == 'AdvertDetails') {
        setTimeout(() => {
          router.push(`/catalogs/${ObjId}`)
        }, 1000);
      } else if (page == 'Requests') {
        setTimeout(() => {
          router.push({
            pathname: "/pages/buyer-request-detail",
            params: { id: ObjId, item: dbObj }
          });
        }, 1000);
      }
      else {
        if (userId) {
          setTimeout(() => {
            router.push(`/chats/${userId}`)
          }, 1000);
        }
      }
    } catch (err) {
      console.log("Notification handling error:", err);
    }
  })



  const GetCompanyInfo = async () => {
    const userRoles = user?.Roles || [];
    if (!userRoles.includes('DenyPayment')){
      setIsPaymentButtonVisible(true);
      return;
    };
    await GetCompany(); 
    // console.log("Company Attributes DoPayment", company?.Attributes?.DoPayment);
    // console.log("userRoles", userRoles);
    if (userRoles.includes('DenyPayment') && !company?.Attributes?.DoPayment) {
      setIsPaymentButtonVisible(false);
    } else {
      setIsPaymentButtonVisible(true);
    }
  }

  useEffect(() => {
    if(user?.Roles?.includes('View_AdvertCatelog'))
    {
      setIsCatalog(false);
    }
    else if(user?.Roles?.includes('Admin'))
    {
      setIsCatalog(false);
    }
    else
    {
      setIsCatalog(true);
    }
    //!user?.Roles?.includes('View_AdvertCatelog') || !user?.Roles?.includes('Admin') 
  },[])

    useEffect(() => {
      const loadSession = async () => {
        const currentUser = await AsyncStorage.getItem("user");
        const token = await AsyncStorage.getItem("token");
        if (token && currentUser) {
          setSession({ token });
          const user = currentUser ? JSON.parse(currentUser) : null;
          setUser(user);
          GetCompanyInfo();
          //console.log("Is USER Particulier", user?.Roles?.includes('Particulier'));
        }
      };
      loadSession();
    }, [!session]);

    if (!IsReady) {
      return null;
    }

    if (!session?.token) {
      return <Redirect href="/sign-in" />;
    }

  return (
    <Tabs
        screenOptions={{
          headerShown: false, 
        }}
        tabBar={props => <TabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home"
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: "Chats",
            headerShown: false
          }}
        />
        <Tabs.Screen
          redirect={isCatalog}
          name="catalogs"
          options={{
            title: "Catalogs",
          }}
        />
        {IsPaymentButtonVisible && (
          <Tabs.Screen
            name="packages"
            options={{
              title: "Packages",
            }}
          />
        )}
        <Tabs.Screen
          name="setting"
          options={{
            title: "Settings",

          }}
        />
      </Tabs>
  );
}

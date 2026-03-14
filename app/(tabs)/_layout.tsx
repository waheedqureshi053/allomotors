import { Redirect, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '../_services/ctx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TabBar from '@/components/TabBar';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [IsPaymentButtonVisible, setIsPaymentButtonVisible] = useState(false);
  const { IsReady, session, setSession, user, setUser, company, GetCompany } = useSession();
  const [isCatalog, setIsCatalog] = useState(false);
  

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

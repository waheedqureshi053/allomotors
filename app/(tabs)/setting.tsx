import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as SignalR from '@microsoft/signalr';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vmSearchObj } from '../_models/vmSearch';
import { logEvent } from '../_services/analytics';
import { apiCall } from '../_services/api';
import { useSession } from '../_services/ctx';
import { useGlobalStyles } from '../_styles/globalStyle';

const setting = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();
  const { logout, user, session, setUser, company, GetProfile, profile, GetCompany } = useSession();
  const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);
  const searchObj = new vmSearchObj();
  const [userName, setUserName] = useState(user?.Username);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.Email);
  const [title, setTitle] = useState('');
  const [qrbalance, setQRbalance] = useState<any>();
  const [scanBalance, setScanBalance] = useState<any>();
  //const [Profile, setProfile] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [IsPaymentButtonVisible, setIsPaymentButtonVisible] = useState(false);
  // const [isUploadButton, setIsUploadButton] = useState(true)
  const [PhotoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<any>('');
  const [SettingsOptions, setSettingsOptions] = useState<any>([]);
  const signOut = async () => {
    await logout();
  }
  const GetCompanyInfo = async () => {
    const userRoles = user?.Roles || [];
    if (!userRoles?.includes('DenyPayment')) {
      setIsPaymentButtonVisible(true);
      return;
    };
    await GetCompany();
    if (userRoles?.includes('DenyPayment') && !company?.Attributes?.DoPayment) {
      setIsPaymentButtonVisible(false);
    } else {
      setIsPaymentButtonVisible(true);
    }
  }
  const LoadProfile = async (userId: any) => {
    if (userId) {
      setLoading(true);
      try {

        await GetProfile(userId);
        console.log("GetProfile Response:", profile);
        //setProfile(profile);
        setPhotoUrl(profile?.PhotoURL);
        setUserName(profile?.UserName);
        setFirstName(profile?.FirstName);
        setLastName(profile?.LastName);
        setPhone(profile?.Phone);
        setEmail(profile?.Email);
        setTitle(profile?.Title);
        setQRbalance(profile?.Qrbalance);
        setScanBalance(profile?.ScanBalance);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
  }
  useFocusEffect(
    React.useCallback(() => {
      GetCompanyInfo();
      setSettingsOptions(getSettingsOptions());
      LoadProfile(user?.UserId);
    }, [])
  );
  // user
  useEffect(() => {
    if (session?.token) {
      const newConnection = new SignalR.HubConnectionBuilder()
        .withUrl("https://api.allomotors.fr/realtimeHub", {
          accessTokenFactory: () => session?.token ?? "",
          transport: SignalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(SignalR.LogLevel.Information)
        .build();
      newConnection.on("UpdateUser", (dataObj) => {
        try {

          LoadProfile(user?.UserId);
        } catch (error) {
          return;
        }
      });
      newConnection.onclose(async (error) => {
        //console.error("Connection closed:", error);
        setTimeout(async () => {
          try {
            await newConnection.start();
            //console.log("Reconnected to SignalR!");
          } catch (err) {
            console.error("Reconnect failed:", err);
          }
        }, 5000);
      });
      newConnection.start()
        .then(() => console.log("Connected to SignalR hub"))
        .catch((error) => console.log("Connection failed:", error));
      setConnection(newConnection);
      return () => {
        newConnection.stop();
      };
    }
  }, [session?.token]);
  const DeleteAccount = async () => {
    try {
      setLoading(true);
      const response = await apiCall('post', `/Account/DeleteUser`, new vmSearchObj(), null);
      if (response.status == 200 || response.status == 204 || response.statusText == 'Ok') {
        Alert.alert("Compte supprimé", "Votre compte a été supprimé avec succès.");
        await signOut();
        setLoading(false);
      }
    }
    catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    }
  }
  // Function to show confirmation dialog
  const confirmDeleteAccount = () => {
    Alert.alert(
      'Confirmer la suppression',
      'Cette action supprimera définitivement toutes vos données et votre compte de nos serveurs. Une fois supprimé, vous n\'aurez plus accès à Allo Motors.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: () => DeleteAccount(), // Changed to French function name
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
  const getSettingsOptions = () => {
    if (IsPaymentButtonVisible) {
      return [
        {
          title: 'Mes annonces',
          icon: 'list',
          onPress: () => router.push('/pages/client-adverts'),
        },
        {
          title: 'Créer une nouvelle annonce',
          icon: 'add-circle',
          onPress: () => router.push('/pages/new-advert'),
        },
        {
          title: 'Mes transactions',
          icon: 'list',
          onPress: () => router.push('/pages/buyer-request'),
        },
        {
          title: 'Mes achats',
          icon: 'cart',
          onPress: () => router.push('/pages/purchases'),
        },
        {
          title: 'Profil',
          icon: 'person',
          onPress: () => router.push('/pages/update-profile'),
        },
        {
          title: `Infos de l'application`,
          icon: 'information-circle',
          onPress: () => router.push('/pages/about-app'),
        },
        {
          title: 'Déconnexion',
          icon: 'log-out',
          onPress: () => signOut(),
        },
        {
          title: 'Compte supprimé',
          icon: 'trash',
          onPress: () => confirmDeleteAccount(),
        }
      ]
    } else {
      return [
        {
          title: 'Mes annonces',
          icon: 'list',
          onPress: () => router.push('/pages/client-adverts'),
        },
        {
          title: 'Créer une nouvelle annonce',
          icon: 'add-circle',
          onPress: () => router.push('/pages/new-advert'),
        },
        {
          title: 'Mes transactions',
          icon: 'list',
          onPress: () => router.push('/pages/buyer-request'),
        },
        // {
        //   title: 'Mes achats',
        //   icon: 'cart',
        //   onPress: () => router.push('/pages/purchases'),
        // },
        {
          title: 'Profil',
          icon: 'person',
          onPress: async () => {
            await logEvent('profile_tab_clicked', {
              message: `Profile button clicked. OS : ${Platform.OS}`
            });
            router.push('/pages/update-profile')
          },
        },
        {
          title: `Infos de l'application`,
          icon: 'information-circle',
          onPress: () => router.push('/pages/about-app'),
        },
        {
          title: 'Déconnexion',
          icon: 'log-out',
          onPress: () => signOut(),
        },
        {
          title: 'Compte supprimé',
          icon: 'trash',
          onPress: () => confirmDeleteAccount(),
        }
      ]
    }
  }
  const Customstyles = StyleSheet.create({
    container: {
      padding: 20,
      borderRadius: 10,
      marginTop: 30,
      width: '100%',
    },
    optionItem: {
      paddingVertical: 12,
    },
    optionItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    icon: {
      marginRight: 15,
    },
    optionText: {
      fontSize: 16,
    },
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', marginTop: insets.top }}>
      <View className='p-5' style={[styles.flexOne]}>
        <View style={[styles.primary, styles.itemCenter, styles.justifyCenter, styles.relativePosition,
        { padding: 20, borderRadius: 10 }]}>
          <View style={[styles.relativePosition, { marginBottom: 10 }]}>
            {profile?.PhotoURL ? <Image style={[styles.roundedCircle]} source={{ uri: profile?.PhotoURL }}
              resizeMode="cover" width={100} height={100} />
              :
              <Image style={[styles.roundedCircle, { height: 100, width: 100, tintColor: 'white' }]}
                source={require('../../assets/img/avatar.png')}
                resizeMode="cover" />
            }
          </View>
          <ThemedText type='subtitle' lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.textCenter, styles.fontBold]}> {profile?.FirstName || "-"} {profile?.LastName || "-"} </ThemedText>
          <ThemedText type='default' lightColor={Colors[colorScheme ?? 'light'].lighter} style={[styles.textCenter]}> {profile?.UserName || ""} </ThemedText>
        </View>
        <View className='flex-1 flex flex-row items-center gap-2 mt-5'>
          <View className='flex-1' style={[styles.card, { padding: 10 }]}>
            <View className='flex flex-row flex-start gap-3' >
              <View>
                <View className='p-2 flex flex-row items-center justify-center rounded-md' style={[styles.btnIconSM, styles.danger]}>
                  <Ionicons name="add" size={20} color={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold]} />
                </View>
              </View>
              <View className='flex flex-column gap-1'>
                <View style={[{ flexShrink: 0 }]}>
                  <ThemedText type='default' style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 16, color: Colors[colorScheme ?? 'light'].light }]}>
                    Annonce solde</ThemedText>
                </View>
                <View className='flex flex-row items-center' style={[{ alignItems: 'baseline' }]}>
                  {/* <ThemedText type='default' style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16, marginRight: 3, color: Colors[colorScheme ?? 'light'].text }]}>€</ThemedText> */}
                  {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />) : (
                    <ThemedText type='default' style={[styles.fontBold, { fontSize: FONT_SIZES.lg, lineHeight: 26, color: Colors[colorScheme ?? 'light'].text }]}>
                      {profile?.Qrbalance || "0"}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>
          </View>
          <View className='flex-1' style={[styles.card, { padding: 10 }]}>
            <View className='flex flex-row flex-start gap-3' >
              <View>
                <View className='p-2 flex flex-row items-center justify-center rounded-md' style={[styles.btnIconSM, styles.danger]}>
                  <FontAwesome name="euro" size={20} color={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold]} />
                </View>
              </View>
              <View className='flex flex-column gap-1'>
                <View style={[{ flexShrink: 0 }]}>
                  <ThemedText type='default' style={[styles.fontBold, { fontSize: FONT_SIZES.sm, lineHeight: 16, color: Colors[colorScheme ?? 'light'].light }]}>
                    Credit solde</ThemedText>
                </View>
                <View className='flex flex-row items-center' style={[{ alignItems: 'baseline' }]}>
                  {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />) : (
                    <>
                      <ThemedText type='default' style={[styles.fontBold, { fontSize: FONT_SIZES.xs, lineHeight: 16, marginRight: 3, color: Colors[colorScheme ?? 'light'].text }]}>€</ThemedText>
                      <ThemedText type='default' style={[styles.fontBold, { fontSize: FONT_SIZES.lg, lineHeight: 26, color: Colors[colorScheme ?? 'light'].text }]}>
                        {profile?.ScanBalance || "0"}
                      </ThemedText>
                    </>
                  )}
                </View>

              </View>
            </View>
          </View>
        </View>
        <View style={[{ backgroundColor: Colors[colorScheme ?? 'light'].primary, padding: 20, borderRadius: 10, marginBottom: 100 }]}>
          {SettingsOptions.map((item: any, index: any) => (
            <TouchableOpacity
              key={index}
              style={[
                Customstyles.optionItem,
                index !== SettingsOptions.length - 1 && Customstyles.optionItemBorder
              ]}
              onPress={item.onPress}
            >
              <View style={Customstyles.optionContent}>
                <View style={Customstyles.iconTitleContainer}>
                  <Ionicons
                    name={item.icon as 'key'}
                    size={24}
                    color={Colors[colorScheme ?? 'light'].white}
                    style={Customstyles.icon}
                  />
                  <ThemedText
                    type='default'
                    style={Customstyles.optionText}
                    lightColor={Colors[colorScheme ?? 'light'].white}
                  >
                    {item.title}
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={Colors[colorScheme ?? 'light'].white}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default setting
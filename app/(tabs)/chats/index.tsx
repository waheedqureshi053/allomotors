import { Alert, FlatList, Image, Linking, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import ChatCardComponent from '@/components/ChatCard'; 
import { useFocusEffect } from 'expo-router';
import * as SignalR from '@microsoft/signalr';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useGlobalStyles } from '@/app/_styles/globalStyle';
import { useSession } from '@/app/_services/ctx';
import { vmSearchObj } from '@/app/_models/vmSearch';
import { apiCall } from '@/app/_services/api';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
const ChatsScreen = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();
  const router = useRouter();
  const { session, user, GetCompany, company } = useSession();
  const [loading, setLoading] = useState(false);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<any>>(null);
  const onEndReachedCalledRef = useRef(false);
  const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);
  const GetAllContacts = async (pageNumber: number = 1, reset = false) => {
    console.log("Auth Token:", session?.token);
    setLoading(true);

    try {
      const searchObj = new vmSearchObj();
      searchObj.searchText = searchText;
      searchObj.pageNumber = pageNumber;
      const response = await apiCall("get", "/Account/GetAllContacts", searchObj, null);
      if (!response || !response.data) {
        throw new Error("Empty response from server");
      }

      const parsedContacts = response.data.map((item: any) => {
        // Handle Attributes safely
        let parsedAttributes: any = {};
        if (item.Attributes) {
          if (typeof item.Attributes === "string") {
            try {
              parsedAttributes = item.Attributes ? JSON.parse(item.Attributes) : {};
            } catch (error) {
              console.error("JSON parse error for Attributes:", error);
              parsedAttributes = {};
            }
          } else if (typeof item.Attributes === "object") {
            parsedAttributes = item.Attributes;
          }
        }

        //console.log("LastTime:", item?.LastTime);
        // iOS-safe date formatting
        const formattedLastTime = item?.LastTime && item?.LastTime !== "0001-01-01T00:00:00"
          ? dayjs(item.LastTime).utc().toISOString()
          : null;

        return {
          ...item,
          IsOnline: false,
          PhotoURL: parsedAttributes?.PhotoURL || null,
          Attributes: parsedAttributes,
          LastTime: formattedLastTime,
        };
      });

      // Update state
      setAllContacts(parsedContacts);

    } catch (error: any) {
      console.error("GetAllContacts error:", error);
      ///Alert.alert("Échec du chargement des données", error?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
      setRefreshing(false);
      onEndReachedCalledRef.current = false;
    }
  };
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

      newConnection.on("ReceiveMessage", (dataObj) => {
        let MessageObj: any = {};
        try {
          MessageObj = dataObj ? JSON.parse(dataObj) : {};
          MessageObj.Attributes = JSON.parse(MessageObj?.Attributes ?? '{}');
        } catch (error) {
          return;
        }

        const senderID = MessageObj?.SenderID?.toString();
        const senderName = MessageObj?.Sender?.FirstName && MessageObj?.Sender?.LastName
          ? `${MessageObj.Sender.FirstName} ${MessageObj.Sender.LastName}`
          : "Unknown";

        const senderAvatar = MessageObj?.Sender?.PhotoURL
          ? `https://allomotors.fr/Content/WebData/UF/${MessageObj.Sender.PhotoURL}`
          : "";


        setAllContacts((prevContacts) => {
          const existingContactIndex = prevContacts.findIndex((c) => c.UserId === senderID);
          let updatedContacts;

          if (existingContactIndex !== -1) {
            // Update existing contact and increment ReadCount
            updatedContacts = prevContacts.map((contact, index) =>
              index === existingContactIndex
                ? {
                  ...contact,
                  LastMessage: MessageObj?.Message || "",
                  LastTime: dayjs(MessageObj?.MessageDate).utc().format(),
                  ReadCount: (contact.ReadCount || 0) + 1,
                }
                : contact
            );
          } else {
            // If sender is new, refresh contacts
            GetAllContacts();
            return prevContacts;
          }

          // Sort contacts by LastTime in descending order (newest first)
          return updatedContacts.sort((a, b) => {
            const timeA = new Date(a.LastTime).getTime();
            const timeB = new Date(b.LastTime).getTime();
            return timeB - timeA;
          });
        });


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
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    GetAllContacts(1, true);
  };
  useFocusEffect(
    React.useCallback(() => {
      if (hasMore) {
        GetAllContacts(page, false);
      }
    }, [page])
  );
  return (
    <FlatList
      ref={listRef}
      showsVerticalScrollIndicator={false}
      style={[styles.background, { flexGrow: 1, marginTop: insets.top }]}
      data={allContacts}
      //keyExtractor={(item) => item.id} // Ensure unique keys
      keyExtractor={(item, index) => `${item.id}-${index}`}
      //onEndReached={handleLoadMore}
      //onEndReachedThreshold={0.5}
      onMomentumScrollBegin={() => (onEndReachedCalledRef.current = false)}
      //scrollEventThrottle={16}
      //initialNumToRender={10}
      //maxToRenderPerBatch={10}
      removeClippedSubviews={false} // Prevent image flickering
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors[colorScheme ?? "light"].primary]}
        />
      }
      renderItem={({ item }) => <ChatCardComponent item={item} index={item.id} />}
      ListHeaderComponent={
        <View>
          <View style={[styles.background, { marginBottom: 10 }]}>
            <Image source={require('../../../assets/img/logo-trans.png')} resizeMode="contain" tintColor={Colors[colorScheme ?? "light"].light} style={{ width: "100%", height: 80 }} />
          </View>
          <ScrollView horizontal={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={[styles.danger, { marginBottom: 10 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", padding: 5 }}>
              <Image source={require('../../../assets/img/peugeot-logo.png')} resizeMode="contain" style={{ width: "20%", height: 60 }} />
              <Image source={require('../../../assets/img/audi-logo.png')} resizeMode="contain" style={{ width: "20%", height: 60 }} />
              <Image source={require('../../../assets/img/citroen-logo.png')} resizeMode="contain" style={{ width: "20%", height: 60 }} />
              <Image source={require('../../../assets/img/logo-renault-thumb-1280x.png')} resizeMode="contain" style={{ width: "20%", height: 60 }} />
              <Image source={require('../../../assets/img/logo-dacia-20211024x.png')} resizeMode="contain" style={{ width: "20%", height: 60 }} />
            </View>
          </ScrollView>
          <View style={{ marginHorizontal: 15, marginBottom: 15 }}>
            <View style={[styles.overlay, { borderRadius: 50 }]}>
              <Image source={require('../../../assets/img/ct-a6.png')} resizeMode="cover" style={{ width: "100%", height: 70, borderRadius: 50 }} />
              <ThemedText type="subtitle" style={{ position: "absolute", bottom: 0, fontWeight: "bold", color: "#fff" }}>
                Vendre ou Acheter !
              </ThemedText>
            </View>
          </View>
        </View>
      }
      ListFooterComponent={
        <>
          {allContacts.length == 0 && (
            <View style={[styles.itemCenter, styles.justifyCenter, { marginTop: 40 }]}>
              <Image source={{ uri: 'https://angular.pixelstrap.net/chitchat/assets/images/chat.png' }} tintColor={Colors[colorScheme ?? "light"].lighter} resizeMode="contain" style={{ width: 100, height: 100, marginBottom: 20 }} />
              <ThemedText type='defaultSemiBold' style={[styles.textCenter]}>Aucune conversation</ThemedText>
            </View>)}
        </>
      }
    />
  );
}
export default ChatsScreen

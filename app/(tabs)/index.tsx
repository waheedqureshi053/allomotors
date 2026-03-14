import { ActivityIndicator, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalStyles } from '../_styles/globalStyle';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import CarCardComponent from '@/components/CarCard';
import { FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { AdCardComponent } from '@/components/AdCardComponent';
import { apiCall } from '../_services/api';
import { useSession } from '../_services/ctx';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogLevel, OneSignal } from 'react-native-onesignal';
import * as Notifications from "expo-notifications";
import { useRouter } from 'expo-router';
import { vmSearchObj } from '../_models/vmSearch';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useSession();
  const [Catalogs, setCatalogs] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<any>>(null);
  const onEndReachedCalledRef = useRef(false);
  const [isNotificationGrant, setNotificationGrant] = useState<string | null>(null);

  const [allAds, setAllAds] = useState<any>([]);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const AD_INTERVAL = 7; // show ad after every 6 cars
  const hasAds = useCallback(() => {
    return adsLoaded && Array.isArray(allAds) && allAds?.length > 0;
  }, [allAds, adsLoaded]);
  const fetchAds = async () => {
    try {
      const response = await apiCall(
        'POST',
        '/Account/LoadPublicAds',
        null,
        {
          Page: 'App Catelog Particulier',
        }
      );

      const ads = response?.data?.obj || [];
      setAllAds(ads);

      //console.log('✅ allAds', ads);
      setAdsLoaded(true);

    } catch (error) {
      console.error('LoadPublicAds error:', error);
    }
  };

  useEffect(() => {
    console.log("✅ User roles: ", user?.Roles);
    initializeNotifications();
    fetchAds();
  }, []);


  useEffect(() => {
    if (user?.UserId) {
      syncOneSignalUser();
      checkNotificationPermission();
    }
  }, [user?.UserId]);

  /* ------------------ INITIALIZE ------------------ */

  const initializeNotifications = () => {

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    OneSignal.initialize("c2913845-086d-4c4a-bbac-0b64c9f3b537");

    OneSignal.Notifications.addEventListener('click', handleNotificationClick);
  };

  /* ------------------ CLICK HANDLER ------------------ */

  const handleNotificationClick = async (event: any) => {
    try {

      console.log("Notification clicked:", event);

      const page = event?.notification?.additionalData?.page;
      const userId = event?.notification?.additionalData?.UserId;
      const ObjId = event?.notification?.additionalData?.ObjId;
      const dbObj = event?.notification?.additionalData?.dbObj;

      if (page === "AdvertDetails") {

        setTimeout(() => {
          router.push(`/catalogs/${ObjId}`);
        }, 800);

      } else if (page === "Requests") {

        setTimeout(() => {
          router.push({
            pathname: "/pages/buyer-request-detail",
            params: { id: ObjId, item: dbObj }
          });
        }, 800);

      } else if (userId) {

        setTimeout(() => {
          router.push(`/chats/${userId}`);
        }, 800);

      }

    } catch (error) {
      console.log("Notification handling error:", error);
    }
  };


  /* ------------------ SYNC USER ------------------ */

  const syncOneSignalUser = async () => {

    try {

      const id = user?.UserId?.replace(/"/g, "");

      const response = await fetch(
        "https://api.onesignal.com/apps/c2913845-086d-4c4a-bbac-0b64c9f3b537/users",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            identity: {
              external_id: id
            }
          })
        }
      );

      const json = await response.json();

      console.log("OneSignal Subscribe:", json);

      if (!json?.errors) {
        OneSignal.login(id);
      }

    } catch (error) {
      console.log("OneSignal sync error:", error);
    }

  };


  /* ------------------ SAVE USER PREFERENCE ------------------ */

  const SaveOSignalAcception = async (granted: boolean) => {

    if (!user?.UserId) return;

    try {

      const data = {
        SendOSignalNotification: granted,
        OSignalID: granted ? user.UserId : ""
      };

      const response = await apiCall(
        "post",
        "/Account/SaveOSignalAcception",
        new vmSearchObj(),
        data
      );

      if ([200, 204].includes(response.status)) {
        console.log("OSignal preference saved");
      }

    } catch (error) {
      console.log("SaveOSignalAcception error:", error);
    }

  };


  /* ------------------ PERMISSION ------------------ */

  const checkNotificationPermission = async () => {

    try {

      const stored = await AsyncStorage.getItem("isNotificationGrant");

      if (stored !== null) {
        setNotificationGrant(stored);
        return;
      }

      const currentStatus = await OneSignal.Notifications.getPermissionAsync();

      if (currentStatus) {

        await AsyncStorage.setItem("isNotificationGrant", "true");
        setNotificationGrant("true");
        SaveOSignalAcception(true);
        return;

      }

      const permission = await OneSignal.Notifications.requestPermission(true);

      const granted = permission ? "true" : "false";

      await AsyncStorage.setItem("isNotificationGrant", granted);
      setNotificationGrant(granted);

      SaveOSignalAcception(permission);

    } catch (error) {
      console.log("Notification permission error:", error);
    }

  };



  // Memoize the catalog processing to prevent unnecessary recalculations
  const processCatalogData = useCallback((data: any[]) => {
    return data?.map((item) => {
      if (item?.OwnwerAttributes)
        item.OwnerAttributes = item.OwnwerAttributes ? JSON.parse(item.OwnwerAttributes) : {};
      // //console.log("✅ OwnerAttributes: ✅", item.OwnerAttributes);
      let parsedAttributes: any = {};
      if (item?.Attributes) {
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
      return {
        ...item,
        Attributes: parsedAttributes,
        PhotoURL: parsedAttributes?.IconURL,
        // Add a unique key combining ID and index if needed
        uniqueKey: `${item.ID}-${Math.random().toString(36).substr(2, 9)}`
      };
    });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchAds();
    getAdverts();
  }, []);

  const getAdverts = useCallback(async (loadMore = false) => {
    // Prevent multiple simultaneous requests
    if (loading) return;

    // Don't load more if we know there's no more data
    if (loadMore && !hasMore) return;

    setLoading(true);

    // Always keep pageIndex >= 1
    const currentPage = loadMore ? Math.max(1, page) : 1;

    try {
      const response = await apiCall(
        'POST',
        '/Account/LoadAdvertsPublic',
        null,
        {
          searchText: searchText || "",
          iView: 'list',
          maxSize: 5,
          totalCount: 0,
          pageIndex: currentPage,
          pageSizeSelected: 10,
          WishList: [],
        }
      );

      const totalCount = response?.data?.dataCount || 0;
      const rawCatalogs = response?.data?.dataList || [];
      const newCatalogs = processCatalogData(rawCatalogs);

      if (loadMore) {
        setCatalogs(prev => {
          const updated = [...prev, ...newCatalogs];
          setHasMore(updated.length < totalCount);
          return updated;
        });
        setPage(prev => prev + 1);
      } else {
        setCatalogs(newCatalogs);
        setPage(2);
        setHasMore(newCatalogs.length < totalCount);
      }
    } catch (error) {
      console.error('LoadAdvertsPublic error:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      onEndReachedCalledRef.current = false;
    }
  }, [loading, hasMore, page, searchText, processCatalogData]);

  const loadMoreData = useCallback(() => {
    // Only trigger if:
    // - Not currently loading
    // - We believe there's more data
    // - Haven't already called this for current scroll
    if (!loading && hasMore && !onEndReachedCalledRef.current) {
      //console.log('Loading more data...');
      onEndReachedCalledRef.current = true;
      getAdverts(true);
    }
  }, [loading, hasMore, getAdverts]);
  useEffect(() => {
    console.log('Current state:', {
      loading,
      hasMore,
      page,
      catalogCount: Catalogs.length
    });
  }, [loading, hasMore, page, Catalogs]);
  const renderFooter = () => {
    if (loading) {
      return (
        <View className="p-5 flex flex-row items-center justify-center mb-20">
          <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />
          <Text className="ml-5" style={{ color: Colors[colorScheme ?? 'light'].text }}>
            Chargement de plus...
          </Text>
        </View>
      );
    }

    if (!hasMore && Catalogs.length > 0) {
      return (
        <View className="p-4 items-center justify-center">
          <ThemedText>Il n'y a plus d'éléments</ThemedText>
        </View>
      );
    }

    return null;
  };
  const Customstyles = StyleSheet.create({
    listContent: {
      paddingHorizontal: 0,
      paddingBottom: 20,
    },
    columnWrapper: {
      justifyContent: 'space-between',
      paddingHorizontal: 6,
    },
  });

  const shouldShowAd = useCallback(
    (index: number) => {
      if (!hasAds() || !Catalogs || Catalogs.length === 0) {
        return false;
      }
      return (index + 1) % AD_INTERVAL === 0;
    },
    [hasAds, Catalogs]
  );
  const getAd = useCallback(
    (index: number, pageNumber: number) => {
      if (!hasAds() || allAds.length === 0) return null;

      // calculate global index
      const globalIndex = (pageNumber - 1) * Catalogs.length + index;

      // how many ad slots have passed globally
      const slotNumber = Math.floor((globalIndex + 1) / AD_INTERVAL) - 1;
      if (slotNumber < 0) return null;

      // cycle ads
      const adIndex = slotNumber % allAds.length;
      return allAds[adIndex];
    },
    [hasAds, allAds, Catalogs.length]
  );
  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    if (shouldShowAd(index)) {
      const ad = getAd(index, page);

      if (ad) {
        // If ad is about to split a row, add a placeholder first
        const needsPlaceholder = (index % 2 !== 0);
        //console.log('shouldShowAd index ====>', index);
        //console.log('needsPlaceholder ====>', needsPlaceholder);
        return (
          <>
            {needsPlaceholder && (
              <View style={{ flex: 1, margin: 4 }} />
            )}

            <AdCardComponent ad={ad} IsLandscape={false} />

          </>
        );
      }
    }

    // Normal catalog item
    return (
      <CarCardComponent
        item={item}
        page={'public_catalogs'}
        key={item.uniqueKey}
        index={item.uniqueKey}
      />
    );
  },
    [shouldShowAd, getAd, page]
  );
  return (
    <FlatList
      ref={listRef}
      showsVerticalScrollIndicator={false}
      style={[styles.background, { flexGrow: 1, marginTop: insets.top }]}
      data={Catalogs}
      numColumns={2}
      contentContainerStyle={Customstyles.listContent}
      columnWrapperStyle={Customstyles.columnWrapper}
      keyExtractor={(item) => item.uniqueKey}
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.5}
      onMomentumScrollBegin={() => (onEndReachedCalledRef.current = false)}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={11}
      initialNumToRender={10}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors[colorScheme ?? "light"].primary]}
        />
      }
      renderItem={renderItem}
      ListHeaderComponent={
        <>
          <View className="px-5 pt-5">
            <ThemedText style={[{ fontSize: FONT_SIZES.xl }]} type='defaultSemiBold'>Catalogue - Particulier</ThemedText>
          </View>
          <View className="relative m-5">
            <TextInput
              style={[styles.input]}
              placeholderTextColor={Colors[colorScheme ?? 'light'].light}
              underlineColorAndroid="transparent"
              placeholder="Recherche..."
              value={searchText || ''}
              onChangeText={setSearchText}
              onSubmitEditing={() => getAdverts()}
            />
            <TouchableOpacity
              disabled={loading}
              onPress={() => getAdverts()}
              style={[styles.primary]}
              className='p-2 rounded-lg absolute top-2 right-3'
            >
              {loading ?
                <ActivityIndicator size="small" color="white" /> :
                <Ionicons name="search" size={18} color="white" />
              }
            </TouchableOpacity>
          </View>
        </>
      }
      ListFooterComponent={renderFooter}
    />
  );
}



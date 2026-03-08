import { ActivityIndicator, Alert, FlatList, Image, Linking, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStyles } from "../../_styles/globalStyle";
import { useFocusEffect, useRouter } from "expo-router";
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { vmSearchObj } from "@/app/_models/vmSearch";
import { apiCall } from "@/app/_services/api"; 
import CarCardComponent from "@/components/CarCard";
import { TextInput } from "react-native";
import { useSession } from "@/app/_services/ctx";
import { expo } from '../../../app.json'
import { OneSignal } from "react-native-onesignal"; 
import { AdCardComponent } from "@/components/AdCardComponent";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";





export default function CatelogsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();
  const { session, user, GetCompany, company } = useSession();
  const router = useRouter();
  const [isPressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Catalogs, setCatalogs] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<any>>(null);
  const onEndReachedCalledRef = useRef(false);
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);

  const [allAds, setAllAds] = useState<any>([]);
  const [adsLoaded, setAdsLoaded] = useState(false);

  const fetchAds = async () => {
    const response = await apiCall('POST', '/Account/LoadPublicAds', {
      Page: 'App Catelog Pro',
    }, {});
    const data = response?.data; // await response.json();
    setAllAds(data.obj);
    ////console.log("✅ allAds", data);
    setAdsLoaded(true);
  };

  useEffect(() => {
    const fetchCompany = async () => {
      await GetCompany();
    }
    fetchCompany();
    fetchAds();
  }, []);

  useEffect(() => {
    if (!__DEV__) {
      checkForUpdates();
    } else {
      ////console.log('DEVELOPMENT_MODE');
    }
  }, [company]);

  const checkForUpdates = async () => {
    try {
      let latestVersion = '0.0.0';
      const currentVersion = expo.version;
      latestVersion = Platform.select({
        ios: company?.Attributes?.IOsVersion,
        android: company?.Attributes?.AndroidVersion,
      });
      if (compareVersions(currentVersion, latestVersion)) {
        setNewVersionAvailable(true);
        let Title = "Mise à jour disponible";
        let Description = "Une nouvelle version de l'application est disponible. Veuillez la mettre à jour pour profiter de la meilleure expérience.";
        showUpdateAlert(Title, Description);
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };
  const compareVersions = (current: any, latest: any) => {
    // Simple version comparison
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;

      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }
    return false;
  };
  const showUpdateAlert = (title: any, description: any) => {
    Alert.alert(
      title,
      description,
      [
        {
          text: 'Mettre à jour',
          onPress: () => openStore(),
          style: 'default',
        },
        // {
        //   text: 'Plus tard',
        //   style: 'cancel',
        // },
      ],
      { cancelable: false }
    );
  };
  const openStore = async () => {
    const appStoreUrl: any = Platform.select({
      ios: `https://apps.apple.com/app/id6744530072`,
      android: `https://play.google.com/store/apps/details?id=com.allmotorsi.app`,
      // ios: `itms-apps://itunes.apple.com/app/com.allmotorsi.app`, // Replace with your App Store ID
      // android: `market://details?id=com.allmotorsi.app`,
    });

    try {
      await Linking.openURL(appStoreUrl);
    } catch (error) {
      // Fallback to web URL if app store fails to open
      const webUrl: any = Platform.select({
        ios: `https://apps.apple.com/app/id6744530072`,
        android: `https://play.google.com/store/apps/details?id=com.allmotorsi.app`,
      });
      Linking.openURL(webUrl);
    }
  };

  useEffect(() => {
    if (user?.UserId) {
      //console.log("✅ User roles: ", user?.Roles);
      storeOneSignal();
      SaveOSignalAcception(true);
    }
  }, [user?.UserId]);

  const storeOneSignal = async () => {
    let id = user?.UserId.replace(/"/g, "");
    ////console.log("USER ID ", id);
    const url = 'https://api.onesignal.com/apps/c2913845-086d-4c4a-bbac-0b64c9f3b537/users';
    const options = {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({
        identity: {
          external_id: id,
        }
      })
    };

    await fetch(url, options)
      .then(res => res.json())
      .then(json => {
        ////console.log('ONE SIGNAL SUBSCRIBE JSON ', json);

        if (json.errors) {
          ////console.log("OneSignal error:", json.errors);
        } else {
          OneSignal.login(json.identity.external_id)
        }
      })
      .catch(err => {
        //console.log(err)  
      }
      );
  };

  const SaveOSignalAcception = async (granted: boolean = true) => {
    let loginTimeout: NodeJS.Timeout | null = null;

    try {
      if (!user?.UserId) {
        console.warn('User not available - skipping OneSignal operations');
        return;
      }

      const data = {
        SendOSignalNotification: granted,
        OSignalID: granted ? user.UserId : ""
      };

      try {
        const response = await apiCall(
          'post',
          `/Account/SaveOSignalAcception`,
          new vmSearchObj(),
          data
        );

        if ([200, 204]?.includes(response.status) || response.statusText === 'OK') {
          //console.log("OSignal preferences saved successfully");
          return;
        }

        throw new Error(`Unexpected status: ${response.status}`);
      } catch (apiError) {
        console.error('Unexpected error in SaveOSignalAcception API ERROR:', apiError);
      }
    } catch (error) {
      console.error('Unexpected error in SaveOSignalAcception:', error);
    }

    // Return cleanup function
    return () => {
      if (loginTimeout) {
        clearTimeout(loginTimeout);
        ////console.log('Cleared pending OneSignal login timeout');
      }
    };
  };

  const Customstyles = StyleSheet.create({
    // ... your existing styles
    listContent: {
      paddingHorizontal: 0,
      paddingBottom: 20,
    },
    columnWrapper: {
      justifyContent: 'space-between',
      paddingHorizontal: 6,
    },
  });

  const hasAds = useCallback(() => {
    return adsLoaded && Array.isArray(allAds) && allAds?.length > 0;
  }, [allAds, adsLoaded]);


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
            if (parsedAttributes?.OwnerAttributes)
              parsedAttributes.OwnerAttributes = JSON.parse(parsedAttributes?.OwnerAttributes);
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

  const AD_INTERVAL = 7; // show ad after every 6 cars

  const getAdverts = useCallback(async (loadMore = false) => {
    if (loading) return;
    if (loadMore && !hasMore) return;

    setLoading(true);

    // Always keep pageIndex safe (>= 1)
    const currentPage = loadMore ? Math.max(1, page) : 1;
    console.log("✅ currentPage:", currentPage);
    try {
      const response = await apiCall(
        'POST',
        '/Account/LoadAdverts',
        null,
        {
          searchText: searchText || "",
          iView: 'list',
          maxSize: 5,
          totalCount: 0,
          pageIndex: currentPage,
          pageSizeSelected: 12,
          Page: 'Adverts Catelog',
          Status: 'Active',
          WishList: null
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
      console.error('LoadAdverts error:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      onEndReachedCalledRef.current = false;
    }
  }, [loading, hasMore, page, searchText, processCatalogData]);

  const keyExtractor = useCallback((item: any) => {
    return item.uniqueKey;
  }, []);

  const getItemType = useCallback((item: any) => {
    return item.type;
  }, []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchAds();
    getAdverts();
  }, []);
  const loadMoreData = useCallback(() => {
    // Only trigger if:
    // - Not currently loading
    // - We believe there's more data
    // - Haven't already called this for current scroll
    if (!loading && hasMore && !onEndReachedCalledRef.current) {
      ////console.log('Loading more data...');
      onEndReachedCalledRef.current = true;
      getAdverts(true);
    }
  }, [loading, hasMore, getAdverts]);

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
        ////console.log('shouldShowAd index ====>', index);
        ////console.log('needsPlaceholder ====>', needsPlaceholder);
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
        page={"catelogs"}
        key={item.uniqueKey}
        index={item.uniqueKey}
      />
    );
  },
    [shouldShowAd, getAd, page]
  );

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
  return (
    <>
      {user?.Roles?.includes('Admin') || user?.Roles?.includes('View_AdvertCatelog') ? (
        <FlatList
          ref={listRef}
          showsVerticalScrollIndicator={false}
          style={[styles.background, { flexGrow: 1, marginTop: insets.top }]}
          data={Catalogs}
          contentContainerStyle={Customstyles.listContent}
          numColumns={2} // ✅ 2-column grid
          columnWrapperStyle={Customstyles.columnWrapper}
          renderItem={renderItem}
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
          ListHeaderComponent={
            <>
              <View className="px-5 pt-5">
                <ThemedText style={[{ fontSize: FONT_SIZES.xl }]} type='defaultSemiBold'>Catalogue - Professionnel {/* Annonce(s) */} </ThemedText>
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
      ) : (
        <ScrollView contentContainerStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].background, flexGrow: 1, justifyContent: 'center', padding: 15 }}>
          <View className="flex flex-col justify-center">
            <View className="mb-10 flex items-center">
              <View className="flex flex-row items-center justify-center p-5" style={[styles.danger, styles.btnShadow, { width: 100, height: 100, borderRadius: 50 }]}>
                <FontAwesome6 name="user-lock" size={50} color={Colors[colorScheme ?? 'light'].white} />
              </View>
            </View>
            <View className="mb-5">
              <ThemedText type="title" style={[styles.textCenter, { marginBottom: 5 }]}>Votre compte n'est pas encore actif</ThemedText>
              <ThemedText type="default"
                style={[styles.textCenter, { fontSize: FONT_SIZES.md, lineHeight: 18, color: Colors[colorScheme ?? 'light'].light }]}>
                Cependant, vous pouvez déjà ajouter de nouvelles annonces et mettre à jour votre profil. Une fois votre compte approuvé, votre profil et vos annonces seront éligibles pour être inclus dans nos catalogues. Vous pouvez également acheter des annonces directement à partir de notre catalogue.
              </ThemedText>
            </View>

            {/* <TouchableOpacity
              className='rounded-md'
              style={[styles.danger, styles.btnShadow,
              { width: '100%', paddingVertical: 15, borderRadius: 5, margin: 'auto', marginBottom: 10 }]}
              onPress={() => { router.navigate('/(tabs)/packages') }} disabled={loading}>
              {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].white} />) : (
                <ThemedText type="defaultSemiBold" style={[styles.colorWhite, { textAlign: 'center' }]}>Voir les forfaits</ThemedText>
              )}
            </TouchableOpacity>
            <View className='flex flex-row items-center mb-5'>
              <View className='h-0.5 flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].lighter }}></View>
              <ThemedText className='mx-2'>Ou</ThemedText>
              <View className='h-0.5 flex-1' style={{ backgroundColor: Colors[colorScheme ?? 'light'].lighter }}></View>
            </View> */}

            <TouchableOpacity
              className='rounded-md mb-5'
              style={[styles.lighter,
              { width: '100%', paddingVertical: 15, borderRadius: 5, margin: 'auto' }]}
              onPress={() => { router.navigate('/pages/update-profile') }} disabled={loading}>
              {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />) : (
                <Text style={[styles.text, { textAlign: 'center' }]}>Mettre à jour le profil</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </>
  );
}
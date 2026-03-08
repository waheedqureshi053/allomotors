import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStyles } from "../_styles/globalStyle";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getAuthToken } from "../_services/apiConfig";
import { Ionicons } from "@expo/vector-icons";
import OverlayCarCardComponent from "@/components/OverlayCarCard";
import { apiCall } from "../_services/api";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

export default function ClientAdverts() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();
  const router = useRouter();
  const [isPressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Catalogs, setCatalogs] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<any>>(null);
  const onEndReachedCalledRef = useRef(false);




  const processCatalogData = useCallback((data: any[]) => {
    return data?.map((item) => {
      let parsedAttributes: any = {};
      let OwnerAttributes: any = {};
      if (item?.Attributes) {
        if (typeof item.Attributes === "string") {
          try {
            parsedAttributes = item.Attributes ? JSON.parse(item.Attributes) : {};
            OwnerAttributes = item?.OwnerAttributes ? JSON.parse(item?.OwnerAttributes) : {};

          } catch (error) {
            console.error("JSON parse error for Attributes:", error);
            parsedAttributes = {};
            OwnerAttributes = {};
          }
        } else if (typeof item.Attributes === "object") {
          parsedAttributes = item.Attributes;
          OwnerAttributes = item.OwnerAttributes;
        }
      }
      return {
        ...item,
        Attributes: parsedAttributes,
        OwnerAttributes: OwnerAttributes,
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
    getAdverts();
  }, []);


  const getAdverts = useCallback(async (loadMore = false) => {
    // Prevent duplicate requests
    if (loading) return;
    if (loadMore && !hasMore) return;
    setLoading(true);
    // Always ensure pageIndex >= 1
    const currentPage = loadMore ? Math.max(1, page) : 1;

    try {
      const response = await apiCall(
        'POST',
        '/Account/LoadAdverts',
        null, // no query params
        {
          searchText: searchText || "",
          iView: 'list',
          maxSize: 5,
          totalCount: 0,
          pageIndex: currentPage,      // 🔥 SAFE PAGE INDEX
          pageSizeSelected: 10,
          Page: 'Advert',
          Status: '',
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

      // const dataList = response?.data?.dataList || [];
      // const newCatalogs = processCatalogData(dataList);

      // console.log('Page:', currentPage, 'Received items:', newCatalogs.length);

      // if (loadMore) {
      //   if (newCatalogs.length > 0) {
      //     setCatalogs(prev => [...prev, ...newCatalogs]);
      //     setPage(prev => prev + 1);
      //   }
      //   setHasMore(newCatalogs.length >= 10);
      // } else {
      //   setCatalogs(newCatalogs);
      //   setPage(2); // next page
      //   setHasMore(newCatalogs.length >= 10);
      // }

    } catch (error) {
      console.error("LoadAllAdverts error:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      onEndReachedCalledRef.current = false;
    }
  }, [loading, hasMore, page, searchText, processCatalogData]);



  const loadMoreData = useCallback(() => {
    if (!loading && hasMore && !onEndReachedCalledRef.current) {
      console.log('Loading more data...');
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

  // const handleEdit = (item: any) => {
  //   router.push({
  //     pathname: "/pages/update-advert",
  //     params: { id: item.ID, item: JSON.stringify(item) }
  //   });
  // };

  // const handleDelete = () => {
  // };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <OverlayCarCardComponent item={item} onRefresh={onRefresh} key={item.uniqueKey} index={item.uniqueKey} page={'client-Adverts'} />
  ), []);

  const goBack = () => {
    router.back();
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
  return (
    <FlatList
      ref={listRef}
      showsVerticalScrollIndicator={false}
      style={[styles.background, { flexGrow: 1, marginTop: insets.top }]}
      data={Catalogs}
      contentContainerStyle={Customstyles.listContent}
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
          <View className="flex flex-row items-start gap-5 px-5 pt-5">
            <View>
              <TouchableOpacity style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
                onPress={() => { goBack() }}>
                <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>Gérer Publicité</ThemedText>
              <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0 }]}>Publicité</ThemedText>
            </View>
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
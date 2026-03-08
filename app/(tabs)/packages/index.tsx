import { ActivityIndicator, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStyles } from "../../_styles/globalStyle";
import { useFocusEffect, useRouter } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { apiCall } from "@/app/_services/api";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

export default function PakagesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [Packages, setPackages] = useState<any[]>([]);
  const [RandomBackgroundColor, setBackgroundColor] = useState<string>('');

  const colors = ["#739FD9", "#05AFF2", "#2E338C", "#F2B441", "#F28B30", "#F25050", "#27594B", "#F2B441", "#F28B30", "#F25050", "#27594B", "#F2B441", "#F28B30", "#F25050", "#27594B"];
  
const LoadPackages = async () => {
  setLoading(true);

  try {
    const response = await apiCall(
      'POST',
      '/Account/LoadDataPackages',
      null,
      {
        pageIndex: 1,
        pageSizeSelected: 10,
      }
    );

    const dataList = response?.data?.obj?.dataList || [];

    let count = 0;
    if(dataList.length > 0) {
        const allList = dataList.map((item: any) => {
          const backgroundColor =
            count < colors.length ? colors[count++] : getRandomColor();
    
          return {
            ...item,
            background: backgroundColor,
          };
        });
        setPackages(allList);
    }

    console.log('✅ Success:', dataList);

  } catch (error) {
    console.error('LoadDataPackages error:', error);
  } finally {
    setLoading(false);
  }
};

  
  useFocusEffect(
    React.useCallback(() => {
      LoadPackages();
    }, [])
  );

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={[styles.background, { flex: 1, marginTop: insets.top }]}>
      <View className="p-5">
        <View className="mb-5">
          <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>Tarification/Forfaits d'abonnement</ThemedText>
          <ThemedText style={[{ fontSize: FONT_SIZES.xs }]}>Choisissez le meilleur plan pour repondre a vos bseoins.</ThemedText>
        </View>
        {Packages && Packages.length > 0 ? (
          <>
            {Packages && Packages.map((item, index) => (
              <View className="p-5 rounded-md mb-5" key={index} style={[styles.relativePosition, { backgroundColor: item?.background }]}>
                <View className="p-3 rounded-md" style={[styles.white]}>
                  <View className="py-2 px-4" style={[styles.absolutePosition, , { borderTopLeftRadius: 50, borderBottomLeftRadius: 50, top: -5, right: 0, backgroundColor: item?.background }]}>
                    <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>{item?.Price}€ <Text style={[styles.fontBold, { fontSize: FONT_SIZES.sm }]}>pour {item?.Qty}</Text></ThemedText>
                  </View>
                  <View className="flex-1 flex flex-row items-center my-5">
                    <View className="rounded-full py-2 px-4 m-auto mt-5" style={[{ backgroundColor: item?.background }]}>
                      <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} style={[styles.fontBold, { fontSize: FONT_SIZES.md }]}>{item?.Title}</ThemedText>
                    </View>
                  </View>
                  <View className="my-5">
                    <View className="flex flex-row items-center m-auto gap-2 mb-3">
                      <View>
                        <Ionicons name="checkmark-circle" size={24} color={item?.background} />
                      </View>
                      <View>
                        <Text style={[{ fontSize: FONT_SIZES.md }]}>{item?.Features}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="mt-5">

                    <TouchableOpacity
                      onPress={() => {
                        const encodedItem = encodeURIComponent(JSON.stringify(item));
                        router.push(`/packages/${item?.ID}?item=${encodedItem}`)
                      }}
                      className="flex flex-row items-center m-auto gap-2 rounded-md py-3 px-4 mb-5" style={[{ backgroundColor: item?.background }]}>
                      <Ionicons name="cart-outline" size={24} color={Colors[colorScheme ?? 'light'].white} />
                      <ThemedText lightColor={Colors[colorScheme ?? 'light'].white}>Acheter</ThemedText>
                    </TouchableOpacity>

                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <View className="flex flex-col justify-center">
              <View className="mb-10 flex items-center">
                <View className="flex flex-row items-center justify-center p-5" style={[styles.danger, styles.btnShadow, { width: 100, height: 100, borderRadius: 50 }]}>
                  <FontAwesome6 name="circle-exclamation" size={50} color={Colors[colorScheme ?? 'light'].white} />
                </View>
              </View>
              <View className="mb-5">
                <ThemedText type="title" style={[styles.textCenter, { marginBottom: 5 }]}>Aucun tarif disponible.</ThemedText>
                <ThemedText type="default"
                  style={[styles.textCenter, { fontSize: FONT_SIZES.md, lineHeight: 18, color: Colors[colorScheme ?? 'light'].light }]}>
                  Il n’y a aucun article pour le moment et aucun tarif disponible.
                </ThemedText>
              </View>
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
          </>
        )}

      </View>
      <View style={[{ marginBottom: 60 }]}></View>
    </ScrollView>
  );
}
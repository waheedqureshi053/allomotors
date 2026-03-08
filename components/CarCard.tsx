import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useRef } from 'react' 
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'; 
import { formatNODecimal } from '@/utils/helperFunction';
import { Colors } from '@/constants/theme';
import { ThemedText } from './themed-text';


const CarCardComponent: React.FC<CarCardComponentProps> = ({ item, index, page }) => {
  const colorScheme = useColorScheme();
  //const { styles: globalStyles, FONT_SIZES } = useGlobalStyles();
  const Customstyles = StyleSheet.create({
    card: {
      backgroundColor: Colors[colorScheme ?? 'light'].card,
      borderRadius: 6,
      marginBottom: 6,
      padding: 6,
      overflow: 'hidden',
      width: Dimensions.get('window').width / 2 - 9, // Calculate width based on screen
    },
    shadow: {
      shadowColor: '#BFBCBA',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    cardInner: {
      flexDirection: 'column',
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 1,
      position: 'relative',
    },
    productImage: {
      width: '100%',
      height: '100%',
      borderRadius: 6,
      // shadowColor: '#BFBCBA',
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: 0.5,
      // shadowRadius: 6,
      // elevation: 6,
    },
    wishlistButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(77, 77, 77, 0.3)',
      borderRadius: 20,
      padding: 3,
    },
    ProVerified: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.52)',
      borderRadius: 20,
      padding: 0,
      paddingHorizontal: 5, 
      justifyContent: 'center',
      alignItems: 'center',
    },
    Verified: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.52)',
      borderRadius: 20,
      padding: 0,
      paddingHorizontal: 5,
      height: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    StatusBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      borderRadius: 20,
      padding: 0,
      paddingHorizontal: 8
    },
    infoContainer: {
      paddingTop: 10,
    },
    titleContainer: {
      marginBottom: 6,
    },
    titleText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'light'].text,
    },
    modelText: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'light'].light,
      marginTop: 2,
    },
    specsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8,
    },
    specItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: Colors[colorScheme ?? 'light'].lighter,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
    },
    specText: {
      fontSize: 10,
      color: Colors[colorScheme ?? 'light'].light,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 6,
    },
    priceSymbol: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'light'].light,
      marginRight: 2,
    },
    priceText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'light'].danger,
    },
    viewsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    viewsText: {
      fontSize: 10,
      color: '#888',
    },
  });
  return ( 
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/pages/advert-detail", params: {
            id: item.ItemGuid, item: JSON.stringify(item), page
          }
        })
      }}
      style={[Customstyles.card, Customstyles.shadow]}
      activeOpacity={0.9}
    >
      <View className='flex-column' style={Customstyles.cardInner}>
        {/* Product Image */}
        <View style={Customstyles.imageContainer}>
          <Image
            source={{ uri: `https://allomotors.fr/Content/WebData/UF/thumb_${item?.PhotoURL}` }}
            resizeMode="cover"
            style={Customstyles.productImage}
          />
          {/* {page != 'catelogs' && page != 'public_catalogs' && (
            <TouchableOpacity
              style={[Customstyles.StatusBadge, {
                backgroundColor: item.Status == 'Pending' ? Colors[colorScheme ?? 'light'].warning : item.Status == 'InActive' ? Colors[colorScheme ?? 'light'].warning : item.Status == 'Active' ? Colors[colorScheme ?? 'light'].success : item.Status == 'Sold' ? Colors[colorScheme ?? 'light'].danger : Colors[colorScheme ?? 'light'].primary
              }]}
              onPress={() => { }}
              disabled={true}
              className='flex flex-row items-center gap-1'
            >
              <Ionicons name={item?.Status == 'Pending' ? "warning" : item?.Status == 'InActive' ? 'warning' : item?.Status == 'Active' ? 'checkmark-circle' : item?.Status == 'Sold' ? 'cart' : "warning"}
                size={15}
                color={Colors[colorScheme ?? 'light'].white}
              />
              <ThemedText type='default' lightColor={Colors[colorScheme ?? 'light'].white}
                style={[{ fontSize: 10 }]}
              >
                {item.Status == 'Pending' ? 'En attente' : item.Status == 'InActive' ? 'Inactif' : item.Status == 'Sold' ? 'Vendu' : item.Status}</ThemedText>
            </TouchableOpacity>
          )} */}

          {/* Owner UserType Button */}
          {page != 'public_catalogs' && item?.OwnerUserType && 
          <TouchableOpacity style={Customstyles.ProVerified}>
            <ThemedText type='default' style={[{ fontSize: 10, fontWeight: 'bold' }]}
              lightColor={Colors[colorScheme ?? 'light'].white} darkColor={Colors[colorScheme ?? 'light'].white}>
              {item?.OwnerUserType == 'Particulier' ? 'Particulier' : 'Pro'}
            </ThemedText>
          </TouchableOpacity>
          }
          {/* Verified Button */}
         {item?.Attributes?.IsVerified && 
            <TouchableOpacity className='flex flex-row items-center gap-1'
              style={[Customstyles.Verified]}
            >
              <ThemedText type='default' style={[{ fontSize: 10, fontWeight: 'bold' }]} lightColor={Colors[colorScheme ?? 'light'].white} >Vérifié</ThemedText>
              <MaterialIcons
                name="verified"
                size={16}
                color={Colors[colorScheme ?? 'light'].success}
              />
            </TouchableOpacity>
         }
        
        </View>

        {/* Product Info */}
        <View style={Customstyles.infoContainer}>
          <View style={Customstyles.titleContainer}>
            <Text
              style={Customstyles.titleText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.Title}
            </Text>
            
            {page == 'public_catalogs' && item?.OwnerAttributes?.Title && (
              <Text
                style={Customstyles.modelText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item?.OwnerAttributes?.Title || 'NA'}
              </Text>
            )}
          </View>
          <View className='flex flex-row items-center gap-1 mb-3'>
            <View style={Customstyles.specItem}>
              <MaterialIcons name="electric-bolt" size={16} color={Colors[colorScheme ?? 'light'].light} />
              <Text style={Customstyles.specText}>
                {item?.Attributes?.cylinder_in_litres || '--'}
              </Text>
            </View>
            <View style={Customstyles.specItem}>
              <MaterialCommunityIcons name="ev-station" size={16} color={Colors[colorScheme ?? 'light'].light} />
              <Text style={Customstyles.specText} numberOfLines={1}
                ellipsizeMode="tail" >
                {item?.Attributes?.energy || '--'}
              </Text>
            </View>
          </View>
          <View className="flex flex-row items-center">
            <View className="flex-1 flex-row " style={[{ alignItems: 'baseline' }]}>
              {item?.Attributes?.HidePrice == true ? (
                <>
                  <Text style={Customstyles.priceText}> **** </Text>
                </>
              ) :
                <>
                  <Text style={Customstyles.priceSymbol}>€</Text>
                  <Text style={Customstyles.priceText}>
                    {/* {item?.SellingPrice || 'N/A'} */}
                    {formatNODecimal(item?.SellingPrice) || 'N/A'}
                  </Text>
                </>
              }
            </View>

            {/* <View className='flex flex-row items-center gap-1'>
              <Text style={Customstyles.viewsText}>
                Vue(s) {item?.Views || 0}
              </Text>
            </View> */}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};


interface CarCardComponentProps {
  item: any;
  index: number;
  page: any;
}
export default CarCardComponent;

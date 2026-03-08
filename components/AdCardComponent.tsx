import { Dimensions, Image, ImageBackground, Linking, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useEffect, useRef } from 'react' 
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'; 
import { formatNODecimal } from '@/utils/helperFunction';
import { getAuthToken } from '@/app/_services/apiConfig';
import { Colors } from '@/constants/theme';
export interface Ad {
  ID: number;
  Title?: string;
  PhotoURL: string;
  Description?: string;
  AdURL: string;
  // Add other ad properties as needed
}

interface AdCardProps {
  ad: Ad;
  IsLandscape: boolean
}

export const AdCardComponent: React.FC<AdCardProps> = ({ ad, IsLandscape }) => {
  const colorScheme = useColorScheme();

  useEffect(() => {
    recordAdImpression(ad);
  }, [ad]);
//
  const recordAdImpression = async (ad: Ad) => {
    try {
      const token = await getAuthToken();
      await fetch('https://api.allomotors.fr/api/Account/RecordAdView', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ID: ad.ID, Title: ad.Title, Page : 'App' })
      });
      //console.log("🚀 recordAdImpression ~ response:", response)
    } catch (error) {
      console.error("Error recording impression", error);
    }
  };

  const recordAdClick = async (ad: Ad) => {
    try {
      const token = await getAuthToken();
      await fetch('https://api.allomotors.fr/api/Account/RecordAdClick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ID: ad.ID })
      });
    } catch (error) {
      console.error("Error recording click", error);
    }
  };

  const openAdURL = async (ad: Ad) => {
    await recordAdClick(ad);
    const supported = await Linking.canOpenURL(ad.AdURL);
    if (supported) {
      await Linking.openURL(ad.AdURL);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: Colors[colorScheme ?? 'light'].card,
      borderRadius: 6,
      marginBottom: 6, 
      overflow: 'hidden',
      minHeight: 280,
      maxHeight: 280,
      width: Dimensions.get('window').width / 2 - 9, // Calculate width based on screen
    },
    
    adContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 280,
      maxHeight: 280,
    },
    containerLandscape: {
      backgroundColor: Colors[colorScheme ?? 'light'].card,
      borderRadius: 6,
      marginBottom: 6,
      // padding: 6,
      overflow: 'hidden',
      minHeight: 100,
      maxHeight: 100,
      width: '100%', // Calculate width based on screen
    },
    adContainerLandscape: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 100,
      maxHeight: 100,
    },
    shadow: {
      shadowColor: '#BFBCBA',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    adImage: {
      width: "100%",
      height: "100%",
      borderRadius: 6,
      marginRight: 12,
    },
    adImageLandscape: {
      width: "100%",
      height: 100,
      borderRadius: 6,
      marginRight: 12,
    },
    adContent: {
      flex: 1,
    },
    adLabel: {
      fontSize: 10,
      marginBottom: 4,
      textTransform: 'uppercase',
      fontWeight: '600',
      textAlign: 'center',
    },
    adTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
      textAlign: 'center',
    },
    adCta: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'light'].danger,
      fontWeight: '500',
      textAlign: 'center',
    },
  });

  return (
    <>
      {!IsLandscape && (
        <>
          <TouchableOpacity
            style={[styles.container, styles.shadow]}
            onPress={() => openAdURL(ad)}
            activeOpacity={0.7}
          >
            {/* <ImageBackground
      source={{ uri: ad.PhotoURL }}
      style={[styles.adContainer]}
      resizeMode='contain'
    /> */}
            <View >
              {ad.PhotoURL && (
                <Image
                  source={{ uri: `https://allomotors.fr/Content/WebData/UF/${ad.PhotoURL}` }}
                  style={styles.adImage}
                  resizeMode="cover"
                />
              )}
              <View className='position-absolute top-0 left-0 right-0' style={[styles.adContent, { marginTop: -70, }]}>
                {ad.Title && (
                  <Text style={styles.adTitle} numberOfLines={2}>
                    {ad.Title}
                  </Text>
                )}
                {ad.Description && (
                  <Text style={styles.adTitle} numberOfLines={2}>
                    {ad.Description}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}

      {IsLandscape && (
        <>
          <TouchableOpacity
            style={[styles.containerLandscape, styles.shadow]}
            onPress={() => openAdURL(ad)}
            activeOpacity={0.7}
          >
            {/* <ImageBackground
      source={{ uri: ad.PhotoURL }}
      style={[styles.adContainer]}
      resizeMode='contain'
    /> */}
            <View >
              {ad.PhotoURL && (
                <Image
                  source={{ uri: `https://allomotors.fr/Content/WebData/UF/${ad.PhotoURL}` }}
                  style={styles.adImageLandscape}
                  resizeMode="cover"
                />
              )}
              <View className='position-absolute top-0 left-0 right-0' style={[styles.adContent, { marginTop: -70, }]}>
                {ad.Title && (
                  <Text style={styles.adTitle} numberOfLines={2}>
                    {ad.Title}
                  </Text>
                )}
                {ad.Description && (
                  <Text style={styles.adTitle} numberOfLines={2}>
                    {ad.Description}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}
    </>


  );
};





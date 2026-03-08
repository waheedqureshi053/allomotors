import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Animated, useColorScheme } from 'react-native';
import React, { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDecimal, formatNODecimal } from '@/utils/helperFunction';
import SwipeableRow from './SwipeableRow';
import { Alert } from 'react-native';
import { getAuthToken } from '@/app/_services/apiConfig';
import { Colors } from '@/constants/theme';
import { ThemedText } from './themed-text';

interface CarCardComponentProps {
  item: any;
  index: number;
  page: any;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onRefresh?: () => void;
}

const OverlayCarCardComponent: React.FC<CarCardComponentProps> = ({
  item,
  index,
  page,
  onRefresh, // Add onRefresh as a prop
}) => {
  const colorScheme = useColorScheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [statusOptions, SetStatusOptions] = useState([
    { value: "Active", label: "Active" },
    { value: "InActive", label: "Inactif" },
  ]);
  const [currentStatus, setCurrentStatus] = useState(item?.Status);
  const toggleStatus = async () => {
    const newStatus = currentStatus === 'Active' ? 'InActive' : 'Active';
    await updateAdvertStatusSoft(item, newStatus);
    if (onRefresh) {
      onRefresh();
    }
  };
  const [activeStatus, setActiveStatus] = useState<any>(item?.Status ? item.Status : '');
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const encodedItem = encodeURIComponent(JSON.stringify(item));
    router.push({
      pathname: "/pages/advert-detail", params: {
        id: item.ItemGuid, item: JSON.stringify(item)
      }
    })
  };
  const handleEdit = (item: any) => {
    router.push({
      pathname: "/pages/update-advert",
      params: { id: item.ID, item: JSON.stringify(item) }
    });
  };
  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    //onDelete?.(item);
  };
  const getStatusColor = () => {
    return item.Status == 'Pending' ? Colors[colorScheme ?? 'light'].warning :
      item.Status == 'InActive' ? Colors[colorScheme ?? 'light'].warning :
        item.Status == 'Active' ? Colors[colorScheme ?? 'light'].success :
          item.Status == 'Sold' ? Colors[colorScheme ?? 'light'].danger :
            Colors[colorScheme ?? 'light'].primary;
  };
  const updateAdvertStatusSoft = async (item: any, status: any) => {
    try {
      //console.log(item);
      // item.Status = status;
      const token = await getAuthToken();
      console.log(`ID: ${item.ID}, Status: ${status}`);
      const params = { ID: item.ID, Status: status };
      const response = await fetch(`https://api.allomotors.fr/api/Account/UpdateAdvertStatusSoft`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      console.log(data);
      if (data?.statusCode === 1) {
        setCurrentStatus(currentStatus);
        if (currentStatus == "Active") {
          item.Status = "InActive";
        }
        Alert.alert('Annonce mise à jour', 'L’annonce a été mise à jour avec succès');
      } else if (data?.statusCode === 2) {
        Alert.alert('Non mise à jour', 'Vous ne pouvez pas activer avant que l’administrateur ne l’active pour la première fois');
      } else {
        Alert.alert('Échec !', 'Une erreur s’est produite');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur réseau ou serveur s’est produite');
    }
  };
  return (
    <SwipeableRow OnDelete={() => { handleDelete }}
      OnEdit={() => { handleEdit(item) }} key={index}>
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <View style={styles.container}>
            {/* Background Image */}
            <Image
              source={{ uri: `https://allomotors.fr/Content/WebData/UF/thumb_${item?.PhotoURL}` }}
              resizeMode="cover"
              style={styles.backgroundImage}
            />

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
              locations={[0, 0.3, 1]}
              style={styles.gradientOverlay}
            />

            {/* Action Buttons (Edit/Delete) */}
            {/* {(onEdit || onDelete) && (
              <View style={styles.actionButtons}>
                {onEdit && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={handleEdit}
                  >
                    <Ionicons name="create-outline" size={16} color="white" />
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                  >
                    <Ionicons name="trash-outline" size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            )} */}

            {/* {item?.Status == 'Active' || item?.Status == 'InActive' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={toggleStatus}
                  style={{ backgroundColor: currentStatus === 'Active' ? Colors[colorScheme ?? 'light'].danger : Colors[colorScheme ?? 'light'].white, paddingHorizontal: 5, borderRadius: 30 }}
                  key={index}
                  >
                  <ThemedText type='default' lightColor={currentStatus === 'Active' ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light} darkColor={currentStatus === 'Active' ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}> {currentStatus === 'Active' ? 'Active' : 'Inactif'} </ThemedText>
                </TouchableOpacity>
                <View className='flex flex-row flex-wrap items-center gap-2 mb-2'>
                  {statusOptions.map((st: any, index: number) => (
                    <TouchableOpacity
                      style={{ backgroundColor: activeStatus == st?.value ? Colors[colorScheme ?? 'light'].danger : Colors[colorScheme ?? 'light'].white, paddingHorizontal: 5, borderRadius: 30 }}
                      //style={[styles.button, item.Status === item?.value ? styles.primary : styles.lighter]}
                      key={index}
                      onPress={() => updateAdvertStatusSoft(item, st?.value)}>
                      <ThemedText type='default' lightColor={activeStatus == st?.value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light} darkColor={activeStatus == st?.value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}> {st?.label} </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )} */}

            {/* Status Badge toggleStatus*/}
            <TouchableOpacity
              onPress={() => {toggleStatus()}}
              disabled={item?.Status != 'Active' && item.Status != 'InActive'}
              style={{ opacity: item?.Status != 'Active' && item.Status != 'InActive' ? 0.7 : 1 }}
            >
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Ionicons
                  name={
                    item?.Status == 'Pending' ? "time-outline" :
                      item?.Status == 'InActive' ? 'eye-off-outline' :
                        item?.Status == 'Active' ? 'checkmark-circle-outline' :
                          item?.Status == 'Sold' ? 'cart-outline' : "help-outline"
                  }
                  size={12}
                  color="white"
                />
                <Text style={styles.statusText}>
                  {item?.Status != 'Active' && item?.Status != 'InActive' ?
                    item.Status == 'Pending' ? 'En attente' :
                      item.Status == 'InActive' ? 'Inactif' :
                        item.Status == 'Active' ? 'Actif' :
                          item.Status == 'Sold' ? 'Vendu' : item.Status
                    :
                    currentStatus === 'Active' ? 'Actif' : 'Inactif'
                  }
                </Text>
              </View>
            </TouchableOpacity>

            {/* Transparent Info Card */}
            <View style={styles.infoCard}>
              {/* Title with max 2 lines */}
              <Text style={[styles.title, { lineHeight: 17 }]} numberOfLines={2} ellipsizeMode="tail">
                {item?.Title}
              </Text>
              <ThemedText type='default' style={{ color: Colors[colorScheme ?? 'light'].light, fontSize: 12, lineHeight: 12, marginBottom: 5 }} numberOfLines={1} ellipsizeMode="tail">
                {item?.OwnerFirstName} {item?.OwnerLastName}
              </ThemedText>

              {/* Specs Row */}
              <View style={styles.specsRow}>
                <View style={styles.specItem}>
                  <MaterialIcons name="electric-bolt" size={14} color="white" />
                  <Text style={styles.specText}>
                    {item?.Attributes?.cylinder_in_litres || '--'}
                  </Text>
                </View>

                <View style={styles.specItem}>
                  <MaterialCommunityIcons name="ev-station" size={14} color="white" />
                  <Text style={styles.specText}>
                    {item?.Attributes?.energy || '--'}
                  </Text>
                </View>

                {/* <View style={styles.specItem}>
                <Ionicons name="speedometer-outline" size={14} color="white" />
                <Text style={styles.specText}>
                  {item?.Attributes?.mileage ? `${formatDecimal(item?.Attributes?.mileage)}km` : '--'}
                </Text>
              </View> */}

              </View>

              {/* Price and Views */}
              <View style={styles.bottomRow}>
                <View style={styles.priceContainer}>
                  {item?.Attributes?.HidePrice ? (
                    <Text style={styles.priceTextHidden}>****</Text>
                  ) : (
                    <>
                      <Text style={styles.priceSymbol}>€</Text>
                      <Text style={styles.priceText}>
                        {formatNODecimal(item?.SellingPrice) || 'N/A'}
                      </Text>
                    </>
                  )}
                </View>
                {/* <View style={styles.viewsContainer}>
                  <Ionicons name="eye-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.viewsText}>
                    {item?.Views || 0}
                  </Text>
                </View> */}

              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </SwipeableRow>
  );
};
const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width - 32,
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  actionButtons: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  editButton: {
    borderColor: 'rgba(74,144,226,0.5)',
    borderWidth: 1,
  },
  deleteButton: {
    borderColor: 'rgba(255,69,58,0.5)',
    borderWidth: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,

    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    margin: 10
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 20,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  specText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginRight: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  priceTextHidden: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
});
export default OverlayCarCardComponent;
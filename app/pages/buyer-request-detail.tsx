import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStyles } from "../_styles/globalStyle";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSearchParams } from "expo-router/build/hooks";
import { useSession } from "../_services/ctx";
import StatusUpdateModal from "@/components/StatusUpdateModal";
import * as SignalR from '@microsoft/signalr';
import { apiCall } from "../_services/api";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import analytics from "@react-native-firebase/analytics";

type SelectedObjectType = {
  [key: string]: any;
  SelectedProp?: string;
  UpdateHistory?: string;
  UpdateHistoryArr?: any[];
};


export default function BuyerRequestScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();
  const { user } = useSession();
  const router = useRouter();
  const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [Requests, setRequests] = useState<any[]>([]);
  const [statusModalVisible, setStatusModalVisible] = useState<boolean>(false);
  const params = useSearchParams();
  const id = params.get("id");
  const item = params.get("item");
  //expandAttributes(item!, parsedData, 'AdvertRequest')
  let parsedData = useMemo(() => {
    return typeof item === 'string' ? JSON.parse(item) : null;
  }, [item]);

  //expandAttributes(item!, parsedData, 'AdvertRequest') //typeof item === 'string' ? JSON.parse(item) : null;

  const { session } = useSession();
  useEffect(() => {
    //console.log("Request ID: " + parsedData.ID);
    if (session?.token) {
      const newConnection = new SignalR.HubConnectionBuilder()
        .withUrl("https://api.allomotors.fr/realtimeHub", {
          accessTokenFactory: () => session?.token ?? "",
          transport: SignalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(SignalR.LogLevel.Information)
        .build();
      newConnection.on("UpdateRequest", (dataObj) => {
        //console.log("UpdateRequest obj: ", dataObj);
        try {

          let statusObj = dataObj ? JSON.parse(dataObj) : {};
          if (Number(parsedData.ID) == Number(statusObj.ID)) {
            //console.log("Update Request ID matched");
            parsedData.Status = statusObj.Status;
            parsedData.BuyerStatus = statusObj.BuyerStatus;
            parsedData.OwnerStatus = statusObj.OwnerStatus;
          }
          else {
            console.error("Update Request ID not matched", parsedData.ID + 1);
            console.error("Signalr ID not matched", parseInt(statusObj.ID) + 1);
          }
        } catch (error) {
          //console.log("Update Request Error: ", error);
        }
      });
      newConnection.onclose(async (error) => {
        //console.error("Connection closed:", error);
        setTimeout(async () => {
          try {
            await newConnection.start();
            ////console.log("Reconnected to SignalR!");
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
  const goBack = () => {
    router.back();
  };
  const Customstyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      paddingHorizontal: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      marginBottom: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors[colorScheme ?? 'light'].text,
    },
    content: {
      paddingBottom: 20,
    },
    card: {
      backgroundColor: Colors[colorScheme ?? 'light'].card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    vehicleTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: Colors[colorScheme ?? 'light'].text,
      marginLeft: 12,
    },
    divider: {
      height: 1,
      backgroundColor: Colors[colorScheme ?? 'light'].light,
      marginVertical: 8,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 8,
    },
    infoLabel: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'light'].light,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'light'].text,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors[colorScheme ?? 'light'].text,
      marginBottom: 16,
    },
    partyContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    partyCard: {
      backgroundColor: Colors[colorScheme ?? 'light'].card,
      borderRadius: 10,
      padding: 16,
      width: '48%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'light'].light,
    },
    partyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'light'].light,
      marginTop: 8,
    },
    partyName: {
      fontSize: 17,
      fontWeight: '700',
      color: Colors[colorScheme ?? 'light'].text,
      marginTop: 4,
    },
    partyDetail: {
      fontSize: 15,
      color: Colors[colorScheme ?? 'light'].success,
      fontWeight: '600',
      marginTop: 6,
    },
    statusContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    statusItem: {
      width: '48%',
      marginBottom: 16,
    },
    statusLabel: {
      fontSize: 15,
      color: Colors[colorScheme ?? 'light'].light,
      marginBottom: 6,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      justifyContent: 'center',
    },
    acceptedBadge: {
      backgroundColor: Colors[colorScheme ?? 'light'].success,
    },
    onholdBadge: {
      backgroundColor: Colors[colorScheme ?? 'light'].warning,
    },
    statusText: {
      fontSize: 15,
      fontWeight: '600',
      marginRight: 6,
      color: Colors[colorScheme ?? 'light'].white,
    },
    offerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    offerItem: {
      alignItems: 'center',
      backgroundColor: '#D9D0C7',
      borderRadius: 10,
      padding: 5,
      flex: 1,
      marginHorizontal: 4,

    },
    offerLabel: {
      fontSize: 15,
      color: Colors[colorScheme ?? 'light'].light,
      fontWeight: '500',
      marginBottom: 6,
    },
    offerValue: {
      fontSize: 17,
      fontWeight: '700',
      color: Colors[colorScheme ?? 'light'].primary,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
      backgroundColor: '#f8f9fa',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    },
    primaryButton: {
      flex: 1,
      backgroundColor: '#1a73e8',
      padding: 16,
      borderRadius: 10,
      marginLeft: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    primaryButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: '#f1f3f4',
      padding: 16,
      borderRadius: 10,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    secondaryButtonText: {
      color: '#1a73e8',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
  });
  const formatAmount = (value: any) => {
    const number = Number(value);
    if (isNaN(number)) return "0.00";
    return number.toFixed(2);
  };
  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const historyData = [
    {
      toStatus: 'Accepted' as const,
      fromStatus: 'Pending' as const,
      enteredOn: '2023-05-15 14:30',
      comment: 'Request was approved by admin'
    },
    {
      toStatus: 'Pending' as const,
      fromStatus: 'Active' as const, // Change this value to one of the allowed values
      enteredOn: '2023-05-14 10:15',
      comment: 'Request was submitted for review'
    }
  ];
  const [selectedObject, setSelectedObject] = useState<SelectedObjectType | null>(null);
  const [statusType, setStatusType] = useState<string>('Status');
  const initStatusModal = (item: any, prop: string = "Status") => {
    try {
      // Create a deep copy of the item (similar to angular.copy)
      const copiedItem = item; //JSON.parse(JSON.stringify(item));

      console.log('Selected Item:', copiedItem);
      // Prepare the selected object
      const newSelectedObject: SelectedObjectType = {
        ...copiedItem,
        SelectedProp: prop
      };

      // Parse the UpdateHistory if it exists
      if (newSelectedObject.UpdateHistory) {
        newSelectedObject.UpdateHistoryArr = JSON.parse(newSelectedObject.UpdateHistory);
      }

      setSelectedObject(newSelectedObject);
      setStatusType(prop);
      setStatusModalVisible(true);
    } catch (error) {
      console.error('Error initializing status modal:', error);
      Alert.alert('Error', 'Failed to initialize status modal');
    }
  };
  const closeStatusModal = () => {
    setStatusModalVisible(false);
    setSelectedObject(null);
  };
  const handleStatusSubmit = async (data: any) => {
    try {
      //wrapAttributes(data, 'AdvertRequest');
      console.log('Submitted:', data);
      const response = await apiCall(
        'POST',
        '/Account/UpdateRequest2',
        null,
        data
      );
      
if(data?.Status == 'Accepted' || data?.Status == 'Sold'){
  await analytics().logEvent('purchase', {
  transaction_id: data?.ID,
  value: data?.BuyersCommission,
  currency: 'EUR',
  items: [
    {
      item_name: parsedData?.AdvertTitle ? parsedData?.AdvertTitle : data?.RequestType,
      item_id: data?.AdvertID,
      price: data?.SellingPriceFinal,
      quantity: 1
    }
  ]
});
}


      goBack();
      //console.log('Response:', response?.data);
      // const parsedData = {
      //   ...selectedObject,
      //   ...data,
      // };
      // Update local state if needed
      //setSelectedObject(parsedData);
      setStatusModalVisible(false);
    } catch (error) {
      console.error('UpdateRequest Error:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
    }
  };

  const ReturnStatusInFrench = (status: string) => {
    switch (status) {
      case 'Accepted': return 'Accepté';
      case 'Delivered': return 'Livré';
      case 'Sold': return 'Vendu';
      case 'Completed': return 'Terminé';
      case 'Pending': return 'En attente';
      case 'Cancelled': return 'Annulé';
      case 'Rejected': return 'Rejeté';
      default: return status;
    }
  }
  
  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
      style={[styles.background]} contentContainerStyle={{ flexGrow: 1, marginTop: insets.top }}>
      <View style={Customstyles.container}>
        <View className="flex flex-row items-start gap-5 my-5">
          <View>
            <TouchableOpacity style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
              onPress={() => { goBack() }}>
              <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>Détail de la demande</ThemedText>
            <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0 }]}>Acheteur</ThemedText>
          </View>
        </View>
        <ScrollView contentContainerStyle={Customstyles.content}>
          <View style={Customstyles.card}>
            <View style={Customstyles.cardHeader}>
              <Ionicons name="car-sport" size={28} color={Colors[colorScheme ?? 'light'].light} />
              <Text style={Customstyles.vehicleTitle}>{parsedData?.AdvertTitle}</Text>
            </View>
            <View style={Customstyles.divider} />
            <View style={Customstyles.infoRow}>
              <Text style={Customstyles.infoLabel}>Date de demande</Text>
              <Text style={Customstyles.infoValue}>
                {formatDate(new Date(parsedData?.EnteredOn))}
              </Text>
            </View>
            <View style={Customstyles.infoRow}>
              <Text style={Customstyles.infoLabel}>Date de réunion</Text>
              <Text style={Customstyles.infoValue}>
                {parsedData?.MeetingDate ? formatDate(new Date(parsedData?.MeetingDate)) : 'Non planifié'}
              </Text>
            </View>
          </View>
          
          <Text style={Customstyles.sectionTitle}>Détails de l'offre</Text>

          <View className="mb-4" style={styles.card}>

            <View
              className="flex flex-row items-center justify-between"
              style={{
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: Colors[colorScheme ?? 'light'].light,
                marginBottom: 5
              }}
            >
              <ThemedText style={[styles.colorSuccess, { lineHeight: 16 }]}>
                {parsedData?.RequestType === "Proposal" ? "Proposition" : "Demande"} Offre
              </ThemedText>

              <ThemedText
                type="default"
                lightColor={Colors[colorScheme ?? 'light'].light}
                darkColor={Colors[colorScheme ?? 'light'].light}
                style={{ textAlign: 'right', lineHeight: 16 }}
              >
                {formatDate(parsedData?.EnteredOn)}
              </ThemedText>
            </View>

            {/* Prix */}
            <View className="flex flex-row items-center justify-between mb-2">
              <ThemedText type="default">Prix:</ThemedText>
              <ThemedText type="default" style={{ textAlign: 'right' }}>
                {formatAmount(parsedData?.Attributes?.SellingPrice)}
              </ThemedText>
            </View>

            {(user?.Roles.includes("View_Commission") ||
              user?.Roles.includes("Admin") ||
              parsedData?.RequestOwnerID == user?.UserId) && (
                <>
                  {/* Buyer Commission */}
                  <View className="flex flex-row items-center justify-between mb-2">
                    <ThemedText
                      type="default"
                      style={{ color: Colors[colorScheme ?? 'light'].success }}
                    >
                      Ach Comm:
                    </ThemedText>
                    <ThemedText type="default" style={{ textAlign: 'right' }}>
                      {formatAmount(parsedData?.Attributes?.BuyersCommission)}
                    </ThemedText>
                  </View>

                  {/* Duration */}
                  {parsedData?.Duration > 0 && (
                    <View className="flex flex-row items-center justify-between mb-2">
                      <ThemedText type="default">
                        Frais de durée:
                      </ThemedText>
                      <ThemedText type="default" style={{ textAlign: 'right' }}>
                        {formatAmount(parsedData?.Attributes?.DurationAmount)}
                      </ThemedText>
                    </View>
                  )}

                  {/* Credit */}
                  <View className="flex flex-row items-center justify-between mb-2">
                    <ThemedText type="default">Crédit:</ThemedText>
                    <ThemedText type="default" style={{ textAlign: 'right' }}>
                      {formatAmount(parsedData?.Attributes?.CreditAmount)}
                    </ThemedText>
                  </View>

                  {/* Cash */}
                  <View className="flex flex-row items-center justify-between mb-2">
                    <ThemedText type="default">Comptant:</ThemedText>
                    <ThemedText type="default" style={{ textAlign: 'right' }}>
                      {formatAmount(parsedData?.Attributes?.CashAmount)}
                    </ThemedText>
                  </View>

                  {/* Total (Non Owner) */}
                  <View className="flex flex-row items-center justify-between mb-2">
                    <ThemedText
                      type="defaultSemiBold"
                      lightColor={Colors[colorScheme ?? 'light'].danger}
                      darkColor={Colors[colorScheme ?? 'light'].danger}
                      style={styles.fontBold}
                    >
                      Total:
                    </ThemedText>

                    <ThemedText
                      type="defaultSemiBold"
                      lightColor={Colors[colorScheme ?? 'light'].danger}
                      darkColor={Colors[colorScheme ?? 'light'].danger}
                      style={[styles.fontBold, { textAlign: 'right' }]}
                    >
                      {formatAmount(parsedData?.Attributes?.SellingPriceFinal)}
                    </ThemedText>
                  </View>
                </>
              )}

            {/* If Advert Owner */}
            {parsedData?.AdvertOwnerID === user?.UserId && (
              <>
                {/* Seller Commission */}
                <View className="flex flex-row items-center justify-between mb-2">
                  <ThemedText type="default">
                    Vend Comm:
                  </ThemedText>
                  <ThemedText type="default" style={{ textAlign: 'right' }}>
                    {formatAmount(parsedData?.Attributes?.SellersCommission)}
                  </ThemedText>
                </View>

                {/* Owner Total */}
                <View className="flex flex-row items-center justify-between mb-2">
                  <ThemedText
                    type="defaultSemiBold"
                    lightColor={Colors[colorScheme ?? 'light'].danger}
                    darkColor={Colors[colorScheme ?? 'light'].danger}
                    style={styles.fontBold}
                  >
                    Total:
                  </ThemedText>

                  <ThemedText
                    type="defaultSemiBold"
                    lightColor={Colors[colorScheme ?? 'light'].danger}
                    darkColor={Colors[colorScheme ?? 'light'].danger}
                    style={[styles.fontBold, { textAlign: 'right' }]}
                  >
                    {formatAmount(parsedData?.Attributes?.SellingPrice)}
                  </ThemedText>
                </View>
              </>
            )}

            {/* Meeting Date */}
            {parsedData?.MeetingDate && (
              <View className="flex flex-row items-center justify-between mb-2">
                <ThemedText
                  type="default"
                  style={{ color: Colors[colorScheme ?? 'light'].info }}
                >
                  Date de réunion
                </ThemedText>

                <ThemedText
                  type="default"
                  style={{ textAlign: 'right', color: Colors[colorScheme ?? 'light'].info }}
                >
                  {formatDate(parsedData?.MeetingDate)}
                </ThemedText>
              </View>
            )}

          </View>



          {/* <View className="mb-4" style={styles.card}>
            <View className="flex flex-row items-center justify-between"
              style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors[colorScheme ?? 'light'].light, marginBottom: 5 }}>
              <ThemedText style={[styles.colorSuccess, { lineHeight: 16 }]}>{parsedData?.RequestType === "Proposal" ? "Proposition" : "Demande"} Offre</ThemedText>
              <ThemedText type="default" lightColor={Colors[colorScheme ?? 'light'].light} darkColor={Colors[colorScheme ?? 'light'].light}
                style={[{ textAlign: 'right', lineHeight: 16 }]}>
                {formatDate(parsedData?.EnteredOn)}
              </ThemedText>
            </View>
            <View className="flex flex-row items-center justify-between mb-2">
              <ThemedText type="default" style={[{ lineHeight: 16 }]} >
                Prix:
              </ThemedText>
              <ThemedText type="default" style={[{ textAlign: 'right' }]} >
                {parsedData?.Attributes?.SellingPrice?.toFixed(2) || "0.00"}
              </ThemedText>
            </View>
            {user?.Roles.includes("View_Commission") || user?.Roles.includes("Admin") || parsedData?.RequestOwnerID == user?.UserId && (
              <>

                <View className="flex flex-row items-center justify-between mb-2">
                  <ThemedText type="default" style={[{ lineHeight: 16, color: Colors[colorScheme ?? 'light'].success }]} >
                    Ach Comm:
                  </ThemedText>
                  <ThemedText type="default" style={[{ textAlign: 'right' }]} >
                    {parsedData?.Attributes?.BuyersCommission?.toFixed(2) || "0.00"}
                  </ThemedText>
                </View>
                
                {parsedData?.Duration > 0 && (
                  <View className="flex flex-row items-center justify-between mb-2">
                    <ThemedText type="default" style={[{ lineHeight: 16 }]} >
                      Frais de durée:
                    </ThemedText>
                    <ThemedText type="default" style={[{ textAlign: 'right' }]} >
                      {parsedData?.Attributes?.DurationAmount || "0.00"}
                    </ThemedText>
                  </View>
                )}
                <View className="flex flex-row items-center justify-between mb-2">
                  <ThemedText type="default" style={[{ lineHeight: 16 }]} >
                    Crédit:
                  </ThemedText>
                  <ThemedText type="default" style={[{ textAlign: 'right' }]} >
                    {parsedData?.Attributes?.CreditAmount || "0.00"}
                  </ThemedText>
                </View>
                <View className="flex flex-row items-center justify-between mb-2">
                  <ThemedText type="default" style={[{ lineHeight: 16 }]} >
                    Comptant:
                  </ThemedText>
                  <ThemedText type="default" style={[{ textAlign: 'right' }]} >
                    {parsedData?.Attributes?.CashAmount || "0.00"}
                  </ThemedText>
                </View>

                 <View className="flex flex-row items-center justify-between mb-2">
                  <ThemedText type="defaultSemiBold" lightColor={Colors[colorScheme ?? 'light'].danger} darkColor={Colors[colorScheme ?? 'light'].danger}  style={[styles.fontBold]}>
                    Total:
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" lightColor={Colors[colorScheme ?? 'light'].danger} darkColor={Colors[colorScheme ?? 'light'].danger} style={[styles.fontBold,{ textAlign: 'right' }]}  >
                    {parsedData?.Attributes?.SellingPriceFinal?.toFixed(2) || "0.00"}
                  </ThemedText>
                </View>
                


              </>
            )}
            {parsedData?.AdvertOwnerID === user?.UserId && (
              <>
                <View className="flex flex-row items-center justify-between mb-2">
                  <ThemedText type="default" style={[{ lineHeight: 16}]} >
                    Vend Comm:
                  </ThemedText>
                  <ThemedText type="default" style={[{ textAlign: 'right' }]} >
                    {parsedData?.Attributes?.SellersCommission?.toFixed(2) || "0.00"}
                  </ThemedText>
                </View>

                <View className="flex flex-row items-center justify-between mb-2">
                  <ThemedText type="defaultSemiBold" lightColor={Colors[colorScheme ?? 'light'].danger} darkColor={Colors[colorScheme ?? 'light'].danger}  style={[styles.fontBold]}>
                    Total:
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" lightColor={Colors[colorScheme ?? 'light'].danger} darkColor={Colors[colorScheme ?? 'light'].danger} style={[styles.fontBold,{ textAlign: 'right' }]}  >
                    {parsedData?.Attributes?.SellingPrice?.toFixed(2) || "0.00"}
                  </ThemedText>
                </View>
                
              </>
            )}
            {parsedData?.MeetingDate && (
              <View className="flex flex-row items-center justify-between mb-2">
                <ThemedText type="default" style={[{ lineHeight: 16, color: Colors[colorScheme ?? 'light'].info }]} >
                  Date de réunion
                </ThemedText>
                <ThemedText type="default" style={[{ textAlign: 'right', color: Colors[colorScheme ?? 'light'].info }]} >
                  {formatDate(parsedData?.MeetingDate)}
                </ThemedText>
              </View>
            )}
          </View> */}
          <View className="mb-5">
            <View style={[Customstyles.card]}>
              <Text style={Customstyles.sectionTitle}>Statut de la transaction</Text>
              <View style={Customstyles.statusContainer}>
                <View style={Customstyles.statusItem}>
                  <Text style={Customstyles.statusLabel}>Admin</Text>
                  {user?.Roles.includes('Admin') || user?.Roles.includes('UpdateAll_Request') && parsedData?.OwnerStatus != 'Rejected' && parsedData?.BuyerStatus != 'Rejected' ?
                    <TouchableOpacity onPress={() => initStatusModal(parsedData, 'Status')}>
                      <View style={[
                        Customstyles.statusBadge,
                        parsedData?.Status === 'Accepted'
                          ? Customstyles.acceptedBadge
                          : Customstyles.onholdBadge
                      ]}>
                        <Text style={Customstyles.statusText}>{ReturnStatusInFrench(parsedData?.Status)}</Text>
                        <Ionicons
                          name={parsedData?.Status === 'Accepted' ? 'checkmark-circle' : 'pause-circle'}
                          size={16}
                          color={parsedData?.Status === 'Accepted' ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].white}
                        />
                      </View>
                    </TouchableOpacity>
                    : <View style={[
                      Customstyles.statusBadge,
                      parsedData?.Status === 'Accepted'
                        ? Customstyles.acceptedBadge
                        : Customstyles.onholdBadge
                    ]}>
                      <Text style={Customstyles.statusText}>{ReturnStatusInFrench(parsedData?.Status)}</Text>
                      <Ionicons
                        name={parsedData?.Status === 'Accepted' ? 'checkmark-circle' : 'pause-circle'}
                        size={16}
                        color={parsedData?.Status === 'Accepted' ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].white}
                      />
                    </View>
                  }
                </View>
                <View style={Customstyles.statusItem}>
                  <Text style={Customstyles.statusLabel}>Vendeur</Text>

                  {parsedData?.AdvertOwnerID == user?.UserId &&
                    parsedData?.OwnerStatus != 'Rejected' &&
                    parsedData?.BuyerStatus != 'Rejected' &&
                    parsedData?.Status != 'Accepted' &&
                    parsedData?.Status != 'Delivered' &&
                    parsedData?.Status != 'Rejected ' &&
                    parsedData?.Status != 'Sold' ?
                    <TouchableOpacity onPress={() => initStatusModal(parsedData, 'OwnerStatus')}>
                      <View style={[
                        Customstyles.statusBadge,
                        parsedData?.OwnerStatus === 'Accepted'
                          ? Customstyles.acceptedBadge
                          : Customstyles.onholdBadge
                      ]}>
                        <Text style={Customstyles.statusText}>{ReturnStatusInFrench(parsedData?.OwnerStatus)}</Text>
                        <Ionicons
                          name={parsedData?.OwnerStatus === 'Accepted' ? 'checkmark-circle' : 'pause-circle'}
                          size={16}
                          color={parsedData?.OwnerStatus === 'Accepted' ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].white}
                        />
                      </View>
                    </TouchableOpacity>
                    : <View style={[
                      Customstyles.statusBadge,
                      parsedData?.OwnerStatus === 'Accepted'
                        ? Customstyles.acceptedBadge
                        : Customstyles.onholdBadge
                    ]}>
                      <Text style={Customstyles.statusText}>{ReturnStatusInFrench(parsedData?.OwnerStatus)}</Text>
                      <Ionicons
                        name={parsedData?.OwnerStatus === 'Accepted' ? 'checkmark-circle' : 'pause-circle'}
                        size={16}
                        color={parsedData?.OwnerStatus === 'Accepted' ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].white}
                      />
                    </View>
                  }
                </View>
                <View style={Customstyles.statusItem}>
                  <Text style={Customstyles.statusLabel}>Acheteur</Text>
                  {parsedData?.RequestOwnerID == user?.UserId && (parsedData?.OwnerStatus != 'Rejected' &&
                    parsedData?.BuyerStatus != 'Rejected' && parsedData?.BuyerStatus != 'Accepted') &&
                    (parsedData?.Status != 'Delivered' && parsedData?.Status != 'Accepted' &&
                      parsedData?.Status != 'Rejected') ?
                    <TouchableOpacity onPress={() => initStatusModal(parsedData, 'BuyerStatus')}>
                      <View style={[
                        Customstyles.statusBadge,
                        parsedData?.BuyerStatus === 'Accepted'
                          ? Customstyles.acceptedBadge
                          : Customstyles.onholdBadge
                      ]}>
                        <Text style={Customstyles.statusText}>{ReturnStatusInFrench(parsedData?.BuyerStatus)}</Text>
                        <Ionicons
                          name={parsedData?.BuyerStatus === 'Accepted' ? 'checkmark-circle' : 'pause-circle'}
                          size={16}
                          color={parsedData?.BuyerStatus === 'Accepted' ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].white}
                        />
                      </View>
                    </TouchableOpacity>
                    : <View style={[
                      Customstyles.statusBadge,
                      parsedData?.BuyerStatus === 'Accepted'
                        ? Customstyles.acceptedBadge
                        : Customstyles.onholdBadge
                    ]}>
                      <Text style={Customstyles.statusText}>{ReturnStatusInFrench(parsedData?.BuyerStatus)}</Text>
                      <Ionicons
                        name={parsedData?.BuyerStatus === 'Accepted' ? 'checkmark-circle' : 'pause-circle'}
                        size={16}
                        color={parsedData?.BuyerStatus === 'Accepted' ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].white}
                      />
                    </View>
                  }
                </View>
              </View>
            </View>
          </View>

          {/* <View className="mb-10" style={Customstyles.offerContainer}>
            <View style={Customstyles.offerItem}>
              <Text style={Customstyles.offerLabel}>Total</Text>
              {parsedData?.AdvertOwnerID == user?.UserId ? (
                <Text style={Customstyles.offerValue}>€{parsedData?.Attributes.SellingPrice}</Text>
              ) : (
                <Text style={Customstyles.offerValue}>€{parsedData?.Attributes.SellingPriceFinal}</Text>
              )}
            </View>

            <View style={Customstyles.offerItem}>
              <Text style={Customstyles.offerLabel}>Crédit</Text>
              <Text style={Customstyles.offerValue}>€{parsedData?.Attributes.CreditAmount}</Text>
            </View>

            <View style={Customstyles.offerItem}>
              <Text style={Customstyles.offerLabel}>Espèces</Text>
              <Text style={Customstyles.offerValue}>€{parsedData?.Attributes.CashAmount}</Text>
            </View>
          </View> */}
        </ScrollView>
      </View>
      <StatusUpdateModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        onSubmit={handleStatusSubmit}
        isAdmin={user?.Roles.includes('Admin') == true ? true : false}
        statusType={statusType}
        selectedObject={selectedObject}
      />
    </ScrollView>
  )



}
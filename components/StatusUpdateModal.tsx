import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, useColorScheme } from 'react-native';
import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getAuthToken } from '@/app/_services/apiConfig';
import { router, useFocusEffect } from 'expo-router';
import { useGlobalStyles } from '@/app/_styles/globalStyle';
import DateInput from './DateInput';
import { formatDecimal, getCommission } from '@/utils/helperFunction';
import { useSession } from '@/app/_services/ctx';
import { Switch } from 'react-native-switch';
import { wrapAttributes } from '@/utils/attributes';
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { ThemedText } from './themed-text';

type DurationOption = {
  Percentage: number;
  Value: number;
};
type AdvertRequest = {
  AdvertID: number;
  Disabled: boolean;
  BuyersCommission: number;
  SellersCommission: number;
  SellingPrice: number;
  SellingPriceFinal: number;
  Duration: number;
  DurationPercentage: number;
  DurationAmount: number;
  CreditAmount: number;
  CashAmount: number;
  TotalAmount: number;
  Remaining: number;
  RequestType: string;
};

type StatusModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isAdmin: boolean;
  statusType: string;
  selectedObject: any;
};

const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isAdmin,
  statusType,
  selectedObject
}) => {

  const insets = useSafeAreaInsets();
  const [MeetingDate, setMeetingDate] = useState<string>('');
  const { session, user, GetCompany, company, GetProfile, profile } = useSession();
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isConfirm, setIsConfirm] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);


  const [durationOptions] = useState<DurationOption[]>([
    { Percentage: 0, Value: 30 },
    { Percentage: 0.02, Value: 60 },
  ]);
  const InitialForm = {

    // Core Identifiers
    ID: selectedObject?.ID ?? 0,
    AdvertID: selectedObject?.AdvertID ?? 0,
    AdvertOwnerID: selectedObject?.AdvertOwnerID ?? '',
    RequestOwnerID: selectedObject?.RequestOwnerID ?? '',

    // Timestamps
    EnteredOn: selectedObject?.EnteredOn ?? new Date().toISOString(),
    UpdatedOn: selectedObject?.UpdatedOn ?? new Date().toISOString(),
    MeetingDate: null, // selectedObject?.MeetingDate ?? new Date().toISOString(),
    Deadline: selectedObject?.Deadline ?? new Date().toISOString(),

    // Status Fields
    status: selectedObject?.Status ?? '',
    OwnerStatus: selectedObject?.OwnerStatus ?? '',
    BuyerStatus: selectedObject?.BuyerStatus ?? '',
    AgentStatus: selectedObject?.AgentStatus ?? '',
    PaymentStatus: selectedObject?.PaymentStatus ?? '',
    PaymentAlertStatus: selectedObject?.PaymentAlertStatus ?? '',
    SelectedProp: selectedObject?.SelectedProp ?? '',
    IsDeleted: selectedObject?.IsDeleted ?? false,

    // Request Info
    RequestType: selectedObject?.RequestType ?? '',
    Attributes: selectedObject?.Attributes ? selectedObject?.Attributes : {},  //JSON.stringify(selectedObject?.Attributes)
    UpdateHistory: selectedObject?.UpdateHistory ?? '',

    // Financial Fields (from Attributes object)
    SellingPrice: selectedObject?.Attributes?.SellingPrice ?? 0,
    SellingPriceFinal: selectedObject?.Attributes?.SellingPriceFinal ?? 0,
    BuyersCommission: selectedObject?.Attributes?.BuyersCommission ?? 0,
    SellersCommission: selectedObject?.Attributes?.SellersCommission ?? 0,

    TotalAmount: selectedObject?.Attributes?.TotalAmount ?? 0,
    CashAmount: selectedObject?.Attributes?.CashAmount ?? 0,
    CreditAmount: selectedObject?.Attributes?.CreditAmount ?? 0,
    PaidAmount: selectedObject?.PaidAmount ?? 0,
    OutstandingAmount: selectedObject?.OutstandingAmount ?? 0,
    Remaining:
      (selectedObject?.Attributes?.TotalAmount ?? 0) -
      (selectedObject?.PaidAmount ?? 0),

    // Duration / Installments
    Duration: selectedObject?.Attributes?.Duration ?? selectedDuration,
    DurationAmount: selectedObject?.Attributes?.DurationAmount ?? 0,
    DurationPercentage: selectedObject?.Attributes?.DurationPercentage ?? 0,
    // Admin
    AdminResponse: selectedObject?.AdminResponse ?? '',
    iView: "UpdateStatus"
  };
  const [formData, setFormData] = useState(InitialForm);
  /* ------------------ COMMISSION ------------------ */
  const getCommission = (dealer: string) => {
    const attrs = selectedObject?.CompanyAttributes || {};
    const commission = Number(attrs[`${dealer}Commission`]) || 0;
    const type = attrs[`${dealer}CommissionType`];
    return type === 'Percentage'
      ? (commission / 100) * formData.SellingPrice
      : commission;
  };
  const calcAdvertRequest = (
    price: number,
    duration: number,
    requestType: string
  ): AdvertRequest => {
    const userBalance = selectedObject?.UserBalance || 0;

    const buyers = getCommission('Buyers');
    const sellers = getCommission('Sellers');

    let finalPrice = price + buyers;

    console.log("🎨 Buyer Comm:", buyers)
    console.log("🎯 Sellers Comm:", sellers)

    const option = durationOptions.find(d => d.Value === duration);
    let durationAmount = 0;

    if (option?.Percentage && userBalance > 0) {
      durationAmount = price * option.Percentage;
      finalPrice += durationAmount;
    }

    const credit = Math.min(finalPrice, userBalance);
    const cash = finalPrice - credit;

    return {
      AdvertID: selectedObject?.AdvertID,
      Disabled: false,
      BuyersCommission: buyers,
      SellersCommission: sellers,
      SellingPrice: price,
      SellingPriceFinal: finalPrice,
      Duration: duration,
      DurationPercentage: option?.Percentage || 0,
      DurationAmount: durationAmount,
      CreditAmount: credit,
      CashAmount: cash,
      TotalAmount: credit + cash,
      Remaining: Math.max(0, finalPrice - (credit + cash)),
      RequestType: requestType
    };
  };

  const getCompany = async () => {
    await GetCompany()
    if (selectedObject && selectedObject.CompanyAttributes) {
      console.log("✅ company Attributes:", company?.Attributes);
      selectedObject.CompanyAttributes = company?.Attributes;
    }
  }
  /* ---------------- CENTRAL CALC ---------------- */
  const recalcForm = (overrides?: Partial<typeof formData>) => {
    const next = { ...formData, ...overrides };
    const sellingPrice =
      next.RequestType === "Proposal"
        ? Number(next.SellingPrice)
        : selectedObject?.Attributes?.SellingPrice || 0;
    const recalculated = calcAdvertRequest(
      sellingPrice,
      next.Duration,
      next.RequestType
    );
    setFormData({
      ...next,
      ...recalculated,
      SellingPrice: sellingPrice
    });
  };

  useFocusEffect(
    useCallback(() => {
      GetCompany();
    }, [])
  );
  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    if (!selectedObject) return;

    if (selectedObject) {
      console.log("✅ company Attributes:", company?.Attributes);
      selectedObject.CompanyAttributes = company?.Attributes;
    }
    recalcForm(InitialForm);
  }, [company, selectedObject]);
  useEffect(() => {
    recalcForm();
  }, [formData.RequestType]);
  /* ---------------- HANDLERS ---------------- */
  const ChangeDurationOption = (duration: number) => {
    setSelectedDuration(duration);
    recalcForm({ Duration: duration });
  };
  const CalcProposalAmount = (price: string) => {
    recalcForm({ SellingPrice: Number(price) || 0 });
  };
  const handleSubmit = () => {
    if (!formData.status) {
      setErrors({ status: "Le statut est requis." });
      return;
    }
    if (!formData.SellingPrice) {
      setErrors({ SellingPrice: "Le Price est requis." });
      return;
    }

    const payload = {
      // Identifiers
      ID: formData.ID ?? 0,
      AdvertID: formData.AdvertID ?? 0,

      // Dates
      EnteredOn: formData.EnteredOn
        ? new Date(formData.EnteredOn).toISOString()
        : new Date().toISOString(),

      UpdatedOn: new Date().toISOString(),

      // Status
      Status:
        formData.SelectedProp === "OwnerStatus"
          ? formData.OwnerStatus
          : formData.SelectedProp === "BuyerStatus"
            ? formData.BuyerStatus
            : formData.status ?? "Pending",

      IsDeleted: formData.IsDeleted ?? false,

      // JSON string
      Attributes: formData.Attributes ?? "",

      MeetingDate: formData.MeetingDate
        ? new Date(formData.MeetingDate).toISOString()
        : null,

      UpdateHistory: formData.UpdateHistory ?? "",

      // Status fields
      OwnerStatus: formData.OwnerStatus ?? "",
      BuyerStatus: formData.BuyerStatus ?? "",

      // Amounts
      SellingPrice: formData.SellingPrice ?? 0,
      SellingPriceFinal: formData.SellingPriceFinal ?? 0,
      BuyersCommission: formData.BuyersCommission ?? 0,
      SellersCommission: formData.SellersCommission ?? 0,
      TotalAmount: formData.TotalAmount ?? 0,
      CashAmount: formData.CashAmount ?? 0,
      CreditAmount: formData.CreditAmount ?? 0,
      PaidAmount: formData.PaidAmount ?? 0,
      Remaining: formData.Remaining ?? 0,
      OutstandingAmount: formData.OutstandingAmount ?? 0,

      Duration: formData.Duration ?? 0,
      DurationPercentage: formData.DurationPercentage ?? 0,
      DurationAmount: formData.DurationAmount ?? 0,

      Deadline: formData.Deadline
        ? new Date(formData.Deadline).toISOString()
        : null,

      // Payment
      PaymentStatus: formData.PaymentStatus ?? "",
      PaymentAlertStatus: formData.PaymentAlertStatus ?? "",

      // Agent / Admin
      AgentStatus: formData.AgentStatus ?? "",
      SelectedProp: formData.SelectedProp ?? "",
      AdminResponse: formData.AdminResponse ?? "",

      // Ownership
      AdvertOwnerID: formData.AdvertOwnerID,
      RequestOwnerID: formData.RequestOwnerID,

      RequestType: formData.RequestType ?? ""
    };
    wrapAttributes(payload, 'AdvertRequest');
    onSubmit({
      ...payload,
      [statusType]: formData.status,
      RequestType: formData.RequestType,
      SellingPrice: formData.SellingPrice,
      Duration: formData.Duration,
      AdminResponse: formData.AdminResponse,
      MeetingDate: formData.MeetingDate,
    });

  };
  /* ---------------- JSX (UNCHANGED) ---------------- */
  const Customstyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: Colors[colorScheme ?? 'light'].background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? 'light'].light,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    modalBody: {
      flex: 1,
      padding: 10,
    },
    modalFooter: {
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme ?? 'light'].light,
      alignItems: 'flex-start',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 5,
      padding: 15,
      marginBottom: 10,
      // shadowColor: '#000',
      // shadowOffset: { width: 0, height: 1 },
      // shadowOpacity: 0.1,
      // shadowRadius: 3,
      // elevation: 2,
    },
    sideStick: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: '#4e73df',
      borderTopLeftRadius: 5,
      borderBottomLeftRadius: 5,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    cardSubtitle: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'light'].light,
      marginBottom: 0,
    },
    row: {
      flexDirection: 'row',
    },
    column: {
      flex: 1,
      padding: 10,
    },
    borderRight: {
      borderRightWidth: 1,
      borderRightColor: '#dee2e6',
    },
    formGroup: {
      marginBottom: 15,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ced4da',
      borderRadius: 4,
      padding: 10,
      fontSize: 14,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    helperText: {
      fontSize: 12,
      color: '#6c757d',
      marginTop: 5,
    },
    buttonGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    statusButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderRadius: 4,
      marginHorizontal: 5,
    },
    activeButton: {
      backgroundColor: '#28a745',
    },
    rejectButton: {
      backgroundColor: '#dc3545',
    },
    inactiveButton: {
      backgroundColor: '#e9ecef',
    },
    buttonText: {
      marginLeft: 5,
    },
    historyItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#dee2e6',
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      fontSize: 12,
    },
    badgeActive: {
      backgroundColor: '#d4edda',
      color: '#155724',
    },
    badgeInActive: {
      backgroundColor: '#fff3cd',
      color: '#856404',
    },
    badgeRejected: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
    },
    badgeAccepted: {
      backgroundColor: '#d4edda',
      color: '#155724',
    },
    badgePending: {
      backgroundColor: '#cce5ff',
      color: '#004085',
    },
    historyDate: {
      fontSize: 12,
      marginLeft: 'auto',
      color: '#6c757d',
    },
    historyStatus: {
      fontSize: 14,
      marginBottom: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    textActive: {
      color: '#28a745',
    },
    textInActive: {
      color: '#ffc107',
    },
    textRejected: {
      color: '#dc3545',
    },
    textAccepted: {
      color: '#28a745',
    },
    textPending: {
      color: '#17a2b8',
    },
    historyComment: {
      fontSize: 12,
      lineHeight: 16,
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#28a745',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 4,
    },
    submitButtonText: {
      color: 'white',
      marginLeft: 5,
      fontWeight: '500',
    },
  });
  return (
    <KeyboardAvoidingView style={[styles.flexOne]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      contentContainerStyle={[styles.background, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <ScrollView contentContainerStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].background, flexGrow: 1, justifyContent: 'center', paddingBottom: 20 }}>
          <View style={Customstyles.modalContainer}>
            <View style={Customstyles.modalHeader}>
              <View>
                <ThemedText style={Customstyles.modalTitle}>{formData.RequestType == "Proposal" ? "Proposition Mettre à jour le statut" : "Mettre à jour le statut"} </ThemedText>
                <ThemedText style={Customstyles.cardSubtitle}>{formData.RequestType == "Proposal" ? "Envoyer une contre-demande" : "Vous pouvez indiquer la raison de la mise à jour."} </ThemedText>
              </View>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" size={24} color={Colors[colorScheme ?? 'light'].light} />
              </TouchableOpacity>
            </View>
            <View style={Customstyles.row}>
              <View style={[Customstyles.column]}>
                {formData?.iView === "UpdateStatus" && (
                  <>
                    <View style={Customstyles.formGroup}>
                      <ThemedText style={Customstyles.label}>Statut</ThemedText>
                      {!isAdmin ? (
                        <>
                          <View className='d-flex flex-column gap-4' >
                            <TouchableOpacity
                              className='flex flex-row items-center justify-center gap-3 p-3 rounded-md mb-4'
                              style={[
                                formData.status === 'Accepted' ? styles.success : styles.lighter
                              ]}
                              onPress={() => setFormData({ ...formData, status: 'Accepted' })}
                            >
                              <Feather
                                name="check-circle"
                                size={20}
                                color={formData.status === 'Accepted' ? 'white' : Colors[colorScheme ?? 'light'].light}
                              />
                              <ThemedText darkColor={Colors[colorScheme ?? 'light'].light} style={[formData.status === 'Accepted' ? { color: 'white' } : {}]}>
                                Accept
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className='flex flex-row items-center justify-center gap-3 p-3 rounded-md mb-4'
                              style={[
                                formData.status === 'Rejected' ? Customstyles.rejectButton : styles.lighter
                              ]}
                              onPress={() => setFormData({ ...formData, status: 'Rejected' })}
                            >
                              <Feather
                                name="x-circle"
                                size={20}
                                color={formData.status === 'Rejected' ? 'white' : Colors[colorScheme ?? 'light'].light}
                              />
                              <ThemedText darkColor={Colors[colorScheme ?? 'light'].light} style={[formData.status === 'Rejected' ? { color: 'white' } : {}
                              ]}>
                                Reject
                              </ThemedText>
                            </TouchableOpacity>
                            {selectedObject?.RequestType == "Proposal" && (
                              <TouchableOpacity
                                className='flex flex-row items-center justify-center gap-3 p-3 rounded-md mb-4'
                                onPress={() => setFormData({ ...formData, status: 'Counter Offer', RequestType: 'Proposal', iView: 'Proposal' })}
                                style={[styles.danger]}
                              >
                                <Feather
                                  name="plus-circle"
                                  size={20}
                                  color='white'
                                />
                                <ThemedText
                                  type="default"
                                  lightColor={Colors[colorScheme ?? 'light'].white}
                                  darkColor={Colors[colorScheme ?? 'light'].white}
                                >
                                   Nouvelle proposition
                                </ThemedText>
                              </TouchableOpacity>
                            )}
                          </View>
                          {errors.status && <Text style={styles.colorDanger}>{errors.status}</Text>}
                        </>
                      ) : (
                        <View>
                          <View className='d-flex flex-column gap-4 mb-2'>
                            <TouchableOpacity
                              className='flex flex-row items-center justify-center gap-3 p-3 rounded-md mb-4'
                              style={[
                                formData.status === 'Accepted' ? styles.success : styles.lighter
                              ]}
                              onPress={() => setFormData({ ...formData, status: 'Accepted' })}
                            >
                              <Feather
                                name="check-circle"
                                size={20}
                                color={formData.status === 'Accepted' ? 'white' : Colors[colorScheme ?? 'light'].light}
                              />
                              <ThemedText darkColor={Colors[colorScheme ?? 'light'].light} style={[
                                formData.status === 'Accepted' ? { color: 'white' } : {}
                              ]}>
                                Accept
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className='flex flex-row items-center justify-center gap-3 p-3 rounded-md mb-4'
                              style={[
                                formData.status === 'Rejected' ? styles.danger : styles.lighter
                              ]}
                              onPress={() => setFormData({ ...formData, status: 'Rejected' })}
                            >
                              <Feather
                                name="x-circle"
                                size={20}
                                color={formData.status === 'Rejected' ? 'white' : Colors[colorScheme ?? 'light'].light}
                              />
                              <ThemedText darkColor={Colors[colorScheme ?? 'light'].light} style={[
                                formData.status === 'Rejected' ? { color: 'white' } : {}
                              ]}>
                                Reject
                              </ThemedText>
                            </TouchableOpacity>
                          </View>

                          <View className='d-flex flex-column gap-4'>
                            <TouchableOpacity
                              className='flex flex-row items-center justify-center gap-3 p-3 rounded-md mb-4'
                              style={[
                                formData.status === 'Delivered' ? styles.success : styles.lighter
                              ]}
                              onPress={() => setFormData({ ...formData, status: 'Delivered' })}
                            >
                              <Feather
                                name="check-circle"
                                size={20}
                                color={formData.status === 'Delivered' ? 'white' : Colors[colorScheme ?? 'light'].light}
                              />
                              <ThemedText darkColor={Colors[colorScheme ?? 'light'].light} style={[
                                formData.status === 'Delivered' ? { color: 'white' } : {}
                              ]}>
                                Livré
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className='flex flex-row items-center justify-center gap-3 p-3 rounded-md mb-4'
                              style={[
                                formData.status === 'Pending' ? styles.warning : styles.lighter
                              ]}
                              onPress={() => setFormData({ ...formData, status: 'Pending' })}
                            >
                              <Feather
                                name="x-circle"
                                size={20}
                                color={formData.status === 'Pending' ? 'white' : Colors[colorScheme ?? 'light'].light}
                              />
                              <ThemedText darkColor={Colors[colorScheme ?? 'light'].light} style={[
                                formData.status === 'Pending' ? { color: 'white' } : {}
                              ]}>
                                En attente
                              </ThemedText>
                            </TouchableOpacity>
                          </View>
                          {errors.status && <Text style={styles.colorDanger}>{errors.status}</Text>}
                        </View>
                      )}
                    </View>
                    {isAdmin && (
                      <>
                        <View style={Customstyles.formGroup}>
                          <ThemedText>Date de réunion</ThemedText>
                          <DateInput onDateChange={(date) => setMeetingDate(date.toISOString().split('T')[0])} />
                          {/* {MeetingDate && (
                  <ThemedText>
                    Selected Date: {MeetingDate && new Date(MeetingDate).toLocaleDateString('en-FR')}
                  </ThemedText>
                )} */}
                          {errors.MeetingDate && <Text style={styles.colorDanger}>{errors.MeetingDate}</Text>}
                          <Text style={styles.colorLight}>
                            Date de réunion obligatoire et valide.
                          </Text>
                        </View>
                      </>
                    )}
                    <View style={Customstyles.formGroup}>
                      <View className="mb-4">
                        <ThemedText type="default" className="mb-2">Réponse Facultatif - laissez vide si besoin</ThemedText>
                        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top', color: Colors[colorScheme ?? 'light'].light }]}
                          multiline={true}  // This is crucial for multi-line input
                          numberOfLines={2}  // Works on Android to set initial number of lines
                          returnKeyType="default"  // Changes the return key to "default" instead of "done"
                          blurOnSubmit={false}
                          placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                          underlineColorAndroid="transparent"
                          placeholder="Rép"
                          value={formData.AdminResponse}
                          onChangeText={(text) => setFormData({ ...formData, AdminResponse: text })} />

                      </View>
                    </View>
                  </>
                )}
                {formData.iView === "Proposal" && (
                  <>

                    <View className="flex flex-row items-start gap-5 my-5">
                      <View>
                        <TouchableOpacity style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
                          onPress={() => setFormData({ ...formData, RequestType: selectedObject?.RequestType, iView: 'UpdateStatus' })}>
                          <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                        </TouchableOpacity>
                      </View>
                      <View className="flex-1">
                        <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>Contre-proposition</ThemedText>
                        <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0 }]}>Comme contre-demande</ThemedText>
                      </View>
                    </View>
                    <View className="mb-4">
                      <ThemedText type="default" className="mb-2">Montant proposition</ThemedText>
                      <TextInput style={[styles.input]}
                        placeholderTextColor={Colors[colorScheme ?? 'light'].light}
                        underlineColorAndroid="transparent"
                        placeholder="Prix"
                        keyboardType="numeric"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onBlur={(e) => CalcProposalAmount(formData.SellingPrice.toString() ?? 0)}
                        value={formData.SellingPrice.toString() ?? 0}
                        onChangeText={(text) => CalcProposalAmount(text)} />
                      {errors.SellingPrice && <Text className="text-red-500">{errors.SellingPrice}</Text>}
                      <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}></ThemedText>
                    </View>
                    {formData.AdvertOwnerID != user?.UserId && (
                      <>
                        <View className="flex flex-row items-center mb-5">
                          <View className="flex flex-row items-center gap-3 flex-1  w-[60%]">
                            <View className="">
                              <View className="rounded-md flex items-center" style={[styles.btnIconSM, styles.primary]}>
                                <FontAwesome name="calendar" size={20} color={Colors[colorScheme ?? 'light'].white} />
                              </View>
                            </View>
                            <View className="flex-1">
                              <ThemedText type="default" style={[styles.fontBold]}>Pour {formData.Duration} jours</ThemedText>
                              {/* <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Le Cout du plan selectionne</ThemedText> */}
                            </View>
                          </View>
                          <View className="flex-1 items-end">
                            <ThemedText type="default" style={[styles.fontBold]}>{formatDecimal(formData.DurationAmount) || 0}€</ThemedText>
                          </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                          <View className="flex flex-row items-center gap-3 flex-1  w-[60%]">
                            <View className="">
                              <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                <Ionicons name="card" size={20} color={Colors[colorScheme ?? 'light'].white} />
                              </View>
                            </View>
                            <View className="flex-1">
                              <ThemedText type="default" style={[styles.fontBold]}>Montant comptant</ThemedText>
                            </View>
                          </View>
                          <View className="flex-1 items-end">
                            <ThemedText type="default" style={[styles.fontBold]}>{formatDecimal(formData.CashAmount) || 0}€</ThemedText>
                          </View>
                        </View>
                        <View className="flex flex-row items-center mb-5">
                          <View className="flex flex-row items-center gap-3 flex-1 w-[60%]">
                            <View className="">
                              <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
                                <FontAwesome name="euro" size={20} color={Colors[colorScheme ?? 'light'].white} />
                              </View>
                            </View>
                            <View className="flex-1">
                              <ThemedText type="default" style={[styles.fontBold]}>Montant crédit</ThemedText>
                            </View>
                          </View>
                          <View className="flex-1 items-end">
                            <ThemedText type="default" style={[styles.fontBold,]}>{formatDecimal(formData.CreditAmount) || 0}€</ThemedText>
                          </View>
                        </View>
                        <View className="border-b border-gray-300 mb-5"></View>
                        <View className="flex flex-row items-center mb-5">
                          <View className="flex flex-row items-start gap-3 flex-1 w-[60%]">
                            <View className="flex-1">
                              <ThemedText type="default" style={[styles.fontBold,]}>Montant Total</ThemedText>
                              <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.sm }]}>Montant final a payer</ThemedText>
                            </View>
                          </View>
                          <View className="flex-1 items-end">
                            <ThemedText type="default" style={[styles.fontBold, styles.colorDanger, { fontSize: FONT_SIZES.lg }]}>{formatDecimal(formData.SellingPriceFinal) || 0}€</ThemedText>
                          </View>
                        </View>
                        {formData.CreditAmount > 0 && (
                          <View>
                            <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.sm, marginBottom: 5 }]}>Sélectionner la durée:</ThemedText>
                            {durationOptions.map((item: any, index: number) => (
                              <TouchableOpacity
                                className="mb-5"
                                style={[styles.button, selectedDuration === item?.Value ? styles.danger : styles.lighter]}
                                key={index}
                                onPress={() => { ChangeDurationOption(item?.Value) }}>
                                <ThemedText type='default'
                                  lightColor={selectedDuration === item?.Value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}
                                  darkColor={selectedDuration === item?.Value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}>
                                  {`${item.Value} jours (${item.Percentage * 100}%)`}
                                </ThemedText>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </>
                    )}

                  </>
                )}
              </View>
            </View>
            <View className='flex flex-row gap-5 justify-between' style={Customstyles.modalFooter}>
              <TouchableOpacity className='w-full gap-2 px-5 py-4' style={[styles.button, styles.lighter, styles.flexRow]}
                onPress={onClose}>
                <Feather name="check" size={20} color={Colors[colorScheme ?? 'light'].light} />
                <ThemedText type="default">Annuler</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity className='w-full gap-2 px-5 py-4' style={[styles.button, styles.danger, styles.flexRow]}
                onPress={handleSubmit}>
                <Feather name="check" size={20} color="white" />
                <Text style={Customstyles.submitButtonText}>Soumettre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </KeyboardAvoidingView>
  );
};























// const StatusModal: React.FC<StatusModalProps> = ({
//   visible,
//   onClose,
//   onSubmit,
//   isAdmin,
//   statusType,
//   selectedObject
// }) => {

//   const colorScheme = useColorScheme();
//   const { styles, FONT_SIZES } = useGlobalStyles();
//   const [status, setStatus] = useState<string>('');
//   const [MeetingDate, setMeetingDate] = useState<string>('');
//   const [response, setResponse] = useState<string>('');
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});




//   const { session, user, GetCompany, company, GetProfile, profile } = useSession();
//   const [isConfirm, setIsConfirm] = useState(false);
//   const [durationOptions] = useState<DurationOption[]>([
//     { Percentage: 0, Value: 30 },
//     { Percentage: 0.02, Value: 60 },
//   ]);
//   const [selectedDuration, setSelectedDuration] = useState<number>(30);
//   const InitialForm = {
//     MeetingDate: '',
//     status: '',
//     AdminResponse: '',
//     RequestType: '',
//     SellingPrice: selectedObject?.SellingPrice || 0,
//     Duration: 0,
//     SellingPriceFinal: 0,
//     BuyersCommission: 0,
//     SellersCommission: 0,
//     CreditAmount: 0,
//     CashAmount: 0,
//     TotalAmount: 0,
//     Remaining: 0,
//     DurationAmount: 0,
//     DurationPercentage: 0,
//   };
//   const [formData, setFormData] = useState(InitialForm);
//   const validate = () => {
//     const errors: { [key: string]: string } = {};
//     if (!formData.status?.trim()) errors.status = "Le statut est requis.";
//     if (isAdmin && !MeetingDate?.trim()) errors.MeetingDate = "La date de rencontre est requise.";
//     return errors;
//   };
//   const handleSubmit = () => {
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     // if(statusType == 'AdminStatus')
//     onSubmit({
//       ...selectedObject,
//       [statusType]: formData.status,
//       meetingDate: isAdmin ? MeetingDate : new Date().toISOString(),
//       AdminResponse: formData.AdminResponse ? formData.AdminResponse : "",
//     } as any);
//   };

//   const getCommission = (advert: any, dealer: string, companyAttributes: any): number => {
//     try {
//       //console.log("companyAttributes:", companyAttributes);
//       const attributes = companyAttributes;
//       const commission = parseFloat(attributes[`${dealer}Commission`]) || 0;
//       const commissionType = attributes[`${dealer}CommissionType`];

//       console.log("✅ formData?.SellingPrice:", formData?.SellingPrice);
//       if (commissionType === "Percentage") {
//         return (commission / 100) * Number(formData?.SellingPrice || 0);  //(advert?.Attributes?.SellingPrice || 0);
//       }
//       return commission;
//     } catch (error) {
//       console.error('Commission calculation error:', error);
//       return 0;
//     }
//   };

//   const calcAdvertRequest = (
//     advert: any,
//     duration: number,
//     user: any,
//     durationOptions: DurationOption[],
//     companyAttributes: string,
//     isConfirm: boolean,
//     sellingPrice: number | string,
//     requestType: string
//   ): AdvertRequest => {

//     const priceNum = Number(sellingPrice) || 0;

//     const request: AdvertRequest = {
//       AdvertID: Number(selectedObject?.AdvertID),
//       Disabled: isConfirm,
//       BuyersCommission: 0,
//       SellersCommission: 0,
//       SellingPrice: priceNum,
//       SellingPriceFinal: 0,
//       Duration: duration,
//       DurationPercentage: 0,
//       DurationAmount: 0,
//       CreditAmount: 0,
//       CashAmount: 0,
//       TotalAmount: 0,
//       Remaining: 0,
//       RequestType: requestType,

//     };

//     // Commissions
//     request.BuyersCommission = getCommission(advert, 'Buyers', companyAttributes);
//     request.SellersCommission = getCommission(advert, 'Sellers', companyAttributes);

//     request.SellingPriceFinal = priceNum + request.BuyersCommission;

//     // Duration
//     const durationOption = durationOptions.find(opt => opt.Value === duration);
//     const userBalance = user?.ScanBalance || 0;

//     request.CreditAmount = Math.min(userBalance, request.SellingPriceFinal);

//     if (request.CreditAmount > 0) {
//       request.DurationPercentage = durationOption?.Percentage || 0;
//       request.DurationAmount = request.CreditAmount * request.DurationPercentage;
//       request.SellingPriceFinal += request.DurationAmount;
//     }

//     // Cash / Credit balance
//     if (request.SellingPriceFinal <= userBalance) {
//       request.CreditAmount = request.SellingPriceFinal;
//       request.CashAmount = 0;
//     } else {
//       request.CreditAmount = userBalance;
//       request.CashAmount = request.SellingPriceFinal - userBalance;
//     }

//     request.TotalAmount = request.CreditAmount + request.CashAmount;
//     request.Remaining = Math.max(0, request.SellingPriceFinal - request.TotalAmount);

//     request.Disabled =
//       request.Disabled ||
//       request.CreditAmount > userBalance ||
//       request.SellingPriceFinal !== request.TotalAmount;

//     return request;
//   };

//   const ChangeDurationOption = (duration: number) => {
//     setSelectedDuration(duration);

//     const updatedForm = {
//       ...formData,
//       Duration: duration,
//       // make sure SellingPrice stays correct
//       SellingPrice:
//         formData.RequestType === "Proposal"
//           ? formData.SellingPrice
//           : selectedObject?.Attributes?.SellingPrice || 0
//     };
//     const recalculated = calcAdvertRequest(
//       selectedObject,
//       selectedDuration,
//       profile,
//       durationOptions,
//       company?.Attributes!,
//       isConfirm,
//       updatedForm.SellingPrice,
//       formData.RequestType // pass the most recent form values
//     );

//     const updatedState = {
//       ...recalculated,
//       MeetingDate: formData.MeetingDate,
//       status: formData.status,
//       AdminResponse: formData.AdminResponse,
//       RequestType: formData.RequestType,
//       SellingPrice: recalculated.SellingPrice,
//       Duration: recalculated.Duration,
//       SellingPriceFinal: recalculated.SellingPriceFinal,
//       BuyersCommission: recalculated.BuyersCommission,
//       SellersCommission: recalculated.SellersCommission,
//       CreditAmount: recalculated.CreditAmount,
//       CashAmount: recalculated.CashAmount,
//       TotalAmount: recalculated.TotalAmount,
//       Remaining: recalculated.Remaining,
//       DurationAmount: recalculated.DurationAmount,
//       DurationPercentage: recalculated.DurationPercentage,
//     };

//     setFormData(updatedState);


//   };






//   const CalcProposalAmount = (price: string) => {
//     const finalPrice = formData.RequestType === "Proposal"
//       ? price
//       : selectedObject?.Attributes?.SellingPrice || 0;

//     const recalculated = calcAdvertRequest(
//       selectedObject,
//       selectedDuration,
//       profile,
//       durationOptions,
//       company?.Attributes!,
//       isConfirm,
//       finalPrice,
//       formData.RequestType
//     );

//     setFormData({ ...formData, ...recalculated });
//   };


//   useEffect(() => {
//     //console.log(history);
//     console.log(selectedObject);

//     if (selectedObject) {
//       const AdvertRequest = calcAdvertRequest(
//         selectedObject,
//         selectedDuration,
//         profile,
//         durationOptions,
//         company?.Attributes!,
//         isConfirm,
//         selectedObject?.Attributes?.SellingPrice || 0,
//         formData.RequestType
//       )

//       const updatedForm = {
//         ...AdvertRequest,
//         MeetingDate: formData.MeetingDate,
//         status: formData.status,
//         AdminResponse: formData.AdminResponse,
//         RequestType: formData.RequestType
//       }

//       setFormData(updatedForm);
//     }
//   }, []);

//   // const handleFormSubmit = async () => {
//   //   //setLoading(true);
//   //   try {
//   //     //let objData = formData;
//   //     const token = await getAuthToken();
//   //     // let obj = wrapAttributes(objData, 'AdvertRequest');

//   //     let obj = {};
//   //     const response = await fetch(`https://api.allomotors.fr/api/Account/SaveRequest`, {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         'Authorization': `Bearer ${token}`
//   //       },
//   //       body: JSON.stringify(obj),
//   //     });
//   //     const data = await response.json();
//   //     console.log(data);
//   //     switch (data) {
//   //       case 1:
//   //         Alert.alert('Demande envoyée', 'Votre demande a bien été envoyée');
//   //         router.push('/(tabs)/catalogs');
//   //         break;
//   //       case 2:
//   //         Alert.alert('Solde insuffisant', `Vous n'avez pas un solde suffisant pour demander cette annonce`);
//   //         break;
//   //       default:
//   //         Alert.alert('Erreur', 'Quelque chose a mal tourné');
//   //         break;
//   //     }

//   //   } catch (error) {
//   //     console.log(error);
//   //   } finally {
//   //     //setLoading(false);
//   //   }
//   // };

//   const Customstyles = StyleSheet.create({
//     modalContainer: {
//       flex: 1,
//       flexDirection: 'column',
//       height: '100%',
//       width: '100%',
//       backgroundColor: Colors[colorScheme ?? 'light'].background,
//     },
//     modalHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: 15,
//       borderBottomWidth: 1,
//       borderBottomColor: Colors[colorScheme ?? 'light'].light,
//     },
//     modalTitle: {
//       fontSize: 18,
//       fontWeight: 'bold',
//     },
//     modalBody: {
//       flex: 1,
//       padding: 10,
//     },
//     modalFooter: {
//       padding: 15,
//       borderTopWidth: 1,
//       borderTopColor: Colors[colorScheme ?? 'light'].light,
//       alignItems: 'flex-start',
//     },
//     card: {
//       backgroundColor: 'white',
//       borderRadius: 5,
//       padding: 15,
//       marginBottom: 10,
//       // shadowColor: '#000',
//       // shadowOffset: { width: 0, height: 1 },
//       // shadowOpacity: 0.1,
//       // shadowRadius: 3,
//       // elevation: 2,
//     },
//     sideStick: {
//       position: 'absolute',
//       left: 0,
//       top: 0,
//       bottom: 0,
//       width: 4,
//       backgroundColor: '#4e73df',
//       borderTopLeftRadius: 5,
//       borderBottomLeftRadius: 5,
//     },
//     cardTitle: {
//       fontSize: 16,
//       fontWeight: 'bold',
//       marginBottom: 5,
//     },
//     cardSubtitle: {
//       fontSize: 14,
//       color: Colors[colorScheme ?? 'light'].light,
//       marginBottom: 0,
//     },
//     row: {
//       flexDirection: 'row',
//     },
//     column: {
//       flex: 1,
//       padding: 10,
//     },
//     borderRight: {
//       borderRightWidth: 1,
//       borderRightColor: '#dee2e6',
//     },
//     formGroup: {
//       marginBottom: 15,
//     },
//     label: {
//       fontSize: 14,
//       fontWeight: '500',
//       marginBottom: 5,
//     },
//     input: {
//       borderWidth: 1,
//       borderColor: '#ced4da',
//       borderRadius: 4,
//       padding: 10,
//       fontSize: 14,
//     },
//     textArea: {
//       height: 100,
//       textAlignVertical: 'top',
//     },
//     helperText: {
//       fontSize: 12,
//       color: '#6c757d',
//       marginTop: 5,
//     },
//     buttonGroup: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginBottom: 15,
//     },
//     statusButton: {
//       flex: 1,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: 10,
//       borderRadius: 4,
//       marginHorizontal: 5,
//     },
//     activeButton: {
//       backgroundColor: '#28a745',
//     },
//     rejectButton: {
//       backgroundColor: '#dc3545',
//     },
//     inactiveButton: {
//       backgroundColor: '#e9ecef',
//     },
//     buttonText: {
//       marginLeft: 5,
//     },
//     historyItem: {
//       paddingVertical: 15,
//       borderBottomWidth: 1,
//       borderBottomColor: '#dee2e6',
//     },
//     historyHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 10,
//     },
//     badge: {
//       paddingHorizontal: 8,
//       paddingVertical: 3,
//       borderRadius: 10,
//       fontSize: 12,
//     },
//     badgeActive: {
//       backgroundColor: '#d4edda',
//       color: '#155724',
//     },
//     badgeInActive: {
//       backgroundColor: '#fff3cd',
//       color: '#856404',
//     },
//     badgeRejected: {
//       backgroundColor: '#f8d7da',
//       color: '#721c24',
//     },
//     badgeAccepted: {
//       backgroundColor: '#d4edda',
//       color: '#155724',
//     },
//     badgePending: {
//       backgroundColor: '#cce5ff',
//       color: '#004085',
//     },
//     historyDate: {
//       fontSize: 12,
//       marginLeft: 'auto',
//       color: '#6c757d',
//     },
//     historyStatus: {
//       fontSize: 14,
//       marginBottom: 5,
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     textActive: {
//       color: '#28a745',
//     },
//     textInActive: {
//       color: '#ffc107',
//     },
//     textRejected: {
//       color: '#dc3545',
//     },
//     textAccepted: {
//       color: '#28a745',
//     },
//     textPending: {
//       color: '#17a2b8',
//     },
//     historyComment: {
//       fontSize: 12,
//       lineHeight: 16,
//     },
//     submitButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: '#28a745',
//       paddingHorizontal: 15,
//       paddingVertical: 10,
//       borderRadius: 4,
//     },
//     submitButtonText: {
//       color: 'white',
//       marginLeft: 5,
//       fontWeight: '500',
//     },
//   });


//   return (
//     <Modal
//       animationType="slide"
//       transparent={false}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View style={Customstyles.modalContainer}>
//         <View style={Customstyles.modalHeader}>
//           <View>
//             <ThemedText style={Customstyles.modalTitle}>Update Status</ThemedText>
//             <ThemedText style={Customstyles.cardSubtitle}>You can write reason for update also</ThemedText>
//           </View>
//           <TouchableOpacity onPress={onClose}>
//             <AntDesign name="close" size={24} color={Colors[colorScheme ?? 'light'].light} />
//           </TouchableOpacity>
//         </View>
//         <View style={Customstyles.row}>
//           <View style={[Customstyles.column]}>
//             {formData?.RequestType !== "Proposal" && (
//               <>
//                 <View style={Customstyles.formGroup}>
//                   <ThemedText style={Customstyles.label}>Status</ThemedText>

//                   {!isAdmin ? (
//                     <>
//                       <View style={Customstyles.buttonGroup}>
//                         <TouchableOpacity
//                           style={[
//                             Customstyles.statusButton,
//                             formData.status === 'Accepted' ? styles.success : Customstyles.inactiveButton
//                           ]}
//                           onPress={() => setFormData({ ...formData, status: 'Accepted' })}
//                         >
//                           <Feather
//                             name="check-circle"
//                             size={20}
//                             color={formData.status === 'Accepted' ? 'white' : 'black'}
//                           />
//                           <Text style={[
//                             Customstyles.buttonText,
//                             formData.status === 'Accepted' ? { color: 'white' } : {}
//                           ]}>
//                             Accept
//                           </Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           style={[
//                             Customstyles.statusButton,
//                             formData.status === 'Rejected' ? Customstyles.rejectButton : Customstyles.inactiveButton
//                           ]}
//                           onPress={() => setFormData({ ...formData, status: 'Rejected' })}
//                         >
//                           <Feather
//                             name="x-circle"
//                             size={20}
//                             color={formData.status === 'Rejected' ? 'white' : 'black'}
//                           />
//                           <Text style={[
//                             Customstyles.buttonText,
//                             formData.status === 'Rejected' ? { color: 'white' } : {}
//                           ]}>
//                             Reject
//                           </Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           style={[Customstyles.statusButton, styles.danger, { display: 'flex', alignItems: 'center' }]}
//                           onPress={() => setFormData({ ...formData, status: 'Counter Offer', RequestType: 'Proposal' })}
//                         >
//                           <ThemedText
//                             type="default"
//                             lightColor={Colors[colorScheme ?? 'light'].white}
//                             darkColor={Colors[colorScheme ?? 'light'].white}
//                             style={[
//                               formData.status === 'Rejected' ? { color: 'white' } : {}
//                             ]}>
//                             Nouvelle Proposition
//                           </ThemedText>

//                         </TouchableOpacity>
//                       </View>
//                       {errors.status && <Text style={styles.colorDanger}>{errors.status}</Text>}
//                     </>
//                   ) : (
//                     <View>
//                       <View style={Customstyles.buttonGroup}>
//                         <TouchableOpacity
//                           style={[
//                             Customstyles.statusButton,
//                             formData.status === 'Accepted' ? styles.success : Customstyles.inactiveButton
//                           ]}
//                           onPress={() => setFormData({ ...formData, status: 'Accepted' })}
//                         >
//                           {/* setStatus('Accepted') */}
//                           <Feather
//                             name="check-circle"
//                             size={20}
//                             color={formData.status === 'Accepted' ? 'white' : 'black'}
//                           />
//                           <Text style={[
//                             Customstyles.buttonText,
//                             formData.status === 'Accepted' ? { color: 'white' } : {}
//                           ]}>
//                             Accept
//                           </Text>
//                         </TouchableOpacity>



//                         <TouchableOpacity
//                           style={[
//                             Customstyles.statusButton,
//                             formData.status === 'Rejected' ? styles.danger : Customstyles.inactiveButton
//                           ]}
//                           onPress={() => setFormData({ ...formData, status: 'Rejected' })}
//                         >
//                           {/* setStatus('Rejected') */}
//                           <Feather
//                             name="x-circle"
//                             size={20}
//                             color={formData.status === 'Rejected' ? 'white' : 'black'}
//                           />
//                           <Text style={[
//                             Customstyles.buttonText,
//                             formData.status === 'Rejected' ? { color: 'white' } : {}
//                           ]}>
//                             Reject
//                           </Text>
//                         </TouchableOpacity>
//                       </View>

//                       <View style={Customstyles.buttonGroup}>
//                         <TouchableOpacity
//                           style={[
//                             Customstyles.statusButton,
//                             formData.status === 'Delivered' ? styles.success : Customstyles.inactiveButton
//                           ]}
//                           onPress={() => setFormData({ ...formData, status: 'Delivered' })}
//                         >
//                           {/* setStatus('Rejected') */}
//                           <Feather
//                             name="check-circle"
//                             size={20}
//                             color={formData.status === 'Delivered' ? 'white' : 'black'}
//                           />
//                           <Text style={[
//                             Customstyles.buttonText,
//                             formData.status === 'Delivered' ? { color: 'white' } : {}
//                           ]}>
//                             Delivered
//                           </Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           style={[
//                             Customstyles.statusButton,
//                             formData.status === 'Pending' ? styles.warning : Customstyles.inactiveButton
//                           ]}
//                           onPress={() => setFormData({ ...formData, status: 'Pending' })}
//                         >
//                           {/* setStatus('Rejected') */}
//                           <Feather
//                             name="x-circle"
//                             size={20}
//                             color={formData.status === 'Pending' ? 'white' : 'black'}
//                           />
//                           <Text style={[
//                             Customstyles.buttonText,
//                             formData.status === 'Pending' ? { color: 'white' } : {}
//                           ]}>
//                             Pending
//                           </Text>
//                         </TouchableOpacity>
//                       </View>

//                       {errors.status && <Text style={styles.colorDanger}>{errors.status}</Text>}
//                     </View>
//                   )}
//                 </View>
//                 {isAdmin && (
//                   <>
//                     <View style={Customstyles.formGroup}>
//                       <ThemedText>Meeting Date</ThemedText>
//                       <DateInput onDateChange={(date) => setMeetingDate(date.toISOString().split('T')[0])} />
//                       {/* {MeetingDate && (
//                   <ThemedText>
//                     Selected Date: {MeetingDate && new Date(MeetingDate).toLocaleDateString('en-FR')}
//                   </ThemedText>
//                 )} */}
//                       {errors.MeetingDate && <Text style={styles.colorDanger}>{errors.MeetingDate}</Text>}
//                       <Text style={styles.colorLight}>
//                         The Meeting Date is required and should be a valid date.
//                       </Text>
//                     </View>

//                   </>
//                 )}
//                 <View style={Customstyles.formGroup}>
//                   <View className="mb-4">
//                     <ThemedText type="default" className="mb-2">Admin Response</ThemedText>
//                     <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top', color: Colors[colorScheme ?? 'light'].light }]}
//                       multiline={true}  // This is crucial for multi-line input
//                       numberOfLines={2}  // Works on Android to set initial number of lines
//                       returnKeyType="default"  // Changes the return key to "default" instead of "done"
//                       blurOnSubmit={false}
//                       placeholderTextColor={Colors[colorScheme ?? 'light'].light}
//                       underlineColorAndroid="transparent"
//                       placeholder="Response"
//                       value={formData.AdminResponse}
//                       onChangeText={(text) => setFormData({ ...formData, AdminResponse: text })} />

//                   </View>
//                 </View>
//               </>
//             )}
//             {formData.RequestType === "Proposal" && (

//               <>
//                 <View className="mb-4">
//                   <ThemedText type="default" className="mb-2">Prix *</ThemedText>
//                   <TextInput style={[styles.input]}
//                     placeholderTextColor={Colors[colorScheme ?? 'light'].light}
//                     underlineColorAndroid="transparent"
//                     placeholder="Prix"
//                     keyboardType="numeric"
//                     autoCapitalize="none"
//                     autoCorrect={false}
//                     returnKeyType="done"
//                     onBlur={(e) => CalcProposalAmount(formData.SellingPrice.toString() ?? 0)}
//                     value={formData.SellingPrice.toString() ?? 0}
//                     onChangeText={(text) => CalcProposalAmount(text)} />
//                   {errors.SellingPrice && <Text className="text-red-500">{errors.SellingPrice}</Text>}
//                   <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 16 }]}></ThemedText>
//                 </View>


//                 {/* {formData.DurationAmount > 0 && ( */}
//                 <View className="flex flex-row items-center mb-5">
//                   <View className="flex flex-row items-center gap-3 flex-1  w-[60%]">
//                     <View className="">
//                       <View className="rounded-md flex items-center" style={[styles.btnIconSM, styles.primary]}>
//                         <FontAwesome name="calendar" size={20} color={Colors[colorScheme ?? 'light'].white} />
//                       </View>
//                     </View>
//                     <View className="flex-1">
//                       <ThemedText type="default" style={[styles.fontBold]}>Pour {formData.Duration} jours</ThemedText>
//                       {/* <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Le Cout du plan selectionne</ThemedText> */}
//                     </View>
//                   </View>
//                   <View className="flex-1 items-end">
//                     <ThemedText type="default" style={[styles.fontBold]}>{formatDecimal(formData.DurationAmount) || 0}€</ThemedText>
//                   </View>
//                 </View>
//                 {/*)}*/}
//                 <View className="flex flex-row items-center mb-5">
//                   <View className="flex flex-row items-center gap-3 flex-1  w-[60%]">
//                     <View className="">
//                       <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
//                         <Ionicons name="card" size={20} color={Colors[colorScheme ?? 'light'].white} />
//                       </View>
//                     </View>
//                     <View className="flex-1">
//                       <ThemedText type="default" style={[styles.fontBold]}>Montant comptant</ThemedText>
//                       {/* <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Nombre total de credits inclus</ThemedText> */}
//                     </View>
//                   </View>
//                   <View className="flex-1 items-end">
//                     <ThemedText type="default" style={[styles.fontBold]}>{formatDecimal(formData.CashAmount) || 0}€</ThemedText>
//                   </View>
//                 </View>
//                 <View className="flex flex-row items-center mb-5">
//                   <View className="flex flex-row items-center gap-3 flex-1 w-[60%]">
//                     <View className="">
//                       <View className="rounded-md" style={[styles.btnIconSM, styles.primary]}>
//                         <FontAwesome name="euro" size={20} color={Colors[colorScheme ?? 'light'].white} />
//                       </View>
//                     </View>
//                     <View className="flex-1">
//                       <ThemedText type="default" style={[styles.fontBold]}>Montant crédit</ThemedText>
//                       {/* <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.xs }]}>Taxe appliquee a votre achat</ThemedText> */}
//                     </View>
//                   </View>
//                   <View className="flex-1 items-end">
//                     <ThemedText type="default" style={[styles.fontBold,]}>{formatDecimal(formData.CreditAmount) || 0}€</ThemedText>
//                   </View>
//                 </View>
//                 <View className="border-b border-gray-300 mb-5"></View>
//                 <View className="flex flex-row items-center mb-5">
//                   <View className="flex flex-row items-start gap-3 flex-1 w-[60%]">
//                     <View className="flex-1">
//                       <ThemedText type="default" style={[styles.fontBold,]}>Montant Total</ThemedText>
//                       <ThemedText type="default" style={[styles.colorLight, { fontSize: FONT_SIZES.sm }]}>Montant final a payer</ThemedText>
//                     </View>
//                   </View>
//                   <View className="flex-1 items-end">
//                     <ThemedText type="default" style={[styles.fontBold, styles.colorDanger, { fontSize: FONT_SIZES.lg }]}>{formatDecimal(formData.SellingPriceFinal) || 0}€</ThemedText>
//                   </View>
//                 </View>
//                 {formData.CreditAmount > 0 && (
//                   <View>
//                     <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.sm, marginBottom: 5 }]}>Sélectionner la durée:</ThemedText>
//                     {durationOptions.map((item: any, index: number) => (
//                       <TouchableOpacity
//                         className="mb-5"
//                         style={[styles.button, selectedDuration === item?.Value ? styles.danger : styles.lighter]}
//                         key={index}
//                         onPress={() => { ChangeDurationOption(item?.Value) }}>
//                         <ThemedText type='default'
//                           lightColor={selectedDuration === item?.Value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}
//                           darkColor={selectedDuration === item?.Value ? Colors[colorScheme ?? 'light'].white : Colors[colorScheme ?? 'light'].light}>
//                           {`${item.Value} jours (${item.Percentage * 100}%)`}
//                         </ThemedText>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}
//                 <View className="flex flex-row items-center gap-2 mb-5">
//                   <View className="flex-1">
//                     <ThemedText type="default" style={[{ fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>Je suis d'accord avec la composition du paiement telle que spécifiée ci-dessus.</ThemedText>
//                   </View>
//                   <View>
//                     <Switch
//                       value={isConfirm}
//                       onValueChange={(val) => setIsConfirm(val)} // console.log(val)}
//                       //disabled={false}
//                       activeText={'Yes'}
//                       inActiveText={'No'}
//                       circleSize={30}
//                       barHeight={30}
//                       circleBorderWidth={0}
//                       backgroundActive={Colors[colorScheme ?? 'light'].success}
//                       backgroundInactive={Colors[colorScheme ?? 'light'].light}
//                       circleActiveColor={Colors[colorScheme ?? 'light'].light}
//                       circleInActiveColor={Colors[colorScheme ?? 'light'].success}
//                       //renderInsideCircle={() => <CustomComponent />} // custom component to render inside the Switch circle (Text, Image, etc.)
//                       changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
//                       innerCircleStyle={{ alignItems: "center", justifyContent: "center" }} // style for inner animated circle for what you (may) be rendering inside the circle
//                       //outerCircleStyle={{}} // style for outer animated circle
//                       renderActiveText={isConfirm}
//                       renderInActiveText={isConfirm === false}
//                       switchLeftPx={7} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
//                       switchRightPx={7} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
//                       switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
//                       switchBorderRadius={30} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
//                     />
//                   </View>
//                 </View>
//               </>



//             )}
//           </View>
//         </View>
//         <View style={Customstyles.modalFooter}>
//           <TouchableOpacity className='w-full gap-2 px-5 py-4' style={[styles.button, styles.primary, styles.flexRow]} onPress={handleSubmit}>
//             <Feather name="check" size={20} color="white" />
//             <Text style={Customstyles.submitButtonText}>Submit</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };



export default StatusModal;
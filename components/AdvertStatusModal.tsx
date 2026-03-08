
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, ActivityIndicator, StyleProp, ViewStyle, TextStyle, useColorScheme } from 'react-native';
import { useGlobalStyles } from '@/app/_styles/globalStyle';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { ThemedText } from './themed-text';

type StatusOption = {
  value: string;
  label: string;
};

type StatusModalProps = {
  LoggedInUser?: any;
  parsedData?: any;
  statusOptions: StatusOption[];
  status: string;
  setStatus: (status: string) => void;
  loading: boolean;
  UpdateAdvertStatusSoft: (selectedStatus: string) => Promise<void>; // Now accepts status parameter
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  modalContainerStyle?: StyleProp<ViewStyle>;
  modalContentStyle?: StyleProp<ViewStyle>;
};

const AdvertStatusModal: React.FC<StatusModalProps> = ({
  LoggedInUser,
  parsedData,
  statusOptions,
  status,
  setStatus,
  loading,
  UpdateAdvertStatusSoft,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(status);
  const colorScheme = useColorScheme();
  const { styles } = useGlobalStyles();

  // Sync local state when status prop changes
  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  const hasPermission = Boolean(
    LoggedInUser?.Roles?.includes('Admin') ||
    LoggedInUser?.Roles?.includes('SupportAdmin') ||
    LoggedInUser?.Roles?.includes('Commercial') ||
    LoggedInUser?.UserId === parsedData?.EnteredBy
  );

  const handleStatusSelect = (value: string) => {
    setSelectedStatus(value);
    setStatus(value); // Update parent state immediately
  };

  const handleSubmit = async () => {
    try {
      await UpdateAdvertStatusSoft(selectedStatus); // Pass the selected status
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Optionally show error to user
    }
  };

  if (!hasPermission) {
    return null;
  }

  return (
    <>
      {/* <TouchableOpacity
        className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4 mb-5"
        style={[styles.danger, styles.btnShadow]}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors[colorScheme ?? 'light'].white} />
        ) : (
          <ThemedText
            type="default"
            lightColor={Colors[colorScheme ?? 'light'].white}
            darkColor={Colors[colorScheme ?? 'light'].white}
          >
            Change Status
          </ThemedText>
        )}
      </TouchableOpacity> */}

      <TouchableOpacity
        className="absolute absolute top-5 z-10 rounded-full"
        style={[styles.btnIcon, styles.btnShadow, styles.roundedCircle, styles.danger, { right: 20 }]}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors[colorScheme ?? 'light'].white} />
        ) : (
          <Ionicons name="settings-outline" size={25} color={Colors[colorScheme ?? 'light'].white} />
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={[{ flex: 1, justifyContent: 'center', backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            <View className="border p-4 border-gray-300 mb-5 m-5">
              {/* <TouchableOpacity
                className="absolute top-3 right-3"
                onPress={() => setModalVisible(false)}
              >
                <ThemedText type="title">×</ThemedText>
              </TouchableOpacity> */}

              <View className="flex mb-5 rounded-lg m-auto border-b border-gray-300 py-4" >
                <ThemedText type="subtitle" style={[styles.fontBold, styles.textCenter]}>
                  Modifier le statut de l'annonce
                </ThemedText>
              </View>

              <View className="flex flex-wrap flex-row items-start gap-3 mt-5">
                {statusOptions.map((item) => (
                  <>
                    {LoggedInUser?.UserId == parsedData?.EnteredBy && item.value === 'InActive' ?
                      <TouchableOpacity
                        className="flex-1 min-w-[110px] flex flex-row items-center justify-center rounded-md p-4 mb-5"
                        key={`status-option-${item.value}`}
                        style={[
                          styles.justifyCenter,
                          styles.itemStart,
                          selectedStatus === item.value ? styles.success : styles.outlineBorders,
                        ]}
                        onPress={() => handleStatusSelect(item.value)}
                      >
                        <ThemedText
                          type="default"
                          lightColor={
                            selectedStatus === item.value
                              ? Colors[colorScheme ?? 'light'].white
                              : Colors[colorScheme ?? 'light'].text
                          }
                          darkColor={
                            selectedStatus === item.value
                              ? Colors[colorScheme ?? 'light'].white
                              : Colors[colorScheme ?? 'light'].text
                          }
                        >
                          {item.label}
                        </ThemedText>
                      </TouchableOpacity> : LoggedInUser?.UserId != parsedData?.EnteredBy ? (
                        <TouchableOpacity
                          className="flex-1 min-w-[110px] flex flex-row items-center justify-center rounded-md p-4 mb-5"
                          key={`status-option-${item.value}`}
                          style={[
                            styles.justifyCenter,
                            styles.itemStart,
                            selectedStatus === item.value ? styles.success : styles.outlineBorders,
                          ]}
                          onPress={() => handleStatusSelect(item.value)}
                        >
                          <ThemedText
                            type="default"
                            lightColor={
                              selectedStatus === item.value
                                ? Colors[colorScheme ?? 'light'].white
                                : Colors[colorScheme ?? 'light'].text
                            }
                            darkColor={
                              selectedStatus === item.value
                                ? Colors[colorScheme ?? 'light'].white
                                : Colors[colorScheme ?? 'light'].text
                            }
                          >
                            {item.label}
                          </ThemedText>
                        </TouchableOpacity>
                      ) : null}
                  </>
                ))}
              </View>

              <TouchableOpacity
                className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4 my-5"
                style={[styles.danger, styles.btnShadow]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors[colorScheme ?? 'light'].white} />
                ) : (
                  <ThemedText
                    type="defaultSemiBold"
                    lightColor={Colors[colorScheme ?? 'light'].white}
                    darkColor={Colors[colorScheme ?? 'light'].white}
                  >
                    Modifier le statut
                  </ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4 "
                style={[styles.outlineBorders]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors[colorScheme ?? 'light'].white} />
                ) : (
                  <ThemedText
                    type="defaultSemiBold"
                    lightColor={Colors[colorScheme ?? 'light'].text}
                    darkColor={Colors[colorScheme ?? 'light'].text}
                  >
                    Annuler
                  </ThemedText>
                )}
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AdvertStatusModal;
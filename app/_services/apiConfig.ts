// apiConfig.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const getAuthToken = async () => await AsyncStorage.getItem("token");;

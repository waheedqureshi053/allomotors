import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { OneSignal } from "react-native-onesignal";
import { apiCall } from "./api";
import { setAuthToken } from "./apiConfig";

type User = {
  UserId: string;
  UserType: string;
  Name: string;
  Username: string;
  Email: string;
  Roles: any[];
  Attributes?: any;
  Qrbalance: number;
  ScanBalance: number;
  PhotoURL: string;
  OwnerID: any;
  Token: any;
};

export interface Company {
  CompanyID: number;
  CName: string;
  TVA: number;
  Vatreg: string;
  AccountName: string;
  SwiftCode: string;
  Contact: string;
  StreetName: string;
  City: string;
  State: string;
  Country: string;
  ZipCode: string;
  Logo: string;
  MaxUsers: number;
  AuthLogin: string;
  AuthKey: string;
  TermsOwner: string;
  ConditionsOwner: string;
  TermsCustomer: string;
  ConditionsCustomer: string;
  PayPalUser: string;
  PayPalPassword: string;
  PayPalSignature: string;
  PayPalMode: string;
  StripePubKey: string;
  StripeSecKey: string;
  TermsOwnerEn: string;
  ConditionsOwnerEn: string;
  TermsCustomerEn: string;
  ConditionsCustomerEn: string;
  AdvertTerms: string;
  AdvertConditions: string;
  PhotoThumbs: string;
  RegNum: string;
  MapMeta: string;
  ContactUsEmail: string;
  MapPdfurl: string;
  Attributes: any;
}
// Define AuthContext Type
interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  register: (obj: any) => Promise<void>;
  logout: () => Promise<void>;
  IsReady: boolean;
  session: { token: string | null } | null;
  isLoading: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (user: User | null) => void;
  setSession: (session: { token: string | null } | null) => void;
  company: Company | null;
  setCompany: (company: Company | null) => void;
  GetCompany: () => Promise<void>;
  GetProfile: (userId: any) => Promise<void>;
  profile: any | null;
}

// Create Context
const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use Session
export const useSession = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

// SessionProvider Component
const SessionProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<{ token: string | null } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<string | null>(null);
  const [IsReady, setIsReady] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        setIsLoading(true);
        //await AsyncStorage.removeItem("@onboarding_completed");
        const value = await AsyncStorage.getItem('@onboarding_completed');
        setShowOnboarding(value === 'yes' ? 'yes' : 'no');
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setShowOnboarding('no'); // Default to showing onboarding if there's an error
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  // Load session if onboarding is completed
  useEffect(() => {
    if (showOnboarding === 'yes') {
      const loadSession = async () => {
        try {
          setIsLoading(true);
          const [token, storedUser] = await Promise.all([
            AsyncStorage.getItem('token'),
            AsyncStorage.getItem('user'),
          ]);
          if (token && storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setSession({ token });
            setUser(parsedUser);
            console.log("USER ", parsedUser.Roles);
            //axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            if (parsedUser.Roles?.includes('View_AdvertCatelog') || parsedUser.UserType == "Admin")
              router.replace('/(tabs)/catalogs');
            else
              router.replace('/(tabs)');
          } else {
            router.replace('/sign-in');
          }
        } catch (error) {
          console.error('Error loading session:', error);
          router.replace('/sign-in');
        } finally {
          setIsLoading(false);
          setIsReady(true);
        }
      };

      loadSession();
    } else if (showOnboarding === 'no') {
      router.replace('/onboarding');
      setIsReady(true);
    }
  }, [showOnboarding]);

  // Hide splash screen when app is ready
  useEffect(() => {
    if (IsReady) {
      SplashScreen.hideAsync();
    }
  }, [IsReady]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await apiCall(
        'POST',
        '/Account/login',
        null,
        {
          Email: email,
          Password: password,
        }
      );

      const data = response?.data;

      if (!data?.loggedInUser || !data.loggedInUser.Token) {
        Alert.alert('Échec de la connexion', 'Adresse e-mail ou mot de passe incorrect');
        return;
      }
      //console.log('✅ response:', data);
      // Parse Attributes safely
      let parsedAttributes: any = {};
      if (data.loggedInUser.Attributes) {
        try {
          parsedAttributes = JSON.parse(data.loggedInUser.Attributes) || {};
        } catch (error) {
          console.error('Failed to parse Attributes JSON:', error);
        }
      }

      // Build PhotoURL if exists
      const photoURL = parsedAttributes?.PhotoURL
        ? `https://allomotors.fr/Content/WebData/UF/${parsedAttributes.PhotoURL}`
        : null;

      const user = {
        ...data.loggedInUser,
        Attributes: parsedAttributes,
        PhotoURL: photoURL,
      };

      const token = user.Token;
      // Persist session
      setSession({ token });
      setUser(user);
      setAuthToken(token);

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      //console.log('User OwnerID:', user.OwnerID);

      if (user.Roles?.includes('Pro') || user.Roles?.includes('Admin'))
        router.replace('/(tabs)/catalogs');
      else
        router.replace('/(tabs)');


    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Oops!', 'Une erreur s’est produite.');
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (obj: any) => {
    try {
      setIsLoading(true);
      const response = await fetch("https://allomotors.fr/Api/Account/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obj: obj }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login failed:", errorText);
        Alert.alert("Oops!", "Adresse e-mail ou mot de passe incorrect");
        return;
      }
      const data = await response.json();
      if (data.msg == 1) {
        Alert.alert("Enregistré avec succès", "Inscription réussie. Veuillez vérifier votre adresse e-mail avec le code OTP envoyé à votre boîte de réception.");
        router.replace("/otp");
      }
      else {
        Alert.alert("Échec de l'inscription !", "Veuillez vérifier vos informations et réessayer.");
      }
      console.log("Register response", data);
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Échec de l'inscription !", "Veuillez vérifier vos informations et réessayer.");
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    try {
      // 1. First clear OneSignal state before other cleanup
      try {
        // Properly logout from OneSignal
        await OneSignal.logout();
        // Clear any cached notifications
        await OneSignal.Notifications.clearAll();
        console.log('OneSignal logout completed');
      } catch (oneSignalError) {
        console.error('OneSignal logout error:', oneSignalError);
      }
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      // 3. Reset app state
      setUser(null);
      setSession(null);
      // 4. Add a small delay before navigation to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 300));
      // 5. Navigate to sign-in
      router.replace("/sign-in");
    } catch (error) {
      //console.error("Logout Error:", error);
      // Even if error occurs, ensure we navigate to sign-in
      router.replace("/sign-in");
    }
  };
  // Update user function
  const updateUser = (updatedUser: User | null) => {
    setUser(updatedUser);
  };
  const GetCompany = async () => {
    try {
      const response = await apiCall(
        'POST',
        '/Account/GetCompany',
        null,
        null // no body
      );

      const data = response?.data;

      // Parse Attributes safely (API sends it as string)
      const parsedData = {
        ...data,
        Attributes: data?.Attributes
          ? JSON.parse(data.Attributes)
          : null,
      };

      setCompany(parsedData);

    } catch (error) {
      console.error('GetCompany error:', error);
    }
  };

  const GetProfile = async (userId: any) => {
    if (userId) {
      setIsLoading(true);
      try {
        const response = await apiCall('get', `/Account/LoadProfile?userID=${userId}`, null, null);
        //console.log("LoadProfile Response:", response);
        if (response.status == 200 || response.status == 204 || response.statusText == 'Ok') {
          setUser({ ...user, Qrbalance: response.data.Qrbalance } as User);
          setUser({ ...user, ScanBalance: response.data.ScanBalance } as User);

          if (response.data?.Attributes) {
            try {
              response.data.Attributes = JSON.parse(response.data.Attributes) || {};
              //console.log(response.data.Attributes);
            } catch (error) {
              console.error("Failed to parse Attributes JSON:", error);
              response.data.Attributes = {}; // Fallback to empty object
            }
          }
          if (response.data && response.data.Attributes) {
            setUser({ ...user, Attributes: response.data.Attributes } as User);
            if (response.data?.Attributes?.PhotoURL) {
              response.data.PhotoURL = `https://allomotors.fr/Content/WebData/UF/${response.data?.Attributes?.PhotoURL}`;
              setUser({ ...user, PhotoURL: `https://allomotors.fr/Content/WebData/UF/${response.data?.Attributes?.PhotoURL}` } as User);
            }
            else
              setUser({ ...user, PhotoURL: null } as any);
          }
          setProfile(response.data);
          updateUser(user);
          // setPhone(response.data.Phone);
          // setQRbalance(response.data.Qrbalance);
          // setScanBalance(response.data.ScanBalance);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }
  return (
    <AuthContext.Provider
      value={{ login, register, logout, IsReady, session, setSession, isLoading, user, setUser, updateUser, company, setCompany, GetCompany, GetProfile, profile }} >
      {children}
    </AuthContext.Provider>
  );
};

export default SessionProvider;




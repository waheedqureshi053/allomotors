

import { getAnalytics, logEvent } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDZH1JXgq7OvBtW2y-ooaUHQeKfIhk-tlQ",
  authDomain: "allomotors-14e75.firebaseapp.com",
  projectId: "allomotors-14e75",
  storageBucket: "allomotors-14e75.firebasestorage.app",
  messagingSenderId: "1083026871981",
  appId: "1:1083026871981:android:8f72bbdf82b90a71c41824",
  measurementId: "G-BNLMF1WEFC",
};

// initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const trackEvent = (name: string, params: Record<string, any> = {}) => {
  logEvent(analytics, name, params);
};

export const trackScreen = (screen: string) => {
  logEvent(analytics, "screen_view", {
    firebase_screen: screen,
    firebase_screen_class: screen,
  });
};



// import analytics from '@react-native-firebase/analytics';

// export async function logEvent(name: string, params?: any) {
//   await analytics().logEvent(name, params);
// }

// export async function setAnalyticsUser(userId: string) {
//   await analytics().setUserId(userId);
// }











// export const TrackEvent = async (
//   name: string,
//   params: Record<string, any> = {}
// ) => {
//   await analytics().logEvent(name, params);
// };

// export const TrackScreen = async (screen: string) => {
//   await analytics().logScreenView({
//     screen_name: screen,
//     screen_class: screen
//   });
// };

// export const TrackEvent = async (
//   name: string,
//   params: Record<string, any> = {}
// ) => {
//   try {
//     await Analytics.logEvent(name, params || {});
//   } catch (e) {
//     console.log("Analytics error:", e);
//   }
// };

// export const TrackScreen = async (screen: string) => {
//   try {
//     await Analytics.logEvent("screen_view", {
//       screen_name: screen,
//       screen_class: screen
//     });
//   } catch (e) {
//     console.log("Analytics screen error:", e);
//   }
// };

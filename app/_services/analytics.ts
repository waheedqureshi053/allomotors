

import analytics from "@react-native-firebase/analytics";

export const trackEvent = async (
  name: string,
  params: Record<string, any> = {}
) => {
  try {
    const eventName = name.toLowerCase().replace(/\s+/g, '_');

    console.log('📊 Analytics Event:', eventName, params);

    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.log('Analytics Event Error:', error);
  }
};

export const trackScreen = async (screenName: string) => {
  try {
    console.log('🚀 Screen View:', screenName);

    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (error) {
    console.log('Analytics Screen Error:', error);
  }
};

export const logEvent = async (
  name: string,
  params: Record<string, any> = {}
) => {
  try {
    const eventName = name.toLowerCase().replace(/\s+/g, '_');

    console.log('🚀 Analytics Event:', eventName, params);

    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.log('Analytics Event Error:', error);
  }
};

export const setAnalyticsUser = async (userId: string) => {
  try {
    await analytics().setUserId(userId);
  } catch (error) {
    console.log('Analytics User Error:', error);
  }
};











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

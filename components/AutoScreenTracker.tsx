
import { trackScreen } from "@/app/_services/analytics";
import { usePathname } from "expo-router";
import { useEffect } from "react";
export default function AutoScreenTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackScreen(pathname);
  }, [pathname]);
  return null;
}



// import { useEffect } from "react";
// import { usePathname } from "expo-router";
// import analytics from "@react-native-firebase/analytics";

// export default function AutoScreenTracker() {
//   const pathname = usePathname();

//   useEffect(() => {
//     analytics().logScreenView({
//       screen_name: pathname,
//       screen_class: pathname
//     });
//   }, [pathname]);

//   return null;
// } 



 
// import { useEffect } from "react";
// import { usePathname } from "expo-router";
// import { Platform } from "react-native";
// import * as Analytics from "expo-firebase-analytics";

// export default function AutoScreenTracker() {
//   const pathname = usePathname();

//   useEffect(() => {
//     if (Platform.OS === "web") return;

//     const track = async () => {
//       try {
//         await Analytics.logEvent("screen_view", {
//           screen_name: pathname,
//           screen_class: pathname
//         });
//       } catch (e) {
//         console.log("Analytics screen error:", e);
//       }
//     };

//     track();
//   }, [pathname]);

//   return null;
// }

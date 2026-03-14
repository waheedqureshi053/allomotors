
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
import { Colors } from "@/constants/theme";
import { useMemo } from "react";
import { StyleSheet, useColorScheme } from "react-native";

export const useGlobalStyles = () => {
  const theme = useColorScheme(); // Get current theme (light/dark)

  const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };

  const FONT_SIZES = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
  };

  // Memoize styles to avoid unnecessary recalculations
  const styles = useMemo(
    () =>
      StyleSheet.create({
        background: {
          backgroundColor: Colors[theme ?? 'light'].background,
        },
        wigetBackground: {
          backgroundColor: Colors[theme ?? 'light'].card,
        },
        outlineBorders: {
          borderWidth: 1,
          borderColor: Colors[theme ?? 'light'].light,
        },
        primary: {
          backgroundColor: Colors[theme ?? 'light'].primary,
        },
        info: {
          backgroundColor: Colors[theme ?? 'light'].info,
        },
        danger: {
          backgroundColor: Colors[theme ?? 'light'].danger,
        },
        success: {
          backgroundColor: Colors[theme ?? 'light'].success,
        },
        warning: {
          backgroundColor: Colors[theme ?? 'light'].warning,
        },
        white: {
          backgroundColor: Colors[theme ?? 'light'].white,
        },
        light: {
          backgroundColor: Colors[theme ?? 'light'].light,
        },
        lighter: {
          backgroundColor: Colors[theme ?? 'light'].lighter,
        },
        colorPrimary: {
          color: Colors[theme ?? 'light'].primary,
        },
        colorDanger: {
          color: Colors[theme ?? 'light'].danger,
        },
        colorSuccess: {
          color: Colors[theme ?? 'light'].success,
        },
        colorWhite: {
          color: Colors[theme ?? 'light'].white,
        },
        colorLight: {
          color: Colors[theme ?? 'light'].light,
        },
        colorMuted: {
          color: Colors[theme ?? 'light'].lighter,
        },
        btnPasswordEye : {
          position: 'absolute',
          top: 10,
          right: 15
        },
        container: {
          flex: 1,
          backgroundColor: Colors[theme ?? 'light'].background,
          //padding: SPACING.md,
        },
        avatarContainer: {
          backgroundColor: Colors[theme ?? 'light'].card,
          position: 'relative',
          width: 50,
          height: 50,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarMinContainer: {
          backgroundColor: Colors[theme ?? 'light'].card,
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarImg: {
          width: 50,
          height: 50,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarMinImg: {
          width: 40,
          height: 40,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
        },
        indicatorOnline: {
          position: 'absolute',
          bottom: 1, // Adjusts the bottom position to create a rounded indicator
          right: 1,
          width: 12,
          height: 12,
          backgroundColor: '#4FBC87',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#fff',
        },
        indicatorCounter: {
          width: 25,
          height: 25,
          borderRadius: 15,
          backgroundColor: '#4FBC87',
          alignItems: 'center',
          justifyContent: 'center',
        },
        overlay: {
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)", // Optional overlay
        },
        card: {
          backgroundColor: Colors[theme ?? 'light'].card,
          borderRadius: 8,
          padding: SPACING.md,
          marginBottom: SPACING.md,
          shadowColor: Colors[theme ?? 'light'].light,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.20,
          shadowRadius: 1.41,
          elevation: 2,
        },
        shadow: {
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.20,
          shadowRadius: 1.41,
          elevation: 2,
        },
        textXS: {
          fontSize: FONT_SIZES.xs,
          color: Colors[theme ?? 'light'].text,
        },
        textXSWhite: {
          fontSize: FONT_SIZES.xs,
          color: Colors[theme ?? 'light'].white,
        },
        text: {
          fontSize: FONT_SIZES.sm,
          color: Colors[theme ?? 'light'].text,
        },
        textWhite: {
          fontSize: FONT_SIZES.sm,
          color: Colors[theme ?? 'light'].white,
        },
        title: {
          fontSize: FONT_SIZES.xl,
          fontWeight: "bold",
          color: Colors[theme ?? 'light'].text,
        },
        subtitle: {
          fontSize: FONT_SIZES.md,
          fontWeight: "bold",
          color: Colors[theme ?? 'light'].text,
        },
        btnIcon: {
          width: 45,
          height: 45,
          alignItems: "center",
          justifyContent: "center",
        },
        btnIconSM: {
          width: 35,
          height: 35,
          alignItems: "center",
          justifyContent: "center",
        },
        button: {
          backgroundColor: Colors[theme ?? 'light'].primary,
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          borderRadius: 5,
          alignItems: "center",
          justifyContent: "center",
        },
        buttonText: {
          fontSize: FONT_SIZES.md,
          color: Colors[theme ?? 'light'].white, // Button text is always white
          fontWeight: "bold",
        },
        shadowLGPrimary: {
          shadowColor: Colors[theme ?? 'light'].primary,
          shadowOffset: {
            width: 0,
            height: 9,
          },
          shadowOpacity: 0.48,
          shadowRadius: 1.95,

          elevation: 10,
        },
        btnShadow: {
          shadowColor: Colors[theme ?? 'light'].primary,
          shadowOffset: {
            width: 0,
            height: 9,
          },
          shadowOpacity: 0.48,
          shadowRadius: 11.95,

          elevation: 18,
        },
        input: {
          height: 48,
          borderWidth: 1,
          borderColor: Colors[theme ?? 'light'].light,
          borderRadius: 8,
          paddingHorizontal: SPACING.md,
          fontSize: FONT_SIZES.md,
          backgroundColor: Colors[theme ?? 'light'].card,
          color: Colors[theme ?? 'light'].text,
        },
        composer: {
          minHeight: 55,
          backgroundColor: Colors[theme ?? 'light'].card,
          borderRadius: 15,
          borderWidth: 0,
          borderColor: Colors[theme ?? 'light'].lighter,
          paddingHorizontal: 10,
          fontSize: 16,
          marginVertical: 4,
          paddingVertical: 10,
          color: Colors[theme ?? 'light'].text
        },
        pickerContainer: {
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor: Colors[theme ?? 'light'].light, 
          borderRadius: 8,
        },
        picker: {
          height: 50,
          borderWidth: 1,
          borderColor: Colors[theme ?? 'light'].light,
          borderRadius: 8,
          paddingHorizontal: SPACING.md,
          fontSize: FONT_SIZES.md,
          backgroundColor: Colors[theme ?? 'light'].card,
          color: Colors[theme ?? 'light'].text
        },
        pickerItem: {
          fontSize: 9, // Works for iOS
        },

        pickerSelectStyles: {
          fontSize: 16,
          padding: 10,
          borderWidth: 1,
          borderColor: "gray",
          borderRadius: 5,
          color: Colors[theme ?? 'light'].text,
        },
        relativePosition: {
          position: 'relative'
        },
        absolutePosition: {
          position: 'absolute'
        },
        roundedCircle: {
          borderRadius: 50
        },
        textCenter: {
          textAlign: 'center'
        },
        fontBold: {
          fontWeight: "bold",
        },
        flexRow: {
          flexDirection: 'row',
        },
        flexOne: {
          flex: 1
        },
        itemCenter: {
          alignItems: 'center',
        },
        itemStart: {
          alignItems: 'flex-start',
        },
        itemEnd: {
          alignItems: 'flex-end',
        },
        itemStretch: {
          alignItems: 'stretch',
        },
        justifyCenter: {
          justifyContent: 'center',
        }









      }),
    [theme] // Recreate styles when the theme changes
  );

  return { styles, SPACING, FONT_SIZES };
};

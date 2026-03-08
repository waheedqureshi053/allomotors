import { Appearance, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
//import * as SecureStore from 'expo-secure-store';
import { useGlobalStyles } from '@/app/_styles/globalStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

type ColorSchemeName = 'light' | 'dark' | null | undefined;

/**
 * Hook to manage theme preferences and allow for manual override.
 */
export function useThemeManager() {
  // Get initial system color scheme
  const systemColorScheme = useColorScheme();
  const [currentScheme, setCurrentScheme] = useState<ColorSchemeName>(
    systemColorScheme
  );

  // Function to toggle between light and dark themes
  const toggleColorScheme = () => {
    const newScheme = currentScheme === 'light' ? 'dark' : 'light';
    setCurrentScheme(newScheme);
    Appearance.setColorScheme(newScheme); // Override the system preference
    saveTheme(newScheme);
  };


  // Save theme to SecureStore
  const saveTheme = async (theme: ColorSchemeName) => {
    if (theme) {
      await AsyncStorage.setItem('themePreference', theme);
      //await SecureStore.setItemAsync('themePreference', theme);
    }
  };

  return { currentScheme, toggleColorScheme };
}

/**
 * Example usage in a component
 */
export function AppThemeProvider() {
  const styles = useGlobalStyles();
  const { currentScheme, toggleColorScheme } = useThemeManager();
  const [isEnabled, setIsEnabled] = useState(currentScheme === 'dark');

  // Update isEnabled whenever the theme changes
  const handleToggleColorScheme = () => {
    toggleColorScheme(); // Toggle the theme
    setIsEnabled((prevState) => !prevState); // Toggle isEnabled state
  };

  return (
    <View>
      <TouchableOpacity onPress={handleToggleColorScheme}>
        {isEnabled ? (
          <View>
            <MaterialIcons
              name="dark-mode"
              size={30}
              color={Colors[currentScheme ?? 'light'].white}
            />
          </View>
        ) : (
          <View>
            <MaterialIcons
              name="light-mode"
              size={30}
              color={Colors[currentScheme ?? 'light'].text}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

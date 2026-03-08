
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { useColorScheme, View } from "react-native";
import * as ImagePicker from 'expo-image-picker'; 
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "./_services/ctx";
import { useGlobalStyles } from "./_styles/globalStyle";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

const OnboardingScreen = () => {
  const {isLoading} = useSession();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { styles } = useGlobalStyles();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const navigation = useRouter();
  const slides = [
    {
      id: 3,
      title: 'Bienvenue sur AlloMotors',
      description: 'Parcourez des milliers de véhicules en un seul endroit. Avec AlloMotors, trouvez le véhicule de vos rêves plus rapidement et plus facilement que jamais !',
      image: require('../assets/img/login-car.png'),
    },
    {
      id: 1,
      title: 'Obtenez le meilleur prix pour votre véhicule',
      description: 'Vendez votre voiture sans tracas ! AlloMotors vous met en relation avec des acheteurs vérifiés, propose des estimations de prix équitables et rend la vente de votre véhicule ultra-simple.',
      image: require('../assets/img/login-car.png'),
    },
    {
      id: 2,
      title: 'Achetez et vendez en toute confiance',
      description: 'Bénéficiez de paiements sécurisés, d\'annonces vérifiées et de professionnels de confiance. AlloMotors garantit une expérience fluide et sans fraude.',
      image: require('../assets/img/login-car.png'),
    },
  ];
  const requestAllPermissions = async () => {
    try {
      const imagePickerPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const allGranted = (
        imagePickerPermission.status === 'granted'
      );
      if (allGranted) {
        setPermissionsGranted(true);
      } else {
        console.log('Some permissions were not granted:', {
          imagePicker: imagePickerPermission.status
        });
      }
      // Mark onboarding as complete regardless of permission status
      await AsyncStorage.setItem('@onboarding_completed', 'yes');
      navigation.replace('/sign-in');
    } catch (error) {
      console.error('Error requesting permissions:', error);
      // Continue to app even if permissions fail
      await AsyncStorage.setItem('@onboarding_completed', 'yes');
      navigation.replace('/sign-in');
    }
  };
  const handleNext = async () => {
    //console.log('Current Slide:', 1 + currentSlide);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await requestAllPermissions();
    }
  };
  const handleSkip = async () => {
    await AsyncStorage.setItem('@onboarding_completed', 'yes');
    navigation.replace("/sign-in"); // Replace with your main screen name
  };
  const Customstyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
    },
    slide: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    image: {
      width: 300,
      height: 300,
      resizeMode: 'contain',
      marginBottom: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: Colors[colorScheme ?? 'light'].text,
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      color: Colors[colorScheme ?? 'light'].light,
      paddingHorizontal: 30,
    },
    footer: {
      height: 100,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    indicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ccc',
      marginHorizontal: 5,
    },
    activeIndicator: {
      backgroundColor: Colors[colorScheme ?? 'light'].danger,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    skipButton: {
      padding: 10,
    },
    skipButtonText: {
      color: '#666',
      fontSize: 16,
    },
    nextButton: {
      backgroundColor: Colors[colorScheme ?? 'light'].primary,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
    },
    nextButtonText: {
      color: Colors[colorScheme ?? 'light'].white,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  if (isLoading) {
          return (
              <View style={[styles.background, styles.flexOne, styles.justifyCenter, styles.itemCenter]}>
                  <View className="flex flex-row items-center justify-center">
                      <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].text} />
                      <Text className="ml-5" style={{ color: Colors[colorScheme ?? 'light'].text }}>
                          Chargement...
                      </Text>
                  </View>
              </View>
          );
      }
  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', marginTop: insets.top }}>

      <View style={[Customstyles.container]}>
        <View style={[Customstyles.slide]}>
          <Image source={slides[currentSlide].image} style={[Customstyles.image]} />
          <ThemedText style={[Customstyles.title]}>{slides[currentSlide].title}</ThemedText>
          <ThemedText style={[Customstyles.description]}>{slides[currentSlide].description}</ThemedText>
        </View>

        <View style={[Customstyles.footer]}>
          <View style={[Customstyles.indicatorContainer]}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  Customstyles.indicator,
                  currentSlide === index && Customstyles.activeIndicator,
                ]}
              />
            ))}
          </View>

          <View style={[Customstyles.buttonContainer]}>
            {/* {currentSlide < slides.length - 1 ? (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          ) : null} */}

            <TouchableOpacity onPress={handleNext} style={[Customstyles.nextButton]}>
              <Text style={[Customstyles.nextButtonText]}>
                {/* {currentSlide === 0 ? 'Commencer' : 'Suivant'} */}
                {currentSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
export default OnboardingScreen;
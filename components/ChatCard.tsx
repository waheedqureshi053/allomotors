import { Image, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useRef } from 'react' 
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; 
import { useGlobalStyles } from '@/app/_styles/globalStyle';
import LiveTimeAgo from './LiveTimeAgo';
import { Animated } from 'react-native';
import { Colors } from '@/constants/theme';
import { ThemedText } from './themed-text';

interface mcoCardComponentProps {
  item: any;
  index: number;
}

const ChatCardComponent: React.FC<mcoCardComponentProps> = ({ item, index }) => {
  const colorScheme = useColorScheme();
  const { styles, FONT_SIZES } = useGlobalStyles();

  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
    <TouchableOpacity key={index} style={[{ marginHorizontal: 15, marginBottom: 15 }]}
     activeOpacity={0.8}
     onPressIn={handlePressIn}
     onPressOut={handlePressOut}
      onPress={ async() => {
        router.push(`/chats/${item?.UserId}`)
      }}>
      <View style={[{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }]}>
        <View style={[styles.avatarContainer]}>
          {item?.PhotoURL ? (
            <Image
              source={{ uri: `https://allomotors.fr/Content/WebData/UF/${item?.PhotoURL}` }}
              style={[styles.avatarImg]}
              resizeMode="contain"
            />
          ) : <Image
            source={require('../assets/img/avatar.png')}
            style={[styles.avatarImg]}
            resizeMode="contain"
            tintColor={Colors[colorScheme ?? 'light'].light}
          />
          }
          {item?.IsOnline && (
            <View style={styles.indicatorOnline}> </View>
          )}
        </View>
        <View style={[{ flexDirection: 'column', flex: 1 }]}>
          <ThemedText type='subtitle' style={[{ fontSize: FONT_SIZES.md, fontWeight: 'bold' }]}>{item?.FirstName} {item?.LastName}</ThemedText>
          <ThemedText type='default' numberOfLines={2} ellipsizeMode='tail'
            style={[{ lineHeight: 18, fontSize: FONT_SIZES.sm }]}>
            {item?.LastMessage ? item?.LastMessage : item?.UserType}
          </ThemedText>
        </View>
        <View style={[{ flexDirection: 'column', gap: 10, alignItems: 'flex-end' }]}>
          <ThemedText style={[{ fontSize: FONT_SIZES.xs, fontStyle: 'italic' }]}>{item?.LastTime ? <LiveTimeAgo timestamp={item?.LastTime} style={[{ lineHeight: 18, fontSize: FONT_SIZES.sm }]} /> : item?.MessageDate}</ThemedText>
          {item?.ReadCount > 0 && (
            <View style={[styles.indicatorCounter]}>
              <ThemedText lightColor={Colors[colorScheme ?? 'light'].white} darkColor={Colors[colorScheme ?? 'light'].white} style={[{ fontSize: FONT_SIZES.xs, fontWeight: 'bold' }]}>{item?.ReadCount ? item?.ReadCount : 0}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>

    </Animated.View>
  )
}

export default ChatCardComponent

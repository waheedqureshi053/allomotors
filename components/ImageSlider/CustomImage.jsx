import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { router } from 'expo-router';
const CustomImage = ({ item, x, index, size, spacer }) => {
  const [aspectRatio, setAspectRatio] = useState(1);

  // Get Image Width and Height to Calculate AspectRatio
  // useLayoutEffect(() => {
  //   if (item.image) {
  //     const { width, height } = Image.resolveAssetSource(item.image);
  //     setAspectRatio(width / height);
  //   }
  // }, [item.image]);

  useLayoutEffect(() => {
  if (item?.image) {
    Image.getSize(
      item.image,
      (width, height) => {
        setAspectRatio(width / height);
      },
      (error) => {
        console.warn('Failed to get image size:', error);
      }
    );
  }
}, [item?.image]);

  const style = useAnimatedStyle(() => {
    const scale = interpolate(
      x.value,
      [(index - 2) * size, (index - 1) * size, index * size],
      [0.8, 1, 0.8],
    );
    return {
      transform: [{ scale }],
    };
  });

  if (!item.image) {
    return <View style={{ width: spacer }} key={index} />;
  }
  return (
    <View style={{ width: size }} key={index}>
      <Animated.View style={[styles.imageContainer, style]}>
        <TouchableOpacity onPress={() => { router.push(`/zoom/${encodeURIComponent(item.image)}`); }}>
        <Image
          resizeMode='contain'
          source={{uri : item.image}}
          style={[styles.image, { aspectRatio: aspectRatio, maxHeight: 360}]}
        />

        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default CustomImage;

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    //borderColor: '#D4D4D4', borderWidth: 2,
  },
  image: {
    width: '100%',
    height: undefined,
  },
});

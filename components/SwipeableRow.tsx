import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { Component } from 'react';
import { Animated, StyleSheet, View, I18nManager, useColorScheme } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
type SwipeableRowProps = {
  OnDelete: () => void;
  OnEdit: () => void;
  children?: React.ReactNode;
};

export default class SwipeableRow extends Component<SwipeableRowProps> {
  private renderRightAction = (
    iconName: string,
    color: string,
    progress: Animated.AnimatedInterpolation<number>,
    action: () => void
  ) => {
    // Interpolate the animation based on swipe progress
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0], // Move from right (100) to left (0)
    });

    const pressHandler = () => {
      this.close();
      action();
    };

    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}>
          <Ionicons name={iconName as 'key'} size={20} color="white" />
          {/* as 'symbol' */}
        </RectButton>
      </Animated.View>
    );
  };

  private renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragAnimatedValue: Animated.AnimatedInterpolation<number>
  ) => (
    <View
      style={{
        height: 30,
        marginVertical: 'auto',
        width: 60, // Adjust width to fit two circular buttons
        flexDirection: I18nManager.isRTL ? 'column-reverse' : 'column', // 'row-reverse' : 'row',
        justifyContent: 'center', // Center align the actions
        alignItems: 'center',
      }}>
      {/* {this.renderRightAction('trash-outline', '#F2522E', progress, this.props.OnDelete)} */}
      {this.renderRightAction('create-outline', '#404040', progress, this.props.OnEdit)}
    </View>
  );

  private swipeableRow?: Swipeable;

  private updateRef = (ref: Swipeable) => {
    this.swipeableRow = ref;
  };

  private close = () => {
    this.swipeableRow?.close();
  };

  render() {
    const { children } = this.props;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={this.renderRightActions}>
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 35, // Circle width
    height: 35, // Circle height
    borderRadius: 25, // Fully rounded to form a circle
    marginHorizontal: 10, // Space between the icons
  },
});
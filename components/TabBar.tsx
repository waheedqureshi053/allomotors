import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSegments } from 'expo-router';

const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const primaryColor = '#FFFFFF';
    const greyColor = '#77838F';
    const segments = useSegments();
    //console.log(segments);
    // Check if we're on a screen where we want to hide tabs
    const shouldHideTabBar = segments.some(segment =>
        segment === '[id]' || segment === '[userId]'
    ) && segments.length > 1; // Only hide for nested routes like [id]

    if (shouldHideTabBar) {
        return null;
    }

    return (
        <View style={styles.tabbar}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel ?? options.title ?? route.name;
                if (!['Home', 'Chats', 'Catalogs', 'Settings', 'Packages'].includes(label.toString())) return null; // Ensure only two tabs
                const isFocused = state.index === index;
                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };
                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };
                return (
                    <TabBarButton
                        key={route.name}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        isFocused={isFocused}
                        label={label.toString()}
                        color={isFocused ? primaryColor : greyColor}
                    />
                );
            })}
        </View>
    );
};

type TabBarButtonProps = {
    onPress: () => void;
    onLongPress: () => void;
    isFocused: boolean;
    label: string;
    color: string;
};

const TabBarButton: React.FC<TabBarButtonProps> = ({ onPress, onLongPress, isFocused, label, color }) => {
    const getIcon = (label: string) => {
        switch (label) {
            case 'Home':
                return require('../assets/tabs/car.png');
            case 'Chats':
                return require('../assets/tabs/chatIcon.png');
            case 'Catalogs':
                return require('../assets/tabs/cart.png');
            case 'Settings':
                return require('../assets/tabs/settingIcon.png');
            case 'Packages':
                return require('../assets/tabs/gift.png');
            default:
                return require('../assets/tabs/homeIcon.png');
        }
    };

    return (
        <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={[styles.tabButton]}>
            <View style={[styles.iconContainer, isFocused && styles.focusedIconContainer]}>
                <Image source={getIcon(label)} style={[styles.icon, { tintColor: color }]} resizeMode="contain" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tabbar: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        marginHorizontal: 40,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#404040',
        paddingVertical: 0,
        borderRadius: 40,
        shadowColor: '#404040',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5, // For Android
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 5,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    focusedIconContainer: {
        backgroundColor: '#F2522E', // Green background when focused
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 40
    },
    icon: {
        width: 24,
        height: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
    },
});

export default TabBar;

import React, { useEffect, useState } from 'react';
import {
    Modal,
    Text,
    View,
    TouchableOpacity,
    Linking,
    Platform,
    StyleSheet,
    Image,
} from 'react-native';
import VersionCheck from 'react-native-version-check';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/theme';

const AppVersionCheck = () => {
    const [showModal, setShowModal] = useState(false);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [storeUrl, setStoreUrl] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const updateNeeded = await VersionCheck.needUpdate();

                if (updateNeeded?.isNeeded) {
                    setLatestVersion(updateNeeded.latestVersion);
                    setStoreUrl(updateNeeded.storeUrl);
                    setShowModal(true);
                }
            } catch (error) {
                console.warn('Version check failed:', error);
            }
        })();
    }, []);

    const openStore = () => {
        if (storeUrl) Linking.openURL(storeUrl);
    };

    return (
        <Modal visible={showModal} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Image style={styles.imgStyle} resizeMode='contain' source={require('../assets/img/logo-trans.png')} />
                    <Text style={styles.title}>{'Mise à jour disponible'}</Text>
                    <Text style={styles.message}>
                        {'Une nouvelle version'} ({latestVersion}) {`L'application est disponible. Veuillez la mettre à jour pour continuer.`}
                    </Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.updateButton} onPress={openStore}>
                            <Text style={styles.updateText}>{'Mettre à jour maintenant'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AppVersionCheck;


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: moderateScale(20),
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        alignItems: 'center',
    },
    imgStyle: {
        height: moderateScale(150), width: moderateScale(150), borderRadius: moderateScale(75),
        alignSelf: 'center', marginBottom: moderateScale(10),
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        marginBottom: moderateScale(10),
    },
    message: {
        fontSize: moderateScale(16),
        textAlign: 'center',
        marginBottom: moderateScale(20),
    },
    actions: {
        flexDirection: 'row',
        columnGap: moderateScale(10),
    },
    updateButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: moderateScale(20),
        paddingVertical: moderateScale(10),
        borderRadius: moderateScale(10),
    },
    updateText: {
        color: 'white',
        fontWeight: '600',
        fontSize: moderateScale(18),
    },
});
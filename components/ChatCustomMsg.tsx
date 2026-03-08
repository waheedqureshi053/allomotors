import React, { useState } from 'react';
import {
    View, Image, FlatList, Text, TouchableOpacity, Modal, Dimensions,
    Alert,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';

const { width } = Dimensions.get("window");

const ChatAttachments = ({ attachments }: { attachments: { url: string, FileType: string, name?: string, size?: string }[] }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openPreview = (index: number) => {
        setCurrentIndex(index);
        setModalVisible(true);
    };

    const cleanFileName = (fileName: any) => {
        if (fileName && fileName.length > 37) {
          return fileName.substring(37, fileName.length);
        }
        return "";
    }

    async function openDocument(url : any) {
        try {
          // Check if we can open the URL directly
          const supported = await Linking.canOpenURL(url);
          
          if (supported) {
            await Linking.openURL(url);
          } else {
            Alert.alert('Error', 'Failed to open document.');
          }
        } catch (error : any) {
          Alert.alert('Error', 'Failed to open document: ' + error.message);
          console.error('Error opening document:', error);
        }
      }
      
      function getMimeType(url : any) {
        const extension = url.split('.').pop().toLowerCase();
        switch (extension) {
          case 'pdf':
            return 'application/pdf';
          case 'doc':
          case 'docx':
            return 'application/msword';
          case 'xls':
          case 'xlsx':
            return 'application/vnd.ms-excel';
          case 'ppt':
          case 'pptx':
            return 'application/vnd.ms-powerpoint';
          case 'txt':
            return 'text/plain';
          default:
            return 'application/octet-stream';
        }
      }
      

    const images = attachments.filter(file => file.FileType === "image");
    const videos = attachments.filter(file => file.FileType === "video");
    const documents = attachments.filter(file => file.FileType === "document");

    return (
        <View style={{ marginVertical: 8, marginHorizontal: 8 }}>
            {/* IMAGES & VIDEOS GRID */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 5 }}>
                {[...images, ...videos].slice(0, 4).map((file, index) => (
                    <TouchableOpacity key={index} onPress={() => openPreview(index)}
                        style={{
                            width: images.length + videos.length === 1 ? 250 : width / 3 - 1,
                            height: images.length + videos.length === 1 ? 250 : width / 3 - 1,
                            borderRadius: 8,
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                        {file.FileType === "image" ? (
                            <Image source={{ uri: file.url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                        ) : (
                            <View>
                                <Video
                                    source={{ uri: file.url }}
                                    style={{ width: "100%", height: "100%" }}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay={false}
                                    isLooping
                                />
                                <Ionicons name="play-circle" size={40} color="white"
                                    style={{ position: 'absolute', top: '40%', left: '40%' }} />
                            </View>
                        )}
                        {/* Overlay for showing +more count */}
                        {index === 3 && (images.length + videos.length) > 4 && (
                            <View style={{
                                position: 'absolute', width: '100%', height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center',
                                alignItems: 'center', borderRadius: 8
                            }}>
                                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>+{(images.length + videos.length) - 3}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* DOCUMENTS LIST */}
            {documents.length > 0 && (
                <View style={{ marginTop: 0 }}>
                    {documents.map((doc, index) => (
                        <TouchableOpacity key={index} onPress={() => { openDocument(doc.url) }}
                            style={{
                                flexDirection: 'row', alignItems: 'center', padding: 10,
                                backgroundColor: '#f1f1f1', borderRadius: 8, marginBottom: 5, marginHorizontal: 5
                            }}>
                            <Ionicons name="document-text-outline" size={24} color="black" style={{ marginRight: 10 }} />
                            <View className="flex-1">
                                <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontWeight: 'bold' }}>{cleanFileName(doc.name) || doc.name}</Text>
                                <Text style={{ fontSize: 12, color: 'gray' }}>{doc.size}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* IMAGE/VIDEO SWIPE MODAL */}
            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                    <FlatList
                        data={[...images, ...videos]}
                        keyExtractor={(item, index) => `${item.url}-${index}`}
                        horizontal
                        pagingEnabled
                        initialScrollIndex={currentIndex}
                        getItemLayout={(data, index) => ({
                            length: width, offset: width * index, index,
                        })}
                        renderItem={({ item }) => (
                            <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
                                {item.FileType === "image" ? (
                                    <Image source={{ uri: item.url }} style={{ width: '90%', height: '80%', borderRadius: 10 }} resizeMode="contain" />
                                ) : (
                                    <Video
                                        source={{ uri: item.url }}
                                        style={{ width: '90%', height: '80%', borderRadius: 10 }}
                                        useNativeControls
                                        resizeMode={ResizeMode.COVER}
                                        shouldPlay={false}
                                        isLooping
                                    />
                                )}
                            </View>
                        )}
                    />
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={{ position: 'absolute', top: 40, right: 20 }}>
                        <Ionicons name="close-circle" size={40} color="white" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default ChatAttachments;





import { vmSearchObj } from "@/app/_models/vmSearch";
import { apiCall } from "@/app/_services/api";
import { useSession } from "@/app/_services/ctx";
import { useGlobalStyles } from "@/app/_styles/globalStyle";
import ChatAttachments from "@/components/ChatCustomMsg"; 
import { Feather, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Keyboard, TouchableWithoutFeedback, Image, ScrollView, Text } from "react-native";
import { ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, useColorScheme, View } from "react-native";
import { Bubble, GiftedChat, IMessage, InputToolbar } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SignalR from '@microsoft/signalr';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import ChatService from "@/app/_services/chatservice";
import { formatMessages, formatSingleMessage } from "@/app/_services/handleChatMessages";
import { uploadFile } from "@/app/_services/uploadService";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
interface IAttachment {
    FileName: string;
    FileType: string;
    FileSize?: string;
    OnlineAddress?: string;
    url?: string;
    name?: string;
}
interface IMessageWithImages extends IMessage {
    images: IAttachment[];
    MsgType: string;
    carTitle: string;
    category: string;
    itemGuid: string;
}
interface MessageItem {
    ID: number;
    Message: string;
    MessageDate: string;
    ReceiverID: string;
    SenderID: string;
    Status: "Read" | "Unread";
    MsgType: string;
    Attributes: string;
    Email: string;
    FirstName: string;
    LastName: string;
    FirstName_Rec: string;
    LastName_Rec: string;
    UserType: string;
    SenderAttributes: string;
    FullPath?: string;
    Category?: string;
    ChatAttributes?: any;
}

const ChatScreen = () => {
    //const divicePlatform = Platform.OS; 
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const navigation = useNavigation();
    const { user, GetProfile, profile } = useSession();
    const router = useRouter();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [text, setText] = useState('');
    const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);
    const [Attri, setAttributes] = useState<{ Attachments: IAttachment[] }>({ Attachments: [] });
    //const [isRecording, setIsRecording] = useState(false);
    const [shouldShowSendButton, setShouldShowSendButton] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadEarlier, setLoadEarlier] = useState(true);
    const [loading, setLoading] = useState(false);
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const { userId, ItemGuid } = useLocalSearchParams();
    const searchObj = new vmSearchObj();
    searchObj.withUserId = userId as string || "";
    const currentUser = user;
    // Keyboard State
    useFocusEffect(
        React.useCallback(() => {
            const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
            const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));

            return () => {
                showSub.remove();
                hideSub.remove();
            };
        }, [])
    );
    // Audio setup
    useEffect(() => {
        const hideKeyboard = async () => {
            await Keyboard.dismiss();
        }
        hideKeyboard();
        let isMounted = true;
        const soundObject = new Audio.Sound();

        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });

                await soundObject.loadAsync(require('../../../assets/sounds/message-sound.mp3'), { shouldPlay: false });

                if (isMounted) {
                    setSound(soundObject);
                }
            } catch (error) {
                console.log('Audio setup error:', error);
            }
        };

        setupAudio();

        return () => {
            isMounted = false;
            soundObject.unloadAsync().catch(e => console.log('Audio cleanup error:', e));
        };
    }, []);
    // // SignalR connection
    useEffect(() => {
        if (!user?.Token) return;
        let isMounted = true;
        const newConnection = new SignalR.HubConnectionBuilder()
            .withUrl("https://api.allomotors.fr/realtimeHub", {
                accessTokenFactory: () => user?.Token ?? "",
                transport: SignalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .configureLogging(SignalR.LogLevel.Information)
            .build();

        const handleNewMessage = async (dataObj: string) => {
            if (!isMounted) return;

            try {
                const rawMessage = dataObj ? JSON.parse(dataObj) : {};
                console.log("parsed rawMessage", rawMessage);
                const newMessage = formatSingleMessage(rawMessage, {
                    apiBaseUrl: "https://api.allomotors.fr/Content/WebData/UF",
                    assetsBaseUrl: "https://allomotors.fr/Content/WebData/UF",
                    currentUserId: user?.UserId
                });
                console.log("Formatted rawMessage", rawMessage);
                if (sound && rawMessage?.SenderID !== currentUser?.UserId) {
                    try {
                        await sound.replayAsync();
                    } catch (playError) {
                        console.log('Sound play error:', playError);
                    }
                }

                setMessages((prevMessages) => GiftedChat.prepend(prevMessages, [newMessage]));
                if (rawMessage?.ID && rawMessage?.SenderID !== currentUser?.UserId) {
                    UpdateMsgStatus({ Id: rawMessage.ID, Status: "Read" });
                }
            } catch (error) {
                console.log('Message parsing error:', error);
            }
        };

        newConnection.on("ReceiveMessage", handleNewMessage);

        const startConnection = async () => {
            try {
                await newConnection.start();
                console.log("SignalR connection established");
            } catch (error) {
                console.log("Connection failed:", error);
                // Implement retry logic with exponential backoff
            }
        };

        startConnection();
        setConnection(newConnection);

        return () => {
            isMounted = false;
            newConnection.off("ReceiveMessage", handleNewMessage);
            newConnection.stop().catch(e => console.log('Connection stop error:', e));
        };
    }, [user?.Token, sound, user?.UserId, currentUser?.UserId]);

    const UpdateMsgStatus = async (obj: { Id: any, Status: string }) => {
        try {
            const response = await apiCall('post', `/Account/UpdateMsgStatus/`, null, obj);
            console.log("UpdateMsgStatus response:", response);
        } catch (error) {
            console.error("Update Msg Status Error:", error);
        }
    };
    const GetChatMessages = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            searchObj.UserId = userId as string || "";// parsedUser?.UserId;
            searchObj.pageIndex = page;

            const response = await apiCall('post', `/Account/GetChat2/`, searchObj, searchObj);
            if (response.status === 200 || response.statusText === 'Ok') {
                let messagesToFormat = [];
                // Handle different response formats
                if (typeof response.data?.pureChat === 'string') {
                    messagesToFormat = JSON.parse(response.data.pureChat);
                } else if (Array.isArray(response.data?.pureChat)) {
                    messagesToFormat = response.data.pureChat;
                } else if (response.data?.pureChat) {
                    messagesToFormat = [response.data.pureChat];
                }

                await ChatService.getAdvertAttributes(messagesToFormat, 0);
                // Format the messages
                const formattedMessages: any = formatMessages(messagesToFormat, {
                    apiBaseUrl: "https://api.allomotors.fr/Content/WebData/UF",
                    assetsBaseUrl: "https://allomotors.fr/Content/WebData/UF",
                    currentUserId: user?.UserId
                });
                // formattedMessages.map((message: any, index: number) => 
                // ChatService.getAdvertAttributes([message], 0)
                // );

                //console.log("New  Fucntions Formated Messages", formattedMessages);
                setMessages((prevMessages) =>
                    GiftedChat.append(prevMessages, formattedMessages)
                );

                setPage((prevPage) => prevPage + 1);

                if (response.data?.pureChat.length < 25) {
                    setHasMore(false);
                    setLoadEarlier(false); // Hide "Load Earlier" button
                }
            } else {
                Alert.alert("Oups, quelque chose s'est mal passé !");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    const goBack = useCallback(async () => {
        console.log("Back button pressed");
        await Keyboard.dismiss();
        router.navigate("/chats");
        // await Keyboard.dismiss();
        // if (navigation.canGoBack()) {
        //     navigation.goBack();
        // } else {
        //     router.back();
        //     console.log("Back button pressed call else block");
        // }
    }, [navigation, router]);

    // const goBack = () => {
    //     router.back();
    //     console.log("Back button pressed");
    // };
    useFocusEffect(
        useCallback(() => {
            navigation.setOptions({
                headerLeft: () => (
                    <TouchableOpacity onPress={async () => { await goBack() }} activeOpacity={0.5}>
                        <View className='flex flex-row items-center gap-1'>
                            <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                            <View style={[styles.avatarMinContainer, { marginRight: 8, overflow: 'hidden' }]}>
                                {profile?.PhotoURL ? (
                                    <Image
                                        source={{ uri: `${profile?.PhotoURL}` }}
                                        style={{ width: 30, height: 30 }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Image
                                        source={require('../../../assets/img/avatar.png')}
                                        style={[styles.avatarMinImg]}
                                        resizeMode="cover"
                                        tintColor={Colors[colorScheme ?? 'light'].light}
                                    />
                                )}
                                {profile?.IsOnline && <View style={styles.indicatorOnline} />}
                            </View>
                        </View>
                    </TouchableOpacity>
                ),
                headerTitle: () => (
                    <View >
                        <ThemedText lineBreakMode='clip' numberOfLines={1} type='default' style={[styles.colorWhite, { fontSize: FONT_SIZES.md, lineHeight: 16 }]}>
                            {profile?.FirstName} {profile?.LastName}
                        </ThemedText>
                        <ThemedText type='default' style={[styles.colorLight, { fontSize: FONT_SIZES.xs, lineHeight: 15 }]}>
                            {profile?.UserType}
                        </ThemedText>
                    </View>
                )
            });
        }, [navigation, profile, colorScheme, goBack, styles])
    );
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                GetProfile(userId);
                GetChatMessages();
            }
        }, [userId])
    );
    useEffect(() => {
        setShouldShowSendButton(text.trim().length > 0 || Attri.Attachments.length > 0);
    }, [text, Attri.Attachments]);
    const pickAndUploadDocuments = async () => {
        try {
            // No need for permissions with DocumentPicker on iOS/Android

            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all file types
                multiple: true, // Allow multiple selection
                copyToCacheDirectory: true // Recommended to keep this true
            });

            // Handle cancellation or no files selected
            if ('type' in result && result.type === 'cancel' || !result.assets) {
                console.warn("No file selected");
                return;
            }

            setLoading(true);

            const uploadedAttachments = await Promise.all(
                result.assets.map(async (file) => {
                    // Note: file.uri is the local URI to access the file
                    return await uploadFile(file.uri, "UF", user?.Token ?? "");
                })
            );

            console.log("Uploaded Attachments:", uploadedAttachments);
            setAttributes((prev: any) => ({
                ...prev,
                Attachments: [...prev.Attachments, ...uploadedAttachments],
            }));
        } catch (error) {
            console.error("Upload Failed:", error);
            Alert.alert(
                'Erreur',
                'Une erreur s’est produite lors de la sélection des documents. Veuillez réessayer.',
                [{ text: 'OK' }]
            );

        } finally {
            setLoading(false);
        }
    };
    const pickAndUploadImages = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission Required',
                    'AlloMotors needs access to your media library to upload vehicle documents and images.',
                    [{ text: 'OK', onPress: () => console.log('Permission denied') }]
                );
                return;
            }
            // if (!permissionResult.granted) {
            //     console.warn("Permission denied");
            //     return;
            // }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All, // Supports both images and files
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (result.canceled || !result.assets.length) {
                console.warn("No file selected");
                return;
            }

            setLoading(true);

            const uploadedAttachments = await Promise.all(
                result.assets.map(async (file) => {
                    return await uploadFile(file.uri, "UF", user?.Token ?? "");
                })
            );

            console.log(uploadedAttachments);
            setAttributes((prev: any) => ({
                ...prev,
                Attachments: [...prev.Attachments, ...uploadedAttachments],
            }));
        } catch (error) {
            console.error("Upload Failed:", error);
        } finally {
            setLoading(false);
        }
    };
    const renderMessageImages = (images: any) => (
        <ChatAttachments attachments={images} />
    );
    const AdClickCard = React.memo(({ item }: { item: any }) => {
        //if (item.MsgType !== 'AdClick' || !item?.AdvertAttributes?.ItemGuid) return null;
        return (
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                    <Image resizeMode='cover'
                        source={{ uri: item?.images[0]?.url }}
                        style={{ width: 70, height: 70, borderRadius: 8, marginRight: 10, marginTop: 10 }}
                        defaultSource={{ uri: 'https://cdn.pixabay.com/photo/2013/07/13/11/50/car-158795_640.png' }} // Replace with a valid fallback image URL
                    />
                    <View >
                        <TouchableOpacity
                            onPress={() => {
                                router.push({
                                    pathname: "/pages/advert-detail", params: {
                                        id: item?.ItemGuid
                                    }
                                })
                            }} >
                            <Text lineBreakMode='clip' numberOfLines={1} style={{ fontWeight: '600', fontSize: 16, marginBottom: 2, color: Colors[colorScheme ?? 'light'].danger }}>
                                {item?.carTitle}
                            </Text>
                            <Text style={{ fontSize: 14, color: 'gray' }}>{item?.category}</Text>
                            <Text style={{ fontSize: 11, color: 'gray' }}>{item?.sellerTitle}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    });
    const RenderMessage = React.memo((props: any) => {
        const { currentMessage } = props;
        if (currentMessage.MsgType === 'AdClick' || currentMessage.ItemGuid) {
            currentMessage.Title = currentMessage.text;
            return (
                <>
                    {(currentMessage.MsgType === 'AdClick' || currentMessage.ItemGuid) ? <AdClickCard item={currentMessage} /> : null}
                </>
            );
        }
        else {
            return (
                <>
                    {currentMessage?.images && currentMessage?.images.length > 0 ? (
                        <View style={{ height: 'auto', flexDirection: 'column' }}>
                            <ChatAttachments attachments={currentMessage?.images} />
                        </View>
                    )
                        : null
                    }
                </>
            );
        }
        return null;
    });
    const SystemMessage = React.memo((props: any) => {
        return (
            <View style={{ height: 'auto', flexDirection: 'column' }}>
                <ThemedText type='default' lightColor={Colors[colorScheme ?? "light"].light} style={{ textAlign: 'center', fontSize: FONT_SIZES.md, fontWeight: 'bold' }}>You have not started chat with this contact.</ThemedText>
            </View>
        );
    });
    const DeleteFile = async (index: number) => {
        setAttributes((prev) => ({
            ...prev,
            Attachments: prev.Attachments.filter((_, i) => i !== index),
        }));
    };
    const sendMyMessage = async () => {
        if (!text.trim() && Attri.Attachments.length === 0) return;
        console.log("Car ItemGuid", ItemGuid);
        try {
            const files = Attri.Attachments.map(att => ({
                FileName: att.FileName,
                OnlineAddress: att.OnlineAddress,
                FileType: att.FileType
            })) || [];

            const messageData = {
                Id: 0,
                SenderId: currentUser?.UserId,
                ReceiverId: searchObj?.withUserId,
                Message: text || " ",
                Status: "Unread",
                MessageDate: new Date().toISOString(),
                QRCode: ItemGuid ? ItemGuid : "",
                Attributes: JSON.stringify({ Attachments: files }),
            };

            const response = await apiCall('POST', `/Account/SendChatMessage`, new vmSearchObj(), messageData);
            // if (response.ok) {
            //     setText("");
            //     setAttributes({ Attachments: [] });
            //     Keyboard.dismiss();
            // }
            //console.log(response);
            if (response.status === 200 || response.statusText === 'Ok') {
                setText("");
                setAttributes({ Attachments: [] });
                Keyboard.dismiss();
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            Alert.alert("Erreur", "Échec de l'envoi du message. Veuillez réessayer.");
        }
    };

    if (loading) {
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
        <View style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={[styles.flexOne]}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={{ flex: 1, paddingBottom: keyboardOpen ? insets.top + 20 : 20 }}>
                        <GiftedChat
                            bottomOffset={insets.bottom}
                            messages={messages.slice().reverse()}
                            inverted={true}
                            onSend={(messages: any) => { sendMyMessage() }}
                            user={{
                                _id: currentUser?.UserId || Date.now(),
                            }}
                            text={text} // Bind text state explicitly
                            onInputTextChanged={(text) => setText(text)}
                            renderLoadEarlier={(props) => {
                                return (
                                    <View style={[styles.justifyCenter, styles.itemCenter]}>
                                        <TouchableOpacity onPress={() => { GetChatMessages() }} style={[styles.primary, styles.roundedCircle, styles.justifyCenter, styles.itemCenter, { marginTop: 10, paddingHorizontal: loading ? 5 : 10, paddingVertical: 5 }]}>
                                            {loading ? <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].white} /> : <ThemedText type='default' lightColor={Colors[colorScheme ?? 'light'].white}>Charger plus tôt</ThemedText>}
                                        </TouchableOpacity>
                                    </View>
                                )
                            }}
                            loadEarlier={loadEarlier}
                            onLoadEarlier={GetChatMessages}
                            isLoadingEarlier={loading}
                            renderBubble={(props) => {
                                return <Bubble {...props}
                                    textStyle={{
                                        left: {
                                            color: Colors[colorScheme ?? 'light'].text,
                                        },
                                        right: {
                                            color: Colors[colorScheme ?? 'light'].white,
                                        }
                                    }}
                                    wrapperStyle={{
                                        left: {
                                            backgroundColor: Colors[colorScheme ?? 'light'].card,
                                        },
                                        right: {
                                            backgroundColor: Colors[colorScheme ?? 'light'].primary,
                                        }
                                    }} />
                            }}
                            alwaysShowSend
                            
                            maxComposerHeight={150}
                            showAvatarForEveryMessage={true}
                            placeholder='Tapez un message...'
                            renderSend={(props) => {
                                return <View style={{
                                    flexDirection: 'row', height: 60, alignItems: 'center',
                                    justifyContent: 'center', gap: 0, paddingHorizontal: 5,
                                }} >
                                    {shouldShowSendButton && (
                                        <TouchableOpacity style={[styles.primary, styles.roundedCircle, styles.justifyCenter, styles.itemCenter,
                                        { height: 55, width: 55, borderWidth: 0 }]}
                                            onPress={() => { sendMyMessage() }}
                                            disabled={loading}>
                                            {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].white} />) : (
                                                <Ionicons name="send" size={25} color={Colors[colorScheme ?? 'light'].white} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            }}
                            renderInputToolbar={(props) => (
                                <View className='' style={[]}>
                                    {Attri && Attri?.Attachments && Attri?.Attachments?.length > 0 &&
                                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={[styles.primary, { width: '100%', height: 125 }]} >
                                            <View style={[styles.primary, { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 10, paddingHorizontal: 10 }]}>
                                                {Attri?.Attachments.map((item: any, index: any) => (
                                                    <View style={[styles.relativePosition]} key={index}>
                                                        {item?.FileType != 'image' ?
                                                            (
                                                                <View style={[styles.danger, styles.justifyCenter, styles.itemCenter, { width: 100, height: 100, margin: 5, borderRadius: 10 }]}>
                                                                    <Ionicons name="document-outline" size={90} color={Colors[colorScheme ?? 'light'].white} />
                                                                </View>
                                                            ) : <Image key={index}
                                                                source={{ uri: "https://api.allomotors.fr/Content/WebData/UF/" + item.FileName }}
                                                                style={{ width: 100, height: 100, margin: 5, borderRadius: 10 }}
                                                                resizeMode="cover"
                                                            />
                                                        }

                                                        <TouchableOpacity onPress={() => DeleteFile(index)} style={[styles.white, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                                            <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].danger} />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    }
                                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                                        <InputToolbar {...props}
                                            containerStyle={{ padding: 5, backgroundColor: 'transparent', borderTopWidth: 0, paddingBottom: 3, marginBottom: 0 }}
                                            renderActions={() => (
                                                <TouchableOpacity onPress={pickAndUploadDocuments}>
                                                    <View style={{
                                                        height: 55, width: 30, justifyContent: 'center',
                                                        alignItems: 'center', left: 3, marginHorizontal: 0,
                                                    }}>
                                                        <Feather name="paperclip" size={25} color={Colors[colorScheme ?? 'light'].text} />
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </TouchableWithoutFeedback>
                                </View>
                            )}
                            textInputProps={{
                                ...styles.composer  as any
                            }}
                            renderCustomView={(props) => (
                                <RenderMessage {...props} />
                            )}
                            renderSystemMessage={(props) => (
                                <SystemMessage {...props} />
                            )}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>


        // <KeyboardAvoidingView
        //     style={[styles.flexOne, { paddingBottom: insets.bottom, paddingTop: 0 }]}
        //     behavior={divicePlatform === 'ios' ? 'padding' : undefined}
        //     keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0} >

        //     <GiftedChat 
        //         messages={messages.slice().reverse()}
        //         inverted={true}
        //         onSend={(messages: any) => { sendMyMessage() }}
        //         user={{
        //             _id: currentUser?.UserId || Date.now(),
        //         }}
        //         text={text} // Bind text state explicitly
        //         onInputTextChanged={(text) => setText(text)}
        //         renderLoadEarlier={(props) => {
        //             return (
        //                 <View style={[styles.justifyCenter, styles.itemCenter]}>
        //                     <TouchableOpacity onPress={() => { GetChatMessages() }} style={[styles.primary, styles.roundedCircle, styles.justifyCenter, styles.itemCenter, { marginTop: 10, paddingHorizontal: loading ? 5 : 10, paddingVertical: 5 }]}>
        //                         {loading ? <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].white} /> : <ThemedText type='default' lightColor={Colors[colorScheme ?? 'light'].white}>Charger plus tôt</ThemedText>}
        //                     </TouchableOpacity>
        //                 </View>
        //             )
        //         }}
        //         loadEarlier={loadEarlier}
        //         onLoadEarlier={GetChatMessages}
        //         isLoadingEarlier={loading}
        //         renderBubble={(props) => {
        //             return <Bubble {...props}
        //                 textStyle={{
        //                     left: {
        //                         color: Colors[colorScheme ?? 'light'].text,
        //                     },
        //                     right: {
        //                         color: Colors[colorScheme ?? 'light'].white,
        //                     }
        //                 }}
        //                 wrapperStyle={{
        //                     left: {
        //                         backgroundColor: Colors[colorScheme ?? 'light'].card,
        //                     },
        //                     right: {
        //                         backgroundColor: Colors[colorScheme ?? 'light'].primary,
        //                     }
        //                 }} />
        //         }}
        //         alwaysShowSend
        //         bottomOffset={insets.bottom}
        //         maxComposerHeight={150}
        //         showAvatarForEveryMessage={true}
        //         placeholder='Tapez un message...'
        //         renderSend={(props) => {
        //             return <View style={{
        //                 flexDirection: 'row', height: 60, alignItems: 'center',
        //                 justifyContent: 'center', gap: 0, paddingHorizontal: 5,
        //             }} >
        //                 {shouldShowSendButton && (
        //                     <TouchableOpacity style={[styles.primary, styles.roundedCircle, styles.justifyCenter, styles.itemCenter,
        //                     { height: 55, width: 55, borderWidth: 0 }]}
        //                         onPress={() => { sendMyMessage() }}
        //                         disabled={loading}>
        //                         {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].white} />) : (
        //                             <Ionicons name="send" size={25} color={Colors[colorScheme ?? 'light'].white} />
        //                         )}
        //                     </TouchableOpacity>
        //                 )}
        //             </View>
        //         }}
        //         renderInputToolbar={(props) => (
        //             <View className='' style={[]}>
        //                 {Attri && Attri?.Attachments && Attri?.Attachments?.length > 0 &&
        //                     <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={[styles.primary, { width: '100%', height: 125 }]} >
        //                         <View style={[styles.primary, { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 10, paddingHorizontal: 10 }]}>
        //                             {Attri?.Attachments.map((item: any, index: any) => (
        //                                 <View style={[styles.relativePosition]} key={index}>
        //                                     {item?.FileType != 'image' ?
        //                                         (
        //                                             <View style={[styles.danger, styles.justifyCenter, styles.itemCenter, { width: 100, height: 100, margin: 5, borderRadius: 10 }]}>
        //                                                 <Ionicons name="document-outline" size={90} color={Colors[colorScheme ?? 'light'].white} />
        //                                             </View>
        //                                         ) : <Image key={index}
        //                                             source={{ uri: "https://api.allomotors.fr/Content/WebData/UF/" + item.FileName }}
        //                                             style={{ width: 100, height: 100, margin: 5, borderRadius: 10 }}
        //                                             resizeMode="cover"
        //                                         />
        //                                     }

        //                                     <TouchableOpacity onPress={() => DeleteFile(index)} style={[styles.white, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
        //                                         <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].danger} />
        //                                     </TouchableOpacity>
        //                                 </View>
        //                             ))}
        //                         </View>
        //                     </ScrollView>
        //                 }
        //                 <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        //                 <InputToolbar {...props}
        //                     containerStyle={{ padding: 5, backgroundColor: 'transparent', borderTopWidth: 0, paddingBottom: 3, marginBottom: 0 }}
        //                     renderActions={() => (
        //                         <TouchableOpacity onPress={pickAndUploadDocuments}>
        //                             <View style={{
        //                                 height: 55, width: 30, justifyContent: 'center',
        //                                 alignItems: 'center', left: 3, marginHorizontal: 0,
        //                             }}>
        //                                 <Feather name="paperclip" size={25} color={Colors[colorScheme ?? 'light'].text} />
        //                             </View>
        //                         </TouchableOpacity>
        //                     )}
        //                 />
        //                 </TouchableWithoutFeedback>
        //             </View>
        //         )}
        //         textInputProps={{
        //             ...styles.composer
        //         }}
        //         renderCustomView={(props) => (
        //             <RenderMessage {...props} />
        //         )}
        //         renderSystemMessage={(props) => (
        //             <SystemMessage {...props} />
        //         )}
        //     />
        //  </KeyboardAvoidingView> 
    );
};
export default ChatScreen;
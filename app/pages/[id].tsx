import { View, Text, useColorScheme, Image, TouchableOpacity, KeyboardAvoidingView, Alert, ScrollView, Platform, ActivityIndicator, Keyboard } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalStyles } from '../_styles/globalStyle';
import { useLocalSearchParams, useSearchParams } from 'expo-router/build/hooks';
import { vmSearchObj } from '../_models/vmSearch';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useSession } from '../_services/ctx';
import { Bubble, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { apiCall } from '../_services/api';
import * as SignalR from '@microsoft/signalr';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../_services/uploadService';
// import Video from 'react-native-video';
import * as FileSystem from 'expo-file-system';
import ChatAttachments from '@/components/ChatCustomMsg';
import { ResizeMode, Video } from 'expo-av';
import { TextInput } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { formatMessages, formatSingleMessage } from '../_services/handleChatMessages';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

interface IMessageWithImages extends IMessage {
    images: any;
    MsgType: any;
    carTitle: any;
    category: any;
    itemGuid: any;
}

interface Message {
    _id: number;
    text: string;
    createdAt: Date;
    image?: string; // Optional image property
    images?: any; // New images property
    attachments: any;
    MsgType: any;
    carTitle: any;
    category: any;
    itemGuid: any;
    user: {
        _id: number;
        name: string;
        avatar: string;
    };
}
interface MessageItem {
    ID: number;
    Message: string;
    MessageDate: string;
    ReceiverID: string;
    SenderID: string;
    Status: "Read" | "Unread" | string; // If status can have more values, update accordingly
    MsgType: any;
    Attributes: any; // Assuming it's a JSON string; parse if needed
    Email: string;
    FirstName: string;
    LastName: string;
    FirstName_Rec: string;
    LastName_Rec: string;
    UserType: string;
    SenderAttributes: string; // Assuming it's a JSON string; parse if needed
    FullPath: any;
    Category: any;
}
const ChatScreen = () => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { styles, FONT_SIZES, } = useGlobalStyles();
    const navigation = useNavigation();
    const { user } = useSession();
    const UserId = useSearchParams().get("id");
    // const dataObj = params.get("data");
    const [parsedUser, setParsedUser] = useState<any>({});    //dataObj ? JSON.parse(dataObj) : {};
    const searchObj = new vmSearchObj();
    searchObj.withUserId = UserId || "";
    const currentUser = user;
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [text, setText] = useState('');
    const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);
    const { session } = useSession();
    const [Attri, setAttributes] = useState<{ Attachments: any[] }>({ Attachments: [] });
    const [isRecording, setIsRecording] = useState(false);
    const [shouldShowSendButton, setShouldShowSendButton] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadEarlier, setLoadEarlier] = useState(true);
    const [loading, setLoading] = useState(false);
    const goBack = () => {
        Keyboard.dismiss();
        navigation.goBack();
    }

    const SOUND_URL = 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3';

    useEffect(() => {
        let isMounted = true;
        const soundObject = new Audio.Sound();

        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    //interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                    shouldDuckAndroid: true,
                    //interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
                    playThroughEarpieceAndroid: false,
                });

                await soundObject.loadAsync(require('../../assets/sounds/message-sound.mp3'),
                    { shouldPlay: false });
                // await soundObject.loadAsync(
                //     { uri: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3' },
                //     { shouldPlay: false }
                // );

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

    // SignalR connection and message handling
    useEffect(() => {
        if (!session?.token) return;

        const newConnection = new SignalR.HubConnectionBuilder()
            .withUrl("https://api.allomotors.fr/realtimeHub", {
                accessTokenFactory: () => session?.token ?? "",
                transport: SignalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .configureLogging(SignalR.LogLevel.Information)
            .build();


        const handleNewMessage = async (dataObj: string) => {

            try {
                const rawMessage = dataObj ? JSON.parse(dataObj) : {};
                console.log(rawMessage);
                const newMessage = formatSingleMessage(rawMessage, {
                    apiBaseUrl: "https://api.allomotors.fr/Content/WebData/UF",
                    assetsBaseUrl: "http://allomotors.fr/Content/WebData/UF",
                    currentUserId: user?.UserId
                });

                if (sound && rawMessage?.SenderID !== currentUser?.UserId) {
                    try {
                        await sound.replayAsync();
                    } catch (playError) {
                        console.log('Sound play error:', playError);
                    }
                }
                console.log("newMessage", newMessage);
                setMessages((prevMessages) => GiftedChat.prepend(prevMessages, [newMessage]));
                //return newMessage;
            } catch (error) {
                console.log('Message parsing error:', error);
                //return null;
            }
        };
        //newConnection.on("ReceiveMessage", handleNewMessage);

        newConnection.on("ReceiveMessage", (dataObj) => {
            //console.log("Received message function:", "running");
            console.log("Received message Object:", dataObj);
            handleNewMessage(dataObj);
            UpdateMsgStatus({ Id: dataObj.Id, Status: "Read" });
        });


        newConnection.onclose(async (error) => {
            console.log('Connection closed:', error);
            setTimeout(async () => {
                try {
                    await newConnection.start();
                    console.log('Reconnected successfully');
                } catch (err) {
                    console.error("Reconnect failed:", err);
                }
            }, 5000);
        });

        const startConnection = async () => {
            try {
                await newConnection.start();
                console.log("SignalR connection established");
            } catch (error) {
                console.log("Connection failed:", error);
            }
        };

        startConnection();
        setConnection(newConnection);

        return () => {
            //newConnection.off("ReceiveMessage", handleNewMessage);
            newConnection.stop().catch(e => console.log('Connection stop error:', e));
        };
    }, [session?.token, sound]);

  

    const UpdateMsgStatus = async (obj: { Id: any, Status: string }) => {
        try {
            const response = await apiCall('post', `/Account/UpdateMsgStatus/`, new vmSearchObj(), obj);
            console.log(response.data);
            Alert.alert("UpdateMsgStatus, Function working perfectly.");
            // if (response.status === 200 || response.statusText === 'Ok') {
            // }
            // else
            // {
            // }
        }
        catch (error: any) {
            console.log(error);
            console.log("Update Msg Status Erorr");
        }


    }

    const GetChatMessages = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            searchObj.UserId = UserId || "";
            searchObj.pageIndex = page;
            console.log("UserId", searchObj.UserId);
            console.log("pageIndex", searchObj.pageIndex);
            //new vmSearchObj()
            const response = await apiCall('post', `/Account/GetChat2/`, searchObj, searchObj);

            // console.log(response.data);
            if (response.status === 200 || response.statusText === 'Ok') {
                //const formattedMessages = FormatChatMessages(response.data?.pureChat);
                let messagesToFormat = [];

                // Handle different response formats
                // if (typeof response.data?.pureChat === 'string') {
                //     console.log("parsing string")
                //     messagesToFormat = JSON.parse(response.data.pureChat);
                // } else if (Array.isArray(response.data?.pureChat)) {
                //     console.log("Array ==?")
                //     messagesToFormat = response.data.pureChat;
                // } else if (response.data?.pureChat) {
                //     console.log("Object ==?")
                //     messagesToFormat = [response.data.pureChat];
                // }

                messagesToFormat = response.data.pureChat;

                // Format the messages
                const formattedMessages: any = formatMessages(messagesToFormat, {
                    apiBaseUrl: "https://api.allomotors.fr/Content/WebData/UF",
                    assetsBaseUrl: "http://allomotors.fr/Content/WebData/UF",
                    currentUserId: user?.UserId
                });


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
                Alert.alert("Oops, something went wrong!");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (UserId) {
                GetChatMessages();
            }
        }, [UserId])
    );
    useEffect(() => {
        setShouldShowSendButton(text.trim().length > 0 || Attri.Attachments.length > 0);
    }, [text, Attri.Attachments]);
    const pickAndUploadImages = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                console.warn("Permission denied");
                return;
            }

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
                    return await uploadFile(file.uri, "UF", session?.token ?? "");
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

        // <ChatCustomMsgImgs images={images.filter((img: any) => img.FileType === "image")} documents={images.filter((img: any) => img.FileType != "image")} />
        <ChatAttachments attachments={images} />
    );
    const AdClickCard = ({ item }: { item: any }) => {
        if (item.MsgType !== 'AdClick') return null;
        return (
            <View>
                {/* <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 2, paddingHorizontal: 10, paddingVertical: 5 }}>
                    {item?.Title}
                </Text> */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                    <Image resizeMode='cover'
                        source={{ uri: item?.images[0]?.url }}
                        style={{ width: 70, height: 70, borderRadius: 8, marginRight: 10, marginTop: 10 }}
                        defaultSource={{ uri: 'https://cdn.pixabay.com/photo/2013/07/13/11/50/car-158795_640.png' }} // Replace with a valid fallback image URL
                    />
                    <View >
                        <TouchableOpacity
                            onPress={() => { }} >
                            <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 2, color: Colors[colorScheme ?? 'light'].danger }}>
                                {item?.carTitle}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('#')}>
                            <Text style={{ fontSize: 14, color: 'gray' }}>{item?.category}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };
    const RenderMessage = (props: any) => {
        const { currentMessage } = props;
        //let item = currentMessage;

        if (currentMessage.MsgType === 'AdClick') {
            currentMessage.Title = currentMessage.text;
            //currentMessage.text = null;
            return (
                <>
                    {currentMessage.MsgType === 'AdClick' && <AdClickCard item={currentMessage} />}
                </>
            );
        }
        else {
            return (
                <View style={{ height: 'auto', flexDirection: 'column' }}>
                    {currentMessage?.images ? renderMessageImages(currentMessage?.images) : null}
                </View>
            );
        }

    };
    const SystemMessage = (props: any) => {
        const { currentMessage } = props;
        return (
            <View style={{ height: 'auto', flexDirection: 'column' }}>
                <ThemedText type='default' lightColor={Colors[colorScheme ?? "light"].light} style={{ textAlign: 'center', fontSize: FONT_SIZES.md, fontWeight: 'bold' }}>You have not started chat with this contact.</ThemedText>
            </View>
        );
    }
    const DeleteFile = async (data: any, index: number) => {
        setAttributes((prev) => ({
            ...prev,
            Attachments: prev.Attachments.filter((_, i) => i !== index),
        }));
    };
    const sendMyMessage = async () => {
        //if (!text.trim() && Attri.Attachments.length === 0) return;
        console.log("Send Button Pressed!");
        const files = Attri?.Attachments?.map(att => ({
            FileName: att.FileName,
            OnlineAddress: att.OnlineAddress,
            FileType: att?.FileType
        })) || [];
        const msgAttributes = JSON.stringify({ Attachments: files });
        const messageData = {
            Id: 0,
            SenderId: currentUser?.UserId,
            ReceiverId: searchObj?.withUserId || Date.now().toString(),
            Message: text || " ",
            Status: "Unread",
            MessageDate: new Date().toISOString(),
            QRCode: "",
            Attributes: msgAttributes,
        };
        const response = await apiCall('POST', `/Account/SendChatMessage`, new vmSearchObj(), messageData);
        if (response.status === 200 || response.statusText === 'Ok') {
            setText("");
            setAttributes({ Attachments: [] });
            Keyboard.dismiss();
        }
    };
    return (
        <View style={{ flex: 1, marginTop: insets.top, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
            <View style={[styles.primary, { flexDirection: 'row', gap: 2, alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, }]}>
                <View>
                    <TouchableOpacity onPress={() => { goBack() }}>
                        <Ionicons name="chevron-back" size={30} color={Colors[colorScheme ?? 'light'].white} />
                    </TouchableOpacity>
                </View>
                <View style={[styles.avatarContainer, { marginRight: 10 }]}>
                    {parsedUser?.PhotoURL ? (
                        <Image
                            source={{ uri: `https://allomotors.fr/Content/WebData/UF/${parsedUser?.PhotoURL}` }}
                            style={[styles.avatarImg]}
                            resizeMode="contain"
                        />
                    ) : <Image
                        source={require('../../assets/img/avatar.png')}
                        style={[styles.avatarImg]}
                        resizeMode="contain"
                    />}
                    <View style={styles.indicatorOnline} />
                </View>
                <View style={[{ flexDirection: 'column', flex: 1 }]}>
                    <ThemedText type='subtitle' lightColor={Colors[colorScheme ?? 'light'].white} style={[{ fontSize: FONT_SIZES.md, fontWeight: 'bold' }]}>{parsedUser?.FirstName} {parsedUser?.LastName}</ThemedText>
                    <ThemedText type='default' lightColor={Colors[colorScheme ?? 'light'].light} ellipsizeMode='tail'
                        style={[{ lineHeight: 20, fontSize: FONT_SIZES.sm }]}>
                        {parsedUser?.UserType}
                    </ThemedText>
                </View>
            </View>
            <GiftedChat
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
                            right: {
                                color: Colors[colorScheme ?? 'light'].white,
                            }
                        }}
                        wrapperStyle={{
                            left: {
                                backgroundColor: Colors[colorScheme ?? 'light'].lighter,
                            },
                            right: {
                                backgroundColor: Colors[colorScheme ?? 'light'].primary,
                            }
                        }} />
                }}
                alwaysShowSend
                bottomOffset={insets.bottom}
                maxComposerHeight={100}
                placeholder='Tapez un message...'
                renderSend={(props) => {
                    return <View style={{
                        flexDirection: 'row', height: 44, alignItems: 'center',
                        justifyContent: 'center', gap: 14, paddingHorizontal: 14
                    }} >

                        {shouldShowSendButton && (
                            <TouchableOpacity style={[styles.primary, styles.roundedCircle, styles.justifyCenter, styles.itemCenter, { padding: 10 }]}
                                onPress={() => { sendMyMessage() }}
                                disabled={loading}>
                                {loading ? (<ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].white} />) : (
                                    <Feather name="send" size={20} color={Colors[colorScheme ?? 'light'].white} />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                }}
                renderInputToolbar={(props) => (
                    <View >
                        {Attri && Attri?.Attachments && Attri?.Attachments?.length > 0 &&
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={[styles.primary, { width: '100%', height: 125 }]} >
                                <View style={[styles.primary, { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 10, paddingHorizontal: 10 }]}>
                                    {Attri?.Attachments.map((item: any, index: any) => (
                                        <View style={[styles.relativePosition]} key={index}>
                                            <Image key={index}
                                                source={{ uri: "https://api.allomotors.fr/Content/WebData/UF/" + item.FileName }}
                                                style={{ width: 100, height: 100, margin: 5, borderRadius: 10 }}
                                                resizeMode="cover"
                                            />
                                            <TouchableOpacity onPress={() => DeleteFile(item, index)} style={[styles.white, styles.absolutePosition, { borderRadius: 8, top: 10, right: 10, padding: 5, zIndex: 10 }]}>
                                                <Ionicons name="trash-outline" size={18} color={Colors[colorScheme ?? 'light'].danger} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        }
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <InputToolbar {...props}
                                containerStyle={{ padding: 2 }}
                                renderActions={() => (
                                    <TouchableOpacity onPress={pickAndUploadImages}>
                                        <View style={{
                                            height: 44, justifyContent: 'center',
                                            alignItems: 'center', left: 8, marginHorizontal: 5,
                                        }}>
                                            <Feather name="paperclip" size={22} color={Colors[colorScheme ?? 'light'].text} />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                )}
                textInputProps={{
                    ...styles.composer as any,
                }}
                renderCustomView={(props) => (
                    <RenderMessage {...props} />
                )}
                renderSystemMessage={(props) => (
                    <SystemMessage {...props} />
                )}
            />
        </View>
    )
}
export default ChatScreen
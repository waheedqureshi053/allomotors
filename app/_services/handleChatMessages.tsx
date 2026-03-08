import { Alert } from "react-native";
import { IMessage } from "react-native-gifted-chat";
import { apiCall } from "./api";
import ChatService from "./chatservice";

interface MessageFormatOptions {
    apiBaseUrl?: string;
    assetsBaseUrl?: string;
    currentUserId?: string | number;
    playSound?: () => Promise<void>;
}

const UpdateMsgStatus = async (obj: { Id: any, Status: string }) => {
    try {
        const response = await apiCall('post', `/Account/UpdateMsgStatus/`, null, obj);
    }
    catch (error: any) {
        //console.log(error);
        //console.log("Update Msg Status Erorr in handleChatMessages");
    }
}

export function formatSingleMessage(
    rawMessage: any,
    options: MessageFormatOptions = {}
): IMessage {
    // Set default URLs if not provided
    const apiBaseUrl = options.apiBaseUrl || "https://api.allomotors.fr/Content/WebData/UF";
    const assetsBaseUrl = options.assetsBaseUrl || "https://allomotors.fr/Content/WebData/UF";
    if (rawMessage.Status != "Read" && rawMessage?.ReceiverId === options.currentUserId) {
        try {

            UpdateMsgStatus({ Id: rawMessage?.ID, Status: "Read" });
        }
        catch (error) {

        }

    }


    const safeParse = (jsonString: string | undefined, fallback: any = {}) => {
        if (!jsonString) return jsonString;
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            return jsonString;
        }
    };

    // Parse message attributes
    const attributes =  safeParse(rawMessage?.Attributes);
    //console.log("rawMessage attributes:", attributes?.Attributes);
    const senderAttributes = safeParse(rawMessage?.SenderAttributes);
    // console.log("✅ Sender Attributes:", senderAttributes);
    const advertCarAttributes = safeParse(attributes?.Attributes);

    if(attributes?.ItemGuid)
    {
        rawMessage.MsgType = "AdClick";
    }
     
    // const pictures = attributes?.Attachments.filter((file : any) => file.FileType === "image");
    // const videos = attributes?.Attachments.filter((file : any) => file.FileType === "video");
    // const documents = attributes?.Attachments.filter((file : any) => file.FileType === "document");

    // Format attachments
    const formatAttachment = (attachment: any) => ({
        url: attachment?.FileName == "image" ? `${apiBaseUrl}/thumb_${attachment?.FileName}` : `${assetsBaseUrl}/${attachment?.FileName}`,
        FileType: attachment?.FileType || "other",
        name: attachment?.FileName || "",
        size: attachment?.FileSize || "",
    });

    //console.log("advertCarAttributes?.IconURL:", advertCarAttributes?.IconURL);
    const images = Array.isArray(attributes?.Attachments)
        ? attributes.Attachments.map(formatAttachment)
        : rawMessage.MsgType === "AdClick" && advertCarAttributes?.IconURL
            ? [{
                url: `${assetsBaseUrl}/thumb_${advertCarAttributes?.IconURL}`,
                FileType: "image",
                name: "Ad Image",
                size: "",
            }]
            : [];

    // Format user information
    const firstName = rawMessage?.FirstName || rawMessage.Sender?.FirstName;
    const lastName = rawMessage?.LastName || rawMessage.Sender?.LastName;
    const user = {
        _id: rawMessage.SenderID?.toString() || "unknown",
        name: `${firstName || ""} ${lastName || ""}`.trim() || "Unknown User",
        avatar: senderAttributes?.PhotoURL
            ? `${assetsBaseUrl}/${senderAttributes?.PhotoURL}`
            : '',
    };

    // // Base message structure
    const baseMessage = {
        _id: rawMessage.ID?.toString() || Date.now().toString(),
        text: (rawMessage?.Message || "").replace(/<\/?[^>]+(>|$)/g, ""),
        createdAt: rawMessage?.MessageDate
            ? new Date(rawMessage.MessageDate)
            : new Date(),
        images,
        user,
        MsgType: rawMessage.MsgType || "",
        category: advertCarAttributes?.num_plaque || "",
        ItemGuid: attributes?.ItemGuid || "",
        carTitle: attributes?.Title || "",
        sellerTitle : attributes?.SellerTitle || "",
    };

    //console.log("✅ baseMessage:", baseMessage);

    return baseMessage;
}

// Unified function that handles both single messages and arrays
export function formatMessages(
    input: any[] | any,
    options: MessageFormatOptions = {}
): IMessage | IMessage[] {
    if (Array.isArray(input)) {
        return input.map(item => formatSingleMessage(item, options));
    }
    return formatSingleMessage(input, options);
}

// Updated handleNewMessage using the unified formatter

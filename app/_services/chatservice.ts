import { apiCall } from "./api";

 

class ChatService {
    private static TempAdverts: any[] = [];
    private static ChatApi_SiteAddress: string = 'YOUR_API_BASE_URL'; // Replace with your actual API base URL

    static mapMessage(msg: any, obj: any): void {
        
        msg.Attributes = {
            ...obj,
            Attributes: obj.Attributes ? JSON.parse(obj.Attributes) : {}
        };
        
        msg.SellerID = obj.SellerID;

        if (obj.SellerTitle) msg.SellerTitle = obj.SellerTitle;
        if (obj.SellerFirstName) msg.SellerFirstName = obj.SellerFirstName;
        if (obj.SellerLastName) msg.SellerLastName = obj.SellerLastName;
        ////console.log("✅ Mapped Message", msg);
    }

    static async getAdvertAttributes(list: any[], currentIndex: number): Promise<void> {
        ////console.log("getAdvertAttributes list", list);
        if (!list || currentIndex >= list.length) {
            ////console.log("✅ All done");
            return;
        }

        const msg = list[currentIndex];
        
        // If not first and current QRCode is same as previous
        if (currentIndex > 0 && list[currentIndex].QRCode === list[currentIndex - 1].QRCode) {
            msg.Repeated = true;
        }

        // Skip if QRCode missing or already loaded or NA
        if (!msg.QRCode || (msg.Attributes && msg.Attributes !== "{}" && msg.Attributes != '{"Attachments":[]}') || (msg.ChatAttributes?.ID)) {
            //console.log("❌ Skipping", msg.ID);
            await this.getAdvertAttributes(list, currentIndex + 1);
            return;
        }
        ////console.log("GetAdvertAttributes for", msg.ID);
        // Check if already cached
        const item = this.TempAdverts.find(s => s.ItemGuid === msg.QRCode);
        ////console.log("✅ item from cache", item);
        if (item) {
            //console.log("✅ Found in cache", msg.ID);
            this.mapMessage(msg, item);
            msg.MsgType = 'AdClick'; 
            await this.getAdvertAttributes(list, currentIndex + 1);
            
        } else {
            try {
                // Make API call
                const response = await apiCall('POST', `/Account/GetAdvertAttributes/${msg.QRCode}`, null, null);
                const jData = response.data;
                ////console.log("✅ GetAdvertAttributes Chat Response:", jData);
                if (jData.statusCode === 1) {
                    this.TempAdverts.push(jData.obj);
                    this.mapMessage(msg, jData.obj);
                    msg.MsgType = 'AdClick';
                    //console.log("✅ GetAdvertAttributes Request Success", msg.ID);
                } else {
                    console.warn("⚠ Not found for", msg.QRCode);
                }
            } catch (err) {
                console.error("❌ Request failed for", msg.QRCode, err);
            } finally {
                // Continue to next item
                await this.getAdvertAttributes(list, currentIndex + 1);
            }
        }
    }
}

export default ChatService;
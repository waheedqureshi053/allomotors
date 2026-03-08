import * as Mime from "mime";

const API_BASE_URL = "https://api.allomotors.fr/api";
const getMediaType = (mimeType: string): string => {
  if (mimeType.includes("image")) return "image";
  if (mimeType.includes("video")) return "video";
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("word")) return "document";
  return "other";
};

// Function to upload file
export const uploadFile = async (fileUri: string, path: string, token: string) => {
  try {
    const fileName = fileUri.split("/").pop() ?? "unknown_file";
    const fileType = Mime.getType(fileName) || "application/octet-stream"; // Get correct MIME type
    const mediaType = getMediaType(fileType); // Categorize file
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any);
    formData.append("path", path);
    const response = await fetch(`${API_BASE_URL}/Account/UploadFile`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.Error || "File upload failed.");
    }
    return {
      ...responseData, // Include API response (FileName, OnlineAddress, FullPath)
      FileType: mediaType, // Add FileType field
    };
  } catch (error: any) {
    console.error("Upload failed:", error.message);
    throw error;
  }
};







// const API_BASE_URL = "https://office.bottradepro.net/api";
// export const uploadFile = async (obj: { height: number; width: number; folder: string }, fileUri: string) => {
//   const formData = new FormData();
//   // Append parameters
//   formData.append('height', obj.height.toString());
//   formData.append('width', obj.width.toString());
//   formData.append('folder', obj.folder);
//   formData.append('file', fileUri)

//   const fileName : any = fileUri.split('/').pop();
//   formData.append('file', {
//     uri: fileUri, // Local file URI
//     name: fileName, // File name
//     type: 'image/jpeg', // MIME type
//   } as unknown as Blob);
//   // API call
//   const apiUrl = `${API_BASE_URL}/upload/UploadPhoto`;
//   const options = {
//     method: 'POST',
//     body: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data', // Let fetch handle it dynamically
//     },
//   };
//   try {
//     const result = await fetch(apiUrl, options);
//     console.log(result)
//     if (!result.ok) {
//       throw new Error(`Error uploading file: ${result.statusText}`);
//     }
//     return await result.json(); //.json(); // Assuming the response is JSON
//   } catch (error: any) {
//     console.error('Upload failed:', error.message);
//     throw error;
//   }
// };

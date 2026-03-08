import { getAuthToken } from './apiConfig';

const API_BASE_URL = "https://api.allomotors.fr/api";
//const API_BASE_URL = "https://demo2.allomotors.fr/api";

export const apiCall = async (
  method: string,
  url: string,
  params: any | null,
  data: any
) => {
  try {
    // Build query string if params exist
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const fullUrl = `${API_BASE_URL}${url}${queryString}`;
    // Prepare headers
    const headers: any = {
      "Accept": "*/*",
      'Content-Type': 'application/json',
    };
    // Get token from config and add to headers
    const token = await getAuthToken();
    //console.log("API Headers Token:", token);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: method !== 'GET' && data ? JSON.stringify(data) : undefined,
    });
    // Error handling for non-200 responses
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error(`API Error [${response.status}]:`, errorResponse);
      throw new Error(errorResponse.message || 'API call failed');
    }
    // Parse and return JSON response
    const result: any = {};
    result.status = 200;
    result.statusText = "Ok";
    try {
      result.data = await response.json();
    }
    catch (error: any) {
      console.error("Failed to parse JSON API response:", error);
      result.data = {};
    }
    return result;
  } catch (error) {
    console.error(`Error during API call to ${url}:`, error);
    throw error;
  }
};


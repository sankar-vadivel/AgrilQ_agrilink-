const API_BASE_URL = "http://localhost:5000/api";

export const getAuthToken = () => localStorage.getItem("agrilink_token");
export const setAuthToken = (token: string) => localStorage.setItem("agrilink_token", token);
export const removeAuthToken = () => localStorage.removeItem("agrilink_token");

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const apiCall = async (endpoint: string, options: FetchOptions = {}) => {
  const { requiresAuth = true, headers, ...restOptions } = options;

  const requestHeaders = new Headers(headers as HeadersInit);
  
  if (!requestHeaders.has('Content-Type') && !(restOptions.body instanceof FormData)) {
      requestHeaders.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    let errorMessage = "Something went wrong";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  // Some endpoints might not return JSON (like 204 No Content)
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    return null;
  }
};

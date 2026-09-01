import axios from "axios";

export const API_BASE_URL = "http://localhost:7070";

function getStoredAccessToken() {
  const tokenKeys = ["access_token", "token", "authToken", "jwt", "keycloakToken"];

  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  const authPayload = localStorage.getItem("auth");
  if (!authPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(authPayload);
    const token = parsed?.accessToken || parsed?.token;

    return typeof token === "string" && token.trim().length > 0
      ? token.trim()
      : null;
  } catch {
    return null;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export async function getBearerToken(keycloak) {
  if (!keycloak) {
    throw new Error("Authentication is not ready yet.");
  }

  await keycloak.updateToken(30);
  return keycloak.token;
}

apiClient.interceptors.request.use((config) => {
  const headers = config.headers || {};
  const hasAuthorization = Boolean(headers.Authorization || headers.authorization);
  const requestUrl = String(config.url || "");
  const isProductApiRequest =
    requestUrl === "/api/product" ||
    requestUrl.startsWith("/api/product/");

  if (!hasAuthorization && !isProductApiRequest) {
    const token = getStoredAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return {
    ...config,
    headers,
  };
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const fallbackMessage = "Request failed. Please try again.";
    const serverMessage = error?.response?.data;
    const message = typeof serverMessage === "string" && serverMessage.trim().length > 0
      ? serverMessage
      : (error.message || fallbackMessage);
    const wrappedError = new Error(message);

    wrappedError.status = error?.response?.status;
    wrappedError.statusText = error?.response?.statusText;

    return Promise.reject(wrappedError);
  }
);

export default apiClient;

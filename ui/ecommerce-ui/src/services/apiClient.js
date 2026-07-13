import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:7070",
  timeout: 10000,
});

export async function getBearerToken(keycloak) {
  if (!keycloak) {
    throw new Error("Authentication is not ready yet.");
  }

  await keycloak.updateToken(30);
  return keycloak.token;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const fallbackMessage = "Request failed. Please try again.";
    const serverMessage = error?.response?.data;

    if (typeof serverMessage === "string" && serverMessage.trim().length > 0) {
      return Promise.reject(new Error(serverMessage));
    }

    return Promise.reject(new Error(error.message || fallbackMessage));
  }
);

export default apiClient;


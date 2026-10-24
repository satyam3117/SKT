
import axios from "axios";
import keycloak from "../auth/keycloak";

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7070";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        Accept: "application/json",
    },
});

// Attach a Keycloak token when the user is authenticated.
apiClient.interceptors.request.use(
    async (config) => {
        if (!keycloak.authenticated) {
            return config;
        }

        try {
            await keycloak.updateToken(30);

            if (!keycloak.token) {
                throw new Error("No Keycloak access token available.");
            }

            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${keycloak.token}`;

            return config;
        } catch (error) {
            console.error("Keycloak token refresh failed:", error);

            const authError = new Error(
                "Your login session has expired. Please sign in again."
            );
            authError.status = 401;
            authError.original = error;

            return Promise.reject(authError);
        }
    },
    (error) => Promise.reject(error)
);

// Normalize errors without losing useful status and response details.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const body = error.response?.data;

        let message =
            body?.message ||
            body?.detail ||
            error.message ||
            "The request failed. Please try again.";

        if (Array.isArray(body?.fieldErrors) && body.fieldErrors.length) {
            message = body.fieldErrors
                .map((field) => `${field.field}: ${field.message}`)
                .join("\n");
        } else if (status === 400) {
            message = body?.message || "Invalid request.";
        } else if (status === 401) {
            message = "Your session has expired or authentication is required.";
        } else if (status === 403) {
            message = "You do not have permission to perform this operation.";
        } else if (status === 404) {
            message = "The requested resource was not found.";
        } else if (status >= 500) {
            message = body?.message || "The server encountered an unexpected error.";
        } else if (!error.response) {
            message =
                "Cannot connect to the API. Check the gateway URL and whether the gateway is running.";
        }

        const normalizedError = new Error(message);
        normalizedError.status = status;
        normalizedError.data = body;
        normalizedError.original = error;

        return Promise.reject(normalizedError);
    }
);

export default apiClient;

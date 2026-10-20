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

/**
 * Compatibility helper for existing API service functions.
 * The request interceptor below replaces this token with the
 * current Keycloak token before sending an authenticated request.
 */
export function withBearerToken(token) {
    if (!token) {
        throw new Error("An access token is required for this operation.");
    }

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

/**
 * Always use the current Keycloak access token for authenticated
 * requests. Refresh it when it is close to expiring.
 */
apiClient.interceptors.request.use(
    async (config) => {
        const hasExplicitToken = Boolean(
            config.headers?.Authorization ||
            config.headers?.authorization
        );

        if (keycloak.authenticated) {
            await keycloak.updateToken(30);

            if (!keycloak.token) {
                throw new Error(
                    "Keycloak did not provide an access token. Please sign in again."
                );
            }

            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        } else if (hasExplicitToken) {
            delete config.headers.Authorization;
            delete config.headers.authorization;

            throw new Error(
                "Your login session is no longer active. Please sign in again."
            );
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Normalize API errors.
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const body = error.response?.data;

        let message = "The request failed. Please try again.";

        if (typeof body === "string" && body.trim()) {
            message = body;
        } else if (body?.message) {
            message = body.message;
        } else if (body?.detail) {
            message = body.detail;
        } else if (error.code === "ECONNABORTED") {
            message = "The server took too long to respond.";
        } else if (!error.response && error.message?.includes("Keycloak")) {
            message = error.message;
        } else if (!error.response) {
            message =
                "Cannot connect to API Gateway at http://localhost:7070. Make sure API Gateway is running.";
        } else if (status === 401) {
            message =
                "Authentication failed. Please sign in again and retry.";
        } else if (status === 403) {
            message =
                "You do not have permission to perform this operation.";
        } else if (status === 404) {
            message = "The requested API endpoint was not found.";
        } else if (status >= 500) {
            message = "The backend server returned an error.";
        }

        const wrappedError = new Error(message);
        wrappedError.status = status;
        wrappedError.data = body;

        return Promise.reject(wrappedError);
    }
);

export default apiClient;

import axios from "axios";
import keycloak from "../auth/keycloak";

const DEFAULT_API_BASE_URL = "http://localhost:7070";

function normalizeBaseUrl(value) {
    return String(value || DEFAULT_API_BASE_URL)
        .trim()
        .replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL
);

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    headers: {
        Accept: "application/json",
    },
});

// Attach a valid Keycloak token to authenticated requests.
// Public endpoints can still be called without logging in.
apiClient.interceptors.request.use(
    async (config) => {
        config.headers = config.headers || {};

        // Avoid sending an expired or missing token.
        if (!keycloak.authenticated) {
            delete config.headers.Authorization;
            return config;
        }

        try {
            await keycloak.updateToken(30);

            if (!keycloak.token) {
                throw new Error("Keycloak access token is missing.");
            }

            config.headers.Authorization = `Bearer ${keycloak.token}`;
            return config;
        } catch (error) {
            console.error("Unable to refresh Keycloak token:", error);

            const authError = new Error(
                "Your login session has expired. Please sign in again."
            );

            authError.status = 401;
            authError.code = "KEYCLOAK_TOKEN_ERROR";
            authError.original = error;

            return Promise.reject(authError);
        }
    },
    (error) => Promise.reject(error)
);

// Normalize errors while retaining the HTTP status and response body.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Token-refresh errors are already normalized above.
        if (error?.code === "KEYCLOAK_TOKEN_ERROR") {
            return Promise.reject(error);
        }

        const status = error?.response?.status;
        const body = error?.response?.data;

        let message = "The request failed. Please try again.";

        if (typeof body === "string" && body.trim()) {
            message = body;
        } else if (body?.message) {
            message = body.message;
        } else if (body?.detail) {
            message = body.detail;
        } else if (Array.isArray(body?.fieldErrors) && body.fieldErrors.length) {
            message = body.fieldErrors
                .map((field) => `${field.field || "Field"}: ${field.message || "Invalid value"}`)
                .join("\n");
        } else if (status === 400) {
            message = "Invalid request. Check the submitted fields.";
        } else if (status === 401) {
            message = "Authentication is required. Please sign in again.";
        } else if (status === 403) {
            message = "You do not have permission to perform this operation.";
        } else if (status === 404) {
            message = "The requested API endpoint or resource was not found.";
        } else if (status === 413) {
            message = "The uploaded file or request is too large.";
        } else if (status === 415) {
            message = "The server does not support this request content type.";
        } else if (status >= 500) {
            message = "The server encountered an error. Check the backend logs.";
        } else if (!error?.response) {
            message =
                `Cannot connect to the API at ${API_BASE_URL}. ` +
                "Check that the API gateway is running.";
        } else if (error?.message) {
            message = error.message;
        }

        const normalizedError = new Error(message);
        normalizedError.name = "ApiError";
        normalizedError.status = status;
        normalizedError.data = body;
        normalizedError.original = error;

        return Promise.reject(normalizedError);
    }
);

export default apiClient;

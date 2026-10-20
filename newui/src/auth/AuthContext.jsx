import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import keycloak from "./keycloak";

const AuthContext = createContext(null);

// Share initialization across React StrictMode remounts.
let keycloakInitPromise = null;

function initializeKeycloak() {
    if (!keycloakInitPromise) {
        keycloakInitPromise = keycloak
            .init({
                onLoad: "check-sso",
                checkLoginIframe: false,
                pkceMethod: "S256",
            })
            .catch((error) => {
                // Allow a later attempt if initialization failed.
                keycloakInitPromise = null;
                throw error;
            });
    }

    return keycloakInitPromise;
}

export function AuthProvider({ children }) {
    const [ready, setReady] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);

    const syncAuthState = useCallback((isAuthenticated) => {
        const parsed = keycloak.tokenParsed;
        const realmRoles = parsed?.realm_access?.roles ?? [];

        const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
        const clientRoles =
            parsed?.resource_access?.[clientId]?.roles ?? [];

        const isLoggedIn = Boolean(
            isAuthenticated && keycloak.token
        );

        setAuthenticated(isLoggedIn);
        setToken(isLoggedIn ? keycloak.token : null);

        setUser(
            isLoggedIn
                ? {
                    username: parsed?.preferred_username ?? "",
                    email: parsed?.email ?? "",
                    name:
                        parsed?.name ??
                        parsed?.preferred_username ??
                        "",
                }
                : null
        );

        setRoles(
            isLoggedIn
                ? [...new Set([...realmRoles, ...clientRoles])]
                : []
        );
    }, []);

    useEffect(() => {
        let mounted = true;

        keycloak.onAuthSuccess = () => {
            if (mounted) syncAuthState(true);
        };

        keycloak.onAuthRefreshSuccess = () => {
            if (mounted) syncAuthState(true);
        };

        keycloak.onAuthRefreshError = () => {
            if (mounted) syncAuthState(false);
        };

        keycloak.onAuthLogout = () => {
            if (mounted) syncAuthState(false);
        };

        keycloak.onTokenExpired = async () => {
            try {
                if (keycloak.authenticated) {
                    await keycloak.updateToken(30);
                    if (mounted) syncAuthState(true);
                } else if (mounted) {
                    syncAuthState(false);
                }
            } catch (error) {
                console.error("Keycloak token refresh failed:", error);
                if (mounted) syncAuthState(false);
            }
        };

        initializeKeycloak()
            .then((isAuthenticated) => {
                if (mounted) syncAuthState(isAuthenticated);
            })
            .catch((error) => {
                console.error("Keycloak initialization failed:", error);

                if (mounted) {
                    syncAuthState(false);
                }
            })
            .finally(() => {
                if (mounted) setReady(true);
            });

        return () => {
            mounted = false;
        };
    }, [syncAuthState]);

    const login = useCallback((redirectUri) => {
        return keycloak.login({
            redirectUri:
                redirectUri || `${window.location.origin}/admin`,
            prompt: "login",
        });
    }, []);

    const logout = useCallback(async () => {
        // Clear the UI immediately; Keycloak performs the server logout.
        syncAuthState(false);

        await keycloak.logout({
            redirectUri: `${window.location.origin}/login`,
        });
    }, [syncAuthState]);

    const getAccessToken = useCallback(async () => {
        if (!keycloak.authenticated) {
            syncAuthState(false);
            throw new Error("Your session has expired. Please sign in again.");
        }

        try {
            await keycloak.updateToken(30);

            if (!keycloak.token) {
                syncAuthState(false);
                throw new Error("Keycloak did not return an access token.");
            }

            syncAuthState(true);
            return keycloak.token;
        } catch (error) {
            syncAuthState(false);
            throw error;
        }
    }, [syncAuthState]);

    const isAdmin = roles.includes("ADMIN");

    const value = useMemo(
        () => ({
            ready,
            authenticated,
            token,
            user,
            roles,
            isAdmin,
            login,
            logout,
            getAccessToken,
        }),
        [
            ready,
            authenticated,
            token,
            user,
            roles,
            isAdmin,
            login,
            logout,
            getAccessToken,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider.");
    }

    return context;
}
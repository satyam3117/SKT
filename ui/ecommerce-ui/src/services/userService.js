import API from "./apiClient";

export const syncUser = (keycloak) => {
    return API.post(
        "/api/user/sync",
        {},
        {
            headers: {
                Authorization: `Bearer ${keycloak.token}`
            }
        }
    );
};
import apiClient, { getBearerToken } from "./apiClient";

export async function placeOrder(keycloak, payload) {
  const token = await getBearerToken(keycloak);
  const response = await apiClient.post("/api/order", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
}


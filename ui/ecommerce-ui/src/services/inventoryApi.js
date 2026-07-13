import apiClient, { getBearerToken } from "./apiClient";

export async function checkInventory(keycloak, skuCode, quantity) {
  const token = await getBearerToken(keycloak);
  const response = await apiClient.get("/api/inventory", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      skuCode,
      quantity,
    },
  });

  return response.data;
}


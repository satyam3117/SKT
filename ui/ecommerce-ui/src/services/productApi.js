import apiClient, { getBearerToken } from "./apiClient";

export async function getAllProducts(keycloak) {
  const token = await getBearerToken(keycloak);
  const response = await apiClient.get("/api/product", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createProduct(keycloak, payload) {
  const token = await getBearerToken(keycloak);
  const response = await apiClient.post("/api/product", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
}


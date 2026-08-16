import apiClient, { getBearerToken } from "./apiClient";

function buildQueryParams(params = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    const stringValue = String(value).trim();
    if (stringValue.length === 0) {
      return;
    }

    queryParams.set(key, stringValue);
  });

  return queryParams.toString();
}

export async function getProductsPage(keycloak, params = {}) {
  const token = await getBearerToken(keycloak);
  const queryString = buildQueryParams(params);
  const url = queryString.length > 0 ? `/api/product?${queryString}` : "/api/product";

  const response = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function searchProducts(keycloak, params = {}) {
  const token = await getBearerToken(keycloak);
  const queryString = buildQueryParams(params);

  const response = await apiClient.get(`/api/product/search?${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

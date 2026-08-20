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

function isKeycloakClient(value) {
  return Boolean(value && typeof value.updateToken === "function");
}

function resolveParams(firstArg = {}, secondArg) {
  if (typeof secondArg !== "undefined") {
    return secondArg || {};
  }

  if (isKeycloakClient(firstArg)) {
    return {};
  }

  return firstArg || {};
}

async function buildAuthConfig(firstArg) {
  if (!isKeycloakClient(firstArg)) {
    return undefined;
  }

  const token = await getBearerToken(firstArg);

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getProductsPage(firstArg = {}, secondArg) {
  const params = resolveParams(firstArg, secondArg);
  const authConfig = await buildAuthConfig(firstArg);
  const queryString = buildQueryParams(params);

  const url =
      queryString.length > 0
          ? `/api/product?${queryString}`
          : "/api/product";

  const response = await apiClient.get(url, authConfig);

  return response.data;
}

export async function searchProducts(firstArg = {}, secondArg) {
  const resolvedParams = resolveParams(firstArg, secondArg);
  const authConfig = await buildAuthConfig(firstArg);
  const queryString = buildQueryParams(resolvedParams);

  const response = await apiClient.get(
      `/api/product/search?${queryString}`,
      authConfig
  );

  return response.data;
}

export async function getProductCategories() {
  const response = await apiClient.get("/api/product/categories");

  return response.data;
}

export async function getRootCategories() {
  const response = await apiClient.get("/api/product/categories/root");

  return response.data;
}

export async function getCategoryChildren(parentId) {
  const response = await apiClient.get(
      `/api/product/categories/${parentId}/children`
  );

  return response.data;
}
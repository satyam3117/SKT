import apiClient from "./apiClient";

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

function resolveParams(firstArg = {}, secondArg) {
  if (typeof secondArg !== "undefined") {
    return secondArg || {};
  }

  const isKeycloakClient =
    Boolean(firstArg && typeof firstArg.updateToken === "function");

  if (isKeycloakClient) {
    return {};
  }

  return firstArg || {};
}

export async function getProductsPage(firstArg = {}, secondArg) {
  const params = resolveParams(firstArg, secondArg);
  const queryString = buildQueryParams(params);

  const url =
      queryString.length > 0
          ? `/api/product?${queryString}`
          : "/api/product";

  const response = await apiClient.get(url);

  return response.data;
}

export async function searchProducts(firstArg = {}, secondArg) {
  const resolvedParams = resolveParams(firstArg, secondArg);
  const queryString = buildQueryParams(resolvedParams);

  const response = await apiClient.get(
      `/api/product/search?${queryString}`
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
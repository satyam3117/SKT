
import apiClient, { withBearerToken } from "./apiClient";

export async function getInventoryBySku(skuCode, token) {
    const sku = String(skuCode || "").trim();
    if (!sku) throw new Error("SKU code is required.");

    const response = await apiClient.get(
        `/api/inventory/${encodeURIComponent(sku)}`,
        withBearerToken(token)
    );

    return response.data;
}

export async function createInventory(inventory, token) {
    const response = await apiClient.post(
        "/api/inventory",
        inventory,
        withBearerToken(token)
    );

    return response.data;
}

export async function addStock(skuCode, request, token) {
    const response = await apiClient.post(
        `/api/inventory/${encodeURIComponent(skuCode)}/stock`,
        request,
        withBearerToken(token)
    );

    return response.data;
}

export async function adjustInventory(skuCode, request, token) {
    const response = await apiClient.post(
        `/api/inventory/${encodeURIComponent(skuCode)}/adjust`,
        request,
        withBearerToken(token)
    );

    return response.data;
}

export async function checkAvailability(skuCode, quantity, token) {
    const response = await apiClient.get(
        `/api/inventory/${encodeURIComponent(skuCode)}/availability`,
        {
            ...withBearerToken(token),
            params: { quantity },
        }
    );

    return response.data;
}

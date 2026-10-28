
import apiClient, { API_BASE_URL } from "./apiClient.js";

/* --------------------------------------------------------------------------
   Helpers
--------------------------------------------------------------------------- */

function requireId(value, label) {
    if (value === undefined || value === null || String(value).trim() === "") {
        throw new Error(`${label} is required.`);
    }

    return encodeURIComponent(String(value));
}

function withPagination(params = {}) {
    return {
        page: params.page ?? 0,
        size: params.size ?? 20,

        ...(params.categoryId
            ? {
                categoryId:
                params.categoryId,
            }
            : {}),

        ...(params.categoryIds
            ? {
                categoryIds:
                params.categoryIds,
            }
            : {}),

        ...(params.brand
            ? {
                brand:
                params.brand,
            }
            : {}),

        ...(params.minPrice !== undefined &&
        params.minPrice !== ""
            ? {
                minPrice:
                params.minPrice,
            }
            : {}),

        ...(params.maxPrice !== undefined &&
        params.maxPrice !== ""
            ? {
                maxPrice:
                params.maxPrice,
            }
            : {}),

        ...(params.sort
            ? {
                sort:
                params.sort,
            }
            : {}),

        ...(params.direction
            ? {
                direction:
                params.direction,
            }
            : {}),
    };
}


function responseData(response) {
    return response.data;
}

/* --------------------------------------------------------------------------
   Products: public reads
--------------------------------------------------------------------------- */

// GET /api/product?page=0&size=20
export async function getProductsPage(params = {}) {
    const response = await apiClient.get("/api/product", {
        params: withPagination(params),
    });

    return responseData(response);
}

// GET /api/product/search?q=...
export async function searchProducts(params = {}) {
    const q = String(params.q ?? "").trim();

    if (!q) {
        return getProductsPage(params);
    }

    const response = await apiClient.get("/api/product/search", {
        params: {
            q,
            ...withPagination(params),
        },
    });

    return responseData(response);
}

// GET /api/product/{id}
export async function getProduct(id) {
    const productId = requireId(id, "Product ID");
    const response = await apiClient.get(`/api/product/${productId}`);

    return responseData(response);
}

// GET /api/product/category/{productCategory}
export async function getProductsByCategory(productCategory, params = {}) {
    const category = requireId(productCategory, "Product category");

    const response = await apiClient.get(
        `/api/product/category/${category}`,
        {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 20,
                ...(params.sort ? { sort: params.sort } : {}),
                ...(params.direction ? { direction: params.direction } : {}),
            },
        }
    );

    return responseData(response);
}

// GET /api/product/brand/{productBrand}
export async function getProductsByBrand(productBrand, params = {}) {
    const brand = requireId(productBrand, "Product brand");

    const response = await apiClient.get(`/api/product/brand/${brand}`, {
        params: {
            page: params.page ?? 0,
            size: params.size ?? 20,
            ...(params.sort ? { sort: params.sort } : {}),
            ...(params.direction ? { direction: params.direction } : {}),
        },
    });

    return responseData(response);
}

/* --------------------------------------------------------------------------
   Categories
--------------------------------------------------------------------------- */

// GET /api/product/categories
export async function getAllCategories() {
    const response = await apiClient.get("/api/product/categories");
    return responseData(response);
}

// Existing UI alias
export async function getProductCategories() {
    return getAllCategories();
}

// GET /api/product/categories/root
export async function getRootCategories() {
    const response = await apiClient.get("/api/product/categories/root");
    return responseData(response);
}

// GET /api/product/categories/{id}
export async function getCategory(id) {
    const categoryId = requireId(id, "Category ID");
    const response = await apiClient.get(`/api/product/categories/${categoryId}`);

    return responseData(response);
}

// GET /api/product/categories/{parentId}/children
export async function getCategoryChildren(parentId) {
    const categoryId = requireId(parentId, "Parent category ID");

    const response = await apiClient.get(
        `/api/product/categories/${categoryId}/children`
    );

    return responseData(response);
}

// POST /api/product/categories
export async function createCategory(request) {
    const response = await apiClient.post("/api/product/categories", request);
    return responseData(response);
}

// PUT /api/product/categories/{id}
export async function updateCategory(id, request) {
    const categoryId = requireId(id, "Category ID");

    const response = await apiClient.put(
        `/api/product/categories/${categoryId}`,
        request
    );

    return responseData(response);
}

// DELETE /api/product/categories/{id}
export async function deleteCategory(id) {
    const categoryId = requireId(id, "Category ID");

    await apiClient.delete(`/api/product/categories/${categoryId}`);
}

/* --------------------------------------------------------------------------
   Brands
--------------------------------------------------------------------------- */

// GET /api/product/brands
export async function getAllBrands() {
    const response = await apiClient.get("/api/product/brands");
    return responseData(response);
}

// Existing UI alias
export async function getBrands() {
    return getAllBrands();
}

// GET /api/product/brands/{id}
export async function getBrand(id) {
    const brandId = requireId(id, "Brand ID");
    const response = await apiClient.get(`/api/product/brands/${brandId}`);

    return responseData(response);
}

// POST /api/product/brands
export async function createBrand(request) {
    const response = await apiClient.post("/api/product/brands", request);
    return responseData(response);
}

// PUT /api/product/brands/{id}
export async function updateBrand(id, request) {
    const brandId = requireId(id, "Brand ID");

    const response = await apiClient.put(
        `/api/product/brands/${brandId}`,
        request
    );

    return responseData(response);
}

// DELETE /api/product/brands/{id}
export async function deleteBrand(id) {
    const brandId = requireId(id, "Brand ID");

    await apiClient.delete(`/api/product/brands/${brandId}`);
}

/* --------------------------------------------------------------------------
   Product form configuration
--------------------------------------------------------------------------- */

// GET /api/product/types/{productCategory}/form-config
export async function getProductFormConfig(productCategory) {
    const category = requireId(productCategory, "Product category");

    const response = await apiClient.get(
        `/api/product/types/${category}/form-config`
    );

    return responseData(response);
}

/* --------------------------------------------------------------------------
   Admin product operations
--------------------------------------------------------------------------- */

// POST /api/product
// Pass FormData containing the product fields and productImages files.
export async function createProduct(formData) {
    if (!(formData instanceof FormData)) {
        throw new Error("createProduct requires a FormData object.");
    }

    const response = await apiClient.post("/api/product", formData);
    return responseData(response);
}

// PUT /api/product/{id}
export async function updateProduct(id, formData) {
    const productId = requireId(id, "Product ID");

    if (!(formData instanceof FormData)) {
        throw new Error("updateProduct requires a FormData object.");
    }

    const response = await apiClient.put(
        `/api/product/${productId}`,
        formData
    );

    return responseData(response);
}

// DELETE /api/product/{id}
export async function deleteProduct(id) {
    const productId = requireId(id, "Product ID");

    await apiClient.delete(`/api/product/${productId}`);
}

/* --------------------------------------------------------------------------
   Product images
--------------------------------------------------------------------------- */

// Supports absolute URLs and paths returned by the backend.
export function resolveImageUrl(imageUrl) {
    if (!imageUrl) {
        return "";
    }

    const value = String(imageUrl).trim();

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

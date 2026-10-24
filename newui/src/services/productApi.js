
/*
|--------------------------------------------------------------------------
| PRODUCT APIs
|--------------------------------------------------------------------------
*/

/**
 * GET /api/product?page=0&size=20
 *
 * Backend response:
 *
 * {
 *   items: [],
 *   totalElements: 0,
 *   totalPages: 0,
 *   page: 0,
 *   size: 20,
 *   hasNext: false,
 *   hasPrevious: false
 * }
 */
export async function getProductsPage(params = {}) {
    const response = await apiClient.get("/api/product", {
        params: {
            page: params.page ?? 0,
            size: params.size ?? 20,

            ...(params.categoryId
                ? { categoryId: params.categoryId }
                : {}),

            ...(params.brand
                ? { brand: params.brand }
                : {}),

            ...(params.minPrice !== undefined &&
            params.minPrice !== ""
                ? { minPrice: params.minPrice }
                : {}),

            ...(params.maxPrice !== undefined &&
            params.maxPrice !== ""
                ? { maxPrice: params.maxPrice }
                : {}),

            ...(params.sort
                ? { sort: params.sort }
                : {}),

            ...(params.direction
                ? { direction: params.direction }
                : {}),
        },
    });

    return response.data;
}


/**
 * GET /api/product/search
 */
export async function searchProducts(params = {}) {
    const q = params.q?.trim();

    if (!q) {
        return getProductsPage(params);
    }

    const response = await apiClient.get(
        "/api/product/search",
        {
            params: {
                q,

                page: params.page ?? 0,
                size: params.size ?? 20,

                ...(params.categoryId
                    ? { categoryId: params.categoryId }
                    : {}),

                ...(params.brand
                    ? { brand: params.brand }
                    : {}),

                ...(params.minPrice !== undefined &&
                params.minPrice !== ""
                    ? { minPrice: params.minPrice }
                    : {}),

                ...(params.maxPrice !== undefined &&
                params.maxPrice !== ""
                    ? { maxPrice: params.maxPrice }
                    : {}),

                ...(params.sort
                    ? { sort: params.sort }
                    : {}),

                ...(params.direction
                    ? { direction: params.direction }
                    : {}),
            },
        }
    );

    return response.data;
}


/**
 * GET /api/product/{id}
 */
export async function getProduct(id) {
    if (
        id === undefined ||
        id === null ||
        String(id).trim() === ""
    ) {
        throw new Error("Product ID is required.");
    }

    const response = await apiClient.get(
        `/api/product/${encodeURIComponent(id)}`
    );

    return response.data;
}


/**
 * GET /api/product/category/{productCategory}
 */
export async function getProductsByCategory(
    productCategory,
    params = {}
) {
    if (!productCategory) {
        throw new Error("Product category is required.");
    }

    const response = await apiClient.get(
        `/api/product/category/${encodeURIComponent(productCategory)}`,
        {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 20,

                ...(params.sort
                    ? { sort: params.sort }
                    : {}),

                ...(params.direction
                    ? { direction: params.direction }
                    : {}),
            },
        }
    );

    return response.data;
}


/**
 * GET /api/product/brand/{productBrand}
 */
export async function getProductsByBrand(
    productBrand,
    params = {}
) {
    if (!productBrand) {
        throw new Error("Product brand is required.");
    }

    const response = await apiClient.get(
        `/api/product/brand/${encodeURIComponent(productBrand)}`,
        {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 20,

                ...(params.sort
                    ? { sort: params.sort }
                    : {}),

                ...(params.direction
                    ? { direction: params.direction }
                    : {}),
            },
        }
    );

    return response.data;
}


/*
|--------------------------------------------------------------------------
| PRODUCT CATEGORY APIs
|--------------------------------------------------------------------------
*/

/**
 * GET /api/product/categories
 */
export async function getAllCategories() {
    const response = await apiClient.get(
        "/api/product/categories"
    );

    return response.data;
}

/**
 * Alias used by App.jsx.
 */
export async function getProductCategories() {
    return getAllCategories();
}


/**
 * GET /api/product/categories/root
 */
export async function getRootCategories() {
    const response = await apiClient.get(
        "/api/product/categories/root"
    );

    return response.data;
}


/**
 * GET /api/product/categories/{id}
 */
export async function getCategory(id) {
    if (!id) {
        throw new Error("Category ID is required.");
    }

    const response = await apiClient.get(
        `/api/product/categories/${encodeURIComponent(id)}`
    );

    return response.data;
}


/**
 * GET /api/product/categories/{parentId}/children
 */
export async function getCategoryChildren(parentId) {
    if (!parentId) {
        throw new Error("Parent category ID is required.");
    }

    const response = await apiClient.get(
        `/api/product/categories/${encodeURIComponent(parentId)}/children`
);

return response.data;
}


/**
 * POST /api/product/categories
 *
 * ADMIN only.
 */
export async function createCategory(request) {
    const response = await apiClient.post(
        "/api/product/categories",
        request
    );

    return response.data;
}

export async function updateCategory(id, request) {
    const response = await apiClient.put(
        `/api/product/categories/${encodeURIComponent(id)}`,
        request
    );

    return response.data;
}

export async function deleteCategory(id) {
    await apiClient.delete(
        `/api/product/categories/${encodeURIComponent(id)}`
    );
}

export async function createBrand(request) {
    const response = await apiClient.post(
        "/api/product/brands",
        request
    );

    return response.data;
}

export async function updateBrand(id, request) {
    const response = await apiClient.put(
        `/api/product/brands/${encodeURIComponent(id)}`,
        request
    );

    return response.data;
}

export async function deleteBrand(id) {
    await apiClient.delete(
        `/api/product/brands/${encodeURIComponent(id)}`
    );
}

/*
|--------------------------------------------------------------------------
| BRAND APIs
|--------------------------------------------------------------------------
*/

/**
 * GET /api/product/brands
 */
export async function getAllBrands() {
    const response = await apiClient.get(
        "/api/product/brands"
    );

    return response.data;
}


/**
 * GET /api/product/brands/active
 */
export async function getBrands() {
    const response = await apiClient.get(
        "/api/product/brands"
    );

    return response.data;
}


/**
 * GET /api/product/brands/{id}
 */
export async function getBrand(id) {
    if (!id) {
        throw new Error("Brand ID is required.");
    }

    const response = await apiClient.get(
        `/api/product/brands/${encodeURIComponent(id)}`
    );

    return response.data;
}


/**
 * POST /api/product/brands
 *
 * ADMIN only.
 */


/*
|--------------------------------------------------------------------------
| PRODUCT FORM CONFIG
|--------------------------------------------------------------------------
*/

/**
 * GET /api/product/types/{productCategory}/form-config
 */
export async function getProductFormConfig(
    productCategory
) {
    if (!productCategory) {
        throw new Error(
            "Product category is required."
        );
    }

    const response = await apiClient.get(
        `/api/product/types/${encodeURIComponent(
            productCategory
        )}/form-config`
    );

    return response.data;
}


/*
|--------------------------------------------------------------------------
| ADMIN PRODUCT APIs
|--------------------------------------------------------------------------
*/

/**
 * POST /api/product
 *
 * ProductController expects:
 *
 * multipart/form-data
 *
 * productRequest fields +
 * productImages[]
 */
export async function createProduct(formData) {
    if (!(formData instanceof FormData)) {
        throw new Error("createProduct requires FormData.");
    }

    const response = await apiClient.post(
        "/api/product",
        formData
    );

    return response.data;
}

export async function updateProduct(id, formData) {
    if (!id) {
        throw new Error("Product ID is required.");
    }

    if (!(formData instanceof FormData)) {
        throw new Error("updateProduct requires FormData.");
    }

    const response = await apiClient.put(
        `/api/product/${encodeURIComponent(id)}`,
        formData
    );

    return response.data;
}

export async function deleteProduct(id) {
    if (!id) {
        throw new Error("Product ID is required.");
    }

    await apiClient.delete(
        `/api/product/${encodeURIComponent(id)}`
    );
}

/*
|--------------------------------------------------------------------------
| PRODUCT IMAGE
|--------------------------------------------------------------------------
*/
export function resolveImageUrl(imageUrl) {
    if (!imageUrl) {
        return "";
    }

    if (/^https?:\/\//i.test(imageUrl)) {
        return imageUrl;
    }

    return `${API_BASE_URL.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
}

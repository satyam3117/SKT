import apiClient, {
  API_BASE_URL,
  getBearerToken,
} from "./apiClient";

export const PRODUCT_TYPE_OPTIONS = [
  { value: "base", label: "Base" },
  { value: "desktop_prebuilt", label: "Desktop Prebuilt" },
  { value: "laptop", label: "Laptop" },
  { value: "workstation", label: "Workstation" },
  { value: "computer", label: "Computer" },
  { value: "cpu", label: "CPU" },
  { value: "gpu", label: "GPU" },
  { value: "motherboard", label: "Motherboard" },
  { value: "ram", label: "RAM" },
  { value: "storage_ssd", label: "Storage SSD" },
  { value: "storage_hdd", label: "Storage HDD" },
  { value: "power_supply", label: "Power Supply" },
  { value: "cpu_cooler", label: "CPU Cooler" },
  { value: "cabinet_case", label: "Cabinet / Case" },
  { value: "custom_pc_build", label: "Custom PC Build" },
  { value: "monitor", label: "Monitor" },
  { value: "keyboard", label: "Keyboard" },
  { value: "mouse", label: "Mouse" },
  { value: "headset", label: "Headset" },
  { value: "speaker", label: "Speaker" },
  { value: "webcam", label: "Webcam" },
  { value: "microphone", label: "Microphone" },
  { value: "ups", label: "UPS" },
  { value: "network_router", label: "Network Router" },
  { value: "network_switch", label: "Network Switch" },
  { value: "wifi_adapter", label: "Wi-Fi Adapter" },
  { value: "bluetooth_adapter", label: "Bluetooth Adapter" },
  { value: "external_storage", label: "External Storage" },
  { value: "usb_hub", label: "USB Hub" },
  { value: "cables", label: "Cables" },
  { value: "thermal_paste", label: "Thermal Paste" },
  { value: "graphics_card_external", label: "External Graphics Card" },
  { value: "capture_card", label: "Capture Card" },
  { value: "streaming_device", label: "Streaming Device" },
  { value: "operating_system", label: "Operating System" },
  { value: "antivirus", label: "Antivirus" },
  { value: "other", label: "Other" },
];

export async function getProductFormConfig(keycloak, productType) {
  const token = await getBearerToken(keycloak);

  const response = await apiClient.get(
      `/api/product/types/${productType}/form-config`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
  );

  return response.data;
}

export async function getAllProducts(keycloak) {
  const token = await getBearerToken(keycloak);

  const response = await apiClient.get("/api/product", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

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

export async function getProductById(keycloak, id) {
  const token = await getBearerToken(keycloak);

  const response = await apiClient.get(`/api/product/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

/**
 * Appends a value to FormData.
 *
 * Arrays are intentionally appended multiple times:
 *
 * categoryPath:
 * [
 *   "Electronics",
 *   "Laptops",
 *   "Business Laptops"
 * ]
 *
 * becomes:
 *
 * categoryPath=Electronics
 * categoryPath=Laptops
 * categoryPath=Business Laptops
 *
 * Spring Boot can bind this directly to:
 *
 * List<String> categoryPath
 */
function appendFormValue(formData, key, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      appendFormValue(formData, key, item);
    });

    return;
  }

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  formData.append(key, String(value));
}

/**
 * Builds multipart/form-data for product create/update.
 *
 * Example payload:
 *
 * {
 *   skuCode: "LAPT-90462994",
 *   categoryPath: [
 *     "Electronics",
 *     "Laptops",
 *     "Business Laptops"
 *   ],
 *   productCategory: "laptop",
 *   name: "Dell Latitude"
 * }
 *
 * Images are sent using:
 *
 * productImages
 */
function buildProductFormData(payload, productImages = []) {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    appendFormValue(formData, key, value);
  });

  if (Array.isArray(productImages)) {
    productImages.forEach((file) => {
      if (file instanceof File) {
        formData.append("productImages", file);
      }
    });
  }

  return formData;
}

async function submitProductMultipart(
    url,
    token,
    payload,
    productImages,
    method
) {
  const formData = buildProductFormData(
      payload,
      productImages
  );

  const response = await fetch(
      `${API_BASE_URL}${url}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      }
  );

  const responseText = await response.text();

  if (!response.ok) {
    let message =
        responseText ||
        "Request failed. Please try again.";

    try {
      const parsed = JSON.parse(responseText);

      if (
          typeof parsed === "string" &&
          parsed.trim().length > 0
      ) {
        message = parsed;
      } else if (
          typeof parsed?.message === "string" &&
          parsed.message.trim().length > 0
      ) {
        message = parsed.message;
      } else if (
          typeof parsed?.error === "string" &&
          parsed.error.trim().length > 0
      ) {
        message = parsed.error;
      }
    } catch {
      // Server response was not JSON.
    }

    throw new Error(message);
  }

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

export async function createProduct(
    keycloak,
    payload,
    productImages = []
) {
  const token = await getBearerToken(keycloak);

  return submitProductMultipart(
      "/api/product",
      token,
      payload,
      productImages,
      "POST"
  );
}

export async function updateProduct(
    keycloak,
    id,
    payload,
    productImages = []
) {
  const token = await getBearerToken(keycloak);

  return submitProductMultipart(
      `/api/product/${id}`,
      token,
      payload,
      productImages,
      "PUT"
  );
}

export async function deleteProduct(keycloak, id) {
  const token = await getBearerToken(keycloak);

  await apiClient.delete(`/api/product/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
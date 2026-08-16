import { API_BASE_URL } from "../services/apiClient";

const palette = [
  "#0f172a",
  "#1d4ed8",
  "#0f766e",
  "#7c3aed",
  "#b45309",
  "#be123c",
];

function hashText(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getInitials(name) {
  return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "P";
}

export function getSortedProductImages(source) {
  const images = Array.isArray(source)
      ? source
      : Array.isArray(source?.productImages)
          ? source.productImages
          : [];

  return images
      .filter(
          (image) =>
              typeof image?.imageUrl === "string" &&
              image.imageUrl.trim().length > 0
      )
      .slice()
      .sort(
          (left, right) =>
              (left.position ?? Number.MAX_SAFE_INTEGER) -
              (right.position ?? Number.MAX_SAFE_INTEGER)
      );
}

/**
 * Converts the image URL returned by the backend into a URL
 * that the browser can use to fetch the product image.
 *
 * Supported backend formats:
 *
 * /api/product/images/LAPT-90462994/image.jpg?categoryPath=Electronics&categoryPath=Laptops
 *
 * OR legacy:
 *
 * /uploads/Electronics/Laptops/Business Laptops/LAPT-90462994/image.jpg
 *
 * becomes:
 *
 * API_BASE_URL/api/product/images/LAPT-90462994/image.jpg?categoryPath=Electronics&categoryPath=Laptops&categoryPath=Business+Laptops
 */
export function resolveProductImageUrl(imageUrl) {
  if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
    return "";
  }

  const normalizedUrl = imageUrl.trim();
  const uploadsPath =
    normalizedUrl.startsWith("/uploads/") || normalizedUrl.startsWith("uploads/")
      ? normalizedUrl
      : (() => {
          try {
            const parsed = new URL(normalizedUrl);
            return parsed.pathname.startsWith("/uploads/") ? `${parsed.pathname}${parsed.search}` : "";
          } catch {
            return "";
          }
        })();

  // Already a complete URL or browser-generated URL
  if (/^(https?:|data:|blob:)/i.test(normalizedUrl)) {
    if (uploadsPath) {
      return convertUploadsPathToApiImageUrl(uploadsPath);
    }
    return normalizedUrl;
  }

  // New backend path style.
  if (normalizedUrl.startsWith("/api/product/images/") || normalizedUrl.startsWith("api/product/images/")) {
    const apiPath = normalizedUrl.startsWith("/") ? normalizedUrl : `/${normalizedUrl}`;
    return new URL(apiPath, API_BASE_URL).toString();
  }

  // Legacy backend format: /uploads/... Convert to routed API endpoint.
  if (uploadsPath) {
    return convertUploadsPathToApiImageUrl(uploadsPath);
  }

  // Any other relative URL returned by the backend
  return new URL(normalizedUrl, API_BASE_URL).toString();
}

function decodePathSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function convertUploadsPathToApiImageUrl(uploadsUrl) {
  const normalized = uploadsUrl.replace(/^\//, "");
  const [pathPart] = normalized.split("?");
  const segments = pathPart.split("/").filter(Boolean);

  if (segments.length < 4 || segments[0] !== "uploads") {
    return new URL(uploadsUrl.startsWith("/") ? uploadsUrl : `/${uploadsUrl}`, API_BASE_URL).toString();
  }

  const decodedSegments = segments.map(decodePathSegment);
  const filename = decodedSegments[decodedSegments.length - 1];
  const skuCode = decodedSegments[decodedSegments.length - 2];
  const categoryPath = decodedSegments.slice(1, decodedSegments.length - 2);

  const queryParams = new URLSearchParams();
  categoryPath.forEach((segment) => queryParams.append("categoryPath", segment));

  const querySuffix = queryParams.toString();
  const endpointPath = `/api/product/images/${encodeURIComponent(skuCode)}/${encodeURIComponent(filename)}`;

  return `${new URL(endpointPath, API_BASE_URL).toString()}${querySuffix ? `?${querySuffix}` : ""}`;
}

export function getPrimaryProductImageUrl(product) {
  const primaryImage = getSortedProductImages(product)[0];

  return primaryImage
      ? resolveProductImageUrl(primaryImage.imageUrl)
      : "";
}

export function getProductPlaceholderUrl(
    product,
    { width = 96, height = 96 } = {}
) {
  const label = product?.name || "Product";
  const initials = getInitials(label);
  const background = palette[hashText(label) % palette.length];

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      role="img"
      aria-label="${label}"
    >
      <rect
        width="${width}"
        height="${height}"
        rx="18"
        fill="${background}"
      />

      <text
        x="${width / 2}"
        y="${height / 2 + 6}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${Math.max(
      24,
      Math.round(Math.min(width, height) * 0.32)
  )}"
        font-weight="700"
        fill="#ffffff"
        text-anchor="middle"
      >
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}
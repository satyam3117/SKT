
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";
import { API_BASE_URL } from "../../services/apiClient";

const RESERVED_FIELDS = new Set([
  "id",
  "_id",
  "name",
  "description",
  "price",
  "warrantyInMonth",
  "skuCode",
  "productCategory",
  "productType",
  "brandId",
  "categoryId",
  "status",
  "createdAt",
  "updatedAt",
  "productImages",
  "attributes",
  "rating",
  "averageRating",
  "reviews",
  "reviewCount",
  "isNew",
  "type",
]);

function formatLabel(value) {
  return String(value)
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (letter) => letter.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
        .map(([key, item]) => `${formatLabel(key)}: ${formatValue(item)}`)
        .join(", ");
  }

  return String(value);
}

function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function resolveImage(imageUrl) {
  if (!imageUrl) return "";

  const value = String(imageUrl).trim();

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

function getSpecifications(product) {
  const specifications = [];

  // Category-specific fields returned directly on the product.
  Object.entries(product || {}).forEach(([key, value]) => {
    if (
        RESERVED_FIELDS.has(key) ||
        key.startsWith("_") ||
        value === null ||
        value === undefined ||
        value === ""
    ) {
      return;
    }

    specifications.push({
      label: formatLabel(key),
      value: formatValue(value),
    });
  });

  // Support attributes stored as an object:
  // { processor: "Ryzen 7", ram: "16GB" }
  if (
      product?.attributes &&
      !Array.isArray(product.attributes) &&
      typeof product.attributes === "object"
  ) {
    Object.entries(product.attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        specifications.push({
          label: formatLabel(key),
          value: formatValue(value),
        });
      }
    });
  }

  // Also support attributes stored as an array:
  // [{ key: "Processor", value: "Ryzen 7" }]
  if (Array.isArray(product?.attributes)) {
    product.attributes.forEach((attribute) => {
      const key =
          attribute?.key ||
          attribute?.name ||
          attribute?.label;

      const value = attribute?.value;

      if (key && value !== null && value !== undefined && value !== "") {
        specifications.push({
          label: formatLabel(key),
          value: formatValue(value),
        });
      }
    });
  }

  // Avoid duplicate labels.
  return specifications.filter(
      (item, index, items) =>
          items.findIndex(
              (candidate) =>
                  candidate.label.toLowerCase() === item.label.toLowerCase()
          ) === index
  );
}

export default function ProductDetailsModal({ product, onClose }) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!product) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const images = (product.productImages || [])
      .filter((image) => image?.imageUrl)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((image) => resolveImage(image.imageUrl));

  const specifications = getSpecifications(product);

  const category = String(
      product.productCategory || product.productType || "Product"
  ).replaceAll("_", " ");

  const currentImage = images[activeImage];

  return (
      <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
      >
        <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-details-title"
            className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-4 sm:px-7">
            <div className="min-w-0 pr-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#245C45]">
                {category}
              </p>
              <h2
                  id="product-details-title"
                  className="mt-1 truncate font-['Manrope'] text-lg font-extrabold text-[#26372D] sm:text-xl"
              >
                {product.name || "Product details"}
              </h2>
            </div>

            <button
                type="button"
                onClick={onClose}
                aria-label="Close product details"
                className="shrink-0 rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
            >
              <X size={22} />
            </button>
          </header>

          <div className="overflow-y-auto">
            <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              {/* Product images */}
              <div className="min-w-0">
                <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl bg-[#F4F5F1] sm:min-h-[390px]">
                  {currentImage ? (
                      <img
                          key={currentImage}
                          src={currentImage}
                          alt={product.name || "Product"}
                          className="max-h-[430px] w-full object-contain p-5"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                      />
                  ) : (
                      <PackageSearch
                          size={72}
                          strokeWidth={1.2}
                          className="text-zinc-300"
                      />
                  )}

                  {images.length > 1 && (
                      <>
                        <button
                            type="button"
                            aria-label="Previous image"
                            onClick={() =>
                                setActiveImage(
                                    (activeImage - 1 + images.length) %
                                    images.length
                                )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow hover:bg-zinc-100"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <button
                            type="button"
                            aria-label="Next image"
                            onClick={() =>
                                setActiveImage(
                                    (activeImage + 1) % images.length
                                )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow hover:bg-zinc-100"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                  )}
                </div>

                {images.length > 1 && (
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                      {images.map((image, index) => (
                          <button
                              key={`${image}-${index}`}
                              type="button"
                              onClick={() => setActiveImage(index)}
                              aria-label={`View image ${index + 1}`}
                              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${
                                  activeImage === index
                                      ? "border-[#245C45]"
                                      : "border-zinc-200"
                              }`}
                          >
                            <img
                                src={image}
                                alt=""
                                className="h-full w-full object-contain p-1"
                            />
                          </button>
                      ))}
                    </div>
                )}
              </div>

              {/* Main product information */}
              <div className="min-w-0">
                <p className="text-sm text-zinc-500">
                  {product.brandName || product.brand || ""}
                </p>

                <h3 className="mt-1 font-['Manrope'] text-2xl font-extrabold leading-snug text-[#26372D]">
                  {product.name || "Unnamed product"}
                </h3>

                <p className="mt-4 text-3xl font-extrabold text-[#245C45]">
                  {formatPrice(product.price)}
                </p>

                {product.skuCode && (
                    <p className="mt-3 text-xs text-zinc-500">
                      SKU: {product.skuCode}
                    </p>
                )}

                <div className="my-5 border-t border-zinc-200" />

                <h4 className="font-semibold text-[#26372D]">
                  Product description
                </h4>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-600">
                  {product.description ||
                      "No description has been added for this product yet."}
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#F0F5EF] p-4">
                  <ShieldCheck
                      size={25}
                      className="shrink-0 text-[#245C45]"
                  />
                  <div>
                    <p className="font-semibold text-[#26372D]">
                      Warranty
                    </p>
                    <p className="text-sm text-zinc-600">
                      {Number.isFinite(Number(product.warrantyInMonth)) &&
                      Number(product.warrantyInMonth) > 0
                          ? `${Number(product.warrantyInMonth)} month${
                              Number(product.warrantyInMonth) === 1 ? "" : "s"
                          }`
                          : "No warranty specified"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-zinc-200 p-3">
                    <p className="text-xs text-zinc-500">
                      Category
                    </p>
                    <p className="mt-1 font-semibold capitalize text-[#26372D]">
                      {category}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-200 p-3">
                    <p className="text-xs text-zinc-500">
                      Availability status
                    </p>
                    <p className="mt-1 font-semibold text-[#26372D]">
                      {product.status || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical specifications */}
            <section className="border-t border-zinc-200 px-5 py-6 sm:px-7 sm:py-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#245C45]">
                Product information
              </p>

              <h3 className="mt-1 font-['Manrope'] text-xl font-extrabold text-[#26372D] sm:text-2xl">
                Technical Specifications
              </h3>

              {specifications.length > 0 ? (
                  <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
                    {specifications.map((specification, index) => (
                        <div
                            key={specification.label}
                            className={`grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-6 ${
                                index % 2 === 0
                                    ? "bg-[#F7F8F5]"
                                    : "bg-white"
                            }`}
                        >
                          <p className="text-sm font-semibold text-zinc-700">
                            {specification.label}
                          </p>
                          <p className="break-words text-sm leading-6 text-zinc-600">
                            {specification.value}
                          </p>
                        </div>
                    ))}
                  </div>
              ) : (
                  <p className="mt-4 rounded-xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-500">
                    Technical specifications have not been added for this product yet.
                  </p>
              )}
            </section>
          </div>
        </section>
      </div>
  );
}

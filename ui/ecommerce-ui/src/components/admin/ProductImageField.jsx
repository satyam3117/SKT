import { useEffect, useMemo } from "react";
import AuthenticatedImage from "../AuthenticatedImage";
import { getSortedProductImages, resolveProductImageUrl } from "../../utils/productImages";

function formatFileSize(size) {
  if (!Number.isFinite(size) || size <= 0) {
    return "0 KB";
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function ProductImageField({
  files,
  onChange,
  keycloak,
  existingImages = [],
  required = false,
  error = "",
  mode = "create",
}) {
  const previewItems = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        sizeLabel: formatFileSize(file.size),
        url: URL.createObjectURL(file),
      })),
    [files]
  );

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewItems]);

  const savedImages = getSortedProductImages(existingImages);
  const hasSelectedFiles = files.length > 0;
  const helpText =
    mode === "edit"
      ? "Leave this empty to keep the current photos. Selecting new files replaces the saved gallery."
      : "Upload one or more product photos before saving.";

  const handleFileChange = (event) => {
    onChange(Array.from(event.target.files || []));
  };

  return (
    <div className="product-image-field">
      <div className="product-image-field-header">
        <span className="field-label">
          Product Photos
          {required ? <span className="required-mark">*</span> : null}
        </span>
        <span className="field-hint">{helpText}</span>
      </div>

      <div className="image-upload-row">
        <input
          className="file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          aria-invalid={Boolean(error)}
        />
        {hasSelectedFiles ? (
          <button type="button" className="secondary-button" onClick={() => onChange([])}>
            Clear Selected
          </button>
        ) : null}
      </div>

      {error ? <span className="field-error">{error}</span> : null}

      {savedImages.length > 0 ? (
        <section className="image-gallery-shell">
          <h4>Current Photos</h4>
          <div className="image-gallery">
            {savedImages.map((image, index) => (
              <figure key={image.id || image.imageUrl || index} className="image-gallery-item">
                <AuthenticatedImage
                  keycloak={keycloak}
                  src={resolveProductImageUrl(image.imageUrl)}
                  fallbackSrc=""
                  alt={`Current product photo ${index + 1}`}
                  loading="lazy"
                />
                <span>Position {image.position ?? index + 1}</span>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {previewItems.length > 0 ? (
        <section className="image-gallery-shell">
          <h4>{mode === "edit" ? "Replacement Photos" : "Selected Photos"}</h4>
          <div className="image-gallery">
            {previewItems.map((item) => (
              <figure key={item.url} className="image-gallery-item">
                <img src={item.url} alt={item.name} />
                <span>
                  {item.name} ({item.sizeLabel})
                </span>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ProductImageField;

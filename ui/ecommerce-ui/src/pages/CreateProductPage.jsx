import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import DynamicProductForm from "../components/admin/DynamicProductForm";
import ProductImageField from "../components/admin/ProductImageField";
import {
  createProduct,
  getProductFormConfig,
  PRODUCT_TYPE_OPTIONS,
} from "../services/productApi";

function buildInitialValues(fields) {
  return fields.reduce((accumulator, field) => {
    accumulator[field.name] =
        field.type === "checkbox" ? false : "";
    return accumulator;
  }, {});
}

function normalizeSubmissionValue(field, value) {
  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "number") {
    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
      return field.required ? "" : null;
    }

    return Number(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed.length === 0
        ? field.required
            ? ""
            : null
        : trimmed;
  }

  return value;
}

/**
 * Converts a value into a category path.
 *
 * Supported values:
 *
 * "Electronics > Laptops > Business Laptops"
 *
 * OR
 *
 * ["Electronics", "Laptops", "Business Laptops"]
 */
function normalizeCategoryPath(value) {
  if (Array.isArray(value)) {
    return value
        .map((item) => String(item).trim())
        .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
        .split(">")
        .map((item) => item.trim())
        .filter(Boolean);
  }

  return [];
}

function getCategoryPathFromSelect(eventTarget) {
  if (!eventTarget?.selectedOptions?.length) {
    return [];
  }

  const selectedOption = eventTarget.selectedOptions[0];
  const encodedPath = selectedOption?.dataset?.categoryPath;

  if (!encodedPath) {
    return [];
  }

  try {
    const parsed = JSON.parse(encodedPath);
    return normalizeCategoryPath(parsed);
  } catch {
    return [];
  }
}

function CreateProductPage() {
  const { keycloak } = useOutletContext();
  const navigate = useNavigate();
  const requestIdRef = useRef(0);

  const [selectedType, setSelectedType] = useState("");
  const [formConfig, setFormConfig] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedTypeLabel = useMemo(
      () =>
          PRODUCT_TYPE_OPTIONS.find(
              (option) => option.value === selectedType
          )?.label || "",
      [selectedType]
  );

  const loadFormConfig = useCallback(
      async (productType) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        setLoadingConfig(true);
        setError("");
        setErrors({});
        setFormConfig(null);
        setValues({});
        setImageError("");
        setProductImages([]);

        try {
          const data = await getProductFormConfig(
              keycloak,
              productType
          );

          if (requestIdRef.current !== requestId) {
            return;
          }

          const fields = Array.isArray(data?.fields)
              ? data.fields
              : [];

          setFormConfig({
            productCategory:
                data?.productCategory || productType,
            fields,
          });

          setValues(buildInitialValues(fields));
        } catch (err) {
          if (requestIdRef.current === requestId) {
            setError(err.message);
          }
        } finally {
          if (requestIdRef.current === requestId) {
            setLoadingConfig(false);
          }
        }
      },
      [keycloak]
  );

  useEffect(() => {
    if (!selectedType) {
      return;
    }

    loadFormConfig(selectedType);
  }, [loadFormConfig, selectedType]);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleFieldChange = (event) => {
    const { name, type, checked, value } = event.target;
    const categoryPath = name === "categoryId" ? getCategoryPathFromSelect(event.target) : null;

    setValues((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "categoryId" ? { categoryPath } : {}),
    }));

    if (errors[name]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageChange = (files) => {
    setProductImages(files);
    setImageError("");
  };

  const validate = () => {
    if (!formConfig) {
      return false;
    }

    const nextErrors = {};

    for (const field of formConfig.fields) {
      const currentValue = values[field.name];

      const isEmpty =
          field.type === "checkbox"
              ? !currentValue
              : typeof currentValue !== "string" ||
              currentValue.trim().length === 0;

      if (field.required && isEmpty) {
        nextErrors[field.name] =
            `${field.label} is required.`;
      }
    }

    /*
     * Validate product images
     */
    if (productImages.length === 0) {
      setImageError(
          "At least one product photo is required."
      );
    } else {
      setImageError("");
    }

    setErrors(nextErrors);

    return (
        Object.keys(nextErrors).length === 0 &&
        productImages.length > 0
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formConfig || !selectedType) {
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      /*
       * Normalize all dynamic form fields first.
       */
      const payload = formConfig.fields.reduce(
          (accumulator, field) => {
            accumulator[field.name] =
                normalizeSubmissionValue(
                    field,
                    values[field.name]
                );

            return accumulator;
          },
          {
            productCategory:
                formConfig.productCategory || selectedType,
          }
      );

      /*
       * SKU
       *
       * The backend expects:
       *
       * skuCode: "LAPT-90462994"
       */
      const skuCode =
          values.skuCode ??
          values.sku ??
          payload.skuCode ??
          payload.sku ??
          "";

      /*
       * Category path
       *
       * Preferred:
       *
       * values.categoryPath
       *
       * Also supports:
       *
       * values.category
       *
       * values.categories
       */
      let categoryPath = normalizeCategoryPath(
          values.categoryPath ??
          payload.categoryPath ??
          values.category ??
          values.categories ??
          payload.category ??
          payload.categories
      );

      /*
       * If categoryPath was not explicitly supplied,
       * use the product category as a fallback.
       *
       * Example:
       *
       * productCategory = "Electronics"
       *
       * becomes:
       *
       * ["Electronics"]
       */
      if (categoryPath.length === 0) {
        categoryPath = normalizeCategoryPath(
            payload.productCategory
        );
      }

      /*
       * Send SKU/category information with the request.
       *
       * createProduct() should use these values when
       * constructing the multipart request.
       */
      const submissionPayload = {
        ...payload,
        skuCode,
        categoryPath,
      };

      await createProduct(
          keycloak,
          submissionPayload,
          productImages
      );

      /*
       * Reset form after successful creation.
       */
      setError("");
      setSelectedType("");
      setFormConfig(null);
      setValues({});
      setErrors({});
      setImageError("");
      setProductImages([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!formConfig) {
      return;
    }

    setValues(buildInitialValues(formConfig.fields));
    setErrors({});
    setError("");
    setImageError("");
    setProductImages([]);
  };

  const handleCancel = () => {
    navigate("/admin/products");
  };

  return (
      <section className="admin-page">
        <div className="admin-hero">
          <div>
          <span className="eyebrow">
            Admin Product Entry
          </span>

            <h2>Create Product</h2>

            <p>
              Choose a product type to load a backend-driven
              form configuration.
            </p>
          </div>
        </div>

        <section className="page-card create-product-card">
          <label className="product-type-picker">
          <span className="field-label">
            Product Type{" "}
            <span className="required-mark">*</span>
          </span>

            <select
                value={selectedType}
                onChange={handleTypeChange}
            >
              <option value="">
                Select a product type
              </option>

              {PRODUCT_TYPE_OPTIONS.map((option) => (
                  <option
                      key={option.value}
                      value={option.value}
                  >
                    {option.label}
                  </option>
              ))}
            </select>
          </label>

          {error ? (
              <p className="status error">{error}</p>
          ) : null}

          {loadingConfig ? (
              <section className="empty-state panel-empty">
                <h3>
                  Loading form configuration...
                </h3>

                <p>
                  Fetching fields for{" "}
                  {selectedTypeLabel ||
                      "the selected product type"}
                  .
                </p>
              </section>
          ) : (
              <DynamicProductForm
                  formConfig={formConfig}
                  values={values}
                  errors={errors}
                  submitting={submitting}
                  onChange={handleFieldChange}
                  onSubmit={handleSubmit}
                  onReset={handleReset}
                  onCancel={handleCancel}
              >
                <section className="page-card">
                  <ProductImageField
                      files={productImages}
                      onChange={handleImageChange}
                      error={imageError}
                      required
                  />
                </section>
              </DynamicProductForm>
          )}
        </section>
      </section>
  );
}

export default CreateProductPage;
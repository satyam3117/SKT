import { useEffect, useMemo, useState } from "react";
import DynamicProductForm from "./DynamicProductForm";
import ProductImageField from "./ProductImageField";
import { getProductFormConfig } from "../../services/productApi";

function buildInitialValues(fields, product) {
  return fields.reduce((accumulator, field) => {
    const value = product?.[field.name];

    if (field.type === "checkbox") {
      accumulator[field.name] = Boolean(value);
      return accumulator;
    }

    accumulator[field.name] =
      value === undefined || value === null
        ? ""
        : typeof value === "number"
          ? value.toString()
          : Array.isArray(value)
            ? value.join(", ")
            : value.toString();

    return accumulator;
  }, {});
}

function normalizeSubmissionValue(field, value) {
  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "number") {
    if (value === "" || value === null || value === undefined) {
      return field.required ? "" : null;
    }

    return Number(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? (field.required ? "" : null) : trimmed;
  }

  return value;
}

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

function ProductEditorModal({
  open,
  initialProduct,
  loading,
  saving,
  keycloak,
  onClose,
  onSave,
}) {
  const [formConfig, setFormConfig] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [productImages, setProductImages] = useState([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState("");

  const productType = useMemo(
    () => (initialProduct?.productCategory || "").toLowerCase(),
    [initialProduct]
  );

  useEffect(() => {
    if (!open || !initialProduct) {
      setFormConfig(null);
      setValues({});
      setErrors({});
      setProductImages([]);
      setConfigLoading(false);
      setConfigError("");
      return;
    }

    let active = true;

    async function loadConfig() {
      setConfigLoading(true);
      setConfigError("");

      try {
        const data = await getProductFormConfig(keycloak, productType);
        if (!active) {
          return;
        }

        const fields = Array.isArray(data?.fields) ? data.fields : [];
        const config = {
          productCategory: data?.productCategory || productType,
          fields,
        };

        setFormConfig(config);
        setValues(buildInitialValues(fields, initialProduct));
      } catch (err) {
        if (active) {
          setConfigError(err.message);
        }
      } finally {
        if (active) {
          setConfigLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      active = false;
    };
  }, [open, initialProduct, keycloak, productType]);

  if (!open) {
    return null;
  }

  if (loading && !initialProduct) {
    return (
      <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
        <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="product-editor-title">
          <header className="modal-header">
            <div>
              <h3 id="product-editor-title">Loading product...</h3>
              <p>Fetching the latest details before editing.</p>
            </div>
            <button type="button" className="ghost-button" onClick={onClose}>
              Close
            </button>
          </header>
          <p className="status">Please wait.</p>
        </section>
      </div>
    );
  }

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
          : typeof currentValue !== "string" || currentValue.trim().length === 0;

      if (field.required && isEmpty) {
        nextErrors[field.name] = `${field.label} is required.`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReset = () => {
    if (!formConfig) {
      return;
    }

    setValues(buildInitialValues(formConfig.fields, initialProduct));
    setErrors({});
    setProductImages([]);
  };

  const handleImageChange = (files) => {
    setProductImages(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formConfig || !initialProduct) {
      return;
    }

    if (!validate()) {
      return;
    }

    const payload = formConfig.fields.reduce(
      (accumulator, field) => {
        accumulator[field.name] = normalizeSubmissionValue(field, values[field.name]);
        return accumulator;
      },
      {
        productCategory: initialProduct.productCategory,
      }
    );

    const categoryPath = normalizeCategoryPath(values.categoryPath ?? initialProduct.categoryPath);

    if (categoryPath.length > 0) {
      payload.categoryPath = categoryPath;
    }

    try {
      await onSave(payload, productImages);
    } catch {
      return;
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-editor-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h3 id="product-editor-title">Edit Product</h3>
            <p>
              Update the backend-driven fields for {initialProduct.name}.
            </p>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </header>

        {configLoading ? (
          <section className="empty-state panel-empty">
            <h3>Loading form configuration...</h3>
            <p>Fetching fields for {initialProduct.productCategory}.</p>
          </section>
        ) : configError ? (
          <p className="status error">{configError}</p>
        ) : (
          <DynamicProductForm
            formConfig={formConfig}
            values={values}
            errors={errors}
            submitting={saving}
            submitLabel="Update Product"
            busyLabel="Updating..."
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onCancel={onClose}
          >
            <section className="page-card">
              <ProductImageField
                files={productImages}
                onChange={handleImageChange}
                keycloak={keycloak}
                existingImages={initialProduct.productImages}
                mode="edit"
              />
            </section>
          </DynamicProductForm>
        )}
      </section>
    </div>
  );
}

export default ProductEditorModal;

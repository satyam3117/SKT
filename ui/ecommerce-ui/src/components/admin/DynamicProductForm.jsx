const fieldRenderers = {
  text: renderTextField,
  number: renderNumberField,
  textarea: renderTextareaField,
  email: renderEmailField,
  date: renderDateField,
  select: renderSelectField,
  checkbox: renderCheckboxField,
};

function renderTextField(field, value, onChange, error) {
  return (
    <input
      id={field.name}
      name={field.name}
      type="text"
      value={value}
      onChange={onChange}
      aria-invalid={Boolean(error)}
    />
  );
}

function renderEmailField(field, value, onChange, error) {
  return (
    <input
      id={field.name}
      name={field.name}
      type="email"
      value={value}
      onChange={onChange}
      aria-invalid={Boolean(error)}
    />
  );
}

function renderDateField(field, value, onChange, error) {
  return (
    <input
      id={field.name}
      name={field.name}
      type="date"
      value={value}
      onChange={onChange}
      aria-invalid={Boolean(error)}
    />
  );
}

function renderNumberField(field, value, onChange, error) {
  return (
    <input
      id={field.name}
      name={field.name}
      type="number"
      value={value}
      onChange={onChange}
      aria-invalid={Boolean(error)}
    />
  );
}

function renderTextareaField(field, value, onChange, error) {
  return (
    <textarea
      id={field.name}
      name={field.name}
      rows={field.rows || 4}
      value={value}
      onChange={onChange}
      aria-invalid={Boolean(error)}
    />
  );
}

function renderSelectField(field, value, onChange, error) {
  const options = Array.isArray(field.options) ? field.options : [];
  const hasCurrentValue = value !== "" && !options.some((option) => option.value === value);

  return (
    <select
      id={field.name}
      name={field.name}
      value={value}
      onChange={onChange}
      aria-invalid={Boolean(error)}
    >
      <option value="">Select {field.label}</option>
      {hasCurrentValue ? (
        <option value={value}>{value} (current)</option>
      ) : null}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          data-category-path={
            Array.isArray(option.categoryPath) && option.categoryPath.length > 0
              ? JSON.stringify(option.categoryPath)
              : undefined
          }
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

function renderCheckboxField(field, value, onChange, error) {
  return (
    <input
      id={field.name}
      name={field.name}
      type="checkbox"
      checked={Boolean(value)}
      onChange={onChange}
      aria-invalid={Boolean(error)}
    />
  );
}

function DynamicProductForm({
  formConfig,
  values,
  errors,
  submitting,
  children,
  submitLabel = "Create Product",
  busyLabel = "Creating...",
  onChange,
  onSubmit,
  onReset,
  onCancel,
}) {
  if (!formConfig) {
    return (
      <section className="empty-state panel-empty">
        <h3>Select a product type</h3>
        <p>Choose a type above to load its backend-driven product form.</p>
      </section>
    );
  }

  const renderField = (field) => {
    const renderer = fieldRenderers[field.type] || fieldRenderers.text;
    const value = field.type === "checkbox" ? values[field.name] : values[field.name] ?? "";
    const error = errors[field.name];

    if (field.type === "checkbox") {
      return (
        <div key={field.name} className="checkbox-field-shell">
          <label className="checkbox-field">
            {renderer(field, value, onChange, error)}
            <span>
              {field.label}
              {field.required ? <span className="required-mark">*</span> : null}
            </span>
          </label>
          {error ? <span className="field-error">{error}</span> : null}
        </div>
      );
    }

    return (
      <label key={field.name} className={field.type === "textarea" ? "span-2" : ""}>
        <span className="field-label">
          {field.label}
          {field.required ? <span className="required-mark">*</span> : null}
        </span>
        {renderer(field, value, onChange, error)}
        {error ? <span className="field-error">{error}</span> : null}
      </label>
    );
  };

  return (
    <form className="dynamic-product-form" onSubmit={onSubmit}>
      <section className="page-card">
        <div className="page-title-row">
          <h3>Product Details</h3>
          <span className="form-badge">{formConfig.productCategory}</span>
        </div>
        <div className="modal-grid dynamic-form-grid">{formConfig.fields.map(renderField)}</div>
      </section>

      {children}

      <footer className="form-actions">
        <button type="button" className="secondary-button" onClick={onReset} disabled={submitting}>
          Reset
        </button>
        <button type="button" className="ghost-button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}>
          {submitting ? busyLabel : submitLabel}
        </button>
      </footer>
    </form>
  );
}

export default DynamicProductForm;

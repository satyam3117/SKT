
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, LoaderCircle, Save } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import {
    createProduct,
    getBrands,
    getProduct,
    getProductCategories,
    getProductFormConfig,
    updateProduct,
} from "../../services/productApi.js";

const INITIAL_FORM = {
    name: "",
    description: "",
    price: "",
    productCategory: "LAPTOP",
    brandId: "",
    categoryId: "",
    processor: "",
    ramGb: "",
    storageGb: "",
    graphics: "",
    screenSize: "",
    mouse: "",
    keyboard: "",
};

const SPECIFICATION_KEYS = new Set([
    "processor",
    "ramGb",
    "storageGb",
    "graphics",
    "screenSize",
    "mouse",
    "keyboard",
]);

const INPUT_STYLE = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #dbe2ee",
    borderRadius: 9,
    fontSize: 14,
    color: "#172033",
    background: "#fff",
};

const LABEL_STYLE = {
    display: "block",
    fontSize: 13,
    fontWeight: 650,
    marginBottom: 7,
    color: "#334155",
};

const PANEL_STYLE = {
    background: "#fff",
    border: "1px solid #e5e9f2",
    borderRadius: 14,
    padding: 22,
    marginBottom: 18,
};

function getId(item) {
    return item?.id ?? item?._id ?? item?.categoryId ?? item?.brandId ?? "";
}

function normalizeId(value) {
    return value == null ? "" : String(value);
}

function getParentId(category) {
    return normalizeId(category?.parentId);
}

function getLevel(category) {
    const level = Number(category?.level);
    return Number.isFinite(level) ? level : -1;
}

function displayCategory(category) {
    return category?.name || category?.displayName || category?.slug || getId(category);
}

function normalizeCategoryName(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");
}

function toProductCategory(category) {
    const text = normalizeCategoryName(
        `${category?.name || ""} ${category?.slug || ""}`
    );

    if (text.includes("laptop") || text.includes("notebook")) {
        return "LAPTOP";
    }

    if (
        text.includes("computer") ||
        text.includes("desktop") ||
        text.includes("workstation")
    ) {
        return "COMPUTER";
    }

    return String(category?.slug || category?.name || "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
}

function getErrorMessage(error) {
    const data = error?.response?.data ?? error?.data;

    if (typeof data === "string") return data;

    return (
        data?.message ||
        data?.detail ||
        error?.message ||
        "The request failed."
    );
}

function getItems(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.content)) return data.content;
    return [];
}

function Field({ field, value, onChange }) {
    const id = `product-${field.name}`;
    const type = String(field.type || "text").toLowerCase();
    const isSelect = type === "select";
    const isTextarea = type === "textarea";
    const isNumber = type === "number";

    const commonProps = {
        id,
        name: field.name,
        value: value ?? "",
        onChange,
        required: Boolean(field.required),
        style: INPUT_STYLE,
    };

    return (
        <div style={{ minWidth: 0 }}>
            <label htmlFor={id} style={LABEL_STYLE}>
                {field.label || field.name}
                {field.required ? " *" : ""}
            </label>

            {isSelect ? (
                <select {...commonProps}>
                    <option value="">Select {field.label || field.name}</option>
                    {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label || option.value}
                        </option>
                    ))}
                </select>
            ) : isTextarea ? (
                <textarea
                    {...commonProps}
                    rows={4}
                    style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit" }}
                />
            ) : (
                <input
                    {...commonProps}
                    type={isNumber ? "number" : "text"}
                    min={field.min ?? (isNumber ? 0 : undefined)}
                    max={field.max}
                    step={isNumber ? "any" : undefined}
                    placeholder={field.placeholder || ""}
                />
            )}

            {field.helpText && (
                <small style={{ display: "block", color: "#64748b", marginTop: 5 }}>
                    {field.helpText}
                </small>
            )}
        </div>
    );
}

function CategorySelect({
                            id,
                            label,
                            value,
                            options,
                            onChange,
                            placeholder,
                            disabled = false,
                        }) {
    return (
        <div style={{ minWidth: 0 }}>
            <label htmlFor={id} style={LABEL_STYLE}>
                {label} *
            </label>

            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required
                disabled={disabled}
                style={{
                    ...INPUT_STYLE,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.65 : 1,
                }}
            >
                <option value="">{placeholder}</option>
                {options.map((item) => {
                    const itemId = normalizeId(getId(item));
                    return (
                        <option key={itemId} value={itemId}>
                            {displayCategory(item)}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

export default function ProductForm() {
    const { id } = useParams();
    const editing = Boolean(id);
    const navigate = useNavigate();
    const { getAccessToken } = useAuth();

    const [form, setForm] = useState(INITIAL_FORM);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [images, setImages] = useState([]);
    const [existingProduct, setExistingProduct] = useState(null);

    const [selectedTopCategoryId, setSelectedTopCategoryId] = useState("");
    const [selectedTypeCategoryId, setSelectedTypeCategoryId] = useState("");

    const [formConfig, setFormConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [configLoading, setConfigLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [configError, setConfigError] = useState("");

    // Load categories, brands and product details for edit mode.
    useEffect(() => {
        let active = true;

        async function loadPage() {
            setLoading(true);
            setError("");

            try {
                const [categoryData, brandData, productData] = await Promise.all([
                    getProductCategories(),
                    getBrands(),
                    editing ? getProduct(id) : Promise.resolve(null),
                ]);

                if (!active) return;

                const categoryList = getItems(categoryData);
                setCategories(categoryList);
                setBrands(getItems(brandData));

                if (productData) {
                    setExistingProduct(productData);

                    const savedCategoryId = normalizeId(productData.categoryId);
                    const savedLeaf = categoryList.find(
                        (item) => normalizeId(getId(item)) === savedCategoryId
                    );

                    const savedType = savedLeaf
                        ? categoryList.find(
                            (item) =>
                                normalizeId(getId(item)) === getParentId(savedLeaf)
                        )
                        : null;

                    const savedTop = savedType
                        ? categoryList.find(
                            (item) =>
                                normalizeId(getId(item)) === getParentId(savedType)
                        )
                        : null;

                    setSelectedTopCategoryId(savedTop ? normalizeId(getId(savedTop)) : "");
                    setSelectedTypeCategoryId(savedType ? normalizeId(getId(savedType)) : "");

                    setForm({
                        ...INITIAL_FORM,
                        ...productData,
                        name: productData.name ?? "",
                        description: productData.description ?? "",
                        price: productData.price ?? "",
                        productCategory: String(
                            productData.productCategory ?? "LAPTOP"
                        ).toUpperCase(),
                        brandId: normalizeId(productData.brandId),
                        categoryId: savedCategoryId,
                    });
                }
            } catch (err) {
                if (active) setError(getErrorMessage(err));
            } finally {
                if (active) setLoading(false);
            }
        }

        loadPage();

        return () => {
            active = false;
        };
    }, [id, editing]);

    // Fetch the form schema whenever the backend product type changes.
    useEffect(() => {
        if (!form.productCategory) {
            setFormConfig(null);
            setConfigError("");
            return undefined;
        }

        let active = true;

        async function loadConfig() {
            setConfigLoading(true);
            setConfigError("");

            try {
                const result = await getProductFormConfig(form.productCategory);

                if (active) {
                    setFormConfig(result);
                }
            } catch (err) {
                if (active) {
                    setFormConfig(null);
                    setConfigError(
                        `Could not load fields for ${form.productCategory}: ${getErrorMessage(err)}`
                    );
                }
            } finally {
                if (active) setConfigLoading(false);
            }
        }

        loadConfig();

        return () => {
            active = false;
        };
    }, [form.productCategory]);

    const availableCategories = useMemo(
        () => categories.filter((item) => item?.active !== false),
        [categories]
    );

    const topCategories = useMemo(
        () =>
            availableCategories
                .filter((item) => getLevel(item) === 0)
                .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)),
        [availableCategories]
    );

    const typeCategories = useMemo(
        () =>
            availableCategories
                .filter(
                    (item) =>
                        getLevel(item) === 1 &&
                        getParentId(item) === selectedTopCategoryId
                )
                .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)),
        [availableCategories, selectedTopCategoryId]
    );

    const leafCategories = useMemo(
        () =>
            availableCategories
                .filter(
                    (item) =>
                        getLevel(item) === 2 &&
                        getParentId(item) === selectedTypeCategoryId
                )
                .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)),
        [availableCategories, selectedTypeCategoryId]
    );

    // The backend supplies the specification field definitions.
    // Basic fields, brand, and the category hierarchy have dedicated UI controls.
    const specificationFields = useMemo(() => {
        const fields = Array.isArray(formConfig?.fields) ? formConfig.fields : [];

        return fields.filter(
            (field) =>
                SPECIFICATION_KEYS.has(field.name) &&
                field.name !== "categoryId"
        );
    }, [formConfig]);

    function changeField(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setError("");
    }

    function changeTopCategory(event) {
        setSelectedTopCategoryId(event.target.value);
        setSelectedTypeCategoryId("");

        setForm((current) => ({
            ...current,
            categoryId: "",
            productCategory: "",
        }));

        setError("");
    }

    function changeTypeCategory(event) {
        const nextTypeId = event.target.value;
        const selectedType = availableCategories.find(
            (item) => normalizeId(getId(item)) === nextTypeId
        );

        setSelectedTypeCategoryId(nextTypeId);

        setForm((current) => ({
            ...current,
            categoryId: "",
            productCategory: selectedType ? toProductCategory(selectedType) : "",
        }));

        setError("");
    }

    function changeLeafCategory(event) {
        setForm((current) => ({ ...current, categoryId: event.target.value }));
        setError("");
    }

    function changeImages(event) {
        const selected = Array.from(event.target.files || []);

        if (selected.length > 8) {
            setError("Select no more than 8 images.");
            event.target.value = "";
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        const invalidImage = selected.find((image) => !validTypes.includes(image.type));

        if (invalidImage) {
            setError("Only JPEG, PNG, and WebP images are supported.");
            event.target.value = "";
            return;
        }

        setImages(selected);
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!form.productCategory) {
            setError("Select a valid product type.");
            return;
        }

        if (!form.categoryId) {
            setError("Select a leaf category before saving.");
            return;
        }

        if (!form.brandId) {
            setError("Select a brand before saving.");
            return;
        }

        if (!editing && images.length === 0) {
            setError("Select at least one product image before creating a product.");
            return;
        }

        if (configLoading) {
            setError("Wait for the product fields to finish loading.");
            return;
        }

        if (configError) {
            setError("The product form configuration did not load. Resolve that error before saving.");
            return;
        }

        const requiredFields = (formConfig?.fields || []).filter(
            (field) => field.required && SPECIFICATION_KEYS.has(field.name)
        );

        const missingField = requiredFields.find(
            (field) => !String(form[field.name] ?? "").trim()
        );

        if (missingField) {
            setError(`${missingField.label || missingField.name} is required.`);
            return;
        }

        const payload = new FormData();

        // Only send fields currently supported by ProductRequest.
        const allowedFields = [
            "name",
            "description",
            "price",
            "productCategory",
            "brandId",
            "categoryId",
            ...SPECIFICATION_KEYS,
        ];

        for (const key of allowedFields) {
            const value = form[key];

            if (value !== undefined && value !== null && String(value).trim() !== "") {
                payload.append(
                    key,
                    key === "productCategory"
                        ? String(value).toUpperCase()
                        : String(value).trim()
                );
            }
        }

        images.forEach((image) => payload.append("productImages", image));

        setSaving(true);

        try {
            const token = await getAccessToken();

            if (editing) {
                await updateProduct(id, payload, token);
            } else {
                await createProduct(payload, token);
            }

            navigate("/admin/products", {
                replace: true,
                state: {
                    notice: editing
                        ? "Product updated successfully."
                        : "Product created successfully.",
                },
            });
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    const buttonStyle = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "11px 15px",
        borderRadius: 9,
        background: "#176b52",
        color: "#fff",
        border: "1px solid #176b52",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 650,
        cursor: saving ? "wait" : "pointer",
        opacity: saving ? 0.7 : 1,
    };

    const secondaryStyle = {
        ...buttonStyle,
        background: "#fff",
        color: "#334155",
        borderColor: "#dbe2ee",
    };

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
        gap: 18,
    };

    if (loading) {
        return (
            <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
                <p><LoaderCircle size={18} /> Loading product form…</p>
            </main>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f6f8f3",
                color: "#172033",
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            <header
                style={{
                    background: "#fff",
                    borderBottom: "1px solid #e5e9f2",
                    padding: "16px 5%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <strong>{editing ? "Edit product" : "Create product"}</strong>
                    <div style={{ color: "#64748b", fontSize: 12 }}>
                        SKT · Product catalogue
                    </div>
                </div>

                <Link to="/admin/products" style={secondaryStyle}>
                    <ArrowLeft size={16} /> Back to products
                </Link>
            </header>

            <main style={{ width: "min(1000px, 92%)", margin: "0 auto", padding: "28px 0 48px" }}>
                <h1 style={{ fontSize: 30, letterSpacing: "-.04em", margin: "0 0 8px" }}>
                    {editing ? "Update product details" : "Add a new product"}
                </h1>

                <p style={{ color: "#64748b", lineHeight: 1.6 }}>
                    Select a product type to load its fields from the backend.
                </p>

                {error && (
                    <div role="alert" style={{ padding: 14, borderRadius: 10, background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3", marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <section style={PANEL_STYLE}>
                        <h2 style={{ fontSize: 18, margin: "0 0 18px" }}>Basic information</h2>

                        <div style={gridStyle}>
                            <div>
                                <label htmlFor="name" style={LABEL_STYLE}>Product name *</label>
                                <input id="name" name="name" value={form.name} onChange={changeField} required maxLength={50} style={INPUT_STYLE} placeholder="e.g. ASUS ROG Strix G15" />
                            </div>

                            <div>
                                <label htmlFor="price" style={LABEL_STYLE}>Price (INR) *</label>
                                <input id="price" name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={changeField} required style={INPUT_STYLE} placeholder="84999.00" />
                            </div>

                            <CategorySelect id="mainCategory" label="Main category (Level 0)" value={selectedTopCategoryId} options={topCategories} onChange={changeTopCategory} placeholder="Select main category" />

                            <CategorySelect id="productType" label="Product type (Level 1)" value={selectedTypeCategoryId} options={typeCategories} onChange={changeTypeCategory} placeholder="Select product type first" disabled={!selectedTopCategoryId} />

                            <CategorySelect id="categoryId" label="Leaf category (Level 2)" value={form.categoryId} options={leafCategories} onChange={changeLeafCategory} placeholder="Select leaf category" disabled={!selectedTypeCategoryId} />

                            <div>
                                <label htmlFor="brandId" style={LABEL_STYLE}>Brand *</label>
                                <select id="brandId" name="brandId" value={form.brandId} onChange={changeField} required style={INPUT_STYLE}>
                                    <option value="">Select a brand</option>
                                    {brands.map((brand) => {
                                        const brandId = normalizeId(getId(brand));
                                        return (
                                            <option key={brandId || brand.name} value={brandId}>
                                                {brand.name || brand.displayName || brandId}
                                            </option>
                                        );
                                    })}
                                </select>
                                {brands.length === 0 && (
                                    <small style={{ display: "block", marginTop: 6, color: "#b45309" }}>
                                        No brands were returned by the API.
                                    </small>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                            <label htmlFor="description" style={LABEL_STYLE}>Description *</label>
                            <textarea id="description" name="description" value={form.description} onChange={changeField} required maxLength={300} rows={4} style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit" }} />
                            <div style={{ textAlign: "right", color: "#64748b", fontSize: 12 }}>
                                {String(form.description || "").length}/300
                            </div>
                        </div>
                    </section>

                    <section style={PANEL_STYLE}>
                        <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>Technical specifications</h2>
                        <p style={{ color: "#64748b", fontSize: 13 }}>
                            These fields are loaded from the form-config endpoint for the selected product type.
                        </p>

                        {configLoading && (
                            <p><LoaderCircle size={16} /> Loading product-specific fields…</p>
                        )}

                        {configError && (
                            <div role="alert" style={{ padding: 12, background: "#fff7ed", color: "#9a3412", borderRadius: 8 }}>
                                {configError}
                            </div>
                        )}

                        {!configLoading && !configError && formConfig && (
                            specificationFields.length > 0 ? (
                                <div style={gridStyle}>
                                    {specificationFields.map((field) => (
                                        <Field
                                            key={field.name}
                                            field={field}
                                            value={form[field.name] ?? ""}
                                            onChange={changeField}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: "#64748b", fontSize: 13 }}>
                                    No technical specification fields are configured for this product type yet.
                                </p>
                            )
                        )}

                        <div style={{ marginTop: 14, padding: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13 }}>
                            <strong>Backend product type:</strong> {form.productCategory || "Not selected"}
                        </div>
                    </section>

                    <section style={PANEL_STYLE}>
                        <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>Product images</h2>
                        <p style={{ color: "#64748b", fontSize: 13 }}>
                            JPEG, PNG and WebP are supported. Select up to 8 images.
                        </p>

                        {editing && existingProduct?.productImages?.length > 0 && (
                            <p style={{ color: "#475569", fontSize: 13 }}>
                                Existing images: {existingProduct.productImages.length}. Leave uploads empty if your backend preserves existing images.
                            </p>
                        )}

                        <label htmlFor="productImages" style={secondaryStyle}>
                            <ImagePlus size={17} /> Choose images
                        </label>

                        <input
                            id="productImages"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={changeImages}
                            style={{ display: "block", marginTop: 12 }}
                        />

                        <ul style={{ fontSize: 13, color: "#475569", paddingLeft: 20 }}>
                            {images.map((image, index) => (
                                <li key={`${image.name}-${index}`}>
                                    {image.name} ({Math.ceil(image.size / 1024)} KB)
                                </li>
                            ))}
                        </ul>

                        {!images.length && <p style={{ color: "#64748b", fontSize: 13 }}>No new images selected.</p>}
                    </section>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button type="submit" disabled={saving || configLoading} style={buttonStyle}>
                            {saving ? <LoaderCircle size={16} /> : <Save size={16} />}
                            {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
                        </button>

                        <Link to="/admin/products" style={secondaryStyle}>Cancel</Link>
                    </div>
                </form>
            </main>
        </div>
    );
}

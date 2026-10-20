import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ImagePlus,
    LoaderCircle,
    Save,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import {
    createProduct,
    getBrands,
    getProduct,
    getProductCategories,
    updateProduct,
} from "../../services/productApi.js";

const initialForm = {
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

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #dbe2ee",
    borderRadius: 9,
    fontSize: 14,
    color: "#172033",
    background: "#fff",
};

const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 650,
    marginBottom: 7,
    color: "#334155",
};

const fieldStyle = { minWidth: 0 };

const panelStyle = {
    background: "#fff",
    border: "1px solid #e5e9f2",
    borderRadius: 14,
    padding: 22,
    marginBottom: 18,
};

function getId(item) {
    return item?.id ??
        item?._id ??
        item?.categoryId ??
        item?.brandId ??
        "";
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
    return (
        category?.name ||
        category?.displayName ||
        category?.slug ||
        getId(category)
    );
}

function normalizeCategoryName(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");
}

/*
 * The category hierarchy comes from the database.
 *
 * productCategory is also sent separately because the current
 * backend model uses values such as LAPTOP and COMPUTER.
 *
 * Update this mapping if your backend ProductCategory enum uses
 * different names.
 */
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
        text.includes("workstation") ||
        text.includes("personal computer")
    ) {
        return "COMPUTER";
    }

    return String(category?.slug || category?.name || "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
}

function getErrorMessage(error) {
    const data = error?.response?.data;

    if (typeof data === "string") {
        return data;
    }

    return (
        data?.message ||
        data?.detail ||
        error?.message ||
        "The request failed."
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    required = false,
    type = "text",
    placeholder,
    help,
}) {
    return (
        <div style={fieldStyle}>
            <label htmlFor={name} style={labelStyle}>
                {label}
                {required ? " *" : ""}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                min={type === "number" ? "0" : undefined}
                step={type === "number" ? "any" : undefined}
                style={inputStyle}
            />

            {help && (
                <div
                    style={{
                        color: "#64748b",
                        fontSize: 12,
                        marginTop: 6,
                    }}
                >
                    {help}
                </div>
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
    required = false,
}) {
    return (
        <div style={fieldStyle}>
            <label htmlFor={id} style={labelStyle}>
                {label}
                {required ? " *" : ""}
            </label>

            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                style={{
                    ...inputStyle,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.65 : 1,
                }}
            >
                <option value="">{placeholder}</option>

                {options.map((category) => {
                    const categoryId = normalizeId(getId(category));

                    return (
                        <option
                            key={categoryId}
                            value={categoryId}
                        >
                            {displayCategory(category)}
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

    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [images, setImages] = useState([]);
    const [existingProduct, setExistingProduct] = useState(null);

    const [selectedTopCategoryId, setSelectedTopCategoryId] =
        useState("");

    const [selectedTypeCategoryId, setSelectedTypeCategoryId] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    /*
     * Load database categories, brands and (when editing) product.
     */
    useEffect(() => {
        let active = true;

        async function loadForm() {
            setLoading(true);
            setError("");

            try {
                const [categoryData, brandData, productData] =
                    await Promise.all([
                        getProductCategories(),
                        getBrands(),
                        editing ? getProduct(id) : Promise.resolve(null),
                    ]);

                if (!active) return;

                const categoryList = Array.isArray(categoryData)
                    ? categoryData
                    : Array.isArray(categoryData?.content)
                        ? categoryData.content
                        : Array.isArray(categoryData?.items)
                            ? categoryData.items
                            : [];

                const brandList = Array.isArray(brandData)
                    ? brandData
                    : Array.isArray(brandData?.content)
                        ? brandData.content
                        : Array.isArray(brandData?.items)
                            ? brandData.items
                            : [];

                setCategories(categoryList);
                setBrands(brandList);

                if (productData) {
                    setExistingProduct(productData);

                    const savedCategoryId = normalizeId(
                        productData.categoryId
                    );

                    const savedLeaf = categoryList.find(
                        (category) =>
                            normalizeId(getId(category)) ===
                            savedCategoryId
                    );

                    const savedType = savedLeaf
                        ? categoryList.find(
                            (category) =>
                                normalizeId(getId(category)) ===
                                getParentId(savedLeaf)
                        )
                        : null;

                    const savedTop = savedType
                        ? categoryList.find(
                            (category) =>
                                normalizeId(getId(category)) ===
                                getParentId(savedType)
                        )
                        : null;

                    setSelectedTopCategoryId(
                        savedTop ? normalizeId(getId(savedTop)) : ""
                    );

                    setSelectedTypeCategoryId(
                        savedType ? normalizeId(getId(savedType)) : ""
                    );

                    setForm({
                        ...initialForm,
                        name: productData.name ?? "",
                        description: productData.description ?? "",
                        price: productData.price ?? "",
                        productCategory: String(
                            productData.productCategory ?? "LAPTOP"
                        ).toUpperCase(),
                        brandId: normalizeId(productData.brandId),
                        categoryId: savedCategoryId,
                        processor: productData.processor ?? "",
                        ramGb: productData.ramGb ?? "",
                        storageGb: productData.storageGb ?? "",
                        graphics: productData.graphics ?? "",
                        screenSize: productData.screenSize ?? "",
                        mouse: productData.mouse ?? "",
                        keyboard: productData.keyboard ?? "",
                    });
                }
            } catch (err) {
                if (active) {
                    setError(getErrorMessage(err));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadForm();

        return () => {
            active = false;
        };
    }, [id, editing]);

    /*
     * Only active database categories should be selectable.
     */
    const availableCategories = useMemo(
        () =>
            categories.filter(
                (category) => category?.active !== false
            ),
        [categories]
    );

    /*
     * Level 0: Main category.
     */
    const topCategories = useMemo(
        () =>
            availableCategories
                .filter((category) => getLevel(category) === 0)
                .sort(
                    (a, b) =>
                        Number(a.sortOrder ?? 0) -
                        Number(b.sortOrder ?? 0)
                ),
        [availableCategories]
    );

    /*
     * Level 1: Product type under the selected main category.
     */
    const typeCategories = useMemo(
        () =>
            availableCategories
                .filter(
                    (category) =>
                        getLevel(category) === 1 &&
                        getParentId(category) === selectedTopCategoryId
                )
                .sort(
                    (a, b) =>
                        Number(a.sortOrder ?? 0) -
                        Number(b.sortOrder ?? 0)
                ),
        [availableCategories, selectedTopCategoryId]
    );

    /*
     * Level 2: Leaf category under the selected product type.
     */
    const leafCategories = useMemo(
        () =>
            availableCategories
                .filter(
                    (category) =>
                        getLevel(category) === 2 &&
                        getParentId(category) === selectedTypeCategoryId
                )
                .sort(
                    (a, b) =>
                        Number(a.sortOrder ?? 0) -
                        Number(b.sortOrder ?? 0)
                ),
        [availableCategories, selectedTypeCategoryId]
    );

    function changeField(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    /*
     * Changing a parent clears all child selections.
     */
    function changeTopCategory(event) {
        const nextTopId = event.target.value;

        setSelectedTopCategoryId(nextTopId);
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
            (category) =>
                normalizeId(getId(category)) === nextTypeId
        );

        setSelectedTypeCategoryId(nextTypeId);

        setForm((current) => ({
            ...current,
            categoryId: "",
            productCategory: selectedType
                ? toProductCategory(selectedType)
                : "",
        }));

        setError("");
    }

    function changeLeafCategory(event) {
        setForm((current) => ({
            ...current,
            categoryId: event.target.value,
        }));

        setError("");
    }

    function changeImages(event) {
        const selected = Array.from(event.target.files || []);

        setImages(selected);
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (!form.categoryId) {
            setError("Select a leaf category before saving.");
            return;
        }

        const selectedLeaf = leafCategories.find(
            (category) =>
                normalizeId(getId(category)) ===
                normalizeId(form.categoryId)
        );

        if (!selectedLeaf && !editing) {
            setError(
                "The selected category is invalid. Select the main category, product type and leaf category again."
            );
            return;
        }

        if (!form.productCategory) {
            setError("Select a valid product type.");
            return;
        }

        if (!editing && images.length === 0) {
            setError(
                "Select at least one product image before creating a product."
            );
            return;
        }

        if (images.length > 8) {
            setError("Select no more than 8 images.");
            return;
        }

        if (
            images.some(
                (image) =>
                    ![
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                    ].includes(image.type)
            )
        ) {
            setError("Only JPEG, PNG, and WebP images are supported.");
            return;
        }

        const payload = new FormData();

        const fields = [
            "name",
            "description",
            "price",
            "productCategory",
            "brandId",
            "categoryId",
            "processor",
            "ramGb",
            "storageGb",
            "graphics",
            "screenSize",
            "mouse",
            "keyboard",
        ];

        fields.forEach((key) => {
            const value = form[key];

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {
                payload.append(
                    key,
                    key === "productCategory"
                        ? String(value).toUpperCase()
                        : String(value).trim()
                );
            }
        });

        images.forEach((image) => {
            payload.append("productImages", image);
        });

        setSaving(true);

        try {
            const token = await getAccessToken();

            if (editing) {
                await updateProduct(id, payload, token);

                setNotice("Product updated successfully.");
            } else {
                await createProduct(payload, token);

                setNotice("Product created successfully.");
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
        background: "#172554",
        color: "#fff",
        border: "1px solid #172554",
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

    if (loading) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    background: "#f5f7fb",
                }}
            >
                <p>
                    <LoaderCircle
                        size={18}
                        style={{ verticalAlign: "middle" }}
                    />{" "}
                    Loading product form…
                </p>
            </main>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
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
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                        {editing ? "Edit product" : "Create product"}
                    </div>

                    <div style={{ color: "#64748b", fontSize: 12 }}>
                        SKT · Product catalogue
                    </div>
                </div>

                <Link to="/admin/products" style={secondaryStyle}>
                    <ArrowLeft size={16} />
                    Back to products
                </Link>
            </header>

            <main
                style={{
                    width: "min(1000px, 92%)",
                    margin: "0 auto",
                    padding: "28px 0 48px",
                }}
            >
                <h1
                    style={{
                        fontSize: 30,
                        letterSpacing: "-.04em",
                        margin: "0 0 8px",
                    }}
                >
                    {editing
                        ? "Update product details"
                        : "Add a new product"}
                </h1>

                <p
                    style={{
                        color: "#64748b",
                        lineHeight: 1.6,
                        marginTop: 0,
                    }}
                >
                    Enter product details, choose the category hierarchy,
                    and verify the brand before saving.
                </p>

                {error && (
                    <div
                        role="alert"
                        style={{
                            padding: 14,
                            borderRadius: 10,
                            background: "#fff1f2",
                            color: "#9f1239",
                            border: "1px solid #fecdd3",
                            marginBottom: 16,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {error}
                    </div>
                )}

                {notice && (
                    <div
                        role="status"
                        style={{
                            padding: 14,
                            borderRadius: 10,
                            background: "#ecfdf5",
                            color: "#065f46",
                            marginBottom: 16,
                        }}
                    >
                        {notice}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <section style={panelStyle}>
                        <h2
                            style={{
                                fontSize: 18,
                                margin: "0 0 18px",
                            }}
                        >
                            Basic information
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                                gap: 18,
                            }}
                        >
                            <Field
                                label="Product name"
                                name="name"
                                value={form.name}
                                onChange={changeField}
                                required
                                placeholder="e.g. ASUS ROG Strix G15"
                            />

                            <Field
                                label="Price (INR)"
                                name="price"
                                type="number"
                                value={form.price}
                                onChange={changeField}
                                required
                                placeholder="e.g. 84999.00"
                            />

                            <CategorySelect
                                id="mainCategory"
                                label="Main category (Level 0)"
                                value={selectedTopCategoryId}
                                options={topCategories}
                                onChange={changeTopCategory}
                                placeholder="Select main category"
                                required
                            />

                            <CategorySelect
                                id="productType"
                                label="Product type (Level 1)"
                                value={selectedTypeCategoryId}
                                options={typeCategories}
                                onChange={changeTypeCategory}
                                placeholder={
                                    selectedTopCategoryId
                                        ? "Select product type"
                                        : "Select main category first"
                                }
                                disabled={!selectedTopCategoryId}
                                required
                            />

                            <CategorySelect
                                id="categoryId"
                                label="Leaf category (Level 2)"
                                value={form.categoryId}
                                options={leafCategories}
                                onChange={changeLeafCategory}
                                placeholder={
                                    selectedTypeCategoryId
                                        ? "Select leaf category"
                                        : "Select product type first"
                                }
                                disabled={!selectedTypeCategoryId}
                                required
                            />

                            <div style={fieldStyle}>
                                <label
                                    htmlFor="brandId"
                                    style={labelStyle}
                                >
                                    Brand *
                                </label>

                                <select
                                    id="brandId"
                                    name="brandId"
                                    value={form.brandId}
                                    onChange={changeField}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">
                                        Select a brand
                                    </option>

                                    {brands.map((brand) => {
                                        const brandId = getId(brand);

                                        return (
                                            <option
                                                key={
                                                    normalizeId(brandId) ||
                                                    brand.name
                                                }
                                                value={brandId}
                                            >
                                                {brand.name ||
                                                    brand.displayName ||
                                                    brandId}
                                            </option>
                                        );
                                    })}
                                </select>

                                {brands.length === 0 && (
                                    <div
                                        style={{
                                            color: "#b45309",
                                            fontSize: 12,
                                            marginTop: 6,
                                        }}
                                    >
                                        No active brands were returned by
                                        the API.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                            <label
                                htmlFor="description"
                                style={labelStyle}
                            >
                                Description *
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={changeField}
                                required
                                rows={4}
                                maxLength={300}
                                placeholder="Describe the product and its key features."
                                style={{
                                    ...inputStyle,
                                    resize: "vertical",
                                    fontFamily: "inherit",
                                }}
                            />

                            <div
                                style={{
                                    color: "#64748b",
                                    fontSize: 12,
                                    textAlign: "right",
                                    marginTop: 4,
                                }}
                            >
                                {form.description.length}/300
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: 14,
                                padding: 12,
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 9,
                                fontSize: 13,
                                color: "#475569",
                            }}
                        >
                            <strong>Selected backend product type:</strong>{" "}
                            {form.productCategory || "Not selected"}
                            <br />
                            <strong>Selected category ID:</strong>{" "}
                            {form.categoryId || "Not selected"}
                        </div>

                        {categories.length === 0 && (
                            <div
                                style={{
                                    color: "#b45309",
                                    fontSize: 13,
                                    marginTop: 12,
                                }}
                            >
                                No categories were returned by the API.
                                Check GET /api/product/categories and
                                confirm that the gateway can reach
                                product-service.
                            </div>
                        )}
                    </section>

                    <section style={panelStyle}>
                        <h2
                            style={{
                                fontSize: 18,
                                margin: "0 0 6px",
                            }}
                        >
                            Technical specifications
                        </h2>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: 13,
                                margin: "0 0 18px",
                            }}
                        >
                            Fill in the specifications relevant to this
                            product. Leave fields blank when they do not
                            apply.
                        </p>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                                gap: 18,
                            }}
                        >
                            <Field
                                label="Processor"
                                name="processor"
                                value={form.processor}
                                onChange={changeField}
                                placeholder="e.g. Intel Core i7"
                            />

                            <Field
                                label="RAM (GB)"
                                name="ramGb"
                                type="number"
                                value={form.ramGb}
                                onChange={changeField}
                                placeholder="e.g. 16"
                            />

                            <Field
                                label="Storage (GB)"
                                name="storageGb"
                                type="number"
                                value={form.storageGb}
                                onChange={changeField}
                                placeholder="e.g. 1024"
                            />

                            <Field
                                label="Graphics"
                                name="graphics"
                                value={form.graphics}
                                onChange={changeField}
                                placeholder="e.g. NVIDIA RTX 4060"
                            />

                            <Field
                                label="Screen size (inches)"
                                name="screenSize"
                                type="number"
                                value={form.screenSize}
                                onChange={changeField}
                                placeholder="e.g. 15.6"
                            />

                            <Field
                                label="Mouse included"
                                name="mouse"
                                value={form.mouse}
                                onChange={changeField}
                                placeholder="Optional"
                            />

                            <Field
                                label="Keyboard included"
                                name="keyboard"
                                value={form.keyboard}
                                onChange={changeField}
                                placeholder="Optional"
                            />
                        </div>
                    </section>

                    <section style={panelStyle}>
                        <h2
                            style={{
                                fontSize: 18,
                                margin: "0 0 6px",
                            }}
                        >
                            Product images
                        </h2>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: 13,
                                margin: "0 0 16px",
                            }}
                        >
                            JPEG, PNG, and WebP are accepted by this UI.
                            The backend must also validate file content,
                            file size and image count.
                        </p>

                        {editing &&
                            existingProduct?.productImages?.length > 0 && (
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: "#475569",
                                    }}
                                >
                                    This product currently has{" "}
                                    {existingProduct.productImages.length}{" "}
                                    image(s). Leave the upload empty if
                                    your backend preserves existing images
                                    when no new files are submitted.
                                </p>
                            )}

                        <label
                            htmlFor="productImages"
                            style={{
                                ...secondaryStyle,
                                display: "inline-flex",
                                width: "fit-content",
                            }}
                        >
                            <ImagePlus size={17} />
                            Choose images
                        </label>

                        <input
                            id="productImages"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={changeImages}
                            style={{
                                display: "block",
                                marginTop: 12,
                                maxWidth: "100%",
                            }}
                        />

                        <div
                            style={{
                                color: "#64748b",
                                fontSize: 13,
                                marginTop: 8,
                            }}
                        >
                            {images.length
                                ? `${images.length} new image(s) selected`
                                : "No new images selected"}
                        </div>

                        {images.length > 0 && (
                            <ul
                                style={{
                                    fontSize: 13,
                                    color: "#475569",
                                    paddingLeft: 20,
                                }}
                            >
                                {images.map((image, index) => (
                                    <li key={`${image.name}-${index}`}>
                                        {image.name} (
                                        {Math.ceil(image.size / 1024)} KB)
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 10,
                            flexWrap: "wrap",
                        }}
                    >
                        <Link
                            to="/admin/products"
                            style={secondaryStyle}
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            style={buttonStyle}
                        >
                            {saving ? (
                                <LoaderCircle size={17} />
                            ) : (
                                <Save size={17} />
                            )}

                            {saving
                                ? "Saving…"
                                : editing
                                    ? "Save changes"
                                    : "Create product"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

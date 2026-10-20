
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Edit3,
    LoaderCircle,
    Package,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import {
    deleteProduct,
    getProductsPage,
    searchProducts,
} from "../../services/productApi.js";
import { API_BASE_URL } from "../../services/apiClient.js";

const PAGE_SIZE = 10;

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#172033",
        fontFamily: "Inter, system-ui, sans-serif",
    },
    header: {
        background: "#fff",
        borderBottom: "1px solid #e5e9f2",
        padding: "16px 5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
    },
    main: { width: "min(1200px, 92%)", margin: "0 auto", padding: "30px 0 50px" },
    eyebrow: {
        color: "#64748b",
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".1em",
    },
    title: { fontSize: 30, letterSpacing: "-.04em", margin: "8px 0" },
    muted: { color: "#64748b", lineHeight: 1.6 },
    button: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 9,
        background: "#172554",
        color: "#fff",
        border: "1px solid #172554",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 650,
        cursor: "pointer",
    },
    secondary: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 13px",
        borderRadius: 9,
        background: "#fff",
        color: "#334155",
        border: "1px solid #dbe2ee",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
    },
    panel: {
        background: "#fff",
        border: "1px solid #e5e9f2",
        borderRadius: 14,
        overflow: "hidden",
        marginTop: 22,
    },
    toolbar: {
        padding: 18,
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: "space-between",
        flexWrap: "wrap",
        borderBottom: "1px solid #e5e9f2",
    },
    search: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        border: "1px solid #dbe2ee",
        borderRadius: 9,
        padding: "0 12px",
        background: "#fff",
        minWidth: 240,
        flex: "1 1 300px",
        maxWidth: 480,
    },
    input: {
        border: 0,
        outline: 0,
        padding: "12px 0",
        width: "100%",
        fontSize: 14,
        background: "transparent",
        color: "#172033",
    },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 800 },
    th: {
        padding: "13px 16px",
        textAlign: "left",
        fontSize: 11,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: ".07em",
        background: "#f8fafc",
        whiteSpace: "nowrap",
    },
    td: { padding: "14px 16px", borderTop: "1px solid #eef2f7", fontSize: 13, verticalAlign: "middle" },
    image: {
        width: 52,
        height: 52,
        objectFit: "contain",
        border: "1px solid #e5e9f2",
        borderRadius: 9,
        background: "#fff",
    },
    pill: {
        display: "inline-block",
        background: "#eef2ff",
        color: "#3730a3",
        borderRadius: 999,
        padding: "5px 9px",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
    },
    alert: {
        padding: 14,
        borderRadius: 10,
        background: "#fff1f2",
        color: "#9f1239",
        border: "1px solid #fecdd3",
        marginTop: 16,
        whiteSpace: "pre-wrap",
    },
    empty: { padding: 42, textAlign: "center", color: "#64748b" },
    footer: {
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        borderTop: "1px solid #e5e9f2",
    },
};

function getItems(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.items)) return result.items;
    if (Array.isArray(result?.content)) return result.content;
    return [];
}

function imageFor(product) {
    const images = product?.productImages;
    const first = Array.isArray(images)
        ? images.find((image) => image?.imageUrl || image?.url)
        : null;
    const path = first?.imageUrl || first?.url;

    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;

    return `${API_BASE_URL.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
}

function money(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(number);
}

export default function ProductManagement() {
    const { getAccessToken } = useAuth();

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [query, setQuery] = useState("");
    const [appliedQuery, setAppliedQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = {
                page,
                size: PAGE_SIZE,
                sort: "createdAt",
                direction: "desc",
            };

            const result = appliedQuery.trim()
                ? await searchProducts({ ...params, q: appliedQuery.trim() })
                : await getProductsPage(params);

            setProducts(getItems(result));
            setTotalElements(Number(result?.totalElements ?? getItems(result).length));
            setTotalPages(Number(result?.totalPages ?? 0));
        } catch (err) {
            setProducts([]);
            setTotalElements(0);
            setTotalPages(0);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Could not load products. Check the API gateway and your admin session."
            );
        } finally {
            setLoading(false);
        }
    }, [page, appliedQuery]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    function submitSearch(event) {
        event.preventDefault();
        setPage(0);
        setAppliedQuery(query.trim());
        setNotice("");
    }

    async function handleDelete(product) {
        const id = product?.id;
        if (!id) {
            setError("This product has no ID, so it cannot be deleted.");
            return;
        }

        const confirmed = window.confirm(
            `Delete "${product.name || "this product"}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        setDeletingId(id);
        setError("");
        setNotice("");

        try {
            const token = await getAccessToken();
            await deleteProduct(id, token);
            setNotice(`Product "${product.name || id}" was deleted.`);
            await loadProducts();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Product deletion failed."
            );
        } finally {
            setDeletingId(null);
        }
    }

    const canGoBack = page > 0;
    const canGoNext = totalPages > 0 ? page + 1 < totalPages : products.length === PAGE_SIZE;

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "#eef2ff", color: "#3730a3", display: "grid", placeItems: "center" }}>
                        <Package size={22} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>Product catalogue</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>SKT administration</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Link to="/admin" style={styles.secondary}><ArrowLeft size={16} /> Dashboard</Link>
                    <Link to="/admin/products/new" style={styles.button}><Plus size={17} /> Add product</Link>
                </div>
            </header>

            <main style={styles.main}>
                <div style={styles.eyebrow}>Catalogue management</div>
                <h1 style={styles.title}>Products</h1>
                <p style={{ ...styles.muted, marginTop: 0 }}>
                    Search the catalogue, edit product details, or remove a product.
                </p>

                {error && <div role="alert" style={styles.alert}>{error}</div>}
                {notice && (
                    <div role="status" style={{ ...styles.alert, background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }}>
                        {notice}
                    </div>
                )}

                <section style={styles.panel}>
                    <form onSubmit={submitSearch} style={styles.toolbar}>
                        <div style={styles.search}>
                            <Search size={18} color="#64748b" />
                            <input
                                aria-label="Search products"
                                placeholder="Search products by name, SKU, or description…"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <button type="submit" style={styles.button}><Search size={16} /> Search</button>
                        <button
                            type="button"
                            style={styles.secondary}
                            onClick={() => {
                                setQuery("");
                                setAppliedQuery("");
                                setPage(0);
                                setNotice("");
                            }}
                        >
                            Clear
                        </button>
                    </form>

                    <div style={{ padding: "0 18px 12px", color: "#64748b", fontSize: 12 }}>
                        {loading ? "Loading catalogue…" : `${totalElements} product(s) found`}
                    </div>

                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th style={styles.th}>Product</th>
                                <th style={styles.th}>SKU</th>
                                <th style={styles.th}>Type</th>
                                <th style={styles.th}>Price</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={styles.empty}>
                                        <LoaderCircle size={22} style={{ verticalAlign: "middle" }} /> Loading products…
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={styles.empty}>
                                        <Package size={28} style={{ display: "block", margin: "0 auto 10px" }} />
                                        No products found. Try another search or create a product.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id || product.skuCode || product.name}>
                                        <td style={styles.td}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 220 }}>
                                                {imageFor(product) ? (
                                                    <img
                                                        src={imageFor(product)}
                                                        alt=""
                                                        style={styles.image}
                                                        onError={(event) => {
                                                            event.currentTarget.style.visibility = "hidden";
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{ ...styles.image, display: "grid", placeItems: "center", color: "#94a3b8" }}>
                                                        <Package size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{product.name || "Unnamed product"}</div>
                                                    <div style={{ color: "#64748b", fontSize: 12, maxWidth: 280 }}>
                                                        {product.description || "No description"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>{product.skuCode || "Generated by service"}</td>
                                        <td style={styles.td}>
                                            <span style={styles.pill}>{product.productCategory || "—"}</span>
                                        </td>
                                        <td style={{ ...styles.td, whiteSpace: "nowrap", fontWeight: 700 }}>{money(product.price)}</td>
                                        <td style={styles.td}>{product.status || "—"}</td>
                                        <td style={styles.td}>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <Link
                                                    to={`/admin/products/${encodeURIComponent(product.id)}/edit`}
                                                    state={{ product }}
                                                    aria-label={`Edit ${product.name || "product"}`}
                                                    title="Edit product"
                                                    style={{ ...styles.secondary, padding: 9 }}
                                                >
                                                    <Edit3 size={16} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    disabled={deletingId === product.id}
                                                    onClick={() => handleDelete(product)}
                                                    aria-label={`Delete ${product.name || "product"}`}
                                                    title="Delete product"
                                                    style={{
                                                        ...styles.secondary,
                                                        padding: 9,
                                                        color: "#b91c1c",
                                                        borderColor: "#fecaca",
                                                        opacity: deletingId === product.id ? 0.6 : 1,
                                                    }}
                                                >
                                                    {deletingId === product.id ? <LoaderCircle size={16} /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div style={styles.footer}>
            <span style={{ color: "#64748b", fontSize: 13 }}>
              Page {page + 1}{totalPages > 0 ? ` of ${totalPages}` : ""}
            </span>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                type="button"
                                disabled={!canGoBack || loading}
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                style={{ ...styles.secondary, opacity: !canGoBack || loading ? 0.45 : 1 }}
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <button
                                type="button"
                                disabled={!canGoNext || loading}
                                onClick={() => setPage((current) => current + 1)}
                                style={{ ...styles.secondary, opacity: !canGoNext || loading ? 0.45 : 1 }}
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

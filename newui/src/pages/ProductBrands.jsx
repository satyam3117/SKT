
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import {
    createBrand,
    deleteBrand,
    getAllBrands,
    updateBrand,
} from "../services/productApi";

const input = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #dbe2ee",
    borderRadius: 8,
    fontSize: 14,
};

const button = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 13px",
    border: "1px solid #dbe2ee",
    borderRadius: 8,
    background: "#fff",
    color: "#243047",
    fontWeight: 650,
    cursor: "pointer",
    textDecoration: "none",
};

const primary = { ...button, background: "#172554", color: "#fff", borderColor: "#172554" };

const slugify = (value) =>
    value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const getError = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.message ||
    "Request failed.";

const emptyForm = { name: "", slug: "", sortOrder: "0", active: true };

export default function ProductBrands() {
    const { getAccessToken } = useAuth();
    const [brands, setBrands] = useState([]);
    const [query, setQuery] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadBrands = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAllBrands();
            setBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(getError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBrands();
    }, [loadBrands]);

    function startCreate() {
        setEditingId(null);
        setForm(emptyForm);
        setFormOpen(true);
        setError("");
        setNotice("");
    }

    function startEdit(brand) {
        setEditingId(brand.id);
        setForm({
            name: brand.name ?? "",
            slug: brand.slug ?? "",
            sortOrder: String(brand.sortOrder ?? 0),
            active: brand.active ?? true,
        });
        setFormOpen(true);
        setError("");
        setNotice("");
    }

    function changeName(value) {
        setForm((current) => ({
            ...current,
            name: value,
            ...(editingId ? {} : { slug: slugify(value) }),
        }));
    }

    async function submit(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        const sortOrder = Number(form.sortOrder);
        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            setError("Sort order must be a whole number of zero or greater.");
            return;
        }

        const request = {
            name: form.name.trim(),
            slug: form.slug.trim(),
            sortOrder,
        };

        if (editingId) request.active = Boolean(form.active);

        setSaving(true);
        try {
            const token = await getAccessToken();
            if (editingId) {
                await updateBrand(editingId, request, token);
                setNotice("Brand updated successfully.");
            } else {
                await createBrand(request, token);
                setNotice("Brand created successfully.");
            }

            setFormOpen(false);
            await loadBrands();
        } catch (err) {
            setError(getError(err));
        } finally {
            setSaving(false);
        }
    }

    async function removeBrand(brand) {
        if (!window.confirm(`Delete brand "${brand.name}"? This cannot be undone.`)) return;

        setError("");
        setNotice("");
        try {
            const token = await getAccessToken();
            await deleteBrand(brand.id, token);
            setNotice(`Brand "${brand.name}" deleted.`);
            await loadBrands();
        } catch (err) {
            setError(getError(err));
        }
    }

    const visibleBrands = brands.filter((brand) =>
        `${brand.name ?? ""} ${brand.slug ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase().trim())
    );

    return (
        <main style={{ minHeight: "100vh", background: "#f5f7fb", color: "#172033", fontFamily: "Inter, system-ui, sans-serif" }}>
            <header style={{ background: "#fff", borderBottom: "1px solid #e5e9f2", padding: "16px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22 }}>Product brands</h1>
                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Manage manufacturer and brand names</div>
                </div>
                <Link to="/admin" style={button}><ArrowLeft size={16} /> Dashboard</Link>
            </header>

            <section style={{ width: "min(1100px, 92%)", margin: "0 auto", padding: "28px 0 50px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div>
                        <h2 style={{ margin: "0 0 6px", fontSize: 28 }}>Brand catalogue</h2>
                        <div style={{ color: "#64748b", fontSize: 14 }}>Create and maintain brands used by products.</div>
                    </div>
                    <button onClick={startCreate} style={primary}><Plus size={16} /> Add brand</button>
                </div>

                {error && <div role="alert" style={{ padding: 12, background: "#fff1f2", color: "#9f1239", borderRadius: 8, marginTop: 16 }}>{error}</div>}
                {notice && <div role="status" style={{ padding: 12, background: "#ecfdf5", color: "#065f46", borderRadius: 8, marginTop: 16 }}>{notice}</div>}

                {formOpen && (
                    <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #e5e9f2", borderRadius: 12, padding: 20, marginTop: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                            <h3 style={{ margin: 0 }}>{editingId ? "Edit brand" : "Create brand"}</h3>
                            <button type="button" onClick={() => setFormOpen(false)} style={button} aria-label="Close form"><X size={16} /></button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 650 }}>
                                Brand name *
                                <input required maxLength={150} value={form.name} onChange={(e) => changeName(e.target.value)} style={{ ...input, display: "block", marginTop: 7 }} placeholder="e.g. ASUS" />
                            </label>
                            <label style={{ fontSize: 13, fontWeight: 650 }}>
                                Slug *
                                <input required maxLength={150} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={{ ...input, display: "block", marginTop: 7 }} placeholder="e.g. asus" />
                                <span style={{ display: "block", color: "#64748b", fontSize: 12, fontWeight: 400, marginTop: 5 }}>Lowercase letters, numbers and hyphens only.</span>
                            </label>
                            <label style={{ fontSize: 13, fontWeight: 650 }}>
                                Sort order
                                <input type="number" min="0" step="1" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} style={{ ...input, display: "block", marginTop: 7 }} />
                            </label>
                            {editingId && (
                                <label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13, fontWeight: 650 }}>
                                    <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                                    Active brand
                                </label>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            <button type="submit" disabled={saving} style={primary}>{saving ? "Saving…" : editingId ? "Save changes" : "Create brand"}</button>
                            <button type="button" onClick={() => setFormOpen(false)} style={button}>Cancel</button>
                        </div>
                    </form>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 20, marginBottom: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 260px", display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #dbe2ee", borderRadius: 8, padding: "0 11px" }}>
                        <Search size={17} color="#64748b" />
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brands…" style={{ ...input, border: 0, outline: 0 }} />
                    </div>
                    <button type="button" onClick={loadBrands} style={button}><RefreshCw size={15} /> Refresh</button>
                </div>

                <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #e5e9f2", borderRadius: 12 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
                        <thead style={{ background: "#f8fafc", color: "#64748b", fontSize: 11, textAlign: "left" }}>
                        <tr>{["Name", "Slug", "Status", "Sort order", "Actions"].map((title) => <th key={title} style={{ padding: 14 }}>{title.toUpperCase()}</th>)}</tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: 28, textAlign: "center" }}>Loading brands…</td></tr>
                        ) : visibleBrands.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: "#64748b" }}>No brands found.</td></tr>
                        ) : visibleBrands.map((brand) => (
                            <tr key={brand.id} style={{ borderTop: "1px solid #eef2f7" }}>
                                <td style={{ padding: 14, fontWeight: 700 }}>{brand.name}</td>
                                <td style={{ padding: 14, color: "#64748b" }}>{brand.slug}</td>
                                <td style={{ padding: 14 }}>
                    <span style={{ padding: "4px 8px", borderRadius: 999, fontSize: 12, background: brand.active ? "#ecfdf5" : "#f1f5f9", color: brand.active ? "#047857" : "#64748b" }}>
                      {brand.active ? "Active" : "Inactive"}
                    </span>
                                </td>
                                <td style={{ padding: 14 }}>{brand.sortOrder ?? 0}</td>
                                <td style={{ padding: 14, whiteSpace: "nowrap" }}>
                                    <button type="button" onClick={() => startEdit(brand)} style={{ ...button, marginRight: 7 }}>Edit</button>
                                    <button type="button" onClick={() => removeBrand(brand)} style={{ ...button, color: "#b91c1c" }}><Trash2 size={15} /> Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}

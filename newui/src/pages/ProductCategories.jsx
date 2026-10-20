
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    updateCategory,
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
    justifyContent: "center",
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

const emptyForm = {
    name: "",
    slug: "",
    parentId: "",
    sortOrder: "0",
    active: true,
};

export default function ProductCategories() {
    const { getAccessToken } = useAuth();

    const [categories, setCategories] = useState([]);
    const [query, setQuery] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAllCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(getError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const parentOptions = useMemo(() => {
        // Prevent a category from being moved under itself or one of its descendants.
        const excluded = new Set();

        if (editingId) {
            excluded.add(editingId);

            let changed = true;
            while (changed) {
                changed = false;
                categories.forEach((category) => {
                    if (category.parentId && excluded.has(category.parentId) && !excluded.has(category.id)) {
                        excluded.add(category.id);
                        changed = true;
                    }
                });
            }
        }

        return categories
            .filter((category) => category.active !== false && !excluded.has(category.id))
            .sort((a, b) => {
                const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
                return orderDiff || String(a.name).localeCompare(String(b.name));
            });
    }, [categories, editingId]);

    const categoryPath = useMemo(() => {
        const byId = new Map(categories.map((category) => [category.id, category]));

        function pathFor(category) {
            const names = [];
            const visited = new Set();
            let current = category;

            while (current && !visited.has(current.id)) {
                visited.add(current.id);
                names.unshift(current.name);
                current = current.parentId ? byId.get(current.parentId) : null;
            }

            return names.join(" / ");
        }

        return new Map(categories.map((category) => [category.id, pathFor(category)]));
    }, [categories]);

    function startCreate() {
        setEditingId(null);
        setForm(emptyForm);
        setFormOpen(true);
        setError("");
        setNotice("");
    }

    function startEdit(category) {
        setEditingId(category.id);
        setForm({
            name: category.name ?? "",
            slug: category.slug ?? "",
            parentId: category.parentId ?? "",
            sortOrder: String(category.sortOrder ?? 0),
            active: category.active ?? true,
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
            parentId: form.parentId || null,
            sortOrder,
        };

        if (editingId) request.active = Boolean(form.active);

        setSaving(true);
        try {
            const token = await getAccessToken();

            if (editingId) {
                await updateCategory(editingId, request, token);
                setNotice("Category updated successfully.");
            } else {
                await createCategory(request, token);
                setNotice("Category created successfully.");
            }

            setFormOpen(false);
            await loadCategories();
        } catch (err) {
            setError(getError(err));
        } finally {
            setSaving(false);
        }
    }

    async function removeCategory(category) {
        const confirmed = window.confirm(
            `Delete category "${category.name}"?\n\nThe backend may reject deletion if this category has children or products assigned to it.`
        );
        if (!confirmed) return;

        setError("");
        setNotice("");

        try {
            const token = await getAccessToken();
            await deleteCategory(category.id, token);
            setNotice(`Category "${category.name}" deleted.`);
            await loadCategories();
        } catch (err) {
            setError(getError(err));
        }
    }

    const visibleCategories = categories
        .filter((category) =>
            `${category.name ?? ""} ${category.slug ?? ""} ${categoryPath.get(category.id) ?? ""}`
                .toLowerCase()
                .includes(query.toLowerCase().trim())
        )
        .sort((a, b) => {
            const pathA = categoryPath.get(a.id) ?? a.name;
            const pathB = categoryPath.get(b.id) ?? b.name;
            return pathA.localeCompare(pathB);
        });

    return (
        <main style={{ minHeight: "100vh", background: "#f5f7fb", color: "#172033", fontFamily: "Inter, system-ui, sans-serif" }}>
            <header style={{ background: "#fff", borderBottom: "1px solid #e5e9f2", padding: "16px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22 }}>Product categories</h1>
                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Manage root categories and subcategories</div>
                </div>
                <Link to="/admin" style={button}><ArrowLeft size={16} /> Dashboard</Link>
            </header>

            <section style={{ width: "min(1200px, 92%)", margin: "0 auto", padding: "28px 0 50px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div>
                        <h2 style={{ margin: "0 0 6px", fontSize: 28 }}>Category tree</h2>
                        <div style={{ color: "#64748b", fontSize: 14 }}>Create a root category or select a parent to create a child category.</div>
                    </div>
                    <button onClick={startCreate} style={primary}><Plus size={16} /> Add category</button>
                </div>

                {error && <div role="alert" style={{ padding: 12, background: "#fff1f2", color: "#9f1239", borderRadius: 8, marginTop: 16, whiteSpace: "pre-wrap" }}>{error}</div>}
                {notice && <div role="status" style={{ padding: 12, background: "#ecfdf5", color: "#065f46", borderRadius: 8, marginTop: 16 }}>{notice}</div>}

                {formOpen && (
                    <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #e5e9f2", borderRadius: 12, padding: 20, marginTop: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                            <h3 style={{ margin: 0 }}>{editingId ? "Edit category" : "Create category"}</h3>
                            <button type="button" onClick={() => setFormOpen(false)} style={button} aria-label="Close form"><X size={16} /></button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 650 }}>
                                Category name *
                                <input required maxLength={150} value={form.name} onChange={(e) => changeName(e.target.value)} style={{ ...input, display: "block", marginTop: 7 }} placeholder="e.g. Gaming Laptops" />
                            </label>
                            <label style={{ fontSize: 13, fontWeight: 650 }}>
                                Slug *
                                <input required maxLength={150} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={{ ...input, display: "block", marginTop: 7 }} placeholder="e.g. gaming-laptops" />
                                <span style={{ display: "block", color: "#64748b", fontSize: 12, fontWeight: 400, marginTop: 5 }}>Lowercase letters, numbers and hyphens only.</span>
                            </label>
                            <label style={{ fontSize: 13, fontWeight: 650 }}>
                                Parent category
                                <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} style={{ ...input, display: "block", marginTop: 7 }}>
                                    <option value="">— Root category —</option>
                                    {parentOptions.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {categoryPath.get(category.id) || category.name}
                                        </option>
                                    ))}
                                </select>
                                <span style={{ display: "block", color: "#64748b", fontSize: 12, fontWeight: 400, marginTop: 5 }}>Leave empty to create a root category.</span>
                            </label>
                            <label style={{ fontSize: 13, fontWeight: 650 }}>
                                Sort order
                                <input type="number" min="0" step="1" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} style={{ ...input, display: "block", marginTop: 7 }} />
                            </label>
                            {editingId && (
                                <label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13, fontWeight: 650 }}>
                                    <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                                    Active category
                                </label>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            <button type="submit" disabled={saving} style={primary}>{saving ? "Saving…" : editingId ? "Save changes" : "Create category"}</button>
                            <button type="button" onClick={() => setFormOpen(false)} style={button}>Cancel</button>
                        </div>
                    </form>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 20, marginBottom: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 260px", display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #dbe2ee", borderRadius: 8, padding: "0 11px" }}>
                        <Search size={17} color="#64748b" />
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search categories and paths…" style={{ ...input, border: 0, outline: 0 }} />
                    </div>
                    <button type="button" onClick={loadCategories} style={button}><RefreshCw size={15} /> Refresh</button>
                </div>

                <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #e5e9f2", borderRadius: 12 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
                        <thead style={{ background: "#f8fafc", color: "#64748b", fontSize: 11, textAlign: "left" }}>
                        <tr>{["Category / path", "Slug", "Level", "Status", "Sort order", "Actions"].map((title) => <th key={title} style={{ padding: 14 }}>{title.toUpperCase()}</th>)}</tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: 28, textAlign: "center" }}>Loading categories…</td></tr>
                        ) : visibleCategories.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: 28, textAlign: "center", color: "#64748b" }}>No categories found.</td></tr>
                        ) : visibleCategories.map((category) => (
                            <tr key={category.id} style={{ borderTop: "1px solid #eef2f7" }}>
                                <td style={{ padding: 14 }}>
                                    <div style={{ fontWeight: 700 }}>{category.name}</div>
                                    <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{categoryPath.get(category.id)}</div>
                                </td>
                                <td style={{ padding: 14, color: "#64748b" }}>{category.slug}</td>
                                <td style={{ padding: 14 }}>{category.level ?? (category.parentId ? "Child" : "Root")}</td>
                                <td style={{ padding: 14 }}>
                    <span style={{ padding: "4px 8px", borderRadius: 999, fontSize: 12, background: category.active ? "#ecfdf5" : "#f1f5f9", color: category.active ? "#047857" : "#64748b" }}>
                      {category.active ? "Active" : "Inactive"}
                    </span>
                                </td>
                                <td style={{ padding: 14 }}>{category.sortOrder ?? 0}</td>
                                <td style={{ padding: 14, whiteSpace: "nowrap" }}>
                                    <button type="button" onClick={() => startEdit(category)} style={{ ...button, marginRight: 7 }}>Edit</button>
                                    <button type="button" onClick={() => removeCategory(category)} style={{ ...button, color: "#b91c1c" }}><Trash2 size={15} /> Delete</button>
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

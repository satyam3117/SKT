import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import ProductEditorModal from "../components/admin/ProductEditorModal";
import ProductManagementTable from "../components/admin/ProductManagementTable";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../services/productApi";

const PAGE_SIZE = 8;

function formatCategoryLabel(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function AdminProductManagementPage() {
  const { keycloak } = useOutletContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllProducts(keycloak);
      const normalized = (Array.isArray(data) ? data : []).map((item) => ({
        ...item,
        productCategoryLabel: formatCategoryLabel(item.productCategory),
        statusLabel: "Active",
        stockCount: "N/A",
      }));

      setProducts(normalized.sort((left, right) => {
        const leftDate = left.updatedAt || left.createdAt || "";
        const rightDate = right.updatedAt || right.createdAt || "";
        return new Date(rightDate) - new Date(leftDate);
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [keycloak]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const categoryOptions = useMemo(() => {
    const values = new Set(products.map((product) => product.productCategoryLabel));
    return ["All Categories", ...Array.from(values).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      if (category !== "all" && product.productCategoryLabel !== category) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        product.name,
        product.description,
        product.id,
        product.skuCode,
        product.brandName,
        product.categoryId,
        product.productCategoryLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [products, query, category]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  const openEditModal = async (product) => {
    setEditorLoading(true);
    setModalOpen(true);

    try {
      const details = await getProductById(keycloak, product.id);
      setSelectedProduct({
        ...details,
        productCategoryLabel: formatCategoryLabel(details.productCategory),
      });
    } catch (err) {
      showToast("error", err.message);
      setModalOpen(false);
    } finally {
      setEditorLoading(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);

    try {
      await deleteProduct(keycloak, product.id);
      showToast("success", "Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setDeletingId("");
    }
  };

  const handleSave = async (payload, productImages = []) => {
    setSaving(true);

    try {
      if (selectedProduct?.id) {
        await updateProduct(keycloak, selectedProduct.id, payload, productImages);
        showToast("success", "Product updated successfully.");
      } else {
        await createProduct(keycloak, payload, productImages);
        showToast("success", "Product created successfully.");
      }

      setModalOpen(false);
      setSelectedProduct(null);
      await loadProducts();
    } catch (err) {
      showToast("error", err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    if (saving || editorLoading) {
      return;
    }

    setModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <div>
          <span className="eyebrow">Admin Product Management</span>
          <h2>Manage the live catalog from one clean dashboard.</h2>
          <p>
            This UI is wired to the current product service endpoints for create, update, detail, list, and delete.
            The backend currently does not expose persisted status or stock fields, so those are surfaced as
            dashboard placeholders.
          </p>
        </div>

        <div className="admin-hero-actions">
          <button type="button" onClick={loadProducts} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate("/products/create")}>
            New Product
          </button>
        </div>
      </div>

      <div className="admin-metrics">
        <article className="metric-card">
          <span>Total products</span>
          <strong>{products.length}</strong>
        </article>
        <article className="metric-card">
          <span>Filtered results</span>
          <strong>{filteredProducts.length}</strong>
        </article>
        <article className="metric-card">
          <span>Current page</span>
          <strong>{currentPage} / {totalPages}</strong>
        </article>
      </div>

      <section className="page-card admin-toolbar">
        <div className="filters-row admin-filters">
          <input
            type="search"
            placeholder="Search name, SKU, category, brand..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item === "All Categories" ? "all" : item}>
                {item}
              </option>
            ))}
          </select>

          <button type="button" className="secondary-button" onClick={() => { setQuery(""); setCategory("all"); }}>
            Clear
          </button>
        </div>

        {error && <p className="status error">{error}</p>}
      </section>

      <section className="page-card">
        <ProductManagementTable
          products={pagedProducts}
          keycloak={keycloak}
          loading={loading}
          onEdit={openEditModal}
          onDelete={handleDelete}
          deletingId={deletingId}
        />

        <div className="pagination-bar">
          <span>
            Showing {pagedProducts.length} of {filteredProducts.length}
          </span>
          <div className="pagination-controls">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <ProductEditorModal
        open={modalOpen}
        initialProduct={selectedProduct}
        loading={editorLoading}
        saving={saving}
        keycloak={keycloak}
        onClose={closeModal}
        onSave={handleSave}
      />

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </section>
  );
}

export default AdminProductManagementPage;

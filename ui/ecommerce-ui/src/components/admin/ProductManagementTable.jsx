import ProductThumbnail from "./ProductThumbnail";

function ProductManagementTable({
  products,
  keycloak,
  loading,
  onEdit,
  onDelete,
  deletingId,
}) {
  if (loading && products.length === 0) {
    return <div className="empty-state">Loading products...</div>;
  }

  if (!loading && products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No products found</h3>
        <p>Try changing the search term or category filter.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Thumbnail</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="thumbnail-cell">
                  <ProductThumbnail product={product} keycloak={keycloak} />
                </div>
              </td>
              <td>
                <div className="product-name-cell">
                  <strong>{product.name}</strong>
                  <span>{product.brandName || "Unbranded"}</span>
                </div>
              </td>
              <td>
                <div className="meta-stack">
                  <strong>{product.productCategoryLabel}</strong>
                  <span>{product.categoryId || "No category ID"}</span>
                </div>
              </td>
              <td>${Number(product.price || 0).toFixed(2)}</td>
              <td>{product.stockCount ?? "N/A"}</td>
              <td>
                <span className="status-badge live">
                  {product.statusLabel || "Active"}
                </span>
              </td>
              <td>
                <div className="action-group">
                  <button type="button" className="secondary-button" onClick={() => onEdit(product)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => onDelete(product)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductManagementTable;

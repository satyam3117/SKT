import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getAllProducts } from "../services/productApi";

function ProductListPage() {
  const { keycloak } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllProducts(keycloak);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <section className="page-card">
      <div className="page-title-row">
        <h2>GET /api/product</h2>
        <button type="button" onClick={loadProducts} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p className="status error">{error}</p>}
      {!error && products.length === 0 && !loading && <p className="status">No products found yet.</p>}

      {products.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ProductListPage;


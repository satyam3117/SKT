import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getAllProducts } from "../services/productApi";

function guessCategory(product) {
  const text = `${product.name} ${product.description}`.toLowerCase();

  if (text.includes("phone") || text.includes("laptop") || text.includes("head")) {
    return "Electronics";
  }

  if (text.includes("shirt") || text.includes("shoe") || text.includes("wear")) {
    return "Fashion";
  }

  if (text.includes("chair") || text.includes("table") || text.includes("home")) {
    return "Home";
  }

  return "General";
}

function ProductListPage() {
  const { keycloak, addToCart, cartSummary } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllProducts(keycloak);
      const normalized = (Array.isArray(data) ? data : []).map((item) => ({
        ...item,
        category: guessCategory(item),
        price: Number(item.price),
      }));
      setProducts(normalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const filteredProducts = products
    .filter((product) => {
      if (category !== "All" && product.category !== category) {
        return false;
      }

      if (!query.trim()) {
        return true;
      }

      const searchableText = `${product.name} ${product.description} ${product.id}`.toLowerCase();
      return searchableText.includes(query.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return a.price - b.price;
      }
      if (sortBy === "price-high") {
        return b.price - a.price;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <section className="storefront">
      <div className="hero-banner">
        <div>
          <h2>Big Savings. Fast Checkout. Trusted Delivery.</h2>
          <p>Discover products from your `GET /api/product` endpoint and shop with a cart flow like major marketplaces.</p>
        </div>
        <div className="hero-stats">
          <span>{products.length} products</span>
          <span>{cartSummary.totalItems} items in cart</span>
        </div>
      </div>

      <section className="page-card">
        <div className="page-title-row">
          <h2>All Products</h2>
          <button type="button" onClick={loadProducts} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="filters-row">
          <input
            type="search"
            placeholder="Search for product name, sku, description"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

      {error && <p className="status error">{error}</p>}
      {!error && filteredProducts.length === 0 && !loading && <p className="status">No products matched your filters.</p>}

      {filteredProducts.length > 0 && (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      )}
      </section>
    </section>
  );
}

export default ProductListPage;



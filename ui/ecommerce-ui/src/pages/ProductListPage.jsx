import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProductsPage, searchProducts } from "../services/productApi";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "name", label: "Name" },
  { value: "brandName", label: "Brand" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function ProductListPage() {
  const { keycloak, addToCart, cartSummary } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        size,
        categoryId: categoryId.trim(),
        brand: brand.trim(),
        minPrice: minPrice.trim(),
        maxPrice: maxPrice.trim(),
        sort,
        direction,
      };

      const response = query.trim()
        ? await searchProducts(keycloak, { q: query.trim(), ...params })
        : await getProductsPage(keycloak, params);

      const items = Array.isArray(response?.items) ? response.items : [];
      const normalized = items.map((item) => ({
        ...item,
        price: Number(item.price),
      }));

      setProducts(normalized);
      setTotalElements(Number(response?.totalElements || 0));
      setTotalPages(Number(response?.totalPages || 0));
      setHasNext(Boolean(response?.hasNext));
      setHasPrevious(Boolean(response?.hasPrevious));

      setCategoryOptions((previous) =>
        Array.from(
          new Set([
            ...previous,
            ...normalized.map((item) => item.categoryId).filter((item) => typeof item === "string" && item.length > 0),
          ])
        ).sort()
      );

      setBrandOptions((previous) =>
        Array.from(
          new Set([
            ...previous,
            ...normalized.map((item) => item.brandName).filter((item) => typeof item === "string" && item.length > 0),
          ])
        ).sort()
      );
    } catch (err) {
      setError(err.message);
      setProducts([]);
      setTotalElements(0);
      setTotalPages(0);
      setHasNext(false);
      setHasPrevious(false);
    } finally {
      setLoading(false);
    }
  }, [brand, categoryId, direction, keycloak, maxPrice, minPrice, page, query, size, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const showingFrom = totalElements === 0 ? 0 : page * size + 1;
  const showingTo = totalElements === 0 ? 0 : Math.min(totalElements, page * size + products.length);
  const currentPage = totalPages === 0 ? 0 : page + 1;

  const handleResetFilters = () => {
    setQuery("");
    setCategoryId("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSort("createdAt");
    setDirection("desc");
    setSize(20);
    setPage(0);
  };

  return (
    <section className="storefront">
      <div className="hero-banner">
        <div>
          <h2>Big Savings. Fast Checkout. Trusted Delivery.</h2>
          <p>Discover products from your `GET /api/product` endpoint and shop with a cart flow like major marketplaces.</p>
        </div>
        <div className="hero-stats">
          <span>{totalElements} products</span>
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

        <div className="filters-row catalog-filters">
          <input
            type="search"
            placeholder="Search for product name, sku, description"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />

          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(0);
            }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={brand}
            onChange={(event) => {
              setBrand(event.target.value);
              setPage(0);
            }}
          >
            <option value="">All Brands</option>
            {brandOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            placeholder="Min Price"
            value={minPrice}
            onChange={(event) => {
              setMinPrice(event.target.value);
              setPage(0);
            }}
          />

          <input
            type="number"
            min="0"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(event.target.value);
              setPage(0);
            }}
          />

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(0);
            }}
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                Sort: {item.label}
              </option>
            ))}
          </select>

          <select
            value={direction}
            onChange={(event) => {
              setDirection(event.target.value);
              setPage(0);
            }}
          >
            <option value="desc">Direction: Descending</option>
            <option value="asc">Direction: Ascending</option>
          </select>

          <select
            value={size}
            onChange={(event) => {
              setSize(Number(event.target.value));
              setPage(0);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                Page Size: {item}
              </option>
            ))}
          </select>

          <button type="button" className="secondary-button" onClick={handleResetFilters}>
            Clear
          </button>
        </div>

      {error && <p className="status error">{error}</p>}
      {!error && !loading && products.length === 0 && <p className="status">No products matched your filters.</p>}

      {products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} keycloak={keycloak} onAddToCart={addToCart} />
          ))}
        </div>
      )}

      <div className="pagination-bar">
        <span>
          Showing {showingFrom}-{showingTo} of {totalElements} (Page {currentPage} of {totalPages})
        </span>

        <div className="pagination-controls">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setPage((previous) => Math.max(0, previous - 1))}
            disabled={loading || !hasPrevious}
          >
            Previous
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => setPage((previous) => previous + 1)}
            disabled={loading || !hasNext}
          >
            Next
          </button>
        </div>
      </div>
      </section>
    </section>
  );
}

export default ProductListPage;

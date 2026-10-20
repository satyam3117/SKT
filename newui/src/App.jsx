
import { useCallback, useEffect, useState } from "react";
import {
    Search,
    ShoppingCart,
    UserRound,
    ChevronLeft,
    ChevronRight,
    PackageSearch,
    SlidersHorizontal,
    RefreshCw,
} from "lucide-react";

import {
    getProductsPage,
    searchProducts,
    getProductCategories,
} from "./services/productApi";

import { API_BASE_URL } from "./services/apiClient";

const PAGE_SIZE = 12;

function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
        return "Price unavailable";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) return "Price unavailable";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
}

function imageUrl(product) {
    const firstImage = product?.productImages?.find(
        (image) => image?.imageUrl
    );

    if (!firstImage) return null;

    try {
        return new URL(firstImage.imageUrl, API_BASE_URL).toString();
    } catch {
        return null;
    }
}

function ProductCard({ product }) {
    const [imageFailed, setImageFailed] = useState(false);
    const image = imageUrl(product);

    return (
        <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#D8DFD1] bg-[#FFFDF7] transition hover:border-zinc-400 hover:shadow-md">
            <div className="flex aspect-square items-center justify-center overflow-hidden bg-[#E5EBDD]">
                {image && !imageFailed ? (
                    <img
                        src={image}
                        alt={product.name || "Product"}
                        loading="lazy"
                        className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <PackageSearch
                        size={48}
                        strokeWidth={1.2}
                        className="text-zinc-300"
                        aria-label="No product image available"
                    />
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                    {String(product.productCategory || "Product").replaceAll("_", " ")}
                </p>

                <h3 className="line-clamp-2 min-h-12 font-semibold text-[#26372D]">
                    {product.name || "Unnamed product"}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                    {product.description || "Product details are not available."}
                </p>

                <div className="mt-auto pt-5">
                    <p className="text-lg font-bold text-[#26372D]">
                        {formatPrice(product.price)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        SKU: {product.skuCode || "Not assigned"}
                    </p>
                </div>
            </div>
        </article>
    );
}

function ErrorMessage({ message, onRetry }) {
    return (
        <div
            role="alert"
            className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-sm text-red-800">{message}</p>
            <button
                type="button"
                onClick={onRetry}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-[#FFFDF7] px-4 py-2 text-sm font-semibold text-red-800"
            >
                <RefreshCw size={15} />
                Try again
            </button>
        </div>
    );
}

function App() {
    const [categories, setCategories] = useState([]);
    const [categoriesError, setCategoriesError] = useState("");

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [minPriceInput, setMinPriceInput] = useState("");
    const [maxPriceInput, setMaxPriceInput] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState("createdAt");
    const [direction, setDirection] = useState("desc");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCategories = useCallback(async () => {
        setCategoriesError("");

        try {
            const data = await getProductCategories();
            const all = Array.isArray(data) ? data : [];

            const parentIds = new Set(
                all.map((category) => category.parentId).filter(Boolean)
            );

            setCategories(
                all.filter(
                    (category) =>
                        category.active !== false &&
                        !parentIds.has(category.id)
                )
            );
        } catch (err) {
            setCategories([]);
            setCategoriesError(
                err.message || "Unable to load categories from the server."
            );
        }
    }, []);



    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = {
                page,
                size: PAGE_SIZE,
                categoryId: categoryId || undefined,
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
                sort,
                direction,
            };

            const response = searchTerm
                ? await searchProducts({ ...params, q: searchTerm })
                : await getProductsPage(params);

            const items = Array.isArray(response?.items) ? response.items : [];

            setProducts(items);
            setTotalElements(Number(response?.totalElements ?? items.length));
            setHasNext(Boolean(response?.hasNext));
            setHasPrevious(Boolean(response?.hasPrevious));
        } catch (err) {
            setProducts([]);
            setTotalElements(0);
            setHasNext(false);
            setHasPrevious(false);
            setError(err.message || "Unable to load products.");
        } finally {
            setLoading(false);
        }
    }, [
        page,
        categoryId,
        minPrice,
        maxPrice,
        sort,
        direction,
        searchTerm,
    ]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    function submitSearch(event) {
        event.preventDefault();
        setPage(0);
        setSearchTerm(searchInput.trim());
    }

    function applyFilters(event) {
        event.preventDefault();

        const min = minPriceInput.trim();
        const max = maxPriceInput.trim();

        if (
            (min && (!Number.isFinite(Number(min)) || Number(min) < 0)) ||
            (max && (!Number.isFinite(Number(max)) || Number(max) < 0))
        ) {
            setError("Enter valid, non-negative prices.");
            return;
        }

        if (min && max && Number(min) > Number(max)) {
            setError("Minimum price cannot exceed maximum price.");
            return;
        }

        setMinPrice(min);
        setMaxPrice(max);
        setPage(0);
    }

    function clearFilters() {
        setCategoryId("");
        setMinPriceInput("");
        setMaxPriceInput("");
        setMinPrice("");
        setMaxPrice("");
        setSearchInput("");
        setSearchTerm("");
        setSort("createdAt");
        setDirection("desc");
        setPage(0);
    }

    const totalPages = Math.ceil(totalElements / PAGE_SIZE);

    return (
        <div className="min-h-screen bg-[#FFFDF7] text-[#26372D]">
            <div className="border-b border-[#D8DFD1] bg-[#245C45] text-center text-xs text-white">
                <p className="px-4 py-2">
                    SKT Computer Shop · Explore computer hardware and accessories
                </p>
            </div>

            <header className="sticky top-0 z-30 border-b border-[#D8DFD1] bg-[#FFFDF7]/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <a
                        href="/"
                        className="shrink-0 text-2xl font-extrabold tracking-tight"
                        aria-label="SKT home"
                    >
                        SKT<span className="text-[#245C45]">.</span>
                    </a>

                    <form
                        onSubmit={submitSearch}
                        className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 sm:flex"
                        role="search"
                    >
                        <Search size={18} className="shrink-0 text-zinc-500" />
                        <input
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Search products..."
                            aria-label="Search products"
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-[#245C45] px-4 py-2 text-sm font-semibold text-white"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex shrink-0 items-center gap-3 text-sm">
                        <a
                            href="/admin"
                            className="hidden items-center gap-2 text-zinc-600 hover:text-[#245C45] sm:flex"
                        >
                            <UserRound size={18} />
                            Admin
                        </a>
                        <a
                            href="#products"
                            className="inline-flex items-center gap-2 rounded-lg border border-[#D8DFD1] px-3 py-2 hover:bg-[#E5EBDD]"
                            aria-label="Browse products"
                        >
                            <ShoppingCart size={18} />
                            <span className="hidden sm:inline">Shop</span>
                        </a>
                    </div>
                </div>

                <form
                    onSubmit={submitSearch}
                    className="flex gap-2 px-4 pb-3 sm:hidden"
                    role="search"
                >
                    <input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search products..."
                        aria-label="Search products"
                        className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-[#245C45] px-3 py-2 text-sm font-semibold text-white"
                    >
                        Search
                    </button>
                </form>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <section className="mb-10 overflow-hidden rounded-2xl bg-[#245C45] px-6 py-10 text-white sm:px-10 sm:py-14">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                        SKT Computer Shop
                    </p>
                    <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
                        Find the right hardware for your next build.
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">
                        Browse our live catalog of computers, components, and accessories.
                        Product availability and prices depend on the information returned
                        by the store.
                    </p>
                    <a
                        href="#products"
                        className="mt-6 inline-flex rounded-lg bg-[#FFFDF7] px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                    >
                        Browse catalog
                    </a>
                </section>

                <section aria-labelledby="categories-heading" className="mb-12">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h2 id="categories-heading" className="text-xl font-bold">
                                Shop by category
                            </h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                Categories loaded from the product service
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadCategories}
                            className="text-sm font-semibold text-[#245C45] hover:underline"
                        >
                            Refresh
                        </button>
                    </div>

                    {categoriesError ? (
                        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                            {categoriesError}
                        </p>
                    ) : categories.length === 0 ? (
                        <p className="rounded-lg border border-[#D8DFD1] p-4 text-sm text-zinc-500">
                            No active root categories were returned by the server.
                        </p>
                    ) : (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setCategoryId("");
                                    setPage(0);
                                }}
                                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
                                    !categoryId
                                        ? "border-zinc-950 bg-[#245C45] text-white"
                                        : "border-zinc-300 hover:border-zinc-950"
                                }`}
                            >
                                All products
                            </button>

                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => {
                                        setCategoryId(category.id);
                                        setPage(0);
                                    }}
                                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
                                        categoryId === category.id
                                            ? "border-zinc-950 bg-[#245C45] text-white"
                                            : "border-zinc-300 hover:border-zinc-950"
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section id="products" aria-labelledby="products-heading">
                    <div className="mb-6 flex flex-col gap-4 border-b border-[#D8DFD1] pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 id="products-heading" className="text-2xl font-bold">
                                {searchTerm ? `Results for "${searchTerm}"` : "Our products"}
                            </h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                {loading
                                    ? "Loading catalog..."
                                    : `${totalElements} product${totalElements === 1 ? "" : "s"} found`}
                            </p>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <SlidersHorizontal size={16} className="text-zinc-500" />
                            <span className="text-zinc-600">Sort by</span>
                            <select
                                value={`${sort}:${direction}`}
                                onChange={(event) => {
                                    const [nextSort, nextDirection] = event.target.value.split(":");
                                    setSort(nextSort);
                                    setDirection(nextDirection);
                                    setPage(0);
                                }}
                                className="rounded-lg border border-zinc-300 bg-[#FFFDF7] px-3 py-2"
                            >
                                <option value="createdAt:desc">Newest</option>
                                <option value="createdAt:asc">Oldest</option>
                                <option value="price:asc">Price: low to high</option>
                                <option value="price:desc">Price: high to low</option>
                                <option value="name:asc">Name: A–Z</option>
                            </select>
                        </label>
                    </div>

                    <form
                        onSubmit={applyFilters}
                        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-[#D8DFD1] bg-[#E5EBDD] p-4"
                    >
                        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
                            Minimum price (₹)
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={minPriceInput}
                                onChange={(event) => setMinPriceInput(event.target.value)}
                                className="w-36 rounded-lg border border-zinc-300 bg-[#FFFDF7] px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
                            Maximum price (₹)
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={maxPriceInput}
                                onChange={(event) => setMaxPriceInput(event.target.value)}
                                className="w-36 rounded-lg border border-zinc-300 bg-[#FFFDF7] px-3 py-2 text-sm"
                            />
                        </label>

                        <button
                            type="submit"
                            className="rounded-lg bg-[#245C45] px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            Apply filters
                        </button>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg border border-zinc-300 bg-[#FFFDF7] px-4 py-2.5 text-sm font-semibold"
                        >
                            Clear filters
                        </button>
                    </form>

                    {error && (
                        <div className="mb-6">
                            <ErrorMessage message={error} onRetry={loadProducts} />
                        </div>
                    )}

                    {loading ? (
                        <div
                            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                            aria-label="Loading products"
                        >
                            {Array.from({ length: 8 }, (_, index) => (
                                <div
                                    key={index}
                                    className="animate-pulse overflow-hidden rounded-xl border border-[#D8DFD1]"
                                >
                                    <div className="aspect-square bg-zinc-100" />
                                    <div className="space-y-3 p-4">
                                        <div className="h-4 rounded bg-zinc-100" />
                                        <div className="h-4 w-2/3 rounded bg-zinc-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !error && products.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-14 text-center">
                            <PackageSearch className="mx-auto mb-3 text-zinc-400" size={36} />
                            <h3 className="font-semibold">No products found</h3>
                            <p className="mt-2 text-sm text-zinc-500">
                                Try another search or clear your filters.
                            </p>
                        </div>
                    ) : !error ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : null}

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                        <p className="text-sm text-zinc-500">
                            Page {page + 1}{totalPages > 0 ? ` of ${totalPages}` : ""}
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={loading || !hasPrevious}
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={loading || !hasNext}
                                onClick={() => setPage((current) => current + 1)}
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-16 border-t border-[#D8DFD1] bg-[#E5EBDD]">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <p className="font-bold tracking-tight text-[#26372D]">SKT Computer Shop</p>
                    <p>Product information is provided by the store catalog.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;

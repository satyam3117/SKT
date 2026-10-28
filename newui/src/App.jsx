import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    PackageSearch,
    SlidersHorizontal,
    RefreshCw,
} from "lucide-react";

import TopNavbar from "./components/layout/TopNavbar";
import SubNavbar from "./components/layout/SubNavbar";
import PopularCategories from "./components/sections/PopularCategories";

import {
    getProductsPage,
    searchProducts,
    getProductCategories,
} from "./services/productApi";

import { API_BASE_URL } from "./services/apiClient";

const PAGE_SIZE = 12;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatPrice(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Price unavailable";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "Price unavailable";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
}

function imageUrl(product) {
    const firstImage =
        product?.productImages?.find(
            (image) => image?.imageUrl
        );

    if (!firstImage) {
        return null;
    }

    try {
        return new URL(
            firstImage.imageUrl,
            API_BASE_URL
        ).toString();
    } catch {
        return null;
    }
}

/* -------------------------------------------------------------------------- */
/* Product Card                                                               */
/* -------------------------------------------------------------------------- */

function ProductCard({ product }) {
    const [imageFailed, setImageFailed] =
        useState(false);

    const image = imageUrl(product);

    return (
        <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#D8DFD1] bg-[#FFFDF7] transition duration-200 hover:-translate-y-1 hover:border-[#245C45] hover:shadow-lg">

            {/* Product Image */}
            <div className="flex aspect-square items-center justify-center overflow-hidden bg-[#E5EBDD]">

                {image && !imageFailed ? (
                    <img
                        src={image}
                        alt={
                            product.name ||
                            "Product"
                        }
                        loading="lazy"
                        className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
                        onError={() =>
                            setImageFailed(true)
                        }
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

            {/* Product Information */}
            <div className="flex flex-1 flex-col p-4">

                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                    {String(
                        product.productCategory ||
                        "Product"
                    ).replaceAll(
                        "_",
                        " "
                    )}
                </p>

                <h3 className="line-clamp-2 min-h-12 font-['Manrope'] font-bold text-[#26372D]">
                    {product.name ||
                        "Unnamed product"}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-500">
                    {product.description ||
                        "Product details are not available."}
                </p>

                <div className="mt-auto pt-5">

                    <p className="text-lg font-extrabold text-[#26372D]">
                        {formatPrice(
                            product.price
                        )}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                        SKU:{" "}
                        {product.skuCode ||
                            "Not assigned"}
                    </p>

                </div>
            </div>
        </article>
    );
}

/* -------------------------------------------------------------------------- */
/* Error Message                                                              */
/* -------------------------------------------------------------------------- */

function ErrorMessage({
                          message,
                          onRetry,
                      }) {
    return (
        <div
            role="alert"
            className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-sm text-red-800">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-[#FFFDF7] px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100"
            >
                <RefreshCw size={15} />

                Try again
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* App                                                                        */
/* -------------------------------------------------------------------------- */

function App() {

    /* ---------------------------------------------------------------------- */
    /* Categories                                                              */
    /* ---------------------------------------------------------------------- */

    const [categories, setCategories] =
        useState([]);

    const [categoriesLoading, setCategoriesLoading] =
        useState(true);

    const [categoriesError, setCategoriesError] =
        useState("");

    const navigate = useNavigate();

    /* ---------------------------------------------------------------------- */
    /* Products                                                                */
    /* ---------------------------------------------------------------------- */

    const [products, setProducts] =
        useState([]);

    const [page, setPage] =
        useState(0);

    const [totalElements, setTotalElements] =
        useState(0);

    const [hasNext, setHasNext] =
        useState(false);

    const [hasPrevious, setHasPrevious] =
        useState(false);

    /* ---------------------------------------------------------------------- */
    /* Search                                                                  */
    /* ---------------------------------------------------------------------- */

    const [searchInput, setSearchInput] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    /* ---------------------------------------------------------------------- */
    /* Filters                                                                 */
    /* ---------------------------------------------------------------------- */

    const [categoryId, setCategoryId] =
        useState("");

    const [minPriceInput, setMinPriceInput] =
        useState("");

    const [maxPriceInput, setMaxPriceInput] =
        useState("");

    const [minPrice, setMinPrice] =
        useState("");

    const [maxPrice, setMaxPrice] =
        useState("");

    /* ---------------------------------------------------------------------- */
    /* Sorting                                                                 */
    /* ---------------------------------------------------------------------- */

    const [sort, setSort] =
        useState("createdAt");

    const [direction, setDirection] =
        useState("desc");

    /* ---------------------------------------------------------------------- */
    /* Loading / errors                                                        */
    /* ---------------------------------------------------------------------- */

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    /* ---------------------------------------------------------------------- */
    /* Load categories from backend                                            */
    /* ---------------------------------------------------------------------- */

    const loadCategories =
        useCallback(async () => {

            setCategoriesLoading(true);
            setCategoriesError("");

            try {

                /*
                 * Backend:
                 *
                 * GET /api/product/categories
                 *
                 * productApi.js:
                 * getProductCategories()
                 */

                const data =
                    await getProductCategories();

                /*
                 * Support the possible response shapes:
                 *
                 * [
                 *   {...},
                 *   {...}
                 * ]
                 *
                 * OR
                 *
                 * {
                 *   items: [...]
                 * }
                 *
                 * OR
                 *
                 * {
                 *   content: [...]
                 * }
                 */

                const all =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(
                            data?.items
                        )
                            ? data.items
                            : Array.isArray(
                                data?.content
                            )
                                ? data.content
                                : [];

                /*
                 * IMPORTANT:
                 *
                 * Do NOT remove parent categories.
                 *
                 * SubNavbar needs the complete tree:
                 *
                 * Electronics
                 *    ├── Laptop
                 *    ├── Desktop
                 *    ├── GPU
                 *
                 * etc.
                 */

                const activeCategories =
                    all
                        .filter(
                            (category) =>
                                category &&
                                category.active !==
                                false
                        )
                        .sort(
                            (a, b) =>
                                (a.sortOrder ??
                                    0) -
                                (b.sortOrder ??
                                    0)
                        );

                setCategories(
                    activeCategories
                );

            } catch (err) {

                console.error(
                    "Failed to load categories:",
                    err
                );

                setCategories([]);

                setCategoriesError(
                    err?.message ||
                    "Unable to load categories from the server."
                );

            } finally {

                setCategoriesLoading(
                    false
                );
            }

        }, []);

    /* ---------------------------------------------------------------------- */
    /* Load products                                                           */
    /* ---------------------------------------------------------------------- */

    const loadProducts =
        useCallback(async () => {

            setLoading(true);
            setError("");

            try {

                const params = {
                    page,
                    size: PAGE_SIZE,

                    categoryId:
                        categoryId ||
                        undefined,

                    minPrice:
                        minPrice ||
                        undefined,

                    maxPrice:
                        maxPrice ||
                        undefined,

                    sort,

                    direction,
                };

                const response =
                    searchTerm
                        ? await searchProducts({
                            ...params,
                            q: searchTerm,
                        })
                        : await getProductsPage(
                            params
                        );

                const items =
                    Array.isArray(
                        response?.items
                    )
                        ? response.items
                        : Array.isArray(
                            response?.content
                        )
                            ? response.content
                            : [];

                setProducts(items);

                setTotalElements(
                    Number(
                        response?.totalElements ??
                        response?.total ??
                        items.length
                    )
                );

                setHasNext(
                    Boolean(
                        response?.hasNext
                    )
                );

                setHasPrevious(
                    Boolean(
                        response?.hasPrevious
                    )
                );

            } catch (err) {

                console.error(
                    "Failed to load products:",
                    err
                );

                setProducts([]);

                setTotalElements(0);

                setHasNext(false);

                setHasPrevious(false);

                setError(
                    err?.message ||
                    "Unable to load products."
                );

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

    /* ---------------------------------------------------------------------- */
    /* Initial category API call                                               */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    /* ---------------------------------------------------------------------- */
    /* Product API call                                                        */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    /* ---------------------------------------------------------------------- */
    /* Search                                                                  */
    /* ---------------------------------------------------------------------- */

    function handleSearch(value) {

        const search =
            String(value ?? "").trim();

        setSearchInput(search);

        setPage(0);

        setSearchTerm(search);
    }

    /* ---------------------------------------------------------------------- */
    /* Category selection                                                      */
    /* ---------------------------------------------------------------------- */

    function handleCategorySelect(category) {

        if (!category?.id) {
            return;
        }

        navigate(
            `/products/${category.id}`
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    /* ---------------------------------------------------------------------- */
    /* Select "All Products"                                                   */
    /* ---------------------------------------------------------------------- */

    function showAllProducts() {

        setCategoryId("");

        setPage(0);

        setTimeout(() => {

            document
                .getElementById(
                    "products"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

        }, 50);
    }

    /* ---------------------------------------------------------------------- */
    /* Price filters                                                           */
    /* ---------------------------------------------------------------------- */

    function applyFilters(event) {

        event.preventDefault();

        const min =
            minPriceInput.trim();

        const max =
            maxPriceInput.trim();

        if (
            min &&
            (
                !Number.isFinite(
                    Number(min)
                ) ||
                Number(min) < 0
            )
        ) {
            setError(
                "Enter a valid minimum price."
            );

            return;
        }

        if (
            max &&
            (
                !Number.isFinite(
                    Number(max)
                ) ||
                Number(max) < 0
            )
        ) {
            setError(
                "Enter a valid maximum price."
            );

            return;
        }

        if (
            min &&
            max &&
            Number(min) > Number(max)
        ) {
            setError(
                "Minimum price cannot exceed maximum price."
            );

            return;
        }

        setMinPrice(min);
        setMaxPrice(max);

        setPage(0);
    }

    /* ---------------------------------------------------------------------- */
    /* Clear filters                                                           */
    /* ---------------------------------------------------------------------- */

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

        setError("");
    }

    /* ---------------------------------------------------------------------- */
    /* Pagination                                                              */
    /* ---------------------------------------------------------------------- */

    const totalPages =
        Math.ceil(
            totalElements /
            PAGE_SIZE
        );

    /* ---------------------------------------------------------------------- */
    /* Render                                                                  */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="min-h-screen bg-[#FFFDF7] text-[#26372D]">

            {/* ============================================================ */}
            {/* Announcement bar                                               */}
            {/* ============================================================ */}

            <div className="border-b border-[#D8DFD1] bg-[#245C45] text-center text-xs text-white">

                <p className="px-4 py-2">
                    SKT Computer Shop ·
                    Computer Hardware &
                    Accessories
                </p>

            </div>

            {/* ============================================================ */}
            {/* MAIN NAVBAR                                                    */}
            {/* ============================================================ */}

            <TopNavbar
                searchValue={searchInput}
                onSearch={handleSearch}
            />

            {/* ============================================================ */}
            {/* CATEGORY NAVIGATION                                            */}
            {/* ============================================================ */}

            <SubNavbar
                categories={
                    categories
                }
                categoriesLoading={
                    categoriesLoading
                }
                categoriesError={
                    categoriesError
                }
                onCategorySelect={
                    handleCategorySelect
                }
            />

            {/* ============================================================ */}
            {/* MAIN CONTENT                                                   */}
            {/* ============================================================ */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                {/* ======================================================== */}
                {/* HERO                                                       */}
                {/* ======================================================== */}

                <section className="relative mb-14 overflow-hidden rounded-2xl bg-[#245C45] px-6 py-12 text-white sm:px-10 sm:py-16">

                    {/* Decorative background */}
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

                    <div className="absolute -bottom-32 -right-10 h-80 w-80 rounded-full border border-white/10" />

                    <div className="relative z-10 max-w-2xl">

                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#D9E8D9]">
                            SKT Computer
                            Shop
                        </p>

                        <h1 className="font-['Manrope'] text-3xl font-extrabold leading-tight sm:text-5xl">
                            Build better.
                            <br />
                            Upgrade smarter.
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                            Shop processors,
                            graphics cards,
                            laptops,
                            desktops,
                            storage,
                            memory and
                            computer
                            accessories.
                        </p>

                        <a
                            href="#products"
                            className="mt-7 inline-flex items-center rounded-lg bg-[#FFFDF7] px-5 py-3 text-sm font-bold text-[#245C45] transition hover:bg-white"
                        >
                            Shop Products
                        </a>

                    </div>

                </section>

                {/* ======================================================== */}
                {/* SHOP BY CATEGORY                                           */}
                {/* ======================================================== */}

                <PopularCategories
                    categories={categories}
                    onCategorySelect={handleCategorySelect}
                />

                {/* ======================================================== */}
                {/* PRODUCTS                                                   */}
                {/* ======================================================== */}

                <section
                    id="products"
                    aria-labelledby="products-heading"
                    className="scroll-mt-32"
                >

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 border-b border-[#D8DFD1] pb-5 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#245C45]">
                                Catalog
                            </p>

                            <h2
                                id="products-heading"
                                className="font-['Manrope'] text-2xl font-extrabold"
                            >
                                {searchTerm
                                    ? `Results for "${searchTerm}"`
                                    : "Our Products"}
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">

                                {loading
                                    ? "Loading catalog..."
                                    : `${totalElements} product${
                                        totalElements ===
                                        1
                                            ? ""
                                            : "s"
                                    } found`}

                            </p>

                        </div>

                        {/* Sort */}
                        <label className="flex items-center gap-2 text-sm">

                            <SlidersHorizontal
                                size={16}
                                className="text-zinc-500"
                            />

                            <span className="text-zinc-600">
                                Sort by
                            </span>

                            <select
                                value={`${sort}:${direction}`}
                                onChange={(
                                    event
                                ) => {

                                    const [
                                        nextSort,
                                        nextDirection,
                                    ] =
                                        event.target.value.split(
                                            ":"
                                        );

                                    setSort(
                                        nextSort
                                    );

                                    setDirection(
                                        nextDirection
                                    );

                                    setPage(0);
                                }}
                                className="rounded-lg border border-[#D8DFD1] bg-white px-3 py-2 outline-none focus:border-[#245C45]"
                            >

                                <option value="createdAt:desc">
                                    Newest
                                </option>

                                <option value="createdAt:asc">
                                    Oldest
                                </option>

                                <option value="price:asc">
                                    Price: low to high
                                </option>

                                <option value="price:desc">
                                    Price: high to low
                                </option>

                                <option value="name:asc">
                                    Name: A–Z
                                </option>

                            </select>

                        </label>

                    </div>

                    {/* ==================================================== */}
                    {/* Filters                                                */}
                    {/* ==================================================== */}

                    <form
                        onSubmit={
                            applyFilters
                        }
                        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-[#D8DFD1] bg-[#E5EBDD] p-4"
                    >

                        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">

                            Minimum price
                            (₹)

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    minPriceInput
                                }
                                onChange={(
                                    event
                                ) =>
                                    setMinPriceInput(
                                        event.target.value
                                    )
                                }
                                className="w-36 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#245C45]"
                            />

                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">

                            Maximum price
                            (₹)

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    maxPriceInput
                                }
                                onChange={(
                                    event
                                ) =>
                                    setMaxPriceInput(
                                        event.target.value
                                    )
                                }
                                className="w-36 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#245C45]"
                            />

                        </label>

                        <button
                            type="submit"
                            className="rounded-lg bg-[#245C45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4d39]"
                        >
                            Apply filters
                        </button>

                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-zinc-50"
                        >
                            Clear filters
                        </button>

                    </form>

                    {/* ==================================================== */}
                    {/* Error                                                  */}
                    {/* ==================================================== */}

                    {error && (
                        <div className="mb-6">

                            <ErrorMessage
                                message={
                                    error
                                }
                                onRetry={
                                    loadProducts
                                }
                            />

                        </div>
                    )}

                    {/* ==================================================== */}
                    {/* Loading                                                */}
                    {/* ==================================================== */}

                    {loading && (
                        <div
                            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                            aria-label="Loading products"
                        >

                            {Array.from(
                                {
                                    length: 8,
                                },
                                (_, index) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="animate-pulse overflow-hidden rounded-xl border border-[#D8DFD1]"
                                    >

                                        <div className="aspect-square bg-zinc-100" />

                                        <div className="space-y-3 p-4">

                                            <div className="h-4 rounded bg-zinc-100" />

                                            <div className="h-4 w-2/3 rounded bg-zinc-100" />

                                            <div className="h-5 w-1/2 rounded bg-zinc-100" />

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                    {/* ==================================================== */}
                    {/* Empty                                                   */}
                    {/* ==================================================== */}

                    {!loading &&
                        !error &&
                        products.length ===
                        0 && (
                            <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-14 text-center">

                                <PackageSearch
                                    className="mx-auto mb-3 text-zinc-400"
                                    size={36}
                                />

                                <h3 className="font-semibold">
                                    No products
                                    found
                                </h3>

                                <p className="mt-2 text-sm text-zinc-500">
                                    Try another
                                    search or
                                    clear your
                                    filters.
                                </p>

                            </div>
                        )}

                    {/* ==================================================== */}
                    {/* Product grid                                           */}
                    {/* ==================================================== */}

                    {!loading &&
                        !error &&
                        products.length >
                        0 && (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                                {products.map(
                                    (
                                        product
                                    ) => (
                                        <ProductCard
                                            key={
                                                product.id
                                            }
                                            product={
                                                product
                                            }
                                        />
                                    )
                                )}

                            </div>
                        )}

                    {/* ==================================================== */}
                    {/* Pagination                                             */}
                    {/* ==================================================== */}

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">

                        <p className="text-sm text-zinc-500">

                            Page{" "}
                            {page + 1}

                            {totalPages >
                            0
                                ? ` of ${totalPages}`
                                : ""}

                        </p>

                        <div className="flex gap-2">

                            <button
                                type="button"
                                disabled={
                                    loading ||
                                    !hasPrevious
                                }
                                onClick={() =>
                                    setPage(
                                        (
                                            current
                                        ) =>
                                            Math.max(
                                                0,
                                                current -
                                                1
                                            )
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >

                                <ChevronLeft
                                    size={16}
                                />

                                Previous

                            </button>

                            <button
                                type="button"
                                disabled={
                                    loading ||
                                    !hasNext
                                }
                                onClick={() =>
                                    setPage(
                                        (
                                            current
                                        ) =>
                                            current +
                                            1
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >

                                Next

                                <ChevronRight
                                    size={16}
                                />

                            </button>

                        </div>

                    </div>

                </section>

            </main>

            {/* ============================================================ */}
            {/* Footer                                                        */}
            {/* ============================================================ */}

            <footer className="mt-16 border-t border-[#D8DFD1] bg-[#E5EBDD]">

                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">

                    <p className="font-bold tracking-tight text-[#26372D]">
                        SKT Computer Shop
                    </p>

                    <p>
                        Computer hardware,
                        components and
                        accessories.
                    </p>

                </div>

            </footer>

        </div>
    );
}

export default App;
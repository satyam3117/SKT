import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    PackageSearch,
    RefreshCw,
    SlidersHorizontal,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import TopNavbar from "../components/layout/TopNavbar";
import SubNavbar from "../components/layout/SubNavbar";

import {
    getProductCategories,
    getProductsPage,
    searchProducts,
} from "../services/productApi";

import { API_BASE_URL } from "../services/apiClient";

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

function getProductImage(product) {
    const firstImage =
        product?.productImages?.find(
            (image) => image?.imageUrl
        );

    if (!firstImage?.imageUrl) {
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

    const image = getProductImage(product);

    return (
        <article
            className="
                group flex min-w-0 flex-col overflow-hidden
                rounded-xl border border-[#D8DFD1]
                bg-[#FFFDF7]
                transition duration-200
                hover:-translate-y-1
                hover:border-[#245C45]
                hover:shadow-lg
            "
        >
            {/* Image */}

            <div
                className="
                    flex aspect-square items-center
                    justify-center overflow-hidden
                    bg-[#E5EBDD]
                "
            >
                {image && !imageFailed ? (
                    <img
                        src={image}
                        alt={
                            product?.name ||
                            "Product"
                        }
                        loading="lazy"
                        className="
                            h-full w-full object-contain
                            p-4 transition duration-300
                            group-hover:scale-105
                        "
                        onError={() =>
                            setImageFailed(true)
                        }
                    />
                ) : (
                    <PackageSearch
                        size={48}
                        strokeWidth={1.2}
                        className="text-zinc-300"
                    />
                )}
            </div>

            {/* Information */}

            <div className="flex flex-1 flex-col p-4">

                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                    {String(
                        product?.productCategory ||
                        "Product"
                    ).replaceAll("_", " ")}
                </p>

                <h3
                    className="
                        line-clamp-2 min-h-12
                        font-['Manrope']
                        font-bold
                        text-[#26372D]
                    "
                >
                    {product?.name ||
                        "Unnamed product"}
                </h3>

                <p
                    className="
                        mt-2 line-clamp-2
                        text-sm leading-5
                        text-zinc-500
                    "
                >
                    {product?.description ||
                        "Product details are not available."}
                </p>

                <div className="mt-auto pt-5">

                    <p
                        className="
                            text-lg font-extrabold
                            text-[#26372D]
                        "
                    >
                        {formatPrice(
                            product?.price
                        )}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                        SKU:{" "}
                        {product?.skuCode ||
                            "Not assigned"}
                    </p>

                </div>
            </div>
        </article>
    );
}

/* -------------------------------------------------------------------------- */
/* Error                                                                      */
/* -------------------------------------------------------------------------- */

function ErrorMessage({
                          message,
                          onRetry,
                      }) {
    return (
        <div
            role="alert"
            className="
                flex flex-col items-start gap-3
                rounded-xl border border-red-200
                bg-red-50 p-5
                sm:flex-row sm:items-center
                sm:justify-between
            "
        >
            <p className="text-sm text-red-800">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="
                    inline-flex shrink-0
                    items-center gap-2
                    rounded-lg
                    border border-red-200
                    bg-[#FFFDF7]
                    px-4 py-2
                    text-sm font-semibold
                    text-red-800
                    hover:bg-red-100
                "
            >
                <RefreshCw size={15} />

                Try again
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                            */
/* -------------------------------------------------------------------------- */

function ProductSkeleton() {
    return (
        <div
            className="
                overflow-hidden rounded-xl
                border border-[#D8DFD1]
                bg-white
            "
        >
            <div className="aspect-square animate-pulse bg-[#E5EBDD]" />

            <div className="space-y-3 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-[#E5EBDD]" />
                <div className="h-5 w-4/5 animate-pulse rounded bg-[#E5EBDD]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#E5EBDD]" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-[#E5EBDD]" />
                <div className="h-6 w-24 animate-pulse rounded bg-[#E5EBDD]" />
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Category Products Page                                                      */
/* -------------------------------------------------------------------------- */

export default function CategoryProductsPage() {

    const { categoryId } = useParams();

    const navigate = useNavigate();

    /* ---------------------------------------------------------------------- */
    /* Categories                                                              */
    /* ---------------------------------------------------------------------- */

    const [categories, setCategories] =
        useState([]);

    const [
        categoriesLoading,
        setCategoriesLoading,
    ] = useState(true);

    const [
        categoriesError,
        setCategoriesError,
    ] = useState("");

    /* ---------------------------------------------------------------------- */
    /* Products                                                                */
    /* ---------------------------------------------------------------------- */

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [page, setPage] =
        useState(0);

    const [
        totalElements,
        setTotalElements,
    ] = useState(0);

    const [hasNext, setHasNext] =
        useState(false);

    const [
        hasPrevious,
        setHasPrevious,
    ] = useState(false);

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

    const [minPriceInput, setMinPriceInput] =
        useState("");

    const [maxPriceInput, setMaxPriceInput] =
        useState("");

    const [minPrice, setMinPrice] =
        useState("");

    const [maxPrice, setMaxPrice] =
        useState("");

    const [sort, setSort] =
        useState("createdAt");

    const [direction, setDirection] =
        useState("desc");

    /* ---------------------------------------------------------------------- */
    /* Load categories                                                         */
    /* ---------------------------------------------------------------------- */

    const loadCategories =
        useCallback(async () => {

            setCategoriesLoading(true);
            setCategoriesError("");

            try {

                const data =
                    await getProductCategories();

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

                const activeCategories =
                    all
                        .filter(
                            (category) =>
                                category &&
                                category.active !== false
                        )
                        .sort(
                            (a, b) =>
                                (a.sortOrder ?? 0) -
                                (b.sortOrder ?? 0)
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
                    "Unable to load categories."
                );

            } finally {

                setCategoriesLoading(false);
            }

        }, []);

    /* ---------------------------------------------------------------------- */
    /* Selected category                                                       */
    /* ---------------------------------------------------------------------- */

    const selectedCategory =
        useMemo(() => {

            return categories.find(
                (category) =>
                    String(category.id) ===
                    String(categoryId)
            );

        }, [
            categories,
            categoryId,
        ]);

    /* ---------------------------------------------------------------------- */
    /* Find all descendant category IDs                                       */
    /* ---------------------------------------------------------------------- */

    const categoryIds =
        useMemo(() => {

            if (!categoryId) {
                return [];
            }

            const ids = [
                String(categoryId),
            ];

            const queue = [
                String(categoryId),
            ];

            while (queue.length > 0) {

                const parentId =
                    queue.shift();

                categories.forEach(
                    (category) => {

                        if (
                            category.active === false
                        ) {
                            return;
                        }

                        if (
                            String(
                                category.parentId
                            ) ===
                            String(parentId)
                        ) {

                            const childId =
                                String(
                                    category.id
                                );

                            if (
                                !ids.includes(
                                    childId
                                )
                            ) {

                                ids.push(
                                    childId
                                );

                                queue.push(
                                    childId
                                );
                            }
                        }
                    }
                );
            }

            return ids;

        }, [
            categoryId,
            categories,
        ]);

    /* ---------------------------------------------------------------------- */
    /* Load products                                                           */
    /* ---------------------------------------------------------------------- */

    const loadProducts =
        useCallback(async () => {

            if (
                !categoryId ||
                categoryIds.length === 0
            ) {
                return;
            }

            setLoading(true);
            setError("");

            try {

                const params = {
                    page,
                    size: PAGE_SIZE,

                    categoryIds:
                        categoryIds.join(","),

                    minPrice:
                        minPrice || undefined,

                    maxPrice:
                        maxPrice || undefined,

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
                    "Failed to load category products:",
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
            categoryId,
            categoryIds,
            page,
            minPrice,
            maxPrice,
            sort,
            direction,
            searchTerm,
        ]);

    /* ---------------------------------------------------------------------- */
    /* Effects                                                                 */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {

        if (
            categoryId &&
            categories.length > 0 &&
            categoryIds.length > 0
        ) {
            loadProducts();
        }

    }, [
        categoryId,
        categories,
        categoryIds,
        loadProducts,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Search                                                                  */
    /* ---------------------------------------------------------------------- */

    function handleSearch(value) {

        const search =
            String(value ?? "").trim();

        setSearchInput(search);

        setSearchTerm(search);

        setPage(0);
    }

    /* ---------------------------------------------------------------------- */
    /* Category navigation                                                     */
    /* ---------------------------------------------------------------------- */

    function handleCategorySelect(
        category
    ) {

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
    /* Invalid category                                                        */
    /* ---------------------------------------------------------------------- */

    if (
        !categoriesLoading &&
        categories.length > 0 &&
        !selectedCategory
    ) {

        return (
            <div className="min-h-screen bg-[#FFFDF7] text-[#26372D]">

                <div className="border-b border-[#D8DFD1] bg-[#245C45] text-center text-xs text-white">
                    <p className="px-4 py-2">
                        SKT Computer Shop ·
                        Computer Hardware &
                        Accessories
                    </p>
                </div>

                <TopNavbar
                    searchValue={searchInput}
                    onSearch={handleSearch}
                />

                <SubNavbar
                    categories={categories}
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

                <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

                    <div className="rounded-xl border border-[#D8DFD1] bg-white p-10 text-center">

                        <h1 className="text-2xl font-extrabold">
                            Category not found
                        </h1>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/")
                            }
                            className="
                                mt-5 rounded-lg
                                bg-[#245C45]
                                px-5 py-3
                                text-sm font-semibold
                                text-white
                            "
                        >
                            Back to Home
                        </button>

                    </div>

                </main>
            </div>
        );
    }

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
            {/* Same Top Navbar                                                */}
            {/* ============================================================ */}

            <TopNavbar
                searchValue={searchInput}
                onSearch={handleSearch}
            />

            {/* ============================================================ */}
            {/* Same Category Navbar                                           */}
            {/* ============================================================ */}

            <SubNavbar
                categories={categories}
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
            {/* Main                                                           */}
            {/* ============================================================ */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Breadcrumb */}

                <div className="mb-5 flex items-center gap-2 text-xs text-zinc-500">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                        className="hover:text-[#245C45]"
                    >
                        Home
                    </button>

                    <ChevronRight size={13} />

                    {selectedCategory && (
                        <>
                            <span className="text-[#245C45]">
                                {
                                    selectedCategory.name
                                }
                            </span>
                        </>
                    )}

                </div>

                {/* Header */}

                <section className="mb-8">

                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                        <div>

                            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#245C45]">
                                Category
                            </p>

                            <h1
                                className="
                                    font-['Manrope']
                                    text-3xl font-extrabold
                                    tracking-tight
                                    text-[#26372D]
                                    sm:text-4xl
                                "
                            >
                                {selectedCategory?.name ||
                                    "Products"}
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                                Explore{" "}
                                {
                                    selectedCategory?.name
                                }{" "}
                                and all products
                                available in its
                                subcategories.
                            </p>

                        </div>

                        {!loading && (
                            <p className="text-sm text-zinc-500">
                                {totalElements}{" "}
                                {totalElements === 1
                                    ? "product"
                                    : "products"}
                            </p>
                        )}

                    </div>

                </section>

                {/* Subcategories */}

                {selectedCategory && (
                    <SubcategoryStrip
                        category={
                            selectedCategory
                        }
                        categories={
                            categories
                        }
                        onSelect={
                            handleCategorySelect
                        }
                    />
                )}

                {/* Content */}

                <div
                    id="category-products"
                    className="
                        grid gap-8
                        lg:grid-cols-[240px_1fr]
                    "
                >

                    {/* ==================================================== */}
                    {/* Sidebar                                                 */}
                    {/* ==================================================== */}

                    <aside>

                        <div
                            className="
                                sticky top-24
                                rounded-xl
                                border border-[#D8DFD1]
                                bg-white p-5
                            "
                        >

                            <div className="mb-5 flex items-center gap-2">

                                <SlidersHorizontal
                                    size={18}
                                />

                                <h2 className="font-bold">
                                    Filters
                                </h2>

                            </div>

                            <form
                                onSubmit={
                                    applyFilters
                                }
                            >

                                <label className="block text-xs font-semibold text-zinc-600">
                                    Minimum price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        minPriceInput
                                    }
                                    onChange={(event) =>
                                        setMinPriceInput(
                                            event.target.value
                                        )
                                    }
                                    placeholder="₹0"
                                    className="
                                        mt-2 w-full
                                        rounded-lg
                                        border border-[#D8DFD1]
                                        bg-[#FFFDF7]
                                        px-3 py-2.5
                                        text-sm outline-none
                                        focus:border-[#245C45]
                                    "
                                />

                                <label className="mt-4 block text-xs font-semibold text-zinc-600">
                                    Maximum price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        maxPriceInput
                                    }
                                    onChange={(event) =>
                                        setMaxPriceInput(
                                            event.target.value
                                        )
                                    }
                                    placeholder="₹100000"
                                    className="
                                        mt-2 w-full
                                        rounded-lg
                                        border border-[#D8DFD1]
                                        bg-[#FFFDF7]
                                        px-3 py-2.5
                                        text-sm outline-none
                                        focus:border-[#245C45]
                                    "
                                />

                                <button
                                    type="submit"
                                    className="
                                        mt-5 w-full
                                        rounded-lg
                                        bg-[#245C45]
                                        px-4 py-2.5
                                        text-sm font-bold
                                        text-white
                                        transition
                                        hover:bg-[#1d4d39]
                                    "
                                >
                                    Apply Filters
                                </button>

                            </form>

                            <div className="my-5 border-t border-[#D8DFD1]" />

                            <label className="block text-xs font-semibold text-zinc-600">
                                Sort products
                            </label>

                            <select
                                value={sort}
                                onChange={(event) => {
                                    setSort(
                                        event.target.value
                                    );
                                    setPage(0);
                                }}
                                className="
                                    mt-2 w-full
                                    rounded-lg
                                    border border-[#D8DFD1]
                                    bg-[#FFFDF7]
                                    px-3 py-2.5
                                    text-sm outline-none
                                "
                            >
                                <option value="createdAt">
                                    Newest
                                </option>

                                <option value="price">
                                    Price
                                </option>

                                <option value="name">
                                    Name
                                </option>

                                <option value="updatedAt">
                                    Recently updated
                                </option>
                            </select>

                            {sort === "price" && (
                                <select
                                    value={direction}
                                    onChange={(event) => {
                                        setDirection(
                                            event.target.value
                                        );
                                        setPage(0);
                                    }}
                                    className="
                                        mt-3 w-full
                                        rounded-lg
                                        border border-[#D8DFD1]
                                        bg-[#FFFDF7]
                                        px-3 py-2.5
                                        text-sm outline-none
                                    "
                                >
                                    <option value="asc">
                                        Low to High
                                    </option>

                                    <option value="desc">
                                        High to Low
                                    </option>
                                </select>
                            )}

                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                                className="
                                    mt-3 w-full
                                    rounded-lg
                                    border border-[#D8DFD1]
                                    px-4 py-2.5
                                    text-sm font-semibold
                                    text-zinc-600
                                    hover:bg-[#F1F3ED]
                                "
                            >
                                Clear Filters
                            </button>

                        </div>

                    </aside>

                    {/* ==================================================== */}
                    {/* Products                                                */}
                    {/* ==================================================== */}

                    <section>

                        {error && (
                            <ErrorMessage
                                message={error}
                                onRetry={
                                    loadProducts
                                }
                            />
                        )}

                        {!error && loading && (
                            <div
                                className="
                                    grid grid-cols-2
                                    gap-4
                                    sm:grid-cols-2
                                    xl:grid-cols-3
                                "
                            >
                                {Array.from({
                                    length: PAGE_SIZE,
                                }).map(
                                    (_, index) => (
                                        <ProductSkeleton
                                            key={index}
                                        />
                                    )
                                )}
                            </div>
                        )}

                        {!error &&
                            !loading &&
                            products.length ===
                            0 && (
                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-[#D8DFD1]
                                        bg-white
                                        p-12
                                        text-center
                                    "
                                >
                                    <PackageSearch
                                        size={50}
                                        strokeWidth={1.2}
                                        className="
                                            mx-auto
                                            text-zinc-300
                                        "
                                    />

                                    <h2 className="mt-5 text-xl font-bold">
                                        No products found
                                    </h2>

                                    <p className="mt-2 text-sm text-zinc-500">
                                        There are currently
                                        no products in this
                                        category.
                                    </p>
                                </div>
                            )}

                        {!error &&
                            !loading &&
                            products.length > 0 && (
                                <>
                                    <div
                                        className="
                                            grid grid-cols-2
                                            gap-4
                                            sm:grid-cols-2
                                            xl:grid-cols-3
                                        "
                                    >
                                        {products.map(
                                            (product) => (
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

                                    {/* Pagination */}

                                    <div
                                        className="
                                            mt-10 flex
                                            items-center
                                            justify-center
                                            gap-4
                                        "
                                    >

                                        <button
                                            type="button"
                                            disabled={
                                                !hasPrevious
                                            }
                                            onClick={() =>
                                                setPage(
                                                    (current) =>
                                                        Math.max(
                                                            0,
                                                            current - 1
                                                        )
                                                )
                                            }
                                            className="
                                                flex h-10 w-10
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-[#D8DFD1]
                                                bg-white
                                                disabled:cursor-not-allowed
                                                disabled:opacity-30
                                                hover:border-[#245C45]
                                                hover:bg-[#E5EBDD]
                                            "
                                        >
                                            <ChevronLeft
                                                size={18}
                                            />
                                        </button>

                                        <span className="text-sm font-semibold text-zinc-600">
                                            Page{" "}
                                            {page + 1}
                                            {" "}
                                            of{" "}
                                            {Math.max(
                                                totalPages,
                                                1
                                            )}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={
                                                !hasNext
                                            }
                                            onClick={() =>
                                                setPage(
                                                    (current) =>
                                                        current + 1
                                                )
                                            }
                                            className="
                                                flex h-10 w-10
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-[#D8DFD1]
                                                bg-white
                                                disabled:cursor-not-allowed
                                                disabled:opacity-30
                                                hover:border-[#245C45]
                                                hover:bg-[#E5EBDD]
                                            "
                                        >
                                            <ChevronRight
                                                size={18}
                                            />
                                        </button>

                                    </div>
                                </>
                            )}

                    </section>
                </div>

            </main>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Subcategory Strip                                                          */
/* -------------------------------------------------------------------------- */

function SubcategoryStrip({
                              category,
                              categories,
                              onSelect,
                          }) {

    const children =
        categories
            .filter(
                (item) =>
                    String(item.parentId) ===
                    String(category.id) &&
                    item.active !== false
            )
            .sort(
                (a, b) =>
                    (a.sortOrder ?? 0) -
                    (b.sortOrder ?? 0)
            );

    if (children.length === 0) {
        return null;
    }

    return (
        <section className="mb-8">

            <div className="mb-3 flex items-center justify-between">

                <h2 className="text-sm font-bold text-[#26372D]">
                    Shop by subcategory
                </h2>

            </div>

            <div
                className="
                    flex gap-3
                    overflow-x-auto
                    pb-2
                "
            >

                {children.map(
                    (child) => (
                        <button
                            key={child.id}
                            type="button"
                            onClick={() =>
                                onSelect(
                                    child
                                )
                            }
                            className="
                                shrink-0
                                rounded-full
                                border
                                border-[#D8DFD1]
                                bg-white
                                px-5 py-2.5
                                text-sm
                                font-semibold
                                text-zinc-700
                                transition
                                hover:border-[#245C45]
                                hover:bg-[#E5EBDD]
                                hover:text-[#245C45]
                            "
                        >
                            {child.name}
                        </button>
                    )
                )}

            </div>
        </section>
    );
}
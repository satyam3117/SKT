import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import ProductDetailsModal from "../shared/ProductDetailsModal";
import {
    ChevronRight,
    Laptop,
    ShoppingCart,
} from "lucide-react";

import RatingStars from "../shared/RatingStars";

import {
    getProductsPage,
    searchProducts,
} from "../../services/productApi";


const SORT_CONFIG = {
    default: {
        sort: "createdAt",
        direction: "desc",
    },

    popularity: {
        sort: "createdAt",
        direction: "desc",
    },

    rating: {
        sort: "name",
        direction: "asc",
    },

    latest: {
        sort: "createdAt",
        direction: "desc",
    },

    priceAsc: {
        sort: "price",
        direction: "asc",
    },

    priceDesc: {
        sort: "price",
        direction: "desc",
    },
};


const DEFAULT_TAGS = [
    "Gaming Laptop",
    "Dell Laptop",
    "HP Laptop",
    "Lenovo Laptop",
    "MSI Laptop",
];


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getCpuLabel(product) {
    const candidates = [
        product?.brandName,
        product?.brand,
        product?.cpuPlatform,
        product?.processor,
    ];

    const value = candidates.find(
        (item) =>
            typeof item === "string" &&
            item.trim().length > 0
    );

    return value
        ? value.trim().toUpperCase()
        : "";
}


function getRamLabel(product) {
    const candidates = [
        product?.ramCapacity,
        product?.ram,
        product?.memory,
        product?.ramGb
            ? `${product.ramGb} GB`
            : null,
    ];

    const value = candidates.find(
        (item) =>
            typeof item === "string" &&
            item.trim().length > 0
    );

    if (value) {
        return value.trim().toUpperCase();
    }

    const attributes = Array.isArray(
        product?.attributes
    )
        ? product.attributes
        : [];

    const ramAttribute = attributes.find(
        (entry) => {
            const key = String(
                entry?.key ||
                entry?.name ||
                ""
            ).toLowerCase();

            return (
                key.includes("ram") ||
                key.includes("memory")
            );
        }
    );

    const rawValue = ramAttribute?.value;

    if (
        typeof rawValue === "string" &&
        rawValue.trim()
    ) {
        return rawValue
            .trim()
            .toUpperCase();
    }

    return "";
}


function normalizeProduct(item) {
    const price = Number(
        item?.price ?? 0
    );

    const rating = Number(
        item?.rating ??
        item?.averageRating ??
        0
    );

    const reviews = Number(
        item?.reviews ??
        item?.reviewCount ??
        0
    );

    const type = String(
        item?.productCategory ||
        item?.productType ||
        item?.categoryId ||
        "PRODUCT"
    )
        .replaceAll("_", " ")
        .toUpperCase();

    return {
        ...item,

        id:
            item?.id ||
            item?.skuCode ||
            `${item?.name || "product"}-${
  item?.price || "0"
}`,

        name:
            item?.name ||
            "Unnamed Product",

        type,

        price:
            Number.isFinite(price)
                ? price
                : 0,

        rating:
            Number.isFinite(rating)
                ? rating
                : 0,

        reviews:
            Number.isFinite(reviews)
                ? reviews
                : 0,

        isNew:
            Boolean(
                item?.isNew
            ),

        cpuLabel:
            getCpuLabel(item),

        ramLabel:
            getRamLabel(item),
    };
}


/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

function ProductListing({
    cpuPlatforms = [],
    ramCapacities = [],
    laptopTags = DEFAULT_TAGS,
    laptopProducts = [],
    onAddToCart,
}) {
    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        products,
        setProducts,
    ] = useState([]);

    const [
        query,
        setQuery,
    ] = useState("");

    const [
        selectedCpu,
        setSelectedCpu,
    ] = useState("");

    const [
        selectedRam,
        setSelectedRam,
    ] = useState("");

    const [
        minPrice,
        setMinPrice,
    ] = useState("");

    const [
        maxPrice,
        setMaxPrice,
    ] = useState("");

    const [
        sortMode,
        setSortMode,
    ] = useState("default");

    const [
        page,
        setPage,
    ] = useState(0);

    const size = 20;

    const [
        totalElements,
        setTotalElements,
    ] = useState(0);

    const [
        hasNext,
        setHasNext,
    ] = useState(false);

    const [
        hasPrevious,
        setHasPrevious,
    ] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | LOAD PRODUCTS FROM BACKEND
    |--------------------------------------------------------------------------
    */

    const loadProducts = useCallback(
        async () => {
            setLoading(true);
            setError("");

            try {
                const selectedSort =
                    SORT_CONFIG[
                        sortMode
                    ] ||
                    SORT_CONFIG.default;

                const params = {
                    page,
                    size,

                    /*
                     * ProductController expects
                     * "brand", not "brandId".
                     */
                    brand:
                        selectedCpu.trim() ||
                        undefined,

                    minPrice:
                        minPrice.trim() ||
                        undefined,

                    maxPrice:
                        maxPrice.trim() ||
                        undefined,

                    sort:
                        selectedSort.sort,

                    direction:
                        selectedSort.direction,
                };


                /*
                 * IMPORTANT:
                 *
                 * Do NOT pass keycloak here.
                 *
                 * productApi expects params only.
                 */

                const response =
                    query.trim()
                        ? await searchProducts({
                            q: query.trim(),
                            ...params,
                        })
                        : await getProductsPage(
                            params
                        );


                const items =
                    Array.isArray(
                        response?.items
                    )
                        ? response.items
                        : [];


                const normalized =
                    items.map(
                        normalizeProduct
                    );


                setProducts(
                    normalized
                );

                setTotalElements(
                    Number(
                        response?.totalElements ??
                        normalized.length
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
                    err instanceof Error
                        ? err.message
                        : "Unable to fetch products."
                );

            } finally {
                setLoading(false);
            }
        },
        [
            maxPrice,
            minPrice,
            page,
            query,
            selectedCpu,
            sortMode,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | INITIAL / FILTERED LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);


    /*
    |--------------------------------------------------------------------------
    | FALLBACK
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | We do NOT use laptopProducts when the backend returns zero.
    |
    | Otherwise your UI can display old/mock data while the API
    | actually returned no products.
    |
    */

    const sourceProducts =
        products;


    /*
    |--------------------------------------------------------------------------
    | RAM FILTER
    |--------------------------------------------------------------------------
    */

    const displayedProducts =
        useMemo(() => {
            if (!selectedRam) {
                return sourceProducts;
            }

            return sourceProducts.filter(
                (item) =>
                    item.ramLabel ===
                    selectedRam
            );
        }, [
            selectedRam,
            sourceProducts,
        ]);


    /*
    |--------------------------------------------------------------------------
    | CPU OPTIONS
    |--------------------------------------------------------------------------
    */

    const computedCpuPlatforms =
        useMemo(() => {
            if (
                sourceProducts.length ===
                0
            ) {
                return cpuPlatforms;
            }

            const counts =
                sourceProducts.reduce(
                    (
                        accumulator,
                        item
                    ) => {
                        if (
                            !item.cpuLabel
                        ) {
                            return accumulator;
                        }

                        accumulator.set(
                            item.cpuLabel,
                            (
                                accumulator.get(
                                    item.cpuLabel
                                ) || 0
                            ) + 1
                        );

                        return accumulator;
                    },
                    new Map()
                );

            return Array.from(
                counts.entries()
            ).map(
                ([label, count]) => ({
                    label,
                    count,
                })
            );
        }, [
            cpuPlatforms,
            sourceProducts,
        ]);


    /*
    |--------------------------------------------------------------------------
    | RAM OPTIONS
    |--------------------------------------------------------------------------
    */

    const computedRamCapacities =
        useMemo(() => {
            if (
                sourceProducts.length ===
                0
            ) {
                return ramCapacities;
            }

            const counts =
                sourceProducts.reduce(
                    (
                        accumulator,
                        item
                    ) => {
                        if (
                            !item.ramLabel
                        ) {
                            return accumulator;
                        }

                        accumulator.set(
                            item.ramLabel,
                            (
                                accumulator.get(
                                    item.ramLabel
                                ) || 0
                            ) + 1
                        );

                        return accumulator;
                    },
                    new Map()
                );

            return Array.from(
                counts.entries()
            ).map(
                ([label, count]) => ({
                    label,
                    count,
                })
            );
        }, [
            ramCapacities,
            sourceProducts,
        ]);


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const effectiveTotalElements =
        totalElements;

    const showingFrom =
        effectiveTotalElements === 0
            ? 0
            : page * size + 1;

    const showingTo =
        effectiveTotalElements === 0
            ? 0
            : Math.min(
                effectiveTotalElements,
                page * size +
                displayedProducts.length
            );


    /*
    |--------------------------------------------------------------------------
    | PRICE LABEL
    |--------------------------------------------------------------------------
    */

    const priceLabel =
        `Price: ₹${
  minPrice.trim() || "0"
} - ₹${
  maxPrice.trim() ||
  "400000"
}`;


    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <section className="mb-16">

            {/* Breadcrumb */}

            <div className="mb-8 flex items-center gap-2 text-sm text-zinc-500">

                <a
                    href="/"
                    className="transition hover:text-brand"
                >
                    Home
                </a>

                <ChevronRight
                    size={14}
                />

                <span className="font-medium text-zinc-800">
                    Laptops
                </span>

            </div>


            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">


                {/* =====================================================
                    FILTER SIDEBAR
                ===================================================== */}

                <aside className="space-y-6 md:col-span-3">


                    {/* CPU */}

                    <FilterCard title="CPU Platform">

                        {computedCpuPlatforms.length ===
                        0 ? (

                            <p className="text-sm text-zinc-500">
                                No CPU information available.
                            </p>

                        ) : (

                            computedCpuPlatforms.map(
                                (item) => (

                                    <FilterOption
                                        key={item.label}
                                        name="cpu"
                                        label={item.label}
                                        count={item.count}
                                        checked={
                                            selectedCpu ===
                                            item.label
                                        }
                                        onChange={() => {
                                            setSelectedCpu(
                                                selectedCpu ===
                                                item.label
                                                    ? ""
                                                    : item.label
                                            );

                                            setPage(0);
                                        }}
                                    />

                                )
                            )

                        )}

                    </FilterCard>


                    {/* RAM */}

                    <FilterCard title="RAM Capacity">

                        <div className="max-h-44 space-y-3 overflow-y-auto pr-2 filter-scrollbar">

                            {computedRamCapacities.length ===
                            0 ? (

                                <p className="text-sm text-zinc-500">
                                    No RAM information available.
                                </p>

                            ) : (

                                computedRamCapacities.map(
                                    (item) => (

                                        <FilterOption
                                            key={item.label}
                                            name="ram"
                                            label={item.label}
                                            count={item.count}
                                            checked={
                                                selectedRam ===
                                                item.label
                                            }
                                            onChange={() =>
                                                setSelectedRam(
                                                    selectedRam ===
                                                    item.label
                                                        ? ""
                                                        : item.label
                                                )
                                            }
                                        />

                                    )
                                )

                            )}

                        </div>

                    </FilterCard>


                    {/* PRICE */}

                    <FilterCard title="Filter by price">

                        <div className="pt-2">

                            <div className="relative mb-4 h-1 rounded-full bg-zinc-200">

                                <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-brand" />

                            </div>


                            <div className="mb-3 grid grid-cols-2 gap-2">

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(event) => {
                                        setMinPrice(
                                            event.target.value
                                        );

                                        setPage(0);
                                    }}
                                    className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 outline-none focus:border-brand"
                                />

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(event) => {
                                        setMaxPrice(
                                            event.target.value
                                        );

                                        setPage(0);
                                    }}
                                    className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 outline-none focus:border-brand"
                                />

                            </div>


                            <div className="flex items-center justify-between gap-3">

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (
                                            page === 0
                                        ) {
                                            loadProducts();
                                        } else {
                                            setPage(0);
                                        }
                                    }}
                                    className="rounded bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                                >
                                    Filter
                                </button>

                                <span className="text-xs text-zinc-500">
                                    {priceLabel}
                                </span>

                            </div>

                        </div>

                    </FilterCard>

                </aside>


                {/* =====================================================
                    PRODUCTS
                ===================================================== */}

                <div className="md:col-span-9">

                    <h2 className="mb-6 font-['Manrope'] text-4xl font-extrabold">
                        Laptops
                    </h2>


                    {/* TAGS */}

                    <div className="mb-6 flex flex-wrap gap-2">

                        {laptopTags.map(
                            (tag) => (

                                <button
                                    type="button"
                                    key={tag}
                                    onClick={() => {
                                        setQuery(tag);
                                        setPage(0);
                                    }}
                                    className="cursor-pointer rounded border border-zinc-300 bg-[#FFFDF7] px-4 py-1.5 text-xs text-zinc-600 transition hover:border-brand hover:text-brand"
                                >
                                    {tag}
                                </button>

                            )
                        )}

                    </div>


                    {/* SORT */}

                    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-y border-[#D8DFD1] py-4">

                        <span className="text-xs italic text-zinc-500">

                            Showing{" "}
                            {showingFrom}
                            -
                            {showingTo}
                            {" "}of{" "}
                            {effectiveTotalElements}
                            {" "}results

                        </span>


                        <select
                            value={sortMode}
                            onChange={(event) => {
                                setSortMode(
                                    event.target.value
                                );

                                setPage(0);
                            }}
                            className="rounded border border-zinc-300 bg-[#FFFDF7] px-4 py-2 text-sm text-zinc-600 outline-none focus:border-brand"
                        >

                            <option value="default">
                                Default sorting
                            </option>

                            <option value="popularity">
                                Sort by popularity
                            </option>

                            <option value="rating">
                                Sort by average rating
                            </option>

                            <option value="latest">
                                Sort by latest
                            </option>

                            <option value="priceAsc">
                                Sort by price: low to high
                            </option>

                            <option value="priceDesc">
                                Sort by price: high to low
                            </option>

                        </select>

                    </div>


                    {/* LOADING */}

                    {loading && (

                        <div className="mb-6 rounded border border-[#D8DFD1] bg-[#FFFDF7] px-4 py-3 text-sm text-zinc-500">

                            Loading products from
                            product-service...

                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                            {error}

                            <button
                                type="button"
                                onClick={loadProducts}
                                className="ml-3 font-semibold underline"
                            >
                                Retry
                            </button>

                        </div>

                    )}


                    {/* EMPTY */}

                    {!loading &&
                        !error &&
                        displayedProducts.length ===
                        0 && (

                            <div className="mb-6 rounded border border-[#D8DFD1] bg-[#FFFDF7] px-4 py-3 text-sm text-zinc-500">

                                No products were returned by
                                product-service.

                            </div>

                        )}


                    {/* PRODUCT GRID */}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                        {displayedProducts.map(
                            (product) => (

                                <article
                                    key={product.id}
                                    className="group rounded-lg border border-[#D8DFD1] bg-[#FFFDF7] p-4 transition hover:border-brand"
                                    onClick={() => setSelectedProduct(product)}
                                >

                                    <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-zinc-100">

                                        {product.productImages?.length >
                                        0 ? (

                                            <img
                                                src={
                                                    product.productImages[0]?.imageUrl
                                                }
                                                alt={
                                                    product.name
                                                }
                                                className="h-full w-full object-contain p-4"
                                                onError={(
                                                    event
                                                ) => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />

                                        ) : (

                                            <Laptop
                                                size={44}
                                                className="text-zinc-500"
                                            />

                                        )}

                                        {product.isNew && (

                                            <span className="absolute right-2 top-2 rounded bg-brand px-2 py-1 text-[10px] font-bold text-white">
                                                NEW
                                            </span>

                                        )}

                                    </div>


                                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                                        {product.type}
                                    </span>


                                    <h3 className="mt-1 line-clamp-2 font-['Manrope'] text-sm font-semibold transition group-hover:text-brand">

                                        {product.name}

                                    </h3>


                                    <div className="mt-2 flex items-center gap-1">

                                        <RatingStars
                                            rating={
                                                product.rating
                                            }
                                        />

                                        <span className="text-xs text-zinc-500">

                                            {product.rating}
                                            {" "}
                                            (
                                            {product.reviews}
                                            )

                                        </span>

                                    </div>


                                    <div className="mt-3 flex items-center justify-between">

                                        <span className="font-bold">

                                            ₹
                                            {Number(
                                                product.price
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </span>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                onAddToCart?.(
                                                    product
                                                )
                                            }
                                            className="rounded-full bg-brand/10 p-2 text-brand transition hover:bg-brand hover:text-white"
                                            aria-label={`Add ${product.name} to cart`}
                                        >

                                            <ShoppingCart
                                                size={16}
                                            />

                                        </button>

                                    </div>

                                </article>

                            )
                        )}

                    </div>


                    {/* PAGINATION */}

                    <div className="mt-6 flex items-center justify-end gap-2">

                        <button
                            type="button"
                            onClick={() =>
                                setPage(
                                    (previous) =>
                                        Math.max(
                                            0,
                                            previous - 1
                                        )
                                )
                            }
                            disabled={
                                loading ||
                                !hasPrevious
                            }
                            className="rounded border border-zinc-300 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>


                        <span className="px-2 text-xs text-zinc-500">
                            Page {page + 1}
                        </span>


                        <button
                            type="button"
                            onClick={() =>
                                setPage(
                                    (previous) =>
                                        previous + 1
                                )
                            }
                            disabled={
                                loading ||
                                !hasNext
                            }
                            className="rounded border border-zinc-300 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>

        </section>
    );
}


/*
|--------------------------------------------------------------------------
| FILTER CARD
|--------------------------------------------------------------------------
*/

function FilterCard({
    title,
    children,
}) {
    return (
        <div className="rounded-lg border border-[#D8DFD1] bg-[#FFFDF7] p-5">

            <h3 className="mb-4 border-b border-[#D8DFD1] pb-2 font-['Manrope'] text-lg font-semibold">
                {title}
            </h3>

            {children}

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| FILTER OPTION
|--------------------------------------------------------------------------
*/

function FilterOption({
    name,
    label,
    count,
    checked,
    onChange,
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">

            <span className="flex items-center gap-2">

                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    className="h-4 w-4 rounded border-zinc-300 text-brand focus:ring-brand"
                />

                <span className="text-sm text-zinc-700">
                    {label}
                </span>

            </span>


            <span className="text-xs text-zinc-400">
                {count}
            </span>

        </label>
    );
}


export default ProductListing;

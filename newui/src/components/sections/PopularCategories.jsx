import {
    ArrowLeft,
    ArrowRight,
    Cable,
    CircuitBoard,
    Cpu,
    Gpu,
    HardDrive,
    Keyboard,
    Laptop,
    MemoryStick,
    Monitor,
    Mouse,
    Package,
    Printer,
    Server,
    Wifi,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { API_BASE_URL } from "../../services/apiClient";

/*
 * Temporary starting price.
 *
 * Later this can come from the backend/database.
 */
const DEFAULT_STARTING_PRICE = 500;


/* -------------------------------------------------------------------------- */
/* Category icons                                                             */
/* -------------------------------------------------------------------------- */

const CATEGORY_ICONS = {
    laptop: Laptop,
    laptops: Laptop,

    desktop: Monitor,
    "desktop pc": Monitor,
    "desktop pcs": Monitor,
    computer: Monitor,

    processor: Cpu,
    cpu: Cpu,

    gpu: Gpu,
    "graphics card": Gpu,
    graphics: Gpu,

    motherboard: CircuitBoard,

    ram: MemoryStick,
    memory: MemoryStick,

    ssd: HardDrive,
    hdd: HardDrive,
    storage: HardDrive,

    monitor: Monitor,
    monitors: Monitor,

    keyboard: Keyboard,
    mouse: Mouse,

    printer: Printer,

    networking: Wifi,
    network: Wifi,
    router: Wifi,

    workstation: Server,

    accessories: Cable,
};


/* -------------------------------------------------------------------------- */
/* Find icon                                                                  */
/* -------------------------------------------------------------------------- */

function getCategoryIcon(categoryName = "") {

    const key = categoryName
        .trim()
        .toLowerCase();

    for (const [
        category,
        Icon,
    ] of Object.entries(
        CATEGORY_ICONS
    )) {

        if (key.includes(category)) {
            return Icon;
        }
    }

    return Package;
}


/* -------------------------------------------------------------------------- */
/* Image URL                                                                  */
/* -------------------------------------------------------------------------- */

function getCategoryImage(category) {

    /*
     * This supports several possible backend image field names.
     *
     * If your Category API later returns:
     *
     * imageUrl
     *
     * this will automatically use it.
     */

    const rawImage =
        category?.imageUrl ||
        category?.image ||
        category?.categoryImage ||
        category?.imagePath ||
        category?.iconUrl;

    if (!rawImage) {
        return null;
    }

    try {

        return new URL(
            rawImage,
            API_BASE_URL
        ).toString();

    } catch {

        return null;
    }
}


/* -------------------------------------------------------------------------- */
/* Category Card                                                              */
/* -------------------------------------------------------------------------- */

function CategoryCard({
                          category,
                          onClick,
                      }) {

    const [
        imageError,
        setImageError,
    ] = useState(false);

    const image =
        getCategoryImage(
            category
        );

    const Icon =
        getCategoryIcon(
            category?.name
        );

    return (
        <button
            type="button"
            onClick={() =>
                onClick?.(category)
            }
            className="group flex w-full flex-col overflow-hidden rounded-xl border border-[#D8DFD1] bg-white text-left transition-all duration-200 hover:-translate-y-1 hover:border-[#245C45] hover:shadow-lg"
        >

            {/* -------------------------------------------------------------- */}
            {/* Category image                                                 */}
            {/* -------------------------------------------------------------- */}

            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#F1F4ED]">

                {image &&
                !imageError ? (
                    <img
                        src={image}
                        alt={
                            category.name
                        }
                        loading="lazy"
                        className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                        onError={() =>
                            setImageError(
                                true
                            )
                        }
                    />
                ) : (
                    <Icon
                        size={58}
                        strokeWidth={1.2}
                        className="text-[#245C45] transition-transform duration-300 group-hover:scale-110"
                    />
                )}

            </div>


            {/* -------------------------------------------------------------- */}
            {/* Category information                                            */}
            {/* -------------------------------------------------------------- */}

            <div className="px-4 py-4">

                <h3 className="line-clamp-1 font-['Manrope'] text-base font-bold text-[#26372D] transition-colors group-hover:text-[#245C45]">
                    {category.name}
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                    Starts with
                </p>

                <p className="mt-0.5 font-['Manrope'] text-sm font-extrabold text-[#245C45]">
                    ₹{DEFAULT_STARTING_PRICE}
                </p>

            </div>

        </button>
    );
}


/* -------------------------------------------------------------------------- */
/* Popular Categories                                                         */
/* -------------------------------------------------------------------------- */

function PopularCategories({
                               categories = [],
                               onCategorySelect,
                           }) {

    const sliderRef =
        useRef(null);

    const [
        canScrollLeft,
        setCanScrollLeft,
    ] = useState(false);

    const [
        canScrollRight,
        setCanScrollRight,
    ] = useState(false);


    /* ---------------------------------------------------------------------- */
    /* Get Electronics children                                               */
    /* ---------------------------------------------------------------------- */

    const electronicsChildren =
        useMemo(() => {

            /*
             * Find the ROOT Electronics category.
             */

            const electronics =
                categories.find(
                    (category) =>
                        category &&
                        category.active !==
                        false &&
                        category.parentId ===
                        null &&
                        category.name
                            ?.trim()
                            .toLowerCase() ===
                        "electronics"
                );

            if (!electronics) {
                return [];
            }

            /*
             * Only direct children of
             * Electronics.
             */

            return categories
                .filter(
                    (category) =>
                        category &&
                        category.active !==
                        false &&
                        String(
                            category.parentId
                        ) ===
                        String(
                            electronics.id
                        )
                )
                .sort(
                    (a, b) =>
                        (a.sortOrder ??
                            0) -
                        (b.sortOrder ??
                            0)
                );

        }, [categories]);


    /* ---------------------------------------------------------------------- */
    /* Check slider position                                                  */
    /* ---------------------------------------------------------------------- */

        useEffect(() => {

            const slider =
                sliderRef.current;

            if (!slider) {
                return undefined;
            }

            const update = () => {

                setCanScrollLeft(
                    slider.scrollLeft >
                    5
                );

                setCanScrollRight(
                    slider.scrollLeft +
                    slider.clientWidth <
                    slider.scrollWidth -
                    5
                );
            };

            update();

            slider.addEventListener(
                "scroll",
                update,
                {
                    passive: true,
                }
            );

            window.addEventListener(
                "resize",
                update
            );

            return () => {

                slider.removeEventListener(
                    "scroll",
                    update
                );

                window.removeEventListener(
                    "resize",
                    update
                );
            };

        }, [
            electronicsChildren.length,
        ]);


    /* ---------------------------------------------------------------------- */
    /* Scroll slider                                                          */
    /* ---------------------------------------------------------------------- */

    function scrollCategories(
        direction
    ) {

        const slider =
            sliderRef.current;

        if (!slider) {
            return;
        }

        const firstCard =
            slider.querySelector(
                "[data-category-card]"
            );

        if (!firstCard) {
            return;
        }

        const cardWidth =
            firstCard.getBoundingClientRect()
                .width;

        const gap = 16;

        const amount =
            (cardWidth + gap) * 4;

        slider.scrollBy({
            left:
                direction === "left"
                    ? -amount
                    : amount,
            behavior: "smooth",
        });
    }


    /* ---------------------------------------------------------------------- */
    /* No Electronics category                                               */
    /* ---------------------------------------------------------------------- */

    if (
        categories.length > 0 &&
        electronicsChildren.length === 0
    ) {

        return (
            <section className="mb-16">

                <div className="mb-7">

                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#245C45]">
                        Explore
                    </p>

                    <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-[#26372D] sm:text-3xl">
                        Shop by Category
                    </h2>

                </div>

                <div className="rounded-xl border border-dashed border-[#D8DFD1] bg-white p-8 text-center text-sm text-zinc-500">
                    No categories available under
                    Electronics.
                </div>

            </section>
        );
    }


    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <section className="mb-16">

            {/* ============================================================ */}
            {/* Heading                                                        */}
            {/* ============================================================ */}

            <div className="mb-7 flex items-end justify-between">

                <div>

                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#245C45]">
                        Explore
                    </p>

                    <h2 className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-[#26372D] sm:text-3xl">
                        Shop by Category
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                        Explore products by
                        category
                    </p>

                </div>


                {/* -------------------------------------------------------- */}
                {/* Arrows                                                     */}
                {/* -------------------------------------------------------- */}

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        aria-label="Previous categories"
                        disabled={
                            !canScrollLeft
                        }
                        onClick={() =>
                            scrollCategories(
                                "left"
                            )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8DFD1] bg-white text-[#26372D] transition hover:border-[#245C45] hover:bg-[#E5EBDD] hover:text-[#245C45] disabled:cursor-not-allowed disabled:opacity-30"
                    >

                        <ArrowLeft
                            size={17}
                        />

                    </button>


                    <button
                        type="button"
                        aria-label="Next categories"
                        disabled={
                            !canScrollRight
                        }
                        onClick={() =>
                            scrollCategories(
                                "right"
                            )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8DFD1] bg-white text-[#26372D] transition hover:border-[#245C45] hover:bg-[#E5EBDD] hover:text-[#245C45] disabled:cursor-not-allowed disabled:opacity-30"
                    >

                        <ArrowRight
                            size={17}
                        />

                    </button>

                </div>

            </div>


            {/* ============================================================ */}
            {/* Category slider                                                */}
            {/* ============================================================ */}

            <div
                ref={sliderRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-3"
                style={{
                    scrollbarWidth:
                        "none",
                    msOverflowStyle:
                        "none",
                }}
            >

                {electronicsChildren.map(
                    (category) => (
                        <div
                            key={
                                category.id
                            }
                            data-category-card
                            className="w-[calc((100%-48px)/4)] min-w-[calc((100%-48px)/4)] max-w-[calc((100%-48px)/4)]"
                        >

                            <CategoryCard
                                category={
                                    category
                                }
                                onClick={
                                    onCategorySelect
                                }
                            />

                        </div>
                    )
                )}

            </div>


            {/* ============================================================ */}
            {/* Mobile swipe hint                                              */}
            {/* ============================================================ */}

            <p className="mt-2 text-center text-xs text-zinc-400 md:hidden">
                Swipe to explore more
                categories
            </p>

        </section>
    );
}

export default PopularCategories;
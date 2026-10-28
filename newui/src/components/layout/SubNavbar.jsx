import {
    ChevronDown,
    ChevronRight,
    Menu,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

function CategoryItem({
                          category,
                          categories,
                          activePath,
                          setActivePath,
                          level,
                          onCategoryClick,
                      }) {
    const children = categories
        .filter(
            (item) =>
                String(item.parentId) === String(category.id)
        )
        .sort(
            (a, b) =>
                (a.sortOrder ?? 0) -
                (b.sortOrder ?? 0)
        );

    const hasChildren = children.length > 0;

    const isActive =
        activePath[level] === category.id;

    function handleMouseEnter() {
        if (!hasChildren) {
            setActivePath((previous) =>
                previous.slice(0, level)
            );

            return;
        }

        setActivePath((previous) => [
            ...previous.slice(0, level),
            category.id,
        ]);
    }

    return (
        <div>
            <button
                type="button"
                onMouseEnter={handleMouseEnter}
                onClick={() => {
                    if (onCategoryClick) {
                        onCategoryClick(category);
                    }
                }}
                className={`flex w-full items-center justify-between gap-4 rounded-md px-3 py-2.5 text-left text-sm transition ${
                    isActive
                        ? "bg-[#E5EBDD] font-semibold text-[#245C45]"
                        : "text-zinc-700 hover:bg-[#F1F3ED] hover:text-[#245C45]"
                }`}
            >
                <span>{category.name}</span>

                {hasChildren && (
                    <ChevronRight
                        size={15}
                        className="shrink-0"
                    />
                )}
            </button>
        </div>
    );
}

function CategoryColumn({
                            categories,
                            parentId,
                            activePath,
                            setActivePath,
                            level,
                            onCategoryClick,
                        }) {
    const items = categories
        .filter(
            (category) =>
                parentId === null
                    ? category.parentId === null
                    : String(category.parentId) ===
                    String(parentId)
        )
        .sort(
            (a, b) =>
                (a.sortOrder ?? 0) -
                (b.sortOrder ?? 0)
        );

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="w-64 p-2">

            {items.map((category) => (
                <CategoryItem
                    key={category.id}
                    category={category}
                    categories={categories}
                    activePath={activePath}
                    setActivePath={setActivePath}
                    level={level}
                    onCategoryClick={
                        onCategoryClick
                    }
                />
            ))}

        </div>
    );
}

function SubNavbar({
                       categories = [],
                       categoriesLoading = false,
                       categoriesError = "",
                       onCategorySelect,
                   }) {
    const [open, setOpen] =
        useState(false);

    const [activePath, setActivePath] =
        useState([]);

    const menuRef = useRef(null);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpen(false);
                setActivePath([]);
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    const rootCategories = categories
        .filter(
            (category) =>
                category.parentId === null &&
                category.active !== false
        )
        .sort(
            (a, b) =>
                (a.sortOrder ?? 0) -
                (b.sortOrder ?? 0)
        );

    function handleCategoryClick(category) {
        setOpen(false);
        setActivePath([]);

        if (onCategorySelect) {
            onCategorySelect(category);
        }
    }

    return (
        <div className="relative hidden border-b border-[#D8DFD1] bg-white md:block">

            <div className="mx-auto flex max-w-7xl items-center gap-7 px-4 sm:px-6 lg:px-8">

                {/* Categories */}
                <div
                    ref={menuRef}
                    className="relative"
                >

                    <button
                        type="button"
                        onClick={() => {
                            setOpen(
                                (previous) =>
                                    !previous
                            );

                            setActivePath([]);
                        }}
                        className={`flex items-center gap-2 px-1 py-4 text-sm font-semibold transition ${
                            open
                                ? "text-[#245C45]"
                                : "text-[#26372D] hover:text-[#245C45]"
                        }`}
                    >
                        <Menu size={18} />

                        <span>Categories</span>

                        <ChevronDown
                            size={16}
                            className={`transition ${
                                open
                                    ? "rotate-180"
                                    : ""
                            }`}
                        />
                    </button>

                    {open && (
                        <div className="absolute left-0 top-full z-50 flex overflow-hidden rounded-b-xl border border-[#D8DFD1] bg-[#FFFDF7] shadow-2xl">

                            {/* Root Categories */}
                            {categoriesLoading && (
                                <div className="w-64 p-5 text-sm text-zinc-500">
                                    Loading categories...
                                </div>
                            )}

                            {categoriesError && (
                                <div className="w-64 p-5 text-sm text-red-600">
                                    Unable to load categories.
                                </div>
                            )}

                            {!categoriesLoading &&
                                !categoriesError && (
                                    <>
                                        <div className="w-64 border-r border-[#D8DFD1] p-2">

                                            {rootCategories.map(
                                                (
                                                    category
                                                ) => (
                                                    <CategoryItem
                                                        key={category.id}
                                                        category={category}
                                                        categories={categories}
                                                        activePath={activePath}
                                                        setActivePath={setActivePath}
                                                        level={0}
                                                        onCategoryClick={
                                                            handleCategoryClick
                                                        }
                                                    />
                                                )
                                            )}

                                        </div>

                                        {/* Dynamic child columns */}
                                        {activePath.map(
                                            (
                                                parentId,
                                                index
                                            ) => {
                                                const children =
                                                    categories.filter(
                                                        (
                                                            category
                                                        ) =>
                                                            String(
                                                                category.parentId
                                                            ) ===
                                                            String(
                                                                parentId
                                                            )
                                                    );

                                                if (
                                                    children.length ===
                                                    0
                                                ) {
                                                    return null;
                                                }

                                                return (
                                                    <div
                                                        key={`${parentId}-${index}`}
                                                        className="border-r border-[#D8DFD1]"
                                                    >
                                                        <CategoryColumn
                                                            categories={
                                                                categories
                                                            }
                                                            parentId={
                                                                parentId
                                                            }
                                                            activePath={
                                                                activePath
                                                            }
                                                            setActivePath={
                                                                setActivePath
                                                            }
                                                            level={
                                                                index +
                                                                1
                                                            }
                                                            onCategoryClick={
                                                                handleCategoryClick
                                                            }
                                                        />
                                                    </div>
                                                );
                                            }
                                        )}
                                    </>
                                )}

                        </div>
                    )}
                </div>

                {/* Main Navigation */}
                <nav className="flex h-full items-center gap-7 overflow-x-auto whitespace-nowrap hide-scrollbar">

                    <a
                        href="/"
                        className="border-b-2 border-[#245C45] py-4 text-sm font-semibold text-[#245C45]"
                    >
                        Home
                    </a>

                    <button
                        type="button"
                        onClick={() => {
                            const category =
                                rootCategories.find(
                                    (item) =>
                                        item.name
                                            ?.toLowerCase()
                                            .includes(
                                                "electronic"
                                            )
                                );

                            if (category) {
                                handleCategoryClick(
                                    category
                                );
                            }
                        }}
                        className="py-4 text-sm text-zinc-600 transition hover:text-[#245C45]"
                    >
                        Electronics
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const category =
                                rootCategories.find(
                                    (item) =>
                                        item.name
                                            ?.toLowerCase()
                                            .includes(
                                                "computer"
                                            ) ||
                                        item.name
                                            ?.toLowerCase()
                                            .includes(
                                                "laptop"
                                            )
                                );

                            if (category) {
                                handleCategoryClick(
                                    category
                                );
                            }
                        }}
                        className="py-4 text-sm text-zinc-600 transition hover:text-[#245C45]"
                    >
                        Computers
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const category =
                                rootCategories.find(
                                    (item) =>
                                        item.name
                                            ?.toLowerCase()
                                            .includes(
                                                "gaming"
                                            )
                                );

                            if (category) {
                                handleCategoryClick(
                                    category
                                );
                            }
                        }}
                        className="py-4 text-sm text-zinc-600 transition hover:text-[#245C45]"
                    >
                        Gaming
                    </button>

                    <a
                        href="#products"
                        className="py-4 text-sm text-zinc-600 transition hover:text-[#245C45]"
                    >
                        Deals
                    </a>

                    <a
                        href="#products"
                        className="py-4 text-sm text-zinc-600 transition hover:text-[#245C45]"
                    >
                        New Arrivals
                    </a>

                    <a
                        href="#products"
                        className="py-4 text-sm text-zinc-600 transition hover:text-[#245C45]"
                    >
                        Best Sellers
                    </a>

                </nav>

            </div>
        </div>
    );
}

export default SubNavbar;
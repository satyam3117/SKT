import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function CategoryMenuItem({
                              category,
                              categories,
                              activePath,
                              setActivePath,
                              level,
                          }) {
    const children = categories
        .filter((item) => item.parentId === category.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    const isActive = activePath[level] === category.id;

    const handleMouseEnter = () => {
        setActivePath((prev) => [
            ...prev.slice(0, level),
            category.id,
        ]);
    };

    return (
        <div>
            <button
                type="button"
                onMouseEnter={handleMouseEnter}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                    isActive
                        ? "bg-zinc-100 text-brand"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-brand"
                }`}
            >
                <span>{category.name}</span>

                {children.length > 0 && <ChevronRight size={15} />}
            </button>
        </div>
    );
}

function CategoryLevel({
                           categories,
                           parentId,
                           activePath,
                           setActivePath,
                           level,
                       }) {
    const items = categories
        .filter((category) => category.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="w-64 border-l border-zinc-200 p-2">
            {items.map((category) => (
                <CategoryMenuItem
                    key={category.id}
                    category={category}
                    categories={categories}
                    activePath={activePath}
                    setActivePath={setActivePath}
                    level={level}
                />
            ))}
        </div>
    );
}

function SubNavbar({
                       navLinks,
                       categories,
                       categoriesLoading,
                       categoriesError,
                   }) {
    const [showCategories, setShowCategories] = useState(false);

    // [parentId, childId, grandChildId, ...]
    const [activePath, setActivePath] = useState([]);

    // Reference for the entire Categories area
    // including button + dropdown
    const categoriesRef = useRef(null);

    // Close Categories when clicking/tapping outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                categoriesRef.current &&
                !categoriesRef.current.contains(event.target)
            ) {
                setShowCategories(false);
                setActivePath([]);
            }
        }

        // Mouse click
        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        // Touch/tap
        document.addEventListener(
            "touchstart",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

            document.removeEventListener(
                "touchstart",
                handleClickOutside
            );
        };
    }, []);

    const rootCategories = categories
        .filter((category) => category.parentId === null)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div className="relative hidden border-b border-zinc-200/70 bg-white md:block">
            <div className="mx-auto flex max-w-container items-center gap-8 px-16 py-3">

                {/* Categories */}
                <div
                    ref={categoriesRef}
                    className="relative"
                >
                    <button
                        type="button"
                        onClick={() => {
                            setShowCategories((prev) => !prev);
                            setActivePath([]);
                        }}
                        className="flex items-center gap-2 rounded-md bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand transition hover:bg-brand/20"
                    >
                        <Menu size={16} />

                        Categories

                        <ChevronDown
                            size={16}
                            className={
                                showCategories
                                    ? "rotate-180 transition"
                                    : "transition"
                            }
                        />
                    </button>

                    {showCategories && (
                        <div className="absolute left-0 top-12 z-30 flex rounded-lg border border-zinc-200 bg-white shadow-xl">

                            {/* Loading */}
                            {categoriesLoading && (
                                <div className="w-64 p-4 text-sm text-zinc-500">
                                    Loading categories...
                                </div>
                            )}

                            {/* Error */}
                            {categoriesError && (
                                <div className="w-64 p-4 text-sm text-red-500">
                                    Failed to load categories.
                                </div>
                            )}

                            {/* Categories */}
                            {!categoriesLoading &&
                                !categoriesError && (
                                    <>
                                        {/* Level 0 */}
                                        <div className="w-64 p-2">
                                            {rootCategories.map((category) => (
                                                <CategoryMenuItem
                                                    key={category.id}
                                                    category={category}
                                                    categories={categories}
                                                    activePath={activePath}
                                                    setActivePath={setActivePath}
                                                    level={0}
                                                />
                                            ))}
                                        </div>

                                        {/* Level 1+ */}
                                        {activePath.map(
                                            (parentId, index) => {
                                                const children = categories
                                                    .filter(
                                                        (category) =>
                                                            category.parentId ===
                                                            parentId
                                                    )
                                                    .sort(
                                                        (a, b) =>
                                                            a.sortOrder -
                                                            b.sortOrder
                                                    );

                                                if (children.length === 0) {
                                                    return null;
                                                }

                                                return (
                                                    <CategoryLevel
                                                        key={`${parentId}-${index}`}
                                                        categories={categories}
                                                        parentId={parentId}
                                                        activePath={activePath}
                                                        setActivePath={
                                                            setActivePath
                                                        }
                                                        level={index + 1}
                                                    />
                                                );
                                            }
                                        )}
                                    </>
                                )}
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex items-center gap-8 overflow-x-auto whitespace-nowrap text-xs uppercase tracking-wider text-zinc-600 hide-scrollbar">
                    {navLinks.map((link, index) => (
                        <a
                            key={link}
                            href="#"
                            className={
                                index === 0
                                    ? "border-b-2 border-brand pb-1 font-bold text-brand"
                                    : "transition hover:text-brand"
                            }
                        >
                            {link}
                        </a>
                    ))}
                </nav>

            </div>
        </div>
    );
}

export default SubNavbar;
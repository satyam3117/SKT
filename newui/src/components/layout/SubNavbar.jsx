import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { useState } from "react";

function SubNavbar({
                     navLinks,
                     categories,
                     categoriesLoading,
                     categoriesError,
                   }) {
  const [showCategories, setShowCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const rootCategories = categories
      .filter((category) => category.parentId === null)
      .sort((a, b) => a.sortOrder - b.sortOrder);

  function getChildren(parentId) {
    return categories
        .filter((category) => category.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return (
      <div className="relative hidden border-b border-zinc-200/70 bg-white md:block">
        <div className="mx-auto flex max-w-container items-center gap-8 px-16 py-3">
          <div className="relative">
            <button
                type="button"
                onClick={() => {
                  setShowCategories((prev) => !prev);
                  setActiveCategory(null);
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
                <div className="absolute left-0 top-12 z-30 flex min-w-[260px] rounded-lg border border-zinc-200 bg-white shadow-xl">
                  {/* Level 0 */}
                  <div className="w-64 p-2">
                    {categoriesLoading && (
                        <div className="px-3 py-3 text-sm text-zinc-500">
                          Loading categories...
                        </div>
                    )}

                    {categoriesError && (
                        <div className="px-3 py-3 text-sm text-red-500">
                          Failed to load categories.
                        </div>
                    )}

                    {!categoriesLoading &&
                        !categoriesError &&
                        rootCategories.map((category) => {
                          const children = getChildren(category.id);

                          return (
                              <button
                                  key={category.id}
                                  type="button"
                                  onMouseEnter={() =>
                                      setActiveCategory(category.id)
                                  }
                                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-brand"
                              >
                                <span>{category.name}</span>

                                {children.length > 0 && (
                                    <ChevronRight size={15} />
                                )}
                              </button>
                          );
                        })}
                  </div>

                  {/* Level 1 */}
                  {activeCategory && (
                      <div className="w-64 border-l border-zinc-200 p-2">
                        {getChildren(activeCategory).map((category) => {
                          const children = getChildren(category.id);

                          return (
                              <button
                                  key={category.id}
                                  type="button"
                                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-brand"
                              >
                                <span>{category.name}</span>

                                {children.length > 0 && (
                                    <ChevronRight size={15} />
                                )}
                              </button>
                          );
                        })}
                      </div>
                  )}
                </div>
            )}
          </div>

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
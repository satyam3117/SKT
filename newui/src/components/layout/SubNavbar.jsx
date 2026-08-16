import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

function SubNavbar({ navLinks, categories }) {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <div className="relative hidden border-b border-zinc-200/70 bg-white md:block">
      <div className="mx-auto flex max-w-container items-center gap-8 px-16 py-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCategories((prev) => !prev)}
            className="flex items-center gap-2 rounded-md bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand transition hover:bg-brand/20"
          >
            <Menu size={16} />
            Categories
            <ChevronDown size={16} className={showCategories ? "rotate-180 transition" : "transition"} />
          </button>

          {showCategories && (
            <div className="absolute left-0 top-12 z-30 w-64 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-brand"
                >
                  {category}
                </button>
              ))}
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

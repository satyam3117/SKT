import {
  Heart,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useState } from "react";

function TopNavbar({ searchValue = "", onSearch }) {
  const [search, setSearch] = useState(searchValue);

  function submitSearch(event) {
    event.preventDefault();

    const value = search.trim();

    if (onSearch) {
      onSearch(value);
    }
  }

  return (
      <header className="sticky top-0 z-50 border-b border-[#D8DFD1] bg-[#FFFDF7]/95 backdrop-blur-xl">

        {/* Main Header */}
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <a
              href="/"
              className="shrink-0 font-['Manrope'] text-2xl font-extrabold tracking-tight text-[#26372D]"
          >
            SKT<span className="text-[#245C45]">.</span>
          </a>

          {/* Search */}
          <form
              onSubmit={submitSearch}
              className="relative mx-auto hidden w-full max-w-2xl md:block"
          >
            <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search products, brands, parts..."
                className="w-full rounded-full border border-[#D8DFD1] bg-white py-3 pl-12 pr-24 text-sm text-[#26372D] outline-none transition placeholder:text-zinc-400 focus:border-[#245C45] focus:ring-2 focus:ring-[#245C45]/10"
            />

            <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[#245C45] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#1d4d39]"
            >
              Search
            </button>
          </form>

          {/* Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1 text-zinc-600 sm:gap-2">

            <button
                type="button"
                aria-label="Wishlist"
                className="rounded-full p-2.5 transition hover:bg-[#E5EBDD] hover:text-[#245C45]"
            >
              <Heart size={20} strokeWidth={1.8} />
            </button>

            <button
                type="button"
                aria-label="Shopping cart"
                className="relative rounded-full p-2.5 transition hover:bg-[#E5EBDD] hover:text-[#245C45]"
            >
              <ShoppingCart
                  size={20}
                  strokeWidth={1.8}
              />

              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#245C45] px-1 text-[9px] font-bold text-white">
                            0
                        </span>
            </button>

            <a
                href="/admin"
                aria-label="Account"
                className="rounded-full p-2.5 transition hover:bg-[#E5EBDD] hover:text-[#245C45]"
            >
              <UserRound
                  size={20}
                  strokeWidth={1.8}
              />
            </a>
          </div>
        </div>

        {/* Mobile Search */}
        <form
            onSubmit={submitSearch}
            className="px-4 pb-3 md:hidden"
        >
          <div className="relative">

            <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search products..."
                className="w-full rounded-lg border border-[#D8DFD1] bg-white py-2.5 pl-10 pr-20 text-sm outline-none focus:border-[#245C45]"
            />

            <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-[#245C45] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Search
            </button>

          </div>
        </form>
      </header>
  );
}

export default TopNavbar;
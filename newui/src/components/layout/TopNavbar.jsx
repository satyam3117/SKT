import { Heart, Search, ShoppingCart, User } from "lucide-react";

function TopNavbar() {
  return (
    <div className="border-b border-zinc-200/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-container items-center justify-between gap-4 px-5 py-4 md:px-16">
        <a href="#" className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-ink">
          SKT
        </a>

        <div className="relative mx-8 hidden max-w-2xl flex-1 md:flex">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search products, brands, parts..."
            className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2 text-zinc-600 md:gap-4">
          <button aria-label="Wishlist" className="rounded-full p-2 transition hover:bg-black/5">
            <Heart size={20} />
          </button>
          <button aria-label="Cart" className="relative rounded-full p-2 transition hover:bg-black/5">
            <ShoppingCart size={20} />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              3
            </span>
          </button>
          <button aria-label="Account" className="rounded-full p-2 transition hover:bg-black/5">
            <User size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopNavbar;

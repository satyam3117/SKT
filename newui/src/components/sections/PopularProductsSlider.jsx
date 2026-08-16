import { ChevronLeft, ChevronRight, Laptop } from "lucide-react";
import { useRef } from "react";
import RatingStars from "../shared/RatingStars";

function PopularProductsSlider({ products }) {
  const sliderRef = useRef(null);

  const slideBy = (distance) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: distance, behavior: "smooth" });
    }
  };

  return (
    <section className="mb-16">
      <h2 className="mb-8 font-['Manrope'] text-3xl font-bold">Popular Products</h2>

      <div className="relative">
        <button
          type="button"
          onClick={() => slideBy(-320)}
          className="absolute -left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand shadow-md transition hover:bg-brand hover:text-white md:flex"
        >
          <ChevronLeft size={18} />
        </button>

        <div ref={sliderRef} className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex w-[280px] min-w-[280px] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white"
            >
              <div className="relative flex h-44 items-center justify-center bg-zinc-100">
                {product.badge && (
                  <span
                    className={`absolute left-2 top-2 rounded px-2 py-1 text-[10px] font-bold text-white ${
                      product.badge === "SALE" ? "bg-red-600" : "bg-brand"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
                <Laptop size={56} className="text-zinc-500" />
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center gap-1">
                  <RatingStars rating={product.rating} />
                  <span className="text-xs text-zinc-500">({product.reviews})</span>
                </div>
                <h3 className="mb-4 line-clamp-2 font-['Manrope'] text-lg font-semibold">{product.name}</h3>

                <div className="mb-4 mt-auto flex items-center gap-2">
                  <p className="font-semibold text-brand">${product.price.toFixed(2)}</p>
                  {product.oldPrice && (
                    <p className="text-sm text-zinc-500 line-through">${product.oldPrice.toFixed(2)}</p>
                  )}
                </div>

                <button className="rounded-lg border border-zinc-300 py-2 text-xs font-semibold uppercase tracking-wider transition hover:border-brand hover:bg-brand hover:text-white">
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() => slideBy(320)}
          className="absolute -right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand shadow-md transition hover:bg-brand hover:text-white md:flex"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

export default PopularProductsSlider;

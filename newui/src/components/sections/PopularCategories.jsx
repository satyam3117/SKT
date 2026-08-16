import { ChevronRight, Laptop } from "lucide-react";

function PopularCategories({ categories }) {
  return (
    <section className="mb-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-['Manrope'] text-3xl font-bold">Popular Categories</h2>
        <a href="#" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand">
          View All <ChevronRight size={14} />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        {categories.map((category) => (
          <a
            key={category.name}
            href="#"
            className="group rounded-xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-1 hover:border-brand"
          >
            <div className="mb-6 flex h-24 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
              <Laptop size={36} />
            </div>
            <p className="font-['Manrope'] text-lg font-semibold transition group-hover:text-brand">{category.name}</p>
            <p className="text-sm text-zinc-500">{category.price}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

export default PopularCategories;

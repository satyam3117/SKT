import { ArrowRight } from "lucide-react";

function HeroBanner({ hero }) {
  return (
    <section className="mb-16">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-r from-white via-zinc-100 to-zinc-200 p-8 md:p-16">
        <div className="max-w-2xl">
          <span className="mb-4 inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            {hero.badge}
          </span>
          <h1 className="mb-3 font-['Manrope'] text-3xl font-extrabold leading-tight md:text-6xl">
            {hero.title}
            <br />
            <span className="text-brand">{hero.highlight}</span>
          </h1>
          <p className="mb-8 max-w-xl text-zinc-600">{hero.description}</p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90">
            Shop Now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;

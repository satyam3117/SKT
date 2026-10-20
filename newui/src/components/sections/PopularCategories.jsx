import {
    ChevronRight,
    Laptop,
} from "lucide-react";


function PopularCategories({
    categories = [],
    onCategorySelect,
}) {
    const visibleCategories =
        categories.filter(
            (category) =>
                category &&
                category.active !== false
        );


    return (
        <section className="mb-16">

            <div className="mb-8 flex items-end justify-between">

                <div>

                    <h2 className="font-['Manrope'] text-3xl font-bold">
                        Popular Categories
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Browse categories from the live catalog
                    </p>

                </div>


                <a
                    href="#products"
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand"
                >
                    View All
                    <ChevronRight
                        size={14}
                    />
                </a>

            </div>


            {visibleCategories.length ===
            0 ? (

                <div className="rounded-xl border border-[#D8DFD1] bg-[#FFFDF7] p-6 text-sm text-zinc-500">
                    No categories available.
                </div>

            ) : (

                <div className="grid grid-cols-2 gap-6 md:grid-cols-5">

                    {visibleCategories
                        .slice(0, 10)
                        .map(
                            (category) => (

                                <button
                                    type="button"
                                    key={
                                        category.id
                                    }
                                    onClick={() =>
                                        onCategorySelect?.(
                                            category
                                        )
                                    }
                                    className="group rounded-xl border border-[#D8DFD1] bg-[#FFFDF7] p-4 text-left transition hover:-translate-y-1 hover:border-brand"
                                >

                                    <div className="mb-6 flex h-24 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">

                                        <Laptop
                                            size={
                                                36
                                            }
                                        />

                                    </div>


                                    <p className="font-['Manrope'] text-lg font-semibold transition group-hover:text-brand">

                                        {
                                            category.name
                                        }

                                    </p>


                                    <p className="mt-1 text-sm text-zinc-500">

                                        {category.slug ||
                                            "Browse products"}

                                    </p>

                                </button>

                            )
                        )}

                </div>

            )}

        </section>
    );
}


export default PopularCategories;

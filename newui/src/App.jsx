import { useEffect, useState } from "react";

import Footer from "./components/layout/Footer";
import SubNavbar from "./components/layout/SubNavbar";
import TopNavbar from "./components/layout/TopNavbar";

import HeroBanner from "./components/sections/HeroBanner";
import PopularCategories from "./components/sections/PopularCategories";
import PopularProductsSlider from "./components/sections/PopularProductsSlider";
import ProductListing from "./components/sections/ProductListing";

import { getProductCategories } from "./services/productApi";

import {
    categoriesMenu,
    cpuPlatforms,
    heroSection,
    laptopProducts,
    laptopTags,
    navLinks,
    popularCategoryCards,
    popularProducts,
    ramCapacities,
} from "./data/mockData";

const fallbackCategories = categoriesMenu.map((name, index) => ({
    id: `fallback-${index + 1}`,
    name,
    parentId: null,
    sortOrder: index + 1,
}));

function App() {
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function loadCategories() {
            try {
                setCategoriesLoading(true);
                setCategoriesError(null);

                const data = await getProductCategories();

                if (!cancelled) {
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to load product categories:", error);

                if (!cancelled) {
                    if (error?.status === 401) {
                        setCategories(fallbackCategories);
                        setCategoriesError(null);
                    } else {
                        setCategoriesError(error);
                    }
                }
            } finally {
                if (!cancelled) {
                    setCategoriesLoading(false);
                }
            }
        }

        loadCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="min-h-screen bg-background text-ink">
            <header className="fixed top-0 z-50 w-full">
                <TopNavbar />

                <SubNavbar
                    navLinks={navLinks}
                    categories={categories}
                    categoriesLoading={categoriesLoading}
                    categoriesError={categoriesError}
                />
            </header>

            <main className="mx-auto w-full max-w-container px-5 pb-20 pt-28 md:px-16 md:pt-44">
                <HeroBanner hero={heroSection} />

                <PopularCategories categories={popularCategoryCards} />

                <PopularProductsSlider products={popularProducts} />

                <ProductListing
                    cpuPlatforms={cpuPlatforms}
                    ramCapacities={ramCapacities}
                    laptopTags={laptopTags}
                    laptopProducts={laptopProducts}
                />
            </main>

            <Footer />
        </div>
    );
}

export default App;
import Footer from "./components/layout/Footer";
import SubNavbar from "./components/layout/SubNavbar";
import TopNavbar from "./components/layout/TopNavbar";
import HeroBanner from "./components/sections/HeroBanner";
import PopularCategories from "./components/sections/PopularCategories";
import PopularProductsSlider from "./components/sections/PopularProductsSlider";
import ProductListing from "./components/sections/ProductListing";
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

function App() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="fixed top-0 z-50 w-full">
        <TopNavbar />
        <SubNavbar navLinks={navLinks} categories={categoriesMenu} />
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

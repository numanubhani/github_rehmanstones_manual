// src/pages/Home.tsx
import { useMemo, useState, useEffect } from "react";
import { getSlides, type Slide as AdminSlide } from "../utils/slides";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import FilterTabs, { type FilterKey } from "../components/FilterTabs";
import type { Product } from "../data/products";
import toast from "react-hot-toast";
import QuickView from "../components/QuickView";
import SEO from "../components/SEO";

/* Local product images (Vite will hash & optimize) */
import img1 from "../assets/products/1 (1).jpg";
import img2 from "../assets/products/1 (2).jpg";
import img3 from "../assets/products/1 (3).jpg";
import img4 from "../assets/products/1 (4).jpg";
import img5 from "../assets/products/1 (5).jpg";
import img6 from "../assets/products/1 (6).jpg";

/* Product list using your local images */
const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Dure-e-Najaf Silver Ring (925)",
    price: 3500,
    oldPrice: 4200,
    images: [img1],
    category: "ring",
    brand: "Rehman Stones",
    rating: 4.5,
    ratingCount: 123,
  },
  {
    id: 2,
    name: "Aqeeq (Agate) Silver Ring – Handcrafted",
    price: 5200,
    oldPrice: 5900,
    images: [img2],
    category: "ring",
    brand: "Rehman Stones",
    rating: 4.6,
    ratingCount: 86,
  },
  {
    id: 3,
    name: "Silver Chains & Dure-e-Najaf Pendants",
    price: 4800,
    oldPrice: 5600,
    images: [img3],
    category: "gemstone",
    brand: "Rehman Stones",
    rating: 4.4,
    ratingCount: 67,
  },
  {
    id: 4,
    name: "Amethyst (Jamunia) Set – Ring & Beads",
    price: 7800,
    oldPrice: 8900,
    images: [img4],
    category: "gemstone",
    brand: "Rehman Stones",
    rating: 4.7,
    ratingCount: 102,
  },
  {
    id: 5,
    name: "Polished Aqeeq Silver Rings (Pair)",
    price: 6900,
    oldPrice: 7600,
    images: [img5],
    category: "ring",
    brand: "Rehman Stones",
    rating: 4.3,
    ratingCount: 54,
  },
  {
    id: 6,
    name: "Minimal Star-Engraved Silver Rings",
    price: 4200,
    oldPrice: 4800,
    images: [img6],
    category: "ring",
    brand: "Rehman Stones",
    rating: 4.2,
    ratingCount: 39,
  },
];

type SortKey = "Newest" | "PriceLow" | "PriceHigh" | "Rating";

export default function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [filter, setFilter] = useState<FilterKey>("All");
  const [sort, setSort] = useState<SortKey>("Newest");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Admin-managed carousel slides fallback to product images if none
  const defaultSlides: AdminSlide[] = [
    { id: "1", image: img1, headline: "Premium Silver Jewelry", subhead: "Handcrafted 925 silver & certified gemstones" },
    { id: "2", image: img2, headline: "Aqeeq Collection", subhead: "Timeless agate rings, crafted to perfection" },
    { id: "3", image: img3, headline: "Elegant Pendants", subhead: "Minimal designs with lasting shine" },
  ];
  const adminSlides = getSlides(defaultSlides);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % adminSlides.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(timer);
  }, [adminSlides.length]);


  const filtered = useMemo(() => {
    let products = ALL_PRODUCTS;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (filter !== "All") {
      if (filter === "Rings") {
        products = products.filter((p) => p.category === "ring");
      } else {
        products = products.filter((p) => p.category === "gemstone");
      }
    }

    // Apply price range filter
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply rating filter
    if (minRating > 0) {
      products = products.filter((p) => (p.rating ?? 0) >= minRating);
    }
    
    return products;
  }, [filter, searchQuery, priceRange, minRating]);

  const display = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "PriceLow":
        list.sort((a, b) => a.price - b.price);
        break;
      case "PriceHigh":
        list.sort((a, b) => b.price - a.price);
        break;
      case "Rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        list.sort((a, b) => Number(b.id) - Number(a.id)); // Newest first
    }
    return list;
  }, [filtered, sort]);

  return (
    <>
      <SEO
        title="Rehman Stones - Premium 925 Silver Jewelry & Authentic Gemstones"
        description="Shop handcrafted 925 silver rings, Aqeeq, Dure-e-Najaf, and authentic gemstones. Premium quality jewelry with cash on delivery. Free shipping across Pakistan."
        keywords="silver rings Pakistan, 925 silver jewelry, aqeeq ring, dure-e-najaf, gemstone jewelry, handcrafted rings, authentic stones"
      />
      <div className="space-y-10">
        {/* Clean Hero Section */}
      {!searchQuery && (
        <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Content */}
            <div className="px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-16 flex flex-col justify-center order-2 md:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black leading-tight mb-3 sm:mb-4">
                Premium Silver Jewelry
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Authentic 925 silver rings and certified gemstones. Handcrafted excellence, delivered nationwide.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-block text-center bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Shop Collection
                </a>
                <a
                  href="/about"
                  className="inline-block text-center bg-gray-100 hover:bg-gray-200 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right: Carousel (admin-managed) */}
            <div className="relative h-56 sm:h-64 md:h-auto bg-gray-100 overflow-hidden order-1 md:order-2">
              {/* Slides */}
              <div className="relative w-full h-full min-h-[300px] md:min-h-[400px]">
                {adminSlides.map((s, index) => (
                  <div
                    key={String(s.id)}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={s.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {(s.headline || s.subhead) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 sm:px-6 text-center">
                        {s.headline && (
                          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
                            {s.headline}
                          </h2>
                        )}
                        {s.subhead && (
                          <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm md:text-base opacity-90 drop-shadow">
                            {s.subhead}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {/* Dots */}
                <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 sm:gap-2 z-10">
                  {adminSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'bg-white w-6 sm:w-8'
                          : 'bg-white/50 hover:bg-white/75 w-1.5 sm:w-2'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Arrows */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + adminSlides.length) % adminSlides.length)}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg z-10"
                  aria-label="Previous slide"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % adminSlides.length)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg z-10"
                  aria-label="Next slide"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search results header */}
      {searchQuery && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold">
            Search results for "{searchQuery}"
          </h2>
          <p className="text-gray-600 mt-1">
            {display.length} {display.length === 1 ? "product" : "products"} found
          </p>
        </div>
      )}

      {/* Trust / perks strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <div className="flex items-center gap-3">
            <Icon name="shield" />
            <div>
              <div className="font-semibold text-sm sm:text-base">Genuine 925 Silver</div>
              <div className="text-xs sm:text-sm text-gray-500">
                Nickel-free & hypoallergenic
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Icon name="truck" />
            <div>
              <div className="font-semibold text-sm sm:text-base">Fast Nationwide Delivery</div>
              <div className="text-xs sm:text-sm text-gray-500">Free over Rs. 10,000</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Icon name="refresh" />
            <div>
              <div className="font-semibold text-sm sm:text-base">7-Day Easy Returns</div>
              <div className="text-xs sm:text-sm text-gray-500">Shop with confidence</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Heading + filter + sort */}
      <div id="products" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Latest Products</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {display.length} products found
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            <FilterTabs value={filter} onChange={setFilter} />
            <div className="hidden sm:block h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-lg ring-1 ring-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black flex-1 sm:flex-initial"
              >
                <option value="Newest">Newest</option>
                <option value="PriceLow">Price: Low to High</option>
                <option value="PriceHigh">Price: High to Low</option>
                <option value="Rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Price Range */}
              <div>
                <label className="block font-bold text-sm text-black mb-3">Price Range</label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Rs. 0</span>
                    <span className="font-bold text-black">Rs. {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block font-bold text-sm text-black mb-3">Minimum Rating</label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        minRating === rating
                          ? "bg-black text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {rating === 0 ? "All" : `${rating}★+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setPriceRange([0, 10000]);
                setMinRating(0);
                toast.success("Filters reset");
              }}
              className="mt-4 w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-semibold text-sm transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Product grid: 5 per row on large */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {display.map((p) => (
          <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
        ))}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
      </div>
    </>
  );
}

/* ------- Small UI helpers (local to this page) ------- */

function Card({ children }: { children: React.ReactNode }) {
  // Subtle, professional – no heavy elevation, just a gentle ring
  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-200 p-4">
      {children}
    </div>
  );
}

function Icon({ name }: { name: "truck" | "shield" | "refresh" }) {
  const path =
    name === "truck"
      ? "M3 7h10v6H3zM13 9h4l3 3v1h-7zM5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
      : name === "shield"
      ? "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"
      : "M3 12a9 9 0 1 1 2.64 6.36L3 21l.64-2.64A8.97 8.97 0 0 1 3 12Zm6-1h6v2H9v-2z";
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="text-gray-900"
    >
      <path d={path} stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

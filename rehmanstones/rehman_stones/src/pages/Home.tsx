// src/pages/Home.tsx
import { useMemo, useState } from "react";
import CarouselHero from "../components/CarouselHero";
import ProductCard from "../components/ProductCard";
import FilterTabs, { type FilterKey } from "../components/FilterTabs";

/* Local product images (Vite will hash & optimize) */
import img1 from "../assets/products/1 (1).jpg";
import img2 from "../assets/products/1 (2).jpg";
import img3 from "../assets/products/1 (3).jpg";
import img4 from "../assets/products/1 (4).jpg";
import img5 from "../assets/products/1 (5).jpg";
import img6 from "../assets/products/1 (6).jpg";

/* Hero slides (keep or swap to local later) */
const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1600",
    headline: "Pure 925 Silver",
    subhead: "Handcrafted rings & gemstones",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600",
    headline: "Timeless Designs",
    subhead: "Elegant, minimal, durable",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1518544801976-3e1ee0bc8eaf?q=80&w=1600",
    headline: "Gemstones Collection",
    subhead: "Certified stones set in silver",
  },
] as const;

type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: "ring" | "gemstone";
  oldPrice?: number;
  rating?: number;
  ratingCount?: number;
};

/* Product list using your local images */
const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Dure-e-Najaf Silver Ring (925)",
    price: 3500,
    oldPrice: 4200,
    image: img1,
    category: "ring",
    rating: 4.5,
    ratingCount: 123,
  },
  {
    id: 2,
    name: "Aqeeq (Agate) Silver Ring – Handcrafted",
    price: 5200,
    oldPrice: 5900,
    image: img2,
    category: "ring",
    rating: 4.6,
    ratingCount: 86,
  },
  {
    id: 3,
    name: "Silver Chains & Dure-e-Najaf Pendants",
    price: 4800,
    oldPrice: 5600,
    image: img3,
    category: "gemstone",
    rating: 4.4,
    ratingCount: 67,
  },
  {
    id: 4,
    name: "Amethyst (Jamunia) Set – Ring & Beads",
    price: 7800,
    oldPrice: 8900,
    image: img4,
    category: "gemstone",
    rating: 4.7,
    ratingCount: 102,
  },
  {
    id: 5,
    name: "Polished Aqeeq Silver Rings (Pair)",
    price: 6900,
    oldPrice: 7600,
    image: img5,
    category: "ring",
    rating: 4.3,
    ratingCount: 54,
  },
  {
    id: 6,
    name: "Minimal Star-Engraved Silver Rings",
    price: 4200,
    oldPrice: 4800,
    image: img6,
    category: "ring",
    rating: 4.2,
    ratingCount: 39,
  },
];

type SortKey = "Newest" | "PriceLow" | "PriceHigh" | "Rating";

export default function Home() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [sort, setSort] = useState<SortKey>("Newest");

  const counts = useMemo(
    () => ({
      all: ALL_PRODUCTS.length,
      rings: ALL_PRODUCTS.filter((p) => p.category === "ring").length,
      gemstones: ALL_PRODUCTS.filter((p) => p.category === "gemstone").length,
    }),
    []
  );

  const filtered = useMemo(() => {
    if (filter === "All") return ALL_PRODUCTS;
    if (filter === "Rings")
      return ALL_PRODUCTS.filter((p) => p.category === "ring");
    return ALL_PRODUCTS.filter((p) => p.category === "gemstone");
  }, [filter]);

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
        // "Newest" — keep original order (id DESC if you prefer)
        list.sort((a, b) => Number(b.id) - Number(a.id));
    }
    return list;
  }, [filtered, sort]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <CarouselHero slides={slides as any} />

      {/* Trust / perks strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <div className="flex items-center gap-3">
            <Icon name="shield" />
            <div>
              <div className="font-semibold">Genuine 925 Silver</div>
              <div className="text-sm text-gray-500">
                Nickel-free & hypoallergenic
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Icon name="truck" />
            <div>
              <div className="font-semibold">Fast Nationwide Delivery</div>
              <div className="text-sm text-gray-500">Free over Rs. 10,000</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Icon name="refresh" />
            <div>
              <div className="font-semibold">7-Day Easy Returns</div>
              <div className="text-sm text-gray-500">Shop with confidence</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Heading + filter + sort */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Latest Products</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {filter === "All" && `${counts.all} items`}
            {filter === "Rings" && `${counts.rings} rings`}
            {filter === "GemStones" && `${counts.gemstones} gemstones`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FilterTabs value={filter} onChange={setFilter} />
          <div className="hidden sm:block h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg ring-1 ring-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Newest">Newest</option>
              <option value="PriceLow">Price: Low to High</option>
              <option value="PriceHigh">Price: High to Low</option>
              <option value="Rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product grid: 5 per row on large */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {display.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

/* ------- Small UI helpers (local to this page) ------- */

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl shadow-sm p-4">{children}</div>;
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

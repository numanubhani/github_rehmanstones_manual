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

export default function Home() {
  const [filter, setFilter] = useState<FilterKey>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return ALL_PRODUCTS;
    if (filter === "Rings")
      return ALL_PRODUCTS.filter((p) => p.category === "ring");
    // "GemStones"
    return ALL_PRODUCTS.filter((p) => p.category === "gemstone");
  }, [filter]);

  return (
    <div className="space-y-8">
      <CarouselHero slides={slides as any} />

      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Latest Products</h2>
        <FilterTabs value={filter} onChange={setFilter} />
      </div>

      {/* 5 cards per row on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

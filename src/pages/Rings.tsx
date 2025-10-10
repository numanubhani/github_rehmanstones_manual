// src/pages/Rings.tsx
import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { PRODUCTS } from "../data/products";

type SortKey = "Newest" | "PriceLow" | "PriceHigh" | "Rating";

export default function Rings() {
  const [sort, setSort] = useState<SortKey>("Newest");

  // Filter only rings
  const rings = useMemo(
    () => PRODUCTS.filter((p) => p.category === "ring"),
    []
  );

  // Sort rings
  const sortedRings = useMemo(() => {
    const list = [...rings];
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
  }, [rings, sort]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Silver Rings Collection</h1>
        <p className="text-gray-300 max-w-2xl">
          Discover our exquisite collection of handcrafted 925 sterling silver rings.
          From classic bands to intricate designs, each piece is made with precision
          and passion.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Genuine 925 Silver</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s-8-4.438-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.562-8 11-8 11Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Hypoallergenic</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12a9 9 0 1 1 2.64 6.36L3 21l.64-2.64A8.97 8.97 0 0 1 3 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>7-Day Returns</span>
          </div>
        </div>
      </div>

      {/* Sort & count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">All Rings</h2>
          <p className="text-sm text-gray-500 mt-1">{rings.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by</label>
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

      {/* Product grid */}
      {rings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No rings available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sortedRings.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <FeatureCard
          icon="shield"
          title="Quality Guaranteed"
          description="Every ring is made from genuine 925 sterling silver with authenticity guarantee."
        />
        <FeatureCard
          icon="ruler"
          title="Multiple Sizes"
          description="Available in sizes 11-40 to ensure the perfect fit for everyone."
        />
        <FeatureCard
          icon="star"
          title="Handcrafted"
          description="Each piece is carefully crafted by skilled artisans with attention to detail."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: "shield" | "ruler" | "star";
  title: string;
  description: string;
}) {
  const paths = {
    shield: "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z",
    ruler: "M4 4h16v2H4zM4 10h16v2H4zM4 16h16v2H4z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-black text-white grid place-items-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d={paths[icon]} stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

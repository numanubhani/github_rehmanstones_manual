// src/pages/Gemstones.tsx
import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { PRODUCTS } from "../data/products";
import SEO from "../components/SEO";

type SortKey = "Newest" | "PriceLow" | "PriceHigh" | "Rating";

export default function Gemstones() {
  const [sort, setSort] = useState<SortKey>("Newest");

  // Filter only gemstones
  const gemstones = useMemo(
    () => PRODUCTS.filter((p) => p.category === "gemstone"),
    []
  );

  // Sort gemstones
  const sortedGemstones = useMemo(() => {
    const list = [...gemstones];
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
  }, [gemstones, sort]);

  return (
    <>
      <SEO
        title="Gemstones Collection - Authentic Precious Stones"
        description="Explore authentic gemstones including Aqeeq, Dure-e-Najaf, Amethyst, and more. Premium quality gemstone jewelry with certification."
        keywords="gemstones, aqeeq, dure-e-najaf, amethyst, precious stones, authentic gemstones Pakistan"
      />
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Certified Gemstones Collection
        </h1>
        <p className="text-purple-100 max-w-2xl">
          Explore our collection of natural, certified gemstones. From vibrant amethysts
          to deep garnets, each stone comes with authenticity certification and is
          perfect for 925 silver settings.
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
            <span>100% Natural Stones</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Certified Authentic</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s-8-4.438-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.562-8 11-8 11Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Premium Quality</span>
          </div>
        </div>
      </div>

      {/* Sort & count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">All Gemstones</h2>
          <p className="text-sm text-gray-500 mt-1">{gemstones.length} products</p>
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
      {gemstones.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No gemstones available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sortedGemstones.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <FeatureCard
          icon="certificate"
          title="Certified Stones"
          description="Every gemstone comes with an authenticity certificate from recognized gemological labs."
        />
        <FeatureCard
          icon="natural"
          title="100% Natural"
          description="No synthetic or lab-created stones. All our gems are mined naturally and ethically sourced."
        />
        <FeatureCard
          icon="quality"
          title="Premium Quality"
          description="Hand-selected stones with excellent clarity, color, and cut for maximum brilliance."
        />
      </div>

      {/* Info section */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold mb-4">About Our Gemstones</h2>
        <div className="prose max-w-none text-gray-700 space-y-3">
          <p>
            At Rehman Stones, we take pride in offering only the finest natural gemstones.
            Each stone in our collection has been carefully selected for its quality,
            color, and authenticity.
          </p>
          <p>
            Our gemstones are perfect for setting in 925 sterling silver jewelry or as
            standalone collector pieces. Whether you're looking for amethyst, garnet,
            turquoise, or other precious stones, we guarantee authenticity and quality.
          </p>
          <p>
            <strong>Why Choose Our Gemstones?</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sourced from reputable suppliers worldwide</li>
            <li>Every stone comes with a certificate of authenticity</li>
            <li>Ethically sourced and conflict-free</li>
            <li>Various cuts and sizes available</li>
            <li>Suitable for both jewelry making and collecting</li>
          </ul>
        </div>
      </div>
      </div>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: "certificate" | "natural" | "quality";
  title: string;
  description: string;
}) {
  const paths = {
    certificate:
      "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0zM12 15v6m-3 0h6",
    natural:
      "M12 2L2 7v10c0 5 4 8 10 10 6-2 10-5 10-10V7L12 2zM12 12l3-3m-3 3l-3-3",
    quality:
      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-900 text-white grid place-items-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d={paths[icon]} stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

// src/components/RecentlyViewed.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRecentlyViewed, type RecentProduct } from "../utils/recentlyViewed";

export default function RecentlyViewed({ excludeId }: { excludeId?: string | number }) {
  const [recent, setRecent] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const items = getRecentlyViewed();
    const filtered = excludeId ? items.filter((p) => p.id !== excludeId) : items;
    setRecent(filtered.slice(0, 5));
  }, [excludeId]);

  if (recent.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-black text-lg mb-4">Recently Viewed</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {recent.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className="group block"
          >
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2 border border-gray-200">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="text-sm font-semibold text-black line-clamp-2 mb-1">
              {item.name}
            </div>
            <div className="text-sm font-bold text-black">
              Rs. {item.price.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


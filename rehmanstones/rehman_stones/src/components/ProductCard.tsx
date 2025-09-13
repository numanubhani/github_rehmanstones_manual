// src/components/ProductCard.tsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
// If you use sonner toasts, uncomment the next line:
// import { toast } from "sonner";

type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: "ring" | "gemstone";
  oldPrice?: number;
  rating?: number; // e.g. 4.5
  ratingCount?: number; // e.g. 311
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAdd = () => {
    if (product.category === "ring") {
      // Rings require size selection → go to product page
      navigate(`/product/${product.id}`);
      return;
    }
    // Direct add for gemstones (or non-size items)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    // toast.success("Added to cart", { description: product.name });
  };

  return (
    <div className="group relative bg-white shadow-sm hover:shadow transition h-full">
      {/* Make the whole card clickable */}
      <Link
        to={`/product/${product.id}`}
        aria-label={product.name}
        className="absolute inset-0 z-[1]"
      />

      {/* Image (no crop) */}
      <div className="h-44 sm:h-52 bg-gray-50 grid place-items-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Body */}
      <div className="p-3 relative z-[2]">
        {/* 2-line clamp title */}
        <h3
          className="text-[15px] leading-tight font-medium min-h-[40px]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* price row */}
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-semibold text-[#F85606]">
              Rs.{product.price.toLocaleString()}
            </span>
            {product.oldPrice && (
              <>
                <span className="text-sm line-through text-gray-400">
                  Rs.{product.oldPrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">
                  -
                  {Math.max(
                    0,
                    Math.round(100 - (product.price / product.oldPrice) * 100)
                  )}
                  %
                </span>
              </>
            )}
          </div>

          {/* rating (compact) */}
          {(product.rating || product.ratingCount) && (
            <div className="mt-1 flex items-center gap-1 text-amber-500">
              {/* static 4.5-star style icons for list view */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.171L12 18.897 4.664 23.168l1.402-8.171L.132 9.21l8.2-1.192z" />
              </svg>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.171L12 18.897 4.664 23.168l1.402-8.171L.132 9.21l8.2-1.192z" />
              </svg>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.171L12 18.897 4.664 23.168l1.402-8.171L.132 9.21l8.2-1.192z" />
              </svg>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.171L12 18.897 4.664 23.168l1.402-8.171L.132 9.21l8.2-1.192z" />
              </svg>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="opacity-70"
              >
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.171L12 18.897 4.664 23.168l1.402-8.171L.132 9.21l8.2-1.192z" />
              </svg>
              {product.ratingCount && (
                <span className="ml-1 text-xs text-gray-600">
                  ({product.ratingCount})
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA (prevent overlay Link from triggering) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAdd();
          }}
          className="mt-3 w-full text-center text-sm border border-gray-300 hover:border-gray-400 py-1.5 transition"
        >
          {product.category === "ring" ? "Choose Size" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

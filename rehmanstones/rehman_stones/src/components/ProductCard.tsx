import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

type Product = {
  id: number | string;
  name: string;
  price: number;
  category: "ring" | "gemstone";
  image?: string; // single cover (supported)
  images?: string[]; // or array cover[0] (also supported)
  oldPrice?: number;
  rating?: number; // e.g. 4.5
  ratingCount?: number; // e.g. 311
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const cover = product.image ?? product.images?.[0] ?? "";
  const pctOff =
    product.oldPrice != null
      ? Math.max(0, Math.round(100 - (product.price / product.oldPrice) * 100))
      : null;

  return (
    <div className="group border border-gray-200 bg-white shadow-sm hover:shadow transition h-full">
      {/* image */}
      <Link
        to={`/product/${product.id}`}
        className="block h-44 sm:h-52 bg-gray-50 overflow-hidden"
      >
        <img
          src={cover}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* body */}
      <div className="p-3">
        {/* title (2-line clamp) */}
        <Link
          to={`/product/${product.id}`}
          title={product.name}
          className="block"
        >
          <h3
            className="text-[15px] leading-tight font-medium min-h-[40px]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* price row */}
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-semibold text-[#F85606]">
              Rs.{product.price.toLocaleString("en-PK")}
            </span>
            {product.oldPrice != null && (
              <>
                <span className="text-sm line-through text-gray-400">
                  Rs.{product.oldPrice.toLocaleString("en-PK")}
                </span>
                <span className="text-sm text-gray-500">-{pctOff}%</span>
              </>
            )}
          </div>

          {/* rating */}
          {(product.rating || product.ratingCount) && (
            <div className="mt-1 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.round(product.rating ?? 0);
                return (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    className={filled ? "text-amber-500" : "text-gray-300"}
                    fill="currentColor"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.171L12 18.897 4.664 23.168l1.402-8.171L.132 9.21l8.2-1.192z" />
                  </svg>
                );
              })}
              {product.ratingCount && (
                <span className="ml-1 text-xs text-gray-600">
                  ({product.ratingCount})
                </span>
              )}
            </div>
          )}
        </div>

        {/* add to cart */}
        <button
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              image: cover,
              category: product.category,
            })
          }
          className="mt-3 w-full text-center text-sm border border-gray-300 hover:border-gray-400 py-1.5 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

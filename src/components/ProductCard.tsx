// src/components/ProductCard.tsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useState } from "react";
import type { Product } from "../data/products";
import toast from "react-hot-toast";

export default function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (product: Product) => void }) {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleAdd = () => {
    if (product.category === "ring") {
      navigate(`/product/${product.id}`);
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: product.category,
    });
  };

  // Use first image from the images array
  const productImage = product.images && product.images.length > 0 ? product.images[0] : "";

  const discount = product.oldPrice
    ? Math.round(100 - (product.price / product.oldPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-premium transition-all duration-500 hover:-translate-y-2 h-full flex flex-col border border-gray-200 dark:border-gray-700">
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
            -{discount}%
          </div>
        </div>
      )}

      {/* Quick View button */}
      {onQuickView && (
        <button
          className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label="Quick view"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )}

      {/* Wishlist button */}
      <button
        className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          inWishlist ? "bg-red-500 opacity-100" : "bg-white/90 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (inWishlist) {
            removeFromWishlist(product.id);
            toast.success("Removed from wishlist");
          } else {
            addToWishlist({
              id: product.id,
              name: product.name,
              price: product.price,
              image: productImage,
              category: product.category,
            });
            toast.success("Added to wishlist!");
          }
        }}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" className={`sm:w-[18px] sm:h-[18px] ${inWishlist ? "text-white" : "text-gray-700"}`} fill={inWishlist ? "white" : "none"}>
          <path
            d="M12 21s-8-4.438-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.562-8 11-8 11Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>

      {/* Make the whole card clickable */}
      <Link
        to={`/product/${product.id}`}
        aria-label={product.name}
        className="absolute inset-0 z-[1]"
      />

      {/* Image with shimmer loading */}
      <div className="relative h-48 sm:h-56 bg-white dark:bg-gray-900 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <img
          src={productImage}
          alt={product.name}
          className={`w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 relative z-[2]">
        {/* Category badge */}
        <div className="mb-2 sm:mb-3">
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-600 dark:bg-gray-400"></div>
            {product.category}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 leading-tight min-h-[40px] sm:min-h-[44px] mb-2 sm:mb-3 group-hover:text-black dark:group-hover:text-white transition-colors"
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

        {/* Rating */}
        {(product.rating || product.ratingCount) && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  className={`${i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"} sm:w-[14px] sm:h-[14px]`}
                  fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            {product.ratingCount && (
              <span className="text-xs sm:text-sm text-gray-600 font-medium">({product.ratingCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <span className="text-lg sm:text-2xl font-black text-gray-900 dark:text-gray-100">
              Rs.{product.price.toLocaleString()}
            </span>
            {product.oldPrice && (
              <span className="text-xs sm:text-sm line-through text-gray-500 dark:text-gray-400">
                Rs.{product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAdd();
            }}
            className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {product.category === "ring" ? "Choose Size" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
    </div>
  );
}

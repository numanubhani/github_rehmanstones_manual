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
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-premium transition-all duration-500 hover:-translate-y-2 h-full flex flex-col border border-gray-200">
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            -{discount}%
          </div>
        </div>
      )}

      {/* Quick View button */}
      {onQuickView && (
        <button
          className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label="Quick view"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )}

      {/* Wishlist button */}
      <button
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 ${
          inWishlist ? "bg-red-500 opacity-100" : "bg-white/90"
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? "white" : "none"} className={inWishlist ? "text-white" : "text-gray-700"}>
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
      <div className="relative h-48 sm:h-56 bg-white overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 relative z-[2]">
        {/* Category badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-gray-100 text-gray-700">
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            {product.category}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-base font-bold text-gray-900 leading-tight min-h-[44px] mb-3 group-hover:text-black transition-colors"
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
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"}
                  className={i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            {product.ratingCount && (
              <span className="text-sm text-gray-600 font-medium">({product.ratingCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-black text-gray-900">
              Rs.{product.price.toLocaleString()}
            </span>
            {product.oldPrice && (
              <span className="text-sm line-through text-gray-500">
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
            className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
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

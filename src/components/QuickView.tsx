// src/components/QuickView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";

type Props = {
  product: Product;
  onClose: () => void;
};

export default function QuickView({ product, onClose }: Props) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [currentImage, setCurrentImage] = useState(0);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
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
    toast.success("Added to cart!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-xl transition-colors flex items-center justify-center z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-8">
          {/* Left: Images */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-200">
              <img
                src={product.images[currentImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImage === idx ? "border-black" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase rounded-full">
                {product.category}
              </span>
            </div>

            <h2 className="text-2xl font-black text-black mb-3">{product.name}</h2>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating!) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {product.ratingCount && (
                  <span className="text-sm text-gray-600">({product.ratingCount} reviews)</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black text-black">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="text-lg line-through text-gray-400">
                  Rs. {product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
            )}

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-sm text-black mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-gray-800 text-white py-4 px-6 rounded-xl font-black text-base transition-colors shadow-lg"
              >
                {product.category === "ring" ? "Select Size & Add to Cart" : "Add to Cart"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (inWishlist) {
                      toast.success("Already in wishlist");
                    } else {
                      addToWishlist({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.images[0],
                        category: product.category,
                      });
                      toast.success("Added to wishlist!");
                    }
                  }}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                    inWishlist
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-black"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                  </span>
                </button>

                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-bold text-sm transition-colors"
                >
                  Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


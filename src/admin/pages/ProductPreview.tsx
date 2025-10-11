import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type PreviewProduct = {
  name: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: "ring" | "gemstone";
  brand: string;
  rating?: number;
  ratingCount?: number;
  stock?: number;
  description?: string;
  timestamp?: number;
};

export default function ProductPreview() {
  const navigate = useNavigate();
  const [product, setProduct] = useState<PreviewProduct | null>(null);

  useEffect(() => {
    // Load preview data from localStorage
    const storedData = localStorage.getItem('admin-preview-product');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setProduct(parsed);
      } catch (error) {
        console.error('Failed to parse preview data:', error);
      }
    }
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold mb-2">No Preview Available</h1>
          <p className="text-gray-600 mb-6">
            Please add product details in the admin panel first.
          </p>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
          >
            Go to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with close button */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 grid place-items-center text-white font-bold shadow-lg">
              👁️
            </div>
            <div>
              <h1 className="text-lg font-bold">Product Preview</h1>
              <p className="text-xs text-gray-500">Live customer view</p>
            </div>
          </div>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close Preview
          </button>
        </div>
      </div>

      {/* Product Page Preview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200 aspect-square shadow-sm">
              {product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[0]}
                    alt={product.name || "Product"}
                    className="w-full h-full object-contain p-8"
                  />
                  {product.oldPrice && product.price && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">No image uploaded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200"
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Product Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-black mb-4">Product Description</h2>
              {product.description ? (
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
                  <p>
                    Discover the timeless elegance of our <strong>{product.name || 'product'}</strong>, a masterpiece crafted with precision and passion. 
                    This exquisite {product.category} represents the perfect fusion of traditional craftsmanship and contemporary design.
                  </p>
                  <p>
                    Each piece in our collection is meticulously handcrafted from premium 925 sterling silver, ensuring exceptional quality 
                    and durability. Our skilled artisans dedicate hours to perfecting every detail.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase rounded-full">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-sm text-gray-600">by {product.brand}</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-black mb-3">
                {product.name || "Product Name"}
              </h1>

              {/* Rating */}
              {(product.rating || product.ratingCount) && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? "text-yellow-500" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating ? product.rating.toFixed(1) : "0.0"} ({product.ratingCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-black">
                  Rs. {product.price.toLocaleString("en-PK")}
                </span>
                {product.oldPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      Rs. {product.oldPrice.toLocaleString("en-PK")}
                    </span>
                    <span className="text-green-600 font-semibold">
                      Save Rs. {(product.oldPrice - product.price).toLocaleString("en-PK")}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
            </div>

            {/* Size Selection (Rings only) */}
            {product.category === "ring" && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <label className="font-semibold text-black block mb-3">Select Size</label>
                <div className="grid grid-cols-10 gap-2">
                  {[...Array(30)].map((_, i) => {
                    const s = i + 11;
                    return (
                      <div
                        key={s}
                        className="h-10 rounded-md font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        {s}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black">Availability:</span>
                <span className={`font-bold ${product.stock && product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                  {product.stock && product.stock > 0 ? `${product.stock} units in stock` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-3">
              <button
                className="w-full py-4 bg-black text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
                disabled
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors"
                  disabled
                >
                  Buy Now
                </button>
                <button
                  className="py-3 border-2 border-gray-300 hover:border-black text-gray-700 font-semibold rounded-lg transition-colors"
                  disabled
                >
                  ♥ Save
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Free shipping on orders over Rs. 10,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>100% authentic & certified</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>7-day easy returns & exchanges</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure payment with COD available</span>
              </div>
            </div>

            {/* Product Highlights */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-black mb-3">Product Highlights</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Crafted from premium 925 sterling silver</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Hypoallergenic - safe for sensitive skin</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Handcrafted by skilled artisans</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Comes with certificate of authenticity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


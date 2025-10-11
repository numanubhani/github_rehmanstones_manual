// src/pages/ProductPage.tsx - Professional Redesign
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById, getRelated } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { addRecentlyViewed } from "../utils/recentlyViewed";
import RecentlyViewed from "../components/RecentlyViewed";
import ProductReviews from "../components/ProductReviews";
import SEO from "../components/SEO";
import SocialShare from "../components/SocialShare";
import WhatsAppButton from "../components/WhatsAppButton";
import toast from "react-hot-toast";


export default function ProductPage() {
  const { id } = useParams();
  const product = getProductById(id!);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [currentImage, setCurrentImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<number | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (product) {
      addRecentlyViewed({
        ...product,
        image: product.images[0], // Add image property for recently viewed
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/" className="text-black hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const isRing = product.category === "ring";
  const inWishlist = isInWishlist(product.id);
  const related = getRelated(product);

  const handleAddToCart = () => {
    if (isRing && !size) {
      toast.error("Please select a size");
      return;
    }

    const variantId = isRing && size ? `${product.id}-s${size}` : product.id;
    const nameWithSize = isRing && size ? `${product.name} (Size ${size})` : product.name;

    addItem({
      id: variantId,
      name: nameWithSize,
      price: product.price,
      image: product.images[0],
      category: product.category,
    }, qty);
    
    // Toast is already shown by CartContext, no need for duplicate
  };

  const handleBuyNow = () => {
    if (isRing && !size) {
      toast.error("Please select a size");
      return;
    }

    handleAddToCart();
    navigate("/checkout");
  };

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
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
  };

  return (
    <>
      <SEO
        title={`${product.name} - Buy Now`}
        description={`${product.name} - Premium quality ${product.category} at Rs. ${product.price.toLocaleString("en-PK")}. ${product.rating ? `Rated ${product.rating}/5` : 'Top rated'}. Cash on delivery available.`}
        keywords={`${product.name}, ${product.category}, 925 silver, ${product.brand}, buy ${product.category} online`}
        image={product.images[0]}
        type="product"
      />
      
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link to={`/${product.category === "ring" ? "rings" : "gemstones"}`} className="hover:text-black capitalize">
              {product.category}s
            </Link>
            <span>/</span>
            <span className="text-black font-medium truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* LEFT: Image Gallery */}
            <div className="space-y-4">
              <div className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 aspect-square">
                <img
                  src={product.images[currentImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
                {product.oldPrice && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === idx ? "border-black" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-black mb-4">Product Description</h2>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
                  <p>
                    Discover the timeless elegance of our <strong>{product.name}</strong>, a masterpiece crafted with precision and passion. 
                    This exquisite {product.category} represents the perfect fusion of traditional craftsmanship and contemporary design, 
                    making it an ideal choice for those who appreciate authentic luxury.
                  </p>
                  
                  <p>
                    Each piece in our collection is meticulously handcrafted from premium 925 sterling silver, ensuring exceptional quality 
                    and durability. Our skilled artisans dedicate hours to perfecting every detail, from the initial design to the final polish. 
                    The result is a stunning piece of jewelry that not only looks beautiful but also stands the test of time.
                  </p>

                  <p>
                    What sets our {product.category}s apart is the genuine gemstones and authentic materials we use. We source only the finest 
                    quality stones, ensuring each piece carries its unique character and natural beauty. Whether you're looking for a statement 
                    piece for special occasions or an everyday accessory, this {product.category} delivers unmatched elegance and versatility.
                  </p>

                  <p>
                    The hypoallergenic properties of 925 sterling silver make our jewelry perfect for sensitive skin. You can wear it 
                    comfortably all day without any irritation or discoloration. The piece comes with a certificate of authenticity, 
                    guaranteeing the quality and purity of materials used in its creation.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-black mt-4">
                    <h3 className="font-bold text-black mb-2">Why Choose Rehman Stones?</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span><strong>Premium Quality:</strong> Only the finest 925 sterling silver and authentic gemstones</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span><strong>Handcrafted Excellence:</strong> Each piece is individually crafted by skilled artisans</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span><strong>Certified Authentic:</strong> Every item comes with a certificate of authenticity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span><strong>Customer Satisfaction:</strong> 7-day easy returns and dedicated customer support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span><strong>Convenient Payment:</strong> Cash on delivery available with secure online payment options</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm text-gray-600 mt-4">
                    <strong>Care Instructions:</strong> Clean with a soft cloth and mild soap. Store in a cool, dry place. 
                    Avoid contact with harsh chemicals, perfumes, and lotions to maintain the luster and shine of your jewelry.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="space-y-6">
              {/* Title & Category */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase rounded-full">
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="text-sm text-gray-600">by {product.brand}</span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-black mb-3">{product.name}</h1>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(product.rating!) ? "text-yellow-500" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.ratingCount || 0} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-4">
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

              {/* Size Selection */}
              {isRing && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-semibold text-black">Select Size</label>
                    <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-sm text-gray-600 hover:text-black underline"
                      type="button"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-10 gap-2">
                    {[...Array(30)].map((_, i) => {
                      const s = i + 11;
                      const isSelected = size === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`h-10 rounded-md font-semibold text-sm transition-all ${
                            isSelected
                              ? "bg-black text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="font-semibold text-black block mb-3">Quantity</label>
                <div className="inline-flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center font-bold text-lg">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path d="M12 5v14m-7-7h14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-black hover:bg-gray-900 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleBuyNow}
                    className="py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className={`py-3 font-semibold rounded-lg transition-all border-2 ${
                      inWishlist
                        ? "bg-red-50 border-red-500 text-red-600 hover:bg-red-100"
                        : "bg-white border-gray-300 text-gray-700 hover:border-black"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {inWishlist ? "Saved" : "Save"}
                    </span>
                  </button>
                </div>
              </div>

              {/* WhatsApp & Share */}
              <div className="flex gap-3 pt-2">
                <WhatsAppButton product={product} size={size} className="flex-1" />
                <SocialShare
                  title={product.name}
                  description={`Check out this ${product.category} - Rs. ${product.price.toLocaleString("en-PK")}`}
                />
              </div>

              {/* Trust Badges */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                <TrustItem icon="truck" text="Free shipping on orders over Rs. 10,000" />
                <TrustItem icon="shield" text="100% authentic & certified" />
                <TrustItem icon="return" text="7-day easy returns & exchanges" />
                <TrustItem icon="secure" text="Secure payment with COD available" />
              </div>

              {/* Product Highlights */}
              <div>
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

          {/* Product Reviews */}
          <div className="mb-12">
            <ProductReviews productId={product.id} />
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {related.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-50">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-4" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-black line-clamp-2 mb-2 group-hover:text-gray-700">
                        {p.name}
                      </h3>
                      <div className="text-lg font-bold text-black">
                        Rs. {p.price.toLocaleString("en-PK")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          <RecentlyViewed excludeId={product.id} />
        </div>
      </div>
    </>
  );
}

function SizeGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-black text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-black mb-1">Ring Size Guide</h2>
            <p className="text-gray-300 text-sm">Find your perfect fit</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* How to Measure */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-black text-lg mb-4">How to Measure Your Ring Size</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <span><strong>Wrap a string</strong> around your finger where you'd wear the ring</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <span><strong>Mark the point</strong> where the string overlaps</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <span><strong>Measure the length</strong> in millimeters</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">4</span>
                <span><strong>Match to the size chart</strong> below</span>
              </li>
            </ol>
          </div>

          {/* Size Chart */}
          <div>
            <h3 className="font-black text-lg mb-4">Size Chart</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Size</th>
                    <th className="px-4 py-3 text-left font-bold">Circumference (mm)</th>
                    <th className="px-4 py-3 text-left font-bold">Diameter (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { size: 11, circ: 51.2, dia: 16.3 },
                    { size: 12, circ: 52.8, dia: 16.8 },
                    { size: 13, circ: 54.4, dia: 17.3 },
                    { size: 14, circ: 56.0, dia: 17.8 },
                    { size: 15, circ: 57.6, dia: 18.3 },
                    { size: 16, circ: 59.2, dia: 18.9 },
                    { size: 17, circ: 60.8, dia: 19.4 },
                    { size: 18, circ: 62.4, dia: 19.9 },
                    { size: 19, circ: 64.0, dia: 20.4 },
                    { size: 20, circ: 65.6, dia: 20.9 },
                  ].map((row) => (
                    <tr key={row.size} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">{row.size}</td>
                      <td className="px-4 py-3">{row.circ} mm</td>
                      <td className="px-4 py-3">{row.dia} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h4 className="font-bold text-black mb-3">Pro Tips</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Measure your finger at the end of the day when it's largest</li>
              <li>• Make sure the string is snug but comfortable</li>
              <li>• Wider bands require a larger size (go up 0.5-1 size)</li>
              <li>• If between sizes, choose the larger one</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustItem({ icon, text }: { icon: string; text: string }) {
  const icons: { [key: string]: React.ReactElement } = {
    truck: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    shield: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    return: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    secure: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="text-green-600">{icons[icon]}</div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}


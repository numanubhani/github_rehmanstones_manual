// src/pages/Wishlist.tsx
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    });
    toast.success("Added to cart!");
  };

  const handleRemove = (id: string | number, name: string) => {
    removeFromWishlist(id);
    toast.success(`${name} removed from wishlist`);
  };

  return (
    <>
      <SEO
        title="My Wishlist - Saved Items"
        description="View your saved items and wishlist. Shop your favorite silver jewelry and gemstones at Rehman Stones."
        keywords="wishlist, saved items, favorites, saved products"
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
          <h1 className="text-3xl font-black text-black">My Wishlist</h1>
          <p className="text-gray-600 mt-1">{wishlistItems.length} items saved</p>
        </div>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-6">Save items you love for later</p>
          <Link
            to="/"
            className="inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
              <Link to={`/product/${item.id}`} className="block">
                <div className="relative h-48 bg-gray-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/product/${item.id}`}>
                  <h3 className="font-bold text-black mb-2 line-clamp-2 hover:text-gray-700">
                    {item.name}
                  </h3>
                </Link>
                <div className="text-lg font-black text-black mb-3">
                  Rs. {item.price.toLocaleString("en-PK")}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-black hover:bg-gray-800 text-white py-2 px-3 rounded-lg font-bold text-sm transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    className="w-10 h-10 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors flex items-center justify-center"
                    aria-label="Remove from wishlist"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}


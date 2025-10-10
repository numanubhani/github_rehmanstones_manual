// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import toast from "react-hot-toast";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  items: any[];
}

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
  });

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingPicture(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        updateProfile({ profilePicture: dataUrl });
        setUploadingPicture(false);
      };
      reader.onerror = () => {
        toast.error("Failed to upload image");
        setUploadingPicture(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
      setUploadingPicture(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Load user's orders
    try {
      const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const orders = allOrders.filter(
        (order: any) => order.customer.email === user.email || order.customer.phone === user.phone
      );
      setUserOrders(orders);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <SEO
        title="My Profile"
        description="Manage your profile, view order history, and update your information at Rehman Stones."
        keywords="user profile, my account, order history"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">My Profile</h1>
            <p className="text-gray-600 text-sm">Manage your account and view order history</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            {/* LEFT: Profile Info */}
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">Profile Picture</h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-black text-white flex items-center justify-center text-3xl font-bold border-2 border-gray-300">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {uploadingPicture && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-3">Upload a profile picture to personalize your account</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md font-semibold text-sm cursor-pointer transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        disabled={uploadingPicture}
                      />
                    </label>
                    {user.profilePicture && (
                      <button
                        onClick={() => updateProfile({ profilePicture: "" })}
                        className="ml-3 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg">Account Information</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-sm text-black hover:text-gray-700 font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md font-semibold text-sm transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-md font-semibold text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <InfoRow label="Name" value={user.name} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Phone" value={user.phone || "Not provided"} />
                    <InfoRow label="Address" value={user.address || "Not provided"} />
                    <InfoRow label="City" value={user.city || "Not provided"} />
                    <InfoRow label="Member Since" value={new Date(user.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })} />
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-bold text-lg mb-4">Order History</h2>
                
                {userOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-gray-500 text-sm mb-4">No orders yet</p>
                    <Link
                      to="/"
                      className="inline-block px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-md font-semibold text-sm transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((order) => (
                      <Link
                        key={order.id}
                        to={`/track?id=${order.id}`}
                        className="block border border-gray-200 rounded-lg p-4 hover:border-black transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-black">{order.id}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString("en-PK")} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Quick Actions */}
            <aside className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-medium">View All Orders</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-medium">My Wishlist</span>
                  </Link>
                  <Link
                    to="/track"
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Track Order</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-lg mb-4">Account</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Account Active</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure Account</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full mt-6 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-black">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: { [key: string]: string } = {
    PLACED: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-yellow-100 text-yellow-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}


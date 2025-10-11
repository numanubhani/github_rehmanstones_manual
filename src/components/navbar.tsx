// src/components/navbar.tsx
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import InstallAppButton from "./InstallAppButton";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { totalQty } = useCart();
  const { user, logout } = useAuth(); // <-- expects shape like: { name, email, role: 'user' | 'admin' }
  const { wishlistItems } = useWishlist();

  const mainLinkBase =
    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300";
  const mainLinkActive = "text-black dark:text-white bg-gray-100 dark:bg-gray-700";
  const mainLinkIdle = "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800";

  const actionLinkBase =
    "px-3 py-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700";

  // Close profile menu on outside click / Esc
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  const firstName = user?.name?.split(" ")?.[0] ?? "";
  const initials = (
    user?.name?.split(" ")?.[0]?.[0] ??
    user?.email?.[0] ??
    "U"
  ).toUpperCase();

  const handleLogout = async () => {
    await logout?.();
    setMenuOpen(false);
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 flex-1">
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide select-none text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Rehman Stones — Home"
          >
            <span className="font-black">RS</span>
          </Link>

          {/* Center: Main nav (desktop) */}
          <div className="hidden md:flex items-center gap-1 ml-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${mainLinkBase} ${isActive ? mainLinkActive : mainLinkIdle}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/rings"
              className={({ isActive }) =>
                `${mainLinkBase} ${isActive ? mainLinkActive : mainLinkIdle}`
              }
            >
              Rings
            </NavLink>
            <NavLink
              to="/gemstones"
              className={({ isActive }) =>
                `${mainLinkBase} ${isActive ? mainLinkActive : mainLinkIdle}`
              }
            >
              Gemstones
            </NavLink>
          </div>
        </div>

        {/* Search bar integrated */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:border-black dark:focus:border-white transition-colors text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </form>

        {/* Right actions (desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <NavLink
            to="/track"
            className={({ isActive }) =>
              `${actionLinkBase} ${isActive ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white" : ""}`
            }
          >
            Track Order
          </NavLink>

          {/* Optional desktop Install button */}
          <InstallAppButton />

          {/* Wishlist */}
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              `relative ${actionLinkBase} ${isActive ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white" : ""}`
            }
            aria-label="Wishlist"
            title="Wishlist"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-[10px] leading-none px-2 py-1 rounded-full bg-red-500 text-white font-bold">
                {wishlistItems.length}
              </span>
            )}
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative ${actionLinkBase} ${isActive ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white" : ""}`
            }
            aria-label="Cart"
            title="Cart"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
            >
              <path
                d="M6 6h15l-1.5 9h-12L5 3H2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="10" cy="20" r="1.6" fill="currentColor" />
              <circle cx="18" cy="20" r="1.6" fill="currentColor" />
            </svg>
            {totalQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-[10px] leading-none px-2 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold">
                {totalQty}
              </span>
            )}
          </NavLink>

          {/* Auth area (desktop) */}
            {!user ? (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-5 py-2.5 rounded-lg text-white dark:text-black bg-black dark:bg-white font-semibold transition-all duration-300 ${
                    isActive ? "bg-gray-800 dark:bg-gray-200" : "hover:bg-gray-800 dark:hover:bg-gray-200"
                  }`
                }
              >
                Login
              </NavLink>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black grid place-items-center text-xs font-bold">
                    {initials}
                  </span>
                )}
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {firstName || user.name || "Account"}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600 dark:text-gray-400">
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-64 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden fade-in"
                >
                  <div className="px-3 py-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Signed in as</div>
                    <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                      {user.name || user.email}
                    </div>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-700" />
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    My Profile
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/orders");
                    }}
                  >
                    Order History
                  </button>
                  {user.role === "admin" && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/admin");
                      }}
                    >
                      Admin Panel
                    </button>
                  )}
                  <div className="h-px bg-gray-100 dark:bg-gray-700" />
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded border border-black/10 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md text-black dark:text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden border-t border-black/10 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="px-4 py-3 flex flex-col">
            {/* Auth section (mobile) */}
            {!user ? (
              <NavLink
                to="/login"
                className="mb-2 px-3 py-2 rounded bg-black dark:bg-white text-white dark:text-black text-center hover:opacity-90"
                onClick={() => setOpen(false)}
              >
                Login
              </NavLink>
            ) : (
              <div className="mb-2 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 p-3 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black grid place-items-center text-sm">
                      {initials}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    className="px-3 py-2 rounded ring-1 ring-gray-200 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
                    onClick={() => {
                      setOpen(false);
                      navigate("/orders");
                    }}
                  >
                    Order History
                  </button>
                  {user.role === "admin" && (
                    <button
                      className="px-3 py-2 rounded ring-1 ring-gray-200 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
                      onClick={() => {
                        setOpen(false);
                        navigate("/admin");
                      }}
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    className="col-span-2 px-3 py-2 rounded ring-1 ring-red-200 dark:ring-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Main nav (mobile) */}
            <NavLink
              to="/"
              end
              className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100"
              onClick={() => setOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/rings"
              className="mt-1 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100"
              onClick={() => setOpen(false)}
            >
              Rings
            </NavLink>
            <NavLink
              to="/gemstones"
              className="mt-1 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100"
              onClick={() => setOpen(false)}
            >
              Gemstones
            </NavLink>

            {/* Actions */}
            <NavLink
              to="/track"
              className="mt-1 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100"
              onClick={() => setOpen(false)}
            >
              Track Order
            </NavLink>
            <NavLink
              to="/cart"
              className="mt-1 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100"
              onClick={() => setOpen(false)}
            >
              Cart{" "}
              {totalQty > 0 && (
                <span className="ml-2 inline-flex items-center justify-center text-[10px] leading-none px-1.5 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black">
                  {totalQty}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/wishlist"
              className="mt-1 px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100"
              onClick={() => setOpen(false)}
            >
              Wishlist{" "}
              {wishlistItems.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center text-[10px] leading-none px-1.5 py-1 rounded-full bg-red-500 text-white">
                  {wishlistItems.length}
                </span>
              )}
            </NavLink>

            {/* Install App (mobile) */}
            <InstallAppButton className="mt-2" />
          </div>
        </div>
      )}
    </header>
  );
}

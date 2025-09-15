// src/components/navbar.tsx
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import InstallAppButton from "./InstallAppButton";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { totalQty } = useCart();
  const { user, logout } = useAuth(); // <-- expects shape like: { name, email, role: 'user' | 'admin' }

  const mainLinkBase =
    "relative px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const mainLinkActive = "text-black bg-black/5";
  const mainLinkIdle = "text-gray-700 hover:text-black hover:bg-black/5";

  const actionLinkBase =
    "px-3 py-2 rounded-md transition-colors hover:bg-black/5";

  // Close profile menu on outside click / Esc
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-black/10">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 flex-1">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-wide select-none"
            aria-label="Rehman Stones — Home"
          >
            Rehman Stones
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

        {/* Right actions (desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <NavLink
            to="/track"
            className={({ isActive }) =>
              `${actionLinkBase} ${isActive ? "bg-black/10" : ""}`
            }
          >
            Track Order
          </NavLink>

          {/* Optional desktop Install button */}
          <InstallAppButton />

          {/* Cart */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative ${actionLinkBase} ${isActive ? "bg-black/10" : ""}`
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
              <span className="absolute -top-1.5 -right-1.5 text-[10px] leading-none px-1.5 py-1 rounded-full bg-black text-white">
                {totalQty}
              </span>
            )}
          </NavLink>

          {/* Auth area (desktop) */}
          {!user ? (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-white font-medium transition ${
                  isActive ? "bg-black/90" : "bg-black hover:opacity-90"
                }`
              }
            >
              Login
            </NavLink>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-black/5"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center text-xs">
                  {initials}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {firstName || user.name || "Account"}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white ring-1 ring-gray-200 shadow-xl overflow-hidden"
                >
                  <div className="px-3 py-2">
                    <div className="text-xs text-gray-500">Signed in as</div>
                    <div className="text-sm font-medium truncate">
                      {user.name || user.email}
                    </div>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/orders");
                    }}
                  >
                    Order History
                  </button>
                  {user.role === "admin" && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/admin");
                      }}
                    >
                      Admin Panel
                    </button>
                  )}
                  <div className="h-px bg-gray-100" />
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
          className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded border border-black/10 bg-white/60 backdrop-blur-md"
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
        <div className="sm:hidden border-t border-black/10 bg-white/80 backdrop-blur-md">
          <div className="px-4 py-3 flex flex-col">
            {/* Auth section (mobile) */}
            {!user ? (
              <NavLink
                to="/login"
                className="mb-2 px-3 py-2 rounded bg-black text-white text-center hover:opacity-90"
                onClick={() => setOpen(false)}
              >
                Login
              </NavLink>
            ) : (
              <div className="mb-2 rounded-lg ring-1 ring-gray-200 p-3 bg-white">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-black text-white grid place-items-center text-sm">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    className="px-3 py-2 rounded ring-1 ring-gray-200 hover:bg-gray-50 text-sm"
                    onClick={() => {
                      setOpen(false);
                      navigate("/orders");
                    }}
                  >
                    Order History
                  </button>
                  {user.role === "admin" && (
                    <button
                      className="px-3 py-2 rounded ring-1 ring-gray-200 hover:bg-gray-50 text-sm"
                      onClick={() => {
                        setOpen(false);
                        navigate("/admin");
                      }}
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    className="col-span-2 px-3 py-2 rounded ring-1 ring-red-200 text-red-600 hover:bg-red-50 text-sm"
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
              className="px-3 py-2 rounded hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/rings"
              className="mt-1 px-3 py-2 rounded hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Rings
            </NavLink>
            <NavLink
              to="/gemstones"
              className="mt-1 px-3 py-2 rounded hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Gemstones
            </NavLink>

            {/* Actions */}
            <NavLink
              to="/track"
              className="mt-1 px-3 py-2 rounded hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Track Order
            </NavLink>
            <NavLink
              to="/cart"
              className="mt-1 px-3 py-2 rounded hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Cart{" "}
              {totalQty > 0 && (
                <span className="ml-2 inline-flex items-center justify-center text-[10px] leading-none px-1.5 py-1 rounded-full bg-black text-white">
                  {totalQty}
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

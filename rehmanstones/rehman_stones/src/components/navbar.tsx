import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext"; // <-- make sure you added the CartProvider I shared

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalQty } = useCart(); // live cart count

  const linkBase = "px-3 py-2 rounded transition-colors hover:bg-black/5";
  const active = "bg-black text-white hover:bg-black";

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/40 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo (text/image) */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-wide select-none"
        >
          Rehman Stones
        </Link>

        {/* Right: desktop actions */}
        <div className="hidden sm:flex items-center gap-2">
          <NavLink
            to="/track"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? "bg-black/10" : ""}`
            }
          >
            Track Order
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative ${linkBase} ${isActive ? "bg-black/10" : ""}`
            }
            aria-label="Cart"
            title="Cart"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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

          <NavLink
            to="/login"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive ? active : "bg-black text-white hover:opacity-90"
              }`
            }
          >
            Login
          </NavLink>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded border border-black/10 bg-white/40 backdrop-blur-md"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        <div className="sm:hidden border-t border-black/10 bg-white/70 backdrop-blur-md">
          <div className="px-4 py-2 flex flex-col">
            <NavLink
              to="/track"
              className="px-3 py-2 rounded hover:bg-black/5"
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

            <NavLink
              to="/login"
              className="mt-1 px-3 py-2 rounded bg-black text-white hover:opacity-90"
              onClick={() => setOpen(false)}
            >
              Login
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}

// src/components/navbar.tsx
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import InstallAppButton from "./InstallAppButton";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalQty } = useCart();

  const mainLinkBase =
    "relative px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const mainLinkActive = "text-black bg-black/5";
  const mainLinkIdle = "text-gray-700 hover:text-black hover:bg-black/5";

  const actionLinkBase =
    "px-3 py-2 rounded-md transition-colors hover:bg-black/5";

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

          {/* Login CTA */}
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

            {/* Login */}
            <NavLink
              to="/login"
              className="mt-2 px-3 py-2 rounded bg-black text-white text-center hover:opacity-90"
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

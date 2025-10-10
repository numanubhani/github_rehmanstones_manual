import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const title = useMemo(() => {
    if (pathname.startsWith("/admin/orders")) return "Order Management";
    if (pathname.startsWith("/admin/products")) return "Inventory / Products";
    if (pathname.startsWith("/admin/carousel")) return "Carousel Management";
    if (pathname.startsWith("/admin/reports")) return "Reports";
    if (pathname.startsWith("/admin/settings")) return "Admin Settings";
    return "Admin Panel";
  }, [pathname]);

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold">Admin access required</h1>
          <p className="text-gray-600 text-sm">
            Log in with <b>admin@rehmanstones.com</b> (any password in your demo
            Auth) or adjust the check inside <code>AdminLayout.tsx</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Topbar (mobile) */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            className="w-10 h-10 grid place-items-center rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="w-8 h-8 rounded-lg bg-black text-white grid place-items-center text-xs font-bold">A</div>
        </div>
      </div>

      <div className="md:flex md:min-h-[calc(100vh-64px)]">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-64 border-r bg-white flex-shrink-0">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-black to-gray-700 grid place-items-center text-white font-bold shadow-lg">
                  RS
                </div>
                <div>
                  <div className="font-bold text-gray-900">Rehman Stones</div>
                  <div className="text-xs text-gray-500">Admin Console</div>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              <AdminLink to="/admin/orders" label="Orders" icon="orders" />
              <AdminLink to="/admin/products" label="Products" icon="products" />
              <AdminLink to="/admin/carousel" label="Carousel" icon="carousel" />
              <AdminLink to="/admin/reports" label="Reports" icon="reports" />
              <AdminLink to="/admin/settings" label="Settings" icon="settings" />
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Desktop Topbar */}
          <div className="sticky top-0 z-10 hidden md:block bg-white border-b shadow-sm">
            <div className="h-16 px-6 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Admin</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-black to-gray-700 text-white grid place-items-center text-sm font-bold shadow-md">
                  A
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-black to-gray-700 grid place-items-center text-white font-bold shadow-lg">
                  RS
                </div>
                <div>
                  <div className="font-bold text-gray-900">Rehman Stones</div>
                  <div className="text-xs text-gray-500">Admin Console</div>
                </div>
              </div>
              <button
                className="w-10 h-10 grid place-items-center rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-1" onClick={() => setOpen(false)}>
              <AdminLink to="/admin/orders" label="Orders" icon="orders" />
              <AdminLink to="/admin/products" label="Products" icon="products" />
              <AdminLink to="/admin/carousel" label="Carousel" icon="carousel" />
              <AdminLink to="/admin/reports" label="Reports" icon="reports" />
              <AdminLink to="/admin/settings" label="Settings" icon="settings" />
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

function AdminLink({ to, label, icon }: { to: string; label: string; icon?: "orders" | "products" | "carousel" | "reports" | "settings" }) {
  const Icon = icon ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path
        d={
          icon === "orders"
            ? "M4 7h16v3H4zM4 12h16v3H4zM4 17h16v3H4z"
            : icon === "products"
            ? "M4 7h6v6H4zM14 7h6v10h-6zM4 15h6v2H4z"
            : icon === "carousel"
            ? "M3 7h18v10H3zM7 9v6M17 9v6"
            : icon === "reports"
            ? "M4 19h16M6 16l4-6 3 4 5-8"
            : "M5 7h14M5 12h10M5 17h6"
        }
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : null;
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
          isActive 
            ? "bg-black text-white shadow-md" 
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {Icon}
      <span>{label}</span>
    </NavLink>
  );
}

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const link =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-black/5";
const active = "bg-black text-white hover:bg-black";

export default function AdminLayout() {
  const { user } = useAuth();
  const isAdmin = user?.email === "admin@rehmanstones.com";

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
    <div className="min-h-[calc(100vh-64px)] grid grid-cols-[240px_1fr] bg-gray-50">
      {/* Sidebar */}
      <aside className="border-r bg-gray-100 px-3 py-4">
        <div className="px-2 py-2 font-bold tracking-wide">Admin Panel</div>
        <nav className="mt-2 flex flex-col gap-1">
          <AdminLink to="/admin/orders" label="Order Management" />
          <AdminLink to="/admin/products" label="Inventory / Products" />
          <AdminLink to="/admin/carousel" label="Carousel Management" />
          <AdminLink to="/admin/reports" label="Reports" />
          <AdminLink to="/admin/settings" label="Admin Settings" />
        </nav>
      </aside>

      {/* Content */}
      <main className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AdminLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${link} ${isActive ? active : ""}`}
    >
      <span>{label}</span>
    </NavLink>
  );
}

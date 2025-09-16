import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import Rings from "./pages/Rings";
import Gemstones from "./pages/Gemstones";
import Track from "./pages/Track";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import ProductPage from "./pages/ProductPage";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";

import AdminLayout from "./admin/AdminLayout";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminCarousel from "./admin/pages/AdminCarousel";
import AdminReports from "./admin/pages/AdminReports";
import AdminSettings from "./admin/pages/AdminSettings";
import SiteModal from "./components/SiteModal";
import OrderHistory from "./admin/pages/OrderHistory"; // 👈 add this

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Global admin-controlled promo modal */}
      <SiteModal />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rings" element={<Rings />} />
          <Route path="/gemstones" element={<Gemstones />} />
          <Route path="/track" element={<Track />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} /> {/* 👈 new */}
          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="carousel" element={<AdminCarousel />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

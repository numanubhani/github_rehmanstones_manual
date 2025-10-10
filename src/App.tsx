import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { FloatingWhatsApp } from "./components/WhatsAppButton";
import Home from "./pages/Home";
import Rings from "./pages/Rings";
import Gemstones from "./pages/Gemstones";
import Track from "./pages/Track";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import ProductPage from "./pages/ProductPage";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import ReturnPolicy from "./pages/ReturnPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";

import AdminLayout from "./admin/AdminLayout";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminCarousel from "./admin/pages/AdminCarousel";
import AdminReports from "./admin/pages/AdminReports";
import AdminSettings from "./admin/pages/AdminSettings";
import SiteModal from "./components/SiteModal";
import OrderHistory from "./admin/pages/OrderHistory";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      {/* Global admin-controlled promo modal */}
      <SiteModal />

      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rings" element={<Rings />} />
          <Route path="/gemstones" element={<Gemstones />} />
          <Route path="/track" element={<Track />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          
          {/* New pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          
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
      
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

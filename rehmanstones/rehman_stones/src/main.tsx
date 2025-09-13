// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import App from "./App";
import "./style.css";
import { AuthProvider } from "./context/AuthContext";
import { registerSW } from "virtual:pwa-register";
// If you use sonner toasts, you can show messages:
// import { toast } from "sonner";

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Auto-refresh to update. If you prefer a prompt, remove this line.
    updateSW(true);
    // toast("New version available. Updating…");
  },
  onOfflineReady() {
    // toast.success("App is ready to work offline");
    console.log("PWA ready to work offline");
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import App from "./App";
import "./style.css";
import { AuthProvider } from "./context/AuthContext";

// NEW
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          {/* Toasts render here */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 2200,
              style: { fontSize: "14px" },
              success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

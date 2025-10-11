import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import "./style.css";

import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {/* Mount once, globally */}
              <Toaster
              position="bottom-right"
              containerStyle={{ zIndex: 999999 }}
              toastOptions={{
                style: {
                  borderRadius: "10px",
                  background: "#111",
                  color: "#fff",
                },
                success: { iconTheme: { primary: "#22c55e", secondary: "#111" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#111" } },
              }}
            />
            <App />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

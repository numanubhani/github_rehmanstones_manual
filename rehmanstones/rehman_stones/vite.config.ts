// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",            // prompt user to install
      includeAssets: [
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/maskable-192.png",
        "icons/maskable-512.png",
        "favicon.svg",
        "robots.txt"
      ],
      manifest: {
        name: "Rehman Stones",
        short_name: "RStones",
        description: "Handcrafted 925 silver rings & gemstones",
        start_url: "/",                   // no dynamic origin required
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#111111",
        icons: [
          { src: "/icons/icon-192.png",     sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png",     sizes: "512x512", type: "image/png" },
          { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff2}"]
      }
    })
  ]
});

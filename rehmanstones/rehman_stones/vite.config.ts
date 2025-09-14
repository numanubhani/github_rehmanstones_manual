// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "/favicon.ico",
        "/icons/icon-192.png",
        "/icons/icon-512.png",
        "/icons/maskable-192.png",
        "/icons/maskable-512.png"
      ],

      manifest: {
        name: "Rehman Stones",
        short_name: "RehmanStones",
        start_url: "/",
        display: "standalone",
        theme_color: "#111111",
        background_color: "#ffffff",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any"
          }
        ]
      },

      workbox: {
        // allow up to 5MB in precache (optional safeguard)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // don’t precache jpg/jpeg (big photos); we’ll cache them at runtime
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,avif,woff,woff2}"
        ],

        // runtime image caching (so jpg/jpeg still get cached in the browser)
        runtimeCaching: [
          {
            // TS-safe param type for Node build (no DOM types here)
            urlPattern: (ctx: { request: { destination?: string } }) =>
              ctx.request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],

  server: { host: true, port: 5173 }
});

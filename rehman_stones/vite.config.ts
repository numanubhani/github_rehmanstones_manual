// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "robots.txt",
        "apple-touch-icon.png",
        "/icons/icon-192.png",
        "/icons/icon-512.png",
        "/icons/maskable-192.png",
        "/icons/maskable-512.png",
      ],
      manifest: {
        name: "Rehman Stones",
        short_name: "Stones",
        description: "Silver rings & gemstones",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#111111",
        background_color: "#f5f5f5",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // prevent build failure from large assets; we runtime-cache JPGs instead
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,avif,woff,woff2}"
        ],
        navigateFallback: "/index.html",
        runtimeCaching: [
          // cache images (including jpg/jpeg) at runtime
          {
            urlPattern: (ctx: { request: { destination?: string } }) =>
              ctx.request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // cache scripts/styles/fonts with SWR (no 'self' or 'origin' needed)
          {
            urlPattern: (ctx: { request: { destination?: string } }) =>
              ["script", "style", "font"].includes(
                String(ctx.request.destination)
              ),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "static-resources" },
          },
        ],
      },
    }),
  ],
});

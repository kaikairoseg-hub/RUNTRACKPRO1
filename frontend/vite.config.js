import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt", // manual update confirmation — new SW waits in "waiting" state
      strategies: "generateSW",
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      manifest: {
        name: "RunTrackPro",
        short_name: "RunTrackPro",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#FC4C02",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          leaflet: ["leaflet", "react-leaflet"],
          recharts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
          socket: ["socket.io-client"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api and /socket.io requests to the backend during development
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:4000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

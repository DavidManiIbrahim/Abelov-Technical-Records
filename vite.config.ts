import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Abelov Technical Records',
        short_name: 'Abelov',
        description: 'Technical records management system for Abelov International Ltd',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'abelov-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'abelov-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'abelov-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

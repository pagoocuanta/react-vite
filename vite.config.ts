import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "/", // ✅ Add this line
  server: {
    host: true,
    port: parseInt(process.env.PORT ?? process.env.VITE_DEV_PORT ?? '5173', 10),
    hmr: { overlay: false },
    proxy: {
      "/api": "http://localhost:8080",
    },
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  },
  build: { outDir: "dist/spa" },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

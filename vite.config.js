import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  // Normalize sourcemap source paths so Vite/Rollup can resolve original
  // locations when reporting errors. We enable production sourcemaps and
  // rewrite relative source paths into absolute paths based on the map
  // location. This fixes "Can't resolve original location of error".
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        sourcemapPathTransform: (sourcePath, mapPath) => {
          // If the source path is already absolute or a URL, leave it.
          if (
            /^(?:[a-z]+:)?\/\//i.test(sourcePath) ||
            path.isAbsolute(sourcePath)
          ) {
            return sourcePath;
          }
          // Resolve the relative path against the map file location.
          try {
            return path.resolve(path.dirname(mapPath), sourcePath);
          } catch (e) {
            return sourcePath;
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api/v1": {
        target: "https://intelitalk-backend.onrender.com",
        changeOrigin: true,
      },
    },
  },
});

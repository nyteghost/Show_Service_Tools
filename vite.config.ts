import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative asset paths so the built site works from any folder (GitHub Pages, S3, a file share…).
  base: "./",
  plugins: [react()],
  build: { target: "esnext" },
  optimizeDeps: { exclude: ["pdfjs-dist"] },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});

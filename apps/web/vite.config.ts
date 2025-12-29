/**
 * @file vite.config.ts
 * @description Vite configuration for the React frontend. Configures React plugin
 * and path aliases for cleaner imports using the @ prefix.
 */

import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

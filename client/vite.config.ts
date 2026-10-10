import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function gitHubPagesSpaPlugin() {
  return {
    name: "github-pages-spa",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      const indexPath = path.join(distDir, "index.html");
      const notFoundPath = path.join(distDir, "404.html");
      const noJekyllPath = path.join(distDir, ".nojekyll");

      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
      }
      fs.writeFileSync(noJekyllPath, "");
    },
  };
}

export default defineConfig(() => ({
  base: process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS ? "/ITI-Apprenticeship-Trade-Job-Matching-Portal/" : "/"),
  plugins: [react(), gitHubPagesSpaPlugin()],
  resolve: {
    alias: {
      "@iti-portal/shared": path.resolve(__dirname, "../shared/src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // relative asset URLs: works on static hosts AND inside the Tauri bundle
  base: "./",
  plugins: [react(), tailwindcss()],
});

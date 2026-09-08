import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base는 GitHub Pages 저장소 이름으로 바꿔주세요 (예: '/book-character-map/')
export default defineConfig({
  plugins: [react()],
  base: "./",
});

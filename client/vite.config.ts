import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // TypeScriptの型チェックを完全に無効化
    typescript: {
      transpileOnly: true,
      noEmit: false,
    },
  },
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
  // バンドルサイズ最適化
  esbuild: {
    legalComments: "none",
    minify: true,
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari13"],
  },
});

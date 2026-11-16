import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    //bundle map, only when asked for: `npm run analyze` builds in a mode
    //called "analyze". a normal `npm run build` skips it, so CI and deploys
    //never pay for it
    mode === "analyze" &&
      visualizer({
        filename: "stats.html",
        template: "treemap",
        gzipSize: true,
        open: false,
      }),
  ],
}));

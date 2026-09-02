import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/*
 * The build month is baked in as a constant rather than read from the clock at
 * render time. Experience needs "now" to size the current tenure, and a
 * new Date() during render would make the prerendered HTML disagree with what
 * the client produces on any later day.
 */
const buildMonth = new Date().toISOString().slice(0, 7);

export default defineConfig({
  define: {
    __BUILD_MONTH__: JSON.stringify(buildMonth),
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
});

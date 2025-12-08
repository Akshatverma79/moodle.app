import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/moodle-api': {
        target: 'http://lms.kiet.edu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/moodle-api/, '/moodle'),
      },
    },
  },
});

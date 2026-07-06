import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
    proxy: {
      '/api': 'http://localhost:4000',
      '/exam': 'http://localhost:4000',
    },
  },

  // Pre-bundle heavy deps so Vite doesn't crawl them on every cold start
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, always needed
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          'vendor-supabase': ['@supabase/supabase-js'],

          // UI motion — used across many pages
          'vendor-motion': ['framer-motion'],

          // Data & state
          'vendor-query': ['@tanstack/react-query'],

          // Heavy chart / viz — only needed on Progress page
          'vendor-charts': ['recharts'],

          // Radix primitives — large but tree-shaken per component
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-popover',
            '@radix-ui/react-scroll-area',
          ],
        },
      },
    },
  },
}));


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3030,
    open: false,
    cors: true,
    // Enable SPA fallback for client-side routing
    historyApiFallback: true,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Optimizations for mobile and performance
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  build: {
    // Optimize for mobile devices
    target: ['es2020', 'chrome80', 'safari13'],
    minify: 'terser',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    // Advanced rollup optimizations
    rollupOptions: {
      output: {
        // More granular code splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // Charts and utilities
            if (id.includes('recharts') || id.includes('date-fns') || id.includes('qrcode')) {
              return 'utils-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          
          // Feature-based chunking
          if (id.includes('/pages/Admin')) {
            return 'admin-pages';
          }
          if (id.includes('/pages/Barbearia')) {
            return 'barbearia-pages';
          }
          if (id.includes('/pages/Cliente')) {
            return 'cliente-pages';
          }
          
          // Component chunks
          if (id.includes('/components/ui')) {
            return 'ui-components';
          }
        },
        // Optimize chunk names for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType ?? '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    // Terser optimizations for mobile
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
      },
      mangle: {
        safari10: true,
      },
    },
    // Source maps for debugging
    sourcemap: mode === 'development',
  },
  // CSS optimizations
  css: {
    devSourcemap: mode === 'development',
  },
  // Performance optimizations
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
}));

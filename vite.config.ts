import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                // Each top-level node_module gets its own chunk
                return id
                  .toString()
                  .split('node_modules/')[1]
                  .split('/')[0]
                  .toString();
              }
            }
          }
        },
        // Optional: increase the warning limit if needed
        chunkSizeWarningLimit: 1000 // in KB
      }
    };
});

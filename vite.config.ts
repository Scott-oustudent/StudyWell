import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import * as path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // FIX: Set base to './' to ensure relative paths for static hosting (like Netlify).
    // This allows the browser to find assets relative to the index.html file.
    base: './',

    server: {
      port: 3000, host: '0.0.0.0', proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },

    plugins: [react()], define: {
      'process.env.APP_KEY': JSON.stringify(env.APP_KEY),
      'process.env.SENDBIRD_APP_KEY': JSON.stringify(env.SENDBIRD_APP_KEY),
    }, resolve: {
      alias: [{
        find: '@',
        replacement: path.resolve(__dirname, './src')
      },],
    },
  };
});

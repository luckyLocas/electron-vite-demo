import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['better-sqlite3'],
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: [
        { find: '@src', replacement: resolve('src/renderer/src') },
        /** 此配置用于解决引用^antd.less样式报错的问题 */
        { find: /^~/, replacement: '' },
      ],
    },
    plugins: [react()],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    base: '/',
    server: {
      proxy: {
        // 以/api开头的请求
        '/api': {
          target: 'http://localhost:6688',
          changeOrigin: true,
          // rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
  },
});

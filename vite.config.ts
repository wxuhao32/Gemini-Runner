
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 关键设置：使用相对路径 './' 而不是默认的 '/'
  // 这确保了应用可以在 Render 的任何子路径下运行
  // 同时也确保了在手机 WebView (file:// 协议) 中能正确加载资源
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    host: true, // 允许局域网访问，方便手机调试
    port: 5173
  }
});

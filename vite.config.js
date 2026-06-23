import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 💡 [최종 교정]: 뒤에 확장자 .ts를 빼고, 팀원이 임포트한 양식(@/utils/cn) 그대로를 통째로 src/lib 폴더(또는 파일) 경로로 인식하도록 설정합니다.
      '@/utils/cn': path.resolve(__dirname, './src/lib/utils'),
    },
  },
  // 💡 백엔드 Spring Boot(8383 포트) 연동용 프록시 (유지)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8383',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

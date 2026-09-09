import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // <-- 이 줄을 반드시 추가해야 경로를 정상적으로 찾습니다.
})

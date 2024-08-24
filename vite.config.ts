import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.CLIENT_ID': JSON.stringify(env.CLIENT_ID),
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.OUTLOOK_CLIENT_ID': JSON.stringify(env.OUTLOOK_CLIENT_ID),
      'process.env.OUTLOOK_TENENT_ID': JSON.stringify(env.OUTLOOK_TENENT_ID)
    },
    plugins: [react()],
  }
})

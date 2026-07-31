import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'recharts'
            if (id.includes('firebase')) return 'firebase'
            if (id.includes('react-router-dom')) return 'router'
            if (id.includes('react-hot-toast')) return 'toast'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('react-icons')) return 'icons'
            if (id.includes('uuid')) return 'uuid'
            return 'vendor'
          }
          if (id.includes('/src/pages/Analytics.jsx')) return 'analytics'
          if (id.includes('/src/pages/Settings.jsx')) return 'settings'
          if (id.includes('/src/pages/Profile.jsx')) return 'profile'
          if (id.includes('/src/pages/Transactions.jsx')) return 'transactions'
          if (id.includes('/src/pages/Dashboard.jsx')) return 'dashboard'
        },
      },
    },
  },
  server: {
    port: 5173,
  },
})

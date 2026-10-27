import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 👈 ඔයාගේ ප්‍රොජෙක්ට් එකේ තියෙන පරණ නිවැරදි එක
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
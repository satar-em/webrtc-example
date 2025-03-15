import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        mkcert()
    ],
    base: "",
    // mode:"production",
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                ws: true,
                headers: {
                    Host: "192.168.1.202:5173"
                }
            }
        }
    },
})

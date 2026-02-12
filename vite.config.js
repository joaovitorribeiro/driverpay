import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: true,
        port: Number(process.env.VITE_PORT) || 5173,
        strictPort: true,
        hmr: {
            host: process.env.VITE_HMR_HOST || 'localhost',
            port: Number(process.env.VITE_PORT) || 5173,
        },
        warmup: {
            clientFiles: [
                'resources/js/app.jsx',
                'resources/js/Pages/**/*.jsx',
            ],
        },
        watch: {
            ignored: [
                '**/storage/**',
                '**/bootstrap/cache/**',
                '**/vendor/**',
            ],
        },
    },
});

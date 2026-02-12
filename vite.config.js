import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    define: {
        __VITE_USE_POLLING__: JSON.stringify(process.env.VITE_USE_POLLING || ''),
    },
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
            usePolling:
                process.env.VITE_USE_POLLING === '1' ||
                process.env.VITE_USE_POLLING === 'true',
            interval:
                process.env.VITE_USE_POLLING === '1' ||
                process.env.VITE_USE_POLLING === 'true'
                    ? 250
                    : undefined,
            ignored: [
                '**/storage/**',
                '**/bootstrap/cache/**',
                '**/vendor/**',
            ],
        },
    },
});

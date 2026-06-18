import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: '_build',
        rollupOptions: {
            input: './_js/script.js',
            output: {
                entryFileNames: 'bundle.js',
                format: 'iife'
            }
        },
        sourcemap: false,
        minify: false,
        emptyOutDir: false
    },
    esbuild: {
        target: 'es2020'
    }
});

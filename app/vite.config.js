import { defineConfig,  loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import preloadPlugin from 'vite-preload/plugin';
import {makeAssetName} from "./resources/js/utils.js";
import path from 'path';

export default defineConfig(({mode }) => {
    return {
        build: {
            rollupOptions: {
                output: {
                    manualChunks: id => makeAssetName(id, mode),
                    compact: true,
                    generatedCode: {
                        preset: 'es2015',
                        arrowFunctions: true,
                        symbols: true
                    },
                    interop: 'auto',
                    esModule: true,
                },
                external: './ziggy',
            },
            target: 'esnext',
            minify: 'terser'
        },
        mode,
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true,
                    api: 'modern-compiler',
                    additionalData: `
                        @import "bootstrap/scss/bootstrap";
                    `,
                }
            }
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'resources'),
                'ziggy': path.resolve(__dirname, "vendor/tightenco/ziggy/dist/index.esm.js"),
                '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
                '~vuetify': path.resolve(__dirname, 'node_modules/vuetify'),
                '@components': '/resources/js/Components',
                '@layouts': '/resources/js/Layouts',
                '@pages': '/resources/js/Pages',
            }
        },
        plugins: [
            vue({
                template: {
                    transformAssetUrls: {
                        base: null,
                        includeAbsolute: false,
                    },
                },
            }),
            vuetify({ autoImport: true }),
            laravel({
                input: ['resources/css/app.scss', 'resources/js/app.js'],
                refresh: true,
            }),
            preloadPlugin(),

        ],
    }
});

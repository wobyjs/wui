import { defineConfig, PluginOption } from 'vite'
import tailwindcss from '@tailwindcss/vite'
// Import from the built package instead of source to avoid version conflicts
import { testPlugin } from '@woby/vite-plugin-test'
import { snapshotPlugin } from 'vite-plugin-snapshot'
import path from "path"

const isDevMode = process.argv.includes('dev') || (process.argv.includes('--mode') && process.argv.includes('dev'))

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["index.html"],
            name: "@woby/wui",
            formats: [/*'cjs', '*/'es'/*, 'umd'*/],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        outDir: './build',
        sourcemap: false,
    },
    esbuild: {
        jsx: 'automatic',
    },
    plugins: [
        tailwindcss() as PluginOption,
        testPlugin() as PluginOption,
        snapshotPlugin() as PluginOption,
    ],
    resolve: {
        alias: {
            'woby': process.argv.includes('dev') ? path.resolve(__dirname, '../woby/src') : 'woby',
            '@woby/wui': path.resolve(__dirname, './src'),
            '@woby/chk': process.argv.includes('dev') ? path.resolve(__dirname, '../chk/src') : '@woby/chk',
            'vite-plugin-snapshot': isDevMode ? path.resolve(__dirname, '../../vite-plugin-snapshot/index.js') : 'vite-plugin-snapshot',
            '@woby/chk/index.css': isDevMode ? path.resolve(__dirname, '../chk/dist/index.css') : '@woby/chk/index.css',
            '@woby/vite-plugin-test': path.resolve(__dirname, '../vite-plugin-test/src/index.ts'),
        }
    },
    server: {
        port: 5173,
        // Allow serving files from the root directory
        fs: {
            allow: ['..', '../..']
        }
    }
})

export default config
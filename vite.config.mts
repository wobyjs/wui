import { defineConfig, PluginOption } from 'vite'
import tailwindcss from '@tailwindcss/vite'
// import path from 'path'
import fs from 'node:fs';
import path from 'node:path';

import { snapshotPlugin } from 'vite-plugin-snapshot'
import { testPlugin } from '@woby/vite-plugin-test'

// Plugin to rewrite @woby/use imports to @woby/use/ssr for SSR builds
// NOTE: This plugin is disabled because @woby/use/ssr does not export browser-only hooks
// like useClickAway, useEventListener, useViewportSize, etc.
// Keep @woby/use/browser imports as-is for browser environments
const ssrImportPlugin = (): PluginOption => ({
    name: 'ssr-import-rewrite',
    renderChunk(code) {
        // Only rewrite bare @woby/use imports (not /browser or /ssr)
        return code.replace(/@woby\/use(["'])(?!\/)/g, '@woby/use/browser$1')
    }
})

const chkJsonUrl = new URL('./chk.json', import.meta.url);

// let chkConfig: any = {};
// try {
//     const raw = fs.readFileSync(chkJsonUrl, 'utf8');
//     chkConfig = JSON.parse(raw);
// } catch (err) {
//     console.warn('Error reading chk.json configuration:', err);
//     chkConfig = {};
// }

const isDevMode = process.argv.includes('dev') || process.argv.includes('--dev') || (process.argv.includes('--mode') && process.argv.includes('dev'))

const config = defineConfig({
    build: {
        minify: 'esbuild',
        lib: {
            entry: ["./src/index.tsx"],
            name: "@woby/wui",
            formats: ['es'],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: ['woby', 'woby/jsx-runtime', 'oby', 'woby/jsx-runtime', 'nanoid', /^@woby\/(.*)/],
            output: {
                globals: {
                    'nanoid': 'nanoid',
                    'woby': 'woby',
                    'woby/jsx-runtime': 'woby/jsx-runtime',
                    '@woby/use': '@woby/use',
                }
            }
        }
    },
    esbuild: {
        jsx: 'automatic',
    },
    plugins: [
        ssrImportPlugin(),
        tailwindcss() as any as PluginOption,
        snapshotPlugin() as any as PluginOption,
        testPlugin() as any as PluginOption,
    ],
    resolve: {
        alias: {
            'woby/jsx-dev-runtime': process.argv.includes('dev') || process.argv.includes('--dev') || (process.argv.includes('--mode') && process.argv.includes('dev')) ? path.resolve('../../@woby/woby/src/jsx/runtime') : 'woby/jsx-dev-runtime',
            'woby/jsx-runtime': process.argv.includes('dev') || process.argv.includes('--dev') || (process.argv.includes('--mode') && process.argv.includes('dev')) ? path.resolve('../../@woby/woby/src/jsx/runtime') : 'woby/jsx-runtime',
            'woby': process.argv.includes('dev') || process.argv.includes('--dev') || (process.argv.includes('--mode') && process.argv.includes('dev')) ? path.resolve('../../@woby/woby/src') : 'woby',
            '@woby/styled': process.argv.includes('dev') || process.argv.includes('--dev') || (process.argv.includes('--mode') && process.argv.includes('dev')) ? path.resolve('../styled/src') : '@woby/styled',
            '@woby/use': process.argv.includes('dev') || process.argv.includes('--dev') || (process.argv.includes('--mode') && process.argv.includes('dev')) ? path.resolve('../use/src') : '@woby/use',
            // '@woby/chk': process.argv.includes('dev') || process.argv.includes('--dev') || (process.argv.includes('--mode') && process.argv.includes('dev')) ? path.resolve('./src') : 'chk',
            '@woby/chk': process.argv.includes('dev') || process.argv.includes('--dev') || (process.argv.includes('--mode') && process.argv.includes('dev')) ? path.resolve(__dirname, '../chk/src') : '@woby/chk',
            'vite-plugin-snapshot': isDevMode ? path.resolve(__dirname, '../../vite-plugin-snapshot/index.js') : 'vite-plugin-snapshot',
            '@woby/chk/index.css': path.resolve(__dirname, '../chk/src/index.css'),
            // '@woby/vite-plugin-test': path.resolve('../../vite-plugin-test/src/index.ts'),
        }
    }
})



export default config

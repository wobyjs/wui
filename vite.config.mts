import { defineConfig, PluginOption } from 'vite'
import tailwindcss from '@tailwindcss/vite'
// import path from 'path'
import fs from 'node:fs';
import path from 'node:path';

import { snapshotPlugin } from 'vite-plugin-snapshot'
import { testPlugin } from '../vite-plugin-test/src/index.ts'

const chkJsonUrl = new URL('./chk.json', import.meta.url);

// let chkConfig: any = {};
// try {
//     const raw = fs.readFileSync(chkJsonUrl, 'utf8');
//     chkConfig = JSON.parse(raw);
// } catch (err) {
//     console.warn('Error reading chk.json configuration:', err);
//     chkConfig = {};
// }

const isDevMode = process.argv.includes('dev') || (process.argv.includes('--mode') && process.argv.includes('dev'))

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["./src/index.tsx"],
            name: "@woby/wui",
            formats: ['es'],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        emptyOutDir: false,
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
        tailwindcss() as any as PluginOption,
        snapshotPlugin() as any as PluginOption,
        testPlugin() as any as PluginOption,
    ],
    resolve: {
        alias: {
            // 'woby/jsx-dev-runtime': process.argv.includes('dev') ? path.resolve('../../woby/src/jsx/runtime') : 'woby',
            // 'woby/jsx-runtime': process.argv.includes('dev') ? path.resolve('../../woby/src/jsx/runtime') : 'woby',
            'woby': process.argv.includes('dev') ? path.resolve('../../woby/src') : 'woby',
            '@woby/styled': process.argv.includes('dev') ? path.resolve('../styled/src') : '@woby/styled',
            '@woby/use': process.argv.includes('dev') ? path.resolve('../use/src') : '@woby/use',
            // '@woby/chk': process.argv.includes('dev') ? path.resolve('./src') : 'chk',
            '@woby/chk': process.argv.includes('dev') ? path.resolve(__dirname, '../chk/src') : '@woby/chk',
            'vite-plugin-snapshot': isDevMode ? path.resolve(__dirname, '../../vite-plugin-snapshot/index.js') : 'vite-plugin-snapshot',
            '@woby/chk/index.css': isDevMode ? path.resolve('../dist/index.css') : '@woby/chk/index.css',
            '@woby/vite-plugin-test': path.resolve('../../vite-plugin-test/src/index.ts'),
        }
    }
})



export default config

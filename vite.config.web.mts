import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["index.html"],
            name: "woby-wui",
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
        tailwindcss(),
    ],
    resolve: {
        alias: {
            'woby/jsx-dev-runtime': process.argv.includes('dev') ? path.resolve('../../woby/src/jsx/runtime') : 'woby',
            'woby/jsx-runtime': process.argv.includes('dev') ? path.resolve('../../woby/src/jsx/runtime') : 'woby',
            'woby': process.argv.includes('dev') ? path.resolve('../../woby/src') : 'woby',
            '@woby/wui': path.resolve('../wui/src'),
        }
    }
})



export default config

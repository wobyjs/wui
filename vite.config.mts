import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["./src/index.tsx"],
            name: "woby-wui",
            formats: ['es'],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        emptyOutDir: false,
        sourcemap: true,
        rollupOptions: {
            external: ['woby', 'woby/jsx-runtime', 'oby', 'woby/jsx-runtime', 'nanoid',
                '@woby/modal', '@woby/use', '@woby/styled', 'use-woby'],
            output: {
                globals: {
                    'nanoid': 'nanoid',
                    'woby': 'woby',
                    'woby/jsx-runtime': 'woby/jsx-runtime',
                    'use-woby': 'use-woby',
                }
            }
        }
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
            '@woby/styled': process.argv.includes('dev') ? path.resolve('../styled/src') : '@woby/styled',
            'woby-styled': process.argv.includes('dev') ? path.resolve('../styled/src') : '@woby/styled',
            'use-woby': process.argv.includes('dev') ? path.resolve('../use/src') : '@woby/use'
        }
    }
})



export default config

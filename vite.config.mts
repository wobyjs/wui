import { defineConfig } from 'vite'

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["./src/index.tsx"],
            name: "woby-wui",
            formats: ['es'],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        sourcemap: true,
        rollupOptions: {
            external: ['woby', 'woby/jsx-runtime', 'oby', 'woby/jsx-runtime', 'nanoid',
                'woby-modal', 'use-woby', 'woby-styled',],
            output: {
                globals: {
                    'nanoid': 'nanoid',
                    'woby': 'woby',
                    'woby/jsx-runtime': 'woby/jsx-runtime',
                }
            }
        }
    },
    esbuild: {
        jsx: 'automatic',
    },
    plugins: [],
    resolve: {
        alias: {
            'woby/jsx-dev-runtime': 'woby',
            'woby/jsx-runtime': 'woby',
            'woby-styled': process.argv.includes('dev') ? path.resolve('../woby-styled/src') : 'woby-styled'
        }
    }
})



export default config

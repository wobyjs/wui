import { defineConfig } from 'vite'
import path from 'path'
import dts from 'vite-plugin-dts'
import svgr from "vite-plugin-svgr"

// import svgLoader from 'vite-svg-loader'

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["./src/lib/index.tsx"],
            name: "woby-list",
            formats: ['cjs', 'es', 'umd'],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        sourcemap: true,
        rollupOptions: {
            external: ['woby', 'woby/jsx-runtime', 'oby', 'woby/jsx-runtime', 'nanoid'],
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
    plugins: [
        // svgLoader({ defaultImport: 'component' }),
        svgr({
            // Set it to `true` to export React component as default.
            // Notice that it will override the default behavior of Vite.
            exportAsDefault: false,

            // svgr options: https://react-svgr.com/docs/options/
            svgrOptions: {
                // ...
            },

            // esbuild options, to transform jsx to js
            esbuildOptions: {
                // ...
            },

            //  A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should include. By default all svg files will be included.
            include: "**/*.svg",

            //  A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should ignore. By default no files are ignored.
            exclude: "",
        }),
        dts({ entryRoot: './src/lib', outputDir: './dist/types' })
    ],
    resolve: {
        alias: {
            // '~': path.resolve(__dirname, 'src'),
            // 'woby/jsx-dev-runtime': process.argv.includes('dev') ? path.resolve('../woby/src/jsx/runtime') : 'woby/jsx-dev-runtime',
            // 'woby/jsx-runtime': process.argv.includes('dev') ? path.resolve('../woby/src/jsx/runtime') : 'woby/jsx-runtime',
            // 'woby': process.argv.includes('dev') ? path.resolve('../woby/src') : 'woby'
        }
    }
})



export default config

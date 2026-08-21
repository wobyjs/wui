/**
 * Types for Vite's `?raw` import suffix, which yields a module's file contents as
 * a string. Declared locally rather than via `/// <reference types="vite/client" />`
 * because vite is hoisted to the workspace root and does not resolve from here.
 */
declare module '*?raw' {
    const content: string
    export default content
}

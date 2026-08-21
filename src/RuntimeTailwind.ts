/**
 * Runtime Tailwind compilation for shadow DOM.
 *
 * ## Why this exists
 *
 * Tailwind v4 emits utilities from a **build-time source scan**. The Editor's
 * property panel lets a user type a class at runtime, which the scanner can never
 * have seen, so the class silently does nothing. `@source inline(...)` in
 * `src/input.css` fixes that for an enumerated set, but it cannot cover the open
 * set of arbitrary values -- fractional percentage widths, one-off hex colours,
 * bespoke grid templates.
 *
 * (Utility-shaped text is spelled out in prose throughout these comments rather
 * than written literally. Tailwind's scanner reads comments too, so a literal
 * example here would be silently baked into every consumer's bundle -- and, while
 * this module was being built, into the very stylesheet used to test it.)
 *
 * Tailwind's own answer for that is `@tailwindcss/browser` (the Play CDN), which
 * watches the DOM and compiles as classes appear. It is unusable here for one
 * reason: **it scans `document` only, and every wui component lives in a shadow
 * root.** This module is the same idea with the two pieces that were missing --
 * a scanner that descends into shadow roots, and an injection path that reaches
 * them.
 *
 * ## How it works
 *
 * 1. `compile()` from the `tailwindcss` core package (pure JS, no Node builtins,
 *    so it runs in the browser as-is) builds a compiler from a small CSS prelude.
 * 2. A walker collects every `class` token in `document` and, recursively, in
 *    every open shadow root.
 * 3. `compiler.build(candidates)` turns that set into CSS.
 * 4. The CSS is written into a single `<style>` in `document.head`.
 *
 * Step 4 is the part worth explaining. The obvious move -- pushing a constructed
 * sheet onto each root's `adoptedStyleSheets` -- loses: woby's custom-element
 * layer *assigns* `shadowRoot.adoptedStyleSheets = allSheets` wholesale, both when
 * a root is created and again from `updateAllShadowRoots()`, so anything appended
 * from outside gets overwritten on the next style mutation. But that same layer
 * has a `MutationObserver` on `document.head` with `characterData: true`, and it
 * builds `allSheets` from the text of every `<style>` tag. So writing to a plain
 * `<style>` makes woby propagate the result to every registered shadow root, and
 * to every shadow root created later, using the path it already maintains.
 *
 * ## Cost
 *
 * This duplicates the build pipeline in the browser: ~280 KB of compiler plus the
 * theme CSS, and a full re-parse of document CSS by woby on each write. It is a
 * development / authoring-surface tool. Do not import it from `src/index.tsx` or
 * from the Editor's own module graph -- start it explicitly from the app that
 * wants it, the way `editor-demo-script.js` does.
 *
 * @example
 * ```ts
 * import { startRuntimeTailwind } from '@woby/wui/src/RuntimeTailwind'
 * const tw = await startRuntimeTailwind()
 * // ... user types an arbitrary height utility into the property panel; it resolves.
 * tw.stop()
 * ```
 *
 * @module RuntimeTailwind
 */

import { compile } from 'tailwindcss'
import themeCss from 'tailwindcss/theme.css?raw'
import utilitiesCss from 'tailwindcss/utilities.css?raw'
import preflightCss from 'tailwindcss/preflight.css?raw'

/**
 * Default CSS entry handed to the compiler.
 *
 * Deliberately *not* `@import "tailwindcss"`: preflight is already in the page
 * from the real build, and re-emitting it here would double every base rule in
 * every shadow root. Only the theme (so `--color-*` and friends resolve) and the
 * utilities layer are needed.
 */
const DEFAULT_CSS = [
    '@layer theme, base, components, utilities;',
    '@import "tailwindcss/theme.css" layer(theme);',
    '@import "tailwindcss/utilities.css" layer(utilities);',
].join('\n')

/** The stylesheets reachable from {@link DEFAULT_CSS}, keyed by import id. */
const BUNDLED: Record<string, string> = {
    'tailwindcss/theme.css': themeCss,
    'tailwindcss/utilities.css': utilitiesCss,
    'tailwindcss/preflight.css': preflightCss,
    './theme.css': themeCss,
    './utilities.css': utilitiesCss,
    './preflight.css': preflightCss,
}

export interface RuntimeTailwindOptions {
    /**
     * CSS entry to compile from. Defaults to theme + utilities only.
     * Anything it imports must be listed in {@link RuntimeTailwindOptions.stylesheets},
     * since there is no filesystem to resolve against.
     */
    css?: string
    /** Extra `@import` targets, keyed by the exact id used in the `@import`. */
    stylesheets?: Record<string, string>
    /** `id` of the injected `<style>`. Defaults to `wui-runtime-tailwind`. */
    styleId?: string
    /**
     * Patch `Element.prototype.attachShadow` so roots are discovered the instant
     * they are created rather than on the next mutation. Off by default: attaching
     * a host to the DOM is itself an observed mutation, and the rescan that follows
     * finds the root and starts observing it, so the chain normally closes on its
     * own. Turn it on only if you hit a root that is created *and* populated with
     * no light-DOM mutation in between.
     */
    hookAttachShadow?: boolean
    /** Called instead of `console.warn` when a build throws. */
    onError?: (err: unknown) => void
}

export interface RuntimeTailwindHandle {
    /** Force an immediate rescan + rebuild, bypassing the frame coalescer. */
    refresh(): void
    /** Disconnect every observer and remove the injected `<style>`. */
    stop(): void
    /** The CSS most recently written to the document. */
    css(): string
    /** Every class token seen so far, in discovery order. */
    candidates(): string[]
}

/** Splits a `class` attribute into candidates. Whitespace is the only separator. */
const tokenize = (value: string, into: Set<string>): void => {
    for (const token of value.split(/\s+/))
        if (token) into.add(token)
}

/**
 * Collects class tokens from `root` and every open shadow root beneath it,
 * reporting the roots it found so the caller can observe them too.
 */
const scan = (root: Document | ShadowRoot, into: Set<string>, roots: (Document | ShadowRoot)[]): void => {
    roots.push(root)
    // querySelectorAll('*') rather than '[class]' because the shadow hosts have to
    // be visited whether or not they carry a class themselves.
    for (const el of Array.from(root.querySelectorAll('*'))) {
        const cls = el.getAttribute('class')
        if (cls) tokenize(cls, into)
        if (el.shadowRoot) scan(el.shadowRoot, into, roots)
    }
}

/**
 * Start compiling Tailwind utilities in the browser, including for classes that
 * only ever exist inside shadow roots.
 *
 * Call it once. Starting a second instance without stopping the first leaves the
 * two fighting over the same `<style>` id.
 */
export async function startRuntimeTailwind(
    options: RuntimeTailwindOptions = {}
): Promise<RuntimeTailwindHandle> {
    const {
        css = DEFAULT_CSS,
        stylesheets = {},
        styleId = 'wui-runtime-tailwind',
        hookAttachShadow = false,
        onError = (err: unknown) => console.warn('[RuntimeTailwind]', err),
    } = options

    const sources = { ...BUNDLED, ...stylesheets }

    const compiler = await compile(css, {
        base: '/',
        loadStylesheet: async (id: string, base: string) => {
            const content = sources[id]
            if (content === undefined)
                throw new Error(
                    `[RuntimeTailwind] no bundled stylesheet for "${id}". Pass it via ` +
                    `options.stylesheets -- there is no filesystem to resolve against.`
                )
            return { path: id, base, content }
        },
    })

    const styleEl = document.createElement('style')
    styleEl.id = styleId
    /**
     * Every update is written to *this* text node's `data`, never via
     * `styleEl.textContent = ...`.
     *
     * This is the whole propagation mechanism and it is easy to break. woby's
     * observer treats a mutation as stylesheet-relevant only if it is a
     * `childList` change whose added/removed node is a `<style>`/`<link>`
     * **element**, or a `characterData` change under a `<style>`. Assigning
     * `textContent` replaces the text node, which produces a `childList` record
     * carrying a *Text* node -- filtered out -- and no `characterData` record at
     * all. The result looks like it works, because the initial append is a real
     * element insertion and does propagate; every later rebuild then silently
     * never reaches the shadow roots. Editing `data` in place fires
     * `characterData` and keeps them in sync.
     */
    const styleText = document.createTextNode('')
    styleEl.appendChild(styleText)
    // Appended last so its `@layer utilities` block sits after the build's, which
    // lets a runtime-typed utility win a same-specificity tie against a build-time
    // one. That ordering is the point of the whole module.
    document.head.appendChild(styleEl)

    /** Monotonic: the compiler is incremental and expects the full set each time. */
    const seen = new Set<string>()
    let lastCss = ''
    let stopped = false

    const observers = new Set<MutationObserver>()
    const observed = new WeakSet<Document | ShadowRoot>()

    const observe = (root: Document | ShadowRoot) => {
        if (observed.has(root)) return
        observed.add(root)
        const mo = new MutationObserver(schedule)
        mo.observe(root as Node, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['class'],
        })
        observers.add(mo)
    }

    const build = () => {
        if (stopped) return
        const before = seen.size
        const roots: (Document | ShadowRoot)[] = []
        scan(document, seen, roots)
        for (const root of roots) observe(root)

        // Nothing new to compile. Skipping the write matters: woby re-parses the
        // whole document's CSS every time this <style> changes, so a no-op write
        // is not free.
        if (seen.size === before && lastCss) return

        try {
            const next = compiler.build(Array.from(seen))
            if (next !== lastCss) {
                lastCss = next
                styleText.data = next
            }
        } catch (err) {
            onError(err)
        }
    }

    let queued = false
    function schedule() {
        if (queued || stopped) return
        queued = true
        requestAnimationFrame(() => {
            queued = false
            build()
        })
    }

    let unhook: (() => void) | undefined
    if (hookAttachShadow) {
        const original = Element.prototype.attachShadow
        Element.prototype.attachShadow = function (this: Element, init: ShadowRootInit) {
            const root = original.call(this, init)
            observe(root)
            schedule()
            return root
        }
        unhook = () => { Element.prototype.attachShadow = original }
    }

    build()

    return {
        refresh: build,
        stop() {
            stopped = true
            unhook?.()
            observers.forEach(mo => mo.disconnect())
            observers.clear()
            styleEl.remove()
        },
        css: () => lastCss,
        candidates: () => Array.from(seen),
    }
}

export default startRuntimeTailwind

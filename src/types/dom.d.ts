/**
 * Ambient DOM augmentations for APIs the editor relies on that `lib.dom.d.ts` does not declare.
 */

interface ShadowRoot {
	/**
	 * Chromium-only shadow-root selection API. The editor runs its content-editable surface inside
	 * a shadow root, where `document.getSelection()` returns the retargeted host element rather than
	 * the caret inside the shadow tree — so every caret/range read goes through this instead.
	 *
	 * Not in `lib.dom.d.ts` because it is non-standard; call sites already guard with `?.`.
	 */
	getSelection(): Selection | null
}

/**
 * Minimal stand-in for Node's `process`, guarded by `typeof process !== 'undefined'` at every use.
 *
 * The package targets the browser and deliberately does not pull in `@types/node` (it would drag
 * Node's globals over the DOM ones), but a few modules gate dev-only warnings on `NODE_ENV`.
 */
declare var process: { env?: Record<string, string | undefined> } | undefined

/**
 * Set by the SSR test runner (`src/ssr/ssr-test-runner.tsx`) before rendering. Components read it
 * to skip effect bodies that touch real DOM nodes, which do not exist under `renderToString`.
 */
declare var __isSSRTest__: boolean | undefined

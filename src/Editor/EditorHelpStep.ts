import { $, $$, Observable } from 'woby'

/**
 * # The help-step registry
 *
 * The fourth module-global registry, after `EditorToolbarItem`, `EditorPlugin` and
 * the locale catalogue. A `HelpStep` is a *descriptor* — name, what to point at,
 * the caption, the gating predicate — contributed by any module at import time
 * and consumed by `HelpTour` when the user presses the toolbar's Help button.
 *
 * The shape is deliberately **plain data**:
 *
 * - No `Observable` fields. `title` and `body` are `string | (() => string)` so a
 *   contributor that knows nothing of woby can hand over literal English strings.
 * - No `JSX.Child`. `icon?: () => JSX.Child` would look symmetric with `ToolbarItem`,
 *   but it would force the contributor to import woby. `packages/compass` ships
 *   step data and does not depend on `@woby/wui` — keep it that way.
 * - No `ObservableMaybe`. A contributor with no reactive system in scope should not
 *   need one.
 *
 * The `() => string` form on `title`/`body` is the read-side hook a host catalogue
 * plugs into: `() => t('editor.help.insert')` re-reads when the locale changes,
 * without tearing the balloon down. The thunk is called inside the balloon's
 * render — never in a `useMemo` returning JSX (invariant #2, see
 * `EditorToolbarSlot.tsx:19-24`).
 *
 * ## Scope: module-global
 *
 * Same reasoning as `EditorToolbarItem`: the registry holds *descriptors*, not
 * per-editor state. The tour component (the per-editor runtime) reads the registry
 * once it knows which editor it is in, then keeps `currentIndex`, the resolved
 * anchor and the balloon node locally.
 */

/**
 * Where a step points. A vocabulary, not a CSS selector — a raw selector in a
 * third-party step would freeze wui's internal markup into a public API, and the
 * next refactor would silently break a step nobody in this repo can see.
 *
 * `selector` exists as the documented escape hatch; treat its syntax as unstable.
 *
 * `panel` points at the property panel as a whole; `panelPart` points at one
 * named region inside it (`header`, `parent`, `identity`, `delete`, `close`,
 * `help`, `form`, `actions`, `style`, `resize`). The parts are a closed set
 * stamped by `PropertyPanel.tsx` — a step naming one that does not exist simply
 * fails to resolve and is skipped, the same as any other unresolved target.
 */
export type HelpTarget =
    | { at: 'toolbar'; item: string }
    | { at: 'surface' }
    | { at: 'panel' }
    | { at: 'panelPart'; part: string }
    | { at: 'prop'; prop: string }
    | { at: 'element'; tag: string }
    | { at: 'pluginGroup'; group: string }
    | { at: 'selector'; css: string }

/**
 * Side of the anchor the balloon prefers. `'auto'` picks the side with room,
 * defaulting to below.
 */
export type HelpPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right'

/** What moves the tour forward when this step is current. */
export type HelpAdvance = 'manual' | 'click' | 'insert'

/**
 * The per-step context passed to {@link HelpStep.when}. Resolved once per render
 * inside the tour's reactive context.
 */
export interface HelpContext {
    /** The editor host this tour is running in. Never `document` directly — shadow boundary. */
    root: Document | ShadowRoot
    /** The contenteditable surface, i.e. `[data-editor-root]`. May be null. */
    surface: HTMLElement | null
    /** The resolved anchor for this step, or null when the target did not resolve. */
    el: HTMLElement | null
}

/**
 * One tour step.
 */
export interface HelpStep {
    /** Unique. Duplicates warn and keep the first registration. */
    name: string
    /** Sort key within the tour. Same convention as `TOOLBAR_GROUPS` — leave gaps. */
    order?: number
    /** Which tour. Omitted means the default tour, the one the toolbar button starts. */
    tour?: string
    /** What this step points at. `undefined` renders a centred card with no arrow. */
    target?: HelpTarget
    /** Heading. A thunk is re-read on every render, so a host catalogue can drive it. */
    title: string | (() => string)
    /** One or two sentences. Same thunk rule. */
    body: string | (() => string)
    /**
     * Skip this step when it returns false. Reactive: read inside the tour's render,
     * so a step can appear the moment its precondition is met.
     *
     * `el` is the resolved anchor, or null when the target did not resolve.
     */
    when?: (ctx: HelpContext) => boolean
    /** Auto-advance. Default `'manual'`. */
    advanceOn?: HelpAdvance
    /** Balloon side. Default `'auto'`. */
    placement?: HelpPlacement
}

// #region Registry
// Three observables, mirroring the toolbar registry: the steps, the running tour,
// and the index inside it. None of these know about a particular editor instance;
// they hold descriptors and global flags, and the per-editor driver subscribes.

const registeredSteps = $<HelpStep[]>([])

/**
 * Add a step to the registry.
 *
 * Warns and keeps the first on a duplicate name. Matches `registerToolbarItem`;
 * the `registerToolbarGroup` overwrite-asymmetry does *not* apply here because a
 * step has no group concept to reconfigure.
 */
export const registerHelpStep = (step: HelpStep): void => {
    const current = $$(registeredSteps)
    if (current.find(s => s.name === step.name)) {
        console.warn(`[EditorHelp] Step "${step.name}" is already registered. Skipping.`)
        return
    }
    registeredSteps([...current, step])
}

/**
 * Convenience for the common case — register an array of steps. Duplicates inside
 * the array still warn per-step; an empty array is a no-op.
 */
export const registerHelpSteps = (steps: HelpStep[]): void => {
    for (const s of steps) registerHelpStep(s)
}

/** Remove a step. Unknown names are a no-op. */
export const unregisterHelpStep = (name: string): void => {
    registeredSteps($$(registeredSteps).filter(s => s.name !== name))
}

/** The registry observable, unsorted and unfiltered. */
export const getHelpSteps = (): Observable<HelpStep[]> => registeredSteps

/**
 * The steps of one tour, sorted and `when()`-filtered.
 *
 * The `ctx` argument is passed through to each step's `when()` predicate — a host
 * can read its resolved anchor or its own surface to decide whether this step is
 * relevant right now. Without `ctx`, every step is evaluated as if `el` were null.
 *
 * `tour` defaults to `'default'`, which is also what `startHelpTour()` runs when
 * called without an argument.
 */
export const resolveHelpSteps = (
    tour: string = 'default',
    ctx?: HelpContext,
): HelpStep[] => {
    const want = tour
    const filtered = $$(registeredSteps).filter(s => (s.tour ?? 'default') === want)
    const sorted = [...filtered].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    if (!ctx) return sorted
    return sorted.filter(s => s.when ? s.when(ctx) : true)
}
// #endregion

// #region Resolution
/**
 * Resolve a {@link HelpTarget} to a DOM element.
 *
 * This is the *only* place in the wizard that knows the attribute names. A future
 * refactor of `PropertyPanel.tsx` should change exactly one string here, not
 * however many third-party step files the user happens to have.
 *
 * Returns `null` when nothing matches — the tour treats that as "render centred",
 * not as an error. Steps whose target does not exist yet are the normal case
 * (insert one before "set rotation").
 *
 * Looks up under both the editor's own root (shadow or light) and `document`,
 * because the editor ships in both modes (`Editor.tsx:222-224`) and a shadow-only
 * lookup finds nothing in light mode.
 */
export const resolveHelpTarget = (
    root: Document | ShadowRoot,
    target?: HelpTarget,
): HTMLElement | null => {
    if (!target) return null
    const sel = selectorFor(target)
    if (!sel) return null
    const inRoot = root.querySelector(sel)
    if (inRoot) return boxBearing(inRoot as HTMLElement)
    // Only fall back to document when the editor is in shadow mode; in light mode
    // `root` already is `document`, and a second lookup is wasted but harmless.
    if (typeof document !== 'undefined' && root !== document) {
        const inDoc = document.querySelector(sel)
        return inDoc ? boxBearing(inDoc as HTMLElement) : null
    }
    return null
}

/**
 * Toolbar targets are stamped on `display: contents` slot wrappers
 * (`EditorToolbarSlot`), which paint no box of their own — every rect is
 * zero, which would collapse the spotlight and the balloon's anchoring
 * math. Descend to the first descendant that actually paints. A tree with
 * no painting descendant (e.g. a hidden panel) is returned as-is; the
 * balloon treats a zero box as "no spotlight, degenerate anchor".
 */
const boxBearing = (el: HTMLElement): HTMLElement => {
    if (el.getClientRects().length > 0) return el
    const child = el.querySelector('*') as HTMLElement | null
    return child ?? el
}

/**
 * Translate a {@link HelpTarget} into the CSS selector that resolves it.
 *
 * Returned only to satisfy callers that want to test resolution in isolation; the
 * tour always goes through {@link resolveHelpTarget}.
 */
export const selectorFor = (target: HelpTarget): string | null => {
    switch (target.at) {
        case 'toolbar': return `[data-toolbar-item="${cssEscape(target.item)}"]`
        case 'surface': return '[data-editor-root]'
        case 'panel': return '[data-property-panel]'
        case 'panelPart': return `[data-panel-part="${cssEscape(target.part)}"]`
        case 'prop': return `[data-prop-row="${cssEscape(target.prop)}"]`
        case 'element': return tagSelector(target.tag)
        case 'pluginGroup': return `[data-plugin-group="${cssEscape(target.group)}"]`
        case 'selector': return target.css
    }
}

/**
 * `tag: '*'` means "the first element inside the surface" — used by `help.select`
 * to point at the act of selecting an inserted element regardless of its kind.
 * A real tag goes through `CSS.escape` so a plugin with a hyphenated custom element
 * (`wui-page-break`) does not break the query.
 */
const tagSelector = (tag: string): string => {
    if (tag === '*') return '[data-editor-root] *'
    return tag.toLowerCase()
}

/**
 * `CSS.escape` is standard on every browser wui targets; fall back to a defensive
 * quote if a runtime somehow lacks it (older WebKit). The fallback matches what
 * attribute-name lookup would accept, not the full CSS.escape grammar.
 */
const cssEscape = (s: string): string => {
    if (typeof (CSS as any)?.escape === 'function') return (CSS as any).escape(s)
    return s.replace(/"/g, '\\"')
}
// #endregion

// #region Tour driver surface
/**
 * The name of the tour currently running, or `null`. Module-global: a wui editor is
 * not a singleton (§1), but a tour is — once started, it has one current index and
 * one balloon, regardless of how many editors are on the page. A second
 * `startHelpTour()` call replaces the first.
 */
export const helpTourActive = $<string | null>(null)

/** Where the active tour is, zero-based. Survives `unregister` of later steps. */
export const helpTourIndex = $(0)

/** The editor root the active tour is running against, if any. */
const helpTourRoot = $<Document | ShadowRoot | null>(null)

/**
 * Start a tour.
 *
 * `tour` defaults to `'default'`. `opts.from` jumps to a named step, used by
 * `?help=foo` style deep links.
 *
 * The actual balloon mount lives in `HelpTour.tsx` — this function only flips the
 * `helpTourActive` observable and lets the driver pick it up.
 */
export const startHelpTour = (tour: string = 'default', opts?: { from?: string }): void => {
    helpTourActive(tour)
    const steps = resolveHelpSteps(tour)
    if (opts?.from) {
        const idx = steps.findIndex(s => s.name === opts.from)
        helpTourIndex(idx >= 0 ? idx : 0)
    } else {
        helpTourIndex(0)
    }
}

/** End any running tour. Idempotent. */
export const stopHelpTour = (): void => {
    helpTourActive(null)
    helpTourRoot(null)
    helpTourIndex(0)
}

/** The current step index, exposed for the tour driver. */
export const getHelpTourIndex = (): Observable<number> => helpTourIndex

/**
 * Advance one step. No-op without an active tour. Advancing past the final
 * step (the balloon's Done) is terminated by the tour's per-step gate, which
 * sees the now out-of-range index and stops the tour.
 */
export const helpTourNext = (): void => {
    if ($$(helpTourActive) === null) return
    helpTourIndex($$(helpTourIndex) + 1)
}

/** Go back one step. No-op below zero. */
export const helpTourBack = (): void => {
    if ($$(helpTourActive) === null) return
    helpTourIndex(Math.max(0, $$(helpTourIndex) - 1))
}

/**
 * The editor root a running tour is bound to, set by the driver on mount.
 *
 * Exposed so third parties (a host overlay, a unit test) can read or set it; the
 * driver writes it and reads it back when re-anchoring.
 */
export const getHelpTourRoot = (): Observable<Document | ShadowRoot | null> => helpTourRoot
export const setHelpTourRoot = (root: Document | ShadowRoot | null): void => { helpTourRoot(root) }
// #endregion

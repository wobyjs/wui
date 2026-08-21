/**
 * The bridge between a Tailwind class token and the CSS declarations it makes.
 *
 * Two directions, and they are asymmetric:
 *
 *  - **token -> CSS** is resolved by *scanning stylesheets*, not by parsing the
 *    token. Whatever `p-4` means is whatever the rule `.p-4` says, so this works
 *    identically for build-time Tailwind, runtime-compiled Tailwind
 *    (`RuntimeTailwind`), and hand-written CSS classes that have nothing to do
 *    with Tailwind at all. No parser, no theme config, no dependency on how the
 *    class got there.
 *
 *  - **CSS -> token** is built, using `UTILITY` where an exactly-equivalent
 *    utility exists and Tailwind v4's arbitrary-property syntax `[prop:value]`
 *    otherwise. The arbitrary form is what makes "every property" achievable:
 *    it needs no entry in any table, and it composes with variants
 *    (`hover:[mask-type:luminance]`) like any other utility.
 *
 * Because the two directions are independent, the panel never has to trust that
 * `buildToken` and `resolveToken` agree -- it writes with one and reads back
 * with the other, and a disagreement shows up as a visible wrong value rather
 * than as silent corruption.
 *
 * @module TwBridge
 */

import { SHORTHANDS } from './propertyCatalog'

/** Pseudo-class states the panel can edit. `base` is the unprefixed token. */
export const VARIANTS = ['base', 'hover', 'focus', 'active'] as const
export type Variant = (typeof VARIANTS)[number]

/** A resolved token's declarations, property -> value, both kebab-cased. */
export type Decls = Record<string, string>

/** `hover:bg-red-500` -> `{ variant: 'hover', utility: 'bg-red-500' }`. */
export function splitVariant(token: string): { variant: Variant, utility: string } {
    const i = token.indexOf(':')
    // A colon inside brackets is part of an arbitrary value, not a variant
    // separator: `[mask-type:luminance]` has no variant.
    if (i < 0 || token.startsWith('[')) return { variant: 'base', utility: token }
    const head = token.slice(0, i)
    if ((VARIANTS as readonly string[]).includes(head) && head !== 'base')
        return { variant: head as Variant, utility: token.slice(i + 1) }
    // An unrecognised prefix (`md:`, `dark:`, `group-hover:`) is not a state
    // this panel edits. Treat the whole thing as opaque so it is left alone.
    return { variant: 'base', utility: token }
}

/** Inverse of {@link splitVariant}. */
export function joinVariant(variant: Variant, utility: string): string {
    return variant === 'base' ? utility : `${variant}:${utility}`
}

/**
 * A literal backslash.
 *
 * Named rather than written inline because every use of it here sits inside a
 * regular expression or a replacement string, where a bare backslash is two
 * levels of escaping away from the character it is supposed to mean.
 */
const BACKSLASH = String.fromCharCode(92)

/** The CSS selector text a class token produces, e.g. `.hover\:p-4:hover`. */
function selectorFor(token: string): string {
    const { variant } = splitVariant(token)
    const escaped = typeof CSS !== 'undefined' && CSS.escape
        ? CSS.escape(token)
        : token.replace(/[^a-zA-Z0-9_-]/g, c => BACKSLASH + c)
    return variant === 'base' ? '.' + escaped : `.${escaped}:${variant}`
}

// -- token -> CSS ------------------------------------------------------------

type Index = Map<string, Decls>

const indexCache = new WeakMap<Document | ShadowRoot, Index>()

/**
 * Declarations a style rule sets, as a plain object.
 *
 * A declaration list enumerates longhands only: `padding: 1rem` iterates as
 * four `padding-*` entries, so a `padding` row would never find itself in the
 * result. Each shorthand is therefore probed by name as well; `getPropertyValue`
 * returns a value only when the rule really does set the whole shorthand, so
 * this adds keys without inventing them.
 */
function declsOf(rule: CSSStyleRule): Decls {
    const out: Decls = {}
    const s = rule.style
    for (let i = 0; i < s.length; i++) {
        const p = s[i]
        out[p] = s.getPropertyValue(p).trim()
    }
    for (const short of SHORTHANDS) {
        if (out[short]) continue
        const v = s.getPropertyValue(short).trim()
        if (v) out[short] = v
    }
    return out
}

/**
 * Walk a rule list, recording every style rule by selector.
 *
 * Grouping rules are descended into rather than skipped. Tailwind v4 wraps
 * utilities in `@layer utilities` and puts `hover:` behind
 * `@media (hover: hover)`, so a scan that only looked at top-level rules would
 * find almost nothing.
 *
 * Media conditions are otherwise ignored: a rule inside `@media (min-width:
 * 768px)` is recorded the same as one outside. That is deliberate -- the panel
 * edits states, not breakpoints, and recording the declaration is better than
 * pretending the class is unknown.
 */
function walk(rules: CSSRuleList, into: Index) {
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i] as CSSRule
        // `cssRules` is not the mark of a grouping rule: CSS nesting gave every
        // style rule an (almost always empty) child list, so testing for the
        // property alone would descend into nothing and drop the rule itself.
        const grouping = (rule as CSSGroupingRule).cssRules
        if (grouping && grouping.length) walk(grouping, into)
        const style = rule as CSSStyleRule
        if (!style.selectorText || !style.style) continue
        // One rule can carry several selectors; each is indexed separately.
        for (const sel of style.selectorText.split(',')) {
            const key = sel.trim()
            if (!key) continue
            const prev = into.get(key)
            into.set(key, prev ? { ...prev, ...declsOf(style) } : declsOf(style))
        }
    }
}

/** Build (or reuse) the selector -> declarations index for a root. */
function indexFor(root: Document | ShadowRoot): Index {
    const hit = indexCache.get(root)
    if (hit) return hit

    const index: Index = new Map()
    const sheets: CSSStyleSheet[] = []
    // A shadow root sees its own adopted sheets *and* nothing from the document,
    // but the element's classes may equally come from a document-level sheet
    // when the target is in the light DOM. Scanning both is harmless: a selector
    // that does not apply here simply never gets looked up.
    try { sheets.push(...Array.from(document.styleSheets as any as CSSStyleSheet[])) } catch { /* */ }
    if (root !== document) {
        try { sheets.push(...((root as ShadowRoot).adoptedStyleSheets ?? [])) } catch { /* */ }
        try {
            root.querySelectorAll('style').forEach(el => {
                if (el.sheet) sheets.push(el.sheet)
            })
        } catch { /* */ }
    }

    for (const sheet of sheets) {
        // Cross-origin sheets throw on `.cssRules`. Nothing to do but skip them.
        try { walk(sheet.cssRules, index) } catch { /* */ }
    }

    indexCache.set(root, index)
    return index
}

/**
 * Tokens whose meaning was declared by {@link buildToken} before any stylesheet
 * contained them.
 *
 * RuntimeTailwind compiles asynchronously: the frame after a class is added to
 * an element, no rule for it exists yet, and a scan would report the token as
 * unknown -- so the row the user just edited would blank out and then refill.
 * Remembering what we wrote closes that window.
 */
const written = new Map<string, Decls>()

/** Declarations a class token produces, or `null` if nothing defines it. */
export function resolveToken(token: string, root: Document | ShadowRoot = document): Decls | null {
    const remembered = written.get(token)
    if (remembered) return remembered
    const found = indexFor(root).get(selectorFor(token))
    return found ?? null
}

/**
 * Discard the cached index. Call after Tailwind compiles new classes; the next
 * `resolveToken` rebuilds from the live stylesheets.
 */
export function refresh() {
    // WeakMap has no clear(); replacing the entries we know about is enough
    // because roots are few and long-lived.
    indexCache.delete(document)
    for (const root of trackedRoots) indexCache.delete(root)
}

const trackedRoots = new Set<ShadowRoot>()

/** Register a shadow root so {@link refresh} can invalidate its index too. */
export function trackRoot(root: Document | ShadowRoot) {
    if (root !== document) trackedRoots.add(root as ShadowRoot)
}

// -- CSS -> token ------------------------------------------------------------

/**
 * Properties with an exactly-equivalent Tailwind utility prefix.
 *
 * "Exactly equivalent" is the whole bar for inclusion: `w-[100px]` must set
 * `width: 100px` and nothing else. Where a utility sets several declarations,
 * or where the mapping depends on theme configuration, the property is left out
 * and falls through to the arbitrary-property form -- which is never wrong.
 *
 * This map buys readable output (`text-[#f00]` rather than `[color:#f00]`) and
 * nothing else; every property remains writable without it.
 */
const UTILITY: Record<string, string> = {
    'color': 'text', 'font-size': 'text',
    'background-color': 'bg',
    'border-color': 'border', 'border-width': 'border',
    'border-top-width': 'border-t', 'border-right-width': 'border-r',
    'border-bottom-width': 'border-b', 'border-left-width': 'border-l',
    'border-radius': 'rounded',
    'opacity': 'opacity', 'z-index': 'z',
    'width': 'w', 'height': 'h',
    'min-width': 'min-w', 'min-height': 'min-h',
    'max-width': 'max-w', 'max-height': 'max-h',
    'padding': 'p', 'padding-top': 'pt', 'padding-right': 'pr',
    'padding-bottom': 'pb', 'padding-left': 'pl',
    'margin': 'm', 'margin-top': 'mt', 'margin-right': 'mr',
    'margin-bottom': 'mb', 'margin-left': 'ml',
    'gap': 'gap', 'row-gap': 'gap-y', 'column-gap': 'gap-x',
    'font-weight': 'font', 'line-height': 'leading',
    'letter-spacing': 'tracking',
    'flex-basis': 'basis', 'flex-grow': 'grow', 'flex-shrink': 'shrink',
    'order': 'order', 'top': 'top', 'right': 'right', 'bottom': 'bottom',
    'left': 'left', 'inset': 'inset',
    'fill': 'fill', 'stroke': 'stroke',
}

/**
 * A value safe to place inside Tailwind's bracket syntax.
 *
 * Spaces would end the class token, so Tailwind's own convention is to write
 * them as underscores (`[font-family:Fira_Code]`). Any literal underscore in
 * the value must therefore be escaped first, or `Fira_Code` and `Fira Code`
 * would produce the same token.
 */
function bracketValue(value: string): string {
    return value.trim()
        .split(BACKSLASH).join(BACKSLASH + BACKSLASH)
        .split('_').join(BACKSLASH + '_')
        .replace(/\s+/g, '_')
}

/**
 * The class token that sets `prop: value` under `variant`.
 *
 * The resulting token is remembered (see {@link resolveToken}) so a read that
 * happens before Tailwind has compiled it still reports the right value.
 */
export function buildToken(prop: string, value: string, variant: Variant = 'base'): string {
    const v = bracketValue(value)
    const utility = UTILITY[prop]
    const token = joinVariant(variant, utility ? `${utility}-[${v}]` : `[${prop}:${v}]`)
    written.set(token, { [prop]: value.trim() })
    return token
}

/**
 * Class tokens in `tokens` that set `prop` under `variant`.
 *
 * Found by resolving each token rather than by matching its text, so a
 * hand-written `p-4`, an arbitrary `[padding:1rem]`, and a project class
 * `.card` that happens to set padding are all recognised alike. This is what
 * makes replacing a value reliable: whatever set the property before is
 * removed, no matter how it was spelled.
 *
 * A token that sets `prop` among other declarations is still reported -- the
 * caller decides whether removing it is acceptable (see `applyStyle`).
 */
export function tokensFor(
    prop: string,
    variant: Variant,
    tokens: string[],
    root: Document | ShadowRoot = document,
): string[] {
    return tokens.filter(t => {
        if (splitVariant(t).variant !== variant) return false
        const decls = resolveToken(t, root)
        return !!decls && prop in decls
    })
}

/** True when removing `token` would drop declarations other than `prop`. */
export function tokenIsShared(
    token: string,
    prop: string,
    root: Document | ShadowRoot = document,
): boolean {
    const decls = resolveToken(token, root)
    if (!decls) return false
    return Object.keys(decls).some(p => p !== prop)
}

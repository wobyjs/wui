/**
 * i18n.ts — the locale registry.
 *
 * wui renders its own chrome. A toolbar button's tooltip, a dialog's Cancel, the
 * "Page 3 / 8" strip under a sheet — none of those come from a call site the host
 * controls, so an app in Malay was stuck with English in the middle of its own UI.
 * `layoutText` and `zoomText` were the first two patches for that, one observable per
 * control; this module is the general form of the same idea.
 *
 * ## Two catalogues, because there are two kinds of string
 *
 * **Keyed** — `t('editor.bold')`. Everything wui itself renders: tooltips, dialogs,
 * menu headings, the page-number strip. These get stable ids, so rewording the English
 * never silently un-translates the other packs.
 *
 * **English-as-key** — `tx('Badge Content')`. Every `label:` and `hint:` in a plugin's
 * property schema. There are ~265 of them across WuiPlugins and PageBlockPlugins alone,
 * and the interesting ones are not ours at all: a host that registers its own plugin
 * writes its own English labels, and nobody is going to come back and add message ids to
 * somebody else's plugin. Looking the English up directly means a locale pack can
 * translate a third-party plugin the plugin has never heard of, and an untranslated
 * string degrades to the English the author wrote — which is exactly what it rendered
 * before this module existed.
 *
 * Identity is the fallback, so `tx` is safe to wrap around anything. That also decides
 * what is *not* translated: font family names (`Georgia` is a typeface, not a word), CSS
 * property names (a designer types `flex-direction`), and formula function names
 * (`Abs`, `Concat` — no spreadsheet translates those either). They pass through
 * untouched unless a pack deliberately claims them.
 *
 * ## Plug when needed
 *
 * Packs are not bundled. `registerLocaleLoader` files a `() => import(...)` thunk, the
 * bundler code-splits it, and nothing is fetched until `setLocale` asks for it. A pack
 * already in hand can skip the loader entirely and go straight in via `registerLocale` —
 * which is the path a host's own strings take.
 *
 * @module i18n
 */

import { $, $$, useMemo, type Observable, type ObservableMaybe } from 'woby'

/** A language tag: `en`, `zh-Hans`, `ms`. BCP-47 shaped, matched case-insensitively. */
export type LocaleCode = string

/**
 * One language's strings.
 *
 * Both catalogues are optional. An English pack needs no `text` map at all — `tx`
 * already returns its argument — and a pack that only wants to fix a handful of
 * tooltips can ship `messages` alone.
 */
export interface LocalePack {
    /** Canonical tag. `zh-Hans`, not `zh_CN`. */
    code: LocaleCode
    /** The language's name **in that language** — `Bahasa Melayu`, not `Malay`. A picker showing endonyms is readable to the person who needs it. */
    name: string
    /** The English name, for a picker whose surrounding chrome is English. */
    english?: string
    /** Writing direction. Only `rtl` does anything; `ltr` is the default. */
    dir?: 'ltr' | 'rtl'
    /** Tried before the default locale when a key is missing here. `zh-Hant` may fall back to `zh-Hans`. */
    fallback?: LocaleCode
    /** The keyed catalogue, read by {@link t}. */
    messages?: Record<string, string>
    /** The English-text catalogue, read by {@link tx}. */
    text?: Record<string, string>
}

/** What {@link availableLocales} reports about one language. */
export interface LocaleInfo {
    code: LocaleCode
    name: string
    english?: string
    /** `false` while only a loader is filed — the picker can still list it. */
    loaded: boolean
}

// -- State -------------------------------------------------------------------

/*
 * Module level, for the same reason `editorLayout` and `scrollerOpen` are: the toolbar,
 * the property panel and the surface live in different subtrees — different shadow roots,
 * often — and none of them is another's parent, so a prop or a context could not reach
 * across. There is one current language per page, and this is it.
 */
const packs = $<Record<LocaleCode, LocalePack>>({})
const loaders = new Map<LocaleCode, () => Promise<LocalePack | { default: LocalePack }>>()
const pending = new Map<LocaleCode, Promise<LocalePack | undefined>>()
const announced = new Map<LocaleCode, { name: string, english?: string }>()
const watchers = new Set<(code: LocaleCode) => void>()

/** Tell the imperative subscribers the strings they hold are stale. */
const notify = () => { const c = $$(locale); for (const fn of watchers) { try { fn(c) } catch (e) { console.warn('[i18n] locale watcher threw.', e) } } }

/**
 * The language in force, as an observable.
 *
 * Read it inside a `useMemo` or a `() =>` binding and that binding re-runs on every
 * switch — which is the whole mechanism by which a running editor re-labels itself.
 * Write it through {@link setLocale}; writing it directly skips the load and will read
 * back English until the pack happens to arrive.
 */
export const locale = $<LocaleCode>('en')

/** Last resort before the key itself. Changing it is a host decision, not a user one. */
export const defaultLocale = $<LocaleCode>('en')

/**
 * Regional tags folded onto the packs that actually exist.
 *
 * `zh` alone is ambiguous and the two scripts are not mutually readable, so it has to
 * resolve to one of them: Simplified, because that is what browsers sending a bare `zh`
 * overwhelmingly mean, and what Malaysia and Singapore — the other half of this
 * package's audience — read.
 */
const ALIASES: Record<string, LocaleCode> = {
    'zh': 'zh-Hans',
    'zh-cn': 'zh-Hans', 'zh-sg': 'zh-Hans', 'zh-my': 'zh-Hans', 'zh-hans-cn': 'zh-Hans',
    'zh-tw': 'zh-Hant', 'zh-hk': 'zh-Hant', 'zh-mo': 'zh-Hant', 'zh-hant-tw': 'zh-Hant',
    'ms-my': 'ms', 'ms-sg': 'ms', 'ms-bn': 'ms', 'zsm': 'ms',
    'en-gb': 'en', 'en-us': 'en', 'en-au': 'en', 'en-my': 'en', 'en-sg': 'en', 'en-hk': 'en',
}

/**
 * Fold a tag onto a registered pack: alias table first, then progressively shorter
 * prefixes, so `zh-Hans-CN` finds `zh-Hans` and an unknown `de-AT` still finds `de`.
 */
export const normalizeLocale = (code: LocaleCode): LocaleCode => {
    if (!code) return $$(defaultLocale)
    const lower = code.toLowerCase().replace(/_/g, '-')
    if (ALIASES[lower]) return ALIASES[lower]
    const known = $$(packs)
    for (const c of Object.keys(known)) if (c.toLowerCase() === lower) return c
    for (const c of loaders.keys()) if (c.toLowerCase() === lower) return c
    // Drop one subtag at a time: zh-Hans-CN -> zh-Hans -> zh.
    const parts = lower.split('-')
    while (parts.length > 1) {
        parts.pop()
        const shorter = parts.join('-')
        if (ALIASES[shorter]) return ALIASES[shorter]
        for (const c of Object.keys(known)) if (c.toLowerCase() === shorter) return c
        for (const c of loaders.keys()) if (c.toLowerCase() === shorter) return c
    }
    return code
}

// -- Registration ------------------------------------------------------------

/**
 * Add a pack, or merge into one already registered.
 *
 * Merging — rather than the warn-and-skip `registerEditorPlugin` does — is the right
 * default here because a second registration of the same code is almost always a host
 * *extending* a language rather than redefining it: wui ships `zh-Hans`, the app adds the
 * forty strings of its own chrome under the same tag. Later keys win, so a host can also
 * override one of ours without forking the pack.
 *
 * Pass `{ replace: true }` when you really do mean to throw the old one away.
 */
export const registerLocale = (pack: LocalePack, opts?: { replace?: boolean }): void => {
    if (!pack?.code) { console.warn('[i18n] registerLocale: pack has no code. Skipping.'); return }
    const code = pack.code
    const current = $$(packs)
    const existing = !opts?.replace ? current[code] : undefined
    packs({
        ...current,
        [code]: existing
            ? {
                ...existing, ...pack,
                messages: { ...existing.messages, ...pack.messages },
                text: { ...existing.text, ...pack.text },
            }
            : pack,
    })
    // A pack landing late is indistinguishable, from a subscriber's point of view, from
    // the language having just changed: the strings it holds were resolved without it.
    notify()
}

/** Drop a pack. The current locale falls back along its chain until it is registered again. */
export const unregisterLocale = (code: LocaleCode): void => {
    const current = $$(packs)
    if (!(code in current)) return
    const next = { ...current }
    delete next[code]
    packs(next)
    notify()
}

/**
 * File a pack to be fetched on demand — the "plug when needed" half.
 *
 * `meta` is what lets a language picker list a language nobody has loaded yet. Without
 * it the menu could only offer whatever had already been paid for, which defeats the
 * point of lazy loading: the first switch would have nothing to switch to.
 *
 * ```ts
 * registerLocaleLoader('de', () => import('./locales/de'), { name: 'Deutsch', english: 'German' })
 * ```
 */
export const registerLocaleLoader = (
    code: LocaleCode,
    loader: () => Promise<LocalePack | { default: LocalePack }>,
    meta?: { name?: string, english?: string },
): void => {
    loaders.set(code, loader)
    if (meta?.name) announced.set(code, { name: meta.name, english: meta.english })
    // Re-publish so a picker bound to availableLocales() picks the new entry up.
    packs({ ...$$(packs) })
}

/**
 * Fetch and register a pack, if it is not already in hand.
 *
 * Idempotent and concurrent-safe: the in-flight promise is cached, so ten controls
 * asking for Malay at once cause one import, not ten.
 */
export const loadLocale = async (code: LocaleCode): Promise<LocalePack | undefined> => {
    const c = normalizeLocale(code)
    const have = $$(packs)[c]
    if (have) return have
    const inflight = pending.get(c)
    if (inflight) return inflight
    const loader = loaders.get(c)
    if (!loader) return undefined
    const p = (async () => {
        try {
            const mod = await loader()
            const pack = (mod as { default?: LocalePack }).default ?? (mod as LocalePack)
            if (!pack?.code) { console.warn(`[i18n] loader for "${c}" returned no pack.`); return undefined }
            registerLocale(pack)
            return pack
        } catch (e) {
            console.warn(`[i18n] failed to load locale "${c}":`, e)
            return undefined
        } finally {
            pending.delete(c)
        }
    })()
    pending.set(c, p)
    return p
}

/**
 * Switch language, loading the pack first if it has only been filed as a loader.
 *
 * Awaiting is optional. The switch is published either way — every binding re-runs the
 * moment the pack lands — so fire-and-forget from a click handler is fine; `await` it
 * when the next line depends on the new strings.
 */
export const setLocale = async (code: LocaleCode): Promise<void> => {
    const c = normalizeLocale(code)
    if (!$$(packs)[c] && loaders.has(c)) await loadLocale(c)
    locale(c)
    if (typeof document !== 'undefined') {
        const pack = $$(packs)[c]
        document.documentElement.lang = c
        if (pack?.dir) document.documentElement.dir = pack.dir
    }
    notify()
}

/**
 * Imperative subscription to the language, for code that is not inside a woby binding.
 *
 * Most of wui reads {@link locale} from inside a `() =>` and re-labels itself for free.
 * Anything that has already written strings into the DOM by hand has nothing to re-run —
 * the page-number strips `PageLayout` injects are the case in this package — so it
 * subscribes here and rewrites what it wrote.
 *
 * Fires on a switch, and also when a pack is registered or dropped, because a pack
 * arriving late leaves exactly the same stale strings behind as a switch does.
 *
 * ```ts
 * const off = onLocaleChange(() => redrawTheCanvasLabels())
 * ```
 *
 * @returns an unsubscribe.
 */
export const onLocaleChange = (fn: (code: LocaleCode) => void): (() => void) => {
    watchers.add(fn)
    return () => { watchers.delete(fn) }
}

/** The registry itself, for anything that wants to watch the whole set. */
export const getLocales = (): Observable<Record<LocaleCode, LocalePack>> => packs

/**
 * Every language on offer, loaded or merely filed. Reactive — bind a picker to it.
 *
 * Sorted by code so menu order does not depend on which pack happened to load first.
 */
export const availableLocales = (): LocaleInfo[] => {
    const loaded = $$(packs)
    const out = new Map<LocaleCode, LocaleInfo>()
    for (const [code, meta] of announced) out.set(code, { code, name: meta.name, english: meta.english, loaded: false })
    for (const code of loaders.keys()) if (!out.has(code)) out.set(code, { code, name: code, loaded: false })
    for (const [code, pack] of Object.entries(loaded)) out.set(code, { code, name: pack.name || code, english: pack.english, loaded: true })
    return Array.from(out.values()).sort((a, b) => a.code.localeCompare(b.code))
}

// -- Lookup ------------------------------------------------------------------

/**
 * The packs to consult, nearest first: the locale itself, whatever it names as its
 * fallback, the bare language, then the default. Deduplicated, because `zh-Hant`
 * falling back to `zh` which aliases to `zh-Hans` which falls back to `zh` would
 * otherwise loop.
 */
const chainFor = (code: LocaleCode): LocalePack[] => {
    const reg = $$(packs)
    const seen = new Set<LocaleCode>()
    const out: LocalePack[] = []
    const push = (c: LocaleCode | undefined) => {
        if (!c || seen.has(c)) return
        seen.add(c)
        const pack = reg[c]
        if (!pack) return
        out.push(pack)
        push(pack.fallback)
    }
    push(code)
    const base = code.split('-')[0]
    if (base !== code) push(normalizeLocale(base))
    push($$(defaultLocale))
    return out
}

/** `{name}` substitution. Absent keys are left as written, so a typo is visible rather than blank. */
const interpolate = (s: string, params?: Record<string, unknown>): string => {
    if (!params) return s
    return s.replace(/\{(\w+)\}/g, (whole, k) => (k in params ? String(params[k]) : whole))
}

/**
 * Look a message id up in the current language.
 *
 * Reads {@link locale} and the registry, so calling it inside a `useMemo` or a `() =>`
 * binding makes that binding re-run on every language switch. Calling it at module scope
 * does not — the string is frozen at import time, which is the one mistake this API makes
 * easy. Prefer {@link localized} for component props.
 *
 * A missing id returns the id. That is deliberate: `editor.bold` on a button is an
 * obvious bug report, where an empty tooltip is an invisible one.
 */
export const t = (key: string, params?: Record<string, unknown>): string => {
    const code = $$(locale)
    for (const pack of chainFor(code)) {
        const hit = pack.messages?.[key]
        if (hit != null) return interpolate(hit, params)
    }
    return interpolate(key, params)
}

/**
 * Translate a string of English, falling back to that same English.
 *
 * This is the one to wrap around a plugin's `label:` or `hint:`, a dropdown option, or
 * any other string authored in English by someone who was not thinking about
 * translation. See the module header for why the two catalogues are separate.
 */
export const tx = (text: string | undefined | null, params?: Record<string, unknown>): string => {
    if (!text) return ''
    const code = $$(locale)
    for (const pack of chainFor(code)) {
        const hit = pack.text?.[text]
        if (hit != null) return interpolate(hit, params)
    }
    return interpolate(text, params)
}

/**
 * Plural form, via `Intl.PluralRules` — `t('editor.pages.one')` / `…other` and whatever
 * else the language needs.
 *
 * Chinese and Malay have one form, English two, and a pack for a language with six can
 * simply ship six keys without anything here changing.
 */
export const tn = (key: string, count: number, params?: Record<string, unknown>): string => {
    let form = 'other'
    try { form = new Intl.PluralRules($$(locale)).select(count) } catch { /* unknown tag; `other` */ }
    const withCount = { count, ...params }
    const specific = `${key}.${form}`
    const hit = t(specific, withCount)
    return hit === specific ? t(`${key}.other`, withCount) : hit
}

/**
 * A prop's own value if the caller set one, the catalogue otherwise — as a memo, so it
 * re-resolves when the language changes.
 *
 * This is how a component keeps a prop overridable *and* translatable at once. The
 * alternative — baking English into the `def()` default — makes the two
 * indistinguishable: there is no way to tell "the host asked for Bold" from "nobody said
 * anything and the default is Bold", so the catalogue could never win.
 *
 * ```ts
 * const def = () => ({ title: $('', HtmlString) as ObservableMaybe<string> })
 * const BoldButton = defaults(def, ({ title }) => {
 *     const label = localized(title, 'editor.bold')
 *     return <Button title={label}>…</Button>
 * })
 * ```
 */
export const localized = (given: ObservableMaybe<string> | undefined, key: string, params?: Record<string, unknown>) =>
    useMemo(() => $$(given) || t(key, params))

/** {@link localized}, against the English-text catalogue. For plugin-authored labels. */
export const localizedText = (given: ObservableMaybe<string> | undefined, english: string) =>
    useMemo(() => $$(given) || tx(english))

// -- Formatting --------------------------------------------------------------

/*
 * Thin `Intl` wrappers. They exist so call sites read the current locale reactively
 * rather than each reaching for `navigator.language` — a page that has switched to Malay
 * should not still be printing `1,234.5` because the browser was installed in English.
 */

/** `1234.5` as the current language writes it. */
export const formatNumber = (n: number, opts?: Intl.NumberFormatOptions): string => {
    try { return new Intl.NumberFormat($$(locale), opts).format(n) } catch { return String(n) }
}

/** A date in the current language. Accepts a `Date`, an epoch number, or a parseable string. */
export const formatDate = (d: Date | number | string, opts?: Intl.DateTimeFormatOptions): string => {
    const date = d instanceof Date ? d : new Date(d)
    try { return new Intl.DateTimeFormat($$(locale), opts).format(date) } catch { return date.toISOString() }
}

/** `a, b and c` — and the very different thing Malay and Chinese do with that. */
export const formatList = (items: string[], opts?: Record<string, unknown>): string => {
    try {
        const LF = (Intl as unknown as { ListFormat?: new (l: string, o?: unknown) => { format(i: string[]): string } }).ListFormat
        if (LF) return new LF($$(locale), opts).format(items)
    } catch { /* no ListFormat on this engine */ }
    return items.join(', ')
}

/** Writing direction of the current language, for a host laying out around the editor. */
export const localeDir = (): 'ltr' | 'rtl' => $$(packs)[$$(locale)]?.dir ?? 'ltr'

// -- Detection ---------------------------------------------------------------

/**
 * The best match for what this page and browser asked for, out of what is on offer.
 *
 * `<html lang>` first — a host that set it has made a decision, and that decision should
 * beat the browser's preference list. Then `navigator.languages` in order. Returns the
 * default when nothing matches, never `undefined`, so it is safe to hand straight to
 * {@link setLocale}.
 */
export const detectLocale = (): LocaleCode => {
    const offered = new Set<LocaleCode>([...Object.keys($$(packs)), ...loaders.keys()])
    const tryOne = (raw: string | undefined | null): LocaleCode | undefined => {
        if (!raw) return undefined
        const c = normalizeLocale(raw)
        return offered.has(c) ? c : undefined
    }
    if (typeof document !== 'undefined') {
        const hit = tryOne(document.documentElement.getAttribute('lang'))
        if (hit) return hit
    }
    if (typeof navigator !== 'undefined') {
        for (const raw of navigator.languages ?? [navigator.language]) {
            const hit = tryOne(raw)
            if (hit) return hit
        }
    }
    return $$(defaultLocale)
}

/**
 * Detect and switch, once, at start-up.
 *
 * Separate from {@link detectLocale} because detection is a query and switching is not —
 * a host that stores the user's own choice wants the first without the second.
 */
export const applyDetectedLocale = async (): Promise<LocaleCode> => {
    const code = detectLocale()
    await setLocale(code)
    return code
}

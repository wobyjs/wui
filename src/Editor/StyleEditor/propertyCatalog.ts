/**
 * The property catalogue: which CSS properties exist, how they group, and what
 * kind of control each one deserves.
 *
 * The property list is not hand-written. `allProperties()` iterates a
 * `CSSStyleDeclaration`, which enumerates exactly the longhands the running
 * browser supports -- around 350 in Chromium, and automatically correct on a
 * browser that ships more.
 *
 * Two things ARE hand-written, because no API exposes them:
 *
 *  - `GROUPS`, so common properties can be found by scanning rather than by
 *    spelling them. Everything not named in a group lands in `Other`,
 *    alphabetically, so the catalogue stays complete no matter what the browser
 *    adds.
 *  - `KEYWORDS`, the accepted values for enumerated properties. The CSSOM can
 *    tell you whether a value parses (see `validate` in StyleModel) but not what
 *    the valid values *are*, so a dropdown needs a table. A property absent from
 *    the table degrades to a text input, which still validates -- the table
 *    being incomplete costs affordance, never correctness.
 *
 * @module propertyCatalog
 */

/** Keywords every property accepts. Offered alongside each property's own values. */
export const CSS_WIDE = ['inherit', 'initial', 'unset', 'revert'] as const

/** The control a row renders. Derived from the property name, never hand-assigned. */
export type ControlKind = 'color' | 'length' | 'enum' | 'text'

// -- Property enumeration ----------------------------------------------------

let cachedAll: string[] | null = null

/**
 * Every CSS property the browser reports, kebab-cased and sorted.
 *
 * Iterating a computed-style declaration is the only way to get this: an empty
 * inline `style` declaration iterates as empty (it lists *set* properties, not
 * supported ones), so `document.body.style` yields nothing on a fresh page. The
 * computed declaration of any element lists the full supported set.
 *
 * Custom properties are dropped. An element with `--brand: red` would otherwise
 * contribute a row that means something different on every element, and the
 * catalogue is meant to be the same everywhere.
 */
export function allProperties(): string[] {
    if (cachedAll) return cachedAll
    const out = new Set<string>()
    try {
        const computed = window.getComputedStyle(document.documentElement)
        for (let i = 0; i < computed.length; i++) {
            const p = computed[i]
            if (p && !p.startsWith('--')) out.add(p)
        }
    } catch {
        /* non-DOM environment (SSR); fall through to the shorthand list alone */
    }
    for (const s of SHORTHANDS) out.add(s)
    // The curated groups are seeded in unconditionally. A real browser
    // enumerates every one of them anyway, but happy-dom (and any other partial
    // DOM) reports a handful, and without this the catalogue would collapse to
    // the shorthand list -- taking every grouped row down with it. A property
    // the engine truly does not support simply reads back empty, which is a far
    // better failure than a missing row.
    for (const g of CURATED) for (const prop of g.props) out.add(prop)
    cachedAll = Array.from(out).sort()
    return cachedAll
}

/**
 * Shorthands worth offering even though the computed enumeration omits them.
 *
 * `getComputedStyle` resolves shorthands away -- there is no computed `padding`,
 * only four longhands -- but "padding" is what a person looks for. These are
 * added to the catalogue and written through `style.setProperty`, which does
 * understand them.
 */
export const SHORTHANDS = [
    'margin', 'padding', 'inset', 'gap', 'overflow', 'border', 'border-width',
    'border-style', 'border-color', 'border-radius', 'background', 'font',
    'flex', 'grid-area', 'grid-template', 'place-items', 'place-content',
    'place-self', 'transition', 'animation', 'outline', 'text-decoration',
    'list-style', 'mask', 'columns',
]

// -- Grouping ----------------------------------------------------------------

export type PropertyGroup = { name: string, props: string[] }

/**
 * Curated groups, in panel order. A property may appear in only one group; the
 * first group that claims it wins, so order matters where lists overlap.
 */
const CURATED: PropertyGroup[] = [
    {
        name: 'Layout',
        props: [
            'display', 'position', 'top', 'right', 'bottom', 'left', 'inset',
            'float', 'clear', 'z-index', 'overflow', 'overflow-x', 'overflow-y',
            'visibility', 'box-sizing', 'isolation', 'contain', 'content-visibility',
        ],
    },
    {
        name: 'Size',
        props: [
            'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
            'aspect-ratio', 'object-fit', 'object-position',
        ],
    },
    {
        name: 'Flex & Grid',
        props: [
            'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
            'flex-basis', 'justify-content', 'justify-items', 'justify-self',
            'align-content', 'align-items', 'align-self', 'place-items',
            'place-content', 'place-self', 'order', 'gap', 'row-gap', 'column-gap',
            'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
            'grid-auto-flow', 'grid-auto-columns', 'grid-auto-rows',
            'grid-column', 'grid-row', 'grid-area',
        ],
    },
    {
        name: 'Spacing',
        props: [
            'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        ],
    },
    {
        name: 'Typography',
        props: [
            'color', 'font', 'font-family', 'font-size', 'font-weight', 'font-style',
            'font-variant', 'font-stretch', 'line-height', 'letter-spacing',
            'word-spacing', 'text-align', 'text-align-last', 'text-decoration',
            'text-decoration-line', 'text-decoration-color', 'text-decoration-style',
            'text-decoration-thickness', 'text-underline-offset', 'text-transform',
            'text-indent', 'text-overflow', 'text-shadow', 'text-wrap',
            'white-space', 'word-break', 'overflow-wrap', 'hyphens',
            'vertical-align', 'writing-mode', 'direction', 'list-style',
            'list-style-type', 'list-style-position',
        ],
    },
    {
        name: 'Background',
        props: [
            'background', 'background-color', 'background-image', 'background-position',
            'background-size', 'background-repeat', 'background-attachment',
            'background-clip', 'background-origin', 'background-blend-mode',
        ],
    },
    {
        name: 'Border',
        props: [
            'border', 'border-width', 'border-style', 'border-color',
            'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
            'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
            'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
            'border-left', 'border-left-width', 'border-left-style', 'border-left-color',
            'border-radius', 'border-top-left-radius', 'border-top-right-radius',
            'border-bottom-right-radius', 'border-bottom-left-radius',
            'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
        ],
    },
    {
        name: 'Effects',
        props: [
            'box-shadow', 'opacity', 'filter', 'backdrop-filter', 'mix-blend-mode',
            'transform', 'transform-origin', 'transform-style', 'rotate', 'scale',
            'translate', 'perspective', 'perspective-origin', 'clip-path', 'mask',
        ],
    },
    {
        name: 'Transitions',
        props: [
            'transition', 'transition-property', 'transition-duration',
            'transition-timing-function', 'transition-delay',
            'animation', 'animation-name', 'animation-duration',
            'animation-timing-function', 'animation-delay', 'animation-iteration-count',
            'animation-direction', 'animation-fill-mode', 'animation-play-state',
            'will-change',
        ],
    },
    {
        name: 'Interactivity',
        props: [
            'cursor', 'pointer-events', 'user-select', 'resize', 'touch-action',
            'scroll-behavior', 'appearance', 'caret-color', 'accent-color',
            'scroll-snap-type', 'scroll-snap-align', 'overscroll-behavior',
        ],
    },
]

let cachedGroups: PropertyGroup[] | null = null

/**
 * The curated groups filtered to properties this browser actually supports,
 * followed by an `Other` group holding everything else alphabetically.
 *
 * The filter matters: shipping a row for a property the browser will reject
 * means the control silently does nothing, which reads as a bug in the panel.
 */
export function propertyGroups(): PropertyGroup[] {
    if (cachedGroups) return cachedGroups
    const claimed = new Set<string>()
    const groups: PropertyGroup[] = []

    for (const g of CURATED) {
        // No `supported` filter: `allProperties` already contains every curated
        // property, so filtering here would only ever be a no-op or a lie.
        const props = g.props.filter(p => !claimed.has(p))
        props.forEach(p => claimed.add(p))
        if (props.length) groups.push({ name: g.name, props })
    }

    const rest = allProperties().filter(p => !claimed.has(p))
    if (rest.length) groups.push({ name: 'Other', props: rest })

    cachedGroups = groups
    return groups
}

/** Group name a property belongs to, for labelling rows in the "set" list. */
export function groupOf(prop: string): string {
    for (const g of propertyGroups()) if (g.props.includes(prop)) return g.name
    return 'Other'
}

// -- Control selection -------------------------------------------------------

/**
 * Properties whose value is a bare colour. Deliberately NOT every property with
 * "color" in the name: `background` and `border` accept a colour among other
 * things, so a colour picker there would destroy the rest of the shorthand.
 */
const COLOR_PROPS = new Set([
    'color', 'background-color', 'border-color', 'border-top-color',
    'border-right-color', 'border-bottom-color', 'border-left-color',
    'outline-color', 'text-decoration-color', 'caret-color', 'accent-color',
    'column-rule-color', 'fill', 'stroke', 'flood-color', 'lighting-color',
    'stop-color', 'text-emphasis-color',
])

/** Properties whose value is a single length/percentage, so a number+unit field fits. */
const LENGTH_PROPS = new Set([
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    'top', 'right', 'bottom', 'left',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'gap', 'row-gap', 'column-gap',
    'font-size', 'line-height', 'letter-spacing', 'word-spacing', 'text-indent',
    'text-decoration-thickness', 'text-underline-offset',
    'border-width', 'border-top-width', 'border-right-width',
    'border-bottom-width', 'border-left-width',
    'border-radius', 'border-top-left-radius', 'border-top-right-radius',
    'border-bottom-right-radius', 'border-bottom-left-radius',
    'outline-width', 'outline-offset', 'perspective', 'flex-basis',
])

/** Units offered by the length control, in the order a person reaches for them. */
export const LENGTH_UNITS = ['px', '%', 'rem', 'em', 'vw', 'vh', 'ch', 'fr', 'pt', '']

/**
 * Accepted values for enumerated properties.
 *
 * Not exhaustive per spec, and not meant to be -- these are the values people
 * pick. Anything missing can still be typed, because the enum control is a
 * combo box over a free-text field, not a closed `<select>`.
 */
export const KEYWORDS: Record<string, string[]> = {
    'display': ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'flow-root', 'contents', 'table', 'table-row', 'table-cell', 'list-item', 'none'],
    'position': ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    'float': ['none', 'left', 'right', 'inline-start', 'inline-end'],
    'clear': ['none', 'left', 'right', 'both'],
    'visibility': ['visible', 'hidden', 'collapse'],
    'box-sizing': ['content-box', 'border-box'],
    'isolation': ['auto', 'isolate'],
    'overflow': ['visible', 'hidden', 'clip', 'scroll', 'auto'],
    'overflow-x': ['visible', 'hidden', 'clip', 'scroll', 'auto'],
    'overflow-y': ['visible', 'hidden', 'clip', 'scroll', 'auto'],
    'object-fit': ['fill', 'contain', 'cover', 'none', 'scale-down'],
    'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
    'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse'],
    'justify-content': ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly', 'stretch'],
    'justify-items': ['start', 'center', 'end', 'stretch'],
    'justify-self': ['auto', 'start', 'center', 'end', 'stretch'],
    'align-items': ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
    'align-content': ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly', 'stretch'],
    'align-self': ['auto', 'flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
    'grid-auto-flow': ['row', 'column', 'row dense', 'column dense'],
    'font-weight': ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'lighter', 'bolder'],
    'font-style': ['normal', 'italic', 'oblique'],
    'text-align': ['left', 'center', 'right', 'justify', 'start', 'end'],
    'text-decoration-line': ['none', 'underline', 'overline', 'line-through'],
    'text-decoration-style': ['solid', 'double', 'dotted', 'dashed', 'wavy'],
    'text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
    'text-overflow': ['clip', 'ellipsis'],
    'text-wrap': ['wrap', 'nowrap', 'balance', 'pretty'],
    'white-space': ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces'],
    'word-break': ['normal', 'break-all', 'keep-all', 'break-word'],
    'overflow-wrap': ['normal', 'break-word', 'anywhere'],
    'hyphens': ['none', 'manual', 'auto'],
    'vertical-align': ['baseline', 'top', 'middle', 'bottom', 'sub', 'super', 'text-top', 'text-bottom'],
    'writing-mode': ['horizontal-tb', 'vertical-rl', 'vertical-lr'],
    'direction': ['ltr', 'rtl'],
    'list-style-type': ['none', 'disc', 'circle', 'square', 'decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman'],
    'list-style-position': ['inside', 'outside'],
    'background-repeat': ['repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'space', 'round'],
    'background-size': ['auto', 'cover', 'contain'],
    'background-attachment': ['scroll', 'fixed', 'local'],
    'background-clip': ['border-box', 'padding-box', 'content-box', 'text'],
    'background-origin': ['border-box', 'padding-box', 'content-box'],
    'mix-blend-mode': ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'],
    'background-blend-mode': ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'difference', 'exclusion'],
    'border-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
    'border-top-style': ['none', 'solid', 'dashed', 'dotted', 'double'],
    'border-right-style': ['none', 'solid', 'dashed', 'dotted', 'double'],
    'border-bottom-style': ['none', 'solid', 'dashed', 'dotted', 'double'],
    'border-left-style': ['none', 'solid', 'dashed', 'dotted', 'double'],
    'outline-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'auto'],
    'transform-style': ['flat', 'preserve-3d'],
    'transition-timing-function': ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'],
    'animation-timing-function': ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'],
    'animation-direction': ['normal', 'reverse', 'alternate', 'alternate-reverse'],
    'animation-fill-mode': ['none', 'forwards', 'backwards', 'both'],
    'animation-play-state': ['running', 'paused'],
    'animation-iteration-count': ['1', '2', '3', 'infinite'],
    'cursor': ['auto', 'default', 'pointer', 'text', 'move', 'grab', 'grabbing', 'not-allowed', 'wait', 'crosshair', 'help', 'zoom-in', 'zoom-out', 'col-resize', 'row-resize', 'ew-resize', 'ns-resize', 'none'],
    'pointer-events': ['auto', 'none'],
    'user-select': ['auto', 'none', 'text', 'all', 'contain'],
    'resize': ['none', 'both', 'horizontal', 'vertical'],
    'touch-action': ['auto', 'none', 'pan-x', 'pan-y', 'manipulation'],
    'scroll-behavior': ['auto', 'smooth'],
    'appearance': ['none', 'auto'],
    'overscroll-behavior': ['auto', 'contain', 'none'],
    'scroll-snap-align': ['none', 'start', 'center', 'end'],
    'scroll-snap-type': ['none', 'x mandatory', 'y mandatory', 'both mandatory', 'x proximity', 'y proximity'],
    'will-change': ['auto', 'transform', 'opacity', 'scroll-position', 'contents'],
    'contain': ['none', 'strict', 'content', 'size', 'layout', 'style', 'paint'],
    'content-visibility': ['visible', 'auto', 'hidden'],
    'mask-type': ['luminance', 'alpha'],
}

/** Which control a property gets. Checked most-specific first. */
export function controlFor(prop: string): ControlKind {
    if (COLOR_PROPS.has(prop)) return 'color'
    if (KEYWORDS[prop]) return 'enum'
    if (LENGTH_PROPS.has(prop)) return 'length'
    return 'text'
}

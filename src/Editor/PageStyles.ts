/**
 * PageStyles.ts — the sheet, drawn.
 *
 * Everything `page` layout needs on screen and on paper, injected at runtime rather than
 * shipped in `wui.css`. Two reasons for that:
 *
 *  - it is dead weight for every editor that never leaves `flow`, which is most of them;
 *  - it carries values the host configures — page size, the overflow warning's wording —
 *    and a static file cannot.
 *
 * Custom properties do the configuring, so the RULES are constant and the same text
 * serves every editor on the page. It goes in as a style element -- in the editor's
 * shadow root when it is in one, in the document head otherwise -- so it never touches
 * the host's build, its cascade order, or its class names. See ensurePageStyles for why
 * it is an element and not a constructed stylesheet.
 */

import {
    LAYOUT_ATTR, Layout, PAGE_ATTR, PAGE_CHROME_ATTR, OVERFLOW_ATTR,
    PAGE_SCALE_VAR, PAGE_W_VAR, PAGE_H_VAR, OVERFLOW_LABEL_VAR,
} from './PageLayout'

/**
 * Built on first use, not at module scope.
 *
 * PageLayout imports this module and this module imports PageLayout's constants back —
 * a cycle, and in a cycle whichever module the bundle enters second sees the other's
 * `const`s still uninitialised. Deferring the interpolation to call time means the
 * constants are always there by the time they are read.
 */
const buildCss = () => `
/* The light-box the sheets float in.

   \`zoom\`, not \`transform: scale()\`. A transform paints the sheet smaller but leaves its
   hit-testing and caret geometry at full size, so on a narrow window clicks land in the
   wrong place and typed characters appear where the pointer is not. \`zoom\` scales layout
   itself, so the editor keeps working. fitScale() sets the property from the parent's
   width; the fallback of 1 means an unmeasured surface is simply full size.

   \`!important\` on the padding because the editor surface hands out its own spacing and a
   host stylesheet may add more: in page mode the backdrop's padding is the only gap that
   should exist between the scroll edge and the paper. */
[${LAYOUT_ATTR}="${Layout.page}"] {
    background: #e2e8f0;
    padding: 1rem 0 !important;
    zoom: var(${PAGE_SCALE_VAR}, 1);
}

/* One sheet.

   No padding, deliberately. A page in \`page\` mode has to be the same box the printer
   gets, and the print path is \`@page { margin: 0 }\` with the document's own margins
   living inside its blocks. Padding here would be margin the proof shows and the paper
   does not.

   And no \`flow-root\` / \`overflow: hidden\`: the first child's top margin and the last
   one's bottom margin are LEFT to collapse out through the sheet, which is what a page
   box does too. It is also what lets a block that is exactly one page tall fit its sheet
   instead of being flagged as a few pixels too big. The numbering strip is out of flow,
   so it does not interrupt that collapse. */
[${PAGE_ATTR}] {
    position: relative;
    box-sizing: border-box;
    width: calc(var(${PAGE_W_VAR}, 209) * 1mm);
    min-height: calc(var(${PAGE_H_VAR}, 296) * 1mm);
    margin: 0 auto 1rem;
    background: #fff;
    box-shadow: 0 1px 3px rgba(15, 23, 42, .25);
    /* The overflow rule and the numbering strip are drawn AT the paper edge and must not
       be clipped by it — and a sheet must never hide content it failed to fit. */
    overflow: visible;
    break-after: page;
    page-break-after: always;
}

/* The last sheet does not end in a page break. Without this every print run ends on a
   blank sheet — the paper twin of the trailing empty page these previews are famous for. */
[${PAGE_ATTR}]:last-child {
    break-after: auto;
    page-break-after: auto;
    margin-bottom: 0;
}

/* A block taller than one page.

   It is not split and it is not clipped: it is SAID OUT LOUD. reflowOverflow() can only
   break BETWEEN children, and line-level fragmentation inside one block is something only
   real paged media does, so the honest options are a visible warning or a silent lie. The
   rule is drawn exactly where the paper ends, so the author can see how much is over and
   decide where to put a break. */
[${PAGE_ATTR}][${OVERFLOW_ATTR}] {
    outline: 2px solid #f97316;
}

[${PAGE_ATTR}][${OVERFLOW_ATTR}]::after {
    content: var(${OVERFLOW_LABEL_VAR}, "");
    position: absolute;
    left: 0;
    right: 0;
    top: calc(var(${PAGE_H_VAR}, 296) * 1mm);
    border-top: 2px dashed #f97316;
    padding: 2px 6px;
    font-size: 10px;
    line-height: 14px;
    color: #c2410c;
    background: rgba(249, 115, 22, .08);
    pointer-events: none;
    user-select: none;
}

/* "Page N / M".

   CSS \`counter(page)\` only exists in paged media — on screen it resolves to nothing,
   which is why a WYSIWYG preview of this shape always shows a blank page number.
   numberSheets() writes real numbers instead, and this strip is hidden in print so the
   two mechanisms never both appear.

   Anchored to \`top\`, not \`bottom\`: a sheet that overflowed is TALLER than a page, and a
   bottom-anchored strip would drift down with it, away from the paper edge it labels.
   Absolute, so it contributes no height and cannot itself push a sheet into overflow. */
[${PAGE_CHROME_ATTR}] {
    position: absolute;
    left: 0;
    right: 0;
    top: calc((var(${PAGE_H_VAR}, 296) - 12) * 1mm);
    height: 6mm;
    text-align: center;
    font-size: 9pt;
    line-height: 6mm;
    color: #94a3b8;
    pointer-events: none;
    user-select: none;
}

/* ── printing FROM page mode ───────────────────────────────────────────────
   The sheets are already the right size, so print's job is only to take the screen
   furniture away — and to make sure nothing in the chain clips or caps.

   \`overflow\` and \`max-height\`, deliberately NOT \`height\`: the editor surface is a
   scroll container with an inline \`max-height\`, and a printed scroll container emits one
   page and drops the rest. \`height: auto\` would have been the reflex, and it would have
   flattened the height of any block that means its own. */
@media print {

    [${LAYOUT_ATTR}="${Layout.page}"] {
        background: none;
        padding: 0 !important;
        zoom: 1;
    }

    [${PAGE_ATTR}] {
        margin: 0;
        box-shadow: none;
        outline: none;
    }

    [${PAGE_ATTR}][${OVERFLOW_ATTR}]::after,
    [${PAGE_CHROME_ATTR}] {
        display: none;
    }

    [${LAYOUT_ATTR}="${Layout.page}"],
    [${PAGE_ATTR}] {
        overflow: visible !important;
        max-height: none !important;
    }
}
`

/** Marks our style element so a second call can find it instead of adding another. */
const STYLE_MARK = 'data-wui-page-styles'

/**
 * Make sure the page rules are live in whatever root `node` sits in.
 *
 * Idempotent per root, and cheap enough to call on every mode switch and every
 * pagination pass -- when the rules are already there it is one querySelector.
 *
 * A style ELEMENT, deliberately, where a constructed stylesheet would be the obvious
 * choice. Woby keeps its own registry of shadow roots and republishes to them with
 *
 *     shadowRoot.adoptedStyleSheets = allSheets     (woby/src/utils/stylesheets.ts)
 *
 * which is a whole-array replacement, not a merge. Anything adopted by anyone else is
 * discarded the next time a document stylesheet mutates -- and one reliably does, because
 * Tailwind's runtime injects a style tag when it meets class names it has not compiled
 * yet, which is exactly what restoring an undo snapshot hands it. So the page rules used
 * to survive the switch into `page` and then disappear a frame later, leaving the sheets
 * built but unstyled: full-width, transparent, no paper edge, page strips reading as
 * body text.
 *
 * An element is a child node. That republish does not touch it, and no coordination with
 * woby's cache is needed to keep it alive.
 */
export const ensurePageStyles = (node: HTMLElement) => {
    const doc = node.ownerDocument
    if (!doc) return
    const root = node.getRootNode()
    const shadow = (root as ShadowRoot).host ? root as ShadowRoot : null
    const target = shadow ?? doc.head
    // Queried rather than remembered: a WeakSet would still claim the styles were
    // installed after something removed the element, which is the failure this is here
    // to rule out.
    if (target.querySelector(`style[${STYLE_MARK}]`)) return

    const tag = doc.createElement('style')
    tag.setAttribute(STYLE_MARK, '')
    tag.textContent = buildCss()
    target.appendChild(tag)
}

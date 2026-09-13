/**
 * PageBlockPlugins.ts — the page-level blocks: `wui-cover-page`, `wui-watermark` and
 * `wui-page-break`.
 *
 * Both exist for the same reason: a full-bleed cover and a watermark are trivial to write
 * by hand (the editor demo does exactly that in raw HTML) and miserable to *edit* by hand,
 * because everything that makes them look right — the image, its crop, the scrim opacity,
 * the mark's angle — lives in a style attribute the property panel can only show as a wall
 * of CSS text. Wrapped as plugins, each of those becomes a typed row with a label.
 *
 * Both are plain `HTMLElement` subclasses rather than woby components, for the same reason
 * `CounterPlugin` is: they render into a shadow root from attributes and nothing else, so a
 * reactive runtime would buy nothing and would drag woby's rendering into a document the
 * host application may be serializing.
 *
 * ── What each one owns ───────────────────────────────────────────────────────────────────
 * The two answer the question "where does the page's content live?" in opposite ways, and
 * the difference is worth stating because it decides how a click behaves.
 *
 *   `wui-watermark` owns nothing. It has no light DOM at all: the mark is a shadow layer
 *   with `pointer-events: none`, and the paragraphs it sits behind are ordinary content
 *   *outside* the element. Clicking the page therefore always means "type here", which is
 *   why the element needs a deliberate handle to be selected at all — the corner chip.
 *
 *   `wui-cover-page` owns only the backdrop. Everything on top of it is slotted light DOM:
 *   a heading, a table, an image, whatever the author puts there, all of it as editable as
 *   the rest of the document. It is a background, not a template, so it has no `heading`
 *   attribute and no fixed slots to fill. `editableContent: true` tells the editor to split
 *   clicks accordingly — the photo selects the block, the words place the caret — because a
 *   container that selected itself every time you clicked its text would put the whole page
 *   one Backspace away from deletion.
 *
 * Both round-trip through the default `outerHTML` path, so neither needs `toHTML`/`fromHTML`.
 */

import { registerEditorPlugin, type PluginProp } from './EditorPlugin'
import { PAGE_H_VAR } from './PageLayout'
import { rgbTriple } from './colorUtils'
import { insertAsBlock, editImageAttr } from './BlockInsert'
import { onLocaleChange, t } from '../i18n'

/**
 * The sheet height, as a CSS length.
 *
 * `--wui-page-h` carries **unitless millimetres** — `applyLayout` sets it on the surface in
 * page mode and removes it in flow — so the multiplication by `1mm` happens here, and the
 * fallback (296, A4 less the 1mm that keeps mm→device-px rounding from spilling a trailing
 * blank page) is what these blocks use in flow mode where the property is absent.
 */
const PAGE_H = `calc(var(${PAGE_H_VAR}, 296) * 1mm)`

/** `document.createElement` with a class already on it — the shadow trees are small. */
const div = (cls: string) => {
    const el = document.createElement('div')
    el.className = cls
    return el
}

/** A `<style>` carrying `css`, built as a text node rather than through `innerHTML`. */
const sheet = (css: string) => {
    const el = document.createElement('style')
    el.textContent = css
    return el
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// wui-cover-page
// ─────────────────────────────────────────────────────────────────────────────────────────

/**
 * The cover's attribute fallbacks.
 *
 * Shared between the element and the plugin schema deliberately: the property panel drops an
 * attribute whose value equals `PluginProp.default`, so a schema default that disagrees with
 * the element's own fallback makes the widget silently revert the moment you set that value.
 */
const COVER = {
    src: '',
    deck: '',
    slide: '',
    ext: '.png',
    fit: 'cover',
    focus: 'center',
    bg: '#0f172a',
    overlay: 55,
    scrim: 'bottom',
    tint: '#0f172a',
    ink: '#ffffff',
    pad: 18,
    align: 'end',
}

/**
 * `src`, or the numbered-deck URL built from `deck` + `slide` + `ext`.
 *
 * The deck half is su-yen's `<sy-图页>` folded in. That element was this one under another
 * name - one A4 sheet whose whole surface is a picture, with the author's words over it -
 * differing only in that its picture was usually page N of an exported slide deck, so it
 * took a number rather than a URL: `前缀="/assets/images/bazistrategic/Slide" 页="7"` for
 * `/assets/images/bazistrategic/Slide7.png`. That is worth keeping, because the alternative
 * is pasting forty near-identical URLs that differ by one digit, and because renaming the
 * deck then means editing one attribute per page instead of forty.
 *
 * `src` wins when both are set, the same precedence 图页 had: an explicit URL is the more
 * specific statement, and it is how one page of a numbered deck gets replaced by a one-off.
 */
const coverSrc = (el: HTMLElement) => {
    const src = (el.getAttribute('src') ?? COVER.src).trim()
    if (src) return src
    const slide = (el.getAttribute('slide') ?? COVER.slide).trim()
    if (!slide) return ''
    return `${el.getAttribute('deck') ?? COVER.deck}${slide}${el.getAttribute('ext') ?? COVER.ext}`
}

/**
 * `break-before` only — never `break-after`. In page mode the block is already the sheet's
 * first child so the break is a no-op, but a `break-after` would fight PageStyles'
 * `:last-child` reset and print a trailing blank page. In flow mode this rule is the whole
 * pagination story, and it is what `cssBreak()` reads.
 *
 * `.content` deliberately covers the entire sheet rather than hugging the text it holds. It
 * is what makes the click split work: every pixel of the block that is not a word belongs to
 * a shadow node, so clicking the photo — anywhere on it — selects the block and opens the
 * panel, while clicking the words places the caret. A content box sized to its text would
 * leave most of the cover unclickable in both senses.
 */
const COVER_CSS = `
:host {
    display: block;
    margin: 0;
    position: relative;
    overflow: hidden;
    height: ${PAGE_H};
    /* The paper behind the picture. It shows wherever the picture does not reach: the
       letterbox bars under fit="contain", and the whole sheet before an image is chosen.
       Dark by default because a cover is a photograph, but a slide deck exported onto white
       needs white here or every page arrives with navy margins. */
    background: var(--wui-cover-bg, #0f172a);
    break-before: page;
    page-break-before: always;
    break-inside: avoid;
}
.bg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.hint {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font: 500 14px system-ui, sans-serif; color: #94a3b8;
    border: 1px dashed #334155;
}
/* Never intercepts a press: the tint lies over the photo, and a click has to reach a node
   the selection walk can see for the cover to be selectable at all. */
.tint { position: absolute; inset: 0; pointer-events: none; }
.content {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
/* The slot's wrapper, so slotted content lays out as ordinary block flow inside one flex
   item instead of becoming a row of flex items itself — an author's paragraphs have to
   behave the way paragraphs behave everywhere else in the document. */
.body { width: 100%; }
/* The one !important in this file, and it is load-bearing. Slotted content sits in the
   *outer* tree, and for normal declarations the outer tree wins the cascade — so a document
   stylesheet with a plain h1 { color: #1a1a1a } rule in it beats anything this shadow tree says
   about the ink, and a cover title comes out near-black on a dark photograph. Important
   declarations reverse that ordering, which is the only way a block can colour the content
   dropped into it.
   It costs nothing an author needs: colouring *text* still works, because the toolbar puts
   the colour on a span inside the block and ::slotted only ever reaches the top level. */
::slotted(*) { color: inherit !important; }
`

class WuiCoverPage extends HTMLElement {
    static get observedAttributes() { return ['src', 'deck', 'slide', 'ext', 'fit', 'focus', 'bg', 'overlay', 'scrim', 'tint', 'ink', 'pad', 'align'] }

    private img!: HTMLImageElement
    private hint!: HTMLElement
    private tint!: HTMLElement
    private content!: HTMLElement

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        if (!this.shadowRoot!.childElementCount) this.build()
        this.sync()
    }

    attributeChangedCallback() {
        if (this.shadowRoot?.childElementCount) this.sync()
    }

    private build() {
        this.img = document.createElement('img')
        this.img.alt = ''
        this.img.className = 'bg'
        this.img.setAttribute('part', 'image')

        this.hint = div('hint')
        this.hint.setAttribute('part', 'placeholder')
        this.hint.textContent = 'No cover image — set a URL, or a deck and a slide number, in the properties panel.'

        this.tint = div('tint')
        this.tint.setAttribute('part', 'scrim')

        const body = div('body')
        body.setAttribute('part', 'body')
        body.appendChild(document.createElement('slot'))

        this.content = div('content')
        this.content.setAttribute('part', 'content')
        this.content.appendChild(body)

        this.shadowRoot!.append(sheet(COVER_CSS), this.img, this.hint, this.tint, this.content)
    }

    private sync() {
        const attr = (n: string, d: string) => this.getAttribute(n) ?? d
        const num = (n: string, d: number) => {
            const v = Number(attr(n, String(d)))
            return Number.isFinite(v) ? v : d
        }

        const src = coverSrc(this)
        this.img.src = src
        this.img.style.display = src ? 'block' : 'none'
        this.hint.style.display = src ? 'none' : 'flex'
        this.img.style.objectFit = attr('fit', COVER.fit)
        this.img.style.objectPosition = attr('focus', COVER.focus)
        // A custom property rather than `style.background`, so the shadow rule stays the
        // single place the paper colour is written and the host's own style attribute is
        // the only thing this line touches.
        this.style.setProperty('--wui-cover-bg', attr('bg', COVER.bg))

        // Percent rather than a 0–1 fraction: the panel's number row steps by 1, which makes
        // a fraction a four-keystroke edit and a percentage a one-keystroke one.
        const a = Math.min(1, Math.max(0, num('overlay', COVER.overlay) / 100))
        const c = rgbTriple(attr('tint', COVER.tint))
        const stop = (at: number) => `rgba(${c},${at})`
        const scrim = attr('scrim', COVER.scrim)
        this.tint.style.background =
            scrim === 'none' ? 'none'
                : scrim === 'full' ? stop(a)
                    : scrim === 'top' ? `linear-gradient(to bottom, ${stop(a)}, ${stop(0)})`
                        : `linear-gradient(to top, ${stop(a)}, ${stop(0)})`

        // Set on `.content`, not on the host: inheritance into slotted content follows the
        // flat tree, so the shadow wrapper is what colours the author's text — and the host
        // keeps a clean `style` attribute in the serialized document.
        this.content.style.padding = `${num('pad', COVER.pad)}mm`
        this.content.style.color = attr('ink', COVER.ink)
        const align = attr('align', COVER.align)
        this.content.style.justifyContent =
            align === 'start' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end'
    }
}

if (!customElements.get('wui-cover-page')) customElements.define('wui-cover-page', WuiCoverPage)

const coverProps: PluginProp[] = [
    {
        name: 'src', type: 'string', label: 'Image',
        default: COVER.src,
        hint: 'Any URL or data URI. "Edit…" opens the crop/replace dialog.',
        action: {
            label: 'Edit…',
            title: 'Crop or replace the cover image',
            run: el => editImageAttr(el, 'src'),
        },
    },
    {
        name: 'deck', type: 'string', label: 'Deck', default: COVER.deck,
        hint: 'URL up to but not including the page number, e.g. /assets/deck/Slide. Used only when Image is empty.',
    },
    {
        name: 'slide', type: 'string', label: 'Slide no.', default: COVER.slide,
        hint: 'The number that finishes the deck URL. Empty means this page is not part of a deck.',
    },
    {
        name: 'ext', type: 'string', label: 'Deck file type', default: COVER.ext,
        hint: 'Whatever follows the number, extension included.',
    },
    {
        name: 'fit', type: 'enum', label: 'Fit', default: COVER.fit,
        options: [
            { value: 'cover', label: 'Cover (fill, crop)' },
            { value: 'contain', label: 'Contain (fit, letterbox)' },
            { value: 'fill', label: 'Fill (stretch)' },
        ],
    },
    {
        name: 'focus', type: 'enum', label: 'Focus', default: COVER.focus,
        hint: 'Which part of the image survives the crop.',
        options: [
            { value: 'center', label: 'Center' },
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
        ],
    },
    {
        name: 'scrim', type: 'enum', label: 'Scrim', default: COVER.scrim,
        hint: 'The wash of colour between photo and content that keeps text readable over a busy image.',
        options: [
            { value: 'bottom', label: 'Fade up from bottom' },
            { value: 'top', label: 'Fade down from top' },
            { value: 'full', label: 'Even, whole page' },
            { value: 'none', label: 'None (bare photo)' },
        ],
    },
    {
        name: 'overlay', type: 'number', label: 'Scrim %', default: COVER.overlay,
        hint: 'How strong that wash is, 0–100.',
    },
    {
        name: 'bg', type: 'color', label: 'Paper', default: COVER.bg,
        hint: 'Shows in the letterbox bars under Contain, and before an image is chosen.',
    },
    { name: 'tint', type: 'color', label: 'Scrim colour', default: COVER.tint },
    { name: 'ink', type: 'color', label: 'Text colour', default: COVER.ink },
    {
        name: 'pad', type: 'number', label: 'Padding (mm)', default: COVER.pad,
        hint: 'Space between the paper edge and the content sitting on the photo.',
    },
    {
        name: 'align', type: 'enum', label: 'Content at', default: COVER.align,
        options: [
            { value: 'start', label: 'Top' },
            { value: 'center', label: 'Middle' },
            { value: 'end', label: 'Bottom' },
        ],
    },
]

registerEditorPlugin({
    name: 'cover-page',
    order: -49,
    label: 'Cover page',
    tagName: 'wui-cover-page',
    props: coverProps,
    // A whole sheet of its own: the point of a cover is that nothing shares its page.
    pageBreak: 'own-page',
    // A backdrop, not a template: what sits on top of it is the author's, and clicking it
    // types rather than selects. See EditorPlugin.editableContent.
    editableContent: true,
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🖼️'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-cover-page')
        // Seeded with real content rather than left empty, because an empty cover gives the
        // caret nowhere to land: the block would be a photo you can select but not write on.
        const h = document.createElement('h1')
        h.textContent = 'Cover title'
        const p = document.createElement('p')
        p.textContent = 'Anything can go here — text, a table, another image.'
        el.append(h, p)
        insertAsBlock(editorRoot, range, el)
    },
})

// ─────────────────────────────────────────────────────────────────────────────────────────
// wui-watermark
// ─────────────────────────────────────────────────────────────────────────────────────────

/**
 * The built-in mark, used when neither `src` nor `text` is set.
 *
 * Inline rather than an asset URL so a watermarked document keeps working when it is
 * serialized out of the editor and opened somewhere with no access to this package.
 */
const DEFAULT_MARK = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" fill="none">' +
    '<circle cx="120" cy="120" r="112" stroke="#0f172a" stroke-width="6"/>' +
    '<path d="M52 84l26 78 26-58 26 58 26-78" stroke="#0f172a" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<text x="120" y="206" text-anchor="middle" font-family="system-ui, sans-serif" font-size="26" font-weight="700" fill="#0f172a" letter-spacing="10">WUI</text>' +
    '</svg>')}`

const MARK = {
    src: '',
    text: '',
    color: '#0f172a',
    opacity: 10,
    rotate: -24,
    size: 150,
}

/** `page` is a boolean whose default is true, so only an explicit `"false"` turns it off. */
const startsPage = (el: HTMLElement) => {
    const v = el.getAttribute('page')
    return v === null || v === '' || v === 'true'
}

/**
 * Zero host height, by design. The mark must not be a break candidate: give it any height at
 * all and `reflowOverflow()` counts it as content, and a full-page mark would push
 * everything after it onto the next sheet.
 *
 * The layer is pinned to the host and one page tall, so it covers the sheet the host starts
 * without needing a positioned ancestor it cannot count on having. It paints *over* the
 * following text rather than behind it, because "behind" would mean `z-index: -1`, and that
 * sinks the layer below the nearest opaque ancestor background — the white sheet — where it
 * is simply invisible. `mix-blend-mode: multiply` at 10% is indistinguishable from
 * behind-the-text and does not care about stacking contexts.
 */
const MARK_CSS = `
:host { display: block; position: relative; height: 0; margin: 0; }
.layer {
    position: absolute;
    left: 0; right: 0; top: 0;
    height: ${PAGE_H};
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    mix-blend-mode: multiply;
}
/* The rotation goes here and not on .layer, which is the whole reason this wrapper exists.
   overflow:hidden clips an element's *children*, never the element's own box, so a
   rotated .layer keeps a bounding box the size of its diagonal -- a 760px frame at -24deg
   measures 1149px across -- and an ancestor counts that box as scrollable overflow. The
   result was a horizontal scrollbar under the editor on any page carrying a mark, with
   nothing visible out there to scroll to. Rotating the contents instead leaves the frame
   axis-aligned and exactly the column's width, and .layer clips whatever spills. The mark
   is centred in the frame either way, so the two look identical. */
.mark { display: flex; align-items: center; justify-content: center; }
img { display: block; }
.word {
    font: 700 1em system-ui, sans-serif;
    letter-spacing: .08em;
    white-space: nowrap;
    text-transform: uppercase;
}
/* The handle. Hidden by default and shown only while the surface is editable -- see
   watchEditable(). pointer-events:auto is the point of it: the mark itself must stay
   click-through so the text over it can be typed in, which leaves the element with no
   surface of its own to aim at. Absolutely positioned off a zero-height host, so it adds
   nothing to the column and cannot be a break candidate either. */
.tag {
    display: none;
    position: absolute;
    left: 0; top: 0;
    align-items: center;
    gap: 4px;
    padding: 2px 7px 2px 5px;
    border: 1px solid #cbd5e1;
    border-radius: 0 0 6px 0;
    background: #f8fafc;
    color: #475569;
    font: 500 11px system-ui, sans-serif;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
}
.tag:hover { background: #eef2ff; border-color: #a5b4fc; color: #4338ca; }
/* Editor chrome, not content. Belt and braces: the surface is not editable when printing
   anyway, but a stray chip on paper is the one failure nobody would notice until it. */
@media print { .tag { display: none !important; } }
`

class WuiWatermark extends HTMLElement {
    static get observedAttributes() { return ['src', 'text', 'color', 'opacity', 'rotate', 'size', 'page'] }

    private layer!: HTMLElement
    private mark!: HTMLElement
    private img!: HTMLImageElement
    private word!: HTMLElement
    private tag!: HTMLElement
    private watching?: MutationObserver
    private offLocale?: () => void

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        if (!this.shadowRoot!.childElementCount) this.build()
        this.sync()
        this.watchEditable()
        this.offLocale = onLocaleChange(() => this.sync())
    }

    disconnectedCallback() {
        this.watching?.disconnect()
        this.watching = undefined
        this.offLocale?.()
        this.offLocale = undefined
    }

    attributeChangedCallback() {
        if (this.shadowRoot?.childElementCount) this.sync()
    }

    /**
     * Show the chip only while the document is being edited.
     *
     * `:host-context([contenteditable="true"])` would say this in one CSS line, but only
     * Chromium implements it -- so the state is read from the surface instead and mirrored
     * onto the chip. The observer is needed because editability is not fixed: the layout
     * switch turns `contenteditable` off for `screen` (read) mode and back on for the other
     * two, and a mark whose handle survived into read mode would be chrome in a page that
     * is supposed to look like the finished document.
     */
    private watchEditable() {
        this.watching?.disconnect()
        const surface = this.closest('[data-editor-root]') as HTMLElement | null
        const paint = () => {
            this.tag.style.display = surface?.getAttribute('contenteditable') === 'true' ? 'inline-flex' : 'none'
        }
        paint()
        if (!surface) return
        this.watching = new MutationObserver(paint)
        this.watching.observe(surface, { attributes: true, attributeFilter: ['contenteditable'] })
    }

    private build() {
        this.img = document.createElement('img')
        this.img.alt = ''
        this.img.setAttribute('part', 'mark')

        this.word = div('word')
        this.word.setAttribute('part', 'word')

        this.mark = div('mark')
        this.mark.append(this.img, this.word)

        this.layer = div('layer')
        this.layer.setAttribute('part', 'layer')
        this.layer.append(this.mark)

        this.tag = div('tag')
        this.tag.setAttribute('part', 'handle')
        // No click handler of its own: a press anywhere on the chip puts this host in the
        // event's composedPath, and the editor's own selection walk does the rest -- the
        // same path a click on any other plugin element takes. Stopping the default keeps
        // the press from also collapsing the caret into the paragraph underneath.
        this.tag.onpointerdown = e => e.preventDefault()

        this.shadowRoot!.append(sheet(MARK_CSS), this.layer, this.tag)
    }

    private sync() {
        // The chip's wording lives here, not in `build()`, so a locale change is just
        // another `sync()` -- a hand-built shadow tree has no binding to re-evaluate.
        this.tag.title = t('editor.watermark.hint')
        this.tag.textContent = t('editor.watermark.label')

        const attr = (n: string, d: string) => this.getAttribute(n) ?? d
        const num = (n: string, d: number) => {
            const v = Number(attr(n, String(d)))
            return Number.isFinite(v) ? v : d
        }

        const size = num('size', MARK.size)
        this.layer.style.opacity = String(Math.min(1, Math.max(0, num('opacity', MARK.opacity) / 100)))
        this.mark.style.transform = `rotate(${num('rotate', MARK.rotate)}deg)`

        // A word mark wins when it is set; otherwise the image, and the built-in mark when
        // neither has been chosen — so a freshly inserted watermark is visible immediately.
        const text = attr('text', MARK.text)
        const src = attr('src', MARK.src)
        if (text) {
            this.img.style.display = 'none'
            this.word.style.display = 'block'
            this.word.textContent = text
            this.word.style.color = attr('color', MARK.color)
            this.word.style.fontSize = `${size / 4}mm`
        } else {
            this.word.style.display = 'none'
            this.img.style.display = 'block'
            this.img.src = src || DEFAULT_MARK
            this.img.style.width = `${size}mm`
            this.img.style.height = `${size}mm`
        }
    }
}

if (!customElements.get('wui-watermark')) customElements.define('wui-watermark', WuiWatermark)

const watermarkProps: PluginProp[] = [
    {
        name: 'text', type: 'string', label: 'Word', default: MARK.text,
        hint: 'A word mark such as DRAFT. Takes precedence over the image.',
    },
    {
        name: 'src', type: 'string', label: 'Image', default: MARK.src,
        hint: 'Leave empty for the built-in WUI mark.',
        action: {
            label: 'Edit…',
            title: 'Crop or replace the watermark image',
            run: el => editImageAttr(el, 'src'),
        },
    },
    { name: 'color', type: 'color', label: 'Word colour', default: MARK.color },
    {
        name: 'opacity', type: 'number', label: 'Opacity %', default: MARK.opacity,
        hint: '10 is the usual weight for a mark that text stays readable over.',
    },
    { name: 'rotate', type: 'number', label: 'Angle °', default: MARK.rotate },
    { name: 'size', type: 'number', label: 'Size (mm)', default: MARK.size },
    {
        name: 'page', type: 'boolean', label: 'Start a new page', default: true,
        hint: 'Off marks the page the element already sits on instead of starting one.',
    },
]

registerEditorPlugin({
    name: 'watermark',
    order: -48,
    label: 'Watermark',
    tagName: 'wui-watermark',
    props: watermarkProps,
    // Not `own-page`: the mark is a layer over a page whose content is *other* elements, so
    // it wants a break before it and none after.
    pageBreak: el => (startsPage(el) ? 'before' : 'none'),
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '💧'
        return span
    },
    onInsert: (editorRoot, range) => {
        insertAsBlock(editorRoot, range, document.createElement('wui-watermark'))
    },
})

// -----------------------------------------------------------------------------------------
// wui-page-break
// -----------------------------------------------------------------------------------------

/**
 * Where the break falls when the attribute is absent, and what the marker calls itself when
 * the author has not named it.
 *
 * `where` defaults to `before` because that is what "insert a page break here" means to
 * someone who has just put the caret above a heading: the heading starts the new sheet.
 * `after` is the other reading — end the page once this block is done — and is exactly the
 * case the function form of `pageBreak` was added for.
 *
 * These constants are also what the plugin descriptor declares as `default`. They must stay
 * a single source: a `PluginProp.default` that disagrees with the element's own fallback
 * makes the panel strip the attribute as "unset" and the widget silently revert.
 */
const BREAK_WHERE = 'before'
const BREAK_LABEL = ''

/**
 * Two layouts, and the element is a different shape in each.
 *
 * In `flow` nothing on screen says a page ends here, so the element IS the statement: a
 * dashed rule with a label, taking real height in the column. In `page` the sheet boundary
 * already says it — there is a gap, a shadow and a new numbered sheet — so a second
 * announcement would be noise, and worse, it would be height. `reflowOverflow()` measures
 * flow-level children, and a marker keeping 30px at the top of every sheet would push the
 * last line of each page onto the next one. Same reason `wui-watermark` is zero tall.
 *
 * The collapse is done by hiding `.rule`, not by sizing the host: a block box with no
 * in-flow content, no padding and no border is already zero tall, so `display: none` on the
 * child is the entire mechanism — and it leaves the host's box model alone, which matters
 * because nothing here may write to the host. See `paint()`.
 *
 * Which leaves selection. Hidden chrome cannot be clicked, and a stray break that can only
 * be removed by switching layouts is a trap, so `page` keeps a chip — the same handle the
 * watermark needs for the same reason, absolutely positioned off a zero-height host so it
 * costs the column nothing.
 */
const BREAK_CSS = `
:host { display: block; position: relative; margin: 0; }
.rule {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    color: #64748b;
    font: 500 11px system-ui, sans-serif;
    letter-spacing: .06em;
    text-transform: uppercase;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
}
.line { flex: 1; border-top: 1px dashed #94a3b8; }
.tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 1px 7px;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    background: #f8fafc;
    white-space: nowrap;
}
.rule:hover .tag { background: #eef2ff; border-color: #a5b4fc; color: #4338ca; }
.rule:hover .line { border-color: #a5b4fc; }
/* In the gutter beside the paper, not on it. Anchored inside the sheet the chip lands on
   the first line of the page — which is exactly where a break-before puts it, so it
   covered the opening words of every heading it was meant to label. Sheets are laid out
   with overflow visible, so right: 100% walks it out past the left paper edge into the
   grey, where it overlaps nothing.

   At a viewport too narrow to leave a gutter the chip is simply clipped: content to the
   left of a scroll container's origin is unreachable rather than scrollable, so this
   costs a handle at small sizes and never a stray horizontal scrollbar. Flow layout
   still shows the full marker, which is where breaks are meant to be managed anyway. */
.chip {
    display: none;
    position: absolute;
    right: 100%;
    top: 0;
    margin-right: 6px;
    align-items: center;
    gap: 4px;
    padding: 1px 6px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #f8fafc;
    color: #475569;
    font: 500 10px system-ui, sans-serif;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
}
.chip:hover { background: #eef2ff; border-color: #a5b4fc; color: #4338ca; }
/* Both are editor chrome. The rule especially: printed, it is a stray dashed line across
   the top of a page that has already ended — the kind of thing nobody notices until it is
   on paper. */
@media print { .rule, .chip { display: none !important; } }
`

class WuiPageBreak extends HTMLElement {
    static get observedAttributes() { return ['where', 'label'] }

    private rule!: HTMLElement
    private tag!: HTMLElement
    private chip!: HTMLElement
    private watching?: MutationObserver
    private offLocale?: () => void

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        if (!this.shadowRoot!.childElementCount) this.build()
        this.sync()
        this.watchSurface()
        this.offLocale = onLocaleChange(() => this.sync())
    }

    disconnectedCallback() {
        this.watching?.disconnect()
        this.watching = undefined
        this.offLocale?.()
        this.offLocale = undefined
    }

    attributeChangedCallback() {
        if (this.shadowRoot?.childElementCount) this.sync()
    }

    private build() {
        this.tag = div('tag')
        this.tag.setAttribute('part', 'tag')

        this.rule = div('rule')
        this.rule.setAttribute('part', 'rule')
        this.rule.append(div('line'), this.tag, div('line'))

        this.chip = div('chip')
        this.chip.setAttribute('part', 'handle')

        // No click handlers. A press anywhere in this shadow root puts the host in the
        // event's composedPath and the editor's own selection walk does the rest; all that
        // needs stopping is the default, so the press does not also drop the caret into
        // whichever paragraph the marker happens to sit between.
        this.rule.onpointerdown = e => e.preventDefault()
        this.chip.onpointerdown = e => e.preventDefault()

        this.shadowRoot!.append(sheet(BREAK_CSS), this.rule, this.chip)
    }

    private sync() {
        const label = this.getAttribute('label') || BREAK_LABEL
        const where = this.getAttribute('where') === 'after' ? 'after' : BREAK_WHERE
        this.tag.textContent = label || (where === 'after' ? t('editor.page.endsHere') : t('editor.page.break'))
        this.chip.textContent = t('editor.page.breakChip')
        this.chip.title = label
            ? t('editor.page.breakHintNamed', { label })
            : t('editor.page.breakHint')
    }

    /**
     * Follow the surface's layout mode and its editability.
     *
     * One observer for both, because both answers change for the same reason: `applyLayout`
     * writes `data-layout` and flips `contenteditable` in the same pass.
     *
     * `:host-context([data-layout="page"])` would express this in one CSS line and is
     * Chromium-only, which is why `wui-watermark` mirrors surface state through an observer
     * too. Everything decided here lands on shadow nodes and nothing else: writing the mode
     * onto the host as an attribute would be shorter, and it would also be a document
     * mutation — the editor's MutationObserver would bank an undo entry for it and
     * `unpaginatedHTML` would bake it into every snapshot. Changing layout is not an edit
     * and must leave no trace in the markup.
     */
    private watchSurface() {
        this.watching?.disconnect()
        const surface = this.closest('[data-editor-root]') as HTMLElement | null
        this.paint(surface)
        if (!surface) return
        this.watching = new MutationObserver(() => this.paint(surface))
        this.watching.observe(surface, { attributes: true, attributeFilter: ['data-layout', 'contenteditable'] })
    }

    private paint(surface: HTMLElement | null) {
        // The same test NOT_PAGED makes in CSS, for the same reason: a surface that has
        // never been through applyLayout carries no data-layout at all, and that is flow.
        const mode = surface?.getAttribute('data-layout')
        const paged = mode === 'page' || mode === 'screen'
        const editable = surface?.getAttribute('contenteditable') === 'true'
        this.rule.style.display = paged ? 'none' : 'flex'
        this.chip.style.display = paged && editable ? 'inline-flex' : 'none'
    }
}

if (!customElements.get('wui-page-break')) customElements.define('wui-page-break', WuiPageBreak)

registerEditorPlugin({
    name: 'page-break',
    order: -47,
    label: 'Page Break',
    tagName: 'wui-page-break',
    props: [
        {
            name: 'where', type: 'enum', label: 'Break', default: BREAK_WHERE,
            options: [
                { value: 'before', label: 'Page starts here' },
                { value: 'after', label: 'Page ends here' },
            ],
            hint: 'Before puts what follows at the top of a new sheet. After ends the sheet at this point.',
        },
        {
            name: 'label', type: 'string', label: 'Name', default: BREAK_LABEL,
            hint: 'Shown on the marker in Flow layout. Empty reads "Page break".',
        },
    ],
    // The case the function form of pageBreak exists for: the answer is an attribute the
    // author flips in the property panel, so it cannot be a constant. Anything that is not
    // exactly 'after' is 'before' — the same reading sync() makes, and the two have to
    // agree or the marker would name one break while the paginator made another.
    pageBreak: el => (el.getAttribute('where') === 'after' ? 'after' : 'before'),
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '✂️'
        return span
    },
    onInsert: (editorRoot, range) => {
        insertAsBlock(editorRoot, range, document.createElement('wui-page-break'))
    },
})


/* --------------------------------------------------------------------------
   <wui-rule> - a decorative horizontal rule.

   `execCommand('insertHorizontalRule')` is what a contenteditable surface can do on its
   own, and it produces a bare <hr> that the document stylesheet then draws however it
   likes. That is fine for a divider and useless for a *device*: a book needs a rule it can
   narrow, centre, colour, and - twice - draw as something that is not a border at all.
   The gradient variant fades out at both ends, and the ornament variant is two half-rules
   with a glyph between them; neither is expressible as a border on one element.

   Promoted from su-yen's `<sy-横线>`, which had the same six controls as closed enums -
   `粗="thick"`, `色="gold"`, `宽="1/2"` - because it indexed literal Tailwind class strings
   and Tailwind only generates classes it can see in source text. Nothing here is a class,
   so the enums that were only ever a build-system workaround become open values: `weight`
   is a number of pixels, `color` is a colour and `width` a CSS length, which is what an
   author meant anyway. The two that are genuinely closed sets - variant and align - stay
   enums.
   -------------------------------------------------------------------------- */

/**
 * Shared between the element and the plugin schema, for the reason COVER states: the panel
 * drops an attribute equal to `PluginProp.default`, so the two must agree exactly.
 *
 * The values are su-yen's own defaults translated once - `thin` was `border-t` (1px),
 * `slate` was `border-slate-300` (#cbd5e1), `full` was `w-full` - so a stored `<sy-横线>`
 * with no attributes on it migrates to a `<wui-rule>` with no attributes on it and draws
 * the identical line.
 */
const RULE = {
    variant: 'solid',
    weight: 1,
    color: '#cbd5e1',
    width: '100%',
    align: 'center',
    glyph: '\u2756',
}

/**
 * `.wrap` carries the width and the alignment for all three shapes; only what is drawn
 * inside it changes. Alignment is auto margins rather than a flex parent, because that is
 * the one mechanism that works whether the rule is full width (both autos collapse to
 * nothing) or narrowed (they do the centring).
 *
 * The `<hr>` gets its borders zeroed first: a UA stylesheet gives it an inset border on
 * all four sides, and a rule drawn as `border-top` on top of that is a rule with a box
 * around it.
 */
const RULE_CSS = `
:host { display: block; margin: 0; }
/* The padding is the hit box, and it is the whole reason a rule is selectable.
   A 1px solid rule makes a 1px-tall block, and a 1px target cannot be clicked: the press
   lands on the surface behind it, the selection walk never sees <wui-rule> in its
   composedPath, and the property panel this plugin exists to offer is unreachable. Cover
   page makes the same point from the other side -- every pixel of a block that is not a
   word has to belong to the block, or the block cannot be selected at all.
   It also restores the breathing room the built-in 'Horizontal Rule' menu item used to
   insert as my-4. That item is gone now, so this is the only rule an author can get.

   On .wrap and not on :host, which is where it was written first and does not work. A
   :host rule carries a normal declaration from the *inner* tree, and for normal
   declarations the outer tree always wins regardless of specificity -- the editor adopts
   Tailwind's preflight, whose "*, ::after, ::before { padding: 0 }" is an outer-tree rule
   that matches this host and silently zeroed it. The same cascade rule is why cover page
   needs !important on ::slotted(*). .wrap is inside this shadow tree, where a star selector in the
   outer tree cannot reach it, so no !important is needed and an author's own CSS still
   wins on the host.
   box-sizing so a width of 100% stays 100% once the padding is on it. */
.wrap { box-sizing: border-box; padding: 0.5rem 0; }
hr.line { border: 0 none; margin: 0; padding: 0; width: 100%; }
.grad { width: 100%; }
.orn { display: flex; align-items: center; gap: 0.75rem; }
.orn .arm { flex: 1 1 auto; border: 0 none; }
.orn .glyph { flex: 0 0 auto; font-size: 0.75rem; line-height: 1; }
`

class WuiRule extends HTMLElement {
    static get observedAttributes() { return ['variant', 'weight', 'color', 'width', 'align', 'glyph'] }

    private wrap!: HTMLElement
    private line!: HTMLElement
    private grad!: HTMLElement
    private orn!: HTMLElement
    private arms!: HTMLElement[]
    private glyph!: HTMLElement

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        if (!this.shadowRoot!.childElementCount) this.build()
        this.sync()
    }

    attributeChangedCallback() {
        if (this.shadowRoot?.childElementCount) this.sync()
    }

    /**
     * All three shapes are built once and shown one at a time. Rebuilding the subtree on
     * every attribute change would be shorter to write and would also make each keystroke
     * in the panel's colour field destroy and recreate a node - the editor's
     * MutationObserver sits on the light tree, not this one, so it would not bank an undo
     * entry, but the flicker is real and free to avoid.
     */
    private build() {
        this.line = document.createElement('hr')
        this.line.className = 'line'
        this.line.setAttribute('part', 'line')

        this.grad = div('grad')
        this.grad.setAttribute('part', 'line')

        this.arms = [div('arm'), div('arm')]
        this.glyph = document.createElement('span')
        this.glyph.className = 'glyph'
        this.glyph.setAttribute('part', 'glyph')
        this.orn = div('orn')
        this.orn.setAttribute('part', 'line')
        this.orn.append(this.arms[0], this.glyph, this.arms[1])

        this.wrap = div('wrap')
        this.wrap.setAttribute('part', 'wrap')
        this.wrap.append(this.line, this.grad, this.orn)

        this.shadowRoot!.append(sheet(RULE_CSS), this.wrap)
    }

    private sync() {
        const attr = (n: string, d: string) => this.getAttribute(n) ?? d
        const variant = attr('variant', RULE.variant)
        const color = attr('color', RULE.color)

        const raw = Number(attr('weight', String(RULE.weight)))
        // A double border has to fit two strokes and the gap between them; below 3px the
        // browser draws one line and the variant silently stops being a double rule. This
        // is the same allowance su-yen's 粗细表 made by starting `double` at 4px.
        const weight = Math.max(variant === 'double' ? 3 : 1, Number.isFinite(raw) ? raw : RULE.weight)

        this.wrap.style.width = attr('width', RULE.width)
        const align = attr('align', RULE.align)
        this.wrap.style.marginLeft = align === 'start' ? '0' : 'auto'
        this.wrap.style.marginRight = align === 'end' ? '0' : 'auto'

        const shape = variant === 'gradient' ? 'grad' : variant === 'ornament' ? 'orn' : 'line'
        this.line.style.display = shape === 'line' ? 'block' : 'none'
        this.grad.style.display = shape === 'grad' ? 'block' : 'none'
        this.orn.style.display = shape === 'orn' ? 'flex' : 'none'

        if (shape === 'line') {
            this.line.style.borderTopStyle = variant
            this.line.style.borderTopWidth = `${weight}px`
            this.line.style.borderTopColor = color
        }

        if (shape === 'grad') {
            // Driven by `color` like every other shape. su-yen's version hard-coded
            // slate-400 here, which made the colour control a lie for exactly this one
            // setting; the fade is the shape, not the hue.
            const c = rgbTriple(color)
            this.grad.style.height = `${weight}px`
            this.grad.style.background =
                `linear-gradient(to right, rgba(${c},0), rgba(${c},1) 50%, rgba(${c},0))`
        }

        if (shape === 'orn') {
            for (const arm of this.arms) {
                arm.style.borderTopStyle = 'solid'
                arm.style.borderTopWidth = `${weight}px`
                arm.style.borderTopColor = color
            }
            this.glyph.style.color = color
            this.glyph.textContent = attr('glyph', RULE.glyph)
        }
    }
}

if (!customElements.get('wui-rule')) customElements.define('wui-rule', WuiRule)

const ruleProps: PluginProp[] = [
    {
        // Not `style`: that is a reserved HTML attribute, and an element whose appearance
        // is driven by its own `style=` could not also carry an author's inline CSS.
        name: 'variant', type: 'enum', label: 'Style', default: RULE.variant,
        hint: 'Gradient fades out at both ends; ornament splits the rule around a glyph.',
        options: [
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' },
            { value: 'double', label: 'Double' },
            { value: 'gradient', label: 'Gradient (fades out)' },
            { value: 'ornament', label: 'Ornament (glyph in the middle)' },
        ],
    },
    {
        name: 'weight', type: 'number', label: 'Thickness (px)', default: RULE.weight,
        hint: 'Double is held at 3px minimum - below that a browser draws one line, not two.',
    },
    { name: 'color', type: 'color', label: 'Colour', default: RULE.color },
    {
        name: 'width', type: 'string', label: 'Width', default: RULE.width,
        hint: 'Any CSS length: 100%, 50%, 60mm.',
    },
    {
        name: 'align', type: 'enum', label: 'Align', default: RULE.align,
        hint: 'Only visible once the rule is narrower than its column.',
        options: [
            { value: 'start', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'end', label: 'Right' },
        ],
    },
    {
        name: 'glyph', type: 'string', label: 'Ornament', default: RULE.glyph,
        hint: 'Used by the ornament style only.',
    },
]

registerEditorPlugin({
    name: 'rule',
    order: -46,
    label: 'Rule',
    tagName: 'wui-rule',
    props: ruleProps,
    // No `pageBreak` and no `editableContent`: a rule holds nothing and starts nothing. It
    // is a block only so that it takes the full column and cannot end up sharing a line
    // with the paragraph it is there to separate.
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '\u2796'
        return span
    },
    onInsert: (editorRoot, range) => {
        insertAsBlock(editorRoot, range, document.createElement('wui-rule'))
    },
})


export { WuiCoverPage, WuiWatermark, WuiPageBreak, WuiRule, DEFAULT_MARK }

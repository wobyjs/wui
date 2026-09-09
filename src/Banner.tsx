import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, type CustomElementChildren, HtmlBoolean, HtmlClass, HtmlNumber, HtmlString } from "woby"
import '@woby/chk'
import './input.css'
import { registerBaseCls } from './helper/baseCls'
import { rgbTriple } from './Editor/colorUtils'

/**
 * Banner.tsx — `wui-banner`, the strip that heads a page.
 *
 * Modelled on su-yen's `<sy-banner>` — a logo, then a line of white text over a photographic
 * strip — but generalised, because that banner hard-codes everything about itself: one image
 * baked into a Tailwind class, one width (209mm, the printable width of A4), one text colour,
 * and a `noLogo` boolean whose only job is to say "not that one logo". None of that survives
 * contact with a second document. Here the picture, the wash of colour over it, the ink, the
 * height and the logo are all attributes, and `print` is what opts back into the su-yen
 * sizing for a document that is going onto paper.
 *
 * ── What it owns ─────────────────────────────────────────────────────────────────────────
 * The backdrop, and nothing else. What reads *on* the banner is slotted light DOM — a
 * heading, a line of text, a table if the author wants one — so it stays as editable as the
 * rest of the document and round-trips through the ordinary `outerHTML` path. The plugin
 * registration in `Editor/WuiPlugins.ts` marks it `editableContent: true`, which splits a
 * click: the backdrop selects the block and opens the property panel, the words place the
 * caret.
 *
 * Unlike `wui-cover-page` this is a woby component rather than a bare `HTMLElement`, because
 * it is a widget in the same family as the rest of `src/*.tsx` — it has variants, and it has
 * the `cls`/`class` override every wui component has. It is also the first of them to render
 * a `<style>` into its shadow root; see {@link BANNER_CSS} for why it has to.
 */

type BgType = 'image' | 'solid' | 'gradient'
type Scrim = 'left' | 'right' | 'top' | 'bottom' | 'full' | 'none'
type Focus = 'center' | 'top' | 'bottom' | 'left' | 'right'
type Align = 'start' | 'center' | 'end'

type BannerProps = {
    children?: ObservableMaybe<JSX.Child> & CustomElementChildren
    class?: ObservableMaybe<JSX.Class>
    cls?: ObservableMaybe<JSX.Class>
    type?: ObservableMaybe<BgType>
    src?: ObservableMaybe<string>
    focus?: ObservableMaybe<Focus>
    tint?: ObservableMaybe<string>
    tint2?: ObservableMaybe<string>
    scrim?: ObservableMaybe<Scrim>
    overlay?: ObservableMaybe<number>
    ink?: ObservableMaybe<string>
    shadow?: ObservableMaybe<boolean>
    height?: ObservableMaybe<string>
    pad?: ObservableMaybe<string>
    align?: ObservableMaybe<Align>
    logo?: ObservableMaybe<string>
    logoHeight?: ObservableMaybe<string>
    print?: ObservableMaybe<boolean>
}

/**
 * The banner's attribute fallbacks.
 *
 * Exported and shared with the plugin schema in `Editor/WuiPlugins.ts` on purpose: the
 * property panel drops an attribute whose value equals `PluginProp.default`, so a schema
 * default that disagrees with the component's own fallback makes the widget silently revert
 * the moment you set that value. One table, read from both sides.
 */
export const BANNER = {
    type: 'image' as BgType,
    src: '',
    focus: 'center' as Focus,
    tint: '#0f172a',
    tint2: '#334155',
    scrim: 'left' as Scrim,
    overlay: 55,
    ink: '#ffffff',
    shadow: true,
    height: '7rem',
    pad: '0.75rem 1rem',
    align: 'start' as Align,
    logo: '',
    logoHeight: '2.5rem',
    print: false,
}

const def = () => ({
    /**
     * Custom CSS classes to apply to the banner strip.
     *
     * Class override mechanism:
     * - `cls` prop: Used as the primary class, if empty the default classes are used
     * - `class` prop (aliased as `cn`): Additional classes that patch/extend the given classes
     *
     * The `print` classes sit outside the slot `cls` replaces, the way Avatar's variant and
     * size classes do — an override adjusts the strip, it does not un-size a printed page.
     */
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
    children: $(null as JSX.Child) as CustomElementChildren,
    type: $(BANNER.type, HtmlString) as ObservableMaybe<BgType>,
    src: $(BANNER.src, HtmlString) as ObservableMaybe<string>,
    focus: $(BANNER.focus, HtmlString) as ObservableMaybe<Focus>,
    tint: $(BANNER.tint, HtmlString) as ObservableMaybe<string>,
    tint2: $(BANNER.tint2, HtmlString) as ObservableMaybe<string>,
    scrim: $(BANNER.scrim, HtmlString) as ObservableMaybe<Scrim>,
    overlay: $(BANNER.overlay, HtmlNumber) as ObservableMaybe<number>,
    ink: $(BANNER.ink, HtmlString) as ObservableMaybe<string>,
    shadow: $(BANNER.shadow, HtmlBoolean) as ObservableMaybe<boolean>,
    height: $(BANNER.height, HtmlString) as ObservableMaybe<string>,
    pad: $(BANNER.pad, HtmlString) as ObservableMaybe<string>,
    align: $(BANNER.align, HtmlString) as ObservableMaybe<Align>,
    logo: $(BANNER.logo, HtmlString) as ObservableMaybe<string>,
    logoHeight: $(BANNER.logoHeight, HtmlString) as ObservableMaybe<string>,
    print: $(BANNER.print, HtmlBoolean) as ObservableMaybe<boolean>,
})

/**
 * The strip itself — the slot `cls` replaces.
 *
 * Deliberately carries no width. Width follows the `print` prop, and two width utilities in
 * one class list do not resolve by the order they are written in — Tailwind emits one rule per
 * utility and the *stylesheet's* order decides, so `w-full w-[209mm]` is a coin toss. The two
 * live in the branch below instead, where only one of them is ever present.
 */
const BASE_CLASS = 'relative flex flex-row items-center overflow-hidden box-border'

/**
 * The su-yen preset: the printable width of A4, centred, ruled, and set large and bold.
 *
 * Outside the `cls` slot because it follows the `print` prop, so an override cannot freeze a
 * banner at 209mm on a document that is never going to a printer.
 */
const PRINT_CLASS = 'w-[209mm] mx-auto mb-[10px] border border-solid border-black text-[200%] font-bold'

/**
 * The shadow sheet. Every rule here has to be here rather than in a class.
 *
 * `:host { display: block }` — a custom element is inline until told otherwise, and an inline
 * banner collapses to the height of its text no matter what `height` says.
 *
 * `print-color-adjust` — browsers drop background images and fills when printing. A banner is
 * *entirely* backdrop, so without this it prints as a blank ruled box. It is an inherited
 * property, so setting it on the host covers the scrim and the logo too, and it survives a
 * `cls` override that would otherwise have wiped it off the strip.
 *
 * `::slotted(*) { color: inherit !important }` — the one `!important` here, and it is
 * load-bearing. Slotted content sits in the *outer* tree, and for normal declarations the
 * outer tree wins the cascade: a document stylesheet with a plain `h1 { color: #1a1a1a }` in
 * it beats anything this shadow tree says about the ink, and a banner heading comes out
 * near-black on a dark photograph. Important declarations reverse that ordering. It costs an
 * author nothing — colouring *text* still works, because the toolbar puts the colour on a
 * span inside the block and `::slotted` only ever reaches the top level.
 *
 * The `@media print` rule drops the text shadow the same way su-yen's `[@media_screen]:`
 * prefix did: a soft black halo reads as depth on a screen and as smudge on paper.
 */
const BANNER_CSS = `
:host {
    display: block;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
::slotted(*) { color: inherit !important; }
::slotted(h1), ::slotted(h2), ::slotted(h3), ::slotted(h4), ::slotted(p) { margin: 0; }
@media print { .wui-banner-content { text-shadow: none !important; } }
`

const Banner: Defaulted<typeof def> = defaults(def, (props) => {
    const { class: cn, cls, children, type, src, focus, tint, tint2, scrim, overlay, ink,
        shadow, height, pad, align, logo, logoHeight, print, ...otherProps } = props

    /**
     * The strip's own background, by `type`.
     *
     * `tint` stays under the photo in image mode rather than being ignored: it is what shows
     * while the image loads, and what shows at all if the URL is wrong — a banner with a dead
     * `src` should look like a coloured strip, not like a hole in the page.
     */
    const background = () => {
        switch ($$(type)) {
            case 'solid':
                return { background: $$(tint) }
            case 'gradient':
                return { background: `linear-gradient(135deg, ${$$(tint)}, ${$$(tint2)})` }
            default: {
                const u = $$(src)
                return {
                    backgroundColor: $$(tint),
                    backgroundImage: u ? `url("${u}")` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: $$(focus),
                    backgroundRepeat: 'no-repeat',
                }
            }
        }
    }

    /**
     * The wash of colour between photo and words.
     *
     * Only in image mode — a scrim over a flat fill is just a second, dimmer flat fill, and
     * the row would then be a control that visibly does nothing. The fade runs to the *same*
     * colour at zero alpha rather than to `transparent`, which is transparent black and would
     * drag a light scrim through grey on the way out; `rgbTriple` is what splits the channels.
     */
    const scrimBackground = () => {
        if ($$(type) !== 'image') return 'none'
        const dir = $$(scrim)
        if (dir === 'none') return 'none'
        const o = Math.max(0, Math.min(100, Number($$(overlay)) || 0)) / 100
        const c = rgbTriple($$(tint), rgbTriple(BANNER.tint))
        if (dir === 'full') return `rgba(${c},${o})`
        const to = dir === 'left' ? 'to right' : dir === 'right' ? 'to left'
            : dir === 'top' ? 'to bottom' : 'to top'
        return `linear-gradient(${to}, rgba(${c},${o}) 0%, rgba(${c},${o * 0.55}) 45%, rgba(${c},0) 100%)`
    }

    return (
        <div
            class={() => [
                $$(cls) != '' ? cls : BASE_CLASS,
                $$(print) ? PRINT_CLASS : 'w-full',
                cn,
            ]}
            style={() => ({ height: $$(height), padding: $$(pad), ...background() })}
            {...otherProps}
        >
            {/* Never intercepts a press: the scrim lies over the photo, and a click has to
                reach a node the editor's selection walk can see for the banner to be
                selectable at all. Hidden by `display` rather than by not being rendered —
                a custom element's top-level return is untracked, so a conditional here
                would paint once and then stop following the props. */}
            <div
                class="absolute inset-0 pointer-events-none"
                style={() => ({ display: scrimBackground() === 'none' ? 'none' : 'block', background: scrimBackground() })}
            />
            {/* Absent is spelled as an empty `logo`, which is why there is no `noLogo` flag:
                one attribute answers both "which logo" and "is there one". */}
            <img
                alt="logo"
                class="relative shrink-0 mr-4 object-contain align-middle"
                src={() => $$(logo) || undefined}
                style={() => ({ height: $$(logoHeight), display: $$(logo) ? 'inline-block' : 'none' })}
            />
            {/* The ink is set here rather than on the host: inheritance into slotted content
                follows the flat tree, so this wrapper is what colours the author's text, and
                the host keeps a clean `style` attribute in the serialized document. */}
            <div
                class="wui-banner-content relative w-full min-w-0"
                style={() => ({
                    color: $$(ink),
                    textAlign: $$(align),
                    textShadow: $$(shadow) ? '1px 2px 2px #000' : 'none',
                })}
            >
                {children}
            </div>
            {/* A rendered <style> node, not `adoptedStyleSheets`: woby overwrites a shadow
                root's adopted sheets when it propagates the document's Tailwind sheet in. */}
            <style>{BANNER_CSS}</style>
        </div>
    )
}) as typeof Banner

// NOTE: Register the custom element
customElement('wui-banner', Banner)
// NOTE: Publish the slot `cls` replaces. The `print` classes above it survive an override and
// are deliberately not part of it.
registerBaseCls('wui-banner', BASE_CLASS)

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-banner': ElementAttributes<typeof Banner>
        }
    }
}

export { Banner }
export default Banner

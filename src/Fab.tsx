import { type CustomElementChildren, $, $$, isObservable, type JSX, defaults, customElement, ElementAttributes, HtmlBoolean, HtmlClass, HtmlNumber, ObservableMaybe, HtmlStyle, HtmlString } from 'woby'
import { registerBaseCls } from './helper/baseCls'
import { useOcclusionAvoidance, type OcclusionState } from './useOcclusionAvoidance'

const def = () => ({
      /** 
       * Custom CSS classes to apply to the fab.
       * 
       * Class override mechanism:
       * - `cls` prop: Used as the primary class, if undefined the default variant classes are used
       * - `class` prop (aliased as `cn`): Additional classes that patch/extend the given classes
       * 
       * Usage:
       * - When `cls` is undefined, the default variant classes are used
       * - User can override the default class by providing a `cls` prop
       * - `class` can be used to add additional classes to the component
       */
      cls: $('', HtmlClass) as JSX.Class,
      class: $('', HtmlClass) as JSX.Class,
      children: $("") as CustomElementChildren,
      type: $("pill", HtmlString) as ObservableMaybe<string>,
      disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
      /** Step clear of whatever paints over the FAB. Off by default — a FAB that
       *  moves on its own is a surprise nobody asked for. See useOcclusionAvoidance. */
      avoid: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
      /** Clearance kept between the FAB and the cover, px. Default 8. */
      avoidMargin: $(8, HtmlNumber) as ObservableMaybe<number>,
      /** Total offset budget, px — never exceeded, however much would be needed. Default 96. */
      avoidMax: $(96, HtmlNumber) as ObservableMaybe<number>,
      /** Stay-inside container selector; defaults to the offset parent's padding box. */
      avoidWithin: $("", HtmlString) as ObservableMaybe<string>,
      /** Elements matching this selector are never counted as covers. */
      avoidIgnore: $("", HtmlString) as ObservableMaybe<string>,
      /** Fires whenever the avoidance state changes. Like every function prop, TSX-only. */
      onAvoid: $<(((s: OcclusionState) => void) | null)>(null),
})

// `disabled` reached the <button> but nothing else: a disabled FAB kept the full blue
// background, white text and a pointer cursor, so it read as live. Marked important
// because the variants set their background with a flat class of equal weight.
const disabledStyle = "disabled:!bg-[rgba(0,0,0,0.12)] disabled:!text-[rgba(0,0,0,0.26)] disabled:!shadow-none disabled:!cursor-default"

// Indexed by the `type`/`variant`/`size` prop, which is a free-form string on the custom
// element (attributes carry no enum), so the table needs a string index signature.
const variantStyle: Record<string, string> = {
      circular: "inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle appearance-none no-underline font-medium text-lg z-[1050] shadow-[rgba(0,0,0,0.2)_0px_3px_5px_-1px,rgba(0,0,0,0.14)_0px_6px_10px_0px,rgba(0,0,0,0.12)_0px_1px_18px_0px] text-white m-2 p-0 rounded-[50%] border-0 [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms] outline-none w-14 h-14 bg-[rgb(25,118,210)] hover:bg-[rgb(21,101,192)]",
      // `absolute` used to live here. It made the variant unusable anywhere in normal
      // flow — the <wui-fab> host collapsed to 0x0 and the button floated over whatever
      // followed it, which is exactly what the docs' own inline `<Fab type="pill">`
      // example does. A variant names a shape; floating is the caller's business, so the
      // two positioned usages in docs/index.tsx now pass `absolute` themselves.
      pill: "inline-flex items-center justify-center align-middle bg-[rgb(25,118,210)] text-[white] text-4xl font-black cursor-pointer shadow-[0px_4px_8px_rgba(0,0,0,0.3)] transition-[background-color] duration-[0.3s] px-5 py-[15px] rounded-[50px] border-[none] [transition:top_0.3s_ease,left_0.3s_ease] z-[1050]",
      custom: ""
}

/**
 * The class slot `cls` replaces: the variant table entry for `type`. `disabledStyle`
 * sits outside it and survives an override, so a custom class cannot leave a disabled
 * FAB looking live.
 */
const baseCls = (type: string | null | undefined) => variantStyle[type || 'pill'] ?? ''

const Fab: Defaulted<typeof def> = defaults(def, (props) => {
      const { class: cn, cls, children, type: variant, disabled, avoid, avoidMargin, avoidMax, avoidWithin, avoidIgnore, onAvoid, ...otherProps } = props

      // The probe's shell climb starts at the <button> and walks out through the
      // <wui-fab> host, so a hit anywhere on the widget counts as "self".
      const btnRef = $<HTMLElement | null>(null)
      // defaults() wraps a null callback default into an observable, so unwrap before
      // calling — the same $(…, false) unwrap PropertyForm uses for onCommit.
      useOcclusionAvoidance(btnRef, {
            enabled: avoid, margin: avoidMargin, max: avoidMax, within: avoidWithin, ignore: avoidIgnore,
            onAvoid: s => { const cb = $$(onAvoid, false); if (typeof cb === 'function') cb(s) },
      })

      return (
            <button
                  class={[() => $$(cls) ? $$(cls) : baseCls($$(variant)), disabledStyle, cn]}
                  disabled={disabled}
                  {...otherProps}
                  ref={btnRef}
            >
                  <div class="flex items-center">
                        {children}
                  </div>
            </button>
      )
}) as typeof Fab

export { Fab }

// Register as custom elements
customElement('wui-fab', Fab)
registerBaseCls('wui-fab', el => baseCls(el.getAttribute('type')))

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
      namespace JSX {
            interface IntrinsicElements {
                  /**
                   * Woby FAB (Floating Action Button) custom element
                   * 
                   * A floating action button component with pill-shaped styling that can be used as a custom element in HTML or JSX.
                   * 
                   * The ElementAttributes<typeof Fab> type automatically includes:
                   * - All HTML attributes
                   * - Component-specific props
                   * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
                   */
                  'wui-fab': ElementAttributes<typeof Fab>
            }
      }
}

export default Fab
import { $, $$, isObservable, type JSX, defaults, customElement, ElementAttributes, HtmlBoolean, HtmlClass, ObservableMaybe, HtmlStyle, HtmlString } from 'woby'

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
      cls: $('', HtmlClass) as JSX.Class | undefined,
      class: $('', HtmlClass) as JSX.Class | undefined,
      children: $(""),
      type: $("pill", HtmlString) as ObservableMaybe<string> | undefined,
      disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
})

const variantStyle = {
      circular: "inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle appearance-none no-underline font-medium text-lg z-[1050] shadow-[rgba(0,0,0,0.2)_0px_3px_5px_-1px,rgba(0,0,0,0.14)_0px_6px_10px_0px,rgba(0,0,0,0.12)_0px_1px_18px_0px] text-white m-2 p-0 rounded-[50%] border-0 [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms] outline-none w-14 h-14 bg-[rgb(25,118,210)] hover:bg-[rgb(21,101,192)]",
      pill: "absolute bg-[rgb(25,118,210)] text-[white] text-4xl font-black cursor-pointer shadow-[0px_4px_8px_rgba(0,0,0,0.3)] transition-[background-color] duration-[0.3s] px-5 py-[15px] rounded-[50px] border-[none] [transition:top_0.3s_ease,left_0.3s_ease] z-[1050]",
      custom: ""
}

const Fab = defaults(def, (props) => {
      const { class: cn, cls, children, type: variant, disabled, ...otherProps } = props

      return (
            <button
                  class={[() => $$(cls) ? $$(cls) : variantStyle[$$(variant)], cn]}
                  disabled={disabled}
                  {...otherProps}
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
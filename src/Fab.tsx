import { tw } from '@woby/styled'
import { $, $$, isObservable, type JSX, defaults, customElement, ElementAttributes, HtmlBoolean, HtmlClass, ObservableMaybe, HtmlStyle } from 'woby'

// const def = () => ({
//       class: $(undefined, HtmlClass),
//       children: $(null as JSX.Child),
//       disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
// })

// const Fab = defaults(def, (props) => {
//       const { children, class: className, disabled, ...otherProps } = props

//       const FabComponent = tw('button')`absolute bg-[rgb(25,118,210)] text-[white] text-4xl font-black cursor-pointer shadow-[0px_4px_8px_rgba(0,0,0,0.3)] transition-[background-color] duration-[0.3s] px-5 py-[15px] rounded-[50px] border-[none] [transition:top_0.3s_ease,left_0.3s_ease] z-[1050]`

//       return (
//             <FabComponent
//                   disabled={disabled}
//                   class={className}
//                   {...otherProps}
//             >
//                   {children}
//             </FabComponent>
//       )
// })

// const Fab1 = defaults(def, (props) => {
//       const { children, class: className, disabled, ...otherProps } = props

//       const Fab1Component = tw('button')`inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle appearance-none no-underline font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase min-h-[36px] min-w-0 z-[1050] shadow-[rgba(0,0,0,0.2)_0px_3px_5px_-1px,rgba(0,0,0,0.14)_0px_6px_10px_0px,rgba(0,0,0,0.12)_0px_1px_18px_0px] text-white m-2 p-0 rounded-[50%] border-0
//       [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
//             outline-none`

//       return (
//             <Fab1Component
//                   disabled={disabled}
//                   class={className}
//                   {...otherProps}
//             >
//                   {children}
//             </Fab1Component>
//       )
// })


const Fab1Component = tw('button')`inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle appearance-none no-underline font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase min-h-[36px] min-w-0 z-[1050] shadow-[rgba(0,0,0,0.2)_0px_3px_5px_-1px,rgba(0,0,0,0.14)_0px_6px_10px_0px,rgba(0,0,0,0.12)_0px_1px_18px_0px] text-white m-2 p-0 rounded-[50%] border-0
[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
      outline-none`

const FabComponent = tw('button')`absolute bg-[rgb(25,118,210)] text-[white] text-4xl font-black cursor-pointer shadow-[0px_4px_8px_rgba(0,0,0,0.3)] transition-[background-color] duration-[0.3s] px-5 py-[15px] rounded-[50px] border-[none] [transition:top_0.3s_ease,left_0.3s_ease] z-[1050]`

export const Fab1 = defaults(() => ({
      disabled: $(false, HtmlBoolean)
}), (props: any) => {
      const { children, class: cls, disabled, ...otherProps } = props

      return (
            <Fab1Component
                  disabled={disabled}
                  class={cls}
                  {...otherProps}
            >
                  {children}
            </Fab1Component>
      )
})

export const Fab = defaults(() => ({
      disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
      class: $(undefined, HtmlClass) as ObservableMaybe<boolean> | undefined,
      style: $(undefined, HtmlStyle) as ObservableMaybe<JSX.Style> | undefined
}), (props: any) => {
      const { children, class: cls, disabled, ...otherProps } = props

      return (
            <FabComponent
                  disabled={disabled}
                  class={cls}
                  {...otherProps}
            >
                  {children}
            </FabComponent>
      )
})

// Register as custom elements
customElement('wui-fab1', Fab1)
customElement('wui-fab', Fab)

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
      namespace JSX {
            interface IntrinsicElements {
                  /**
                   * Woby FAB1 (Floating Action Button 1) custom element
                   * 
                   * A floating action button component with circular styling that can be used as a custom element in HTML or JSX.
                   * 
                   * The ElementAttributes<typeof Fab1> type automatically includes:
                   * - All HTML attributes
                   * - Component-specific props
                   * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
                   */
                  'wui-fab1': ElementAttributes<typeof Fab1>

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

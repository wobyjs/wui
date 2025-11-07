import { tw } from '@woby/styled'
//@ts-ignore
import { $, $$, Observable, ObservableMaybe, type JSX, defaults, customElement, ElementAttributes, HtmlBoolean } from 'woby'

const DeleteIcon = <svg class="text-[rgba(0,0,0,0.26)] text-[22px] cursor-pointer select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl -ml-1.5 mr-[5px] my-0 [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms] hover:text-[rgba(0,0,0,0.4)]"
    focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="CancelIcon"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg>

function def() {
    return {
        avatar: $(''),
        deleteIcon: $([DeleteIcon],),
    }
}

const ChipComponent = defaults(def, ({ avatar, deleteIcon = DeleteIcon, onDelete, children, ...props }: any): JSX.Child => {
    const { className, ...p } = props
    const cls = props.class
    delete props.class

    return <div class={[`relative cursor-pointer select-none appearance-none max-w-full text-[0.8125rem] inline-flex items-center justify-center h-8 text-[rgba(0,0,0,0.87)] bg-[rgba(0,0,0,0.08)] whitespace-nowrap no-underline align-middle box-border m-0 p-0 rounded-2xl border-0;
  [transition:background-color_300ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms]
  [outline:0px]`, className ?? cls]} tabIndex={0} role="button" {...props}>
        {avatar}
        <span class="overflow-hidden text-ellipsis whitespace-nowrap px-3">{children}</span>
        {onDelete ? <div onClick={e => { e.stopPropagation(); onDelete(e) }}>{deleteIcon}</div> : null}
    </div>
})

// Register as a custom element
customElement('wui-chip', ChipComponent)

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            /**
             * Woby Chip custom element
             * 
             * A chip component that can be used as a custom element in HTML or JSX.
             * Displays a compact element with optional avatar and delete functionality.
             * 
             * The ElementAttributes<typeof ChipComponent> type automatically includes:
             * - All HTML attributes
             * - Component-specific props from ChipProps
             * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
             */
            'wui-chip': ElementAttributes<typeof ChipComponent>
        }
    }
}

export { ChipComponent as Chip }
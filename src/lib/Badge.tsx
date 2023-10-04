import { } from 'voby/dist/types/jsx/types'
import { $, $$, Observable, ObservableMaybe, isObservable, useEffect, useMemo } from 'voby'

export const Badge = ({ className, children, badgeContent, anchorOrigin: { vertical = 'top', horizontal = 'right' } = {}, badgeClass = `bg-[rgb(156,39,176)]`, open: op, ...props }:
    JSX.VoidHTMLAttributes<HTMLDivElement> & {
        children?: JSX.Child, badgeClass?: JSX.Class,
        anchorOrigin?: { vertical?: ObservableMaybe<'top' | 'bottom'>, horizontal?: ObservableMaybe<'right' | 'left'> },
        badgeContent?: JSX.Children
    }): JSX.Element => {
    const { class: cls, ...ps } = props
    const empty = useMemo(() => badgeContent ? 'min-w-[20px] h-5 rounded-[10px] px-1' : 'min-w-[8px] h-2 rounded px-0')

    const pos = useMemo(() => {
        const [v, h] = [$$(vertical), $$(horizontal)]
        return v === 'top' ? (h === 'right' ? `translate-x-2/4 -translate-y-2/4 origin-[100%_0%]` : `-translate-x-2/4 -translate-y-2/4 origin-[0%_0%]`) :
            (h === 'right' ? `translate-x-2/4 translate-y-2/4 origin-[100%_100%]` : `-translate-x-2/4 translate-y-2/4 origin-[0%_100%]`)
    })

    return <span class="relative inline-flex align-middle shrink-0 m-4">
        {children}
        <span class={[`flex place-content-center items-center absolute box-border font-medium text-xs leading-none z-[1] text-white scale-100 right-0 top-0 [flex-flow:wrap]
        [transition:transform_225ms_cubic-bezier(0.4,0,0.2,1)0ms`, empty, pos, badgeClass]}>{badgeContent}</span>
    </span>
}


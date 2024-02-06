import { $, $$, ObservableMaybe, isObservable, useEffect, useMemo, type JSX } from 'woby'

export const Collapse = ({ className, children, open: op, ...props }: JSX.VoidHTMLAttributes<HTMLDivElement> & { children?: JSX.Child, open?: ObservableMaybe<boolean> }): JSX.Element => {
    const { class: cls, ...ps } = props
    const open = isObservable(op) ? op : $(op)
    const ref = $<HTMLDivElement>()

    const height = useMemo(() => $$(ref)?.clientHeight)
    const c = useMemo(() => $$(open) ? ({ height }) : ({ height: 0 }))

    return <div class={['bg-[#ccc] overflow-hidden [transition:height_200ms]', cls ?? className]} style={c} {...props} >
        <div class={'h-fit'} ref={ref}>
            {children}
        </div>
    </div>
}
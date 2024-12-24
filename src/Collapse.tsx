import { $, $$, ObservableMaybe, isObservable, useEffect, useMemo, type JSX } from 'woby'

export const Collapse = ({ className, children, open/* : op */, ...props }: JSX.VoidHTMLAttributes<HTMLDivElement> & { children?: JSX.Child, open?: ObservableMaybe<boolean> }): JSX.Element => {
    const { class: cls, ...ps } = props
    // const open = isObservable(op) ? op : $(op)
    const ref = $<HTMLDivElement>()

    // const c = useMemo(() => ({ height: $$(open) ? $$(ref)?.clientHeight : 0 }))

    // useEffect(() => console.log('Collapse', $$(open), $$(ref)?.clientHeight, $$(c)))
    return <div class={['bg-[#ccc] overflow-hidden ', cls ?? className, () => $$(open) ? '[transition:height_200ms_ease,visibility_0ms]' : 'hidden [transition:height_200ms_ease,visibility_0ms_200ms]']} /* style={c} */ {...props} >
        <div class={'h-fit'} ref={ref}>
            {children}
        </div>
    </div>
}
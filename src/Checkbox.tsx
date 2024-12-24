import { nanoid } from 'nanoid'
import React, { ObservableMaybe, $$, useMemo, type JSX } from 'woby'

type LabelPosition = 'left' | 'right' | 'bottom' | 'top'

export const Checkbox = ({ type, labelPosition = 'left', children, ...props }: JSX.InputHTMLAttributes<HTMLInputElement> & { children?: JSX.Children, labelPosition?: ObservableMaybe<LabelPosition> }): JSX.Element => {
    const id = nanoid(8)
    const before = useMemo(() => ($$(labelPosition) === 'left' || $$(labelPosition) === 'top') ? <label class='select-none' for={id}>{children}</label> : null)
    const after = useMemo(() => ($$(labelPosition) === 'right' || $$(labelPosition) === 'bottom') ? <label class='select-none' for={id}>{children}</label> : null)
    const line = useMemo(() => $$(labelPosition) === 'top' || $$(labelPosition) === 'bottom' ? <br /> : null)

    return <>
        {before}{line}
        <input type='checkbox' {...props} />
        {line}{after}
    </>
}
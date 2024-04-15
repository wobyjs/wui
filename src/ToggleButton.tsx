import { $, $$, isObservable } from 'woby'
//@ts-ignore
import { Observable, ObservableMaybe, type JSX } from 'woby'

export const ToggleButton = ({ children, className, class: cls, onClass = 'text-[#1976d2] bg-[rgba(25,118,210,0.08)] hover:bg-[rgba(25,118,210,0.12)]', offClass = 'text-[rgba(0,0,0,0.54)] hover:no-underline hover:bg-[rgba(0,0,0,0.04)]', checked = $(false), ...props }: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: ObservableMaybe<boolean>, onClass?: JSX.Class, offClass?: JSX.Class }): JSX.Element =>
    <button onClick={() => isObservable(checked) && checked(c => !c)} class={[`rounded-tr-none rounded-br-none`,
        `inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle leading-[1.75] tracking-[0.02857em] uppercase border m-0 border-[rgba(0,0,0,0.12)]`,
        `[outline:0]`, () => $$(checked) ? onClass : offClass,
        className, cls]} {...props} >
        {children}
    </button>

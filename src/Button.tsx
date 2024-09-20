//@ts-ignore
import { $, $$, isObservable, useEffect, type JSX } from "woby"

export const variant = {
	text: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline 
            font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase min-w-[64px] rounded text-[#1976d2] 
            rounded-none border-0 outline-0 font-sans
            [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
            hover:no-underline hover:bg-[rgba(25,118,210,0.04)]
            disabled:text-[rgba(0,0,0,0.26)] disabled:pointer-events-none disabled:cursor-default`,
	contained: `inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle no-underline 
            font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase min-w-[64px] rounded text-white bg-[#1976d2] 
            shadow-[0px_3px_1px_-2px_rgba(0,0,0,0.2),0px_2px_2px_0px_rgba(0,0,0,0.14),0px_1px_5px_0px_rgba(0,0,0,0.12)] 
            rounded-none border-0 outline-0 font-sans
            [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
            hover:no-underline hover:bg-[#1565c0] hover:shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.2),0px_4px_5px_0px_rgba(0,0,0,0.14),0px_1px_10px_0px_rgba(0,0,0,0.12)]
            active:shadow-[0px_5px_5px_-3px_rgba(0,0,0,0.2),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_3px_14px_2px_rgba(0,0,0,0.12)]
            disabled:text-[rgba(0,0,0,0.26)] disabled:shadow-none disabled:bg-[rgba(0,0,0,0.12)] disabled:pointer-events-none disabled:cursor-default`,
	outlined: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline font-medium 
            text-sm leading-[1.75] tracking-[0.02857em] uppercase min-w-[64px] rounded border text-[#1976d2] rounded-none 
            border-solid border-[rgba(25,118,210,0.5)] font-sans
            [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
            hover:no-underline hover:bg-[rgba(25,118,210,0.04)] hover:border hover:border-solid hover:border-[#1976d2]
            disabled:text-[rgba(0,0,0,0.26)] disabled:border disabled:border-solid disabled:border-[rgba(0,0,0,0.12)] disabled:pointer-events-none disabled:cursor-default`,
	icon: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline text-center
     flex-[0_0_auto] text-2xl overflow-visible text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out delay-[0ms] rounded-none
     rounded-[50%] border-0
     hover:bg-[rgba(0,0,0,0.04)]`,
}

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>
export const Button = (props: ButtonProps): JSX.Element => {
	const { children, className = variant.contained, checked = $(false), disabled, ...otherProps } = props

	return (
		<button
			onClick={() => isObservable(checked) && checked((c) => !c)}
			disabled={disabled}
			class={className}
			{...otherProps}
		>
			{children}
		</button>
	)
}

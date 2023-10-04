import { } from 'voby/dist/types/jsx/types'

export const variant = {
    text: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline 
            text-inherit font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase min-w-[64px] rounded text-[#1976d2] m-0 px-2 py-1.5 p-0
            rounded-none border-0 outline-0 font-sans
            [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
            hover:no-underline hover:bg-[rgba(25,118,210,0.04)]
            disabled:text-[rgba(0,0,0,0.26)] disabled:pointer-events-none disabled:cursor-default`,
    contained: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline 
            text-inherit font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase min-w-[64px] rounded text-white bg-[#1976d2] 
            shadow-[0px_3px_1px_-2px_rgba(0,0,0,0.2),0px_2px_2px_0px_rgba(0,0,0,0.14),0px_1px_5px_0px_rgba(0,0,0,0.12)] m-0 px-4 py-1.5 p-0 
            rounded-none border-0 outline-0 font-sans
            [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
            hover:no-underline hover:bg-[#1565c0] hover:shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.2),0px_4px_5px_0px_rgba(0,0,0,0.14),0px_1px_10px_0px_rgba(0,0,0,0.12)]
            active:shadow-[0px_5px_5px_-3px_rgba(0,0,0,0.2),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_3px_14px_2px_rgba(0,0,0,0.12)]
            disabled:text-[rgba(0,0,0,0.26)] disabled:shadow-none disabled:bg-[rgba(0,0,0,0.12)] disabled:pointer-events-none disabled:cursor-default`,
    outlined: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline text-inherit font-medium 
            text-sm leading-[1.75] tracking-[0.02857em] uppercase min-w-[64px] rounded border text-[#1976d2] m-0 px-[15px] py-[5px] p-0 rounded-none border-0 
            border-solid border-[rgba(25,118,210,0.5)] font-sans
            [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
            hover:no-underline hover:bg-[rgba(25,118,210,0.04)] hover:border hover:border-solid hover:border-[#1976d2]
            disabled:text-[rgba(0,0,0,0.26)] disabled:border disabled:border-solid disabled:border-[rgba(0,0,0,0.12)] disabled:pointer-events-none disabled:cursor-default`,
    icon: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline text-inherit text-center
     flex-[0_0_auto] text-2xl overflow-visible text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out delay-[0ms] m-0 p-0 p-2 rounded-none
     rounded-[50%] border-0
     hover:bg-[rgba(0,0,0,0.04)]`,
}

export const Button = ({ children, className = variant.contained, ...props }: JSX.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element =>
    <button class={className} {...props} >
        {children}
    </button>

import { tw } from '@woby/styled'
import { $$, Observable, ObservableMaybe, type JSX } from 'woby'

export const Fab1 = tw('button')`inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle appearance-none no-underline font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase min-h-[36px] min-w-0 z-[1050] shadow-[rgba(0,0,0,0.2)_0px_3px_5px_-1px,rgba(0,0,0,0.14)_0px_6px_10px_0px,rgba(0,0,0,0.12)_0px_1px_18px_0px] text-white m-2 p-0 rounded-[50%] border-0
[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
      outline-none`
//w-10 h-10 


export const Fab = tw('button')`absolute bg-[rgb(25,118,210)] text-[white] text-4xl font-black cursor-pointer shadow-[0px_4px_8px_rgba(0,0,0,0.3)] transition-[background-color] duration-[0.3s] px-5 py-[15px] rounded-[50px] border-[none] [transition:top_0.3s_ease,left_0.3s_ease] z-[1050]`

// ({ children = '☰', ...props }: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { horizon?: number }) => {
// // return <button style={{ top: () => $$(pt) + $$(vh) - (80), [x === 'center' ? 'left' : x]: () => x === 'center' ? $$(vw) / 2 : $$(pl) }}
// return <button {...props} //style={{ top: () => $$(pt) + $$(vh) - (80), left: horizon }}
//       class='absolute bg-[rgb(25,118,210)] text-[white] text-4xl font-black cursor-pointer shadow-[0px_4px_8px_rgba(0,0,0,0.3)] transition-[background-color] duration-[0.3s] px-5 py-[15px] rounded-[50px] border-[none] [transition:top_0.3s_ease,left_0.3s_ease] z-[1050]' >
//       {children}
// </button >

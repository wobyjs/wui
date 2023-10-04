import { tw } from 'voby-styled'
import { } from 'voby/dist/types/jsx/types'

/** color: [&_svg]:fill-current */
export const IconButton = tw('button')`inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle appearance-none no-underline text-center flex-[0_0_auto] text-2xl overflow-visible text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out delay-[0ms] m-0 p-2 rounded-[50%] border-0
[outline:0px] 
duration-[0.3s] hover:bg-[#dde0dd] 
[&_svg]:w-[1em] [&_svg]:h-[1em] [&_svg]:fill-current
disabled:bg-transparent disabled:text-[rgba(0,0,0,0.26)] disabled:[&_svg]:fill-[rgba(0,0,0,0.26)] disabled:pointer-events-none disabled:cursor-default
`

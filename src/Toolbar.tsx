import { tw } from 'woby-styled'
//@ts-ignore
import { Observable, ObservableMaybe, type JSX } from 'woby'

// export const Toolbar = tw('div')`[@media(min-width:600px)]:relative [@media(min-width:600px)]:flex [@media(min-width:600px)]:items-center [@media(min-width:600px)]:px-4 h-full`
export const Toolbar = tw('div')`relative flex items-center px-4 h-full`

// `[@media(min-width:600px)]:h-min-[64px]
// [@media(min-width:0px)]:h-min-[48px]
// [@media(orientation:landscape)]:h-min-[48px]
// [@media(min-width:600px)]:relative [@media(min-width:600px)]:flex [@media(min-width:600px)]:items-center [@media(min-width:600px)]:min-h-[56px] [@media(min-width:600px)]:px-6
// `

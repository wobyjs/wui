import { tw } from '@woby/styled'
import { $, $$, Observable, useMemo, useEffect, ObservableMaybe, type JSX } from 'woby'

//https://codepen.io/robstinson/pen/bGwpNMV
//dark mode text-gray-400 bg-gray-900
//purple mode text-indigo-300 bg-indigo-900 


export const SideBar = <T extends HTMLElement = HTMLDivElement>({ children, className, contentRef, width: w = $('300px'), disableBackground, open = $(false), class: cls, ...props }: JSX.HTMLAttributes<HTMLDivElement> & { contentRef?: Observable<T>, open: Observable<boolean>, disableBackground?: ObservableMaybe<boolean> }) => {
    const width = useMemo(() => $$(open) ? $$(w) : 0)

    useEffect(() => {
        if (!$$(contentRef)) return

        $$(contentRef).style.marginLeft = $$(width) + ''
        $$(contentRef).style.transition = 'margin-left .5s'
    })

    return [<div class="h-full w-0 fixed overflow-x-hidden transition-[0.5s] left-0 top-0" style={{ width }}>
        {children}
    </div>,
    <div class={['absolute h-full w-full z-[999] bg-[#000] opacity-50', () => $$(disableBackground) && $$(open) ? 'visible' : 'hidden']} onClick={() => open(p => !p)}
        style={{ height: () => $$(contentRef)?.offsetHeight }}></div>
    ]
}

export const MenuItem = tw('a')`flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-300 cursor-pointer`
export const MenuText = tw('span')`ml-3 text-sm font-medium`


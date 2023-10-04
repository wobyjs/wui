import { nanoid } from 'nanoid'
// https://codepen.io/alvarotrigo/pen/oNoJePo



/**
 * Override
 * 
 * background color
 * 
 * [&>div]:before:bg-[#03a9f4] 
 * [&>div]:after:bg-[#f44336]
 * 
 * [&>input:checked~span]:bg-[#fcebeb]
 *
 * 
 * Some special case may need to see the output html tree node and modify classes as needed
 */
export const Switch = ({ off = 'OFF', on = 'ON', ...props }: JSX.VoidHTMLAttributes<HTMLDivElement> & { id?: string, on?: string, off?: string }) => {
    const id = props.id ?? nanoid(8)

    return <>
        <div {...props}>
            <input id={id} type="checkbox" />
            <div data-tg-on={on} data-tg-off={off}><span data-tg-on={on} data-tg-off={off}></span></div>
            <span></span>
            <label for={id} data-tg-on={on} data-tg-off={off}></label>
        </div>
    </>
}
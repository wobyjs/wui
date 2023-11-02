// ,type JSX } from 'woby'
import { effect19a } from './TextField.effect'
import { tw } from 'woby-styled'
import { ObservableMaybe, $$, $, type JSX, isObservable } from 'woby'

//https://codepen.io/maheshambure21/pen/EozKKy

/**
 * To change Line color, patch the following class into effect
 * 
 * top line: [&\~span]:before:bg-[#4caf50] 
 * 
 * bottom line: [&\~span]:after:bg-[#4caf50] 
 * 
 * left line: [&\~span_i]:before:bg-[#4caf50] 
 * 
 * right line: [&\~span_i]:after:bg-[#4caf50] 
 * 
 * Placeholder text: text-[color] text-* 
 * 
 * With content text: [&:not(:placeholder-shown)]:text-[red]
 * 
 * box: border-[#ccc]
 * 
 * Fill color: [&\~span]:bg-[#ededed]
 * 
 * Fill color (focused) : [&:focus\~span]:bg-[#ededed]
 * 
 * label text: [&\~label]:text-[red] [&:focus\~label]:text-[red] [&:not(:placeholder-shown)~label]:text-[red]
 */
export const TextField = ({ className, class: cls, children, effect, reactive, type = 'text', placeholder = 'Placeholder Text', ...props }: JSX.InputHTMLAttributes<HTMLInputElement> & { children?: JSX.Child, effect?: JSX.Class, reactive?: ObservableMaybe<boolean> }): JSX.Element => {
    const { onChange, onKeyUp, ...ps } = props

    return <div class={[(className ?? cls) ?? 'm-[20px]', 'relative']}>
        <input class={effect ?? effect19a}  {...{ ...ps, type, placeholder }}
            onChange={e => !$$(reactive) && isObservable(ps.value) ? (ps.value?.(e.target.value), onChange?.(e)) : undefined}
            onKeyUp={e => !$$(reactive) && isObservable(ps.value) ? (ps.value?.(e.target.value), onKeyUp?.(e)) : undefined} />
        {children}
        <span>
            <i></i>
        </span>
    </div>
}

export const StartAdornment = tw('div')`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] mr-2`
export const EndAdornment = tw('div')`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] ml-2`

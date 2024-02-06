import { $, $$, useMemo, type JSX } from 'woby'

export const Avatar = ({ className = 'w-10 h-10 bg-[rgb(189,189,189)]', src, alt, children, ...props }: JSX.HTMLAttributes<HTMLDivElement> & JSX.ImgHTMLAttributes<HTMLImageElement>): JSX.Child => {
    // const { className, ...p } = props
    const cls = props.class
    delete props.class

    const child = useMemo(() => $$(src) ? <img alt={alt} src={src} /> : children)

    return <div class={["relative flex items-center justify-center shrink-0  text-xl leading-none overflow-hidden select-none text-white m-0 rounded-[50%]", cls ?? className]}>{child}</div>
}

// https://codepen.io/maheshambure21/pen/EozKKy
import {
    effect1, effect2, effect3,
    effect4, effect5, effect6,
    effect7, effect8, effect9,
    effect10, effect11, effect12, effect13, effect14, effect15,
    effect16, effect17, effect18,
    effect19, effect20, effect21,
    effect22, effect23, effect24,
    effect19a, effect20a, effect21a,
} from './TextField.effect'

import {
    ObservableMaybe, $$, $, type JSX, isObservable, Observable,
    defaults, customElement, type ElementAttributes,
    HtmlBoolean, HtmlString, useMemo,
    HtmlClass,
} from 'woby'

/* ------------------------------------------------------------------ */
/*  Effect map (same as TextField)                                    */
/* ------------------------------------------------------------------ */

const effectMap: Record<string, string> = {
    // Underline Effects
    effect1,   // Center-out underline
    effect2,   // Left-to-right underline
    effect3,   // Split center-out underline

    // Box Effects
    effect4,   // Bottom-up fill border
    effect5,   // Left-to-right fill border
    effect6,   // Right-to-left fill border

    // Outline Effects
    effect7,   // Center-out split outline
    effect8,   // Corner-to-corner outline
    effect9,   // Snake/Chasing outline

    // Fill Effects
    effect10,  // Fade in fill
    effect11,  // Left-to-right fill
    effect12,  // Center-out fill
    effect13,  // Split center-out fill
    effect14,  // Diagonal split fill
    effect15,  // Center diamond fill

    // Labeled Underline Effects (Requires 'label' prop)
    effect16,  // Center-out underline w/ floating label
    effect17,  // Center-out (from left) w/ floating label
    effect18,  // Split center-out w/ floating label

    // Labeled Box Effects (Requires 'label' prop)
    effect19,  // Split top/bottom border w/ floating label
    effect20,  // Clockwise border w/ floating label
    effect21,  // Snake border w/ floating label

    // Labeled Fill Effects (Requires 'label' prop)
    effect22,  // Fade in fill w/ floating label
    effect23,  // Split fill w/ floating label
    effect24,  // Diagonal fill w/ floating label

    // Alternative Labeled Box Effects (Label moves to border)
    effect19a, // Split border, label cuts line
    effect20a, // Clockwise border, label cuts line
    effect21a, // Snake border, label cuts line
}

type ResizeProps = "none" | "horizontal" | "vertical" | "both"

/* ------------------------------------------------------------------ */
/*  Default props (mirror TextField style)                            */
/* ------------------------------------------------------------------ */

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $("", HtmlString) as ObservableMaybe<string> | undefined,
    children: $(null) as ObservableMaybe<JSX.Child> | undefined,

    /** Effect name like "effect19a", "effect7", etc. */
    effect: $("effect19a", HtmlString) as ObservableMaybe<string> | undefined,

    /** If true → commit only on Enter. If false (default) → commit on key up / change. */
    assignOnEnter: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,

    /** Text value (primitive or observable). */
    value: $("", HtmlString) as ObservableMaybe<string> | undefined,

    /** Placeholder text – keep empty when using floating label effects. */
    placeholder: $("", HtmlString) as ObservableMaybe<string> | undefined,

    /** Optional floating label text (for label-based effects). */
    label: $("", HtmlString) as ObservableMaybe<string> | undefined,

    resize: $("none", HtmlString) as ObservableMaybe<ResizeProps> | undefined,


    onChange: undefined as ((e: any) => void) | undefined,
    onKeyUp: undefined as ((e: any) => void) | undefined,
})

/* ------------------------------------------------------------------ */
/*  TextArea component (effect-compatible with TextField)             */
/* ------------------------------------------------------------------ */

const TextArea = defaults(def, (props) => {
    const { cls, class: cn, children, effect, assignOnEnter, value, placeholder, label, resize, onChange, onKeyUp, ...otherProps } = props

    // Wrapper: only positions span/label, allows overflow for floating label
    const baseClass = "relative size-fit" //  z-0 inline-block overflow-visible

    // Resize is applied to the TEXTAREA, not the wrapper
    const resizeStyle = useMemo(() => {
        const r = $$(resize)
        return r == "none" ? "resize-none" : r == "horizontal" ? "resize-x" : r == "vertical" ? "resize-y" : "resize"
    })

    const resizeValue = useMemo(() => {
        const r = $$(resize)
        return r == "none" ? "none" : r == "horizontal" ? "horizontal" : r == "vertical" ? "vertical" : "both"
    })

    // TextField.effect styles
    const effectStyle = useMemo(() => {
        const effectName = $$(effect)
        return effectMap[effectName] || ""
    })

    const commitValue = (e: any) => {
        if (isObservable(value)) {
            (value as Observable<string>)(e.target.value)
        }
    }

    return (
        <div class={() => [baseClass, () => $$(cls) ? $$(cls) : "", cn]}>
            {/* textarea defines the size and is resizable */}
            <textarea
                style={() => ({ resize: resizeValue })}
                class={() => [
                    effectStyle,
                    resizeStyle,

                    "block bg-transparent size-full",
                ]}
                placeholder={placeholder}
                value={value}
                {...otherProps}
                onChange={(e) => {
                    if (!$$(assignOnEnter) && isObservable(value)) {
                        commitValue(e)
                    }
                    onChange?.(e)
                }}
                onKeyUp={(e) => {
                    if (!$$(assignOnEnter) && isObservable(value)) {
                        commitValue(e)
                        onKeyUp?.(e)
                    } else {
                        if (e.key === "Enter" && isObservable(value)) {
                            commitValue(e)
                            onChange?.(e)
                        }
                        onKeyUp?.(e)
                    }
                }}
            />

            {/* underline / border effect – width is driven by effect classes */}
            <span class="focus-border focus-bg pointer-events-none">
                <i></i>
            </span>

            {/* label can now overflow above/below because wrapper has overflow-visible */}
            {() => $$(label)
                ? (
                    <label class="pointer-events-none">
                        {label}
                    </label>
                )
                : null}

            {children}
        </div>
    )
}) as typeof TextArea





export { TextArea }

customElement('wui-text-area', TextArea)

// Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-text-area': ElementAttributes<typeof TextArea>,
        }
    }
}

export default TextArea

/**
 * @param assignOnEnter On = commit on enter, off(default) = commit on key up
 *
 * To change line / fill / label colors for TextField/TextArea effects:
 *
 * top line: [&\~span]:before:bg-[#4caf50]
 * bottom line: [&\~span]:after:bg-[#4caf50]
 * left line: [&\~span_i]:before:bg-[#4caf50]
 * right line: [&\~span_i]:after:bg-[#4caf50]
 *
 * Placeholder text: text-[color] text-*
 * With content text: [&:not(:placeholder-shown)]:text-[red]
 * box: border-[#ccc]
 * Fill color: [&\~span]:bg-[#ededed]
 * Fill color (focused): [&:focus\~span]:bg-[#ededed]
 * label text:
 *   [&\~label]:text-[red]
 *   [&:focus\~label]:text-[red]
 *   [&:not(:placeholder-shown)~label]:text-[red]
 */
export const TextAreaOriginal = ({
    className,
    class: cls,
    children,
    effect,
    reactive,
    type = 'text',
    placeholder = 'Placeholder Text',
    ...props
}:
    JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
        children?: JSX.Child,
        effect?: JSX.Class,
        reactive?: ObservableMaybe<boolean>
    }): JSX.Element => {
    const { onChange, onKeyUp, ...ps } = props

    return (
        <div class={[(className ?? cls) ?? '', 'relative']}>
            <textarea
                class={effect ?? effect19a}
                {...{ ...ps, type, placeholder }}
                onChange={e =>
                    !$$(reactive) && isObservable(ps.value)
                        ? ((ps.value as Observable)?.(e.target.value), onChange?.(e))
                        : undefined
                }
                onKeyUp={e =>
                    !$$(reactive) && isObservable(ps.value)
                        ? ((ps.value as Observable)?.(e.target.value), onKeyUp?.(e))
                        : (e.key === 'Enter' && isObservable(ps.value) && ps.value(e.target.value),
                            onKeyUp?.(e), onChange?.(e))
                }
            />
            {children}
            <span>
                <i></i>
            </span>
        </div>
    )
}

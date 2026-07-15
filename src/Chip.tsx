import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, useEffect, StyleEncapsulationProps, isObservable, Observable, HtmlBoolean, HtmlClass } from "woby"
import "@woby/chk"
import "./input.css"
import DeleteIcon from "./icons/delete_icon"

const def = () => ({
    avatar: $(null as JSX.Child),
    deleteIcon: $(<DeleteIcon /> as JSX.Element),
    children: $(null as JSX.Child),
    /** 
     * Custom CSS classes to apply to the chip.
     * 
     * Class override mechanism:
     * - `cls` prop: Used as the primary class, if undefined the default classes are used
     * - `class` prop (aliased as `cn`): Additional classes that patch/extend the given classes
     * 
     * Usage:
     * - When `cls` is undefined, the default classes are used
     * - User can override the default class by providing a `cls` prop
     * - `class` can be used to add additional classes to the component
     */
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    deletable: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    visible: $(true, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    onDelete: undefined as ((e: JSX.TargetedMouseEvent<HTMLDivElement>) => void) | undefined,
})

const Chip = defaults(def, (props) => {
    const { class: cn, cls, avatar, deleteIcon, children, deletable, visible, onDelete, ...otherProps } = props

    // Create internal visible state if not provided as observable
    const internalVisible = isObservable(visible) ? visible : $(visible ?? true)

    // Don't render the chip if visible is false
    // Handle both boolean and observable values
    // Wrap in a function to make it reactive
    return () => {
        if ($$(internalVisible) === false) {
            return null
        }
        return renderChip()
    }

    function renderChip() {
        const baseClass =
            "relative cursor-pointer select-none appearance-none max-w-full " +
            "text-[0.8125rem] inline-flex items-center justify-center h-8 " +
            "text-[rgba(0,0,0,0.87)] bg-[rgba(0,0,0,0.08)] " +
            "no-underline align-middle box-border m-0 p-0 rounded-2xl border-0 " +
            "[transition:background-color_300ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms]" +
            " [outline:0px]"
        // + " h-auto w-auto"
        // whitespace-nowrap no-underline align-middle box-border m-0 p-0 rounded-2xl border-0
        // relative cursor-pointer select-none appearance-none max-w-full text-[0.8125rem] inline-flex items-center justify-center h-8 text-[rgba(0,0,0,0.87)] bg-[rgba(0,0,0,0.08)] whitespace-nowrap no-underline align-middle box-border m-0 p-0 rounded-2xl border-0;
        //  [transition:background-color_300ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms]
        // [outline:0px]

        const isDeletable = () => {
            if (deletable == true) {
                return (
                    <div
                        class="chip-delete-icon cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            // If user provided onDelete, call it
                            if (onDelete) {
                                onDelete(e)
                            }
                            // Default behavior: hide the chip
                            internalVisible(false)
                        }}
                    >
                        <DeleteIcon />
                    </div>
                )
            } else {
                return null
            }
        }

        return (
            <div
                class={[() => $$(cls) ? $$(cls) : baseClass, cn]}
                tabIndex={0}
                role="button"
                {...otherProps}
            >
                <span class="overflow-hidden text-ellipsis whitespace-nowrap px-3 py-1 inline-flex items-center gap-1">
                    {children}
                    {/* <pre class="rounded-[4px] items-center border border-black-500 m-2 p-4">
						<p class="underline font-bold mb-2">Chip props</p>
						<p class="font-bold my-2">Children: <span class="text-blue-500">{children}</span></p>
						<p class="font-bold my-2">Class: <span class="text-blue-500">{() => $$(className)}</span></p>
						<p class="font-bold my-2">Deletable: <span class="text-blue-500">{() => $$(deletable).toString()}</span></p>
						<p class="font-bold my-2">Visible: <span class="text-blue-500">{() => $$(visible).toString()}</span></p>
					</pre> */}
                </span>
                {isDeletable}
            </div>
        )
    }
}) as typeof Chip


export { Chip }

customElement("wui-chip", Chip)

declare module "woby" {
    namespace JSX {
        interface IntrinsicElements {
            "wui-chip": ElementAttributes<typeof Chip>
        }
    }
}

export default Chip

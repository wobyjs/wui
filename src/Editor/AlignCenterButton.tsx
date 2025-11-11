import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type CustomElementChildren, type StyleEncapsulationProps, useEffect } from "woby"
import '@woby/chk'
import '../input.css'

import { Button } from '../Button'
import AlignCenter from '../icons/align_center'
import { useEditor } from './undoredo'
import { applyTextAlign } from './AlignLeftButton'

// Default props
const def = () => ({
    buttonType: $("outlined" as "text" | "contained" | "outlined" | "icon"),
    title: $("Align Center"),
    class: $(""),
    disabled: $(false) as Observable<boolean>,
})

const AlignCenterButton = defaults(def, (props) => {
    const { buttonType, title, class: cls, disabled, ...otherProps } = props
    const editor = useEditor();

    return (
        <Button 
            buttonType={buttonType}
            title={title}
            class={cls}
            disabled={disabled}
            onClick={() => {
                applyTextAlign('center', editor)
            }}
            {...otherProps}
        >
            <AlignCenter />
        </Button>
    )
}) as typeof AlignCenterButton & StyleEncapsulationProps

// const AlignCenterButton = () => {
//     const editor = useEditor()

//     return (
//         <Button 
//             buttonType='outlined' 
//             title="Align Center"
//             onClick={() => {
//                 applyTextAlign('center', editor)
//             }}
//         >
//             <AlignCenter />
//         </Button>
//     )
// }

export { AlignCenterButton }

// NOTE: Register the custom element
customElement('wui-align-center-button', AlignCenterButton);

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-align-center-button': ElementAttributes<typeof AlignCenterButton>
        }
    }
}

export default AlignCenterButton

// #region Original AlignCenterButton
// import { Button } from '../Button'
// import AlignCenter from '../icons/align_center'
// import { useEditor } from './undoredo' // Removed useUndoRedo
// import { applyTextAlign } from './AlignLeftButton'

// export const AlignCenterButton = () => {
//     // const { undos, saveDo } = useUndoRedo() // Removed
//     const editor = useEditor()

//     return <Button buttonType='outlined' onClick={() => {
//         // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this

//         applyTextAlign('center', editor)
//     }} title="Align Center"><AlignCenter /></Button>
// }
// #endregion
/**
 * PrintButton.tsx — the toolbar control for {@link printEditor}.
 *
 * Thin on purpose. Everything printing actually does lives in Print.ts; this is the
 * button that finds the surface and hands it over, the same split PageLayout and
 * LayoutSwitch already use.
 *
 * Pressing it puts the editor into `page` first. That is not a shortcut — it is the whole
 * point: page mode builds the boxes the printer gets, so proofing and printing have to be
 * the same layout or the preview is a guess. The mode goes back to whatever the author
 * had as soon as the dialog closes.
 */

import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, type JSX, ObservableMaybe } from 'woby'
import { Button, ButtonStyles } from '../Button'
import PrintIcon from '../icons/print'
import { useEditor } from './undoredo'
import { getCurrentEditor } from './utils'
import { setEditorLayout } from './LayoutSwitch'
import { printEditor } from './Print'

const def = () => ({
    type: $('outlined', HtmlString) as ObservableMaybe<ButtonStyles>,
    /** Empty means "icon only", which is what the toolbar wants. */
    label: $('', HtmlString) as ObservableMaybe<string>,
    title: $('Print — proofs on paper-sized sheets first', HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
})

const PrintButton = defaults(def, (props) => {
    const { label, title, cls, class: cn, ...otherProps } = props

    const editor = useEditor()

    const handleClick = () => {
        // Same fallback the rest of the toolbar uses: the context is empty until the
        // surface has mounted and taken focus once.
        const el = ($$(editor) ?? $$(getCurrentEditor())) as HTMLElement | undefined
        if (!el) { console.warn('[PrintButton] no editor found.'); return }
        // Going through the switch's setter rather than applyLayout keeps the layout
        // strip showing `page` while the dialog is open, instead of pointing at a mode
        // the document is not in.
        void printEditor(el, { setMode: mode => setEditorLayout(el, mode) })
    }

    return (
        <Button
            title={title}
            onClick={handleClick}
            // Same guard the rest of the toolbar uses: a mousedown that reaches the
            // document collapses the selection, and pagination restores the caret it was
            // given, so losing it here would lose the author's place.
            onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation() }}
            cls={() => [
                'border-none p-1.5 transition-all',
                'text-gray-700 hover:bg-gray-100 cursor-pointer',
                () => $$(cls) ? $$(cls) : $$(cn),
            ]}
            {...otherProps}
        >
            <span class="flex items-center gap-1">
                <PrintIcon class="size-5" />
                {() => $$(label) || null}
            </span>
        </Button>
    )
})

export { PrintButton }

customElement('wui-print-button', PrintButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-print-button': ElementAttributes<typeof PrintButton>
        }
    }
}

export default PrintButton

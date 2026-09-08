/**
 * LayoutSwitch.tsx — the three-way flow / page / screen control.
 *
 * The engine is in PageLayout.ts and knows nothing about woby; this is the button strip
 * that drives it, and the one piece of the feature that has to be a component.
 *
 * The three modes, and why an editor wants all three:
 *
 *   flow    authoring. One continuous column, editor-only markers visible (page breaks,
 *           block frames, insertion points). Nothing is measured, so typing is as cheap
 *           as it is in an editor that has never heard of pages.
 *   page    proofing. The document is cut into sheets of the configured size and is
 *           still fully editable — this is the mode you switch to in order to get a
 *           document ready to print, and what you see is what the printer gets.
 *   screen  reading. Not editable, markers hidden, no paper width imposed — the shape a
 *           document should have when it is being read on whatever device turned up.
 *
 * Grouped as one control rather than three buttons because they are exclusive: the strip
 * shows which mode is current, and pressing a mode you are already in does nothing.
 */

import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, ObservableMaybe } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import { getCurrentEditor } from './utils'
import { applyLayout, flushLayoutSilenced, Layout, type LayoutMode } from './PageLayout'

/**
 * The mode the editor is in, as an observable, so anything else in the editor can react
 * to it — the surface's `contentEditable` binding is the one that has to.
 *
 * Module-level, deliberately: PageLayout keeps a single active session (one surface
 * paginates at a time), and a second mirror of that state would be a second thing to
 * keep in sync. Read it; write it through {@link setEditorLayout}.
 */
export const editorLayout = $<LayoutMode>(Layout.flow)

/**
 * Put `root` into `mode` and publish the change.
 *
 * Exported so a host can set the mode from its own chrome — a print button that wants to
 * proof first, say — without reaching for the toolbar.
 */
export const setEditorLayout = (root: HTMLElement | null | undefined, mode: LayoutMode) => {
    applyLayout(root, mode)
    editorLayout(mode)
    // Changing the mode is not an edit, and `applyLayout` already dropped the records its
    // own rewrite queued. The line above adds one more after the fact: it re-runs the
    // surface's reactive bindings, which makes woby re-assert `contentEditable` on it.
    // Without this the history observer sees that record and every press of these three
    // buttons lands on the undo stack.
    flushLayoutSilenced()
}

/** The six strings the control shows. See {@link layoutText}. */
export interface LayoutText {
    flow: string
    page: string
    screen: string
    flowTitle: string
    pageTitle: string
    screenTitle: string
}

/**
 * The control's wording, app-wide.
 *
 * The switch is rendered by wui's own toolbar, so a host has no call site to pass props
 * through — an app in another language would otherwise be stuck with English buttons in
 * the middle of its own chrome. Assign this once at start-up:
 *
 * ```ts
 * layoutText({ ...$$(layoutText), flow: '流', page: '页', screen: '览' })
 * ```
 *
 * A prop set explicitly on a hand-placed `<LayoutSwitch>` still wins over it.
 */
export const layoutText = $<LayoutText>({
    flow: 'Flow',
    page: 'Page',
    screen: 'Read',
    flowTitle: 'Continuous editing, layout markers shown',
    pageTitle: 'Paginated sheets — what the printer gets',
    screenTitle: 'Read-only, no paper width',
})

const def = () => ({
    buttonType: $('outlined', HtmlString) as ObservableMaybe<ButtonStyles>,
    /**
     * Labels and tooltips. Empty means "use {@link layoutText}", which is the path every
     * toolbar-rendered switch takes; set one to override just that string here.
     */
    flowLabel: $('', HtmlString) as ObservableMaybe<string>,
    pageLabel: $('', HtmlString) as ObservableMaybe<string>,
    screenLabel: $('', HtmlString) as ObservableMaybe<string>,
    flowTitle: $('', HtmlString) as ObservableMaybe<string>,
    pageTitle: $('', HtmlString) as ObservableMaybe<string>,
    screenTitle: $('', HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as ObservableMaybe<string>,
    class: $('', HtmlClass) as ObservableMaybe<string>,
})

const LayoutSwitch = defaults(def, (props) => {
    const { buttonType, flowLabel, pageLabel, screenLabel,
        flowTitle, pageTitle, screenTitle, cls, class: cn } = props

    const editor = useEditor()

    const go = (mode: LayoutMode) => () => {
        // `getCurrentEditor()` is the same fallback the other toolbar buttons use: the
        // context is empty until the surface has mounted and taken focus once.
        const el = ($$(editor) ?? $$(getCurrentEditor())) as HTMLElement | undefined
        if (!el) { console.warn('[LayoutSwitch] no editor found.'); return }
        setEditorLayout(el, mode)
    }

    const Mode = ({ mode, label, title }: { mode: LayoutMode, label: any, title: any }) =>
        <Button
            type={buttonType}
            title={title}
            class={() => [
                () => $$(cls) ? $$(cls) : $$(cn),
                () => $$(editorLayout) === mode ? '!bg-slate-200' : '',
            ]}
            onClick={go(mode)}
            // Same guard the rest of the toolbar uses: a mousedown that reaches the
            // document collapses the selection, and pagination restores the caret it
            // was given, so losing it here would lose the author's place.
            onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation() }}
        >
            <span class="flex items-center gap-2">{label}</span>
        </Button>

    // Prop first, global text second, and both read inside the `() =>` so a host that
    // sets `layoutText` after the toolbar has mounted still re-labels it.
    const pick = (prop: ObservableMaybe<string>, key: keyof LayoutText) =>
        () => $$(prop) || $$(layoutText)[key]

    return <div class="flex items-center gap-0.5">
        <Mode mode={Layout.flow} label={pick(flowLabel, 'flow')} title={pick(flowTitle, 'flowTitle')} />
        <Mode mode={Layout.page} label={pick(pageLabel, 'page')} title={pick(pageTitle, 'pageTitle')} />
        <Mode mode={Layout.screen} label={pick(screenLabel, 'screen')} title={pick(screenTitle, 'screenTitle')} />
    </div>
})

export { LayoutSwitch }

customElement('wui-layout-switch', LayoutSwitch)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-layout-switch': ElementAttributes<typeof LayoutSwitch>
        }
    }
}

export default LayoutSwitch

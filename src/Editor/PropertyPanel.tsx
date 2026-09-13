/** @jsxImportSource woby */

import { $, $$, Observable, ObservableMaybe, createContext, useContext, useEffect, isObservable, JSX } from 'woby'
import { PropertyForm } from '../PropertyForm/PropertyForm' // Import component directly (not just side-effect)
import '../PropertyForm/StringEditor' // Side-effect: registers StringEditor
import '../PropertyForm/NumberEditor' // Side-effect: registers NumberEditor
import '../PropertyForm/BooleanEditor' // Side-effect: registers BooleanEditor
import '../PropertyForm/ColorEditor' // Side-effect: registers ColorEditor
import '../PropertyForm/ObjectEditor' // Side-effect: registers ObjectEditor
import '../PropertyForm/EnumEditor' // Side-effect: registers EnumEditor
import {
    detectSelectionType,
    extractImageProperties,
    extractTextProperties,
    extractCustomElementProperties,
    customElementWatchSpec,
    applyImageProperty,
    applyTextProperty,
    applyCustomElementProperty,
    classifyElement,
    getSelectableParent,
    deleteSelectedElement,
    deleteRefusalReason,
    SelectionType,
} from './PropertyExtractor'
import { getPluginForElement } from './EditorPlugin'
import { openImageEditor } from './ImageEditor'
import { ORIGIN_ATTR, readImageOrigin } from './ImageSource'
import { useEditor, useUndoRedo } from './undoredo'
import { t, tx } from '../i18n'
import { StyleEditor } from './StyleEditor'
import ArrowUpward from '../icons/arrow_upward'
import DeleteOutline from '../icons/delete_outline'

/**
 * PropertyPanelContext: Shared state between InfoButton (toolbar)
 * and PropertyPanel (editor surface).
 *
 * CRITICAL: InfoButton sets propertyTarget and selectionType BEFORE
 * opening the panel. PropertyPanel reads these values instead of
 * re-detecting the selection (which would fail because focus shifts
 * to the button on click, clearing the shadow root selection).
 */
export const PropertyPanelContext = createContext<{
    panelOpen: Observable<boolean>
    propertyTarget: Observable<HTMLElement | null>
    selectionType: Observable<SelectionType>
}>()

export const usePropertyPanel = () => useContext(PropertyPanelContext)!

/**
 * PropertyPanel: A right-side panel that renders <PropertyForm>
 * for the currently selected element (image, text, or custom element).
 *
 * Rendered as a sibling of <ImageResizer /> and <TablePopupMenu />
 * inside EditorSurface's <div class="relative"> container.
 *
 * CRITICAL: Uses onMouseDown with preventDefault/stopPropagation to
 * prevent focus loss when clicking inside the panel. Uses ref-based
 * onclick for close button (shadow DOM pattern).
 *
 * CRITICAL: Reads observables from PropertyPanelContext (usePropertyPanel())
 * instead of receiving them as JSX props. This ensures the same observable
 * references are shared with InfoButton, so reactivity works correctly.
 */
export const PropertyPanel = () => {
    // CRITICAL: Read from context directly, NOT from props.
    // When observables are passed through JSX props, Woby may wrap them
    // in a new observable, breaking reactivity with the source.
    const panelCtx = usePropertyPanel()
    // CRITICAL: useContext() returns an observable wrapping the context value.
    // Must unwrap with $$() to get the actual object with panelOpen, propertyTarget, selectionType.
    const ctx = $$(panelCtx)
    const panelOpen = ctx.panelOpen
    const propertyTarget = ctx.propertyTarget
    const selectionType = ctx.selectionType
    const propsObj = $<Record<string, Observable<any>> | null>(null)
    // CRITICAL: Tracks the last element we extracted properties from.
    // Used to prevent re-extraction when the same element triggers a reactive
    // cascade (e.g., Enter keyup in a TextField re-runs the first useEffect,
    // which would re-extract OLD values from the DOM and overwrite the pending
    // sync effect that was about to apply the new value).
    const lastExtractedTarget = $<HTMLElement | null>(null)
    const disposeEffects: (() => void)[] = []

    // ── Floating dialog position ──
    // null = "not moved yet", which renders at the default top-right corner. Once the
    // user drags, we switch to explicit viewport coordinates and keep them for the rest
    // of the session, so reopening the panel puts it back where they left it.
    const panelPos = $<{ x: number, y: number } | null>(null)
    const dragging = $(false)

    // ── Floating dialog size ──
    // null = "not resized yet", which leaves the w-[300px] / max-h-[70vh] classes in
    // charge. Once the user drags a grip we switch to explicit pixels (and clear the
    // max-height, or the class would keep clamping the new height) and keep them for
    // the rest of the session, same as panelPos.
    const panelSize = $<{ w: number, h: number } | null>(null)
    const resizing = $(false)

    /** Below these the header and the first form row stop being usable. */
    /**
 * The viewport as *layout* sees it, excluding any classic scrollbar.
 *
 * `window.innerWidth` counts the scrollbar gutter, so clamping the panel's right edge to
 * it parked that edge under the scrollbar -- 15 px of overhang on a stock Chrome window,
 * which is wider than the 6 px `e` grip. The one grip a user reaches for to shrink a
 * too-wide panel was the one guaranteed to be unreachable, and the `se` corner kept about
 * a pixel. `clientWidth` is the number the clamp's own comment was describing.
 */
const viewportW = () => document.documentElement.clientWidth || window.innerWidth
const viewportH = () => document.documentElement.clientHeight || window.innerHeight

const MIN_W = 240
    const MIN_H = 140

    // Helper: extract properties from the current target based on selection type
    const extractFromTarget = (element: HTMLElement, type: SelectionType) => {
        switch (type) {
            case 'image':
                return extractImageProperties(element as HTMLImageElement)
            case 'text':
                return extractTextProperties(element)
            case 'custom':
                return extractCustomElementProperties(element)
            default:
                return null
        }
    }

    // Guarded like every other consumer: PropertyPanel renders inside <UndoRedo> in the
    // editor, but is a plain component that a test (or an embedder) can mount on its own,
    // and an unguarded destructure throws on every call there.
    const undoRedoContext = useUndoRedo()
    const saveDo = undoRedoContext?.saveDo ?? (() => { })
    // The editor content root, used to keep deletion inside the document.
    const activeEditor = useEditor()
    const editorRootEl = () => (activeEditor ? ($$(activeEditor) as HTMLElement | null) : null)

    /**
     * Remove the targeted element from the document.
     *
     * The panel needs its own control for this because native editing cannot do it:
     * Chrome refuses to delete a shadow host, so Backspace over an embedded component
     * is a silent no-op. See {@link deleteSelectedElement} for the measurements.
     *
     * The button is the touch-reachable half of the pair -- the keyboard path in
     * EditorSurface deletes the same targets on Backspace/Delete, but only reaches a
     * container once the parent arrow has walked the selection mark up to it, and only
     * while that mark survives. This button works from the panel's own target, so it
     * stays available on touch and after the caret has moved on.
     *
     * Panel state is cleared explicitly because nothing else would: the target is now a
     * detached node, and no other code path drops it. Restoring the caret often fires a
     * selectionchange that immediately retargets the panel at whatever the caret landed
     * in -- measured, that is what usually happens -- which is fine and arguably better
     * than an empty panel. Clearing first is what guarantees the panel never keeps
     * pointing at a node that is no longer in the document.
     */
    const deleteTarget = () => {
        const target = $$(propertyTarget)
        const result = deleteSelectedElement(target, editorRootEl())
        if (!result.ok) {
            return
        }
        propertyTarget(null)
        selectionType('none')
        propsObj(null)
        lastExtractedTarget(null)
        saveDo()
    }

    /**
     * Move the panel's target one level up the composed tree.
     *
     * The reason this exists: a click can only ever land on the innermost element under
     * the pointer, so structural containers are unreachable by pointing at them. Clicking
     * inside a table cell selects the `td` (or the text inside it) and there is no gesture
     * that reaches the `tr` or the `table`. Same for a node rendered inside an embedded
     * component's shadow root -- the click selects the inner node, and the component host
     * that actually carries the authorable attributes is never the target.
     *
     * Three pieces of state move together, mirroring what the selectionchange handler does,
     * so the climb is indistinguishable from an ordinary selection:
     *
     *  - `data-element-selected` moves to the new target. That is what draws the blue
     *    outline and anchor glyph, so the user can see which box they climbed to -- without
     *    it the panel contents change with no indication of where they now point. It also
     *    keeps detectSelectionType() agreeing with the panel: the mark outranks every other
     *    detection path, so leaving it on the child would make the next selectionchange
     *    yank the target back down.
     *  - `selectionType` is re-derived with classifyElement rather than carried over. A
     *    `wui-badge` climbing to its containing `td` has to switch from the attribute
     *    extractor to the computed-style one.
     *  - `lastExtractedTarget` is set so the extract-on-change effect treats this as
     *    already handled and does not re-read stale DOM values over the fresh ones.
     */
    const selectParent = () => {
        const current = $$(propertyTarget)
        const parent = getSelectableParent(current)
        if (!parent) return

        current?.removeAttribute('data-element-selected')
        parent.setAttribute('data-element-selected', '')

        const type = classifyElement(parent)
        selectionType(type)
        propertyTarget(parent)
        propsObj(extractFromTarget(parent, type))
        lastExtractedTarget(parent)
    }

    // When panel opens or target changes, extract properties
    // CRITICAL: Use propertyTarget/selectionType set by InfoButton,
    // NOT detectSelectionType() which fails because focus has shifted
    useEffect(() => {
        const isOpen = $$(panelOpen)
        if (!isOpen) {
            propsObj(null)
            lastExtractedTarget(null)
            return
        }

        const target = $$(propertyTarget)
        const type = $$(selectionType)

        if (!target) {
            propsObj(null)
            lastExtractedTarget(null)
            return
        }

        // CRITICAL: Skip re-extraction if we already extracted from this same element.
        // This prevents the race condition where the Enter keyup triggers a reactive
        // cascade that re-runs this effect, re-extracting OLD values from the DOM
        // and overwriting the pending sync effect that was about to apply the new value.
        const prev = $$(lastExtractedTarget)
        if (prev && target.isSameNode(prev)) {
            return
        }
        lastExtractedTarget(target)

        const extracted = extractFromTarget(target, type)
        propsObj(extracted)
    })

    // Bidirectional sync: when propsObj values change, apply to DOM
    // CRITICAL: Individual effects per property — Woby's useEffect only tracks
    // top-level observable reads. Reading $(obs) inside .forEach() after the
    // outer $(propsObj) unwrap does NOT register inner observables as dependencies.
    // By creating a separate effect() for each property, each observable is
    // properly tracked and changes propagate to the DOM element automatically.
    useEffect(() => {
        const obj = $$(propsObj)
        const target = $$(propertyTarget)
        if (!obj || !target) {
            // Dispose any lingering inner effects when propsObj/target is cleared
            disposeEffects.forEach(fn => fn())
            disposeEffects.length = 0
            return
        }

        const type = $$(selectionType)

        // Dispose previous inner effects — propsObj or target changed, so old
        // subscriptions are stale.
        disposeEffects.forEach(fn => fn())
        disposeEffects.length = 0

        // Create one effect per property observable. Each effect auto-tracks
        // its own observable via $(obs) and applies changes to the DOM element.
        Object.entries(obj).forEach(([key, obs]) => {
            // CRITICAL: skip the effect's FIRST run. That run only replays the value
            // we just extracted *from* the element, so writing it back is at best a
            // no-op and at worst destructive:
            //   - applyCustomElementProperty() deletes any attribute whose value
            //     equals the plugin default, so merely OPENING the panel on
            //     <wui-button type="contained" children="Button"> stripped both
            //     attributes and left the button unstyled and unlabelled.
            //   - propsObj and propertyTarget are set by two separate observable
            //     writes, so between them this effect re-runs with the PREVIOUS
            //     selection's props against the NEW element — that is how text
            //     properties (fontweight/fontsize/color/...) ended up smeared onto
            //     an embedded <wui-button> as attributes.
            // Only a genuine user edit (a later run) may touch the DOM.
            let extractionPass = true
            const dispose = useEffect(() => {
                try {
                    const val = $$(obs)
                    if (extractionPass) { extractionPass = false; return }
                    if (val === undefined || val === null) return

                    switch (type) {
                        case 'image':
                            applyImageProperty(target as HTMLImageElement, key, val)
                            break
                        case 'text':
                            applyTextProperty(target, key, val)
                            break
                        case 'custom':
                            applyCustomElementProperty(target, key, val)
                            break
                    }

                    // Property edits are content edits, so they belong on the same
                    // history stack as typing. saveDo() snapshots the editor's
                    // innerHTML, which already carries the attribute we just wrote,
                    // and its 300ms debounce collapses a burst of keystrokes in one
                    // field into a single undo step instead of one step per character.
                    //
                    // This also covers edits that did NOT originate in the panel: an
                    // attribute changed by the element's own UI arrives here through
                    // the mirror effect below, which is what makes a counter's +/-
                    // undoable at all.
                    saveDo()
                } catch (e) {
                    console.error(`[PropertyPanel] per-property effect error for ${key}:`, e)
                }
            })
            disposeEffects.push(dispose)
        })
    })

    /**
     * Mirror the element back into the panel -- the DOM -> panel half of the
     * two-way binding.
     *
     * Extraction takes a *snapshot*: `extractCustomElementProperties` builds a
     * fresh observable per prop, so the rows hold values as they were at
     * selection time and nothing links them back to the element. Every other
     * writer -- the Styles chips, the element's own UI (a counter's +/- buttons,
     * a switch's thumb), a script, an undo -- moves the DOM out from under a
     * panel that goes on displaying the old value, and the next edit through a
     * row writes that stale value back over them.
     *
     * The fix is to write into the *existing* observables rather than rebuild
     * `propsObj`. Observable identity is what keeps the rows and the per-property
     * effects above wired up; replacing the map would tear all of that down and
     * re-run extraction, which is the exact race `lastExtractedTarget` exists to
     * prevent. For the same reason only keys already present are synced -- a prop
     * appearing or disappearing would need new rows, so it needs a full re-select.
     *
     * The round trip terminates on its own. A mirrored value re-runs that prop's
     * effect, which writes the same value back to the attribute; the resulting
     * mutation record extracts to a value the observable already holds, and
     * writing an unchanged value into a woby observable notifies nobody.
     */
    useEffect(() => {
        const target = $$(propertyTarget)
        const obj = $$(propsObj)
        if (!target || !obj || $$(selectionType) !== 'custom') return

        const { attributeFilter, text } = customElementWatchSpec(target)

        const mo = new MutationObserver(() => {
            const fresh = extractCustomElementProperties(target)
            for (const key of Object.keys(obj)) {
                // Not every entry is an observable -- `tagName` is extracted as a
                // plain string, and calling it would throw straight out of the
                // MutationObserver callback, where nothing is left to catch it.
                const cur = obj[key]
                if (!isObservable(cur)) continue
                const next = fresh[key]
                if (next !== undefined) cur($$(next))
            }
        })
        mo.observe(target, {
            attributes: true,
            // Omitted for a blind-scraped element, where every attribute is a row.
            ...(attributeFilter ? { attributeFilter } : {}),
            // A textContent prop reads the light DOM, so it needs the subtree too.
            // The attribute filter still applies, so the wider scope costs at most a
            // few redundant -- and idempotent -- re-extracts.
            ...(text ? { childList: true, characterData: true, subtree: true } : {}),
        })
        return () => mo.disconnect()
    })

    /**
     * Re-bind the panel after undo/redo rebuilds the editor's content.
     *
     * `undo()` restores by assigning `innerHTML` on the editor root, which destroys
     * and recreates every node beneath it. The panel's target survives that as a
     * *detached* node, and nothing about the panel looks wrong: the rows still
     * render, the fields still accept input, and every edit lands on an element
     * that is no longer in the document, so it is invisible, unsaved, and lost.
     *
     * `data-element-selected` is what finds the replacement. It is an ordinary
     * attribute, so it serializes into the snapshot and comes back on the restored
     * node, and adopting it keeps the outline, `detectSelectionType()` and the panel
     * all pointing at the same element.
     *
     * Nothing else is tried. A recorded child-index path looks like a reasonable
     * fallback and is not: on an ordinary removal -- one element deleted, siblings
     * shifting up -- the old index resolves to the *neighbour*, and the panel
     * silently starts editing an element the user never picked. Measured on the
     * demo, deleting a `wui-button` retargeted the panel at the next `wui-button`
     * with no visible change. Without the mark the target is simply gone, so the
     * panel clears rather than guess.
     */
    useEffect(() => {
        const root = editorRootEl()
        if (!root) return

        const mo = new MutationObserver(() => {
            const target = $$(propertyTarget)
            if (!target || target.isConnected) return

            const restored = root.querySelector('[data-element-selected]') as HTMLElement | null
            if (!restored || restored.tagName !== target.tagName) {
                propertyTarget(null)
                selectionType('none')
                propsObj(null)
                lastExtractedTarget(null)
                return
            }

            const type = classifyElement(restored)
            selectionType(type)
            propertyTarget(restored)
            propsObj(extractFromTarget(restored, type))
            lastExtractedTarget(restored)
        })
        mo.observe(root, { childList: true, subtree: true })
        return () => mo.disconnect()
    })

    // Track whether focus is inside the property panel.
    // CRITICAL: This is more reliable than checking shadow.activeElement in the
    // selectionchange handler, because shadow.activeElement is null after Enter keyup
    // (the browser clears activeElement when the Enter key event is processed).
    // focusin/focusout events fire before selectionchange, so the flag is always
    // set correctly when the handler runs.
    const panelFocused = $(false)

    // Listen for focus entering/leaving the panel
    // CRITICAL: Use focusin/focusout (bubble) instead of focus/blur (don't bubble).
    // In shadow DOM, focusin/focusout compose correctly across shadow boundaries.
    useEffect(() => {
        if (!$$(panelOpen)) return

        // Support both shadow DOM and light DOM modes
        const host = document.querySelector('wui-editor') as HTMLElement | null
        const shadow = host?.shadowRoot
        const root = shadow ?? document
        const panel = root.querySelector('[data-property-panel]')
        if (!panel) {
            return
        }

        const handleFocusIn = (e: FocusEvent) => {
            const path = e.composedPath()
            if (path.includes(panel)) {
                panelFocused(true)
            }
        }

        const handleFocusOut = (e: FocusEvent) => {
            // Test where focus is GOING (relatedTarget), not where it came from.
            // composedPath() here is the ancestor chain of the *blurring* element,
            // which is by definition inside the panel — this listener is attached to
            // the panel, so a focusout it receives always has the panel in its path.
            // The old `!path.includes(panel)` test was therefore never true, and
            // panelFocused latched at true forever after the first click inside the
            // panel. With the flag stuck on, the selectionchange handler early-returns
            // and the panel stops following the caret entirely.
            const next = e.relatedTarget as Node | null
            // relatedTarget is retargeted relative to this listener's tree, so a focus
            // landing inside a nested component's shadow root surfaces as that
            // component's host — still a descendant of the panel, still "inside".
            if (next && !panel.contains(next)) {
                panelFocused(false)
            }
            // A null relatedTarget is deliberately NOT treated as leaving. Pressing
            // Enter in a panel input blurs to nothing, and clearing the flag there
            // would let the following selectionchange re-extract and wipe the edit
            // that is still being committed — the exact case this flag guards.
            // Clicks that land outside the panel are handled by handlePointerDown.
        }

        /**
         * Committing a panel field leaves the focus nowhere, which takes the whole
         * editor off the keyboard.
         *
         * Two field kinds do it. `TextField assignOnEnter` blurs itself to commit, and a
         * native `<select>` drops focus once its popup closes; in both cases
         * `document.activeElement` falls back to `<body>` and nothing claims it. The blur
         * is deliberate -- it is what the `panelFocused` note above describes -- but the
         * fallout is not: the undo shortcut is bound to the editable surface, so after
         * editing one property Ctrl+Z did nothing at all. Not because the history was
         * empty (the toolbar's Undo button unwound the very same edits) but because the
         * keystroke was being delivered to the document body.
         *
         * So put it back on the surface the edit belongs to. The component stays
         * node-selected, and undo, redo and the arrow navigation are live again on the
         * next keystroke.
         *
         * Two events, not one. The commit is not synchronous with the keystroke that
         * asks for it -- measured, a text field lets go of the focus about half a second
         * after Enter -- so a deferred check on the keydown runs while the input still
         * holds focus, reads that as "the field kept it", and does nothing at all. That
         * was the first attempt, and it changed no behaviour. So the keystroke (or the
         * `change`, for the fields that never see an Enter here at all: a select's popup
         * swallows it) only arms this, and the focusout that follows acts on it.
         *
         * The arming matters as much as the acting. A bare "focus left the panel to
         * nowhere" rule looks equivalent and is not: opening a select's popup blurs the
         * page exactly that way *before* anything is committed, and pulling the focus
         * back there drops the node selection and closes the panel mid-edit. Only a blur
         * that follows a commit is one we may answer.
         *
         * A focusout that names where it is going is left alone -- a field handing focus
         * onward, Tab to the next row, a click that has already chosen its target. So is
         * one from a colour swatch, whose native picker fires `change` as you drag and
         * would be dismissed the instant we pulled the focus back.
         */
        let commitArmed: ReturnType<typeof setTimeout> | undefined
        const disarm = () => { clearTimeout(commitArmed); commitArmed = undefined }
        // Long enough to outlast the field's own deferred commit, short enough that an
        // idle blur minutes later is not mistaken for one.
        const arm = () => { disarm(); commitArmed = setTimeout(disarm, 1500) }

        const handleCommitKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) arm()
        }
        const handleCommitChange = () => arm()

        const handleCommitBlur = (e: FocusEvent) => {
            if (commitArmed === undefined || e.relatedTarget) return
            const from = e.composedPath()[0]
            if (from instanceof HTMLInputElement && from.type === 'color') return
            // After the focusout has settled, not during it. Two reasons, and the second
            // is why this waits rather than deferring a bare tick: the focus is still
            // formally on the blurring field while the event runs, so focusing anything
            // else here is undone as the browser tears the old focus down -- and a select
            // whose popup is open blurs the page while *keeping* the select focused
            // underneath, reporting `<body>` for a moment in between. Look once the dust
            // has settled and that case reads correctly as "the field still has it".
            setTimeout(() => {
                const active = (root as Document | ShadowRoot).activeElement
                // Still in the panel: the field kept the focus, or handed it to a
                // sibling row. Stay armed -- the commit's own blur may still be coming.
                if (active && active !== host && panel.contains(active)) return
                disarm()
                const surface = shadow?.querySelector('[data-editor-root]')
                    ?? document.querySelector('[data-editor-root]')
                if (surface instanceof HTMLElement) surface.focus({ preventScroll: true })
            }, 200)
        }

        panel.addEventListener('focusin', handleFocusIn as EventListener)
        panel.addEventListener('focusout', handleFocusOut as EventListener)
        // Capture on all three, so a field that stops its own Enter, or swallows the
        // change or the focusout it causes, cannot hide them from this.
        panel.addEventListener('keydown', handleCommitKey as EventListener, true)
        panel.addEventListener('change', handleCommitChange, true)
        panel.addEventListener('focusout', handleCommitBlur as EventListener, true)
        return () => {
            panel.removeEventListener('focusin', handleFocusIn as EventListener)
            panel.removeEventListener('focusout', handleFocusOut as EventListener)
            panel.removeEventListener('keydown', handleCommitKey as EventListener, true)
            panel.removeEventListener('change', handleCommitChange, true)
            panel.removeEventListener('focusout', handleCommitBlur as EventListener, true)
            disarm()
        }
    })

    // Listen for selection changes — auto-open and update panel when element is selected.
    // Guard: only update when detectSelectionType() returns a real element.
    // When focus leaves the editor (e.g., clicking toolbar/panel), detectSelectionType()
    // returns 'none' — we must NOT clear the target in that case, because the user
    // didn't intentionally deselect; they just shifted focus temporarily.
    useEffect(() => {
        // CRITICAL: Track the last pointerdown target to detect image clicks.
        // pointerdown fires BEFORE selectionchange, so we can catch image clicks
        // before the browser clears the text selection and before ImageResizer's
        // mousedown handler has a chance to show the overlay.
        // This fixes the text→image transition bug where clicking an image after
        // selecting text fails to update the property panel.
        let lastPointerTarget: HTMLElement | null = null
        let lastPointerInPanel = false
        let lastPointerInEditor = false
        let imageCheckTimer: ReturnType<typeof setTimeout> | null = null

        const handlePointerDown = (e: PointerEvent) => {
            const path = e.composedPath()
            lastPointerTarget = path[0] as HTMLElement
            // Clicking (or dragging) the panel itself is not a selection change.
            lastPointerInPanel = path.some(n =>
                n instanceof HTMLElement && n.hasAttribute?.('data-property-panel'))
            // Whether the press landed on the editable surface at all. composedPath()
            // is what makes this answer right for a click inside a plugin's shadow
            // root, where contains() stops at the host. The deferred check below uses
            // it to tell "the user clicked in the document" from "the user clicked a
            // toolbar button while the caret happened to be in the document".
            lastPointerInEditor = path.some(n =>
                n instanceof HTMLElement && n.hasAttribute?.('data-editor-root'))

            // Pointing at anything outside the panel is an unambiguous "I'm done
            // editing here". This is the release for panelFocused that focusout
            // cannot safely provide: focusout has to ignore blur-to-nothing so an
            // in-progress commit survives Enter, which leaves clicking straight from
            // a panel field into the document with nothing to clear the flag.
            // Runs on pointerdown, which precedes selectionchange, so the handler
            // sees the released flag on the very click that moved the caret.
            if (!lastPointerInPanel) panelFocused(false)

            // CRITICAL: Schedule a deferred check for image selection.
            // In shadow DOM mode, ImageResizer's mousedown handler calls
            // preventDefault() + stopPropagation() on the mousedown event, which
            // prevents the browser from clearing the text selection and firing
            // selectionchange. This means the selectionchange handler below never
            // runs when clicking an image after selecting text.
            //
            // The setTimeout(0) fires AFTER the mousedown event has been fully
            // processed (including ImageResizer's handler), so we can detect the
            // image selection even when selectionchange doesn't fire.
            if (imageCheckTimer) clearTimeout(imageCheckTimer)
            imageCheckTimer = setTimeout(() => {
                imageCheckTimer = null
                const target = lastPointerTarget
                if (!target) return
                // Clicks inside the panel (including the drag handle) are edits, not
                // selection changes — retargeting on them would wipe the form mid-edit.
                if (lastPointerInPanel) return

                // Verify the click landed inside the editor (support both shadow and light DOM)
                const editorHost = document.querySelector('wui-editor') as HTMLElement | null
                const shadow = editorHost?.shadowRoot
                const editorRoot = shadow?.querySelector('[data-editor-root]') ?? document.querySelector('[data-editor-root]')

                const img = target.closest('img') as HTMLImageElement | null
                if (img) {
                    if (!editorRoot?.contains(img)) return

                    const currentTarget = $$(propertyTarget)
                    if (currentTarget && img.isSameNode(currentTarget)) return

                    selectionType('image')
                    propertyTarget(img)
                    propsObj(extractImageProperties(img))
                    lastExtractedTarget(img)
                    // NOTE: Panel is NOT auto-opened here — the user must click the InfoButton
                    // to open the panel. This prevents the panel from popping up unexpectedly
                    // when clicking an image.
                    return
                }

                // ── Marked box / embedded custom element ──
                // An embedded plugin element owns a shadow root, so a click on it is
                // absorbed and the browser fires NO selectionchange — the handler below
                // never runs, and an already-open panel kept showing the PREVIOUS
                // element's props until the user clicked Properties again. Editor.tsx's
                // capture-phase pointerdown has already moved the [data-element-selected]
                // mark by the time this timeout fires, and detectSelectionType() gives
                // that mark top priority, so a plain re-detect is enough.
                const { type, element } = detectSelectionType()
                if (!element) return
                // Accept any type when the detection came from the [data-element-selected]
                // mark. Alt+click marks whatever box the pointer is over -- routinely a
                // plain div or p, which classifyElement() calls 'text', not 'custom'. The
                // old `type !== 'custom'` guard dropped exactly those, so the panel kept
                // showing the previously targeted element.
                //
                // A plain text click is normally the selectionchange handler's business,
                // but that handler only runs when the selection actually *changes*:
                // clicking the spot the caret already occupies fires nothing at all. The
                // panel then keeps whatever it was pointing at -- after a climb with the
                // up arrow, an ancestor -- and the click looks like it did nothing. Worse,
                // the next climb starts from that ancestor and skips the element the user
                // just clicked. So take text clicks here too, as long as the press landed
                // on the editable surface. Doing that on pointerdown is only safe because
                // this runs in a setTimeout(0), after the press has placed the caret;
                // detectSelectionType() reads that caret, so the answer is already final.
                const markedNow = (editorRoot?.hasAttribute('data-element-selected')
                    ? editorRoot as HTMLElement
                    : editorRoot?.querySelector('[data-element-selected]')) as HTMLElement | null
                const fromMark = !!markedNow && element.isSameNode(markedNow)
                if (type !== 'custom' && !fromMark && !lastPointerInEditor) return
                if (element.hasAttribute?.('data-editor-root')) return
                if (!editorRoot?.contains(element)) return

                const currentTarget = $$(propertyTarget)
                if (currentTarget && element.isSameNode(currentTarget)) return

                selectionType(type)
                propertyTarget(element)
                propsObj(extractFromTarget(element, type))
                lastExtractedTarget(element)
            }, 0)
        }
        document.addEventListener('pointerdown', handlePointerDown, true)

        const handler = () => {
            // CRITICAL: Skip re-extraction if focus is inside the property panel.
            // When the user types in an input field inside the panel and presses Enter, the
            // focus change triggers a selectionchange event. detectSelectionType() finds the
            // same image via the overlay check but returns a FRESH element reference, and
            // even with isSameNode(), the re-extraction reads the OLD values from the DOM
            // (because the per-property sync effect hasn't run yet), creating new observables
            // with old values and disposing the pending sync effects that were about to apply
            // the new value from the user's edit.
            // CRITICAL: Use panelFocused flag instead of shadow.activeElement because
            // shadow.activeElement is null after Enter keyup (the browser clears it).
            const pf = $$(panelFocused)
            if (pf) return

            let { type, element } = detectSelectionType()

            // ── Image fallback via pointerdown target ──
            // CRITICAL: When clicking an image after selecting text, the browser fires
            // selectionchange BEFORE ImageResizer's mousedown handler has a chance to
            // show the overlay and set __activeImage. This means detectSelectionType()
            // returns 'text' (collapsed cursor in the old text selection) instead of
            // 'image'. We use the pointerdown target (which fired before selectionchange)
            // to detect the actual image click.
            if (type !== 'image' && lastPointerTarget) {
                const img = lastPointerTarget.closest('img') as HTMLImageElement | null
                if (img) {
                    // Verify the image is inside the editor (support both shadow and light DOM)
                    const editorHost = document.querySelector('wui-editor') as HTMLElement | null
                    const shadow = editorHost?.shadowRoot
                    const editorRoot = shadow?.querySelector('[data-editor-root]') ?? document.querySelector('[data-editor-root]')
                    if (editorRoot?.contains(img)) {
                        type = 'image'
                        element = img
                    }
                }
            }

            // Drop a stale climb mark. `data-element-selected` drives the blue outline
            // and the anchor glyph, and the parent walk moves it up the tree; nothing
            // moves it back down, so after climbing to a container and clicking
            // elsewhere the container stayed outlined.
            //
            // Only clear when the marked node is not the one being targeted. The
            // editor's own capture-phase pointerdown sets this mark on plugin and
            // custom elements and fires BEFORE selectionchange, so an unconditional
            // clear here would erase the mark for the very click that set it — in that
            // case detectSelectionType returns the marked element itself and the guard
            // below leaves it alone.
            if (element) {
                const editorHost = document.querySelector('wui-editor') as HTMLElement | null
                const editorRoot = editorHost?.shadowRoot?.querySelector('[data-editor-root]')
                    ?? document.querySelector('[data-editor-root]')
                // Two queries: querySelector only sees descendants, and the walk can
                // park the mark on the root itself.
                const stale = editorRoot?.hasAttribute('data-element-selected')
                    ? editorRoot as HTMLElement
                    : editorRoot?.querySelector('[data-element-selected]') as HTMLElement | null
                if (stale && !stale.isSameNode(element)) stale.removeAttribute('data-element-selected')
            }

            const currentTarget = $$(propertyTarget)
            // Only update if a new element is selected (not null/none)
            // CRITICAL: Use isSameNode() instead of !== because detectSelectionType()
            // returns a FRESH element reference each time via elementsFromPoint(),
            // so !== would always be true even for the same image element.
            // isSameNode() checks node identity regardless of reference equality.
            if (element && (!currentTarget || !element.isSameNode(currentTarget))) {
                // CRITICAL: Don't auto-open for the editor root element itself
                // (happens when clicking on empty space in the editor in light DOM mode)
                const isEditorRoot = element.hasAttribute?.('data-editor-root')
                if (isEditorRoot) return

                selectionType(type)
                propertyTarget(element)
                propsObj(extractFromTarget(element, type))
                lastExtractedTarget(element)
                // NOTE: Panel is NOT auto-opened here — the user must click the InfoButton
                // to open the panel. This prevents the panel from popping up unexpectedly
                // when selecting/clicking text in the editor.
            }
        }

        document.addEventListener('selectionchange', handler)
        return () => {
            document.removeEventListener('selectionchange', handler)
            document.removeEventListener('pointerdown', handlePointerDown, true)
            if (imageCheckTimer) clearTimeout(imageCheckTimer)
        }
    })

    // Check if target element was removed from DOM — close panel if so.
    // CRITICAL: Must use the editor's shadow root for contains() check,
    // because document.contains() does NOT traverse shadow boundaries.
    useEffect(() => {
        if (!$$(panelOpen)) return

        const check = () => {
            const target = $$(propertyTarget)
            if (target) {
                // Check if element is still connected to any root (shadow or document)
                // isConnected works across shadow DOM boundaries
                if (!target.isConnected) {
                    target.removeAttribute('data-element-selected')
                    panelOpen(false)
                    propertyTarget(null)
                    propsObj(null)
                }
            }
        }

        const interval = setInterval(check, 500)
        return () => clearInterval(interval)
    })

    // The dialog element itself — needed by the drag handler to read its own rect.
    let panelEl: HTMLElement | null = null

    /**
     * Drag the dialog by its header.
     *
     * Wired through a ref (`el.onpointerdown = ...`) rather than a JSX `onPointerDown`
     * prop: woby's delegated listeners don't reach elements inside the editor's shadow
     * root — the same reason the close button below assigns `el.onclick` directly.
     */
    const startDrag = (e: PointerEvent) => {
        // Let the close button (and anything else clickable in the header) do its job.
        const hit = e.composedPath()[0] as HTMLElement
        if (hit?.closest?.('button, input, select, textarea')) return
        if (!panelEl) return

        const rect = panelEl.getBoundingClientRect()
        const dx = e.clientX - rect.left
        const dy = e.clientY - rect.top
        const w = rect.width
        const h = rect.height

        dragging(true)
        e.preventDefault()
        e.stopPropagation()

        const onMove = (ev: PointerEvent) => {
            // Clamp so the dialog can never be dragged fully off-screen — leaving the
            // header unreachable would strand it there for the rest of the session.
            const x = Math.min(Math.max(0, ev.clientX - dx), Math.max(0, window.innerWidth - w))
            const y = Math.min(Math.max(0, ev.clientY - dy), Math.max(0, window.innerHeight - Math.min(h, 40)))
            panelPos({ x, y })
        }
        const onUp = () => {
            dragging(false)
            document.removeEventListener('pointermove', onMove, true)
            document.removeEventListener('pointerup', onUp, true)
        }
        document.addEventListener('pointermove', onMove, true)
        document.addEventListener('pointerup', onUp, true)
    }

    /**
     * Resize the dialog from its left edge, right edge, bottom edge, or either
     * bottom corner.
     *
     * Wired through a ref like `startDrag`, and for the same reason: woby's delegated
     * listeners don't reach elements inside the editor's shadow root.
     */
    const startResize = (dir: 'e' | 's' | 'se' | 'w' | 'sw') => (e: PointerEvent) => {
        if (!panelEl) return

        const rect = panelEl.getBoundingClientRect()

        // Pin the dialog to explicit left/top first. Until the user has dragged it the
        // dialog hangs off `right: 24px`, so widening it would push the *left* edge out
        // instead of following the grip under the pointer.
        if (!$$(panelPos)) panelPos({ x: rect.left, y: rect.top })

        const x0 = e.clientX, y0 = e.clientY
        const w0 = rect.width, h0 = rect.height
        const left = rect.left, top = rect.top
        // A west drag moves the left edge, so the *right* edge is the one that has to
        // stay put -- capture it as the anchor the new width is measured back from.
        const right = rect.right

        const west = dir === 'w' || dir === 'sw'
        const vertical = dir !== 'e' && dir !== 'w'

        resizing(true)
        e.preventDefault()
        e.stopPropagation()

        const onMove = (ev: PointerEvent) => {
            // Clamp to a usable minimum, and to the viewport edge so the dialog can't be
            // grown past the point where its own grips are off-screen.
            let w = w0
            if (west) {
                const x = Math.min(Math.max(0, left + ev.clientX - x0), Math.max(0, right - MIN_W))
                // Position and size have to move together here: the left edge follows the
                // pointer, and the width absorbs the difference so the right edge doesn't drift.
                w = Math.max(MIN_W, right - x)
                panelPos({ x, y: top })
            } else if (dir !== 's') {
                w = Math.min(Math.max(MIN_W, w0 + ev.clientX - x0), Math.max(MIN_W, viewportW() - left))
            }
            const h = vertical
                ? Math.min(Math.max(MIN_H, h0 + ev.clientY - y0), Math.max(MIN_H, viewportH() - top))
                : h0
            panelSize({ w, h })
        }
        const onUp = () => {
            resizing(false)
            document.removeEventListener('pointermove', onMove, true)
            document.removeEventListener('pointerup', onUp, true)
        }
        document.addEventListener('pointermove', onMove, true)
        document.addEventListener('pointerup', onUp, true)
    }

    /**
     * "Commit Changes" — flush whatever the user has typed but not yet committed.
     *
     * String rows render a `<TextField assignOnEnter>`, which writes its observable on
     * Enter or on blur. A value the user typed and left sitting in the input is still
     * only in the DOM, so the per-property effects below have nothing to apply. Blurring
     * the field pushes it through the normal observable → applyXxxProperty path.
     *
     * Deliberately NOT a "write every property back to the element": applyCustomElement-
     * Property() deletes any attribute whose value equals the plugin default, so a
     * blanket re-apply would strip `type="contained"` off a button that never changed.
     */
    const commitPending = () => {
        const root = panelEl?.getRootNode() as Document | ShadowRoot | undefined
        const active = root?.activeElement as HTMLElement | null
        if (active && panelEl?.contains(active) && typeof active.blur === 'function') active.blur()

        // ...and dispatch the blur explicitly on every field. Calling blur() only emits
        // an event when the browser window itself has focus, and the click may already
        // have moved focus off the field before this runs. Re-committing an untouched
        // field is a no-op — it writes the observable's own value straight back, and
        // observable equality stops the per-property effect from firing.
        panelEl?.querySelectorAll('input, textarea').forEach(el =>
            el.dispatchEvent(new FocusEvent('blur')))
    }

    /**
     * Keep the document out from under the docked panel.
     *
     * The panel is a floating dialog: `position: fixed`, draggable, resizable. That is the
     * right shape for a tool window, but it meant that simply opening it buried the right
     * third of every line of text -- measured at 230px of overlap on a stock window, with
     * a hit test at 85% of the line width landing on the panel instead of the paragraph.
     * Nothing was broken, and nothing could be read.
     *
     * The fix is the one the navigation rail already uses: take the room out of layout, so
     * the document is narrower rather than covered. Padding goes on the editor's body row
     * rather than on the surface's own column, so the rail steps aside as well; PageLayout
     * fits paper to that column and re-fits from its own ResizeObserver, so `page` mode and
     * a `Fit` zoom follow along with nothing here having to tell them.
     *
     * Only while the panel is DOCKED. Once the author has dragged it they have said where
     * they want it, and a document that reflowed to chase a window around the screen would
     * be worse than one that lets it overlap.
     */
    const PANEL_GAP = 16
    /** The docked geometry, matching the `w-[300px]` class and the `right: 24px` default. */
    const DOCKED_W = 300
    const DOCKED_RIGHT = 24
    /** Narrower than this and reserving room costs more than the overlap it avoids. */
    const MIN_DOC_W = 320

    useEffect(() => {
        // Read every dependency up front and unconditionally, so the effect re-runs when
        // the panel opens, closes, is dragged away, or is resized.
        const open = $$(panelOpen)
        const dragged = !!$$(panelPos)
        $$(panelSize)

        const body = editorRootEl()?.closest('[data-editor-body]') as HTMLElement | null
        if (!body) return

        const clear = () => { body.style.paddingRight = '' }
        if (!open || dragged) { clear(); return }

        const apply = () => {
            // Measured rather than assumed: the panel is resizable, and reading its real
            // box is what stops these numbers drifting away from the class that sets them.
            const box = panelEl?.getBoundingClientRect()
            const left = box && box.width ? box.left : viewportW() - DOCKED_RIGHT - DOCKED_W
            // Padding is inside the border box, so the row's own right edge does not move
            // when this is applied -- the measurement cannot feed back into itself.
            const right = body.getBoundingClientRect().right
            const want = Math.max(0, Math.round(right - left + PANEL_GAP))
            // A narrow editor can sit almost entirely behind the docked panel, and there the
            // honest gutter is wider than the row itself -- which would squeeze the document
            // to nothing. Below `MIN_DOC_W` there is no arrangement worth having, so the
            // panel is left to overlap: a covered document still beats a vanished one.
            const roomy = body.getBoundingClientRect().width - want >= MIN_DOC_W
            const gutter = roomy ? want : 0
            body.style.paddingRight = gutter ? `${gutter}px` : ''
        }

        // The panel has only just lost its `hidden` class, so it has no box to measure
        // until the next frame.
        const frame = requestAnimationFrame(apply)
        // The panel is pinned to the viewport's right edge and the document is not, so the
        // distance between them is a function of the window width.
        window.addEventListener('resize', apply)
        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('resize', apply)
            clear()
        }
    })

    return (
        <div
            data-property-panel
            ref={(el) => { panelEl = el as HTMLElement }}
            class={() => [
                "fixed flex flex-col w-[300px] max-h-[70vh] overflow-hidden z-[1100]",
                "bg-white border border-gray-200 rounded-md shadow-xl",
                $$(panelOpen) ? '' : 'hidden'
            ]}
            style={() => {
                const p = $$(panelPos)
                const s = $$(panelSize)
                // Before the first drag the dialog parks near the editor's top-right,
                // which is where the docked panel used to live.
                const pos = p
                    ? { left: `${p.x}px`, top: `${p.y}px`, right: 'auto' }
                    : { right: '24px', top: '96px', left: 'auto' }
                // Keys stay identical across both branches so clearing a resize actually
                // hands the sizing back to the classes instead of leaving stale inline px.
                return s
                    ? { ...pos, width: `${s.w}px`, height: `${s.h}px`, maxHeight: 'none' }
                    : { ...pos, width: '', height: '', maxHeight: '' }
            }}
            onMouseDown={(e: MouseEvent) => {
                // CRITICAL: preventDefault here blocks focus + caret placement in <input>
                // fields (and <button> activation). Only intercept mousedown on the panel
                // background itself — never on interactive elements inside the panel.
                // CRITICAL: Must use composedPath()[0] — in shadow DOM, e.target is
                // retargeted to the shadow host (panel div), so target.closest('input')
                // would never find the input. composedPath()[0] gives the actual element.
                const target = e.composedPath()[0] as HTMLElement
                const isInteractive = target.closest('input, textarea, button, select, [contenteditable="true"]')
                if (isInteractive) return
                e.preventDefault()
                e.stopPropagation()
            }}
        >
            {/* Header — doubles as the drag handle */}
            <div
                ref={(el) => { if (el) (el as HTMLElement).onpointerdown = startDrag }}
                class={() => [
                    "px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between select-none",
                    "shrink-0",
                    $$(dragging) ? 'cursor-grabbing' : 'cursor-grab'
                ]}
            >
                {/* Left cluster: climb-to-parent, then what is currently targeted. */}
                <div class="flex items-center gap-2 min-w-0">
                    <button
                        ref={(el) => {
                            // Ref-based onclick, matching the close button: woby's synthetic
                            // onClick delegation does not reach inside a shadow root, which is
                            // where this panel lives. Deliberately NO pointerdown handler --
                            // the panel root already lets mousedown through for interactive
                            // elements so focus lands in the panel, which is what sets
                            // panelFocused and stops selectionchange from undoing the climb.
                            if (el) el.onclick = selectParent
                        }}
                        title={() => t('editor.selectParent')}
                        class={() => [
                            "shrink-0 w-6 h-6 flex items-center justify-center rounded leading-none",
                            "cursor-pointer text-gray-400 hover:text-gray-700 hover:bg-gray-200",
                            // Disabled rather than hidden. A control that disappears at the top
                            // of the tree makes the header reflow and slides the close button
                            // under a pointer that was aimed at the arrow.
                            getSelectableParent($$(propertyTarget)) ? '' : 'opacity-30 pointer-events-none'
                        ]}
                    >
                        <ArrowUpward class="w-4 h-4" />
                    </button>

                    {/* Tag name first, kind second. The tag is the part that changes as the
                        user climbs (td -> tr -> table), so it carries the information; the
                        kind only says which extractor is in use. */}
                    <h3 class="flex items-baseline gap-1.5 min-w-0">
                        <span class="font-mono text-[11px] text-slate-700 truncate">
                            {() => {
                                const el = $$(propertyTarget)
                                return el ? el.tagName.toLowerCase() : ''
                            }}
                        </span>
                        <span class="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {() => {
                                // `kind`, not `t`: the imported `t` is the message lookup, and
                                // the old local shadowed it right where it is needed.
                                const kind = $$(selectionType)
                                return kind === 'image' ? t('editor.property.kind.image')
                                    : kind === 'text' ? t('editor.property.kind.text')
                                        : kind === 'custom' ? t('editor.property.kind.element')
                                            : t('editor.property.kind.none')
                            }}
                        </span>
                    </h3>
                </div>
                {/* Right cluster: delete, then close. The delete control sits here rather
                    than beside the up arrow deliberately -- the arrow gets clicked
                    repeatedly while hunting for the right container, and putting an
                    irreversible-looking action under that same pointer path invites
                    misclicks. */}
                <div class="flex items-center gap-1 shrink-0">
                    <button
                        ref={(el) => {
                            // Ref-based onclick like the other header buttons: woby's
                            // synthetic onClick delegation does not reach into a shadow
                            // root, and this panel lives in one.
                            if (el) el.onclick = deleteTarget
                        }}
                        title={() => {
                            switch (deleteRefusalReason($$(propertyTarget), editorRootEl())) {
                                case 'table': return t('editor.property.deleteTable')
                                case 'editor-root': return t('editor.property.deleteRoot')
                                case 'component-internal': return t('editor.property.deleteInternal')
                                case null: return t('editor.property.delete')
                                default: return t('editor.property.deleteNothing')
                            }
                        }}
                        class={() => [
                            'shrink-0 w-6 h-6 flex items-center justify-center rounded leading-none',
                            'cursor-pointer text-gray-400 hover:text-red-600 hover:bg-red-50',
                            // Disabled, not hidden, for the same reason as the up arrow:
                            // a control that vanishes reflows the header and slides the
                            // close button under a pointer that was aimed elsewhere.
                            deleteRefusalReason($$(propertyTarget), editorRootEl()) ? 'opacity-30 pointer-events-none' : ''
                        ]}
                    >
                        <DeleteOutline class="w-4 h-4" />
                    </button>
                    <button
                        ref={(el) => { if (el) el.onclick = () => { panelOpen(false) } }}
                        class="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer w-6 h-6 flex items-center justify-center"
                    >×</button>
                </div>
            </div>

            {/* Property Form — use JSX component directly (not custom element) for proper
                observable prop passing. It owns the scrolling: the root has to stay
                overflow-hidden so the absolutely positioned grips below sit on the
                dialog's edge instead of scrolling away with the form. */}
            {/* `[&>div]:h-auto` undoes PropertyForm's own `h-full` root: against a
                definite panel height that resolves to 100%, which lets its card (an
                `overflow-hidden` flex item) shrink below its rows and clip them with no
                scrollbar. Auto height puts the rows back at natural size so this
                container scrolls them, exactly as the panel did before it was sizable. */}
            <div class="flex-1 min-h-0 overflow-auto [&>div]:h-auto">
                {() => {
                    const obj = $$(propsObj)
                    return obj ? (
                        <PropertyForm obj={obj} class="m-0" heading="" onCommit={commitPending} />
                    ) : (
                        <div class="p-4 text-sm text-gray-400">{() => t('editor.property.empty')}</div>
                    )
                }}

                {/* Plugin actions. Operations on the element that have no value to
                    type: "reroll this block", "reset to defaults". They sit between the
                    rows and the style editor because they belong to the component, like
                    the rows, but to the element as a whole rather than to any one field.

                    A thunk, so climbing to a different element re-reads the registry --
                    each tag has its own plugin and so its own strip, or none. */}
                {() => {
                    const el = $$(propertyTarget)
                    const isCustom = $$(selectionType) === 'custom'
                    // Render nothing at all when a plugin declares no actions: an empty
                    // container would still contribute its border and padding, and the
                    // panel has to look untouched for the plugins that predate this.
                    if (!el || !isCustom) return <></>
                    const actions = getPluginForElement(el)?.actions
                    if (!actions?.length) return <></>

                    return (
                        <div class="flex flex-wrap gap-1.5 px-3 py-2 border-t border-gray-200">
                            {actions.map(a => (
                                <button
                                    // Ref-based onclick, like every other button in this
                                    // panel: woby's synthetic onClick delegation does not
                                    // reach into a shadow root, and this panel lives in one.
                                    // An onClick={...} here compiles, reads fine, and does
                                    // nothing at runtime.
                                    ref={(b) => {
                                        if (!b) return
                                        b.onclick = () => {
                                            // `el` is captured from this render pass, which is
                                            // the element the user is looking at -- re-reading
                                            // the observable on click would follow a selection
                                            // that moved while the strip was on screen.
                                            a.run(el)
                                            // Attribute edits made through rows are undoable
                                            // (see the per-property effect above); an action
                                            // that writes one should be too. Debounced 300ms,
                                            // so a burst of presses collapses into one step.
                                            saveDo()
                                        }
                                    }}
                                    title={() => tx(a.title ?? a.label)}
                                    class="flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-white text-xs text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100"
                                >
                                    {a.icon ? a.icon() : null}
                                    <span>{() => tx(a.label)}</span>
                                </button>
                            ))}
                        </div>
                    )
                }}

                {/* The same idea for a selected image, which has no plugin to declare
                    actions but has two worth offering. Cropping is destructive, so the
                    way back is a first-class button rather than a hope that undo covers
                    it: `Restore original` re-points the image at the URL it was inserted
                    from, which `data-image-origin` kept.

                    Read at render, not reactively -- the strip re-renders when the
                    selection moves, which is when its answer can change. Applying a crop
                    from here closes the panel's selection anyway. */}
                {() => {
                    const el = $$(propertyTarget)
                    if (!el || $$(selectionType) !== 'image' || el.tagName !== 'IMG') return <></>
                    const img = el as HTMLImageElement
                    const origin = readImageOrigin(img)

                    const btn = 'flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-white text-xs text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
                    return (
                        <div class="flex flex-wrap gap-1.5 px-3 py-2 border-t border-gray-200">
                            <button
                                ref={b => { if (b) b.onclick = () => openImageEditor(img) }}
                                title={() => t('editor.image.cropZoomResize')}
                                class={btn}
                            >
                                <span>{() => t('editor.image.editShort')}</span>
                            </button>
                            {origin
                                ? <button
                                    ref={b => {
                                        if (!b) return
                                        b.onclick = () => {
                                            // The image becomes the original, so nothing is
                                            // left to restore to and the record is spent. A
                                            // later crop re-records it from `src`.
                                            img.removeAttribute(ORIGIN_ATTR)
                                            img.src = origin
                                            img.style.height = 'auto'
                                            saveDo()
                                        }
                                    }}
                                    title={() => t('editor.image.discardCrops', { origin })}
                                    class={btn}
                                >
                                    <span>{() => t('editor.image.restoreOriginal')}</span>
                                </button>
                                : null}
                        </div>
                    )
                }}

                {/* Every CSS property, on both style surfaces. Appended rather than
                    folded into PropertyForm because it edits the element itself, not
                    the component's declared props: PropertyForm's rows come from a
                    plugin's property list, while these rows exist for any element at
                    all. Collapsed by default, so the panel opens at its usual height. */}
                <StyleEditor target={propertyTarget} onEdit={saveDo} />
            </div>

            {/* Resize grips. The corners come last so they hit-test above the edges
                they overlap. `position: fixed` on the root is their containing block. */}
            <div
                ref={(el) => { if (el) (el as HTMLElement).onpointerdown = startResize('e') }}
                class="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize"
            />
            <div
                ref={(el) => { if (el) (el as HTMLElement).onpointerdown = startResize('s') }}
                class="absolute bottom-0 left-0 h-1.5 w-full cursor-ns-resize"
            />
            <div
                ref={(el) => { if (el) (el as HTMLElement).onpointerdown = startResize('w') }}
                class="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize"
            />
            <div
                ref={(el) => { if (el) (el as HTMLElement).onpointerdown = startResize('se') }}
                class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
            >
                <div class={() => [
                    "absolute bottom-[3px] right-[3px] w-2 h-2 border-r-2 border-b-2 pointer-events-none",
                    $$(resizing) ? 'border-blue-400' : 'border-gray-300'
                ]} />
            </div>
            <div
                ref={(el) => { if (el) (el as HTMLElement).onpointerdown = startResize('sw') }}
                class="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize"
            >
                <div class={() => [
                    "absolute bottom-[3px] left-[3px] w-2 h-2 border-l-2 border-b-2 pointer-events-none",
                    $$(resizing) ? 'border-blue-400' : 'border-gray-300'
                ]} />
            </div>
        </div>
    )
}

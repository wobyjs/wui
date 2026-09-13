import { $$, useEffect } from 'woby'
import { useEditor, useFocusManager, useUndoRedo } from './undoredo'
import { attachEditorRuntime } from './EditorCommand'
import { FocusManager } from './FocusManager'

/**
 * Publishes an editor's history and focus manager to {@link attachEditorRuntime}, so that
 * `runEditorCommand` can reach them from a plain function call.
 *
 * It exists because those two are woby *contexts*, and a context is only readable from
 * inside the component tree that provides it. A keyboard handler, a host's own button and
 * a test are all outside it. So one component inside the tree reads them and hands them to
 * a WeakMap keyed on the surface element, which anything can read.
 *
 * ## Why it is not part of the toolbar
 *
 * The obvious place to put this would be `EditorToolbar`, which already sits inside
 * `<UndoRedo>`. But the toolbar is not rendered when the editor is readonly or when
 * `enableToolbar` is false -- and those are exactly the editors a host is most likely to
 * drive by command instead of by button. Mounting the bridge beside the toolbar would mean
 * the API worked everywhere except where it was most needed.
 *
 * Renders nothing.
 */
export const EditorRuntimeBridge = () => {
    const editor = useEditor()
    const undoRedo = useUndoRedo()
    const focus = useFocusManager()

    useEffect(() => {
        const el = $$(editor)
        if (!el || !undoRedo) return
        // A detached stand-in for the render branches that provide no FocusManagerContext.
        // Safe: every FocusManager method returns early on a null editor element, so a
        // command's beginCommand/endCommand pair becomes a no-op rather than a crash.
        attachEditorRuntime(el, { undoRedo, focus: focus ?? new FocusManager() })
    })

    return null
}

export default EditorRuntimeBridge

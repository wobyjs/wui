import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useEditor, useFocusManager } from './undoredo'
import { getCurrentEditor } from './utils'
import { buildCommandContext, getEditorCommand, runEditorCommand } from './EditorCommand'
import { t, tx } from '../i18n'

/**
 * # The standard button for a registered command
 *
 * The whole point of `EditorCommand`: register `{ name, run, isActive }` and get back a
 * button that behaves like `BoldButton` -- pressed state, mixed state, `aria-pressed`,
 * correct focus handling, one undo step -- without writing any of it.
 *
 * It is deliberately a near-copy of `BoldButton` rather than a generalisation of it,
 * because the five-step ritual is sequencing, not abstraction: the order of
 * `preventDefault` / `beginCommand` / apply / `endCommand` / `saveDo` is the behaviour.
 * What is generalised is *which* apply runs, and that is the registry's job.
 *
 * ## Why mousedown and not click
 *
 * The browser moves focus between mousedown and click. By the time click fires, the
 * selection this button is supposed to act on may already be gone. So the caret is cached
 * on mousedown, and `runEditorCommand` is told not to cache again -- see
 * `RunCommandOptions.selectionCached`.
 */

const def = () => ({
    /** The registered command name. An unknown name renders a disabled button. */
    command: $("", HtmlString) as ObservableMaybe<string>,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    /** Overrides the command's own `label`/`labelKey`. */
    title: $("", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as ObservableMaybe<string>,
    class: $('', HtmlClass) as ObservableMaybe<string>,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const CommandButton: Defaulted<typeof def> = defaults(def, (props) => {
    const { command, buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editorNode = useEditor()
    const focusManager = useFocusManager()
    const isActive = $(false)
    const isMixed = $(false)
    const enabled = $(true)

    /** The surface this button acts on: its own editor, else whichever the user is in. */
    const surface = (): HTMLElement | null => {
        const own = $$(editorNode)
        if (own && typeof (own as HTMLElement).contains === 'function') return own as HTMLElement
        return ($$(getCurrentEditor()) as HTMLElement | null) ?? null
    }

    /**
     * Does the surface actually hold focus?
     *
     * The pressed look must go out when the user clicks away, or a toolbar left showing
     * "bold" over a document nobody is editing is simply lying. Shadow-DOM-aware, because
     * `document.activeElement` reports the outermost *host*, not the node inside the shadow
     * tree -- the naive `document.activeElement === el` check is false for every editor
     * mounted as a custom element.
     *
     * Lives here and not in each command's `isActive`, because it is the same answer for
     * every command and a registrant should not have to know about shadow roots to write
     * one.
     */
    const editorHasFocus = (el: HTMLElement): boolean => {
        if (document.activeElement === el || el.contains(document.activeElement)) return true
        const root = el.getRootNode()
        if (!(root instanceof ShadowRoot)) return false
        return document.activeElement === root.host || root.contains(document.activeElement)
    }

    /**
     * Effect: keep the pressed/disabled look in step with the selection.
     *
     * Same shape as every other formatting button here -- a `selectionchange` listener,
     * because there is no other event that fires when the caret moves inside a
     * contenteditable. `isActive` is asked on every one of them, which is why the
     * interface documents it as having to be cheap.
     */
    useEffect(() => {
        const name = $$(command)
        if (!name) return

        const handler = () => {
            const cmd = getEditorCommand(name)
            if (!cmd) { enabled(false); isActive(false); isMixed(false); return }

            const ctx = buildCommandContext(surface() ?? undefined)
            if (!ctx) { enabled(false); isActive(false); isMixed(false); return }

            // `isEnabled` is asked even when the editor is unfocused: Undo stays available
            // after a click on the toolbar, and that is the point of caching the selection.
            enabled(cmd.isEnabled ? cmd.isEnabled(ctx) : true)

            if (!cmd.isActive || !editorHasFocus(ctx.editor)) { isActive(false); isMixed(false); return }
            const state = cmd.isActive(ctx)
            isActive(state === true)
            isMixed(state === 'mixed')
        }

        document.addEventListener('selectionchange', handler)
        handler()

        return () => document.removeEventListener('selectionchange', handler)
    })

    /**
     * Tooltip, through the two i18n channels and no third: `labelKey` is a wui message id
     * and goes through `t()`; `label` is third-party English and goes through `tx()`,
     * which falls back to the English itself when no pack has translated it. An explicit
     * `title` prop beats both.
     */
    const caption = () => {
        const given = $$(title)
        if (given) return given
        const name = $$(command)
        const cmd = name ? getEditorCommand(name) : undefined
        if (cmd?.labelKey) return t(cmd.labelKey)
        if (cmd?.label) return tx(cmd.label)
        return name
    }

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        // Cache the caret while it still exists. See the note at the top of this file.
        if (focusManager) focusManager.beginCommand()
    }

    const handleClick = () => {
        const name = $$(command)
        if (!name) return
        runEditorCommand(name, surface() ?? undefined, { selectionCached: true })
    }

    return (
        <Button
            type={btnType}
            title={caption}
            class={() => [
                () => $$(cls) ? $$(cls) : $$(cn),
                () => $$(isActive) ? '!bg-slate-200' : '',
                () => $$(isMixed) ? '!bg-slate-100 opacity-60' : ''
            ]}
            aria-pressed={() => $$(isActive) ? "true" : $$(isMixed) ? "mixed" : "false"}
            disabled={() => $$(disabled) || !$$(enabled)}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            {...otherProps}
        >
            {() => {
                const name = $$(command)
                const icon = name ? getEditorCommand(name)?.icon : undefined
                return icon ? icon() : caption()
            }}
        </Button>
    )
}) as typeof CommandButton

export { CommandButton }

customElement('wui-command-button', CommandButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-command-button': ElementAttributes<typeof CommandButton>
        }
    }
}

export default CommandButton

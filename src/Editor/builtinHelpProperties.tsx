import { registerHelpSteps } from './EditorHelpStep'
import { t } from '../i18n'

/**
 * # The property panel's own tour
 *
 * A second tour, registered under the name `'properties'` and launched from the
 * "?" in the panel header rather than the one in the toolbar.
 *
 * ## Why a second tour instead of more steps on `'default'`
 *
 * The two answer different questions. The editor tour is "how do I write"; this
 * one is "what is this dialog". Folding the panel's ten steps into the editor
 * tour would make the walk through the toolbar twice as long for a user who
 * only ever wanted the first half, and — worse — would run the panel steps
 * before the user has any reason to care about the panel. Launching from the
 * panel means the tour starts at the moment the question arises, with the panel
 * already open on the element being asked about.
 *
 * ## Why every targeted step is gated on `getClientRects()`
 *
 * The panel is always in the DOM; `hidden` (`display:none`) is what closes it.
 * Several parts are conditional on top of that: the plugin/image action strip
 * only exists for a custom element or an image, and the style section's rows
 * only exist while it is expanded. A step whose anchor has no box would
 * spotlight a zero-sized rect somewhere in the corner, so each one tests the
 * anchor the same way `help.panel` does — `getClientRects().length > 0` is zero
 * anywhere inside a `display:none` chain, which `getComputedStyle` on the
 * element itself is not.
 *
 * That gate is also the graceful degradation: close the panel mid-tour and
 * every remaining step drops out, leaving the untargeted welcome step as the
 * only thing the tour can show.
 *
 * ## Why `placement: 'left'`
 *
 * The panel is pinned to the right edge of the viewport. `'auto'` prefers
 * *below*, which for a panel step means a card drawn over the rest of the panel
 * — covering exactly the thing the step is pointing at. `'left'` puts it in the
 * empty space beside the panel instead. It stays a preference: `computeGeom`
 * falls back to the side with room, and to a centred card when no side has any.
 *
 * ## Ordering convention
 *
 * Same as `builtinHelp.tsx` — 0..900 with 100-step gaps, leaving 1000+ for a
 * host that wants to append its own panel steps.
 */

/** Every targeted step in this tour shares one visibility test. */
const visible = (ctx: { el: HTMLElement | null }): boolean =>
    !!ctx.el && ctx.el.getClientRects().length > 0

const steps = [
    {
        name: 'props.welcome',
        tour: 'properties',
        order: 0,
        // No target — a centred card with no arrow. This is also the step that
        // survives a panel closed mid-tour, so it has to stand on its own.
        title: () => t('editor.help.props.welcome.title'),
        body: () => t('editor.help.props.welcome.body'),
    },
    {
        name: 'props.header',
        tour: 'properties',
        order: 100,
        target: { at: 'panelPart' as const, part: 'header' },
        placement: 'left' as const,
        when: visible,
        title: () => t('editor.help.props.header.title'),
        body: () => t('editor.help.props.header.body'),
    },
    {
        name: 'props.identity',
        tour: 'properties',
        order: 200,
        target: { at: 'panelPart' as const, part: 'identity' },
        placement: 'left' as const,
        when: visible,
        title: () => t('editor.help.props.identity.title'),
        body: () => t('editor.help.props.identity.body'),
    },
    {
        name: 'props.parent',
        tour: 'properties',
        order: 300,
        target: { at: 'panelPart' as const, part: 'parent' },
        placement: 'left' as const,
        when: visible,
        title: () => t('editor.help.props.parent.title'),
        body: () => t('editor.help.props.parent.body'),
    },
    {
        name: 'props.form',
        tour: 'properties',
        order: 400,
        target: { at: 'panelPart' as const, part: 'form' },
        placement: 'left' as const,
        when: visible,
        title: () => t('editor.help.props.form.title'),
        body: () => t('editor.help.props.form.body'),
    },
    {
        name: 'props.actions',
        tour: 'properties',
        order: 500,
        target: { at: 'panelPart' as const, part: 'actions' },
        placement: 'left' as const,
        // The strip exists only for a custom element whose plugin declares
        // actions, or for a selected <img>. For a plain paragraph there is
        // nothing to point at and the step is skipped entirely.
        when: visible,
        title: () => t('editor.help.props.actions.title'),
        body: () => t('editor.help.props.actions.body'),
    },
    {
        name: 'props.style',
        tour: 'properties',
        order: 600,
        target: { at: 'panelPart' as const, part: 'style' },
        placement: 'left' as const,
        when: visible,
        title: () => t('editor.help.props.style.title'),
        body: () => t('editor.help.props.style.body'),
    },
    {
        name: 'props.delete',
        tour: 'properties',
        order: 700,
        target: { at: 'panelPart' as const, part: 'delete' },
        placement: 'left' as const,
        // Disabled is not hidden — the button keeps its box when deletion is
        // refused, so this step still resolves and the body explains why the
        // control might be greyed out.
        when: visible,
        title: () => t('editor.help.props.delete.title'),
        body: () => t('editor.help.props.delete.body'),
    },
    {
        name: 'props.resize',
        tour: 'properties',
        order: 800,
        target: { at: 'panelPart' as const, part: 'resize' },
        placement: 'left' as const,
        when: visible,
        title: () => t('editor.help.props.resize.title'),
        body: () => t('editor.help.props.resize.body'),
    },
    {
        name: 'props.close',
        tour: 'properties',
        order: 900,
        target: { at: 'panelPart' as const, part: 'close' },
        placement: 'left' as const,
        when: visible,
        title: () => t('editor.help.props.close.title'),
        body: () => t('editor.help.props.close.body'),
    },
]

// Side-effect import, like `builtinHelp.tsx`. `PropertyPanel.tsx` imports this
// module for its registration alone — the panel's "?" is the only thing that
// starts this tour, so the two belong to the same unit.
registerHelpSteps(steps)

export const BUILT_IN_PROPERTY_HELP_REGISTERED = true

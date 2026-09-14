import { registerHelpSteps } from './EditorHelpStep'
import { t } from '../i18n'
import { pluginGroups } from './EditorPlugin'
import './HelpButton'

/**
 * # wui's own help steps
 *
 * The editor-generic half of the tour. Everything compass-specific lives
 * downstream in `packages/compass` and reaches wui through
 * `registerHelpSteps()` — `title`/`body` thunks let it plug its own
 * catalogue in.
 *
 * ## Ordering convention
 *
 * Built-in steps sit at 0..900 with 100-step gaps. Downstream steps fill
 * 1000+ — `help.welcome` is intentionally the only step at 0 so a host's
 * "before everything" step can land at a clean number.
 *
 * ## Why `when()` for `help.groups`
 *
 * The `plugin-groups` toolbar item is the *wrapper* around one dropdown per
 * plugin family. A step that points at it would be confusing on a host with
 * no families registered — the wrapper exists, but the dropdowns inside it
 * do not. Gate it behind `pluginGroups().length > 0` so it only fires when
 * there is something to talk about.
 *
 * ## Why a centred welcome step
 *
 * `target: undefined` renders the card with no arrow, centred on the
 * surface. That is the right opening for a tour: the user does not yet
 * know where they are, and pointing at the first control presupposes the
 * answer.
 */

const hasPluginGroups = (): boolean => pluginGroups().length > 0

const steps = [
    {
        name: 'help.welcome',
        order: 0,
        title: () => t('editor.help.welcome.title'),
        body: () => t('editor.help.welcome.body'),
        // No target — centred card. Same `t()` thunk as every wui key.
    },
    {
        name: 'help.type',
        order: 100,
        target: { at: 'surface' as const },
        title: () => t('editor.help.type.title'),
        body: () => t('editor.help.type.body'),
    },
    {
        name: 'help.format',
        order: 200,
        target: { at: 'toolbar' as const, item: 'textFormat' },
        title: () => t('editor.help.format.title'),
        body: () => t('editor.help.format.body'),
    },
    {
        name: 'help.inline',
        order: 300,
        target: { at: 'toolbar' as const, item: 'bold' },
        title: () => t('editor.help.inline.title'),
        body: () => t('editor.help.inline.body'),
    },
    {
        name: 'help.insert',
        order: 400,
        target: { at: 'toolbar' as const, item: 'insert' },
        title: () => t('editor.help.insert.title'),
        body: () => t('editor.help.insert.body'),
    },
    {
        name: 'help.groups',
        order: 500,
        target: { at: 'toolbar' as const, item: 'plugin-groups' },
        when: () => hasPluginGroups(),
        title: () => t('editor.help.groups.title'),
        body: () => t('editor.help.groups.body'),
    },
    {
        name: 'help.select',
        order: 600,
        target: { at: 'element' as const, tag: '*' },
        // `tag: '*'` resolves to `[data-editor-root] *` — the first
        // descendant, which is the most generic "click something" anchor
        // we can express in the vocabulary.
        title: () => t('editor.help.select.title'),
        body: () => t('editor.help.select.body'),
    },
    {
        name: 'help.properties',
        order: 700,
        target: { at: 'toolbar' as const, item: 'info' },
        title: () => t('editor.help.properties.title'),
        body: () => t('editor.help.properties.body'),
    },
    {
        name: 'help.panel',
        order: 800,
        target: { at: 'panel' as const },
        // The panel *element* is always in the DOM — `display:none` until
        // something is selected, which is what the previous step
        // accomplishes. `ctx.el` is the panel itself; only point at it once
        // it is actually showing.
        //
        // We test `getClientRects().length` rather than the element's own
        // `getComputedStyle().display` because the panel's first child
        // overrides the display to `flex` while the panel itself is
        // `display:none`. `getComputedStyle` on the child reports 'flex'
        // and would let the step leak through; `getClientRects()` on any
        // element inside a `display:none` chain is zero, so the test holds
        // regardless of which box-bearing descendant `resolveHelpTarget`
        // landed on.
        when: (ctx: { el: HTMLElement | null }) =>
            !!ctx.el && ctx.el.getClientRects().length > 0,
        title: () => t('editor.help.panel.title'),
        body: () => t('editor.help.panel.body'),
    },
    {
        name: 'help.language',
        order: 900,
        target: { at: 'toolbar' as const, item: 'language' },
        title: () => t('editor.help.language.title'),
        body: () => t('editor.help.language.body'),
    },
]

// Side-effect import: registers wui's own steps the first time this module
// runs. Mirrors `builtinToolbar.tsx` — `Editor.tsx` imports both for their
// side effects, and the actual list never changes at runtime.
registerHelpSteps(steps)

export const BUILT_IN_HELP_REGISTERED = true

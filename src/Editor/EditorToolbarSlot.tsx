import { resolveToolbarItems, ToolbarGroup, ToolbarItem } from './EditorToolbarItem'
import { CommandButton } from './CommandButton'

/**
 * # Where registered toolbar items are drawn
 *
 * One mount point, at the end of the editor's own toolbar. Everything a third party
 * registers appears here, grouped and ordered by `resolveToolbarItems()`.
 *
 * ## Why it renders nothing by default
 *
 * With no registrations `resolveToolbarItems()` returns an empty array and this component
 * emits no nodes at all -- not an empty `<div>`, not a stray divider. That is the acceptance
 * criterion for the whole toolbar phase: the DOM of a wui editor with no plugins installed
 * must be byte-identical to what it was before any of this existed. A wrapper element that
 * is "harmless" still changes `:first-child`, still changes flex gap arithmetic, and would
 * quietly break someone's stylesheet.
 *
 * ## Why a plain function child
 *
 * `{() => ...}` and never `useMemo(() => <jsx/>)`. A memo used as a child is re-read
 * whenever anything it depends on changes, and re-reading reconstructs the whole subtree --
 * which, for a band containing an open dropdown, closes it. The same rule applies to the
 * per-group dropdowns in `Editor.tsx`'s Group 7, and for the same reason.
 */

/**
 * How many registered items before the toolbar is warned about. Not a limit -- nothing is
 * dropped -- just the point past which wrapping stops being hypothetical on a normal window.
 *
 * wui's own bar is 26 items (see `builtinToolbar.tsx`), and it has always fit on one row at
 * 1280px, so the threshold has to sit above that or every editor would warn about itself.
 * The number is a rule of thumb and nothing more: a count cannot tell a 28px icon button
 * from a font-family dropdown three times its width, so a host that registers six wide
 * dropdowns will wrap well before this fires. It is here to catch the obvious case.
 */
const TOOLBAR_ITEM_WARN_AT = 32

/** A registered item, as a node: its own widget, or the standard button for its command. */
const renderItem = (item: ToolbarItem) =>
    <span data-toolbar-item={item.name} class="contents">
        {item.render ? item.render() : <CommandButton command={item.command!} />}
    </span>

/**
 * The divider that separates toolbar bands, matching the one `EditorToolbar` uses for its
 * own seven groups -- copied rather than shared because `Editor.tsx` declares it inside the
 * toolbar component, and hoisting it out would be a bigger edit than it is worth.
 */
const Divider = () => <div class="w-[1px] h-6 bg-gray-200 mx-1" />

/** The band a group gets when it does not name its own. See {@link ToolbarGroup.cls}. */
const DEFAULT_BAND_CLASS = 'flex items-center gap-1'

/**
 * Render every visible registered toolbar item.
 *
 * Mounted once, after wui's own Group 7. Each resolved group becomes a divider plus a
 * `flex` band, so a third-party band looks like a built-in one; `group.divider === false`
 * welds a band onto the one before it for a host that wants its items to read as an
 * extension of the previous group rather than a new one.
 */
export const ToolbarSlot = () => {
    return <>
        {() => {
            const groups = resolveToolbarItems()
            if (!groups.length) return null

            // 5.6: the toolbar carries `flex-wrap`, so enough registered items will push it
            // onto a second and third row and shove the writing surface down the page.
            // There is no overflow policy yet -- a trailing "more" menu is the obvious one --
            // so for now say so, loudly enough that whoever registered the thirty-third
            // button finds out from the console rather than from a screenshot.
            const count = groups.reduce((n, g) => n + g.items.length, 0)
            if (count > TOOLBAR_ITEM_WARN_AT)
                console.warn(`[EditorToolbar] ${count} registered items. The toolbar wraps past about ${TOOLBAR_ITEM_WARN_AT} and will push the editor down the page.`)

            return groups.map((g, i) => <>
                {/* Dividers *separate* bands, so there is never one before the first: a
                    leading rule on a toolbar would be a line floating against the padding.
                    `divider: false` welds a band onto the one before it for a host whose
                    items read as an extension of the previous group rather than a new one. */}
                {i === 0 || g.group.divider === false ? null : <Divider />}
                <div class={g.group.cls ?? DEFAULT_BAND_CLASS}>
                    {g.items.map(renderItem)}
                </div>
            </>)
        }}
    </>
}

export default ToolbarSlot

import { $, $$, JSX, Observable } from 'woby'

/**
 * # The toolbar registry
 *
 * What is *shown* in the editor's toolbar, and where. Its sibling `EditorCommand.ts`
 * holds what can be *done*; the two are split because the relationship is not one to one.
 * A command with no button is reachable by keyboard alone. A button can render a whole
 * dropdown that runs six commands. And `hideToolbarItem` has to be able to take a button
 * away without taking the verb away with it -- see the three verbs in section 3.5 of
 * `EDITOR_PLUGIN_TOOLBAR_HANDOFF.md`:
 *
 * - `hideToolbarItem('bold')` -- the button goes, the command and its chord stay, and
 *   `showToolbarItem` puts it back.
 * - `replaces: 'bold'` -- a third-party widget takes the built-in's slot, keeping its
 *   position. The built-in is still registered; it is just not the one rendered.
 * - `unregisterEditorCommand('bold')` -- the verb itself is gone. A button still
 *   registered for it renders disabled rather than throwing.
 *
 * ## Scope: module-global, plus `when()`
 *
 * These registries are module-global, and the editor is **not** a singleton -- two
 * `<wui-editor>` elements on one page share this list. That is deliberate, and it is the
 * decision section 5.1 of the handoff asked to have written down here.
 *
 * A per-instance registry would need every third-party registration to name an editor,
 * and third parties register at module scope, before any editor exists. The monorepo has
 * already shipped the bug that comes from getting this wrong in the other direction --
 * two `<sy-compass>` elements rendering the same plate because a module-global held the
 * *state*. The distinction that makes global safe here is that a `ToolbarItem` is a
 * *descriptor*, not state: `render` is a thunk invoked once per editor, so two editors
 * get two independent widgets from one registration.
 *
 * An item that genuinely should appear on one editor and not another uses `when()`, which
 * is evaluated per editor inside that editor's reactive context.
 */

/** A group's rank in the toolbar. See {@link TOOLBAR_GROUPS}. */
export interface ToolbarGroup {
    /** Group id, as {@link ToolbarItem.group} names it. */
    name: string
    /** Lower sorts earlier. The built-in bands are 100 apart so there is room between them. */
    order: number
    /**
     * Caption, for hosts that label their toolbar bands. wui's own toolbar does not render
     * one -- the bands are separated by dividers, not headings -- but the field is carried
     * so a host building its own chrome off `getToolbarGroups()` has it.
     *
     * Third-party English: run it through `tx()`, not `t()`.
     */
    label?: string
    /** Draw a divider before this group. Default true; false welds it onto the previous one. */
    divider?: boolean
    /**
     * The class on the band's flex container.
     *
     * Defaults to `flex items-center gap-1`. It exists because wui's own bands are not
     * uniform -- history, inline styles and lists sit at `gap-0.5` because their buttons are
     * icon-only and read as one control at the wider gap, while the bands holding dropdowns
     * need the full `gap-1`. Without this field a registry-driven toolbar could not
     * reproduce the toolbar it replaced, which is the acceptance criterion for the whole
     * migration.
     */
    cls?: string
}

/**
 * The seven bands of wui's own toolbar, as ranks.
 *
 * Spaced 100 apart so a third party can sit *between* two built-in bands without having to
 * renumber anything: `order: 250` is after every inline style and before the colours.
 * Registering a group is only necessary to place one outside these -- an item naming a
 * group that was never registered gets `order: 1000`, i.e. the end, which is the safe
 * place for something the toolbar knows nothing about.
 */
export const TOOLBAR_GROUPS = {
    history: 0,
    structure: 100,
    inline: 200,
    color: 300,
    list: 400,
    layout: 500,
    insert: 600,
} as const

/** Where an item whose group was never registered goes: the end. */
const UNKNOWN_GROUP_ORDER = 1000

/**
 * One toolbar entry.
 *
 * Exactly one of {@link command} and {@link render} must be set. `command` is the common
 * case and gets wui's own button -- active state, mixed state, `aria-pressed`, focus
 * handling and the undo step, none of which the registrant has to know about. `render` is
 * the escape hatch for widgets that are not a single toggle: dropdowns, colour pickers,
 * anything with its own panel.
 */
export interface ToolbarItem {
    /**
     * Unique id. Duplicates warn and keep the first registration, exactly as
     * `registerEditorPlugin` does, so a module imported twice for its side effects cannot
     * take the page down.
     */
    name: string

    /** A key of {@link TOOLBAR_GROUPS}, or a third-party group id. Absent means `insert`. */
    group?: string

    /** Rank within the group. Ties keep registration order. Absent means `0`. */
    order?: number

    /** Render the standard command button for this command name. */
    command?: string

    /**
     * ...or bring your own widget.
     *
     * A thunk, invoked once per editor that renders the toolbar, so one registration can
     * serve two editors on a page without them sharing a node. A widget that opens a panel
     * must dismiss through `useDropdownDismiss`, or two open panels will fight over the
     * window listener -- `@woby/use`'s `useEventListener` dedupes globally by
     * (target, event), so only the first hand-rolled outside-click handler ever fires.
     */
    render?: () => JSX.Child

    /**
     * Reactive visibility. Absent means always shown.
     *
     * Evaluated inside the toolbar's reactive context, once per editor, so it is also the
     * supported way to scope an item to one editor of several -- see the scope note at the
     * top of this file.
     */
    when?: () => boolean

    /**
     * Take over another item's slot: this widget renders, that one does not, and the
     * position and group come from the item being replaced.
     *
     * Not unregistration. The replaced item stays in the registry, so removing the
     * replacement restores it.
     */
    replaces?: string
}

const registeredItems = $<ToolbarItem[]>([])
const registeredGroups = $<ToolbarGroup[]>([])
const hiddenItems = $<string[]>([])

/**
 * Add an item to the toolbar.
 *
 * Warns and skips on a duplicate name, or when the `command`/`render` rule is broken --
 * never throws. A toolbar that silently lacks one button is a better failure than a page
 * that does not render.
 */
export const registerToolbarItem = (item: ToolbarItem): void => {
    const current = $$(registeredItems)
    if (current.find(i => i.name === item.name)) {
        console.warn(`[EditorToolbar] Item "${item.name}" is already registered. Skipping.`)
        return
    }
    if (!item.command === !item.render) {
        console.warn(`[EditorToolbar] Item "${item.name}" must set exactly one of 'command' or 'render'. Skipping.`)
        return
    }
    registeredItems([...current, item])
}

/** Remove an item. Unknown names are a no-op. */
export const unregisterToolbarItem = (name: string): void => {
    registeredItems($$(registeredItems).filter(i => i.name !== name))
}

/** The registry observable, unsorted and unfiltered. Read it for reactivity. */
export const getToolbarItems = (): Observable<ToolbarItem[]> => registeredItems

/**
 * Declare a group, or renumber one.
 *
 * Re-registering an existing name **overwrites** it, unlike every other registry here.
 * That asymmetry is on purpose: a group is a position, not a thing, and a host that wants
 * its own band before the colours has no other way to say so -- refusing the second
 * registration would leave it stuck with whichever import happened to run first.
 */
export const registerToolbarGroup = (group: ToolbarGroup): void => {
    const current = $$(registeredGroups).filter(g => g.name !== group.name)
    registeredGroups([...current, group])
}

/** Every declared group, built-ins included, sorted by rank. */
export const getToolbarGroups = (): ToolbarGroup[] => {
    const builtIn: ToolbarGroup[] = Object.entries(TOOLBAR_GROUPS).map(([name, order]) => ({ name, order }))
    const custom = $$(registeredGroups)
    const merged = [...builtIn.filter(b => !custom.find(c => c.name === b.name)), ...custom]
    return merged.sort((a, b) => a.order - b.order)
}

/**
 * Hide a button without unregistering anything.
 *
 * Presentation only, and the distinction matters: the command still runs, its keyboard
 * chord still fires, and {@link showToolbarItem} puts the button back. Unregistering an
 * item to hide it would be the plugin-registry mistake -- there, the same list feeds both
 * the menu and per-element lookup, so removing an entry to tidy the menu silently breaks
 * the property panel.
 */
export const hideToolbarItem = (name: string): void => {
    const current = $$(hiddenItems)
    if (current.includes(name)) return
    hiddenItems([...current, name])
}

/** Undo {@link hideToolbarItem}. */
export const showToolbarItem = (name: string): void => {
    hiddenItems($$(hiddenItems).filter(n => n !== name))
}

/** Whether {@link hideToolbarItem} is currently suppressing this item. */
export const isToolbarItemHidden = (name: string): boolean => $$(hiddenItems).includes(name)

/** A group and the items that resolved into it, in render order. */
export interface ResolvedToolbarGroup {
    group: ToolbarGroup
    items: ToolbarItem[]
}

/**
 * The slot an item occupies: its own, or -- if it replaces something -- that item's.
 *
 * Followed transitively, so a plugin that replaces a plugin that replaced `bold` still
 * lands in `bold`'s place rather than in whatever group the middle one happened to declare.
 * The visited set is not paranoia: `replaces` is written by two authors who have never met,
 * and a cycle between them has to degrade to "render where you declared yourself" rather
 * than hang the toolbar.
 */
const slotOf = (item: ToolbarItem, all: ToolbarItem[]): ToolbarItem => {
    const seen = new Set<string>([item.name])
    let slot = item
    while (slot.replaces) {
        const next = all.find(x => x.name === slot.replaces)
        if (!next || seen.has(next.name)) break
        seen.add(next.name)
        slot = next
    }
    return slot
}

/**
 * The toolbar as it should be drawn: visible items, bucketed by group, groups in rank
 * order and items in `order` within them.
 *
 * The three filters interact, and the order they apply in is the whole subtlety:
 *
 * 1. {@link hideToolbarItem} and `when()` decide which items render at all. Hidden
 *    short-circuits, so a hidden item's predicate is never called and `when()` can be
 *    written assuming it is only asked about items that would otherwise be shown.
 * 2. **Only an item that renders can claim the slot it replaces.** A replacement whose
 *    `when()` is false must not take the built-in down with it -- that would leave a hole
 *    nobody asked for, and a conditionally-replacing plugin is the obvious thing to write.
 * 3. What survives is bucketed by the *slot's* group and sorted by the *slot's* order, so
 *    "take over Bold's place" means Bold's place and not the end of the bar.
 *
 * Reads three observables, so call it from inside a reactive child and the toolbar
 * re-renders when anything registers, hides or replaces.
 */
export const resolveToolbarItems = (): ResolvedToolbarGroup[] => {
    const all = $$(registeredItems)
    const hidden = $$(hiddenItems)

    // Evaluated once per item per resolve. Twice would let a predicate reading the clock or
    // a counter disagree with itself between the two passes below.
    const renders = new Map<string, boolean>()
    for (const i of all)
        renders.set(i.name, !hidden.includes(i.name) && (i.when ? i.when() : true))

    const replaced = new Set(
        all.filter(i => i.replaces && renders.get(i.name)).map(i => i.replaces!)
    )

    const visible = all.filter(i => renders.get(i.name) && !replaced.has(i.name))

    const groups = getToolbarGroups()
    const rank = (name: string) => groups.find(g => g.name === name)?.order ?? UNKNOWN_GROUP_ORDER

    const out: ResolvedToolbarGroup[] = []
    for (const item of visible) {
        const name = slotOf(item, all).group ?? 'insert'
        let bucket = out.find(b => b.group.name === name)
        if (!bucket) {
            bucket = { group: groups.find(g => g.name === name) ?? { name, order: UNKNOWN_GROUP_ORDER }, items: [] }
            out.push(bucket)
        }
        bucket.items.push(item)
    }

    for (const b of out) {
        // Stable, so items at the same `order` keep registration order. The rank comes from
        // the slot for the same reason the group did.
        b.items.sort((x, y) => (slotOf(x, all).order ?? 0) - (slotOf(y, all).order ?? 0))
    }
    return out.sort((a, b) => rank(a.group.name) - rank(b.group.name))
}

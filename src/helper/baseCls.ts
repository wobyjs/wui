/**
 * Base-class publication for wui components.
 *
 * Every wui component renders its root as `cls ? cls : <base>`: the `cls` prop
 * REPLACES one slot of the class list, not the whole of it. That slot's content
 * lives inside the component module and is invisible from the outside -- the
 * host element only ever carries the reflected `cls=""`, and the resolved
 * classes sit on a node inside the shadow root, mixed in with the variant/size
 * classes `cls` does not touch.
 *
 * Anything editing a component from the outside needs that string. The editor's
 * property panel is the case that forced this: an empty "Class Override" box
 * says nothing about what an override would replace, so there is no way to start
 * from the component's own styling and adjust it. Each component publishes its
 * base here next to its `customElement()` call, and the editor's plugin schema
 * reads it back through {@link getBaseCls} as the row's default.
 *
 * Publish the SAME value the component renders -- the constant or the helper the
 * JSX already uses, never a second copy of it. A duplicated 200-character
 * Tailwind string is a guaranteed drift.
 *
 * Every wui component the editor can select publishes a base. What a base does
 * NOT include is anything that follows a prop: a Button's disabled styling, a
 * ToggleButton's on/off colours, a Checkbox's label direction, an Avatar's
 * variant and size. Those sit outside the slot so an override cannot freeze the
 * component in one state, and the panel shows them as read-only chips.
 *
 * getBaseCls returns '' for anything unregistered, which reads the same as a
 * component that genuinely has no base.
 *
 * @module baseCls
 */

/** Resolves an element's base class; takes the element because a base may depend on its variant. */
export type BaseClsResolver = (el: Element) => string

const registry = new Map<string, BaseClsResolver>()

/**
 * Publish a component's base class slot under its custom element tag.
 *
 * @param tagName - the registered tag, e.g. 'wui-avatar' (case-insensitive)
 * @param base - the class string, or a resolver for a variant-dependent base
 *               (a Button's base IS its `type` variant, so it needs the element)
 */
export const registerBaseCls = (tagName: string, base: string | BaseClsResolver): void => {
    registry.set(tagName.toLowerCase(), typeof base === 'function' ? base : () => base)
}

/**
 * The base class an element's `cls` would replace, or '' when it publishes none.
 *
 * A resolver reads attributes off a live element, so it is given the same
 * defensive treatment as any other third-party callback: a throw degrades to ''
 * rather than taking the property panel down with it.
 */
export const getBaseCls = (el: Element): string => {
    const resolve = registry.get(el.tagName.toLowerCase())
    if (!resolve) return ''
    try {
        return resolve(el) ?? ''
    } catch (e) {
        console.warn(`[baseCls] resolver for <${el.tagName.toLowerCase()}> threw`, e)
        return ''
    }
}

/** Whether a tag published a base class at all, as opposed to publishing an empty one. */
export const hasBaseCls = (tagName: string): boolean => registry.has(tagName.toLowerCase())

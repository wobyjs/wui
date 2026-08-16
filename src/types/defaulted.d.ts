/**
 * Explicit return type for a `defaults(def, component)` call.
 *
 * Every component in this package is registered as a custom element and then declared in
 * `IntrinsicElements` as `ElementAttributes<typeof Component>`. That makes the component's own
 * inferred type circular: to check any JSX inside the component body TypeScript needs
 * `IntrinsicElements`, which needs `typeof Component`, which is what it is still inferring
 * (TS7022). Annotating the const with this type breaks the cycle.
 *
 * The shape mirrors `defaults()`'s own declared return type in `woby/methods/defaults`.
 */
declare type Defaulted<D extends () => Record<string, any>> = (
	props: Partial<ReturnType<D>>
		// Every component in this package ends its render with `{...otherProps}` spread onto a real
		// DOM element, so callers may legitimately pass any HTML attribute that `def()` does not
		// name (`onPointerDown`, `title`, `data-*`, …). This mirrors `ElementAttributes<T>`, which
		// is what the same component accepts through its custom-element tag.
		& Partial<import('woby').JSX.HTMLAttributes<HTMLElement>>
		& { children?: import('woby').CustomElementChildren }
		& import('woby').StyleEncapsulationProps,
) => import('woby').JSX.Element

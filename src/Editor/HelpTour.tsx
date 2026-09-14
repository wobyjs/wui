/** @jsxImportSource woby */

import { $, $$, JSX, useEffect } from 'woby'
import {
    HelpStep,
    HelpContext,
    helpTourActive,
    helpTourIndex,
    helpTourNext,
    helpTourBack,
    resolveHelpSteps,
    resolveHelpTarget,
    stopHelpTour,
    setHelpTourRoot,
} from './EditorHelpStep'
import { HelpBalloon } from './HelpBalloon'
import { useDropdownDismiss } from './useDropdownDismiss'

/**
 * # The tour driver
 *
 * Mounted once per editor that wants a help tour — once in `Editor.tsx`,
 * next to the toolbar, gated on `helpTourActive`. Owns:
 *
 * - The current step's resolved anchor (`resolveHelpTarget` against the
 *   editor's root).
 * - The list of steps for the running tour (`resolveHelpSteps`).
 * - The "advance on click/insert" watchers.
 * - Outside-pointerdown dismissal via the existing `useDropdownDismiss` hook
 *   (capture phase + `composedPath()`; do not hand-roll it — §1.4 of the
 *   handoff).
 * - Escape-key dismissal.
 *
 * Mounted, not registered. A tour is per-editor runtime; only the registry
 * is module-global. `helpTourActive` is a single boolean regardless of how
 * many editors exist on the page — a second `startHelpTour()` replaces the
 * first.
 */

/**
 * Find the surface — the contenteditable element stamped `data-editor-root`
 * by `Editor.tsx`.
 *
 * `querySelector` does not pierce shadow boundaries, so a custom-element
 * editor needs the explicit `.shadowRoot` hop; a plain `<Editor />` in light
 * DOM is found by the document query directly.
 *
 * Deliberately *not* called at editor-mount time: the surface element is
 * still being built then — both queries return null at that instant, and a
 * snapshot taken then would be null forever. It is called from `HelpTour`'s
 * body, which only runs once the mount-site gate opens (a tour starts), by
 * which time the whole editor is in the DOM.
 */
const findSurface = (): HTMLElement | null => {
    if (typeof document === 'undefined') return null
    return (document.querySelector('wui-editor') as HTMLElement | null)
        ?.shadowRoot?.querySelector('[data-editor-root]') as HTMLElement | null
        ?? document.querySelector('[data-editor-root]') as HTMLElement | null
}

const tourRef = $<HTMLDivElement>(null as any)

/**
 * The single mount of the help tour. Not gated in here — see the note below.
 *
 * The wrapper div is positioned absolute inside the editor's `relative`
 * container (`Editor.tsx`), so the balloon's surface-relative offsets land
 * where `computeGeom` expects them.
 *
 * Takes no props: it resolves the surface at runtime when the tour starts,
 * not when the editor mounts — see {@link findSurface}. A host embedding
 * more than one editor still gets one tour; `helpTourActive` is
 * module-global.
 *
 * The `helpTourActive` gate lives at the mount site in `Editor.tsx`, as a
 * direct child of the editor's container — the same shape as the toolbar's
 * own gate. It cannot live in here: a component's return value is resolved
 * through woby's eager component-call chain, which flattens a function
 * child to its current value once, untracked, and never re-runs it. A gate
 * that is itself a child of an element gets a render effect instead — and
 * re-runs.
 */
export const HelpTour = (): JSX.Child => {
    const surface = findSurface()
    if (!surface) return null
    return <HelpTourInner surface={surface} />
}

/**
 * The inner driver — the tour-lifetime scope. Mounted once per running tour;
 * owns the dismissal wiring and the wrapper div. The per-step scope (which
 * step, which anchor) lives in a gate *inside* the returned div: reads made
 * in a component body subscribe to nothing, because woby calls component
 * thunks untracked — a gate that is a direct child of an element gets a
 * render effect and re-runs instead.
 */
interface HelpTourInnerProps {
    surface: HTMLElement
}

const HelpTourInner = (props: HelpTourInnerProps): JSX.Child => {
    const { surface } = props
    const root = surface.getRootNode() as Document | ShadowRoot

    // Publish the root for hosts that resolve their own step targets through
    // `getHelpTourRoot()`. Cleared when the tour subtree unmounts.
    useEffect(() => {
        setHelpTourRoot(root)
        return () => { setHelpTourRoot(null) }
    })

    // Escape closes. Listener attached at the document level so the user does
    // not have to focus the balloon first — keystrokes the editor captured
    // already lost the focus, but we listen in capture to be sure.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation()
                stopHelpTour()
            }
        }
        document.addEventListener('keydown', onKey, true)
        return () => document.removeEventListener('keydown', onKey, true)
    })

    // Outside pointerdown closes — reuse the toolbar's hook. It listens in
    // capture and uses `composedPath()`, which is exactly what shadow DOM
    // needs and what a hand-rolled listener would get wrong.
    useDropdownDismiss(tourRef as any, stopHelpTour)

    return (
        <div
            ref={tourRef}
            data-help-tour
            // Full surface box; the balloon inside is absolute against this.
            // `pointer-events: none` on the wrapper so the spotlight, the
            // arrow, and any future decorations do not eat clicks; only the
            // explicit button children are interactive.
            // 1150 sits above the property panel (`z-[1100]`) and below the
            // image dialogs (`z-[1200]`). The panel is the reason for the
            // number: at 50 the tour painted *behind* it, so every step
            // pointing into the panel was covered by the thing it was
            // pointing at. It costs the toolbar steps nothing — the spotlight
            // is a box-shadow *cutout*, so drawing it above an element leaves
            // that element undimmed rather than hiding it. The dialogs stay on
            // top deliberately: they are modal, and a tour is not.
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1150,
            }}
        >
            {() => {
                // The per-step scope. Reads here — the active tour, the
                // index, the registry — sit in this gate's render effect, so
                // a Next, a registry change, even a locale swap re-runs it.
                const tour = $$(helpTourActive) ?? 'default'
                const idx = $$(helpTourIndex)

                // Each step's `when()` sees its own resolved anchor —
                // `help.panel` asks whether the panel exists *yet*, which a
                // single shared snapshot could never answer.
                const steps = resolveHelpSteps(tour).filter(s => {
                    const whenCtx: HelpContext = { root, surface, el: resolveHelpTarget(root, s.target) }
                    return s.when ? s.when(whenCtx) : true
                })
                const step = steps[idx] as HelpStep | undefined
                if (!step) {
                    // Past the last step (Done), or the registry shrank under
                    // a running tour — end it. Deferred to a microtask so no
                    // observable is written from inside this render effect.
                    queueMicrotask(stopHelpTour)
                    return null
                }

                // Anchor resolution — per step. `null` is not an error: the
                // balloon renders centred.
                const anchor = resolveHelpTarget(root, step.target)

                return (
                    <HelpStepDriver
                        surface={surface}
                        container={$$(tourRef) ?? null}
                        step={step}
                        anchor={anchor}
                        total={steps.length}
                        index={idx}
                    />
                )
            }}
        </div>
    )
}

interface HelpStepDriverProps {
    surface: HTMLElement
    /**
     * The tour wrapper the card is positioned inside. The ref starts
     * `null` (the wrapper mounts in the same gate that calls the driver)
     * and lands on the second tick; the driver re-renders when the read
     * lands. Passing the observable reference rather than `tourRef()`
     * keeps the gate reactive on the wrapper's identity.
     */
    container: HTMLDivElement | null
    step: HelpStep
    anchor: HTMLElement | null
    total: number
    index: number
}

/**
 * One step's mount: the advance watchers and the balloon. Re-created for
 * every step — the gate above rebuilds it whenever the index or the registry
 * changes — so the plain-prop effect below re-arms against the current step
 * each time.
 */
const HelpStepDriver = (props: HelpStepDriverProps): JSX.Child => {
    const { surface, container, step, anchor, total, index } = props

    // Advance listeners: 'click' on the anchor; 'insert' on a matching new
    // element inside the surface.
    useEffect(() => {
        const advance = step.advanceOn ?? 'manual'
        if (advance === 'manual') return

        if (advance === 'click') {
            const target = anchor
            if (!target) return
            const onClick = () => helpTourNext()
            target.addEventListener('click', onClick, true)
            return () => target.removeEventListener('click', onClick, true)
        }

        // 'insert' — watch the surface for a new element matching the
        // target's `tag`. MutationObserver is the only thing that fires
        // synchronously on `appendChild`.
        if (advance === 'insert') {
            if (!surface) return
            const tag = (step.target && step.target.at === 'element') ? step.target.tag : null
            if (!tag || tag === '*') return
            const obs = new MutationObserver((muts) => {
                for (const m of muts) {
                    m.addedNodes.forEach(n => {
                        if (n.nodeType === 1 && (n as Element).tagName.toLowerCase() === tag.toLowerCase()) {
                            helpTourNext()
                        }
                    })
                }
            })
            obs.observe(surface, { childList: true, subtree: true })
            return () => obs.disconnect()
        }
        return
    })

    return (
        <HelpBalloon
            resolved={{ step, anchor }}
            surface={surface}
            container={container}
            total={total}
            index={index}
            onBack={helpTourBack}
            onNext={helpTourNext}
            onSkip={stopHelpTour}
        />
    )
}

export default HelpTour

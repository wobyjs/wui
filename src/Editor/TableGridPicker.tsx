import { $, $$, useEffect } from 'woby'

/**
 * The size picker every office suite has: a grid of empty squares you sweep a pointer
 * across, where the highlighted rectangle *is* the table you are about to get.
 *
 * It replaces two stacked `prompt()` boxes. Those were wrong for more than looks — a
 * native prompt is modal to the whole page, so it tore the caret out of the editor and
 * forced the insert path to re-seat a saved range afterwards. Nothing here takes focus:
 * the menu hosting this panel already cancels the default action of its `mousedown`, so
 * the contenteditable surface keeps both focus and selection while the user picks, and
 * the insert runs against a live caret.
 *
 * ## Expanding
 *
 * The grid starts at {@link MIN_COLS}×{@link MIN_ROWS} and follows the pointer: it always
 * shows one more row and column than the furthest one touched, up to
 * {@link MAX_COLS}×{@link MAX_ROWS}, and shrinks back as the pointer comes in. That is the
 * Docs behaviour rather than Word's fixed 10×8 — a fixed grid would put "more than eight
 * rows" behind a second dialog, which is the thing being removed.
 *
 * ## Why one listener instead of 256
 *
 * Every cell is a plain `<div>` with no handler of its own. The panel listens for
 * `pointermove` once, on the container, and turns the coordinate into a row/column by
 * dividing by the cell pitch. That is cheaper than 256 listeners, it cannot miss a cell
 * during a fast sweep, and — because the cells carry no state — growing the grid does not
 * have to re-bind anything.
 *
 * Pointer events, not mouse or touch: one code path covers mouse, pen and finger, and a
 * dragged finger highlights exactly the way a dragged mouse does. Cells are shown and
 * hidden by reactive `style`, never re-created, so a sweep never rebuilds the DOM under
 * the pointer.
 *
 * Geometry is inline style, not Tailwind classes: the column count is a runtime number,
 * and a class name built at runtime is never seen by the build-time class scan.
 *
 * @example
 * ```tsx
 * <TableGridPicker onPick={(rows, cols) => insertTable(rows, cols)} onCancel={backToMenu} />
 * ```
 */

/** Smallest grid ever shown, so the panel does not jitter around at small sizes. */
const MIN_COLS = 8
const MIN_ROWS = 6
/** Largest grid offered. Past this, add rows and columns from the table's own popup menu. */
const MAX_COLS = 16
const MAX_ROWS = 16

/** Cell box and the gap between cells, in px. Their sum is the pitch the hit test divides by. */
const CELL = 16
const GAP = 3
const PITCH = CELL + GAP

const clamp = (n: number, lo: number, hi: number) => n < lo ? lo : n > hi ? hi : n

export type TableGridPickerProps = {
    /** Called with the chosen size. Rows first, matching the insert helpers. */
    onPick: (rows: number, cols: number) => void
    /** Escape, or the back button. The host decides whether that means "close" or "go back". */
    onCancel: () => void
}

export const TableGridPicker = ({ onPick, onCancel }: TableGridPickerProps) => {
    // 0 means "nothing aimed at yet", which is why the label starts blank and the first
    // arrow key lands on 1×1 rather than 1×2.
    const hoverRows = $(0)
    const hoverCols = $(0)
    // What is on screen: at least the minimum, and one past wherever the pointer is.
    const visRows = $(MIN_ROWS)
    const visCols = $(MIN_COLS)

    const aim = (r: number, c: number) => {
        hoverRows(r)
        hoverCols(c)
        visRows(clamp(Math.max(MIN_ROWS, r + 1), MIN_ROWS, MAX_ROWS))
        visCols(clamp(Math.max(MIN_COLS, c + 1), MIN_COLS, MAX_COLS))
    }

    const gridRef = $<HTMLDivElement>(null as any)

    useEffect(() => {
        const el = $$(gridRef)
        if (!el) return

        let downId: number | null = null

        /** The cell under a pointer, from geometry rather than from `e.target`. */
        const cellAt = (e: PointerEvent) => {
            const b = el.getBoundingClientRect()
            const x = e.clientX - b.left
            const y = e.clientY - b.top
            return {
                inside: x >= 0 && y >= 0 && x <= b.width && y <= b.height,
                c: clamp(Math.floor(x / PITCH) + 1, 1, MAX_COLS),
                r: clamp(Math.floor(y / PITCH) + 1, 1, MAX_ROWS),
            }
        }

        const onMove = (e: PointerEvent) => { const p = cellAt(e); aim(p.r, p.c) }

        const onDown = (e: PointerEvent) => {
            downId = e.pointerId
            const p = cellAt(e)
            aim(p.r, p.c)
            // Capture so a finger that slides off the panel keeps steering the highlight.
            // A touch fires no hover before it presses, so without the drag a touch user
            // would get whatever cell they first landed on and no chance to adjust.
            el.setPointerCapture(e.pointerId)
        }

        const onUp = (e: PointerEvent) => {
            if (downId !== e.pointerId) return
            downId = null
            const p = cellAt(e)
            // Released off the grid: the gesture was abandoned, not a choice. Leave the panel
            // up rather than inserting whatever the clamp happened to land on.
            if (p.inside) onPick(p.r, p.c)
        }

        // Only when nothing is pressed — mid-drag the pointer is captured, and leaving the
        // box is part of the gesture rather than the end of it.
        const onLeave = () => { if (downId === null) { hoverRows(0); hoverCols(0) } }

        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerdown', onDown)
        el.addEventListener('pointerup', onUp)
        el.addEventListener('pointerleave', onLeave)
        return () => {
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerdown', onDown)
            el.removeEventListener('pointerup', onUp)
            el.removeEventListener('pointerleave', onLeave)
        }
    })

    // Keyboard on `document`, capture phase, for the two reasons `useDropdownDismiss` gives:
    // the editor stops propagation on keys it handles, and this panel must never take focus
    // off the surface, so it has no element of its own to listen on.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const r = $$(hoverRows)
            const c = $$(hoverCols)
            const take = () => { e.preventDefault(); e.stopPropagation() }

            if (e.key === 'Escape') { take(); onCancel(); return }
            if (e.key === 'Enter') { if (r && c) { take(); onPick(r, c) } return }
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return

            take()
            if (!r || !c) { aim(1, 1); return }   // the first arrow key lands on the first cell
            if (e.key === 'ArrowRight') aim(r, clamp(c + 1, 1, MAX_COLS))
            else if (e.key === 'ArrowLeft') aim(r, clamp(c - 1, 1, MAX_COLS))
            else if (e.key === 'ArrowDown') aim(clamp(r + 1, 1, MAX_ROWS), c)
            else aim(clamp(r - 1, 1, MAX_ROWS), c)
        }
        document.addEventListener('keydown', onKey, true)
        return () => document.removeEventListener('keydown', onKey, true)
    })

    const backRef = $<HTMLButtonElement>(null as any)
    useEffect(() => {
        const b = $$(backRef)
        if (!b) return
        // Assigned, not bound through JSX: woby's click delegation does not reach inside a
        // shadow root, which is where the whole editor lives. `Button` does the same.
        b.onclick = e => { e.preventDefault(); e.stopPropagation(); onCancel() }
        return () => { b.onclick = null }
    })

    // Every cell exists from the start and is shown or hidden reactively. Re-creating them on
    // each growth step would pull the node out from under the pointer mid-sweep.
    const cells = Array.from({ length: MAX_ROWS * MAX_COLS }, (_, i) => {
        const r = Math.floor(i / MAX_COLS) + 1
        const c = (i % MAX_COLS) + 1
        return (
            <div
                style={() => {
                    const on = r <= $$(hoverRows) && c <= $$(hoverCols)
                    return {
                        display: r <= $$(visRows) && c <= $$(visCols) ? 'block' : 'none',
                        width: `${CELL}px`,
                        height: `${CELL}px`,
                        boxSizing: 'border-box',
                        borderRadius: '2px',
                        border: on ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        background: on ? '#bfdbfe' : '#ffffff',
                    }
                }}
            />
        )
    })

    return (
        <div class="p-3">
            <div class="flex items-center justify-between mb-2">
                <button
                    ref={backRef}
                    type="button"
                    class="text-sm text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-0 p-0"
                    title="Back to the insert menu"
                >
                    &lsaquo; Insert
                </button>
                <span class="text-xs text-gray-500">
                    {() => $$(hoverCols)
                        ? `${$$(hoverCols)} cols × ${$$(hoverRows)} rows`
                        : 'Pick a size'}
                </span>
            </div>

            <div
                ref={gridRef}
                role="grid"
                aria-label="Table size"
                style={() => ({
                    display: 'grid',
                    gridTemplateColumns: `repeat(${$$(visCols)}, ${CELL}px)`,
                    gap: `${GAP}px`,
                    // Shrink-wrap the cells. A block-level grid would stretch to the menu's
                    // width, and the hit test reads position, not the cell under the pointer:
                    // the empty strip past the last column would still count as columns and
                    // grow the grid from a gap the user never touched.
                    width: 'max-content',
                    // The hit test divides by the pitch from this box's own top-left corner, so
                    // padding here would shift every row and column reading by one.
                    padding: '0',
                    touchAction: 'none',
                    cursor: 'pointer',
                })}
            >
                {cells}
            </div>
        </div>
    )
}

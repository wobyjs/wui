import { $, $$, JSX, useEffect } from 'woby'
import { useUndoRedo } from './undoredo'
import { getCurrentEditor } from './utils'

/**
 * TablePopupMenu: Floating popup menu that appears when a table cell is focused.
 * Provides:
 * - Row operations: insert above/below, delete row
 * - Column operations: insert left/right, delete column
 * - Cell formatting: background color, border color, text color, border style
 *
 * Uses direct DOM manipulation for overlay positioning, following the same
 * pattern as ImageResizer.
 */

const btnStyle: JSX.CSSProperties = {
    width: '28px',
    height: '28px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    color: 'white',
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
}

const separatorStyle: JSX.CSSProperties = {
    width: '1px',
    background: 'rgba(255,255,255,0.3)',
    margin: '2px',
}

// SVG icons for table operations
const icons = {
    rowAbove: 'M4 15h16v2H4v-2zm0-4h16v2H4v-2zm0-4h16v2H4V7zm2-4v2h2V3H6zm4 0v2h2V3h-2zm4 0v2h2V3h-2z',
    rowBelow: 'M4 17h16v2H4v-2zm0-4h16v2H4v-2zm0-4h16v2H4V9zm2-6v2h2V3H6zm4 0v2h2V3h-2zm4 0v2h2V3h-2zm-4 18h4v2h-4z',
    deleteRow: 'M4 15h16v2H4v-2zm0-4h16v2H4v-2zm0-4h16v2H4V7zm7-4v2h2V3h-2zm2 16h2v2h-2zM7 19h2v2H7z',
    colLeft: 'M15 4h2v16h-2V4zm-4 0h2v16h-2V4zM7 4h2v16H7V4zM3 6v2h2V6H3zm0 4v2h2v-2H3zm0 4v2h2v-2H3z',
    colRight: 'M17 4h2v16h-2V4zm-4 0h2v16h-2V4zM9 4h2v16H9V4zM3 6v2h2V6H3zm0 4v2h2v-2H3zm0 4v2h2v-2H3z',
    deleteCol: 'M17 4h2v16h-2V4zm-4 0h2v16h-2V4zM9 4h2v16H9V4zm-2 2v2H3v2h4v2h2v-2h4v2h2v-2h4v-2h-4V6h-2v2H9V6H7z',
    bgColor: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
    borderColor: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
    textColor: 'M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z',
    borderAll: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
    borderInside: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 11h10v2H7v-2zm0-4h10v2H7V7zm0 8h10v2H7v-2z',
    borderNone: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
    mergeCells: 'M17 17h2v2h-2v-2zm-4 0h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2zm8-4h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2zm8-4h2v2h-2V7zm-4 0h2v2H9V7zM5 7h2v2H5V7zm12 0h2v2h-2V7z',
    splitCells: 'M17 17h2v2h-2v-2zm-4 0h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2zm8-4h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2zm4-4h2v6h-2V7zm4 0h2v2h-2V7zM5 7h2v2H5V7z',
    table: 'M4 21h16a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2zM4 5h16v4H4V5zm0 6h16v4H4v-4zm0 6h16v4H4v-4z',
}

const TablePopupMenu = () => {
    const { saveDo } = useUndoRedo()

    // Refs for direct DOM manipulation
    let popupEl: HTMLDivElement | null = null
    let mounted = false

    // Multi-cell selection state
    let anchorCell: HTMLTableCellElement | null = null
    let selectedCells: Set<HTMLTableCellElement> = new Set()
    let activeCell: HTMLTableCellElement | null = null

    const clearCellSelection = () => {
        selectedCells.forEach(c => {
            c.style.outline = ''
            c.style.outlineOffset = ''
        })
        selectedCells.clear()
        anchorCell = null
    }

    const highlightCells = (cells: HTMLTableCellElement[]) => {
        cells.forEach(c => {
            c.style.outline = '2px solid #3b82f6'
            c.style.outlineOffset = '-2px'
        })
    }

    const getCellRange = (cell1: HTMLTableCellElement, cell2: HTMLTableCellElement): HTMLTableCellElement[] => {
        const table = cell1.closest('table')
        if (!table || cell2.closest('table') !== table) return [cell1]

        const rows = Array.from(table.querySelectorAll('tr'))
        const row1 = cell1.parentElement as HTMLTableRowElement
        const row2 = cell2.parentElement as HTMLTableRowElement
        const rowIdx1 = rows.indexOf(row1)
        const rowIdx2 = rows.indexOf(row2)
        const minRow = Math.min(rowIdx1, rowIdx2)
        const maxRow = Math.max(rowIdx1, rowIdx2)

        const colIdx1 = Array.from(row1.children).indexOf(cell1)
        const colIdx2 = Array.from(row2.children).indexOf(cell2)
        const minCol = Math.min(colIdx1, colIdx2)
        const maxCol = Math.max(colIdx1, colIdx2)

        const result: HTMLTableCellElement[] = []
        for (let r = minRow; r <= maxRow; r++) {
            const row = rows[r]
            const cells = Array.from(row.querySelectorAll('td, th')) as HTMLTableCellElement[]
            for (let c = minCol; c <= maxCol && c < cells.length; c++) {
                result.push(cells[c])
            }
        }
        return result
    }

    // Table operations
    const getCurrentCell = (): HTMLTableCellElement | null => {
        const editor = document.querySelector('wui-editor')
        const shadow = editor?.shadowRoot
        // Prefer the last clicked/active cell over selection (which may be stale after programmatic caret placement)
        if (activeCell && shadow?.contains(activeCell)) return activeCell
        const sel = shadow?.getSelection()
        if (sel && sel.focusNode) {
            let node: Node | null = sel.focusNode
            while (node && node !== shadow) {
                if (node instanceof HTMLTableCellElement) return node
                node = node.parentNode
            }
        }
        return null
    }

    const getTable = (cell: HTMLTableCellElement): HTMLTableElement | null => {
        return cell.closest('table')
    }

    const insertRow = (above: boolean) => {
        const cell = getCurrentCell()
        if (!cell) return
        const row = cell.parentElement as HTMLTableRowElement
        if (!row) return
        const tbody = row.parentElement
        if (!tbody) return
        const newRow = row.cloneNode(true) as HTMLTableRowElement
        const cells = newRow.querySelectorAll('td, th')
        cells.forEach(c => { c.innerHTML = '&nbsp;'; c.removeAttribute('colspan'); c.removeAttribute('rowspan') })
        if (above) {
            tbody.insertBefore(newRow, row)
        } else {
            tbody.insertBefore(newRow, row.nextSibling)
        }
        // Focus first cell of new row
        const firstCell = newRow.querySelector('td, th')
        if (firstCell) placeCaretInCell(firstCell as HTMLTableCellElement)
        saveDo()
    }

    const deleteRow = () => {
        const cell = getCurrentCell()
        if (!cell) return
        const row = cell.parentElement as HTMLTableRowElement
        if (!row) return
        const tbody = row.parentElement
        if (!tbody) return
        const rows = tbody.querySelectorAll('tr')
        if (rows.length <= 1) return // Don't delete the last row
        row.remove()
        saveDo()
    }

    const insertColumn = (left: boolean) => {
        const cell = getCurrentCell()
        if (!cell) return
        const row = cell.parentElement as HTMLTableRowElement
        if (!row) return
        const cellIndex = Array.from(row.children).indexOf(cell)
        const table = getTable(cell)
        if (!table) return
        const rows = table.querySelectorAll('tr')
        rows.forEach(r => {
            const cells = r.querySelectorAll('td, th')
            const refCell = cells[Math.min(cellIndex, cells.length - 1)]
            const newCell = document.createElement(refCell?.tagName === 'TH' ? 'th' : 'td')
            newCell.innerHTML = '&nbsp;'
            // Copy border styles from reference cell
            if (refCell) {
                const refStyle = getComputedStyle(refCell as HTMLElement)
                newCell.style.border = `${refStyle.borderWidth} ${refStyle.borderStyle} ${refStyle.borderColor}`
                newCell.style.padding = refStyle.padding
            }
            if (left) {
                refCell?.parentElement?.insertBefore(newCell, refCell)
            } else {
                refCell?.parentElement?.insertBefore(newCell, refCell?.nextSibling || null)
            }
        })
        saveDo()
    }

    const deleteColumn = () => {
        const cell = getCurrentCell()
        if (!cell) return
        const row = cell.parentElement as HTMLTableRowElement
        if (!row) return
        const cellIndex = Array.from(row.children).indexOf(cell)
        const table = getTable(cell)
        if (!table) return
        const rows = table.querySelectorAll('tr')
        // Check if this is the only column
        if (rows[0] && rows[0].children.length <= 1) return
        rows.forEach(r => {
            const cells = r.querySelectorAll('td, th')
            if (cells[cellIndex]) cells[cellIndex].remove()
        })
        saveDo()
    }

    const placeCaretInCell = (td: HTMLTableCellElement) => {
        const editor = document.querySelector('wui-editor')
        const shadow = editor?.shadowRoot
        const sel = shadow?.getSelection()
        const range = document.createRange()
        range.selectNodeContents(td)
        range.collapse(true)
        sel?.removeAllRanges()
        sel?.addRange(range)
    }

    // Cell formatting
    const setCellBgColor = () => {
        const cell = getCurrentCell()
        if (!cell) return
        const input = document.createElement('input')
        input.type = 'color'
        input.value = cell.style.backgroundColor || '#ffffff'
        input.onchange = () => {
            cell.style.backgroundColor = input.value
            saveDo()
        }
        input.click()
    }

    const setCellBorderColor = () => {
        const cell = getCurrentCell()
        if (!cell) return
        const input = document.createElement('input')
        input.type = 'color'
        const currentBorder = cell.style.borderColor || '#cccccc'
        input.value = currentBorder
        input.onchange = () => {
            cell.style.borderColor = input.value
            // Ensure border is visible
            if (!cell.style.borderWidth) cell.style.border = `1px solid ${input.value}`
            else cell.style.borderColor = input.value
            saveDo()
        }
        input.click()
    }

    const setCellTextColor = () => {
        const cell = getCurrentCell()
        if (!cell) return
        const input = document.createElement('input')
        input.type = 'color'
        input.value = '#000000'
        input.onchange = () => {
            cell.style.color = input.value
            saveDo()
        }
        input.click()
    }

    const toggleBorder = () => {
        const cell = getCurrentCell()
        if (!cell) return
        const cs = getComputedStyle(cell)
        const hasBorder = cs.borderWidth !== '0px' && cs.borderStyle !== 'none'
        if (hasBorder) {
            cell.style.border = 'none'
        } else {
            cell.style.border = '1px solid #cccccc'
        }
        saveDo()
    }

    const toggleTableBorders = () => {
        const cell = getCurrentCell()
        if (!cell) return
        const table = getTable(cell)
        if (!table) return
        const cells = table.querySelectorAll('td, th')
        const firstCell = cells[0] as HTMLElement | undefined
        let hasBorder = false
        if (firstCell) {
            const cs = getComputedStyle(firstCell)
            hasBorder = cs.borderWidth !== '0px' && cs.borderStyle !== 'none'
        }
        cells.forEach(c => {
            const el = c as HTMLElement
            if (hasBorder) {
                el.style.border = 'none'
            } else {
                el.style.border = '1px solid #cccccc'
            }
        })
        saveDo()
    }

    const mergeCells = () => {
        const table = getCurrentCell()?.closest('table')
        if (!table) return

        // Use multi-selected cells if available, otherwise try text selection range
        let cellsToMerge: HTMLTableCellElement[] = []
        if (selectedCells.size >= 2) {
            cellsToMerge = Array.from(selectedCells)
        } else {
            const editor = document.querySelector('wui-editor')
            const shadow = editor?.shadowRoot
            const sel = shadow?.getSelection()
            if (!sel || sel.rangeCount === 0) return
            const range = sel.getRangeAt(0)
            const walker = document.createTreeWalker(table, NodeFilter.SHOW_ELEMENT, {
                acceptNode: (node) => {
                    if (!(node instanceof HTMLTableCellElement)) return NodeFilter.FILTER_SKIP
                    return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                }
            })
            let n: Node | null
            while ((n = walker.nextNode())) cellsToMerge.push(n as HTMLTableCellElement)
        }

        if (cellsToMerge.length < 2) return

        const first = cellsToMerge[0]
        const last = cellsToMerge[cellsToMerge.length - 1]
        const firstRow = first.parentElement!
        const lastRow = last.parentElement!

        // Simple case: all cells in same row
        if (firstRow === lastRow && cellsToMerge.every(c => c.parentElement === firstRow)) {
            let totalCols = 0
            const rowCells = Array.from(firstRow.children)
            const startIdx = rowCells.indexOf(first)
            const endIdx = rowCells.indexOf(last)
            for (let i = startIdx; i <= endIdx; i++) {
                const c = rowCells[i] as HTMLTableCellElement
                totalCols += parseInt(c.getAttribute('colspan') || '1')
            }
            for (let i = 1; i < cellsToMerge.length; i++) {
                while (cellsToMerge[i].firstChild) {
                    first.appendChild(cellsToMerge[i].firstChild)
                }
                first.appendChild(document.createTextNode(' '))
                cellsToMerge[i].remove()
            }
            first.setAttribute('colspan', String(totalCols))
            clearCellSelection()
            saveDo()
        }
    }

    const splitCell = () => {
        const cell = getCurrentCell()
        if (!cell) return
        const colspan = parseInt(cell.getAttribute('colspan') || '1')
        const rowspan = parseInt(cell.getAttribute('rowspan') || '1')
        if (colspan <= 1 && rowspan <= 1) return

        // Reset spans
        cell.removeAttribute('colspan')
        cell.removeAttribute('rowspan')

        // Insert empty cells to fill the space
        const row = cell.parentElement as HTMLTableRowElement
        const cellIdx = Array.from(row.children).indexOf(cell)

        // Add cells in the same row
        for (let i = 1; i < colspan; i++) {
            const newCell = document.createElement(cell.tagName === 'TH' ? 'th' : 'td')
            newCell.innerHTML = '&nbsp;'
            row.insertBefore(newCell, row.children[cellIdx + i] || null)
        }

        // Add cells in subsequent rows if rowspan > 1
        if (rowspan > 1) {
            const table = getTable(cell)
            if (table) {
                const rows = Array.from(table.querySelectorAll('tr'))
                const rowIdx = rows.indexOf(row)
                for (let r = rowIdx + 1; r < rowIdx + rowspan && r < rows.length; r++) {
                    for (let i = 0; i < colspan; i++) {
                        const newCell = document.createElement(cell.tagName === 'TH' ? 'th' : 'td')
                        newCell.innerHTML = '&nbsp;'
                        const targetRow = rows[r]
                        const refIdx = Math.min(cellIdx + i, targetRow.children.length)
                        targetRow.insertBefore(newCell, targetRow.children[refIdx] || null)
                    }
                }
            }
        }
        saveDo()
    }

    const deleteTable = () => {
        const cell = getCurrentCell()
        if (!cell) return
        const table = getTable(cell)
        if (!table) return
        table.remove()
        saveDo()
    }

    // Position popup near the current cell
    const showPopup = (cell: HTMLTableCellElement) => {
        if (!popupEl) return
        const editor = document.querySelector('wui-editor')
        const root = editor?.shadowRoot
        const surface = root?.querySelector('[data-editor-root]') as HTMLElement
        if (!surface) return

        const surfaceRect = surface.getBoundingClientRect()
        const cellRect = cell.getBoundingClientRect()

        // Show popup first so we can measure its actual height
        popupEl.style.display = ''
        popupEl.style.visibility = 'hidden'
        const popupHeight = popupEl.offsetHeight
        popupEl.style.visibility = ''

        // Position popup above the cell, accounting for actual popup height
        const left = cellRect.left - surfaceRect.left
        const top = Math.max(0, cellRect.top - surfaceRect.top - popupHeight - 4)

        popupEl.style.left = `${left}px`
        popupEl.style.top = `${top}px`
    }

    const hidePopup = () => {
        if (popupEl) popupEl.style.display = 'none'
    }

    // Set up event listeners with cleanup to prevent memory leaks
    useEffect(() => {
        if (mounted) return
        mounted = true

        const editor = document.querySelector('wui-editor') as HTMLElement | null
        const root = editor?.shadowRoot
        if (!editor || !root) return

        const editorSurface = root.querySelector('[data-editor-root]') as HTMLElement | null
        if (!editorSurface) return

        // Track clicks on table cells
        const onClickSurface = (e: MouseEvent) => {
            const target = e.composedPath()[0] as HTMLElement
            const cell = target.closest?.('td, th') as HTMLTableCellElement | null
            if (cell) {
                activeCell = cell
                if (e.shiftKey && anchorCell) {
                    // Shift+click: select range of cells
                    e.preventDefault()
                    const cells = getCellRange(anchorCell, cell)
                    clearCellSelection()
                    highlightCells(cells)
                    cells.forEach(c => selectedCells.add(c))
                } else if (!e.shiftKey) {
                    // Normal click: show popup, clear previous multi-selection
                    if (!target.closest('[data-table-popup]')) {
                        clearCellSelection()
                        anchorCell = cell
                        selectedCells.add(cell)
                        highlightCells([cell])
                    }
                }
                setTimeout(() => showPopup(cell), 50)
            } else if (!target.closest('[data-table-popup]')) {
                // Don't hide popup if clicking inside a table cell (text inside)
                if (!target.closest('td, th')) {
                    clearCellSelection()
                    hidePopup()
                    activeCell = null
                }
            }
        }

        // Track keyboard navigation into cells
        const onKeyupSurface = (e: KeyboardEvent) => {
            if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const sel = root.getSelection()
                if (!sel || !sel.focusNode) return
                let node: Node | null = sel.focusNode
                while (node && node !== root) {
                    if (node instanceof HTMLTableCellElement) {
                        setTimeout(() => showPopup(node), 50)
                        return
                    }
                    node = node.parentNode
                }
                hidePopup()
            }
        }

        // Hide when clicking outside
        const onClickDocument = (e: MouseEvent) => {
            const target = e.composedPath()[0] as HTMLElement
            if (!target.closest('[data-table-popup]') && !target.closest('td, th')) {
                clearCellSelection()
                hidePopup()
                activeCell = null
            }
        }

        editorSurface.addEventListener('click', onClickSurface, true)
        editorSurface.addEventListener('keyup', onKeyupSurface, true)
        document.addEventListener('click', onClickDocument)

        // Cleanup: remove all event listeners on unmount
        return () => {
            editorSurface.removeEventListener('click', onClickSurface, true)
            editorSurface.removeEventListener('keyup', onKeyupSurface, true)
            document.removeEventListener('click', onClickDocument)
        }
    })

    return (
        <div
            ref={(el: HTMLDivElement) => { popupEl = el }}
            data-table-popup
            style={{
                position: 'absolute',
                display: 'none',
                zIndex: '100',
                background: '#3b82f6',
                borderRadius: '6px',
                padding: '4px 6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
                {/* Row operations */}
                <button data-table-popup title="Insert row above" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); insertRow(true) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.rowAbove} /></svg>
                </button>
                <button data-table-popup title="Insert row below" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); insertRow(false) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.rowBelow} /></svg>
                </button>
                <button data-table-popup title="Delete row" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); deleteRow() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.deleteRow} /></svg>
                </button>

                <span data-table-popup style={separatorStyle} />

                {/* Column operations */}
                <button data-table-popup title="Insert column left" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); insertColumn(true) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.colLeft} /></svg>
                </button>
                <button data-table-popup title="Insert column right" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); insertColumn(false) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.colRight} /></svg>
                </button>
                <button data-table-popup title="Delete column" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); deleteColumn() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.deleteCol} /></svg>
                </button>

                <span data-table-popup style={separatorStyle} />

                {/* Cell formatting */}
                <button data-table-popup title="Cell background color" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); setCellBgColor() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                        <rect x="7" y="7" width="10" height="10" fill="currentColor" opacity="0.5" />
                    </svg>
                </button>
                <button data-table-popup title="Cell border color" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); setCellBorderColor() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
                <button data-table-popup title="Cell text color" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); setCellTextColor() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                    </svg>
                </button>

                <span data-table-popup style={separatorStyle} />

                {/* Border toggle */}
                <button data-table-popup title="Toggle cell border" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); toggleBorder() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.borderAll} /></svg>
                </button>
                <button data-table-popup title="Toggle all borders" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); toggleTableBorders() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.table} /></svg>
                </button>

                <span data-table-popup style={separatorStyle} />

                {/* Merge/Split */}
                <button data-table-popup title="Merge cells" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); mergeCells() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.mergeCells} /></svg>
                </button>
                <button data-table-popup title="Split cell" style={btnStyle}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); splitCell() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={icons.splitCells} /></svg>
                </button>

                <span data-table-popup style={separatorStyle} />

                {/* Delete table */}
                <button data-table-popup title="Delete table" style={{ ...btnStyle, color: '#ff6b6b' }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={(e) => { e.preventDefault(); deleteTable() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                </button>
            </div>
        </div>
    )
}

export { TablePopupMenu }
export default TablePopupMenu

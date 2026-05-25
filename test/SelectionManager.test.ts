import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// SelectionManager is a class
let SelectionManager: any

describe('SelectionManager', () => {
  let container: HTMLDivElement

  beforeEach(async () => {
    // Setup DOM environment
    const mod = await import('../src/Editor/SelectionManager')
    SelectionManager = mod.SelectionManager

    container = document.createElement('div')
    container.id = 'editor-root'
    container.contentEditable = 'true'
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  // Scenario 1: Collapsed cursor (no selection)
  it('handles collapsed cursor (cursor only)', () => {
    container.innerHTML = '<p>Hello World</p>'
    const p = container.querySelector('p')!
    const textNode = p.firstChild!
    const range = document.createRange()
    range.setStart(textNode, 3)
    range.collapse(true)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const manager = new SelectionManager(container)
    const state = manager.save()
    expect(state).not.toBeNull()
    expect(state!.startContainerPath.length).toBeGreaterThan(0)
    expect(state!.startOffset).toBe(3)
  })

  // Scenario 2: Partial word selection
  it('handles partial word selection', () => {
    container.innerHTML = '<p>Hello World</p>'
    const p = container.querySelector('p')!
    const textNode = p.firstChild!
    const range = document.createRange()
    range.setStart(textNode, 1)
    range.setEnd(textNode, 4)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const manager = new SelectionManager(container)
    const state = manager.save()
    expect(state).not.toBeNull()
    expect(state!.startOffset).toBe(1)
    expect(state!.endOffset).toBe(4)
  })

  // Scenario 3: Whole paragraph selection
  it('handles whole paragraph selection', () => {
    container.innerHTML = '<p>Hello World</p>'
    const p = container.querySelector('p')!
    const textNode = p.firstChild!
    const range = document.createRange()
    range.selectNodeContents(textNode)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const manager = new SelectionManager(container)
    const state = manager.save()
    expect(state).not.toBeNull()
  })

  // Scenario 4: Partial paragraph selection
  it('handles partial paragraph selection', () => {
    container.innerHTML = '<p>Hello World Test</p>'
    const p = container.querySelector('p')!
    const textNode = p.firstChild!
    const range = document.createRange()
    range.setStart(textNode, 6)
    range.setEnd(textNode, 11)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const manager = new SelectionManager(container)
    const state = manager.save()
    expect(state).not.toBeNull()
  })

  // Scenario 5: Cross-paragraph partial selection
  it('handles cross-paragraph partial selection', () => {
    container.innerHTML = '<p>Hello</p><p>World</p>'
    const p1 = container.querySelectorAll('p')[0]!
    const p2 = container.querySelectorAll('p')[1]!
    const text1 = p1.firstChild!
    const text2 = p2.firstChild!
    const range = document.createRange()
    range.setStart(text1, 2)
    range.setEnd(text2, 3)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const manager = new SelectionManager(container)
    const state = manager.save()
    expect(state).not.toBeNull()
    expect(state!.startContainerPath.length).toBeGreaterThanOrEqual(2)
    expect(state!.endContainerPath.length).toBeGreaterThanOrEqual(2)
  })

  // Scenario 6: Full multi-paragraph selection
  it('handles full multi-paragraph selection', () => {
    container.innerHTML = '<p>Para 1</p><p>Para 2</p><p>Para 3</p>'
    const p1 = container.querySelectorAll('p')[0]
    const p3 = container.querySelectorAll('p')[2]
    const range = document.createRange()
    range.setStartBefore(p1)
    range.setEndAfter(p3)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const manager = new SelectionManager(container)
    const state = manager.save()
    expect(state).not.toBeNull()
  })

  it('restores collapsed cursor after DOM change', () => {
    container.innerHTML = '<p>Hello World</p>'
    const p = container.querySelector('p')!
    const textNode = p.firstChild!
    const range = document.createRange()
    range.setStart(textNode, 5)
    range.collapse(true)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const manager = new SelectionManager(container)
    const state = manager.save()
    container.innerHTML = '<p>Hello New World</p>'

    const restored = manager.restore(state!)
    expect(restored).toBe(true)
  })

  it('restores expanded selection after DOM change', () => {
    container.innerHTML = '<p>Hello World</p>'
    const p = container.querySelector('p')!
    const textNode = p.firstChild!
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 5)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const manager = new SelectionManager(container)
    const state = manager.save()
    container.innerHTML = '<p>Hello New World Here</p>'

    const restored = manager.restore(state!)
    expect(restored).toBe(true)
  })

  it('validates selection within editor', () => {
    container.innerHTML = '<p>Hello World</p>'
    const p = container.querySelector('p')!
    const textNode = p.firstChild!
    const range = document.createRange()
    range.selectNodeContents(textNode)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const manager = new SelectionManager(container)
    expect(manager.isValidSelection()).toBe(true)
  })
})

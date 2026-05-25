import { describe, it, expect, beforeEach, afterEach } from 'vitest'

let normalizeDOM: (root: HTMLElement) => void
let mergeTextNodes: (root: HTMLElement) => void
let removeEmptySpans: (root: HTMLElement) => void
let unwrapRedundantSpans: (root: HTMLElement) => void
let mergeAdjacentSpans: (root: HTMLElement) => void

describe('DOMNormalizer', () => {
  let container: HTMLDivElement

  beforeEach(async () => {
    const mod = await import('../src/Editor/DOMNormalizer')
    normalizeDOM = mod.normalizeDOM
    mergeTextNodes = mod.mergeTextNodes
    removeEmptySpans = mod.removeEmptySpans
    unwrapRedundantSpans = mod.unwrapRedundantSpans
    mergeAdjacentSpans = mod.mergeAdjacentSpans

    container = document.createElement('div')
    container.contentEditable = 'true'
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('mergeTextNodes', () => {
    it('merges adjacent text nodes in single paragraph', () => {
      container.innerHTML = '<p>ABC</p>'
      const p = container.querySelector('p')!
      // Simulate adjacent text nodes by creating them
      while (p.firstChild) p.removeChild(p.firstChild)
      p.appendChild(document.createTextNode('AB'))
      p.appendChild(document.createTextNode('C'))

      mergeTextNodes(container)

      expect(p.childNodes.length).toBe(1)
      expect(p.textContent).toBe('ABC')
    })

    it('does not merge text across different block elements', () => {
      container.innerHTML = '<p>AB</p><p>CD</p>'
      mergeTextNodes(container)
      const ps = container.querySelectorAll('p')
      expect(ps[0].childNodes.length).toBe(1)
      expect(ps[1].childNodes.length).toBe(1)
    })
  })

  describe('removeEmptySpans', () => {
    it('removes empty spans with no attributes', () => {
      container.innerHTML = '<p>AB<span></span>CD</p>'
      removeEmptySpans(container)
      expect(container.querySelector('span')).toBeNull()
      expect(container.textContent).toBe('ABCD')
    })

    it('preserves spans with style attributes', () => {
      container.innerHTML = '<p>AB<span style="color:red">CD</span>EF</p>'
      removeEmptySpans(container)
      expect(container.querySelector('span')).not.toBeNull()
    })

    it('removes spans with empty style attribute', () => {
      container.innerHTML = '<p>AB<span style="">CD</span>EF</p>'
      removeEmptySpans(container)
      const span = container.querySelector('span')
      expect(span).toBeNull()
    })
  })

  describe('normalizeDOM', () => {
    it('handles deeply nested spans', () => {
      container.innerHTML = '<p><span><span><span>Text</span></span></span></p>'
      normalizeDOM(container)
      // Deep nesting should be reduced
      const spans = container.querySelectorAll('span')
      expect(spans.length).toBeLessThan(3)
    })

    it('handles mixed content with text and elements', () => {
      container.innerHTML = '<p>AB<span style="color:blue">CD</span>EF<span>GHI</span>JK</p>'
      normalizeDOM(container)
      expect(container.querySelector('p')).not.toBeNull()
      expect(container.textContent).toBe('ABCDEFGHIJK')
    })

    it('does not affect valid semantic HTML', () => {
      container.innerHTML = '<p>Hello <strong>World</strong></p>'
      normalizeDOM(container)
      // Semantic elements should be preserved
      expect(container.querySelector('strong')).not.toBeNull()
    })

    it('cleans up zero-width spaces', () => {
      container.innerHTML = '<p>AB​CD</p>'
      normalizeDOM(container)
      // Zero-width spaces should be removed
      expect(container.textContent).toBe('ABCD')
    })
  })

  describe('unwrapRedundantSpans', () => {
    it('unwraps nested spans with identical styles', () => {
      container.innerHTML = '<p><span style="font-weight:bold"><span style="font-weight:bold">text</span></span></p>'
      unwrapRedundantSpans(container)
      const spans = container.querySelectorAll('span[style]')
      expect(spans.length).toBeLessThanOrEqual(1)
    })
  })

  describe('mergeAdjacentSpans', () => {
    it('merges adjacent spans with identical styles', () => {
      container.innerHTML = '<p><span style="font-weight:bold">hel</span><span style="font-weight:bold">lo</span></p>'
      mergeAdjacentSpans(container)
      const spans = container.querySelectorAll('span[style]')
      expect(spans.length).toBe(1)
    })
  })
})

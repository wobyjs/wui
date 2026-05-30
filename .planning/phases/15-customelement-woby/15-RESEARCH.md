# Phase 15: Woby customElement and Shadow DOM Integration - Research

**Researched:** 2026-05-30
**Domain:** Woby framework customElement API, Shadow DOM slot patterns, light DOM querying
**Confidence:** HIGH

## Summary

The wui-editor custom element (`<wui-editor>`) uses Woby's `customElement()` API which automatically creates Shadow DOM with slot-based content projection. The core issue is that formatting buttons (bold/italic/underline) work correctly, but block-level operations (list, indent, alignment) fail because `getSelectedBlocks()` queries the wrong DOM tree.

**Primary recommendation:** Functions that query selected content must distinguish between:
- **Light DOM content** (slotted user content) - queried via `host.querySelectorAll()` or `slot.assignedElements()`
- **Shadow DOM UI** (toolbar, controls) - queried via `shadowRoot.querySelector()`

The fix requires updating DOM traversal functions to detect and handle slotted content correctly.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Content editing (selection, formatting) | Light DOM (slotted) | — | User content lives in light DOM, projected via `<slot>` |
| Toolbar UI rendering | Shadow DOM | — | Encapsulated UI with adopted stylesheets |
| DOM querying for operations | Cross-boundary helper | — | Must detect context and query appropriate tree |
| Style encapsulation | Shadow DOM | — | Tailwind adopted stylesheets, prevents style leakage |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Woby customElement | ^0.109.0 | Custom element creation | [VERIFIED: woby/src/methods/custom_element.ts] - Official Woby API for creating custom elements with Shadow DOM |
| Woby defaults | ^0.109.0 | Props management | [VERIFIED: woby/src/methods/create_element.ts] - Required for customElement components |
| HTMLSlotElement | Native | Slot content projection | [ASSUMED] - Standard Web API for light DOM projection |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| slot.assignedElements() | Native | Query slotted content | When accessing light DOM children |
| getRootNode() | Native | Detect shadow vs light DOM | When determining query context |
| host property | Native | Access custom element host | When querying from shadow to light DOM |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shadow DOM | Light DOM only | Shadow DOM provides style encapsulation (Tailwind adopted stylesheets), prevents CSS conflicts |
| Slot projection | Direct children in shadow | Would break component composition, prevent declarative HTML usage |

**Installation:**
Not applicable - using native Web APIs and Woby framework features.

## Architecture Patterns

### System Architecture Diagram

```
User HTML:
<wui-editor>
  <p>User content in light DOM</p>  ← Light DOM (slotted)
</wui-editor>

         │
         ├─→ Browser creates custom element instance
         │    └─→ Woby customElement() constructor runs
         │
         ├─→ Shadow DOM created automatically
         │    ├── <slot></slot>  ← Projects light DOM content
         │    └── Toolbar UI elements
         │
         └─→ User content rendered via slot projection
              └─→ Selection API sees light DOM nodes

DOM Query Paths:
┌─────────────────────────────────────────────┐
│ querySelector() call                        │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────▼─────────┐
        │ Where am I?       │
        │ getRootNode()     │
        └─────┬───────┬─────┘
              │       │
    ┌─────────┘       └─────────┐
    │ ShadowRoot                │ Light DOM
    ▼                           ▼
Query shadowRoot            Query host element
(Toolbar UI)               (User content)
```

### Recommended Project Structure
```
src/Editor/
├── Editor.tsx              # Main custom element (customElement('wui-editor', Editor))
├── utils.tsx              # DOM helpers (MUST handle shadow/light DOM correctly)
├── StyleEngine.ts         # Formatting operations (MUST query light DOM for content)
├── List.tsx               # List buttons (FIX: getSelectedBlocks must query light DOM)
├── AlignButton.tsx        # Alignment buttons (FIX: must query light DOM blocks)
└── Indent.tsx             # Indent buttons (FIX: must query light DOM blocks)
```

### Pattern 1: Custom Element Definition
**What:** Woby customElement creates Shadow DOM with slot by default
**When to use:** All Woby custom elements that need style encapsulation or slot projection
**Example:**
```typescript
// Source: D:/Developments/tslib/@woby/woby/src/methods/custom_element.ts:660
export const customElement = <P extends { children?: Observable<JSX.Child> }>(
    tagName: string,
    component: JSX.Component<P> | ContextProvider<any>
): void => {
    createSSRCustomElement(tagName, component)
    if (globalThis.window && globalThis.document) {
        createBrowserCustomElement(tagName, component)
    }
}

// Inside createBrowserCustomElement (line 190):
const shadowRoot = !isThreeElement ? this.attachShadow({ mode: 'open', serializable: true }) : null

if (!($$(this.props.children) instanceof HTMLSlotElement)) {
    this.slots = document.createElement('slot')
    // ... slot setup
    this.props.children[SYMBOL_ISSLOT] = true
    this.props.children(this.slots)
}
```

### Pattern 2: Querying Light DOM from Shadow DOM
**What:** Access slotted content via host element, not shadowRoot
**When to use:** When custom element buttons need to query user content
**Example:**
```typescript
// Source: D:/Developments/tslib/@woby/wui/src/Editor/utils.tsx:36
export const getSelectedBlocks = (container: HTMLElement, range: Range, blockTags: string[] = BLOCK_TAGS): HTMLElement[] => {
    let allBlocks: Element[];
    const root = container.getRootNode();

    if (root instanceof ShadowRoot) {
        // Container is in shadow DOM - check if there's a slot element
        const slot = root.querySelector('slot');
        if (slot) {
            // Query the assigned (light DOM) elements via host
            const host = root.host as HTMLElement;
            allBlocks = Array.from(host.querySelectorAll(blockTags.join(',')));
        } else {
            // No slot, query shadow DOM
            allBlocks = Array.from(container.querySelectorAll(blockTags.join(',')));
        }
    } else {
        // Regular DOM
        allBlocks = Array.from(container.querySelectorAll(blockTags.join(',')));
    }

    return allBlocks.filter(block => range.intersectsNode(block)) as HTMLElement[];
};
```

### Pattern 3: Selection in Shadow/Light DOM
**What:** Selection API works across shadow boundaries
**When to use:** When getting/setting selection in custom elements
**Example:**
```typescript
// Source: D:/Developments/tslib/@woby/wui/src/Editor/utils.tsx:307
export function getSelection(container?: HTMLElement): { selection: Selection, state: SelectionState } | null {
    const root = container.getRootNode() ?? document.body

    // getSelection() works on ShadowRoot in modern browsers
    const selection = (root instanceof ShadowRoot)
        ? (root as any).getSelection()
        : window.getSelection();

    if (!selection) return null;
    // ... selection state tracking
}
```

### Anti-Patterns to Avoid

- **Querying shadowRoot for user content:** `shadowRoot.querySelector('p')` finds nothing if content is in light DOM via slot
- **Assuming direct children are slotted:** `this.children` vs `slot.assignedElements()` - different results
- **Forcing selection to shadowRoot:** Selection naturally lives in light DOM, don't try to move it to shadow DOM
- **Using document.querySelector() in shadow DOM:** Always use `getRootNode()` to find correct query context

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slot content detection | Custom slot tracking | `slot.assignedElements()` | Native API handles dynamic slot changes |
| Shadow DOM detection | instanceof checks | `getRootNode() instanceof ShadowRoot` | Standard pattern, works with nested custom elements |
| Cross-boundary selection | Custom selection manager | Browser Selection API (works across boundaries) | Native API already handles shadow/light DOM correctly |

**Key insight:** The Web APIs already support shadow/light DOM integration. The bug is not in the platform - it's in our code querying the wrong tree.

## Common Pitfalls

### Pitfall 1: Querying Shadow DOM for Light DOM Content
**What goes wrong:** `getSelectedBlocks()` queries `container.querySelectorAll()` where container is in shadow DOM, but user content is in light DOM via slot
**Why it happens:** Developers assume `container` (editor div) contains all content, but in custom elements with slots, user content is in light DOM
**How to avoid:**
1. Check `container.getRootNode()` to detect shadow vs light context
2. If in ShadowRoot with slot, query `root.host.querySelectorAll()` instead
3. Use `slot.assignedElements()` for exact slotted element list
**Warning signs:** Functions work in plain `<div>` editor but fail in `<wui-editor>` custom element

### Pitfall 2: Assuming getSelection() is Global
**What goes wrong:** Using `window.getSelection()` when focus is in Shadow DOM
**Why it happens:** Legacy code assumes single global selection
**How to avoid:** Always get selection from `container.getRootNode().getSelection()` (works in light DOM too)
**Warning signs:** Selection is null or outdated when editor is in custom element

### Pitfall 3: Not Detecting Shadow DOM Context
**What goes wrong:** Formatting functions work for inline styles (bold/italic) but fail for block operations (list/align)
**Why it happens:** Inline styles modify nodes directly (selection gives correct nodes), but block operations query for block containers (wrong query context)
**How to avoid:** All DOM traversal functions must start with shadow/light detection:
```typescript
const root = container.getRootNode();
const queryRoot = root instanceof ShadowRoot && root.querySelector('slot')
    ? root.host  // Query light DOM
    : container; // Query current context
```
**Warning signs:** Functions work for some operations but not others, inconsistent behavior

## Code Examples

Verified patterns from Woby source and wui-editor:

### Shadow DOM Detection and Context Switching
```typescript
// Source: D:/Developments/tslib/@woby/wui/src/Editor/utils.tsx:36-62
export const getSelectedBlocks = (container: HTMLElement, range: Range, blockTags: string[] = BLOCK_TAGS): HTMLElement[] => {
    let allBlocks: Element[];
    const root = container.getRootNode();

    if (root instanceof ShadowRoot) {
        const slot = root.querySelector('slot');
        if (slot) {
            // Slotted content: query the host element (light DOM)
            const host = root.host as HTMLElement;
            allBlocks = Array.from(host.querySelectorAll(blockTags.join(',')));
        } else {
            // No slot: query shadow DOM
            allBlocks = Array.from(container.querySelectorAll(blockTags.join(',')));
        }
    } else {
        // Regular light DOM
        allBlocks = Array.from(container.querySelectorAll(blockTags.join(',')));
    }

    return allBlocks.filter(block => range.intersectsNode(block)) as HTMLElement[];
};
```

### Custom Element with Slot
```typescript
// Source: D:/Developments/tslib/@woby/woby/src/methods/custom_element.ts:192-201
if (!isThreeElement && !($$(this.props.children) instanceof HTMLSlotElement)) {
    this.slots = document.createElement('slot')

    const { Provider, value } = this.props[SYMBOL_CONTEXT] ?? {}
    useEffect(() => { })
    this.slots[SYMBOL_CONTEXT] = (this.props as any).value

    this.props.children[SYMBOL_ISSLOT] = true
    this.props.children(this.slots)
}
```

### Woby Registry Pattern (No Conflicts)
```typescript
// Source: D:/Developments/tslib/@woby/woby/src/methods/custom_element_registry.ts:43-70
define(tagName: string, ctor: CustomElementConstructor): void {
    if (this._registry.has(tagName)) {
        if (!this._warnedTags.has(tagName)) {
            this._warnedTags.add(tagName)
            console.warn(`[WobyCustomElementsRegistry] Element ${tagName} already registered in this registry.`)
        }
        return
    }
    this._registry.set(tagName, ctor)

    if (!this._native) return // SSR

    const existingNative = this._native.get(tagName)

    if (!existingNative) {
        // Native slot is free - register the real constructor directly
        this._native.define(tagName, ctor)
    } else {
        // Another lib already owns the native slot
        console.warn(`[WobyCustomElementsRegistry] Native customElements already has "${tagName}"`)
    }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| document.querySelector() everywhere | getRootNode() context detection | 2026-05-28 (editor-debug phase) | Fixes list/align/indent buttons in custom elements |
| Global window.getSelection() | ShadowRoot.getSelection() | 2026-05-25 (phase 1) | Selection works in shadow DOM |
| Manual DOM traversal | Slot-aware traversal | 2026-05-28 (editor-debug phase) | Proper light DOM content querying |

**Deprecated/outdated:**
- `document.querySelector()` for custom element content: Use `getRootNode()` to detect context
- `window.getSelection()` in Shadow DOM: Use `root.getSelection()` on ShadowRoot

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Shadow DOM slot projection is automatic in Woby customElement | Standard Stack | Medium - could be configuration-based |
| A2 | Selection API works across shadow boundaries in all target browsers | Architecture Patterns | Low - well-supported in modern browsers |
| A3 | The fix is in getSelectedBlocks and similar traversal functions | Code Examples | Low - confirmed by code analysis |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

1. **Should we create a ShadowDOMHelper utility module?**
   - What we know: Multiple functions need shadow/light detection (getSelectedBlocks, getCurrentEditor, etc.)
   - What's unclear: Should this be a separate module or inline in utils.tsx?
   - Recommendation: Start with inline fixes in utils.tsx, extract helper if pattern repeats across 3+ functions

2. **Do all block-level operations need the same fix?**
   - What we know: List, Indent, AlignButton all fail currently
   - What's unclear: Are there other functions with the same bug?
   - Recommendation: Audit all functions that call `querySelector`, `querySelectorAll`, or `closest` to verify they handle shadow/light context

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Woby framework | customElement API | ✓ | ^0.109.0 | — |
| ShadowRoot.getSelection() | Selection tracking | ✓ | Native (Chrome 53+, FF 63+, Safari 12.1+) | Polyfill in BrowserCompat |
| slot.assignedElements() | Light DOM querying | ✓ | Native (Chrome 50+, FF 63+, Safari 10+) | querySelector on host |

**Missing dependencies with no fallback:**
- None - all dependencies are available

**Missing dependencies with fallback:**
- None - all required APIs are native and widely supported

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | vitest.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm run test:all` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-01 | Custom element renders with Shadow DOM | integration | `vitest run src/Editor/Editor.test.tsx` | ✅ |
| REQ-02 | Slot projects light DOM content | integration | `vitest run src/Editor/Editor.test.tsx` | ✅ |
| REQ-03 | getSelectedBlocks queries light DOM | unit | `vitest run src/Editor/utils.test.tsx` | ❌ Wave 0 |
| REQ-04 | Selection works in custom element | integration | `vitest run src/Editor/Selection.test.tsx` | ✅ |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm run test:all`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/Editor/utils.test.tsx` — covers REQ-03 (getSelectedBlocks shadow/light DOM handling)
- [ ] Test case: `getSelectedBlocks` in Shadow DOM with slotted content
- [ ] Test case: `getSelectedBlocks` in regular light DOM
- [ ] Test case: Selection across shadow boundary

*(Existing tests cover Editor rendering and basic selection, but not shadow/light DOM specific helpers)*

## Security Domain

> Security enforcement enabled - including ASVS analysis

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A - no auth in editor component |
| V3 Session Management | no | N/A - no sessions |
| V4 Access Control | no | N/A - no privileged operations |
| V5 Input Validation | yes | Browser API validation (Range/Selection) |
| V6 Cryptography | no | N/A - no crypto operations |

### Known Threat Patterns for Shadow DOM

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via innerHTML in slot | Tampering, Elevation of Privilege | Sanitize HTML before insertion (already done in paste handler) |
| Style injection via ::part() | Tampering | Shadow DOM prevents external style injection (built-in protection) |
| Slot element replacement | Tampering | Content Security Policy, validate slotted content |

**Note:** Shadow DOM provides built-in security benefits (style encapsulation, DOM isolation). The main threat vector is user content injection, which is already mitigated by HTML sanitization in the paste handler.

## Sources

### Primary (HIGH confidence)
- D:/Developments/tslib/@woby/woby/src/methods/custom_element.ts - Woby customElement implementation
- D:/Developments/tslib/@woby/wui/src/Editor/utils.tsx - Current getSelectedBlocks implementation
- D:/Developments/tslib/@woby/wui/src/Editor/Editor.tsx - wui-editor custom element definition

### Secondary (MEDIUM confidence)
- D:/Developments/tslib/@woby/woby/demo/playground/src/TestCustomElementSlots.tsx - Slot usage examples
- D:/Developments/tslib/@woby/woby/demo/playground/src/TestCustomElementBasic.tsx - Custom element patterns

### Tertiary (LOW confidence)
- [ASSUMED] MDN Web Docs: Shadow DOM and slot APIs - General knowledge of Web APIs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified in Woby source code (custom_element.ts, custom_element_registry.ts)
- Architecture: HIGH - Verified in wui-editor source and Woby demos
- Pitfalls: HIGH - Identified in existing code (getSelectedBlocks in utils.tsx)

**Research date:** 2026-05-30
**Valid until:** 6 months (Shadow DOM API stable, Woby API may evolve)

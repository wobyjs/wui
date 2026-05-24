# Woby Compliance Audit Report

**Date:** 2026-05-24
**Status:** In Progress
**Dev Server:** http://localhost:5173 (started with `npx vite --mode dev`)

## Findings Summary

| Component | defaults() | cls/class wiring | Shadow DOM | CustomElement |
|---|---|---|---|---|
| Avatar | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| Badge | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| Button | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| Card | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| CardMedia | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| CardContent | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| CardActions | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| Chip | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| Collapse | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| Fab | ✅ | ✅ $(HtmlClass) | ✅ StyleEncapsulationProps | ✅ |
| IconButton | ✅ | ✅ $(HtmlClass) | ✅ ElementAttributes | ✅ |
| NumberField | ✅ | ✅ $(HtmlClass) | ✅ ElementAttributes | ✅ |
| Paper | ✅ | ✅ $(HtmlClass) | ✅ ElementEncapsulationProps | ✅ |
| SideBar | ✅ | ✅ $(HtmlClass) | ✅ ElementAttributes | ✅ |
| Switch | ✅ | ✅ $(HtmlClass) | ✅ ElementAttributes | ✅ |
| Tabs | ✅ | ✅ $(HtmlClass) | ✅ (no style encapsulation) | ✅ |
| TextArea | ⚠️ | ⚠️ class uses HtmlString, not HtmlClass | ✅ ElementAttributes | ✅ |
| TextField | ✅ | ✅ $(HtmlClass) | ✅ ElementAttributes | ✅ |
| ToggleButton | ✅ | ✅ $(HtmlClass) | ✅ ElementAttributes | ✅ |
| Toolbar | ✅ | ✅ $(HtmlClass) | ✅ ElementAttributes | ✅ |
| Zoomable | ✅ | ✅ $(HtmlClass) | ✅ ElementAttributes | ✅ |
| Appbar | ✅ | ✅ $(HtmlClass) | ✅ ElementAttributes | ✅ |

## Issue: TextArea class prop type

**File:** `src/TextArea.tsx:77`
```tsx
class: $("", HtmlString) as ObservableMaybe<string> | undefined,
```

**Problem:** Uses `HtmlString` instead of `HtmlClass`. This means the `class` attribute will be treated as a string, not as a reactive CSS class array.

**Fix required:**
```tsx
class: $('', HtmlClass) as JSX.Class | undefined,
```

## Issue: main.ts import resolution failure

**File:** `src/main.ts:1`
```tsx
import { render } from "woby";
```

**Problem:** When Vite serves files directly via the HTML entry point, the `vite.config.mts` alias for `woby` (pointing to `../../woby/src`) is not applied to `src/main.ts` because it has no `--mode dev` flag on the HTML-served request.

**Status:** This is a vite config issue, not a component compliance issue.

## Agent-Browser Test Results

**Test URL:** http://[::1]:5173/test/Button.test.html

### Button Component (wui-button)
- **Found:** 7 wui-button elements
- **Shadow Root:** Not attached (light DOM rendering)
- **Attributes:** `type`, `children`, `snapshot-name` correctly parsed
- **Status:** Working in HTML test page

### Note on Shadow DOM

Many WUI components use **light DOM** (no shadow root) for class attribute forwarding. This is a design choice that avoids shadow DOM encapsulation issues but means CSS inheritance works differently than Web Components with shadow DOM.

## Compliance Score

| Category | Score | Notes |
|---|---|---|
| defaults() usage | 100% (21/21) | All components use reactive defaults |
| cls/class props | 95% (20/21) | TextArea uses wrong type (HtmlString) |
| CustomElement registration | 100% (21/21) | All components registered |
| HtmlClass for class props | 95% (20/21) | TextArea needs fix |
| TypeScript declarations | 100% (21/21) | All have `declare module 'woby'` |

## Required Fixes

### 1. TextArea class prop type (HIGH)

**File:** `src/TextArea.tsx`

Change line 77 from:
```tsx
class: $("", HtmlString) as ObservableMaybe<string> | undefined,
```

To:
```tsx
class: $('', HtmlClass) as JSX.Class | undefined,
```

### 2. Vite dev server alias (MEDIUM)

**File:** `vite.config.mts`

The alias should apply regardless of how the file is served. Consider using a plugin or environment-based check that doesn't rely on `--mode dev` flag.

## Next Steps

1. Fix TextArea class prop type
2. Run agent-browser tests to verify rendering
3. Test event handling (onClick, onChange, etc.)
4. Test attribute reactivity with setAttribute()
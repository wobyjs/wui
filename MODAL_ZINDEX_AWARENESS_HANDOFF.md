# Handoff — make wui's dialogs self-aware of their own stacking context

Audience: whoever picks up wui next. Status: **not started** — design only, no
code written. Verified against the working tree on 2026-09-28, branch `main`,
tip `44f4326159c87ee571c79a404dc6df2fe3118a23`, plus uncommitted changes across
several `Editor/*` files that a diff confirmed are doc-comment rewording only,
not functional.

This is the deferred half of a fix that shipped upstream in su-yen/compass as
commit `0aebfe6a` (`fix(compass): raise image editor z-index above report
editor shell`). That commit is a one-off, per-consumer CSS workaround. This
doc proposes the general, wui-level replacement.

## The ask, in one paragraph

`ImageEditor` and `ImageDialog` both render a `fixed inset-0 z-[1200]` overlay
that assumes it is competing for stacking order against *nothing above it*.
That assumption breaks the instant a host page puts the triggering button (or
the editor's own custom-element host) inside another stacking context that a
page author later stacks something else on top of — e.g. compass's own
report-editor shell. Right now every consumer has to notice this and hand-roll
a fix, as compass just did. wui should instead give each dialog a small,
shared mechanism that checks — at open time — whether it is actually covered,
and if so, escalates its own ancestry's stacking contexts above whatever is
covering it, with no consumer-side CSS required.

## What exists today — verified

| What | Where |
|---|---|
| `ImageEditor` dialog root, `role="dialog"` | `src/Editor/ImageEditor.tsx:562` |
| `ImageEditor` dialog root, `aria-modal="true"` | `src/Editor/ImageEditor.tsx:563` |
| `ImageEditor` dialog root, `data-image-editor` | `src/Editor/ImageEditor.tsx:578` |
| `ImageEditor` dialog root, `class="fixed inset-0 z-[1200] items-center justify-center bg-black/30"` | `src/Editor/ImageEditor.tsx:579` |
| `ImageEditor` dialog root, `style={{ display: 'none' }}` (shown by flipping to `flex`) | `src/Editor/ImageEditor.tsx:580` |
| `hostFor(image)` — decides where the `<wui-image-editor>` custom element mounts | `src/Editor/ImageEditor.tsx:688` |
| `openImageEditor` export | `src/Editor/ImageEditor.tsx:707` |
| `const host = hostFor(image)` call site | `src/Editor/ImageEditor.tsx:711` |
| `customElement('wui-image-editor', ImageEditor)` registration | `src/Editor/ImageEditor.tsx:719` |
| `ImageDialog` dialog root, `role="dialog"` | `src/Editor/ImageDialog.tsx:450` |
| `ImageDialog` dialog root, `aria-modal="true"` | `src/Editor/ImageDialog.tsx:451` |
| `ImageDialog` dialog root, `data-image-dialog` | `src/Editor/ImageDialog.tsx:467` |
| `ImageDialog` dialog root, `class="fixed inset-0 z-[1200] items-center justify-center bg-black/30"` | `src/Editor/ImageDialog.tsx:468` |
| `ImageDialog` dialog root, `style={{ display: 'none' }}` | `src/Editor/ImageDialog.tsx:469` |
| `host()` helper — mounts `<wui-editor>` relative to the trigger | `src/Editor/ImageDialog.tsx:254` |
| Every custom element gets an open shadow root, unconditionally except `three-*` tags | `@woby/woby/src/methods/custom_element.ts:327` (`this.attachShadow({ mode: 'open', serializable: true })`) |
| `useOcclusionAvoidance` — the FAB-side precedent for "am I covered" detection | `src/useOcclusionAvoidance.ts`, exported from `src/index.tsx` |
| `composedParent` / `composedClosest` — shadow-piercing ancestor walk, **module-private** | `src/useOcclusionAvoidance.ts:74`, `:81` |
| `paints()` | `src/useOcclusionAvoidance.ts:225-230` |
| `isMask()` — recognizes wui's own dialogs (`role="dialog"` + `aria-modal="true"`, or geometric fallback) as masks the FAB must not dodge | `src/useOcclusionAvoidance.ts:232-249` |
| `paddingBox()` | `src/useOcclusionAvoidance.ts:251-260` |
| `boundary()` | `src/useOcclusionAvoidance.ts:262-270` |
| `apply()` — save/restore pattern for a temporary style patch | `src/useOcclusionAvoidance.ts:278-307` |
| `deepElementFromPoint(x, y)` — shadow-piercing hit test, stops at closed roots | `src/helper/deepElementFromPoint.ts`, exported from `src/index.tsx` |
| The already-shipped, single-level workaround this doc generalizes | `su-yen/packages/compass/src/compass.tsx:1345-1413` (`提升编辑器()` / `编辑底图()`) |

`提升编辑器()` in full, for reference (it is the direct ancestor of the design
below — read it before changing anything):

```ts
const 编辑器层类 = 'sy-compass-image-editor-top'
const 提升编辑器 = () => {
    if (!document.getElementById(编辑器层类)) {
        const st = document.createElement('style')
        st.id = 编辑器层类
        st.textContent = `.${编辑器层类}{position:relative;z-index:2147483647}`
        document.head.appendChild(st)
    }
    document.querySelectorAll('wui-image-editor').forEach(e => e.classList.add(编辑器层类))
}
```

Called unconditionally at the end of `编辑底图()`, after every
`openImageEditor(img, {...})`.

## What is missing, and why each gap matters

1. **No self-check.** `提升编辑器()` runs every time, whether or not the
   editor is actually covered. It works only because compass also knows the
   one other place (`罗盘报告.tsx`'s 整页/弹窗 shell) that uses the exact same
   `2147483647` constant, and relies on DOM append order to break the tie
   when both sides are equal. That is a coincidence two files agree on, not
   something wui guarantees. A third, unrelated host page stacking something
   else at `2147483647` would silently win again.
2. **No shadow-boundary walk.** `提升编辑器()` escalates exactly one element:
   the `<wui-image-editor>` custom element itself. That is correct only
   because in compass's case that element sits directly in `document.body`.
   But `hostFor()` (`ImageEditor.tsx:688`) explicitly handles the case where
   the image being edited lives inside a shadow root — it appends the new
   `<wui-image-editor>` host into `image.getRootNode()` when that root is a
   `ShadowRoot`, rather than defaulting to `document.body`:
   ```ts
   if (root instanceof ShadowRoot) root.appendChild(el)
   ```
   When that branch fires, escalating `<wui-image-editor>`'s own z-index does
   nothing for how *that shadow root's host* competes with siblings one level
   further out. Each shadow boundary between the dialog and
   `document.documentElement` needs its own escalation, not just the first.
3. **No shared primitive.** The fix lives in a downstream consumer
   (`compass.tsx`), duplicated by hand, instead of in wui where both
   `ImageEditor` and `ImageDialog` (and any future modal) could reuse it.

## The design

A new helper, `escalateAboveOcclusion`, called from each dialog's own
open/close path (not by consumers):

1. **Probe.** After the dialog root is shown (`display: flex` applied, so its
   `getBoundingClientRect()` is real), take the center point of that rect and
   run `deepElementFromPoint(x, y)` — the same shadow-piercing primitive
   `useOcclusionAvoidance` already uses. If the hit element is the dialog root
   itself (or composed-contained within it — see Traps below), it is not
   covered; do nothing and return a no-op restore function. This mirrors
   `useOcclusionAvoidance`'s own conservative "only intervene when actually
   covered" philosophy instead of `提升编辑器()`'s unconditional approach.
2. **Walk.** If covered, climb the dialog root's composed ancestry using
   `composedParent` (see "extract composedParent" below). Every time the walk
   crosses a shadow boundary — i.e. `composedParent` steps from a node whose
   `parentNode` is a `ShadowRoot` out to that root's `.host` — record that host
   element as an escalation target. Continue climbing from the host's own
   parent. Stop at `document.documentElement`. In the common case (dialog
   mounted straight into `document.body`), this produces exactly one target:
   the `<wui-image-editor>`/`<wui-editor>` custom element itself — the same
   element `提升编辑器()` escalates today. In the nested-shadow-root case
   (`hostFor()`'s `ShadowRoot` branch), it produces one target per boundary
   crossed.
3. **Escalate.** For each target, save `position` and `zIndex` inline styles,
   then set `position: relative` (only if computed position is `static`) and
   `zIndex: '2147483647'` — the same Int32-max constant `提升编辑器()` already
   uses, so the convention stays consistent across the codebase.
4. **Return a restore closure** that puts every target's saved `position`/
   `zIndex` back, modeled directly on `useOcclusionAvoidance.ts`'s `apply()`
   save/restore pattern (`src/useOcclusionAvoidance.ts:278-307`). Each dialog's
   `close()` calls this closure.

### Why the ImageDialog/ImageEditor "asymmetry" turned out not to matter

An earlier pass through this problem worried that `ImageDialog` and
`ImageEditor` would need different treatment, since `ImageDialog.host()`
(`src/Editor/ImageDialog.tsx:254`) and `ImageEditor.hostFor()`
(`src/Editor/ImageEditor.tsx:688`) use different logic to decide where their
custom element mounts. That turned out to be a non-issue: `customElement()`
(`@woby/woby/src/methods/custom_element.ts:327`) unconditionally attaches an
open shadow root to every registered element except `three-*` tags, so
`rootEl.getRootNode()` inside *either* dialog is always that dialog's own
`ShadowRoot`, and `.host` on it is always the custom element sitting in the
outer DOM. `escalateAboveOcclusion` never needs to call `host()` or
`hostFor()` — it walks purely from the dialog's own `rootEl`, which is
uniform across both components. Neither `host()` nor `hostFor()` needs to
change.

## Implementation plan

1. **Extract `composedParent`/`composedClosest`** out of
   `useOcclusionAvoidance.ts:74-90` into a new `src/helper/composedParent.ts`,
   matching the placement pattern of the existing
   `src/helper/deepElementFromPoint.ts`. Export both. Update
   `useOcclusionAvoidance.ts` to import from there instead of defining its own
   copy.
2. **Add `src/helper/escalateAboveOcclusion.ts`** implementing the probe →
   walk → escalate → restore-closure design above. Export it from
   `src/index.tsx`.
3. **Wire it into `ImageEditor.tsx`**: call it right after the dialog's
   `display: flex` is set (wherever `openImageEditor` currently shows the
   dialog), store the returned restore closure, and call it wherever the
   dialog's own close path already runs (mirror whatever cleanup `role="dialog"`
   teardown already does near line 562-580).
4. **Wire it into `ImageDialog.tsx`** the same way, near lines 450-469.
5. **Rebuild `dist`** — this codebase's downstream consumers (su-yen) resolve
   `@woby/wui` through `package.json`'s `exports["."].import` →
   `./dist/index.es.js`, not `src/`. A `src`-only change is invisible
   downstream (see `HELP_WIZARD_CHANGE_REQUEST.md` CR-1 for a worked example of
   exactly this failure mode in this same package).
6. **Delete `提升编辑器()` and its call site in `compass.tsx:1345-1413`** once
   the above is verified working from compass — the whole point of the shared
   primitive is that this per-consumer workaround stops being necessary.

## Invariants you must not break

- Never escalate anything when the probe says the dialog is not covered. An
  always-on escalation (what `提升编辑器()` does today) is exactly the
  behavior this design is replacing.
- Always restore every escalated target's original inline `position`/`zIndex`
  on close, even if the dialog was opened and closed multiple times in a row
  (no leaked styles, no stacking of saved states — same discipline as
  `apply()`'s `patched` guard).
- Only escalate elements found by walking the dialog's own composed ancestry.
  Never touch unrelated elements, and never assume `document.body` is where
  the dialog lives (`hostFor()`'s `ShadowRoot` branch is a real, reachable
  path, not hypothetical).
- Keep the `2147483647` constant consistent with `提升编辑器()`'s existing
  convention — don't invent a different "max" value that could itself lose to
  something already using Int32 max elsewhere.

## Traps found while reading

- **Composed-contains, not plain `.contains()`.** The probe's "is the hit
  element actually the dialog (or inside it)" check cannot use
  `Element.prototype.contains()`, because `deepElementFromPoint`'s result can
  be inside a nested shadow root that plain `.contains()` does not traverse
  into. Write (or extract, if `useOcclusionAvoidance.ts` already has an
  equivalent) a composed-tree contains check that walks `composedParent` from
  the hit element up to see if it reaches the dialog root.
- **Probe timing.** The center-point hit test must run only after the style
  change that shows the dialog (`display: flex`) has actually been applied to
  layout — not synchronously before paint. `useOcclusionAvoidance.ts`'s own
  module doc-comment describes the same constraint for its dodge probing
  ("parking the element there for a synchronous moment").
- **Single-point vs. multi-point probing.** A single center-point probe is
  simpler and matches this doc's design, but `useOcclusionAvoidance` itself
  probes multiple points (corners + center) for robustness against partial
  occlusion. If a single center point proves too fragile in practice (e.g. a
  cover with a hole in the middle), consider matching that pattern here too —
  not designed in detail here, flagged as an open refinement.
- **Don't reuse `host()`/`hostfor()` for the walk.** They solve "where does
  the singleton dialog mount," a different problem from "what stacking
  contexts sit between the dialog and the document root." Reusing them would
  silently reintroduce the asymmetry this doc just resolved.

## Why not the cheaper alternatives

- **Just always escalate, unconditionally (i.e. ship `提升编辑器()` as-is,
  moved into wui).** Rejected: it works by coincidence today (both call sites
  in su-yen happen to use the same constant), and it does nothing for the
  shadow-root-nesting case `hostFor()` explicitly supports.
- **Raise `z-[1200]` to some higher fixed Tailwind class.** Rejected: any
  fixed value can still lose to a host page's own use of a similarly "safe"
  high value — the actual bug is cross-stacking-context comparison being
  undecidable from styles alone (see `useOcclusionAvoidance.ts`'s own module
  doc-comment), which only a runtime probe can resolve, not a bigger constant.
- **Push the fix onto consumers via documentation.** Rejected: this is
  exactly what already happened (compass's `提升编辑器()`), and it does not
  scale — every new consumer has to rediscover and re-solve the same problem.

## The downstream consumer, and what it needs on day one

su-yen/compass is the first (and so far only known) consumer that hit this.
Once `escalateAboveOcclusion` ships and is wired into both dialogs, compass's
`编辑底图()` (`compass.tsx:1345-1413`) should have its call to `提升编辑器()`
removed, and the `<style id="sy-compass-image-editor-top">` injection deleted
along with it — the dialog now handles its own escalation.

## Acceptance criteria

1. Opening `ImageEditor`/`ImageDialog` when nothing covers them produces zero
   inline style changes on any ancestor (probe correctly detects "not
   covered").
2. Opening either dialog underneath a same-`document.body` sibling with a
   higher z-index results in the dialog's custom-element host being escalated
   above it, verified by paint order (not just style values).
3. Opening either dialog when the triggering image/button lives inside a
   nested shadow root (reproduce via `hostFor()`'s `ShadowRoot` branch)
   results in **every** shadow-host boundary between the dialog and the
   document root being escalated, not just the innermost one.
4. Closing the dialog restores every escalated ancestor's original
   `position`/`zIndex` inline styles exactly, with no leaked state after
   repeated open/close cycles.
5. `composedParent`/`composedClosest` are defined once, in
   `src/helper/composedParent.ts`, and both `useOcclusionAvoidance.ts` and
   `escalateAboveOcclusion.ts` import from there — `grep -c "const composedParent"`
   across `src/` returns exactly 1.
6. `dist/index.es.js` contains the new export (`grep -c escalateAboveOcclusion
   dist/index.es.js` > 0) after rebuild — a stale `dist` is not evidence this
   landed, per the `HELP_WIZARD_CHANGE_REQUEST.md` CR-1 precedent in this same
   package.
7. `su-yen/packages/compass/src/compass.tsx` no longer defines `提升编辑器()`
   or `编辑器层类`, and `编辑底图()` still clears the FAB/report-editor shell
   correctly with the wui-level fix alone.

## Fast-follow: `@woby/modal`'s `Wodal`

`Wodal` (`@woby/modal/src/index.tsx:120,169,181`) hardcodes `z-[100]`/
`z-[101]` and has exactly the same class of bug: no self-awareness of what it
might be stacked under. `@woby/modal` is a separate, independent package with
no dependency relationship to `@woby/wui` — `ImageEditor`/`ImageDialog` do not
use `Wodal`, and there is currently no other in-repo consumer that needs it
fixed. Once `escalateAboveOcclusion` (and `composedParent`) prove out here,
copy the primitive into `@woby/modal` as a follow-up; it is not part of this
handoff's scope.

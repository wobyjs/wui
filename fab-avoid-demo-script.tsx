/* CR-8 demo entry — occlusion-aware Fab. TSX (not .js) because onAvoid is a
   function prop, and function props are TSX-only on woby custom elements. */
import { render } from 'woby'
import './src/input.css'
import './src/Fab'
import { startRuntimeTailwind } from './src/RuntimeTailwind.ts'
import type { OcclusionState } from './src/useOcclusionAvoidance'

await startRuntimeTailwind()

/* dv4 reads these without hoping a promise resolved in the last eval. */
const states: Record<string, OcclusionState> = {}
;(window as any).__avoid = states

const log = document.getElementById('log')!
const describe = (s: OcclusionState) => {
    const by = s.by ? s.by.tagName.toLowerCase() + (s.by.id ? '#' + s.by.id : '') : 'null'
    return `covered=${s.covered} dx=${s.dx} dy=${s.dy} blocked=${s.blocked} maskUp=${s.maskUp} by=${by}`
}
const draw = () => {
    log.textContent = Object.entries(states).map(([n, s]) => `${n}: ${describe(s)}`).join('\n')
}

/* "?" — the default budget (96px) is enough for the 37px the back link demands.
   "✕" — the same cover with a 16px budget: nothing in budget is clear, so it
   stays home and reports blocked. Two FABs, one cover, both acceptance cases. */
render(<>
    <wui-fab avoid type="circular" style={{ position: 'absolute', top: '12px', right: '12px' } as any} onAvoid={report('?')}>?</wui-fab>
    <wui-fab avoid avoidMax={16} type="circular" style={{ position: 'absolute', top: '12px', right: '72px' } as any} onAvoid={report('✕')}>✕</wui-fab>
</>, document.getElementById('stage')!)

function report(name: string) {
    return (s: OcclusionState) => { states[name] = s; draw() }
}

/* Hiding the back link is the restore case; opening the mask is the freeze case.
   Both are body-level style/class mutations, which the hook's MutationObserver
   re-probes on. */
document.getElementById('backBtn')!.addEventListener('click', () => {
    const b = document.getElementById('back')!
    b.style.display = b.style.display === 'none' ? '' : 'none'
})
document.getElementById('maskBtn')!.addEventListener('click', () =>
    document.getElementById('mask')!.classList.toggle('on'))

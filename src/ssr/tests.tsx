/**
 * Browser-side snapshot suite index.
 *
 * One flat array of test modules, mirroring `@woby/woby/demo/playground/index.tsx`:
 * every `src/ssr/TestXxx.tsx` default-exports `() => <TestSnapshots Component={TestXxx} />`,
 * and the page renders them all in order. Adding a module means adding one import and
 * one array entry here — nothing in `app.tsx` changes.
 *
 * The same modules are driven by `src/ssr/ssr-test-runner.tsx` under Node, so the browser
 * and SSR suites always cover the identical set.
 */

import type { JSX } from 'woby'
import { TestSummary } from '../test-util'

import TestAppbar from './TestAppbar'
import TestAvatar from './TestAvatar'
import TestBadge from './TestBadge'
import TestButton from './TestButton'
import TestCard from './TestCard'
import TestCheckbox from './TestCheckbox'
import TestChip from './TestChip'
import TestCollapse from './TestCollapse'
import TestFab from './TestFab'
import TestIconButton from './TestIconButton'
import TestNumberField from './TestNumberField'
import TestPaper from './TestPaper'
import TestSideBar from './TestSideBar'
import TestSwitch from './TestSwitch'
import TestTabs from './TestTabs'
import TestTextArea from './TestTextArea'
import TestTextField from './TestTextField'
import TestToggleButton from './TestToggleButton'
import TestToolbar from './TestToolbar'
import TestZoomable from './TestZoomable'

export const tests: (() => JSX.Element)[] = [
    // Surfaces
    TestAppbar, TestPaper, TestCard, TestToolbar, TestSideBar,
    // Actions
    TestButton, TestIconButton, TestFab, TestToggleButton, TestChip,
    // Inputs
    TestCheckbox, TestSwitch, TestTextField, TestTextArea, TestNumberField,
    // Display & layout
    TestAvatar, TestBadge, TestCollapse, TestTabs, TestZoomable,
]

/**
 * The full browser suite: a summary banner plus every module's live render with its
 * actual/expected markup printed underneath (the same strings the console logs).
 */
export const SsrSnapshotTests = (): JSX.Element => (
    <div class="space-y-4">
        <div>
            <h2 class="text-2xl font-bold mb-2">SSR Snapshot Tests</h2>
            <p class="text-sm opacity-70 mb-2">
                Each module runs a 3-way check: browser DOM snapshot, browser woby <code>renderToString</code>,
                and — via <code>pnpm test</code> — Node.js SSR. Every card below shows its actual and expected
                markup; the console carries the same lines.
            </p>
        </div>
        <TestSummary />
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((TestComponent, index) => (
                <div key={`${index}`} class="border border-gray-300 dark:border-gray-700 rounded p-3">
                    <TestComponent />
                </div>
            ))}
        </div>
    </div>
)

export default SsrSnapshotTests

/* SSR Test Runner — imports all TestXxx modules, triggering their SSR assertion blocks,
   then also runs Component.test.expect() for each state to match browser test behavior. */

import { testObservables } from '../test-util'
import { TestAppbar } from './TestAppbar'
import { TestAvatar } from './TestAvatar'
import { TestBadge } from './TestBadge'
import { TestButton } from './TestButton'
import { TestCard } from './TestCard'
import { TestCheckbox } from './TestCheckbox'
import { TestChip } from './TestChip'
import { TestCollapse } from './TestCollapse'
import { TestFab } from './TestFab'
import { TestIconButton } from './TestIconButton'
import { TestNumberField } from './TestNumberField'
import { TestPaper } from './TestPaper'
import { TestSideBar } from './TestSideBar'
import { TestSwitch } from './TestSwitch'
import { TestTabs } from './TestTabs'
import { TestTextArea } from './TestTextArea'
import { TestTextField } from './TestTextField'
import { TestToggleButton } from './TestToggleButton'
import { TestToolbar } from './TestToolbar'
import { TestZoomable } from './TestZoomable'

// Accumulated summary report
const g = globalThis as any

// Run expect() for each component state (matching browser TestSnapshots behavior)
const components = [
    TestAppbar, TestAvatar, TestBadge, TestButton, TestCard, TestCheckbox,
    TestChip, TestCollapse, TestFab, TestIconButton, TestNumberField, TestPaper,
    TestSideBar, TestSwitch, TestTabs, TestTextArea, TestTextField, TestToggleButton,
    TestToolbar, TestZoomable,
]

for (const comp of components) {
    if (comp.test?.expect) {
        const stateCount = comp.test.stateCount ?? 1
        for (let i = 0; i < stateCount; i++) {
            if (testObservables[comp.name]) {
                ; (testObservables[comp.name] as any)(i)
            }
            comp.test.expect()
        }
    }
}

const totalLogs = g.__consoleLogCount ?? 0
const passLogs = g.__passLogCount ?? 0
const failCount = g.__testFailures?.length ?? 0
const passCount = g.__testPassCount ?? 0
console.log(`\n═══════════════════════════════════════`)
console.log(`   📊 SSR Test Summary`)
console.log(`   Total console.log calls: ${totalLogs}`)
console.log(`   ✅ Pass log lines:       ${passLogs}`)
console.log(`   Assertion passes:        ${passCount}`)
console.log(`   Assertion failures:      ${failCount}`)
console.log(`   Result: ${failCount > 0 ? '❌ SOME FAILED' : '✅ ALL PASSED'}`)
console.log(`═══════════════════════════════════════\n`)
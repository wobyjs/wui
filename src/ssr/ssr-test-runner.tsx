/* SSR Test Runner — imports all TestXxx modules, triggering their SSR assertion blocks.
   Each TestXxx.tsx has an `if (typeof globalThis.__isSSRTest__ !== 'undefined')` block that:
   1. Calls the component function to register observables
   2. Iterates through all states
   3. Compares renderToString output against expected strings
   4. console.logs ✅/❌ per state
   5. process.exit(1) on any failure

   Run: pnpm ssr-test
   (Bundles this file with esbuild + ssr-shim.js, executes in Node.js) */

import './TestAppbar'
import './TestAvatar'
import './TestBadge'
import './TestButton'
import './TestCard'
import './TestCheckbox'
import './TestChip'
import './TestCollapse'
import './TestFab'
import './TestIconButton'
import './TestNumberField'
import './TestPaper'
import './TestSideBar'
import './TestSwitch'
import './TestTabs'
import './TestTextArea'
import './TestTextField'
import './TestToggleButton'
import './TestToolbar'
import './TestZoomable'
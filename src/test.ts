/// <reference types="vite/client" />

import { Checks } from '@woby/chk'
import { renderTestComponents } from '@woby/chk'
import * as tests from '../index.test'

// Initialize the global checks instance
if (!window.checks) {
    window.checks = new Checks()
}

// Render all test components from index.test.ts
await renderTestComponents(tests)

// Auto-run tests after components are rendered and registered
// Wait for all snapshots to be registered
let previousModuleCount = 0
const checkInterval = setInterval(async () => {
    const currentCount = window.checks.modules.length
    
    // If module count stabilized (no new modules registered in the last check)
    if (currentCount > 0 && currentCount === previousModuleCount) {
        clearInterval(checkInterval)
        console.log(`All ${currentCount} snapshot tests registered. Running tests...`)
        await window.checks.run({ head: false, noLocation: false, interactive: true })
    }
    
    previousModuleCount = currentCount
}, 500) // Check every 500ms

// Fallback timeout to run tests anyway after 5 seconds
setTimeout(async () => {
    clearInterval(checkInterval)
    if (window.checks.modules.length > 0) {
        console.log('Running tests after timeout...')
        await window.checks.run({ head: false, noLocation: false, interactive: true })
    }
}, 5000)

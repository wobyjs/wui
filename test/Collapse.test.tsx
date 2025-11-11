// export * from '../src/custom-elements'
// export * from '../src/Chip'

import { Collapse } from '../src/Collapse'
import { Button } from '../src/Button'
import { $, $$, type JSX } from 'woby'

// ============================================
// BASIC TESTS
// ============================================

const DefaultCollapse = () => {
    return (
        <Collapse>
            <div class="p-4 bg-gray-100">
                <p>This is the content inside the collapse component.</p>
                <p>It should be visible by default.</p>
            </div>
        </Collapse>
    )
}

// ============================================
// OPEN STATE TESTS
// ============================================

const OpenCollapse = () => {
    return (
        <Collapse open>
            <div class="p-4 bg-blue-100">
                <p>This collapse is explicitly set to open.</p>
                <p>The content should be visible.</p>
            </div>
        </Collapse>
    )
}

const ClosedCollapse = () => {
    return (
        <Collapse open={false}>
            <div class="p-4 bg-red-100">
                <p>This collapse is explicitly set to closed.</p>
                <p>The content should be hidden.</p>
            </div>
        </Collapse>
    )
}

// ============================================
// BACKGROUND TESTS
// ============================================

const CollapseWithBackground = () => {
    return (
        <Collapse background={true}>
            <div class="p-4">
                <p>This collapse has a background (default behavior).</p>
                <p>You should see a gray background.</p>
            </div>
        </Collapse>
    )
}

const CollapseWithoutBackground = () => {
    return (
        <Collapse background={false}>
            <div class="p-4">
                <p>This collapse has no background.</p>
                <p>There should be no gray background.</p>
            </div>
        </Collapse>
    )
}

// ============================================
// INTERACTIVE TESTS
// ============================================

const ToggleableCollapse = () => {
    const isOpen = $(true)

    return (
        <div class="space-y-4">
            <Button onClick={() => isOpen(!$$(isOpen))} cls="px-4 py-2 bg-blue-500 text-white rounded">
                Toggle Collapse (Currently: {() => $$(isOpen) ? 'Open' : 'Closed'})
            </Button>
            <Collapse open={isOpen}>
                <div class="p-4 bg-green-100">
                    <p>This collapse can be toggled open/closed.</p>
                    <p>Click the button above to toggle visibility.</p>
                </div>
            </Collapse>
        </div>
    )
}

const ToggleableCollapseWithoutBackground = () => {
    const isOpen = $(false)

    return (
        <div class="space-y-4">
            <Button onClick={() => isOpen(!$$(isOpen))} cls="px-4 py-2 bg-purple-500 text-white rounded">
                Toggle Collapse (Currently: {() => $$(isOpen) ? 'Open' : 'Closed'})
            </Button>
            <Collapse open={isOpen} background={false}>
                <div class="p-4 border border-gray-300">
                    <p>This collapse can be toggled open/closed and has no background.</p>
                    <p>Click the button above to toggle visibility.</p>
                </div>
            </Collapse>
        </div>
    )
}

// ============================================
// COMBINED TESTS
// ============================================

const OpenCollapseWithoutBackground = () => {
    return (
        <Collapse open={true} background={false}>
            <div class="p-4 border border-gray-300">
                <p>This collapse is open and has no background.</p>
                <p>Content should be visible with just a border.</p>
            </div>
        </Collapse>
    )
}

const ClosedCollapseWithBackground = () => {
    return (
        <Collapse open={false} background={true}>
            <div class="p-4">
                <p>This collapse is closed but has a background.</p>
                <p>Content should be hidden but container may still exist.</p>
            </div>
        </Collapse>
    )
}

// ============================================
// STYLING TESTS
// ============================================

const CustomStyledCollapse = () => {
    return (
        <Collapse cls="!bg-yellow-100 !border-2 !border-purple-500" open={true}>
            <div class="p-4">
                <p>This collapse has custom styling.</p>
                <p>It should have a yellow background and purple border.</p>
            </div>
        </Collapse>
    )
}

// ============================================
// CONTENT TESTS
// ============================================

const CollapseWithComplexContent = () => {
    return (
        <Collapse open={true}>
            <div class="p-4 bg-green-100">
                <h4 class="font-bold">Complex Content Header</h4>
                <p>This collapse contains more complex content:</p>
                <ul class="list-disc pl-5">
                    <li>Unordered list item 1</li>
                    <li>Unordered list item 2</li>
                </ul>
                <p class="mt-2">And some more text content to test height calculations.</p>
            </div>
        </Collapse>
    )
}

// ============================================
// MULTIPLE COLLAPSES
// ============================================

const MultipleCollapses = () => {
    const isOpen1 = $(true)
    const isOpen2 = $(false)
    const isOpen3 = $(true)

    return (
        <div class="space-y-4">
            <div class="space-y-2">
                <Button onClick={() => isOpen1(!$$(isOpen1))} cls="px-3 py-1 bg-blue-500 text-white rounded">
                    Toggle Collapse 1 ({() => $$(isOpen1) ? 'Open' : 'Closed'})
                </Button>
                <Collapse open={isOpen1}>
                    <div class="p-4 bg-blue-100">
                        <p>First collapse content</p>
                    </div>
                </Collapse>
            </div>

            <div class="space-y-2">
                <Button onClick={() => isOpen2(!$$(isOpen2))} cls="px-3 py-1 bg-green-500 text-white rounded">
                    Toggle Collapse 2 ({() => $$(isOpen2) ? 'Open' : 'Closed'})
                </Button>
                <Collapse open={isOpen2}>
                    <div class="p-4 bg-green-100">
                        <p>Second collapse content</p>
                    </div>
                </Collapse>
            </div>

            <div class="space-y-2">
                <Button onClick={() => isOpen3(!$$(isOpen3))} cls="px-3 py-1 bg-purple-500 text-white rounded">
                    Toggle Collapse 3 ({() => $$(isOpen3) ? 'Open' : 'Closed'})
                </Button>
                <Collapse open={isOpen3} background={false}>
                    <div class="p-4 border border-gray-300">
                        <p>Third collapse content (no background)</p>
                    </div>
                </Collapse>
            </div>
        </div>
    )
}

// ============================================
// COMPREHENSIVE COMBINATION TEST
// ============================================

const ComprehensiveCollapseTest = () => {
    const isOpen1 = $(true)
    const isOpen2 = $(false)
    const hasBackground = $(true)

    return (
        <div class="space-y-6 p-4">
            <div class="space-y-4">
                <h3 class="font-bold text-lg">Collapse Component Test Suite</h3>

                <div class="flex gap-2 flex-wrap">
                    <Button onClick={() => isOpen1(!$$(isOpen1))} cls="px-3 py-1 bg-blue-500 text-white rounded">
                        Toggle First ({() => $$(isOpen1) ? 'Open' : 'Closed'})
                    </Button>
                    <Button onClick={() => isOpen2(!$$(isOpen2))} cls="px-3 py-1 bg-green-500 text-white rounded">
                        Toggle Second ({() => $$(isOpen2) ? 'Open' : 'Closed'})
                    </Button>
                    <Button onClick={() => hasBackground(!$$(hasBackground))} cls="px-3 py-1 bg-purple-500 text-white rounded">
                        Toggle Background ({() => $$(hasBackground) ? 'On' : 'Off'})
                    </Button>
                </div>

                <div class="space-y-4">
                    {/* Default */}
                    <Collapse open={isOpen1}>
                        <div class="p-4 bg-gray-100">
                            <p>Default collapse that can be toggled</p>
                        </div>
                    </Collapse>

                    {/* Without background */}
                    <Collapse open={isOpen2} background={hasBackground}>
                        <div class="p-4 border border-gray-300">
                            <p>Collapse with toggleable background</p>
                        </div>
                    </Collapse>

                    {/* Custom styled */}
                    <Collapse cls="!bg-yellow-100 !border-2 !border-purple-500" open={true}>
                        <div class="p-4">
                            <p>Custom styled collapse</p>
                        </div>
                    </Collapse>
                </div>
            </div>
        </div>
    )
}

export {
    // Basic
    DefaultCollapse,

    // Open state
    OpenCollapse,
    ClosedCollapse,

    // Background
    CollapseWithBackground,
    CollapseWithoutBackground,

    // Interactive
    ToggleableCollapse,
    ToggleableCollapseWithoutBackground,

    // Combined
    OpenCollapseWithoutBackground,
    ClosedCollapseWithBackground,

    // Styling
    CustomStyledCollapse,

    // Content
    CollapseWithComplexContent,

    // Multiple
    MultipleCollapses,

    // Comprehensive
    ComprehensiveCollapseTest,
}
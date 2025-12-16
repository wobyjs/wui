// export * from '../src/custom-elements'
// export * from '../src/Chip'

import { Chip } from '../src/Chip'
import { Avatar } from '../src/Avatar'
import { Button } from '../src/Button'
import { $, $$ } from 'woby'

// ============================================
// BASIC TESTS
// ============================================

const DefaultChip = () => {
    return <Chip>Default Chip</Chip>
}

const SampleChip = () => {
    return <Chip>Sample Chip</Chip>
}

// ============================================
// VISIBILITY TESTS
// ============================================

// Visible chip with boolean true
const VisibleChip = () => {
    return <Chip visible={true}>Visible Chip</Chip>
}

// Hidden chip with boolean false (should NOT render)
const HiddenChip = () => {
    return <Chip visible={false}>Hidden Chip</Chip>
}

// Visible chip with observable - true
const VisibleChipObservable = () => {
    const isVisible = $(true)
    return <Chip visible={isVisible}>Visible Chip (Observable)</Chip>
}

// Hidden chip with observable - false (should NOT render)
const HiddenChipObservable = () => {
    const isVisible = $(false)
    return <Chip visible={isVisible}>Hidden Chip (Observable)</Chip>
}

// Toggle visibility with button
const ToggleVisibilityChip = () => {
    const isVisible = $(true)

    return (
        <div class="space-y-4">
            <Button onClick={() => isVisible(!$$(isVisible))} class="px-4 py-2 bg-blue-500 text-white rounded">
                Toggle Visibility (Currently: {() => $$(isVisible) ? 'Visible' : 'Hidden'})
            </Button>
            <div>
                <Chip visible={isVisible}>Toggle Chip</Chip>
            </div>
        </div>
    )
}

// ============================================
// DELETABLE TESTS
// ============================================

// Chip with delete icon
const ChipWithDelete = () => {
    return <Chip deletable>Deletable Chip</Chip>
}

// Chip without delete icon
const ChipWithoutDelete = () => {
    return <Chip deletable={false}>Not Deletable Chip</Chip>
}

// Deletable chip with default hide behavior
const DeletableAutoHideChip = () => {
    return <Chip deletable>Click X to hide me</Chip>
}

// Deletable chip with custom onDelete handler
const DeletableCustomHandlerChip = () => {
    return (
        <Chip
            deletable
            onDelete={(e) => {
                console.log('Delete clicked!', e)
                alert('Custom delete handler called!')
            }}
        >
            Deletable with Custom Handler
        </Chip>
    )
}

// ============================================
// COMBINED TESTS (Visible + Deletable)
// ============================================

// Visible and deletable
const VisibleDeletableChip = () => {
    return <Chip visible={true} deletable>Visible & Deletable</Chip>
}

// Hidden and deletable (should NOT render)
const HiddenDeletableChip = () => {
    return <Chip visible={false} deletable>Hidden & Deletable</Chip>
}

// Observable visible with deletable
const ObservableVisibleDeletableChip = () => {
    const isVisible = $(true)
    return (
        <div class="space-y-4">
            <div class="flex gap-2">
                <Button onClick={() => isVisible(true)} cls="px-3 py-1 bg-green-500 text-white rounded">
                    Show
                </Button>
                <Button onClick={() => isVisible(false)} cls="px-3 py-1 bg-red-500 text-white rounded">
                    Hide
                </Button>
                <span class="px-3 py-1">Status: {() => $$(isVisible) ? 'Visible' : 'Hidden'}</span>
            </div>
            <div>
                <Chip visible={isVisible} deletable>
                    Observable Visible & Deletable (click X or use buttons)
                </Chip>
            </div>
        </div>
    )
}

// ============================================
// AVATAR TESTS
// ============================================

// Chip with avatar
const ChipWithAvatar = () => {
    return (
        <Chip>
            <Avatar cls="!w-6 !h-6 !text-sm bg-blue-500 mx-1">S</Avatar>
            <span>Chip with Avatar</span>
            <Avatar cls="!w-6 !h-6 !text-sm bg-blue-500 mx-1">E</Avatar>
        </Chip>
    )
}

// Chip with avatar and delete
const ChipWithAvatarAndDelete = () => {
    return (
        <Chip deletable>
            <Avatar cls="!w-6 !h-6 !text-sm bg-purple-500 mx-1">A</Avatar>
            <span>Avatar & Deletable</span>
        </Chip>
    )
}

// ============================================
// STYLING TESTS
// ============================================

// Custom class chip
const CustomClassChip = () => {
    return <Chip cls="!bg-blue-100 !text-blue-800">Custom Styled Chip</Chip>
}

// Different color chips
const ColoredChips = () => {
    return (
        <div class="flex gap-2 flex-wrap">
            <Chip cls="!bg-green-100 !text-green-800">Success</Chip>
            <Chip cls="!bg-red-100 !text-red-800">Error</Chip>
            <Chip cls="!bg-yellow-100 !text-yellow-800">Warning</Chip>
            <Chip cls="!bg-blue-100 !text-blue-800">Info</Chip>
        </div>
    )
}

// ============================================
// INTERACTIVE TESTS
// ============================================

// Clickable chip
const ClickableChip = () => {
    return (
        <Chip onClick={() => alert('Chip clicked!')}>
            Clickable Chip
        </Chip>
    )
}

// Multiple deletable chips
const MultipleDeletableChips = () => {
    return (
        <div class="flex gap-2 flex-wrap">
            <Chip deletable>Tag 1</Chip>
            <Chip deletable>Tag 2</Chip>
            <Chip deletable>Tag 3</Chip>
            <Chip deletable cls="!bg-green-100 !text-green-800">Success Tag</Chip>
            <Chip deletable cls="!bg-red-100 !text-red-800">Error Tag</Chip>
        </div>
    )
}

// Dynamic chip list with add/delete functionality
const DynamicChipList = () => {
    const chips = $(['React', 'Vue', 'Angular', 'Svelte', 'Woby'])
    const inputValue = $('')

    const addChip = () => {
        const value = $$(inputValue).trim()
        if (value && !$$(chips).includes(value)) {
            chips([...$$(chips), value])
            inputValue('')
        }
    }

    const deleteChip = (chipToDelete: string) => {
        chips($$(chips).filter(chip => chip !== chipToDelete))
    }

    return (
        <div class="space-y-4">
            <div class="flex gap-2 items-center">
                <input
                    type="text"
                    value={inputValue}
                    onInput={(e) => inputValue((e.target as HTMLInputElement).value)}
                    onKeyDown={(e) => e.key === 'Enter' && addChip()}
                    placeholder="Add a chip..."
                    class="px-3 py-1 border border-gray-300 rounded"
                />
                <Button onClick={addChip} cls="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Add Chip
                </Button>
            </div>
            <div class="flex gap-2 flex-wrap">
                {() => $$(chips).map(chip => (
                    <Chip
                        key={chip}
                        deletable
                        onDelete={() => deleteChip(chip)}
                    >
                        {chip}
                    </Chip>
                ))}
            </div>
        </div>
    )
}

// Chip with manual visibility control (simulates the auto-hide on delete)
const ManualVisibilityControlChip = () => {
    const visible1 = $(true)
    const visible2 = $(true)
    const visible3 = $(true)

    return (
        <div class="space-y-4">
            <h3 class="font-bold">Manual Visibility Control (simulates delete behavior)</h3>
            <div class="flex gap-2 flex-wrap">
                <Chip visible={visible1} deletable onDelete={() => visible1(false)}>
                    Manual Hide 1
                </Chip>
                <Chip visible={visible2} deletable onDelete={() => visible2(false)}>
                    Manual Hide 2
                </Chip>
                <Chip visible={visible3} deletable onDelete={() => visible3(false)}>
                    Manual Hide 3
                </Chip>
            </div>
            <div class="flex gap-2">
                <Button onClick={() => { visible1(true); visible2(true); visible3(true) }} cls="px-3 py-1 bg-blue-500 text-white rounded">
                    Reset All
                </Button>
            </div>
        </div>
    )
}

// ============================================
// COMPREHENSIVE COMBINATION TEST
// ============================================

const ComprehensiveChipTest = () => {
    const isVisible = $(true)
    const customLog = (msg: string) => console.log(`[Chip Test] ${msg}`)

    return (
        <div class="space-y-6 p-4">
            <div class="space-y-2">
                <h3 class="font-bold text-lg">All Features Combined</h3>
                <div class="flex gap-2 flex-wrap">
                    {/* Default */}
                    <Chip>Default</Chip>

                    {/* Deletable */}
                    <Chip deletable>Auto-hide on delete</Chip>

                    {/* Custom handler */}
                    <Chip deletable onDelete={() => customLog('Custom handler')}>
                        Custom Handler
                    </Chip>

                    {/* With avatar */}
                    <Chip deletable>
                        <Avatar cls="!w-6 !h-6 !text-sm bg-green-500 mx-1">A</Avatar>
                        <span>Avatar + Delete</span>
                    </Chip>

                    {/* Styled + deletable */}
                    <Chip deletable cls="!bg-purple-100 !text-purple-800">
                        Styled + Delete
                    </Chip>

                    {/* Observable visibility */}
                    <Chip visible={isVisible} deletable>
                        Observable Visible
                    </Chip>
                </div>

                <div class="flex gap-2">
                    <Button onClick={() => isVisible(!$$(isVisible))} cls="px-3 py-1 bg-blue-500 text-white rounded">
                        Toggle Last Chip ({() => $$(isVisible) ? 'Hide' : 'Show'})
                    </Button>
                </div>
            </div>
        </div>
    )
}

export {
    // Basic
    DefaultChip,
    SampleChip,

    // Visibility
    VisibleChip,
    HiddenChip,
    VisibleChipObservable,
    HiddenChipObservable,
    ToggleVisibilityChip,

    // Deletable
    ChipWithDelete,
    ChipWithoutDelete,
    DeletableAutoHideChip,
    DeletableCustomHandlerChip,

    // Combined (Visible + Deletable)
    VisibleDeletableChip,
    HiddenDeletableChip,
    ObservableVisibleDeletableChip,

    // Avatar
    ChipWithAvatar,
    ChipWithAvatarAndDelete,

    // Styling
    CustomClassChip,
    ColoredChips,

    // Interactive
    ClickableChip,
    MultipleDeletableChips,
    DynamicChipList,
    ManualVisibilityControlChip,

    // Comprehensive
    ComprehensiveChipTest,
}


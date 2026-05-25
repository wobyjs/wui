import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
// export * from '../src/custom-elements'
// export * from '../src/Chip'
import { Chip } from '../src/Chip';
import { Avatar } from '../src/Avatar';
import { Button } from '../src/Button';
import { $, $$ } from 'woby';
// ============================================
// BASIC TESTS
// ============================================
const DefaultChip = () => {
    return _jsx(Chip, { children: "Default Chip" });
};
const SampleChip = () => {
    return _jsx(Chip, { children: "Sample Chip" });
};
// ============================================
// VISIBILITY TESTS
// ============================================
// Visible chip with boolean true
const VisibleChip = () => {
    return _jsx(Chip, { visible: true, children: "Visible Chip" });
};
// Hidden chip with boolean false (should NOT render)
const HiddenChip = () => {
    return _jsx(Chip, { visible: false, children: "Hidden Chip" });
};
// Visible chip with observable - true
const VisibleChipObservable = () => {
    const isVisible = $(true);
    return _jsx(Chip, { visible: isVisible, children: "Visible Chip (Observable)" });
};
// Hidden chip with observable - false (should NOT render)
const HiddenChipObservable = () => {
    const isVisible = $(false);
    return _jsx(Chip, { visible: isVisible, children: "Hidden Chip (Observable)" });
};
// Toggle visibility with button
const ToggleVisibilityChip = () => {
    const isVisible = $(true);
    return (_jsxs("div", { class: "space-y-4", children: [_jsxs(Button, { onClick: () => isVisible(!$$(isVisible)), class: "px-4 py-2 bg-blue-500 text-white rounded", children: ["Toggle Visibility (Currently: ", () => $$(isVisible) ? 'Visible' : 'Hidden', ")"] }), _jsx("div", { children: _jsx(Chip, { visible: isVisible, children: "Toggle Chip" }) })] }));
};
// ============================================
// DELETABLE TESTS
// ============================================
// Chip with delete icon
const ChipWithDelete = () => {
    return _jsx(Chip, { deletable: true, children: "Deletable Chip" });
};
// Chip without delete icon
const ChipWithoutDelete = () => {
    return _jsx(Chip, { deletable: false, children: "Not Deletable Chip" });
};
// Deletable chip with default hide behavior
const DeletableAutoHideChip = () => {
    return _jsx(Chip, { deletable: true, children: "Click X to hide me" });
};
// Deletable chip with custom onDelete handler
const DeletableCustomHandlerChip = () => {
    return (_jsx(Chip, { deletable: true, onDelete: (e) => {
            console.log('Delete clicked!', e);
            alert('Custom delete handler called!');
        }, children: "Deletable with Custom Handler" }));
};
// ============================================
// COMBINED TESTS (Visible + Deletable)
// ============================================
// Visible and deletable
const VisibleDeletableChip = () => {
    return _jsx(Chip, { visible: true, deletable: true, children: "Visible & Deletable" });
};
// Hidden and deletable (should NOT render)
const HiddenDeletableChip = () => {
    return _jsx(Chip, { visible: false, deletable: true, children: "Hidden & Deletable" });
};
// Observable visible with deletable
const ObservableVisibleDeletableChip = () => {
    const isVisible = $(true);
    return (_jsxs("div", { class: "space-y-4", children: [_jsxs("div", { class: "flex gap-2", children: [_jsx(Button, { onClick: () => isVisible(true), cls: "px-3 py-1 bg-green-500 text-white rounded", children: "Show" }), _jsx(Button, { onClick: () => isVisible(false), cls: "px-3 py-1 bg-red-500 text-white rounded", children: "Hide" }), _jsxs("span", { class: "px-3 py-1", children: ["Status: ", () => $$(isVisible) ? 'Visible' : 'Hidden'] })] }), _jsx("div", { children: _jsx(Chip, { visible: isVisible, deletable: true, children: "Observable Visible & Deletable (click X or use buttons)" }) })] }));
};
// ============================================
// AVATAR TESTS
// ============================================
// Chip with avatar
const ChipWithAvatar = () => {
    return (_jsxs(Chip, { children: [_jsx(Avatar, { cls: "!w-6 !h-6 !text-sm bg-blue-500 mx-1", children: "S" }), _jsx("span", { children: "Chip with Avatar" }), _jsx(Avatar, { cls: "!w-6 !h-6 !text-sm bg-blue-500 mx-1", children: "E" })] }));
};
// Chip with avatar and delete
const ChipWithAvatarAndDelete = () => {
    return (_jsxs(Chip, { deletable: true, children: [_jsx(Avatar, { cls: "!w-6 !h-6 !text-sm bg-purple-500 mx-1", children: "A" }), _jsx("span", { children: "Avatar & Deletable" })] }));
};
// ============================================
// STYLING TESTS
// ============================================
// Custom class chip
const CustomClassChip = () => {
    return _jsx(Chip, { cls: "!bg-blue-100 !text-blue-800", children: "Custom Styled Chip" });
};
// Different color chips
const ColoredChips = () => {
    return (_jsxs("div", { class: "flex gap-2 flex-wrap", children: [_jsx(Chip, { cls: "!bg-green-100 !text-green-800", children: "Success" }), _jsx(Chip, { cls: "!bg-red-100 !text-red-800", children: "Error" }), _jsx(Chip, { cls: "!bg-yellow-100 !text-yellow-800", children: "Warning" }), _jsx(Chip, { cls: "!bg-blue-100 !text-blue-800", children: "Info" })] }));
};
// ============================================
// INTERACTIVE TESTS
// ============================================
// Clickable chip
const ClickableChip = () => {
    return (_jsx(Chip, { onClick: () => alert('Chip clicked!'), children: "Clickable Chip" }));
};
// Multiple deletable chips
const MultipleDeletableChips = () => {
    return (_jsxs("div", { class: "flex gap-2 flex-wrap", children: [_jsx(Chip, { deletable: true, children: "Tag 1" }), _jsx(Chip, { deletable: true, children: "Tag 2" }), _jsx(Chip, { deletable: true, children: "Tag 3" }), _jsx(Chip, { deletable: true, cls: "!bg-green-100 !text-green-800", children: "Success Tag" }), _jsx(Chip, { deletable: true, cls: "!bg-red-100 !text-red-800", children: "Error Tag" })] }));
};
// Dynamic chip list with add/delete functionality
const DynamicChipList = () => {
    const chips = $(['React', 'Vue', 'Angular', 'Svelte', 'Woby']);
    const inputValue = $('');
    const addChip = () => {
        const value = $$(inputValue).trim();
        if (value && !$$(chips).includes(value)) {
            chips([...$$(chips), value]);
            inputValue('');
        }
    };
    const deleteChip = (chipToDelete) => {
        chips($$(chips).filter(chip => chip !== chipToDelete));
    };
    return (_jsxs("div", { class: "space-y-4", children: [_jsxs("div", { class: "flex gap-2 items-center", children: [_jsx("input", { type: "text", value: inputValue, onInput: (e) => inputValue(e.target.value), onKeyDown: (e) => e.key === 'Enter' && addChip(), placeholder: "Add a chip...", class: "px-3 py-1 border border-gray-300 rounded" }), _jsx(Button, { onClick: addChip, cls: "px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600", children: "Add Chip" })] }), _jsx("div", { class: "flex gap-2 flex-wrap", children: () => $$(chips).map(chip => (_jsx(Chip, { deletable: true, onDelete: () => deleteChip(chip), children: chip }, chip))) })] }));
};
// Chip with manual visibility control (simulates the auto-hide on delete)
const ManualVisibilityControlChip = () => {
    const visible1 = $(true);
    const visible2 = $(true);
    const visible3 = $(true);
    return (_jsxs("div", { class: "space-y-4", children: [_jsx("h3", { class: "font-bold", children: "Manual Visibility Control (simulates delete behavior)" }), _jsxs("div", { class: "flex gap-2 flex-wrap", children: [_jsx(Chip, { visible: visible1, deletable: true, onDelete: () => visible1(false), children: "Manual Hide 1" }), _jsx(Chip, { visible: visible2, deletable: true, onDelete: () => visible2(false), children: "Manual Hide 2" }), _jsx(Chip, { visible: visible3, deletable: true, onDelete: () => visible3(false), children: "Manual Hide 3" })] }), _jsx("div", { class: "flex gap-2", children: _jsx(Button, { onClick: () => { visible1(true); visible2(true); visible3(true); }, cls: "px-3 py-1 bg-blue-500 text-white rounded", children: "Reset All" }) })] }));
};
// ============================================
// COMPREHENSIVE COMBINATION TEST
// ============================================
const ComprehensiveChipTest = () => {
    const isVisible = $(true);
    const customLog = (msg) => console.log(`[Chip Test] ${msg}`);
    return (_jsx("div", { class: "space-y-6 p-4", children: _jsxs("div", { class: "space-y-2", children: [_jsx("h3", { class: "font-bold text-lg", children: "All Features Combined" }), _jsxs("div", { class: "flex gap-2 flex-wrap", children: [_jsx(Chip, { children: "Default" }), _jsx(Chip, { deletable: true, children: "Auto-hide on delete" }), _jsx(Chip, { deletable: true, onDelete: () => customLog('Custom handler'), children: "Custom Handler" }), _jsxs(Chip, { deletable: true, children: [_jsx(Avatar, { cls: "!w-6 !h-6 !text-sm bg-green-500 mx-1", children: "A" }), _jsx("span", { children: "Avatar + Delete" })] }), _jsx(Chip, { deletable: true, cls: "!bg-purple-100 !text-purple-800", children: "Styled + Delete" }), _jsx(Chip, { visible: isVisible, deletable: true, children: "Observable Visible" })] }), _jsx("div", { class: "flex gap-2", children: _jsxs(Button, { onClick: () => isVisible(!$$(isVisible)), cls: "px-3 py-1 bg-blue-500 text-white rounded", children: ["Toggle Last Chip (", () => $$(isVisible) ? 'Hide' : 'Show', ")"] }) })] }) }));
};
export { 
// Basic
DefaultChip, SampleChip, 
// Visibility
VisibleChip, HiddenChip, VisibleChipObservable, HiddenChipObservable, ToggleVisibilityChip, 
// Deletable
ChipWithDelete, ChipWithoutDelete, DeletableAutoHideChip, DeletableCustomHandlerChip, 
// Combined (Visible + Deletable)
VisibleDeletableChip, HiddenDeletableChip, ObservableVisibleDeletableChip, 
// Avatar
ChipWithAvatar, ChipWithAvatarAndDelete, 
// Styling
CustomClassChip, ColoredChips, 
// Interactive
ClickableChip, MultipleDeletableChips, DynamicChipList, ManualVisibilityControlChip, 
// Comprehensive
ComprehensiveChipTest, };

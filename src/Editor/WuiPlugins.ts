/**
 * WUI Component Plugins for wui-editor.
 *
 * Registers wui-* components (button, toggle-button, checkbox, switch,
 * text-field, text-area, number-field, icon-button, badge, fab, avatar)
 * as editor plugins so they appear in the insert menu and support property editing.
 *
 * Import this file as a side-effect to register all plugins:
 *   import './Editor/WuiPlugins'
 */
import { registerEditorPlugin, type PluginProp } from './EditorPlugin'

/**
 * Styling props shared by every wui component, appended last so they render
 * below the semantic rows.
 *
 * These are declared rather than scraped on purpose. The blind attribute scrape
 * in PropertyExtractor only runs for elements with no schema, and presence is
 * the wrong signal for these two anyway: woby's customElement reflects the
 * `cls: $('', HtmlClass)` default onto every upgraded element, so `cls=""` is
 * always "present" (it would render an empty row everywhere), while `class` is
 * never reflected, so it would be un-addable from the panel.
 *
 * `default: ''` matters: applyCustomElementProperty removes the attribute when
 * the value equals the default, so clearing either box strips it from the
 * serialized HTML instead of leaving `cls=""` behind.
 */
const styleProps: PluginProp[] = [
    {
        name: 'class', type: 'string', label: 'CSS Class', default: '',
        hint: 'Extra classes, appended after the component styling',
    },
    {
        name: 'cls', type: 'string', label: 'Class Override', default: '',
        hint: 'Replaces the component base/variant class entirely — leave empty to keep the variant',
    },
]

// ── wui-button ──

const buttonProps: PluginProp[] = [
    {
        name: 'type', type: 'enum', label: 'Variant', default: 'contained',
        options: [
            { value: 'contained', label: 'Contained' },
            { value: 'outlined', label: 'Outlined' },
            { value: 'text', label: 'Text' },
        ],
    },
    { name: 'children', type: 'string', label: 'Label', default: 'Button', hint: 'Button text', textContent: true },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'button',
    label: 'Button',
    tagName: 'wui-button',
    props: [...buttonProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔘'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-button')
        el.setAttribute('type', 'contained')
        el.textContent = 'Button'
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-toggle-button ──

const toggleButtonProps: PluginProp[] = [
    { name: 'children', type: 'string', label: 'Label', default: 'Toggle', hint: 'Button text', textContent: true },
    { name: 'checked', type: 'boolean', label: 'Checked', default: false },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'toggle-button',
    label: 'Toggle Button',
    tagName: 'wui-toggle-button',
    props: [...toggleButtonProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔀'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-toggle-button')
        el.textContent = 'Toggle'
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-checkbox ──

const checkboxProps: PluginProp[] = [
    { name: 'children', type: 'string', label: 'Label', default: 'Checkbox', hint: 'Label text', textContent: true },
    { name: 'checked', type: 'boolean', label: 'Checked', default: false },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
    {
        name: 'labelPosition', type: 'enum', label: 'Label Position', default: 'right',
        options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
        ],
    },
]

registerEditorPlugin({
    name: 'checkbox',
    label: 'Checkbox',
    tagName: 'wui-checkbox',
    props: [...checkboxProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '☑️'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-checkbox')
        el.textContent = 'Checkbox'
        el.setAttribute('label-position', 'right')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-switch ──

const switchProps: PluginProp[] = [
    { name: 'on', type: 'string', label: 'On Text', default: 'ON', hint: 'Label shown when checked' },
    { name: 'off', type: 'string', label: 'Off Text', default: 'OFF', hint: 'Label shown when unchecked' },
    { name: 'checked', type: 'boolean', label: 'Checked', default: false },
    {
        name: 'effect', type: 'enum', label: 'Effect', default: 'ios',
        options: [
            { value: '', label: 'Default' },
            { value: 'ios', label: 'iOS' },
            { value: 'flat', label: 'Flat' },
            { value: 'skewed', label: 'Skewed' },
            { value: 'flip', label: 'Flip' },
            { value: 'light', label: 'Light' },
            { value: 'effect1', label: 'Effect 1' },
            { value: 'effect7', label: 'Effect 7' },
        ],
    },
]

registerEditorPlugin({
    name: 'switch',
    label: 'Switch',
    tagName: 'wui-switch',
    props: [...switchProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔛'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-switch')
        el.setAttribute('effect', 'ios')
        el.setAttribute('checked', 'true')
        el.setAttribute('on', 'ON')
        el.setAttribute('off', 'OFF')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-text-field ──

const textFieldProps: PluginProp[] = [
    { name: 'label', type: 'string', label: 'Label', hint: 'Floating label text' },
    { name: 'value', type: 'string', label: 'Value', default: '' },
    { name: 'placeholder', type: 'string', label: 'Placeholder', hint: 'Hint text inside the field' },
    {
        name: 'inputType', type: 'enum', label: 'Input Type', default: 'text',
        options: [
            { value: 'text', label: 'Text' },
            { value: 'password', label: 'Password' },
            { value: 'email', label: 'Email' },
            { value: 'number', label: 'Number' },
            { value: 'tel', label: 'Telephone' },
            { value: 'url', label: 'URL' },
            { value: 'search', label: 'Search' },
            { value: 'date', label: 'Date' },
            { value: 'time', label: 'Time' },
        ],
    },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'text-field',
    label: 'Text Field',
    tagName: 'wui-text-field',
    props: [...textFieldProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '📝'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-text-field')
        el.setAttribute('label', 'Name')
        el.setAttribute('placeholder', 'Enter text')
        el.setAttribute('style', 'display:inline-flex')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-text-area ──

const textAreaProps: PluginProp[] = [
    { name: 'label', type: 'string', label: 'Label', hint: 'Floating label text' },
    { name: 'value', type: 'string', label: 'Value', default: '' },
    { name: 'placeholder', type: 'string', label: 'Placeholder', hint: 'Hint text inside the field' },
]

registerEditorPlugin({
    name: 'text-area',
    label: 'Text Area',
    tagName: 'wui-text-area',
    props: [...textAreaProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '📄'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-text-area')
        el.setAttribute('label', 'Notes')
        el.setAttribute('placeholder', 'Enter text')
        el.setAttribute('style', 'display:inline-flex;vertical-align:top')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-number-field ──

const numberFieldProps: PluginProp[] = [
    { name: 'value', type: 'number', label: 'Value', default: 10, hint: 'Current numeric value' },
    { name: 'min', type: 'number', label: 'Min', default: 0 },
    { name: 'max', type: 'number', label: 'Max', default: 100 },
    { name: 'step', type: 'number', label: 'Step', default: 1 },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'number-field',
    label: 'Number Field',
    tagName: 'wui-number-field',
    props: [...numberFieldProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔢'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-number-field')
        el.setAttribute('value', '10')
        el.setAttribute('min', '0')
        el.setAttribute('max', '100')
        el.setAttribute('style', 'display:inline-flex')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-icon-button ──

const iconButtonProps: PluginProp[] = [
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'icon-button',
    label: 'Icon Button',
    tagName: 'wui-icon-button',
    props: [...iconButtonProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔔'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-icon-button')
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '20')
        svg.setAttribute('height', '20')
        svg.setAttribute('viewBox', '0 0 24 24')
        svg.setAttribute('fill', 'currentColor')
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')
        svg.appendChild(path)
        el.appendChild(svg)
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-badge ──

const badgeProps: PluginProp[] = [
    { name: 'badgeContent', type: 'string', label: 'Badge Content', default: '3', hint: 'Text or number shown on the badge' },
    {
        name: 'vertical', type: 'enum', label: 'Vertical', default: 'top',
        options: [
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
        ],
    },
    {
        name: 'horizontal', type: 'enum', label: 'Horizontal', default: 'right',
        options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
        ],
    },
]

registerEditorPlugin({
    name: 'badge',
    label: 'Badge',
    tagName: 'wui-badge',
    props: [...badgeProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🏷️'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-badge')
        el.setAttribute('badge-content', '3')
        el.setAttribute('style', 'display:inline-flex')

        // inner icon-button with SVG heart
        const ib = document.createElement('wui-icon-button')
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '20')
        svg.setAttribute('height', '20')
        svg.setAttribute('viewBox', '0 0 24 24')
        svg.setAttribute('fill', 'currentColor')
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')
        svg.appendChild(path)
        ib.appendChild(svg)
        el.appendChild(ib)

        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-fab ──

const fabProps: PluginProp[] = [
    {
        name: 'type', type: 'enum', label: 'Shape', default: 'circular',
        options: [
            { value: 'circular', label: 'Circular' },
            { value: 'pill', label: 'Pill' },
            { value: 'custom', label: 'Custom' },
        ],
    },
    { name: 'children', type: 'string', label: 'Content', default: '❤️', textContent: true },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'fab',
    label: 'FAB',
    tagName: 'wui-fab',
    props: [...fabProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '➕'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-fab')
        el.setAttribute('type', 'circular')
        el.textContent = '❤️'
        el.setAttribute('style', 'display:inline-flex;position:static;transform:none;')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-avatar ──

const avatarProps: PluginProp[] = [
    {
        name: 'size', type: 'enum', label: 'Size', default: 'md',
        options: [
            { value: 'xs', label: 'Extra Small' },
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
        ],
    },
    {
        name: 'type', type: 'enum', label: 'Variant', default: 'circular',
        options: [
            { value: 'circular', label: 'Circular' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'square', label: 'Square' },
            { value: 'custom', label: 'Custom' },
        ],
    },
    { name: 'src', type: 'string', label: 'Image URL', hint: 'Image source; falls back to initials' },
    { name: 'children', type: 'string', label: 'Initials', default: 'JD', hint: 'Fallback content when no image', textContent: true },
]

registerEditorPlugin({
    name: 'avatar',
    label: 'Avatar',
    tagName: 'wui-avatar',
    props: [...avatarProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '👤'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-avatar')
        el.setAttribute('size', 'md')
        el.setAttribute('type', 'circular')
        el.textContent = 'JD'
        el.setAttribute('style', 'display:inline-flex;vertical-align:middle')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})
import { render } from 'woby'
import App from './app'
// import { Checks } from '@woby/chk'
// import '@woby/chk/index.css'
import './input.css'
import './Editor/CounterPlugin'
// Registers the eleven wui-* component plugins (button, checkbox, text-field, …) with their
// typed `props` schemas. Without this import the file is dead code: the components never reach
// the Insert menu and the property panel falls back to blind free-text attribute rows.
// Portal-based components (the Wheeler family) are intentionally absent — they render outside
// the document flow and are not document-centric, so they do not belong in the editor.
import './Editor/WuiPlugins'

// Initialize the global chk instance if it's not already
// if (!window.checks) {
//     window.checks = new Checks()
// }

// Render the App component
render(App(), document.getElementById('app')!)

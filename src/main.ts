import { render } from 'woby'
import { App } from './app'
// import { Checks } from '@woby/chk'
// import '@woby/chk/index.css'
import './input.css'
import './Editor/CounterPlugin'

// Initialize the global chk instance if it's not already
// if (!window.checks) {
//     window.checks = new Checks()
// }

// Render the App component
render(App(), document.getElementById('app')!)

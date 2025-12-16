import { $, render } from 'woby'
import { TextField } from './TextField'

// Test to verify that focus forwarding works correctly
const testFocusForwarding = () => {
  const App = () => {
    let textFieldRef: any = null
    
    const setTextFieldRef = (el: any) => {
      textFieldRef = el
    }
    
    const handleContainerFocus = () => {
      if (textFieldRef && typeof textFieldRef.focus === 'function') {
        textFieldRef.focus()
      }
    }
    
    return (
      <div>
        <h1>TextField Focus Forwarding Test</h1>
        <p>Click on the container below to test focus forwarding:</p>
        <div 
          tabIndex={0} 
          onFocus={handleContainerFocus}
          style={{ padding: '10px', border: '1px dashed #ccc', cursor: 'pointer' }}
        >
          <TextField ref={setTextFieldRef} placeholder="I should get focused when container is clicked" />
        </div>
        <p>Clicking on the container above should focus the input field inside the TextField component.</p>
      </div>
    )
  }
  
  // Render the app to the document body
  render(<App />, document.body)
}

export default testFocusForwarding
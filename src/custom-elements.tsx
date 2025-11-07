import { customElement, ElementAttributes } from "woby";
import { Button } from "./Button";

// NOTE: Register the custom element
customElement('wui-button', Button);


// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-button': ElementAttributes<typeof Button>
        }
    }
}
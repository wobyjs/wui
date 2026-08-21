
import { type JSX } from 'woby'

export default (props: JSX.SVGAttributes<SVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        width="1em"
        height="1em"
        fill="currentColor"
        {...props}
    >
        <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
    </svg>
)

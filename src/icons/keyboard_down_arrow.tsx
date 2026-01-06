
import { type JSX } from 'woby'
// export default (props: JSX.SVGAttributes<SVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368" {...props}>
//     <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
// </svg>

export default (props: JSX.SVGAttributes<SVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        width="1em"
        height="1em"
        fill="currentColor" // "#5f6368"
        {...props}
    >
        <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
    </svg>
)
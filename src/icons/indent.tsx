import { type JSX } from 'woby'
// export default (props: JSX.SVGAttributes<SVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368" {...props}>
//     <path d="M120-120v-80h720v80H120Zm320-160v-80h400v80H440Zm0-160v-80h400v80H440Zm0-160v-80h400v80H440ZM120-760v-80h720v80H120Zm0 440v-320l160 160-160 160Z" />
// </svg>


// Material Symbols `format_indent_increase`: the arrow points RIGHT, into the text.
// These two files held each other's glyph until 2026-09; Table.tsx compensated by
// importing them crossed, which made every honest consumer wrong instead.
export default (props: JSX.SVGAttributes<SVGElement>) =>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        height="1em"
        width="1em"
        fill="currentColor" //"#5f6368"
        {...props}>
        <path d="M120-120v-80h720v80H120Zm320-160v-80h400v80H440Zm0-160v-80h400v80H440Zm0-160v-80h400v80H440ZM120-760v-80h720v80H120Zm0 440v-320l160 160-160 160Z" />
    </svg>
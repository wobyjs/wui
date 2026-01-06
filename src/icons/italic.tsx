
import { type JSX } from 'woby'
// export default (props: JSX.SVGAttributes<SVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368" {...props}>
//     <path d="M200-200v-100h160l120-360H320v-100h400v100H580L460-300h140v100H200Z" />
// </svg>

export default function ItalicIcon(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            // fill="#5f6368"
            {...props}
        >
            <path d="M10 4v2h2.21l-3.42 12H6v2h8v-2h-2.21l3.42-12H18V4h-8z" />
        </svg>
    );
}

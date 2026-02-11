import { type JSX } from 'woby'
export default (props: JSX.SVGAttributes<SVGElement>) =>
    <svg xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        height="1em"
        width="1em"
        fill="currentColor" //"#5f6368"
        {...props}>
        {/* <path d="M440-720h400v-80H440v80Zm0 280h400v-80H440v80Zm0 280h400v-80H440v80ZM120-720h160v-160H120v160Zm0 280h160v-160H120v160Zm0 280h160v-160H120v160Z" /> */}
        <path d="M120-600v-300h300v300H120Zm60-60h180v-180H180v180Zm25-63 45 45 90-90-42-42-48 48-18-18-27 27ZM120-120v-300h300v300H120Zm60-60h180v-180H180v180Zm330-630h360v-60H510v60Zm0 120h210v-60H510v60Zm0 360h360v-60H510v60Zm0 120h210v-60H510v60Z" />
    </svg>
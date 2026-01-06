
import { type JSX } from 'woby'
// export default (props: JSX.SVGAttributes<SVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368" {...props}>
//     <path d="M272-200v-560h221q65 0 120 40t55 111q0 51-23 78.5T602-491q25 11 55.5 41t30.5 90q0 89-65 124.5T501-200H272Zm121-112h104q48 0 58.5-24.5T566-372q0-11-10.5-35.5T494-432H393v120Zm0-228h93q33 0 48-17t15-38q0-24-17-39t-44-15h-95v109Z" />
// </svg>

export default function BoldIcon(props) {
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
            <path d="M15.6 10.79c1-.67 1.65-1.77 1.65-2.96 0-2.06-1.67-3.73-3.73-3.73H7v13.8h7.07c2.2 0 3.93-1.79 3.93-3.99 0-1.52-.87-2.82-2.4-3.12zM10.26 6.5h2.8c.73 0 1.33.6 1.33 1.33s-.6 1.33-1.33 1.33h-2.8V6.5zm3.33 8.97h-3.33v-2.66h3.33c.73 0 1.33.6 1.33 1.33s-.6 1.33-1.33 1.33z" />
        </svg>
    );
}

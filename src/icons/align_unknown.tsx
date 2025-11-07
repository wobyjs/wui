import { type JSX } from 'woby'

export default (props: JSX.SVGAttributes<SVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    width="24px"
    viewBox="0 0 24 24"
    fill="#5f6368"
    {...props}
  >
    {/* horizontal guide lines (to match the align icon family vibe) */}
    <rect x="3"  y="3"  width="18" height="2" rx="1" />
    <rect x="5"  y="7"  width="14" height="2" rx="1" />
    <rect x="3"  y="11" width="18" height="2" rx="1" />
    <rect x="5"  y="15" width="14" height="2" rx="1" />
    <rect x="3"  y="19" width="18" height="2" rx="1" />

    {/* question mark badge */}
    <path d="M12 9c-1.66 0-3 1.07-3 2.5h2c0-.48.45-1 1-1s1 .38 1 .9c0 .5-.35.83-.95 1.22-.86.56-1.55 1.07-1.55 2.38V16h2v-.5c0-.62.3-.9 1.15-1.47.9-.6 1.85-1.36 1.85-2.73C14.5 10.12 13.4 9 12 9zM11 17h2v2h-2z"/>
  </svg>
)

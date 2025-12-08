// #region Base Layout & Helpers
// Helper to center content inside the knob circle (::before)
const yesKnot = [
    "[&>div]:before:w-[2rem]",
    "[&>div]:before:h-[2rem]",
    "[&>div]:before:flex",
    "[&>div]:before:items-center",
    "[&>div]:before:justify-center"
].join(" ")

// Helper to center content inside the knob circle (::after)
const noKnot = [
    "[&>div]:after:w-[2rem]",
    "[&>div]:after:h-[2rem]",
    "[&>div]:after:flex",
    "[&>div]:after:items-center",
    "[&>div]:after:justify-center"
].join(" ");

const divSpanDim = [
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]"
].join(" ");

const layer = [
    "[&>span]:w-full ",
    "[&>span]:bg-[#ebf7fc] ",
    "[&>span]:[transition:0.3s_ease_all] ",
    "[&>span]:z-[1]",
].join(" ");

const button_ = [
    "relative",
    "w-[74px]",
    "h-9",
    "overflow-hidden",
    // "-mt-5",
    // "mb-0",
    // "top-2/4",
    "mx-auto",
    "mt-2",
    "mb-2",

    "[&>span]:absolute",
    "[&>span]:inset-0",

    "[&>div]:absolute",
    "[&>div]:inset-0",
    "[&>div]:z-[2]",

    "[&>input]:relative",
    "[&>input]:w-full",
    "[&>input]:h-full",
    "[&>input]:opacity-0",
    "[&>input]:cursor-pointer",
    "[&>input]:z-[3]",
    "[&>input]:m-0",
    "[&>input]:p-0",
].join(" ");

const buttonr = [
    button_,
    "rounded-[100px] [&>span]:rounded-[100px]"
].join(" ")


export const iinput = [
    layer,

    // Input Reset
    "[&>input]:hidden",
    "[&>input]:box-border",
    "[&>input]:after:box-border",
    "[&>input]:before:box-border",
    "[&_*]:box-border",
    "[&_*]:after:box-border",
    "[&_*]:before:box-border",

    // Label Base Styles
    "[&>label]:box-border",
    "[&>label]:block",
    "[&>label]:w-[4em]",
    "[&>label]:h-[2em]",
    "[&>label]:relative",
    "[&>label]:cursor-pointer",
    "[&>label]:select-none",
    "[&>label]:[outline:0]",

    // Label 'After' (The Slide/Knob)
    "[&>label]:after:left-0",
    "[&>label]:after:relative",
    "[&>label]:after:block",
    "[&>label]:after:w-6/12",
    "[&>label]:after:h-full",

    // Label 'Before' (The Background/Track)
    "[&>label]:before:relative",
    "[&>label]:before:w-6/12",
    "[&>label]:before:h-full",

    // Checked State Animation
    "[&>input:checked~label]:after:left-2/4"
].join(" ");

export const ilabel = [
    // Default State (Unchecked)
    "[&>label]:after:content-[attr(data-tg-on)]",
    "[&>label]:after:flex",
    "[&>label]:after:justify-center",
    "[&>label]:after:align-center", // Note: In standard Tailwind, this is usually 'items-center'

    // Checked State
    "[&>input:checked~label]:after:content-[attr(data-tg-off)]",
    "[&>input:checked~label]:after:flex",
    "[&>input:checked~label]:after:justify-center",
    "[&>input:checked~label]:after:align-center"
].join(" ");

// #endregion

// #region Effect Switch Styles


// #region Effect 1: Basic Slide
export const effect1 = [
    buttonr, layer, yesKnot,

    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",


    "[&>div]:before:leading-none",
    "[&>div]:before:bg-[#f44336]",
    "[&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:before:px-1",


    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-[50%]",
    "[&>div]:before:left-1",
    "[&>div]:before:top-[2px]",


    "[&>input:checked+div]:before:content-[attr(data-tg-on)]",
    "[&>input:checked+div]:before:bg-[#03a9f4]",
    "[&>input:checked+div]:before:left-[42px]",

    "[&>input~div]:bg-[#fcebeb]",
    "[&>input:checked~div]:bg-[#ebfbfc]",
    "[&>div]:[transition:0.3s_ease_all]",
    "[&>span]:[transition:0.3s_ease_all]",


].join(" ");
// #endregion


// #region Effect 2: Dual Sliding Knobs
export const effect2 = [
    buttonr, layer, yesKnot, noKnot,

    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:bg-[#f44336]",
    "[&>div]:before:[transition:0.3s_ease_all]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-[50%]",
    "[&>div]:before:left-1",
    "[&>div]:before:top-[2px]",

    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:absolute",
    "[&>div]:after:text-white",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:[transition:0.3s_ease_all]",
    "[&>div]:after:px-1",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:rounded-[50%]",
    "[&>div]:after:left-1",
    "[&>div]:after:top-[2px]",


    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:after:bg-[#03a9f4]",
    "[&>div]:after:left-auto",
    "[&>div]:after:-right-8",

    "[&>input:checked+div]:before:-left-8",
    "[&>input:checked+div]:after:right-1",
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 3: Elastic Stretch
export const effect3 = [
    buttonr, layer, yesKnot, noKnot,

    // Base Styles (Off State)
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:bg-[#f44336]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-[50%]",
    "[&>div]:before:left-1",
    "[&>div]:before:top-[2px]",

    // Complex Transition (Elastic/Bouncy effect)
    "[&>div]:before:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]",

    // Active State (Stretches the knob when pressed)
    "[&>input:active+div]:before:w-[46px]",
    "[&>input:active+div]:before:rounded-[100px]",
    "[&>input:checked:active+div]:before:ml-[-26px]",

    // Checked State (On State)
    "[&>input:checked+div]:before:content-[attr(data-tg-on)]",
    "[&>input:checked+div]:before:bg-[#03a9f4]",
    "[&>input:checked+div]:before:left-[42px]",

    // Background Colors
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 4: Vertical Slide
export const effect4 = [
    buttonr, layer, yesKnot, noKnot,

    // Base Knob (Before - Red/Off)
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:bg-[#f44336]",
    "[&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-[50%]",
    "[&>div]:before:left-1",
    "[&>div]:before:top-[2px]",

    "[&>div]:[transition:0.3s_ease_all]",

    // Second Knob (After - Blue/On - Hidden initially)
    "[&>div]:after:absolute",
    "[&>div]:after:text-white",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:bg-[#03a9f4]",
    "[&>div]:after:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:rounded-[50%]",
    "[&>div]:after:left-1",


    // Content & Positioning Logic
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:bg-[#03a9f4]",
    "[&>div]:after:left-auto",
    "[&>div]:after:right-1",
    "[&>div]:after:-top-8", // Hidden above

    // Checked State (Animation)
    "[&>input:checked+div]:before:-top-8", // Slide Red Up
    "[&>input:checked+div]:after:top-[2px]", // Slide Blue Down
    "[&>input:checked+div]:div:-top-1",

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 5: 3D Rotate Flip (Fixed)
export const effect5 = [
    buttonr, layer, yesKnot, noKnot,

    // Container 3D settings
    "overflow-visible",
    "[perspective:60px]",

    // Base Knob Construction
    "[&>div]:before:content-['']",
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-[50%]",
    "[&>div]:before:left-1",
    "[&>div]:before:top-[2px]",

    // Inner Span styling (used for the flip effect content)
    "[&>div>span]:content-['']",
    "[&>div>span]:absolute",
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:text-white",
    "[&>div>span]:text-[10px]",
    "[&>div>span]:font-bold",
    "[&>div>span]:text-center",
    "[&>div>span]:leading-none",
    "[&>div>span]:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div>span]:px-1",
    "[&>div>span]:py-[9px]",
    "[&>div>span]:rounded-[50%]",
    "[&>div>span]:left-1",
    "[&>div>span]:top-[2px]",

    // Initial State (Off)
    "[&>div]:before:bg-[#f44336]",
    "[&>div>span]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:origin-center",
    "[&>div]:before:[transform:rotateY(0)]",
    "[&>span]:origin-center",
    "[&>span]:[transform:rotateY(0)]",

    // Checked State (On/Flip)
    "[&>input:checked+div]:before:left-[42px]",
    "[&>input:checked+div>span]:left-[42px]",

    "[&>input:checked+div]:before:bg-[#03a9f4]",
    "[&>input:checked+div]:before:[transform:rotateY(180deg)]",

    "[&>input:checked+div>span]:before:content-[attr(data-tg-on)]",
    "[&>input:checked+div>span]:before:left-[42px]",
    "[&>input:checked+div>span]:before:pl-[5px]",

    // Background & Rotation
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
    "[&>input:checked~span]:[transform:rotateY(-180deg)]",

    // Global Transitions
    "[&>div]:[transition:0.3s_ease_all]",
    "[&>div]:before:[transition:0.3s_ease_all]",
    "[&>span]:[transition:0.3s_ease_all]",
].join(" ");
// #endregion


// #region Effect 6: Full Rotation Rolling (Fixed)
export const effect6 = [
    buttonr, layer, yesKnot, noKnot,

    "overflow-visible",

    // Base Knob
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:bg-[#f44336]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-[50%]",
    "[&>div]:before:left-1",
    "[&>div]:before:top-[2px]",

    // Transitions & Initial Rotation
    "[&>span]:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>span]:[transform:rotateZ(0)]",

    "[&>div]:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:[transform:rotateZ(0)]",

    "[&>div]:before:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:before:[transform:rotateZ(0)]",

    // Checked State (Spin 180deg)
    "[&>input:checked+div]:[transform:rotateZ(-180deg)]",
    "[&>input:checked+div]:before:content-[attr(data-tg-on)]",
    "[&>input:checked+div]:before:bg-[#03a9f4]",
    "[&>input:checked+div]:before:[transform:rotateZ(180deg)]", // Counter-rotate text so it stays upright

    // Background Colors & Spin
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
    "[&>input:checked~span]:[transform:rotateZ(180deg)]",
].join(" ");
// #endregion

// #region Effect 7: Fade and scale transition
export const effect7 = [
    buttonr, layer, yesKnot, noKnot, divSpanDim,

    // Base Text Styles (Shared)
    "[&>div]:before:absolute",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-[50%]",
    "[&>div]:before:top-[2px]",

    "[&>div]:after:absolute",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:px-1",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:rounded-[50%]",
    "[&>div]:after:top-[2px]",

    // Span (Knob) Base Styles
    "[&>div>span]:absolute",
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:text-[10px]",
    "[&>div>span]:font-bold",
    "[&>div>span]:text-center",
    "[&>div>span]:leading-none",
    "[&>div>span]:px-1",
    "[&>div>span]:py-[9px]",
    "[&>div>span]:rounded-[50%]",
    "[&>div>span]:top-[2px]",

    // Content & Colors (Off State)
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:text-white",
    "[&>div]:before:opacity-100",
    "[&>div]:before:left-1",
    "[&>div]:before:[transition:0.3s_ease_all]",
    "[&>div]:before:z-[2]",

    "[&>div>span]:bg-[#f44336]",
    "[&>div>span]:[transition:0.2s_ease_all]",
    "[&>div>span]:z-[1]",
    "[&>div>span]:left-1",

    // Content & Colors (On State - Hidden initially)
    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:text-white",
    "[&>div]:after:text-left",
    "[&>div]:after:bg-[#03a9f4]",
    "[&>div]:after:opacity-0",
    "[&>div]:after:px-[7px]",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:left-[42px]",
    "[&>div]:after:[transition:0.3s_ease_all]",
    "[&>div]:after:z-[2]",

    // Checked State Logic
    "[&>input:checked+div]:before:opacity-0",
    "[&>input:checked+div]:after:opacity-100",

    // The Implosion Effect (Shrinks span to a dot)
    "[&>input:checked+div>span]:w-0.5",
    "[&>input:checked+div>span]:h-0.5",
    "[&>input:checked+div>span]:bg-white",
    "[&>input:checked+div>span]:p-[3px]",
    "[&>input:checked+div>span]:left-14",
    "[&>input:checked+div>span]:top-3.5",

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 8: Ripple scale effect
export const effect8 = [
    buttonr, layer, yesKnot, noKnot, divSpanDim,

    // Base Text Styles
    "[&>div]:before:absolute",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:[transition:0.3s_ease_all]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-[50%]",
    "[&>div]:before:top-[2px]",

    "[&>div]:after:absolute",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:[transition:0.3s_ease_all]",
    "[&>div]:after:px-1",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:rounded-[50%]",
    "[&>div]:after:top-[2px]",

    // Span (Knob) Base Styles
    "[&>div>span]:absolute",
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:text-[10px]",
    "[&>div>span]:font-bold",
    "[&>div>span]:text-center",
    "[&>div>span]:leading-none",
    "[&>div>span]:[transition:0.3s_ease_all]",
    "[&>div>span]:px-1",
    "[&>div>span]:py-[9px]",
    "[&>div>span]:rounded-[50%]",
    "[&>div>span]:top-[2px]",

    // Off State Content
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:text-white",
    "[&>div]:before:left-1",
    "[&>div]:before:z-[2]",

    // On State Content (Hidden)
    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:text-white",
    "[&>div]:after:bg-[#03a9f4]",
    "[&>div]:after:opacity-0",
    "[&>div]:after:left-[42px]",
    "[&>div]:after:z-[2]",

    // Knob Colors
    "[&>div>span]:bg-[#f44336]",
    "[&>div>span]:z-[1]",
    "[&>div>span]:left-1",

    // Checked State Logic
    "[&>input:checked+div]:before:opacity-0",
    "[&>input:checked+div]:after:opacity-100",

    // The Ripple Effect (Scale Up)
    "[&>input+div>span]:bg-[#f44336]",
    "[&>input:checked+div>span]:bg-[#ebfbfc]",
    "[&>input:checked+div>span]:scale-[4]",

    // --- FIX ADDED BELOW ---
    // This forces the background track to be pinkish when OFF, 
    // overriding the default blue from 'layer'
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 9: Bounce slide animation
export const effect9 = [
    buttonr, layer, yesKnot, noKnot, divSpanDim,

    // Base Text (Off - Before)
    "[&>div]:before:absolute",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-[50%]",
    "[&>div]:before:top-[2px]",
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:left-1",
    "[&>div]:before:text-white",
    "[&>div]:before:z-[2]",

    // Base Text (On - After)
    "[&>div]:after:absolute",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:after:px-1",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:rounded-[50%]",
    "[&>div]:after:top-[2px]",
    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:-right-6", // Positioned off-screen right
    "[&>div]:after:text-white",
    "[&>div]:after:z-[2]",

    // Moving Knob (Span)
    "[&>div>span]:absolute",
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:text-[10px]",
    "[&>div>span]:font-bold",
    "[&>div>span]:text-center",
    "[&>div>span]:leading-none",
    "[&>div>span]:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div>span]:px-1",
    "[&>div>span]:py-[9px]",
    "[&>div>span]:rounded-[50%]",
    "[&>div>span]:top-[2px]",
    "[&>div>span]:bg-[#f44336]",
    "[&>div>span]:z-[1]",
    "[&>div>span]:left-1",

    // Checked State (Slide Animations)
    "[&>input:checked+div]:before:-left-6", // Slide Off text out left
    "[&>input:checked+div]:after:right-1", // Slide On text in

    "[&>input:checked+div>span]:bg-[#03a9f4]",
    "[&>input:checked+div>span]:left-[42px]", // Slide knob right

    // Background Colors
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 10: Square knob with text display
export const effect10 = [
    button_, layer, yesKnot,

    // Base Styles (Shared)
    "[&>div]:before:absolute",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:[transition:0.3s_ease_all]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-sm",
    "[&>div]:before:top-[2px]",

    "[&>div]:after:absolute",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:[transition:0.3s_ease_all]",
    "[&>div]:after:px-1",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:rounded-sm",
    "[&>div]:after:top-[4px]", // Note: Original had 4px here vs 2px elsewhere

    // Span (Wrapper for Text)
    "[&>div>span]:absolute",
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:text-[10px]",
    "[&>div>span]:font-bold",
    "[&>div>span]:text-center",
    "[&>div>span]:leading-none",
    "[&>div>span]:[transition:0.3s_ease_all]",
    "[&>div>span]:px-1",
    "[&>div>span]:py-[9px]",
    "[&>div>span]:rounded-sm",
    "[&>div>span]:top-[2px]",

    // Initial State (Off)
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:bg-[#f44336]",
    "[&>div]:before:left-1",
    "[&>div]:before:text-white",
    "[&>div]:before:z-[10]", // High z-index to sit on top

    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:text-[#4e4e4e]",
    "[&>div]:after:right-1",

    "[&>div>span]:inline-block",
    "[&>div>span]:text-white",
    "[&>div>span]:z-[1]",
    "[&>div>span]:left-1",
    "[&>div>span]:before:content-[attr(data-tg-off)]",

    // Checked State (On)
    "[&>input:checked+div>span]:text-[#4e4e4e]", // Text turns gray

    "[&>input:checked+div]:before:bg-[#03a9f4]",
    "[&>input:checked+div]:before:left-[42px]",
    "[&>input:checked+div]:before:content-[attr(data-tg-on)]",

    "[&>input:checked+div>span]:before:relative",
    "[&>input:checked+div]:after:text-white",

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 11: 3D perspective flip
export const effect11 = [
    button_, layer,

    // 3D Container Settings
    "overflow-visible",
    "[&>div]:[perspective:70px]",

    // Base Styles for Labels
    "[&>div]:before:absolute",
    "[&>div]:before:rounded-sm",
    "[&>div]:before:top-[2px]",
    "[&>div]:before:text-[#4e4e4e]",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:left-1",

    "[&>div]:after:absolute",
    "[&>div]:after:rounded-sm",
    "[&>div]:after:top-[2px]",
    "[&>div]:after:text-[#4e4e4e]",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:px-1",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:right-1",

    // The Flipping Panel (Span)
    "[&>div>span]:absolute",
    "[&>div>span]:rounded-sm",
    "[&>div>span]:top-[2px]",
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:bg-[#f44336]", // Red initially
    "[&>div>span]:origin-[0%_50%]", // Hinges on the left edge
    "[&>div>span]:[transition:0.6s_ease_all]",
    "[&>div>span]:z-[1]",
    "[&>div>span]:right-1", // Starts on the right side
    "[&>div>span]:[transform:rotateY(0)]",

    // Checked State (Flip)
    "[&>input:checked+div>span]:bg-[#03a9f4]", // Turns Blue
    "[&>input:checked+div>span]:[transform:rotateY(-180deg)]", // Flips over

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 12: Multi-layer slide animation
export const effect12 = [
    button_, layer,

    // Base Styles for Static Labels (Gray Text)
    "[&>div]:before:absolute",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:[transition:0.3s_ease_all]",
    "[&>div]:before:rounded-sm",
    "[&>div]:before:top-[2px]",
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:left-1",
    "[&>div]:before:w-[27px]",
    "[&>div]:before:text-[#4e4e4e]",
    "[&>div]:before:z-[1]",
    "[&>div]:before:px-[3px]",
    "[&>div]:before:py-[9px]",

    "[&>div]:after:absolute",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:[transition:0.3s_ease_all]",
    "[&>div]:after:rounded-sm",
    "[&>div]:after:top-[2px]",
    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:right-1",
    "[&>div]:after:w-[27px]",
    "[&>div]:after:text-[#4e4e4e]",
    "[&>div]:after:z-[1]",
    "[&>div]:after:px-[3px]",
    "[&>div]:after:py-[9px]",

    // The Sliding Container (Span)
    "[&>div>span]:absolute",
    "[&>div>span]:text-[10px]",
    "[&>div>span]:font-bold",
    "[&>div>span]:text-center",
    "[&>div>span]:leading-none",
    "[&>div>span]:[transition:0.3s_ease_all]",
    "[&>div>span]:rounded-sm",
    "[&>div>span]:top-[2px]",
    "[&>div>span]:inline-block",
    "[&>div>span]:z-[2]",
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:px-1",
    "[&>div>span]:py-[9px]",

    // The Sliding Panels (Pseudo-elements of Span)
    "[&>div>span]:before:absolute",
    "[&>div>span]:before:text-[10px]",
    "[&>div>span]:before:font-bold",
    "[&>div>span]:before:text-center",
    "[&>div>span]:before:leading-none",
    "[&>div>span]:before:[transition:0.3s_ease_all]",
    "[&>div>span]:before:rounded-sm",
    "[&>div>span]:before:content-['']",
    "[&>div>span]:before:top-0",
    "[&>div>span]:before:w-[2rem]",
    "[&>div>span]:before:h-[2rem]",
    "[&>div>span]:before:px-1",
    "[&>div>span]:before:py-[9px]",
    "[&>div>span]:before:bg-[#03a9f4]", // Blue Panel
    "[&>div>span]:before:-left-7", // Hidden Left initially

    "[&>div>span]:after:absolute",
    "[&>div>span]:after:text-[10px]",
    "[&>div>span]:after:font-bold",
    "[&>div>span]:after:text-center",
    "[&>div>span]:after:leading-none",
    "[&>div>span]:after:[transition:0.3s_ease_all]",
    "[&>div>span]:after:rounded-sm",
    "[&>div>span]:after:content-['']",
    "[&>div>span]:after:top-0",
    "[&>div>span]:after:w-[2rem]",
    "[&>div>span]:after:h-[2rem]",
    "[&>div>span]:after:px-1",
    "[&>div>span]:after:py-[9px]",
    "[&>div>span]:after:bg-[#f44336]", // Red Panel
    "[&>div>span]:after:right-[-42px]", // Why -42px? It positions it over the active area

    // Checked State Animations
    "[&>input:checked+div>span]:before:left-1", // Blue Slides In
    "[&>input:checked+div>span]:before:w-[2rem]",
    "[&>input:checked+div>span]:after:right-[-74px]", // Red Slides Out

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 13: Reverse slide direction
export const effect13 = [
    button_, layer,

    // Base Styles for Static Labels (Gray Text)
    "[&>div]:before:absolute",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:[transition:0.3s_ease_all]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-sm",
    "[&>div]:before:top-[2px]",

    "[&>div]:after:absolute",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:[transition:0.3s_ease_all]",
    "[&>div]:after:px-1",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:rounded-sm",
    "[&>div]:after:top-[2px]",

    // The Sliding Knob (Span)
    "[&>div>span]:absolute",
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:text-[10px]",
    "[&>div>span]:font-bold",
    "[&>div>span]:text-center",
    "[&>div>span]:leading-none",
    "[&>div>span]:[transition:0.3s_ease_all]",
    "[&>div>span]:px-1",
    "[&>div>span]:py-[9px]",
    "[&>div>span]:rounded-sm",
    "[&>div>span]:top-[2px]",

    // Label Positioning & Colors
    "[&>div]:before:text-[#4e4e4e]",
    "[&>div]:before:z-[1]",
    "[&>div]:after:text-[#4e4e4e]",
    "[&>div]:after:z-[1]",

    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:left-1",

    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:right-1",

    // Knob Initial State (Red, Right Side)
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:bg-[#f44336]",
    "[&>div>span]:z-[2]",
    "[&>div>span]:left-[37px]",

    // Checked State (Blue, Left Side)
    "[&>input:checked+div>span]:bg-[#03a9f4]",
    "[&>input:checked+div>span]:left-1",

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 14: Vertical bounce transition
export const effect14 = [
    button_, layer,

    // Base Styles for Static Labels
    "[&>div]:before:absolute",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:[transition:0.3s_ease_all]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-sm",
    "[&>div]:before:top-[2px]",

    "[&>div]:after:absolute",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:[transition:0.3s_ease_all]",
    "[&>div]:after:px-1",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:rounded-sm",
    "[&>div]:after:top-[2px]",

    // Pseudo-elements Setup (The Knobs)
    "[&>div>span]:before:absolute",
    "[&>div>span]:before:w-[2rem]",
    "[&>div>span]:before:h-[2rem]",
    "[&>div>span]:before:text-[10px]",
    "[&>div>span]:before:font-bold",
    "[&>div>span]:before:text-center",
    "[&>div>span]:before:leading-none",
    "[&>div>span]:before:[transition:0.3s_ease_all]",
    "[&>div>span]:before:px-1",
    "[&>div>span]:before:py-[9px]",
    "[&>div>span]:before:rounded-sm",

    "[&>div>span]:after:absolute",
    "[&>div>span]:after:w-[2rem]",
    "[&>div>span]:after:h-[2rem]",
    "[&>div>span]:after:text-[10px]",
    "[&>div>span]:after:font-bold",
    "[&>div>span]:after:text-center",
    "[&>div>span]:after:leading-none",
    "[&>div>span]:after:[transition:0.3s_ease_all]",
    "[&>div>span]:after:px-1",
    "[&>div>span]:after:py-[9px]",
    "[&>div>span]:after:rounded-sm",
    "[&>div>span]:after:top-[2px]",

    // Label Content & Position
    "[&>div]:before:text-[#4e4e4e]",
    "[&>div]:before:z-[1]",
    "[&>div]:after:text-[#4e4e4e]",
    "[&>div]:after:z-[1]",
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:left-1",
    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:right-1",

    // Container for Knobs
    "[&>div>span]:block",
    "[&>div>span]:w-full",
    "[&>div>span]:h-full",
    "[&>div>span]:left-0",
    "[&>div>span]:top-0",

    // Blue Knob (Hidden Above)
    "[&>div>span]:before:bg-[#03a9f4]",
    "[&>div>span]:before:left-1",
    "[&>div>span]:before:-top-7", // Hidden
    "[&>div>span]:before:content-['']",
    "[&>div>span]:before:w-[2rem]",
    "[&>div>span]:before:z-[2]",

    // Red Knob (Visible Right)
    "[&>div>span]:after:bg-[#f44336]",
    "[&>div>span]:after:left-[39px]",
    "[&>div>span]:after:top-[2px]",
    "[&>div>span]:after:content-['']",
    "[&>div>span]:after:w-[2rem]",
    "[&>div>span]:after:z-[2]",

    // Initial State override
    "[&>div>span]:before:-top-8",

    // Checked State Animations
    "[&>input:checked+div>span]:before:top-[2px]", // Blue drops in
    "[&>input:checked+div>span]:after:-top-8", // Red flies up

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 15: Zoom fade effect
export const effect15 = [
    button_, layer, yesKnot, noKnot,

    // Base Styles (Shared)
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:opacity-100",
    "[&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-sm",
    "[&>div]:before:scale-100",
    "[&>div]:before:top-[2px]",

    "[&>div]:after:absolute",
    "[&>div]:after:text-white",
    "[&>div]:after:text-[10px]",
    "[&>div]:after:font-bold",
    "[&>div]:after:text-center",
    "[&>div]:after:leading-none",
    "[&>div]:after:opacity-0",
    "[&>div]:after:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all]",
    "[&>div]:after:px-1",
    "[&>div]:after:py-[9px]",
    "[&>div]:after:rounded-sm",
    "[&>div]:after:scale-100",
    "[&>div]:after:top-[2px]",

    // Off State (Red)
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:bg-[#f44336]",
    "[&>div]:before:left-1",

    // On State (Blue - Initially Hidden & Big)
    "[&>div]:after:content-[attr(data-tg-on)]",
    "[&>div]:after:opacity-0",
    "[&>div]:after:bg-[#03a9f4]",
    "[&>div]:after:scale-[4]",
    "[&>div]:after:right-1",

    // Checked Animations
    "[&>input:checked+div]:before:opacity-0",
    "[&>input:checked+div]:before:scale-[4]", // Red explodes

    "[&>input:checked+div]:after:opacity-100",
    "[&>input:checked+div]:after:scale-100", // Blue implodes

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 16: Elastic active stretch
export const effect16 = [
    button_, layer, yesKnot,

    // Base Knob Styles (Off)
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:bg-[#f44336]",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:rounded-sm", // Square corners
    "[&>div]:before:left-1",
    "[&>div]:before:top-[2px]",

    // Elastic Transition
    "[&>div]:before:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]",

    // Active State (Stretch)
    "[&>input:active+div]:before:w-[46px]",

    // Checked State (On)
    "[&>input:checked:active+div]:before:ml-[-26px]", // Pull back when stretching on right side
    "[&>input:checked+div]:before:content-[attr(data-tg-on)]",
    "[&>input:checked+div]:before:bg-[#03a9f4]",
    "[&>input:checked+div]:before:left-[42px]",

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 17: Dual-element slide sync
export const effect17 = [
    button_, layer, yesKnot,

    // Text Label (Before) - Moves Slower (0.5s)
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:px-1",
    "[&>div]:before:py-[9px]",
    "[&>div]:before:left-1",
    "[&>div]:before:top-[2px]",
    "[&>div]:before:z-[2]",
    "[&>div]:before:[transition:0.3s_ease_all,left_0.5s_cubic-bezier(0.18,0.89,0.35,1.15)]", // Slower transition

    // Colored Box (Span) - Moves Faster (0.3s)
    "[&>div>span]:content-[attr(data-tg-off)]", // Note: The span doesn't actually show content usually, it's just the box
    "[&>div>span]:absolute",
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:text-white",
    "[&>div>span]:text-[10px]",
    "[&>div>span]:font-bold",
    "[&>div>span]:text-center",
    "[&>div>span]:leading-none",
    "[&>div>span]:px-1",
    "[&>div>span]:py-[9px]",
    "[&>div>span]:left-1",
    "[&>div>span]:top-[2px]",
    "[&>div>span]:bg-[#f44336]",
    "[&>div>span]:z-[1]",
    "[&>div>span]:rounded-sm",
    "[&>div>span]:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]", // Faster transition

    // Checked State (On)
    "[&>input:checked+div]:before:content-[attr(data-tg-on)]",
    "[&>input:checked+div]:before:left-[42px]",

    "[&>input:checked+div>span]:bg-[#03a9f4]",
    "[&>input:checked+div>span]:left-[42px]",

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion


// #region Effect 18: Interactive drag stretch
export const effect18 = [
    button_, layer,

    // Text Label (Before)
    "[&>div]:before:content-[attr(data-tg-off)]",
    "[&>div]:before:absolute",
    "[&>div]:before:text-white",
    "[&>div]:before:text-[10px]",
    "[&>div]:before:font-bold",
    "[&>div]:before:text-center",
    "[&>div]:before:leading-none",
    "[&>div]:before:rounded-sm",
    "[&>div]:before:mt-[-5px]",
    "[&>div]:before:bg-transparent",
    "[&>div]:before:z-[2]",
    "[&>div]:before:left-2",
    "[&>div]:before:top-[45%]",

    // Colored Box (Span)
    "[&>div>span]:content-[attr(data-tg-off)]", // Ignored by span usually
    "[&>div>span]:absolute",
    "[&>div>span]:text-white",
    "[&>div>span]:text-[10px]",
    "[&>div>span]:font-bold",
    "[&>div>span]:text-center",
    "[&>div>span]:leading-none",
    "[&>div>span]:bg-[#f44336]",
    "[&>div>span]:rounded-sm",
    "[&>div>span]:left-1",
    "[&>div>span]:top-[2px]", // Added top to fix vertical alignment
    "[&>div>span]:w-[2rem]",
    "[&>div>span]:h-[2rem]",
    "[&>div>span]:z-[1]",
    "[&>div>span]:px-1",
    "[&>div>span]:py-[9px]",
    "[&>div>span]:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]",

    // Active State (Pressing Down) - Turns into a thin line
    "[&>input:active+div]:before:w-[46px]",
    "[&>input:active+div]:before:h-1",
    "[&>input:active+div]:before:text-transparent", // Hide text
    "[&>input:active+div]:before:bg-[#d80000]", // Darker red line
    "[&>input:active+div]:before:[transition:0.3s_ease_all]",
    "[&>input:active+div]:before:overflow-hidden",
    "[&>input:active+div]:before:-mt-0.5",
    "[&>input:active+div]:before:left-2.5",

    "[&>input:active+div>span]:w-[68px]", // Stretch background

    // Active + Checked State (Pressing Down while On)
    "[&>input:checked:active+div]:before:bg-[#0095d8]", // Darker blue line
    "[&>input:checked:active+div]:before:left-auto",
    "[&>input:checked:active+div]:before:right-2.5",

    "[&>input:checked:active+div>span]:ml-[-38px]", // Pull back left

    // Checked State (On - Release)
    "[&>input:checked+div]:before:content-[attr(data-tg-on)]",
    "[&>input:checked+div]:before:left-[47px]",

    "[&>input:checked+div>span]:bg-[#03a9f4]",
    "[&>input:checked+div>span]:left-[42px]",

    // Backgrounds
    "[&>input~span]:bg-[#fcebeb]",
    "[&>input:checked~span]:bg-[#ebfbfc]",
].join(" ");
// #endregion

// #endregion

//https://codepen.io/alvarotrigo/pen/RwjEZeJ

/**
 * Alternative Switch Styles
 *
 * Light: Simple light-themed toggle
 * iOS: iOS-style toggle with shadow
 * Skewed: Diagonal skewed toggle
 * Flat: Flat design toggle
 */
// #region Alternative Switch Styles


// #region Light
export const light = [
    "mx-[2em]",
    "my-0",
    iinput,

    // Label container
    "[&>label]:[transition:all_0.4s_ease]",
    "[&>label]:p-0.5",
    "[&>label]:rounded-[2em]",
    "[&>label]:bg-[#f0f0f0]",

    // The Knob (After)
    "[&>label]:after:[transition:all_0.2s_ease]",
    "[&>label]:after:rounded-[50%]",
    "[&>label]:after:bg-[#fff]",

    // Checked State
    "[&>input:checked~label]:bg-[#9fd6ae]",

    ilabel
].join(" ");
// #endregion


// #region IOS
export const ios = [
    "mx-[2em]",
    "my-0",
    iinput,

    // Base Label Container
    "[&>label]:[transition:all_0.4s_ease]",
    "[&>label]:border",
    "[&>label]:p-0.5",
    "[&>label]:rounded-[2em]",
    "[&>label]:border-solid",
    "[&>label]:border-[#e8eae9]",

    // Knob Styles & Shadows
    "[&>label]:after:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_0_rgba(0,0,0,0.08)]",
    "[&>label]:after:rounded-[2em]",
    "[&>label]:after:bg-[#fbfbfb]",
    "[&>label]:after:[transition:left_0.3s_cubic-bezier(0.175,0.885,0.32,1.275),padding_0.3s_ease,margin_0.3s_ease]",

    // Hover & Active States (The Squeeze Effect)
    "[&>label]:hover:after:will-change-[padding]",
    "[&>label]:active:shadow-[inset_0_0_0_2em_#e8eae9]",
    "[&>label]:active:after:pr-[0.8em]",

    // Checked State
    "[&>input:checked~label]:bg-[#86d993]",
    "[&>input:checked~label]:active:shadow-none",
    "[&>input:checked~label]:active:after:ml-[-0.8em]", // Pull knob back when active on right side

    ilabel
].join(" ");
// #endregion


// #region Skewed
export const skewed = [
    "mx-[2em]", "my-0",

    // Input Reset (Manual setup since iinput isn't used)
    "[&>input]:hidden",
    "[&>input]:box-border",
    "[&>input]:after:box-border",
    "[&>input]:before:box-border",
    "[&>input]:[&_*]:box-border",
    "[&>input]:[&_*]:after:box-border",
    "[&>input]:[&_*]:before:box-border",
    "[&>input]:[&>label]:box-border",

    // Label Base Dimensions
    "[&>label]:block",
    "[&>label]:w-[4em]",
    "[&>label]:h-[2em]",
    "[&>label]:relative",
    "[&>label]:cursor-pointer",
    "[&>label]:select-none",
    "[&>label]:[outline:0]",

    // Pseudo Element sizing
    "[&>label]:after:h-full",
    "[&>label]:before:h-full",

    // Container Styling & Skew
    "[&>label]:overflow-hidden",
    "[&>label]:skew-x-[-10deg]",
    "[&>label]:[transition:all_0.2s_ease]",
    "[&>label]:[backface-visibility:hidden]",
    "[&>label]:font-sans",
    "[&>label]:bg-[#888]",
    "[&>label]:active:bg-[#888]",

    // BEFORE: The "ON" State (Hidden Left initially)
    "[&>label]:before:content-[attr(data-tg-on)]",
    "[&>label]:before:left-0",
    "[&>label]:before:skew-x-[10deg]", // Counter-skew text
    "[&>label]:before:inline-block",
    "[&>label]:before:[transition:all_0.2s_ease]",
    "[&>label]:before:w-full",
    "[&>label]:before:text-center",
    "[&>label]:before:absolute",
    "[&>label]:before:leading-[2em]",
    "[&>label]:before:font-bold",
    "[&>label]:before:text-white",
    "[&>label]:before:text-shadow:[0_1px_0_rgba(0,0,0,0.4)]",

    // AFTER: The "OFF" State (Visible initially)
    "[&>label]:after:left-full", // Pushed out to right
    "[&>label]:after:skew-x-[10deg]",
    "[&>label]:after:inline-block",
    "[&>label]:after:[transition:all_0.2s_ease]",
    "[&>label]:after:w-full",
    "[&>label]:after:text-center",
    "[&>label]:after:absolute",
    "[&>label]:after:leading-[2em]",
    "[&>label]:after:font-bold",
    "[&>label]:after:text-white",
    "[&>label]:after:text-shadow:[0_1px_0_rgba(0,0,0,0.4)]",

    // Active State (Pressing down)
    "[&>label]:active:before:left-[-10%]",

    // Checked State Logic
    "[&>input:checked~label]:bg-[#86d993]",

    // Slide animations
    "[&>input:checked~label]:before:left-full", // Slide ON text out right
    "[&>input:checked~label]:after:content-[attr(data-tg-off)]",
    "[&>input:checked~label]:after:left-0", // Slide OFF text in

    "[&>input:checked~label]:active:after:left-[10%]",
].join(" ");
// #endregion


// #region Flat
export const flat = [
    "mx-[2em]",
    "my-0",
    iinput,

    // Label Container
    "[&>label]:[transition:all_0.2s_ease]",
    "[&>label]:p-0.5",
    "[&>label]:rounded-[2em]",
    "[&>label]:border-4",
    "[&>label]:border-solid",
    "[&>label]:border-[#f2f2f2]",

    // The Knob
    "[&>label]:after:[transition:all_0.2s_ease]",
    "[&>label]:after:content-['']",
    "[&>label]:after:rounded-[1em]",
    "[&>label]:after:bg-[#f2f2f2]", // Knob color matches border
    "[&>label]:bg-[#fff]", // Inner track white

    // Checked State
    "[&>input:checked~label]:border-4",
    "[&>input:checked~label]:border-solid",
    "[&>input:checked~label]:border-[#7fc6a6]", // Green border
    "[&>input:checked~label]:after:left-2/4",
    "[&>input:checked~label]:after:bg-[#7fc6a6]", // Green knob

    ilabel,

    // Text Size Adjustments
    "[&>input:checked~label]:after:text-[80%]",
    "[&>label]:after:text-[80%]",
].join(" ");
// #endregion


// #region Flip
export const flip = [
    "mx-[2em]", "my-0",

    // Input Reset
    "[&>input]:hidden",
    "[&>input]:box-border",
    "[&>input]:after:box-border",
    "[&>input]:before:box-border",
    "[&>input]:[&_*]:box-border",
    "[&>input]:[&_*]:after:box-border",
    "[&>input]:[&_*]:before:box-border",
    "[&>input]:[&>label]:box-border",

    // Label Base
    "[&>label]:block",
    "[&>label]:w-[4em]",
    "[&>label]:h-[2em]",
    "[&>label]:relative",
    "[&>label]:cursor-pointer",
    "[&>label]:select-none",
    "[&>label]:[outline:0]",
    "[&>label]:[transition:all_0.2s_ease]",
    "[&>label]:p-0.5",
    "[&>label]:font-sans",
    "[&>label]:[perspective:100px]",

    // FRONT SIDE (Before - Red/Off)
    "[&>label]:before:h-full",
    "[&>label]:before:content-[attr(data-tg-on)]",
    "[&>label]:before:inline-block",
    "[&>label]:before:[transition:all_0.4s_ease]",
    "[&>label]:before:w-full",
    "[&>label]:before:text-center",
    "[&>label]:before:leading-[2em]",
    "[&>label]:before:font-bold",
    "[&>label]:before:text-white",
    "[&>label]:before:absolute",
    "[&>label]:before:rounded",
    "[&>label]:before:left-0",
    "[&>label]:before:top-0",
    "[&>label]:before:[backface-visibility:hidden]",
    "[&>label]:before:bg-[#ff3a19]",

    // BACK SIDE (After - Green/On)
    "[&>label]:after:h-full",
    "[&>label]:after:content-[attr(data-tg-off)]",
    "[&>label]:after:inline-block",
    "[&>label]:after:[transition:all_0.4s_ease]",
    "[&>label]:after:w-full",
    "[&>label]:after:text-center",
    "[&>label]:after:leading-[2em]",
    "[&>label]:after:font-bold",
    "[&>label]:after:text-white",
    "[&>label]:after:absolute",
    "[&>label]:after:rounded",
    "[&>label]:after:left-0",
    "[&>label]:after:top-0",
    "[&>label]:after:[backface-visibility:hidden]",
    "[&>label]:after:bg-[#02c66f]",
    "[&>label]:after:[transform:rotateY(-180deg)]", // Hidden initially

    // Active State (Tilt effect)
    "[&>label]:active:before:[transform:rotateY(-20deg)]",

    // Checked State (Flip 180deg)
    "[&>input:checked~label]:before:[transform:rotateY(180deg)]", // Hide front

    "[&>input:checked~label]:after:left-0",
    "[&>input:checked~label]:after:[transform:rotateY(0)]", // Show back
    "[&>input:checked~label]:after:bg-[#7fc6a6]",

    // Checked + Active Tilt
    "[&>input:checked~label]:active:after:[transform:rotateY(20deg)]",
].join(" ");
// #endregion

// #endregion
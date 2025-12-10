//https://codepen.io/maheshambure21/pen/EozKKy

/* necessary to give position: relative to parent. */
//input[type='text']
const inputText = "text-[#333] w-full box-border tracking-[1px]";

// #region Underline Effects 1-3
const underline = "focus:[outline:none] border-0 px-0 py-[7px] border-b border-solid border-b-[#ccc] w-full"

export const effect1 = [
    underline,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:bottom-0",
    "[&~span]:left-0",
    "[&~span]:w-0",
    "[&~span]:h-0.5",
    "[&~span]:bg-[#4caf50]",
    "[&~span]:duration-[0.4s]",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:w-full",
    "[&:focus~span]:duration-[0.4s]",

].join(' ')


export const effect2 = [
    underline,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:bottom-0",
    "[&~span]:left-2/4",
    "[&~span]:w-0",
    "[&~span]:h-0.5",
    "[&~span]:bg-[#4caf50]",
    "[&~span]:duration-[0.4s]",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:w-full",
    "[&:focus~span]:duration-[0.4s]",
    "[&:focus~span]:left-0",

].join(' ')

export const effect3 = [
    underline,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:bottom-0",
    "[&~span]:left-0",
    "[&~span]:w-full",
    "[&~span]:h-0.5",
    "[&~span]:z-[99]",

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:bottom-0",
    "[&~span]:before:left-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-full",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.4s]",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:bottom-0",
    "[&~span]:after:left-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-full",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.4s]",

    /* ---------- span ::after ---------- */
    "[&~span]:after:left-auto",
    "[&~span]:after:right-0",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:before:w-1/2",
    "[&:focus~span]:before:duration-[0.4s]",

    "[&:focus~span]:after:w-1/2",
    "[&:focus~span]:after:duration-[0.4s]",
].join(' ')

// #endregion


// #region Box Effects 4-6
const box =
    "focus:[outline:none] pt-[5px] px-0 pb-[7px] border-0 border-b border-b-solid border-transparent border-b-[#ccc] duration-[0.4s] w-full h-full";
const focusBox =
    "focus:w-full focus:pt-[5px] focus:px-3.5 focus:pb-[7px] focus:duration-[0.4s]";

export const effect4 = [
    box,
    focusBox,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:w-full",
    "[&~span]:h-0",
    "[&~span]:bottom-0",
    "[&~span]:left-0",
    "[&~span]:duration-[0.4s]",
    "[&~span]:z-[-1]",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:duration-[0.4s]",
    "[&:focus~span]:h-full",
    "[&:focus~span]:border-2",
    "[&:focus~span]:border-solid",
    "[&:focus~span]:border-[#4caf50]",
    "[&:focus~span]:z-[1]",
].join(" ")

export const effect5 = [
    box,
    focusBox,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:h-full",
    "[&~span]:bottom-0",
    "[&~span]:left-0",
    "[&~span]:w-0",
    "[&~span]:duration-[0.4s]",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:w-full",
    "[&:focus~span]:duration-[0.4s]",
    "[&:focus~span]:border-2",
    "[&:focus~span]:border-solid",
    "[&:focus~span]:border-[#4caf50]",
].join(' ')

export const effect6 = [
    box,
    focusBox,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:h-full",
    "[&~span]:bottom-0",
    "[&~span]:right-0",
    "[&~span]:w-0",
    "[&~span]:duration-[0.4s]",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:w-full",
    "[&:focus~span]:duration-[0.4s]",
    "[&:focus~span]:border-2",
    "[&:focus~span]:border-solid",
    "[&:focus~span]:border-[#4caf50]",
].join(' ')
// #endregion


// #region Outline Effects 7-9
const outline =
    "focus:[outline:none] border border-solid border-[#ccc] px-3.5 py-2 duration-[0.4s] w-full";


export const effect7 = [
    outline,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:top-0",
    "[&~span]:before:left-2/4",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0.5",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.4s]",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:top-0",
    "[&~span]:after:left-2/4",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0.5",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.4s]",
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",

    /* ---------- span > i (side borders) ---------- */
    "[&~span_i]:before:content-['']",
    "[&~span_i]:before:absolute",
    "[&~span_i]:before:top-2/4",
    "[&~span_i]:before:left-0",
    "[&~span_i]:before:w-0.5",
    "[&~span_i]:before:h-0",
    "[&~span_i]:before:bg-[#4caf50]",
    "[&~span_i]:before:duration-[0.6s]",

    "[&~span_i]:after:content-['']",
    "[&~span_i]:after:absolute",
    "[&~span_i]:after:top-2/4",
    "[&~span_i]:after:left-0",
    "[&~span_i]:after:w-0.5",
    "[&~span_i]:after:h-0",
    "[&~span_i]:after:bg-[#4caf50]",
    "[&~span_i]:after:duration-[0.6s]",
    "[&~span_i]:after:left-auto",
    "[&~span_i]:after:right-0",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:before:left-0",
    "[&:focus~span]:before:w-full",
    "[&:focus~span]:before:duration-[0.4s]",

    "[&:focus~span]:after:left-0",
    "[&:focus~span]:after:w-full",
    "[&:focus~span]:after:duration-[0.4s]",

    /* ---------- span i (focus) ---------- */
    "[&:focus~span_i]:before:top-0",
    "[&:focus~span_i]:before:h-full",
    "[&:focus~span_i]:before:duration-[0.6s]",

    "[&:focus~span_i]:after:top-0",
    "[&:focus~span_i]:after:h-full",
    "[&:focus~span_i]:after:duration-[0.6s]",
].join(" ")


export const effect8 = [
    outline,

    /*----------.focus-border::before/::after(base)----------*/
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:top-0",
    "[&~span]:before:left-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0.5",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.3s]",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:top-0",
    "[&~span]:after:left-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0.5",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.3s]",

    /*----------.focus-border ::after ----------*/
    "[&~span]:after:left-auto",
    "[&~span]:after:right-0",
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",



    /* ---------- .focus-border_i ::before / ::after (base) ---------- */
    "[&~span_i]:before:content-['']",
    "[&~span_i]:before:absolute",
    "[&~span_i]:before:w-0.5",
    "[&~span_i]:before:h-0",
    "[&~span_i]:before:bg-[#4caf50]",
    "[&~span_i]:before:duration-[0.4s]",

    "[&~span_i]:after:content-['']",
    "[&~span_i]:after:absolute",
    "[&~span_i]:after:w-0.5",
    "[&~span_i]:after:h-0",
    "[&~span_i]:after:bg-[#4caf50]",
    "[&~span_i]:after:duration-[0.4s]",

    /*---------- span i ::before ----------*/
    "[&~span_i]:before:top-0",
    "[&~span_i]:before:left-0",

    /*---------- span i ::after ----------*/
    "[&~span_i]:after:left-auto",
    "[&~span_i]:after:right-0",
    "[&~span_i]:after:top-auto",
    "[&~span_i]:after:bottom-0",


    /*----------.focus-border(focus)----------*/
    "[&:focus~span]:before:w-full",
    "[&:focus~span]:before:duration-[0.3s]",

    "[&:focus~span]:after:w-full",
    "[&:focus~span]:after:duration-[0.3s]",

    /*----------.focus-border_i(focus)----------*/
    "[&:focus~span_i]:before:h-full",
    "[&:focus~span_i]:before:duration-[0.4s]",

    "[&:focus~span_i]:after:h-full",
    "[&:focus~span_i]:after:duration-[0.4s]",
].join(" ")

export const effect9 = [
    outline,

    /* ---------- .focus-border ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0.5",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.2s]",
    "[&~span]:before:delay-[0.2s]",
    "[&~span]:before:right-0",
    "[&~span]:before:top-0",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0.5",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.2s]",
    "[&~span]:after:right-0",
    "[&~span]:after:top-0",
    "[&~span]:after:delay-[0.6s]",
    "[&~span]:after:left-0",
    "[&~span]:after:right-auto",
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",

    /*----------span_i::before/::after(base)----------*/
    "[&~span_i]:before:content-['']",
    "[&~span_i]:before:absolute",
    "[&~span_i]:before:w-0.5",
    "[&~span_i]:before:h-0",
    "[&~span_i]:before:bg-[#4caf50]",
    "[&~span_i]:before:duration-[0.2s]",
    "[&~span_i]:before:left-0",
    "[&~span_i]:before:top-0",
    "[&~span_i]:before:delay-[0.8s]",

    "[&~span_i]:after:content-['']",
    "[&~span_i]:after:absolute",
    "[&~span_i]:after:w-0.5",
    "[&~span_i]:after:h-0",
    "[&~span_i]:after:bg-[#4caf50]",
    "[&~span_i]:after:duration-[0.2s]",
    "[&~span_i]:after:top-0",
    "[&~span_i]:after:delay-[0.4s]",
    "[&~span_i]:after:left-auto",
    "[&~span_i]:after:right-0",
    "[&~span_i]:after:top-auto",
    "[&~span_i]:after:bottom-0",

    /*----------span(focus)----------*/
    "[&:focus~span]:before:w-full",
    "[&:focus~span]:before:duration-[0.2s]",
    "[&:focus~span]:before:delay-[0.6s]",

    "[&:focus~span]:after:w-full",
    "[&:focus~span]:after:duration-[0.2s]",
    "[&:focus~span]:after:delay-[0.2s]",

    /*----------span_i(focus)----------*/
    "[&:focus~span_i]:before:h-full",
    "[&:focus~span_i]:before:duration-[0.2s]",
    "[&:focus~span_i]:before:delay-0",

    "[&:focus~span_i]:after:h-full",
    "[&:focus~span_i]:after:duration-[0.2s]",
].join(" ")


export const effect7__ = `${outline}
[&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.4s] [&~span]:before:left-2/4 [&~span]:before:top-0
[&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.4s] [&~span]:after:left-2/4 [&~span]:after:top-0
[&~span]:after:top-auto [&~span]:after:bottom-0
[&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.6s] [&~span_i]:before:left-0 [&~span_i]:before:top-2/4
[&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.6s]  [&~span_i]:after:top-2/4
[&~span_i]:after:left-auto [&~span_i]:after:right-0
[&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.4s] [&:focus~span]:before:left-0
[&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.4s] [&:focus~span]:after:left-0
[&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.6s] [&:focus~span_i]:before:top-0
[&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.6s] [&:focus~span_i]:after:top-0
`
// #endregion


// #region Fill Effects 10-15
const fill =
    "focus:[outline:none] border border-solid border-[#ccc] px-[15px] py-[7px] bg-transparent relative w-full z-10";

export const effect10 = [
    fill,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:left-0",
    "[&~span]:top-0",
    "[&~span]:w-full",
    "[&~span]:h-full",
    "[&~span]:bg-[#ededed]",
    "[&~span]:opacity-0",
    "[&~span]:duration-[0.5s]",
    "[&~span]:z-0",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:opacity-100",
    "[&:focus~span]:duration-[0.5s]",
].join(" ")

export const effect11 = [
    fill,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:left-0",
    "[&~span]:top-0",
    "[&~span]:w-0",
    "[&~span]:h-full",
    "[&~span]:bg-[#ededed]",
    "[&~span]:duration-[0.3s]",
    "[&~span]:z-0",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:duration-[0.3s]",
    "[&:focus~span]:w-full",
].join(' ')

export const effect12 = [
    fill,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:left-2/4",
    "[&~span]:top-0",
    "[&~span]:w-0",
    "[&~span]:h-full",
    "[&~span]:bg-[#ededed]",
    "[&~span]:duration-[0.3s]",
    "[&~span]:z-0",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:duration-[0.3s]",
    "[&:focus~span]:w-full",
    "[&:focus~span]:left-0",
].join(' ')

export const effect13 = [
    fill,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:left-0",
    "[&~span]:before:top-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-full",
    "[&~span]:before:bg-[#ededed]",
    "[&~span]:before:duration-[0.3s]",
    "[&~span]:before:z-0",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:left-0",
    "[&~span]:after:top-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-full",
    "[&~span]:after:bg-[#ededed]",
    "[&~span]:after:duration-[0.3s]",
    "[&~span]:after:z-0",

    "[&~span]:after:left-auto",
    "[&~span]:after:right-0",


    /* ---------- span (focus) ---------- */
    "[&:focus~span]:before:duration-[0.3s]",
    "[&:focus~span]:before:w-1/2",

    "[&:focus~span]:after:duration-[0.3s]",
    "[&:focus~span]:after:w-1/2",

].join(' ')

export const effect14 = [
    fill,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:left-0",
    "[&~span]:before:top-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0",
    "[&~span]:before:bg-[#ededed]",
    "[&~span]:before:duration-[0.3s]",
    "[&~span]:before:z-0",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:left-0",
    "[&~span]:after:top-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0",
    "[&~span]:after:bg-[#ededed]",
    "[&~span]:after:duration-[0.3s]",
    "[&~span]:after:z-0",

    "[&~span]:after:left-auto",
    "[&~span]:after:right-0",
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",


    /* ---------- span (focus) ---------- */
    "[&:focus~span]:before:duration-[0.3s]",
    "[&:focus~span]:before:w-[calc(50%+1px)]",
    "[&:focus~span]:before:h-full",

    "[&:focus~span]:after:duration-[0.3s]",
    "[&:focus~span]:after:w-[calc(50%+1px)]",
    "[&:focus~span]:after:h-full",
].join(' ')

export const effect15 = [
    fill,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:left-2/4",
    "[&~span]:before:top-2/4",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0",
    "[&~span]:before:bg-[#ededed]",
    "[&~span]:before:duration-[0.3s]",
    "[&~span]:before:z-0",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:left-2/4",
    "[&~span]:after:top-2/4",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0",
    "[&~span]:after:bg-[#ededed]",
    "[&~span]:after:duration-[0.3s]",
    "[&~span]:after:z-0",

    "[&~span]:after:left-auto",
    "[&~span]:after:right-2/4",
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-2/4",

    /* ---------- span (focus) ---------- */
    "[&:focus~span]:before:duration-[0.3s]",
    "[&:focus~span]:before:w-1/2",
    "[&:focus~span]:before:left-0",
    "[&:focus~span]:before:top-0",
    "[&:focus~span]:before:h-full",

    "[&:focus~span]:after:duration-[0.3s]",
    "[&:focus~span]:after:w-1/2",
    "[&:focus~span]:after:h-full",
    "[&:focus~span]:after:bottom-0",
    "[&:focus~span]:after:right-0",

].join(' ')

// #endregion


// #region Labeled Underline Effects 16-18
const underlineWithLabel = "focus:[outline:none] border-0 px-0 py-2 border-b border-solid border-[#ccc] bg-transparent z-10 w-full";
const underlineLabel = [
    /* ---------- label (base) ---------- */
    "[&~label]:absolute",
    "[&~label]:left-0",
    "[&~label]:w-full",
    "[&~label]:top-[9px]",
    "[&~label]:text-[#aaa]",
    "[&~label]:duration-[0.3s]",
    "[&~label]:z-0",
    "[&~label]:tracking-[0.5px]",

    /* ---------- label (focus) ---------- */
    "[&:focus~label]:text-xs",
    "[&:focus~label]:-top-4",
    "[&:focus~label]:text-[12px]",
    "[&:focus~label]:text-[#4caf50]",
    "[&:focus~label]:duration-[0.3s]",

    /* ---------- label (has-content) ---------- */
    "[&:not(:placeholder-shown)~label]:text-xs",
    "[&:not(:placeholder-shown)~label]:-top-4",
    "[&:not(:placeholder-shown)~label]:text-[12px]",
    "[&:not(:placeholder-shown)~label]:text-[#4caf50]",
    "[&:not(:placeholder-shown)~label]:duration-[0.3s]",
].join(" ");

export const effect16 = [
    underlineWithLabel,
    underlineLabel,
    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:bottom-0",
    "[&~span]:left-0",
    "[&~span]:w-0",
    "[&~span]:h-0.5",
    "[&~span]:bg-[#4caf50]",
    "[&~span]:duration-[0.4s]",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:w-full",
    "[&:focus~span]:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span]:w-full",
    "[&:not(:placeholder-shown)~span]:duration-[0.4s]",


].join(' ')

export const effect17 = [
    underlineWithLabel, underlineLabel,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:bottom-0",
    "[&~span]:left-2/4",
    "[&~span]:w-0",
    "[&~span]:h-0.5",
    "[&~span]:bg-[#4caf50]",
    "[&~span]:duration-[0.4s]",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:w-full",
    "[&:focus~span]:left-0",
    "[&:focus~span]:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span]:w-full",
    "[&:not(:placeholder-shown)~span]:left-0",
    "[&:not(:placeholder-shown)~span]:duration-[0.4s]",

].join(" ")

export const effect18 = [
    underlineWithLabel, underlineLabel,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:bottom-0",
    "[&~span]:left-0",
    "[&~span]:w-full",
    "[&~span]:h-0.5",
    "[&~span]:z-99",

    /* ---------- span ::before (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:bottom-0",
    "[&~span]:before:left-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-full",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.4s]",

    /* ---------- span ::after (base) ---------- */
    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:bottom-0",
    "[&~span]:after:left-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-full",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.4s]",
    "[&~span]:after:left-auto",
    "[&~span]:after:right-0",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:before:w-1/2",
    "[&:focus~span]:before:duration-[0.4s]",

    "[&:focus~span]:after:w-1/2",
    "[&:focus~span]:after:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span]:before:w-1/2",
    "[&:not(:placeholder-shown)~span]:before:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span]:after:w-1/2",
    "[&:not(:placeholder-shown)~span]:after:duration-[0.4s]",
].join(" ")

// #endregion


// #region Labeled Box Effects 19-21
const boxWithLabel = "focus:[outline:none] border border-solid border-[#ccc] px-3.5 py-2 duration-[0.4s] bg-transparent z-10 w-full";

const boxLabel = [
    /* ---------- label (base) ---------- */
    "[&~label]:absolute",
    "[&~label]:left-3.5",
    "[&~label]:w-full",
    "[&~label]:top-2.5",
    "[&~label]:text-[#aaa]",
    "[&~label]:duration-[0.3s]",
    "[&~label]:z-0",
    "[&~label]:tracking-[0.5px]",

    /* ---------- label (focus + has-content) ---------- */
    "[&:focus~label]:text-xs",
    "[&:focus~label]:top-[-18px]",
    "[&:focus~label]:left-0",
    "[&:focus~label]:text-[#4caf50]",
    "[&:focus~label]:duration-[0.3s]",

    "[&:not(:placeholder-shown)~label]:text-xs",
    "[&:not(:placeholder-shown)~label]:top-[-18px]",
    "[&:not(:placeholder-shown)~label]:left-0",
    "[&:not(:placeholder-shown)~label]:text-[#4caf50]",
    "[&:not(:placeholder-shown)~label]:duration-[0.3s]",
].join(" ")


export const effect19 = [
    boxWithLabel,
    boxLabel,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:-top-px",
    "[&~span]:before:left-2/4",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0.5",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.4s]",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:-top-px",
    "[&~span]:after:left-2/4",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0.5",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.4s]",

    /* ---------- span ::after ---------- */
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",

    /* ---------- span > i ::before / ::after (base) ---------- */
    "[&~span_i]:before:content-['']",
    "[&~span_i]:before:absolute",
    "[&~span_i]:before:top-2/4",
    "[&~span_i]:before:left-0",
    "[&~span_i]:before:w-0.5",
    "[&~span_i]:before:h-0",
    "[&~span_i]:before:bg-[#4caf50]",
    "[&~span_i]:before:duration-[0.6s]",

    "[&~span_i]:after:content-['']",
    "[&~span_i]:after:absolute",
    "[&~span_i]:after:top-2/4",
    "[&~span_i]:after:left-0",
    "[&~span_i]:after:w-0.5",
    "[&~span_i]:after:h-0",
    "[&~span_i]:after:bg-[#4caf50]",
    "[&~span_i]:after:duration-[0.6s]",

    /* ---------- span i ::after ---------- */
    "[&~span_i]:after:left-auto",
    "[&~span_i]:after:right-0",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:before:left-0",
    "[&:focus~span]:before:w-full",
    "[&:focus~span]:before:duration-[0.4s]",

    "[&:focus~span]:after:left-0",
    "[&:focus~span]:after:w-full",
    "[&:focus~span]:after:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span]:before:left-0",
    "[&:not(:placeholder-shown)~span]:before:w-full",
    "[&:not(:placeholder-shown)~span]:before:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span]:after:left-0",
    "[&:not(:placeholder-shown)~span]:after:w-full",
    "[&:not(:placeholder-shown)~span]:after:duration-[0.4s]",


    /* ---------- span > i (focus + has-content) ---------- */
    "[&:focus~span_i]:before:-top-px",
    "[&:focus~span_i]:before:h-full",
    "[&:focus~span_i]:before:duration-[0.6s]",

    "[&:focus~span_i]:after:-top-px",
    "[&:focus~span_i]:after:h-full",
    "[&:focus~span_i]:after:duration-[0.6s]",

    "[&:not(:placeholder-shown)~span_i]:before:-top-px",
    "[&:not(:placeholder-shown)~span_i]:before:h-full",
    "[&:not(:placeholder-shown)~span_i]:before:duration-[0.6s]",

    "[&:not(:placeholder-shown)~span_i]:after:-top-px",
    "[&:not(:placeholder-shown)~span_i]:after:h-full",
    "[&:not(:placeholder-shown)~span_i]:after:duration-[0.6s]",


].join(' ')

export const effect20 = [
    boxWithLabel,

    boxLabel,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:top-0",
    "[&~span]:before:left-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0.5",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.3s]",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:top-0",
    "[&~span]:after:left-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0.5",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.3s]",


    /* ---------- span ::after ---------- */
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",
    "[&~span]:after:left-auto",
    "[&~span]:after:right-0",

    /* ---------- span > i ::before / ::after (base) ---------- */
    "[&~span_i]:before:content-['']",
    "[&~span_i]:before:absolute",
    "[&~span_i]:before:top-0",
    "[&~span_i]:before:left-0",
    "[&~span_i]:before:w-0.5",
    "[&~span_i]:before:h-0",
    "[&~span_i]:before:bg-[#4caf50]",
    "[&~span_i]:before:duration-[0.4s]",

    "[&~span_i]:after:content-['']",
    "[&~span_i]:after:absolute",
    "[&~span_i]:after:top-0",
    "[&~span_i]:after:left-0",
    "[&~span_i]:after:w-0.5",
    "[&~span_i]:after:h-0",
    "[&~span_i]:after:bg-[#4caf50]",
    "[&~span_i]:after:duration-[0.4s]",

    /* ---------- span > i ::after ---------- */
    "[&~span_i]:after:left-auto",
    "[&~span_i]:after:right-0",
    "[&~span_i]:after:top-auto",
    "[&~span_i]:after:bottom-0",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:before:w-full",
    "[&:focus~span]:before:duration-[0.3s]",

    "[&:focus~span]:after:w-full",
    "[&:focus~span]:after:duration-[0.3s]",

    "[&:not(:placeholder-shown)~span]:before:w-full",
    "[&:not(:placeholder-shown)~span]:before:duration-[0.3s]",

    "[&:not(:placeholder-shown)~span]:after:w-full",
    "[&:not(:placeholder-shown)~span]:after:duration-[0.3s]",

    /* ---------- span > i (focus + has-content) ---------- */
    "[&:focus~span_i]:before:h-full",
    "[&:focus~span_i]:before:duration-[0.4s]",

    "[&:focus~span_i]:after:h-full",
    "[&:focus~span_i]:after:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span_i]:before:h-full",
    "[&:not(:placeholder-shown)~span_i]:before:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span_i]:after:h-full",
    "[&:not(:placeholder-shown)~span_i]:after:duration-[0.4s]",

].join(" ")

export const effect21 = [

    boxWithLabel,

    boxLabel,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:top-0",
    "[&~span]:before:right-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0.5",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.2s]",
    "[&~span]:before:delay-[0.2s]",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:top-0",
    "[&~span]:after:right-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0.5",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.2s]",
    "[&~span]:after:delay-[0.2s]",

    /* ---------- span ::after ---------- */
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",
    "[&~span]:after:right-auto",
    "[&~span]:after:left-0",
    "[&~span]:after:delay-[0.6s]",


    /* ---------- span > i ::before / ::after (base) ---------- */
    "[&~span_i]:before:content-['']",
    "[&~span_i]:before:absolute",
    "[&~span_i]:before:top-0",
    "[&~span_i]:before:left-0",
    "[&~span_i]:before:w-0.5",
    "[&~span_i]:before:h-0",
    "[&~span_i]:before:bg-[#4caf50]",
    "[&~span_i]:before:duration-[0.2s]",

    "[&~span_i]:after:content-['']",
    "[&~span_i]:after:absolute",
    "[&~span_i]:after:top-0",
    "[&~span_i]:after:left-0",
    "[&~span_i]:after:w-0.5",
    "[&~span_i]:after:h-0",
    "[&~span_i]:after:bg-[#4caf50]",
    "[&~span_i]:after:duration-[0.2s]",

    /* ---------- span ::after ---------- */
    "[&~span_i]:after:left-auto",
    "[&~span_i]:after:right-0",
    "[&~span_i]:after:top-auto",
    "[&~span_i]:after:bottom-0",
    "[&~span_i]:after:delay-[0.4s]",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:before:w-full",
    "[&:focus~span]:before:duration-[0.2s]",
    "[&:focus~span]:before:delay-[0.6s]",

    "[&:focus~span]:after:w-full",
    "[&:focus~span]:after:duration-[0.2s]",
    "[&:focus~span]:after:delay-[0.6s]",

    "[&:not(:placeholder-shown)~span]:before:w-full",
    "[&:not(:placeholder-shown)~span]:before:duration-[0.2s]",
    "[&:not(:placeholder-shown)~span]:before:delay-[0.6s]",

    "[&:not(:placeholder-shown)~span]:after:w-full",
    "[&:not(:placeholder-shown)~span]:after:duration-[0.2s]",
    "[&:not(:placeholder-shown)~span]:after:delay-[0.6s]",

    /* extra delay tweak for ::after */
    "[&:focus~span]:after:delay-[0.2s]",
    "[&:not(:placeholder-shown)~span]:after:delay-[0.2s]",

    /* ---------- span > i (focus + has-content) ---------- */
    "[&:focus~span_i]:before:h-full",
    "[&:focus~span_i]:before:duration-[0.2s]",

    "[&:focus~span_i]:after:h-full",
    "[&:focus~span_i]:after:duration-[0.2s]",

    "[&:not(:placeholder-shown)~span_i]:before:h-full",
    "[&:not(:placeholder-shown)~span_i]:before:duration-[0.2s]",

    "[&:not(:placeholder-shown)~span_i]:after:h-full",
    "[&:not(:placeholder-shown)~span_i]:after:duration-[0.2s]",
].join(" ")

// #endregion


// #region Labeled Fill Effects 22-24

const fillWithLabel = "focus:[outline:none] px-3.5 py-2 border border-solid border-[#ccc] relative bg-transparent z-10 w-full"

const fillLabel = [

    /* ---------- label (base) ---------- */
    "[&~label]:absolute",
    "[&~label]:left-3.5",
    "[&~label]:w-full",
    "[&~label]:top-2.5",
    "[&~label]:text-[#aaa]",
    "[&~label]:duration-[0.3s]",
    "[&~label]:z-0",
    "[&~label]:tracking-[0.5px]",


    /* ---------- label (focus + has-content) ---------- */
    "[&:focus~label]:text-xs",
    "[&:focus~label]:top-[-18px]",
    "[&:focus~label]:left-0",
    "[&:focus~label]:text-[#333]",
    "[&:focus~label]:duration-[0.3s]",

    "[&:not(:placeholder-shown)~label]:text-xs",
    "[&:not(:placeholder-shown)~label]:top-[-18px]",
    "[&:not(:placeholder-shown)~label]:left-0",
    "[&:not(:placeholder-shown)~label]:text-[#333]",
    "[&:not(:placeholder-shown)~label]:duration-[0.3s]",
].join(" ")

export const effect22 = [
    fillWithLabel, fillLabel,

    /* ---------- span (base) ---------- */
    "[&~span]:absolute",
    "[&~span]:left-0",
    "[&~span]:top-0",
    "[&~span]:w-0",
    "[&~span]:h-full",
    "[&~span]:bg-transparent",
    "[&~span]:duration-[0.4s]",
    "[&~span]:z-0",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:duration-[0.4s]",
    "[&:focus~span]:w-full",
    "[&:focus~span]:bg-[#ededed]",

    "[&:not(:placeholder-shown)~span]:duration-[0.4s]",
    "[&:not(:placeholder-shown)~span]:w-full",
    "[&:not(:placeholder-shown)~span]:bg-[#ededed]",


].join(' ')

export const effect23 = [
    fillWithLabel, fillLabel,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:left-0",
    "[&~span]:before:top-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0",
    "[&~span]:before:bg-[#ededed]",
    "[&~span]:before:duration-[0.3s]",
    "[&~span]:before:z-0",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:left-0",
    "[&~span]:after:top-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0",
    "[&~span]:after:bg-[#ededed]",
    "[&~span]:after:duration-[0.3s]",
    "[&~span]:after:z-0",

    "[&~span]:after:left-auto",
    "[&~span]:after:right-0",
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",


    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:before:duration-[0.3s]",
    "[&:focus~span]:before:w-[calc(50%+1px)]",
    "[&:focus~span]:before:h-full",


    "[&:not(:placeholder-shown)~span]:before:duration-[0.3s]",
    "[&:not(:placeholder-shown)~span]:before:w-[calc(50%+1px)]",
    "[&:not(:placeholder-shown)~span]:before:h-full",


    "[&:focus~span]:after:duration-[0.3s]",
    "[&:focus~span]:after:w-[calc(50%+1px)]",
    "[&:focus~span]:after:h-full",


    "[&:not(:placeholder-shown)~span]:after:duration-[0.3s]",
    "[&:not(:placeholder-shown)~span]:after:w-[calc(50%+1px)]",
    "[&:not(:placeholder-shown)~span]:after:h-full",


].join(' ')

export const effect24 = [
    fillWithLabel, fillLabel,


    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:left-2/4",
    "[&~span]:before:top-2/4",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0",
    "[&~span]:before:bg-[#ededed]",
    "[&~span]:before:duration-[0.3s]",
    "[&~span]:before:z-0",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:left-2/4",
    "[&~span]:after:top-2/4",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0",
    "[&~span]:after:bg-[#ededed]",
    "[&~span]:after:duration-[0.3s]",
    "[&~span]:after:z-0",


    "[&~span]:after:left-auto",
    "[&~span]:after:right-2/4",
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-2/4",


    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:before:duration-[0.3s]",
    "[&:focus~span]:before:w-1/2",
    "[&:focus~span]:before:left-0",
    "[&:focus~span]:before:top-0",
    "[&:focus~span]:before:h-full",

    "[&:not(:placeholder-shown)~span]:before:duration-[0.3s]",
    "[&:not(:placeholder-shown)~span]:before:w-1/2",
    "[&:not(:placeholder-shown)~span]:before:left-0",
    "[&:not(:placeholder-shown)~span]:before:top-0",
    "[&:not(:placeholder-shown)~span]:before:h-full",


    "[&:focus~span]:after:duration-[0.3s]",
    "[&:focus~span]:after:w-1/2",
    "[&:focus~span]:after:h-full",
    "[&:focus~span]:after:bottom-0",
    "[&:focus~span]:after:right-0",


    "[&:not(:placeholder-shown)~span]:after:duration-[0.3s]",
    "[&:not(:placeholder-shown)~span]:after:w-1/2",
    "[&:not(:placeholder-shown)~span]:after:h-full",
    "[&:not(:placeholder-shown)~span]:after:bottom-0",
    "[&:not(:placeholder-shown)~span]:after:right-0",


].join(' ')
// #endregion


// #region Alternative Labeled Box Effects 19a-21a

const hLabel = `[&:focus~label]: top - [-12px][&:focus~label]: text - xs[&:focus~label]: text - [#4caf50][&:focus~label]: duration - [0.3s][&:focus~label]: left - [7px][&:focus~label]: bg - [white][&:focus~label]: w - fit[&:focus~label]: z - 10[&:focus~label]: p - [2px]`
const hpLabel = `[&: not(: placeholder - shown)~label]: top - [-12px][&: not(: placeholder - shown)~label]: text - xs[&: not(: placeholder - shown)~label]: text - [#4caf50][&: not(: placeholder - shown)~label]: duration - [0.3s][&: not(: placeholder - shown)~label]: left - [7px][&: not(: placeholder - shown)~label]: bg - [white][&: not(: placeholder - shown)~label]: w - fit[&: not(: placeholder - shown)~label]: z - 10[&: not(: placeholder - shown)~label]: p - [2px]`


// base label position before it “chips”
const chipLabelBase = [
    /* ---------- label (base) ---------- */
    "[&~label]:absolute",
    "[&~label]:w-full",
    "[&~label]:text-[#aaa]",
    "[&~label]:duration-[0.3s]",
    "[&~label]:z-0",
    "[&~label]:tracking-[0.5px]",
    "[&~label]:left-3.5",
    "[&~label]:top-2.5",

    /* ---------- label (focus + has-content) ---------- */
    "[&:focus~label]:top-[-12px]",
    "[&:focus~label]:text-xs",
    "[&:focus~label]:text-[#4caf50]",
    "[&:focus~label]:duration-[0.3s]",
    "[&:focus~label]:left-[7px]",
    "[&:focus~label]:bg-[white]",
    "[&:focus~label]:w-fit",
    "[&:focus~label]:z-10",
    "[&:focus~label]:py-1",
    "[&:focus~label]:px-1",

    "[&:not(:placeholder-shown)~label]:top-[-12px]",
    "[&:not(:placeholder-shown)~label]:text-xs",
    "[&:not(:placeholder-shown)~label]:text-[#4caf50]",
    "[&:not(:placeholder-shown)~label]:duration-[0.3s]",
    "[&:not(:placeholder-shown)~label]:left-[7px]",
    "[&:not(:placeholder-shown)~label]:bg-[white]",
    "[&:not(:placeholder-shown)~label]:w-fit",
    "[&:not(:placeholder-shown)~label]:z-10",
    "[&:not(:placeholder-shown)~label]:py-1",
    "[&:not(:placeholder-shown)~label]:px-1",
].join(" ");


export const effect19a = [
    boxWithLabel,
    chipLabelBase,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:-top-px",
    "[&~span]:before:left-2/4",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0.5",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.4s]",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:-top-px",
    "[&~span]:after:left-2/4",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0.5",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.4s]",

    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",

    /* ---------- span > i ::before / ::after (base) ---------- */
    "[&~span_i]:before:content-['']",
    "[&~span_i]:before:absolute",
    "[&~span_i]:before:top-2/4",
    "[&~span_i]:before:left-0",
    "[&~span_i]:before:w-0.5",
    "[&~span_i]:before:h-0",
    "[&~span_i]:before:bg-[#4caf50]",
    "[&~span_i]:before:duration-[0.6s]",

    "[&~span_i]:after:content-['']",
    "[&~span_i]:after:absolute",
    "[&~span_i]:after:top-2/4",
    "[&~span_i]:after:left-0",
    "[&~span_i]:after:w-0.5",
    "[&~span_i]:after:h-0",
    "[&~span_i]:after:bg-[#4caf50]",
    "[&~span_i]:after:duration-[0.6s]",

    "[&~span_i]:after:left-auto",
    "[&~span_i]:after:right-0",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:before:left-0",
    "[&:focus~span]:before:w-full",
    "[&:focus~span]:before:duration-[0.4s]",

    "[&:focus~span]:after:left-0",
    "[&:focus~span]:after:w-full",
    "[&:focus~span]:after:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span]:before:left-0",
    "[&:not(:placeholder-shown)~span]:before:w-full",
    "[&:not(:placeholder-shown)~span]:before:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span]:after:left-0",
    "[&:not(:placeholder-shown)~span]:after:w-full",
    "[&:not(:placeholder-shown)~span]:after:duration-[0.4s]",


    /* ---------- span > i (focus + has-content) ---------- */
    "[&:focus~span_i]:before:-top-px",
    "[&:focus~span_i]:before:h-full",
    "[&:focus~span_i]:before:duration-[0.6s]",

    "[&:focus~span_i]:after:-top-px",
    "[&:focus~span_i]:after:h-full",
    "[&:focus~span_i]:after:duration-[0.6s]",

    "[&:not(:placeholder-shown)~span_i]:before:-top-px",
    "[&:not(:placeholder-shown)~span_i]:before:h-full",
    "[&:not(:placeholder-shown)~span_i]:before:duration-[0.6s]",

    "[&:not(:placeholder-shown)~span_i]:after:-top-px",
    "[&:not(:placeholder-shown)~span_i]:after:h-full",
    "[&:not(:placeholder-shown)~span_i]:after:duration-[0.6s]",


].join(' ')

export const effect20a = [
    boxWithLabel,

    chipLabelBase,


    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:top-0",
    "[&~span]:before:left-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0.5",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.3s]",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:top-0",
    "[&~span]:after:left-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0.5",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.3s]",
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",
    "[&~span]:after:left-auto",
    "[&~span]:after:right-0",

    /* ---------- span > i ::before / ::after (base) ---------- */
    "[&~span_i]:before:content-['']",
    "[&~span_i]:before:absolute",
    "[&~span_i]:before:top-0",
    "[&~span_i]:before:left-0",
    "[&~span_i]:before:w-0.5",
    "[&~span_i]:before:h-0",
    "[&~span_i]:before:bg-[#4caf50]",
    "[&~span_i]:before:duration-[0.4s]",

    "[&~span_i]:after:content-['']",
    "[&~span_i]:after:absolute",
    "[&~span_i]:after:top-0",
    "[&~span_i]:after:left-0",
    "[&~span_i]:after:w-0.5",
    "[&~span_i]:after:h-0",
    "[&~span_i]:after:bg-[#4caf50]",
    "[&~span_i]:after:duration-[0.4s]",
    "[&~span_i]:after:left-auto",
    "[&~span_i]:after:right-0",
    "[&~span_i]:after:top-auto",
    "[&~span_i]:after:bottom-0",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:before:w-full",
    "[&:focus~span]:before:duration-[0.3s]",
    "[&:focus~span]:after:w-full",
    "[&:focus~span]:after:duration-[0.3s]",

    "[&:not(:placeholder-shown)~span]:before:w-full",
    "[&:not(:placeholder-shown)~span]:before:duration-[0.3s]",
    "[&:not(:placeholder-shown)~span]:after:w-full",
    "[&:not(:placeholder-shown)~span]:after:duration-[0.3s]",

    /* ---------- span > i (focus + has-content) ---------- */
    "[&:focus~span_i]:before:h-full",
    "[&:focus~span_i]:before:duration-[0.4s]",
    "[&:focus~span_i]:after:h-full",
    "[&:focus~span_i]:after:duration-[0.4s]",

    "[&:not(:placeholder-shown)~span_i]:before:h-full",
    "[&:not(:placeholder-shown)~span_i]:before:duration-[0.4s]",
    "[&:not(:placeholder-shown)~span_i]:after:h-full",
    "[&:not(:placeholder-shown)~span_i]:after:duration-[0.4s]",

].join(" ")

export const effect21a = [

    boxWithLabel,

    chipLabelBase,

    /* ---------- span ::before / ::after (base) ---------- */
    "[&~span]:before:content-['']",
    "[&~span]:before:absolute",
    "[&~span]:before:top-0",
    "[&~span]:before:right-0",
    "[&~span]:before:w-0",
    "[&~span]:before:h-0.5",
    "[&~span]:before:bg-[#4caf50]",
    "[&~span]:before:duration-[0.2s]",
    "[&~span]:before:delay-[0.2s]",

    "[&~span]:after:content-['']",
    "[&~span]:after:absolute",
    "[&~span]:after:top-0",
    "[&~span]:after:right-0",
    "[&~span]:after:w-0",
    "[&~span]:after:h-0.5",
    "[&~span]:after:bg-[#4caf50]",
    "[&~span]:after:duration-[0.2s]",
    "[&~span]:after:delay-[0.2s]",
    "[&~span]:after:top-auto",
    "[&~span]:after:bottom-0",
    "[&~span]:after:right-auto",
    "[&~span]:after:left-0",
    "[&~span]:after:delay-[0.6s]",

    /* ---------- span > i ::before / ::after (base) ---------- */
    "[&~span_i]:before:content-['']",
    "[&~span_i]:before:absolute",
    "[&~span_i]:before:top-0",
    "[&~span_i]:before:left-0",
    "[&~span_i]:before:w-0.5",
    "[&~span_i]:before:h-0",
    "[&~span_i]:before:bg-[#4caf50]",
    "[&~span_i]:before:duration-[0.2s]",

    "[&~span_i]:after:content-['']",
    "[&~span_i]:after:absolute",
    "[&~span_i]:after:top-0",
    "[&~span_i]:after:left-0",
    "[&~span_i]:after:w-0.5",
    "[&~span_i]:after:h-0",
    "[&~span_i]:after:bg-[#4caf50]",
    "[&~span_i]:after:duration-[0.2s]",
    "[&~span_i]:after:left-auto",
    "[&~span_i]:after:right-0",
    "[&~span_i]:after:top-auto",
    "[&~span_i]:after:bottom-0",
    "[&~span_i]:after:delay-[0.4s]",

    /* ---------- span (focus + has-content) ---------- */
    "[&:focus~span]:before:w-full",
    "[&:focus~span]:before:duration-[0.2s]",
    "[&:focus~span]:before:delay-[0.6s]",

    "[&:focus~span]:after:w-full",
    "[&:focus~span]:after:duration-[0.2s]",
    "[&:focus~span]:after:delay-[0.6s]",

    "[&:not(:placeholder-shown)~span]:before:w-full",
    "[&:not(:placeholder-shown)~span]:before:duration-[0.2s]",
    "[&:not(:placeholder-shown)~span]:before:delay-[0.6s]",

    "[&:not(:placeholder-shown)~span]:after:w-full",
    "[&:not(:placeholder-shown)~span]:after:duration-[0.2s]",
    "[&:not(:placeholder-shown)~span]:after:delay-[0.6s]",

    /* extra delay tweak for ::after */
    "[&:focus~span]:after:delay-[0.2s]",
    "[&:not(:placeholder-shown)~span]:after:delay-[0.2s]",

    /* ---------- span > i (focus + has-content) ---------- */
    "[&:focus~span_i]:before:h-full",
    "[&:focus~span_i]:before:duration-[0.2s]",
    "[&:focus~span_i]:after:h-full",
    "[&:focus~span_i]:after:duration-[0.2s]",

    "[&:not(:placeholder-shown)~span_i]:before:h-full",
    "[&:not(:placeholder-shown)~span_i]:before:duration-[0.2s]",
    "[&:not(:placeholder-shown)~span_i]:after:h-full",
    "[&:not(:placeholder-shown)~span_i]:after:duration-[0.2s]",
].join(" ")

// #endregion
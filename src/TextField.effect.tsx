//https://codepen.io/maheshambure21/pen/EozKKy

/* necessary to give position: relative to parent. */
//input[type='text']
const inputText = "text-[#333] w-full box-border tracking-[1px]";

// #region Underline Effects 1-3
const underlineOnly = `focus:[outline:none] px-0 py-[7px] border-b-[#ccc] border-0 border-b border-solid w-full`;

export const effect1 = [
    `${underlineOnly}`,

    // span
    `[&~span]:absolute 
     [&~span]:w-0 
     [&~span]:h-0.5 
     [&~span]:bg-[#4caf50] 
     [&~span]:duration-[0.4s] 
     [&~span]:left-0 
     [&~span]:bottom-0`,

    // span: focus
    `[&:focus~span]:w-full 
     [&:focus~span]:duration-[0.4s]`,
].join(' ').trim();

export const effect2 = [
    `${underlineOnly}`,
    // span
    `[&~span]:absolute 
     [&~span]:w-0 
     [&~span]:h-0.5 
     [&~span]:bg-[#4caf50] 
     [&~span]:duration-[0.4s] 
     [&~span]:left-2/4 
     [&~span]:bottom-0`,

    // span: focus
    `[&:focus~span]:w-full 
     [&:focus~span]:duration-[0.4s] 
     [&:focus~span]:left-0`,
].join(' ').trim();

export const effect3 = [
    `${underlineOnly}`,
    // span
    `[&~span]:absolute 
     [&~span]:w-full 
     [&~span]:h-0.5 
     [&~span]:z-[99] 
     [&~span]:left-0 
     [&~span]:bottom-0`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute
     [&~span]:before:w-0
     [&~span]:before:h-full
     [&~span]:before:bg-[#4caf50]
     [&~span]:before:duration-[0.4s]
     [&~span]:before:left-0
     [&~span]:before:bottom-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-full 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.4s] 
     [&~span]:after:left-0 
     [&~span]:after:bottom-0 
     [&~span]:after:left-auto 
     [&~span]:after:right-0`,

    // span: focus
    `[&:focus~span]:before:w-1/2 
     [&:focus~span]:before:duration-[0.4s] 
     [&:focus~span]:after:w-1/2 
     [&:focus~span]:after:duration-[0.4s]`,
].join(' ').trim();
// #endregion


// #region Box Effects 4-6
//
const box = `focus:[outline:none] duration-[0.4s] pt-[5px] pb-[7px] px-0 border-b-[#ccc] border-b-solid border-b-2 w-full`;
export const effect4 = [
    `${box}`,
    // focus  pt-[5px] pb-[7px] 
    `focus:duration-[0.4s]
     focus:pt-[5px]
     focus:pb-[7px]
     focus:px-3.5`,

    // span
    `[&~span]:absolute 
     [&~span]:h-0 
     [&~span]:w-full 
     [&~span]:duration-[0.4s] 
     [&~span]:z-[-1] 
     [&~span]:left-0 
     [&~span]:bottom-0`,

    // span: focus
    `[&:focus~span]:duration-[0.4s] 
     [&:focus~span]:h-9 
     [&:focus~span]:z-[1] 
     [&:focus~span]:border-2 
     [&:focus~span]:border-solid 
     [&:focus~span]:border-[#4caf50]`,
].join(' ').trim();

export const effect5 = [
    `${box}`,
    // focus
    `focus:duration-[0.4s] 
     focus:pt-[5px] 
     focus:pb-[7px] 
     focus:px-3.5`,

    // span
    `[&~span]:absolute 
     [&~span]:h-9 
     [&~span]:w-0 
     [&~span]:duration-[0.4s] 
     [&~span]:left-0 
     [&~span]:bottom-0`,

    // span: focus
    `[&:focus~span]:w-full 
     [&:focus~span]:duration-[0.4s] 
     [&:focus~span]:border-2 
     [&:focus~span]:border-solid 
     [&:focus~span]:border-[#4caf50]`,
].join(' ').trim();

export const effect6 = [
    `${box}`,
    // focus
    `focus:duration-[0.4s] 
     focus:pt-[5px] 
     focus:pb-[7px] 
     focus:px-3.5`,

    // span
    `[&~span]:absolute 
     [&~span]:h-9 
     [&~span]:w-0 
     [&~span]:duration-[0.4s] 
     [&~span]:right-0 
     [&~span]:bottom-0`,

    // span: focus
    `[&:focus~span]:w-full 
     [&:focus~span]:duration-[0.4s] 
     [&:focus~span]:border-2 
     [&:focus~span]:border-solid 
     [&:focus~span]:border-[#4caf50]`,
].join(' ').trim();
// #endregion


// #region Outline Effects 7-9
const outline7 = `focus:[outline:none] border-2 duration-[0.4s] pt-[7px] pb-[9px] px-3.5 border-solid border-[#ccc] w-full`;

export const effect7 = [
    `${outline7}`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0.5 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.4s] 
     [&~span]:before:left-2/4 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0.5 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.4s] 
     [&~span]:after:left-2/4 
     [&~span]:after:top-0 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span_i: before
    `[&~span_i]:before:content-[''] 
     [&~span_i]:before:absolute 
     [&~span_i]:before:w-0.5 
     [&~span_i]:before:h-0 
     [&~span_i]:before:bg-[#4caf50] 
     [&~span_i]:before:duration-[0.6s] 
     [&~span_i]:before:left-0 
     [&~span_i]:before:top-2/4`,

    // span_i: after
    `[&~span_i]:after:content-[''] 
     [&~span_i]:after:absolute 
     [&~span_i]:after:w-0.5 
     [&~span_i]:after:h-0 
     [&~span_i]:after:bg-[#4caf50] 
     [&~span_i]:after:duration-[0.6s] 
     [&~span_i]:after:top-2/4 
     [&~span_i]:after:left-auto 
     [&~span_i]:after:right-0`,

    // span: focus before
    `[&:focus~span]:before:w-full 
     [&:focus~span]:before:duration-[0.4s] 
     [&:focus~span]:before:left-0`,

    // span: focus after
    `[&:focus~span]:after:w-full 
     [&:focus~span]:after:duration-[0.4s] 
     [&:focus~span]:after:left-0`,

    // span_i: focus before
    `[&:focus~span_i]:before:h-full 
     [&:focus~span_i]:before:duration-[0.6s] 
     [&:focus~span_i]:before:top-0`,

    // span_i: focus after
    `[&:focus~span_i]:after:h-full 
     [&:focus~span_i]:after:duration-[0.6s] 
     [&:focus~span_i]:after:top-0`,
].join(' ').trim();

export const effect8 = [
    `${outline7}`,
    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0.5 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.3s] 
     [&~span]:before:left-0 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0.5 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.3s] 
     [&~span]:after:left-0 
     [&~span]:after:top-0 
     [&~span]:after:left-auto 
     [&~span]:after:right-0 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span_i: before
    `[&~span_i]:before:content-[''] 
     [&~span_i]:before:absolute 
     [&~span_i]:before:w-0.5 
     [&~span_i]:before:h-0 
     [&~span_i]:before:bg-[#4caf50] 
     [&~span_i]:before:duration-[0.4s] 
     [&~span_i]:before:left-0 
     [&~span_i]:before:top-0`,

    // span_i: focus after
    `[&~span_i]:after:content-[''] 
     [&~span_i]:after:absolute 
     [&~span_i]:after:w-0.5 
     [&~span_i]:after:h-0 
     [&~span_i]:after:bg-[#4caf50] 
     [&~span_i]:after:duration-[0.4s] 
     [&~span_i]:after:top-0 
     [&~span_i]:after:left-auto 
     [&~span_i]:after:right-0 
     [&~span_i]:after:top-auto 
     [&~span_i]:after:bottom-0`,

    // span: focus before
    `[&:focus~span]:before:w-full 
     [&:focus~span]:before:duration-[0.3s]`,

    // span: focus after
    `[&:focus~span]:after:w-full 
     [&:focus~span]:after:duration-[0.3s]`,

    // span_i: focus before
    `[&:focus~span_i]:before:h-full 
     [&:focus~span_i]:before:duration-[0.4s]`,

    // span_i: focus after
    `[&:focus~span_i]:after:h-full 
     [&:focus~span_i]:after:duration-[0.4s]`,
].join(' ').trim();

export const effect9 = [
    `${outline7}`,

    // span: before
    `[&~span]:before:content-[""] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0.5 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.2s] 
     [&~span]:before:delay-[0.2s] 
     [&~span]:before:right-0 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[""] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0.5 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.2s] 
     [&~span]:after:right-0 
     [&~span]:after:top-0 
     [&~span]:after:delay-[0.6s] 
     [&~span]:after:left-0 
     [&~span]:after:right-auto 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span_i: before
    `[&~span_i]:before:content-[""] 
     [&~span_i]:before:absolute 
     [&~span_i]:before:w-0.5 
     [&~span_i]:before:h-0 
     [&~span_i]:before:bg-[#4caf50] 
     [&~span_i]:before:duration-[0.2s] 
     [&~span_i]:before:left-0 
     [&~span_i]:before:top-0 
     [&~span_i]:before:delay-[0.8s]`,

    // span_i: after
    `[&~span_i]:after:content-[""] 
     [&~span_i]:after:absolute 
     [&~span_i]:after:w-0.5 
     [&~span_i]:after:h-0 
     [&~span_i]:after:bg-[#4caf50] 
     [&~span_i]:after:duration-[0.2s] 
     [&~span_i]:after:top-0 
     [&~span_i]:after:delay-[0.4s] 
     [&~span_i]:after:left-auto 
     [&~span_i]:after:right-0 
     [&~span_i]:after:top-auto 
     [&~span_i]:after:bottom-0`,

    // span: focus before
    `[&:focus~span]:before:w-full 
     [&:focus~span]:before:duration-[0.2s] 
     [&:focus~span]:before:delay-[0.6s]`,

    // span: focus after
    `[&:focus~span]:after:w-full 
     [&:focus~span]:after:duration-[0.2s] 
     [&:focus~span]:after:delay-[0.2s]`,

    // span_i: focus before
    `[&:focus~span_i]:before:h-full 
     [&:focus~span_i]:before:duration-[0.2s] 
     [&:focus~span_i]:before:delay-0`,

    // span_i: focus after
    `[&:focus~span_i]:after:h-full 
     [&:focus~span_i]:after:duration-[0.2s]`,
].join(' ').trim();
// #endregion


// #region Fill Effects 10-15
const fill10 =
    `focus:[outline:none] relative px-[15px] py-[7px] border-2 border-solid border-[#ccc] bg-transparent ` +
    `focus:border-[#4caf50] transition-colors duration-[0.7s]`;

export const effect10 = [
    `${fill10}`,

    // span
    `[&~span]:absolute 
     [&~span]:w-full 
     [&~span]:h-full 
     [&~span]:bg-[#ededed] 
     [&~span]:opacity-0 
     [&~span]:duration-[0.5s] 
     [&~span]:z-[-1] 
     [&~span]:left-0 
     [&~span]:top-0`,

    // span: focus
    `[&:focus~span]:duration-[0.5s] 
     [&:focus~span]:opacity-100`,
].join(' ').trim();

export const effect11 = [
    `${fill10}`,

    // span
    `[&~span]:absolute 
     [&~span]:w-0 
     [&~span]:h-full 
     [&~span]:bg-[#ededed] 
     [&~span]:duration-[0.3s] 
     [&~span]:z-[-1] 
     [&~span]:left-0 
     [&~span]:top-0`,

    // span: focus
    `[&:focus~span]:duration-[0.3s] 
     [&:focus~span]:w-full`,
].join(' ').trim();

export const effect12 = [
    `${fill10}`,

    // span
    `[&~span]:absolute 
     [&~span]:w-0 
     [&~span]:h-full 
     [&~span]:bg-[#ededed] 
     [&~span]:duration-[0.3s] 
     [&~span]:z-[-1] 
     [&~span]:left-2/4 
     [&~span]:top-0`,

    // span: focus
    `[&:focus~span]:duration-[0.3s] 
     [&:focus~span]:w-full 
     [&:focus~span]:left-0`,
].join(' ').trim();

export const effect13 = [
    `${fill10}`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-full 
     [&~span]:before:bg-[#ededed] 
     [&~span]:before:duration-[0.3s] 
     [&~span]:before:z-[-1] 
     [&~span]:before:left-0 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-full 
     [&~span]:after:bg-[#ededed] 
     [&~span]:after:duration-[0.3s] 
     [&~span]:after:z-[-1] 
     [&~span]:after:left-0 
     [&~span]:after:top-0 
     [&~span]:after:left-auto 
     [&~span]:after:right-0`,

    // span: focus before
    `[&:focus~span]:before:duration-[0.3s] 
     [&:focus~span]:before:w-1/2`,

    // span: focus after
    `[&:focus~span]:after:duration-[0.3s] 
     [&:focus~span]:after:w-1/2`,
].join(' ').trim();

export const effect14 = [
    `${fill10}`,
    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0 
     [&~span]:before:bg-[#ededed] 
     [&~span]:before:duration-[0.3s] 
     [&~span]:before:z-[-1] 
     [&~span]:before:left-0 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0 
     [&~span]:after:bg-[#ededed] 
     [&~span]:after:duration-[0.3s] 
     [&~span]:after:z-[-1] 
     [&~span]:after:left-0 
     [&~span]:after:top-0 
     [&~span]:after:left-auto 
     [&~span]:after:right-0 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span: focus before
    `[&:focus~span]:before:duration-[0.3s] 
     [&:focus~span]:before:w-1/2 
     [&:focus~span]:before:h-full`,

    // span: focus after
    `[&:focus~span]:after:duration-[0.3s] 
     [&:focus~span]:after:w-1/2 
     [&:focus~span]:after:h-full`,
].join(' ').trim();

export const effect15 = [
    `${fill10}`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0 
     [&~span]:before:bg-[#ededed] 
     [&~span]:before:duration-[0.3s] 
     [&~span]:before:z-[-1] 
     [&~span]:before:left-2/4 
     [&~span]:before:top-2/4`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0 
     [&~span]:after:bg-[#ededed] 
     [&~span]:after:duration-[0.3s] 
     [&~span]:after:z-[-1] 
     [&~span]:after:left-2/4 
     [&~span]:after:top-2/4 
     [&~span]:after:left-auto 
     [&~span]:after:right-2/4 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-2/4`,

    // span: focus before
    `[&:focus~span]:before:duration-[0.3s] 
     [&:focus~span]:before:w-1/2 
     [&:focus~span]:before:h-full 
     [&:focus~span]:before:left-0 
     [&:focus~span]:before:top-0`,

    // span: focus after
    `[&:focus~span]:after:duration-[0.3s] 
     [&:focus~span]:after:w-1/2 
     [&:focus~span]:after:h-full 
     [&:focus~span]:after:right-0 
     [&:focus~span]:after:bottom-0`,
].join(' ').trim();
// #endregion


// #region Labeled Underline Effects 16-18
// const underline16 = `focus:[outline:none] bg-transparent px-0 py-1 border-b-[#ccc] border-0 border-b border-solid w-full`;
const underline16 = `bg-transparent px-0 py-1 border-b border-[#ccc] outline-none text-gray-700 z-10 relative w-full `
export const effect16 = [
    `${underline16}`,
    // span
    `[&~span]:absolute 
     [&~span]:w-0 
     [&~span]:h-0.5 
     [&~span]:bg-[#4caf50] 
     [&~span]:duration-[0.4s] 
     [&~span]:left-0 
     [&~span]:bottom-0`,

    // span: focus
    `[&:focus~span]:w-full 
     [&:focus~span]:duration-[0.4s]`,

    // span: has-value
    `[&:not(:placeholder-shown)~span]:w-full 
     [&:not(:placeholder-shown)~span]:duration-[0.4s]`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0 
     [&~label]:tracking-[0.5px] 
     [&~label]:left-0 
     [&~label]:top-[9px]`,

    // label: focus
    `[&:focus~label]:text-xs 
     [&:focus~label]:text-[#4caf50] 
     [&:focus~label]:duration-[0.3s] 
     [&:focus~label]:-top-4`,

    // label: has-value
    `[&:not(:placeholder-shown)~label]:text-xs 
     [&:not(:placeholder-shown)~label]:text-[#4caf50] 
     [&:not(:placeholder-shown)~label]:duration-[0.3s] 
     [&:not(:placeholder-shown)~label]:-top-4`,
].join(' ').trim();

export const effect17 = [
    `${underline16}`,
    // span
    `[&~span]:absolute 
     [&~span]:w-0 
     [&~span]:h-0.5 
     [&~span]:bg-[#4caf50] 
     [&~span]:duration-[0.4s] 
     [&~span]:left-2/4 
     [&~span]:bottom-0`,

    // span: focus
    `[&:focus~span]:w-full 
     [&:focus~span]:duration-[0.4s] 
     [&:focus~span]:left-0`,

    // span: has-value
    `[&:not(:placeholder-shown)~span]:w-full 
     [&:not(:placeholder-shown)~span]:duration-[0.4s] 
     [&:not(:placeholder-shown)~span]:left-0`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-0 
     [&~label]:top-[9px]`,

    // label: focus
    `[&:focus~label]:text-xs 
     [&:focus~label]:text-[#4caf50] 
     [&:focus~label]:duration-[0.3s] 
     [&:focus~label]:-top-4`,

    // label: has-value
    `[&:not(:placeholder-shown)~label]:text-xs 
     [&:not(:placeholder-shown)~label]:text-[#4caf50] 
     [&:not(:placeholder-shown)~label]:duration-[0.3s] 
     [&:not(:placeholder-shown)~label]:-top-4`,
].join(' ').trim();

export const effect18 = [
    `${underline16}`,
    // span
    `[&~span]:absolute 
     [&~span]:w-full 
     [&~span]:h-0.5 
     [&~span]:z-[99] 
     [&~span]:left-0 
     [&~span]:bottom-0`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-full 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.4s] 
     [&~span]:before:left-0 
     [&~span]:before:bottom-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-full 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.4s] 
     [&~span]:after:left-0 
     [&~span]:after:bottom-0
     [&~span]:after:left-auto 
     [&~span]:after:right-0`,

    // span: focus before
    `[&:focus~span]:before:w-1/2 
     [&:focus~span]:before:duration-[0.4s]`,

    // span: focus after
    `[&:focus~span]:after:w-1/2 
     [&:focus~span]:after:duration-[0.4s]`,

    // span: has-value before
    `[&:not(:placeholder-shown)~span]:before:w-1/2 
     [&:not(:placeholder-shown)~span]:before:duration-[0.4s]`,

    // span: has-value after
    `[&:not(:placeholder-shown)~span]:after:w-1/2 
     [&:not(:placeholder-shown)~span]:after:duration-[0.4s]`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-0 
     [&~label]:top-[9px]`,

    // label: focus
    `[&:focus~label]:text-xs 
     [&:focus~label]:text-[#4caf50] 
     [&:focus~label]:duration-[0.3s] 
     [&:focus~label]:-top-4`,

    // label: has-value
    `[&:not(:placeholder-shown)~label]:text-xs 
     [&:not(:placeholder-shown)~label]:text-[#4caf50] 
     [&:not(:placeholder-shown)~label]:duration-[0.3s] 
     [&:not(:placeholder-shown)~label]:-top-4`,
].join(' ').trim();
// #endregion


// #region Labeled Box Effects 19-21
const box19 = `focus:[outline:none] border duration-[0.4s] px-3.5 py-[7px] border-solid border-[#ccc] bg-transparent w-full`;

export const effect19 = [
    `${box19}`,
    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0.5 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.4s] 
     [&~span]:before:left-2/4 
     [&~span]:before:-top-px`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0.5 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.4s] 
     [&~span]:after:left-2/4 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span_i: before
    `[&~span_i]:before:content-[''] 
     [&~span_i]:before:absolute 
     [&~span_i]:before:w-0.5 
     [&~span_i]:before:h-0 
     [&~span_i]:before:bg-[#4caf50] 
     [&~span_i]:before:duration-[0.6s] 
     [&~span_i]:before:left-0 
     [&~span_i]:before:top-2/4`,

    // span_i: after
    `[&~span_i]:after:content-[''] 
     [&~span_i]:after:absolute 
     [&~span_i]:after:w-0.5 
     [&~span_i]:after:h-0 
     [&~span_i]:after:bg-[#4caf50] 
     [&~span_i]:after:duration-[0.6s]  
     [&~span_i]:after:top-2/4
     [&~span_i]:after:left-auto 
     [&~span_i]:after:right-0`,

    // span: focus before
    `[&:focus~span]:before:w-full 
     [&:focus~span]:before:duration-[0.4s] 
     [&:focus~span]:before:left-0`,

    // span: focus after
    `[&:focus~span]:after:w-full 
     [&:focus~span]:after:duration-[0.4s] 
     [&:focus~span]:after:left-0`,

    // span: has-value before
    `[&:not(:placeholder-shown)~span]:before:w-full 
     [&:not(:placeholder-shown)~span]:before:duration-[0.4s] 
     [&:not(:placeholder-shown)~span]:before:left-0`,

    // span: has-value after
    `[&:not(:placeholder-shown)~span]:after:w-full 
     [&:not(:placeholder-shown)~span]:after:duration-[0.4s] 
     [&:not(:placeholder-shown)~span]:after:left-0`,

    // span_i: focus before
    `[&:focus~span_i]:before:h-full 
     [&:focus~span_i]:before:duration-[0.6s] 
     [&:focus~span_i]:before:-top-px`,

    // span_i: focus after
    `[&:focus~span_i]:after:h-full 
     [&:focus~span_i]:after:duration-[0.6s] 
     [&:focus~span_i]:after:-top-px`,

    // span_i: has-value before
    `[&:not(:placeholder-shown)~span_i]:before:h-full 
     [&:not(:placeholder-shown)~span_i]:before:duration-[0.6s] 
     [&:not(:placeholder-shown)~span_i]:before:-top-px`,

    // span_i: has-value after
    `[&:not(:placeholder-shown)~span_i]:after:h-full 
     [&:not(:placeholder-shown)~span_i]:after:duration-[0.6s] 
     [&:not(:placeholder-shown)~span_i]:after:-top-px`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-3.5 
     [&~label]:top-2.5`,

    // label: focus
    `[&:focus~label]:top-[-18px] 
     [&:focus~label]:text-xs text-[#4caf50] 
     [&:focus~label]:duration-[0.3s] 
     [&:focus~label]:left-0`,

    // label: has-value
    `[&:not(:placeholder-shown)~label]:top-[-18px] 
     [&:not(:placeholder-shown)~label]:text-xs text-[#4caf50] 
     [&:not(:placeholder-shown)~label]:duration-[0.3s] 
     [&:not(:placeholder-shown)~label]:left-0`,
].join(' ').trim();
const hpLabel20 = `[&:not(:placeholder-shown)~label]:top-[-18px]  [&:not(:placeholder-shown)~label]:text-xs  [&:not(:placeholder-shown)~label]:text-[#4caf50]  [&:not(:placeholder-shown)~label]:duration-[0.3s]  [&:not(:placeholder-shown)~label]:left-0`;

export const effect20 = [
    `${box19}`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0.5 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.3s] 
     [&~span]:before:left-0 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0.5 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.3s] 
     [&~span]:after:left-0 
     [&~span]:after:top-0
     [&~span]:after:left-auto 
     [&~span]:after:right-0 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span_i: before
    `[&~span_i]:before:content-[''] 
     [&~span_i]:before:absolute 
     [&~span_i]:before:w-0.5 
     [&~span_i]:before:h-0 
     [&~span_i]:before:bg-[#4caf50] 
     [&~span_i]:before:duration-[0.4s] 
     [&~span_i]:before:left-0 
     [&~span_i]:before:top-0`,

    // span_i: after
    `[&~span_i]:after:content-[''] 
     [&~span_i]:after:absolute 
     [&~span_i]:after:w-0.5 
     [&~span_i]:after:h-0 
     [&~span_i]:after:bg-[#4caf50] 
     [&~span_i]:after:duration-[0.4s]  
     [&~span_i]:after:top-0
     [&~span_i]:after:left-auto 
     [&~span_i]:after:right-0 
     [&~span_i]:after:top-auto 
     [&~span_i]:after:bottom-0`,

    // span: focus before
    `[&:focus~span]:before:w-full 
     [&:focus~span]:before:duration-[0.3s]`,

    // span: focus after
    `[&:focus~span]:after:w-full 
     [&:focus~span]:after:duration-[0.3s]`,

    // span: has-value before
    `[&:not(:placeholder-shown)~span]:before:w-full 
     [&:not(:placeholder-shown)~span]:before:duration-[0.3s]`,

    // span: has-value after
    `[&:not(:placeholder-shown)~span]:after:w-full 
     [&:not(:placeholder-shown)~span]:after:duration-[0.3s]`,

    // span_i: focus before
    `[&:focus~span_i]:before:h-full 
     [&:focus~span_i]:before:duration-[0.4s]`,

    // span_i: focus after
    `[&:focus~span_i]:after:h-full 
     [&:focus~span_i]:after:duration-[0.4s]`,

    // span_i: has-value before
    `[&:not(:placeholder-shown)~span_i]:before:h-full 
     [&:not(:placeholder-shown)~span_i]:before:duration-[0.4s]`,

    // span_i: has-value after
    `[&:not(:placeholder-shown)~span_i]:after:h-full 
     [&:not(:placeholder-shown)~span_i]:after:duration-[0.4s]`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-3.5 
     [&~label]:top-2.5`,

    // label: focus
    `[&:focus~label]:top-[-18px] 
     [&:focus~label]:text-xs 
     [&:focus~label]:text-[#4caf50] 
     [&:focus~label]:duration-[0.3s] 
     [&:focus~label]:left-0`,

    `${hpLabel20}`,
].join(' ').trim();

export const effect21 = [
    `${box19}`,
    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0.5 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.2s] 
     [&~span]:before:delay-[0.2s] 
     [&~span]:before:right-0 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0.5 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.2s] 
     [&~span]:after:delay-[0.2s] 
     [&~span]:after:right-0 
     [&~span]:after:top-0
     [&~span]:after:delay-[0.6s] 
     [&~span]:after:left-0 
     [&~span]:after:right-auto 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span_i: before
    `[&~span_i]:before:content-[''] 
     [&~span_i]:before:absolute 
     [&~span_i]:before:w-0.5 
     [&~span_i]:before:h-0 
     [&~span_i]:before:bg-[#4caf50] 
     [&~span_i]:before:duration-[0.2s] 
     [&~span_i]:before:left-0 
     [&~span_i]:before:top-0
     [&~span_i]:before:delay-[0.8s]`,

    // span_i: after
    `[&~span_i]:after:content-[''] 
     [&~span_i]:after:absolute 
     [&~span_i]:after:w-0.5 
     [&~span_i]:after:h-0 
     [&~span_i]:after:bg-[#4caf50] 
     [&~span_i]:after:duration-[0.2s]  
     [&~span_i]:after:top-0
     [&~span_i]:after:delay-[0.4s] 
     [&~span_i]:after:left-auto 
     [&~span_i]:after:right-0 
     [&~span_i]:after:top-auto 
     [&~span_i]:after:bottom-0`,

    // span: focus before
    `[&:focus~span]:before:w-full 
     [&:focus~span]:before:duration-[0.2s] 
     [&:focus~span]:before:delay-[0.6s]`,

    // span: focus after
    `[&:focus~span]:after:w-full 
     [&:focus~span]:after:duration-[0.2s] 
     [&:focus~span]:after:delay-[0.4s]`,

    // span: has-value before
    `[&:not(:placeholder-shown)~span]:before:w-full 
     [&:not(:placeholder-shown)~span]:before:duration-[0.2s] 
     [&:not(:placeholder-shown)~span]:before:delay-[0.6s]`,

    // span: has-value after
    `[&:not(:placeholder-shown)~span]:after:w-full 
     [&:not(:placeholder-shown)~span]:after:duration-[0.2s] 
     [&:not(:placeholder-shown)~span]:after:delay-[0.6s]
     [&:not(:placeholder-shown)~span]:after:delay-[0.2s]`,

    // span_i: focus before
    `[&:focus~span_i]:before:h-full 
     [&:focus~span_i]:before:duration-[0.6s]
     [&:focus~span_i]:before:delay-0`,

    // span_i: after
    `[&:focus~span_i]:after:h-full 
     [&:focus~span_i]:after:duration-[0.2s]
     [&:focus~span_i]:after:delay-[0.4s]`,

    // span_i: has-value before
    `[&:not(:placeholder-shown)~span_i]:before:h-full 
     [&:not(:placeholder-shown)~span_i]:before:duration-[0.2s]`,

    // span_i: has-value after
    `[&:not(:placeholder-shown)~span_i]:after:h-full 
     [&:not(:placeholder-shown)~span_i]:after:duration-[0.2s]
     [&:not(:placeholder-shown)~span_i]:after:delay-[0.4s]`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-3.5 
     [&~label]:top-2.5`,

    // label: focus
    `[&:focus~label]:top-[-18px] 
     [&:focus~label]:text-xs 
     [&:focus~label]:text-[#4caf50] 
     [&:focus~label]:duration-[0.3s] 
     [&:focus~label]:left-0`,

    `${hpLabel20}`,
].join(' ').trim();
// #endregion


// #region Labeled Fill Effects 22-24
const fill22 = `focus:[outline:none] border-2 relative px-[15px] py-[7px] border-0 border-solid border-[#ccc] bg-transparent w-full ` + `focus:border-[#4caf50] transition-colors duration-[0.7s]`;
export const effect22 = [
    `${fill22}`,
    // span
    `[&~span]:absolute 
     [&~span]:w-0 
     [&~span]:h-full 
     [&~span]:bg-transparent 
     [&~span]:duration-[0.4s] 
     [&~span]:z-[-1] 
     [&~span]:left-0 
     [&~span]:top-0`,

    // span: focus
    `[&:focus~span]:duration-[0.4s] 
     [&:focus~span]:w-full 
     [&:focus~span]:bg-[#ededed]`,

    // span: has-value
    `[&:not(:placeholder-shown)~span]:duration-[0.4s] 
     [&:not(:placeholder-shown)~span]:w-full 
     [&:not(:placeholder-shown)~span]:bg-[#ededed]`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-3.5 
     [&~label]:top-2.5`,

    // label: focus
    `[&:focus~label]:top-[-18px] 
     [&:focus~label]:text-xs 
     [&:focus~label]:text-[#333] 
     [&:focus~label]:duration-[0.3s] 
     [&:focus~label]:left-0`,

    `${hpLabel20}`,
].join(' ').trim();

export const effect23 = [
    `${fill22}`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0 
     [&~span]:before:bg-[#ededed] 
     [&~span]:before:duration-[0.3s] 
     [&~span]:before:z-[-1] 
     [&~span]:before:left-0 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0 
     [&~span]:after:bg-[#ededed] 
     [&~span]:after:duration-[0.3s] 
     [&~span]:after:z-[-1] 
     [&~span]:after:left-0 
     [&~span]:after:top-0
     [&~span]:after:left-auto 
     [&~span]:after:right-0 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span: focus before
    `[&:focus~span]:before:duration-[0.3s] 
     [&:focus~span]:before:w-1/2 
     [&:focus~span]:before:h-full`,

    // span: has-value before
    `[&:not(:placeholder-shown)~span]:before:duration-[0.3s] 
     [&:not(:placeholder-shown)~span]:before:w-1/2 
     [&:not(:placeholder-shown)~span]:before:h-full`,

    // span: focus after
    `[&:focus~span]:after:duration-[0.3s] 
     [&:focus~span]:after:w-1/2 
     [&:focus~span]:after:h-full`,

    // span: has-value after
    `[&:not(:placeholder-shown)~span]:after:duration-[0.3s] 
     [&:not(:placeholder-shown)~span]:after:w-1/2 
     [&:not(:placeholder-shown)~span]:after:h-full`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-3.5 
     [&~label]:top-2.5`,

    // label: focus
    `[&:focus~label]:top-[-18px] 
     [&:focus~label]:text-xs 
     [&:focus~label]:text-[#333] 
     [&:focus~label]:duration-[0.3s] 
     [&:focus~label]:left-0`,

    `${hpLabel20}`,
].join(' ').trim();

export const effect24 = [
    `${fill22}`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0 
     [&~span]:before:bg-[#ededed] 
     [&~span]:before:duration-[0.3s] 
     [&~span]:before:z-[-1] 
     [&~span]:before:left-2/4 
     [&~span]:before:top-2/4`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0 
     [&~span]:after:bg-[#ededed] 
     [&~span]:after:duration-[0.3s] 
     [&~span]:after:z-[-1] 
     [&~span]:after:left-2/4 
     [&~span]:after:top-2/4`,

    // span: focus before
    `[&:focus~span]:before:duration-[0.3s] 
     [&:focus~span]:before:w-1/2 
     [&:focus~span]:before:h-full 
     [&:focus~span]:before:left-0 
     [&:focus~span]:before:top-0`,

    // span: has-value before
    `[&:not(:placeholder-shown)~span]:before:duration-[0.3s] 
     [&:not(:placeholder-shown)~span]:before:w-1/2 
     [&:not(:placeholder-shown)~span]:before:h-full 
     [&:not(:placeholder-shown)~span]:before:left-0 
     [&:not(:placeholder-shown)~span]:before:top-0`,

    // span: focus after
    `[&~span]:after:left-auto 
     [&~span]:after:right-2/4 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-2/4`,

    // span: has-value after
    `[&:focus~span]:after:duration-[0.3s] 
     [&:focus~span]:after:w-1/2 
     [&:focus~span]:after:h-full 
     [&:focus~span]:after:right-0 
     [&:focus~span]:after:bottom-0`,

    // span: has-value after
    `[&:not(:placeholder-shown)~span]:after:duration-[0.3s] 
     [&:not(:placeholder-shown)~span]:after:w-1/2 
     [&:not(:placeholder-shown)~span]:after:h-full 
     [&:not(:placeholder-shown)~span]:after:right-0 
     [&:not(:placeholder-shown)~span]:after:bottom-0`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-3.5 
     [&~label]:top-2.5`,

    // label: focus
    `[&:focus~label]:top-[-18px] 
     [&:focus~label]:text-xs 
     [&:focus~label]:text-[#333] 
     [&:focus~label]:duration-[0.3s] 
     [&:focus~label]:left-0`,

    // label: has-value
    `[&:not(:placeholder-shown)~label]:top-[-18px] 
     [&:not(:placeholder-shown)~label]:text-xs 
     [&:not(:placeholder-shown)~label]:text-[#4caf50] 
     [&:not(:placeholder-shown)~label]:duration-[0.3s] 
     [&:not(:placeholder-shown)~label]:left-0`,

].join(' ').trim();
// #endregion


// #region Alternative Labeled Effects 19a-21a
const hLabel = `[&:focus~label]:top-[-12px]  [&:focus~label]:text-xs  [&:focus~label]:text-[#4caf50]  [&:focus~label]:duration-[0.3s]  [&:focus~label]:left-[7px]  [&:focus~label]:bg-[white]  [&:focus~label]:w-fit  [&:focus~label]:z-10  [&:focus~label]:p-[2px]`;
const hpLabel = `[&:not(:placeholder-shown)~label]:top-[-12px]  [&:not(:placeholder-shown)~label]:text-xs  [&:not(:placeholder-shown)~label]:text-[#4caf50]  [&:not(:placeholder-shown)~label]:duration-[0.3s]  [&:not(:placeholder-shown)~label]:left-[7px]  [&:not(:placeholder-shown)~label]:bg-[white]  [&:not(:placeholder-shown)~label]:w-fit  [&:not(:placeholder-shown)~label]:z-10  [&:not(:placeholder-shown)~label]:p-[2px]`;

export const effect19a = [
    `${box19}`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0.5 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.4s] 
     [&~span]:before:left-2/4 
     [&~span]:before:-top-px`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0.5 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.4s] 
     [&~span]:after:left-2/4 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span_i: before
    `[&~span_i]:before:content-[''] 
     [&~span_i]:before:absolute 
     [&~span_i]:before:w-0.5 
     [&~span_i]:before:h-0 
     [&~span_i]:before:bg-[#4caf50] 
     [&~span_i]:before:duration-[0.6s] 
     [&~span_i]:before:left-0 
     [&~span_i]:before:top-2/4`,

    // span_i: after
    `[&~span_i]:after:content-[''] 
     [&~span_i]:after:absolute 
     [&~span_i]:after:w-0.5 
     [&~span_i]:after:h-0 
     [&~span_i]:after:bg-[#4caf50] 
     [&~span_i]:after:duration-[0.6s]  
     [&~span_i]:after:top-2/4
     [&~span_i]:after:left-auto 
     [&~span_i]:after:right-0`,

    // span: focus before
    `[&:focus~span]:before:w-full 
     [&:focus~span]:before:duration-[0.4s] 
     [&:focus~span]:before:left-0`,

    // span: focus after
    `[&:focus~span]:after:w-full 
     [&:focus~span]:after:duration-[0.4s] 
     [&:focus~span]:after:left-0`,

    // span: has-value before
    `[&:not(:placeholder-shown)~span]:before:w-full 
     [&:not(:placeholder-shown)~span]:before:duration-[0.4s] 
     [&:not(:placeholder-shown)~span]:before:left-0`,

    // span: has-value after
    `[&:not(:placeholder-shown)~span]:after:w-full 
     [&:not(:placeholder-shown)~span]:after:duration-[0.4s] 
     [&:not(:placeholder-shown)~span]:after:left-0`,

    // span_i: focus before
    `[&:focus~span_i]:before:h-full 
     [&:focus~span_i]:before:duration-[0.6s] 
     [&:focus~span_i]:before:-top-px`,

    // span_i: focus after
    `[&:focus~span_i]:after:h-full 
     [&:focus~span_i]:after:duration-[0.6s] 
     [&:focus~span_i]:after:-top-px`,

    // span_i: has-value before
    `[&:not(:placeholder-shown)~span_i]:before:h-full 
     [&:not(:placeholder-shown)~span_i]:before:duration-[0.6s] 
     [&:not(:placeholder-shown)~span_i]:before:-top-px`,

    // span_i: has-value after
    `[&:not(:placeholder-shown)~span_i]:after:h-full 
     [&:not(:placeholder-shown)~span_i]:after:duration-[0.6s] 
     [&:not(:placeholder-shown)~span_i]:after:-top-px`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-3.5 
     [&~label]:top-2.5`,

    `${hLabel}`,
    `${hpLabel}`,
].join(' ').trim();

export const effect20a = [
    `${box19}`,

    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0.5 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.3s] 
     [&~span]:before:left-0 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0.5 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.3s] 
     [&~span]:after:left-0 
     [&~span]:after:top-0
     [&~span]:after:left-auto 
     [&~span]:after:right-0 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span_i: before
    `[&~span_i]:before:content-[''] 
     [&~span_i]:before:absolute 
     [&~span_i]:before:w-0.5 
     [&~span_i]:before:h-0 
     [&~span_i]:before:bg-[#4caf50] 
     [&~span_i]:before:duration-[0.4s] 
     [&~span_i]:before:left-0 
     [&~span_i]:before:top-0`,

    // span_i: after
    `[&~span_i]:after:content-[''] 
     [&~span_i]:after:absolute 
     [&~span_i]:after:w-0.5 
     [&~span_i]:after:h-0 
     [&~span_i]:after:bg-[#4caf50] 
     [&~span_i]:after:duration-[0.4s]  
     [&~span_i]:after:top-0
     [&~span_i]:after:left-auto 
     [&~span_i]:after:right-0 
     [&~span_i]:after:top-auto 
     [&~span_i]:after:bottom-0`,

    // span: focus before
    `[&:focus~span]:before:w-full 
     [&:focus~span]:before:duration-[0.3s]`,

    // span: focus after
    `[&:focus~span]:after:w-full 
     [&:focus~span]:after:duration-[0.3s]`,

    // span: has-value before
    `[&:not(:placeholder-shown)~span]:before:w-full 
     [&:not(:placeholder-shown)~span]:before:duration-[0.3s]`,

    // span: has-value after
    `[&:not(:placeholder-shown)~span]:after:w-full 
     [&:not(:placeholder-shown)~span]:after:duration-[0.3s]`,

    // span_i: focus before
    `[&:focus~span_i]:before:h-full 
     [&:focus~span_i]:before:duration-[0.4s]`,

    // span_i: focus after
    `[&:focus~span_i]:after:h-full 
     [&:focus~span_i]:after:duration-[0.4s]`,

    // span_i: has-value before
    `[&:not(:placeholder-shown)~span_i]:before:h-full 
     [&:not(:placeholder-shown)~span_i]:before:duration-[0.4s]`,

    // span_i: has-value after
    `[&:not(:placeholder-shown)~span_i]:after:h-full 
     [&:not(:placeholder-shown)~span_i]:after:duration-[0.4s]`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-3.5 
     [&~label]:top-2.5`,

    `${hLabel}`,
    `${hpLabel}`,
].join(' ').trim();

export const effect21a = [
    `${box19}`,
    // span: before
    `[&~span]:before:content-[''] 
     [&~span]:before:absolute 
     [&~span]:before:w-0 
     [&~span]:before:h-0.5 
     [&~span]:before:bg-[#4caf50] 
     [&~span]:before:duration-[0.2s] 
     [&~span]:before:delay-[0.2s] 
     [&~span]:before:right-0 
     [&~span]:before:top-0`,

    // span: after
    `[&~span]:after:content-[''] 
     [&~span]:after:absolute 
     [&~span]:after:w-0 
     [&~span]:after:h-0.5 
     [&~span]:after:bg-[#4caf50] 
     [&~span]:after:duration-[0.2s] 
     [&~span]:after:delay-[0.2s] 
     [&~span]:after:right-0 
     [&~span]:after:top-0
     [&~span]:after:delay-[0.6s] 
     [&~span]:after:left-0 
     [&~span]:after:right-auto 
     [&~span]:after:top-auto 
     [&~span]:after:bottom-0`,

    // span_i: before
    `[&~span_i]:before:content-[''] 
     [&~span_i]:before:absolute 
     [&~span_i]:before:w-0.5 
     [&~span_i]:before:h-0 
     [&~span_i]:before:bg-[#4caf50] 
     [&~span_i]:before:duration-[0.2s] 
     [&~span_i]:before:left-0 
     [&~span_i]:before:top-0
     [&~span_i]:before:delay-[0.8s]`,

    // span_i: after
    `[&~span_i]:after:content-[''] 
     [&~span_i]:after:absolute 
     [&~span_i]:after:w-0.5 
     [&~span_i]:after:h-0 
     [&~span_i]:after:bg-[#4caf50] 
     [&~span_i]:after:duration-[0.2s]  
     [&~span_i]:after:top-0
     [&~span_i]:after:delay-[0.4s] 
     [&~span_i]:after:left-auto 
     [&~span_i]:after:right-0 
     [&~span_i]:after:top-auto 
     [&~span_i]:after:bottom-0`,

    // span: focus before
    `[&:focus~span]:before:w-full 
     [&:focus~span]:before:duration-[0.2s] 
     [&:focus~span]:before:delay-[0.6s]`,

    // span: focus after
    `[&:focus~span]:after:w-full 
     [&:focus~span]:after:duration-[0.2s] 
     [&:focus~span]:after:delay-[0.4s]`,

    // span: has-value before
    `[&:not(:placeholder-shown)~span]:before:w-full 
     [&:not(:placeholder-shown)~span]:before:duration-[0.2s] 
     [&:not(:placeholder-shown)~span]:before:delay-[0.6s]`,

    // span: has-value after
    `[&:not(:placeholder-shown)~span]:after:w-full 
     [&:not(:placeholder-shown)~span]:after:duration-[0.2s] 
     [&:not(:placeholder-shown)~span]:after:delay-[0.6s]
     [&:not(:placeholder-shown)~span]:after:delay-[0.2s]`,

    // span_i: focus before
    `[&:focus~span_i]:before:h-full 
     [&:focus~span_i]:before:duration-[0.6s]
     [&:focus~span_i]:before:delay-0`,

    // span_i: focus after
    `[&:focus~span_i]:after:h-full 
     [&:focus~span_i]:after:duration-[0.2s]
     [&:focus~span_i]:after:delay-[0.4s]`,

    // span_i: has-value before
    `[&:not(:placeholder-shown)~span_i]:before:h-full 
     [&:not(:placeholder-shown)~span_i]:before:duration-[0.2s]`,

    // span_i: has-value after
    `[&:not(:placeholder-shown)~span_i]:after:h-full 
     [&:not(:placeholder-shown)~span_i]:after:duration-[0.2s]
     [&:not(:placeholder-shown)~span_i]:after:delay-[0.4s]`,

    // label
    `[&~label]:absolute 
     [&~label]:w-full 
     [&~label]:text-[#aaa] 
     [&~label]:duration-[0.3s] 
     [&~label]:z-0
     [&~label]:tracking-[0.5px] 
     [&~label]:left-3.5 
     [&~label]:top-2.5`,

    `${hLabel}`,
    `${hpLabel}`,
].join(' ').trim();
// #endregion

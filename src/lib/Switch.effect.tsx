// https://codepen.io/alvarotrigo/pen/oNoJePo

const yesKnot = `[&>div]:before:w-[2rem] [&>div]:before:h-[2rem] [&>div]:before:flex [&>div]:before:items-center [&>div]:before:justify-center`
const noKnot = `[&>div]:after:w-[2rem] [&>div]:after:h-[2rem] [&>div]:after:flex [&>div]:after:items-center [&>div]:after:justify-center`
const divSpanDim = `[&>div>span]:w-[2rem] [&>div>span]:h-[2rem]`
const layer = `[&>span]:w-full [&>span]:bg-[#ebf7fc] [&>span]:[transition:0.3s_ease_all] [&>span]:z-[1]`

export const effect1 = `
${layer}
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center
[&>div]:before:leading-none [&>div]:before:bg-[#03a9f4] [&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 
[&>div]:before:[&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>input:checked+div]:before:content-[attr(data-tg-off)] [&>input:checked+div]:before:bg-[#f44336] [&>input:checked+div]:before:left-[42px]
[&>input:checked~div]:bg-[#fcebeb]
[&>div]:[transition:0.3s_ease_all]
[&>span]:[transition:0.3s_ease_all]
`

export const effect2 = `
${layer}
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center 
[&>div]:before:leading-none [&>div]:before:bg-[#03a9f4] [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] 
[&>div]:before:rounded-[50%] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:absolute [&>div]:after:text-white [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center 
[&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-[50%]
[&>div]:after:left-1 [&>div]:after:top-[2px]
${noKnot}
[&>div]:before:content-[attr(data-tg-on)]
[&>div]:after:bg-[#f44336] [&>div]:after:left-auto [&>div]:after:-right-8
[&>input:checked+div]:before:-left-8
[&>input:checked+div]:after:right-1
[&>input:checked~span]:bg-[#fcebeb]
`

export const effect3 = `
${layer}
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center
[&>div]:before:leading-none [&>div]:before:bg-[#03a9f4] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:left-1
[&>div]:before:top-[2px]
${yesKnot}
[&>div]:before:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]
[&>input:active+div]:before:w-[46px] [&>input:active+div]:before:rounded-[100px]
[&>input:checked:active+div]:before:ml-[-26px]
[&>input:checked+div]:before:content-[attr(data-tg-off)] [&>input:checked+div]:before:bg-[#f44336] [&>input:checked+div]:before:left-[42px]
[&>input:checked~span]:bg-[#fcebeb]
`

export const effect4 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none 
[&>div]:before:bg-[#03a9f4] [&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 [&>div]:before:py-[9px] 
[&>div]:before:rounded-[50%] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>div]:[transition:0.3s_ease_all]
[&>div]:after:absolute [&>div]:after:text-white [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none 
[&>div]:after:bg-[#03a9f4] [&>div]:after:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:after:py-[9px] [&>div]:after:rounded-[50%] 
[&>div]:after:left-1
${noKnot}
[&>div]:before:content-[attr(data-tg-on)]
[&>div]:after:content-[attr(data-tg-off)]
[&>div]:after:bg-[#f44336] [&>div]:after:left-auto [&>div]:after:right-1 [&>div]:after:-top-8
[&>input:checked+div]:before:-top-8
[&>input:checked+div]:after:top-[2px]
[&>input:checked+div]:div:-top-1
[&>input:checked~span]:bg-[#fcebeb]
`

export const effect5 = `
${layer}
overflow-visible [perspective:60px]
[&>div]:before:content-[''] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center 
[&>div]:before:leading-none [&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 [&>div]:before:py-[9px] 
[&>div]:before:rounded-[50%] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>div>span]:content-[''] [&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-white [&>div>span]:text-[10px] [&>div>span]:font-bold 
[&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-[50%] [&>div>span]:left-1 [&>div>span]:top-[2px]
[&>div]:before:bg-[#03a9f4]
[&>div>span]:before:content-[attr(data-tg-on)]
[&>div]:before:origin-center [&>div]:before:[transform:rotateY(0)]
[&>span]:origin-center [&>span]:[transform:rotateY(0)]
[&>input:checked+div]:before:left-[42px]
[&>input:checked+div>span]:left-[42px]
[&>input:checked+div]:before:bg-[#f44336] [&>input:checked+div]:before:[transform:rotateY(180deg)]
[&>input:checked+div>span]:before:content-[attr(data-tg-off)] [&>input:checked+div>span]:before:left-[42px] [&>input:checked+div>span]:before:pl-[5px]
[&>input:checked~span]:bg-[#fcebeb] [&>input:checked~span]:[transform:rotateY(-180deg)]
[&>div]:[transition:0.3s_ease_all]
[&>div]:before:[transition:0.3s_ease_all]
[&>span]:[transition:0.3s_ease_all]
`
export const effect6 = `
${layer}
overflow-visible
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold 
[&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:bg-[#03a9f4] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] 
[&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>span]:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>span]:[transform:rotateZ(0)]
[&>div]:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:[transform:rotateZ(0)]
[&>div]:before:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:[transform:rotateZ(0)]
[&>input:checked+div]:[transform:rotateZ(-180deg)]
[&>input:checked+div]:before:content-[attr(data-tg-off)] [&>input:checked+div]:before:bg-[#f44336] [&>input:checked+div]:before:[transform:rotateZ(180deg)]
[&>input:checked~span]:bg-[#fcebeb] [&>input:checked~span]:[transform:rotateZ(180deg)]
`

export const effect7 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-[50%] [&>div]:after:top-[2px]
${noKnot}
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-[50%] [&>div>span]:top-[2px]
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:text-white [&>div]:before:opacity-100 [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:text-white [&>div]:after:text-left [&>div]:after:bg-[#f44336] [&>div]:after:opacity-0 [&>div]:after:px-[7px] [&>div]:after:py-[9px] [&>div]:after:left-[42px]
[&>div]:before:[transition:0.3s_ease_all] [&>div]:before:z-[2]
[&>div]:after:[transition:0.3s_ease_all] [&>div]:after:z-[2]
[&>div>span]:bg-[#03a9f4] [&>div>span]:[transition:0.2s_ease_all] [&>div>span]:z-[1] [&>div>span]:left-1
[&>input:checked+div]:before:opacity-0
[&>input:checked+div]:after:opacity-100
${divSpanDim}
[&>input:checked+div>span]:w-0.5 [&>input:checked+div>span]:h-0.5 [&>input:checked+div>span]:bg-white [&>input:checked+div>span]:p-[3px] [&>input:checked+div>span]:left-14 [&>input:checked+div>span]:top-3.5
[&>input:checked~span]:bg-[#fcebeb]
`

export const effect8 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-[50%] [&>div]:after:top-[2px]
${noKnot}
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_ease_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-[50%] [&>div>span]:top-[2px]
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:text-white [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:text-white [&>div]:after:bg-[#f44336] [&>div]:after:opacity-0 [&>div]:after:left-[42px]
[&>div]:before:z-[2]
[&>div]:after:z-[2]
[&>div>span]:bg-[#03a9f4] [&>div>span]:z-[1] [&>div>span]:left-1
${divSpanDim}

[&>input:checked+div]:before:opacity-0
[&>input:checked+div]:after:opacity-100
[&>input:checked+div>span]:bg-[#fcebeb] [&>input:checked+div>span]:scale-[4]
`

export const effect9 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-[50%] [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-[50%] [&>div]:after:top-[2px]
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.4s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-[50%] [&>div>span]:top-[2px]
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:-right-6
[&>div]:before:text-white [&>div]:before:z-[2]
[&>div]:after:text-white [&>div]:after:z-[2]
[&>div>span]:bg-[#03a9f4] [&>div>span]:z-[1] [&>div>span]:left-1
${divSpanDim}

[&>input:checked+div]:before:-left-6
[&>input:checked+div]:after:right-1
[&>input:checked+div>span]:bg-[#f44336] [&>input:checked+div>span]:left-[42px]
[&>input:checked~span]:bg-[#fcebeb]
`

export const effect10 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:top-[px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-sm [&>div]:after:top-[4px]
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_ease_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-sm [&>div>span]:top-[2px]
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:bg-[#03a9f4] [&>div]:before:left-1 [&>div]:text-[white] 
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:text-[#4e4e4e] [&>div]:after:right-1
[&>div>span]:inline-block [&>div>span]:text-white [&>div>span]:z-[1] [&>div>span]:left-1
[&>input:checked+div>span]:text-[#4e4e4e]
[&>input:checked+div]:before:bg-[#f44336] [&>input:checked+div]:before:left-[42px]
[&>div>span]:before:content-[attr(data-tg-on)] [&>div]:before:z-[10] [&>input:checked+div]:before:content-[attr(data-tg-off)] [&>input:checked+div>span]:before:relative 
[&>input:checked+div]:after:text-white
[&>input:checked~span]:bg-[#fcebeb]
`

export const effect11 = `
${layer}
overflow-visible
[&>div]:[perspective:70px]
[&>div]:before:absolute [&>div]:before:rounded-sm [&>div]:before:top-[2px]
[&>div]:after:absolute [&>div]:after:rounded-sm [&>div]:after:top-[2px]
[&>div>span]:absolute [&>div>span]:rounded-sm [&>div>span]:top-[2px]
[&>div]:before:text-[#4e4e4e] [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:px-1 [&>div]:before:py-[9px]
[&>div]:after:text-[#4e4e4e] [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:px-1 [&>div]:after:py-[9px]
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:right-1
[&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:bg-[#03a9f4] [&>div>span]:origin-[0%_50%] [&>div>span]:[transition:0.6s_ease_all] [&>div>span]:z-[1] [&>div>span]:right-1 [&>div>span]:[transform:rotateY(0)]
[&>input:checked+div>span]:bg-[#f44336] [&>input:checked+div>span]:[transform:rotateY(-180deg)]
[&>input:checked~span]:bg-[#fcebeb]
`

export const effect12 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:rounded-sm [&>div]:before:top-[2px]
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:rounded-sm [&>div]:after:top-[2px]
[&>div>span]:absolute [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_ease_all] [&>div>span]:rounded-sm [&>div>span]:top-[2px]
[&>div>span]:before:absolute [&>div>span]:before:text-[10px] [&>div>span]:before:font-bold [&>div>span]:before:text-center [&>div>span]:before:leading-none [&>div>span]:before:[transition:0.3s_ease_all] [&>div>span]:before:rounded-sm [&>div>span]:before:top-[2px]
[&>div>span]:after:absolute [&>div>span]:after:text-[10px] [&>div>span]:after:font-bold [&>div>span]:after:text-center [&>div>span]:after:leading-none [&>div>span]:after:[transition:0.3s_ease_all] [&>div>span]:after:rounded-sm [&>div>span]:after:top-[2px]
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:right-1
[&>div]:before:w-[27px] [&>div]:before:text-[#4e4e4e] [&>div]:before:z-[1] [&>div]:before:px-[3px] [&>div]:before:py-[9px]
[&>div]:after:w-[27px] [&>div]:after:text-[#4e4e4e] [&>div]:after:z-[1] [&>div]:after:px-[3px] [&>div]:after:py-[9px]
[&>div>span]:inline-block [&>div>span]:z-[2] [&>div>span]:before:bg-[#f44336] [&>div>span]:before:-left-7 [&>div>span]:after:right-[-42px] [&>div>span]:after:bg-[#03a9f4]
[&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:px-1 [&>div>span]:py-[9px]
[&>div>span]:before:w--[2rem] [&>div>span]:before:h-[2rem] [&>div>span]:before:px-1 [&>div>span]:before:py-[9px]
[&>div>span]:after:w-[2rem] [&>div>span]:after:h-[2rem] [&>div>span]:after:px-1 [&>div>span]:after:py-[9px]
[&>div>span]:before:content-[''] [&>div>span]:before:top-0
[&>div>span]:after:content-[''] [&>div>span]:after:top-0
[&>input:checked+div>span]:before:left-1 [&>input:checked+div>span]:before:w-[2rem]
[&>input:checked+div>span]:after:right-[-74px]
[&>input:checked~span]:bg-[#fcebeb]
`
export const effect13 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:top-[2px]
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-sm [&>div]:after:top-[2px]
[&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:[transition:0.3s_ease_all] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:rounded-sm [&>div>span]:top-[2px]
[&>div]:before:text-[#4e4e4e] [&>div]:before:z-[1]
[&>div]:after:text-[#4e4e4e] [&>div]:after:z-[1]
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:right-1
[&>div>span]:w-[2rem] [&>div>span]:bg-[#03a9f4] [&>div>span]:z-[2] [&>div>span]:left-[37px]
[&>input:checked+div>span]:bg-[#f44336] [&>input:checked+div>span]:left-1
[&>input:checked~span]:bg-[#fcebeb]
`
export const effect14 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:[transition:0.3s_ease_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:top-[2px]
[&>div]:after:absolute [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:[transition:0.3s_ease_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-sm [&>div]:after:top-[2px]
[&>div>span]:before:absolute [&>div>span]:before:w-[2rem] [&>div>span]:before:h-[2rem] [&>div>span]:before:text-[10px] [&>div>span]:before:font-bold [&>div>span]:before:text-center [&>div>span]:before:leading-none [&>div>span]:before:[transition:0.3s_ease_all] [&>div>span]:before:px-1 [&>div>span]:before:py-[9px] [&>div>span]:before:rounded-sm
[&>div>span]:after:absolute [&>div>span]:after:w-[2rem] [&>div>span]:after:h-[2rem] [&>div>span]:after:text-[10px] [&>div>span]:after:font-bold [&>div>span]:after:text-center [&>div>span]:after:leading-none [&>div>span]:after:[transition:0.3s_ease_all] [&>div>span]:after:px-1 [&>div>span]:after:py-[9px] [&>div>span]:after:rounded-sm [&>div>span]:after:top-[2px]
[&>div]:before:text-[#4e4e4e] [&>div]:before:z-[1]
[&>div]:after:text-[#4e4e4e] [&>div]:after:z-[1]
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:right-1
[&>div>span]:block [&>div>span]:w-full [&>div>span]:h-full [&>div>span]:left-0 [&>div>span]:top-0 [&>div>span]:before:bg-[#f44336] [&>div>span]:before:left-1 [&>div>span]:before:-top-7 [&>div>span]:after:bg-[#03a9f4] [&>div>span]:after:left-[39px] [&>div>span]:after:top-[2px]
[&>div>span]:before:content-[''] [&>div>span]:before:w-[2rem] [&>div>span]:before:z-[2]
[&>div>span]:after:content-[''] [&>div>span]:after:w-[2rem] [&>div>span]:after:z-[2]
[&>input:checked+div>span]:before:top-[2px]
[&>input:checked+div>span]:after:-top-8
[&>div>span]:before:-top-8
[&>input:checked~span]:bg-[#fcebeb]
`
export const effect15 = `
${layer}
[&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:opacity-100 [&>div]:before:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:scale-100 [&>div]:before:top-[2px]
${yesKnot}
[&>div]:after:absolute [&>div]:after:text-white [&>div]:after:text-[10px] [&>div]:after:font-bold [&>div]:after:text-center [&>div]:after:leading-none [&>div]:after:opacity-0 [&>div]:after:[transition:0.3s_cubic-bezier(0.18,0.89,0.35,1.15)_all] [&>div]:after:px-1 [&>div]:after:py-[9px] [&>div]:after:rounded-sm [&>div]:after:scale-100 [&>div]:after:top-[2px]
${noKnot}
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:bg-[#03a9f4] [&>div]:before:left-1
[&>div]:after:content-[attr(data-tg-off)] [&>div]:after:opacity-0 [&>div]:after:bg-[#f44336] [&>div]:after:scale-[4] [&>div]:after:right-1
[&>input:checked+div]:before:opacity-0 [&>input:checked+div]:before:scale-[4]
[&>input:checked+div]:after:opacity-100 [&>input:checked+div]:after:scale-100
[&>input:checked~span]:bg-[#fcebeb]
`
export const effect16 = `
${layer}
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:bg-[#03a9f4] [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:rounded-sm [&>div]:before:left-1 [&>div]:before:top-[2px] [&>div]:before:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]
${yesKnot}
[&>input:active+div]:before:w-[46px]
${noKnot}
[&>input:checked:active+div]:before:ml-[-26px]
[&>input:checked+div]:before:content-[attr(data-tg-off)] [&>input:checked+div]:before:bg-[#f44336] [&>input:checked+div]:before:left-[42px]
[&>input:checked~span]:bg-[#fcebeb]
`

export const effect17 = `
${layer}
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:px-1 [&>div]:before:py-[9px] [&>div]:before:left-1 [&>div]:before:top-[2px]
${yesKnot}
[&>div>span]:content-[attr(data-tg-on)] [&>div>span]:absolute [&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:text-white [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:left-1 [&>div>span]:top-[2px]
[&>div]:before:z-[2] [&>div]:before:[transition:0.3s_ease_all,left_0.5s_cubic-bezier(0.18,0.89,0.35,1.15)]
[&>div>span]:bg-[#03a9f4] [&>div>span]:z-[1] [&>div>span]:rounded-sm [&>div>span]:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]
[&>input:checked+div]:before:content-[attr(data-tg-off)] [&>input:checked+div]:before:left-[42px]
[&>input:checked+div>span]:bg-[#f44336] [&>input:checked+div>span]:left-[42px]
[&>input:checked~span]:bg-[#fcebeb]
`

export const effect18 = `
${layer}
[&>div]:before:content-[attr(data-tg-on)] [&>div]:before:absolute [&>div]:before:text-white [&>div]:before:text-[10px] [&>div]:before:font-bold [&>div]:before:text-center [&>div]:before:leading-none [&>div]:before:bg-[#03a9f4] [&>div]:before:rounded-sm [&>div]:before:left-1
[&>div>span]:content-[attr(data-tg-on)] [&>div>span]:absolute [&>div>span]:text-white [&>div>span]:text-[10px] [&>div>span]:font-bold [&>div>span]:text-center [&>div>span]:leading-none [&>div>span]:bg-[#03a9f4] [&>div>span]:rounded-sm [&>div>span]:left-1 
[&>div]:before:mt-[-5px] [&>div]:before:bg-transparent [&>div]:before:z-[2] [&>div]:before:left-2 [&>div]:before:top-[45%]
[&>div>span]:w-[2rem] [&>div>span]:h-[2rem] [&>div>span]:z-[1] [&>div>span]:px-1 [&>div>span]:py-[9px] [&>div>span]:[transition:0.3s_ease_all,left_0.3s_cubic-bezier(0.18,0.89,0.35,1.15)]
[&>input:active+div]:before:w-[46px] [&>input:active+div]:before:h-1 [&>input:active+div]:before:text-transparent [&>input:active+div]:before:bg-[#0095d8] [&>input:active+div]:before:[transition:0.3s_ease_all] [&>input:active+div]:before:overflow-hidden [&>input:active+div]:before:-mt-0.5 [&>input:active+div]:before:left-2.5
[&>input:active+div>span]:w-[58px]
[&>input:checked:active+div]:before:bg-[#d80000] [&>input:checked:active+div]:before:left-auto [&>input:checked:active+div]:before:right-2.5
[&>input:checked:active+div>span]:ml-[-38px]
[&>input:checked+div]:before:content-[attr(data-tg-off)] [&>input:checked+div]:before:left-[47px]
[&>input:checked+div>span]:bg-[#f44336] [&>input:checked+div>span]:left-[42px]
[&>input:checked~span]:bg-[#fcebeb]
`

//https://codepen.io/alvarotrigo/pen/RwjEZeJ

const iinput = `
${layer}
[&>input]:hidden [&>input]:box-border
[&>input]:after:box-border [&>input]:before:box-border [&_*]:box-border [&_*]:after:box-border [&_*]:before:box-border [&>label]:box-border
[&>label]:block [&>label]:w-[4em] [&>label]:h-[2em] [&>label]:relative [&>label]:cursor-pointer [&>label]:select-none [&>label]:after:left-0 [&>label]:[outline:0]
[&>label]:after:relative [&>label]:after:block [&>label]:after:w-6/12 [&>label]:after:h-full
[&>label]:before:relative [&>label]:before:w-6/12 [&>label]:before:h-full
[&>input:checked~label]:after:left-2/4
`

const ilabel = `
[&>label]:after:content-[attr(data-tg-off)] [&>label]:after:flex [&>label]:after:justify-center [&>label]:after:align-center
[&>input:checked~label]:after:content-[attr(data-tg-on)] [&>input:checked~label]:after:flex [&>input:checked~label]:after:justify-center [&>input:checked~label]:after:align-center
`
export const light = `mx-[2em] my-0 ${iinput}
[&>label]:[transition:all_0.4s_ease] [&>label]:p-0.5 [&>label]:rounded-[2em] [&>label]:after:[transition:all_0.2s_ease] [&>label]:after:rounded-[50%] 
[&>label]:bg-[#f0f0f0]
[&>label]:after:bg-[#fff]
[&>input:checked~label]:bg-[#9fd6ae]
${ilabel}
`

export const ios = `mx-[2em] my-0 ${iinput}
[&>label]:[transition:all_0.4s_ease] [&>label]:border [&>label]:p-0.5 [&>label]:rounded-[2em] [&>label]:border-solid [&>label]:border-[#e8eae9] [&>label]:after:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_0_rgba(0,0,0,0.08)] [&>label]:after:rounded-[2em] [&>label]:hover:after:will-change-[padding] [&>label]:active:shadow-[inset_0_0_0_2em_#e8eae9] [&>label]:active:after:pr-[0.8em] 
[&>label]:after:bg-[#fbfbfb] [&>label]:after:[transition:left_0.3s_cubic-bezier(0.175,0.885,0.32,1.275),padding_0.3s_ease,margin_0.3s_ease]
[&>input:checked~label]:bg-[#86d993]
[&>input:checked~label]:active:shadow-none
[&>input:checked~label]:active:after:ml-[-0.8em]
${ilabel}
`

export const skewed = `mx-[2em] my-0
[&>input]:hidden [&>input]:box-border
[&>input]:after:box-border [&>input]:before:box-border [&>input]:[&_*]:box-border [&>input]:[&_*]:after:box-border [&>input]:[&_*]:before:box-border [&>input]:[&>label]:box-border
[&>label]:block [&>label]:w-[4em] [&>label]:h-[2em] [&>label]:relative [&>label]:cursor-pointer [&>label]:select-none [&>label]:[outline:0]
[&>label]:after:h-full
[&>label]:before:h-full

[&>label]:overflow-hidden [&>label]:skew-x-[-10deg] [&>label]:[transition:all_0.2s_ease] [&>label]:before:content-[attr(data-tg-off)] [&>label]:after:left-full [&>input:checked~label]:after:content-[attr(data-tg-on)] [&>label]:before:left-0 [&>label]:active:before:left-[-10%]
[&>label]:[backface-visibility:hidden] [&>label]:font-sans [&>label]:bg-[#888]
[&>label]:after:skew-x-[10deg] [&>label]:after:inline-block [&>label]:after:[transition:all_0.2s_ease] [&>label]:after:w-full [&>label]:after:text-center [&>label]:after:absolute [&>label]:after:leading-[2em] [&>label]:after:font-[bold] [&>label]:after:text-white [&>label]:after:text-shadow:[0_1px_0_rgba(0,0,0,0.4)]
[&>label]:before:skew-x-[10deg] [&>label]:before:inline-block [&>label]:before:[transition:all_0.2s_ease] [&>label]:before:w-full [&>label]:before:text-center [&>label]:before:absolute [&>label]:before:leading-[2em] [&>label]:before:font-[bold] [&>label]:before:text-white [&>label]:before:text-shadow:[0_1px_0_rgba(0,0,0,0.4)]
[&>label]:active:bg-[#888]
[&>input:checked~label]:bg-[#86d993]
[&>input:checked~label]:before:left-full
[&>input:checked~label]:after:left-0
[&>input:checked~label]:active:after:left-[10%]
`

export const flat = `mx-[2em] my-0 ${iinput}
[&>label]:[transition:all_0.2s_ease] [&>label]:p-0.5 [&>label]:rounded-[2em] [&>label]:border-4 [&>label]:border-solid [&>label]:border-[#f2f2f2] [&>label]:after:[transition:all_0.2s_ease] [&>label]:after:content-[''] [&>label]:after:rounded-[1em] [&>label]:bg-[#fff]
[&>label]:after:bg-[#f2f2f2]
[&>input:checked~label]:border-4 [&>input:checked~label]:border-solid [&>input:checked~label]:border-[#7fc6a6] [&>input:checked~label]:after:left-2/4
[&>input:checked~label]:after:bg-[#7fc6a6]
${ilabel} [&>input:checked~label]:after:text-[80%] [&>label]:after:text-[80%]
`

export const flip = `mx-[2em] my-0
[&>input]:hidden [&>input]:box-border
[&>input]:after:box-border [&>input]:before:box-border [&>input]:[&_*]:box-border [&>input]:[&_*]:after:box-border [&>input]:[&_*]:before:box-border [&>input]:[&>label]:box-border
[&>label]:block [&>label]:w-[4em] [&>label]:h-[2em] [&>label]:relative [&>label]:cursor-pointer [&>label]:select-none [&>label]:[outline:0]
[&>label]:before:h-full

[&>label]:[transition:all_0.2s_ease] [&>label]:p-0.5 [&>label]:before:content-[attr(data-tg-off)] [&>label]:font-sans [&>label]:[perspective:100px]
[&>label]:before:inline-block [&>label]:before:[transition:all_0.4s_ease] [&>label]:before:w-full [&>label]:before:text-center [&>label]:before:leading-[2em] [&>label]:before:font-[bold] [&>label]:before:text-white [&>label]:before:absolute [&>label]:before:rounded [&>label]:before:left-0 [&>label]:before:top-0 [&>label]:before:[backface-visibility:hidden]

[&>label]:before:bg-[#ff3a19]
[&>label]:active:before:[transform:rotateY(-20deg)]
[&>input:checked~label]:before:[transform:rotateY(180deg)]
[&>input:checked~label]:after:left-0 [&>input:checked~label]:after:[transform:rotateY(0)] [&>input:checked~label]:after:bg-[#7fc6a6]
[&>input:checked~label:active:after:[transform:rotateY(20deg)]

[&>label]:after:h-full
[&>label]:after:bg-[#02c66f] [&>label]:after:[transform:rotateY(-180deg)]
[&>label]:after:content-[attr(data-tg-on)]
[&>label]:after:inline-block [&>label]:after:[transition:all_0.4s_ease] [&>label]:after:w-full [&>label]:after:text-center [&>label]:after:leading-[2em] [&>label]:after:font-[bold] [&>label]:after:text-white [&>label]:after:absolute [&>label]:after:rounded [&>label]:after:left-0 [&>label]:after:top-0 [&>label]:after:[backface-visibility:hidden]

`


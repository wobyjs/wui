import { jsx as _jsx } from "woby/jsx-runtime";
// export * from '../src/custom-elements'
// export * from '../src/Button'
import { Button } from '../src/Button';
const DefaultBtn = () => { return (_jsx(Button, { children: "Default Button" })); };
const TextBtn = () => { return (_jsx(Button, { type: "text", children: "Text Button" })); };
const ContainedBtn = () => { return (_jsx(Button, { type: "contained", buttonClass: "!px-2 !py-1 !rounded-[4px]", children: "Contained Button" })); };
const OutlinedBtn = () => { return (_jsx(Button, { type: "outlined", children: "Outlined Button" })); };
const IconBtn = () => { return (_jsx(Button, { type: "icon", children: "\u2139\uFE0F" })); };
const DisabledBtn = () => { return (_jsx(Button, { disabled: true, children: "Disabled Button" })); };
const CustomBtn = () => {
    return (_jsx(Button, { type: "contained", cls: "m-2 p-2 !rounded-[5px] !text-red-500 !bg-green-200", children: "Custom Button" }));
};
const CustomBtn2 = () => {
    return (_jsx(Button, { type: true, cls: "m-2 p-2 font-bold text-white border-2 rounded-full bg-blue-500 cursor-pointer", children: "Custom Button" }));
};
const ClickMeBtn = () => {
    return (_jsx(Button, { type: "contained", buttonFunction: "submit", cls: "!px-12 !py-11 !text-red-500", onClick: () => alert('clicked me'), children: "Click me" }));
};
export { DefaultBtn, TextBtn, ContainedBtn, OutlinedBtn, IconBtn, DisabledBtn, CustomBtn, CustomBtn2,
// ClickMeBtn
 };

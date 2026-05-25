import { jsx as _jsx } from "woby/jsx-runtime";
import { ToggleButton } from '../src/ToggleButton';
const DefaultToggleButton = () => {
    return _jsx(ToggleButton, { children: "Toggle" });
};
const CheckedToggleButton = () => {
    return _jsx(ToggleButton, { checked: true, children: "Toggle" });
};
const CustomClassToggleButton = () => {
    return _jsx(ToggleButton, { cls: "m-2 p-2 border-2 rounded", children: "Toggle" });
};
const OnOffClassToggleButton = () => {
    return (_jsx(ToggleButton, { onClass: "bg-blue-500 text-white", offClass: "bg-gray-200 text-black", children: "Toggle" }));
};
export { DefaultToggleButton, CheckedToggleButton, CustomClassToggleButton, OnOffClassToggleButton };

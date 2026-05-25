import { jsx as _jsx } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { IconButton } from '../src/IconButton';
const DefaultIconButton = () => {
    return (_jsx(IconButton, { children: _jsx("svg", { focusable: "false", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" }) }) }));
};
const DisabledIconButton = () => {
    return (_jsx(IconButton, { disabled: true, children: _jsx("svg", { focusable: "false", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" }) }) }));
};
const CustomIconButton = () => {
    return (_jsx(IconButton, { class: "m-2 p-2 bg-blue-500 text-white rounded-full", children: _jsx("svg", { focusable: "false", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" }) }) }));
};
const IconButtonWithOnClick = () => {
    return (_jsx(IconButton, { onClick: () => alert('Icon button clicked!'), children: _jsx("svg", { focusable: "false", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" }) }) }));
};
export { DefaultIconButton, DisabledIconButton, CustomIconButton, IconButtonWithOnClick };

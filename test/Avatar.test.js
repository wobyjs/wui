import { jsx as _jsx } from "woby/jsx-runtime";
import Avatar from "../src/Avatar";
const DefaultAvatar = () => {
    return (_jsx(Avatar, {}));
};
const SampleAvatar = () => {
    return (_jsx(Avatar, { src: "sample-avatar.png", alt: "sample avatar" }));
};
const HAvatar = () => {
    return (_jsx(Avatar, { children: "H" }));
};
const CircularAvatar = () => {
    return (_jsx(Avatar, { type: "circular", children: "C" }));
};
const RoundedAvatar = () => {
    return (_jsx(Avatar, { type: "rounded", children: "R" }));
};
const SquareAvatar = () => {
    return (_jsx(Avatar, { type: "square", children: "S" }));
};
const CustomAvatar = () => {
    return (_jsx(Avatar, { type: true, cls: "relative flex items-center justify-center align-middle select-none leading-none overflow-hidden shrink-0 text-white m-0 w-6 h-6 text-sm bg-purple-500 rounded-full font-bold", children: "C1" }));
};
const CustomAvatar2 = () => {
    return (_jsx(Avatar, { type: true, size: "xm", cls: "relative flex items-center justify-center align-middle select-none leading-none overflow-hidden shrink-0 text-white m-0 w-8 h-8 bg-purple-500 rounded-full", children: "C2" }));
};
export { DefaultAvatar, CircularAvatar, RoundedAvatar, SquareAvatar, SampleAvatar, HAvatar, CustomAvatar, CustomAvatar2, };

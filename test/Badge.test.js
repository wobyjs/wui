import { jsx as _jsx } from "woby/jsx-runtime";
import Badge from "../src/Badge";
const DefaultBadge = () => {
    return (_jsx(Badge, { children: _jsx("div", { class: "w-10 h-10 bg-gray-400 rounded-full" }) }));
};
const BadgeWithNumber = () => {
    return (_jsx(Badge, { badgeContent: "5", children: _jsx("div", { class: "w-10 h-10 bg-gray-400 rounded-full" }) }));
};
const BadgeTopRight = () => {
    return (_jsx(Badge, { badgeContent: "TRight", vertical: "top", horizontal: "right", children: _jsx("div", { class: "w-10 h-10 bg-blue-500 rounded-full" }) }));
};
const BadgeTopLeft = () => {
    return (_jsx(Badge, { badgeContent: "TLeft", vertical: "top", horizontal: "left", children: _jsx("div", { class: "w-10 h-10 bg-green-500 rounded-full" }) }));
};
const BadgeBottomRight = () => {
    return (_jsx(Badge, { badgeContent: "BRight", vertical: "bottom", horizontal: "right", children: _jsx("div", { class: "w-10 h-10 bg-purple-500 rounded-full" }) }));
};
const BadgeBottomLeft = () => {
    return (_jsx(Badge, { badgeContent: "BLeft", vertical: "bottom", horizontal: "left", children: _jsx("div", { class: "w-10 h-10 bg-orange-500 rounded-full" }) }));
};
const BadgeCustomColor = () => {
    return (_jsx(Badge, { badgeContent: "!", badgeClass: "bg-red-500", children: _jsx("div", { class: "w-10 h-10 bg-gray-400 rounded-full" }) }));
};
const BadgeCustomColorGreen = () => {
    return (_jsx(Badge, { badgeContent: "\u2713", badgeClass: "bg-green-600", children: _jsx("div", { class: "w-10 h-10 bg-gray-400 rounded-full" }) }));
};
const BadgeBottomLeftCustom = () => {
    return (_jsx(Badge, { badgeContent: "\u2605", vertical: "bottom", horizontal: "left", badgeClass: "bg-yellow-500", children: _jsx("div", { class: "w-10 h-10 bg-indigo-500 rounded-full" }) }));
};
const BadgeTopRightLarge = () => {
    return (_jsx(Badge, { badgeContent: "999+", vertical: "top", horizontal: "right", children: _jsx("div", { class: "w-10 h-10 bg-pink-500 rounded-full" }) }));
};
const BadgeBottomRightCustom = () => {
    return (_jsx(Badge, { badgeContent: "\u25C6", vertical: "bottom", horizontal: "right", badgeClass: "bg-cyan-500", children: _jsx("div", { class: "w-10 h-10 bg-teal-500 rounded-full" }) }));
};
const BadgeTopLeftAlert = () => {
    return (_jsx(Badge, { badgeContent: "!", vertical: "top", horizontal: "left", badgeClass: "bg-red-600", children: _jsx("div", { class: "w-10 h-10 bg-gray-500 rounded-full" }) }));
};
export { DefaultBadge, BadgeTopLeft, BadgeTopRight, BadgeBottomLeft, BadgeBottomRight, BadgeCustomColor };

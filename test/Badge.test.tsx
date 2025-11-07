import Badge from "../src/Badge";

const DefaultBadge = () => {
    return (
        <Badge>
            <div class="w-10 h-10 bg-gray-400 rounded-full"></div>
        </Badge>
    )
}

const BadgeWithNumber = () => {
    return (
        <Badge badgeContent="5">
            <div class="w-10 h-10 bg-gray-400 rounded-full"></div>
        </Badge>
    )
}

const BadgeTopRight = () => {
    return (
        <Badge badgeContent="TRight" vertical="top" horizontal="right">
            <div class="w-10 h-10 bg-blue-500 rounded-full"></div>
        </Badge>
    )
}

const BadgeTopLeft = () => {
    return (
        <Badge badgeContent="TLeft" vertical="top" horizontal="left">
            <div class="w-10 h-10 bg-green-500 rounded-full"></div>
        </Badge>
    )
}

const BadgeBottomRight = () => {
    return (
        <Badge badgeContent="BRight" vertical="bottom" horizontal="right">
            <div class="w-10 h-10 bg-purple-500 rounded-full"></div>
        </Badge>
    )
}

const BadgeBottomLeft = () => {
    return (
        <Badge badgeContent="BLeft" vertical="bottom" horizontal="left">
            <div class="w-10 h-10 bg-orange-500 rounded-full"></div>
        </Badge>
    )
}

const BadgeCustomColor = () => {
    return (
        <Badge badgeContent="!" badgeClass="bg-red-500">
            <div class="w-10 h-10 bg-gray-400 rounded-full"></div>
        </Badge>
    )
}

const BadgeCustomColorGreen = () => {
    return (
        <Badge badgeContent="✓" badgeClass="bg-green-600">
            <div class="w-10 h-10 bg-gray-400 rounded-full"></div>
        </Badge>
    )
}

const BadgeBottomLeftCustom = () => {
    return (
        <Badge badgeContent="★" vertical="bottom" horizontal="left" badgeClass="bg-yellow-500">
            <div class="w-10 h-10 bg-indigo-500 rounded-full"></div>
        </Badge>
    )
}

const BadgeTopRightLarge = () => {
    return (
        <Badge badgeContent="999+" vertical="top" horizontal="right">
            <div class="w-10 h-10 bg-pink-500 rounded-full"></div>
        </Badge>
    )
}

const BadgeBottomRightCustom = () => {
    return (
        <Badge badgeContent="◆" vertical="bottom" horizontal="right" badgeClass="bg-cyan-500">
            <div class="w-10 h-10 bg-teal-500 rounded-full"></div>
        </Badge>
    )
}

const BadgeTopLeftAlert = () => {
    return (
        <Badge badgeContent="!" vertical="top" horizontal="left" badgeClass="bg-red-600">
            <div class="w-10 h-10 bg-gray-500 rounded-full"></div>
        </Badge>
    )
}

export { DefaultBadge, BadgeTopLeft, BadgeTopRight, BadgeBottomLeft, BadgeBottomRight, BadgeCustomColor };
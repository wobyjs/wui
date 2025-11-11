import Avatar from "../src/Avatar";

const DefaultAvatar = () => {
    return (<Avatar />)
}

const SampleAvatar = () => {
    return (<Avatar src="sample-avatar.png" alt="sample avatar" />)
}

const HAvatar = () => {
    return (<Avatar>H</Avatar>)
}

const CustomAvatar = () => {
    return (<Avatar cls="w-6 h-6 !text-sm bg-purple-500">JL</Avatar>)
}

const CustomAvatar2 = () => {
    return (<Avatar cls="w-6 h-6 !text-sm bg-purple-500 !text-green-400 !font-bold">R</Avatar>)
}

export { DefaultAvatar, SampleAvatar, HAvatar, CustomAvatar, CustomAvatar2 };
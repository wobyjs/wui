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

const CircularAvatar = () => {
    return (<Avatar type="circular">C</Avatar>)
}

const RoundedAvatar = () => {
    return (<Avatar type="rounded">R</Avatar>)
}

const SquareAvatar = () => {
    return (<Avatar type="square">S</Avatar>)
}

const CustomAvatar = () => {
    return (<Avatar type cls="relative flex items-center justify-center align-middle select-none leading-none overflow-hidden shrink-0 text-white m-0 w-6 h-6 text-sm bg-purple-500 rounded-full font-bold">C1</Avatar>)
}

const CustomAvatar2 = () => {
    return (<Avatar type size="xm" cls="relative flex items-center justify-center align-middle select-none leading-none overflow-hidden shrink-0 text-white m-0 w-8 h-8 bg-purple-500 rounded-full">C2</Avatar>)
}

export {
    DefaultAvatar,
    CircularAvatar,
    RoundedAvatar,
    SquareAvatar,
    SampleAvatar,
    HAvatar,
    CustomAvatar,
    CustomAvatar2,
};
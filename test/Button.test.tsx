// export * from '../src/custom-elements'
// export * from '../src/Button'

import { Button } from '../src/Button'

const DefaultBtn = () => { return (<Button>Default Button</Button>) }

const TextBtn = () => { return (<Button type="text">Text Button</Button>) }

const ContainedBtn = () => { return (<Button type="contained" cls="!px-2 !py-1 !rounded-[4px]">Contained Button</Button>) }

const OutlinedBtn = () => { return (<Button type="outlined">Outlined Button</Button>) }

const IconBtn = () => { return (<Button type="icon">ℹ️</Button>) }

const DisabledBtn = () => { return (<Button disabled>Disabled Button</Button>) }

const CustomBtn = () => {
    return (
        <Button type="contained" cls="m-2 p-2 !rounded-[5px] !text-red-500 !bg-green-200">Custom Button</Button>
    )
}

const CustomBtn2 = () => {
    return (
        <Button type cls="m-2 p-2 font-bold text-white border-2 rounded-full bg-blue-500 cursor-pointer">Custom Button</Button>
    )
}

const ClickMeBtn = () => {
    return (
        <Button
            type="contained"
            buttonFunction="submit"
            cls="!px-12 !py-11 !text-red-500"
            onClick={() => alert('clicked me')}
        >
            Click me
        </Button>
    )
}


export {
    DefaultBtn,
    TextBtn,
    ContainedBtn,
    OutlinedBtn,
    IconBtn,
    DisabledBtn,
    CustomBtn,
    CustomBtn2,
    // ClickMeBtn
}
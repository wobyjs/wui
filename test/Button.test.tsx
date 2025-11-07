// export * from '../src/custom-elements'
// export * from '../src/Button'

import { Button } from '../src/Button'

const TextBtn = () => { return (<Button buttonType="text">Text Button</Button>) }

const ContainedBtn = () => { return (<Button buttonType="contained" class="!px-2 !py-1 !rounded-[4px]">Contained Button</Button>) }

const OutlinedBtn = () => { return (<Button buttonType="outlined">Outlined Button</Button>) }

const IconBtn = () => { return (<Button buttonType="icon">ℹ️</Button>) }

const DisabledBtn = () => { return (<Button disabled>Disabled Button</Button>) }

const DisabledBtn2 = () => { return (<Button buttonType="text" disabled>Text Disabled Button</Button>) }

const ClickMeBtn = () => {
    return (
        <Button
            buttonType="contained"
            buttonFunction="submit"
            class="!px-12 !py-11 !text-red-500"
            onClick={() => alert('clicked me')}
        >
            Click me
        </Button>
    )
}


export { TextBtn, ContainedBtn, OutlinedBtn, IconBtn, DisabledBtn, DisabledBtn2, ClickMeBtn }
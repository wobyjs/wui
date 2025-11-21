import { $ } from 'woby'
import { ToggleButton } from '../src/ToggleButton'

const DefaultToggleButton = () => {
    return <ToggleButton>Toggle</ToggleButton>
}

const CheckedToggleButton = () => {
    return <ToggleButton checked={$<boolean>(true)}>Toggle</ToggleButton>
}

const CustomClassToggleButton = () => {
    return <ToggleButton cls={$<string>("m-2 p-2 border-2 rounded")}>Toggle</ToggleButton>
}

const OnOffClassToggleButton = () => {
    return (
        <ToggleButton 
            onClass={$<string>("bg-blue-500 text-white")} 
            offClass={$<string>("bg-gray-200 text-black")}
        >
            Toggle
        </ToggleButton>
    )
}

export {
    DefaultToggleButton,
    CheckedToggleButton,
    CustomClassToggleButton,
    OnOffClassToggleButton
}
/** @jsxImportSource woby */
import { $ } from 'woby'
import { NumberField } from '../src/NumberField'

const DefaultNumberField = () => {
    return <NumberField />
}

const ValueNumberField = () => {
    return <NumberField value={10} />
}

const MinMaxNumberField = () => {
    return <NumberField min={0} max={50} value={25} />
}

const StepNumberField = () => {
    return <NumberField step={5} value={10} />
}

const DisabledNumberField = () => {
    return <NumberField disabled={true} />
}

const CustomClassNumberField = () => {
    return <NumberField cls="m-2 p-2 border-2 rounded" />
}

export {
    DefaultNumberField,
    ValueNumberField,
    MinMaxNumberField,
    StepNumberField,
    DisabledNumberField,
    CustomClassNumberField
}
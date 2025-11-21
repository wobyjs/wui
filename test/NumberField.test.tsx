import { $ } from 'woby'
import { NumberField } from '../src/NumberField'

const DefaultNumberField = () => {
    return <NumberField />
}

const ValueNumberField = () => {
    return <NumberField value={$<number>(10)} />
}

const MinMaxNumberField = () => {
    return <NumberField min={$<number>(0)} max={$<number>(50)} value={$<number>(25)} />
}

const StepNumberField = () => {
    return <NumberField step={$<number>(5)} value={$<number>(10)} />
}

const DisabledNumberField = () => {
    return <NumberField disabled={$<boolean>(true)} />
}

const CustomClassNumberField = () => {
    return <NumberField cls={$<string>("m-2 p-2 border-2 rounded")} />
}

export {
    DefaultNumberField,
    ValueNumberField,
    MinMaxNumberField,
    StepNumberField,
    DisabledNumberField,
    CustomClassNumberField
}
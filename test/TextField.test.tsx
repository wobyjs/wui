import { $ } from 'woby'
import { TextField } from '../src/TextField'

const DefaultTextField = () => {
    return <TextField />
}

const PlaceholderTextField = () => {
    return <TextField placeholder={$<string>("Enter your name")} />
}

const ValueTextField = () => {
    return <TextField value={$<string>("John Doe")} />
}

const DisabledTextField = () => {
    return <TextField disabled={$<boolean>(true)} />
}

const CustomClassTextField = () => {
    return <TextField cls={$<string>("m-2 p-2 border-2 rounded")} />
}

const WithLabelTextField = () => {
    return (
        <TextField children={$<JSX.Child>(<label class="block text-gray-700 text-sm font-bold mb-2">Name</label>)} />
    )
}

export {
    DefaultTextField,
    PlaceholderTextField,
    ValueTextField,
    DisabledTextField,
    CustomClassTextField,
    WithLabelTextField
}
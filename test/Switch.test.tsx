import { Switch } from '../src/Switch'

const DefaultSwitch = () => {
    return <Switch />
}

const CustomLabelsSwitch = () => {
    return <Switch on="YES" off="NO" />
}

const CheckedSwitch = () => {
    return <Switch checked={true} />
}

const DisabledSwitch = () => {
    return <Switch disabled={true} />
}

const CustomClassSwitch = () => {
    return <Switch cls="m-2 p-2 border-2 rounded" />
}

export {
    DefaultSwitch,
    CustomLabelsSwitch,
    CheckedSwitch,
    DisabledSwitch,
    CustomClassSwitch
}
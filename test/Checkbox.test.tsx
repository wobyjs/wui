// export * from '../src/custom-elements'
// export * from '../src/Checkbox'

import { Checkbox } from '../src/Checkbox'

const DefaultCheckBox = () => { return (<Checkbox id="default-checkbox">Default Checkbox</Checkbox>) }

const LeftLabelCheckBox = () => { return (<Checkbox id="left-label-checkbox" labelPosition="left">Left Label</Checkbox>) }

const RightLabelCheckBox = () => { return (<Checkbox id="right-label-checkbox" labelPosition="right">Right Label</Checkbox>) }

const TopLabelCheckBox = () => { return (<Checkbox id="top-label-checkbox" labelPosition="top">Top Label</Checkbox>) }

const BottomLabelCheckBox = () => { return (<Checkbox id="bottom-label-checkbox" labelPosition="bottom">Bottom Label</Checkbox>) }

const CheckedCheckBox = () => { return (<Checkbox id="checked-checkbox" checked>Checked by default</Checkbox>) }

const DisabledCheckBox = () => { return (<Checkbox id="disabled-checkbox" disabled>Disabled Checkbox</Checkbox>) }

const DisabledCheckedCheckBox = () => { return (<Checkbox id="disabled-checked-checkbox" checked disabled>Disabled & Checked</Checkbox>) }

const CustomClassCheckBox = () => {
    return (
        <Checkbox id="custom-class-checkbox" labelPosition="right" class="!text-blue-500 !font-bold" onChange={(e) => console.log('Checkbox changed:', e.target.checked)}>
            Custom styled checkbox
        </Checkbox>
    )
}

export {
    DefaultCheckBox,
    LeftLabelCheckBox,
    RightLabelCheckBox,
    TopLabelCheckBox,
    BottomLabelCheckBox,
    CheckedCheckBox,
    DisabledCheckBox,
    DisabledCheckedCheckBox,
    CustomClassCheckBox
}


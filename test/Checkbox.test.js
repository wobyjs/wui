import { jsx as _jsx } from "woby/jsx-runtime";
// export * from '../src/custom-elements'
// export * from '../src/Checkbox'
import { Checkbox } from '../src/Checkbox';
const DefaultCheckBox = () => { return (_jsx(Checkbox, { id: "default-checkbox", children: "Default Checkbox" })); };
const LeftLabelCheckBox = () => { return (_jsx(Checkbox, { id: "left-label-checkbox", labelPosition: "left", children: "Left Label" })); };
const RightLabelCheckBox = () => { return (_jsx(Checkbox, { id: "right-label-checkbox", labelPosition: "right", children: "Right Label" })); };
const TopLabelCheckBox = () => { return (_jsx(Checkbox, { id: "top-label-checkbox", labelPosition: "top", children: "Top Label" })); };
const BottomLabelCheckBox = () => { return (_jsx(Checkbox, { id: "bottom-label-checkbox", labelPosition: "bottom", children: "Bottom Label" })); };
const CheckedCheckBox = () => { return (_jsx(Checkbox, { id: "checked-checkbox", checked: true, children: "Checked by default" })); };
const DisabledCheckBox = () => { return (_jsx(Checkbox, { id: "disabled-checkbox", disabled: true, children: "Disabled Checkbox" })); };
const DisabledCheckedCheckBox = () => { return (_jsx(Checkbox, { id: "disabled-checked-checkbox", checked: true, disabled: true, children: "Disabled & Checked" })); };
const CustomClassCheckBox = () => {
    return (_jsx(Checkbox, { id: "custom-class-checkbox", labelPosition: "right", cls: "!text-blue-500 !font-bold", onChange: (e) => console.log('Checkbox changed:', e.target.checked), children: "Custom styled checkbox" }));
};
export { DefaultCheckBox, LeftLabelCheckBox, RightLabelCheckBox, TopLabelCheckBox, BottomLabelCheckBox, CheckedCheckBox, DisabledCheckBox, DisabledCheckedCheckBox, CustomClassCheckBox };

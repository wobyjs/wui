import { jsx as _jsx } from "woby/jsx-runtime";
import { NumberField } from '../src/NumberField';
const DefaultNumberField = () => {
    return _jsx(NumberField, {});
};
const ValueNumberField = () => {
    return _jsx(NumberField, { value: 10 });
};
const MinMaxNumberField = () => {
    return _jsx(NumberField, { min: 0, max: 50, value: 25 });
};
const StepNumberField = () => {
    return _jsx(NumberField, { step: 5, value: 10 });
};
const DisabledNumberField = () => {
    return _jsx(NumberField, { disabled: true });
};
const CustomClassNumberField = () => {
    return _jsx(NumberField, { cls: "m-2 p-2 border-2 rounded" });
};
export { DefaultNumberField, ValueNumberField, MinMaxNumberField, StepNumberField, DisabledNumberField, CustomClassNumberField };

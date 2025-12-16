import { EndAdornment, StartAdornment, TextField } from '../src/TextField'

const BorderEffects = () => {
    return (
        <div class="space-y-8 mt-4">
            <h3 class="font-bold text-gray-500 uppercase italic">Border Effects</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

                <TextField effect="effect1" placeholder="Effect 1" />
                <TextField effect="effect2" placeholder="Effect 2" />
                <TextField effect="effect3" placeholder="Effect 3" />

                <TextField effect="effect4" placeholder="Effect 4" />
                <TextField effect="effect5" placeholder="Effect 5" />
                <TextField effect="effect6" placeholder="Effect 6" />

                <TextField effect="effect7" placeholder="Effect 7" />
                <TextField effect="effect8" placeholder="Effect 8" />
                <TextField effect="effect9" placeholder="Effect 9" />
            </div>
        </div>
    )
}

const BackgroundEffects = () => {
    return (
        <div class="space-y-8 mt-4">
            <h3 class="font-bold text-gray-500 uppercase">Background Effects</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

                <TextField effect="effect10" placeholder="Effect 10" />
                <TextField effect="effect11" placeholder="Effect 11" />
                <TextField effect="effect12" placeholder="Effect 12" />

                <TextField effect="effect13" placeholder="Effect 13" />
                <TextField effect="effect14" placeholder="Effect 14" />
                <TextField effect="effect15" placeholder="Effect 15" />
            </div>
        </div>
    )
}

const InputWithLabelEffects = () => {
    return (
        <div class="space-y-8 mt-4">
            <h3 class="font-bold text-gray-500 uppercase">Input with Label Effects</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <TextField effect="effect16" label="Effect 16" />
                <TextField effect="effect17" label="Effect 17" />
                <TextField effect="effect18" label="Effect 18" />

                <TextField effect="effect19" label="Effect 19" />
                <TextField effect="effect20" label="Effect 20" />
                <TextField effect="effect21" label="Effect 21" />

                <TextField effect="effect22" label="Effect 22" />
                <TextField effect="effect23" label="Effect 23" />
                <TextField effect="effect24" label="Effect 24" />
            </div>
        </div>
    )
}

const AlternativeLabelEffects = () => {
    return (
        <div class="space-y-8 mt-4">
            <h3 class="font-bold text-gray-500 uppercase">Alternative Label Effects</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <TextField effect="effect19a" label="Effect 19a" />
                <TextField effect="effect20a" label="Effect 20a" />
                <TextField effect="effect21a" label="Effect 21a" />

            </div>
        </div>
    )
}

const AdornmentEffects = () => {
    return (
        <div class="space-y-8 mt-4">
            <h3 class="font-bold text-gray-500 uppercase">TextField With Adornment Effects</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <TextField effect="effect19a" label="Effect 19a">
                    <StartAdornment>
                        <span>@</span>
                    </StartAdornment>
                </TextField>
                <TextField effect="effect20a" label="Effect 20a">
                    <EndAdornment>
                        <span>@</span>
                    </EndAdornment>
                </TextField>
                <TextField effect="effect21a" label="Effect 21a" />
            </div>
        </div>
    )
}



export {

    BorderEffects,
    BackgroundEffects,
    InputWithLabelEffects,
    AlternativeLabelEffects,
    AdornmentEffects,

    // UnderlineEffects,
    // BoxEffects,
    // OutlineEffects,
    // FillEffects,
    // FloatingLabelsUnderlineEffects,
    // FloatingLabelsBoxEffects,
    // FloatingLabelsFillEffects,
    // AlternativeBoxEffects,
}
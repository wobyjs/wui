import { $ } from 'woby'
import { EndAdornment, StartAdornment, TextField } from '../src/TextField'


// Helper for the "Green Line" animations required by your CSS
// const Spans = () => (
//     <>
//         <span class="pointer-events-none"></span>
//         {/* Some effects use span_i for side borders */}
//         <span_i class="pointer-events-none"></span_i>
//     </>
// )

// export const TextFieldGallery = () => {
//     // Reactive value for binding examples
//     const username = $("")

//     return (
//         <div class="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 bg-white">

//             {/* SECTION 1: UNDERLINE EFFECTS (1-3) */}
//             <div class="space-y-6">
//                 <h3 class="font-bold text-gray-500 uppercase">Underline Effects</h3>

//                 {/* Effect 1: Center Out */}
//                 <TextField effect="effect1" placeholder="Effect 1 (Center Out)">

//                 </TextField>

//                 {/* Effect 2: Left to Right */}
//                 <TextField effect="effect2" placeholder="Effect 2 (Left -> Right)">

//                 </TextField>

//                 {/* Effect 3: Split Center */}
//                 <TextField effect="effect3" placeholder="Effect 3 (Split)">

//                 </TextField>
//             </div>

//             {/* SECTION 2: BOX EFFECTS (4-6) */}
//             <div class="space-y-6">
//                 <h3 class="font-bold text-gray-500 uppercase">Box Effects</h3>

//                 {/* Effect 4: Bottom Up */}
//                 <TextField effect="effect4" placeholder="Effect 4 (Bottom Up)">

//                 </TextField>

//                 {/* Effect 5: Left to Right Box */}
//                 <TextField effect="effect5" placeholder="Effect 5 (Left -> Right)">

//                 </TextField>

//                 {/* Effect 6: Right to Left Box with Password Type */}
//                 <TextField
//                     effect="effect6"
//                     inputType="password"
//                     placeholder="Effect 6 (Password)"
//                 >

//                 </TextField>
//             </div>

//             {/* SECTION 3: OUTLINE EFFECTS (7-9) */}
//             <div class="space-y-6">
//                 <h3 class="font-bold text-gray-500 uppercase">Outline Effects</h3>

//                 {/* Effect 7: Split Center */}
//                 <TextField effect="effect7" placeholder="Effect 7 (Split)">

//                 </TextField>

//                 {/* Effect 8: Corners */}
//                 <TextField effect="effect8" placeholder="Effect 8 (Corners)">

//                 </TextField>

//                 {/* Effect 9: Snake / Chasing */}
//                 <TextField effect="effect9" placeholder="Effect 9 (Snake)">

//                 </TextField>
//             </div>

//             {/* SECTION 4: FILL EFFECTS (10-15) */}
//             <div class="space-y-6">
//                 <h3 class="font-bold text-gray-500 uppercase">Fill Effects</h3>

//                 <TextField effect="effect10" placeholder="Effect 10 (Fade)">

//                 </TextField>

//                 <TextField effect="effect11" placeholder="Effect 11 (Swipe)">

//                 </TextField>

//                 {/* Effect 12 with Disabled State */}
//                 <TextField
//                     effect="effect12"
//                     disabled={true}
//                     placeholder="Effect 12 (Disabled)"
//                     value="Disabled Input"
//                 >

//                 </TextField>

//                 <TextField effect="effect13" placeholder="Effect 13 (Split)">

//                 </TextField>

//                 <TextField effect="effect14" placeholder="Effect 14 (Diagonal)">

//                 </TextField>

//                 {/* Two-way binding example */}
//                 <TextField
//                     effect="effect15"
//                     value={username}
//                     placeholder={`Effect 15 (Typed: ${username})`}
//                 >

//                 </TextField>
//             </div>

//             {/* SECTION 5: FLOATING LABELS - UNDERLINE (16-18) */}
//             <div class="space-y-8 mt-4">
//                 <h3 class="font-bold text-gray-500 uppercase">Floating Labels (Line)</h3>

//                 {/* Note:  is often needed for CSS :placeholder-shown logic */}

//                 <TextField effect="effect16" >
//                     <label class="pointer-events-none">Effect 16 Label</label>

//                 </TextField>

//                 <TextField effect="effect17" >
//                     <label class="pointer-events-none">Effect 17 Label</label>

//                 </TextField>

//                 <TextField effect="effect18" >
//                     <label class="pointer-events-none">Effect 18 Label</label>

//                 </TextField>
//             </div>

//             {/* SECTION 6: FLOATING LABELS - BOX (19-21) */}
//             <div class="space-y-8 mt-4">
//                 <h3 class="font-bold text-gray-500 uppercase">Floating Labels (Box)</h3>

//                 <TextField effect="effect19" >
//                     <label class="pointer-events-none">Effect 19 Label</label>

//                 </TextField>

//                 <TextField effect="effect20" >
//                     <label class="pointer-events-none">Effect 20 Label</label>

//                 </TextField>

//                 {/* Assign on Enter Example */}
//                 <TextField
//                     effect="effect21"
//                     
//                     assignOnEnter={true}
//                 >
//                     <label class="pointer-events-none">Effect 21 (Enter Only)</label>

//                 </TextField>
//             </div>

//             {/* SECTION 7: FLOATING LABELS - FILL (22-24) */}
//             <div class="space-y-8 mt-4">
//                 <h3 class="font-bold text-gray-500 uppercase">Floating Labels (Fill)</h3>

//                 <TextField effect="effect22" >
//                     <label class="pointer-events-none">Effect 22 Label</label>

//                 </TextField>

//                 <TextField effect="effect23" >
//                     <label class="pointer-events-none">Effect 23 Label</label>

//                 </TextField>

//                 <TextField effect="effect24" >
//                     <label class="pointer-events-none">Effect 24 Label</label>

//                 </TextField>
//             </div>

//             {/* SECTION 8: ALTERNATIVE BOX EFFECTS (19a-21a) */}
//             {/* These are the "Cut Border" styles */}
//             <div class="space-y-8 mt-4">
//                 <h3 class="font-bold text-gray-500 uppercase">Alt Box (Cut Line)</h3>

//                 <TextField effect="effect19a" >
//                     <label class="pointer-events-none">Effect 19a</label>

//                 </TextField>

//                 <TextField effect="effect20a" >
//                     <label class="pointer-events-none">Effect 20a</label>

//                 </TextField>

//                 <TextField effect="effect21a" >
//                     <label class="pointer-events-none">Effect 21a</label>

//                 </TextField>
//             </div>

//         </div >
//     )
// }


const UnderlineEffects = () => {
    return (
        <div class="space-y-6">
            <h3 class="font-bold text-gray-500 uppercase">Underline Effects</h3>

            {/* Effect 1: Center Out */}
            <TextField effect="effect1" placeholder="Effect 1 (Center Out)" />

            {/* Effect 2: Left to Right */}
            <TextField effect="effect2" placeholder="Effect 2 (Left -> Right)" />

            {/* Effect 3: Split Center */}
            <TextField effect="effect3" placeholder="Effect 3 (Split)" />
        </div>
    )
}

const BoxEffects = () => {

    return (
        <div class="space-y-6">
            <h3 class="font-bold text-gray-500 uppercase">Box Effects</h3>

            {/* Effect 4: Bottom Up */}
            <TextField effect="effect4" placeholder="Effect 4 (Bottom Up)" />

            {/* Effect 5: Left to Right Box */}
            <TextField effect="effect5" placeholder="Effect 5 (Left -> Right)" />

            {/* Effect 6: Right to Left Box with Password Type */}
            <TextField effect="effect6" inputType="password" placeholder="Effect 6 (Password)" />


        </div>
    )
}

const OutlineEffects = () => {
    return (
        <div class="space-y-6">
            <h3 class="font-bold text-gray-500 uppercase">Outline Effects</h3>

            {/* Effect 7: Split Center */}
            <TextField effect="effect7" placeholder="Effect 7 (Split)" />


            {/* Effect 8: Corners */}
            <TextField effect="effect8" placeholder="Effect 8 (Corners)" />


            {/* Effect 9: Snake / Chasing */}
            <TextField effect="effect9" placeholder="Effect 9 (Snake)" />


        </div>
    )
}

const FillEffects = () => {
    const username = $("")
    return (
        <div class="space-y-6">
            <h3 class="font-bold text-gray-500 uppercase">Fill Effects</h3>

            <TextField effect="effect10" placeholder="Effect 10 (Fade)" />


            <TextField effect="effect11" placeholder="Effect 11 (Swipe)" />


            {/* Effect 12 with Disabled State */}
            {/* <TextField
                effect="effect12"
                disabled={true}
                placeholder="Effect 12 (Disabled)"
                value="Disabled Input"
            /> */}
            <TextField effect="effect12" placeholder="Effect 12" />


            <TextField effect="effect13" placeholder="Effect 13 (Split)" />


            <TextField effect="effect14" placeholder="Effect 14 (Diagonal)" />



            {/* Two-way binding example */}
            <TextField
                effect="effect15"
                value={username}
                placeholder={`Effect 15 (Typed: ${username})`}
            />


        </div>
    )
}

const FloatingLabelsUnderlineEffects = () => {
    return (
        <div class="space-y-8 mt-4">
            <h3 class="font-bold text-gray-500 uppercase">Floating Labels (Line)</h3>

            {/* Note:  is often needed for CSS :placeholder-shown logic */}

            <TextField effect="effect16" label="Effect 16">

            </TextField>

            <TextField effect="effect17" label="Effect 17">
            </TextField>

            <TextField effect="effect18" label="Effect 18">
            </TextField>
        </div>
    )
}

const FloatingLabelsBoxEffects = () => {
    return (
        <div class="space-y-8 mt-4">
            <h3 class="font-bold text-gray-500 uppercase">Floating Labels (Box)</h3>

            <TextField effect="effect19" >
                <label class="pointer-events-none">Effect 19 Label</label>
            </TextField>

            <TextField effect="effect20" >
                <label class="pointer-events-none">Effect 20 Label</label>
            </TextField>

            {/* Assign on Enter Example */}
            <TextField
                effect="effect21"
                assignOnEnter={true}
            >
                <label class="pointer-events-none">Effect 21 (Enter Only)</label>
            </TextField>
        </div>
    )
}

const FloatingLabelsFillEffects = () => {
    return (
        <div class="space-y-8 mt-4">
            <h3 class="font-bold text-gray-500 uppercase">Floating Labels (Fill)</h3>

            <TextField effect="effect22" >
                <label class="pointer-events-none">Effect 22 Label</label>

            </TextField>

            <TextField effect="effect23" >
                <label class="pointer-events-none">Effect 23 Label</label>

            </TextField>

            <TextField effect="effect24" >
                <label class="pointer-events-none">Effect 24 Label</label>

            </TextField>
        </div>
    )
}

const AlternativeBoxEffects = () => {
    return (
        <div class="space-y-8 mt-4">
            <h3 class="font-bold text-gray-500 uppercase">Alt Box (Cut Line)</h3>

            <TextField effect="effect19a" >
                <label class="pointer-events-none">Effect 19a</label>
            </TextField>

            <TextField effect="effect20a" >
                <label class="pointer-events-none">Effect 20a</label>
            </TextField>

            <TextField effect="effect21a" >
                <label class="pointer-events-none">Effect 21a</label>
            </TextField>
        </div>
    )
}

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
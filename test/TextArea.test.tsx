import { $, $$ } from "woby"
import { TextArea } from "../src/TextArea"


const BorderEffectTextArea = () => {
    const resize = $("none")

    return (
        <div class="space-y-2">
            <h3 class="font-bold text-gray-500 uppercase">Border Effect</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <TextArea resize={resize} effect="effect1" placeholder="Effect 1 TextArea..." />
                <TextArea resize={resize} effect="effect2" placeholder="Effect 2 TextArea..." />
                <TextArea resize={resize} effect="effect3" placeholder="Effect 3 TextArea..." />
                <TextArea resize={resize} effect="effect4" placeholder="Effect 4 TextArea..." />
                <TextArea resize={resize} effect="effect5" placeholder="Effect 5 TextArea..." />
                <TextArea resize={resize} effect="effect6" placeholder="Effect 6 TextArea..." />
                <TextArea resize={resize} effect="effect7" placeholder="Effect 7 TextArea..." />
                <TextArea resize={resize} effect="effect8" placeholder="Effect 8 TextArea..." />
                <TextArea resize={resize} effect="effect9" placeholder="Effect 9 TextArea..." />
            </div>
        </div>
    )
}


const FillEffects = () => {
    const resize = $("none");

    return (
        <div class="space-y-2">
            <h3 class="font-bold text-gray-500 uppercase">Fill Effect</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <TextArea resize={resize} effect="effect10" placeholder="Effect 10 TextArea..." />
                <TextArea resize={resize} effect="effect11" placeholder="Effect 11 TextArea..." />
                <TextArea resize={resize} effect="effect12" placeholder="Effect 12 TextArea..." />
                <TextArea resize={resize} effect="effect13" placeholder="Effect 13 TextArea..." />
                <TextArea resize={resize} effect="effect14" placeholder="Effect 14 TextArea..." />
                <TextArea resize={resize} effect="effect15" placeholder="Effect 15 TextArea..." />
            </div>
        </div>
    )
}


const LabelEffects = () => {
    const resize = $("none");

    return (
        <div class="space-y-2">
            <h3 class="font-bold text-gray-500 uppercase">Label Effect</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <TextArea resize={resize} effect="effect16" label="Effect 16" />
                <TextArea resize={resize} effect="effect17" label="Effect 17" />
                <TextArea resize={resize} effect="effect18" label="Effect 18" />

                <TextArea resize={resize} effect="effect19" label="Effect 19" />
                <TextArea resize={resize} effect="effect20" label="Effect 20" />
                <TextArea resize={resize} effect="effect21" label="Effect 21" />

                <TextArea resize={resize} effect="effect22" label="Effect 22" />
                <TextArea resize={resize} effect="effect23" label="Effect 23" />
                <TextArea resize={resize} effect="effect24" label="Effect 24" />

            </div>
        </div>
    )
}


const AlternativeEffects = () => {
    const resize = $("none");

    return (
        <div class="space-y-2">
            <h3 class="font-bold text-gray-500 uppercase">Label Effect</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <TextArea resize={resize} effect="effect19a" label="Effect 19a" />
                <TextArea resize={resize} effect="effect20a" label="Effect 20a" />
                <TextArea resize={resize} effect="effect21a" label="Effect 21a" />
            </div>
        </div>
    )
}


const ResizeableBorderEffects = () => {
    const resize = $("both")

    return (
        <div class="space-y-2">
            <h3 class="font-bold text-gray-500 uppercase">Underline Effect Resizeable TextArea (Effect 1 - 3)</h3>
            <TextArea cls="w-[300px] h-[100px]" resize={resize} effect="effect1" placeholder="Underline Effect Textarea..." />
            <hr class="mx-auto my-2 border-gray-300 border-1" />

            <h3 class="font-bold text-gray-500 uppercase">Box Effect Resizeable TextArea (Effect 4 - 6)</h3>
            <TextArea cls="w-[300px] h-[100px]" resize={resize} effect="effect4" placeholder="Box Effect Textarea..." />
            <hr class="mx-auto my-2 border-gray-300 border-1" />

            <h3 class="font-bold text-gray-500 uppercase">Outline Effect Resizeable TextArea (Effect 7 - 9)</h3>
            <TextArea cls="w-[300px] h-[100px]" resize={resize} effect="effect7" placeholder="Outline Effect Textarea..." />
        </div>
    )
}

const ResizeableFillEffects = () => {
    const resize = $("both")

    return (
        <div class="space-y-2">
            <h3 class="font-bold text-gray-500 uppercase">Fill Effect Resizeable TextArea (Effect 10 - 15)</h3>
            <TextArea cls="w-[300px] h-[100px]" resize={resize} effect="effect10" placeholder="Fill Effect Textarea..." />
        </div>
    )
}

const ResizeableLabelEffects = () => {
    const resize = $("both")

    return (
        <div class="space-y-2">
            <h3 class="font-bold text-gray-500 uppercase">With Label Effect Resizeable TextArea (Effect 16 - 18)</h3>
            <TextArea cls="w-[300px] h-[100px]" resize={resize} effect="effect16" label="Underline Effect Textarea..." />
            <hr class="mx-auto my-2 border-gray-300 border-1" />

            <h3 class="font-bold text-gray-500 uppercase">With Label Effect Resizeable TextArea (Effect 19 - 21)</h3>
            <TextArea cls="w-[300px] h-[100px]" resize={resize} effect="effect19" label="Box Effect Textarea..." />
            <hr class="mx-auto my-2 border-gray-300 border-1" />

            <h3 class="font-bold text-gray-500 uppercase">With Label Effect Resizeable TextArea (Effect 22 - 24)</h3>
            <TextArea cls="w-[300px] h-[100px]" resize={resize} effect="effect22" label="Fill Effect Textarea..." />
        </div>
    )
}

export {
    BorderEffectTextArea,
    FillEffects,
    LabelEffects,
    AlternativeEffects,

    ResizeableBorderEffects,
    ResizeableFillEffects,
    ResizeableLabelEffects
}
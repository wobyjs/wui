import AlignButton from '../src/Editor/AlignButton'

const DefaultAlignButton = () => {
    return <AlignButton />
}

const AlignLeftButton = () => {
    return <AlignButton contentAlign="start" />
}

const AlignCenterButton = () => {
    return <AlignButton contentAlign="center" />
}

const AlignRightButton = () => {
    return <AlignButton contentAlign="end" />
}

const DisableAlignButton = () => {
    return <AlignButton contentAlign="start" disabled />
}

export { DefaultAlignButton, DisableAlignButton, AlignLeftButton, AlignCenterButton, AlignRightButton }
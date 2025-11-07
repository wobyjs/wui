import { Card, CardMedia, CardContent, CardActions } from "../src/Card"
import { Button } from "../src/Button"

const DefaultCard = () => {
    return (
        <Card class="m-2">
            <CardMedia />
            <CardContent>Card Content Sample</CardContent>
            <CardActions>Card Actions Sample</CardActions>
        </Card>
    )
}

const VariantCardExample = () => {
    return (
        <Card
            class="max-w-sm m-2"   // sizing & external spacing
            variant="elevated"     // "elevated" | "outlined" | "filled"
            elevation={2}          // 0–4: shadow strength
            interactive={true}            // hover: raise the shadow
        >
            <CardContent>
                <h3 class="text-lg font-semibold">Elevated Card</h3>
                <p class="text-sm text-gray-600">
                    elevation=2, interactive hover shadow
                </p>
            </CardContent>
        </Card>


    )
}

const OutlinedCardExample = () => (
    <Card class="max-w-sm m-2" variant="outlined" elevation={0}>
        <CardContent>
            <h3 class="text-lg font-semibold">Outlined Card</h3>
            <p class="text-sm text-gray-600">Border only, no elevation</p>
        </CardContent>
    </Card>
)

// style="box-shadow: rgb(255, 6, 6) 0px 2px 1px -1px, rgb(255, 1, 1) 0px 1px 1px 0px, rgb(255, 0, 0) 0px 1px 3px 0px;"
const FilledCardExample = () => (
    <Card class="max-w-sm m-2" variant="filled" elevation={0} interactive>
        <CardContent>
            <h3 class="text-lg font-semibold">Filled Card</h3>
            <p class="text-sm text-gray-600">Subtle filled bg + strong shadow</p>
        </CardContent>
    </Card>
)

const FilledCardExample1 = () => (
    <Card class="max-w-sm m-2" variant="filled" elevation={2} interactive>
        <CardContent>
            <h3 class="text-lg font-semibold">Filled Card</h3>
            <p class="text-sm text-gray-600">Subtle filled bg + strong shadow</p>
        </CardContent>
    </Card>
)

const FilledCardExample2 = () => (
    <Card class="max-w-sm m-2" variant="filled" elevation={2}>
        <CardContent>
            <h3 class="text-lg font-semibold">Filled Card</h3>
            <p class="text-sm text-gray-600">Subtle filled bg + strong shadow</p>
        </CardContent>
    </Card>
)

const FilledCardExample3 = () => (
    <Card class="max-w-sm m-2" variant="filled" elevation={3}>
        <CardContent>
            <h3 class="text-lg font-semibold">Filled Card</h3>
            <p class="text-sm text-gray-600">Subtle filled bg + strong shadow</p>
        </CardContent>
    </Card>
)

const FilledCardExample4 = () => (
    <Card class="max-w-sm m-2" variant="filled" elevation={4}>
        <CardContent>
            <h3 class="text-lg font-semibold">Filled Card</h3>
            <p class="text-sm text-gray-600">Subtle filled bg + strong shadow</p>
        </CardContent>
    </Card>
)

const MediaCenteredCardExample = () => (
    <Card class="max-w-sm m-2">
        <CardMedia
            src="/sample-avatar.png"
            alt="Avatar"
            class="w-24 h-24 rounded-full mx-auto bg-center bg-cover mt-4"
            position="center center"
            fit="cover"
        />
        <CardContent class="px-5 pb-4">
            <h3 class="text-lg font-semibold text-center">Taylor</h3>
            <p class="text-sm text-gray-600 mt-1 text-justify">
                Front-end engineer focused on fast, accessible components and delightful UX.
            </p>
        </CardContent>
        <CardActions align="center" padding="p-3">
            <Button class="px-4 py-2 !rounded-[4px]" onClick={() => alert("Hi Taylor!")}>
                Say Hi
            </Button>
        </CardActions>
    </Card>
)

const ActionsAlignedCardExample = () => (
    <Card class="max-w-md m-2">
        <CardContent padding="p-6">
            <h3 class="text-lg font-semibold">Actions Alignment</h3>
            <p class="text-sm text-gray-600">Try different horizontal justifications</p>
        </CardContent>

        <CardActions align="start" padding="px-4 py-2">
            <span class="text-xs uppercase text-gray-500">Start</span>
        </CardActions>

        <CardActions align="center" padding="px-4 py-2">
            <span class="text-xs uppercase text-gray-500">Center</span>
        </CardActions>

        <CardActions align="between" padding="px-4 py-2">
            <span class="text-xs uppercase text-gray-500">Between (left)</span>
            <span class="text-xs uppercase text-gray-500">Between (right)</span>
        </CardActions>

        <CardActions align="end" padding="px-4 py-2">
            <span class="text-xs uppercase text-gray-500">End</span>
        </CardActions>
    </Card>
)

const ContentPaddingCardExample = () => (
    <Card class="max-w-sm m-2" elevation={1} interactive>
        <CardContent padding="p-6">
            <h3 class="text-lg font-semibold">Custom Padding</h3>
            <p class="text-sm text-gray-600">Using CardContent padding="p-6"</p>
            <p class="text-xs text-gray-500 mt-2">Hover to see subtle elevation change.</p>
        </CardContent>
    </Card>
)

const NameCardExample = () => (
    <Card class="max-w-sm m-2">
        <CardMedia
            src="/sample-avatar.png"
            alt="Sample avatar"
            class="w-24 h-24 rounded-full mx-auto bg-center bg-cover mt-4"
            position="center center"
            fit="cover"
        />
        <CardContent class="px-5 pb-4">
            <h3 class="text-lg font-semibold text-center">Alex</h3>
            <p class="text-sm text-gray-600 mt-1 text-justify">
                Product-minded developer who enjoys building cohesive UI systems and great DX.
            </p>
        </CardContent>
        <CardActions align="center" padding="p-3">
            <Button buttonType="contained" onClick={() => alert("Hello Alex!")}>
                Connect
            </Button>
        </CardActions>
    </Card>
)

const MediaBannerCardExample = () => (
    <Card class="max-w-md m-2" elevation={2}>
        <CardMedia
            src="contemplative-reptile.jpg"
            alt="Banner image"
            height="160px"
            position="center center"
            fit="cover"
            class="w-full"
        />
        <CardContent>
            <h3 class="text-lg font-semibold">Banner Card</h3>
            <p class="text-sm text-gray-600">Media header with content below.</p>
        </CardContent>
    </Card>
)

const NameCard = () => {
    return (
        <Card class="max-w-sm m-2 border border-red-500">
            {/* Avatar / photo centered */}
            <CardMedia
                src="sample-avatar.png"
                alt="Sample avatar"
                // center the media block and make it round
                class="w-24 h-24 rounded-full mx-auto bg-center bg-cover mt-4 border border-yellow-500"
                height="96px"         // ignored by our custom class height, but harmless
                // position="center center"
                fit="cover"
            />

            {/* Content: name centered; bio justified */}
            <CardContent class="px-5 pb-4 mt-2 border border-blue-500">
                <h3 class="text-lg font-semibold text-center">Ali</h3>
                <p class="text-sm text-gray-600 mt-1 text-justify">
                    Front-end developer who loves Woby & Tailwind. Passionate about UI micro-interactions and DX.
                </p>
            </CardContent>

            {/* Actions: centered button that alerts */}
            <CardActions class="mt-2 border border-green-500" align="center" padding="p-3">
                <Button class="p-4 !rounded-[4px]" onClick={() => alert('Hello Ali!')} children="Say Hi">
                    {/* Say Hi */}
                </Button>
            </CardActions>
        </Card>
    )
}


// export { DefaultCard, VariantCardExample, OutlinedCardExample, FilledCardExample, MediaCenteredCardExample, ActionsAlignedCardExample, ContentPaddingCardExample, NameCardExample, MediaBannerCardExample, NameCard }
export { VariantCardExample, OutlinedCardExample, FilledCardExample, MediaCenteredCardExample, ActionsAlignedCardExample, ContentPaddingCardExample, MediaBannerCardExample }

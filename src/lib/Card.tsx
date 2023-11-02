import { tw } from 'woby-styled'
import { type JSX } from 'woby'
export const Card = tw('div')`bg-white text-[rgba(0,0,0,0.87)] transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_2px_1px_-1px,rgba(0,0,0,0.14)_0px_1px_1px_0px,rgba(0,0,0,0.12)_0px_1px_3px_0px] overflow-hidden max-w-[345px]`

export const CardMedia = (props: JSX.DOMAttributes<HTMLDivElement>) => <div class="block bg-cover bg-no-repeat bg-[center_center] h-[140px]" role="img" title="green iguana" style="background-image: url(/static/images/cards/contemplative-reptile.jpg)" {...props}>
</div>

export const CardContent = tw('div')`p-[16px]`

export const CardActions = tw('div')`flex items-center p-2`

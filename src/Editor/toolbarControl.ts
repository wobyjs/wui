/**
 * # One height for every toolbar control
 *
 * The editor's toolbar is assembled out of a dozen independent widgets -- plain
 * `<Button>`s, dropdown triggers with their own `BASE_BTN` string, a stepper with an
 * `<input>` between two buttons -- and each one used to size itself. The result was five
 * different heights on one row (32, 37.4, 38, 42.5 and 54 px) and, because the band is
 * `flex items-center`, five different baselines: the B/I/U trio sat visibly higher than
 * the paragraph-format dropdown next to it.
 *
 * The heights were not chosen; they fell out of content. `Button`'s `outlined` variant is
 * `px-4 py-2` over `leading-[1.75]`, so a button is 18px of chrome plus whatever it holds:
 * the bold glyph has no size class and renders at 14px (=> 32), a `size-5` list icon is
 * 20px (=> 38), a text caption is 24.5px (=> 42.5), and the colour picker stacks a 24px
 * glyph on a 12px swatch (=> 54). Matching them by hand meant knowing all four sums.
 *
 * So the height is stated once, here, and every control wears it. 32px -- `h-8` -- because
 * that is what B/I/U already were and what the user asked the rest to match.
 *
 * ## Why every utility is `!`-important
 *
 * These strings are appended to a class list that already contains `py-2`, `h-full` or
 * `p-1.5`. Tailwind emits utilities in its own order, not the order they appear in the
 * attribute, so a plain `py-0` would lose to the `py-2` that ships in the variant table.
 * The `!` is what makes "appended last" mean "wins", without having to unpick the padding
 * out of every widget's own class string -- which would change how those widgets look
 * anywhere else they are used.
 *
 * Vertical padding goes to zero rather than to some smaller value: with a fixed height and
 * `items-center` the padding no longer does anything except risk overflowing the box.
 * Horizontal padding is untouched, so widths -- and the design -- stay as they were.
 */

/** The shared height, in px, for anyone who needs the number rather than the class. */
export const TOOLBAR_CONTROL_HEIGHT = 32

/** Just the height, for a wrapper that already lays its children out correctly. */
export const TOOLBAR_CONTROL_BOX = '!h-8 !box-border'

/**
 * A toolbar control itself: a button, a dropdown trigger, a stepper key.
 *
 * `items-center` is not redundant. Several of the hand-written `BASE_BTN` strings say
 * `inline-flex justify-center` and stop there, which centres horizontally and leaves the
 * caption pinned to the top of the box -- invisible while the box hugged its content, very
 * visible once the box is a fixed 32px.
 */
export const TOOLBAR_CONTROL = `${TOOLBAR_CONTROL_BOX} !py-0 !inline-flex !items-center`

/**
 * The `relative inline-block` wrapper a dropdown puts around its trigger and its panel.
 *
 * It needs the height too. An `inline-block` box that contains an inline-level child also
 * contains a *line box*, and the line box reserves room for descenders -- which is why the
 * colour pickers measured half a pixel taller than the button inside them. Becoming an
 * `inline-flex` removes the line box; the `relative` it is there for is untouched, so the
 * absolutely-positioned menu still hangs off it.
 */
export const TOOLBAR_CONTROL_WRAP = `${TOOLBAR_CONTROL_BOX} !inline-flex !items-center`

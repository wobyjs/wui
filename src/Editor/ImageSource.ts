/**
 * ImageSource: turning "the thing the user pointed at" into an `<img>` src.
 *
 * Every way an image can enter the editor -- a typed URL, a file from the picker, a
 * drop, a paste -- funnels through here, so there is exactly one place that decides
 * what is allowed, what gets embedded, and how large an embedded image is permitted
 * to be. Nothing in this module touches the editor, the shadow root or woby; it is
 * plain browser API over strings and canvases, which is what makes it testable.
 *
 * ## Embedding
 *
 * "Embedding" means rewriting the source as a `data:` URI so the document carries the
 * bytes instead of a link to them. It is reliable from a local file (`FileReader` hands
 * the data URI over directly) and unreliable from a remote URL, because reading another
 * origin's bytes needs `Access-Control-Allow-Origin` and most image hosts do not send it.
 * The `<canvas>` workaround does not exist: drawing a cross-origin image taints the
 * canvas and `toDataURL()` throws. So a failed embed falls back to a plain link and says
 * so, rather than pretending.
 *
 * ## Size
 *
 * base64 inflates bytes by a third, and an embedded image is then carried through the
 * undo history, the property panel and every serialisation of the document. So raster
 * images are fitted to {@link A4} -- the largest they can be and still print at full
 * quality on a sheet of A4 -- before being embedded.
 */

/**
 * A4 at 150 DPI, in pixels. 210x297mm at 150 dots per inch is 1240x1754.
 *
 * 150 rather than 300 because 300 DPI (2480x3508) is larger than almost any image a
 * user pastes, so it would downscale nothing and the cap would be decorative; and
 * rather than 96 (794x1123), which is a screen resolution and visibly softens on paper.
 */
export const A4 = { short: 1240, long: 1754 }

/**
 * Formats a canvas cannot round-trip: rasterising an SVG throws away the vector, and
 * re-encoding an animated GIF keeps only its first frame. Both are left exactly as they
 * arrived, whatever their size -- a mangled image is worse than a large one.
 */
const NO_RASTER = new Set(['image/svg+xml', 'image/gif'])

/** JPEG quality for re-encoded photographs. */
const JPEG_QUALITY = 0.85

/** The media type declared by a `data:` URI, lowercased; `''` for anything else. */
export const mimeOf = (src: string): string => {
    const m = /^data:([^;,]+)/i.exec(src)
    return m ? m[1].toLowerCase() : ''
}

/** Whether this media type survives a trip through a canvas. See {@link NO_RASTER}. */
export const isRasterisable = (mime: string): boolean => !NO_RASTER.has(mime)

/**
 * Whether a source may be inserted at all: `http:`, `https:`, or a `data:` URI that
 * declares an image type.
 *
 * An allowlist rather than a denylist, which is why it replaces the previous pair of
 * checks. Those escaped the URL into an HTML attribute and then ran a regex looking for
 * a quoted `javascript:`; that regex missed `data:text/html;base64,...` entirely, and
 * would have missed an unquoted or whitespace-padded `javascript:` too. Parsing the URL
 * and reading its protocol cannot be fooled by either.
 */
export const isAllowedSource = (raw: string): boolean => {
    let url: URL
    try {
        url = new URL(raw.trim(), document.baseURI)
    } catch {
        return false
    }
    if (url.protocol === 'http:' || url.protocol === 'https:') return true
    if (url.protocol === 'data:') return /^data:image\//i.test(raw.trim())
    return false
}

/** Approximate decoded size of a `data:` URI, for the size readout in the dialog. */
export const dataUrlBytes = (src: string): number => {
    const comma = src.indexOf(',')
    if (comma < 0) return 0
    const payload = src.length - comma - 1
    return /;base64/i.test(src.slice(0, comma)) ? Math.floor(payload * 3 / 4) : payload
}

/** "820 KB" / "1.4 MB" -- for humans, not for arithmetic. */
export const formatBytes = (n: number): string =>
    n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB`
        : n >= 1024 ? `${Math.round(n / 1024)} KB`
            : `${n} B`

/** Read a `File` or `Blob` as a `data:` URI. */
export const fileToDataUrl = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error ?? new Error('the file could not be read'))
        reader.readAsDataURL(file)
    })

/**
 * Fetch a remote image and read it as a `data:` URI.
 *
 * Rejects when the other origin does not permit the read. That is the expected outcome
 * for a good share of URLs and the caller is required to have a fallback.
 */
export const urlToDataUrl = async (url: string): Promise<string> => {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
    if (!res.ok) throw new Error(`the server answered ${res.status}`)
    const blob = await res.blob()
    if (!blob.type.startsWith('image/')) throw new Error(`that is not an image (${blob.type || 'unknown type'})`)
    return fileToDataUrl(blob)
}

/** Decode a source into an `<img>`, rejecting rather than resolving a broken image. */
export const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('the image could not be decoded'))
        img.src = src
    })

/**
 * An image's pixel size, with a fallback for SVGs that declare no intrinsic dimensions --
 * those report `naturalWidth === 0`, which would make every ratio below a NaN.
 */
export const naturalSize = (img: HTMLImageElement): { w: number, h: number } => ({
    w: img.naturalWidth || 300,
    h: img.naturalHeight || 150,
})

/** The A4 box turned to match the image, so a landscape photo is not punished for it. */
export const a4Box = (w: number, h: number): { w: number, h: number } =>
    h >= w ? { w: A4.short, h: A4.long } : { w: A4.long, h: A4.short }

/** Largest `w`x`h` fitting inside `box` at the original aspect ratio; never enlarges. */
export const fitWithin = (w: number, h: number, box: { w: number, h: number }): { w: number, h: number } => {
    const k = Math.min(box.w / w, box.h / h, 1)
    return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) }
}

/** Whether any pixel is translucent. Decides PNG vs JPEG below. */
const hasAlpha = (ctx: CanvasRenderingContext2D, w: number, h: number): boolean => {
    try {
        const { data } = ctx.getImageData(0, 0, w, h)
        for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true
        return false
    } catch {
        // A tainted canvas. Should not happen -- everything drawn here comes from a
        // data: URI -- but assuming transparency only costs bytes, while assuming
        // opacity would silently flatten an alpha channel onto black.
        return true
    }
}

/**
 * Encode a canvas, choosing the format by what is actually in it rather than by what the
 * source was: a PNG screenshot of an opaque window has no transparency worth the
 * several-fold size penalty PNG charges for a photograph.
 */
export const encodeCanvas = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d')!
    return hasAlpha(ctx, canvas.width, canvas.height)
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

/** The crop window, in CSS pixels. The user resizes this. */
export interface CropFrame { w: number, h: number }

/**
 * Where the image sits behind the frame: drawn at `scale` with its top-left corner at
 * (`x`, `y`) relative to the frame's top-left. So the source pixel under frame point
 * (fx, fy) is ((fx - x) / scale, (fy - y) / scale) -- the inverse this module bakes with.
 */
export interface CropTransform { scale: number, x: number, y: number }

/** A rectangle in source pixels. */
export interface SourceRect { sx: number, sy: number, sw: number, sh: number }

/**
 * The source rectangle the frame is currently showing, in source pixels -- the pure
 * geometry, which is free to name pixels the image does not have when the frame is
 * larger than the image or panned off it.
 *
 * Almost every caller wants {@link clipCropRect} instead. This one stays exported
 * because it is the definition the transform is documented against.
 */
export const cropRect = (frame: CropFrame, t: CropTransform): SourceRect => ({
    sx: -t.x / t.scale,
    sy: -t.y / t.scale,
    sw: frame.w / t.scale,
    sh: frame.h / t.scale,
})

/**
 * {@link cropRect} intersected with the pixels that actually exist, or `null` when the
 * frame and the image do not overlap at all.
 *
 * Everything downstream is sized from this rather than from the raw rect. Without the
 * intersection the empty space around a zoomed-out or panned-away image counts as
 * "source resolution": a 400x300 photo reports a 1725x1200 crop after two zoom-out
 * clicks, `bakeCrop` allocates a canvas that big, ~94% of it is transparent padding,
 * and the transparency then pushes `encodeCanvas` down the PNG branch -- a multi-
 * megabyte PNG of a mostly-empty upscale of a small JPEG. Panned fully clear of the
 * image the same path committed a 100% transparent picture over the user's photo.
 */
export const clipCropRect = (frame: CropFrame, t: CropTransform, nat: { w: number, h: number }): SourceRect | null => {
    const { sx, sy, sw, sh } = cropRect(frame, t)
    const x0 = Math.max(0, sx)
    const y0 = Math.max(0, sy)
    const x1 = Math.min(nat.w, sx + sw)
    const y1 = Math.min(nat.h, sy + sh)
    // Sub-pixel slivers are not a crop anyone asked for, and a canvas cannot be 0 wide.
    if (x1 - x0 < 1 || y1 - y0 < 1) return null
    return { sx: x0, sy: y0, sw: x1 - x0, sh: y1 - y0 }
}

/** Whether the clipped rect is the whole image, i.e. there is nothing to crop away. */
export const isWholeImage = (r: SourceRect, nat: { w: number, h: number }): boolean =>
    r.sx < 1 && r.sy < 1 && r.sw >= nat.w - 1 && r.sh >= nat.h - 1

/**
 * The pixel size a baked crop will have: the source resolution actually visible, capped
 * to A4. Shown live under the frame so the user can see what resizing costs them.
 *
 * Deliberately the *source* resolution rather than the frame's on-screen size -- zooming
 * in must not invent detail that is not in the file, and zooming out must not keep
 * resolution the user just discarded. Both halves depend on the rect being clipped to
 * the image first, which is why `nat` is required.
 */
export const cropOutputSize = (frame: CropFrame, t: CropTransform, nat: { w: number, h: number }): { w: number, h: number } => {
    const r = clipCropRect(frame, t, nat)
    if (!r) return { w: 0, h: 0 }
    return fitWithin(r.sw, r.sh, a4Box(r.sw, r.sh))
}

/**
 * Render what the frame is showing to a `data:` URI, or `null` when there is nothing
 * worth rendering.
 *
 * Two cases return `null`, and the {@link CropperHandle.bake} contract already reads
 * that as "use the source unchanged":
 *
 * - the frame has been panned clear of the image, so a bake would produce a blank;
 * - the frame still shows the whole image at full resolution, so a bake would only
 *   re-encode it -- generation loss, and a lossless source coming back as a bigger
 *   file, in exchange for a crop the user did not make.
 */
export const bakeCrop = (img: HTMLImageElement, frame: CropFrame, t: CropTransform): string | null => {
    const nat = naturalSize(img)
    const r = clipCropRect(frame, t, nat)
    if (!r) return null

    const out = fitWithin(r.sw, r.sh, a4Box(r.sw, r.sh))
    if (isWholeImage(r, nat) && out.w >= nat.w && out.h >= nat.h) return null

    const canvas = document.createElement('canvas')
    canvas.width = out.w
    canvas.height = out.h
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, out.w, out.h)
    return encodeCanvas(canvas)
}

/**
 * Fit an already-embedded image to A4, returning the original bytes untouched when it
 * already fits or when re-encoding would destroy it. Used for the paths that skip the
 * crop editor.
 */
export const fitToA4 = async (dataUrl: string): Promise<string> => {
    if (!isRasterisable(mimeOf(dataUrl))) return dataUrl

    const img = await loadImage(dataUrl)
    const nat = naturalSize(img)
    const box = a4Box(nat.w, nat.h)
    if (nat.w <= box.w && nat.h <= box.h) return dataUrl

    const out = fitWithin(nat.w, nat.h, box)
    const canvas = document.createElement('canvas')
    canvas.width = out.w
    canvas.height = out.h
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, out.w, out.h)
    return encodeCanvas(canvas)
}

export interface ResolveResult {
    /** What to put in the `<img>`'s src. */
    src: string
    /** Set when the result is not what was asked for, and the user should be told why. */
    warning?: string
}

/**
 * Resolve a typed or picked source into something insertable.
 *
 * The one case that needs explaining is a remote URL with embedding requested and the
 * fetch refused: the image is still inserted, as a link, with a warning. The alternative
 * -- inserting nothing -- punishes the user for their image host's CORS policy, which
 * they cannot do anything about.
 */
export const resolveImageSource = async ({ source, embed }: { source: string, embed: boolean }): Promise<ResolveResult> => {
    const url = source.trim()
    if (!url) throw new Error('Enter an image URL, or choose a file.')
    if (!isAllowedSource(url)) throw new Error('Only http, https and data:image sources can be inserted.')

    // Already embedded (picker, drop, paste). There is no link to fall back to, so the
    // only question left is whether it needs shrinking.
    if (/^data:/i.test(url)) return { src: await fitToA4(url) }

    if (!embed) return { src: url }

    try {
        return { src: await fitToA4(await urlToDataUrl(url)) }
    } catch (e) {
        const why = e instanceof Error ? e.message : 'the fetch failed'
        return { src: url, warning: `Could not embed this image -- ${why}. Inserted as a link instead.` }
    }
}

// --- provenance ---------------------------------------------------------------

/**
 * Attribute recording the URL an image's pixels originally came from.
 *
 * Cropping and downscaling are destructive: the discarded pixels are gone, and a second
 * crop of an already-baked JPEG compounds the loss. Keeping a copy of the original bytes
 * would fix that and double the embedded size, which defeats the entire point of the
 * A4 cap -- so what gets kept is the *URL*, which costs a few dozen bytes.
 *
 * The consequence is deliberate and asymmetric:
 *
 * - An image that arrived from `http(s)` can always be restored, and every re-crop starts
 *   from pristine pixels rather than from the previous crop.
 * - An image that arrived from a local file (picker, drop, paste) has no URL to keep. Its
 *   original is gone the moment the first crop is applied, and a re-crop works on what is
 *   already embedded.
 *
 * Written once and never overwritten: the first origin is the pristine one, and a crop of
 * a crop must not relabel itself as the source.
 */
export const ORIGIN_ATTR = 'data-image-origin'

/** The stored origin URL, or `''` when there is none worth trusting. */
export const readImageOrigin = (img: HTMLImageElement): string => {
    const v = (img.getAttribute(ORIGIN_ATTR) ?? '').trim()
    // Re-validated on read rather than trusted: the attribute survives a copy/paste
    // through the clipboard and a round-trip through someone else's serialiser.
    return /^https?:\/\//i.test(v) && isAllowedSource(v) ? v : ''
}

/** Record where an image came from, if that is a URL and nothing is recorded yet. */
export const rememberImageOrigin = (img: HTMLImageElement, source: string): void => {
    if (img.hasAttribute(ORIGIN_ATTR)) return
    const url = source.trim()
    if (/^https?:\/\//i.test(url) && isAllowedSource(url)) img.setAttribute(ORIGIN_ATTR, url)
}

export interface PristineSource {
    /** Bytes to edit: always a `data:` URI, because a canvas cannot read a linked image. */
    src: string
    /** True when these are the original pixels rather than the currently embedded crop. */
    fromOrigin: boolean
    /** Set when the origin was recorded but could not be re-fetched. */
    warning?: string
}

/**
 * The best available pixels for editing `img`.
 *
 * Prefers the recorded origin, so a re-crop is a crop of the original rather than a crop
 * of a crop. Falls back to what is currently embedded -- with a warning, because the user
 * asked for the original and is not getting it.
 *
 * Rejects rather than returning a linked source: cropping needs a canvas, a canvas cannot
 * read cross-origin pixels, and pretending otherwise would fail later at `toDataURL`.
 */
export const pristineSource = async (img: HTMLImageElement): Promise<PristineSource> => {
    const origin = readImageOrigin(img)
    const current = (img.getAttribute('src') ?? '').trim()

    if (origin) {
        try {
            return { src: await urlToDataUrl(origin), fromOrigin: true }
        } catch (e) {
            const why = e instanceof Error ? e.message : 'the fetch failed'
            if (/^data:/i.test(current)) {
                return { src: current, fromOrigin: false, warning: `The original could not be re-fetched -- ${why}. Editing the embedded copy instead.` }
            }
            throw new Error(`The original could not be re-fetched -- ${why}.`)
        }
    }

    if (!current) throw new Error('This image has no source to edit.')
    if (/^data:/i.test(current)) return { src: current, fromOrigin: false }

    // A linked image with no recorded origin: the link *is* the origin, so fetching it is
    // both the only way to get pixels and the thing that makes the crop possible at all.
    if (!isAllowedSource(current)) throw new Error('Only http, https and data:image sources can be edited.')
    try {
        return { src: await urlToDataUrl(new URL(current, document.baseURI).href), fromOrigin: true }
    } catch (e) {
        const why = e instanceof Error ? e.message : 'the fetch failed'
        throw new Error(`This image cannot be edited -- ${why}. Its server does not permit reading the pixels (CORS).`)
    }
}

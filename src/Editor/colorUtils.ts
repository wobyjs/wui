export interface RGB {
    r: number
    g: number
    b: number
}

export interface HSV {
    h: number
    s: number
    v: number
}

export function hexToRgb(hex: string): RGB | null {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b
    })

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

export function rgbToHex(rgb: RGB): string {
    return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1).toUpperCase()
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
    r /= 255, g /= 255, b /= 255

    let max = Math.max(r, g, b), min = Math.min(r, g, b)
    // `h` is seeded rather than left bare: the `switch (max)` below has no `default` branch, so
    // TypeScript cannot see that one of the three cases always matches `max`. 0 is the achromatic
    // hue the `max === min` branch would assign anyway, so the seed is never observable.
    let h = 0, s, v = max

    let d = max - min
    s = max === 0 ? 0 : d / max

    if (max === min) {
        h = 0 // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }

    return { h: h * 360, s: s * 100, v: v * 100 }
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
    s /= 100
    v /= 100
    h /= 360

    // Seeded for the same reason as `h` in `rgbToHsv`: `switch (i % 6)` enumerates every possible
    // value but has no `default`, so TypeScript still treats these as possibly-unassigned.
    let r = 0, g = 0, b = 0
    let i = Math.floor(h * 6)
    let f = h * 6 - i
    let p = v * (1 - s)
    let q = v * (1 - f * s)
    let t = v * (1 - (1 - f) * s)

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break
        case 1: r = q, g = v, b = p; break
        case 2: r = p, g = v, b = t; break
        case 3: r = p, g = q, b = v; break
        case 4: r = t, g = p, b = v; break
        case 5: r = v, g = p, b = q; break
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}

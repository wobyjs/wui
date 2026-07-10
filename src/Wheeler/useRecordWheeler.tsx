import { $, $$, ObservableMaybe, Observable, useEffect, useMemo, isObservable } from 'woby'
import { WheelerProps, WheelerItem } from './WheelerType'

/**
 * Creates Wheeler props for column visibility control (multi-select with checkboxes)
 * This hook bridges between Wheeler's centralized value array and individual column observables
 *
 * @param d - Record of column names mapped to their visibility observables
 * @param options - Additional Wheeler options
 * @returns Props to spread onto a Wheeler component for checkbox-based column selection
 */
export const useRecordWheeler = <T, V extends boolean>(
    d: Record<keyof T, ObservableMaybe<V>>,
    options?: Partial<WheelerProps<T>>
) => {
    const keys = Object.keys(d) as (keyof T)[]

    // Initial value: keys where observable is true
    const initialValues = keys.filter(key => $$(d[key]) as boolean)

    // Create a central value observable for Wheeler
    const value = $<keyof T[]>(initialValues)

    // Create options array with label/value format for Wheeler
    const optionsArray = useMemo(() =>
        keys.map((key) => ({
            label: key as string,
            value: key,
        }))
    )

    // Sync Wheeler's value changes back to individual observables
    useEffect(() => {
        const selectedKeys = new Set($$(value))
        keys.forEach(key => {
            const shouldShow = selectedKeys.has(key)
            const currentVal = $$(d[key]) as boolean
            if (currentVal !== shouldShow) {
                if (isObservable(d[key])) {
                    (d[key] as Observable<boolean>)(shouldShow)
                }
            }
        })
    })

    return {
        options: optionsArray,
        all: 'All',  // This triggers multi-select checkbox mode
        value,
        ok: $(false),
        mask: true,
        visible: $(false),
        rows: Math.min(6, keys.length),
        ...options ?? {}
    }
}
import { $, $$, ArrayMaybe, isObservable, Observable, ObservableMaybe, Portal, useEffect, useMemo } from 'woby'
import { use } from 'use-woby'
import { EnumType } from 'typescript'
import { Nullable } from 'woby/dist/types/types'

export type WheelItem = { value: any, label: string, key1: string }
export type WheelerProps = {
    options: ObservableMaybe<WheelItem[]>,
    itemHeight?: ObservableMaybe<number>,
    visibleItemCount?: ObservableMaybe<number>,
    value?: ObservableMaybe<ArrayMaybe<string | number>>,
    class?: JSX.Class
    header?: JSX.Element
    /** implicit for multiple */
    all?: ObservableMaybe<string>,
    ok?: ObservableMaybe<boolean>
    visible?: Observable<boolean>

    bottom?: ObservableMaybe<boolean>
    hideOnBlur?: ObservableMaybe<boolean>
    commitOnBlur?: ObservableMaybe<boolean>
    mask?: boolean
}

/** 
 * 
 * type User = { id: number; name: string };

// id as required string
type WithChangedId = ChangeProp<User, 'id', string>; 
// → { name: string; id: string }

// id as optional string
type WithOptionalId = ChangeProp<User, 'id', string, true>; 
// → { name: string; id?: string }
 */
export type ChangeProp<
    T,
    K extends keyof T,
    V,
    Optional extends boolean = false
> = Omit<T, K> & {
    [P in K]: Optional extends true ? V | undefined : V
}

export const useArrayWheeler = <T extends string | number | symbol,>(data: ObservableMaybe<T[]>, options?: ChangeProp<WheelerProps, 'options', ObservableMaybe<any[]>, true>) => {
    const a = options.options = $()

    useEffect(() => {
        a($$(data).reduce((acc, value) => {
            acc[value] = value
            return acc
        }, {} as Record<T, T>) as any)
    })

    return options as WheelerProps
}

export const useEnumWheeler = <T extends EnumType,>(data: ObservableMaybe<T>, options?: ChangeProp<WheelerProps, 'options', ObservableMaybe<any[]>, true>) => {
    const a = options.options = $()

    useEffect(() => {
        a(
            Object.values(data).reduce((acc, value) => {
                acc[value] = value
                return acc
            }, {} as Record<string, string>)
        )
    })

    return options
}

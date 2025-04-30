import { $, $$, ArrayMaybe, isObservable, Observable, ObservableMaybe, ObservableReadonly, Portal, useEffect, useMemo } from 'woby'
import { use } from 'use-woby'
import { EnumType } from 'typescript'
import { Nullable } from 'woby/dist/types/types'

export type WheelerItem<T = unknown> = { value: T, label: string | number, component?: (props: { itemHeight: number, value: WheelerItem, index: number }) => HTMLLIElement }
export type WheelerProps<T = unknown> = {
    options: ObservableMaybe<WheelerItem<T>[]>,
    itemHeight?: ObservableMaybe<number>,
    itemCount?: ObservableMaybe<number>,
    value?: ObservableMaybe<ArrayMaybe<WheelerItem<T>['value']>>,
    class?: JSX.Class
    header?: (v: ObservableMaybe<ArrayMaybe<WheelerItem<T>['value']>>) => JSX.Element
    /** implicit for multiple */
    all?: ObservableMaybe<string>,
    ok?: ObservableMaybe<boolean>
    visible?: Observable<boolean>

    bottom?: ObservableMaybe<boolean>
    cancelOnBlur?: ObservableMaybe<boolean>
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

export const useArrayOptions = <T,>(data: ObservableMaybe<T[]>) => {
    return useMemo(() => $$(data).map(v => ({
        label: v,
        value: v,
    }), {} as Record<string, T>) as any)
}

type Enum = { [key: string]: string | number }

export const useEnumOptions = <E extends Enum>(
    enumObj: ObservableMaybe<E>
): ObservableReadonly<WheelerItem<E[keyof E]>[]> =>
    // When using numeric enums, TypeScript creates a reverse mapping.
    // We filter the keys to exclude those numeric reverse keys.
    useMemo(() => Object.keys($$(enumObj))
        .filter(key => isNaN(Number(key)))
        .map(key => ({
            value: $$(enumObj)[key] as E[keyof E],
            label: key,
        })))


export const useRecordOptions = <T, V>(
    data: ObservableMaybe<Record<keyof T, ObservableMaybe<V>>>
): ObservableReadonly<WheelerItem<ObservableMaybe<V>>[]> => useMemo(() => (Object.keys($$(data)) as (keyof T)[]).map((key) => ({
    value: $$(data)[key],
    label: key as string, // assuming the key is representable as a string or number
})))

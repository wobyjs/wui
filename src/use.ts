import { type Observable, type ObservableMaybe } from 'woby'
import { use as wobyUse } from '@woby/use'

/**
 * `@woby/use` declares `use()` as
 *
 * ```ts
 * function use<T>(val: ObservableMaybe<T | undefined> | T | undefined, def?: ...): Observable<T>
 * ```
 *
 * An `Observable<T>` is invariant — it is both getter and setter — so `Observable<number>` is
 * *not* assignable to `Observable<number | undefined>`, and every `use(someObservableProp, 5)`
 * call fails to type-check under `strictFunctionTypes`.
 *
 * Every call site in this package passes an already-defined `ObservableMaybe<T>` and relies on
 * `use()`'s documented behaviour of returning `Observable<T>`. Re-declaring the parameter here
 * keeps that contract in one place instead of scattering casts across ~12 call sites.
 *
 * Runtime behaviour is `@woby/use`'s `use()`, untouched.
 */
export const use = wobyUse as <T>(
    val: ObservableMaybe<T> | T | undefined | null,
    def?: T | null,
    options?: { clone?: boolean, makeNew?: boolean },
) => Observable<T>

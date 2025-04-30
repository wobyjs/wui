import { $, $$, Observable, ObservableMaybe, useEffect, useMemo, untrack, Portal, type JSX, isObservable, ArrayMaybe } from 'woby'
import { use } from 'use-woby'
import { Wheeler } from './Wheeler' // Adjust path
import { Button, variant } from '../Button'
import { WheelerItem, WheelerProps } from './WheelerType'

// --- Utilities (unchanged) ---
const parseDate = (dateInput: Date | string | null | undefined): Date | null => {
    if (!dateInput) return null
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput
    try {
        const p = new Date(dateInput)
        return isNaN(p.getTime()) ? null : p
    } catch (e) { return null }
}

type MultiWheelerProps = {
    options: Array<ObservableMaybe<any[]>>,
    value: Array<Observable<any>>
    headers?: ((v: ObservableMaybe<ArrayMaybe<WheelerItem<any>['value']>>) => JSX.Element)[]
    divider?: ObservableMaybe<boolean>
    title?: JSX.Element
    changeValueOnClickOnly?: boolean
} & Pick<WheelerProps, 'bottom' | 'commitOnBlur' | 'ok' | 'visible' | 'mask' | 'cancelOnBlur' | 'itemHeight' | 'itemCount'>

export const MultiWheeler = (props: MultiWheelerProps): JSX.Element => {
    const {
        options,
        value,
        itemHeight = 36,
        itemCount = 5,
        headers,
        divider,
        bottom,
        title,
        mask,
        visible = $(true),
        changeValueOnClickOnly,
        ok
    } = props

    // --- Internal Selection State ---
    const modDate = options
    const stateArr = value


    // --- Effect to Sync Internal State Changes -> Update MAIN controlledValue & Clamp Day ---
    // useEffect(() => {
    //     // Guard: Don't run if essential parts aren't set
    //     // if (year === undefined || month === undefined || day === undefined || hour === undefined || minute === undefined || second === undefined) return

    //     // --- Update Main Controlled Value if Changed ---
    //     const currentPropValue = parseDate($$(modDate))
    //     // Check if controlledValue is an observable function before calling it
    //     if (typeof modDate === 'function' && (!currentPropValue || constrainedDate.getTime() !== currentPropValue.getTime())) {
    //         // console.log("DateTimeWheeler updating main value:", constrainedDate.toISOString())
    //         modDate(constrainedDate) // Update the external observable

    //         if (!ok)
    //             if (isObservable(oriDate))
    //                 oriDate($$(modDate))

    //         if (!$$(ok)) return

    //         if (isObservable(oriDate))
    //             oriDate($$(modDate))

    //         if (isObservable(ok))
    //             ok(false)
    //     }
    // })

    // --- Render (unchanged) ---
    const dateTimeWheelerCls = 'date-time-Wheeler flex w-full bg-white p-1 border justify-center border-gray-300 rounded-md shadow-sm '
    const wheelWrapperCls = 'wheel-wrapper flex-1'

    const br = useMemo(() => $$(divider) ? 'border-l border-gray-300 dark:border-gray-600' : null)

    const comp = useMemo(() => <>
        <div class={[dateTimeWheelerCls, 'flex-col fixed inset-x-0 bottom-0 bg-blue-600 shadow-lg z-10']}>
            <div class="flex items-center justify-between px-4 py-2 h-auto relative">
                <div class="w-[80px] flex justify-start">
                    <Button
                        class={[variant.contained, 'px-2']}
                        onClick={() => visible(false)}
                    >
                        Cancel
                    </Button>
                </div>
                <div class="flex-1 text-center px-2">
                    <span class="inline-block break-words">
                        {() => title ? title : null}
                    </span>
                </div>
                <div class="w-[80px] flex justify-end">
                    <Button
                        class={[variant.contained, 'px-2']}
                        onClick={() => {
                            // if (isObservable(oriDate)) oriDate($$(modDate))
                            visible(false)
                        }}
                    >
                        OK
                    </Button>
                </div>
            </div>
            <div class={[dateTimeWheelerCls, '']}>
                {() => options.map((options, index) => {
                    const columnName = headers[index]

                    return <Wheeler
                        header={v => columnName(v)}
                        options={options}
                        value={stateArr[index]}
                        itemHeight={itemHeight}
                        itemCount={itemCount}
                        class={[wheelWrapperCls,]}
                        changeValueOnClickOnly={changeValueOnClickOnly} />
                })}
            </div>
        </div >
    </>)
    return () => !$$(visible) ? null :
        $$(bottom) ? <Portal mount={document.body}>
            {() => $$(mask) ? <>
                <div
                    class={['fixed inset-0 bg-black/50 h-full w-full z-[50] opacity-50']}
                    onClick={() => {
                        visible(false)
                    }}
                />
            </> : null}
            <div class={[dateTimeWheelerCls, 'fixed inset-x-0 bottom-0 bg-blue-600 shadow-lg z-100']}>
                {comp}
            </div>
        </Portal>
            : <div class={[dateTimeWheelerCls]}>
                {comp}
            </div>

}
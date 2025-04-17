import { $, $$, ArrayMaybe, isObservable, Observable, ObservableMaybe, Portal, useEffect, useMemo } from 'woby'
import { use } from 'use-woby'

export type WheelerProps = {
    options: ObservableMaybe<any[]>,
    itemHeight?: ObservableMaybe<number>,
    visibleItemCount?: ObservableMaybe<number>,
    value?: ObservableMaybe<ArrayMaybe<string | number>>,
    class?: JSX.Class
    header?: JSX.Element
    multiple?: ObservableMaybe<boolean>,
    ok?: ObservableMaybe<boolean>
    visible?: Observable<boolean>

    bottom?: ObservableMaybe<boolean>
    hideOnBlur?: ObservableMaybe<boolean>
    commitOnBlur?: ObservableMaybe<boolean>
    mask?: boolean
}

// export const useArrayWheel = <T,>(data: ObservableMaybe<T[]>, options?: Partial<WheelerProps> & { all?: string }) => {
//     const { all } = options ?? {}
//     const checked = all ? $$(data).map(f => $(false)) : undefined

//     if (all) {
//         useEffect(() => {
//             if (typeof $$(checked[0]) === 'undefined') return
//             if ($$(checked[0]))
//                 checked.forEach((c, i) => (i === 0) ? null : checked[i](true))
//             else
//                 checked.forEach((c, i) => (i === 0) ? null : checked[i](false))
//         })

//         useEffect(() => {
//             const c = checked.slice(1)
//             const at = c.every(f => $$(f))
//             const af = c.every(f => !$$(f))
//             if (at) checked[0](true)
//             if (af) checked[0](false)
//             if (!at && !af) checked[0](undefined)
//         })
//     }
//     return {
//         data: [data], checked, value: [$()],
//         renderer: [r => r] as (((r: any) => any)[]) | undefined,
//         valuer: [r => r] as (((r: any) => any)[]) | undefined,
//         checkboxer: (all ? [r => checked[$$(data).indexOf(r)]] : null) as (((r: any) => Observable<boolean>)[]) | undefined,
//         checkbox: [$(true)] as (Observable<boolean>[]) | undefined,
//         noMask: true as boolean | undefined,
//         hideOnBackdrop: true as boolean | undefined,
//         rows: Math.min(6, data.length) as number | undefined,
//         open: $(false),
//         ...options ?? {}
//     }
// }


export const Wheeler = (props: WheelerProps) => {
    const { options,
        itemHeight: ih,
        visibleItemCount: vic,
        value: oriValue,
        class: cls,
        header,
        ok,
        visible = $(true),
        bottom,
        mask,
        hideOnBlur,
        commitOnBlur } = props

    const itemHeight = use(ih, 36)
    const visibleItemCount = use(vic, 5)
    const value = $($$(oriValue))

    const CLICK_THRESHOLD_PX = 5

    const checkboxes = $<Record<string, Observable<boolean>>>({})

    const paddingItemCount = $(0)
    let minTranslateY = 0
    let maxTranslateY = 0

    // --- State variables ---
    const selectedIndex = $(-1)
    let currentY = 0
    let startY = 0
    let startTranslateY = 0
    let startTime = 0
    let isDragging = false
    let hasMoved = false
    const rafId = $(0)
    let velocity = 0
    let lastMoveTime = 0
    let lastMoveY = 0
    let wheelSnapTimeoutId = $(0)

    const viewport = $<HTMLDivElement>()
    const list = $<HTMLUListElement>()
    const multiple = use(props.multiple, false)

    let preOptions, preFormattedOptions

    const formattedOptions = useMemo(() => {
        if (preOptions === $$(options)) return preFormattedOptions

        const base = $$(options).map(opt =>
            typeof opt === 'object' && opt !== null ? opt : { value: opt, label: String(opt) }
        ) as { value: any, label: string }[]

        const b2 = $$(multiple) ? [{ value: '__ALL__', label: 'All' }, ...base] : base

        if ($$(multiple)) {
            const r = {} as Record<string, Observable<boolean>>

            b2.map(opt => r[opt.label] = $(false)) //init
            checkboxes(r)

            const vs = [...[$$(value)]].flat()
            b2.forEach(opt => r[opt.label](vs.some(sv => sv === opt.value)))
        }

        preOptions = $$(options)

        return preFormattedOptions = b2
    })

    const chkValues = () => {
        const c = $$(checkboxes)

        const vs = new Set([$$(value)].flat()) // current value set
        const os = $$(formattedOptions)        // options list
        const cb = $$(checkboxes)              // current checkbox state

        const cbv = new Set(
            Object.entries(cb)
                .filter(([_, active]) => $$(active))
                .map(([label]) => label)
        )

        // Values checked in checkbox but not in current value
        const onlyInCheckbox = os
            .filter(opt => $$(cb[opt.label]) && !vs.has(opt.value) && opt.label !== 'All')
            .map(opt => opt.value)

        // Values in current value but now unchecked
        const onlyInValue = [...vs].filter(val => {
            const opt = os.find(o => o.value === val)
            return opt ? !$$(cbv.has(opt.label)) : true
        })

        return { onlyInCheckbox, onlyInValue }
    }

    useEffect(() => {
        if (!ok) return

        if (!$$(ok)) return

        if (isObservable(oriValue))
            oriValue($$(value))

        if (isObservable(ok))
            ok(false)
    })

    //values to chk
    let preValues
    let preCheckboxes
    const value2chk = () => {
        if (!$$(multiple)) return

        const vv = $$(value)
        if (preValues === vv) return

        const { onlyInCheckbox, onlyInValue } = chkValues()

        const os = $$(formattedOptions)
        const c = $$(checkboxes)

        for (const v of onlyInValue) {
            const opt = os.find(o => o.value === v)
            if (opt) c[opt.label](true)
        }

        for (const v of onlyInCheckbox) {
            const opt = os.find(o => o.value === v)
            if (opt) c[opt.label](false)
        }

        if (onlyInCheckbox.length > 0 || onlyInValue.length > 0) {
            checkboxes({ ...c })
            preCheckboxes = $$(checkboxes)
        }

        preValues = $$(value)
    }
    value2chk() //copy value to chk 1st
    useEffect(value2chk)

    //chkbox to values
    const chk2value = (n: string) => {
        if (!$$(multiple)) return

        const c = $$(checkboxes)
        // if (preCheckboxes === c) return

        // console.log(n, 'checked', $$(c[n]))

        if (n === 'All') {
            const vv = $$(c[n])
            Object.values(c).forEach(o => o(vv))
        }
        else if (Object.values(c).some(o => !$$(o)))
            c['All'](false)

        const { onlyInCheckbox, onlyInValue } = chkValues()

        if (onlyInCheckbox.length === 0 && onlyInValue.length === 0) return

        const vs = new Set([$$(value)].flat()) // current value set

        // // Update value by removing `onlyInValue` and adding `onlyInCb`
        for (const v of onlyInValue) vs.delete(v)
        for (const v of onlyInCheckbox) vs.add(v)

        // if (Array.isArray($$(value)))
        //     ($$(value) as []).push(...vs)
        // else

        value([...vs])
        if (!ok)
            if (isObservable(oriValue))
                oriValue($$(value))
        // preCheckboxes = $$(checkboxes)
    }


    // For "All" handling
    const isAllSelected = useMemo(() => {
        const allValues = $$(formattedOptions).map(opt => opt.value)
        return allValues.every(v => $$($$(checkboxes)[v]))
    })

    function toggleAll() {
        const set = $$(checkboxes)
        const b = $$(isAllSelected)
        $$(formattedOptions).forEach(opt => set[opt.label](b))
        // value([...newSet]) // notify external
    }

    useEffect(() => {
        if (typeof $$(visibleItemCount) !== 'number' || $$(visibleItemCount) <= 0)
            visibleItemCount(3)

        if ($$(visibleItemCount) % 2 === 0) {
            console.warn(`visibleItemCount (${$$(visibleItemCount)}) should be odd for symmetry. Adjusting to ${$$(visibleItemCount) + 1}.`)
            visibleItemCount($$(visibleItemCount) + 1)
        }

        paddingItemCount(Math.floor($$(visibleItemCount) / 2))


        // Recalculate scroll boundaries based on new layout
        // Need to define getTargetYForIndex before calling it here
        minTranslateY = _getTargetYForIndexUnbound($$(formattedOptions).length - 1)
        maxTranslateY = _getTargetYForIndexUnbound(0)

        snapToIndex($$(selectedIndex))
        // console.log(`Layout Updated: count=${visibleItemCount}, h=${viewportHeight}, pad=${paddingItemCount}, minY=${minTranslateY}, maxY=${maxTranslateY}`);
    })

    const viewportHeight = useMemo(() => $$(itemHeight) * $$(visibleItemCount))
    const indicatorTop = useMemo(() => ($$(viewportHeight) - $$(itemHeight)) / 2)

    // Internal helper to get target Y without index clamping, used for bounds calc
    function _getTargetYForIndexUnbound(index: number) {
        // Uses the potentially updated indicatorTop and paddingItemCount
        return $$(indicatorTop) - (index + $$(paddingItemCount)) * $$(itemHeight)
    }

    // Public getter for target Y, still used by snapToIndex etc.
    function getTargetYForIndex(index: number) {
        // Uses the potentially updated indicatorTop and paddingItemCount
        return $$(indicatorTop) - (index + $$(paddingItemCount)) * $$(itemHeight)
    }

    const pickerItemCls = 'apply h-9 flex items-center justify-center text-base box-border transition-opacity duration-[0.3s,transform] delay-[0.3s] select-none scale-90'

    // --- Populate List --- (Now uses the 'let' paddingItemCount)
    function* populateList() {
        // Top padding
        for (let i = 0; i < $$(paddingItemCount); i++)
            yield <li class={['wheeler-item is-padding invisible', pickerItemCls]} style={{ height: () => `${$$(itemHeight)}px` }}></li>

        // Actual items
        for (const [index, option] of $$(formattedOptions).entries())
            yield <li class={['wheeler-item', pickerItemCls, $$(multiple) ? 'text-black' : 'text-[#555] opacity-60 ']} data-index={index} data-value={option.value}
                style={{ height: () => `${$$(itemHeight)}px` }}>
                {() => $$(multiple) ? () => {
                    const isChecked = $$(checkboxes)[option.label]

                    // useEffect(() => {
                    //     chk2value(option.label)

                    //     console.log(option.label, 'checked', $$(isChecked))
                    // })

                    return <label class="flex items-center gap-2 px-2">
                        <input onClick={e => { isChecked(!$$(isChecked)); chk2value(option.label) }} type="checkbox" checked={$$(isChecked)} readonly />
                        <span>{option.label}</span>
                    </label>
                } : option.label}
            </li>

        // Bottom padding
        for (let i = 0; i < $$(paddingItemCount); i++)
            yield < li class={['wheeler-item is-padding invisible', pickerItemCls]} style={{ height: `${$$(itemHeight)}px` }}></li>
    }

    function setTranslateY(y: number) {
        if (!$$(list)) return

        // Clamp position using the potentially updated boundaries
        currentY = Math.max(minTranslateY, Math.min(maxTranslateY, y))
        $$(list).style.transform = `translateY(${currentY}px)`
        updateItemStyles()
    }

    let snapToIndexTimeout = 0
    function snapToIndex(index: number, immediate = false) {
        if (!$$(list)) return
        if ($$(multiple)) return

        // Clamp index based on options length (doesn't change)
        const clampedIndex = Math.max(0, Math.min(index, $$(formattedOptions).length - 1))
        // Calculate target Y using potentially updated layout values
        const targetY = getTargetYForIndex(clampedIndex)

        if (immediate) {
            $$(list).style.transition = 'none'
        } else {
            $$(list).style.transition = 'transform 0.3s ease-out'
        }

        setTranslateY(targetY) // Apply target Y (uses updated bounds)

        const timeoutDuration = immediate ? 10 : 310
        if (snapToIndexTimeout !== 0) { clearTimeout(snapToIndexTimeout); snapToIndexTimeout = 0 }

        // snapToIndexTimeout(
        snapToIndexTimeout = setTimeout(() => {
            if ($$(list).style.transition === 'none') { $$(list).style.transition = 'transform 0.3s ease-out' }
            if ($$(selectedIndex) !== clampedIndex) {
                selectedIndex(clampedIndex)
                // if (onChange && $$(formattedOptions)[$$(selectedIndex)]) {
                //     onChange($$(formattedOptions)[$$(selectedIndex)], $$(selectedIndex))
                // }
            }
            updateItemStyles() // Uses updated viewportHeight
            snapToIndexTimeout = 0
        }, timeoutDuration)
        // )
    }


    function updateItemStyles() {
        if ($$(multiple)) return

        // Uses the potentially updated viewportHeight
        const centerViewportY = $$(viewportHeight) / 2
        const listItems = $$(list).querySelectorAll('.wheeler-item:not(.is-padding)')
        listItems.forEach(item => {
            const itemRect = item.getBoundingClientRect()
            const viewportRect = $$(viewport).getBoundingClientRect()
            const itemCenterRelativeToViewport = (itemRect.top + itemRect.bottom) / 2 - viewportRect.top
            const distanceFromCenter = Math.abs(itemCenterRelativeToViewport - centerViewportY)
            if (distanceFromCenter < $$(itemHeight) * 0.6) { item.classList.add('is-near-center', 'opacity-100', 'font-bold', 'text-[#007bff]', 'scale-100',) }
            else { item.classList.remove('is-near-center', 'opacity-100', 'font-bold', 'text-[#007bff]', 'scale-100',) }
        })
    }

    function getClientY(e: PointerEvent & TouchEvent) { /* ... unchanged ... */
        if (e.type === 'touchend' || e.type === 'touchcancel') { return e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0].clientY : startY }
        return e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY
    }
    function handleStart(e: PointerEvent & TouchEvent) { /* ... unchanged ... */
        if ($$(wheelSnapTimeoutId)) {
            clearTimeout($$(wheelSnapTimeoutId))
            wheelSnapTimeoutId(null)
        }
        if (e.type !== 'touchstart') e.preventDefault()
        isDragging = true
        hasMoved = false
        startY = getClientY(e)
        startTranslateY = currentY
        startTime = Date.now()
        lastMoveY = startY
        lastMoveTime = startTime
        velocity = 0
        $$(list).style.transition = 'none'
        $$(viewport).style.cursor = 'grabbing'
        if ($$(rafId)) cancelAnimationFrame($$(rafId))
    }
    function handleMove(e: PointerEvent & TouchEvent) { /* ... unchanged ... */
        if (!isDragging) return
        const currentMoveY = getClientY(e)
        const deltaY = currentMoveY - startY
        if (!hasMoved && Math.abs(deltaY) > CLICK_THRESHOLD_PX) { hasMoved = true }
        if (hasMoved && e.cancelable) { e.preventDefault() }
        let newY = startTranslateY + deltaY
        if (hasMoved) { // Apply rubber band only if moved significantly
            if (newY > maxTranslateY) { newY = maxTranslateY + (newY - maxTranslateY) * 0.3 } else if (newY < minTranslateY) { newY = minTranslateY + (newY - minTranslateY) * 0.3 }
        }
        const now = Date.now()
        const timeDiff = now - lastMoveTime
        if (timeDiff > 10) {
            velocity = (currentMoveY - lastMoveY) / timeDiff
            lastMoveTime = now
            lastMoveY = currentMoveY
        }
        if ($$(rafId)) cancelAnimationFrame($$(rafId))
        rafId(requestAnimationFrame(() => {
            currentY = newY
            $$(list).style.transform = `translateY(${currentY}px)`
            updateItemStyles()
        }))
    }

    function handleEnd(e: PointerEvent) { /* ... unchanged ... */
        if (!isDragging)
            return
        isDragging = false
        $$(viewport).style.cursor = 'grab'
        if ($$(rafId)) cancelAnimationFrame($$(rafId))
        if (!hasMoved) { // Click/Tap
            const targetElement = e.target as HTMLElement
            const targetItem = targetElement.closest('.wheeler-item') as HTMLElement
            if (targetItem && !targetItem.classList.contains('is-padding')) {
                const clickedIndex = parseInt(targetItem.dataset.index, 10)
                if (!isNaN(clickedIndex) && clickedIndex >= 0 && clickedIndex < $$(formattedOptions).length) {
                    snapToIndex(clickedIndex)
                    return
                }
            }
            // Optional: if click missed, snap based on current visual position
            const idealIndexMiss = Math.round(($$(indicatorTop) - currentY) / $$(itemHeight)) - $$(paddingItemCount)
            snapToIndex(idealIndexMiss)
            return
        } // Drag/Fling
        if (currentY > maxTranslateY || currentY < minTranslateY) {
            const boundaryIndex = currentY > maxTranslateY ? 0 : $$(formattedOptions).length - 1
            snapToIndex(boundaryIndex)
        }
        else {
            const inertiaDist = velocity * 120
            const predictedY = currentY + inertiaDist
            const idealIndex = Math.round(($$(indicatorTop) - predictedY) / $$(itemHeight)) - $$(paddingItemCount)
            snapToIndex(idealIndex)
        }
        velocity = 0
    }

    function handleWheel(event: WheelEvent) { /* ... unchanged ... */
        if (isDragging) return
        event.preventDefault()
        if ($$(wheelSnapTimeoutId)) { clearTimeout($$(wheelSnapTimeoutId)) } $$(list).style.transition = 'none'

        const scrollAmount = event.deltaY * 0.5
        const newY = currentY - scrollAmount
        setTranslateY(newY)

        // if ($$(selectedIndex) >= formattedOptions.length - 1) return

        wheelSnapTimeoutId(setTimeout(() => {
            const idealIndex = Math.round(($$(indicatorTop) - currentY) / $$(itemHeight)) - $$(paddingItemCount)
            snapToIndex(idealIndex)
            wheelSnapTimeoutId(null)
        }, 150))
    }

    useEffect(() => {
        document.addEventListener('pointermove', handleMove as any)
        document.addEventListener('pointerup', e => handleEnd)

        return () => {
            document.removeEventListener('pointermove', handleMove as any)
            document.removeEventListener('pointerup', handleEnd)
        }
    })

    //update by value
    let preValue
    useEffect(() => {
        if ($$(multiple)) return

        if ($$(value) === preValue) return
        preValue = $$(value)

        // if ($$(multiple)) {
        //     checkboxes(new Set(Array.isArray($$(value)) ? $$(value) : []))
        // } else {
        const foundIndex = $$(formattedOptions).findIndex(opt => opt.value === $$(value))
        if ($$(selectedIndex) !== foundIndex) selectedIndex(foundIndex)
        // }
    })


    // <<< Populate list *after* first layout calculation >>>
    //populateList()

    // <<< Snap to initial index *after* list is populated and layout is set >>>
    snapToIndex($$(selectedIndex), true)

    const oriIndex = $(-1)
    //update by index
    useEffect(() => {
        if ($$(multiple)) return

        if ($$(oriIndex) === $$(selectedIndex))
            return

        oriIndex($$(selectedIndex))

        if ($$(value) !== $$(formattedOptions)[$$(selectedIndex)].value) {
            value($$(formattedOptions)[$$(selectedIndex)].value)

            if (!ok)
                if (isObservable(oriValue))
                    oriValue($$(value))
        }

        if ($$(selectedIndex) >= 0 && $$(selectedIndex) < $$(formattedOptions).length) { snapToIndex($$(selectedIndex)) }
        else {
            console.warn(`Index "${$$(selectedIndex)}" out of bounds.`)
            selectedIndex(-1)
        }
    })

    const _backdropTransEnd = () => {
        if (!$$(visible)) {
            // container().style.display = "none"
            // closed(true)
        }
    }

    // w-[200px] border bg-white shadow-[0_4px_8px_rgba(0,0,0,0.1)] mb-2.5 rounded-lg border-solid border-[#ccc]
    return <>
        {() => !$$(visible) ? null :
            $$(bottom) ?
                <Portal mount={document.body}>
                    {() => $$(mask) ? <>
                        <div
                            class={['fixed inset-0 bg-black/50 h-full w-full z-[50] opacity-50']}
                            onClick={() => {
                                visible(false)
                            }}
                        />
                    </> : null}
                    <div class={['wheeler-widget z-[100]', cls, "fixed inset-x-0 bottom-0 w-full "]}>
                        {() => $$(header) ? <>
                            <div class={'font-bold text-center'}>{header}</div>
                            <div class="my-1 h-px w-full bg-gray-300 dark:bg-gray-600"></div></> : null}
                        <div ref={viewport}
                            onPointerDown={handleStart as any}
                            onPointerMove={handleMove as any}     /* {passive: false } */
                            onPointerUp={handleEnd}
                            onPointerCancel={handleEnd}
                            onWheel={handleWheel} /* {passive: false } */
                            class={['wheeler-viewport overflow-hidden relative touch-none cursor-grab overscroll-y-contain transition-[height] duration-[0.3s] ease-[ease-out]']}
                            style={{ height: () => `${$$(viewportHeight)}px` }}
                        >
                            <ul class='wheeler-list transition-transform duration-[0.3s] ease-[ease-out] m-0 p-0 list-none' ref={list}>
                                {() => [...populateList()]}
                            </ul>
                            <div class='wheeler-indicator absolute h-9 box-border pointer-events-none bg-[rgba(0,123,255,0.05)] border-y-[#007bff] border-t border-solid border-b inset-x-0' style={{
                                height: () => `${$$(itemHeight)}px`,
                                top: () => `${$$(indicatorTop) + $$($$(itemHeight)) / 2}px`, // Center line of indicator
                                transform: `translateY(-50%)`,
                            }}>
                            </div>

                        </div>
                    </div>
                </Portal>
                :
                <div>
                    <div class={['wheeler-widget', cls,]}>
                        {() => $$(header) ? <>
                            <div class={'font-bold text-center'}>{header}</div>
                            <div class="my-1 h-px w-full bg-gray-300 dark:bg-gray-600"></div></> : null}
                        <div ref={viewport}
                            onPointerDown={handleStart as any}
                            onPointerMove={handleMove as any}     /* {passive: false } */
                            onPointerUp={handleEnd}
                            onPointerCancel={handleEnd}
                            onWheel={handleWheel} /* {passive: false } */
                            class={['wheeler-viewport overflow-hidden relative touch-none cursor-grab overscroll-y-contain transition-[height] duration-[0.3s] ease-[ease-out]']}
                            style={{ height: () => `${$$(viewportHeight)}px` }}
                        >
                            <ul class='wheeler-list transition-transform duration-[0.3s] ease-[ease-out] m-0 p-0 list-none' ref={list}>
                                {() => [...populateList()]}
                            </ul>

                            {() => $$(multiple) ? null :
                                <div class='wheeler-indicator absolute h-9 box-border pointer-events-none bg-[rgba(0,123,255,0.05)] border-y-[#007bff] border-t border-solid border-b inset-x-0' style={{
                                    height: () => `${$$(itemHeight)}px`,
                                    top: () => `${$$(indicatorTop) + $$($$(itemHeight)) / 2}px`, // Center line of indicator
                                    transform: `translateY(-50%)`,
                                }}>
                                </div>
                            }
                        </div>
                    </div>
                </div>
        }

    </>
}

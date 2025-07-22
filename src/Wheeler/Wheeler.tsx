import { $, $$, isObservable, Observable, Portal, useEffect, useMemo } from 'woby'
import { use, useClickAway } from 'use-woby'
import { WheelerProps, WheelerItem } from './WheelerType'

export const ActiveWheelers = $([])

export const Wheeler = <T,>(props: WheelerProps<T>) => {
    const { options,
        itemHeight: ih,
        itemCount: vic,
        value: oriValue,
        class: cls,
        header,
        ok,
        visible = $(true),
        mask,
        bottom = $$(mask),
        all,
        cancelOnBlur,
        commitOnBlur,
        changeValueOnClickOnly
    } = props

    const itemHeight = use(ih, 36)
    const itemCount = use(vic, 5)
    const value = $($$(oriValue))
    const searchValue = $<string>()


    useEffect(() => {
        value($$(oriValue))
    })

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
    const eventType = $<string>()
    const multiple = all

    let preOptions, preFormattedOptions

    const formattedOptions = useMemo(() => {
        if (preOptions === $$(options)) return preFormattedOptions

        const base = $$(options).map(opt => {
            const o = typeof opt === 'object' && opt !== null ? opt : { value: opt, label: String(opt) } as WheelerItem
            if (!('hasComponent' in o))
                o.hasComponent = !!o.component
            return o
        })

        if ($$(multiple)) {
            base.unshift({ value: $$(multiple), label: $$(multiple), hasComponent: false })

            const r = {} as Record<string, Observable<boolean>>

            base.map(opt => r[opt.label] = $(false)) //init
            checkboxes(r)

            const vs = [...[$$(value)]].flat()
            let allInitiallyChecked = true
            base.forEach(opt => {
                const isSelected = vs.some(sv => sv === opt.value)
                r[opt.label](isSelected)
                if (opt.label !== $$(multiple) && !isSelected) {
                    allInitiallyChecked = false
                }
            })
            // Set the "All" checkbox state based on initial values
            if (r[$$(multiple)]) { // Ensure "All" checkbox exists
                r[$$(multiple)](allInitiallyChecked && base.length > 1) // base.length > 1 to avoid "All" being checked if it's the only item
            }


            base.forEach((o, index) => o.component = o.hasComponent ? o.component as any : (props: { itemHeight: number, value: WheelerItem, index: number }) => <li class={['wheeler-item', 'text-black']} data-index={index} data-value={o.value}
                style={{ height: () => `${$$(itemHeight)}px` }}>
                {() => {
                    const isChecked = $$(checkboxes)[o.label]

                    return <label class="flex items-center gap-2 px-2">
                        <input class='pl-2' onClick={e => { isChecked(!$$(isChecked)); chk2value(o.label) }} type="checkbox" checked={$$(isChecked)} readonly />
                        <span class={['pl-5 w-full']} >{o.label}</span>
                    </label>
                }}
            </li>)

        }
        else {
            base.forEach((o, index) => o.component = o.hasComponent ? o.component as any : (() => <li class={['wheeler-item', pickerItemCls, 'text-[#555] opacity-60 ']} data-index={index} data-value={o.value}
                style={{ height: () => `${$$(itemHeight)}px` }}>{o.label}
            </li>))
        }

        preOptions = $$(options)

        return preFormattedOptions = base
    })

    const chkValues = () => {
        // const c = $$(checkboxes)

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
            .filter(opt => $$(cb[opt.label]) && !vs.has(opt.value) && opt.label !== $$(multiple))
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

        if (isObservable(visible))
            visible(false)
    })

    //values to chk
    let preValue: any // Store previous value of the external prop
    const value2chk = () => {
        if (!$$(multiple)) return

        // If the component is visible and the external value hasn't changed since the last sync, skip.
        // When visible becomes true, preValue is typically null (reset in visible useEffect),
        // so this condition allows the sync to run.
        if ($$(visible) && preValue === $$(value)) {
            return
        }

        const { onlyInCheckbox, onlyInValue } = chkValues()

        const os = $$(formattedOptions)
        const c = $$(checkboxes)
        const allLabel = $$(multiple) // The label for the "All" checkbox

        let changed = false

        // Sync individual items based on the external `value` prop.
        // Part 1: Check items in UI that are present in `value` but not checked.
        for (const valFromProp of onlyInValue) {
            const opt = os.find(o => o.value === valFromProp)
            // Ensure the option exists, it's not the "All" option itself, and its checkbox observable exists.
            if (opt && opt.label !== allLabel && c[opt.label]) {
                if (!$$(c[opt.label])) { // If not already checked
                    c[opt.label](true)
                    changed = true
                }
            }
        }

        // Part 2: Uncheck items in UI that are checked but not present in `value`.
        for (const valFromCheckbox of onlyInCheckbox) {
            const opt = os.find(o => o.value === valFromCheckbox)
            // Ensure the option exists, it's not the "All" option itself, and its checkbox observable exists.
            if (opt && opt.label !== allLabel && c[opt.label]) {
                if ($$(c[opt.label])) { // If it is currently checked (but shouldn't be)
                    c[opt.label](false)
                    changed = true
                }
            }
        }

        // After individual items are synced, derive and set the state of the "All" checkbox.
        if (allLabel && c[allLabel]) { // Proceed only if "All" functionality is active and its checkbox exists.
            const individualItemCheckboxes = Object.entries(c).filter(([key, _]) => key !== allLabel)

            const allIndividualsAreChecked = individualItemCheckboxes.length > 0 &&
                individualItemCheckboxes.every(([_, obs]) => $$(obs as Observable<boolean>))

            if ($$(c[allLabel]) !== allIndividualsAreChecked) {
                c[allLabel](allIndividualsAreChecked)
                changed = true
            }
        }

        if (changed) {
            // Trigger reactivity for `checkboxes` by providing a new object reference.
            checkboxes({ ...c })
        }

        preValue = $$(value) // Update preValue for the next comparison.
    }
    // This initial call ensures sync on mount or when component structure is first defined.
    value2chk()
    // This useEffect will run after every render because it has no dependency array.
    // It's intended to catch changes to `value` or other relevant states that `value2chk` depends on.
    // `value2chk` itself has a `preValue` check to prevent redundant work if `value` hasn't changed.
    useEffect(value2chk)

    //chkbox to values
    const chk2value = (clickedLabel: string | number) => {
        if (!$$(multiple)) return

        const checkboxesMap = $$(checkboxes)
        const allLabel = $$(multiple)

        // Step 1: Update all checkbox states based on the click, especially "All" logic.
        // The observable for clickedLabel was already flipped by the onClick handler.
        if (clickedLabel === allLabel) {
            // "All" checkbox was clicked. Its new state is in checkboxesMap[allLabel].
            const isAllCheckedNow = $$(checkboxesMap[allLabel])
            Object.entries(checkboxesMap).forEach(([key, obs]) => {
                (obs as Observable<boolean>)(isAllCheckedNow)
            })
        } else {
            // An individual item checkbox was clicked.
            if (checkboxesMap[allLabel]) { // Only if "All" checkbox exists
                const individualItems = Object.entries(checkboxesMap).filter(([key, _]) => key !== allLabel)
                const allIndividualsAreChecked = individualItems.length > 0 && individualItems.every(([_, obs]) => $$(obs))

                if ($$(checkboxesMap[clickedLabel])) { // If the clicked item was just checked
                    if (allIndividualsAreChecked) {
                        checkboxesMap[allLabel](true) // If all individuals are now checked, check "All"
                    }
                } else { // If the clicked item was just unchecked
                    checkboxesMap[allLabel](false) // Uncheck "All"
                }
            }
        }
        // At this point, checkboxesMap reflects the consistent state of all checkboxes.

        // Step 2: Calculate differences based on the new checkbox states and current external value.
        const { onlyInCheckbox, onlyInValue } = chkValues() // chkValues uses $$(checkboxes) internally

        // Step 3: Update the external value if there's a change.
        if (onlyInCheckbox.length === 0 && onlyInValue.length === 0) {
            // This can happen if the click on "All" resulted in a state that already matches `value`.
            // Or if an individual click didn't change the effective selection set relative to `value`.
            // However, we still need to ensure `oriValue` is updated if `value` itself was changed by "All" click
            // even if `onlyInCheckbox/onlyInValue` are empty because `value` was already "correct" relative to the new checkbox state.

            // A more direct approach: construct the new value set directly from checkboxes.
            const newSelectedValues = new Set<T>()
            const currentFormattedOptions = $$(formattedOptions)
            Object.entries($$(checkboxes)).forEach(([label, isCheckedObservable]) => {
                if (label !== allLabel && $$(isCheckedObservable)) {
                    const opt = currentFormattedOptions.find(o => o.label === label)
                    if (opt) {
                        newSelectedValues.add(opt.value as T)
                    }
                }
            })

            const finalNewValueArray = [...newSelectedValues]
            const oldValueJSON = JSON.stringify($$(value))
            const newValueJSON = JSON.stringify(finalNewValueArray)

            if (oldValueJSON !== newValueJSON) {
                value(finalNewValueArray)
                if (!ok && isObservable(oriValue)) {
                    oriValue($$(value))
                }
            }
            return
        }

        const currentVal = $$(value)
        const currentValueFlat = (Array.isArray(currentVal) ? currentVal.flat() : [currentVal]) as T[]
        const currentValueAsSet = new Set<T>(currentValueFlat)

        for (const v of onlyInValue) { // These are of type T (or elements of T if T was T[])
            currentValueAsSet.delete(v as T)
        }
        for (const v of onlyInCheckbox) { // These are from WheelerItem['value'], should be T
            currentValueAsSet.add(v as T)
        }

        const finalNewValueArray = [...currentValueAsSet]
        value(finalNewValueArray as any) // Cast to any to satisfy T | T[] if T is not array

        if (!ok) {
            if (isObservable(oriValue)) {
                (oriValue as Observable<T[]>)(finalNewValueArray as any) // Cast to any for T | T[]
            }
        }
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
        if (!$$(formattedOptions)) return

        if (typeof $$(itemCount) !== 'number' || $$(itemCount) <= 0)
            itemCount(3)

        if ($$(itemCount) % 2 === 0) {
            console.warn(`itemCount (${$$(itemCount)}) should be odd for symmetry. Adjusting to ${$$(itemCount) + 1}.`)
            itemCount($$(itemCount) + 1)
        }

        paddingItemCount(Math.floor($$(itemCount) / 2))


        // Recalculate scroll boundaries based on new layout
        // Need to define getTargetYForIndex before calling it here
        minTranslateY = _getTargetYForIndexUnbound($$(formattedOptions).length - 1)
        maxTranslateY = _getTargetYForIndexUnbound(0)

        snapToIndex($$(selectedIndex))
        // console.log(`Layout Updated: count=${itemCount}, h=${viewportHeight}, pad=${paddingItemCount}, minY=${minTranslateY}, maxY=${maxTranslateY}`);
    })

    const viewportHeight = useMemo(() => $$(itemHeight) * $$(itemCount))
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
        if ($$(formattedOptions))
            for (const [index, option] of $$(formattedOptions).entries())
                yield <option.component {...{ index, value: option, itemHeight }} />

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
    function snapToIndex(index: number, immediate = false, eventType?: Event) {
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
        eventType(e.type)
        $$(list).style.transition = 'none'
        $$(viewport).style.cursor = 'grabbing'
        if ($$(rafId)) cancelAnimationFrame($$(rafId))
    }

    function handleMove(e: PointerEvent & TouchEvent) { /* ... unchanged ... */
        if (!isDragging) return

        const currentMoveY = getClientY(e)
        const deltaY = currentMoveY - startY

        if (!hasMoved && Math.abs(deltaY) > CLICK_THRESHOLD_PX) {
            hasMoved = true
        }

        if (hasMoved && e.cancelable) {
            e.preventDefault()
        }

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

        if ($$(rafId)) {
            cancelAnimationFrame($$(rafId))
        }

        rafId(requestAnimationFrame(() => {
            currentY = newY
            $$(list).style.transform = `translateY(${currentY}px)`
            updateItemStyles()
        }))
    }

    function handleEnd(e: PointerEvent) { /* ... unchanged ... */
        if (!isDragging) {
            return
        }

        isDragging = false
        $$(viewport).style.cursor = 'grab'
        if ($$(rafId)) {
            cancelAnimationFrame($$(rafId))
        }

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
        eventType(event.type)
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
    useEffect(() => {
        if ($$(multiple)) return

        if ($$(value) === preValue) return
        preValue = $$(value)

        const foundIndex = $$(formattedOptions).findIndex(opt => opt.value === $$(value))
        if ($$(selectedIndex) !== foundIndex) {
            selectedIndex(foundIndex)
        }
    })


    // <<< Populate list *after* first layout calculation >>>
    // populateList()

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
            if ($$(eventType) == "wheel" && changeValueOnClickOnly) {

            }
            else {
                value($$(formattedOptions)[$$(selectedIndex)].value)

                if (!ok)
                    if (isObservable(oriValue))
                        oriValue($$(value))
            }
        }

        if ($$(selectedIndex) >= 0 && $$(selectedIndex) < $$(formattedOptions).length) { snapToIndex($$(selectedIndex)) }
        else {
            console.warn(`Index "${$$(selectedIndex)}" out of bounds.`)
            selectedIndex(-1)
        }
    })

    const wheeler = $<HTMLDivElement>()

    useEffect(() => {
        if (!$$(visible)) { // When visible becomes false
            preValue = null
            if ($$(ActiveWheelers).some(w => w === wheeler)) // Check if it exists before filtering
                ActiveWheelers($$(ActiveWheelers).filter(w => w !== wheeler)) // Corrected: remove wheeler
            return
        }

        // When visible becomes true
        if ($$(ActiveWheelers).filter(w => w === wheeler).length === 0) {
            ActiveWheelers([...$$(ActiveWheelers), wheeler])
        }

        value2chk() // Call value2chk to resync checkboxes

        // The original return for cleanup when component unmounts (if needed, though original was commented out)
        // return () => {
        //     if ($$(ActiveWheelers).some(w => w === wheeler))
        //         ActiveWheelers($$(ActiveWheelers).filter(w => w !== wheeler))
        // }
    })

    useClickAway(wheeler, () => {
        if ($$(cancelOnBlur))
            visible(false) //just hide, no save
        if ($$(commitOnBlur)) //hide & save
        {
            if (isObservable(ok))
                ok(true)

            visible(false) //just hide, no save
            // if (!ok)
            if (isObservable(oriValue))
                oriValue($$(value))
        }
    })

    const search = (val: string) => {
        let newVal
        $$(options).find((options) => {
            if ((options.value as string).toLowerCase().includes(val.toLowerCase())) {
                newVal = options.value
            }
        })

        if (newVal) {
            value(newVal)
        }
        else {
            alert("No results found")
        }
    }

    return <>
        {() => !$$(visible) ? null :
            $$(bottom) ?
                <Portal mount={document.body}>
                    {() => $$(mask) ? <>
                        <div
                            class={['fixed inset-0 bg-black/50 h-full w-full z-[00] opacity-50']}
                        // onClick={() => {
                        //     if ($$(hideOnBlur))
                        //         visible(false) //just hide, no save
                        //     if ($$(commitOnBlur)) //hide & save
                        //     {
                        //         visible(false) //just hide, no save
                        //         // if (!ok)
                        //         if (isObservable(oriValue))
                        //             oriValue($$(value))
                        //     }
                        // }}
                        />
                    </> : null}
                    <div ref={wheeler} class={['wheeler-widget z-[100]', cls, "fixed inset-x-0 bottom-0 w-full z-20 bg-white"]}>
                        {() => header ?
                            <>
                                <div>
                                    <div class='font-bold text-center'>{() => header(value)}</div>
                                    <div class="w-screen relative flex flex-col flex-wrap items-center">
                                        <input
                                            type="text"
                                            placeholder={`Enter ${header().toLowerCase()}`}
                                            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out w-64"
                                            onChange={(e) => {
                                                const value = e.target.value
                                                search(value)
                                            }}
                                        />
                                    </div>
                                    <div class="my-1 h-px w-full bg-gray-300 dark:bg-gray-600"></div>
                                </div>
                            </> :
                            null
                        }
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
                <div class={['wheeler-widget', cls,]}>
                    {() => header ? <>
                        <div class={'font-bold text-center'}>{() => header(value)}</div>
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
        }

    </>
}

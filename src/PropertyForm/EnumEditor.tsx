/** @jsxImportSource woby */

import { $, $$, isObservable, ObservableMaybe } from "woby"
import { Editors, UIProps, skippedProperties, rowLabel, isLocked } from "./Editors"
import { tx } from "../i18n"
import { TableRow } from "./PropertyForm"
import { EditorProps } from "./EditorProps"

/**
 * EnumEditor: A plain <select>-style editor for "one of these N string values".
 *
 * Triggered when the observable carries a `.options` array (set by
 * extractCustomElementProperties for props of type 'enum').
 *
 * Registered first in the editor list so its renderCondition runs before
 * StringEditor's — otherwise StringEditor would also match (enum values are
 * strings) and the enum would render twice.
 */
export const EnumEditor = () => {
    const renderCondition = (value: ObservableMaybe<any>, key?: string) => {
        // The extractor hangs .options on the observable for enum props
        return Array.isArray((value as any)?.options)
    }

    const UI = (props: UIProps<string>) => {
        const { value, editorName, indentLvl } = props

        return skippedProperties.includes(editorName) ? null : (
            <TableRow
                optionName={() => rowLabel(editorName)}
                indentLvl={indentLvl}
                prop={editorName}
                action={(value as any)?.action}
                hint={(value as any)?.hint}
            >
                <EnumSelect value={value} />
            </TableRow>
        )
    }

    const EnumSelect = (props: EditorProps) => {
        const { value } = props
        const options: { value: string; label?: string }[] = (value as any)?.options ?? []

        return (
            <select
                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={$$(value)}
                disabled={isLocked(value)}
                onChange={(e: any) => {
                    if (isObservable(value)) {
                        ;(value as any)((e.target as HTMLSelectElement).value)
                    }
                }}
            >
                {options.map(opt => (
                    <option value={opt.value}>
                        {/* A thunk, not a bare call: tx reads the locale observable, so
                            this re-renders on a language switch. The *value* is never
                            translated -- it is the attribute that gets written back. */}
                        {() => tx(opt.label ?? opt.value)}
                    </option>
                ))}
            </select>
        )
    }

    return {
        UI,
        renderCondition,
        type: "EnumEditor",
    }
}

// Register FIRST so EnumEditor's renderCondition runs before StringEditor's
// This is critical: StringEditor excludes values with .options, but only
// because EnumEditor already matched them.
Editors([EnumEditor, ...$$(Editors) as any])
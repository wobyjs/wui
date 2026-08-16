/** @jsxImportSource woby */

import { $, $$, isObservable, ObservableMaybe } from "woby"
import { Editors, UIProps, skippedProperties } from "./Editors"
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
        const optionName = editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
            return str.toUpperCase()
        })

        return skippedProperties.includes(editorName) ? null : (
            <TableRow
                optionName={optionName}
                indentLvl={indentLvl}
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
                disabled={!isObservable(value)}
                onChange={(e: any) => {
                    if (isObservable(value)) {
                        ;(value as any)((e.target as HTMLSelectElement).value)
                    }
                }}
            >
                {options.map(opt => (
                    <option value={opt.value}>
                        {opt.label ?? opt.value}
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
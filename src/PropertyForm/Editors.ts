/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, Observable, type JSX } from "woby"
import { tx } from "../i18n"

export type UIProps<T> = {
	value: ObservableMaybe<T>
	reactive: ObservableMaybe<boolean>
	data: ObservableMaybe<any>
	editorName: string
	textAlign?: string
	indentLvl?: number
	open?: Observable<boolean>
	button?: JSX.Element
	onChange?: (e: any) => void
	changeValueOnClickOnly?: ObservableMaybe<boolean>
}

export const Editors = $<
	(() => {
		UI: (props: { data: any, editorName: string, value: any, indentLvl?: number, textAlign?: string }) => JSX.Element,
		renderCondition: (values: ObservableMaybe<any>, key?: string) => boolean
	})[]
>([])

export const skippedProperties = ["autoDistance", "rotated", "tolerance", "isCached", "snap", "zIndex", "show", "label", "isWall", "outline", "partial", "projection", "primitiveType", "restdb", "verticalOrigin", "horizontalOrigin", "labelProps", "labelShow", "Altitude", "url", "distanceDisplayCondition", "eyeoffset", "ids", "id", "columnsDecoder", "style", "priority"]
export const indent = ["pl-4", "pl-8", "pl-12", "pl-16"]

/**
 * A property key as it should read on screen, translated.
 *
 * Two steps, and the order matters. First the key is humanised — `fontSize` becomes
 * `Font Size`, `variant` becomes `Variant` — because that is what a row has always
 * shown and therefore what a translator was given to translate. Then the humanised
 * English goes through `tx`, which returns it unchanged in English and the local
 * wording elsewhere.
 *
 * Every row editor used to inline this `replace` pair. They call this instead so a
 * key is humanised exactly once, in one place, and the catalogue only ever has to
 * carry one spelling of it.
 *
 * Note the plugin case: `PropertyExtractor` keys its record by `PluginProp.label`,
 * which is already spaced and capitalised (`Badge Content`), so humanising is a no-op
 * there and the lookup hits the label verbatim. That is deliberate — the record key
 * stays English so `applyCustomElementProperty` can still match it back to the schema.
 * Translation happens here, at the last possible moment, and never touches the key.
 *
 * Call it from a thunk (`optionName={() => rowLabel(name)}`) rather than at render
 * time: `tx` reads the `locale` observable, so a thunk re-runs on a language switch
 * and a bare call does not.
 */
export const rowLabel = (editorName: string): string =>
	tx(editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, str => str.toUpperCase()))

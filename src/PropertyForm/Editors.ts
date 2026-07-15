/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, Observable, type JSX } from "woby"

export type UIProps<T> = {
	value: ObservableMaybe<T>
	reactive: ObservableMaybe<boolean>
	data: ObservableMaybe<any>
	editorName: string
	textAlign?: string
	indentLvl?: number
	open?: Observable<boolean>
	button?: JSX.Element
	onChange: (e) => void
	changeValueOnClickOnly?: ObservableMaybe<boolean>
}

export const Editors = $<
	(() => {
		UI: (props: { data, editorName: string, value: any, indentLvl?: number, textAlign?: string }) => JSX.Element,
		renderCondition: (values: ObservableMaybe<any>, key?: string) => boolean
	})[]
>([])

export const skippedProperties = ["autoDistance", "rotated", "tolerance", "isCached", "snap", "zIndex", "show", "label", "isWall", "outline", "partial", "projection", "primitiveType", "restdb", "verticalOrigin", "horizontalOrigin", "labelProps", "labelShow", "Altitude", "url", "distanceDisplayCondition", "eyeoffset", "ids", "id", "columnsDecoder", "style", "priority"]
export const indent = ["pl-4", "pl-8", "pl-12", "pl-16"]

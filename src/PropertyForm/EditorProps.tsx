import { ObservableMaybe } from "woby"

export type EditorProps = {
	reactive?: ObservableMaybe<boolean>
	value: ObservableMaybe<any>
	onChange?: (e: any) => void
	name?: string
	/**
	 * The object the edited property belongs to. Deliberately `any`: editors index it by
	 * runtime-discovered keys (`obj["colLabel"]`, `obj["thematicType"]`, …) that no static
	 * shape can describe.
	 */
	obj?: any
	editorName?: string
	changeValueOnClickOnly?: ObservableMaybe<boolean>
}

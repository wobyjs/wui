import { ObservableMaybe } from "woby"

export type EditorProps = {
	reactive: ObservableMaybe<boolean>
	value: ObservableMaybe<any>
	onChange?: (e) => void
	name?: string
	obj?: ObservableMaybe<{}>
	editorName?: string
	changeValueOnClickOnly? : ObservableMaybe<boolean>
}

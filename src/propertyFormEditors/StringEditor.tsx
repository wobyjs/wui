import { TextField } from "../TextField"
import { isObservable } from "woby"
import { EditorProps } from "./EditorProps"

export const StringEditor = (props: EditorProps) => {
	const { value } = props

	return (
		<TextField
			className={""}
			value={value}
			assignOnEnter
			disabled={!isObservable(value)}
		></TextField>
	)
}

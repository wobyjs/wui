// CodeBlock.tsx
import { $, type JSX } from 'woby'

type Props = {
    code: string
    language?: string
    class?: JSX.Class
}

export const CodeBlock = ({ code, language = 'tsx', class: klass }: Props) => {
    const copied = $(false)

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            copied(true)
            setTimeout(() => copied(false), 1200)
        } catch {
            // no-op
        }
    }

    return (
        <div class={() => `relative rounded bg-gray-900 text-gray-100 text-xs ${klass ?? ''}`}>
            <button
                class="absolute top-2 right-2 px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 active:bg-gray-500 transition text-white"
                onClick={onCopy}
            >
                {() => (copied() ? 'Copied!' : 'Copy')}
            </button>

            <pre class="m-0 whitespace-pre overflow-x-auto p-4">
                <code class={`language-${language}`}>{code}</code>
            </pre>
        </div>
    )
}

export default CodeBlock

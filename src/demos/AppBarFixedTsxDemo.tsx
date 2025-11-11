import { render } from 'woby'
import Appbar from '../Appbar'
import CodeBlock from '../helper/CodeBlock'
const App2 = () => (
    <div>
        <Appbar position="fixed" class="px-4 mt-2">
            <div class="flex items-center h-12 pl-4">Fixed Appbar</div>
        </Appbar>
        <div class="p-4 text-sm text-gray-500 space-y-4">
            <p>This demo shows an <span class="font-bold">Fixed Appbar</span> with <code class="font-bold">position="fixed"</code> rendered via the TSX <code class="font-bold">&lt;Appbar&gt;</code> component.</p>
            <p>Scroll down…</p>
            <div class="h-[600px] bg-gray-100 rounded border"></div>
        </div>
    </div>
)

const App = () => (
    <div>
        <Appbar position="fixed" cls="px-4 mt-2">
            <div class="flex items-center h-12 pl-4">Fixed Appbar</div>
        </Appbar>

        <div class="p-4 text-sm text-gray-500 space-y-4 pb-12">
            <p>This demo shows an <span class="font-bold">Fixed Appbar</span> with <code class="font-bold">position="fixed"</code> rendered via the TSX <code class="font-bold">&lt;Appbar&gt;</code> component.</p>
            <p>Scroll down…</p>
            <div class="h-[600px] bg-gray-100 rounded border p-4">
                <CodeBlock code={`<Appbar position="fixed" class="px-4 mt-2">\n\t<div class="flex items-center h-12 pl-4">Fixed Appbar</div>\n</Appbar>`} language="tsx" />
            </div>
        </div>
    </div>
)

render(App, document.getElementById('root')!)

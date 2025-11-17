import { render } from 'woby'
import Appbar from '../Appbar'
import CodeBlock from '../helper/CodeBlock'

// const App2 = () => (
//     <div>
//         <Appbar cls="px-4 mt-2">
//             <div class="flex items-center h-12 pl-4">Default Appbar</div>
//         </Appbar>
//         <div class="p-4 text-sm text-gray-500 space-y-4 pb-12">
//             <p>This demo shows the <span class="font-bold">Default Appbar</span> rendered with the TSX component <code class="font-bold">&lt;Appbar&gt;</code>.</p>
//             <p>Scroll down…</p>
//             <div class="h-[600px] bg-gray-100 rounded border" />
//         </div>
//     </div>
// )

const App = () => (
    <div>
        <Appbar cls="px-4 mt-2">
            <div class="flex items-center h-12 pl-4">Default Appbar</div>
        </Appbar>

        <div class="p-4 text-sm text-gray-500 space-y-4 pt-14 mt-2 h-[600px] ">
            <p>This demo shows the <span class="font-bold">Default Appbar</span> rendered with the TSX component <code class="font-bold">&lt;Appbar&gt;</code>.</p>
            <p>Scroll down…</p>
            <div class="bg-gray-100 rounded border p-4">
                <CodeBlock code={`<Appbar cls="px-4 mt-2">\n\t<div class="flex items-center h-12 pl-4">Default Appbar</div>\n</Appbar>`} language="tsx" />
            </div>
        </div>
    </div>
)

render(App, document.getElementById('root')!)

import { render } from 'woby'
import Appbar from '../Appbar'
import CodeBlock from '../helper/CodeBlock'

// const App2 = () => (
//     <div>
//         <Appbar color="custom" bgClass="bg-black/80" textClass="text-white" elevation={4} edge="bottom">
//             <div class="flex items-center h-12 pl-4">Custom Appbar</div>
//         </Appbar>
//         <div class="p-4 text-sm text-gray-500 space-y-2 pb-12">
//             <p>This demo shows a <span class="font-bold">Custom Appbar</span> using the TSX <code>&lt;Appbar&gt;</code> component with a custom dark background, white text, and elevation 4.</p>
//             <p>Scroll down…</p>
//             <div class="h-[600px] bg-gray-100 rounded border">
//                 {/* <div class="rounded bg-gray-900 text-gray-100 text-xs p-4"> */}
//                 <pre class="m-0 whitespace-pre overflow-x-auto">
//                     <code class="language-tsx">{`<Appbar color="custom" bgClass="bg-black/80" textClass="text-white" elevation={4} edge="bottom">\n\t<div class="flex items-center h-12 pl-4">Custom Appbar</div>\n</Appbar>`}</code>
//                 </pre>
//                 {/* </div> */}
//             </div>
//             {/* <div class="h-[600px] bg-gray-100 rounded border"></div> */}
//         </div>
//     </div>
// )

const App = () => (
    <div>
        <Appbar type position="sticky" cls="bg-black/80 text-white font-bold uppercase shadow-md px-4 w-[50%]">
            <div class="flex items-center h-12 pl-4">Custom Appbar</div>
        </Appbar>

        <div class="mx-2 p-4 text-sm text-gray-500 space-y-4 pt-14 h-[600px]">
            <p>This demo shows a <span class="font-bold">Custom Appbar</span> using the TSX <code>&lt;Appbar&gt;</code> component.</p>
            <p>Scroll down…</p>
            <div class="bg-gray-100 rounded border p-4">
                <CodeBlock code={`<Appbar custom cls="bg-black/80 text-white font-bold uppercase shadow-md px-4 mt-1 w-[50%]">\n\t<div class="flex items-center h-12 pl-4">Custom Appbar</div>\n</Appbar>`} language="tsx" />
            </div>
        </div>
    </div>
)
render(App, document.getElementById('root')!)

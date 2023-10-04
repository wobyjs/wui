/** @type {import('tailwindcss').Config} */

import 'tailwindcss/lib/'
// import resolveConfig from 'tailwindcss/resolveConfig'
// import { generateRules } from 'tailwindcss/lib/lib/generateRules'
// import { createContext } from 'tailwindcss/lib/lib/setupContextUtils'
// const plugin = require('tailwindcss/plugin')

const config = {
    content: [
        "./src/**/*.{html,tsx}",
        "./docs/**/*.{html,tsx}"],
    theme: {
        extend: {

        },
    },
    plugins: [
        require('tailwindcss-elevation'),
        // plugin(function ({ matchVariant, e }) {
        //     matchVariant(
        //         'grp',
        //         (value) => {
        //             console.log('value:', value)
        //             const pos = value.indexOf(']-')
        //             const s = value.substr(0, pos)
        //             const t = value.substr(pos + 2)

        //             // const rules = generateRules(sortedClasses, context)

        //             console.log('s:', s, 't:', t)
        //             return `&:nth-child(${value})`
        //         },

        //     )
        // })
    ],
}

// const context = createContext(resolveConfig(config))

// export function createTailwindHelper() {
//     function sortClasses(classes: string[]): string[] {
//         return defaultSort(context.getClassOrder(classes))
//     }

//     return {
//         classesToCss(classes: Set<string>): string | undefined {
//             const sortedClasses = sortClasses(Array.from(classes.values()))
//             const rules = generateRules(sortedClasses, context)
//             // console.log("rules", rules[0], rules[0][1].nodes, 'Parent:', rules[0][1].parent)
//             if (!rules.length) return
//             const css = rules.map((rule: any) => { console.log('rule:', rule[1].selector, rule[1].nodes.map(n => n.toString())); return rule[1].toString() }).join('\n')
//             if (css) return css
//         },
//     }
// }

// function defaultSort(arrayOfTuples: [string, bigint][]) {
//     return arrayOfTuples
//         .sort(([, a], [, z]) => {
//             if (a === z) return 0
//             if (a === null) return -1
//             if (z === null) return 1
//             return bigSign(a - z)
//         })
//         .map(([className]) => className)
// }

// function bigSign(bigIntValue: bigint) {
//     // @ts-ignore
//     return (bigIntValue > 0n) - (bigIntValue < 0n)
// }

// export function play() {
//     const html = `<div class="my-2 bg-teal-100 m-10 my-2">Lorem ipsum</div>`
//     const classes = getAllClassesFromHTML(`hover:grp-[&>div:focus]:[text-[red]|font-bold|bg-blue-500]`) // bg-teal-100 m-10 my-2`)
//     console.log('classes', classes)
//     const tw = createTailwindHelper()
//     const css = tw.classesToCss(classes)

//     console.log('css:', css)
// }

// function getAllClassesFromHTML(htmlString: string) {
//     // const parser = new DOMParser()
//     // const doc = parser.parseFromString(htmlString, 'text/html')

//     const allClasses = new Set<string>()
//     // Get all HTML elements with classes
//     const elementsWithClasses = htmlString.split(' ') //doc.querySelectorAll('[class]')
//     console.log('htmlString:', htmlString, elementsWithClasses)

//     // Iterate through the elements and extract classes
//     // elementsWithClasses.forEach((element) => {
//     //     const classNames = element.classList
//     //     classNames.forEach((className) => {
//     //         allClasses.add(className)
//     //     })
//     // })

//     return new Set(elementsWithClasses) //allClasses
// }

// play()


module.exports = config
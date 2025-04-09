/** @type {import('tailwindcss').Config} */

import config from './tailwind.config'
import resolveConfig from 'tailwindcss/resolveConfig'
const { generateRules } = require('tailwindcss/lib/lib/generateRules')
const { createContext } = require('tailwindcss/lib/lib/setupContextUtils')
const plugin = require('tailwindcss/plugin')


export function createTailwindHelper() {
    const context = createContext(resolveConfig(config))

    function sortClasses(classes: string[]): string[] {
        return defaultSort(context.getClassOrder(classes))
    }

    return {
        classesToCss(classes: Set<string>): string | undefined {
            const sortedClasses = sortClasses(Array.from(classes.values()))
            const rules = generateRules(sortedClasses, context)
            if (!rules.length) return
            const css = rules.map((rule: any) => rule[1].toString()).join('\n')
            if (css) return css
        },
    }
}

function defaultSort(arrayOfTuples: [string, bigint][]) {
    return arrayOfTuples
        .sort(([, a], [, z]) => {
            if (a === z) return 0
            if (a === null) return -1
            if (z === null) return 1
            return bigSign(a - z)
        })
        .map(([className]) => className)
}

function bigSign(bigIntValue: bigint) {
    // @ts-ignore
    return (bigIntValue > 0n) - (bigIntValue < 0n)
}

export function play() {
    const html = `<div class="my-2 bg-teal-100 m-10 my-2">Lorem ipsum</div>`
    const classes = getAllClassesFromHTML(html)
    const tw = createTailwindHelper()
    const css = tw.classesToCss(classes)

    console.log(css)
}

function getAllClassesFromHTML(htmlString: string): Set<string> {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    const allClasses = new Set<string>()
    // Get all HTML elements with classes
    const elementsWithClasses = doc.querySelectorAll('[class]')

    // Iterate through the elements and extract classes
    elementsWithClasses.forEach((element) => {
        const classNames = element.classList
        classNames.forEach((className) => {
            allClasses.add(className)
        })
    })

    return allClasses
}
/**
 * i18n — the public entry point.
 *
 * Importing this module gets you English and the *offer* of the rest. English is
 * registered eagerly because it is the fallback every other pack falls through to;
 * Chinese and Malay are merely filed as loaders, so the bundler splits them into
 * separate chunks that are fetched the first time someone actually asks for them.
 * A build that never calls `setLocale('ms')` never ships a byte of Malay.
 *
 * ```ts
 * import { setLocale, t, availableLocales } from '@woby/wui'
 *
 * await setLocale('ms')              // fetches the chunk, then publishes
 * t('editor.bold')                   // 'Tebal'
 * availableLocales()                 // en, ms, zh-Hans, zh-Hant — loaded or not
 * ```
 *
 * Adding a fourth language is one `registerLocaleLoader` call and one file; it does not
 * have to happen in this package, and `registerLocale` accepts a pack an application
 * built at runtime with no file at all.
 *
 * @module i18n
 */

export * from './i18n'

import { registerLocale, registerLocaleLoader } from './i18n'
import { en } from './locales/en'

// Eager: the fallback chain dead-ends here, so it must be present before any lookup.
registerLocale(en)

// Lazy: the `meta` is what lets a picker list these before they exist. Names are written
// in the language itself, which is how a language menu is expected to read — someone
// looking for Chinese is looking for 中文, not for the word "Chinese".
registerLocaleLoader('zh-Hans', () => import('./locales/zh-Hans'),
    { name: '简体中文', english: 'Chinese (Simplified)' })

registerLocaleLoader('zh-Hant', () => import('./locales/zh-Hant'),
    { name: '繁體中文', english: 'Chinese (Traditional)' })

registerLocaleLoader('ms', () => import('./locales/ms'),
    { name: 'Bahasa Malaysia', english: 'Malay' })

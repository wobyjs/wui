/**
 * LanguageSwitch.tsx — the toolbar's language picker.
 *
 * The i18n registry (`src/i18n`) is the mechanism; this is the one control that exposes
 * it to a reader rather than to a host's start-up code. It lists whatever has been
 * registered — including languages that exist only as a `registerLocaleLoader` thunk and
 * have never been fetched — and picking one fires `setLocale`, which loads the pack if
 * needed and then publishes. Every binding in the editor that reads a string through
 * `t`/`tx` re-runs on that publish, so the whole chrome re-labels itself without a
 * reload.
 *
 * There is no `locales` prop to restrict the menu. The menu *is* the registry: a host
 * that wants three languages registers three, and one that wants its own language
 * alongside ours calls `registerLocale` with its own pack. A filter here would be a
 * second place to configure the same list, and the two would drift.
 */

import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, JSX, ObservableMaybe, useEffect, type Observable } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useDropdownDismiss } from './useDropdownDismiss'
import { availableLocales, locale, setLocale, t, type LocaleInfo } from '../i18n'
import LanguageIcon from '../icons/language'
import KeyboardDownArrow from '../icons/keyboard_down_arrow'
import { TOOLBAR_CONTROL, TOOLBAR_CONTROL_WRAP } from './toolbarControl'

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
    buttonType: $('outlined', HtmlString) as ObservableMaybe<ButtonStyles>,
    /**
     * Show the current language's name beside the globe.
     *
     * Off by default: the toolbar is already wide, and the names are endonyms of
     * unpredictable length (`Bahasa Malaysia` is fourteen characters where `English` is
     * seven). A host with room to spare can turn it on.
     */
    showName: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
})

const LanguageSwitch = defaults(def, (props) => {
    const { class: cn, cls, buttonType, showName, ...otherProps } = props

    const BASE_BTN = 'size-full inline-flex items-center justify-center gap-1 rounded-md border border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer'

    const isOpen = $(false) as Observable<boolean>
    const dropdownRef = $<HTMLElement>(null as any)
    const menuRef = $<HTMLElement>(null as any)

    useDropdownDismiss(dropdownRef as any, () => isOpen(false))

    // Same reason as the other toolbar dropdowns: showing and hiding through `style`
    // rather than by adding and removing the subtree keeps the reconciler out of it.
    useEffect(() => {
        const menu = $$(menuRef)
        if (menu) menu.style.display = $$(isOpen) ? '' : 'none'
    })

    /** The entry for the language in force, if the registry knows one. */
    const current = () => availableLocales().find(l => l.code === $$(locale))

    const pick = (info: LocaleInfo) => {
        isOpen(false)
        // Not awaited: the pack may still be in flight, and the switch publishes the
        // moment it lands. Nothing on this line depends on the new strings.
        void setLocale(info.code)
    }

    const Menu = () => (
        <div
            ref={menuRef}
            class="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
            role="menu"
            aria-orientation="vertical"
            onMouseDown={(e: any) => { e.stopPropagation(); e.preventDefault() }}
        >
            <div class="py-1" role="none">
                {/* Read inside the binding: a pack registered after the menu was built —
                    a host adding its own language, or a lazy pack finishing its fetch —
                    changes both the list and which row is marked current. */}
                {() => availableLocales().map(info => (
                    <Button
                        type="outlined"
                        cls={[
                            'w-full flex items-center justify-between gap-3 px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer',
                            () => info.code === $$(locale) ? '!bg-slate-200' : '',
                        ]}
                        role="menuitem"
                        onClick={(e) => { e.preventDefault(); pick(info) }}
                    >
                        <span class="truncate">{info.name}</span>
                        {/* The tag, not the English name: it is what `setLocale` takes and
                            what disambiguates two packs whose endonyms look alike. */}
                        <span class="text-xs text-gray-400 shrink-0">{info.code}</span>
                    </Button>
                ))}
            </div>
        </div>
    )

    return (
        <div
            class={() => [TOOLBAR_CONTROL_WRAP, () => $$(cls) ? $$(cls) : 'relative inline-block text-left', cn]}
            ref={dropdownRef}
        >
            <Button
                type={buttonType}
                cls={[BASE_BTN, TOOLBAR_CONTROL]}
                title={() => t('editor.language.choose')}
                aria-label={() => t('editor.language')}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); isOpen(!$$(isOpen)) }}
                // The caret guard the rest of the toolbar uses: a mousedown reaching the
                // document collapses the selection the author is standing in.
                onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation() }}
                {...otherProps}
            >
                <LanguageIcon class="h-5 w-5" />
                {() => $$(showName) ? <span class="truncate max-w-24">{() => current()?.name ?? $$(locale)}</span> : null}
                <KeyboardDownArrow class="h-4 w-4" />
            </Button>

            {() => $$(isOpen) ? <Menu /> : null}
        </div>
    )
})

export { LanguageSwitch }

customElement('wui-language-switch', LanguageSwitch)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-language-switch': ElementAttributes<typeof LanguageSwitch>
        }
    }
}

export default LanguageSwitch

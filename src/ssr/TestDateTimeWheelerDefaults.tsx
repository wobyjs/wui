import { HtmlDate } from 'woby'
import { assert } from '../test-util'
import { dateTimeWheelerDef } from '../Wheeler/DateTimeWheeler'

/* Regression: <wui-datetime-wheeler> Date props must survive the custom-element
   attribute round-trip as a no-op write.

   On connect, woby reflects each prop to its attribute and replays the attribute back
   into the prop observable. With a bare `$(Date)` default the replayed value is a new,
   non-identical Date (and toUTCString drops the ms), so every replay counted as a change
   and re-ran the inserting effect — a ~60s render loop on compass load (fbase RegisterUser).
   With `HtmlDate` the observable compares by time, so the replay leaves it untouched. */

const name = 'TestDateTimeWheelerDefaults'

if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    console.log(`\n📝 Test: ${name}`)
    let allPassed = true
    const check = (ok: boolean, msg: string) => {
        assert(ok, `[${name}] ${msg}`)
        if (!ok) allPassed = false
        console.log(`   ${msg} ${ok ? '✅' : '❌'}`)
    }

    for (const key of ['value', 'minDate', 'maxDate'] as const) {
        const obs = dateTimeWheelerDef()[key] as any
        const before = obs() as Date

        // The replay: attribute string (ISO) parsed back into a fresh Date with the same time.
        obs(new Date(before.toISOString()))
        check(obs() === before, `${key}: time-equal Date write is a no-op`)

        // Exactly what connectedCallback does: reflect via toHtml, parse back via fromHtml, write.
        obs(HtmlDate.fromHtml!(HtmlDate.toHtml!(before) as string))
        check(obs() === before, `${key}: toHtml→fromHtml replay write is a no-op`)

        // Control: a genuinely different date still updates.
        const other = new Date(before.getTime() + 86_400_000)
        obs(other)
        check(+obs() === +other, `${key}: different date still updates`)
    }

    console.log(`   Result: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}\n`)
}

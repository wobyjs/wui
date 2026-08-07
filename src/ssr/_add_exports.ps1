$files = @(
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestChip.tsx"; count=2; name="TestChip"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestCollapse.tsx"; count=3; name="TestCollapse"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestFab.tsx"; count=2; name="TestFab"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestIconButton.tsx"; count=2; name="TestIconButton"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestNumberField.tsx"; count=2; name="TestNumberField"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestPaper.tsx"; count=3; name="TestPaper"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestSideBar.tsx"; count=2; name="TestSideBar"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestSwitch.tsx"; count=2; name="TestSwitch"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestTabs.tsx"; count=1; name="TestTabs"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestTextArea.tsx"; count=2; name="TestTextArea"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestTextField.tsx"; count=2; name="TestTextField"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestToggleButton.tsx"; count=2; name="TestToggleButton"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestToolbar.tsx"; count=1; name="TestToolbar"},
    @{path="D:\Developments\tslib\@woby\wui\src\ssr\TestZoomable.tsx"; count=1; name="TestZoomable"}
)

foreach ($f in $files) {
    $path = $f.path
    $count = $f.count
    $name = $f.name
    $content = Get-Content $path -Raw

    # Change 1: Add stateCount after static line in .test object
    $content = $content -replace '(static: (true|false),\s*)compareActualValues', "`$1    stateCount: $count,`n    compareActualValues"

    # Change 2: Add export { TestXxx } before export default
    $content = $content -replace '^(export default \(\) =>)', "export { $name }`n`$1"

    Set-Content $path -Value $content -NoNewline
    Write-Host "OK ${name}: stateCount=${count}, export added"
}
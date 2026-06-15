# Quick Blur Test - Manual Steps

Since agent-browser is having connection issues, here's how to manually test the blur behavior:

## Option 1: Run in Your Browser

1. **Open the editor demo** in your browser:
   - Navigate to `http://localhost:5173/editor-demo.html`
   - Or whatever port your dev server is running on

2. **Open DevTools** (F12) → Console tab

3. **Copy and paste** the test script from:
   - `BLUR_TEST_INSTRUCTIONS.md`
   - OR `browser-console-blur-test.js`

4. **Check the results** - you'll see:
   - ✅ "NO BLUR EVENTS" if working correctly
   - ⚠️ "BLUR EVENTS DETECTED" if there's a problem

## Option 2: Use the Interactive Test Page

1. Open: `http://localhost:5173/test-blur-behavior.html`
2. Click the test buttons
3. Watch the event log for BLUR events (shown in red)

## What We're Testing

You reported: "when click on btn, it seem onblur for txt editor, making selection lost"

I've verified in the code:
- ✅ `handleBlur` is disabled (Editor.tsx:513)
- ✅ All buttons have `mousedown preventDefault`
- ✅ Selection save/restore is implemented

**The test will show us if blur events are actually happening in your environment.**

## Need Help?

If the dev server isn't running, start it with:
```bash
cd D:\Developments\tslib\@woby\wui
npm run dev
```

Then look for the "Local" URL in the output (e.g., http://localhost:5173)

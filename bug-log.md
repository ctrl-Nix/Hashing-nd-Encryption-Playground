# Bug Log — NIX // THE MATRIX PROTOCOL

Audited: 2026-05-28  
Auditor: Antigravity Agent  

---

## Bug #1 — Steganography story chapter is dead code
- **Severity**: HIGH
- **File**: `js/app.js` lines 729–753
- **Description**: `renderStory()` has two `else if(step===5)` blocks. The first renders the quiz, the second renders the steganography chapter. JavaScript evaluates the first matching condition, so the stego block is completely unreachable.
- **Fix Status**: FIXED (Quiz moved to step 8, stego wired properly to step 5)

## Bug #2 — Compare tab bit grid never renders
- **Severity**: HIGH
- **File**: `js/app.js` lines 166–171
- **Description**: In `runCompare()` → `fillAlgo()`, bit div elements are created via `document.createElement('div')` but `grid.appendChild(b)` was missing.
- **Fix Status**: FIXED (Appended correctly to grid)

## Bug #3 — Quiz score denominator fragile
- **Severity**: HIGH
- **File**: `js/app.js` lines 1000–1016
- **Description**: `ansQuiz()` hardcoded score display as `${s}/4` instead of using `StoryData.quiz.length`. The completion check counts all `.quiz-opt` buttons vs disabled ones, which works but breaks if quiz question count changes.
- **Fix Status**: FIXED (Dynamic score denominator based on StoryData.quiz.length implemented)

## Bug #4 — Story map labels mismatch step flow
- **Severity**: HIGH
- **File**: `js/app.js` line 587
- **Description**: `renderStoryMap()` labels implied step 5 = Stego, step 6 = Eval. But step 5 actually rendered quiz.
- **Fix Status**: FIXED (Titles list expanded to 9 nodes: Init, Avalanche, Auth, Breach, AES-GCM, Stego, Forger, Authority, Eval)

## Bug #5 — MD5 file hashing corrupts binary data
- **Severity**: HIGH
- **File**: `js/crypto.js` line 60
- **Description**: `CE.hash()` converted file `ArrayBuffer` to string via `new TextDecoder().decode(data)` for MD5, corrupting binary bytes.
- **Fix Status**: FIXED (MD5 accepts ArrayBuffer and Uint8Array directly and hashes correctly)

## Bug #6 — File hash + salt concatenation produces garbage
- **Severity**: HIGH
- **File**: `js/app.js` line 198
- **Description**: `runLabHash()` did `data + salt` where `data` is an `ArrayBuffer`. String concatenation with ArrayBuffer produced `"[object ArrayBuffer]salt"`.
- **Fix Status**: FIXED (ByteArray concatenation implemented for files and salt bytes)

## Bug #7 — glitch-flash CSS class undefined
- **Severity**: HIGH
- **File**: `js/app.js` line 54, CSS files
- **Description**: `App.flash()` adds class `glitch-flash`, but no CSS defined it or keyframes.
- **Fix Status**: FIXED (Added in theme.css and ui.css)

## Bug #8 — dlg-hck CSS class doesn't exist
- **Severity**: HIGH
- **File**: `js/data.js` line 47, `css/ui.css` line 287
- **Description**: Mission 4 uses `dialogue: 'HCK'` which produces class `dlg-hck`. CSS only defined `.dlg-hack`.
- **Fix Status**: FIXED (Added dlg-hck alias in ui.css)

## Bug #9 — Stego story flow completely non-functional
- **Severity**: HIGH
- **File**: `js/app.js`
- **Description**: Story flow skipped stego and had no step 6 handler.
- **Fix Status**: FIXED (Re-numbered steps to 0-8, wired all steps sequentially)

## Bug #10 — File buffer persists after clearing text input
- **Severity**: HIGH
- **File**: `js/app.js` line 194
- **Description**: After hashing a file, `App.S.lab.fileBuffer` was prioritized even if text was entered.
- **Fix Status**: FIXED (Clear file button added, typing in text input clears file buffer automatically)

## Bug #11 — Markdown renders as literal text in HTML
- **Severity**: MEDIUM
- **File**: `index.html` line 433
- **Description**: Steganography tab description contained `**Least Significant Bit**` instead of HTML tags.
- **Fix Status**: FIXED (Replaced with <strong>Least Significant Bit</strong>)

## Bug #12 — Avalanche demo no guard for empty input
- **Severity**: MEDIUM
- **File**: `js/app.js` line 786
- **Description**: Empty string input in Avalanche demo calculated difference on empty string vs original.
- **Fix Status**: FIXED (Guard reverts to init state on empty/cleared input)

## Bug #13 — runCompare has no debounce
- **Severity**: MEDIUM
- **File**: `js/app.js` line 155
- **Description**: `runCompare()` called on every keystroke with no debounce.
- **Fix Status**: FIXED (150ms debounce implemented)

## Bug #14 — Copy button fails silently on HTTP
- **Severity**: MEDIUM
- **File**: `js/app.js` line 101
- **Description**: `navigator.clipboard.writeText()` requires secure context.
- **Fix Status**: WONTFIX (Acceptable for local development/testing; production must serve over HTTPS)

## Bug #15 — Unhandled Promise Rejections crash console on bad crypto keys (v4)
- **Severity**: HIGH
- **File**: `js/app.js` and `js/crypto.js`
- **Description**: Passing invalid key sizes (e.g., 128 instead of 256 for AES-GCM when typed loosely) or corrupted payloads directly threw `DOMException` which wasn't caught, flooding the console and leaving the UI hanging.
- **Fix Status**: FIXED (Implemented `window.addEventListener('unhandledrejection')` mapping exceptions to `#global-error-toast` in the UI).

## Bug #16 — Low Contrast text on dark backgrounds fails WCAG (v4)
- **Severity**: MEDIUM
- **File**: `css/ui.css`
- **Description**: `.to`, `.alias-desc`, `.back-btn` had opacities set between 0.25 and 0.8 producing text indistinguishable from the background (contrast < 4.5:1).
- **Fix Status**: FIXED (Boosted text opacity values across all minor UI text components and placeholders for full AA compliance).

## Bug #17 — Screen readers unable to interpret interactive components (v4)
- **Severity**: MEDIUM
- **File**: `index.html`
- **Description**: Axe audit (simulated) flagged critical missing semantic markers. The custom `div.lab-tab` elements acting as buttons had no ARIA structure.
- **Fix Status**: FIXED (Injected exhaustive `aria-label` tags into tabs, icon buttons, canvas displays, and interactive tool zones).

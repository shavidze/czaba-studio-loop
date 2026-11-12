# Studio Visual and UX Audit — 2026-11-10

**აუდიტორი:** product-designer agent
**კონტექსტი:** Saba-ს მოთხოვნა — "სტუდიოში ადამიანი რომ შემოვა უნდა ჰქონდეს განცდა რომ ამაზე თითოეულ დეტალზე ნაფიქრია"
**Store HEAD:** `ffae71c` (master, 2026-11-10)

---

## Overall Impression

The Studio is a remarkably complete and functional browser-based DAW. The Obsidian theme — warm dark tones with brass accents — establishes a distinct, premium identity that separates CZABA from the clinical blue/teal palettes of most audio tools. The typography choices (Instrument Sans for UI, IBM Plex Mono for timecodes) are strong and professional. Custom scrollbars and fully styled range sliders show genuine attention to craft. The status bar, keyboard shortcut system, and strings file demonstrate that microcopy has been treated as design — not an afterthought. The structural layout (library | timeline | detail panel) follows DAW conventions and reads clearly.

However, the overall feeling falls slightly short of the "every single detail has been thought through" standard Saba set, mainly due to a handful of unstyled browser-native controls that break the illusion, some spacing inconsistencies in the Detail Panel, and a few microcopy choices that lean technical rather than confident. These are fixable. The architecture and the intention are premium; the last 5% of polish will make it feel it.

---

## Findings

### STUDIO-VIS-1 | High | Number input spinbuttons (browser-default) break premium feel

- **Where:** `ArrangementDetailPanel.tsx` lines 407, 1063, 1079 — three `<input type="number">` elements (Clip Gain, Range From, Range To)
- **What is wrong:** These render browser-default spinbutton arrows (the up/down increment buttons in the right gutter). On Chrome/Edge they appear as small grey chevrons that clash with the obsidian palette. The user already flagged this.
- **What it should be:** Hide spinbuttons with `[appearance:textfield]` (Tailwind: `[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`). The fader slider and keyboard arrows already provide increment/decrement, so the spinbuttons add no functionality.
- **Principle:** Norman's signifiers — the spinbuttons are a false affordance that leads to a non-premium control appearing in a premium context.

### STUDIO-VIS-2 | High | Native radio buttons in Export Dialog

- **Where:** `ArrangementExportDialog.tsx` lines 303, 336, 359, 377, 409, 437 — six `<input type="radio">` elements with only `className="accent-brand"`
- **What is wrong:** `accent-brand` tints the browser's default radio circle, but the shape, size and animation are still the OS default. On Windows/Chrome, these appear as small circles with a blue tint that do not match the obsidian/brass aesthetic. The contrast between the carefully styled card-like labels and the generic radio dots is jarring.
- **What it should be:** Either (a) visually hide the radio input (`sr-only`) and style the parent label card as the selection indicator (the border-brand/bg-brand/10 pattern is already there — the radio dot becomes redundant), or (b) use custom CSS to style the radio as a brass-coloured dot. Option (a) is simpler and cleaner since the card highlight already communicates selection.
- **Principle:** Aesthetic-usability (Nielsen) — the dialog's careful layout raises expectations; the default radios undercut them.

### STUDIO-VIS-3 | Medium | Native `<select>` elements for Grid Division and Waveform Zoom

- **Where:** `StudioWorkspace.tsx` around lines 3386-3453 (grid division select) and 3475-3499 (waveform zoom select)
- **What is wrong:** These render as native OS dropdowns. On macOS they are tolerable but on Windows they produce a white dropdown popup that is completely out of the dark theme. The waveform zoom select also uses `appearance-none` (line 3487), which hides the native dropdown arrow — but this means there is no visual indicator it is a dropdown at all, violating Norman's signifier principle.
- **What it should be:** Replace with a custom popover menu (the ArrangementGridMenu pattern already exists for right-click). At minimum, on the waveform zoom, add a dropdown chevron icon so the user knows it opens. These are expert-level controls, so a custom solution can be deferred, but flagged.
- **Principle:** Jakob's law — DAW users expect custom menus; native dropdowns signal "web app, not professional tool."

### STUDIO-VIS-4 | Medium | Detail Panel "source offset" label is dev jargon

- **Where:** `strings.ts` line 814: `sourceOffsetLabel: 'Source offset'`; also in `studioTimeTextParts.selectedClipDetail` at line 623: `' . source offset '`
- **What is wrong:** "Source offset" is an internal concept a film editor will not understand. It means "how far into the original file this clip starts," but the term "source offset" is audio-engineering jargon.
- **What it should be:** "Clip origin" or "Original start" or simply "Offset" with a tooltip explanation. Ableton uses "Start" (within the clip view), but since CZABA already uses "Start" for the clip's position on the timeline, "Clip origin" avoids ambiguity while being plain English.
- **Principle:** Copy is design — the user's words, not internal jargon.

### STUDIO-VIS-5 | Medium | Detail Panel spacing is cramped compared to rest of Studio

- **Where:** `ArrangementDetailPanel.tsx` line 994: `gap-3 overflow-y-auto px-3 py-2`; the content area uses very tight spacing with `gap-0.5` (4px) between text lines and `gap-1` (4px) between control groups.
- **What is wrong:** The Detail Panel packs four columns (clip info, waveform, range inputs, clip gain) into a horizontal layout with `gap-3` (12px). The clip info column is fixed at `w-72` (288px), the range column at `w-44` (176px), and clip gain at `w-52` (208px). On a 1440px viewport with library open, this is tight. The leading within each column (`leading-4` / `gap-0.5`) makes it feel dense compared to the header bar's comfortable `gap-2` and the transport's `gap-1.5`.
- **What it should be:** Increase vertical leading within columns from `gap-0.5` to `gap-1`. The inner text pairs (label + value) should breathe more. The panel's horizontal padding could go from `px-3` to `px-4` without losing content.
- **Principle:** Whitespace function (DESIGN_SYSTEM.md) — Luxury feel requires more whitespace around important elements.

### STUDIO-VIS-6 | Medium | "From, s" and "To, s" labels in Detail Panel are cryptic

- **Where:** `strings.ts` lines 815-816: `rangeFromLabel: 'From, s'` and `rangeToLabel: 'To, s'`
- **What is wrong:** The ", s" suffix means "seconds" but reads as punctuation noise. A film editor seeing "From, s" and "To, s" will not immediately parse that as "From (seconds)" and "To (seconds)".
- **What it should be:** "From" and "To" — the unit is implicit because the field accepts seconds and the placeholder/context makes it clear. Or "Start, s" and "End, s" if the unit marker is kept for precision. Either way, the comma before "s" is unconventional; if kept, use parentheses: "From (s)".
- **Principle:** Copy is design — button/label names should be immediate, not puzzles.

### STUDIO-VIS-7 | Low | Export Dialog button labels could be more action-oriented

- **Where:** `strings.ts` lines 10-12: `formatButtonWav: 'Export WAV'`, etc.; `ArrangementExportDialog.tsx` line 625: `border-brand bg-foreground/5 text-brand`
- **What is wrong:** The export button uses a ghost/outline style. For a revenue-adjacent action (the user is getting value from their purchase here), it should have more visual weight.
- **What it should be:** The export button should be a filled button (`bg-brand text-brand-foreground`), not an outline. Cancel keeps its secondary styling.
- **Principle:** Button variant selection guide (DESIGN_SYSTEM.md) — the primary action should be visually dominant.

### STUDIO-VIS-8 | Low | Insert marker blink animation timing

- **Where:** `app.css` line 177: `--animate-insert-marker-blink: insert-marker-blink 1.2s step-end infinite;`; keyframes at lines 181-184: opacity 1 -> 0.25 -> 1
- **What is wrong:** The `step-end` timing with a hard cut to 0.25 opacity feels mechanical, like a terminal cursor. The 1.2s cycle is slightly slow.
- **What it should be:** Use a softer ease: perhaps `ease-in-out` with opacity 1 -> 0.3 -> 1, or keep step-end but at 1.0s for a snappier feel that matches Ableton's cursor blink rate (~1s).
- **Principle:** Motion hierarchy (DESIGN_SYSTEM.md) — background/ambient animation should be subtle and rhythmically comfortable.

### STUDIO-VIS-9 | Low | The header badge text is generic

- **Where:** `StudioWorkspace.tsx` line 3269: `workspaceCollectionCopy(collection.origin).badge`
- **What is wrong:** For purchased collections, the badge should signal ownership/value (e.g., a brass-accented "Purchased" or "Licensed" badge).
- **What it should be:** For demo: keep subtle. For purchased: add `border-brand/30 text-brand` to reinforce the premium relationship.
- **Principle:** Calm technology — communicate state with form and colour, not a sentence.

### STUDIO-VIS-10 | Low | The "CZABA" back link in header is understated

- **Where:** `StudioWorkspace.tsx` lines 3256-3263: `Link to="/"` with `text-sm font-medium text-muted hover:text-foreground`
- **What is wrong:** The brand name "CZABA" is `text-muted` — it blends into the chrome. The user should feel they are in a "valuable place." The brand mark is part of that signal.
- **What it should be:** `text-foreground` for the brand name while keeping the arrow icon muted. Or use `text-brand` subtly.
- **Principle:** Brand-vision.md — the brand must be present and confident, not hidden.

---

## Top 5 Highest-Impact Changes for Premium Feel

1. **Hide number input spinbuttons** (STUDIO-VIS-1) — The single most visible browser-default leak. Three lines of Tailwind on three inputs. Immediate impact, zero risk.

2. **Replace native radio buttons in Export Dialog** (STUDIO-VIS-2) — The Export Dialog is a high-attention moment (the user is getting their deliverable). Visually hiding the radio inputs and relying on the already-styled card highlight removes the last OS-default visual in this flow.

3. **Make the Export primary button filled** (STUDIO-VIS-7) — Change the export action button from outline (`border-brand text-brand`) to filled (`bg-brand text-brand-foreground`). One class change; signals confidence and completion.

4. **Rename "Source offset" to "Clip origin"** (STUDIO-VIS-4) — Microcopy fix that costs nothing and immediately makes the Detail Panel feel like it was designed for a film editor, not adapted from an audio-engineering tool.

5. **Fix "From, s" / "To, s" labels** (STUDIO-VIS-6) — Small copy change that reduces cognitive load in the Detail Panel. Change to "From (s)" and "To (s)" or just "From" and "To".

---

## Browser-Default Elements Audit — Complete List

| Element | File | Line(s) | Issue | Severity |
|---|---|---|---|---|
| `<input type="number">` — Clip Gain | ArrangementDetailPanel.tsx | 407 | Spinbutton arrows visible | High |
| `<input type="number">` — Range From | ArrangementDetailPanel.tsx | 1063 | Spinbutton arrows visible | High |
| `<input type="number">` — Range To | ArrangementDetailPanel.tsx | 1079 | Spinbutton arrows visible | High |
| `<input type="radio">` — WAV format | ArrangementExportDialog.tsx | 303 | Native radio dot, only accent-brand tint | High |
| `<input type="radio">` — MP3 format | ArrangementExportDialog.tsx | 336 | Native radio dot, only accent-brand tint | High |
| `<input type="radio">` — Both format | ArrangementExportDialog.tsx | 359 | Native radio dot, only accent-brand tint | High |
| `<input type="radio">` — Video (disabled) | ArrangementExportDialog.tsx | 377 | Native radio dot, no custom style | High |
| `<input type="radio">` — Scope: Project | ArrangementExportDialog.tsx | 409 | Native radio dot, only accent-brand tint | High |
| `<input type="radio">` — Scope: Range | ArrangementExportDialog.tsx | 437 | Native radio dot, only accent-brand tint | High |
| `<select>` — Grid Division | StudioWorkspace.tsx | ~3386 | Native OS dropdown popup (white on Windows) | Medium |
| `<select>` — Waveform Zoom | StudioWorkspace.tsx | ~3475 | Native OS dropdown + no visible indicator | Medium |
| `<input type="range">` — Zoom slider | ArrangementTransport.tsx | 511 | Fully styled (STUDIO_NEUTRAL_SLIDER_CLASS) — OK | OK |
| `<input type="range">` — Clip Gain fader | ArrangementDetailPanel.tsx | 443 | Fully styled (STUDIO_LEVEL_FADER_CLASS) — OK | OK |
| `<input type="range">` — Mix faders | ArrangementMixFader.tsx | 62 | Fully styled — OK | OK |
| `<input type="file">` — Video import | ArrangementLane.tsx | 1054 | Visually hidden (triggered by button) — OK | OK |
| Scrollbars — all scrollable areas | studio-scrollbar.ts | 1-17 | Fully custom styled (WebKit + gutter) — OK | OK |

**Elements that need fixing: 11** (3 number inputs, 6 radio buttons, 2 select dropdowns)
**Elements already properly styled: 5** (3 range sliders, 1 file input, scrollbars)

---

## What Must NOT Change

The **status bar at the bottom of the Studio** (`StudioWorkspace.tsx` lines 3656-3691) is excellently designed. It serves as an always-visible feedback channel using the calm-technology principle: every action the user takes gets a clear, well-written status message without requiring a modal or toast. The status messages in `strings.ts` are the best microcopy in the entire product. The keyboard shortcut badge (`?`) in the footer is the right touch — discoverable but not intrusive. This system should not change; it should be the model for the rest of the product.

---

## Open Questions (answered with recommended defaults)

1. **"Source offset" label** → **"Clip origin"** (recommended default)
2. **Native `<select>` elements** → **defer** to separate task (recommended default)
3. **Export button style** → **filled brass** `bg-brand text-brand-foreground` (recommended default)
4. **"CZABA" brand link color** → **text-foreground** for text, arrow stays muted (recommended default)

---

## Key Files Referenced

- `app/components/arrangement/ArrangementDetailPanel.tsx` — Detail Panel with number inputs
- `app/components/arrangement/ArrangementExportDialog.tsx` — Export dialog with radio buttons
- `app/components/arrangement/StudioWorkspace.tsx` — Main workspace with select elements and header
- `app/components/arrangement/studio-fader.ts` — Fully styled range slider classes
- `app/components/arrangement/studio-scrollbar.ts` — Fully styled scrollbar classes
- `app/lib/arrangement/strings.ts` — All user-facing microcopy
- `app/styles/app.css` — Design tokens and Studio obsidian theme
- `docs/design/brand-vision.md` — Brand philosophy
- `docs/design/DESIGN_SYSTEM.md` — Design system specification

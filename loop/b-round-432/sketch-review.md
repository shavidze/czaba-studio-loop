# Round 433 sketch review (B, 2026-11-10)

Dispatched sketch: `sketch-433.patch.txt` sha256 `82d7d76c346748cf96fd70f626b530a63b1e53d97be30d60093e25dd52f81c6d` (v2, 4 files). v1 (`sketch-v1/`, 215b374b…) was reviewed by tech-lead; v2 applies TL-R433-01…04.

## product-designer (consult, 2026-11-10)
1. Two lucide X glyphs (header Close h-4, field Clear size-3.5, ~70 px apart): acceptable; same icon as Live and our Library. Rejected: CircleX (new visual for the same concept), a different colour (no token reason).
2. Sizes: Library pattern one step up — input `pl-3 pr-9` + `[&::-webkit-search-cancel-button]:hidden`; button `absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-sm text-muted hover:text-foreground`; icon X size-3.5 strokeWidth 2; aria-label and title "Clear search". Rejected: exact Library copy (h-6/size-3 too small in a 38 px field).
3. Tab order: yes (Close → search → Clear → Close).
4. States: hover muted→foreground; focus-visible = existing global ring (no new token); no disabled state (not rendered when empty); `pr-9` keeps a long query clear of the button; shown whenever `query !== ''` (spaces included).

## tech-lead (sketch v1): approve-with-lows
- TL-R433-01 Low (scanner ignores quotes; misses `type={'search'}` / `type='search'`): **applied** — quote-aware whole-tag scan, `SEARCH_TYPE` regex, SF1 cases for a quoted `>`, `{'}'}` and both spellings; mutant M8 red.
- TL-R433-02 Low (SC2 did not catch Library's `hadFocus` guard): **applied** — SC2 second click with focus on body; mutant M7 red.
- TL-R433-03 info: **applied** — SC3 asserts the dialog focusables order [Close, search, Clear].
- TL-R433-04 info: **applied** — the held-Enter loop on search (passes on HEAD) dropped from SC4.
- TL-R433-05 info: **applied** — `cancelPseudo` removed from the probe (Chromium returns the input's own style); the evidence is the blue-pixel count.
- TL-R433-06 info: shared search constant **deferred** to ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS; `app/components/recordings/SfxSoundLibrary.tsx` search input stays under SABA-B-12-RECORDINGS-NUMBER (STORE-REDESIGN acceptance).
Focus ordering: tech-lead confirms `focus()` runs in the click handler before React unmounts the button; focus never drops to body.

## B's runs on v2
- mutants/summary.txt: M1–M8 red (8/8), sketch green 23/23. v1 runs in mutants/v1/.
- precheck-covering.log: 10 files 196/196; precheck-typecheck.log rc 0; precheck-lint.log rc 0 (205 warnings, 1 info = HEAD). v1 logs in precheck-v1/.
- probe/compare.txt (sketch :5174, own cacheDir) ALL OK (2 cells); probe/compare-head.txt (HEAD :5173) NOT ALL OK (no clear button, 8 blue native-cancel pixels per cell). v1 probe runs in probe/v1/.

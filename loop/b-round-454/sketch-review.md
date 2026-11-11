# Sketch review — round 455 (SABA-B-14, Store seek thumb)

- **Dispatched patch:** `b-round-454/sketch-455.patch.txt`
- **Dispatched sha256:** `c3feb71895df31ec00d1d17cc6483129d04d00d12f789ca30d40173bc25a28c3`
- **Reviewed sha256 (final delta review):** `c3feb71895df31ec00d1d17cc6483129d04d00d12f789ca30d40173bc25a28c3`. It equals the dispatched sha.
- **Per-file hashes after apply:** `b-round-454/sketch-files-sha256.txt`. AudioPlayer.tsx is `75643ac0…`; audio-preview-player.test.tsx is `747f9196…`.
- **Base:** store `2e26962` (gate 454 published).
- **Scratch:** `/tmp/b455-sketch`, made from a git archive of HEAD, a `node_modules` symlink and the patch.

## Review 1 — `tech-lead`, sha `30cdb7ba09d320f44c2bbca390f493369a1d7218388cd785251e9066295fbbc1`
**Verdict: APPROVE.** No blocking change.

**What was checked:**
- duration 0, NaN and Infinity;
- the disabled input and held arrows;
- ArrowRight at the end, which fires `ended` and skips to the next track, the same as HEAD;
- drag precision;
- `toFixed(5)`, which is off by less than 0.005 px;
- the hover scale, which does not move the thumb centre;
- the exported helper (the barrel does not re-export it);
- the keyboard handler versus `step="0.01"`;
- `aria-valuetext`.

Firefox was reasoned about but not measured. It is tracked as TLM-R455-FIREFOX-SEEK-THUMB.

**Optional suggestions:**
1. A drag-precision test. **Adopted** as ST3c, with mutant M12.
2. A valuetext case for a non-finite duration. **Not adopted.** Previews are finite; the task has a ruling line for this.
3. A Shift+Arrow test. **Adopted** as ST3b, with mutant M13.

## Change after review 1: B's browser pre-check found a regression
On the reviewed sketch, Alt, Ctrl and Meta+Arrow fell through to Chromium's native 1 % step (+1.5 s on a 150 s preview). HEAD moves those keys +1 s.

**Evidence:**
- `probe/extra-5173-*.txt`: HEAD, every modified ArrowRight goes 10.4 → 11.
- `probe/altleft-5173.txt`: HEAD, Alt+ArrowLeft seeks to 9 and does not navigate back, even with a history entry.

**Fix:** the guard `|| event.altKey || event.ctrlKey || event.metaKey` was removed, so every arrow seeks ±1 s. ST5 was rewritten to cover this, and mutant M6 is now `modifiers-native`.

## Review 2 (delta) — `tech-lead`, sha `c3feb71895df31ec00d1d17cc6483129d04d00d12f789ca30d40173bc25a28c3`
**Verdict: APPROVE.**

**Points confirmed:**
- Modified arrows now behave as at HEAD, and Alt+Left stays on the page in both trees.
- No shortcut is swallowed that HEAD did not already swallow. macOS Cmd+Left/Right and Cmd+[ still work once focus leaves the range.
- OS and screen-reader keys never reach the page.

**Optional nits, all ruled as not adopted.** Adopting them would change the sha and need another review for coverage that already exists.
1. **Add Alt+ArrowLeft to ST5.** The left direction is covered by ST3 (ArrowLeft/ArrowDown → 9.4). The Alt+Left behaviour is covered by the browser row C5 (`altleft-probe.mjs`).
2. **Add `toHaveBeenCalledTimes(1)` in ST3b.** ST3b clears the mock first in its own test, and reads `calls[0]`. A duplicate call would still pass, but a duplicate seek to the same value is harmless and is covered by ST3's count asserts on the same handler.
3. **Is ST3c sensitive to `step`?** M1 (no `step="any"`) turns only ST1 red, so ST3c does not depend on the step in jsdom. ST3c targets rounding in `onChange` (M12), and ST1 guards the step.

## B pre-check on the dispatched sketch

| Check | Result | File |
|---|---|---|
| Browser seek: HEAD `:5173` vs sketch `:5181`; 10 paused samples + 12 playing samples; 1440×900 and 1280×720 | HEAD max \|thumb − fill\| is 7 px, and the value snaps to whole seconds. Sketch is 0 px at every sample, with fractional values and step `any` | `probe/seek-{5173,5181}-{1440,1280}.txt` |
| Volume fill (0.05/0.35/0.7/0.95), hover, drag 20 → 60 %, modified arrows | HEAD: volume lead 5 px; hover lead 3 px; drag lead −1 px; modified arrows +1 s. Sketch: 0 / 0 / 0 px; drag ct = value; modified arrows +1.0 s; mute toggles 0 ↔ 0.7 in both | `probe/extra-{5173,5181}-{1440,1280}.txt` |
| Alt+ArrowLeft with history | HEAD: ct 9, stays on the page. Sketch: ct 9.4, stays on the page | `probe/altleft-{5173,5181}.txt` |
| Keyboard sweep | HEAD vs sketch as described in the task | `probe/key-head.txt`, `probe/key-sketch.txt` |
| Targeted tests / covering | 24/24; covering 6 files / 73 tests, rc 0 | `precheck-covering.log` |
| Mutants | BASE green; M1–M13 red, each with its own log | `mutants/mutants.txt`, `mutants/mutant-*.log` |
| Full vitest on the dispatched sketch | 284 files / 4148 tests, rc 0 | `precheck-full-raw.log` |
| Build | rc 0. This run was on the first sketch, `30cdb7ba`; the delta is TS logic and tests only, so no CSS or asset changed | `precheck-build.log` |
| typecheck / Biome on the 2 files | tsc rc 0. Biome: 5 pre-existing `useButtonType` warnings, the same as HEAD | inline |

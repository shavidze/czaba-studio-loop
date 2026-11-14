# Sketch review, round 508 delta (B planning 507 -> 508, 2026-11-14)

Reviewer: tech-lead subagent (read-only), given the component, the final test file on /home/runner/b507-scratch and mutants-508.py; asked which AudioPlayer.tsx single edit survives N1-1..N1-6.

## Findings on delta v1 (9fb27de4) and B's action
| # | Finding (reviewer severity) | Action in delta v2 (405384eb) |
|---|---|---|
| R1 | Extra classes survive: N1-3 checks presence only, N1-4 bans 7 tokens (e.g. `hover:text-destructive` on Close, `opacity-70` on Previous) (Medium) | New N1-7: each control's sorted class set equals a rendered ghost IconButton reference of its size plus only Close's 4 position classes. Mutants M11, M14 red on N1-7 |
| R2 | Icon height unchecked except the volume icon (Medium) | N1-4 asserts height too. Mutant M12 red on N1-4 |
| R3 | Layout position (Close moved into the volume div; Previous/Next swapped as whole blocks) survives jsdom (Medium) | Pre-ruled #11: position and order are browser facts, covered by C1 (boxes ±1 px vs oracle, per control) and C5 (layout); not a jsdom row |
| R4 | Mute/Unmute threshold `volume < 0.3` survives (Low) | N1-6 uses 0.01 (still labelled Mute). Mutant M13 red on N1-6 |
| R5 | `disabled={isLoading}` on Next survives (Low) | Pre-ruled #12 (no such code; would need an isLoading fixture row; record only) |
| R6 | Icon path swap survives; side finding: low- and high-volume icons are identical, so the `volume < 0.5` branch draws nothing different (Low) | Pre-ruled #13; side finding -> deferred Low B-R508-VOLUME-ICON-LOW-SAME (pre-existing product quirk, not this round) |
| R7 | N1-6 sits before N1-5; long titles over 100 chars (Low) | Accepted (Biome clean; titles pre-existing style) |

Re-check on v2: mutants M0-M14 OK (mutants-508.txt), covering 8/88, full 304/4386, build rc0, tsc/lint/Biome as before.

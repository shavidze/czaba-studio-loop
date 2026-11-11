# product-designer consult — RETRO 450 screen and journey review (B round 449 -> 450, 2026-11-11)

Input: captures `b-round-449/screens/` (master a8599a2), previous `user-review/screen-review-435.md`. Read-only; no edits. Returned report (kept in full substance):

## (a) Journey 436-449: slightly better, nothing worse
- Persistent line counts unchanged (138/168/118/144; outside 97/124/86/101; `capture.log`), equal to RETRO 420 and 435: the rounds changed look and copy, not amount.
- Product page (`journey450-1-product-*`): no LeadMagnet popup over the buy column (446); "Middle East" title light ink (449); no teal. At 1280x720 price, Buy Now and both version cards fit the first screen.
- Arrival (`journey450-1b-*`): unchanged and right — Middle East selected and focused, Music active. "← CZABA" now foreground (437); the "CZABA / CZABA Studio" doubling is more visible, already SR-305-10.
- Play (`journey450-2-*-1440x900`): "Clip origin 00:00.000" (Clip details) and "clip origin 00:00.000" (footer) now one term (436) — settles SR-435-2's concern. From/To still bare "48"/"64" next to "Start 00:48.000" = SR-435-1 (Saba Q4 open).
- Export (`journey450-3-*`): dialog "Export WAV" filled brass, "Done" quiet — one clear primary (437). Toolbar "Export" stays outlined (opens the dialog): correct.

## (b) New findings
| id | Sev | PNG | What | Quieter fix |
|---|---|---|---|---|
| SR-450-1 | Low | journey450-1b-studio-arrival-1280x720, journey450-2-studio-playing-1440x900 | Clip details toggle: right chevron "Expand ›" vs down chevron "Collapse ⌄"; the panel opens upward, so neither arrow maps the motion | one rotating chevron: up = Expand, down = Collapse; same label and position |
| SR-450-2 | Low | screen450-full-DEMO-1440x900, journey450-2-*-1440x900 | Clip Gain value shown twice in two formats: field "0.0" and slider read-out "0 dB" | keep the editable field (has the dB label); drop the read-out or show it only while dragging |
| SR-450-3 | Low | journey450-1-product-1440x900, -1280x720 | header "Sign In" filled brass, same weight as "Buy Now"; two primaries on the purchase page | existing secondary/outline Button variant for header Sign In; no new token, no position change; confirm with design-auditor |
| SR-450-4 | Low | journey450-1-product-* | unselected Premium card dims name and "$99" to grey, reads disabled/sold out, yet it is the stems version ("6 audio files") | keep name and price full ink; selection only by border and radio |
| SR-450-5 | Low | journey450-1-product-* | one price, two formats: "TOTAL PRICE $29.00 USD" vs card "$29" | one format ("$29" both, or "$29 USD"); copy only (STORE copy scope) |

Not new (already recorded): ruler "0:00" under the marker SR-290-4; empty Clip details fields SR-305-6; "Undo: Ad…" SR-245-7; export copy ("LAME (mediabunny)", "Done", "same graph") COPY-PD F11; repeated export range SR-353-4; "Time selection" cut at 1280 SR-290-1; demo badge + library note SR-230-5; Clip details pointing at the off-screen Melody clip = STEM-LANES.

**Must not change:** the export dialog's single filled primary with a quiet secondary.

## (c) Saba
No new decision needed: SR-450-1..5 are copy and variant fixes with no position or keep-list change. SR-435-1 remains his open Q4. SR-450-3 changes the look of the global Store header — mention it to him in one line.

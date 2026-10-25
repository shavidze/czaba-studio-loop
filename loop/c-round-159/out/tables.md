
### SURFACE-STYLE 1440 (hover MQ true, reduced-motion MQ in rm context true)

| Sub-row | Checks pass/total | vs r158 |
|---|---|---|
| a | 45/45 | raw values identical |
| e | 8/8 | raw values identical |
| f | 3/3 | raw values identical |
| b | 13/13 | raw values identical |
| d | 7/7 | raw values identical |
| c | 12/12 | raw values identical |
| cue | 3/3 | raw values identical |
| g | 4/4 | raw values identical |
| h | 24/24 | r158 FAIL → now PASS |
| h-rm | 12/12 | r158 FAIL → now PASS |
| i | 3/3 | raw values identical |

(h)/(h-rm) per button, 1440:

| # | Button | transition-property | duration | timing | reduced-motion property / duration |
|---|---|---|---|---|---|
| 0 | Play | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 1 | Back to start | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 2 | ↶Undo | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 3 | ↷Redo | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 4 | ✂ Split | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 5 | ⌫ Delete — the selected clip; leaves a gap | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 6 | ↻ Loop | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 7 | Follow | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 8 | Zoom to selection (Z) | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 9 | ↩ Zoom | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 10 | Fit | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 11 | Export | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |

(i) focus ring, 1440 (about 40 ms after Tab, then +300 ms):

| Button | :focus-visible | immediate 2px brand ring | +300 ms ring |
|---|---|---|---|
| Play | true | true | true |
| Fit | true | true | true |
| Export | true | true | true |

CASCADE-SCOPE 1440:

| Control | tag/role | matches global selector | transition-property | duration | timing |
|---|---|---|---|---|---|
| Collapse library | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |
| Mute — Original video sound | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |
| Done | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |

FUNC-SMOKE-T 1440: Play click moved the playhead 0 → 3.34 s, output peak 0.3054, label while playing Pause, after the Pause click Play. Space: Pause (moving true) → Play. Export → Done: closed true, focus → Export. Escape: closed true, focus → Export.
Net 1440: errors 0, hydration 0, forbidden 0, Authorization 0, fonts 200, allowed noise 2.

### SURFACE-STYLE 1280 (hover MQ true, reduced-motion MQ in rm context true)

| Sub-row | Checks pass/total | vs r158 |
|---|---|---|
| a | 45/45 | raw values identical |
| e | 8/8 | raw values identical |
| f | 3/3 | raw values identical |
| b | 13/13 | raw values identical |
| d | 7/7 | raw values identical |
| c | 12/12 | raw values identical |
| cue | 3/3 | raw values identical |
| g | 4/4 | raw values identical |
| h | 24/24 | r158 FAIL → now PASS |
| h-rm | 12/12 | r158 FAIL → now PASS |
| i | 3/3 | raw values identical |

(h)/(h-rm) per button, 1280:

| # | Button | transition-property | duration | timing | reduced-motion property / duration |
|---|---|---|---|---|---|
| 0 | Play | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 1 | Back to start | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 2 | ↶Undo | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 3 | ↷Redo | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 4 | ✂ Split | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 5 | ⌫ Delete — the selected clip; leaves a gap | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 6 | ↻ Loop | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 7 | Follow | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 8 | Zoom to selection (Z) | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 9 | ↩ Zoom | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 10 | Fit | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |
| 11 | Export | background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1) | none / 0.15s… |

(i) focus ring, 1280 (about 40 ms after Tab, then +300 ms):

| Button | :focus-visible | immediate 2px brand ring | +300 ms ring |
|---|---|---|---|
| Play | true | true | true |
| Fit | true | true | true |
| Export | true | true | true |

CASCADE-SCOPE 1280:

| Control | tag/role | matches global selector | transition-property | duration | timing |
|---|---|---|---|---|---|
| Collapse library | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |
| Mute — Original video sound | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |
| Done | BUTTON/null | true | color, background-color, border-color, box-shadow, transform, opacity | 0.15s, 0.15s, 0.15s, 0.25s, 0.15s, 0.15s | ease-out, ease-out, ease-out, ease-out, ease-out, ease-out |

FUNC-SMOKE-T 1280: Play click moved the playhead 0 → 3.311 s, output peak 0.3054, label while playing Pause, after the Pause click Play. Space: Pause (moving true) → Play. Export → Done: closed true, focus → Export. Escape: closed true, focus → Export.
Net 1280: errors 0, hydration 0, forbidden 0, Authorization 0, fonts 200, allowed noise 2.

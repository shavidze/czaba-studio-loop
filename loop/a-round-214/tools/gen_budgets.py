import json, sys
rows = []
def row(id, scenario, metric, unit, kind, mode, budget, note):
    rows.append({"id": id, "scenario": scenario, "metric": metric, "unit": unit, "kind": kind, "mode": mode,
                 "budget": budget, "owner": "PERF-1b-i", "note": note})
eq1 = {"op": "==", "value": 1}
def rated(base, rate):
    return base if rate == 1 else f"{base}.{rate}x"
row("interact.load.ready-ms", "load until ready", "ready-ms", "ms", "wallclock", "record", None,
    "1x only. Navigation start to ready (library Add enabled and the preview waveform drawn), as load.ready-ms in PERF-1a. Trend only (±30 %).")
row("interact.harness.hook-live", "load + library Add click", "hook-live", "count", "deterministic", "assert", {"op": ">=", "value": 1},
    "1x only. React commits seen by the devtools-hook stub from the Add click until the added clip's waveform is drawn and the page is quiet; a disabled hook must fail, not report 0.")
row("interact.harness.audio-running", "Space -> playing", "audio-running", "boolean (1 = true)", "deterministic", "assert", eq1,
    "1x only. Home (seek to 0) first. 1 only when the Play button aria-label is Pause, a tracked (non-offline) AudioContext reports state running, and at least 1 start() was recorded from the Space press until the page is quiet (at least 1 s); GATE206-S6 rule.")
for rate in (1, 6):
    sfx = "" if rate == 1 else f" ({rate}x CPU throttle)"
    row(rated("interact.harness.click-live", rate), "clip click" + sfx, "click-live", "boolean (1 = true)", "deterministic", "assert", eq1,
        "The Clip Gain fader is enabled after Add (the added clip is selected); an empty Stems lane click deselects: the fader is disabled. After the click on the clip header the fader is enabled and there is exactly 1 of it. The fader is always rendered, so enabled state is the selection signal.")
    row(rated("interact.click.commits", rate), "clip click" + sfx, "commits", "count", "deterministic", "record", None,
        "React commits from the click until quiet (min 600 ms, then 200 ms without a commit or start(), cap 3 s).")
    row(rated("interact.click.components", rate), "clip click" + sfx, "components", "components", "deterministic", "record", None,
        "Sum of rendered components over the click window; detail lists the per-commit sizes.")
    row(rated("interact.click.event-duration-max", rate), "clip click" + sfx, "event-duration-max", "ms", "wallclock", "record", None,
        "Longest Event Timing entry (>= 16 ms) in the click window; when the observer gives none, the longest long-animation-frame in the window; 0 when neither exists. detail.source names which. Trend only.")
    for n, live in (("1", "interact.harness.zoom-live"),):
        pass
    row(rated("interact.harness.zoom-live", rate), "zoom, 1 clip" + sfx, "zoom-live", "boolean (1 = true)", "deterministic", "assert", eq1,
        "The Zoom (px/s) slider value rises on each of the 5 '=' keys, falls on each of the 5 '-' keys, and ends at its start value.")
    for metric, unit, kind, note in (
        ("commits-per-key", "commits / key", "deterministic", "Commits over the 10 key windows (5 '=' then 5 '-'; each window from the key press until quiet, min 300 ms) / 10."),
        ("components-per-key", "components / key", "deterministic", "Sum of rendered components over the 10 key windows / 10."),
        ("components-max", "components", "deterministic", "Largest single commit in any key window."),
        ("key-window-longest-ms", "ms", "wallclock", "Longest time from a key press (measured in the page before the press) to the last commit of its window; detail.longestLoafMs is the longest long-animation-frame. Trend only."),
    ):
        row(rated(f"interact.zoom.1.{metric}", rate), "zoom, 1 clip" + sfx, metric, unit, kind, "record", None, note)
    for drag, what, signal in (
        ("range", "range body drag (time selection)", "the clip's range label end time exists at mid-drag and at the end and grows (DEVIATION: the task named [data-range-end], which renders only for an all-tracks range; see doc 168)"),
        ("fade", "fade-in handle drag", "data-fade-in grows from the start to mid-drag and from mid-drag to the end"),
        ("trim", "trim start (left edge) drag", "data-clip-start changes from the start to mid-drag and from mid-drag to the end"),
        ("move", "clip header move drag", "data-clip-start changes from the start to mid-drag and from mid-drag to the end"),
    ):
        row(rated(f"interact.harness.drag-{drag}-live", rate), what + sfx, f"drag-{drag}-live", "boolean (1 = true)", "deterministic", "assert", eq1,
            f"1 only when both the stopped and the playing drag were live: {signal}.")
        for state in ("stopped", "playing"):
            scen = f"{what}, {state}{sfx}"
            base = f"interact.drag.{drag}.{state}"
            row(rated(f"{base}.commits-per-move", rate), scen, "commits-per-move", "commits / move", "deterministic", "record", None,
                "Commits in the move window (after the first pointermove that follows the in-page pointerdown, before the in-page pointerup) / pointermoves in that window.")
            row(rated(f"{base}.move-components-per-move", rate), scen, "move-components-per-move", "components / move", "deterministic", "record", None,
                "Sum of rendered components in the move window / pointermoves in that window (per-move sum; per-commit sizes are bimodal).")
            row(rated(f"{base}.move-components-max", rate), scen, "move-components-max", "components", "deterministic", "record", None,
                "Largest single commit in the move window.")
            row(rated(f"{base}.release-commits", rate), scen, "release-commits", "count", "deterministic", "record", None,
                "Commits from the in-page pointerup until quiet (min 600 ms).")
            row(rated(f"{base}.move-to-paint-p95", rate), scen, "move-to-paint-p95", "ms", "wallclock", "record", None,
                "p95 of the pointermove-to-next-frame sampler up to pointerup, as in PERF-1a. Trend only (±30 %).")
            if state == "playing":
                row(rated(f"{base}.move-restarts", rate), scen, "move-restarts", "start() calls", "deterministic", "record", None,
                    "start() calls on a non-offline context inside the move window.")
                row(rated(f"{base}.release-restarts", rate), scen, "release-restarts", "start() calls", "deterministic", "record", None,
                    "start() calls from the in-page pointerup until quiet; detail groups them by task.")
    row(rated("interact.play.start-commits", rate), "Space -> playing" + sfx, "start-commits", "count", "deterministic", "record", None,
        "Commits from the Space press until quiet (min 1 s).")
    row(rated("interact.play.start-components", rate), "Space -> playing" + sfx, "start-components", "components", "deterministic", "record", None,
        "Sum of rendered components in the same window.")
    row(rated("interact.play.start-sources", rate), "Space -> playing" + sfx, "start-sources", "start() calls", "deterministic", "record", None,
        "start() calls in the same window.")
    row(rated("interact.play.stop-commits", rate), "Space -> stopped" + sfx, "stop-commits", "count", "deterministic", "record", None,
        "Commits from the Space press until quiet (min 1 s).")
    row(rated("interact.play.stop-components", rate), "Space -> stopped" + sfx, "stop-components", "components", "deterministic", "record", None,
        "Sum of rendered components in the same window.")
row("interact.harness.clips-30", "Ctrl+D x 29", "clips", "count", "deterministic", "assert", {"op": "==", "value": 30},
    "1x only. Audio clips after the clip header click and 29 Ctrl+D presses; each press is checked for count = press + 1, and the 30 copies must have 30 distinct data-clip-start values.")
row("interact.harness.zoom-30-live", "zoom, 30 clips", "zoom-live", "boolean (1 = true)", "deterministic", "assert", eq1,
    "1x only. Same rule as interact.harness.zoom-live, with 30 clips.")
for metric, unit, kind in (("commits-per-key", "commits / key", "deterministic"), ("components-per-key", "components / key", "deterministic"),
                           ("components-max", "components", "deterministic"), ("key-window-longest-ms", "ms", "wallclock")):
    row(f"interact.zoom.30.{metric}", "zoom, 30 clips", metric, unit, kind, "record", None,
        "1x only. Same definition as the interact.zoom.1 row, with 30 clips.")
row("interact.harness.drag-fade-30-live", "fade-in handle drag, playing, 30 clips", "drag-fade-live", "boolean (1 = true)", "deterministic", "assert", eq1,
    "1x only. The first clip's data-fade-in grows from the start to mid-drag and from mid-drag to the end.")
row("interact.drag.fade.30.playing.move-components-per-move", "fade-in handle drag, playing, 30 clips", "move-components-per-move", "components / move", "deterministic", "record", None,
    "1x only. Same definition as interact.drag.fade.playing.move-components-per-move, with 30 clips.")
row("interact.drag.fade.30.playing.release-restarts", "fade-in handle drag, playing, 30 clips", "release-restarts", "start() calls", "deterministic", "record", None,
    "1x only. start() calls from pointerup until quiet: shows whether the commit restarts every clip.")
ids = [r["id"] for r in rows]
assert len(ids) == len(set(ids))
json.dump(rows, open(sys.argv[1], "w"), indent=2, ensure_ascii=False)
open(sys.argv[1], "a").write("\n")
print(len(rows))

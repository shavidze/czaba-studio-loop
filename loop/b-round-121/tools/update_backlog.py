import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    d = json.load(f)

D = "D-29z87"
d["version"] = d["version"] + 1
d["updated"] = "2026-10-24 (B round 121 result / round 122 plan, D-29z87)"
d["current_task"] = (
    "current-task.md (round 122: D-29z87 - REGRESSION round (speed rules, regression-last 2026-10-21 -> 3 days): "
    "A edits only line 4 of docs 102 and 103 (status Completed, gates 120/121); C re-verifies in the browser at "
    "1440x900 and 1280x720 one key acceptance per done/c_pass item (SRW-01..SRW-24 minus SRW-21, T12 stages 1-4b; "
    "rows RG-*), the parked rows RP-RANGE-1280, RP-ROW-HANDLE, RP-TOUCH-LONG, RP-HEADER-WIDTH, RG-SMOKE "
    "(npm run test:e2e:smoke, /cart only), G122-3; baseline clean 425a807; frozen b-round-121-r122-tree-sha256.txt (935); "
    "outcome table section 6)"
)

q = d["post_current_stage_queue"]
t12 = next(e for e in q if e["id"] == "T12-GAIN-VOLUME")
t12["status"] = (
    "v1_complete (stages 1, 2, 3a, 3b, 4a, 4b c_pass_published: 38c0e21, d5de68f, 9cb820b, 4090f6e, 0a75ba8, 425a807; "
    "T12.27 items 1-8 C-verified with browser evidence); stage 5+ is the T12-ADVANCED queue entry; "
    "REGRESSION round 122 (D-29z87), then ABLETON-EXPERT-REVIEW"
)
for s in t12["stages"]:
    if str(s.get("stage")) == "4b":
        s["status"] = "c_pass_published"
        s["round"] = 121
        s["decision"] = "D-29z86"
        s["evidence"] = (
            "c-round-121.json PASS browserVerified=true realVerified=true, 0 bugs: WZ-PRESENT + WZ-T7 at 1440 and 1280 "
            "(ratio s=2, 0 violations, video d unchanged, detail panel d unchanged), WZ-LEVELS (0.5x-8x), WZ-GAIN, "
            "WZ-HISTORY, WZ-AUDIO (1x vs 2x WAV byte-identical sha 3946976d), WZ-METER (-10.555 dB every iteration, "
            "paired delta 0.000), WZ-NEWCLIP, WZ-KEYS, WZ-RELOAD; blocked only fake-Bearer 403 (backend unavailable in "
            "cloud); gate 121 published 425a807 (verify 157/157 files, review 8.5/10 COMMIT OK)"
        )
t12["t12_rulings_round122_planning"] = (
    "D-29z87: round 121 C PASS (browserVerified, 0 bugs) + gate 121 published 425a807 -> stage 4b c_pass_published; "
    "T12 V1 (T12.27 items 1-8) complete. date -u 2026-10-24 00:18:55 = 3 days since regression-last 2026-10-21, so "
    "round 122 is the REGRESSION round (A doc lines only; C browser sweep of every done/c_pass item + parked rows + "
    "smoke). Gate-121 suggestions: S1/S2 (no hover, no affordance) -> deferred Low GATE121-S1-ZOOM-NO-HOVER and the "
    "existing WAVEFORM-ZOOM-DISCOVERABILITY signal; S3 literal default -> deferred Low GATE121-S3-DEFAULT-LITERAL; "
    "S4 render cost acknowledged; S5 aria-label language -> DESIGN-UX-REVIEW signal; S6 doc 103 status -> round 122 "
    "A; S7 header width -> C row RP-HEADER-WIDTH. Architecture note Signal 4 -> ARCH-R121-LANE-VIEW-OPTIONS (signal; "
    "addendum to ARCH-CHECKPOINT-SRW14-PREFS); T12 V1 is a feature boundary -> bounded checkpoint request "
    "b-round-121-checkpoint-request.md to root, non-blocking."
)

aer = next(e for e in q if e["id"] == "ABLETON-EXPERT-REVIEW")
aer["status"] = "next_after_regression_round_122 (prerequisite T12 V1 met at gate 121, 425a807)"
aer["inputs_from_round121"] = [
    "WAVEFORM-ZOOM-LIVE-PARITY: stepped 0.5x-8x select in the grid row vs Live 12 6.1 slider (range and location unconfirmed)",
    "Waveform Zoom not an Undo step: inference, unconfirmed (C round 121)",
    "Detail panel (Clip View analogue) not zoomed: unconfirmed (C round 121)",
    "Video clips not zoomed: manual says audio clips; Live video untested (CZABA decision)",
    "MASTER-FINE-STEP (round 119 signal)",
]

d["regression_rounds"] = d.get("regression_rounds", [])
d["regression_rounds"].append({
    "id": "REGRESSION-ROUND-2026-10-24",
    "round": 122,
    "decision": D,
    "status": "dispatched",
    "trigger": "speed rules 2026-10-21: regression-last.json 2026-10-21 (round 71 baseline), B planned 2026-10-24 00:18:55 UTC (3 days)",
    "scope": "C browser re-verification of every done/c_pass item at 1440x900 and 1280x720 (RG-01..RG-24 minus SRW-21, RG-T1..RG-T4B), parked rows RP-RANGE-1280 (C-R83-S-1280-RANGE-SHIFT), RP-ROW-HANDLE (GATE85-S6), RP-TOUCH-LONG (TOUCH-LONGPRESS-CONTEXTMENU), RP-HEADER-WIDTH (gate-121 S7), GATE111-SUGG-E2E-S5 inside RG-11B; RG-SMOKE; G122-3",
    "regression_last_update": "B at round 123 planning per current-task.md section 6 (not before C completes every row)",
})

def find(fid):
    for e in d["open_findings"]:
        if e.get("id") == fid:
            return e
    return None

parked = {
    "C-R83-S-1280-RANGE-SHIFT": "RP-RANGE-1280",
    "GATE85-S6-ROW-BOUNDARY-HANDLES": "RP-ROW-HANDLE",
    "TOUCH-LONGPRESS-CONTEXTMENU": "RP-TOUCH-LONG",
    "GATE111-SUGG-E2E-S5": "RG-11B (S5 scenario)",
}
for fid, row in parked.items():
    e = find(fid)
    e["note_round122"] = f"scheduled as C row {row} in the round-122 regression round ({D}); B ruling for a failure is in current-task.md section 4"

e = find("WAVEFORM-ZOOM-DISCOVERABILITY")
e["note_round122"] = "gate-121 reviewer suggestions 1-2 (closed select reads as a static badge; no hover state unlike Snap/Env) merged here for DESIGN-UX-REVIEW; the missing hover class is also the deferred Low GATE121-S1-ZOOM-NO-HOVER"
e = find("WAVEFORM-ZOOM-LIVE-PARITY")
e["note_round122"] = "C round 121 Ableton rows: separate control not gain + all audio tracks/new clips confirmed (6.1); stepped select, not-undo, detail panel not zoomed unconfirmed -> ABLETON-EXPERT-REVIEW inputs_from_round121"
e = find("ARCH-CHECKPOINT-SRW14-PREFS")
e["note_round122"] = "addendum: ARCH-R121-LANE-VIEW-OPTIONS (gate-121 + A round-121 reviewers, Signal 4, verdict keep): fifth view-preference prop (folded, snapSeconds, gridSeconds, envelopeMode, waveformZoom) threaded Workspace -> Lane -> ClipView; proposal one memoized LaneViewOptions object prop or a workspace view-preferences hook; acceptance 1x drawings byte-identical, Undo/Redo and useArrangement() shape unchanged, existing grid/env/zoom tests unchanged, plus a render-count test; non-gating; in b-round-121-checkpoint-request.md"
e = find("ARCH-CHECKPOINT-PHASE1-BOUNDARY")
e["note_round122"] = "T12 V1 boundary reached (gate 121, 425a807); still unanswered; B sent one bounded consolidated request b-round-121-checkpoint-request.md (keep/extract per question, <= 3 sentences each); non-blocking; the regression round and ABLETON-EXPERT-REVIEW (no code) do not wait for it; any approved extraction becomes its own B task with one owner and behaviour-preserving tests, scheduled no earlier than after the review rounds unless root orders otherwise"

new_findings = [
    {"id": "GATE121-S4-RENDER-COST", "severity": "info", "status": "acknowledged (reviewer: same cost class as horizontal zoom; discrete choice; throttle or useDeferredValue only if a continuous slider is added)", "title": "one Waveform Zoom change rebuilds buildPeakShape for every audio clip (up to 4096 columns)", "evidence": "gates/round-121/review.md Suggestion 4"},
    {"id": "GATE121-S5-ARIA-LANGUAGE", "severity": "info", "status": "signal for DESIGN-UX-REVIEW (not scheduled)", "title": "Waveform Zoom aria-label mixes English 'Waveform Zoom' (Live term) and Georgian while the neighbouring grid select is Georgian only", "evidence": "gates/round-121/review.md Suggestion 5"},
    {"id": "GATE121-S6-DOC103-STATUS", "severity": "info", "status": "scheduled round 122 (A, doc 103 line 4); doc 102 line 4 had the same stale status and is fixed in the same round", "title": "doc 103 (and doc 102) status line still says C and the gate are ahead", "evidence": "gates/round-121/review.md Suggestion 6; docs 102/103 line 4 at 425a807"},
    {"id": "GATE121-S7-HEADER-WIDTH", "severity": "info", "status": "scheduled round 122 as C row RP-HEADER-WIDTH", "title": "224 px grid header with BPM set, widest triplet division and zoom not browser-checked", "evidence": "gates/round-121/review.md Suggestion 7"},
]
existing = {e.get("id") for e in d["open_findings"]}
for nf in new_findings:
    if nf["id"] not in existing:
        d["open_findings"].append(nf)

deferred_reason = "user decision 2026-10-23: open Lows no longer block T12; fixed in one polish pass after VISUAL-A-OBSIDIAN and before release; final acceptance still requires every one fixed and C-verified"
new_lows = [
    {"id": "GATE121-S1-ZOOM-NO-HOVER", "severity": "low", "status": "open", "title": "Waveform Zoom select has no hover state (Snap/Env have hover:text-foreground / hover:text-accent)", "evidence": "gates/round-121/review.md Suggestions 1-2; c-round-121.md observations", "repro": "/studio-lab: hover the 1x select in the grid row; no colour change", "deferred_reason": deferred_reason, "deferred_round": "B round 121 -> 122 planning (2026-10-24)", "note": "the affordance question itself is WAVEFORM-ZOOM-DISCOVERABILITY (DESIGN-UX-REVIEW); a hover class pair is a pure visual nit"},
    {"id": "GATE121-S3-DEFAULT-LITERAL", "severity": "low", "status": "open", "title": "ArrangementClip.tsx and ArrangementLane.tsx default waveformZoom to the literal 1 instead of WAVEFORM_ZOOM_DEFAULT", "evidence": "gates/round-121/review.md Suggestion 3", "repro": "static (ArrangementClip.tsx l.302, ArrangementLane.tsx l.136 at 425a807)", "deferred_reason": deferred_reason, "deferred_round": "B round 121 -> 122 planning (2026-10-24)"},
]
dl_ids = {e.get("id") for e in d["deferred_low_polish"]}
for nl in new_lows:
    if nl["id"] not in dl_ids:
        d["deferred_low_polish"].append(nl)

sig = {"id": "ARCH-R121-LANE-VIEW-OPTIONS", "round": 121, "source": "gates/round-121/review.md Architecture note (Signal 4) + a-round-121.md code-reviewer note", "note": "fifth view-preference prop threaded Workspace -> Lane -> ClipView; proposal one memoized LaneViewOptions prop (stable identity, ClipView is memo) or a workspace view-preferences hook; acceptance: 1x drawings byte-identical, Undo/Redo and useArrangement() shape unchanged, existing tests unchanged, plus a render-count test", "status": "addendum to ARCH-CHECKPOINT-SRW14-PREFS in b-round-121-checkpoint-request.md; verdict keep; not scheduled"}
if not any(s.get("id") == sig["id"] for s in d["architecture_signals"]):
    d["architecture_signals"].append(sig)

for r in d["rounds"]:
    if r.get("round") == 121:
        r["status"] = "c_pass (c-round-121.json: 23 rows passed incl. WZ-PRESENT/WZ-T7 at 1440 and 1280, WZ-AUDIO byte-identical, WZ-METER paired 0.000 dB; browserVerified=true realVerified=true; 0 bugs; blocked fake-Bearer 403 backend unavailable in cloud); gate 121 published 425a807"
if not any(r.get("round") == 122 for r in d["rounds"]):
    d["rounds"].append({
        "round": 122,
        "task": "current-task.md",
        "decision": D,
        "status": "dispatched",
        "items": ["REGRESSION-ROUND-2026-10-24", "GATE121-S6-DOC103-STATUS"],
        "note": "Regression round. A owns line 4 of docs 102 and 103 only (Edit tool). C: SOURCE-SCOPE, AN-REVIEW, RG-01..RG-24 (minus SRW-21), RG-T1..RG-T4B at both viewports (RG-03 drift, RG-15/RG-20 exports at 1440), RP-RANGE-1280, RP-ROW-HANDLE, RP-TOUCH-LONG, RP-HEADER-WIDTH, RG-SMOKE (serial, /cart only), G122-3, PX-NET/REG-HYD; incremental c-round-122.json + progress.json. Baseline 425a807 clean; frozen b-round-121-r122-tree-sha256.txt (935). Outcome table section 6: all PASS -> regression-last updated, round 123 ABLETON-EXPERT-REVIEW part 1; Medium+ -> round 123 bounded fix-up; Lows -> deferred_low_polish.",
    })

d["advisor_used_by_B"] = "round 121 -> 122 planning: advisor available and used before writing (and before finishing)"

with open(path, "w", encoding="utf-8") as f:
    json.dump(d, f, ensure_ascii=False, indent=1)
    f.write("\n")
print("ok", d["version"], len(d["deferred_low_polish"]), len(d["open_findings"]))

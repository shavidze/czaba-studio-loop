import json
import sys

loop = sys.argv[1]
p = loop + "/current-task.md"
t = open(p, encoding="utf-8").read()

def rep(old, new):
    global t
    assert t.count(old) == 1, old[:80]
    t = t.replace(old, new)

rep(
    "| RG-T3A | T12 stage 3a | Drag the stems lane Volume fader to the bottom, then export |",
    "| RG-T3A | T12 stage 3a | **Isolated stems clip** (music and SFX muted, no video, as in RG-13): drag the stems lane Volume fader to the bottom, then export |",
)
rep(
    "• Master mute makes the master meter fall to silence.<br>",
    "• Master mute: silence by the **meter rule** below.<br>",
)
rep(
    "• Group Mute makes the children's meters fall to silence; the SFX lane still sounds. |",
    "• Group Mute: the children are silent by the **meter rule**, and the SFX lane still sounds (its tap or track-meter peak stays above −60 dB). |",
)
rep(
    "Where a row's exact control name or key differs from the current UI",
    "**Meter rule** (RG-13, RG-17): meters fall at 20 dB/s, as noted in C-R118-OBS-GV-INF-METER-BALLISTICS, so the visible fall is not instant. \"Silent\" means either of these:\n"
    "- the real output tap (`c-round-121/tools/am.cjs`, `tap()`) reads exactly 0 from 150 ms after the click;\n"
    "- for a single track, the track meter `data-peak` is ≤ −60 dB within 4 s.\n\n"
    "Report which method was used. For a group mute, use the children's track meters, and the tap for \"the SFX lane still sounds\".\n\n"
    "Where a row's exact control name or key differs from the current UI",
)
rep(
    "  - Its `playwright-report/` and `test-results/` output is git-ignored (`.gitignore` l.19–20). Do not delete or commit it.\n",
    "  - Its `playwright-report/` and `test-results/` output is git-ignored (`.gitignore` l.19–20). Do not delete or commit it.\n"
    "  - **Valid setup for this row:** the 5187 `webServer` started and Chromium launched.\n"
    "    - A `webServer` timeout, a busy port 5187 or a Chromium launch failure is **inconclusive (environment)**. Record the log, and allow one retry after the cause is gone.\n"
    "    - A test assertion failure on a valid setup is a finding.\n"
    "    - This smoke has not been run on the cloud runner before. B found no smoke result in `gates/round-121`.\n",
)
rep(
    "| Every §3/§4 row PASS, smoke PASS | • Set `regression-last.json`",
    "| Every §3/§4 row PASS, smoke PASS | • **First**, before applying the 3-day rule at round 123 planning, set `regression-last.json`",
)
rep(
    "A failed row does not change its item's earlier status by itself.",
    "**Ordering rule for the round-123 planner:** at round 123 planning, `regression-last.json` still reads 2026-10-21. If C ran every row, **update it from round 122's C result first**, and only then apply the 3-day rule. Otherwise a second regression round would be planned by mistake.\n\n"
    "A failed row does not change its item's earlier status by itself.",
)
rep(
    "• The separator steps ±16 px, `aria-valuenow` matches, it is clamped to 288/480, and no history entry is added. |",
    "• The separator steps ±16 px, `aria-valuenow` matches, it is clamped to 288/480, and no history entry is added.<br>• **Focus (B-R108-LIB-FOCUS-LOSS):** after collapsing with `◀`, focus is on `▶`; after expanding with `▶`, focus is on `◀`. |",
)
open(p, "w", encoding="utf-8").write(t)

bp = loop + "/b-round-121.md"
b = open(bp, encoding="utf-8").read()
old = "- **`regression-last.json` is not updated now.** B updates it at round 123 planning, once C has run every row. If rows are left over, it waits until they have run."
assert b.count(old) == 1
b = b.replace(old, old + "\n  - **Ordering:** at round 123 planning, update `regression-last.json` from round 122's C result **before** applying the 3-day rule. It will still read 2026-10-21, and the rule would otherwise plan a second regression round.")
open(bp, "w", encoding="utf-8").write(b)

np = loop + "/b-next.json"
n = json.load(open(np, encoding="utf-8"))
n["nextTask"] += "\n- Round-123 planner: if C ran every row, FIRST update regression-last.json from round 122's C result, THEN apply the 3-day rule; it still reads 2026-10-21."
json.dump(n, open(np, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(np, "a", encoding="utf-8").write("\n")

kp = loop + "/backlog.json"
d = json.load(open(kp, encoding="utf-8"))
d["baseline_tree_at_round122"] = {
    "head": "425a80705c7b57d6157796810bdd878f1c7b061c",
    "working_tree": "clean (git status --porcelain empty); gate 121 published 425a807 (both remotes)",
    "frozen_list": "tmp/studio-real-loop/b-round-121-r122-tree-sha256.txt",
    "entries": 935,
    "excluded": [
        "docs/implementation/2026/quarter-IV/102-studio-waveform-clip-gain.md (pre d829d7e5...)",
        "docs/implementation/2026/quarter-IV/103-studio-waveform-vertical-zoom.md (pre 22a6c287...)",
    ],
    "new_files_granted": [],
}
json.dump(d, open(kp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(kp, "a", encoding="utf-8").write("\n")
print("ok")

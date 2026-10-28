import json
P = 'backlog.json'
b = json.load(open(P))
items = {i['id']: i for i in b['items']}
fs = {f['id']: f for f in b['findings']}
PASS = "C R39 PASS (R39-1..R39-5, realVerified=true; c-round-39.md/.json), published 24e9723, review COMMIT OK"

t = items['TM-B41']
t['status'] = 'done'
t['realVerified'] = True
t['commit'] = '24e9723557fb82d572a655136ff7a0849a8e61f3'
t['evidence'] = [
    "C R39-1: src/ --quiet exit 0 vs 96f1e45; only the 7 owned paths (6 M + new dom-queries.test.ts); dom-queries.test.ts and dom-queries.ts cmp-identical to B drafts; +/- lines (80) equal prototype.diff; docs/bugs/001 only 279/310/328; README unchanged; TESTING.md hunks only in §6, last line kept",
    "C R39-2: red (A's tree with HEAD dom-queries.ts) 1 failed (q4, 'expected [Function] to throw an error') / 309 passed of 310; green 310/310 in 21 files twice; each changed file alone green, new tests 0-259 ms",
    "C R39-3: B mutants HM-1 (q1), HM-2 (q2), HM-3 (q3), HM-4 (q4), HM-5 (q4), PM-6 (x8), CM-3 (f9), CM-8 (f9) killed; C's own C-1..C-8 killed; no survivor; copy restored (diff -r empty)",
    "C R39-4 gate: verifyCommand exit 0 from clean state, Biome 0/8 same list as c-round-35, tsc node/web/test 0, renderer 310/310, main 93/93, E2E 7/7 real Electron xvfb; --retries=0 7/7; real-app smoke screenshot smoke-main.png",
    "C R39-5 docs: §6 four changes, no agent name, three helper rules match code; (x8)/(f9)/new (b1) names 1+1 matches, old (b1) 0/0",
    "root gate round 39: published 24e9723, review COMMIT OK (gates/round-39/review.md): 0 critical/high/medium, 2 low (RR-R39-01, RR-R39-02), 1 architecture note (RR-R39-03)",
]

for fid in ['C-R36-01', 'RR-R36-02', 'RR-R36-03', 'R36-A-02', 'RR-R36-04', 'C-R37-01', 'B-R37-02', 'C-R38-01', 'RR-R38-03']:
    f = fs[fid]
    f['status'] = 'closed'
    f['routed_to'] = 'closed by TM-B41 round 39 (' + PASS + ')'

t = items['TM-B42']
t['status'] = 'in_progress'
t['round'] = 40
t['decisions'] = ['D-46']
t['source'] = "RR-R38-01, RR-R38-04 (root review round 38); B-R39-01 (B measurement round 39: the hover cue is pre-existing, not a D-45 regression)"
t['title'] = ("Disabled buttons still change colour on mouse hover. Pre-existing on native disabled and inherited by aria-disabled "
              "(B-R39-01: ea4a1cb and 24e9723 identical). Hover feedback only on enabled, non-aria-disabled buttons: "
              "Button variants enabled:not-aria-disabled:hover:, SchemaEditor fieldset buttons enabled:hover: (D-46). "
              "UX change: Reference + Deviations")
t['acceptance'] = [
    "R40: src change exactly b-round-39-exp/prototype-src.diff (button.tsx 5 variant strings; SchemaEditor.tsx 4 className sites); no other src file; no test file (styling-only, test-on-bugfix exemption; jsdom computes no :hover)",
    "real app (C, Playwright _electron + xvfb, mouse hover, getComputedStyle): old 24e9723 vs new on H0-H8 (b-round-39-exp/hover-probe.mjs or C's own): disabled/aria-disabled states (clean Save, busy Save, Applying Done, Applying middle arrow / hide-standard X / Add Field, scanning Rescan) rest == hover on new, differ on old; enabled controls (dirty Save, rest Done, rest arrow, rest X, rest Add Field) still change on hover; plus C's own checks (Trash2 on a custom field, hidden-standard chip, AudioPlayer unchanged)",
    "CSS: built out/renderer css has :enabled:not([aria-disabled=\"true\"]):hover rules for the 5 variants and :enabled:hover for the 4 fieldset sites; no plain .hover\\:bg-brand-hover rule left",
    "mutants: revert each of the 9 class edits one at a time -> the matching H step shows a hover change again (C)",
    "gate verifyCommand green, renderer 310, main 93, E2E 7/7, --retries=0 7/7, Biome 0/8 same list",
]
t['evidence_b'] = ("B R39 (b-round-39-exp/): hover-probe.mjs on builds ea4a1cb (native disabled), 24e9723 (aria-disabled), proto: "
                   "(hover: hover) matches under xvfb; old and new identical on every step, disabled Save/Done bg rgb(18,217,200) -> rgb(29,237,219) "
                   "on hover, arrows/X text colour changes inside the disabled fieldset; proto: every disabled step rest == hover, controls still change; "
                   "proto renderer 310/310, tsc web 0, Biome 0/8 after format; pageErrors empty")
t['reference'] = ("R1 in-app AudioPlayer.tsx: disabled play button drops hover:bg-elevated; R2 Bootstrap 5.3 Buttons: disabled buttons get pointer-events:none, "
                  "'preventing hover and active states from triggering'; R3 Tailwind docs hover-focus-and-other-states: enabled: variant "
                  "('enabled:hover:border-gray-400 disabled:opacity-75'), aria-disabled variant, not-* variants; R4 round 38 references (MDN aria-disabled: "
                  "styling is the author's job)")

if not any(d['id'] == 'D-46' for d in b['decisions']):
    b['decisions'].append({
        "id": "D-46",
        "status": "B, round 39 close (planned R40, TM-B42); UX, reversible",
        "decision": ("Hover feedback appears only on buttons that can act: Button variants use enabled:not-aria-disabled:hover:, "
                     "SchemaEditor fieldset buttons use enabled:hover:. Disabled and aria-disabled buttons keep their resting colour, "
                     "opacity 0.5 and cursor not-allowed (D-45). pointer-events:none (Bootstrap) is not used because it would drop "
                     "the not-allowed cursor."),
    })

newf = [
    (39, "RR-R39-01", "root-review (gates/round-39/review.md low 1)", "low",
     "(f9) sets useSchemaStore fields [] directly; safe only if beforeEach restores the schema store",
     "closed: resetAllStores in busy-buttons-focus beforeEach restores STANDARD_FIELDS (task round 39 'What could break'); C R39-2 ran (f9) alone and in the full suite green", "closed"),
    (39, "RR-R39-02", "root-review (gates/round-39/review.md low 2)", "low",
     "(x8) is a pure store test placed in a component suite (selection-after-folder-switch.test.ts); could move to tests/renderer/stores/file-store.test.ts",
     "record (optional ride-along for a future test round)", "open"),
    (39, "RR-R39-03", "root-review (gates/round-39/review.md architecture note)", "info",
     "Architecture signal: a sibling queryButtonByText returning null would let absence checks avoid getByRole; store-only checks belong in stores/ suites",
     "signal (not a task)", "open"),
    (39, "A-R39-01", "A R39 code-reviewer (a-round-39.md), C R39 note", "low",
     "(f9) toHaveTextContent('Done') is a substring match; /^Done$/ would be stricter; C mutants C-4/C-5/C-7 still killed by (f9)",
     "record", "open"),
    (39, "A-R39-02", "A R39 code-reviewer (a-round-39.md), C R39 note", "info",
     "TESTING.md §6 mentions trim only for strings; the helper also tests RegExp against the trimmed text ((q3)/C-3 pin it) and a RegExp may match partially",
     "record (next TESTING.md touch)", "open"),
    (39, "B-R39-01", "B R39 measurement (b-round-39-exp/hover-old.json, hover-new.json, hover-summary.txt)", "info",
     "Fact: Chromium matches :hover on natively disabled buttons; ea4a1cb (native disabled) and 24e9723 (aria-disabled) show the same hover background on clean/busy Save and Applying Done, and the same text colour change on fieldset-disabled arrows. RR-R38-01's 'new cue' is not a D-45 regression; the cue is pre-existing (all disabled buttons incl. Rescan, Add Field)",
     "TM-B42 round 40 (re-scoped from regression check to pre-existing fix, D-46)", "open"),
    (39, "B-R39-02", "B R39 measurement (hover-*.json H5)", "info",
     "Fieldset-disabled reorder arrows keep cursor default while Applying (Add Field Button shows not-allowed); pre-existing in ea4a1cb too",
     "record (not in TM-B42 scope; candidate for a later UX touch)", "open"),
]
for rnd, fid, src, sev, title, route, st in newf:
    if fid in fs:
        continue
    b['findings'].append({"round": rnd, "id": fid, "source": src, "severity": sev, "status": st, "title": title, "routed_to": route})

for fid in ['RR-R38-01', 'RR-R38-04']:
    fs[fid]['routed_to'] = 'TM-B42 round 40 (B-R39-01: pre-existing, not a D-45 regression; fix per D-46)'

for r in b['rounds']:
    if r['round'] == 39:
        r['status'] = 'published'
        r['commit'] = '24e9723557fb82d572a655136ff7a0849a8e61f3'
        r['result'] = 'C PASS R39-1..R39-5, realVerified=true; review COMMIT OK'
if not any(r['round'] == 40 for r in b['rounds']):
    b['rounds'].append({"round": 40, "task": "TM-B42 hover feedback only on enabled buttons (D-46): Button variants + SchemaEditor fieldset buttons; real-app hover measurement old vs new",
                        "status": "planned", "baseline": "24e9723557fb82d572a655136ff7a0849a8e61f3 (clean)",
                        "items": ["TM-B42"], "findings": ["RR-R38-01", "RR-R38-04", "B-R39-01"]})
b['current_task'] = "Round 40: TM-B42 hover feedback only on enabled, non-aria-disabled buttons (D-46) on baseline 24e9723"
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=2)
print('ok')

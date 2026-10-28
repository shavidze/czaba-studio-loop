import json
P = 'backlog.json'
b = json.load(open(P))
items = {i['id']: i for i in b['items']}
fs = {f['id']: f for f in b['findings']}
COMMIT = 'e386cca619e44be8dc3fe0217600beae9608d804'
PASS = "C R40 PASS (R40-1..R40-7, realVerified=true; c-round-40.md/.json), published e386cca, review COMMIT OK"

t = items['TM-B42']
t['status'] = 'done'
t['realVerified'] = True
t['commit'] = COMMIT
t['evidence'] = [
    "C R40-1: only the 5 owned paths changed, nothing untracked; --quiet exit 0 for tests/, protected paths, everything else; +/- lines 42 = prototype.diff (sorted set cmp EQUAL); docs/bugs/001 only 24c24/317c317; no comment/any/export",
    "C R40-2: built CSS has .enabled\\:not-aria-disabled\\:hover\\:{bg-brand-hover,bg-elevated,bg-accent/90,bg-destructive/90}:enabled:not([aria-disabled=\"true\"]):hover and .enabled\\:hover\\:{text-foreground,text-destructive,text-destructive/80,border-brand}:enabled:hover; .hover\\:bg-brand-hover 0",
    "C R40-3 real app (Playwright _electron, xvfb, (hover: hover) true, mouse hover >= 400 ms, getComputedStyle), old 24e9723 vs new: H1/H2/H4/H5/H6/H7/H8/H9-applying/H10-applying change on old, rest == hover on new; H0/H3/H3b/H6b/H7b/H9/H10 rest/H11 enabled/Back change on hover with old's values; H11 disabled same on both; Open Folder secondary 17,19,24 -> 25,29,36 on both; rest values (bg, color, border, cursor, opacity 0.5/0.6/0.3, aria-disabled, aria-busy) old == new; edge arrow no longer changes (planned); pageErrors []",
    "C R40-4: keyboard K2 on new: focus stays on Save Tags during (Saving..., aria-busy) and after the save; 1 meta:write, 0 meta:write-batch; ffprobe ICAT=C40Keyb, music-metadata exif ICAT C40Keyb; a2.wav/b.wav sha256 unchanged",
    "C R40-5 mutants m1 primary not-aria-disabled (H1/H2/H4), m2 ghost enabled (H7/H8), m3 arrow (H5), m4 X (H6), m5 Trash2 (H9), m6 chip (H10) all killed; survivors confirmed equivalent by grep (aria-disabled only on 2 primary Buttons, Rescan only natively disabled ghost, secondary only Open Folder, accent/destructive unused); copy restored",
    "C R40-6 gate: verifyCommand exit 0 from clean state, Biome 0/8 same list as c-round-35, tsc node/web/test 0, renderer 310/310, main 93/93, E2E 7/7; --retries=0 7/7",
    "C R40-7: R2 Bootstrap and R3 Tailwind re-fetched and still say so; Dev1 not-allowed cursor on hover, Dev2 arrow cursor default, Dev3 focus ring on focused aria-disabled Save Tags (screenshot), Dev4 Back still changes; docs match code; 24/317 -> button.tsx:36",
    "root gate round 40: published e386cca, review COMMIT OK (gates/round-40/review.md): 0 critical/high/medium; low: D-46 missing from the decision log (RR-R40-01), line refs correct (RR-R40-02), a11y real-app hover check (RR-R40-03); architecture note IconButton (RR-R40-04)",
]

for fid in ['RR-R38-01', 'RR-R38-04', 'B-R39-01']:
    fs[fid]['status'] = 'closed'
    fs[fid]['routed_to'] = 'closed by TM-B42 round 40 (' + PASS + ')'

for d in b['decisions']:
    if d['id'] == 'D-46':
        d['status'] = 'verified (C R40 PASS), published e386cca (TM-B42); UX, reversible; decision-log entry in docs/bugs/001 missing until TM-B43 (round 41)'

newf = [
    (40, "C-R40-01", "C R40-7 (c-round-40.json bug; same as A-R40-01)", "low",
     "docs/design/component-specs.md:376 'Hidden field chip' still says hover:text-foreground hover:border-brand; SchemaEditor.tsx:230 uses enabled:hover:. The whole SchemaEditor spec section was stale at baseline (container mt-3 ... border-brand does not exist, row py-1 vs py-1.5)",
     "TM-B43 round 41", "open"),
    (40, "A-R40-01", "A R40 (a-round-40.md)", "low",
     "Same as C-R40-01 (component-specs chip block still plain hover:); outside the frozen prototype.diff",
     "TM-B43 round 41 (duplicate of C-R40-01)", "open"),
    (40, "A-R40-02", "A R40 (a-round-40.md); C R40 note", "low",
     "D-46 is cited in style-guide.md:215/235 and component-specs.md:50, but docs/bugs/001 decision log ends at D-45",
     "TM-B43 round 41", "open"),
    (40, "RR-R40-01", "root-review (gates/round-40/review.md low 1)", "low",
     "Design docs cite D-46 but no D-46 entry exists; add a short Georgian D-46 entry after D-45 in docs/bugs/001 (variants, SchemaEditor icon buttons, rejected alternative, why no test)",
     "TM-B43 round 41 (same as A-R40-02)", "open"),
    (40, "RR-R40-02", "root-review (gates/round-40/review.md low 2)", "info",
     "Confirmation: docs/bugs/001 lines 24/317 button.tsx:35 -> :36 is correct; SchemaEditor refs :186/:194/:280-281 did not move",
     "closed: confirmation, no action", "closed"),
    (40, "RR-R40-03", "root-review (gates/round-40/review.md low 3)", "low",
     "aria-disabled buttons stay focusable; someone should hover them once in the real app to confirm cursor and opacity look like native disabled",
     "closed: C R40-3/R40-7 Dev1 measured it in the real app (H1/H2/H4 cursor not-allowed, opacity 0.5, rest values old == new; Dev3 focus ring screenshot)", "closed"),
    (40, "RR-R40-04", "root-review (gates/round-40/review.md architecture note)", "info",
     "Architecture signal: a shared forwardRef IconButton under ui/ owning enabled:not-aria-disabled:hover:* and disabled opacity would replace SchemaEditor's raw icon buttons so future buttons get D-46 without remembering the prefix",
     "signal (not a task)", "open"),
    (40, "A-R40-03", "A R40 (a-round-40.md)", "info",
     "AudioPlayer.tsx:114-117 avoids hover on its disabled state with a conditional class, not enabled:hover:; same behaviour (C H11 identical old/new)",
     "record", "open"),
    (40, "A-R40-04", "A R40 (a-round-40.md)", "low",
     "(a) component-specs.md:369 field row py-1 vs code py-1.5 (docs); (b) natively disabled plain <button>s in SchemaEditor have no cursor-not-allowed (related to B-R39-02)",
     "(a) TM-B43 round 41; (b) record with B-R39-02 (UX, needs reference-first)", "open"),
]
for rnd, fid, src, sev, title, route, st in newf:
    if fid in fs:
        continue
    b['findings'].append({"round": rnd, "id": fid, "source": src, "severity": sev, "status": st, "title": title, "routed_to": route})

if 'TM-B43' not in items:
    b['items'].append({
        "id": "TM-B43",
        "type": "docs",
        "severity": "low",
        "source": "C-R40-01 / A-R40-01 (component-specs chip block), A-R40-02 / RR-R40-01 (D-46 missing from the decision log), A-R40-04(a) (row py-1)",
        "title": "Docs only: SchemaEditor section of component-specs.md matches SchemaEditor.tsx (structure, row py-1.5, icon buttons and chip enabled:hover:, Done aria-disabled/aria-busy); D-46 bullet + entry (22) in docs/bugs/001; README 22/13/9",
        "status": "in_progress",
        "depends_on": ["TM-B42"],
        "decisions": ["D-46"],
        "findings": ["C-R40-01", "A-R40-01", "A-R40-02", "RR-R40-01", "A-R40-04"],
        "acceptance": [
            "R41: change exactly b-round-40-exp/prototype.diff (57 +/- lines) in docs/design/component-specs.md, docs/bugs/001-save-and-selection-known-limits.md, docs/bugs/README.md; src/tests/.claude/.github byte-identical to e386cca",
            "docs <-> code: every class string and attribute in the new SchemaEditor spec block occurs verbatim in SchemaEditor.tsx; D-46/entry (22) line refs resolve",
            "real app (C, Playwright _electron + xvfb): Customize Fields open, className of header, Back, fieldset, row, arrows, Trash2, X, chip, Done read from the DOM equals the spec strings; screenshot",
            "001 counts: 22 entries, 13 'გასწორდა', status line lists (22); README 22/13/9",
            "gate verifyCommand green, renderer 310, main 93, E2E 7/7, Biome 0/8 same list",
        ],
        "realVerified": False,
        "round": 41,
        "evidence_b": "B R40 (b-round-40-exp/): prototype applied to git archive e386cca by patch -p1 dry-run + apply, result == B's proto tree; 22 entries / 13 fixed counted on the proto",
    })

for r in b['rounds']:
    if r['round'] == 40:
        r['status'] = 'published'
        r['commit'] = COMMIT
        r['result'] = 'C PASS R40-1..R40-7, realVerified=true; 1 low docs bug C-R40-01; review COMMIT OK'
if not any(r['round'] == 41 for r in b['rounds']):
    b['rounds'].append({"round": 41, "task": "TM-B43 docs only: SchemaEditor spec section matches code; D-46 decision-log bullet + entry (22); README counts",
                        "status": "planned", "baseline": COMMIT + " (clean)",
                        "items": ["TM-B43"], "findings": ["C-R40-01", "A-R40-01", "A-R40-02", "RR-R40-01", "A-R40-04"]})
b['current_task'] = "Round 41: TM-B43 docs only (SchemaEditor spec section + D-46 decision log) on baseline e386cca"
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=2)
print('ok')

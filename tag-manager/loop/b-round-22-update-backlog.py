import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "9d1c97e005c9fb430190c7765e44a7ed24b6563f"

items = {i["id"]: i for i in b["items"]}
findings = {f["id"]: f for f in b["findings"]}
decisions = {d["id"]: d for d in b["decisions"]}
rounds = {r["round"]: r for r in b["rounds"]}


def add_note(obj, note):
    obj.setdefault("notes", [])
    if note not in obj["notes"]:
        obj["notes"].append(note)


def add_finding(f):
    if f["id"] in findings:
        findings[f["id"]].update(f)
        return
    b["findings"].append(f)
    findings[f["id"]] = f


t = items["TM-B25"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
ev = (
    "C round 22 PASS (c-round-22.md/.json, realVerified=true, 1 low test gap C-R22-01): R22-1 only FileList.tsx and file-list.test.ts M, "
    "no untracked file, tests/ removal = first import line only (back with act), one new describe at the end (z1)-(z11), src has no "
    "comment/any/@ts-ignore/new as/new export, FileRow module-private, stores untouched, permission_denials [] (transcript not available); "
    "R22-2 601dc4a worktree + A tests -> 6 failed / 13 passed: (z2),(z3) [ 'c.wav' ] vs [a,b,c], (z4) [ 'e.wav' ] vs [b,c,d,e], (z5) "
    "[ 'c.wav' ], (z11) [ 'd.wav' ] vs [a,d], (z8) new D-31 behaviour [a,b,c] vs [c]; pins (z1),(z6),(z7),(z9),(z10) + 8 older pass; "
    "A tree 19/19; R22-3 M1-M6 killed (M1/M2 by z2,z3,z4,z5,z8,z11; M3 z7,z8; M4 z4,z11; M5 z7,z8,z9; M6 z10); C's extra M7 "
    "(Shift-click does not move the anchor) survives -> C-R22-01; R22-4 clean verifyCommand exit 0, Biome 0 errors / 8 warnings (601dc4a "
    "list minus FileList.tsx useExhaustiveDependencies), typecheck 0, renderer 198/198 (10 files), main 93/93, E2E 7/7, --retries=0 7/7; "
    "R22-5 built app + xvfb, 5 copies of sample.wav: a.wav Category R22A saved, Shift-click c.wav -> 3 files selected; Save to 3 files "
    "R22Range -> Tags saved to 3 files; Name desc + click b + Shift e -> 4 (b-e); click c + search .wav + Shift a -> 3 (a-c); Select All, "
    "Deselect All, Shift d -> only d; ffprobe + music-metadata exif:ICAT R22Range on a,b,c, none on d,e; red reference 601dc4a build: "
    "only c.wav selected after step 1, button Save Tags, a keeps R22A, b no ICAT; deviations 1-3 observed (dev 1 by a discriminating run "
    "a,b,cx,dx,e: click a, Shift cx, search x, Shift dx -> cx,dx); pageErrors empty. Root gate round 22 published 9d1c97e, review COMMIT "
    "OK (lows RR-R22-01..04, architecture RR-R22-05)"
)
t.setdefault("evidence", [])
if ev not in t["evidence"]:
    t["evidence"].append(ev)
t["note"] = "B R22 close: done on C R22 evidence; published 9d1c97e. C-R22-01 (test gap for deviation 1) goes to TM-B26 round 23"

decisions["D-31"]["status"] = "done R22, published 9d1c97e (TM-B25; C R22-1..R22-5). Deviations 1-3 stay a Saba question (B-R21-02); docs/bugs record in R23 (TM-B26)"

if "D-32" not in decisions:
    d32 = {
        "id": "D-32",
        "status": "decided B round 22 close (technical, reversible, renderer only, behaviour-neutral); to be implemented R23 (TM-B26)",
        "decision": (
            "MetadataPanel handleSave reads the start snapshot once with useMetadataStore.getState().editingMetadata and uses that one "
            "value for the single write payload, the batch payload (modified keys) and the D-30 typed-during-save comparison; "
            "editingMetadata leaves the handleSave deps. The six redundant casts (single write 'as Partial<WavMetadata>', 'updated as "
            "WavMetadata' x3, 'accumulated as Record<string, WavMetadata>', 'current as WavMetadata') are removed because the values are "
            "already typed (src/preload/index.d.ts readMetadata/readMetadataBatch). The two form-binding narrowings in the render "
            "(editingMetadata[field.key] as string[] / as string) stay: they narrow the FieldValue union to the input prop type and need a "
            "runtime narrowing, which is a separate change. No observable behaviour change; no store change; D-21..D-30 unchanged"
        ),
    }
    b["decisions"].append(d32)
    decisions["D-32"] = d32

if "TM-B26" not in items:
    t26 = {
        "id": "TM-B26",
        "type": "hygiene",
        "severity": "low",
        "source": "C R22 (C-R22-01), root reviews R13/R15/R21/R22 (RR-R13-02, RR-R15-02, RR-R21-01, RR-R22-02), A R21 (A-R21-04, A-R21-01, A-R21-03), RR-R21-02",
        "title": (
            "Save/selection hygiene: (a) unit pin for D-31 deviation 1 (Shift-click moves the anchor; mutant M7 survives today, C-R22-01); "
            "(b) metadata-panel-batch-save.test.ts once-mock queues leak into the next test (mockClear keeps once-values, A-R21-04); "
            "(c) MetadataPanel start snapshot from one getState() read and the six redundant casts removed (D-32; RR-R21-01, RR-R13-02, "
            "RR-R15-02); (d) docs/bugs record of the known limits of D-29/D-30/D-31 with severity, file:line, reproduction, decision and "
            "pinning test (RR-R21-02, A-R21-01, A-R21-02, A-R21-03, B-R19-01/RR-R20-01, B-R21-02, RR-R22-01, RR-R22-02, A-R22-01, A-R22-02)"
        ),
        "status": "in_progress",
        "round": 23,
        "depends_on": ["TM-B25"],
        "decisions": ["D-32"],
        "findings": ["C-R22-01", "A-R21-04", "RR-R21-01", "RR-R13-02", "RR-R15-02", "RR-R21-02", "A-R21-01", "A-R21-02", "A-R21-03", "RR-R22-02", "B-R19-01", "RR-R20-01", "B-R21-02", "RR-R22-01", "A-R22-01", "A-R22-02"],
        "acceptance": [
            "R23: (z12) a,b,cx,dx: click a, Shift cx, setSearchQuery('x'), Shift dx -> [cx, dx]; passes on 9d1c97e and on A's tree, fails on "
            "mutant M7 (if (!e.shiftKey) anchorPathRef.current = file.path) with [dx]",
            "(i1)/(i2) once-values queued on all five window.api mocks in (i1) do not reach (i2): (i2) fails with the 9d1c97e beforeEach "
            "(mockClear) and passes with mockReset; each of the five beforeEach lines reverted alone is killed by (i2)",
            "MetadataPanel: 6 casts gone, 2 render narrowings kept, snapshot from getState(), editingMetadata out of the handleSave deps; the "
            "new test files pass unchanged on 9d1c97e src and on A's src (behaviour-neutral proof); MS-1 (closure snapshot + editingMetadata "
            "back in the deps) is the planned equivalent; Biome 0 errors / 8 warnings same list",
            "real app (C, built app + xvfb): single save, batch save to 2 files, and typing during a 3000 ms delayed save (R21-5 step 1 "
            "replay) behave as on 9d1c97e; ffprobe + music-metadata show the saved values",
            "docs/bugs/001-*.md (Georgian) lists every routed known limit with severity, file:line valid on A's tree, reproduction, "
            "decision ID and an existing pinning test name (or 'no test' stated); README table row",
            "gate: verifyCommand green, renderer 201 (198 + 3), main 93, E2E 7/7, --retries=0 7/7",
        ],
    }
    b["items"].append(t26)
    items["TM-B26"] = t26

routing = {
    "RR-R21-01": "TM-B26 (round 23, D-32)",
    "RR-R13-02": "TM-B26 (round 23, D-32): the 6 MetadataPanel casts",
    "RR-R15-02": "TM-B26 (round 23, D-32): the 6 MetadataPanel casts",
    "A-R21-04": "TM-B26 (round 23): beforeEach mockReset + (i1)/(i2) pin",
    "RR-R21-02": "TM-B26 (round 23): docs/bugs record (known limit, pinned by (y4))",
    "A-R21-01": "TM-B26 (round 23): docs/bugs record (known limit); batch empty-field semantics stays a possible Saba UX question",
    "A-R21-02": "TM-B26 (round 23): docs/bugs record (same as RR-R21-02)",
    "A-R21-03": "TM-B26 (round 23): docs/bugs record (known limit)",
}
for fid, r in routing.items():
    findings[fid]["routed_to"] = r

new_findings = [
    {
        "round": 22, "id": "C-R22-01", "source": "C (c-round-22.md, mutant M7)", "severity": "low", "status": "open",
        "title": "Test gap: no unit test pins D-31 target behaviour #2 / deviation 1 (a Shift-click moves the anchor). Mutant M7 'if (!e.shiftKey) anchorPathRef.current = file.path;' survives 19/19; product behaviour is correct in the real app (r22-dev1-new.json)",
        "routed_to": "TM-B26 (round 23): (z12) a,b,cx,dx; click a, Shift cx, search 'x', Shift dx -> [cx, dx] (B R22 experiment: passes on 9d1c97e, M7 gives [dx])",
    },
    {
        "round": 22, "id": "RR-R22-01", "source": "root-review (gates/round-22/review.md)", "severity": "low", "status": "open",
        "title": "FileList.tsx:63-70 a Shift-click moves the anchor to the clicked row; Windows Explorer keeps it, so a second Shift-click re-extends from the original row. Not a regression",
        "routed_to": "= B-R21-02 (Saba question batch); recorded in the TM-B26 docs/bugs record",
    },
    {
        "round": 22, "id": "RR-R22-02", "source": "root-review", "severity": "low", "status": "open",
        "title": "FileList.tsx:66 + :112-114 Ctrl-deselecting the last selected row clears the anchor, so a later Shift-click selects one row; Explorer keeps it. Acceptable, but should be listed under D-31 in docs/",
        "routed_to": "TM-B26 (round 23): docs/bugs record (D-31 deviation 3)",
    },
    {
        "round": 22, "id": "RR-R22-03", "source": "root-review", "severity": "low", "status": "open",
        "title": "FileList.tsx:64 + file-store.ts:74 passing indices still depends on the component and the store sorting the list identically (implicit contract, correct today)",
        "routed_to": "signal; joins RR-R22-05",
    },
    {
        "round": 22, "id": "RR-R22-04", "source": "root-review", "severity": "low", "status": "open",
        "title": "File rows are clickable divs with no keyboard or ARIA selection support (pre-existing, not introduced by R22)",
        "routed_to": "signal; accessibility/keyboard selection is a UX feature that needs a reference study (Explorer/Mp3tag keyboard selection) and Saba's priority -> Saba question batch",
    },
    {
        "round": 22, "id": "RR-R22-05", "source": "root-review", "severity": "info", "status": "open",
        "title": "Architecture signal: selectRange(anchorPath, targetPath) in the store, resolving both indices inside getSortedFiles(state); anchor as store state selectionAnchorPath set by setSelectedPaths/toggleSelection and cleared by clearSelection/setFiles; removes the index contract and the hasSelection effect and makes the anchor testable without rendering",
        "routed_to": "signal (not a task); would also be the natural place for a Saba-approved Explorer anchor model (B-R21-02)",
    },
    {
        "round": 22, "id": "A-R22-01", "source": "A qa-engineer (a-round-22.md)", "severity": "low", "status": "open",
        "title": "Select All then Shift-click: with the anchor, nothing changes (range is added, deviation 2); without an anchor the selection collapses to one row",
        "routed_to": "= B-R21-02 (Saba); recorded in the TM-B26 docs/bugs record",
    },
    {
        "round": 22, "id": "A-R22-02", "source": "A qa-engineer (a-round-22.md)", "severity": "low", "status": "open",
        "title": "The anchor is cleared only on a non-empty -> empty transition after render; a clear + reselect in one batch would keep a stale anchor. No such code exists today",
        "routed_to": "signal; recorded in the TM-B26 docs/bugs record; RR-R22-05 would remove it",
    },
    {
        "round": 22, "id": "A-R22-03", "source": "A qa-engineer (a-round-22.md)", "severity": "info", "status": "open",
        "title": "FileList re-renders on empty <-> non-empty selection transitions; findIndex O(n) only on Shift-click; rows share the memoised files array",
        "routed_to": "record only (C R22 confirmed, root review: renders slightly less often overall)",
    },
]
for f in new_findings:
    add_finding(f)

add_note(findings["B-R21-02"], "R22: same deviations raised again by root (RR-R22-01) and A (A-R22-01); C R22-5 observed all three in the real app; still a Saba question")

r22 = rounds[22]
r22["status"] = "published"
r22["commit"] = COMMIT
for fid in ["C-R22-01", "RR-R22-01", "RR-R22-02", "RR-R22-03", "RR-R22-04", "RR-R22-05", "A-R22-01", "A-R22-02", "A-R22-03"]:
    if fid not in r22["findings"]:
        r22["findings"].append(fid)
r22["c_result"] = (
    "PASS, realVerified=true (R22-1..R22-5), 1 low test gap (C-R22-01); red 6 failed / 13 passed on 601dc4a ((z2)-(z5), (z11) symptom, "
    "(z8) new behaviour), green 19/19; M1-M6 killed, C's extra M7 survives -> C-R22-01; gate 198/93/7, --retries=0 7/7, Biome 8; real app: "
    "save then Shift-click selects a-c, Save to 3 files, ffprobe + music-metadata ICAT R22Range on a,b,c only; sort/search/Deselect All "
    "variants; red reference 601dc4a selects only c.wav; root review COMMIT OK"
)

if 23 not in rounds:
    r23 = {
        "round": 23,
        "task": "TM-B26 save/selection hygiene: (z12) pin for D-31 deviation 1, mock isolation in metadata-panel-batch-save.test.ts, MetadataPanel getState() snapshot + 6 casts removed (D-32), docs/bugs record of D-29/D-30/D-31 known limits",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B26"],
        "findings": ["C-R22-01", "A-R21-04", "RR-R21-01", "RR-R13-02", "RR-R15-02", "RR-R21-02", "A-R21-01", "A-R21-02", "A-R21-03", "RR-R22-02", "RR-R22-01", "A-R22-01", "A-R22-02", "B-R19-01", "RR-R20-01", "B-R21-02"],
    }
    b["rounds"].append(r23)

b["current_task"] = "Round 23: TM-B26 save/selection hygiene (C-R22-01 pin, mock isolation, D-32 MetadataPanel snapshot + casts, docs/bugs known limits)"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")

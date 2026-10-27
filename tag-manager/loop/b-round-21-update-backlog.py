import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "601dc4aad7e9416b8f3c690ba5ec68cccb98490d"

items = {i["id"]: i for i in b["items"]}
findings = {f["id"]: f for f in b["findings"]}
decisions = {d["id"]: d for d in b["decisions"]}


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


t = items["TM-B24"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
ev = (
    "C round 21 PASS (c-round-21.md/.json, realVerified=true, 0 bugs): R21-1 only the 3 owned paths M, no untracked file, no removed "
    "test/.claude line, nested describe (TM-B24, D-30) inside the TM-B23 describe, src has no comment/any/@ts-ignore/new as/new export "
    "(three module-private helpers), only type FieldValue added to the existing import line, STATE_MANAGEMENT.md exactly the D-30 line, "
    "diff sha256 = A's full.diff, permission_denials [], A transcript available: repo writes only via Edit; R21-2 b373b08 worktree + A tests "
    "-> 9 failed / 39 passed: (y1) 'A-title' to be 'TypedTitle', (y2) called 2 times but got 1, (y3) 'R20Cat' to be 'R21Again', (y5b) [] to "
    "deeply equal ['G2','G1'], (y6) [] to deeply equal ['R21Tag'], (y7) +0 to be 128, (y8) 'A-title' to be 'BackTyped', (y9) {} to deeply "
    "equal {title:'BatchTitle'}, (y10) 2 calls but got 1; pins (y4),(y5),(y11)-(y13), (a)-(w), (s6), (x1)-(x11) pass; A tree 48/48; "
    "R21-3 M1-M7 killed, M8 (no skipSyncRef when typed keys exist) survives as the planned equivalent, confirmed by run; R21-4 clean "
    "verifyCommand exit 0, Biome 0 errors / 9 warnings same list, typecheck 0, renderer 187/187 (173+14), main 93/93, E2E 7/7, "
    "--retries=0 7/7; R21-5 built app + xvfb + -r delay-write.cjs 3000 ms: Comment R21Typed typed 551 ms after Save (toast 3101 ms) is "
    "kept with Category R21A and Save enabled, second save keeps both; A->B->A + Title R21Back kept; batch b+c Copyright R21Copy kept, "
    "Category empty, Save to 2 files enabled; c R21C regression without typing ok; ffprobe + music-metadata: a comment R21Typed + ICAT "
    "R21A, b title R21Back + ICAT R21Batch + copyright R21Copy, c comment R21C + ICAT R21Batch + copyright R21Copy; red reference on a "
    "b373b08 build: Comment empty, Save disabled, a.wav has only ICAT R21A in both readers; pageErrors empty. Root gate round 21 published "
    "601dc4a, review COMMIT OK (lows RR-R21-01..03, architecture RR-R21-04)"
)
t.setdefault("evidence", [])
if ev not in t["evidence"]:
    t["evidence"].append(ev)
t["note"] = "B R21 close: done on C R21 evidence; published 601dc4a"

decisions["D-30"]["status"] = "done R21, published 601dc4a (TM-B24; C R21-1..R21-5)"

if "D-31" not in decisions:
    d31 = {
        "id": "D-31",
        "status": "decided B round 21 close (technical, reversible, renderer only); to be implemented R22 (TM-B25)",
        "decision": (
            "FileList keeps the Shift-click anchor as a file path, not as a row index. Every click (plain, Ctrl/Cmd, Shift) sets the "
            "anchor to the clicked row's path, as today. On Shift-click the anchor path is looked up in the list as it is rendered at "
            "that moment (sorted + filtered, the same order selectRange uses); if found, selectRange(anchorIndex, clickedIndex) runs "
            "unchanged (the range is still added to the existing selection, as today). If the anchor is null or not in the visible list "
            "(hidden by the search, gone after a rescan), the click behaves as today without an anchor: Ctrl/Cmd toggles, otherwise the "
            "clicked row alone is selected. The anchor survives metadata updates, D-28 Size/Date refreshes after a save, sort changes and "
            "search changes that keep it visible (it follows the item, not the row). The anchor is cleared when the selection becomes "
            "empty (open folder, rescan, close folder and Deselect All all clear the selection), so a stale anchor from an earlier scan "
            "never extends a range. No store change; selectRange, toggleSelection, setSelectedPaths, selectAll stay as they are. "
            "Reference: GTK listview 'Implement extending selections' (mail.gnome.org/archives/commits-list/2020-May/msg13894.html), "
            "which imitates Windows Explorer, tracks the base item with an item tracker, not a position. Deviations kept on purpose "
            "(B-R21-02, Saba question batch): Shift-click also moves the anchor (Explorer/GTK: only normal clicks set it) and the range is "
            "added to the selection (Explorer: Shift without Ctrl replaces it); clearing the anchor on an empty selection also drops it "
            "after Ctrl-deselecting the last selected row"
        ),
    }
    b["decisions"].append(d31)
    decisions["D-31"] = d31

if "TM-B25" not in items:
    t25 = {
        "id": "TM-B25",
        "type": "bug",
        "severity": "low",
        "source": "root review R19 (RR-R19-02); B experiment R21 close (b-round-21-exp/anchor-old-output.txt)",
        "title": (
            "Shift-click range selection loses its anchor after every save: FileList resets lastClickRef (a row index) whenever the "
            "rendered file list changes (FileList.tsx:105-109, deps files/searchQuery/sortField/sortDirection), and every save changes it "
            "(updateFileMetadata, D-28 updateFileStats). Click a, save, Shift-click c selects only c instead of a..c, so the next batch "
            "edit goes to one file instead of the intended range. Same after a sort or search change"
        ),
        "status": "in_progress",
        "round": 22,
        "depends_on": [],
        "decisions": ["D-31"],
        "findings": ["RR-R19-02"],
        "acceptance": [
            "R22: FileList component tests fail on 601dc4a (click a + updateFileStats for a, or + updateFileMetadata for a, then "
            "Shift-click c -> only c; sort direction toggled -> anchor lost; search that keeps the anchor visible -> anchor lost; Deselect "
            "All keeps a stale anchor) and pass after; pins (plain Shift range, anchor hidden by the search -> plain click, rescan -> "
            "plain click, Ctrl-click toggle, Shift-click without any earlier click -> plain click) pass on both",
            "mutations: anchor index instead of path; reset on every list change kept; anchor not cleared on empty selection; lookup in "
            "the unfiltered file list; Shift-click with a missing anchor uses index 0 -> each killed by a named test",
            "real app (C, built app + xvfb): click a.wav, save Category, Shift-click c.wav -> 3 files selected; batch save -> ffprobe + "
            "music-metadata show the batch value on a, b, c and not on d, e; sort and search variants; red reference on a 601dc4a build "
            "selects 1 file after the save",
            "gate: verifyCommand green, renderer 187 + new, main 93, E2E 7/7, --retries=0 7/7, Biome 0 errors and 8 warnings (the R21 list "
            "minus FileList.tsx useExhaustiveDependencies) or the same 9; no new rule/file in the list",
        ],
    }
    b["items"].append(t25)
    items["TM-B25"] = t25

findings["RR-R19-02"]["routed_to"] = "TM-B25 (round 22, D-31); B R21 close promoted it from signal to a bug after reproducing it in a FileList component test"

new_findings = [
    {
        "round": 21, "id": "RR-R21-01", "source": "root-review (gates/round-21/review.md)", "severity": "low", "status": "open",
        "title": "MetadataPanel.tsx:128 startEditingMetadata comes from the render closure, not useMetadataStore.getState(); the write uses the same closure value (:134, :158), so it is consistent today; one getState() read at save start for both would keep snapshot and payload from drifting apart",
        "routed_to": "signal; later MetadataPanel hygiene round with RR-R13-02/RR-R15-02. B experiment (b-round-21-exp/casts-snapshot.diff.txt): getState() snapshot + editingMetadata removed from the handleSave deps + the 6 MetadataPanel 'as WavMetadata'/'as Partial<WavMetadata>'/'as Record<string, WavMetadata>' casts removed -> tsc web/test 0, renderer 187/187, Biome 9 warnings once the deps array is written on one line as Biome formats it",
    },
    {
        "round": 21, "id": "RR-R21-02", "source": "root-review + A qa-engineer (A-R21-02)", "severity": "low", "status": "open",
        "title": "D-30: a field changed during the write and set back to its start-snapshot value is not 'typed'; the editor then shows the re-read, which differs from the typed value if the writer normalised it (trim, rounding) or did not write it. Pinned by (y4) on purpose",
        "routed_to": "signal; document in docs/bugs/ with TM-B23/TM-B24 in the MetadataPanel hygiene round",
    },
    {
        "round": 21, "id": "RR-R21-03", "source": "root-review", "severity": "low", "status": "open",
        "title": "No pin for typing during a batch save when the selection set changes (AB -> A + typing, no merge)",
        "routed_to": "record only: B R21 close reading of the test file: (x11) (metadata-panel-batch-save.test.ts:870-890) is exactly this case (batch all succeeded, A+B -> A, typing on A, edits and isDirty kept). A merge on the changed-set branch would merge the current values onto themselves there (no-op), so such a mutant is equivalent in that state; no new test planned",
    },
    {
        "round": 21, "id": "RR-R21-04", "source": "root-review", "severity": "info", "status": "open",
        "title": "Architecture signal: handleSave carries D-21, D-24, D-28, D-29, D-30 via skipSyncRef, flags and snapshots in a component callback; a pure post-save reconciliation function in the metadata store (start snapshot, current state, selectionUnchanged, re-read, write result -> next editingMetadata/modifiedFields/isDirty + skip-sync flag) would make each rule unit-testable and retire skipSyncRef",
        "routed_to": "signal (joins RR-R12-04, RR-R13-04, RR-R15-05, RR-R20-04); not a task",
    },
    {
        "round": 21, "id": "A-R21-01", "source": "A qa-engineer (a-round-21.md)", "severity": "low", "status": "open",
        "title": "A field that was not in the start snapshot, typed and erased during the save, is merged as ''/0 and keeps the form dirty; in batch the next Save writes '' to that field in every file. Same as typing and erasing without a pending save (pre-existing, not a D-30 regression)",
        "routed_to": "signal; batch empty-field semantics (Mp3tag '<keep>' style) is a UX question for the Saba batch if it ever matters",
    },
    {
        "round": 21, "id": "A-R21-02", "source": "A qa-engineer (a-round-21.md)", "severity": "info", "status": "open",
        "title": "Reverting a field to the snapshot value during the save loses the revert when the re-read differs (D-30 by design)",
        "routed_to": "same as RR-R21-02",
    },
    {
        "round": 21, "id": "A-R21-03", "source": "A qa-engineer (a-round-21.md)", "severity": "low", "status": "open",
        "title": "Schema change during a pending single save: the re-read made with the save-start fields overwrites the handleSchemaChanged result in the editor/store (pre-existing; D-30 does not make it worse)",
        "routed_to": "signal",
    },
    {
        "round": 21, "id": "A-R21-04", "source": "A code-reviewer (a-round-21.md)", "severity": "low", "status": "open",
        "title": "metadata-panel-batch-save.test.ts: once-mock queues can leak into the next test if a test fails before Save; a nested beforeEach with mockReset would isolate them",
        "routed_to": "signal; test hygiene in the MetadataPanel hygiene round",
    },
    {
        "round": 21, "id": "C-R21-01", "source": "C (c-round-21.md)", "severity": "info", "status": "open",
        "title": "R21-5 step 4: 'Unsaved changes were discarded' appears when clicking a.wav during b.wav's pending save although b's edits are written (unchanged)",
        "routed_to": "same as B-R19-01 / RR-R20-01 (Saba question batch)",
    },
    {
        "round": 21, "id": "C-R21-02", "source": "C (c-round-21.md)", "severity": "info", "status": "open",
        "title": "'Tags saved' toast covers the Save button for ~3 s (existing C-R15-01)",
        "routed_to": "same as C-R15-01",
    },
    {
        "round": 21, "id": "C-R21-03", "source": "C (c-round-21.md)", "severity": "info", "status": "open",
        "title": "C's first R21-5 run read music-metadata RIFF INFO without the 'exif:' namespace and reported false negatives; C fixed its helper and reran steps 1-7 on fresh files (C harness bug, not the app)",
        "routed_to": "record only; C reader helpers must read RIFF INFO from music-metadata under the 'exif:' namespace",
    },
    {
        "round": 21, "id": "B-R21-01", "source": "B (R21 close, code reading on 601dc4a)", "severity": "info", "status": "open",
        "title": "A-R20-01 is not reachable through today's UI: toggleSelection appends/removes, selectRange keeps the existing selection order and appends, and Select All only runs when not every visible file is selected (so the set differs); no action yields the same set in a new order. Inference from code, not C evidence",
        "routed_to": "A-R20-01 stays a signal",
    },
    {
        "round": 21, "id": "B-R21-02", "source": "B (R21 close, reference for D-31)", "severity": "low", "status": "open",
        "title": "Selection deviations from the Explorer/GTK reference kept by D-31: Shift-click moves the anchor (reference: only normal clicks set it); Shift-click without Ctrl adds the range to the existing selection (reference: replaces it); the anchor is dropped after Ctrl-deselecting the last selected row",
        "routed_to": "Saba question batch (UX change; reference-first study before any change)",
    },
    {
        "round": 21, "id": "B-R21-03", "source": "B experiment (b-round-21-exp)", "severity": "info", "status": "open",
        "title": "The 'as Record<string, WavMetadata>' casts in App.tsx:64 and FolderBrowser.tsx:112,148 are not redundant: readMetadataChunked (src/renderer/src/lib/utils.ts:49) returns Record<string, Record<string, unknown>>; removing them gives TS2345. Typing readMetadataChunked as Record<string, WavMetadata> would let them go",
        "routed_to": "signal; MetadataPanel hygiene round may include utils.ts if B plans it",
    },
]
for f in new_findings:
    add_finding(f)

add_note(findings["A-R20-01"], "R21 B re-check (B-R21-01): not reachable through today's UI; stays a signal")
add_note(findings["B-R19-01"], "R21: C saw it again in R21-5 step 4 (C-R21-01); still a Saba question")
for fid in ("RR-R13-02", "RR-R15-02"):
    add_note(findings[fid], "R21 B experiment: removing the 6 MetadataPanel casts typechecks (tsc web/test 0), renderer 187/187, Biome 9; App.tsx/FolderBrowser.tsx casts are not redundant (B-R21-03)")

for r in b["rounds"]:
    if r.get("round") == 21:
        r["status"] = "published"
        r["commit"] = COMMIT
        r["findings"] = ["RR-R20-02", "A-R20-01", "RR-R21-01", "RR-R21-02", "RR-R21-03", "RR-R21-04", "A-R21-01", "A-R21-02",
                         "A-R21-03", "A-R21-04", "C-R21-01", "C-R21-02", "C-R21-03", "B-R21-01"]
        r["c_result"] = (
            "PASS, realVerified=true (R21-1..R21-5), 0 bugs; red 9 failed / 39 passed on b373b08 ((y1)-(y3), (y5b), (y6)-(y10)), green "
            "48/48; M1-M7 killed, M8 equivalent as planned; gate 187/93/7, --retries=0 7/7, Biome 9 same list; real app with 3000 ms write "
            "delay keeps typed Comment/Title/Copyright, ffprobe + music-metadata show them after the follow-up save; red reference on "
            "b373b08 lost the typed Comment; root review COMMIT OK"
        )
if not any(r.get("round") == 22 for r in b["rounds"]):
    b["rounds"].append({
        "round": 22,
        "task": "TM-B25 Shift-click anchor survives saves, sort and search changes (D-31)",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B25"],
        "findings": ["RR-R19-02", "B-R21-02"],
    })

b["current_task"] = "Round 22: TM-B25 (D-31) Shift-click anchor kept as a path so it survives saves, sort and search changes"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")

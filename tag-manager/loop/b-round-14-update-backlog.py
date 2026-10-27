import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "a4ad85244cd7a80515c67f342cb0cae238cebc29"

items = {i["id"]: i for i in b["items"]}
findings = {f["id"]: f for f in b["findings"]}
decisions = {d["id"]: d for d in b["decisions"]}

t = items["TM-B17"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
t["evidence"].append(
    "C round 14 PASS (c-round-14.md/.json, realVerified=true, 0 bugs): R14-1 ownership only the 5 owned paths "
    "(4 M + new tests/main/create-fixtures.test.ts), TESTING.md hunk only in '## Fixture-ების გენერაცია', 002 @@ -23 +23 @@, "
    ".gitignore +1, permission_denials []; R14-2 a652f06 worktree + new test 13 failed | 1 passed ((a)/(b) on the .tmp assertion, "
    "(c) 11 x isCreateFixturesCliEntry is not a function, (d) passes), A tree 14/14; R14-3 M1 no cleanup killed (a,b), "
    "M2 rmSync(filePath) killed (a,b) on the .tmp assertion (rm on a directory without recursive throws, inner catch swallows), "
    "M3 \\.ts$ killed (c, 5 failed), M4 no rethrow killed (a,b 'expected function to throw'); R14-4 sha256 sample cbac699b..400c "
    "(88244 B) and corrupt 564867d8..217c identical on a652f06 and A's tree, fixed .mts and .cts copies create both files, "
    "old .mts copy creates nothing, EISDIR driver leaves no .tmp, import alone writes nothing, git check-ignore .gitignore:19; "
    "R14-5 clean verifyCommand exit 0, Biome 0 errors/9 warnings, typecheck 0, renderer 116/116, main 76/76 (62+14), E2E 7/7, "
    "--retries=0 7/7, no .tmp left; R14-6 real app (_electron + xvfb) on freshly generated sample.wav: Category R14Cat, "
    "Save Tags -> 'Tags saved', row Tagged, ffprobe + music-metadata ICAT=R14Cat; R14-7 docs match code. "
    "Root gate round 14 published a4ad852, review COMMIT OK (lows -> RR-R14-01..05)"
)
t["note"] = "B R14 close: done on C R14 evidence; published a4ad852"

for fid in ("RR-R1-04", "RR-R1-05", "C-R1-03"):
    findings[fid]["status"] = "closed"
    findings[fid]["closed_by"] = "TM-B17 (D-23), C round 14 PASS, published a4ad852"

d23 = decisions["D-23"]
d23["status"] = "done R14, published a4ad852 (TM-B17; C R14-1..R14-7)"

findings["RR-R13-03"]["status"] = "in_progress"
findings["RR-R13-03"]["routed_to"] = "TM-B18 round 15 (D-24)"

new_findings = [
    {
        "round": 14, "id": "RR-R14-01", "source": "root-review", "severity": "low", "status": "closed",
        "title": "tests/main/create-fixtures.test.ts:40 EISDIR test asserts only toThrow(); rename over a directory is EISDIR on Linux, EPERM on Windows, so the loose assertion is correct and must not be tightened",
        "routed_to": "accepted by design; also answers C R14 low note that (a) does not pin the code ((b) pins ENOSPC)",
        "closed_by": "B R14 close: no change needed",
    },
    {
        "round": 14, "id": "RR-R14-02", "source": "root-review", "severity": "low", "status": "open",
        "title": "create-fixtures.test.ts:52 ENOSPC write-failure test is skipped where /dev/full is missing (Windows/macOS); optional extra test that makes writeFileSync fail another way",
        "routed_to": "signal; optional test hygiene",
    },
    {
        "round": 14, "id": "RR-R14-03", "source": "root-review", "severity": "low", "status": "open",
        "title": "create-fixtures.ts:69 empty catch {} would trip Biome noEmptyBlockStatements once tests/ is linted; a small cleanup helper fits the no-comments rule",
        "routed_to": "TM-B06 (lint tests/, waits on Saba)",
    },
    {
        "round": 14, "id": "RR-R14-04", "source": "root-review + A code-reviewer", "severity": "low", "status": "open",
        "title": "docs/plans/002-recording-tag-contract.md still writes 'npx tsx', TESTING.md writes 'npx --yes tsx@4'; align on the next docs touch",
        "routed_to": "signal; next docs round touching 002",
    },
    {
        "round": 14, "id": "RR-R14-05", "source": "root-review", "severity": "info", "status": "open",
        "title": "Architecture signal: add tests/**/*.ts to Biome files.includes (relaxed override if needed) so semicolons, quote style and no-comments rules apply to tests",
        "routed_to": "signal on TM-B06 (waits on Saba)",
    },
    {
        "round": 14, "id": "C-R14-01", "source": "C", "severity": "low", "status": "open",
        "title": "TESTING.md fixtures section: the paragraph after the code block sits outside the list and bullets follow it; renders fine, structure slightly uneven",
        "routed_to": "signal; next docs touch of TESTING.md",
    },
    {
        "round": 14, "id": "B-R14-01", "source": "B (code read, MetadataPanel.tsx:73-80)", "severity": "low", "status": "in_progress",
        "title": "Single-file save has the same shape as RR-R13-03: writeMetadata resolves, readMetadata rejects -> outer catch shows the raw rejection text as if the save failed, although the file was written; main's meta:read catches per file, so a rejection is IPC-level only",
        "routed_to": "TM-B18 round 15 (D-24)",
    },
]
known = set(findings)
for f in new_findings:
    if f["id"] not in known:
        b["findings"].append(f)

if "TM-B18" not in items:
    b["items"].append({
        "id": "TM-B18",
        "type": "bug",
        "severity": "low",
        "source": "RR-R13-03, B-R14-01",
        "title": "Save whose write succeeded but whose re-read rejects (IPC-level) is reported as a failure: MetadataPanel handleSave has one try around write + re-read, so a rejected readMetadataBatch (batch) or readMetadata (single) shows only the raw rejection text, although the files were written",
        "status": "todo",
        "round": 15,
        "depends_on": [],
        "decisions": ["D-24"],
        "findings": ["RR-R13-03", "B-R14-01"],
        "acceptance": [
            "R15: renderer tests on the real MetadataPanel + real stores (only window.api mocked) fail on a4ad852 and pass after: batch all-succeeded + readMetadataBatch rejects -> toast 'Tags saved to 2 files, but reloading failed. Rescan to refresh.' (error), store entries deep-equal their seeds, edits kept (typed value, modifiedFields, isDirty, Save enabled); batch partial + reject -> '1 saved, 1 failed. Reloading failed. Rescan to refresh.' (error), same store/edit assertions; single + readMetadata rejects -> 'Tags saved, but reloading failed. Rescan to refresh.' (error), store entry unchanged, edits kept",
            "pins: existing tests (a)-(i) unchanged and passing; batch write rejection still shows the rejection text and does not call readMetadataBatch; re-read resolve paths (D-21, D-22) unchanged",
            "real app (C, _electron + xvfb, built app): with meta:read-batch (batch) / meta:read (single) replaced in the main process by a throwing handler via electronApp.evaluate (harness manipulation in C's phase, not a source change), Save in the UI -> exact D-24 toast, rows unchanged, form keeps the typed value; ffprobe + music-metadata show the written ICAT; after the original handler is restored (or the app relaunched) Rescan/scan shows the new value. Red reference on the a4ad852 build: toast is the raw 'Error invoking remote method' text",
            "docs: docs/learning/data-flow.md single + batch sections and STATE_MANAGEMENT.md Save flow state D-24",
            "gate: verifyCommand green, renderer 116 + new, main 76, E2E 7/7, --retries=0 7/7",
        ],
        "evidence": [
            "B round 14 code read (a4ad852): MetadataPanel.tsx handleSave has one try for write + re-read in both branches; main READ_METADATA / READ_METADATA_BATCH catch per file and return emptyMetadata, so a rejection reaches the renderer only from the IPC layer (handler missing/throwing, serialization). Outer catch -> showToast(err.message, 'error'); form stays dirty; store unchanged"
        ],
    })

if "D-24" not in decisions:
    b["decisions"].append({
        "id": "D-24",
        "status": "decided B round 14 close (technical, reversible, renderer only); to be implemented R15 (TM-B18)",
        "decision": "MetadataPanel handleSave: the write call keeps today's error handling (write rejection -> toast with its message, edits kept, no re-read in batch). The re-read (readMetadata single / readMetadataBatch batch) gets its own try. If the re-read rejects: no updateFileMetadata, skipSyncRef not set, setEditingMetadata not called (editingMetadata, modifiedFields and isDirty stay, Save stays enabled; a retry rewrites the same values, idempotent as RR-R12-02), and an error toast reports the write result: single 'Tags saved, but reloading failed. Rescan to refresh.'; batch failed empty 'Tags saved to N files, but reloading failed. Rescan to refresh.'; batch failed non-empty 'N saved, M failed. Reloading failed. Rescan to refresh.'. Reason: without a successful re-read the app does not know what is on disk; clearing the form would show stale store values as if nothing was saved. Known limit: a selection change after this still shows 'Unsaved changes were discarded'. Re-read resolve paths (D-21, D-22) unchanged. main, preload, stores unchanged. Pure fix: reference-first rule exempt",
        "contract_with": "none (renderer only; K-4 tag contract untouched)",
    })

for r in b["rounds"]:
    if r["round"] == 14:
        r["status"] = "published"
        r["commit"] = COMMIT
        r["c_result"] = "PASS, realVerified=true (R14-1..R14-7), 0 bugs; mutations M1-M4 killed; root review COMMIT OK (lows -> RR-R14-01..05)"
        for fid in ("RR-R14-01", "RR-R14-02", "RR-R14-03", "RR-R14-04", "RR-R14-05", "C-R14-01"):
            if fid not in r["findings"]:
                r["findings"].append(fid)

if not any(r["round"] == 15 for r in b["rounds"]):
    b["rounds"].append({
        "round": 15,
        "task": "TM-B18 save with a successful write but a rejected re-read reports the write result, keeps the store and the edits (D-24; RR-R13-03 batch, B-R14-01 single)",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B18"],
        "findings": ["RR-R13-03", "B-R14-01"],
    })

b["current_task"] = "round 15: TM-B18 (D-24) save whose write succeeded but whose re-read rejects: write-result toast, store untouched, edits kept (batch RR-R13-03 + single B-R14-01)"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=1)
    fh.write("\n")
print("ok", len(b["items"]), len(b["findings"]), len(b["decisions"]), len(b["rounds"]))

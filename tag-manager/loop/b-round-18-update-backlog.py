import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "d015470cc28335494de993d951e4a8036869919c"
BASE = "d015470cc28335494de993d951e4a8036869919c"

items = {i["id"]: i for i in b["items"]}
findings = {f["id"]: f for f in b["findings"]}
decisions = {d["id"]: d for d in b["decisions"]}

t = items["TM-B21"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
ev = (
    "C round 18 PASS (c-round-18.md/.json, realVerified=true, 0 bugs): R18-1 only the 3 owned paths M (150+/4-), removed test lines only the two "
    "extended import lines (fireEvent, WavMetadata), src = one private getFieldSortKey helper, no comment/any/@ts-ignore/as/export/file-row-display "
    "import, permission_denials [] (no full transcript, as C-R12-01); R18-2 4f8a578 worktree + A's tests -> 6 failed / 30 passed, all "
    "'aStr.localeCompare is not a function' ((a)x4, (b), (R18-e) at fireEvent.click), (c) 5 pins passed on old; A tree 36/36; R18-3 M1 (6), "
    "M2 (1: [true]), M3 (1: bpm vs missing; implemented as direct tie), M4 (1: (b)), M5 (6, by order assertions) all killed; R18-4 clean "
    "verifyCommand exit 0, Biome 0 errors / 9 warnings same list, typecheck 0, renderer 146/146 (135+11), main 93/93, E2E 7/7, --retries=0 7/7; "
    "R18-5 built app + xvfb: Artist asc b-untagged,c-abe,a-zed / desc reversed, Genre asc same, shift-click range = b-untagged+c-abe, other "
    "headers no page error, relaunch same; ffprobe genre + music-metadata common.genre + IGNR equal saved values; artists record only (ISTR, no "
    "IART: TM-B08). Malformed case covered only by R18-2/R18-3 (unreachable from the real app). Root gate round 18 published d015470, review "
    "COMMIT OK (lows -> RR-R18-01..04)"
)
t.setdefault("evidence", [])
if ev not in t["evidence"]:
    t["evidence"].append(ev)
t["note"] = "B R18 close: done on C R18 evidence; published d015470"

f = findings["A-R17-01"]
f["status"] = "closed"
f["closed_by"] = "TM-B21 (D-27), C round 18 PASS, published d015470"

decisions["D-27"]["status"] = "done R18, published d015470 (TM-B21; C R18-1..R18-5)"

a17 = findings["A-R17-02"]
note = "R18: A reports the hook did not fire again (a-round-18.md); C confirms only indirectly (c-round-18.md R18-1). Still routed to root"
if note not in a17.get("notes", []):
    a17.setdefault("notes", []).append(note)

new_findings = [
    {
        "round": 18, "id": "RR-R18-01", "source": "root-review", "severity": "low", "status": "open",
        "title": "file-store.ts getFieldSortKey: a malformed non-array value ({\"artists\":{}}) still sorts as '[object Object]' (no throw, unchanged by R18); fix would return '' for anything that is neither string nor number",
        "routed_to": "signal (joins A-R18-01, RR-R17-04)",
    },
    {
        "round": 18, "id": "RR-R18-02", "source": "root-review", "severity": "low", "status": "open",
        "title": "file-store.ts:129 number vs text/missing compares as text ('120' vs ''); unchanged and pinned by R18 (c) 'bpm vs missing'",
        "routed_to": "signal; product choice, no change planned",
    },
    {
        "round": 18, "id": "RR-R18-03", "source": "root-review", "severity": "low", "status": "open",
        "title": "R18 store tests read the sort order through selectRange (coupled to selection); a test-only reader or renderHook(useFilteredFiles) would be less fragile; R18-e covers the UI path",
        "routed_to": "signal; next touch of file-store.test.ts",
    },
    {
        "round": 18, "id": "RR-R18-04", "source": "root-review", "severity": "info", "status": "open",
        "title": "Architecture signal: TM-B20 and TM-B21 both guard non-string array elements; normalise metadata once at the IPC boundary or in setMetadata/updateFileMetadata (string[] for list fields) so renderer code can trust WavMetadata",
        "routed_to": "signal (joins RR-R17-04, RR-R6-05, RR-R5-06); not a task",
    },
    {
        "round": 18, "id": "A-R18-01", "source": "A (a-round-18.md), confirmed by C code reading", "severity": "low", "status": "open",
        "title": "A non-array malformed object whose toString is not callable throws in String(v) on the non-array sort path; same class of defensive fix, D-27 left the non-array path unchanged on purpose",
        "routed_to": "signal (with RR-R18-01, RR-R18-04)",
    },
    {
        "round": 18, "id": "A-R18-02", "source": "A (a-round-18.md), confirmed by C", "severity": "info", "status": "open",
        "title": "R18-3 M2 (String(value[0])) is killed only by [true] and depends on ICU collation ('true' between Abe and Zed); a neighbour like ['!'] or a direct key assertion would make the kill independent of collation",
        "routed_to": "signal; next touch of file-store.test.ts",
    },
    {
        "round": 18, "id": "C-R18-01", "source": "C (c-round-18.json note)", "severity": "info", "status": "open",
        "title": "R18-3 M3 was implemented as a direct tie (return 0 when exactly one side is a number) instead of via '' keys; same observable bpm-vs-missing tie, killed by the same test",
        "routed_to": "record only",
    },
]
known = set(findings)
for nf in new_findings:
    if nf["id"] not in known:
        b["findings"].append(nf)

c17 = findings["C-R17-01"]
c17["routed_to"] = "TM-B22 round 19 (D-28)"
c17["status"] = "in_progress"

t22 = items["TM-B22"]
t22["status"] = "in_progress"
t22["round"] = 19
t22["title"] = "File list Size and Date columns are stale after a save until rescan (WavFileEntry.size/modifiedAt come only from the folder scan)"
t22["decisions"] = ["D-28"]
t22["acceptance"] = [
    "R19: panel tests fail on d015470 (size/modifiedAt still the scan values after a confirmed save) and pass after; store action tests for updateFileStats (patch by path, no add/remove/reorder, selection and metadata untouched)",
    "refresh runs after a confirmed write and before the re-read (also on the D-24 re-read-rejects path); batch refreshes only paths not in result.failed and only when succeeded > 0; no refresh when the write rejects, all failed, or folderPath is null",
    "scanFolder rejection is silent: sizes unchanged, toasts, isDirty and edits exactly as today",
    "mutations: no refresh; refresh includes failed paths; refresh only on re-read success; setFiles(scanResult); size only (modifiedAt kept); unhandled scan rejection -> each killed by a named test",
    "real app (C, built app, xvfb): copies touched to 2020, single save and batch save -> Size cells equal formatFileSize(fs.stat size) and Date cells show the new mtime date for saved files only; Size sort follows new sizes; selection and editor unchanged; ffprobe + music-metadata for Category/Genre; relaunch shows the same sizes",
    "gate: verifyCommand green, renderer 146 + new, main 93, E2E 7/7, --retries=0 7/7",
]
probe = (
    "B round 18 probe (code reading on d015470): size/modifiedAt set only by fs:scan-folder (file-system.ts:56-57) via setFiles in App.tsx openFolder and "
    "FolderBrowser open/rescan; meta:write returns void, meta:write-batch {succeeded, failed}; preload index.ts/index.d.ts are protected, so a new stat channel "
    "or a changed return type cannot be typed in the renderer. Every file in the list sits under folderPath (dropped files open their parent dir, App.tsx:124-130), "
    "so window.api.scanFolder(folderPath) is the only renderer-reachable source; cost = one recursive scan per save (signal B-R18-01)"
)
if probe not in t22["evidence"]:
    t22["evidence"].append(probe)

if "D-28" not in decisions:
    b["decisions"].append({
        "id": "D-28",
        "status": "decided B round 18 close (technical, reversible, renderer only); to be implemented R19 (TM-B22)",
        "decision": (
            "After a confirmed write, MetadataPanel refreshes size and modifiedAt of the written files from window.api.scanFolder(folderPath) and applies them "
            "with a new file-store action updateFileStats(entries: WavFileEntry[]) that patches size and modifiedAt of existing entries by path only (no add, no "
            "remove, no reorder, name/path kept, selectedPaths and metadata untouched). Order: write resolves -> refresh (awaited) -> re-read -> existing logic, so "
            "the D-24 re-read-rejects path also refreshes. Single: refresh the one path. Batch: refresh paths not in result.failed, only when succeeded > 0. No "
            "refresh when the write rejects or folderPath is null. A scanFolder rejection is silent (columns keep the old values; toasts, isDirty, edits unchanged), "
            "because the save itself succeeded. Main, preload, types, FileList.tsx unchanged. Cost: one recursive scan per save; a dedicated stat channel needs a "
            "protected preload change (Saba question B-R18-01). Pure fix: reference-first rule exempt"
        ),
        "contract_with": "none (renderer file list columns only; K-4 tag contract untouched)",
    })

if not any(x["id"] == "B-R18-01" for x in b["findings"]):
    b["findings"].append({
        "round": 18, "id": "B-R18-01", "source": "B (TM-B22 probe)", "severity": "info", "status": "open",
        "title": "D-28 refreshes Size/Date with one full recursive scanFolder per save because preload is protected; a dedicated fs:stat-files channel (main + preload) would stat only the written paths. C records save timing on a ~200-file folder in R19 as an observation",
        "routed_to": "Saba question batch (preload change permission)",
    })

for r in b["rounds"]:
    if r["round"] == 18:
        r["status"] = "published"
        r["commit"] = COMMIT
        for fid in ("RR-R18-01", "RR-R18-02", "RR-R18-03", "RR-R18-04", "A-R18-01", "A-R18-02", "C-R18-01", "B-R18-01"):
            if fid not in r["findings"]:
                r["findings"].append(fid)
        r["c_result"] = (
            "PASS, realVerified=true (R18-1..R18-5), 0 bugs; red 6 failed on 4f8a578, green 36/36; mutations M1-M5 killed; gate 146/93/7; "
            "real app sort regression with ffprobe + music-metadata; root review COMMIT OK (lows -> RR-R18-01..04)"
        )
if not any(r["round"] == 19 for r in b["rounds"]):
    b["rounds"].append({
        "round": 19,
        "task": "TM-B22 Size and Date columns refresh after a confirmed save via scanFolder + file-store updateFileStats (C-R17-01) (D-28)",
        "status": "planned",
        "baseline": BASE + " (clean)",
        "items": ["TM-B22"],
        "findings": ["C-R17-01"],
    })

b["current_task"] = "Round 19: TM-B22 (D-28) Size/Date columns refresh after save"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")

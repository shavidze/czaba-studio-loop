import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "4f8a5780b338ecbdb10377e20764780cb267a4f3"

items = {i["id"]: i for i in b["items"]}
findings = {f["id"]: f for f in b["findings"]}
decisions = {d["id"]: d for d in b["decisions"]}

t = items["TM-B20"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
ev = (
    "C round 17 PASS (c-round-17.md/.json, realVerified=true, 0 bugs): R17-1 only the 3 owned paths (all M, +100/-2), test diffs additions only, "
    "src diff two typeof === 'string' guards, no comment/any/@ts-ignore/as-cast, signatures unchanged, permission_denials []; R17-2 cb2d76b worktree "
    "+ A's tests -> 12 failed / 31 passed ('reading trim', 'item.trim is not a function', typeof mismatch), already passing on old: (b) ['x',null], "
    "(d) [null], (d) ['A',null]; A tree 43/43; R17-3 M1 (8 failed), M2 (5 failed incl. React 'Objects are not valid as a React child'), M3 (10 failed), "
    "M4 (1 failed: (d) [{},'A']) all killed; R17-4 clean verifyCommand exit 0, Biome 0 errors / 9 warnings same list as cb2d76b, typecheck 0, "
    "renderer 135/135 (120+15), main 93/93, E2E 7/7, --retries=0 7/7; R17-5 built app + xvfb: untagged rows no badge, Artists 'R17 Artist A','R17 Artist B' "
    "+ Genres 'R17Genre' + Category 'R17Cat' via UI -> Tagged, artist cell 'R17 Artist A', genre 'R17Genre'; ffprobe ICAT 'R17Cat', genre 'R17Genre'; "
    "music-metadata ICAT 'R17Cat', common.genre ['R17Genre']; artists record only (ffprobe artist 'R17 Artist A' + ISTR 'R17 Artist B'; music-metadata "
    "common.artists from ID3 TPE1x2); relaunch same. Malformed-element case covered by R17-2/R17-3 only (unreachable from the real app). "
    "Root gate round 17 published 4f8a578, review COMMIT OK (lows -> RR-R17-01..04)"
)
t.setdefault("evidence", [])
if ev not in t["evidence"]:
    t["evidence"].append(ev)
t["note"] = "B R17 close: done on C R17 evidence; published 4f8a578"

closed_by = "TM-B20 (D-26), C round 17 PASS, published 4f8a578"
for fid in ("RR-R5-02", "B-R16-01"):
    findings[fid]["status"] = "closed"
    findings[fid]["closed_by"] = closed_by

d26 = decisions["D-26"]
d26["status"] = "done R17, published 4f8a578 (TM-B20; C R17-1..R17-5)"

new_findings = [
    {
        "round": 17, "id": "RR-R17-01", "source": "root-review", "severity": "low", "status": "open",
        "title": "tests/renderer/utils/file-row-display.test.ts:74-75 two separate 'import type ... from \"~/types\"' lines (A kept the old line byte-identical on purpose); merge on the next touch of that file",
        "routed_to": "signal; next touch of file-row-display.test.ts",
    },
    {
        "round": 17, "id": "RR-R17-02", "source": "root-review", "severity": "low", "status": "open",
        "title": "parseUntypedMetadata helper is defined in both file-list.test.ts and file-row-display.test.ts; could move to tests/renderer/helpers/",
        "routed_to": "signal; round 18 does not add a third copy (store test uses inline JSON.parse annotated, per rules from_round 16)",
    },
    {
        "round": 17, "id": "RR-R17-03", "source": "root-review", "severity": "low", "status": "open",
        "title": "formatFirstFieldValue(['', 'B']) returns '' while hasAnyTagValue is true: a row can show Tagged with an empty artist cell. Pre-existing and deliberate in D-26 (no search for a later string); product choice",
        "routed_to": "Saba question batch with D-15 / RR-R5-01 / RR-R5-06",
    },
    {
        "round": 17, "id": "RR-R17-04", "source": "root-review", "severity": "info", "status": "open",
        "title": "Architecture signal: nothing checks FieldValue array shape where data enters the renderer (TemplatePicker.tsx:21 value.join, file-store sort, form code); normalise once in the main read handler or a file-store setter (string elements only), keep per-function typeof checks as backup",
        "routed_to": "signal (joins RR-R6-05, RR-R5-06); not a task",
    },
    {
        "round": 17, "id": "A-R17-01", "source": "A qa-engineer, confirmed by C (code reading) and B experiment b-round-17-exp-sort.mts.txt", "severity": "low", "status": "in_progress",
        "title": "file-store.ts:125-127 getSortedFiles (artists/genres/any array field) uses aVal[0] ?? '' then aStr.localeCompare: a non-string first element ([5], [{}], [true]) throws 'aStr.localeCompare is not a function' inside useFilteredFiles' useMemo (FileList render) and in selectRange. Order-dependent: B probe on the real 4f8a578 module, 2 files, throws only when the malformed row is the comparator's receiver ([5] b.wav-first asc/desc THROW, a.wav-first no throw); [null] never throws (?? ''). Not reachable from the real app today (main maps elements to strings)",
        "routed_to": "TM-B21 round 18 (D-27)",
    },
    {
        "round": 17, "id": "A-R17-02", "source": "A (a-round-17.md), C disclosure", "severity": "low", "status": "open",
        "title": "Process: the read-primitives PreToolUse hook did not fire in A's R17 session; test Edits went through without it and the src file was written with a Bash heredoc, so TESTING/TYPESCRIPT_STRICT/AGENT_DISCOVERABLE_CODE were read only after editing. C found no rule violation in the diff. The user-level ~/.claude/hooks/inject-primitives.mjs may not be installed on the runner",
        "routed_to": "root (check the job's ~/.claude/settings.json hooks); round 18 task requires Edit/Write only for repository writes and primitives read before the first edit",
    },
    {
        "round": 17, "id": "C-R17-01", "source": "C (R17-5 observation)", "severity": "low", "status": "open",
        "title": "Size column keeps the pre-save size after a save (86.2 KB) until rescan/relaunch (87.6 KB): WavFileEntry.size is set only by the folder scan (FolderBrowser/App setFiles); the save path never refreshes it. Reachable in the real app",
        "routed_to": "TM-B22 (todo); B probe before scheduling: does meta:write/meta:read return size, or does a fix need a main/preload change",
    },
]
known = set(findings)
for f in new_findings:
    if f["id"] not in known:
        b["findings"].append(f)
findings = {f["id"]: f for f in b["findings"]}

if "TM-B21" not in items:
    b["items"].append({
        "id": "TM-B21",
        "type": "bug",
        "severity": "low",
        "source": "A-R17-01",
        "title": "File list sort by an array field (Artist, Genre, any tags field) throws 'aStr.localeCompare is not a function' when a row's first element is not a string ([5], [{}], [true]); the throw is in useFilteredFiles (FileList render) and selectRange. Defensive: not reachable from the real app today",
        "status": "todo",
        "round": 18,
        "depends_on": ["TM-B20"],
        "decisions": ["D-27"],
        "findings": ["A-R17-01"],
        "acceptance": [
            "R18: new store tests (selectRange, both directions, both insertion orders, 3 files with the malformed row in the middle) fail on 4f8a578 with 'localeCompare is not a function' for at least one combination and pass after; the malformed row sorts as '' (first asc, last desc)",
            "component test: FileList with sortField 'artists' and a malformed row renders without throwing, rows in the expected DOM order",
            "well-typed sort unchanged: string arrays by first element, numbers numeric, number vs missing as today",
            "mutations: revert to aVal[0] ?? ''; String(aVal[0] ?? ''); try/catch returning 0; first string element via find -> each killed by a named test",
            "real app regression (C, built app, xvfb): artists/genres set via UI on 3 copies, Artist and Genre headers sort asc/desc in the expected visible order, shift-click range follows the sorted order; relaunch same; ffprobe + music-metadata for genre",
            "gate: verifyCommand green, renderer 135 + new, main 93, E2E 7/7, --retries=0 7/7",
        ],
        "evidence": [
            "B round 17 experiment (b-round-17-exp-sort.mts.txt, output b-round-17-exp-sort-output.txt; tsx on the real 4f8a578 file-store module, selectRange(0,0)): [5], [{}], [true] throw 'aStr.localeCompare is not a function' when the malformed row is listed second (asc and desc), not when first; [null] and a non-array {} do not throw"
        ],
    })

if "TM-B22" not in items:
    b["items"].append({
        "id": "TM-B22",
        "type": "bug",
        "severity": "low",
        "source": "C-R17-01",
        "title": "File list Size column is stale after a save until rescan (WavFileEntry.size comes only from the folder scan)",
        "status": "todo",
        "depends_on": [],
        "decisions": [],
        "findings": ["C-R17-01"],
        "acceptance": ["to be written after a B probe: where the new size can come from (meta:write result, a stat, or a rescan of saved paths) and whether preload/main must change"],
        "evidence": ["C round 17 R17-5 observation: 86.2 KB after save, 87.6 KB after relaunch (c-round-17.md signals)"],
    })

if "D-27" not in decisions:
    b["decisions"].append({
        "id": "D-27",
        "status": "decided B round 17 close (technical, reversible, renderer sort only); to be implemented R18 (TM-B21)",
        "decision": "File list sort (file-store.ts getSortedFiles, default branch): for an array value the sort key is value[0] when it is a string, otherwise '' (same rule as D-26 formatFirstFieldValue; no String() coercion of the element, no search for a later string). Inline typeof check in the store; the store does not import file-row-display. Non-array values unchanged: both numbers -> numeric; otherwise String(value ?? '') with localeCompare. Ties keep Array.prototype.sort stability as today. Types, main, preload, FileList.tsx unchanged. Pure fix: reference-first rule exempt",
        "contract_with": "none (renderer sort only; K-4 tag contract untouched)",
    })

rule18 = {
    "from_round": 18,
    "rule": "Repository writes by A go through Edit/Write only (no Bash heredoc, cat >, tee, sed -i, cp into the repo), so the read-primitives hook can fire; if it does not fire, A reads the primitives the task names before the first edit and says so (A-R17-02).",
}
if not any(r.get("from_round") == 18 and "Edit/Write only" in r.get("rule", "") for r in b["rules"]):
    b["rules"].append(rule18)

for r in b["rounds"]:
    if r["round"] == 17:
        r["status"] = "published"
        r["commit"] = COMMIT
        r["c_result"] = "PASS, realVerified=true (R17-1..R17-5), 0 bugs; red 12 failed on cb2d76b, green 43/43; mutations M1-M4 killed; gate 135/93/7; real app regression with ffprobe + music-metadata; root review COMMIT OK (lows -> RR-R17-01..04)"
        for fid in ("RR-R17-01", "RR-R17-02", "RR-R17-03", "RR-R17-04", "A-R17-01", "A-R17-02", "C-R17-01"):
            if fid not in r["findings"]:
                r["findings"].append(fid)

if not any(r["round"] == 18 for r in b["rounds"]):
    b["rounds"].append({
        "round": 18,
        "task": "TM-B21 file list sort: non-string first array element sorts as '' and never throws (A-R17-01) (D-27)",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B21"],
        "findings": ["A-R17-01"],
    })

b["current_task"] = "round 18: TM-B21 (D-27) file list sort tolerates non-string first array elements (A-R17-01)"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")
print("ok", len(b["items"]), len(b["findings"]), len(b["decisions"]), len(b["rounds"]))

import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "59c26d6a3c6d4ca0b73e9fa78d822a5bac427d16"

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


t = items["TM-B26"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
ev = (
    "C round 23 PASS (c-round-23.md/.json, realVerified=true, bugs 0): R23-1 baseline bb4671d = root chore(release) v1.4.0 on 9d1c97e "
    "(3 version lines only); 4 M + 1 untracked docs/bugs/001; tests/ removals = the five beforeEach mockClear lines only; (z12) last it of "
    "the TM-B25 describe; (i1)/(i2) in a new describe at the end; src = D-32 only, grep -c ' as ' 8 -> 2; README +1 row; "
    "permission_denials [], A transcript available, repo writes by Edit/Write only, no git stash; R23-2 9d1c97e worktree + A tests 201/201 "
    "(10 files, D-32 behaviour-neutral, z12 a pin), A tree with the five lines back on mockClear -> 1 failed / 49 passed, (i2) 'promise "
    "rejected \"Error: leaked\" instead of resolving', A tree 201/201; R23-3 M7 killed by (z12) [ 'dx.wav' ], MI-1..MI-5 each killed by (i2), "
    "MS-1 planned equivalent survives 50/50; R23-4 clean verifyCommand exit 0, Biome 0 errors / 8 warnings same list as 9d1c97e, "
    "typecheck 0, renderer 201/201 (10), main 93/93, E2E 7/7, --retries=0 7/7; R23-5 built app + xvfb + 3000 ms write delay: a Category "
    "R23A + Comment R23Single saved, b+c Save to 2 files R23Batch, D-30 replay (Comment typed at 576 ms during the write kept, Save enabled, "
    "second save ok), schema editor add R23note -> form keeps a's values, b shows R23Batch, no Failed to read toast; ffprobe and "
    "music-metadata agree: a ICAT R23Delay comment R23Typed, b/c ICAT R23Batch; pageErrors []; R23-6 docs/bugs/001 Georgian, 8 entries, "
    "file:line checked on A's tree, pinning tests exist ((y4), (z8), (z10), (z12)), statuses 1-3/8 known limit, 4-7 Saba question. "
    "Root gate round 23 published 59c26d6 (on bb4671d), review COMMIT OK (lows RR-R23-01..03, architecture RR-R23-04)"
)
t.setdefault("evidence", [])
if ev not in t["evidence"]:
    t["evidence"].append(ev)
t["note"] = "B R23 close: done on C R23 evidence; published 59c26d6. RR-R23-01 ((i2) order-dependent) and A-R21-03 (fix) go to TM-B27 round 24"

decisions["D-32"]["status"] = "done R23, published 59c26d6 (TM-B26; C R23-1..R23-6, MS-1 planned equivalent survived)"

if "D-33" not in decisions:
    d33 = {
        "id": "D-33",
        "status": "decided B round 23 close (technical, reversible, renderer only); to be implemented R24 (TM-B27)",
        "decision": (
            "(1) MetadataPanel handleSave makes its post-save re-read (single readMetadata, batch readMetadataBatch) with the schema current "
            "at re-read time, useSchemaStore.getState().fields, not the schema captured when Save was clicked; the write itself keeps the "
            "click-time fields. A schema saved during a pending save therefore survives the save's re-read (fixes A-R21-03). "
            "(2) handleSchemaChanged keeps the current store entry of every path whose chunk read rejected instead of dropping it from "
            "the metadata map (same rule as D-22 for batch saves); the 'Failed to read N files' toast stays; a selected file whose read "
            "failed keeps its form values. D-21..D-32 unchanged. Not part of the K-4 contract (renderer display only)"
        ),
    }
    b["decisions"].append(d33)
    decisions["D-33"] = d33

if "TM-B27" not in items:
    t27 = {
        "id": "TM-B27",
        "type": "bug",
        "severity": "low",
        "source": "root review R23 (RR-R23-01), A R21 qa-engineer (A-R21-03), C R23 observation (C-R23-01), B R23 experiment (B-R23-01)",
        "title": (
            "MetadataPanel schema re-read: (a) the A-R21-04 mock-isolation pin (i2) checks nothing when run alone or shuffled (RR-R23-01); "
            "(b) a schema saved during a pending save is overwritten by the save's re-read made with the click-time fields: the new field "
            "is missing from the store entry and the form (A-R21-03); (c) handleSchemaChanged drops the store entry of every file whose "
            "chunk read rejected, so the list shows them untagged and the selected file's form empties (B-R23-01); handleSchemaChanged "
            "had no component test (C-R23-01)"
        ),
        "status": "in_progress",
        "round": 24,
        "depends_on": ["TM-B26"],
        "decisions": ["D-33"],
        "findings": ["RR-R23-01", "A-R21-03", "B-R23-01", "C-R23-01", "RR-R23-02", "B-R23-02", "B-R23-03"],
        "acceptance": [
            "R24: resetWindowApiMocks() module-private helper used by beforeEach; (i3) queues once-values on the five mocks, calls the helper, "
            "asserts the defaults; passes run alone (-t i3); each helper line on mockClear (MI-1..5) kills (i3) alone; beforeEach without the "
            "helper call kills existing tests",
            "new metadata-panel-schema-change.test.ts (s1)-(s5) driving the real SchemaEditor: (s3) (s4) (s5) red on 59c26d6, green after "
            "D-33; mutants MR-1 single re-read back to fields, MR-2 batch re-read back to fields, MF-1 failed chunk entries dropped, each killed",
            "real app (C, built app + xvfb + write delay): Title hidden, then re-enabled in the schema editor during a pending save -> after "
            "Tags saved the form shows the file's Title; red on a 59c26d6 build; injected meta:read-batch rejection after a schema save keeps "
            "the form and list values; ffprobe + music-metadata",
            "docs/bugs/001: entry 3 marked fixed by D-33 with its tests, every file:line re-pointed on A's tree, new entries 9 (B-R23-02) "
            "and 10 (B-R23-03); STATE_MANAGEMENT.md one D-33 line",
            "gate: verifyCommand green, renderer 205 (201 - 2 + 1 + 5, 11 files), main 93, E2E 7/7, --retries=0 7/7, Biome 8 warnings",
        ],
    }
    b["items"].append(t27)
    items["TM-B27"] = t27

routing = {
    "A-R21-03": "TM-B26 (round 23): docs/bugs entry 3 (known limit); B R23: fixable without a product choice -> TM-B27 (round 24, D-33 part 1)",
}
for fid, r in routing.items():
    findings[fid]["routed_to"] = r

new_findings = [
    {
        "round": 23, "id": "RR-R23-01", "source": "root-review (gates/round-23/review.md)", "severity": "low", "status": "open",
        "title": "metadata-panel-batch-save.test.ts:1140-1156 (i2) only proves isolation if (i1) runs right before it; run alone (-t i2) or shuffled it passes without checking anything",
        "routed_to": "TM-B27 (round 24): module-private resetWindowApiMocks() used by beforeEach and one self-contained (i3) (queue -> reset -> defaults); the reviewer's 'docs comment' alternative is not used (no-comments rule). B R23 experiment: (i3) passes alone, MI-all kills it alone, beforeEach without the helper kills 24 tests",
    },
    {
        "round": 23, "id": "RR-R23-02", "source": "root-review", "severity": "low", "status": "open",
        "title": "docs/bugs/001 hard-codes line numbers (FileList.tsx:70, :112-114, MetadataPanel.tsx:43, :149, ...); accurate at 59c26d6 but stale after the next edit",
        "routed_to": "TM-B27 (round 24) re-points every MetadataPanel.tsx reference after the D-33 edit (C re-greps); signal: the next edit of FileList/MetadataPanel must update docs/bugs/001 in the same round",
    },
    {
        "round": 23, "id": "RR-R23-03", "source": "root-review", "severity": "low", "status": "open",
        "title": "(z12) pins the anchor-moves behaviour (D-31 deviation 1), which is still a Saba question; an Explorer-style answer inverts it on purpose (docs entry 5 references it)",
        "routed_to": "record only (= B-R21-02, Saba question batch)",
    },
    {
        "round": 23, "id": "RR-R23-04", "source": "root-review", "severity": "info", "status": "open",
        "title": "Architecture signal: handleSave (~75 lines, two branches, snapshot/selection guards, skipSyncRef) could move into a store action or a useSaveMetadata hook returning { selectionUnchanged, typedDuringSave }, testable without rendering MetadataPanel; re-reading fields from useSchemaStore.getState() at re-read time would fix docs entry 3 in one place",
        "routed_to": "signal (joins RR-R12-04, RR-R13-04, RR-R15-05, RR-R20-04, RR-R21-04); the entry-3 part is taken as D-33 part 1 in TM-B27 without the hook move",
    },
    {
        "round": 23, "id": "A-R23-01", "source": "A qa-engineer + code-reviewer (a-round-23.md)", "severity": "info", "status": "open",
        "title": "handleSave takes selectedFiles and fields from the render closure while startSelection and the snapshot come from getState(); they cannot differ at click time today",
        "routed_to": "signal; D-33 moves only the re-read schema to getState() (behaviour fix); the write's click-time fields and selectedFiles stay closure values",
    },
    {
        "round": 23, "id": "A-R23-02", "source": "A code-reviewer (a-round-23.md)", "severity": "info", "status": "open",
        "title": "(i1) name says 'every window.api mock' but covers 5 of 16 mocks",
        "routed_to": "TM-B27 (round 24): (i1)/(i2) are replaced by (i3), named for the five mocks",
    },
    {
        "round": 23, "id": "C-R23-01", "source": "C (c-round-23.md observations)", "severity": "info", "status": "open",
        "title": "handleSchemaChanged still has no component test; the real app (R23-5 step 4) shows it works",
        "routed_to": "TM-B27 (round 24): metadata-panel-schema-change.test.ts (s1)-(s5)",
    },
    {
        "round": 23, "id": "B-R23-01", "source": "B R23 experiment (b-round-23-exp, (s3) on 59c26d6)", "severity": "low", "status": "open",
        "title": "handleSchemaChanged: a rejected chunk read drops those files from the metadata map (setMetadata(accumulated) without them); the list shows them untagged and the sync effect empties the selected file's form (Category '' instead of ACat) until a rescan. Files on disk are unchanged",
        "routed_to": "TM-B27 (round 24, D-33 part 2): keep the current store entry of failed-chunk paths (D-22 analogue)",
    },
    {
        "round": 23, "id": "B-R23-02", "source": "B R23 code reading (MetadataPanel.tsx:201-228 vs :138/:169)", "severity": "low", "status": "open",
        "title": "Reverse order of A-R21-03: a schema re-read that started before a pending write finished and resolves after the save's re-read writes the pre-write values into the store and the form (isDirty false) until the next read; the file on disk is correct. D-33 does not cover this order",
        "routed_to": "TM-B27 (round 24): docs/bugs/001 entry 9 (known limit, no test); a real fix needs a read token/sequence or locking the schema editor during a save (UX -> Saba)",
    },
    {
        "round": 23, "id": "B-R23-03", "source": "B R23 code reading (MetadataPanel.tsx:218-224, metadata-store setEditingMetadata)", "severity": "low", "status": "open",
        "title": "Saving the schema (Done) while the form has unsaved edits silently replaces them: handleSchemaChanged calls setEditingMetadata(re-read | {}), which clears modifiedFields and isDirty, and no 'Unsaved changes were discarded' toast is shown (the selection-change path does show it)",
        "routed_to": "Saba question batch (warn like the selection path, keep typed values on top of the re-read like D-30, or block Customize Fields while dirty); TM-B27 records it as docs/bugs/001 entry 10",
    },
]
for f in new_findings:
    add_finding(f)

r23 = rounds[23]
r23["status"] = "published"
r23["commit"] = COMMIT
for fid in ["RR-R23-01", "RR-R23-02", "RR-R23-03", "RR-R23-04", "A-R23-01", "A-R23-02", "C-R23-01", "B-R23-01", "B-R23-02", "B-R23-03"]:
    if fid not in r23["findings"]:
        r23["findings"].append(fid)
r23["c_result"] = (
    "PASS, realVerified=true (R23-1..R23-6), bugs 0; baseline bb4671d (root release commit on 9d1c97e); old src + new tests 201/201 "
    "(behaviour-neutral), (i2) red on mockClear 1/49, A tree 201/201; M7 + MI-1..5 killed, MS-1 equivalent survives; gate 201/93/7, "
    "--retries=0 7/7, Biome 8; real app single/batch/D-30 delay replay/schema add, ffprobe + music-metadata agree; docs 8 entries; "
    "root review COMMIT OK"
)

if 24 not in rounds:
    r24 = {
        "round": 24,
        "task": "TM-B27 MetadataPanel schema re-read (D-33): self-contained mock-isolation test (RR-R23-01), save re-read with the current schema (A-R21-03), failed schema re-read keeps store entries (B-R23-01), handleSchemaChanged component tests, docs/bugs/001 update",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B27"],
        "findings": ["RR-R23-01", "A-R23-02", "A-R21-03", "B-R23-01", "C-R23-01", "RR-R23-02", "B-R23-02", "B-R23-03"],
    }
    b["rounds"].append(r24)

b["current_task"] = "Round 24: TM-B27 MetadataPanel schema re-read (D-33): (i3) mock isolation, save re-read with current schema, failed schema re-read keeps entries, schema-change component tests, docs/bugs/001 update"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")

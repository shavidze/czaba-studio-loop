import json

PATH = "/home/runner/czaba-project/tmp/tag-manager-loop/backlog.json"
COMMIT = "cf4e147d2516a549b4a8c6ae7eebbf65c51a6e42"

with open(PATH, encoding="utf-8") as fh:
    b = json.load(fh)


def find(seq, ident):
    for entry in seq:
        if entry.get("id") == ident:
            return entry
    raise KeyError(ident)


b["current_task"] = "Round 43: TM-B44 (Saba Q8, D-48) narrow fs:stat-files IPC replaces the per-save recursive scanFolder in the D-28 stats refresh; baseline cf4e147"

dup = find(b["items"], "TM-T1-DUP")
dup["status"] = "done"
dup["realVerified"] = True
dup["evidence"].append(
    "C round 42 PASS R42-1..R42-7, realVerified=true (c-round-42.md/.json): red 7 failed/4 passed on a5c6a6b src -> green 11/11; real app (Playwright _electron, planted schema.json) case (a) custom category/CATE and (b) custom ucs_cat/ICAT: no + Category (UCS) chip, exact warning, computed color rgb(245, 158, 11), pageErrors []; save DOORWood -> (a) CATE only, no ICAT in raw INFO, music-metadata and ffprobe; (b) exactly one ICAT; Trash2 brings the chip back; R42-5 D-07 regression 13 keys + ICAT=DOORWood after relaunch; verify EXIT=0 renderer 317 main 93 E2E 7/7 (--retries=0 7/7). Published " + COMMIT + " (root review COMMIT OK)"
)
dup["closed_round"] = 42

for f in b["findings"]:
    if f.get("id") == "RR-R3-01":
        f["status"] = "closed"
        f["closed_by"] = "TM-T1-DUP round 42 (D-47), C PASS R42-1..R42-7, published " + COMMIT

d47 = find(b["decisions"], "D-47")
d47["status"] = "verified (C R42 PASS R42-1..R42-7, realVerified=true), published " + COMMIT + " (TM-T1-DUP); behaviour = Saba Q2; generalisation to all 13 standard fields is B's choice, still awaiting Saba confirmation (Q19); contract: single ICAT writer (K-4)"

b["decisions"].append({
    "id": "D-48",
    "status": "planned (round 43, TM-B44); preload change permitted by Saba Q8 2026-10-28 (only the fs:stat-files channel); pure fix, reference-first exempt",
    "decision": "D-28's stats refresh after a confirmed save reads size and modifiedAt of the written paths only, through a new IPC channel fs:stat-files (IPC_CHANNELS.STAT_FILES, window.api.statFiles(paths): Promise<WavFileEntry[]>), instead of a full recursive scanFolder(folderPath). Main handler: input must be an array of at most 50 non-empty strings, otherwise Error('Invalid paths'); each path is stat-ed; a regular file with extension .wav (case-insensitive) yields { name: basename(path), path (the input string unchanged), size, modifiedAt: mtime ISO }; any other path (missing, directory, non-wav, stat error) is omitted; output keeps input order. Renderer: refreshSavedFileStats sends the written paths in chunks of 50, sequentially, awaits every chunk before the re-read, applies each resolved chunk with updateFileStats, and skips a rejected chunk silently (the other chunks still apply). Every other D-28 rule stays: no refresh when the write rejects, when a batch has 0 succeeded, or when folderPath is null; order write -> refresh -> re-read; toasts, isDirty and edits unchanged. scanFolder itself is unchanged and is still used by Open Folder, Rescan and drop.",
    "contract_with": "none (renderer file list columns only; K-4 tag contract untouched)"
})

b["items"].append({
    "id": "TM-B44",
    "type": "bug",
    "severity": "medium",
    "source": "RR-R19-01, B-R18-01",
    "title": "Every save awaits a full recursive scanFolder of the open folder (D-28 stats refresh) while isSaving is true; slow on 1000+ files or a network drive. Fix: narrow fs:stat-files IPC (main + preload, Saba Q8) that stats only the written paths (D-48)",
    "status": "in_progress",
    "depends_on": ["TM-B22"],
    "decisions": ["D-28", "D-48"],
    "acceptance": [
        "round 43 R43-1..R43-8: preload diff is exactly the one statFiles member + one ElectronAPI line (Saba Q8); main handler tests; renderer D-28 tests flipped to statFiles red on cf4e147 src; real app: Size/Date update after single and batch save with independent readers confirming the tag, save time on a large nested folder drops versus the cf4e147 build; verify gate green"
    ],
    "evidence": [
        "Root review R19 RR-R19-01 (medium); B R18 B-R18-01; C R19 observation 169 ms click->toast on 200 files",
        "Saba answers 2026-10-28 (policy.local.md) Q8: permission to change src/preload/index.ts and index.d.ts ONLY to add the narrow fs:stat-files channel"
    ],
    "user_decision": "Saba Q8 2026-10-28"
})

for f in b["findings"]:
    if f.get("id") in ("RR-R19-01", "B-R18-01"):
        f["status"] = "in_progress"
        f["routed_to"] = "TM-B44 round 43 (D-48, Saba Q8)"

deduped = []
seen_b4202 = False
for f in b["findings"]:
    if f.get("id") == "B-R42-02":
        if seen_b4202:
            continue
        seen_b4202 = True
        f.setdefault("notes", []).append("C R42-4 (round 42): the empty Keywords field is still written as IKEY size 0 on every editor save; expected until TM-B11 / D-10 (Saba Q4)")
    deduped.append(f)
b["findings"] = deduped

b4201 = find(b["findings"], "B-R42-01")
b4201.setdefault("notes", []).append(
    "C R42-6 observation (c-round-42.md): schema = 12 standard + standard category/ICAT + custom category/CATE. Panel shows two inputs (Category (UCS), Category) bound to the same key; typing in one fills both. Save writes ICAT=DOORWood AND CATE=DOORWood (raw INFO, music-metadata, ffprobe). Active Fields lists both rows, no warning (Deviation 3). No duplicate-key console error in the production build; pageErrors []. Hide (X) on the standard Category calls removeField(key) and removes BOTH fields: after Done schema.json has the 12 standard keys only, the custom category/CATE definition is lost (config loss, WAV data untouched). Input for Q18"
)
b4201["routed_to"] = "Saba question Q18 (now with the R42-6 fact that Hide removes the custom field definition too)"

new_findings = [
    {
        "round": 42, "id": "C-R42-01", "source": "C (c-round-42.json)", "severity": "low", "status": "in_progress",
        "title": "B's Mp3tag reference R1 (round 42 task, docs/bugs/001 entry 23 **Reference:**) is not supported by the cited sources: the community thread only says custom fields become TXXX frames; docs.mp3tag.de/mapping says mappings can be changed and does not address a custom field named like a standard frame. Entry 23 states it as a fact",
        "routed_to": "round 43 docs touch: entry 23 Reference rewritten to what the sources say, the 'one slot per name' sentence marked as B's unconfirmed inference"
    },
    {
        "round": 42, "id": "RR-R42-01", "source": "root-review (gates/round-42/review.md low 1)", "severity": "low", "status": "open",
        "title": "findStandardFieldConflict compares riffChunkId case-sensitively (SchemaEditor.tsx:38); a hand-edited custom riffChunkId 'icat' does not block + Category (UCS). B check (metadata.ts:179-197): the writer passes the ID unchanged to setValuesFromStrings, so 'icat' is written as its own lowercase chunk, not as a second ICAT writer. The form uppercases IDs, so only a hand-edited schema.json reaches it",
        "routed_to": "signal for Q13 (schema validation / ID normalisation at load) and the shared slot rule RR-R42-04"
    },
    {
        "round": 42, "id": "RR-R42-02", "source": "root-review (gates/round-42/review.md low 2)", "severity": "low", "status": "open",
        "title": "D-47 warning is a plain <p> with no link to the chip it replaces; screen-reader users find it by reading the list (message names the field, acceptable). Option: role=note or a list",
        "routed_to": "record (UX/a11y, with Q9-Q17)"
    },
    {
        "round": 42, "id": "RR-R42-03", "source": "root-review (gates/round-42/review.md low 3)", "severity": "low", "status": "open",
        "title": "D-47 applies the block to all 13 standard fields, not only Category; B's generalisation awaits Saba's confirmation",
        "routed_to": "Saba question Q19 (confirm the generalisation; reversible)"
    },
    {
        "round": 42, "id": "RR-R42-04", "source": "root-review (gates/round-42/review.md architecture note)", "severity": "info", "status": "open",
        "title": "Architecture signal: handleAddCustomField (standard-key / reserved-ID rejection) and findStandardFieldConflict encode one rule (one key or RIFF ID belongs to one field); a single schema-store function, e.g. findFieldSlotConflict(candidate, fields) with case-normalised IDs, could serve the form, the chip toggle and a future load-time repair (B-R42-01 / Q18)",
        "routed_to": "signal (not a task)"
    },
    {
        "round": 42, "id": "A-R42-01", "source": "A (a-round-42.md known gaps)", "severity": "info", "status": "open",
        "title": "A hand-edited schema.json whose standard field lacks the standard flag is treated as custom, so its own standard twin shows a warning (e.g. 'Title is unavailable: custom field \"Title\" already uses key \"title\".'); before D-47 the chip would have created a duplicate",
        "routed_to": "signal for Q13 (schema validation at load)"
    },
    {
        "round": 42, "id": "A-R42-02", "source": "A (a-round-42.md known gaps)", "severity": "info", "status": "open",
        "title": "T-e tests the enable-branch guard by mocking useSchemaStore.getState once (stale click); from the UI the path is reachable only through a race",
        "routed_to": "record"
    },
]
b["findings"].extend(new_findings)

for r in b["rounds"]:
    if r.get("round") == 42 and r.get("status") == "blocked":
        r["status"] = "superseded"
        r["superseded_by"] = "round 42 TM-T1-DUP after Saba's answers (tasks/round-42-blocked-superseded.md)"

b["rounds"].append({
    "round": 42,
    "task": "TM-T1-DUP (Saba Q2, D-47): hide a standard field toggle whose key or RIFF ID is used by a custom field, show a warning, handler guard; docs D-47 + 001 entry 23",
    "status": "published",
    "baseline": "a5c6a6bd74488a99675d251275e850a684d55ce0 (clean)",
    "items": ["TM-T1-DUP"],
    "findings": ["RR-R3-01"],
    "commit": COMMIT,
    "result": "C PASS R42-1..R42-7, realVerified=true; C-R42-01 low (B's reference text); review COMMIT OK (low RR-R42-01..03, info RR-R42-04); A info A-R42-01, A-R42-02; R42-6 observation feeds Q18"
})
b["rounds"].append({
    "round": 43,
    "task": "TM-B44 (Saba Q8, D-48): fs:stat-files IPC replaces the per-save scanFolder in the D-28 stats refresh; C-R42-01 docs correction in 001 entry 23",
    "status": "planned",
    "baseline": COMMIT + " (clean)",
    "items": ["TM-B44"],
    "findings": ["RR-R19-01", "B-R18-01", "C-R42-01"]
})

with open(PATH, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")
print("ok")

import json

PATH = "/home/runner/czaba-project/tmp/tag-manager-loop/backlog.json"
COMMIT = "1ea34df5215a87f386a07f9808b969a834b144d2"

with open(PATH, encoding="utf-8") as fh:
    b = json.load(fh)


def find(seq, ident):
    for entry in seq:
        if entry.get("id") == ident:
            return entry
    raise KeyError(ident)


def has(seq, ident):
    return any(entry.get("id") == ident for entry in seq)


b["current_task"] = (
    "Round 47: TM-B05 (Saba Q5, D-51) - meta:write / meta:write-batch on a WAV the library rejects with "
    "'WAV file is missing data chunk' fail with the per-file error 'Audio data is empty, cannot tag'; read unchanged (Q22); baseline 1ea34df clean"
)

b11 = find(b["items"], "TM-B11")
b11["status"] = "done"
b11["realVerified"] = True
b11["closed_round"] = 46
ev = (
    "C round 46 PASS R46-1..R46-8, realVerified=true (c-round-46.md/.json): red on c822d7f src main 9 failed/13 passed "
    "((n1),(n2),(n3),(n5 'abc'),(n6)x2,(n7),(n8),(n9)), renderer 6 failed ((r1),(r2),(r4), 3 file-row-display cases); (r3) green on baseline "
    "(old 0 came from main read; red side covered by (n2)); mutants M1, M1b, M2, M3, M4, M5 all killed; verify EXIT=0 renderer 326/326 main 120/120 "
    "E2E 7/7 (--retries=0 7/7); real app (Playwright _electron, xvfb, custom Number Take/TAKE): R46-4 Title-only save on a fresh WAV writes no TAKE "
    "in raw INFO, ffprobe and music-metadata (c822d7f build contrast writes TAKE='0'); R46-5 typed 0 -> raw TAKE size 1 '0' in all three readers, "
    "input shows 0 after reselect, row Tagged; R46-6 single clear and 2-file batch clear remove TAKE, own ICAT kept, unselected files sha256 identical, "
    "pageErrors []; R46-7 Year 2024 written/removed, Year 0 writes nothing (Deviation 1, FYI). Root review COMMIT OK (4 low, 1 architecture note). "
    "Published " + COMMIT
)
if ev not in b11["evidence"]:
    b11["evidence"].append(ev)
b11["stages"][1]["status"] = "verified (C R46 PASS, realVerified=true), published " + COMMIT[:7]

d50 = find(b["decisions"], "D-50")
d50["status"] = "verified (C R46 PASS R46-1..R46-8, realVerified=true), published " + COMMIT + " (TM-B11 stage 2, Saba Q4)"
d50.setdefault("notes", []).append(
    "R46 as built (A F1, accepted by C): the number Input value is the finite number itself (value={v}), not String(v), because a controlled "
    "String value makes React rewrite partial input such as '1.0' -> '1' (typing 1.05 became 15); C real app: 1.05 kept and written TAKE=1.05. "
    "(r5) pins it. Partial input '-' / '1e' reports '' from the DOM and sets the field unset while typing (RR-R46-03)."
)

d15 = find(b["decisions"], "D-15")
d15["status"] = d15["status"].replace("number rule amended by D-50 (planned round 46)", "number rule amended by D-50 (verified C R46, published " + COMMIT[:7] + ")")
d15.setdefault("notes", []).append(
    "R46 closed: any finite number (0 and negatives) counts as tagged; unset '' is empty. C R46-5 real app: typed Take 0 -> row Tagged. Verified, published " + COMMIT[:7]
)

for fid, closing in (
    ("C-R6-01", "TM-B11 stage 2 round 46 (D-50), C PASS R46-4 (Title-only save writes no custom number; c822d7f build contrast writes '0'), published " + COMMIT[:7]),
    ("RR-R5-03", "TM-B11 stage 2 round 46 (D-50 / D-15 amended), C PASS R46-5 (typed 0 -> Tagged), published " + COMMIT[:7]),
):
    f = find(b["findings"], fid)
    f["status"] = "closed"
    f["closed_by"] = closing

new_findings = [
    {"round": 46, "id": "RR-R46-01", "source": "root-review", "severity": "low", "status": "open",
     "title": "Typing 0 into standard Year / Track # / BPM: the library removes the item on save and the field turns blank after 'Tags saved' with no hint (D-50 Deviation 1, documented in the contract)",
     "routed_to": "Saba question Q24 (UX: min=1 on the three inputs or a hint; reference-first needed before any change); not scheduled"},
    {"round": 46, "id": "RR-R46-02", "source": "root-review", "severity": "low", "status": "open",
     "title": "Sort by a number column now compares unset '' with numbers via localeCompare; root checked the order holds ('' first, numbers numeric) but no test sorts mixed '' and numbers",
     "routed_to": "signal (store test gap, with RR-R18-02)"},
    {"round": 46, "id": "RR-R46-03", "source": "root-review + A code-reviewer FYI", "severity": "info", "status": "open",
     "title": "type=number inputs report '' for partial input ('-', '1e', '1.'), so the field is unset while the user is still typing; consistent (before D-50 it became 0)",
     "routed_to": "signal, no change"},
    {"round": 46, "id": "RR-R46-04", "source": "root-review", "severity": "info", "status": "open",
     "title": "Files that older builds wrote with ITKN='0' now show Take 0 and Tagged; documented in the contract, no migration (D-50 Deviation 3)",
     "routed_to": "record (so it does not come back as a bug report)"},
    {"round": 46, "id": "RR-R46-05", "source": "root-review", "severity": "low", "status": "open",
     "title": "Architecture signal: number meaning lives in three places (main normalizeFieldValueForWrite/parseRiffNumberValue, panel input, TemplatePicker parseInt); the template edit dialog parseInt truncates 1.5 -> 1 while the panel keeps 1.05; a shared toNumberFieldValue(raw): number | '' in src/shared and a NumberFieldValue type would stop the drift",
     "routed_to": "signal (the TemplatePicker truncation is a real low inconsistency; schedule only with a template round)"},
    {"round": 46, "id": "C-R46-01", "source": "C process note + A self-report", "severity": "low", "status": "open",
     "title": "Process: A changed three getter lines in src/main/ipc/metadata.ts with sed -i instead of the Edit tool, against the round's 'repository writes through Edit/Write only' rule; content matched the spec exactly and root published",
     "routed_to": "process: round 47 task restates the rule and asks A to say in a-round-47.md that no Bash write touched the repository"},
    {"round": 46, "id": "A-R46-01", "source": "A code-reviewer F1, accepted by C", "severity": "info", "status": "open",
     "title": "A2 built value={v} (number) instead of the spec's String(v): a controlled String value rewrites '1.0' -> '1' (1.05 typed became 15); A added (r5) as a regression pin",
     "routed_to": "record in D-50 notes, accepted"},
    {"round": 46, "id": "C-R46-02", "source": "C", "severity": "info", "status": "open",
     "title": "(r3) was listed as must-fail but is green on c822d7f: the old 0 came from main's read default, not the renderer; the red side of C-R6-01 is (n2)",
     "routed_to": "record (B red-list error, no impact)"},
    {"round": 46, "id": "C-R46-03", "source": "C", "severity": "info", "status": "open",
     "title": "music-metadata reads ICMT 'კარი' as latin1 mojibake while ffprobe reads it correctly; same reader behaviour as C-R6-02",
     "routed_to": "signal (with C-R6-02)"},
]
for nf in new_findings:
    if not has(b["findings"], nf["id"]):
        b["findings"].append(nf)

b05 = find(b["items"], "TM-B05")
b05["status"] = "in_progress"
b05["decisions"] = ["D-05", "D-51"]
b05["round"] = 47
acc = (
    "round 47 R47-1..R47-7 (D-51): meta:write rejects 'Failed to write metadata: Audio data is empty, cannot tag' and meta:write-batch returns "
    "failed[].error 'Audio data is empty, cannot tag' for a WAV the library rejects with 'WAV file is missing data chunk'; file bytes unchanged; "
    "other files in the batch written; corrupt.wav and taggable 0-sample files unchanged; C real app single + batch with sha256 and three readers"
)
if acc not in b05["acceptance"]:
    b05["acceptance"].append(acc)
b05.setdefault("notes", []).append(
    "B R46 probe (/tmp/b47, node-taglib-sharp 6.0.1 from the repo): 44-byte WAV (data size 0, last chunk), WAV with no data chunk and WAV whose "
    "data size overruns the file all throw CorruptFileError 'WAV file is missing data chunk' on createFromPath (read and write). A 0-sample WAV whose "
    "empty data chunk is followed by LIST is readable and taggable. corrupt.wav throws 'WAV file is missing header chunk'. CorruptFileError is exported "
    "from the package index. Read half of the title (read silently returns empty metadata) stays unchanged in round 47 and goes to Saba as Q22; "
    "batch toast showing per-file reasons is Q23"
)
f0 = find(b["findings"], "B-R0-03")
f0["status"] = "in_progress"
f0["routed_to"] = "TM-B05 round 47 (D-51)"

if not has(b["decisions"], "D-51"):
    b["decisions"].append({
        "id": "D-51",
        "status": "planned round 47 (TM-B05, Saba Q5); pure fix of a Saba-decided behaviour",
        "decision": "writeTagsToFile opens the file through a module-private helper; when node-taglib-sharp's File.createFromPath throws an error whose message is exactly "
                    "'WAV file is missing data chunk' (library 6.0.1 text, also for no data chunk and for a data size that overruns the file), it throws "
                    "Error('Audio data is empty, cannot tag') instead. meta:write keeps its wrapper, so the rejection is 'Failed to write metadata: Audio data is empty, cannot tag' "
                    "(the renderer toast adds Electron's 'Error invoking remote method ...' prefix, pre-existing); meta:write-batch puts 'Audio data is empty, cannot tag' in that "
                    "file's failed[].error and continues with the other files. Every other library error keeps its text (corrupt.wav: 'WAV file is missing header chunk'). "
                    "The file is never modified. Read path unchanged: meta:read / meta:read-batch still return emptyMetadata for such a file (Q22). No upstream patch.",
        "contract_with": "none (editor error text only; nothing is written)",
    })

for rnd in b["rounds"]:
    if rnd.get("round") == 46:
        rnd["status"] = "published"
        rnd["commit"] = COMMIT
        rnd["result"] = (
            "C PASS R46-1..R46-8 realVerified=true; bugs 0; renderer 326/326 main 120/120 E2E 7/7 (--retries=0 7/7); mutants M1, M1b, M2-M5 killed; "
            "root review COMMIT OK (4 low, 1 architecture note: RR-R46-01..05); published " + COMMIT[:7] + "; TM-B11 done"
        )
if not any(r.get("round") == 47 for r in b["rounds"]):
    b["rounds"].append({
        "round": 47,
        "task": "TM-B05 (Saba Q5, D-51): per-file write error 'Audio data is empty, cannot tag' for WAVs the library rejects with 'missing data chunk'; read unchanged (Q22)",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B05"],
        "findings": ["B-R0-03"],
    })

with open(PATH, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")
print("ok")

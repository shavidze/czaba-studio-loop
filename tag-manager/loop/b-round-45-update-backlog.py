import json

PATH = "/home/runner/czaba-project/tmp/tag-manager-loop/backlog.json"
COMMIT = "c822d7f1a60a03741c5c1052f19e934d39a85d08"

with open(PATH, encoding="utf-8") as fh:
    b = json.load(fh)


def find(seq, ident):
    for entry in seq:
        if entry.get("id") == ident:
            return entry
    raise KeyError(ident)


def has(seq, ident):
    return any(entry.get("id") == ident for entry in seq)


b["current_task"] = "Round 46: TM-B11 stage 2 (Saba Q4, D-50) - number fields: unset = '' (read, input, write), typed 0 written as '0', badge counts any finite number; baseline c822d7f clean"

b11 = find(b["items"], "TM-B11")
b11["status"] = "in_progress"
b11["decisions"] = ["D-10", "D-49", "D-50"]
ev = (
    "C round 45 PASS R45-1..R45-7, realVerified=true (c-round-45.md/.json): red on d886bef src 10 failed/10 passed "
    "(T1-10a/b, e1-e5, e7, e10, e11) -> green 31/31; mutants M1 (no trim) and M2 (write [''] instead of removeValue) killed, "
    "M3 (workaround always) survives (C O1, A F1); verify EXIT=0 renderer 320/320 main 109/109 E2E 7/7 (--retries=0 7/7); "
    "real app (Playwright _electron, xvfb): R45-4 clearing Keywords removes IKEY in raw INFO, ffprobe and music-metadata, ICAT=DOORWood "
    "and ICMT unchanged; R45-5 fresh WAV + Title only and + empty custom Note: no IKEY/ICAT/NOTE, no size-0 sub-chunk; R45-6 3-file batch "
    "clear -> no IKEY, own ICATs kept, unselected files sha256 identical; d886bef build contrast shows IKEY:0/ICAT:0. Published " + COMMIT
)
if ev not in b11["evidence"]:
    b11["evidence"].append(ev)
b11["stages"][0]["status"] = "verified (C R45 PASS, realVerified=true), published " + COMMIT[:7]
b11["stages"][1] = {
    "stage": 2,
    "round": 46,
    "scope": "number fields (D-50): unset marker '' in read (absent custom number, standard year/bpm/track 0 from node-taglib-sharp, emptyMetadata), "
             "number input (empty -> '', typed 0 -> 0, display 0 as '0') and write (number '' / non-finite -> standard setter 0 / InfoTag.removeValue; "
             "finite number incl. 0 written as today). Badge (D-15 amended): any finite number counts as tagged. TemplatePicker Save as template keeps a typed 0. "
             "(e6) is retitled, not flipped: an explicit { take: 0 } still writes ITKN '0' (Saba Q4 meaningful 0). Fixes C-R6-01 and RR-R5-03. "
             "Standard year/track/bpm cannot store 0 in node-taglib-sharp (setter 0 removes): FYI deviation for Saba, not a FAIL",
    "status": "planned",
}
acc2 = "stage 2 (round 46) R46-1..R46-8; TM-B11 is done only after C real-app evidence for stage 2"
b11["acceptance"] = [a for a in b11["acceptance"] if not a.startswith("stage 2 (round 46)")]
if acc2 not in b11["acceptance"]:
    b11["acceptance"].append(acc2)

d49 = find(b["decisions"], "D-49")
d49["status"] = "verified (C R45 PASS R45-1..R45-7, realVerified=true), published " + COMMIT + " (TM-B11 stage 1); whitespace-only = empty still awaits Saba (Q20, non-blocking)"

d15 = find(b["decisions"], "D-15")
d15.setdefault("notes", []).append(
    "R45 planning: round 46 (D-50, Saba Q4 'a meaningful 0 stays expressible') amends the number rule: any finite number counts as tagged "
    "(0 and negatives included); unset numbers read as '' and stay empty. Planned, not verified"
)
d15["status"] = d15["status"] + "; number rule amended by D-50 (planned round 46)"

if not has(b["decisions"], "D-50"):
    b["decisions"].append({
        "id": "D-50",
        "status": "planned round 46 (TM-B11 stage 2, Saba Q4 / D-10); pure fix of a Saba-decided behaviour",
        "decision": "Number fields: the unset marker is '' (already a FieldValue member, src/shared/types.ts unchanged). Read (metadata.ts): getDefaultValue('number') returns ''; "
                    "a custom number riffChunkId that is absent, blank after NUL strip and trim, or not a finite Number() reads as ''; a finite payload reads as Number (so '0' reads 0); "
                    "standard year/bpm/track read '' when node-taglib-sharp returns 0, undefined or a non-finite value, else the number. "
                    "Write (writeTagsToFile): a number value that is '' or a whitespace-only string, or a non-finite number, is empty: standard setter gets 0 (library removes the item), "
                    "riffChunkId field calls InfoTag.removeValue (D-18 error collection kept, INFO workaround only when a non-empty value is written, as D-49). "
                    "A finite number (0 included) is written as today: standard setter value, INFO String(value). Other strings for a number field are written as today. "
                    "Renderer: the number Input shows '' for ''/undefined/non-number and String(value) for a finite number (0 shows '0'); onChange sends '' for an empty input and Number(v) "
                    "when finite, else ''. Badge (D-15 amended): a finite number counts as tagged. TemplatePicker Save as template keeps a finite 0 (drops '' as before). "
                    "Sort unchanged ('' compares like missing, RR-R18-02). Known limits: standard year/track/bpm cannot hold 0 (library); files already polluted with ITKN '0' by older builds read as 0 (a value).",
        "contract_with": "K-4 importer rule unchanged (absent or empty payload = no value); a custom number payload '0' is a real 0",
    })

for fid, closing in (
    ("RR-R3-03", "TM-B11 stage 1 round 45 (D-49), C PASS R45-4/R45-5, published " + COMMIT[:7]),
    ("C-R27-02", "TM-B11 stage 1 round 45 (D-49), C PASS R45-5 (empty custom Note writes nothing), published " + COMMIT[:7]),
    ("B-R42-02", "round 45 flipped T1-10a/b and K-4 docs (C R45-2, R45-7), published " + COMMIT[:7]),
):
    f = find(b["findings"], fid)
    f["status"] = "closed"
    f["closed_by"] = closing

c101 = find(b["findings"], "C-R1-01")
c101["status"] = "open"
c101["routed_to"] = "signal (library behaviour): the IKEY=\"\" half is closed by D-49 round 45 (C R45-4..R45-6, published " + COMMIT[:7] + "); extra id3 /LIST/MID/IDVX/JUNK chunks and the data move remain, out of scope"
note = "R45: IKEY size-0 half closed by D-49 (C PASS); second half (extra chunks) still open as a library signal"
if note not in c101.setdefault("notes", []):
    c101["notes"].append(note)

for fid, title in (("C-R6-01", None), ("RR-R5-03", None)):
    f = find(b["findings"], fid)
    f["status"] = "in_progress"
    f["routed_to"] = "TM-B11 stage 2 round 46 (D-50)"

new_findings = [
    {"round": 45, "id": "RR-R45-01", "source": "root-review", "severity": "medium", "status": "open",
     "title": "On a bare WAV where every field is empty the library writes an empty LIST/INFO (size 4); tell the czaba-api recording-import owner so an importer expecting at least one sub-chunk does not break",
     "routed_to": "signal + FYI for Saba / importer owner (K-4 note in feature-status); does not block",
     "notes": ["B R45 probe (b-round-45 planning, /tmp/b45) on d886bef: a bare WAV saved with only empty STANDARD values already got LIST/INFO size 4, so the empty list is not new for the editor path; new is only that keywords/category no longer add size-0 IKEY/ICAT. The importer rule 'absent = no value' already covers an empty INFO list"]},
    {"round": 45, "id": "RR-R45-02", "source": "root-review + C O1 + A F1", "severity": "low", "status": "open",
     "title": "INFO-creation workaround branch (metadata.ts tag.title = tag.title ?? '' and 'RIFF INFO tag is not available') appears unreachable on real WAVs: createFromPath already yields an InfoTag on a bare WAV (A F1, e9); mutant M3 (always run it) survives; the all-empty + no-InfoTag no-error rule is reachable only with the Id3v2Tag override mock and is unpinned",
     "routed_to": "signal: test-only pin (metadata-write-guard override technique, { keywords: '', category: '' } resolves, save 1) or removal in a later cleanup round"},
    {"round": 45, "id": "RR-R45-03", "source": "root-review", "severity": "low", "status": "open",
     "title": "Trim rule asymmetry: whitespace-only = empty, but non-empty values keep surrounding spaces (' KM184' kept, e4); intended and documented in the contract",
     "routed_to": "signal, no change"},
    {"round": 45, "id": "RR-R45-04", "source": "root-review", "severity": "low", "status": "open",
     "title": "No renderer test types '   ' into a panel field, saves, and checks the form is no longer dirty after the re-read",
     "routed_to": "signal (renderer test gap)"},
    {"round": 45, "id": "RR-R45-05", "source": "root-review", "severity": "info", "status": "open",
     "title": "Architecture signal: one per-type toRiffWriteOp(field, value) -> remove | set(strings) shared by the standard and riffChunkId paths instead of normalizeFieldValueForWrite + isEmptyFieldValueForWrite + library setter semantics",
     "routed_to": "signal"},
    {"round": 45, "id": "C-R45-01", "source": "C O4 + A code-reviewer (1)", "severity": "low", "status": "open",
     "title": "Emptiness is decided by field.type, not value shape: [''] for a text field or '' for a tags field still writes size 0; renderer never sends these shapes; meta:write shape validation signal",
     "routed_to": "signal (IPC shape validation, with RR-R17-04 / RR-R18-04)"},
    {"round": 45, "id": "C-R45-02", "source": "C O2", "severity": "info", "status": "open",
     "title": "The batch form shows every field empty (D-21 / C-R19-01), so clearing a field in batch needs type-then-delete; fill('') on an empty field does not make the form dirty",
     "routed_to": "Saba question Q21 (UX, non-blocking)"},
    {"round": 45, "id": "A-R45-01", "source": "A", "severity": "info", "status": "open",
     "title": "A added (e9)-(e11) beyond the planned (e1)-(e8) after its code-reviewer pass (additions only, in the owned new file); (e9) pins D-18 removeValue error on a bare WAV",
     "routed_to": "signal, accepted (C ran them in R45-2)"},
]
for nf in new_findings:
    if not has(b["findings"], nf["id"]):
        b["findings"].append(nf)

r45 = next(r for r in b["rounds"] if r.get("round") == 45)
r45["status"] = "published"
r45["commit"] = COMMIT
r45["result"] = "C PASS R45-1..R45-7 realVerified=true; bugs 0; renderer 320/320 main 109/109 E2E 7/7 (--retries=0 7/7); mutants M1/M2 killed, M3 survives (RR-R45-02); root review COMMIT OK (1 medium FYI RR-R45-01, 3 low, 1 architecture note); published c822d7f"

if not any(r.get("round") == 46 for r in b["rounds"]):
    b["rounds"].append({
        "round": 46,
        "task": "TM-B11 stage 2 (Saba Q4, D-50): number fields unset = '' in read/input/write, typed 0 written, badge counts finite numbers, template keeps 0",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B11"],
        "findings": ["C-R6-01", "RR-R5-03"],
    })

with open(PATH, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")
print("ok")

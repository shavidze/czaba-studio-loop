import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "b373b08f13069b26e89192a1229e3a4a31257e3e"

items = {i["id"]: i for i in b["items"]}
findings = {f["id"]: f for f in b["findings"]}
decisions = {d["id"]: d for d in b["decisions"]}


def add_note(obj, note):
    obj.setdefault("notes", [])
    if note not in obj["notes"]:
        obj["notes"].append(note)


t = items["TM-B23"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
ev = (
    "C round 20 PASS (c-round-20.md/.json, realVerified=true, 0 bugs): R20-1 only the 3 owned paths M, no untracked file, no removed "
    "test/.claude line, src +17/-4 private isSameSelectionSet (no export), no comment/any/@ts-ignore/new as, STATE_MANAGEMENT.md exactly the "
    "one D-29 line, permission_denials [], A transcript available: all repo writes via Edit; R20-2 3006615 worktree + A tests -> 7 failed / "
    "27 passed: (x1) 'R20Cat' to be 'BCat', (x2) 'A-comment' to be 'B-comment' (data-corruption proof), (x3) 'R20Cat' to be 'BTyped', (x4) "
    "A's re-read to deeply equal {}, (x5) '' to be 'BATCHCat', (x6) 'OLDCat' to be 'BATCHCat', (x11, A extra) '' to be 'ATyped'; pins "
    "(x7)-(x10) and (a)-(w) pass; A tree 34/34; R20-3 M1,M2,M3,M5,M6,M7,M8 + extra M9 (batch setEditingMetadata({}) unguarded, killed by x11) "
    "killed, M4 ordered compare survives as planned equivalent; R20-4 clean verifyCommand exit 0, Biome 0 errors / 9 warnings same list, "
    "typecheck 0, renderer 173/173 (162+11), main 93/93, E2E 7/7, --retries=0 7/7; R20-5 built app + xvfb + -r delay-write.cjs 3000 ms: "
    "a saved, b clicked 333 ms later, after 'Tags saved' form shows b.wav B-title/B-comment/empty Category, Save disabled; b Category R20B "
    "saved; batch a+b Genres R20Batch, a clicked within the delay -> form shows a's values; c R20C regression ok; ffprobe + music-metadata "
    "a = A-title/A-comment/R20A/R20Batch, b = B-title/B-comment/R20B/R20Batch, c ICAT R20C; red reference on a 3006615 build: b.wav carries "
    "A-title/A-comment in both readers; pageErrors empty. Root gate round 20 published b373b08, review COMMIT OK (lows RR-R20-01..03, "
    "architecture RR-R20-04)"
)
t.setdefault("evidence", [])
if ev not in t["evidence"]:
    t["evidence"].append(ev)
t["note"] = "B R20 close: done on C R20 evidence; published b373b08"

decisions["D-29"]["status"] = "done R20, published b373b08 (TM-B23; C R20-1..R20-5)"

t24 = items["TM-B24"]
t24["status"] = "in_progress"
t24["round"] = 21
t24["decisions"] = ["D-30"]
t24["title"] = (
    "Text typed into the editor while a save is pending on the same selection set is silently lost: single overwrites it with the "
    "re-read (setEditingMetadata({...updated}), MetadataPanel.tsx:115-118), batch all-succeeded clears it (setEditingMetadata({}), :154); "
    "isDirty false afterwards, so the typed text is neither saved nor shown. Includes A -> B -> A + typing (RR-R20-02)"
)
t24["findings"] = ["RR-R20-02"]
t24["acceptance"] = [
    "R21: panel tests with a deferred write and edits made during the pending save fail on b373b08 (single: typed value replaced by the re-read; batch all-succeeded: typed value cleared; A->B->A + typing replaced) and pass after; pins (no typing = today, typed then reverted = today, partial batch, write reject, D-24, D-29 tests x1-x11) pass on both",
    "mutations: no merge; merge every modifiedFields key regardless of value; array compared by reference; merge the whole current editingMetadata; single only; snapshot taken after the awaits; merge also in the D-29 changed branch -> each killed by a named test or recorded as equivalent with the reason",
    "real app (C, built app + xvfb, -r delay harness): type into Comment while a.wav's save is pending -> after 'Tags saved' the typed text is shown, Save enabled; second Save -> ffprobe + music-metadata show both the first save's Category and the typed Comment; batch variant; red reference on a b373b08 build loses the typed text",
    "gate: verifyCommand green, renderer 173 + new, main 93, E2E 7/7, --retries=0 7/7, Biome 9 warnings same list",
]
ev24 = (
    "B round 20 code reading on b373b08: handleSave single (115-118) runs skipSyncRef=true + setEditingMetadata({...updated}) whenever the "
    "selection set is unchanged, which resets modifiedFields/isDirty and replaces any updateField/mergeFields made during the awaits; batch "
    "all-succeeded (154) setEditingMetadata({}) the same way; inputs are not disabled while isSaving (only the Save button). Root review R20 "
    "(RR-R20-02) and A's qa-engineer R20 independently found A -> B -> A + typing is lost because the set is unchanged"
)
if ev24 not in t24["evidence"]:
    t24["evidence"].append(ev24)

a17 = findings.get("A-R17-02")
if a17 is not None:
    add_note(a17, "R20: A reports the hook did not fire again (a-round-20.md: no block and no injection at the first Edit, primitives read by hand 11:37Z); C confirms from A's transcript that all repo writes used Edit. Still routed to root")

b19 = findings["B-R19-01"]
add_note(b19, "R20: root review (RR-R20-01) and A's code-reviewer saw the same toast; root suggests skipping the discard toast while the save started from the selection being left. Still a Saba question (wording vs lock)")

a1902 = findings["A-R19-02"]
add_note(a1902, "R20 re-check (A's qa-engineer): the editor half is fixed by D-29 (selection cleared -> editor untouched, (x4)); still open: updateFileMetadata leaves the old folder's path as a key in the new folder's metadata map, and refreshSavedFileStats scans the newly opened folder (no effect, only written paths are patched)")

if "D-30" not in decisions:
    b["decisions"].append({
        "id": "D-30",
        "status": "decided B round 20 close (technical, reversible, renderer only); to be implemented R21 (TM-B24)",
        "decision": (
            "MetadataPanel handleSave keeps edits made while the save is pending on the same selection set. At save start it keeps the "
            "editingMetadata it writes (start snapshot, the same object the write uses). On the D-29 'same set' branch, after the awaits, "
            "it computes typedDuringSave = the keys in the current useMetadataStore modifiedFields whose current editingMetadata value "
            "differs from the start snapshot value (strings/numbers by ===, tag arrays by length and element order; a missing key counts as "
            "different from a present one). Empty -> exactly today (D-21, D-22, D-24, D-28, D-29). Non-empty -> single: skipSyncRef, "
            "updateFileMetadata, setEditingMetadata({...updated}) as today, then mergeFields(typedDuringSave values); batch all-succeeded: "
            "setEditingMetadata({}) as today, then mergeFields(typedDuringSave values). End state: the re-read (single) or empty batch form "
            "plus the typed values, modifiedFields = the typed keys only, isDirty true, Save enabled; toasts unchanged. Batch partial "
            "failure (D-21 keeps every edit), write reject, re-read reject (D-24) and the D-29 'changed set' branch are unchanged. No store "
            "change (the store has no edit counter; the reviewer's editVersion token stays an architecture signal RR-R20-04). Pure fix: "
            "reference-first rule exempt"
        ),
    })

new_findings = [
    {"round": 20, "id": "RR-R20-01", "source": "root-review (gates/round-20/review.md)", "severity": "low", "status": "open",
     "title": "Switching away from a dirty selection while a save is pending shows 'Unsaved changes were discarded' although the edits are being written (MetadataPanel.tsx:74-76); the save toast replaces it shortly. Suggestion: skip the discard toast while the save that started from the left selection is pending",
     "routed_to": "same as B-R19-01 (Saba question batch)"},
    {"round": 20, "id": "RR-R20-02", "source": "root-review (gates/round-20/review.md); A qa-engineer R20", "severity": "low", "status": "open",
     "title": "A -> B -> A and typing on A during the write: the set is unchanged, so setEditingMetadata(updated) overwrites the new typing (pinned by x10 without typing); same as typing on the unchanged selection",
     "routed_to": "TM-B24 (round 21, D-30)"},
    {"round": 20, "id": "RR-R20-03", "source": "root-review", "severity": "info", "status": "open",
     "title": "Conventions OK: no comments, semicolons, no any; STATE_MANAGEMENT.md D-29 line accurate; test file keeps its double-quote style",
     "routed_to": "record only"},
    {"round": 20, "id": "RR-R20-04", "source": "root-review", "severity": "info", "status": "open",
     "title": "Architecture signal: a save token {selectionKey, editVersion} recorded at save start (editVersion increased by every updateField) and checked before touching the editor would replace skipSyncRef + selection snapshot + isDirty reasoning and cover RR-R20-01/02 in one place; needs a metadata-store change",
     "routed_to": "signal (with RR-R12-04, RR-R13-04, RR-R15-05); not a task"},
    {"round": 20, "id": "A-R20-01", "source": "A qa-engineer R20 (a-round-20.md)", "severity": "low", "status": "open",
     "title": "The sync effect keys the selection on join('\\0'), so a reorder of the same set (e.g. Select All after a partial selection in another order) counts as a selection change and drops dirty batch edits with 'Unsaved changes were discarded'",
     "routed_to": "signal; re-check after TM-B24 (a set-based key would be a separate fix)"},
    {"round": 20, "id": "C-R20-01", "source": "C (c-round-20.md notes)", "severity": "info", "status": "open",
     "title": "A added an unplanned (x11) (batch A+B -> A + typing on A) in the same describe, additions only; it kills M9 (batch setEditingMetadata({}) unguarded) that x1-x10 missed; accepted, count 173",
     "routed_to": "record only"},
]
for nf in new_findings:
    if nf["id"] not in findings:
        b["findings"].append(nf)

tb06 = items.get("TM-B06")
if tb06 is not None:
    add_note(tb06, "R20: A's code-reviewer notes '() => {}' placeholders in the new test helpers would meet Biome rules once tests/ is linted (same class as RR-R14-03)")

for r in b["rounds"]:
    if r["round"] == 20:
        r["status"] = "published"
        r["commit"] = COMMIT
        r["findings"] = ["B-R19-01", "A-R19-02", "RR-R20-01", "RR-R20-02", "RR-R20-03", "RR-R20-04", "A-R20-01", "C-R20-01"]
        r["c_result"] = "PASS, realVerified=true (R20-1..R20-5), 0 bugs; red 7 failed on 3006615 (x1-x6, x11), green 34/34; M1-M3, M5-M9 killed, M4 equivalent as planned; gate 173/93/7; real app with 3000 ms write delay: form follows the new selection, b.wav keeps its own title/comment in ffprobe + music-metadata, red reference on 3006615 wrote A's title/comment into b.wav; root review COMMIT OK"
if not any(r["round"] == 21 for r in b["rounds"]):
    b["rounds"].append({
        "round": 21,
        "task": "TM-B24 edits typed while a save is pending on the same selection set are kept (D-30)",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B24"],
        "findings": ["RR-R20-02", "A-R20-01"],
    })

b["current_task"] = "Round 21: TM-B24 (D-30) edits typed during a pending save on the same selection are kept"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")

import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    b = json.load(fh)

COMMIT = "3006615b365edf3847542c06e119a020b426b093"

items = {i["id"]: i for i in b["items"]}
findings = {f["id"]: f for f in b["findings"]}
decisions = {d["id"]: d for d in b["decisions"]}

t = items["TM-B22"]
t["status"] = "done"
t["realVerified"] = True
t["commit"] = COMMIT
ev = (
    "C round 19 PASS (c-round-19.md/.json, realVerified=true, 0 bugs): R19-1 only the 5 owned paths M (+310/-1, the one '-' is the moved "
    "failedPaths line), no removed test/.claude line, one beforeEach line + two new describes ((s6) and (o) order are extra additions), no "
    "comment/any/@ts-ignore/new as/new export (refreshSavedFileStats module-private), permission_denials [], A transcript available: all repo "
    "writes via Edit; R19-2 d015470 worktree + A tests -> 11 failed / 46 passed: (n),(o),(p),(s),(t) 'expected vi.fn() to be called 1 times, "
    "but got 0 times', (s1)-(s6) 'updateFileStats is not a function', pins (q),(r),(u),(v),(w) + (a)-(m) pass; A tree 57/57; R19-3 M1-M8 + "
    "M3b all killed; R19-4 clean verifyCommand exit 0, Biome 0 errors / 9 warnings same list, typecheck 0, renderer 162/162 (146+16), main "
    "93/93, E2E 7/7, --retries=0 7/7; R19-5 built app + xvfb: single save a.wav 86.2 KB -> 88.3 KB = formatFileSize(stat 90422), Date "
    "1/2/2020 -> 10/27/2026 = toLocaleDateString(stat mtime), b/c unchanged, selection + editor kept, no 'Unsaved changes' toast; batch b+c "
    "87.4 KB / 10/27/2026 = stat, a kept, '2 selected'; chmod 444 c partial '1 saved, 1 failed': b mtime refreshed (size equal, padding), c "
    "cells and stat unchanged; Size sort b,c,a ascending; ffprobe + music-metadata ICAT a=R19Single b=R19Partial, IGNR b,c=R19 Batch, c no "
    "ICAT; relaunch cells equal; pageErrors empty; 200-file folder single save click->toast 169 ms (observation). Root gate round 19 "
    "published 3006615, review COMMIT OK (medium RR-R19-01 performance -> Saba question B-R18-01; lows RR-R19-02..04)"
)
t.setdefault("evidence", [])
if ev not in t["evidence"]:
    t["evidence"].append(ev)
t["note"] = "B R19 close: done on C R19 evidence; published 3006615"

f = findings["C-R17-01"]
f["status"] = "closed"
f["closed_by"] = "TM-B22 (D-28), C round 19 PASS, published 3006615"

decisions["D-28"]["status"] = "done R19, published 3006615 (TM-B22; C R19-1..R19-5)"

b18 = findings["B-R18-01"]
note = "R19: C measured one single save on a 200-file folder at 169 ms click->toast (observation, no d015470 comparison). Root review R19 rates the full rescan per save medium (RR-R19-01); same Saba question"
if note not in b18.get("notes", []):
    b18.setdefault("notes", []).append(note)

a17 = findings.get("A-R17-02")
if a17 is not None:
    note17 = "R19: A reports the hook did not fire again (a-round-19.md process statement); C confirms from A's transcript that all repo writes used Edit. Still routed to root"
    if note17 not in a17.get("notes", []):
        a17.setdefault("notes", []).append(note17)

if "D-29" not in decisions:
    b["decisions"].append({
        "id": "D-29",
        "status": "decided B round 19 close (technical, reversible, renderer only); to be implemented R20 (TM-B23)",
        "decision": (
            "MetadataPanel handleSave reads the selection at save start (useFileStore.getState().selectedPaths). After the awaited write "
            "(and the D-28 refresh and the re-read) it compares that start selection with the current useFileStore.getState().selectedPaths "
            "as a set (same size, same members, order ignored). Same set: everything exactly as today (D-21, D-22, D-24, D-28). Different set "
            "(the user selected another file, cleared the selection or opened a folder while the save was pending): the file-side updates "
            "still run (D-28 updateFileStats and updateFileMetadata for the written/re-read paths per D-21/D-22) and the toasts are unchanged, "
            "but the editor is not touched: skipSyncRef is not set and setEditingMetadata is not called (neither {...updated} for single nor {} "
            "for batch). The sync effect then shows the current selection from the updated store, or keeps the user's edits on the new "
            "selection when they are dirty. Write-reject and re-read-reject (D-24) paths do not touch the editor today and stay unchanged. "
            "The 'Unsaved changes were discarded' toast at the selection change is unchanged (known limit, B-R19-01). The file list is NOT "
            "locked during a save: locking would be new UX that needs the reference-first study and Saba. Pure fix: reference-first rule exempt"
        ),
    })

new_items = [
    {
        "id": "TM-B23", "type": "bug", "severity": "high",
        "source": "qa-engineer P1 in a-round-19.md (relayed by C R19, not reproduced by C); B code reading on 3006615",
        "title": (
            "Selection change while a save is pending puts the saved file's values into the editor of the newly selected file "
            "(MetadataPanel.tsx:105-107 single, :133-143 batch run after the awaits without checking the selection; skipSyncRef blocks "
            "the resync); isDirty is false, so the next edit + Save writes the first file's full field set into the second file"
        ),
        "status": "in_progress", "round": 20, "depends_on": [], "decisions": ["D-29"], "findings": [],
        "acceptance": [
            "R20: panel tests with a deferred write fail on 3006615 (editor shows A's re-read values while B is selected; second save writes A's comment to B; batch mid-save reselect shows an empty/stale form) and pass after; pins (write reject, D-24 re-read reject, same set reordered, A->B->A) pass on both",
            "mutations: no guard; guard also skips updateFileMetadata; length-only compare; ordered compare; guard single only; skipSyncRef still set; toasts dropped -> each killed by a named test",
            "real app (C, built app + xvfb, write delayed by a -r harness module, source untouched): select a, edit, Save, click b within the delay -> after 'Tags saved' the form shows b's values; edit b's Category and save -> ffprobe + music-metadata on b show b's own title/comment and the new ICAT, a shows its own values; red reference on a 3006615 build writes a's title/comment into b",
            "gate: verifyCommand green, renderer 162 + new, main 93, E2E 7/7, --retries=0 7/7, Biome 9 warnings same list",
        ],
        "evidence": [
            "B round 19 code reading on 3006615: handleSave captures selectedFiles/editingMetadata in its closure; after write -> refreshSavedFileStats -> readMetadata it sets skipSyncRef=true, updateFileMetadata(path), setEditingMetadata({...updated}) unconditionally (MetadataPanel.tsx:105-107); the sync effect (54-87) already loaded B on the selection change, then skipSyncRef makes it return, so the form keeps A's values with B selected and isDirty false. Batch: setEditingMetadata({}) and skipSyncRef (133-143) the same way. FileList has no isSaving lock (only the Save button is disabled). D-28 widened the window (write + scan + read)",
            "B round 19 harness experiment (b-round-19-exp-delay-write.cjs.txt, b-round-19-exp-delay-app.cjs.txt): an Electron '-r' module that wraps ipcMain.handle delays meta:write by R20_WRITE_DELAY_MS (1502 ms measured with 1500) without touching the source; a 518 MB WAV write took 765 ms the first time and 10 ms after (b-round-19-exp-bigwav-write.cjs.txt), too cache-dependent to use",
        ],
    },
    {
        "id": "TM-B24", "type": "bug", "severity": "medium",
        "source": "qa-engineer P3 in a-round-19.md; B code reading on 3006615",
        "title": (
            "Text typed into the editor while a single-file save is pending is silently replaced by the re-read values "
            "(setEditingMetadata({...updated}) after the awaits, isDirty false); same selection, so D-29 does not cover it"
        ),
        "status": "todo", "depends_on": ["TM-B23"], "decisions": [], "findings": [],
        "acceptance": ["to be planned after TM-B23: red panel test with a deferred write and a keystroke during the pending save; real app with the delay harness"],
        "evidence": ["B round 19 code reading: MetadataPanel.tsx:105-107 overwrite editingMetadata and reset modifiedFields/isDirty after the re-read, regardless of updateField calls made during the awaits"],
    },
]
for item in new_items:
    if item["id"] not in items:
        b["items"].append(item)

new_findings = [
    {"round": 19, "id": "RR-R19-01", "source": "root-review", "severity": "medium", "status": "open",
     "title": "Performance: every save awaits a full recursive scanFolder (file-system.ts scanFolderRecursive, depth 20, stat per WAV, no timeout) before the re-read while isSaving is true; slow on 1000+ files or a network drive. Fix: a narrow statFiles(paths) IPC (main + protected preload) or write IPCs returning stats; or a non-awaited refresh after the toast",
     "routed_to": "Saba question B-R18-01 (preload change permission); a non-awaited refresh would change D-28 order, also a Saba/B decision"},
    {"round": 19, "id": "RR-R19-02", "source": "root-review", "severity": "low", "status": "open",
     "title": "updateFileStats returns a new files array when a path matches, so FileList.tsx:107-109 resets lastClickRef after every successful save (shift-click after a save selects one row); already the case before R19 through metadata, arguably right when sorted by Size/Date",
     "routed_to": "signal; document under D-28 or key the effect on paths"},
    {"round": 19, "id": "RR-R19-03", "source": "root-review", "severity": "info", "status": "open",
     "title": "refreshSavedFileStats reads folderPath after the write; a folder opened during a slow save is scanned instead; harmless because only written paths are patched",
     "routed_to": "record only"},
    {"round": 19, "id": "RR-R19-04", "source": "root-review", "severity": "info", "status": "open",
     "title": "Architecture signal: move the stat refresh into a store action backed by a statFiles IPC, or have meta:write / meta:write-batch return the new stats with their result (removes the extra round trip and the ordering question)",
     "routed_to": "signal (with B-R18-01, RR-R19-01); needs preload, not a task"},
    {"round": 19, "id": "A-R19-01", "source": "A code-reviewer F2 (a-round-19.md), confirmed by C", "severity": "low", "status": "open",
     "title": "No batch test for a scanFolder rejection; the helper is shared and M5 is killed by the single test (u)",
     "routed_to": "signal; next touch of metadata-panel-batch-save.test.ts"},
    {"round": 19, "id": "A-R19-02", "source": "qa-engineer P2 (a-round-19.md)", "severity": "low", "status": "open",
     "title": "Folder close/switch during a pending save: updateFileMetadata adds the old folder's path to the new folder's metadata map (stray key); the editor half is covered by D-29 (selection cleared -> editor untouched)",
     "routed_to": "signal; re-check after TM-B23"},
    {"round": 19, "id": "C-R19-01", "source": "C (c-round-19.md observations)", "severity": "info", "status": "open",
     "title": "After a 2-file batch save the Genres field shows its placeholder although both files carry 'R19 Batch'; matches D-21 (all-succeeded batch -> setEditingMetadata({}), form back to Multiple values); DOM not checked by C",
     "routed_to": "record only (expected per D-21); a multi-value display would be a product question"},
    {"round": 19, "id": "B-R19-01", "source": "B (TM-B23 code reading)", "severity": "low", "status": "open",
     "title": "A selection change while a save is pending shows 'Unsaved changes were discarded' although the edits are being written (and are written if the save succeeds); D-29 keeps the toast unchanged",
     "routed_to": "Saba question batch (UX wording or lock the list during save, which needs the reference-first study)"},
]
for nf in new_findings:
    if nf["id"] not in findings:
        b["findings"].append(nf)

for r in b["rounds"]:
    if r["round"] == 19:
        r["status"] = "published"
        r["commit"] = COMMIT
        r["findings"] = ["C-R17-01", "RR-R19-01", "RR-R19-02", "RR-R19-03", "RR-R19-04", "A-R19-01", "A-R19-02", "C-R19-01"]
        r["c_result"] = "PASS, realVerified=true (R19-1..R19-5), 0 bugs; red 11 failed on d015470, green 57/57; mutations M1-M8 + M3b killed; gate 162/93/7; real app Size/Date equal fs.stat after single, batch and partial saves, ffprobe + music-metadata ICAT/IGNR; root review COMMIT OK (medium RR-R19-01 -> Saba, lows RR-R19-02..04)"
if not any(r["round"] == 20 for r in b["rounds"]):
    b["rounds"].append({
        "round": 20,
        "task": "TM-B23 selection change during a pending save must not put the saved file's values into the new selection's editor (D-29)",
        "status": "planned",
        "baseline": COMMIT + " (clean)",
        "items": ["TM-B23"],
        "findings": ["B-R19-01", "A-R19-02"],
    })

b["current_task"] = "Round 20: TM-B23 (D-29) editor untouched when the selection changed during a pending save"

with open(path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")

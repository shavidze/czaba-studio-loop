import json
import sys

task_path, backlog_path = sys.argv[1], sys.argv[2]

with open(task_path, encoding="utf-8") as fh:
    s = fh.read()

pairs = [
    (
        "<li>**M4:** ordered comparison (`join`).</li>",
        "<li>**M4 (expected equivalent, record only):** ordered comparison (`join`). The sync effect already keys the selection on `join('\\0')`, so a reorder clears the editor to `{}` before the write resolves, and (x9) ends the same with either compare. C confirms this by reasoning or a run and records it; a surviving M4 is **not** a FAIL.</li>",
    ),
    (
        "M3 (x1); M4 (x9); M5 (x5)/(x6);",
        "M3 (x1); M4 none (equivalent, see above; (x9) stays a pin); M5 (x5)/(x6);",
    ),
    (
        "A survivor is a FAIL unless C shows it is equivalent. |",
        "A survivor other than M4 is a FAIL unless C shows it is equivalent. |",
    ),
]
for old, new in pairs:
    if new in s:
        continue
    if s.count(old) != 1:
        sys.exit(f"anchor count {s.count(old)}: {old[:60]}")
    s = s.replace(old, new)

with open(task_path, "w", encoding="utf-8") as fh:
    fh.write(s)

with open(backlog_path, encoding="utf-8") as fh:
    b = json.load(fh)
old_acc = "mutations: no guard; guard also skips updateFileMetadata; length-only compare; ordered compare; guard single only; skipSyncRef still set; toasts dropped -> each killed by a named test"
new_acc = "mutations: no guard; guard also skips updateFileMetadata; length-only compare; guard single only; skipSyncRef still set; render-time selection; toasts dropped -> each killed by a named test. Ordered compare is expected equivalent (the sync effect already treats a reorder as a selection change), record only"
for item in b["items"]:
    if item["id"] == "TM-B23":
        item["acceptance"] = [new_acc if a == old_acc else a for a in item["acceptance"]]
with open(backlog_path, "w", encoding="utf-8") as fh:
    json.dump(b, fh, ensure_ascii=False, indent=2)
    fh.write("\n")

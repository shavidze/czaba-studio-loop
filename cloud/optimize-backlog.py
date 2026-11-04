#!/usr/bin/env python3
"""Backlog optimization: shrink backlog.json before each round.

Run by cloud/run.sh as a root pre-round step. Moves stale data to
loop/archive/ and compacts done entries in place. The active-backlog
generator (in the kit) then reads a leaner file.

Optimizations:
  1. Archive closed/done/resolved findings → loop/archive/findings-archived.json
  2. Archive old baseline_tree_at_roundN (keep last 5) → loop/archive/baselines-archived.json
  3. Archive old vitest_floor/expected (keep last 5) → loop/archive/vitests-archived.json
  4. Compact decisions_log_b: keep last 50 entries inline, archive older
  5. Compact done rounds: keep last 20 inline, archive older
  6. Compact deferred_low_polish: merge duplicate IDs, drop resolved

Writes backlog.json in place (atomic rename). Never deletes data — everything
goes to loop/archive/ for traceability.
"""
import json
import os
import shutil
import sys
from pathlib import Path

def main():
    loop_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("loop")
    backlog_path = loop_dir / "backlog.json"
    archive_dir = loop_dir / "archive"
    archive_dir.mkdir(exist_ok=True)

    if not backlog_path.exists():
        print("optimize-backlog: no backlog.json found")
        return

    original_size = backlog_path.stat().st_size
    with open(backlog_path) as f:
        data = json.load(f)

    saved_bytes = 0

    # --- 1. Archive closed/done/resolved findings ---
    findings = data.get("open_findings", [])
    if isinstance(findings, list) and len(findings) > 0:
        active_findings = []
        archived_findings = []
        for item in findings:
            if isinstance(item, dict):
                status = item.get("status", "")
                if any(s in status.lower() for s in ["closed", "done", "resolved"]):
                    archived_findings.append(item)
                else:
                    active_findings.append(item)
            else:
                archived_findings.append(item)

        if archived_findings:
            # Append to existing archive
            archive_file = archive_dir / "findings-archived.json"
            existing = []
            if archive_file.exists():
                with open(archive_file) as f:
                    existing = json.load(f)
            existing.extend(archived_findings)
            with open(archive_file, "w") as f:
                json.dump(existing, f, separators=(",", ":"))

            before = len(json.dumps(findings, separators=(",", ":")))
            data["open_findings"] = active_findings
            after = len(json.dumps(active_findings, separators=(",", ":")))
            saved_bytes += before - after
            print(f"  findings: archived {len(archived_findings)}, kept {len(active_findings)} ({(before-after)//1024} KB saved)")

    # --- 2. Archive old baseline trees (keep last 5) ---
    baseline_keys = sorted(
        [k for k in data if k.startswith("baseline_tree_at_round")],
        key=lambda k: int(k.replace("baseline_tree_at_round", "") or "0")
    )
    if len(baseline_keys) > 5:
        to_archive = baseline_keys[:-5]
        archived_baselines = {}
        archive_file = archive_dir / "baselines-archived.json"
        if archive_file.exists():
            with open(archive_file) as f:
                archived_baselines = json.load(f)
        for k in to_archive:
            archived_baselines[k] = data.pop(k)
        with open(archive_file, "w") as f:
            json.dump(archived_baselines, f, separators=(",", ":"))
        print(f"  baselines: archived {len(to_archive)}, kept {len(baseline_keys) - len(to_archive)}")

    # --- 3. Archive old vitest floors/expected (keep last 5 of each) ---
    for prefix in ("vitest_floor_round", "vitest_expected_round"):
        vkeys = sorted(
            [k for k in data if k.startswith(prefix)],
            key=lambda k: int(k.replace(prefix, "") or "0")
        )
        if len(vkeys) > 5:
            to_archive = vkeys[:-5]
            tag = "vitest-floors" if "floor" in prefix else "vitest-expected"
            archive_file = archive_dir / f"{tag}-archived.json"
            archived = {}
            if archive_file.exists():
                with open(archive_file) as f:
                    archived = json.load(f)
            for k in to_archive:
                archived[k] = data.pop(k)
            with open(archive_file, "w") as f:
                json.dump(archived, f, separators=(",", ":"))
            print(f"  {prefix}*: archived {len(to_archive)}, kept {len(vkeys) - len(to_archive)}")

    # --- 4. Compact decisions_log_b: keep last 50 inline ---
    decisions = data.get("decisions_log_b")
    if isinstance(decisions, list) and len(decisions) > 50:
        archive_file = archive_dir / "decisions-archived.json"
        existing = []
        if archive_file.exists():
            with open(archive_file) as f:
                existing = json.load(f)
        to_archive = decisions[:-50]
        existing.extend(to_archive)
        with open(archive_file, "w") as f:
            json.dump(existing, f, separators=(",", ":"))
        before = len(json.dumps(decisions, separators=(",", ":")))
        data["decisions_log_b"] = decisions[-50:]
        after = len(json.dumps(data["decisions_log_b"], separators=(",", ":")))
        saved_bytes += before - after
        print(f"  decisions: archived {len(to_archive)}, kept 50 ({(before-after)//1024} KB saved)")
    elif isinstance(decisions, dict) and len(decisions) > 50:
        items = list(decisions.items())
        archive_file = archive_dir / "decisions-archived.json"
        existing = {}
        if archive_file.exists():
            with open(archive_file) as f:
                existing = json.load(f)
        to_archive = dict(items[:-50])
        existing.update(to_archive)
        with open(archive_file, "w") as f:
            json.dump(existing, f, separators=(",", ":"))
        before = len(json.dumps(decisions, separators=(",", ":")))
        data["decisions_log_b"] = dict(items[-50:])
        after = len(json.dumps(data["decisions_log_b"], separators=(",", ":")))
        saved_bytes += before - after
        print(f"  decisions: archived {len(to_archive)}, kept 50 ({(before-after)//1024} KB saved)")

    # --- 5. Compact old rounds: keep last 20 inline ---
    rounds = data.get("rounds")
    if isinstance(rounds, dict) and len(rounds) > 20:
        sorted_keys = sorted(rounds.keys(), key=lambda k: int(k) if k.isdigit() else 0)
        to_archive_keys = sorted_keys[:-20]
        archive_file = archive_dir / "rounds-archived.json"
        existing = {}
        if archive_file.exists():
            with open(archive_file) as f:
                existing = json.load(f)
        for k in to_archive_keys:
            existing[k] = rounds.pop(k)
        with open(archive_file, "w") as f:
            json.dump(existing, f, separators=(",", ":"))
        print(f"  rounds: archived {len(to_archive_keys)}, kept {len(rounds)}")

    # --- Write compacted backlog ---
    tmp_path = backlog_path.with_suffix(".tmp")
    with open(tmp_path, "w") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp_path, backlog_path)

    new_size = backlog_path.stat().st_size
    print(f"optimize-backlog: {original_size//1024} KB → {new_size//1024} KB (saved {(original_size-new_size)//1024} KB, {(original_size-new_size)*100//original_size}%)")


if __name__ == "__main__":
    main()

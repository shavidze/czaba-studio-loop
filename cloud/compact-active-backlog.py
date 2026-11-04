#!/usr/bin/env python3
"""Generate a leaner active-backlog.json from the full backlog.

Called by the root step after optimize-backlog.py. Produces
loop/context/active-backlog.json and loop/context/active-summary.md
with aggressive compaction:

  - open_findings: only items with severity Critical/High/Medium and
    status not closed/done/resolved. Low/info stay as one-line summaries.
  - post_current_stage_queue done items: ID + status only (no evidence chain).
  - recent_rounds: last 10 instead of all.
  - rules, done_policy: kept as-is (small).
  - other_open_items: kept as-is.
  - current_task/current_items_full: kept as-is.

Memory pointer: findings with evidence > 2 KB get evidence replaced with
a file reference pointing to the full backlog.
"""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


def compact_finding(item):
    """Compact a single finding for the active view."""
    if not isinstance(item, dict):
        return None
    status = item.get("status", "")
    severity = item.get("severity", "info")

    # Skip closed/done/resolved entirely
    if any(s in status.lower() for s in ["closed", "done", "resolved"]):
        return None

    # For Low/info: one-line summary only
    if severity in ("low", "info", "Low", "Info"):
        compact = {
            "id": item.get("id", "?"),
            "severity": severity,
            "status": status[:60],
        }
        title = item.get("title", "")
        if title:
            compact["title"] = title[:100]
        return compact

    # For Critical/High/Medium: keep full but truncate evidence
    result = dict(item)
    for key in ("evidence", "details", "description"):
        val = result.get(key, "")
        if isinstance(val, str) and len(val) > 500:
            result[key] = val[:500] + " [truncated; see backlog.json]"
    return result


def compact_queue_item(item):
    """Compact a queue item: done → ID+status; active → full."""
    if not isinstance(item, dict):
        return item
    status = item.get("status", "")
    item_id = item.get("id", "?")

    if any(s in status.lower() for s in ["done", "complete", "v1_complete"]):
        return {"id": item_id, "status": "done"}

    # Active items: keep but compact sub-stages
    result = dict(item)
    stages = None
    for key in ("stages", "order", "items"):
        if key in result and isinstance(result[key], list):
            stages = result[key]
            stage_key = key
            break

    if stages:
        compacted_stages = []
        for stage in stages:
            if isinstance(stage, dict):
                st_status = stage.get("status", "")
                if any(s in st_status.lower() for s in ["done", "complete"]):
                    compacted_stages.append({
                        "id": stage.get("id", "?"),
                        "status": "done"
                    })
                else:
                    compacted_stages.append(stage)
            else:
                compacted_stages.append(stage)
        result[stage_key] = compacted_stages

    return result


def main():
    loop_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("loop")
    backlog_path = loop_dir / "backlog.json"
    context_dir = loop_dir / "context"
    context_dir.mkdir(exist_ok=True)

    with open(backlog_path) as f:
        data = json.load(f)

    active = {
        "_about": "Compacted active view of backlog.json. Low/info findings are one-line. Done queue items are ID-only. Full data in backlog.json.",
        "_generatedUtc": datetime.now(timezone.utc).isoformat(),
    }

    # Current task
    active["current_task"] = data.get("current_task", "")
    active["current_items_full"] = data.get("current_items_full", [])

    # Rules and done_policy (small, keep as-is)
    if "rules" in data:
        active["rules"] = data["rules"]
    if "done_policy" in data:
        active["done_policy"] = data["done_policy"]

    # Open findings — compacted
    findings = data.get("open_findings", [])
    if isinstance(findings, list):
        compacted = [compact_finding(f) for f in findings]
        active["open_findings"] = [f for f in compacted if f is not None]
    else:
        active["open_findings"] = findings

    # Recent rounds — last 10
    rounds = data.get("rounds", {})
    if isinstance(rounds, dict):
        sorted_keys = sorted(rounds.keys(), key=lambda k: int(k) if k.isdigit() else 0)
        recent = sorted_keys[-10:]
        active["recent_rounds"] = [
            {"round": k, **{rk: rv for rk, rv in rounds[k].items() if rk != "evidence"}}
            for k in recent
            if isinstance(rounds[k], dict)
        ]
    elif isinstance(rounds, list):
        active["recent_rounds"] = rounds[-10:]

    # Queue items — compacted
    queue = data.get("post_current_stage_queue", [])
    if isinstance(queue, list):
        active["other_open_items"] = [compact_queue_item(item) for item in queue]

    # List all other keys (just names, for reference)
    skip = {"_about", "_generatedUtc", "current_task", "current_items_full",
            "rules", "done_policy", "open_findings", "rounds",
            "post_current_stage_queue", "items"}
    active["other_keys"] = sorted(k for k in data if k not in skip)

    # Write
    out_path = context_dir / "active-backlog.json"
    tmp_path = out_path.with_suffix(".tmp")
    with open(tmp_path, "w") as f:
        json.dump(active, f, indent=2)
    os.replace(tmp_path, out_path)

    # Summary
    summary_path = context_dir / "active-summary.md"
    n_findings = len(active.get("open_findings", []))
    crit_high = sum(1 for f in active.get("open_findings", [])
                    if isinstance(f, dict) and f.get("severity", "").lower() in ("critical", "high", "medium"))
    with open(summary_path, "w") as f:
        f.write(f"# Active loop summary ({active['_generatedUtc']})\n\n")
        f.write(f"- backlog.json {backlog_path.stat().st_size // 1024} KB -> active view {out_path.stat().st_size // 1024} KB\n")
        f.write(f"- open findings: {n_findings} ({crit_high} Critical/High/Medium)\n")
        f.write(f"- current task: {active.get('current_task', '?')[:120]}\n")
        recent = active.get("recent_rounds", [])
        if recent:
            last = recent[-1] if isinstance(recent[-1], dict) else {}
            f.write(f"- last round: {last.get('round', '?')}\n")

    orig_size = 0
    try:
        # Compare with what the kit's own generator would produce
        orig_size = backlog_path.stat().st_size
    except Exception:
        pass

    new_size = out_path.stat().st_size
    print(f"compact-active-backlog: {new_size // 1024} KB (backlog {orig_size // 1024} KB)")


if __name__ == "__main__":
    main()

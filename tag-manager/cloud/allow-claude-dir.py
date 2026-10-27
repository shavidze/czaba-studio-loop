"""PermissionRequest hook for the Tag Manager loop (Saba, 2026-10-27): approve Edit/Write under the repo's .claude/ except settings and hooks."""
import json, os, sys
d = json.load(sys.stdin)
p = (d.get("tool_input") or {}).get("file_path") or ""
root = os.path.realpath(d.get("cwd") or os.getcwd())
rp = os.path.realpath(os.path.join(root, p))
rel = os.path.relpath(rp, root).replace(os.sep, "/")
deny_prefix = (".claude/settings", ".claude/hooks/")
ok = d.get("tool_name") in ("Edit", "Write", "MultiEdit") and rel.startswith(".claude/") and not rel.startswith(deny_prefix) and ".." not in rel.split("/")
if ok:
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PermissionRequest", "decision": {"behavior": "allow"}}}))
sys.exit(0)

import json, pathlib, sys
L = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop')
marker = L / 'b-round-393/update-backlog-2.done'
if marker.exists():
    print('already applied'); sys.exit(0)
d = json.loads((L / 'backlog.json').read_text())
assert d['version'] == 361
assert not any(o.get('id') == 'ARCH-CHECKPOINT-PREVIEW-AFTER-13C' for o in d['open_findings'])
d['open_findings'].append({'id': 'ARCH-CHECKPOINT-PREVIEW-AFTER-13C', 'severity': 'info', 'origin': 'B round 393 -> 394 planning', 'evidence': 'b-round-393/root-request-arch-checkpoint-preview.md', 'title': 'bounded frontend-architect checkpoint on the library preview region (decidePreviewMode / useLibraryPreviewController / settle helper)', 'status': 'open_root (D-29z1346): after PERF-13c-ii-b C PASS; same region as ARCH-CHECKPOINT-DECODE-REGION', 'added': '2026-11-07 B round 393 -> 394 planning'})
(L / 'backlog.json').write_text(json.dumps(d, ensure_ascii=True, indent=2))
marker.write_text('applied\n'); print('ok')

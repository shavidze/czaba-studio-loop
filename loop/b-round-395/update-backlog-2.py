import json, pathlib, sys
L = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop')
marker = L / 'b-round-395/update-backlog-2.done'
if marker.exists():
    print('already applied'); sys.exit(0)
d = json.loads((L / 'backlog.json').read_text())
old = json.loads((L / 'b-round-395/backlog-before-396.json').read_text())
assert d['version'] == 363
d['advisor_used_by_B'] = 'yes (round 395 -> 396 planning: advisor available; consulted after orientation and before writing; effect: archive/pre-edit copies first, closures from gate 395, seek-key ruling (a) keeping ArrangementContext untouched, perf liveness guard required before asserting, whole resources spec re-run on the sketch) | ' + old['advisor_used_by_B']
for o in d['open_findings']:
    if o.get('id') == 'GATE393-M1-SYNC-THROW':
        s = o['status']
        note = 'note: jsdom-only rows PS22/PS23 (browser cannot force a sync throw); A mutants 15/15 red a-round-395/mutants/summary.txt | '
        assert s.startswith(note)
        rest = s[len(note):]
        head, sep, tail = rest.partition(' | ')
        assert head.startswith('done (D-29z1351)')
        o['status'] = head + '; ' + note[:-3] + sep + tail
(L / 'backlog.json').write_text(json.dumps(d, ensure_ascii=True, indent=2))
marker.write_text('2026-11-07 B round 395 -> 396 planning\n')
print('ok')

# B round 344 -> 345 planning, part 3 (final-review rulings): backlog v305 -> v306. Once-only. Run from the loop root.
import json, pathlib, sys
marker = pathlib.Path('b-round-344/update-backlog-part3.done')
if marker.exists():
    sys.exit('already applied')
if not pathlib.Path('b-round-344/update-backlog.done').exists():
    sys.exit('part 2 missing')
b = json.load(open('backlog.json'))
assert b['version'] == 305, b['version']
ADDED = '2026-11-05 B round 344 -> 345 planning (part 3)'
assert all(d.get('id') != 'D-29z1089' for d in b['decisions_log_b'])
b['decisions_log_b'].append({'id': 'D-29z1089', 'date': '2026-11-05', 'text': 'Final-review rulings for round 345 (advisor): (1) RENDERS (browser, dev :5173): providerRenders 0 is the hard assert for every video gesture; workspaceRenders 0 for trim-stopped (1440) and fade; for move (stopped and playing) workspaceRenders <= 3, recorded, because the imported 10.mp4 is the only clip and moving it 0 -> 3 s moves the project end 7 -> 10 s, and each crossed timeline second renders StudioWorkspace once (DP22 contract); B could not measure the sketch on dev (D-29z1057), so there is no B oracle for those columns. (2) A-MUTANT runs b-round-344/sketch/run-unit-mutants.sh only on a scratch copy of A\'s tree (the script now refuses the store path and creates its out dir): a job killed mid-mutant must not leave a mutated store tree. (3) Harness fact B-R344-PROD-NAMES recorded. lessons.md unchanged this planning (candidate for RETRO ~351).'})
b['harness_facts'].append({'id': 'B-R344-PROD-NAMES', 'fact': 'Render probes that count components by name (ArrangementProvider, StudioWorkspace, ArrangementVideoDock; b-round-343/video-probe.mjs) read 0 on production builds because component names are minified; only totals (perMove, max, commits) are valid there. Run name-based render rows on the dev server (:5173). Evidence: b-round-344/probe/video-sketch-summary.txt (prod: provider/workspace/dock 0 while perMove 28.4).', 'added': ADDED})
b['retro_candidates'].append({'id': 'RC-R344-PROD-NAME-PROBES', 'note': 'Candidate lesson: a render-name probe is valid only on a dev build; B pre-checks name-based rows on dev or states that no B oracle exists (B-R344-PROD-NAMES). Also: in-place source mutants on the store tree are unsafe under job time limits; mutate a scratch copy (D-29z1089).', 'added': ADDED})
b['version'] = 306
b['updated'] = ADDED
json.dump(b, open('backlog.json', 'w'), ensure_ascii=False, indent=1)
marker.write_text('applied\n')
print('ok', b['version'])

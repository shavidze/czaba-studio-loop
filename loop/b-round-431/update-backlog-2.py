# B round 431 -> 432 backlog follow-up (v413 -> v414) after the advisor's close review. Idempotent guard.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-431/update-backlog-2.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 413 and b['decisions_log_b'][-1]['id'] == 'D-29z1525'
BY = '2026-11-10 B round 431 -> 432 planning'
b['decisions_log_b'].append({'id': 'D-29z1526', 'date': '2026-11-10', 'by': BY, 'decision': 'Close-review follow-ups (advisor): (1) Reference corrected from primary source: Live 12 manual 5.1.3.5 "a progress bar appears in the dialog" and 5.1.3.4 "the progress bar in the dialog resets for each individual pass" (WebFetch 2026-11-10). Our per-phase reset therefore matches Live\'s export behaviour; the "12.4.5b11 stem separation overall progress" claim came from a search summary only (release-notes page too large to fetch) and is withdrawn. SABA-Q-EXPORT-PROGRESS-OVERALL is withdrawn before reaching Saba (status wontask). (2) Row 4b now has its own script b-round-431/probe/compare-neighbours.py (load-phase samples: label == aria-valuetext == HEAD label, aria-label == HEAD, box +-1 px of HEAD); B run sketch vs head-final NEIGHBOURS OK (compare-neighbours.txt); render/wav-phase label == aria-valuetext stays unit row FV1. (3) Optimizer check: optimize-backlog.py l.41-55 reads only the top-level status; archive scan for other open-keyword statuses not in open_findings = 0 (b-round-431/archive-open-scan.txt). (4) REGRESSION-2026-11-13 scope addition REG-SABA-B-12-PROGRESS. (5) Timeout STOP limited to the two files whose rows change; render-budget R11-P1e (2006 ms / 5 s default in B covering run) is a record row.'})
for e in b['open_findings']:
    if e.get('id') == 'SABA-Q-EXPORT-PROGRESS-OVERALL':
        e['status'] = 'wontask (D-29z1526): withdrawn before reaching Saba; Live manual 5.1.3.4 says the export progress bar resets for each pass, which matches ours; the stem-separation release-note claim was search-summary only'
        e['evidence'] = 'https://www.ableton.com/en/live-manual/12/managing-files-and-sets/ 5.1.3.4 and 5.1.3.5'
for r in b['root_requests_b']:
    if r.get('id') == 'ROOT-REQ-OPTIMIZER-STATUS-SUBSTRING':
        r['detail'] = 'Only the top-level status is tested (l.49). Archive scan at this planning: no other open-keyword finding outside open_findings (b-round-431/archive-open-scan.txt). Stage sub-statuses are not affected.'
for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-2026-11-13':
        x.setdefault('scope_additions', []).append({'id': 'REG-SABA-B-12-PROGRESS', 'what': 'Export dialog progress bar: theme fill/track, indeterminate pulse, reduced motion static, forced colours appearance auto, MP3 and WAV download (b-round-431/probe/progress-probe.mjs + compare-progress.py, both viewports; only if round 432 passed)', 'added': 'D-29z1526'})
b['version'] = 414
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n')
print('backlog v414')

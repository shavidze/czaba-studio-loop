# B round 430 -> 431 backlog follow-up (v411 -> v412) after the advisor's close review. Idempotent guard.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-430/update-backlog-2.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 411 and b['decisions_log_b'][-1]['id'] == 'D-29z1519'
BY = '2026-11-10 B round 430 -> 431 planning'
b['decisions_log_b'].append({'id': 'D-29z1520', 'date': '2026-11-10', 'by': BY, 'decision': 'Close-review follow-ups (advisor): (1) STUDIO-VIS-2 severity high -> medium with kind stage_pointer of SABA-B-12 (the root audit table rated it High; the bug-gate severity is the parent SABA-B-12 Medium; avoids a duplicate open High in the active summary). (2) ARCH-SPLIT-3 keeps Saba\'s original wording (ArrangementDetailPanel.tsx + ArrangementLane.tsx + StudioContext.tsx); the conflict with LEGACY-REMOVAL-POLICY (StudioContext frozen, no refactor) is a root question at ARCH-SPLIT planning (ROOT-Q-ARCH-SPLIT-3-STUDIOCONTEXT), not a B narrowing. (3) REGRESSION-2026-11-13 scope additions: SABA-B-12 stage 1 spin probe (b-round-429/probe/spin-probe.mjs + compare.py) and stage 2a radio probes (b-round-430/probe/radio-probe.mjs + compare-radio.py, radio-extra-probe.mjs + compare-extra.py), each one short run per viewport. (4) B pre-checks added on the final sketch: full vitest 269 files / 4004 rc 0 (b-round-430/precheck-full.log), npm run lint rc 0 (205 warnings, 1 info = HEAD; precheck-lint.log), forced-colors + disabled-checked-while-rendering + WAV export probe EXTRA ALL OK (b-round-430/probe/compare-extra.txt; HEAD NOT OK).'})
for e in b['open_findings']:
    if e.get('id') == 'STUDIO-VIS-2':
        e['severity'] = 'medium'
        e['kind'] = 'stage_pointer'
        e['parent'] = 'SABA-B-12'
        e['severity_audit'] = 'high'
        e['status'] = e['status'] + ' | severity set to the parent SABA-B-12 Medium (D-29z1520)'
for x in b['post_current_stage_queue']:
    if x.get('id') == 'ARCH-SPLIT':
        for s in x['stages']:
            if s['id'] == 'ARCH-SPLIT-3':
                s['what'] = 'ArrangementDetailPanel.tsx + ArrangementLane.tsx + StudioContext.tsx (Saba 2026-11-10 wording)'
                s['root_question'] = 'ROOT-Q-ARCH-SPLIT-3-STUDIOCONTEXT: LEGACY-REMOVAL-POLICY says StudioContext.tsx is frozen legacy (no refactor) until ArrangementContext replaces studio.$productId; B asks root at ARCH-SPLIT planning whether stage 3 splits it or only audits it for removal (D-29z1520)'
b['root_requests_b'] = b.get('root_requests_b') or []
if isinstance(b['root_requests_b'], list):
    b['root_requests_b'].append({'id': 'ROOT-Q-ARCH-SPLIT-3-STUDIOCONTEXT', 'status': 'deferred_to_arch_split_planning (D-29z1520)', 'question': 'ARCH-SPLIT-3 lists StudioContext.tsx, the legacy policy freezes it: split, or removal audit only?', 'added': BY})
for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-2026-11-13':
        x.setdefault('scope_additions', []).extend([
            {'id': 'REG-SABA-B-12-SPIN', 'what': 'Detail panel number fields: no spin buttons at hover/focus (b-round-429/probe/spin-probe.mjs + compare.py, both viewports)', 'added': 'D-29z1520'},
            {'id': 'REG-SABA-B-12-RADIOS', 'what': 'Export dialog radios: theme dot, forced-colors fallback, disabled-checked while rendering (b-round-430/probe/radio-probe.mjs + compare-radio.py, radio-extra-probe.mjs + compare-extra.py, both viewports; only if round 431 passed)', 'added': 'D-29z1520'},
        ])
b['version'] = 412
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n')
print('backlog v412')

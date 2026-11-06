import json
import os
import re
import sys

LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
MARK = os.path.join(LOOP, 'b-round-369/update-backlog.done')
if os.path.exists(MARK):
    sys.exit('already applied (update-backlog.done); not re-runnable')

path = os.path.join(LOOP, 'backlog.json')
b = json.load(open(path))
assert b['version'] == 334, b['version']
NOW = '2026-11-06 B round 369 -> 370 planning'


def perf_value(log, row):
    text = re.sub(r'\x1b\[[0-9;]*m', '', open(os.path.join(LOOP, log)).read())
    m = re.search(re.escape(row) + r'\s+\w+\s+median\s+(\d+)', text)
    return int(m.group(1))


head = perf_value('b-round-369/perf-res-head.log', 'res.js.studio-lab.encoded-bytes')
sketch = perf_value('b-round-369/perf-res-sketch-final.log', 'res.js.studio-lab.encoded-bytes')

decisions = [
    ('D-29z1218', 'Round 369 accepted from C evidence: c-round-369.json PASS, 11 rows, browserVerified true, realVerified true, 0 app bugs. Gate 369 skipped (no real changes, head 29f4b4d), so round 369 is c_pass with no publication and the round-370 baseline stays 29f4b4d. RETRO 369 complete. C369-L1 (Low, origin B): retro-369 section 10 and lessons.md line 3 said no evidence id was lost; the row label R11-P1e, the chain ranges 312-314/316-317/318-320 and two descriptive phrases were dropped from L58. B corrected both lines (before-copies b-round-369/retro-369-before-370.md and lessons-before-370.md; diff b-round-369/lessons-diff.txt); round 370 carries row RT-FIX. C369-L2 (Low, origin B spec): STUDIO-SMOKE-369 named the literal "Undo: Move clip"; a cross-lane move is labelled "Undo: Move to track - <lane>" (historyMoveToTrack). Behaviour correct; closed as spec wording; later smoke rows name the cross-lane label.'),
    ('D-29z1219', 'Next scope = PERF-11 (D-29z1216 outcome table: PASS before 2026-11-08 and no root answer). Root answered none of the 18 architecture_checkpoint_requests, including ARCH-CHECKPOINT-PERF9-STEM-CACHE, so SYS-R369-STEM-CACHE-WRITE-COORDINATOR is skipped under its own condition (stays queued_conditional; its 9 Lows stay deferred). PERF-11 split: PERF-11a (round 370) = lazy @microsoft/signalr in ChatContext + RouteTransition (no framer page transition on /studio*, keyed wrapper) + three res.js encoded-bytes asserts; PERF-11b = lazy Firebase, needs a 2-line edit of the protected app/lib/auth.ts -> root/Saba request b-round-369/root-request-perf11b-firebase-lazy.md (ROOT-REQ-PERF11B-FIREBASE-LAZY, non-blocking, awaiting_user); PERF-11c = the ArrangementContext leaf-consumer inputs (GATE361-S1, SIG-R360, SIG-R361, A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT), different owner, next PERF-11 stage.'),
    ('D-29z1220', 'PERF-11 target re-based from measurement (L37/L58): perf-plan said studio-lab JS <= 230 KB (328 KB at cc207d6). Measured at HEAD 29f4b4d: %d B (C command: perf spec studio-lab-resources on a production build, b-round-369/perf-res-head.log); B sketch: %d B (perf-res-sketch-final.log). Assert budgets for round 370: studio-lab <= 372000, home <= 258000, studio-guard <= 278000. 230 KB is not reachable inside the loop: Firebase ~36 KB gzip (esbuild estimate, inference) needs PERF-11b; framer-motion 39.1 KB is reached from root via Toast/Header/LeadMagnet; the studio-lab route chunk is 123.9 KB. Recorded as a question for Saba in the root request; not a loop task.' % (head, sketch)),
    ('D-29z1221', 'PERF-11a consults (tech-lead, performance-optimizer; opinions): keep the 11a/11b/11c split; key the studio wrapper by pathname (otherwise /studio/a -> /studio/b keeps stale route state); one isHubConnected helper instead of four optional compares (no assertion, no any); keep .page-transition-wrapper (app.css l.289/294 target it); FCP/DCL/long tasks are record only, bytes and SSR opacity are asserts. Candidate recorded, not scheduled: PERF-CAND-STUDIO-LENIS (useSmoothScroll starts a Lenis rAF loop on /studio* too; perf-optimizer opinion).'),
    ('D-29z1222', 'Round 370 dispatched = PERF-11a (current-task.md). Order after it: REGRESSION at the first planning on/after 2026-11-08 -> PERF-11c -> PERF-11b if root/Saba answer -> PERF-12..15 -> SYS-R2-FAKE-FIDELITY -> SYS-CLOCK-DETERMINISM -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule). SYS-R369 runs if root answers extract/keep-fix before it is reached again. RETRO next_due 384 or end of STUDIO-PERFORMANCE.'),
]
existing = {d['id'] for d in b['decisions_log_b']}
for did, text in decisions:
    assert did not in existing, did
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-06', 'text': text})

for r in b['rounds']:
    if r.get('round') == 369:
        r['status'] = 'c_pass (D-29z1218): C round 369 PASS (c-round-369.json, 11 rows, browserVerified true, realVerified true, 0 app bugs); gate 369 skipped - no real changes (head 29f4b4d); nothing published | ' + r['status']
b['rounds'].append({'round': 370, 'task': 'current-task.md', 'decision': 'D-29z1218..D-29z1222', 'type': 'PERF-11a: lazy signalr + RouteTransition (no framer page transition on /studio*) + res.js byte asserts', 'status': 'dispatched', 'note': 'baseline 29f4b4d clean; claims b-round-369/claims-370.sh; sketch b-round-369/sketch.patch.txt', 'added': NOW})

b['open_findings'].append({'origin': 'C (against B)', 'evidence': 'c-round-369.json bugs C369-L1; c-round-369/data/lessons-diff-c.txt', 'added': NOW, 'id': 'C369-L1', 'severity': 'low', 'title': 'retro-369 section 10 and lessons line 3 said no evidence id was lost; row label R11-P1e and chain ranges were dropped from L58', 'repro': 'diff b-round-368/lessons-before-369.md lessons.md l.41', 'status': 'fixed by B (D-29z1218): retro-369 section 10 and lessons.md l.3 corrected; C re-checks in round 370 row RT-FIX'})
b['open_findings'].append({'origin': 'C (against B spec)', 'evidence': 'c-round-369/smoke.json', 'added': NOW, 'id': 'C369-L2', 'severity': 'low', 'title': 'STUDIO-SMOKE-369 named "Undo: Move clip"; a cross-lane move reads "Undo: Move to track - <lane> (Ctrl+Z)"', 'repro': 'c-round-369.md STUDIO-SMOKE-369', 'status': 'closed (D-29z1218): spec wording; product behaviour correct'})

b['deferred_low_polish'].append({'origin': 'B pre-check (tech-lead sketch review TL-4)', 'evidence': 'b-round-369/sketch-review.md TL-4', 'added': NOW, 'id': 'B-R369-CHAT-UNMOUNT-RACE', 'severity': 'low', 'title': 'ChatContext: a hub connection built after the provider unmounts is never stopped (pre-existing around start(); the lazy import widens the window)', 'repro': 'unmount ChatProvider while connect() awaits import/start', 'status': 'deferred_low_polish (D-29z1221): fix with an isMountedRef + stop() after await'})
b['open_findings'].append(dict(b['deferred_low_polish'][-1]))
q = None
for entry in b['post_current_stage_queue']:
    if entry.get('id') == 'STUDIO-PERFORMANCE':
        q = entry
assert q is not None
q['status'] = 'in_progress (D-29z1222): round 370 = PERF-11a; PERF-11b awaiting_user (protected auth.ts, root request); PERF-11c next | ' + q['status']
stages = q['stages']
idx = next(i for i, s in enumerate(stages) if s['id'] == 'PERF-11')
stages[idx]['status'] = 'in_progress (D-29z1219): split into PERF-11a (dispatched round 370), PERF-11b (awaiting_user, protected auth.ts), PERF-11c (context leaf consumers); target re-based D-29z1220 | ' + stages[idx]['status']
new = [
    {'id': 'PERF-11a', 'what': 'lazy @microsoft/signalr in ChatContext; RouteTransition: plain keyed .page-transition-wrapper on /studio*, framer fade elsewhere; res.js.{studio-lab,home,studio-guard}.encoded-bytes asserts', 'status': 'dispatched round 370 (D-29z1222)', 'measured_d29z1220': {'head_studio_lab_encoded': head, 'sketch_studio_lab_encoded': sketch, 'fcp_minus_dcl_ms_median_head_sketch': 'see b-round-369/probe/paint-final.log'}, 'added': NOW},
    {'id': 'PERF-11b', 'what': 'lazy Firebase: dynamic import of ./firebase.client inside signInWithGoogle (protected app/lib/auth.ts) + preload when AuthModal opens', 'status': 'awaiting_user (D-29z1219): ROOT-REQ-PERF11B-FIREBASE-LAZY, b-round-369/root-request-perf11b-firebase-lazy.md; options (a) root applies, (b) narrow loop grant, (c) not now', 'added': NOW},
    {'id': 'PERF-11c', 'what': 'ArrangementContext leaf consumers (absorbed inputs)', 'inputs_d29z1173': stages[idx].get('inputs_d29z1173', []) + ['A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT'], 'also_owns': ['PERF2-FIRST-FRAME-LONGTASK'], 'status': 'not_started (D-29z1222): next PERF-11 stage after round 370 (REGRESSION first when due)', 'added': NOW},
    {'id': 'PERF-CAND-STUDIO-LENIS', 'what': 'useSmoothScroll starts a Lenis rAF loop on /studio* (perf-optimizer opinion, round 369 consult)', 'status': 'candidate_not_scheduled (D-29z1221)', 'added': NOW},
]
for n in reversed(new):
    stages.insert(idx + 1, n)

for s in b['systemic_tasks']:
    if s['id'] == 'SYS-R369-STEM-CACHE-WRITE-COORDINATOR':
        s['status'] = 'queued_conditional, skipped at round 370 planning (D-29z1219): no root answer to ARCH-CHECKPOINT-PERF9-STEM-CACHE | ' + s['status']
for a in b['architecture_checkpoint_requests']:
    if a['id'] == 'ARCH-CHECKPOINT-PERF9-STEM-CACHE':
        a['status'] = 'unanswered at round 370 planning (D-29z1219); non-blocking | ' + a['status']

b['root_requests_b'].append({'id': 'ROOT-REQ-PERF11B-FIREBASE-LAZY', 'decision': 'D-29z1219', 'blocking': False, 'file': 'b-round-369/root-request-perf11b-firebase-lazy.md', 'status': 'awaiting_user: 2-line dynamic import in protected app/lib/auth.ts (~36 KB gzip on every page, estimate); popup user-activation risk; options a/b/c', 'added': NOW})

grants = [
    ('app/contexts/ChatContext.tsx', 'lazy @microsoft/signalr: type-only import, await import inside connect try, module-level loadedSignalR + isHubConnected; behaviour unchanged (task section 1.1)'),
    ('app/components/animations/RouteTransition.tsx', 'new file (task section 1.2)'),
    ('app/components/animations/index.ts', 'one export line for RouteTransition'),
    ('app/root.tsx', 'byte-equal to b-round-369/sketch-root.tsx.txt: AnimatePresence/PageTransition imports -> RouteTransition import; the AnimatePresence block -> <RouteTransition pathname isStudioPage><Outlet /></RouteTransition>; nothing else'),
    ('app/components/animations/__tests__/route-transition.test.tsx', 'new test file RT1-RT4'),
    ('app/contexts/__tests__/chat-lazy-signalr.test.tsx', 'new test file CL1-CL4'),
    ('perf/budgets.resources.json', 'three rows only: res.js.{studio-lab,home,studio-guard}.encoded-bytes mode assert, budget <= 372000/258000/278000, owner PERF-11a, note appended'),
    ('docs/implementation/2026/quarter-IV/237-perf-root-diet-studio.md', 'new implementation doc'),
]
for p, scope in grants:
    b['narrow_grants'].append({'round': 370, 'decision': 'D-29z1222', 'path': p, 'scope': scope, 'justification': 'PERF-11a'})

b['current_task'] = 'current-task.md (round 370: PERF-11a lazy signalr + RouteTransition + res.js byte asserts)'
b['version'] = 335
b['updated'] = NOW
json.dump(b, open(path, 'w'), ensure_ascii=False, indent=2)
open(MARK, 'w').write('done\n')
print('ok v335', head, sketch)

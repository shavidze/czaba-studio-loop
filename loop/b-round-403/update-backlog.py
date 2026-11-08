# B round 403 -> 404 planning: backlog v371 -> v372 (part 1: acceptance + rulings). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-403/update-backlog.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 371, b['version']
BY = '2026-11-08 B round 403 -> 404 planning'
def node(idv):
    hits = []
    def w(o):
        if isinstance(o, dict):
            if o.get('id') == idv: hits.append(o)
            for v in o.values(): w(v)
        elif isinstance(o, list):
            for v in o: w(v)
    w(b); return hits
def one(idv):
    h = node(idv); assert len(h) == 1, (idv, len(h)); return h[0]
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
M = 'b-round-403/probe/medians.txt'
decisions = [
 ('D-29z1388', "Round 403 (PERF-14c-i) accepted on independent C evidence: c-round-403.json taskStatus PASS, 12 rows passed, 0 bugs, browserVerified/realVerified true (AUTH, PEAKS-FALLBACK normal/none/failing, STUDIO-SMOKE at 1440x900 and 1280x720; mutants 8/8 red on the tree); gate 403 published cc5cbc6 on both remotes (gates/gate-round-403.json). Blocked row: fake-bearer studio-token path (backend unavailable in cloud), kept as open evidence. Closed by C rows 4/7: C-R315-T1 (PW14b), C-R315-T2 (PW24+PW24b), A-R315-REVIEW-L1 (PW25), A-R315-REVIEW-L2 (PW27/PW29, closed with residual A-R403-L2-RESIDUAL-QUEUED-THROW), A-R315-REVIEW-L3 (PW26), A-R315-REVIEW-L4 and GATE315-S2 (test hygiene in the 109/109 covering run), GATE315-S8 (doc 228 row 10). Baseline for round 404: cc5cbc6."),
 ('D-29z1389', f"PERF-14c-ii premise measured by B on cc5cbc6 scratch production builds, 200 clips, 6x, both viewports, 10 keys ({M}): HEAD default median 56/48 max 64/72, near-min median 76/68 max 88/88; mutA PEAK_SHAPE_MAX_COLUMNS 512: default 48/48 max 56/48, near-min 80/72; mutB fixed path d: default 48/48 max 56/56, near-min 76/68; mutC window x3: near-min 120/108 max 152/136 (more mounted, still churn); mutD sticky set (0 churn, mounted constant 28/23): near-min median 80/64 max 80/72. Rulings: path/column cost <= 1 Event Timing step (8 ms), so the pyramid and canvas tiles have no measured gain at the plan metric (1x target zoom p95 < 50 ms already met: <= 24 ms; DOM 1868 <= 2000). The 14c-ii churn branch is closed as measured (mutD median unchanged), PERF-CAND-14-SCROLL-HYSTERESIS closed measured. Pyramid (14c-ii) and canvas (14c-iii) are NOT dropped: awaiting_user SABA-Q-PERF14C-PYRAMID-CANVAS (user-review/questions-perf14c-pyramid-canvas.md; B recommends option 1 close PERF-14 at stage 4). Per-mounted-clip zoom cost recorded as candidate PERF-CAND-14-ZOOM-PER-CLIP-RENDER (not scheduled; 6x rows are record)."),
 ('D-29z1390', "Round 403 Lows: A-R403-REVIEW-L1 (nested request while [B,C] queued, test gap), A-R403-REVIEW-L6 (doc 228 suffix omits residual), A-R403-REVIEW-L7 (budget notes cite v1 sketch) -> deferred_low_polish. Gate 403 review items: 1 = TL-R402-SK2-L1 (updated, not duplicated), 2 = TL-R402-SK2-L2 (updated; fix: save/restore requesting), 3 = A-R403-REVIEW-L7, 4 = GATE403-L4-CPURATE-TRY (deferred, TL-R402-SK-L3 family; fold into the next owner of studio-lab-scale.perf.spec.ts). Architecture signal A-R403-ARCH-PEAKS-ONERROR (per-job onError in request(); touches ArrangementContext; not scheduled)."),
 ('D-29z1391', "End-of-PERF-14 boundary (D-29z1387): bounded frontend-architect checkpoint ARCH-CHECKPOINT-PERF14-LANE-PEAKS requested of root (b-round-403/root-request-arch-checkpoint-perf14.md), non-blocking; questions: lane pin tracking keep/extract; peaks request onError keep/extract."),
]
for did, text in decisions:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
pre(one('PERF-14c-i'), 'done (D-29z1388): C round 403 PASS (browserVerified true), gate 403 published cc5cbc6')
pre(one('PERF-14c'), 'in_progress (D-29z1389): 14c-i done (403, cc5cbc6); 14c-ii churn branch closed measured; pyramid 14c-ii + canvas 14c-iii awaiting_user SABA-Q-PERF14C-PYRAMID-CANVAS')
c2 = one('PERF-14c-ii'); pre(c2, 'awaiting_user (D-29z1389): measured no gain (mutA/mutB <= 8 ms at 6x; 1x target met); churn branch closed (mutD); SABA-Q-PERF14C-PYRAMID-CANVAS')
c2['measurement_d29z1389'] = M
pre(one('PERF-14c-iii'), 'awaiting_user (D-29z1389): canvas upper bound = mutB (fixed path) <= 8 ms at 6x; SABA-Q-PERF14C-PYRAMID-CANVAS')
pre(one('PERF-14'), 'in_progress (D-29z1389): stages 1-4 done (398-403, cc5cbc6); 14c-ii/iii awaiting_user SABA-Q-PERF14C-PYRAMID-CANVAS; plan targets met at 1x (zoom <= 24 ms, DOM 1868)')
hy = one('PERF-CAND-14-SCROLL-HYSTERESIS'); pre(hy, 'closed_measured (D-29z1389): sticky-set mutD removes churn but near-min median unchanged (80/64 vs 76/68); wider window mutC worse')
for lid in ['C-R315-T1', 'C-R315-T2', 'A-R315-REVIEW-L1', 'A-R315-REVIEW-L3', 'A-R315-REVIEW-L4', 'GATE315-S2', 'GATE315-S8']:
    pre(one(lid), 'closed (D-29z1388): C round 403 PASS, published cc5cbc6')
pre(one('A-R315-REVIEW-L2'), 'closed_with_residual (D-29z1388): C round 403 PASS (PW27/PW29); residual A-R403-L2-RESIDUAL-QUEUED-THROW deferred')
t1 = one('TL-R402-SK2-L1'); t1['gate403_echo_d29z1390'] = 'gates/round-403/review.md item 1 (same finding, published code)'
t2 = one('TL-R402-SK2-L2'); t2['gate403_echo_d29z1390'] = 'gates/round-403/review.md item 2; fix: const prev = requesting ... finally requesting = prev'
one('A-R403-L2-RESIDUAL-QUEUED-THROW')['fix_home_d29z1390'] = 'A-R403-ARCH-PEAKS-ONERROR (per-job onError) if root/ARCH-CHECKPOINT-PERF14-LANE-PEAKS says extract'
for fid, title, ev in [
 ('A-R403-REVIEW-L1', 'peaks-worker tests: the job === requesting branch is exercised only when the requesting job is pending[0]; a nested request(D) from onPeaks while [B, C] are queued, then a failing post(begin), is untested (mutant index === 0 would survive)', 'a-round-403.md review L1'),
 ('A-R403-REVIEW-L6', 'doc 228 TODO suffix "closed in PERF-14c-i" does not mention the A-R403-L2 residual (doc 257 does)', 'a-round-403.md review L6'),
 ('A-R403-REVIEW-L7', 'perf/budgets.scale.json: the 8 scale.zoom.min notes cite b-round-402/perf-sketch-scale.json (v1, 112.4) while docs 254/257 use v2 (121.1)', 'a-round-403.md review L7; gates/round-403/review.md item 3'),
 ('GATE403-L4-CPURATE-TRY', 'studio-lab-scale.perf.spec.ts 6x block: throttle applied before the try, so a throwing setCPUThrottlingRate skips the finally (TL-R402-SK-L3 family)', 'gates/round-403/review.md item 4'),
]:
    b['deferred_low_polish'].append({'id': fid, 'severity': 'low', 'origin': ev.split(' ')[0], 'evidence': ev, 'title': title, 'status': 'deferred_low_polish (D-29z1390)', 'added': BY})
b['architecture_signals'].append({'id': 'A-R403-ARCH-PEAKS-ONERROR', 'origin': 'A round 403 code-reviewer + gate 403 reviewer', 'evidence': 'a-round-403.md Architecture note; gates/round-403/review.md Architecture note', 'signal': 'requesting/requestingFailure is an error side channel in peaks.client.ts; a per-job onError in request() would remove it and the queued-job loading residual; touches ArrangementContext.tsx (ownership change)', 'status': 'signal (D-29z1390), not scheduled; asked in ARCH-CHECKPOINT-PERF14-LANE-PEAKS', 'added': BY})
b['architecture_signals'].append({'id': 'PERF-CAND-14-ZOOM-PER-CLIP-RENDER', 'origin': 'B measurement', 'evidence': M, 'signal': 'at 6x near-min zoom the zoom-key cost scales with mounted clips (24 -> ~76-88 ms, 58 -> ~120-152 ms); not path, not churn; candidate: cheaper per-clip zoom update (e.g. geometry via a CSS variable) after a CPU profile', 'status': 'candidate (D-29z1389), not scheduled (1x target met; 6x rows record)', 'added': BY})
b['architecture_checkpoint_requests'].append({'id': 'ARCH-CHECKPOINT-PERF14-LANE-PEAKS', 'decision': 'D-29z1391', 'requested_of': 'root (read-only frontend-architect, store/.claude/references/architecture-checkpoint.md)', 'file': 'b-round-403/root-request-arch-checkpoint-perf14.md', 'question': 'lane pin tracking keep/extract (A-R402-ARCH-PIN-TRACKING); peaks request onError keep/extract (A-R403-ARCH-PEAKS-ONERROR)', 'status': 'requested (D-29z1391), non-blocking', 'added': BY})
b['open_findings'].append({'id': 'SABA-Q-PERF14C-PYRAMID-CANVAS', 'severity': 'info', 'origin': 'B measurement', 'evidence': f'user-review/questions-perf14c-pyramid-canvas.md; {M}', 'title': 'pyramid (14c-ii) and canvas tiles (14c-iii): measured <= 8 ms at 6x, 0 near-min; options 1 close PERF-14 at stage 4 (B recommends) / 2 6x-only item at end of PERF / 3 build as planned', 'status': 'awaiting_user (D-29z1389); non-blocking (skip rule)', 'added': BY})
rg = one('REGRESSION-2026-11-10')
rg['scope_additions_d29z1390'] = ['PERF-14c-i (round 403, C PASS): peaks-fallback.cjs failing mode at both viewports (C round 403 row 4 is the baseline)', 'export WAV samples/duration and audio graph output (C round 403 notes: not re-measured by design)', 'fake-bearer studio-token authorised path stays BLOCKED (backend unavailable in cloud)']
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 403:
        r['status'] = 'C PASS (c-round-403.json, browserVerified true); gate 403 published cc5cbc6'
b['version'] = 372
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v371 -> v372 (part 1)\n')
print('ok v372')

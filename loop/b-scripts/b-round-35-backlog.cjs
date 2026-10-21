const fs = require('fs');
const p = 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 36) throw new Error('expected v36, got ' + b.version);
b.version = 37;
b.updated = '2026-10-13 (B: round 35 result -> round 36 re-dispatch, D-29z1)';
b.current_task = 'current-task.md (round 36: re-dispatch of C-R34-01 + C-R34-02 with the B ruling D-29z1 - the frozen fader-guards.test.tsx review test changes in exactly 3 lines (title l.1258, l.1265 and l.1272 -> not.toBe(search)); A lands the round-35 root capture handler (a-round-35/proposed-StudioWorkspace.diff) and the 12-it describe (a-round-35/new-describe.tsx.txt) red-first in store; doc 036 append + C-R34-02 correction)';
b.advisor_used_by_B += ' ; round 35 -> 36 planning (2026-10-13): advisor available, called once before writing (advice applied: rule option 1 with exact 3-line amendment and diff oracle, 53 other tests byte-identical; round 36 numbering, 4b -> 37, 4c -> 38; statuses from C evidence only (nothing moves to done); Pan centre row accepts 0 Pan entries; lane-background marquee added to the owner list; mutation (c) redefined as composed scroller capture; reuse A artifacts with red-first in store; decision CONTINUE, not BLOCKED, because the only blocker was B\'s own ruling)';

const s = b.items.find((i) => i.id === 'SRW-13');
const fix4 = s.stages.find((x) => x.stage === '4a-fix4');
fix4.status = 'a_stopped_redispatched';
fix4.result = 'round 35: A stopped at the task section 1.4 stop condition (frozen fader-guards.test.tsx l.1265/l.1272 expect the search to keep focus on a Pan pointerdown, contradicting the D-29z row "search -> range -> focus leaves"); no store change. C (c-round-35.md, BLOCKED) confirmed the conflict in its own scratch (app/lib/arrangement 1 failed | 776 passed with the proposed handler, only l.1265) and that C-R34-01 still reproduces on Volume, Pan, Master, video Volume and at 1280; G35-2 and G35-3 PASS. B gates b-round-35/gates.txt: tree unchanged, tsc 0, vitest 69/1247, build ok.';
fix4.redispatch = { round: 36, decision: 'D-29z1', acceptance: ['R36-CR', 'R36-CL', 'R36-OT', 'R36-R34', 'R36-K', 'R36-S', 'R36-U', 'R36-Doc', 'G36-1', 'G36-2', 'G36-3'] };
const st4b = s.stages.find((x) => x.stage === '4b');
st4b.round = 37;
st4b.scope = st4b.scope.replace('round-35 root capture', 'round-36 root capture');
s.stages.find((x) => x.stage === '4c').round = 38;
s.decisions_round36 = {
  result_round35: 'A stopped at section 1.4 (frozen-test conflict), no store change; C BLOCKED; C-R34-01 reproduces on all four ranges; G35-2/G35-3 PASS; nothing moves to done',
  ruling: 'option 1: the frozen test "review: during an active Pan drag a clip header pointerdown keeps the search focus" (fader-guards.test.tsx l.1258-1278) changes in exactly 3 lines: the title (l.1258) and l.1265 / l.1272 -> expect(document.activeElement).not.toBe(search). The other 53 existing tests stay byte-identical',
  ruling_reason: 'the assertion encoded a jsdom-only state (jsdom never moves focus on pointerdown). In a real browser a real click on Pan or Master already moves focus off the search natively (c-round-35/runs/cr-baseline-1440.txt, last two blocks), so the frozen line contradicted real behaviour, not the fix. The test keeps its value (clip table unchanged and search text "ab" kept during an active Pan gesture); "gesture active -> text field keeps focus" is now carried by new case 10 with a realistic preventDefault owner (detail separator)',
  option2_rejected: 'excluding the search field would contradict the D-29z row "search ab -> range -> focus leaves" and today\'s real-browser behaviour',
  pan_centre_row: 'a real click at the Pan centre leaves 0 -> 0 and writes no Pan entry; the browser row checks only the Clip Gain commit (SFX gainDb 3, +1 Clip Gain, no blocked status, activeElement Pan); the two-entry tail is proven by Volume, Master and video Volume. jsdom case 2 still fires change, so it keeps its Pan entry',
  owner_list: 'the lane-background marquee (StudioWorkspace.tsx ~l.917, preventDefault l.921; round 34 blurs first) is added to the preventDefault owner list; not a loss path',
  mutation_c: 'root attribute removed; the scroller capture becomes a composed function calling the new handler, then round 34\'s handler (React allows one onPointerDownCapture per element) -> Master (case 3) and Zoom (case 5) fail',
  reuse: 'a-round-35/proposed-StudioWorkspace.diff (sha 3ec3dca1) and a-round-35/new-describe.tsx.txt (sha ab95eb26, 12 it) are the dispatched implementation; red-first is redone in store (expected 9 failed | 57 passed on b64a2cf6); the scratch runs covered only app/lib/arrangement (37 of 69 files), so the full store vitest is the first full run',
  renumber: '4b -> round 37, 4c + polish -> round 38',
};

const f = b.open_findings;
const byId = (id) => f.find((x) => x.id === id);
Object.assign(byId('C-R34-01'), { to: 'round 36 (D-29z + D-29z1)', round35: 'still reproduces at baseline (c-round-35/runs/cr-baseline-1440.txt, cr-baseline-1280.txt): Volume, Pan, Master, video Volume lose the typed 3 with the blocked status; Zoom commits; A stopped at section 1.4, no fix landed' });
Object.assign(byId('C-R34-02'), { to: 'round 36 (D-29z1)', round35: 'doc 036 unchanged (sha e86072b8); not applied because A stopped' });
for (const id of ['A-R33-REVIEW-TOUCH', 'A-R32-REVIEW-1', 'A-R31-REVIEW-2', 'A-R29-REVIEW-1', 'FADER-KEY-ENTRIES', 'MASTER-HOLD-TICK-EDGE']) {
  const x = byId(id);
  if (x && typeof x.to === 'string') x.to = x.to.replace('(round 36)', '(round 37)');
}
const res = byId('A-R34-REVIEW-RESIDUALS');
res.to = 'stage 4b (round 37) / final regression';

const r35 = b.rounds.find((r) => r.round === 35);
Object.assign(r35, { task: 'tasks/round-35.md', status: 'a_stopped_c_blocked', result: 'A stopped at section 1.4 (frozen fader-guards.test.tsx l.1265/l.1272 contradict the D-29z search row); no store change; C BLOCKED: conflict confirmed in C scratch, C-R34-01 still reproduces on all four ranges, G35-2/G35-3 PASS, C-R23-01 2 NUL unchanged' });
b.rounds.push({ round: 36, task: 'current-task.md', items: ['C-R34-01', 'C-R34-02'], status: 'dispatched', decision: 'D-29z + D-29z1', note: 'frozen: b-round-35-tree-sha256.txt (376 files, = round-34 list); snapshots b-round-35-snapshots/ (StudioWorkspace.tsx b64a2cf6, fader-guards.test.tsx 11a19bf6, doc 036 e86072b8 - identical to round 34); baseline 9 status lines (b-round-35-git-status.txt); expected end 9 lines (or 3 if root commits rounds 31-34 first)', c_ids: ['R36-CR', 'R36-CL', 'R36-OT', 'R36-R34', 'R36-K', 'R36-S', 'R36-U', 'R36-Doc', 'G36-1', 'G36-2', 'G36-3'], owned: ['app/components/arrangement/StudioWorkspace.tsx (one root capture handler + its JSX attribute)', 'app/lib/arrangement/__tests__/fader-guards.test.tsx (append one describe + the 3-line amendment of the l.1258 review test)', 'docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md (append + header + C-R34-02 one-line correction)'] });
b.vitest_floor_round36 = 1247;
b.vitest_expected_round36 = '1259 (1247 + 12 new it), fader-guards 66';
b.baseline_tree_at_round36 = 'HEAD 1cefea1 + 9 uncommitted lines (rounds 31-34 C-verified, ready for root checkpoint); store byte-identical to round 34/35 baseline; sha256 of 376 frozen files: b-round-35-tree-sha256.txt; 3 owned snapshots in b-round-35-snapshots/; B gates b-round-35/gates.txt: 376 OK, protected 4/4, tsc 0, vitest 69/1247, build ok, Biome 2 CRLF errors (root) + 218 warnings + 1 info';
b.loop_runner_note = 'if run-loop.ps1 stopped on -RoundLimit, restart with -StartRound 36 -StartPhase A and a higher limit';

if (!b.tech_lead_manual_checks.some((x) => x.id === 'R35-T')) {
  b.tech_lead_manual_checks.push({ id: 'R35-T', what: 'with a real mouse in real Chrome, after round 36 lands: type Clip Gain 3 without Enter, then click the music Volume, Pan or Master -> SFX keeps +3.0 dB and the history shows Clip Gain, then the fader entry (a centre Pan click writes no Pan entry)', why: 'headless/CDP pointer events; real focus transfer on a real range press', added: 'round 34 planning (feature-status), backlog round 35 planning' });
}

fs.writeFileSync(p, `${JSON.stringify(b, null, 2)}\n`);
console.log('ok', b.version, b.open_findings.length, b.rounds.length, b.tech_lead_manual_checks.length);

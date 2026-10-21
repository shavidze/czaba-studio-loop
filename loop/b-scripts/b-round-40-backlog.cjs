const fs = require('fs');
const path = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(path, 'utf8'));
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
must(b.version === 41, 'version 41 expected, got ' + b.version);
b.version = 42;
b.updated = '2026-10-14 (B: round 40 result -> round 41 dispatch, D-29z6)';
b.current_task = 'current-task.md (round 41: C bug from the round-40 record - C-R40-01: the group reasons (range + Clip Gain) render in the empty middle box and the video Clip Gain reason in the waveform box under the placeholder, so they are visible in every real state; the none state is unchanged; the detail content scroller gets the existing STUDIO_SCROLLBAR_CLASS; doc 038 stale lines + round-41 section; ArrangementDetailPanel.tsx + new detail-panel-reason.test.tsx + doc 038; D-29z6)';
b.advisor_used_by_B += '; round 40 (2026-10-14): available, called once before writing (advice applied: arithmetic from C numbers rules out shorter strings and same-column placement; scrollbar alone does not close C-R40-01 (headless hides scrollbars per c-round-4 R23-1, keyboard cannot scroll); measure free space before specifying (B browse: middle box 500x91 at 1440); keep ids/testids/textContent/no truncate/no title so frozen tests stay green; bookkeeping closes C-R39-01, C-R30-01, C-R37-01; new frozen list 384 + snapshots; C criterion corrections). B chose the middle box over the header (header competes with the selection title and stays visible when collapsed); second call after writing (see b-round-40.md)';
b.vitest_floor_round41 = 1319;
b.vitest_expected_round41 = '1319 + the new it count of detail-panel-reason.test.tsx; every existing suite unchanged (detail-panel-fit 7, pending-status 22, clip-gain 28, detail-panel 24 included)';
b.baseline_tree_at_round41 = 'HEAD 6c7b4bb + round-39/40 working-tree changes (6 paths, C-verified shas ArrangementContext 91fa12d6, doc 037 9d9f2122, pending-status.test f2cd4b53, ArrangementDetailPanel dbcd5c2f, doc 038 947d9f83, detail-panel-fit.test dac18003) + 17 untracked root .codex/agents/*.toml, or a newer root commit containing exactly those shas; frozen b-round-40-tree-sha256.txt (384 = 383 + detail-panel-fit.test.tsx); snapshots b-round-40-snapshots/ (DetailPanel dbcd5c2f, doc 038 947d9f83); B gates b-round-40/gates.txt';

const lastRound = b.rounds[b.rounds.length - 1];
must(lastRound.round === 40, 'last round 40');
lastRound.status = 'C PASS';
lastRound.result = 'c-round-40.md / c-round-40.json: PASS G40-1..3 (verify exit 0, 72 files, 1319/1319; 383 OK; protected 4/4; anonymous /studio-lab direct + header link; token 401; fake Bearer 500 without token; /studio/middle-east Sign in required; Authorization 0), R40-S, R40-U (snapshot red F1-F4/F8; mutations a-i each caught), R40-Doc (with carried stale doc-038 lines), R40-PM (PM-1, PM-1280, PM-2, PM-3, PM-KEPT-TAB, PM-RAW, PM-RESET, PM-TAB, PM-R30), R40-INFO, R40-MN-1..6, R40-CR, R40-K. R40-RS measurement-only -> C-R40-01 (low, pre-existing). Round 39+40 files checkpoint-ready (6 paths, D-29z6).';
b.rounds.push({
  round: 41,
  task: 'current-task.md',
  items: ['C bug (round-40 record): C-R40-01 disabled-control reasons visible in every real state + detail content scrollbar; DOC038-STALE-LINES'],
  status: 'dispatched',
  decision: 'D-29z6',
  note: 'baseline HEAD 6c7b4bb + round-39/40 working tree (C-verified shas) or a root checkpoint of it; frozen b-round-40-tree-sha256.txt (384); snapshots b-round-40-snapshots/ (DetailPanel dbcd5c2f, doc 038 947d9f83); B measurement b-round-40/measure-none-1440.txt',
  c_ids: ['R41-RV', 'R41-SB', 'R41-NONE', 'R41-MN', 'R41-PM', 'R41-K', 'R41-S', 'R41-U', 'R41-Doc', 'G41-1', 'G41-2', 'G41-3'],
  owned: [
    'app/components/arrangement/ArrangementDetailPanel.tsx (group reasons into the middle box; video Clip Gain reason into the waveform box under the placeholder; STUDIO_SCROLLBAR_CLASS on the content scroller)',
    'app/lib/arrangement/__tests__/detail-panel-reason.test.tsx (new)',
    'docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md (status line, l.45, TODO list, new round-41 section)',
  ],
});

const findings = b.open_findings;
const byId = (id) => findings.find((x) => x.id === id);
const close = (id, text) => { const f = byId(id); must(f, id); f.status = 'closed'; f.closed = text; };
close('C-R39-01', 'round 40: C R40-PM PASS (PM-1 1440: marker <p> 69.8x16, scrollWidth 70 = clientWidth 70, scroller 107/107 +0, ring rgb(245,158,11); PM-1280 fresh load panel 142 / lane 273, 105/105 +0; PM-R30 96 -> 96); c-round-40.md section 2');
close('C-R30-01', 'round 40: C R40-INFO PASS (1280 music + range: 5 info <p> x 16 px, no overlap, scrollHeight 96 > 85, scrollTop max reaches the last line; group and 1440 states no overlap); c-round-40.md section 4');
close('C-R37-01', 'round 40: the last open part (marker visibility = C-R39-01) closed by R40-PM; parts 1-2 PASS in round 39, part 3 accepted (D-29z4)');
const fit = byId('DETAIL-REASON-FIT');
must(fit, 'DETAIL-REASON-FIT');
fit.status = 'converted';
fit.closed = 'round 40: C measured the real states (R40-RS) and confirmed clipping -> C-R40-01';
findings.push({
  id: 'C-R40-01',
  severity: 'low',
  status: 'dispatched',
  to: 'round 41 (D-29z6)',
  title: 'the disabled Clip Gain reason wraps to 3 lines in the w-32 slot and is clipped below the visible content box (video 21 px at 1440 / 23 px at 1280; group 21 / 43 px; 45 px at the 120 px minimum); the range reason is clipped 21 px in the 1280 group state; the content scrolls but shows no scroll affordance',
  evidence: 'c-round-40.md section 3; c-round-40/runs/rs-1440.txt, rsinfo-1280.txt, mn6-1440.txt; shots/rs-vid-1440-crop.png, rs-grp-1280.png',
  note: 'pre-existing layout (the reason <p> markup is byte-identical to the round-39 snapshot); not a round-40 regression',
  b_measurement: 'b-round-40/measure-none-1440.txt: 1440 default columns info 288 / middle 500 x 91 / range 176 / Clip Gain 128; nowrap widths video reason 345.5, group Clip Gain 320.6, group range 256.3, none 114.4, video placeholder 180.8; 1280 middle ~340 from C coordinates',
});
findings.push({
  id: 'DOC038-STALE-LINES',
  severity: 'low',
  status: 'dispatched',
  to: 'round 41 (D-29z6), same doc as the round-41 section',
  title: 'doc 038 l.45 still says the marker text appears under 0 dB; TODO l.230/233/234 carry old round numbers, C-R30-01 under polish, and the closed marker-clipping item',
  evidence: 'c-round-40.md R40-Doc and section 10; a-round-40.md section 5 reviewer #2/#3',
});
findings.push({
  id: 'DETAIL-RESET-SHRINK',
  severity: 'info',
  status: 'open (B option, no measured defect)',
  title: 'the 0 dB button in the marker row has no shrink-0 (a-round-40 reviewer Low #4); C measured 44.2 px stable at both viewports with the 69.8 px marker',
  evidence: 'a-round-40.md section 5 #4; c-round-40.md section 2 last paragraph',
  note: 'not scheduled while no defect is measured; F4 not pinning ring-2 (#5) likewise optional hardening',
});
findings.push({
  id: 'ENV-BROWSE-DAEMON',
  severity: 'info',
  status: 'open (environment)',
  title: 'the gstack browse daemon failed to start within 15 s twice in C round 40, one restart hung 10 min and it stopped responding after 18:05; the dev server was down 16:55-17:18 (root restarted it)',
  evidence: 'c-round-40.md section 0 and section 10',
  note: 'environment, not BLOCKED; C records and continues offline items',
});

const srw13 = b.items.find((x) => x.id === 'SRW-13');
must(srw13, 'SRW-13');
srw13.decisions_round41 = 'D-29z6: round 40 C PASS on every contracted ID; C-R39-01, C-R30-01, C-R37-01 closed; 4b-2 group 1 complete. DETAIL-REASON-FIT measured -> C-R40-01 (low) is round 41. The Pan group moves to round 42, group 3 to 43, group 4 to 44.';
const stage4b2 = (srw13.stages || []).find((st) => st.stage === '4b-2');
must(stage4b2 && Array.isArray(stage4b2.groups), '4b-2 groups');
for (const g of stage4b2.groups) {
  if (g.group === 1) {
    g.status = 'done (C round 39 every ID PASS except C-R39-01; C round 40 PASS closed C-R39-01)';
  } else if (g.group === '1-fit') {
    g.status = 'done (C round 40 PASS); DETAIL-REASON-FIT -> C-R40-01 round 41';
  } else if (g.group === 2) {
    g.round = '42';
  } else if (g.group === 3) {
    g.round = '43';
  } else if (g.group === 4) {
    g.round = '44';
  }
}
const fitIdx = stage4b2.groups.findIndex((g) => g.group === '1-fit');
stage4b2.groups.splice(fitIdx + 1, 0, { group: '1-reason', round: 41, decision: 'D-29z6', items: ['C-R40-01', 'DOC038-STALE-LINES'], status: 'dispatched' });

const r23 = (b.tech_lead_manual_checks || []).find((x) => x.id === 'R23-1');
if (r23) {
  r23.what += '; from round 41 also the detail panel content scroller (D-29z6) in the 1280x720 group state';
}
if (Array.isArray(b.planned_rounds)) {
  b.planned_rounds.push({ round: 41, items: ['C-R40-01 reasons visible (middle box) + detail content scrollbar + DOC038-STALE-LINES (D-29z6)'], note: 'C bugs first; Pan group shifted to round 42, group 3 to 43, group 4 to 44' });
}
fs.writeFileSync(path, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v42 written');

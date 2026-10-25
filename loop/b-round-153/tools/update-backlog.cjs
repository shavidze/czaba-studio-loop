// B round 153 -> 154 planning: backlog.json update (evidence: c-round-153.json PASS browserVerified, gates/gate-round-153.json published 037e25f).
const fs = require('fs'); const P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(P, 'utf8'));
if (b.version !== 145) throw new Error('unexpected version ' + b.version);
b.version = 146;
b.updated = '2026-10-25 (B round 153 -> 154 planning, D-29z119)';
b.current_task = 'current-task.md (round 154: D-29z119 - VISUAL-A V-2b-2 weight roles + remaining timecodes in mono: W1-W6 every font-semibold/font-bold in app/components/arrangement -> font-medium, peak over-state font-medium removed (mono 400); N1-N6 library row durations (inner span), library playhead, ruler labels, tempo-row labels, clip-gain reset 0 dB, lane ghost start -> font-mono; stay sans by spec list: zoom readout, library counts, 4/4, pan, selects; library preview duration -> user question B-R153-PREVIEW-DUR; from/to inside sentences -> V-2b-3; css2 URL unchanged (C WEIGHT-INVENTORY evidence first); baseline 037e25f clean; 13 grants + 1 new doc 125; frozen 959; C: T154-TARGETED, SOURCE-SCOPE, AN-REVIEW, WEIGHT-STYLE, MASTER-OVER, MONO-STYLE, RV-1-V2B2 (B prediction only gain-reset dw +3), NO-CLIP/OVERLAP, LANE-GHOST, WEIGHT-INVENTORY, FONTS-SCOPED, FUNC-SMOKE, G154-3, PX-NET/REG-HYD)';
const r153 = b.rounds.find((r) => r.round === 153);
r153.status = 'c_pass_published (C round 153 PASS browserVerified=true realVerified=true, 0 bugs; gate 153 published 037e25f)';
b.rounds.push({ round: 154, task: 'current-task.md', decision: 'D-29z119', status: 'dispatched', items: ['VISUAL-A-OBSIDIAN / V-2b-2: weight roles 600/700 -> 500 and remaining timecodes in mono (spec list)', 'doc 124 status (D1)'], note: 'baseline 037e25f clean; 13 grants (b-round-153-r154-grants.txt) + 1 new (doc 125); frozen 959 (b-round-153-r154-tree-sha256.txt); mutations m137-m140; V-2b-3 next; V-2b-DISPLAY and B-R153-PREVIEW-DUR awaiting_user' });
const v = b.post_current_stage_queue.find((x) => x.id === 'VISUAL-A-OBSIDIAN');
v.status += '; rounds 153 C PASS (c-round-153.json browserVerified=true realVerified=true, 0 bugs), published 037e25f -> V-2b-1 done; V-2b-2 = round 154 (D-29z119: weights 600/700 -> 500, peak over 400, timecodes N1-N6 mono by the spec list); V-2b-3 next (from/to timecodes inside range readout, selected-clip line, Export scope line); V-2b-DISPLAY + B-R153-PREVIEW-DUR awaiting_user';
v.v2b2_plan_d29z119 = {
  'V-2b-1': 'done (round 153, C PASS browserVerified, published 037e25f)',
  'V-2b-2': 'round 154: W1 h1, W2 Library h2, W3 group mix buttons, W4 group name, W5 Master Mute + lane M/S: font-semibold/font-bold -> font-medium; W6 peak over-state font-medium removed (mono 400); N1 library row duration (inner span), N2 library playhead, N3 ruler labels, N4 tempo-row labels, N5 clip-gain reset 0 dB, N6 lane ghost start -> font-mono',
  stays_sans_spec_list: 'zoom readout (px/s, also overflows w-16 in mono: 70 vs 64 px), library counts, 4/4, pan readout (TH8, round-151 rule), grid-division + waveform-zoom selects (+10 px, Env moves) - not timecode/BPM/dB/from-to; user-vetoable B ruling',
  'V-2b-3': 'next: from/to timecodes inside the range readout, the selected-clip line and the Export scope line in mono via part templating (textContent byte-identical); not deferred',
  css2_trim: 'Instrument Sans 600/700 and Plex Mono 500 may lose every consumer after V-2b-2; trim the studio-lab css2 URL (+TH7) only after C WEIGHT-INVENTORY (round 154) shows zero consumers on the whole /studio-lab page',
  'V-2b-DISPLAY': 'awaiting_user (unchanged), now also covers the Export ModalTitle weight 600 (protected Modal.tsx)',
  evidence: 'b-round-153/out/v2b2sim-*.json, previewprobe-*.json, zoomprobe-*.json, rulerprobe-*.json',
};
const of = b.open_findings; const find = (id) => of.find((f) => f.id === id);
find('C-R152-DOC123-L67').status = 'closed (round 153 D1; C AN-REVIEW PASS, clause was on l.70; published 037e25f)';
find('B-R152-LABEL-WIDEN-26PX').status = 'user-visible decision, may be vetoed (D-29z118 R3); C round 153 measured max 26 px horizontal, 0 vertical, 0 clip (c-round-153.json labelStyle/rv1Movers)';
find('C-R151-SIG-SANS-TIMECODES').status = 'round 154 V-2b-2 (D-29z119 R2): timecodes N1-N6 mono; zoom readout + counts stay sans by spec list; preview duration -> B-R153-PREVIEW-DUR (awaiting_user); from/to inside sentences -> V-2b-3';
of.push(
  { id: 'B-R153-PREVIEW-DUR', severity: 'info', status: 'awaiting_user (D-29z119 R2)', title: 'library preview duration is a timecode, but mono widens it 55 -> 63 px and newly ellipsizes the default preview title (slack 0 -> -6 px; -1 px even at -0.05em tracking). Options: (a) accept earlier ellipsis (full title stays in title tooltip), (b) layout change gap/width (M-type), (c) keep sans', evidence: 'b-round-153/out/previewprobe-1440.json, previewprobe-1280.json, v2b2sim-*.json' },
  { id: 'B-R153-SANS-LIST', severity: 'info', status: 'user-visible decision, may be vetoed (D-29z119 R2)', title: 'numeral mono only for the spec list (timecode, BPM, dB, from/to): zoom readout, library counts, 4/4, pan, grid/waveform selects stay Instrument Sans', evidence: 'visual-direction-a.md typography table; b-round-153/out/zoomprobe-*.json, v2b2sim-*.json monoSel' },
  { id: 'B-R153-CSS2-TRIM', severity: 'info', status: 'evidence pending: C round 154 WEIGHT-INVENTORY', title: 'after V-2b-2, Instrument Sans 600/700 and Plex Mono 500 may be unused on /studio-lab; trim css2 URL + TH7 only with C evidence of zero consumers (body:has() puts Instrument Sans on the whole page, incl. cookie banner)', evidence: 'current-task.md round 154 R4' },
  { id: 'C-R153-D6-TEMPO-ROW-TESTID', severity: 'info', status: 'tool note (C d6 PANELS key arrangement-tempo-row matches nothing; tempo header measured directly)', title: 'd6 does not cover the tempo row panel; not an app defect', evidence: 'c-round-153.md tool changes' },
  { id: 'C-R153-SR-UPPERCASE', severity: 'info', status: 'open_tech_lead_manual (real screen reader not available in cloud)', title: 'whether a screen reader spells CSS-uppercase labels letter by letter is untested; AX names unchanged', evidence: 'c-round-153.md notes; a-round-153/code-review.md' },
  { id: 'C-R153-PRED-MASTER-TEXT', severity: 'info', status: 'closed (B prediction-text error in round-153 task; measured matches B labelsim)', title: 'task predicted Master M/Volume/Peak d6 dx -14.2; only the right-anchored fieldset and label move', evidence: 'c-round-153.json notes' },
);
b.architecture_signals.push({ id: 'A-R153-ARCH-NOTE', round: 153, source: 'a-round-153.md Architecture note (verbatim there): none; six presentational class edits, three @theme tokens, one test', note: 'reviewer proposal: a shared label-class constant for the six labels (6x repeated class string)', scheduled: 'no (signal only; candidate for the V-2 boundary frontend-architect checkpoint)' });
fs.writeFileSync(P, JSON.stringify(b, null, 1) + '\n');
console.log('ok', b.version, b.rounds.length, of.length);

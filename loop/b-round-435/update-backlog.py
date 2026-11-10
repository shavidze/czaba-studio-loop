# B round 435 -> 436 planning: accept RETRO 435, dispatch COPY-PD-VIS stage 1 (v419 -> v420). Idempotent guard.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-435/update-backlog.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 419 and b['decisions_log_b'][-1]['id'] == 'D-29z1543', (b['version'], b['decisions_log_b'][-1]['id'])
BY = '2026-11-10 B round 435 -> 436 planning'
def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-10', 'by': BY, 'decision': text})
F = {f.get('id'): f for f in b['open_findings'] if isinstance(f, dict)}
D = {f.get('id'): f for f in b['deferred_low_polish'] if isinstance(f, dict)}
S = {f.get('id'): f for f in b['screen_review_candidates'] if isinstance(f, dict)}
dec('D-29z1544', 'Round 435 (RETRO 435) accepted from C evidence: c-round-435.json PASS, 0 bugs, browserVerified/realVerified true; B re-ran tools/l57-check.py on c-round-435.json (b-round-435/l57-check-c435.txt). RT-IDS was partial in C (11 systemic_task tags not re-read): B checked them itself, all 11 ids of SYS-R435-SOURCE-SCAN-HELPER.closes carry systemic_task "SYS-R435-SOURCE-SCAN-HELPER (D-29z1542)" in deferred_low_polish. Gate 435 skipped (no source change); baseline for round 436 stays 8233840. The cold-dev hydrate recurrence C saw on /studio/middle-east (attempt 1, row 2) is a confirmedBy on C-R425-01-RVM-COLD-DEV-EMPTY (L7), not a new id.')
b['retro_runs'][-1]['status'] = 'verified (D-29z1544): C round 435 PASS, browserVerified true'
D['C-R425-01-RVM-COLD-DEV-EMPTY'].setdefault('confirmedBy', []).append('c-round-435 row 2 attempt 1 (cold dev, 1440: null useState hydrate error on /studio/middle-east; no bypass; attempt 2 OK; c-round-435/auth/attempt1.*) (D-29z1544)')
dec('D-29z1545', 'COPY-PD-VIS is split into two stages, scope unchanged. Stage 1 = round 436: STUDIO-VIS-4 ("Source offset" -> "Clip origin" in the Detail panel), SR-435-2 (footer " · source offset " -> " · clip origin ") plus the third place of the same word, the inline move/trim status in ArrangementClip.tsx (so "source offset" leaves the DOM), and STUDIO-VIS-6 ("From, s"/"To, s" -> "From"/"To", Saba-approved; Q4 default since Saba has not answered). Stage 2 = round 437: STUDIO-VIS-7 (filled brass Export button incl. hover/active/disabled/busy and focus ring on brass), STUDIO-VIS-10 (CZABA link text-foreground, arrow muted, hover affordance, StudioNarrowScreen ruling) and SABA-LANE-RESIZE-HANDLE (thin visible line inside the h-1.5 hit area incl. the isHeightDragging fill, sibling handles, Why we missed it + lesson). Reason: the two Mediums are pure copy with a finished sketch; the three Lows each need state rulings and contrast measurements (advisor sizing note). COPY-PD (F11) "filled primary" is delivered by STUDIO-VIS-7 and is removed from COPY-PD when stage 2 passes. No root patch is pending on ArrangementExportDialog.tsx (no cloud/root-commits).')
for i in ('STUDIO-VIS-4', 'STUDIO-VIS-6'):
    F[i]['status'] = 'in_progress (D-29z1545): dispatched round 436 (COPY-PD-VIS stage 1, sketch b-round-435/sketch-436.patch.txt) | ' + F[i]['status']
S['SR-435-2']['status'] = 'in_progress (D-29z1545): round 436 with STUDIO-VIS-4 | ' + S['SR-435-2']['status']
for i in ('STUDIO-VIS-7', 'STUDIO-VIS-10', 'SABA-LANE-RESIZE-HANDLE'):
    F[i]['status'] = 'scheduled (D-29z1545): COPY-PD-VIS stage 2, round 437 (after stage 1 C PASS) | ' + F[i]['status']
F['SABA-LANE-RESIZE-HANDLE']['stage2_requirements'] = 'Why we missed it section + lesson (merge into L61 hover-only visuals, keep lessons.md <= 60 lines); Live 12 manual reference for track height resize or "no reference found"; rule hover, drag (isHeightDragging bg-foreground/50) and focus; grep sibling handles (hover:bg-foreground/50 in app/components/arrangement)'
F['STUDIO-VIS-7']['stage2_requirements'] = 'filled bg-brand text-brand-foreground; rule enabled:hover/active (today bg-foreground/8 /12 would un-fill), disabled opacity-40, busy label; measure text-on-brass and focus ring vs brass fill (L15); grep tests for border-brand/text-brand pins'
F['STUDIO-VIS-10']['stage2_requirements'] = 'text-foreground on the link text, arrow keeps text-muted via its own class; rule the hover affordance (hover:text-foreground becomes a no-op); rule StudioNarrowScreen.tsx CZABA in or out'
for q in b['post_current_stage_queue']:
    for st in q.get('stages', []) if isinstance(q, dict) else []:
        if isinstance(st, dict) and st.get('id') == 'COPY-PD':
            st['note_d29z1545'] = '"filled primary" is delivered by STUDIO-VIS-7 (COPY-PD-VIS stage 2, round 437); drop it from COPY-PD once that passes'
dec('D-29z1546', 'Round-436 sketch review (tech-lead, approve-with-lows, b-round-435/sketch-review.md): TL-R436-01 info accepted; TL-R436-02 (inline status literal duplicates "clip origin") and TL-R436-03 (WCAG 2.5.3 label-in-name on From/To, pre-existing at HEAD) -> deferred_low_polish; TL-R436-04 (labels lose the unit) is already Saba question Q4 / SR-435-1, no new id.')
for i, o, title, ev in [
 ('TL-R436-02-INLINE-STATUS', 'pre-existing', 'the move/trim status text in ArrangementClip.tsx is an inline literal; after round 436 the word "clip origin" lives there and in strings.ts (sourceOffsetLabel, clip-offset-label); move it into a strings.ts builder next to selectedClipDetail', 'b-round-435/sketch-review.md TL-R436-02'),
 ('TL-R436-03-LABEL-IN-NAME', 'pre-existing', 'WCAG 2.5.3: the Detail range inputs show "From"/"To" (HEAD: "From, s"/"To, s") but their aria-label "Time selection start/end (seconds)" overrides the label text, so the visible word is not in the accessible name; start the name with the visible word', 'b-round-435/sketch-review.md TL-R436-03'),
]:
    b['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': o, 'status': 'deferred_low_polish (D-29z1546)', 'title': title, 'evidence': ev, 'added': BY})
dec('D-29z1547', 'Round 436 dispatched: COPY-PD-VIS stage 1 on 8233840 (current-task.md, claims b-round-435/claims-436.sh). Reference: Live 12 manual 8.2.1 (clip start/end value fields show min:sec:ms for unwarped audio); deviations: "Clip origin" is Saba-approved wording (audit answer 1) for what Live calls the clip Start marker, because CZABA uses Start for the timeline position; bare "From"/"To" follows Saba approval and stays Q4. Order after it: REGRESSION-2026-11-13 at the first planning on or after 2026-11-13; else COPY-PD-VIS stage 2 (437), SYS-R435-SOURCE-SCAN-HELPER, SYS-1, SYS-3, STORE-REDESIGN 2b..5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule); STEM-LANES jumps ahead on Saba answer; next RETRO round 450.')
b['rounds'].append({'round': 435, 'task': 'tasks/round-435.md', 'decision': 'D-29z1544', 'type': 'RETRO 435', 'status': 'C PASS (browserVerified); gate skipped (no source)'})
b['rounds'].append({'round': 436, 'task': 'current-task.md', 'decision': 'D-29z1547', 'type': 'COPY-PD-VIS stage 1 (STUDIO-VIS-4 + SR-435-2 + STUDIO-VIS-6)', 'status': 'dispatched', 'note': 'baseline 8233840 clean; sketch b-round-435/sketch-436.patch.txt; claims b-round-435/claims-436.sh'})
b['current_task'] = 'Round 436: COPY-PD-VIS stage 1 (STUDIO-VIS-4 Clip origin + SR-435-2 footer + move/trim status; STUDIO-VIS-6 From/To) on 8233840 (current-task.md)'
b['version'] = 420
b['updated'] = '2026-11-10'
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n'); print('ok v420')

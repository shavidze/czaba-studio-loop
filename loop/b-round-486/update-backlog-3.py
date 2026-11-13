import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'
mark=os.path.join(L,'b-round-486/update-backlog-3.done')
if os.path.exists(mark): sys.exit('already applied')
p=os.path.join(L,'backlog.json'); b=json.load(open(p,encoding='utf-8'))
by='2026-11-13 B round 486 -> 487 planning'
sha=open(os.path.join(L,'b-round-486/sketch-487.sha256')).read().split()[0]
D=b['decisions_log_b']; assert D[-1]['id']=='D-29z1736'
D.append({"id":"D-29z1737","date":"2026-11-13","by":by,"decision":"Round 487 sketch v4 (sha "+sha+", supersedes v3 b2eee700...) after the closing advisor check: B's Chromium browser mutants (b-round-486/probe/x/) showed active:transform-none! is load-bearing (without it the pressed transform is matrix(0.98...)) while select-text changed no measured gesture (drag from outside / on text / double-click equal to HEAD) -> v4 drops select-text (L58); tech-lead delta APPROVE. New browser rows: PN-HELD-FAST-STUBBED (instant PUT, repeats outlive the save: 1 PUT, focus on the name button; HEAD 2 PUTs + BODY; browser mutant without the trigger guard re-opens the editor) and PN-KBSAVE-500-STUBBED (keyboard Save + 500: focus First name; HEAD BODY). L50 block added to the task (18 hits on the sketch, b-round-486/l50-hits.txt, each ruled). v4 re-checked: 14 mutants red, covering 5/74, full suite 293/4273 rc 0, tsc rc 0, 18 screenshot pairs 0 px (probe/v4/). B-R486-FOCUS-OFFSET-GUARD's fix also names the Profile name button's active:transform-none!. INFO-B487-HEADER-BAND-1280 recorded in harness_facts. The v3 FIREFOX-CHECKS note for select-text is moot (class dropped)."})
for d in D:
    if d['id']=='D-29z1735': d['decision']+=' | amended by D-29z1737: dispatched sketch is v4 sha '+sha[:16]+' (select-text dropped).'
for g in b['deferred_low_polish']:
    if g['id']=='B-R486-FOCUS-OFFSET-GUARD':
        g['fix']+=' ; and the same active:transform-none! on the Profile name button (account.tsx, round 487)'
hf=b['harness_facts']
hf.append({"id":"INFO-B487-HEADER-BAND-1280","added":by,"note":"At 1280x720 the Store header's top edge (bbox [1047,16,1122,17], 11 px) differs between captures of the same tree (HEAD vs HEAD: b-round-486/probe/headctl/pxdiff-control.txt 11 then 0; v4 full-frame 0). Environment drift outside page content; pixel rows on Store pages below the header use pxdiff-region.mjs YMIN=80 or a same-run HEAD pair."})
for r in b['rounds']:
    if r.get('round')==487: r['note']=r['note'].split('; sketch b-round-486')[0]+'; sketch b-round-486/sketch-487.patch.txt v4 sha '+sha[:16]+' (D-29z1737); probes b-round-486/probe'
b['version']=b['version']+1; b['updated']='2026-11-13'
json.dump(b,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
open(mark,'w').write('ok\n'); print('v',b['version'])

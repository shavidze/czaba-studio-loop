import json
p='backlog.json'
b=json.load(open(p))
it=[i for i in b['items'] if i['id']=='TM-B29'][0]
it['status']='in_progress'
it['round']=27
it['realVerified']=False
it['commit']='6c956b41dee3580d01c6285c9c7c3e1c8495101c (published, not verified by evidence in the loop folder)'
it['note_b_r26']=("R26 closed BLOCKED (A and C: baseline mismatch). The TM-B29 implementation is already on origin/master as 6c956b4 "
 "(parent c2c19a7, 8 owned paths only, authored 15:37Z). Its commit message cites C PASS (c-round-26.json) and review COMMIT OK, "
 "but the loop folder was restored to round-26 start at 18:43Z and holds no such C report, gate or review. "
 "C's R26 sanity run on 6c956b4 (check exit 0, Biome 0/8, renderer 216/216, main 93/93) is supporting data only, not acceptance. "
 "Not done until C re-verifies R26-1..R26-6 against c2c19a7..6c956b4 (round 27, R27-1..R27-6).")
for f in b['findings']:
    if f.get('id') in ('C-R25-03','C-R25-04','A-R25-02','A-R25-03'):
        f['routed_to']='TM-B29 docs, published in 6c956b4; closes only on C R27-6'
b['findings'].append({"round":26,"id":"B-R26-01","source":"A R26 / C R26 (baseline mismatch), B R26 timestamps","severity":"medium","status":"open",
 "title":"Loop-folder / repository desync: 6c956b4 'verified loop rounds 26-26' was published at 15:37Z citing C PASS and review, then the loop folder was restored to the round-26 start state (18:43Z) and round 26 re-ran against a moved HEAD. The original C report, gate and review for 6c956b4 are not in the loop folder; A's process evidence (Edit/Write only, A-R17-02) for that implementation is unrecoverable.",
 "routed_to":"root (restore/state process); B re-verifies the published diff in round 27"})
b['findings'].append({"round":26,"id":"C-R26-01","source":"C R26 sanity run on 6c956b4","severity":"info","status":"open",
 "title":"Supporting data only: on 6c956b4 fixtures + npm run check exit 0, Biome 0 errors / 8 warnings, renderer 216/216 (11 files), main 93/93; E2E and real-app not run (c-round-26/check.log)",
 "routed_to":"TM-B29 R27 (not acceptance)"})
for r in b['rounds']:
    if r['round']==26:
        r['status']='BLOCKED (A and C: HEAD 6c956b4 != baseline c2c19a7); no implementation in this run; gate skipped; TM-B29 code already published as 6c956b4 out of band, unverified in loop folder'
        r['findings']=r.get('findings',[])+['B-R26-01','C-R26-01']
b['rounds'].append({"round":27,"task":"TM-B29 re-verification of the published diff c2c19a7..6c956b4 (R27-1..R27-6 = R26-1..R26-6); A makes no change","status":"planned","baseline":"6c956b41dee3580d01c6285c9c7c3e1c8495101c (clean)","items":["TM-B29"],"findings":["B-R26-01","C-R26-01","C-R25-03","C-R25-04"]})
b['current_task']="Round 27: TM-B29 re-verification on baseline 6c956b4 (C verifies c2c19a7..6c956b4; A idle)"
for d in b['decisions']:
    if d.get('id')=='D-34':
        d['status']='implemented in 6c956b4 (published); verification pending R27'
json.dump(b,open(p,'w'),ensure_ascii=False,indent=2)
print('ok')

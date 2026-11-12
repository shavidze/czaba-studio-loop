import json, os, sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; M=L+'/b-round-461/update-backlog-462b.done'
if os.path.exists(M): sys.exit('already applied')
p=L+'/backlog.json'; b=json.load(open(p)); assert b['version']==454
NOW='2026-11-12 B round 461 -> 462 planning'
def find(k,i):
    return [f for f in b[k] if isinstance(f,dict) and f.get('id')==i][0]
d=find('decisions_log_b','D-29z1631')
d['decision']=d['decision'].replace('delete the 7 dead Store modules','delete 6 dead Store modules (v2)').replace('sketch-462.patch.txt sha 59a9293fdf6721ea (tech-lead APPROVE, 4 Lows ruled)','sketch-462.patch.txt v2 sha 2ce4b5e5c942373c (v1 59a9293f tech-lead APPROVE, 4 Lows ruled; v2 holds ArtistBioSection after the advisor closing check: it is the only renderer of the NEWSLETTER_STATS stats Downloads/Products/10K+ Happy Producers, keep-list \"all other stats and claims\"; Q6 had wrongly said only Testimonials held keep-list content -> SABA-Q-ARTISTBIO-STATS, user-review/questions-round-462.md, default keep; tech-lead delta review on v2)').replace('TestimonialsSection kept (keep-list)','ArtistBioSection and TestimonialsSection kept (keep-list)')+' Browser pre-check (b-round-461/probe/run1/store-pages.json): 6 pages x 2 viewports, HEAD vs tree text equal with a HEAD-HEAD control, 0 elements carry the 12 removed utility tokens, no chunk 404. Saved scripts build-compare.py, css-live-grep.py, probe/store-pages.cjs; mutants M1-M9.'
lg=find('open_findings','LEGACY-DEAD-STORE-COMPONENTS')
lg['status']=lg['status'].replace('stage 1 = round 462 STORE-2b-3d-1 deletes ArtistBioSection, VideoShowcase','stage 1 = round 462 STORE-2b-3d-1 deletes VideoShowcase').replace('TestimonialsSection (SABA-Q-TESTIMONIALS-UNMOUNTED)','ArtistBioSection (SABA-Q-ARTISTBIO-STATS) and TestimonialsSection (SABA-Q-TESTIMONIALS-UNMOUNTED)',1)
b['open_findings'].append({'id':'SABA-Q-ARTISTBIO-STATS','severity':'info','origin':'B planning round 462 (advisor closing check)','status':'awaiting_user (D-29z1631): user-review/questions-round-462.md; default (b) keep the file; does not block the loop','title':'ArtistBioSection.tsx (unmounted) is the only renderer of NEWSLETTER_STATS (Downloads, Products, 10K+ Happy Producers); keep-list covers all stats and claims; Q6 (questions-retro-450.md) wrongly said only Testimonials held keep-list content. Options: (a) delete, (b) keep for STORE-3/5 reuse, (c) reconcile 10K+ Happy Producers with /about 2,500+ Happy Customers','evidence':'b-round-461/claims-462-planning-output.txt K6; store-redesign-spec.md keep-list item 2','added':NOW})
q=[e for e in b['post_current_stage_queue'] if isinstance(e,dict) and e.get('id')=='STORE-REDESIGN'][0]
q['status']=q['status'].replace('round 462 = STORE-2b-3d-1 (delete the 7 dead Store modules;','round 462 = STORE-2b-3d-1 (delete 6 dead Store modules, ArtistBioSection held;',1)
sp=[s for s in q['stages'] if s['id']=='STORE-2'][0]['split_2b_d29z1583']
sp['STORE-2b-3d-1']='dispatched round 462 (D-29z1631): sketch v2 sha 2ce4b5e5 deletes VideoShowcase, PianoLoadingAnimation, PianoCurtainLoader, CinemaCurtainLoader, audio/Timeline, lib/email.server.ts (ArtistBioSection held: SABA-Q-ARTISTBIO-STATS); barrels; GT1b/GT3/GT4b/GT5/GT5b/GT6, TS2, GS2, LT7 updates; prod build HEAD vs sketch: server/JS equal after normalization, CSS -12 utilities with 0 live users; browser text equal (b-round-461/build-compare.txt, probe/run1/store-pages.json)'
sp['STORE-2b-3d']=sp['STORE-2b-3d'].replace('sketch b-round-461/sketch-462.patch.txt sha 59a9293f, tech-lead APPROVE','sketch b-round-461/sketch-462.patch.txt v2 sha 2ce4b5e5',1)
r=[x for x in b['rounds'] if x.get('round')==462][0]
r['type']='STORE-2b-3d-1: delete 6 dead Store modules (LEGACY-DEAD-STORE-COMPONENTS stage 1; ArtistBioSection held)'
r['note']='baseline a7fa78e (gate 461 published); A applies b-round-461/sketch-462.patch.txt v2 sha 2ce4b5e5; grants = b-round-461/grants-462.txt (15 paths)'
b['current_task']='Round 462: STORE-2b-3d-1, delete 6 dead Store modules (current-task.md, D-29z1631)'
json.dump(b,open(p,'w'),indent=2); open(M,'w').write('applied\n'); print('ok')

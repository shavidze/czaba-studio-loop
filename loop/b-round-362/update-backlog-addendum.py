import json,os,sys
L='/home/runner/czaba-project/tmp/studio-real-loop'; done=L+'/b-round-362/update-backlog-addendum.done'
if os.path.exists(done): sys.exit('already applied')
p=L+'/backlog.json'; b=json.load(open(p))
d=[x for x in b['decisions_log_b'] if x.get('id')=='D-29z1179'][0]
old='C-R362-MARKER-PLAYING-NONE-UNREACHABLE closed as an accepted coverage limit: adjacentMarkerTarget treats project end as a forward target, so the playing none-text is not reachable forward in the browser; IM24 jsdom guards the branch (hypothesis, unverified: the backward branch near 0 while playing).'
assert old in d['text']
d['text']=d['text'].replace(old,'C-R362-MARKER-PLAYING-NONE-UNREACHABLE: forward playing none-text is not user-reachable (adjacentMarkerTarget returns project end as a forward target; markers.ts); the backward none-text needs position <= MARKER_TIME_EPS (0.5 ms) while playing; scheduled as best-effort C row MARKER-NONE-PLAYING-BACK in round 363 (not counted toward browserVerified); IM24 remains the guard. Round 363 reset fact (advisor check): a name-bar click without movement neither seeks nor sets the Insert Marker (ArrangementClip seekTo only in the range-body branch; no setInsertMarker), K18. PERF row comparison: hard floor none higher than C362; rows before the new step INFO on difference, rows after must equal C362.')
f=[x for x in b['open_findings'] if x.get('id')=='C-R362-MARKER-PLAYING-NONE-UNREACHABLE'][0]
f['status']='scheduled best-effort (D-29z1179): forward branch not user-reachable; backward branch (position <= 0.5 ms while playing) gets C row MARKER-NONE-PLAYING-BACK in round 363; closes as observed or as an accepted coverage limit with C evidence; IM24 guards the branch'
json.dump(b,open(p,'w'),ensure_ascii=False,indent=1); open(done,'w').write('ok\n'); print('ok')

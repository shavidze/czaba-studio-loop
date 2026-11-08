import json
d=json.load(open('b-round-415/backlog-before-416.json'))
aw=[x['id'] for p in ('open_findings','ableton_recommendations','design_ux_recommendations','screen_review_candidates') for x in d.get(p,[]) if isinstance(x,dict) and 'awaiting_user' in str(x.get('status',''))[:40]]
open('c-round-416/data/awaiting-user.txt','w').write(f'{len(aw)}\n'+'\n'.join(aw)+'\n')
print(len(aw))

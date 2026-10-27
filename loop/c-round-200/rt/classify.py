import json,re,collections
d=json.load(open('backlog.json'))
pools={'open_findings':d['open_findings'],'deferred_low_polish':d['deferred_low_polish']}
cf=d.get('closed_findings_d29z163')
if isinstance(cf,list): pools['closed_findings_d29z163']=cf
CATS=[('a11y/announcements',r'aria|announce|screen.?reader|live region|accessible name|role='),
('focus',r'focus|ring|outline'),
('keyboard',r'keyboard|shortcut|\bkey\b|keydown|enter|escape|tab\b|ctrl|shift|alt\+|arrow'),
('copy/i18n',r'wording|copy|georgian|english|string|text reads|label|translat|typo'),
('timing/audio',r'audio|meter|playback|play\b|drift|export|mp3|wav|metronome|fade|gain|volume|sync|latency|cls|lcp'),
('tests/harness',r'test|harness|selector|vitest|jsdom|mutant|scanner|guard false'),
('docs/process',r'\bdoc\b|docs|status line|task text|spec|criterion|B ruling|process'),
('layout/visual',r'px|layout|clip|overflow|wrap|contrast|colou?r|font|glyph|border|radius|width|height|visual|token|notch|corner'),
]
def rnd(i):
    m=re.match(r'(?:C-R|A-R|GATE|B-R|ROOT-R|INFO-C|C-)(\d+)',i)
    return int(m.group(1)) if m else None
def origin(i):
    if i.startswith(('C-R','INFO-C','C-')): return 'C'
    if i.startswith('GATE'): return 'gate reviewer'
    if i.startswith(('A-R','INFO-A')): return 'A'
    if i.startswith('B-R'): return 'B'
    if i.startswith(('ROOT','root')): return 'root'
    if i.startswith(('SABA','ABL','DUX')): return 'user/review'
    return 'other'
def cat(t):
    for c,rx in CATS:
        if re.search(rx,t,re.I): return c
    return 'uncategorised'
out={}
for name,L in pools.items():
    rows=[]
    for f in L:
        i=f.get('id','');r=rnd(i)
        t=' '.join(str(f.get(k,'')) for k in ('title','note','actual','status'))
        rows.append({'id':i,'round':r,'origin':origin(i),'sev':str(f.get('severity','')).split(' ')[0],'cat':cat(t)})
    win=[x for x in rows if x['round'] and 123<=x['round']<=199]
    out[name]={'total':len(rows),'window_123_199':len(win),
      'origin_all':collections.Counter(x['origin'] for x in rows),
      'origin_window':collections.Counter(x['origin'] for x in win),
      'sev_window':collections.Counter(x['sev'] for x in win),
      'cat_window':collections.Counter(x['cat'] for x in win),
      'window_ids':[ (x['id'],x['sev'],x['cat']) for x in win]}
json.dump(out,open('c-round-200/rt/classify-out.json','w'),indent=1,ensure_ascii=False,default=dict)
for k,v in out.items():
    print('##',k,'total',v['total'],'window',v['window_123_199'])
    for kk in ('origin_all','origin_window','sev_window','cat_window'): print(' ',kk,dict(v[kk]))

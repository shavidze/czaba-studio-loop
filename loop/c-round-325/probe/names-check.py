# C325 DRAG-NAMES check over names-{head,a}-{vp}.json
import json, collections
EIGHT = ['ArrangementProvider','StudioWorkspace','ArrangementTransport','ArrangementLibrary','ArrangementRuler','ArrangementMaster','ArrangementExportDialog','ArrangementShortcutSheet']
for vp in ['1440x900','1280x720']:
    H = json.load(open(f'names-head-{vp}.json')); A = json.load(open(f'names-a-{vp}.json'))
    print('=====', vp)
    for tag, D in [('HEAD', H), ('A', A)]:
        for blk in ['trim-moves','move-moves','fade-moves','zoom-keys','harness-clip-click']:
            cs = D.get(blk, [])
            rows = []
            for c in cs:
                n = c.get('names', []); cnt = collections.Counter(n)
                rows.append((c.get('rendered'), [e for e in EIGHT if e in cnt], cnt.get('ArrangementLane', 0), cnt.get('ArrangementOverviewWithPreviewInner', 0)))
            print(f'{tag:4} {blk:18} commits={len(cs)} per-commit(rendered, eight-names, lanes, ovWrapper)=', rows)
    for blk in ['fade-moves','zoom-keys','move-moves']:
        h = [collections.Counter(c.get('names', [])) for c in H.get(blk, []) if c.get('rendered')]
        a = [collections.Counter(c.get('names', [])) for c in A.get(blk, []) if c.get('rendered')]
        hs = sum(h, collections.Counter()); as_ = sum(a, collections.Counter())
        print(f'  {blk} name delta A-HEAD (summed over commits; commits H={len(h)} A={len(a)}):', {k: as_[k]-hs[k] for k in set(hs)|set(as_) if as_[k]!=hs[k]})

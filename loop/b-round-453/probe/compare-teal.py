# usage: python3 -I compare-teal.py <head.json> <tree.json>   -> per-row OK/FAIL, last line "ROWS n ALL_OK bool"
import json, re, sys
h = json.load(open(sys.argv[1])); t = json.load(open(sys.argv[2])); hr = h['rows']; tr = t['rows']
TEAL = re.compile(r'19,\s*217,\s*204|20,\s*184,\s*166|18,\s*217,\s*200|hsl\(175')
rows = []
def row(name, ok, info=''):
    rows.append((name, bool(ok), info))
def g(d, *ks):
    for k in ks:
        d = d.get(k) if isinstance(d, dict) else None
    return d
row('HEAD-CONTROL-TEAL', all(k in h['tealRows'] for k in ['cardBefore','cardAfter','artworkRest','playRest','playHover','nfGrid','nfCode4','nfCode0','paletteSelected']) and 'rgba(18, 217, 200' in str(g(hr,'cartList','scrollbarColor')), h['tealRows'])
row('TREE-NO-TEAL', t['tealRows'] == [] and not TEAL.search(json.dumps(tr)), t['tealRows'])
row('PLAYER-PRESENT', tr.get('player') == 1 and hr.get('player') == 1)
row('ARTWORK', g(tr,'artworkRest','boxShadow') == 'rgba(0, 0, 0, 0.4) 0px 4px 12px 0px' and g(tr,'artworkHover','boxShadow') == 'rgba(0, 0, 0, 0.5) 0px 6px 16px 0px' and g(tr,'artworkRest','box') == g(hr,'artworkRest','box'))
row('PLAY-REST-HOVER', g(tr,'playRest','boxShadow') == 'none' and g(tr,'playHover','boxShadow') == 'none' and g(tr,'playRest','backgroundColor') == 'rgb(201, 164, 106)' and g(tr,'playHover','backgroundColor') == 'rgb(217, 184, 127)' and g(tr,'playRest','box') == g(hr,'playRest','box'))
row('PLAY-PAUSED-STATE', tr.get('labelsPlaying') == hr.get('labelsPlaying') and tr.get('labelsPaused') == hr.get('labelsPaused') and tr.get('labelsPlaying', {}).get('player') != tr.get('labelsPaused', {}).get('player') and g(tr,'playPaused','boxShadow') == 'none' and g(tr,'playPaused','backgroundColor') == 'rgb(201, 164, 106)', [tr.get('labelsPlaying'), tr.get('labelsPaused')])
row('PLAY-FOCUS-RING', g(tr,'playFocus','focusVisible') is True and g(tr,'playFocus','outline').startswith('solid 1px'), g(tr,'playFocus','outline'))
row('THUMB-HOVER-RULE', tr.get('thumbRules') and all(r.endswith('=> rgba(0, 0, 0, 0.3) 0px 2px 8px') for r in tr['thumbRules']), tr.get('thumbRules'))
row('CARD-AFTER-GONE', g(tr,'cardAfter','content') == 'none' and g(tr,'cardAfter','backgroundImage') == 'none' and 'rgba(19, 217, 204' in str(g(hr,'cardAfter','backgroundImage')))
row('CARD-BEFORE-NEUTRAL', 'color(srgb 0.92549 0.901961 0.854902 / 0.06) 40%' in str(g(tr,'cardBefore','backgroundImage')) and 'rgba(255, 255, 255, 0.25) 0%' in str(g(tr,'cardBefore','backgroundImage')) and g(tr,'cardBefore','animationName') == g(hr,'cardBefore','animationName'), g(tr,'cardBefore','backgroundImage'))
row('NF-GRID', str(g(tr,'nfGrid','backgroundImage')).count('color(srgb 0.92549 0.901961 0.854902 / 0.03) 1px') == 2 and g(tr,'nfGrid','box') == g(hr,'nfGrid','box'))
row('NF-CODE4', g(tr,'nfCode4','textShadow') == 'none' and g(tr,'nfCode4','box') == g(hr,'nfCode4','box'))
row('NF-CODE0-RING', g(tr,'nfCode0','boxShadow') == 'none' and g(tr,'nfCode0','borderTop') == '4px solid rgb(201, 164, 106)' and g(tr,'nfCode0','box') == g(hr,'nfCode0','box'))
row('PALETTE-SELECTED', g(tr,'paletteSelected','backgroundColor') == 'rgba(201, 164, 106, 0.12)' and (tr.get('paletteTextContrast') or 0) >= 4.5 and tr.get('paletteItems') == hr.get('paletteItems'), [tr.get('paletteSelectedComposite'), tr.get('paletteTextContrast')])
row('PALETTE-KEYS-HOVER', tr.get('paletteSelectedIndexAfterHover') == hr.get('paletteSelectedIndexAfterHover') and tr.get('paletteArrowIndex') == hr.get('paletteArrowIndex'), [tr.get('paletteSelectedIndexAfterHover'), tr.get('paletteArrowIndex')])
row('CART-LIST-SCROLLBAR', g(tr,'cartList','scrollbarColor') == 'rgb(115, 107, 96) rgba(0, 0, 0, 0)' and tr.get('cartListOverflow') == hr.get('cartListOverflow') and (tr.get('cartListOverflow') or [0,0])[0] > (tr.get('cartListOverflow') or [0,1])[1] and g(tr,'cartList','box') == g(hr,'cartList','box'))
row('CONFIRM-DIALOG-SCROLLBAR', tr.get('confirmDialog') == 1 and tr.get('confirmScroll') == 'rgb(115, 107, 96) rgba(0, 0, 0, 0)', tr.get('confirmScroll'))
row('STUDIO-DIGEST', g(tr,'studioDigest','sha') == g(hr,'studioDigest','sha') and g(tr,'studioDigest','n') == g(hr,'studioDigest','n') and (g(tr,'studioDigest','n') or 0) > 500, [g(hr,'studioDigest'), g(tr,'studioDigest')])
row('PAGE-ERRORS', t.get('pageErrors') == 0 and h.get('pageErrors') == 0, [h.get('pageErrors'), t.get('pageErrors')])
for n, ok, info in rows:
    print(('OK  ' if ok else 'FAIL'), n, info if (info and not ok) or n in ('PALETTE-SELECTED','CARD-BEFORE-NEUTRAL','PLAY-PAUSED-STATE') else '')
print('ROWS', len(rows), 'ALL_OK', all(ok for _, ok, _ in rows))

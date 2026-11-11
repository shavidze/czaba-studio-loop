# usage: python3 -I compare-glow.py <head.json> <tree.json>  -> one line per row, ends "ROWS n ALL_OK bool"
import json, sys
h = json.load(open(sys.argv[1])); t = json.load(open(sys.argv[2]))
ACTIVE_OPACITY = {'HEADER-SIGNIN': '0.8', 'HERO-CTA': '0.8', 'NOTFOUND-CTA': '0.8', 'LOGIN-STUB': '1', 'SEARCH-STUB': '1', 'REQUIREAUTH-BUTTON': '0.9', 'SUPPORT-START-CHAT': '1'}
hk = {(r['id'], r['vp']): r for r in h['targets']}
rows = []; ok_all = True
for r in t['targets']:
    key = (r['id'], r['vp']); hr = hk.get(key, {}); fails = []
    if 'error' in r or 'error' in hr:
        fails.append('probe error: ' + r.get('error', hr.get('error', '')))
    else:
        for st in ['rest', 'hover', 'active', 'keyboardFocus']:
            a = r[st]['analysis']
            if a['zeroOffsetGlowLayers'] or a['tealShadowLayers']:
                fails.append(f'{st} glow/teal shadow {r[st]["boxShadow"]}')
            if a['bgHue'] is not None and 160 <= a['bgHue'] <= 200:
                fails.append(f'{st} teal background {r[st]["backgroundColor"]}')
        if r['rest']['box'] != hr['rest']['box']:
            fails.append(f'box {r["rest"]["box"]} != head {hr["rest"]["box"]}')
        if r['disabled']:
            if r['hover']['backgroundColor'] != r['rest']['backgroundColor'] or r['hover']['opacity'] != '0.5':
                fails.append('disabled hover changed')
        else:
            if r['rest']['backgroundColor'] != 'rgb(201, 164, 106)':
                fails.append(f'rest bg {r["rest"]["backgroundColor"]}')
            if r['hover']['backgroundColor'] != 'rgb(217, 184, 127)' or r['hover']['opacity'] != '1':
                fails.append(f'hover bg/opacity {r["hover"]["backgroundColor"]} {r["hover"]["opacity"]}')
            for st in ['rest', 'hover']:
                c = r[st]['analysis']['textContrast']
                if c is None or c < 4.5:
                    fails.append(f'{st} contrast {c}')
            if r['active']['opacity'] != ACTIVE_OPACITY[r['id']]:
                fails.append(f'active opacity {r["active"]["opacity"]}')
            if r['active']['focusVisible'] or r['active']['outlineStyle'] != 'none':
                fails.append('ring shown under a pointer press')
            kf = r['keyboardFocus']; hf = hr['keyboardFocus']
            if not kf['focusVisible'] or kf['outlineStyle'] != 'solid':
                fails.append('keyboard ring missing')
            if [kf[k] for k in ('outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset')] != [hf[k] for k in ('outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset')]:
                fails.append('ring differs from head')
            if not (hr['hover']['analysis']['tealShadowLayers'] >= 1):
                fails.append('HEAD control: no teal hover glow at head (control invalid)')
    ok = not fails; ok_all &= ok
    rows.append(f'{r["id"]} {r["vp"]} {"OK" if ok else "FAIL " + "; ".join(fails)}')
for i in t['inert']:
    hi = next(x for x in h['inert'] if x['vp'] == i['vp'] and x['route'] == i['route'])
    ok = i['shadowGlowUtility'] == 'none' and '0px 0px 40px' in hi['shadowGlowUtility']; ok_all &= ok
    rows.append(f'INERT {i["vp"]} {i["route"]} {"OK" if ok else "FAIL tree=" + i["shadowGlowUtility"]}')
for s in t['studio']:
    hs = next(x for x in h['studio'] if x['vp'] == s['vp'])
    ok = s['exportOpened'] and hs['exportOpened'] and s['restHash'] == hs['restHash'] and s['exportHash'] == hs['exportHash']; ok_all &= ok
    rows.append(f'STUDIO {s["vp"]} {"OK" if ok else "FAIL"} rest {s["restCount"]}/{hs["restCount"]} export {s["exportCount"]}/{hs["exportCount"]}')
print('\n'.join(rows)); print(f'ROWS {len(rows)} ALL_OK {ok_all}')

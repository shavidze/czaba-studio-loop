import json, sys, pathlib
d = pathlib.Path(sys.argv[1]); run = sys.argv[2] if len(sys.argv) > 2 else 'sketch'
ok = True; out = []
for vp in ('1440x900', '1280x720'):
    h = json.loads((d / 'head' / f'spin-{vp}.json').read_text()); s = json.loads((d / run / f'spin-{vp}.json').read_text())
    if s.get('error') or s['pageErrors']:
        ok = False; out.append(f'{vp} ERROR {s.get("error")} errs={len(s["pageErrors"])}'); continue
    for fid, f in s['fields'].items():
        hf = h['fields'][fid]
        checks = {
          'headSpinVisible': hf['spinVisibleOnHover'] is True,
          'sketchNoSpin': f['spinVisibleOnHover'] is False,
          'appearanceTextfield': f['appearance'] == 'textfield',
          'type': f['type'] == 'number',
          'boxEqualHead': (f['w'], f['h']) == (hf['w'], hf['h']),
          'stepEqualHead': f['step'] == hf['step'] and f['step'] is not None and f['step']['afterArrowUp'] != f['step']['before'],
          'headSpinVisibleOnFocus': hf['focus']['innerFocusVsRest']['changedPx'] >= 6,
          'focusedNoSpin': f['focus']['focused'] is True and f['focus']['innerFocusVsRest']['changedPx'] < 6,
          'commitEqualHead': f['commit'] == hf['commit'] and f['commit'] is not None,
        }
        bad = [k for k, v in checks.items() if not v]; ok &= not bad
        out.append(f"{vp} {fid}: {'OK' if not bad else 'FAIL ' + ','.join(bad)} headPx={hf['gutterHoverVsRest']['changedPx']} px={f['gutterHoverVsRest']['changedPx']} max={f['gutterHoverVsRest']['maxDelta']} headFocusPx={hf['focus']['innerFocusVsRest']['changedPx']} focusPx={f['focus']['innerFocusVsRest']['changedPx']} commit={f['commit']['value']}")
print('\n'.join(out)); print('ALL OK (6 cells)' if ok and len(out) == 6 else 'NOT OK')

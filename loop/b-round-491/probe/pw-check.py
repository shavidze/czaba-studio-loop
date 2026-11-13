# usage: python3 -I pw-check.py <pw-492 output json>  -> prints PASS/RED per row; rc 0 only if every row passes
import json, sys
d = json.load(open(sys.argv[1]))['rows']
TRIG = 'Click to change password'; CUR = 'Current Password'
BUTTONS = ['Show current password', 'Show new password', 'Show password confirmation', 'Cancel', 'Update Password']
ERR = 'Password change is not yet implemented. Please use the forgot password feature.'
bad = 0
def row(vp, rid, ok, info=''):
    global bad
    if not ok: bad += 1
    print(f"{vp} {rid} {'PASS' if ok else 'RED'} {info}")
def is_(a, name, inside=None):
    return a is not None and a.get('name') == name and (inside is None or a.get('inDialog') == inside)
for vp, r in d.items():
    r1 = r['R1_openMouse']
    row(vp, 'P1-SEMANTICS', r1['dialogs'] == [{'modal': 'true', 'name': 'Change Password'}], json.dumps(r1['dialogs']))
    row(vp, 'P2-INITIAL-FOCUS-MOUSE', is_(r1['active'], CUR, True) and r1['active'].get('focusSource') == 'pointer', json.dumps(r1['active']))
    row(vp, 'P3-NAMES', (r1['fields'] or {}).get('inputs') == ['Current Password', 'New Password', 'Confirm New Password'] and (r1['fields'] or {}).get('buttons') == BUTTONS, json.dumps(r1['fields']))
    row(vp, 'P4-POINTER-OUTSIDE', all(not h['inHeader'] for h in r['R6_outsideHits']) and len(r['R6_outsideHits']) == 3, json.dumps(r['R6_outsideHits']))
    fw = r['R2_tabs']['forward']; bk = r['R2_tabs']['backFromFirst']
    row(vp, 'P5-TAB-TRAP', len(fw) == 8 and all(x and x['inDialog'] for x in fw) and is_(fw[7], CUR) and [x['name'] for x in fw[:7]] == BUTTONS[:1] + ['New Password', 'Show new password', 'Confirm New Password', 'Show password confirmation', 'Cancel', 'Update Password'] and is_(bk[0], 'Update Password', True) and is_(bk[1], 'Cancel', True), json.dumps([x and x['name'] for x in fw + bk]))
    r3 = r['R3_esc']
    row(vp, 'P6-ESC-KEYBOARD-RETURN', r3['dialogs'] == [] and r3['visible'] is False and is_(r3['active'], TRIG, False) and r3['active']['focusVisible'] is True, json.dumps(r3))
    row(vp, 'P7-KEYBOARD-OPEN', is_(r['R3b_openKeyboard']['active'], CUR, True) and r['R3b_openKeyboard']['active'].get('outline', '').startswith('solid') and r['R3b_escAfterKeyboardOpen']['visible'] is False and is_(r['R3b_escAfterKeyboardOpen']['active'], TRIG, False), json.dumps([r['R3b_openKeyboard']['active'], r['R3b_escAfterKeyboardOpen']]))
    row(vp, 'P8-MOUSE-CANCEL-RETURN', r['R4_mouseCancel']['visible'] is False and is_(r['R4_mouseCancel']['active'], TRIG, False), json.dumps(r['R4_mouseCancel']))
    row(vp, 'P9-BACKDROP-RETURN', r['R4_backdrop']['visible'] is False and is_(r['R4_backdrop']['active'], TRIG, False), json.dumps(r['R4_backdrop']))
    row(vp, 'P10-TAB-FROM-OUTSIDE', r['R5_afterHeadingClick']['tag'] == 'BODY' and is_(r['R5_tabAfterHeading'], CUR, True), json.dumps([r['R5_afterHeadingClick']['tag'], r['R5_tabAfterHeading']]))
    r7 = r['R7_inflight']; r0 = r['R0_tabFromTriggerNoDialog']; tw = r7['tabInExitWindow']; st = r7['afterSettle']
    row(vp, 'P11-INFLIGHT-ESC', is_(r7['afterEsc'], TRIG, False) and r7.get('exitingInert') is True, json.dumps([r7['afterEsc'], r7.get('exitingInert')]))
    row(vp, 'P12-EXIT-WINDOW-TAB', tw is not None and not tw['inDialog'] and tw['tag'] == r0['tag'] and tw['name'] == r0['name'], json.dumps([tw, r0]))
    row(vp, 'P13-LATE-SETTLE-NO-STEAL', st['visible'] is False and st['logins'] == 1 and st['active']['tag'] == tw['tag'] and st['active']['name'] == tw['name'], json.dumps(st))
    row(vp, 'P14-DOUBLE-ESC', r['R8_doubleEsc']['visible'] is False and is_(r['R8_doubleEsc']['active'], TRIG, False), json.dumps(r['R8_doubleEsc']))
    r9 = r['R9_errorPath']
    row(vp, 'P15-ERROR-ALERT', r9['visible'] is True and r9.get('alertText') == [ERR], json.dumps(r9.get('alertText')))
    r10 = r['R10_nameSave']
    row(vp, 'P16-NAME-SAVE-NO-STEAL', is_(r10['beforeSettle'], CUR, True) and is_(r10['afterSettle'], CUR, True) and r10['visible'] is True and r10['puts'] == 1, json.dumps(r10))
    r11 = r.get('R11_reopenDuringFade') or {}
    row(vp, 'P18-REOPEN-DURING-FADE', r11.get('dialogs') == [{'modal': 'true', 'name': 'Change Password'}] and r11.get('inert') == [False] and is_(r11.get('active'), CUR, True) and is_(r11.get('afterTab'), 'Show current password', True), json.dumps(r11))
    row(vp, 'P17-CONSOLE', r['consoleErrors'] == [], json.dumps(r['consoleErrors']))
print('PW-CHECK', 'PASS' if bad == 0 else f'RED {bad}')
sys.exit(0 if bad == 0 else 1)

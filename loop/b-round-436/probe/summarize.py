# usage: python3 -I summarize.py <vis-probe.json> ; prints the measured states B's task cites
import json, sys
d = json.load(open(sys.argv[1]))
for k in ('1440x900', '1280x720'):
    r = d[k]; print('==', k)
    print(' exit rest link', r['exitRest']['link']['color'], 'arrow', r['exitRest']['arrow']['color'], '| hover link', r['exitHover']['link']['color'], 'arrow', r['exitHover']['arrow']['color'], '| box', r['exitRest']['link']['box'])
    print(' exportEnabledWaitMs', r.get('exportEnabledWaitMs'))
    for s in ('exportDisabledEmpty', 'exportRest', 'exportHover', 'exportPressed', 'exportFocus', 'exportAfterRender'):
        e = r[s]; print(' ', s, 'bg', e['bg'], 'color', e['color'], 'border', e['borderColor'], 'op', e['opacity'], e['cursor'], 'busy', e['ariaBusy'], 'disabled', e['disabled'], 'box', e['box'], ('outline ' + e['outline'] + ' off ' + e['outlineOffset'] + ' focused ' + str(e.get('focused'))) if s == 'exportFocus' else '')
    print('  busySamples', [(x['i'], x['text'], x['disabled'], x['opacity'], x['cursor'], x['busy']) for x in r['exportBusySamples'] if x['disabled']][:2], '| afterPressAway aria-busy', r['exportNoStartAfterDragAway'])
    print('  contrast', r['contrast'], 'panel', r['dialogSurface'])
    for s in ('laneHandleRest', 'laneHandleHover', 'laneHandleDrag', 'laneHandleReleased'):
        e = r[s]; print(' ', s, 'el', e['el']['bg'], '| after', e['after']['bg'], e['after']['height'], 'bottom', e['after']['bottom'], '| box', e['el']['box'])
    print('  laneDragPointerAway after', r['laneHandleDragPointerAway']['after']['bg'], '| undo box', r['laneHandleAfterUndo'], '| focus', r['laneHandleFocus']['focused'], r['laneHandleFocus']['el']['outline'], r['laneHandleFocus']['el']['outlineOffset'])
    for s in ('detailSepRest', 'detailSepHover'):
        e = r[s]; print(' ', s, 'el', e['el']['bg'], '| after', e['after']['bg'], e['after']['height'], 'top', e['after']['top'], '| box', e['el']['box'])

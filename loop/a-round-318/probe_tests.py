import sys, re
PROBE = "{ ...useArrangement(), range: useArrangementRange((state) => state.range) }"
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8').read()
    orig = s
    n_api = s.count("api.current = useArrangement();")
    s = s.replace("api.current = useArrangement();", f"api.current = {PROBE};")
    n_hook = s.count("renderHook(() => useArrangement(),")
    s = s.replace("renderHook(() => useArrangement(),", f"renderHook(() => ({PROBE}),")
    n_cur = len(re.findall(r'^  current: ArrangementContextValue \| null;$', s, flags=re.M))
    s = re.sub(r'^  current: ArrangementContextValue \| null;$', '  current: ArrangementRangeProbeValue | null;', s, flags=re.M)
    s, n_live = re.subn(r'^(function \w+\(api: \w+\)): ArrangementContextValue \{$', r'\1: ArrangementRangeProbeValue {', s, flags=re.M)
    if n_api + n_hook == 0:
        print('NO PROBE', p); continue
    # import hook
    m = re.search(r"import \{([^}]*)\} from '~/contexts/ArrangementContext';", s)
    names = [x.strip() for x in m.group(1).split(',') if x.strip()]
    if 'useArrangementRange' not in names:
        names.append('useArrangementRange')
    s = s[:m.start()] + "import { " + ", ".join(names) + " } from '~/contexts/ArrangementContext';" + s[m.end():]
    if n_cur or n_live:
        # TimeRange type import
        m2 = re.search(r"import (type )?\{([^}]*)\} from '~/types/arrangement';", s)
        if m2:
            tnames = [x.strip() for x in m2.group(2).split(',') if x.strip()]
            bare = [t.replace('type ', '') for t in tnames]
            if 'TimeRange' not in bare:
                tnames.append('TimeRange' if m2.group(1) else 'type TimeRange')
            s = s[:m2.start()] + f"import {m2.group(1) or ''}{{ " + ", ".join(tnames) + " } from '~/types/arrangement';" + s[m2.end():]
        else:
            m3 = re.search(r"from '~/contexts/ArrangementContext';\n", s)
            s = s[:m3.end()] + "import type { TimeRange } from '~/types/arrangement';\n" + s[m3.end():]
        # alias before first interface using it
        m4 = re.search(r'^(interface \w+ \{\n  current: ArrangementRangeProbeValue \| null;)', s, flags=re.M)
        alias = "type ArrangementRangeProbeValue = ArrangementContextValue & { range: TimeRange | null };\n\n"
        if m4:
            s = s[:m4.start()] + alias + s[m4.start():]
        else:
            print('NO IFACE', p)
    open(p, 'w', encoding='utf-8').write(s)
    print(p.split('/')[-1], 'api', n_api, 'hook', n_hook, 'cur', n_cur, 'live', n_live)

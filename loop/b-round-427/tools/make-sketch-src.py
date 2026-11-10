import sys
root = sys.argv[1]
A = root + '/app/components/arrangement/'
def edit(name, pairs):
    p = A + name; s = open(p, encoding='utf-8').read()
    for old, new in pairs:
        n = s.count(old)
        if n != 1:
            raise SystemExit(f'{name}: expected 1 hit, got {n}: {old[:60]!r}')
        s = s.replace(old, new)
    open(p, 'w', encoding='utf-8').write(s)
edit('StudioWorkspace.tsx', [(
"""            onClick={() => setIsShortcutSheetOpen(true)}
            aria-label={studioShortcutSheetStrings.footerButtonLabel}""",
"""            onClick={() => setIsShortcutSheetOpen(true)}
            onKeyDown={preventRepeatedEnterKeyDown}
            aria-label={studioShortcutSheetStrings.footerButtonLabel}""")])
edit('ArrangementShortcutSheet.tsx', [
("""import { studioShortcutSheetStrings } from '~/lib/arrangement/strings';
""", """import { studioShortcutSheetStrings } from '~/lib/arrangement/strings';
import { preventRepeatedEnterKeyDown } from './studio-repeat-safe';
"""),
("""            onClick={onClose}
            aria-label={studioShortcutSheetStrings.close}""",
"""            onClick={onClose}
            onKeyDown={preventRepeatedEnterKeyDown}
            aria-label={studioShortcutSheetStrings.close}""")])
edit('StudioNarrowScreen.tsx', [
("""import { cn } from '~/lib/utils';
""", """import { cn } from '~/lib/utils';
import { preventRepeatedEnterKeyDown } from './studio-repeat-safe';
"""),
("""          onClick={sendStudioLink}
""", """          onClick={sendStudioLink}
          onKeyDown={preventRepeatedEnterKeyDown}
""")])
edit('ArrangementExportDialog.tsx', [
("""import { ArrangementTimeText } from './ArrangementTimeText';
""", """import { ArrangementTimeText } from './ArrangementTimeText';
import { preventRepeatedEnterKeyDown } from './studio-repeat-safe';
"""),
("""                  onClick={cancelExport}
""", """                  onClick={cancelExport}
                  onKeyDown={preventRepeatedEnterKeyDown}
"""),
("""                onClick={handleClose}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && event.repeat) {
                    event.preventDefault();
                  }
                }}
""", """                onClick={handleClose}
                onKeyDown={preventRepeatedEnterKeyDown}
"""),
("""                    void exportMp3(renderWindow, { includeWav: true });
                  }
                }}
""", """                    void exportMp3(renderWindow, { includeWav: true });
                  }
                }}
                onKeyDown={preventRepeatedEnterKeyDown}
""")])
print('ok')

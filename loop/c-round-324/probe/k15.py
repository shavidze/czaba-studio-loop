import json,sys
K15=['ArrangementRuler','ArrangementTempoRow','ArrangementVideoDock','ArrangementLibrary','ArrangementLibraryPreview','ArrangementMaster','ArrangementShortcutSheet','ArrangementExportDialog','ArrangementTransport','StudioWorkspace']
for f in sys.argv[1:]:
    d=json.load(open(f)); cs=[c for c in d['click-original-same-lane'] if 'names' in c]
    names=set(n for c in cs for n in c['names'])
    again=[c for c in d['click-original-again'] if 'names' in c]
    print(f, 'same-lane K15 present', sum(k in names for k in K15),'/10', 'providerRendered', [c['providerRendered'] for c in cs], '| again commits', len(again), 'components', [c['rendered'] for c in again], 'provider', [c['providerRendered'] for c in again])

import sys
src=open(sys.argv[1]).read()
head=src[:src.index("describe('PERF-FADER-b")]
head=head.replace("import { type ArrangementMixDraftStore, clipGainDraftKey } from '~/lib/arrangement/mix-draft-store';","import type { ArrangementMixDraftStore } from '~/lib/arrangement/mix-draft-store';")
body=open(sys.argv[2]).read()
open(sys.argv[3],'w').write(head+body)

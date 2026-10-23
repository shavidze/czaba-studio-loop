import type { MetaFunction } from '@remix-run/node';
import { StudioWorkspace } from '~/components/arrangement';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import { studioLabDemoCollection } from '~/data/studio-lab-demo';
import { createArrangement } from '~/lib/arrangement/model';

export const meta: MetaFunction = () => [
  { title: 'Studio Lab — დემო სამუშაო სივრცე | CZABA' },
  { name: 'robots', content: 'noindex' },
];

const studioLabInitialArrangement = createArrangement([
  { id: 'video', kind: 'video', name: 'ვიდეო' },
  { id: 'music', kind: 'audio', name: 'მუსიკა' },
  { id: 'stems', kind: 'audio', name: 'სტემები' },
  { id: 'sfx', kind: 'audio', name: 'SFX' },
]);

export default function StudioLabRoute() {
  return (
    <ArrangementProvider
      collection={studioLabDemoCollection}
      initialArrangement={studioLabInitialArrangement}
    >
      <StudioWorkspace />
    </ArrangementProvider>
  );
}

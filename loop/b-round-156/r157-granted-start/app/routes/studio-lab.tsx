import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { StudioWorkspace } from '~/components/arrangement';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import { studioLabDemoCollection } from '~/data/studio-lab-demo';
import { createArrangement } from '~/lib/arrangement/model';

const STUDIO_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Georgian:wght@400;500&display=swap';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: STUDIO_FONTS_HREF }];

export const meta: MetaFunction = () => [
  { title: 'Studio Lab — Demo workspace | CZABA' },
  { name: 'robots', content: 'noindex' },
];

const studioLabInitialArrangement = createArrangement([
  { id: 'video', kind: 'video', name: 'Video' },
  { id: 'music', kind: 'audio', name: 'Music' },
  { id: 'stems', kind: 'audio', name: 'Stems' },
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

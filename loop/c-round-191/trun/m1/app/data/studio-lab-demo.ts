import {
  DEMO_SYNTH_SAMPLE_RATE,
  type DemoStemPart,
  generateDemoStereoChannels,
  generateSlowRiseSamples,
  generateSoftImpactSamples,
  getDemoStemComposition,
} from '~/lib/arrangement/demo-synth';
import { studioSourceLoadStrings } from '~/lib/arrangement/strings';
import type { WorkspaceCollection, WorkspaceSource } from '~/types/arrangement';

const DEMO_COLLECTION_LABEL = 'Demo collection · CZABA public previews + synthetic sounds';
const PUBLIC_PREVIEW_COLLECTION_LABEL = 'CZABA public previews + synthetic SFX';
const SYNTHETIC_COMPOSITION_TITLE = 'ღამის პულსი';
const SYNTHETIC_COLLECTION_LABEL = `Synthetic demo · ${SYNTHETIC_COMPOSITION_TITLE}`;

const demoUrls: Record<string, string> = {
  'demo-middle-east': '/middle-east.mp3',
  'demo-hero-music': '/videos/hero/hero-music.mp3',
};

const demoSynths: Record<string, () => Float32Array<ArrayBuffer>> = {
  'demo-soft-impact': generateSoftImpactSamples,
  'demo-slow-rise': generateSlowRiseSamples,
  'demo-synth-mix': () => getDemoStemComposition().mix,
};

const demoStemParts: Record<string, DemoStemPart> = {
  'demo-stem-pulse': 'pulse',
  'demo-stem-bass': 'bass',
  'demo-stem-pad': 'pad',
  'demo-stem-lead': 'lead',
};

const demoStemTitles: Record<DemoStemPart, string> = {
  pulse: 'პულსი',
  bass: 'ბასი',
  pad: 'პადი',
  lead: 'მელოდია',
};

const studioLabDemoSources: WorkspaceSource[] = [
  {
    id: 'demo-middle-east',
    title: 'Middle East — საჯარო preview',
    collectionLabel: PUBLIC_PREVIEW_COLLECTION_LABEL,
    kind: 'music',
    origin: 'demo',
  },
  {
    id: 'demo-hero-music',
    title: 'CZABA hero — საჯარო preview',
    collectionLabel: PUBLIC_PREVIEW_COLLECTION_LABEL,
    kind: 'music',
    origin: 'demo',
  },
  {
    id: 'demo-soft-impact',
    title: 'Soft impact',
    collectionLabel: PUBLIC_PREVIEW_COLLECTION_LABEL,
    kind: 'sfx',
    origin: 'demo',
  },
  {
    id: 'demo-slow-rise',
    title: 'Slow rise',
    collectionLabel: PUBLIC_PREVIEW_COLLECTION_LABEL,
    kind: 'sfx',
    origin: 'demo',
  },
  {
    id: 'demo-synth-mix',
    title: `${SYNTHETIC_COMPOSITION_TITLE} · სრული მიქსი`,
    shortTitle: 'სრული მიქსი',
    collectionLabel: SYNTHETIC_COLLECTION_LABEL,
    kind: 'music',
    origin: 'demo',
  },
  ...Object.entries(demoStemParts).map(
    ([id, part]): WorkspaceSource => ({
      id,
      title: `${SYNTHETIC_COMPOSITION_TITLE} · ${demoStemTitles[part]}`,
      shortTitle: demoStemTitles[part],
      collectionLabel: SYNTHETIC_COLLECTION_LABEL,
      kind: 'stem',
      origin: 'demo',
    }),
  ),
];

function synthesizeDemoSamples(sourceId: string): Float32Array<ArrayBuffer> | null {
  const part = demoStemParts[sourceId];
  if (part) {
    return getDemoStemComposition().stems[part];
  }
  const generate = demoSynths[sourceId];
  return generate ? generate() : null;
}

async function loadDemoSource(
  source: WorkspaceSource,
  ctx: BaseAudioContext,
  signal: AbortSignal,
): Promise<AudioBuffer> {
  const url = demoUrls[source.id];
  if (url) {
    let response: Response;
    try {
      response = await fetch(url, { credentials: 'omit', signal });
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      throw new Error(studioSourceLoadStrings.networkFailed);
    }
    if (!response.ok) {
      throw new Error(studioSourceLoadStrings.httpFailed(response.status));
    }
    let audioData: ArrayBuffer;
    try {
      audioData = await response.arrayBuffer();
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      throw new Error(studioSourceLoadStrings.networkFailed);
    }
    try {
      return await ctx.decodeAudioData(audioData);
    } catch {
      throw new Error(studioSourceLoadStrings.decodeFailed);
    }
  }
  const samples = synthesizeDemoSamples(source.id);
  if (!samples) {
    throw new Error(studioSourceLoadStrings.unknownDemoSource);
  }
  const channels = generateDemoStereoChannels(() => samples);
  const buffer = new AudioBuffer({
    numberOfChannels: channels.length,
    length: channels[0].length,
    sampleRate: DEMO_SYNTH_SAMPLE_RATE,
  });
  for (const [index, channel] of channels.entries()) {
    buffer.copyToChannel(channel, index);
  }
  return buffer;
}

export const studioLabDemoCollection: WorkspaceCollection = {
  id: 'studio-lab-demo',
  label: DEMO_COLLECTION_LABEL,
  origin: 'demo',
  notice:
    'The stems are a synthetic demo — not CZABA catalogue stems and not parts extracted from a mix.',
  sources: studioLabDemoSources,
  loadSource: loadDemoSource,
};

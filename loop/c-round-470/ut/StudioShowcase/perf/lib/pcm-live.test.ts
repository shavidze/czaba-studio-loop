// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  classifyPcmProbe,
  type PcmLiveEntry,
  type PcmLiveOrigin,
  type PcmLiveReading,
  pcmLiveProblems,
  pcmProbeShapes,
  summarizePcmLive,
} from './pcm-live';

function liveEntry(
  length: number,
  numberOfChannels: number,
  origin: PcmLiveOrigin,
  probe = false,
): PcmLiveEntry {
  return { length, numberOfChannels, origin, probe };
}

const probeEntry = liveEntry(1, 1, 'ctor', true);
const decodeProbeEntry = liveEntry(
  pcmProbeShapes.decode.length,
  pcmProbeShapes.decode.numberOfChannels,
  'decode',
);
const droppedProbeEntry = liveEntry(
  pcmProbeShapes.dropped.length,
  pcmProbeShapes.dropped.numberOfChannels,
  'ctor',
);

describe('summarizePcmLive', () => {
  it('PL1: sums length × channels × 4 and splits the bytes by origin', () => {
    const summary = summarizePcmLive([
      liveEntry(48000, 2, 'decode'),
      liveEntry(1000, 1, 'ctor'),
      liveEntry(24000, 2, 'decode'),
    ]);
    expect(summary.count).toBe(3);
    expect(summary.bytes).toBe(48000 * 2 * 4 + 1000 * 4 + 24000 * 2 * 4);
    expect(summary.byOrigin).toEqual({
      decode: (48000 + 24000) * 2 * 4,
      ctor: 1000 * 4,
    });
  });

  it('PL2: an empty list gives count 0 and bytes 0', () => {
    expect(summarizePcmLive([])).toEqual({ count: 0, bytes: 0, byOrigin: {} });
  });

  it('PL4: the probe buffer is excluded from the totals', () => {
    const entries = [liveEntry(48000, 2, 'decode'), probeEntry];
    expect(summarizePcmLive(entries)).toEqual(summarizePcmLive([liveEntry(48000, 2, 'decode')]));
    expect(summarizePcmLive([probeEntry])).toEqual({ count: 0, bytes: 0, byOrigin: {} });
  });
});

describe('pcmLiveProblems', () => {
  const twoSources: PcmLiveEntry[] = [liveEntry(48000, 2, 'decode'), liveEntry(16, 2, 'ctor')];
  const valid: PcmLiveReading = {
    registryPresent: true,
    entries: [...twoSources, probeEntry, decodeProbeEntry],
  };
  const bounds = { placed: 0, library: 9 };

  it('PL3: a valid reading gives no problem', () => {
    expect(pcmLiveProblems(valid, bounds)).toEqual([]);
  });

  it('PL3: a missing registry fires alone', () => {
    expect(pcmLiveProblems({ registryPresent: false, entries: [] }, bounds)).toEqual([
      'pcm registry missing',
    ]);
  });

  it('PL3: an uncounted probe fires alone', () => {
    expect(
      pcmLiveProblems(
        { registryPresent: true, entries: [...twoSources, decodeProbeEntry] },
        bounds,
      ),
    ).toEqual(['pcm registry did not count its probe buffer']);
  });

  it('PL3: a count above the library bound fires alone', () => {
    expect(pcmLiveProblems(valid, { placed: 0, library: 1 })).toEqual([
      'pcm live count 2 outside [0, 1]',
    ]);
  });

  it('PL3: a count below the placed bound fires alone', () => {
    expect(pcmLiveProblems(valid, { placed: 3, library: 9 })).toEqual([
      'pcm live count 2 outside [3, 9]',
    ]);
  });

  it('PL3: probe and count problems keep their order when all fire', () => {
    expect(
      pcmLiveProblems(
        { registryPresent: true, entries: [twoSources[0], droppedProbeEntry] },
        { placed: 2, library: 9 },
      ),
    ).toEqual([
      'pcm registry did not count its probe buffer',
      'pcm registry did not count its decode probe',
      'pcm registry kept a dropped probe',
      'pcm live count 1 outside [2, 9]',
    ]);
  });

  it('PL5: a missing decode probe fires alone', () => {
    expect(
      pcmLiveProblems({ registryPresent: true, entries: [...twoSources, probeEntry] }, bounds),
    ).toEqual(['pcm registry did not count its decode probe']);
  });

  it('PL5: two live decode probes fire the decode probe problem alone', () => {
    expect(
      pcmLiveProblems(
        { registryPresent: true, entries: [...valid.entries, decodeProbeEntry] },
        bounds,
      ),
    ).toEqual(['pcm registry did not count its decode probe']);
  });

  it('PL5: a dropped probe still live fires alone', () => {
    expect(
      pcmLiveProblems(
        { registryPresent: true, entries: [...valid.entries, droppedProbeEntry] },
        bounds,
      ),
    ).toEqual(['pcm registry kept a dropped probe']);
  });

  it('PL6: a reading with N = P and one with N = M are both valid', () => {
    expect(pcmLiveProblems(valid, { placed: 2, library: 9 })).toEqual([]);
    expect(pcmLiveProblems(valid, { placed: 0, library: 2 })).toEqual([]);
  });

  it('PL7: the dropped and decode probes are excluded from the totals', () => {
    const withProbes = [...twoSources, probeEntry, decodeProbeEntry, droppedProbeEntry];
    expect(summarizePcmLive(withProbes)).toEqual(summarizePcmLive(twoSources));
    expect(classifyPcmProbe(decodeProbeEntry)).toBe('decode');
    expect(classifyPcmProbe(droppedProbeEntry)).toBe('dropped');
    expect(classifyPcmProbe(liveEntry(480, 2, 'decode'))).toBe(null);
  });
});

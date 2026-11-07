// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  type PcmLiveEntry,
  type PcmLiveOrigin,
  type PcmLiveReading,
  pcmLiveProblems,
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
  const valid: PcmLiveReading = { registryPresent: true, entries: [...twoSources, probeEntry] };

  it('PL3: a valid reading gives no problem', () => {
    expect(pcmLiveProblems(valid, 2)).toEqual([]);
  });

  it('PL3: a missing registry fires alone', () => {
    expect(pcmLiveProblems({ registryPresent: false, entries: [] }, 2)).toEqual([
      'pcm registry missing',
    ]);
  });

  it('PL3: an uncounted probe fires alone', () => {
    expect(pcmLiveProblems({ registryPresent: true, entries: twoSources }, 2)).toEqual([
      'pcm registry did not count its probe buffer',
    ]);
  });

  it('PL3: a count mismatch fires alone', () => {
    expect(pcmLiveProblems(valid, 9)).toEqual(['pcm live count 2 ≠ 9 library sources']);
  });

  it('PL3: probe and count problems keep their order when both fire', () => {
    expect(pcmLiveProblems({ registryPresent: true, entries: [twoSources[0]] }, 9)).toEqual([
      'pcm registry did not count its probe buffer',
      'pcm live count 1 ≠ 9 library sources',
    ]);
  });
});

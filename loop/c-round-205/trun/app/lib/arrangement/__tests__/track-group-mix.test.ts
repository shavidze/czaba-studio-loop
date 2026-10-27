import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Arrangement, ArrangementClip, ArrangementTrackGroup } from '~/types/arrangement';
import {
  applySchedule,
  renderArrangementWav,
  type ScheduleAudioContext,
  type ScheduleAudioNode,
  type ScheduleGainNode,
  type SchedulePannerNode,
  type ScheduleSourceNode,
} from '../graph.client';
import {
  arrangementGroups,
  groupSelectedRows,
  setTrackGroupMix,
  toggleTrackGroupSolo,
  trackGroupAncestorIds,
  trackGroupSoloState,
  ungroupSelectedRows,
} from '../groups';
import { createArrangement, setTrackMix, toggleSolo } from '../model';
import {
  isTrackAudible,
  isTrackAudibleWithGroups,
  planSchedule,
  trackEffectiveGains,
} from '../schedule';

const CLIPS: ArrangementClip[] = [
  { id: 'cm', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
  { id: 'cs', trackId: 'stems', sourceId: 'stem', start: 2, sourceOffset: 0, duration: 6 },
  { id: 'cx', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

function labArrangement(): Arrangement {
  const base: Arrangement = {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'stems', kind: 'audio', name: 'სტემები' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips: CLIPS,
  };
  return setTrackMix(setTrackMix(base, 'sfx', { volume: 0.8 }), 'stems', { volume: 1 });
}

function grouped(arrangement: Arrangement, rowIds: string[], groupId: string): Arrangement {
  const result = groupSelectedRows(arrangement, rowIds, groupId);
  if (result.kind !== 'grouped') {
    throw new Error(`grouping refused: ${result.reason}`);
  }
  return result.arrangement;
}

function withG1(): Arrangement {
  return grouped(labArrangement(), ['stems', 'sfx'], 'g1');
}

function withG2(): Arrangement {
  return grouped(withG1(), ['music', 'g1'], 'g2');
}

function group(arrangement: Arrangement, id: string): ArrangementTrackGroup | undefined {
  return arrangementGroups(arrangement).find((entry) => entry.id === id);
}

function gains(arrangement: Arrangement): Record<string, number> {
  return Object.fromEntries(trackEffectiveGains(arrangement));
}

function oldRuleGains(arrangement: Arrangement): Record<string, number> {
  return Object.fromEntries(
    arrangement.tracks.map((track) => [
      track.id,
      isTrackAudible(track, arrangement.tracks) ? track.volume : 0,
    ]),
  );
}

describe('track group mix (SRW-17 stage 3)', () => {
  it('GM1 the normaliser omits default fields and returns the same object for no-ops', () => {
    const base = withG1();
    const plain = group(base, 'g1');
    expect(plain).toEqual({ id: 'g1', name: 'Group 1', parentId: null });
    expect(setTrackGroupMix(base, 'g1', { volume: 1, mute: false, solo: false })).toBe(base);
    expect(JSON.stringify(group(base, 'g1'))).not.toMatch(/volume|mute|solo/);
    const half = setTrackGroupMix(base, 'g1', { volume: 0.5 });
    expect(group(half, 'g1')).toEqual({ id: 'g1', name: 'Group 1', parentId: null, volume: 0.5 });
    const back = setTrackGroupMix(half, 'g1', { volume: 1 });
    expect(group(back, 'g1')).toEqual({ id: 'g1', name: 'Group 1', parentId: null });
    expect(Object.keys(group(back, 'g1') ?? {})).toEqual(['id', 'name', 'parentId']);
    expect(setTrackGroupMix(half, 'g1', { volume: Number.NaN })).toBe(half);
    expect(setTrackGroupMix(half, 'g1', { volume: Number.POSITIVE_INFINITY })).toBe(half);
    expect(group(setTrackGroupMix(base, 'g1', { volume: 7 }), 'g1')?.volume).toBeUndefined();
    expect(setTrackGroupMix(base, 'g1', { volume: 7 })).toBe(base);
    expect(group(setTrackGroupMix(base, 'g1', { volume: -3 }), 'g1')?.volume).toBe(0);
    expect(setTrackGroupMix(base, 'ghost', { mute: true })).toBe(base);
    const muted = setTrackGroupMix(base, 'g1', { mute: true });
    expect(group(muted, 'g1')).toEqual({ id: 'g1', name: 'Group 1', parentId: null, mute: true });
    expect(group(setTrackGroupMix(muted, 'g1', { mute: false }), 'g1')).toEqual(plain);
  });

  it('GM2 group volume multiplies down the ancestor chain', () => {
    const g1Half = setTrackGroupMix(withG1(), 'g1', { volume: 0.5 });
    expect(gains(g1Half)).toEqual({ video: 1, music: 1, stems: 0.5, sfx: 0.4 });
    const nested = setTrackGroupMix(setTrackGroupMix(withG2(), 'g1', { volume: 0.5 }), 'g2', {
      volume: 0.5,
    });
    expect(gains(nested).stems).toBe(0.25);
    expect(gains(nested).sfx).toBeCloseTo(0.2, 12);
    expect(gains(nested).music).toBe(0.5);
    expect(gains(nested).video).toBe(1);
    const silent = setTrackGroupMix(withG1(), 'g1', { volume: 0 });
    expect(gains(silent).stems).toBe(0);
    expect(gains(silent).sfx).toBe(0);
    expect(gains(silent).music).toBe(1);
  });

  it('GM3 an outer mute silences every descendant; inner changes are kept and apply on unmute', () => {
    const muted = setTrackGroupMix(withG2(), 'g2', { mute: true });
    expect(gains(muted)).toEqual({ video: 1, music: 0, stems: 0, sfx: 0 });
    const innerChanged = setTrackGroupMix(setTrackMix(muted, 'stems', { volume: 0.5 }), 'g1', {
      volume: 0.5,
    });
    expect(innerChanged.tracks.find((track) => track.id === 'stems')?.volume).toBe(0.5);
    expect(group(innerChanged, 'g1')?.volume).toBe(0.5);
    expect(gains(innerChanged).stems).toBe(0);
    const unmuted = setTrackGroupMix(innerChanged, 'g2', { mute: false });
    expect(gains(unmuted).stems).toBe(0.25);
    expect(gains(unmuted).sfx).toBeCloseTo(0.4, 12);
  });

  it('GM4 solo through groups; mute beats solo at every level', () => {
    const g1Solo = setTrackGroupMix(withG2(), 'g1', { solo: true });
    expect(gains(g1Solo)).toEqual({ video: 0, music: 0, stems: 1, sfx: 0.8 });
    const stemsSolo = toggleSolo(withG2(), 'stems', false);
    expect(gains(stemsSolo)).toEqual({ video: 0, music: 0, stems: 1, sfx: 0 });
    const soloAndMuted = setTrackGroupMix(g1Solo, 'g1', { mute: true });
    expect(gains(soloAndMuted)).toEqual({ video: 0, music: 0, stems: 0, sfx: 0 });
    const trackSoloInMuted = setTrackGroupMix(stemsSolo, 'g2', { mute: true });
    expect(gains(trackSoloInMuted).stems).toBe(0);
    const video = trackSoloInMuted.tracks.find((track) => track.id === 'video');
    expect(video && isTrackAudibleWithGroups(video, g1Solo)).toBe(false);
    for (const plain of [withG2(), setTrackMix(withG2(), 'music', { mute: true })]) {
      expect(gains(plain)).toEqual(oldRuleGains(plain));
    }
    const plainSolo = toggleSolo(labArrangement(), 'music', false);
    expect(gains(plainSolo)).toEqual(oldRuleGains(plainSolo));
  });

  it('GM5 half-solo state: on, mixed for an ancestor of a soloed row, off otherwise', () => {
    const base = withG2();
    expect(trackGroupSoloState(base, 'g1')).toBe('off');
    expect(trackGroupSoloState(base, 'g2')).toBe('off');
    const g1Solo = setTrackGroupMix(base, 'g1', { solo: true });
    expect(trackGroupSoloState(g1Solo, 'g1')).toBe('on');
    expect(trackGroupSoloState(g1Solo, 'g2')).toBe('mixed');
    const stemsSolo = toggleSolo(base, 'stems', false);
    expect(trackGroupSoloState(stemsSolo, 'g1')).toBe('mixed');
    expect(trackGroupSoloState(stemsSolo, 'g2')).toBe('mixed');
    const musicSolo = toggleSolo(base, 'music', false);
    expect(trackGroupSoloState(musicSolo, 'g1')).toBe('off');
    expect(trackGroupSoloState(musicSolo, 'g2')).toBe('mixed');
    expect(trackGroupSoloState(base, 'ghost')).toBe('off');
  });

  it('GM6 exclusive and additive solo across tracks and groups', () => {
    const base = withG2();
    const musicSolo = toggleSolo(base, 'music', false);
    const g1Exclusive = toggleTrackGroupSolo(musicSolo, 'g1', false);
    expect(g1Exclusive.tracks.every((track) => !track.solo)).toBe(true);
    expect(group(g1Exclusive, 'g1')?.solo).toBe(true);
    const g2Exclusive = toggleTrackGroupSolo(g1Exclusive, 'g2', false);
    expect(group(g2Exclusive, 'g1')?.solo).toBeUndefined();
    expect(group(g2Exclusive, 'g2')?.solo).toBe(true);
    const cleared = toggleTrackGroupSolo(g2Exclusive, 'g2', false);
    expect(arrangementGroups(cleared).some((entry) => entry.solo !== undefined)).toBe(false);
    expect(cleared.tracks.every((track) => !track.solo)).toBe(true);
    const additive = toggleTrackGroupSolo(musicSolo, 'g1', true);
    expect(additive.tracks.find((track) => track.id === 'music')?.solo).toBe(true);
    expect(group(additive, 'g1')?.solo).toBe(true);
    expect(group(toggleTrackGroupSolo(additive, 'g1', true), 'g1')?.solo).toBeUndefined();
    const notOnly = toggleTrackGroupSolo(additive, 'g1', false);
    expect(group(notOnly, 'g1')?.solo).toBe(true);
    expect(notOnly.tracks.every((track) => !track.solo)).toBe(true);
    const trackExclusive = toggleSolo(additive, 'sfx', false);
    expect(arrangementGroups(trackExclusive).some((entry) => entry.solo !== undefined)).toBe(false);
    expect(trackExclusive.tracks.filter((track) => track.solo).map((track) => track.id)).toEqual([
      'sfx',
    ]);
    const musicStays = toggleSolo(additive, 'music', false);
    expect(musicStays.tracks.find((track) => track.id === 'music')?.solo).toBe(true);
    expect(group(musicStays, 'g1')?.solo).toBeUndefined();
    expect(toggleTrackGroupSolo(base, 'ghost', false)).toBe(base);
    const plainExclusive = toggleSolo(base, 'sfx', false);
    expect(plainExclusive.groups).toBe(base.groups);
    expect(plainExclusive).toEqual({
      ...base,
      tracks: base.tracks.map((track) => ({ ...track, solo: track.id === 'sfx' })),
    });
    const plainAdditive = toggleSolo(base, 'music', true);
    expect(plainAdditive.groups).toBe(base.groups);
    expect(toggleSolo(plainExclusive, 'sfx', false).tracks.every((track) => !track.solo)).toBe(
      true,
    );
  });

  it('GM7 cyclic and ghost parent chains stay finite', () => {
    const base = labArrangement();
    const corrupt: Arrangement = {
      ...base,
      tracks: base.tracks.map((track) =>
        track.id === 'stems' || track.id === 'sfx' ? { ...track, groupId: 'g1' } : track,
      ),
      groups: [
        { id: 'g1', name: 'A', parentId: 'g2', volume: 0.5 },
        { id: 'g2', name: 'B', parentId: 'g1', volume: 0.5, solo: true },
        { id: 'g3', name: 'C', parentId: 'ghost', mute: true },
      ],
    };
    expect(trackGroupAncestorIds(corrupt, 'g1')).toEqual(['g2', 'g1']);
    expect(trackGroupAncestorIds(corrupt, 'ghost')).toEqual([]);
    const result = gains(corrupt);
    expect(result).toEqual({ video: 0, music: 0, stems: 0.25, sfx: 0.2 });
    expect(trackGroupSoloState(corrupt, 'g1')).toBe('mixed');
    expect(trackGroupSoloState(corrupt, 'g3')).toBe('off');
    const orphanSolo: Arrangement = {
      ...corrupt,
      groups: [
        { id: 'g1', name: 'A', parentId: null },
        { id: 'g9', name: 'Orphan', parentId: 'ghost', solo: true },
      ],
    };
    expect(gains(orphanSolo)).toEqual({ video: 1, music: 1, stems: 1, sfx: 0.8 });
    const video = orphanSolo.tracks.find((track) => track.id === 'video');
    expect(video && isTrackAudibleWithGroups(video, orphanSolo)).toBe(true);
  });

  it('GM9 ungroup drops the dissolved group mix state and keeps the children fields', () => {
    const muted = setTrackGroupMix(setTrackGroupMix(withG1(), 'g1', { mute: true }), 'g1', {
      volume: 0.3,
    });
    expect(gains(muted).stems).toBe(0);
    const result = ungroupSelectedRows(muted, ['g1']);
    expect(result.kind).toBe('ungrouped');
    if (result.kind !== 'ungrouped') {
      return;
    }
    expect(result.arrangement.groups).toBeUndefined();
    expect(result.arrangement.tracks).toEqual(
      labArrangement().tracks.map((track) => ({ ...track })),
    );
    expect(gains(result.arrangement)).toEqual({ video: 1, music: 1, stems: 1, sfx: 0.8 });
    const nestedMuted = setTrackGroupMix(withG2(), 'g1', { mute: true, volume: 0.5 });
    const regrouped = grouped(nestedMuted, ['g2'], 'g3');
    expect(group(regrouped, 'g1')).toMatchObject({ mute: true, volume: 0.5, parentId: 'g2' });
  });
});

interface FakeBuffer {
  id: string;
}

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode implements ScheduleAudioNode {
  outputs: ScheduleAudioNode[] = [];
  connect(destination: ScheduleAudioNode) {
    this.outputs.push(destination);
    return destination;
  }
  disconnect() {}
}

class FakeGain extends FakeNode implements ScheduleGainNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode implements SchedulePannerNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode implements ScheduleSourceNode<FakeBuffer> {
  buffer: FakeBuffer | null = null;
  onended: ((event: Event) => unknown) | null = null;
  start() {}
  stop() {}
}

class FakeGraphContext implements ScheduleAudioContext<FakeBuffer> {
  currentTime = 0;
  destination = new FakeNode();
  gains: FakeGain[] = [];
  createBufferSource() {
    return new FakeSource();
  }
  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }
  createStereoPanner() {
    return new FakePanner();
  }
  trackGainValues(): number[] {
    return this.gains
      .filter((gain) => gain.outputs.some((output) => output instanceof FakePanner))
      .map((gain) => gain.gain.value);
  }
}

const renderedContexts: FakeGraphContext[] = [];

class FakeOfflineContext extends FakeGraphContext {
  constructor() {
    super();
    renderedContexts.push(this);
  }
  startRendering() {
    return Promise.resolve({ sampleRate: 48000, getChannelData: () => new Float32Array(8) });
  }
}

describe('track group mix graph (GM8)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    renderedContexts.length = 0;
  });

  it('GM8 applySchedule takes initial track gains from the map; without it the old rule holds', () => {
    const arrangement = setTrackGroupMix(setTrackGroupMix(withG2(), 'g1', { volume: 0.5 }), 'g2', {
      volume: 0.5,
    });
    const withMap = new FakeGraphContext();
    applySchedule(withMap, planSchedule(arrangement, 0), {
      buffers: new Map(),
      tracks: arrangement.tracks,
      from: 0,
      startAt: 0,
      trackGains: trackEffectiveGains(arrangement),
    });
    expect(withMap.trackGainValues()).toEqual([1, 0.5, 0.25, 0.8 * 0.25]);
    const withoutMap = new FakeGraphContext();
    applySchedule(withoutMap, planSchedule(arrangement, 0), {
      buffers: new Map(),
      tracks: arrangement.tracks,
      from: 0,
      startAt: 0,
    });
    expect(withoutMap.trackGainValues()).toEqual(Object.values(oldRuleGains(arrangement)));
    const partial = new FakeGraphContext();
    applySchedule(partial, [], {
      buffers: new Map(),
      tracks: arrangement.tracks,
      from: 0,
      startAt: 0,
      trackGains: new Map([['music', 0]]),
    });
    expect(partial.trackGainValues()).toEqual([1, 0, 1, 0.8]);
  });

  it('GM8 renderArrangementWav renders with the effective group gains', async () => {
    vi.stubGlobal('OfflineAudioContext', FakeOfflineContext);
    const muted = setTrackGroupMix(setTrackGroupMix(withG2(), 'g1', { volume: 0.5 }), 'g2', {
      mute: true,
    });
    await renderArrangementWav(muted, new Map());
    const soloed = setTrackGroupMix(withG2(), 'g1', { solo: true, volume: 0.5 });
    await renderArrangementWav(soloed, new Map());
    expect(renderedContexts).toHaveLength(2);
    expect(renderedContexts[0].trackGainValues()).toEqual([1, 0, 0, 0]);
    expect(renderedContexts[1].trackGainValues()).toEqual([0, 0, 0.5, 0.4]);
  });
});

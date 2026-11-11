import { act, render } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { shallow } from 'zustand/shallow';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementPreviewLaneClips,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement, moveClip } from '../model';
import {
  createArrangementPreviewStore,
  OVERVIEW_CLIP_FIELD_ROLES,
  SELECTED_CLIP_FIELD_ROLES,
  sameOverviewArrangementShownFields,
  sameOverviewClipShownFields,
  sameSelectedClipShownFields,
  sameSelectedClipsShownFields,
  selectPreviewClip,
  selectPreviewLaneClips,
  selectPreviewOrCommittedArrangement,
  selectPreviewProjectEnd,
} from '../preview-store';

const CLIPS: ArrangementClip[] = [
  { id: 'a1', trackId: 'a', sourceId: 's', start: 0, sourceOffset: 0, duration: 4 },
  { id: 'b1', trackId: 'b', sourceId: 's', start: 2, sourceOffset: 0, duration: 3 },
];

function committedArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'Video' },
      { id: 'a', kind: 'audio', name: 'A' },
      { id: 'b', kind: 'audio', name: 'B' },
    ]),
    clips: CLIPS,
  };
}

function movedOnA(base: Arrangement, start: number): Arrangement {
  const next = moveClip(base, 'a1', start);
  if (!next) {
    throw new Error('move refused');
  }
  return next;
}

describe('PERF-DRAG-PREVIEW stage a — preview store (DP1)', () => {
  it('DP1 setPreview of the same value notifies once and clearPreview notifies once', () => {
    const store = createArrangementPreviewStore();
    const committed = committedArrangement();
    const next = movedOnA(committed, 6);
    let notified = 0;
    const unsubscribe = store.subscribe(() => {
      notified += 1;
    });
    store.getState().setPreview(next);
    store.getState().setPreview(next);
    expect(notified).toBe(1);
    expect(store.getState().preview).toBe(next);
    store.getState().clearPreview();
    store.getState().clearPreview();
    expect(notified).toBe(2);
    expect(store.getState().preview).toBeNull();
    unsubscribe();
  });

  it('DP1 a lane-B selector sees an equal slice when only a lane-A clip changes', () => {
    const store = createArrangementPreviewStore();
    const committed = committedArrangement();
    const laneB = () => selectPreviewLaneClips(store.getState().preview, committed, 'b');
    const laneA = () => selectPreviewLaneClips(store.getState().preview, committed, 'a');
    const beforeB = laneB();
    const beforeA = laneA();
    store.getState().setPreview(movedOnA(committed, 6));
    expect(shallow(beforeB, laneB())).toBe(true);
    expect(shallow(beforeA, laneA())).toBe(false);
    expect(laneA()[0]?.start).toBe(6);
    store.getState().setPreview(movedOnA(committed, 8));
    expect(shallow(beforeB, laneB())).toBe(true);
    store.getState().clearPreview();
    expect(shallow(beforeB, laneB())).toBe(true);
    expect(shallow(beforeA, laneA())).toBe(true);
  });

  it('DP1 project end, clip and arrangement selectors fall back to the committed value', () => {
    const store = createArrangementPreviewStore();
    const committed = committedArrangement();
    expect(selectPreviewProjectEnd(store.getState().preview, 5)).toBe(5);
    expect(selectPreviewClip(store.getState().preview, committed, 'a1')).toBe(CLIPS[0]);
    expect(selectPreviewClip(store.getState().preview, committed, null)).toBeUndefined();
    expect(selectPreviewOrCommittedArrangement(store.getState().preview, committed)).toBe(
      committed,
    );
    const next = movedOnA(committed, 9);
    store.getState().setPreview(next);
    expect(selectPreviewProjectEnd(store.getState().preview, 5)).toBe(13);
    expect(selectPreviewClip(store.getState().preview, committed, 'a1')?.start).toBe(9);
    expect(selectPreviewClip(store.getState().preview, committed, 'b1')).toBe(CLIPS[1]);
    expect(selectPreviewOrCommittedArrangement(store.getState().preview, committed)).toBe(next);
  });
});

const EMPTY_COLLECTION: WorkspaceCollection = {
  id: 'preview-store',
  label: 'preview-store',
  origin: 'demo',
  sources: [],
  loadSource: async () => {
    throw new Error('no sources');
  },
};

interface LaneHookApi {
  context: ArrangementContextValue | null;
  renders: Map<string, number>;
  starts: Map<string, string>;
}

function LaneHookProbe({ api, trackId }: { api: LaneHookApi; trackId: string }) {
  const context = useArrangement();
  const clips = useArrangementPreviewLaneClips(context.arrangement, trackId);
  api.renders.set(trackId, (api.renders.get(trackId) ?? 0) + 1);
  api.starts.set(trackId, clips.map((clip) => clip.start).join(','));
  return null;
}

function ContextProbe({ api }: { api: LaneHookApi }) {
  api.context = useArrangement();
  return null;
}

function liveContext(api: LaneHookApi): ArrangementContextValue {
  if (!api.context) {
    throw new Error('provider not mounted');
  }
  return api.context;
}

describe('PERF-DRAG-PREVIEW stage a — lane hook through the provider (DP1)', () => {
  it('DP1 previewClipGeometry on a lane-A clip renders the lane-A hook only', () => {
    const api: LaneHookApi = { context: null, renders: new Map(), starts: new Map() };
    const committed = committedArrangement();
    const children: ReactNode[] = [
      createElement(ContextProbe, { api, key: 'context' }),
      createElement(LaneHookProbe, { api, trackId: 'a', key: 'a' }),
      createElement(LaneHookProbe, { api, trackId: 'b', key: 'b' }),
    ];
    render(
      createElement(
        ArrangementProvider,
        { collection: EMPTY_COLLECTION, initialArrangement: committed },
        children,
      ),
    );
    api.renders.clear();
    act(() => liveContext(api).previewClipGeometry(movedOnA(committed, 6)));
    act(() => liveContext(api).previewClipGeometry(movedOnA(committed, 8)));
    expect(api.renders.get('a') ?? 0).toBe(2);
    expect(api.renders.get('b') ?? 0).toBe(0);
    expect(api.starts.get('a')).toBe('8');
    expect(api.starts.get('b')).toBe('2');
  });
});

const ROLE_BASE: ArrangementClip = {
  id: 'a1',
  trackId: 'a',
  sourceId: 's',
  start: 1,
  sourceOffset: 0.5,
  duration: 4,
  gainDb: -2,
  fadeIn: 0.25,
  fadeOut: 0.5,
  envelope: [{ time: 0, gain: 1 }],
};

const ROLE_VARIANTS: { [Field in keyof ArrangementClip]-?: ArrangementClip } = {
  id: { ...ROLE_BASE, id: 'a2' },
  trackId: { ...ROLE_BASE, trackId: 'b' },
  sourceId: { ...ROLE_BASE, sourceId: 't' },
  start: { ...ROLE_BASE, start: 1.001 },
  sourceOffset: { ...ROLE_BASE, sourceOffset: 0.75 },
  duration: { ...ROLE_BASE, duration: 4.5 },
  gainDb: { ...ROLE_BASE, gainDb: -3 },
  fadeIn: { ...ROLE_BASE, fadeIn: 1 },
  fadeOut: { ...ROLE_BASE, fadeOut: 1 },
  envelope: { ...ROLE_BASE, envelope: [{ time: 0, gain: 0.5 }] },
};

describe('PERF-DRAG-PREVIEW stage c2a — selected-clip shown fields', () => {
  it('PS-ROLES every clip field is classified, and the equality ignores exactly the ignored fields', () => {
    const fields = Object.keys(ROLE_VARIANTS);
    expect(Object.keys(SELECTED_CLIP_FIELD_ROLES).sort()).toEqual([...fields].sort());
    const shown: string[] = [];
    const ignored: string[] = [];
    for (const [field, role] of Object.entries(SELECTED_CLIP_FIELD_ROLES)) {
      (role === 'shown' ? shown : ignored).push(field);
    }
    expect(ignored.sort()).toEqual(['envelope', 'fadeIn', 'fadeOut']);
    for (const [field, variant] of Object.entries(ROLE_VARIANTS)) {
      expect({ field, equal: sameSelectedClipShownFields(ROLE_BASE, variant) }).toEqual({
        field,
        equal: ignored.includes(field),
      });
    }
  });

  it('PS-LIST compares clip lists by length, order and shown fields', () => {
    const other: ArrangementClip = { ...ROLE_BASE, id: 'b1', start: 9 };
    expect(sameSelectedClipsShownFields([ROLE_BASE, other], [ROLE_VARIANTS.fadeIn, other])).toBe(
      true,
    );
    expect(sameSelectedClipsShownFields([ROLE_BASE, other], [ROLE_VARIANTS.start, other])).toBe(
      false,
    );
    expect(sameSelectedClipsShownFields([ROLE_BASE, other], [other, ROLE_BASE])).toBe(false);
    expect(sameSelectedClipsShownFields([ROLE_BASE], [ROLE_BASE, other])).toBe(false);
    expect(sameSelectedClipShownFields(undefined, undefined)).toBe(true);
    expect(sameSelectedClipShownFields(ROLE_BASE, undefined)).toBe(false);
  });
});

function rolesSplit(roles: Record<keyof ArrangementClip, 'shown' | 'ignored'>): {
  shown: string[];
  ignored: string[];
} {
  const shown: string[] = [];
  const ignored: string[] = [];
  for (const [field, role] of Object.entries(roles)) {
    (role === 'shown' ? shown : ignored).push(field);
  }
  return { shown: shown.sort(), ignored: ignored.sort() };
}

describe('PERF-DRAG-PREVIEW stage c2b-i — overview shown fields', () => {
  it('PS-OVR-ROLES the overview record classifies every clip field and its equality ignores exactly the ignored ones', () => {
    const fields = Object.keys(ROLE_VARIANTS);
    expect(Object.keys(OVERVIEW_CLIP_FIELD_ROLES).sort()).toEqual([...fields].sort());
    const { shown, ignored } = rolesSplit(OVERVIEW_CLIP_FIELD_ROLES);
    expect(shown).toEqual(['duration', 'id', 'start', 'trackId']);
    for (const [field, variant] of Object.entries(ROLE_VARIANTS)) {
      expect({ field, equal: sameOverviewClipShownFields(ROLE_BASE, variant) }).toEqual({
        field,
        equal: ignored.includes(field),
      });
    }
  });

  it('PS-OVR-ARR compares arrangements by track reference, clip count, order and overview fields', () => {
    const other: ArrangementClip = { ...ROLE_BASE, id: 'b1', start: 9 };
    const base = {
      ...createArrangement([
        { id: 'video', kind: 'video', name: 'Video' },
        { id: 'a', kind: 'audio', name: 'A' },
      ]),
      clips: [ROLE_BASE, other],
    };
    expect(sameOverviewArrangementShownFields(base, base)).toBe(true);
    expect(
      sameOverviewArrangementShownFields(base, { ...base, clips: [ROLE_VARIANTS.fadeIn, other] }),
    ).toBe(true);
    expect(
      sameOverviewArrangementShownFields(base, { ...base, clips: [ROLE_VARIANTS.gainDb, other] }),
    ).toBe(true);
    expect(
      sameOverviewArrangementShownFields(base, { ...base, clips: [ROLE_VARIANTS.start, other] }),
    ).toBe(false);
    expect(
      sameOverviewArrangementShownFields(base, { ...base, clips: [ROLE_VARIANTS.duration, other] }),
    ).toBe(false);
    expect(sameOverviewArrangementShownFields(base, { ...base, clips: [other, ROLE_BASE] })).toBe(
      false,
    );
    expect(sameOverviewArrangementShownFields(base, { ...base, clips: [ROLE_BASE] })).toBe(false);
    expect(sameOverviewArrangementShownFields(base, { ...base, tracks: [...base.tracks] })).toBe(
      false,
    );
  });
});

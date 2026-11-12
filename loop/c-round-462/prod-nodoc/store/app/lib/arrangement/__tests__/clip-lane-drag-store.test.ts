import { describe, expect, it } from 'vitest';
import {
  type ClipLaneDragState,
  type ClipLaneGhost,
  createArrangementClipLaneDragStore,
  selectLaneDragGhosts,
  selectLaneMoveRefusal,
  selectLaneMoveSourceKey,
} from '../clip-lane-drag-store';

function ghost(overrides: Partial<ClipLaneGhost>): ClipLaneGhost {
  return {
    clipId: 'c1',
    trackId: 'sfx',
    start: 2,
    duration: 4,
    blocked: false,
    message: null,
    ...overrides,
  };
}

describe('clip-lane-drag-store', () => {
  it('CL1 setDrag keeps the state object for the same drag and notifies once per new drag', () => {
    const store = createArrangementClipLaneDragStore();
    let notified = 0;
    const unsubscribe = store.subscribe(() => {
      notified += 1;
    });
    const drag: ClipLaneDragState = { ghosts: [ghost({})], timeLocked: false };
    const initial = store.getState();
    expect(initial.drag).toBeNull();
    store.getState().setDrag(null);
    expect(store.getState()).toBe(initial);
    store.getState().setDrag(drag);
    store.getState().setDrag(drag);
    expect(store.getState().drag).toBe(drag);
    expect(notified).toBe(1);
    store.getState().setDrag(null);
    expect(store.getState().drag).toBeNull();
    expect(notified).toBe(2);
    unsubscribe();
  });

  it('CL2 selectLaneDragGhosts returns one shared empty array when there is no drag or no ghost on the lane', () => {
    const none = selectLaneDragGhosts(null, 'sfx');
    expect(none).toHaveLength(0);
    expect(selectLaneDragGhosts(null, 'music')).toBe(none);
    const drag: ClipLaneDragState = {
      ghosts: [ghost({ clipId: 'c1', trackId: 'sfx' }), ghost({ clipId: 'c2', trackId: 'music' })],
      timeLocked: false,
    };
    expect(selectLaneDragGhosts(drag, 'sfx').map((entry) => entry.clipId)).toEqual(['c1']);
    expect(selectLaneDragGhosts(drag, 'music').map((entry) => entry.clipId)).toEqual(['c2']);
    expect(selectLaneDragGhosts(drag, 'video')).toEqual([]);
  });

  it('CL3 selectLaneMoveSourceKey keeps the lane clip order and ignores blocked ghosts', () => {
    expect(selectLaneMoveSourceKey(null, ['c1', 'c2'])).toBe('');
    const drag: ClipLaneDragState = {
      ghosts: [
        ghost({ clipId: 'c2', trackId: 'sfx' }),
        ghost({ clipId: 'c1', trackId: 'sfx' }),
        ghost({ clipId: 'c3', trackId: 'sfx', blocked: true, message: 'Not enough room' }),
      ],
      timeLocked: false,
    };
    expect(selectLaneMoveSourceKey(drag, ['c1', 'c2', 'c3'])).toBe('c1\nc2');
    expect(selectLaneMoveSourceKey(drag, ['c3'])).toBe('');
    expect(selectLaneMoveSourceKey(drag, [])).toBe('');
  });

  it('CL4 selectLaneMoveRefusal returns the first blocked ghost message, else null', () => {
    expect(selectLaneMoveRefusal(null)).toBeNull();
    expect(selectLaneMoveRefusal({ ghosts: [ghost({})], timeLocked: true })).toBeNull();
    expect(
      selectLaneMoveRefusal({
        ghosts: [
          ghost({ clipId: 'c1' }),
          ghost({ clipId: 'c2', blocked: true, message: null }),
          ghost({ clipId: 'c3', blocked: true, message: 'Not enough room' }),
          ghost({ clipId: 'c4', blocked: true, message: 'Second' }),
        ],
        timeLocked: false,
      }),
    ).toBe('Not enough room');
  });
});

import { act, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementPosition,
} from '~/contexts/ArrangementContext';
import type { WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { createArrangementPositionStore } from '../position-store';

class FakeOfflineAudioContext {}

const emptyCollection: WorkspaceCollection = {
  id: 'empty',
  label: 'empty',
  origin: 'demo',
  sources: [],
  loadSource: () => Promise.reject(new Error('no sources')),
};

describe('createArrangementPositionStore', () => {
  it('notifies subscribers on change and skips identical values', () => {
    const store = createArrangementPositionStore(2);
    const listener = vi.fn();
    const unsubscribe = store.subscribePosition(listener);
    store.setPosition(2);
    expect(listener).not.toHaveBeenCalled();
    store.setPosition(3.5);
    expect(store.getPosition()).toBe(3.5);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.setPosition(4);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('position subscriptions (M2, R4-M2)', () => {
  beforeEach(() => {
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('re-renders only position consumers across 10 seekTo calls', () => {
    const counts = { workspace: 0, position: 0 };
    let api: ArrangementContextValue | null = null;
    function WorkspaceConsumer() {
      api = useArrangement();
      counts.workspace += 1;
      return null;
    }
    function PositionConsumer() {
      useArrangementPosition();
      counts.position += 1;
      return null;
    }
    render(
      createElement(
        ArrangementProvider,
        {
          collection: emptyCollection,
          initialArrangement: createArrangement([
            { id: 'video', kind: 'video', name: 'ვიდეო' },
            { id: 'music', kind: 'audio', name: 'მუსიკა' },
          ]),
        },
        createElement(WorkspaceConsumer),
        createElement(PositionConsumer),
      ),
    );
    const current = (): ArrangementContextValue => {
      if (!api) {
        throw new Error('provider not mounted');
      }
      return api;
    };
    const workspaceBefore = counts.workspace;
    const positionBefore = counts.position;
    for (let step = 1; step <= 10; step++) {
      act(() => current().seekTo(step));
    }
    expect(counts.workspace - workspaceBefore).toBe(0);
    expect(counts.position - positionBefore).toBe(10);
    expect(current().getLivePosition()).toBe(10);
  });
});

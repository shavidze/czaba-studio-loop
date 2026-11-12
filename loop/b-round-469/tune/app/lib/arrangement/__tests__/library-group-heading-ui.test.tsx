import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import { LIBRARY_FOLDER_LABELS } from '~/lib/arrangement/library';
import { studioLibraryPanelStrings } from '~/lib/arrangement/strings';
import type { Arrangement, WorkspaceCollection, WorkspaceSource } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  connect(destination: FakeNode) {
    return destination;
  }
  disconnect() {}
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  start() {}
  stop() {}
}

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  currentTime = 0;
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createGain() {
    return new FakeGain();
  }
  createStereoPanner() {
    return new FakePanner();
  }
  createBufferSource() {
    return new FakeSource();
  }
}

class FakeOfflineAudioContext {}

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
  }
  get duration() {
    return this.length / this.sampleRate;
  }
  getChannelData() {
    return new Float32Array(this.length);
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const PREVIEW_LABEL = 'Field previews';
const SET_LABEL = 'Studio set · Ember';

function readyBuffer(): Promise<AudioBuffer> {
  return Promise.resolve(new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }));
}

function groupCollection(
  sources: WorkspaceSource[],
  origin: WorkspaceCollection['origin'] = 'demo',
): WorkspaceCollection {
  return {
    id: `group-heading-${origin}`,
    label: 'group-heading',
    origin,
    sources,
    loadSource: () => readyBuffer(),
  };
}

const twoCollectionSources: WorkspaceSource[] = [
  {
    id: 'rain',
    title: 'Rain preview',
    collectionLabel: PREVIEW_LABEL,
    kind: 'music',
    origin: 'demo',
  },
  {
    id: 'door',
    title: 'Low door slam',
    collectionLabel: PREVIEW_LABEL,
    kind: 'sfx',
    origin: 'demo',
  },
  {
    id: 'ember-mix',
    title: 'Ember · Full mix',
    shortTitle: 'Full mix',
    collectionLabel: SET_LABEL,
    kind: 'music',
    origin: 'demo',
  },
  {
    id: 'ember-bass',
    title: 'Ember · Low bass',
    shortTitle: 'Low bass',
    collectionLabel: SET_LABEL,
    kind: 'stem',
    origin: 'demo',
  },
];

const purchasedSources: WorkspaceSource[] = [
  {
    id: 'buy-mix',
    title: 'Paid Track · Full mix',
    shortTitle: 'Full mix',
    collectionLabel: 'Paid Track',
    kind: 'music',
    origin: 'purchased',
  },
  {
    id: 'buy-drums',
    title: 'Paid Track · Drums',
    shortTitle: 'Drums',
    collectionLabel: 'Paid Track',
    kind: 'stem',
    origin: 'purchased',
  },
];

const nonContiguousSources: WorkspaceSource[] = [
  { id: 'a-one', title: 'Alpha one', collectionLabel: 'Label A', kind: 'music', origin: 'demo' },
  { id: 'b-one', title: 'Beta one', collectionLabel: 'Label B', kind: 'sfx', origin: 'demo' },
  { id: 'a-two', title: 'Alpha two', collectionLabel: 'Label A', kind: 'sfx', origin: 'demo' },
];

const threeRunSources: WorkspaceSource[] = [
  { id: 'a-one', title: 'Alpha one', collectionLabel: 'Label A', kind: 'music', origin: 'demo' },
  { id: 'b-one', title: 'Beta one', collectionLabel: 'Label B', kind: 'sfx', origin: 'demo' },
  { id: 'b-two', title: 'Kick two', collectionLabel: 'Label B', kind: 'sfx', origin: 'demo' },
  { id: 'c-one', title: 'Kick three', collectionLabel: 'Label C', kind: 'sfx', origin: 'demo' },
  { id: 'c-two', title: 'Kick four', collectionLabel: 'Label C', kind: 'sfx', origin: 'demo' },
];

function groupArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
}

let pendingFrames: FrameRequestCallback[] = [];

async function flushAsync(rounds = 10) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

function flushFrames() {
  act(() => {
    const frames = pendingFrames;
    pendingFrames = [];
    for (const frame of frames) {
      frame(0);
    }
  });
}

async function mountGroupLibrary(collection: WorkspaceCollection) {
  const view = render(
    <ArrangementProvider collection={collection} initialArrangement={groupArrangement()}>
      <StudioWorkspace />
    </ArrangementProvider>,
  );
  await flushAsync();
  const listbox = view.getByRole('listbox', { name: studioLibraryPanelStrings.listLabel });
  return { view, listbox };
}

function optionIds(listbox: HTMLElement): (string | null)[] {
  return within(listbox)
    .getAllByRole('option')
    .map((option) => option.getAttribute('data-source-id'));
}

function groupNames(listbox: HTMLElement): string[] {
  return within(listbox)
    .queryAllByRole('group')
    .map((group) => {
      const headingId = group.getAttribute('aria-labelledby') ?? '';
      return document.getElementById(headingId)?.textContent ?? '';
    });
}

function typeLibraryQuery(view: ReturnType<typeof render>, value: string) {
  fireEvent.change(view.getByRole('searchbox', { name: studioLibraryPanelStrings.searchLabel }), {
    target: { value },
  });
}

describe('library collection group headings (FIX-PD-1b, SR-230-6)', () => {
  beforeEach(() => {
    pendingFrames = [];
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      pendingFrames.push(callback);
      return pendingFrames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('LG1: the All view shows one labelled group per collection, no per-option collection line, options in source order', async () => {
    const { view, listbox } = await mountGroupLibrary(groupCollection(twoCollectionSources));
    const groups = within(listbox).getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(within(listbox).getByRole('group', { name: PREVIEW_LABEL })).toBe(groups[0]);
    expect(within(listbox).getByRole('group', { name: SET_LABEL })).toBe(groups[1]);
    expect(groupNames(listbox)).toEqual([PREVIEW_LABEL, SET_LABEL]);
    expect(view.queryAllByTestId('arrangement-library-option-context')).toHaveLength(0);
    expect(optionIds(listbox)).toEqual(['rain', 'door', 'ember-mix', 'ember-bass']);
    expect(
      within(groups[0])
        .getAllByRole('option')
        .map((option) => option.getAttribute('data-source-id')),
    ).toEqual(['rain', 'door']);
    expect(
      within(groups[1])
        .getAllByRole('option')
        .map((option) => option.getAttribute('data-source-id')),
    ).toEqual(['ember-mix', 'ember-bass']);
    for (const option of within(listbox).getAllByRole('option')) {
      expect(option.textContent).not.toContain(PREVIEW_LABEL);
      expect(option.textContent).not.toContain(SET_LABEL);
    }
    view.unmount();
  });

  it('LG2: headings take no focus and are not options; ArrowDown/ArrowUp walk the options in resultIds order', async () => {
    const { view, listbox } = await mountGroupLibrary(groupCollection(twoCollectionSources));
    for (const group of within(listbox).getAllByRole('group')) {
      const heading = document.getElementById(group.getAttribute('aria-labelledby') ?? '');
      expect(heading).not.toBeNull();
      expect(heading?.tagName).toBe('DIV');
      expect(heading?.getAttribute('tabindex')).toBeNull();
      expect(heading?.getAttribute('role')).toBeNull();
      expect(heading?.parentElement).toBe(group);
    }
    const tabbable = within(listbox)
      .getAllByRole('option')
      .filter((option) => option.getAttribute('tabindex') === '0');
    expect(tabbable.map((option) => option.getAttribute('data-source-id'))).toEqual(['rain']);
    const options = within(listbox).getAllByRole('option');
    act(() => options[0].focus());
    const visited: (string | null)[] = [];
    for (let step = 0; step < 3; step++) {
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'ArrowDown' });
      flushFrames();
      expect(document.activeElement?.getAttribute('role')).toBe('option');
      visited.push(document.activeElement?.getAttribute('data-source-id') ?? null);
    }
    expect(visited).toEqual(['door', 'ember-mix', 'ember-bass']);
    const back: (string | null)[] = [];
    for (let step = 0; step < 3; step++) {
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'ArrowUp' });
      flushFrames();
      expect(document.activeElement?.getAttribute('role')).toBe('option');
      back.push(document.activeElement?.getAttribute('data-source-id') ?? null);
    }
    expect(back).toEqual(['ember-mix', 'door', 'rain']);
    view.unmount();
  });

  it('LG3: a selected collection node or folder shows the options flat in the listbox, with no group', async () => {
    const { view, listbox } = await mountGroupLibrary(groupCollection(twoCollectionSources));
    const tree = view.getByTestId('arrangement-library-tree');
    fireEvent.click(within(tree).getByRole('button', { name: SET_LABEL }));
    expect(within(listbox).queryAllByRole('group')).toHaveLength(0);
    expect(optionIds(listbox)).toEqual(['ember-mix', 'ember-bass']);
    for (const option of within(listbox).getAllByRole('option')) {
      expect(option.parentElement).toBe(listbox);
    }
    const stemFolder = within(tree)
      .getAllByTestId('arrangement-library-folder')
      .find((folder) => (folder.textContent ?? '').startsWith(LIBRARY_FOLDER_LABELS.stem));
    expect(stemFolder).toBeDefined();
    if (stemFolder) {
      fireEvent.click(stemFolder);
    }
    expect(within(listbox).queryAllByRole('group')).toHaveLength(0);
    expect(optionIds(listbox)).toEqual(['ember-bass']);
    expect(within(listbox).getByRole('option').parentElement).toBe(listbox);
    view.unmount();
  });

  it('LG4: search shows groups only when the results span two collections', async () => {
    const { view, listbox } = await mountGroupLibrary(groupCollection(twoCollectionSources));
    typeLibraryQuery(view, 'zzz');
    expect(within(listbox).queryAllByRole('group')).toHaveLength(0);
    expect(within(listbox).queryAllByRole('option')).toHaveLength(0);
    expect(view.getByTestId('arrangement-library-empty').textContent).toBe(
      studioLibraryPanelStrings.noResults,
    );
    typeLibraryQuery(view, 'ember');
    expect(within(listbox).queryAllByRole('group')).toHaveLength(0);
    expect(optionIds(listbox)).toEqual(['ember-mix', 'ember-bass']);
    typeLibraryQuery(view, 'low');
    expect(groupNames(listbox)).toEqual([PREVIEW_LABEL, SET_LABEL]);
    expect(optionIds(listbox)).toEqual(['door', 'ember-bass']);
    view.unmount();
  });

  it('LG5: a purchased-style single collection with short titles shows no group and no collection text in any option', async () => {
    const { view, listbox } = await mountGroupLibrary(
      groupCollection(purchasedSources, 'purchased'),
    );
    expect(within(listbox).queryAllByRole('group')).toHaveLength(0);
    expect(view.queryAllByTestId('arrangement-library-option-context')).toHaveLength(0);
    const options = within(listbox).getAllByRole('option');
    expect(options.map((option) => option.getAttribute('title'))).toEqual([
      'Paid Track · Full mix',
      'Paid Track · Drums',
    ]);
    for (const option of options) {
      expect(option.parentElement).toBe(listbox);
      expect(option.textContent).not.toContain('Paid Track');
    }
    view.unmount();
  });

  it('LG6: option title attributes keep the full title while the card shows the short title', async () => {
    const { view, listbox } = await mountGroupLibrary(groupCollection(twoCollectionSources));
    const options = within(listbox).getAllByRole('option');
    expect(options.map((option) => option.getAttribute('title'))).toEqual([
      'Rain preview',
      'Low door slam',
      'Ember · Full mix',
      'Ember · Low bass',
    ]);
    expect(
      view.getAllByTestId('arrangement-library-option-title').map((title) => title.textContent),
    ).toEqual(['Rain preview', 'Low door slam', 'Full mix', 'Low bass']);
    view.unmount();
  });

  it('LG7: a label that returns after another one (A, B, A) gives three groups in source order', async () => {
    const { view, listbox } = await mountGroupLibrary(groupCollection(nonContiguousSources));
    expect(groupNames(listbox)).toEqual(['Label A', 'Label B', 'Label A']);
    expect(optionIds(listbox)).toEqual(['a-one', 'b-one', 'a-two']);
    const headingIds = within(listbox)
      .getAllByRole('group')
      .map((group) => group.getAttribute('aria-labelledby'));
    expect(new Set(headingIds).size).toBe(3);
    act(() => within(listbox).getAllByRole('option')[0].focus());
    const visited: (string | null)[] = [];
    for (let step = 0; step < 2; step++) {
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'ArrowDown' });
      flushFrames();
      visited.push(document.activeElement?.getAttribute('data-source-id') ?? null);
    }
    expect(visited).toEqual(['b-one', 'a-two']);
    view.unmount();
  });

  it.each([
    ['c-two', 'a whole run before it disappears'],
    ['b-two', 'the first option of its own run disappears'],
  ])('LG8 (%s): a focused option keeps its DOM node and focus when %s', async (focusId) => {
    const { view, listbox } = await mountGroupLibrary(groupCollection(threeRunSources));
    expect(groupNames(listbox)).toEqual(['Label A', 'Label B', 'Label C']);
    const before = within(listbox)
      .getAllByRole('option')
      .find((o) => o.getAttribute('data-source-id') === focusId);
    if (!before) throw new Error('missing');
    act(() => before.focus());
    typeLibraryQuery(view, 'kick');
    flushFrames();
    await flushAsync();
    expect(groupNames(listbox)).toEqual(['Label B', 'Label C']);
    expect(optionIds(listbox)).toEqual(['b-two', 'c-one', 'c-two']);
    expect(before.isConnected).toBe(true);
    expect(document.activeElement).toBe(before);
    view.unmount();
  });

  it('LG9: each heading is hidden from the accessibility tree and still names its group', async () => {
    const { view, listbox } = await mountGroupLibrary(groupCollection(threeRunSources));
    for (const label of ['Label A', 'Label B', 'Label C']) {
      const group = within(listbox).getByRole('group', { name: label });
      const heading = document.getElementById(group.getAttribute('aria-labelledby') ?? '');
      expect(heading?.textContent).toBe(label);
      expect(heading?.getAttribute('aria-hidden')).toBe('true');
    }
    view.unmount();
  });
});

import { fireEvent, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installFocusSourceTracking, useFocusSourceAttribute } from '~/lib/focus-source';

const MODIFIER_KEYS: ReadonlyArray<string> = [
  'Shift',
  'Control',
  'Alt',
  'AltGraph',
  'Meta',
  'CapsLock',
  'Fn',
  'OS',
];

function focusSourceValue(): string | undefined {
  return document.documentElement.dataset.focusSource;
}

function FocusSourceProbe() {
  useFocusSourceAttribute();
  return (
    <button
      type="button"
      data-testid="probe"
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      probe
    </button>
  );
}

describe('useFocusSourceAttribute (SABA-B-4 R85)', () => {
  afterEach(() => {
    delete document.documentElement.dataset.focusSource;
    vi.restoreAllMocks();
  });

  it('FS-a: a pointerdown sets the source to pointer', () => {
    const view = render(<FocusSourceProbe />);
    expect(focusSourceValue()).toBeUndefined();
    fireEvent.pointerDown(view.getByTestId('probe'));
    expect(focusSourceValue()).toBe('pointer');
    view.unmount();
  });

  it('FS-b: Tab, ArrowUp, Space and a letter set the source to keyboard', () => {
    const view = render(<FocusSourceProbe />);
    for (const key of ['Tab', 'ArrowUp', ' ', 'a']) {
      fireEvent.pointerDown(document.body);
      expect(focusSourceValue(), `before ${key}`).toBe('pointer');
      fireEvent.keyDown(document.body, { key });
      expect(focusSourceValue(), key).toBe('keyboard');
    }
    view.unmount();
  });

  it('FS-c: a modifier key pressed alone leaves the source unchanged', () => {
    const view = render(<FocusSourceProbe />);
    for (const key of MODIFIER_KEYS) {
      fireEvent.pointerDown(document.body);
      fireEvent.keyDown(document.body, { key });
      expect(focusSourceValue(), `${key} after a pointer press`).toBe('pointer');
    }
    fireEvent.keyDown(document.body, { key: 'Tab' });
    for (const key of MODIFIER_KEYS) {
      fireEvent.keyDown(document.body, { key });
      expect(focusSourceValue(), `${key} after Tab`).toBe('keyboard');
    }
    view.unmount();
  });

  it('FS-d: unmount removes the attribute and later events set nothing', () => {
    const view = render(<FocusSourceProbe />);
    fireEvent.pointerDown(document.body);
    expect(focusSourceValue()).toBe('pointer');
    view.unmount();
    expect(document.documentElement.hasAttribute('data-focus-source')).toBe(false);
    fireEvent.pointerDown(document.body);
    fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(document.documentElement.hasAttribute('data-focus-source')).toBe(false);
  });

  it('FS-e: a target handler that stops propagation does not block the update (capture phase)', () => {
    const view = render(<FocusSourceProbe />);
    const probe = view.getByTestId('probe');
    const bubbleSpy = vi.fn();
    document.addEventListener('pointerdown', bubbleSpy);
    fireEvent.pointerDown(probe);
    expect(bubbleSpy).not.toHaveBeenCalled();
    expect(focusSourceValue()).toBe('pointer');
    fireEvent.keyDown(probe, { key: 'ArrowUp' });
    expect(focusSourceValue()).toBe('keyboard');
    document.removeEventListener('pointerdown', bubbleSpy);
    view.unmount();
  });

  it('FS-f: a StrictMode mount leaves exactly one active listener pair and unmount removes it', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const tracked = (spy: typeof addSpy, type: string) =>
      spy.mock.calls.filter(([eventType, , options]) => eventType === type && options === true)
        .length;
    const view = render(
      <StrictMode>
        <FocusSourceProbe />
      </StrictMode>,
    );
    for (const type of ['pointerdown', 'keydown']) {
      expect(tracked(addSpy, type) - tracked(removeSpy, type), `${type} active`).toBe(1);
    }
    fireEvent.pointerDown(document.body);
    expect(focusSourceValue()).toBe('pointer');
    view.unmount();
    for (const type of ['pointerdown', 'keydown']) {
      expect(tracked(addSpy, type) - tracked(removeSpy, type), `${type} after unmount`).toBe(0);
    }
    expect(document.documentElement.hasAttribute('data-focus-source')).toBe(false);
  });

  it('FS-g: the pure installer returns a dispose that removes both listeners and the attribute', () => {
    const dispose = installFocusSourceTracking(document);
    fireEvent.keyDown(document.body, { key: 'Enter' });
    expect(focusSourceValue()).toBe('keyboard');
    dispose();
    expect(document.documentElement.hasAttribute('data-focus-source')).toBe(false);
    fireEvent.pointerDown(document.body);
    expect(document.documentElement.hasAttribute('data-focus-source')).toBe(false);
  });
});

import { fireEvent, render } from '@testing-library/react';
import type { MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  guardSoftDisabledClick,
  isSoftDisabledButton,
  softDisabledButtonProps,
} from '~/components/arrangement/studio-soft-disabled';

function soleButton(container: HTMLElement): HTMLButtonElement {
  const button = container.querySelector('button');
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('button missing');
  }
  return button;
}

describe('SYS-5 stage 2 shared soft-disabled helper (D-29z627)', () => {
  it('SDU1 marks an unavailable button aria-disabled and blocks its mouse focus; an available button gets nothing', () => {
    const unavailable = render(
      <button type="button" {...softDisabledButtonProps(true)}>
        Off
      </button>,
    );
    const off = soleButton(unavailable.container);
    expect(off.getAttribute('aria-disabled')).toBe('true');
    expect(fireEvent.mouseDown(off)).toBe(false);
    unavailable.unmount();

    const available = render(
      <button type="button" {...softDisabledButtonProps(false)}>
        On
      </button>,
    );
    const on = soleButton(available.container);
    expect(on.hasAttribute('aria-disabled')).toBe(false);
    expect(fireEvent.mouseDown(on)).toBe(true);
    expect(softDisabledButtonProps(false)).toEqual({});
  });

  it('SDU2 the click wrapper drops a click on an aria-disabled button and passes the event through otherwise', () => {
    const handler = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>();
    const blocked = render(
      <button type="button" aria-disabled="true" onClick={guardSoftDisabledClick(handler)}>
        Off
      </button>,
    );
    fireEvent.click(soleButton(blocked.container));
    expect(handler).toHaveBeenCalledTimes(0);
    blocked.unmount();

    let receivedTarget: EventTarget | null = null;
    handler.mockImplementation((event) => {
      receivedTarget = event.currentTarget;
    });
    const open = render(
      <button type="button" onClick={guardSoftDisabledClick(handler)}>
        On
      </button>,
    );
    const button = soleButton(open.container);
    fireEvent.click(button);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(receivedTarget).toBe(button);
  });

  it('SDU3 reads only aria-disabled="true" as soft-disabled', () => {
    const view = render(
      <div>
        <button type="button" aria-disabled="true">
          True
        </button>
        <button type="button" aria-disabled="false">
          False
        </button>
        <button type="button">Absent</button>
      </div>,
    );
    const [isTrue, isFalse, isAbsent] = Array.from(view.container.querySelectorAll('button'));
    expect(isSoftDisabledButton(isTrue)).toBe(true);
    expect(isSoftDisabledButton(isFalse)).toBe(false);
    expect(isSoftDisabledButton(isAbsent)).toBe(false);
  });

  it('SDU4 the wrapper reads the DOM at click time, so a rerender that clears aria-disabled lets the next click through', () => {
    const handler = vi.fn();
    const wrapped = guardSoftDisabledClick(handler);
    const view = render(
      <button type="button" {...softDisabledButtonProps(true)} onClick={wrapped}>
        Toggle
      </button>,
    );
    const button = soleButton(view.container);
    fireEvent.click(button);
    expect(handler).toHaveBeenCalledTimes(0);
    view.rerender(
      <button type="button" {...softDisabledButtonProps(false)} onClick={wrapped}>
        Toggle
      </button>,
    );
    expect(soleButton(view.container)).toBe(button);
    expect(button.hasAttribute('aria-disabled')).toBe(false);
    fireEvent.click(button);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { releaseLinkFocus } from '~/lib/link-focus';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.removeAttribute('tabindex');
});

describe('releaseLinkFocus (DPG-FOOTER-LINKS)', () => {
  it('LF1 moves focus from the clicked link to the document body and leaves no tabindex', () => {
    render(
      <a
        href="/support"
        onClick={(event) => {
          releaseLinkFocus(event);
          event.preventDefault();
        }}
      >
        Support
      </a>,
    );
    const link = screen.getByRole('link', { name: 'Support' });
    link.focus();
    expect(document.activeElement).toBe(link);
    const bodyFocus = vi.spyOn(document.body, 'focus');

    fireEvent.click(link);

    expect(bodyFocus).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(document.body);
    expect(document.body.hasAttribute('tabindex')).toBe(false);
  });

  it('LF2 keeps a tabindex the body already had', () => {
    document.body.setAttribute('tabindex', '0');
    render(
      <a
        href="/faq"
        onClick={(event) => {
          releaseLinkFocus(event);
          event.preventDefault();
        }}
      >
        FAQ
      </a>,
    );
    const link = screen.getByRole('link', { name: 'FAQ' });
    link.focus();
    const bodyFocus = vi.spyOn(document.body, 'focus');

    fireEvent.click(link);

    expect(bodyFocus).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(document.body);
    expect(document.body.getAttribute('tabindex')).toBe('0');
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
    ['middle button', { button: 1 }],
  ])('LF3 a %s click keeps focus on the link (the browser opens a new tab or window)', (_label, init) => {
    render(
      <a
        href="/faq"
        onClick={(event) => {
          releaseLinkFocus(event);
          event.preventDefault();
        }}
      >
        FAQ
      </a>,
    );
    const link = screen.getByRole('link', { name: 'FAQ' });
    link.focus();

    fireEvent.click(link, init);

    expect(document.activeElement).toBe(link);
    expect(document.body.hasAttribute('tabindex')).toBe(false);
  });

  it('LF4 a click whose default an earlier handler prevented keeps focus on the link', () => {
    render(
      <a
        href="/faq"
        onClick={(event) => {
          event.preventDefault();
          releaseLinkFocus(event);
        }}
      >
        FAQ
      </a>,
    );
    const link = screen.getByRole('link', { name: 'FAQ' });
    link.focus();
    const bodyFocus = vi.spyOn(document.body, 'focus');

    fireEvent.click(link);

    expect(bodyFocus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(link);
  });

  it.each([
    ['target="_blank"', { target: '_blank' }],
    ['target="_top"', { target: '_top' }],
    ['download', { download: '' }],
  ])('LF5 a %s link keeps focus (it does not replace this document)', (_label, extra) => {
    render(
      <a
        href="/faq"
        {...extra}
        onClick={(event) => {
          releaseLinkFocus(event);
          event.preventDefault();
        }}
      >
        FAQ
      </a>,
    );
    const link = screen.getByRole('link', { name: 'FAQ' });
    link.focus();
    const bodyFocus = vi.spyOn(document.body, 'focus');

    fireEvent.click(link);

    expect(bodyFocus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(link);
  });

  it('LF6 target="_self" still releases focus', () => {
    render(
      <a
        href="/faq"
        target="_self"
        onClick={(event) => {
          releaseLinkFocus(event);
          event.preventDefault();
        }}
      >
        FAQ
      </a>,
    );
    const link = screen.getByRole('link', { name: 'FAQ' });
    link.focus();

    fireEvent.click(link);

    expect(document.activeElement).toBe(document.body);
  });

  it('LF7 removes the temporary body tabindex even when focusing the body throws', () => {
    const failure = new Error('focus failed');
    let caught: unknown = null;
    render(
      <a
        href="/faq"
        onClick={(event) => {
          try {
            releaseLinkFocus(event);
          } catch (error) {
            caught = error;
          }
          event.preventDefault();
        }}
      >
        FAQ
      </a>,
    );
    const link = screen.getByRole('link', { name: 'FAQ' });
    vi.spyOn(document.body, 'focus').mockImplementation(() => {
      expect(document.body.getAttribute('tabindex')).toBe('-1');
      throw failure;
    });

    fireEvent.click(link);

    expect(caught).toBe(failure);
    expect(document.body.hasAttribute('tabindex')).toBe(false);
  });
});

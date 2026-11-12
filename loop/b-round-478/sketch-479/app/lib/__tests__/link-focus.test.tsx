import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { releaseLinkFocus } from '~/lib/link-focus';

afterEach(() => {
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

    fireEvent.click(link);

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

    fireEvent.click(link);

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
});

import type { MouseEvent } from 'react';

function isPlainPrimaryActivation(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  );
}

function opensInSameDocument(anchor: HTMLAnchorElement): boolean {
  const target = anchor.getAttribute('target');
  return (
    (target === null || target === '' || target === '_self') && !anchor.hasAttribute('download')
  );
}

export function releaseLinkFocus(event: MouseEvent<HTMLAnchorElement>): void {
  if (!isPlainPrimaryActivation(event)) return;
  const anchor = event.currentTarget;
  if (!opensInSameDocument(anchor)) return;
  const { body } = anchor.ownerDocument;
  const hadTabIndex = body.hasAttribute('tabindex');
  if (!hadTabIndex) body.tabIndex = -1;
  try {
    body.focus({ preventScroll: true });
  } finally {
    if (!hadTabIndex) body.removeAttribute('tabindex');
  }
}

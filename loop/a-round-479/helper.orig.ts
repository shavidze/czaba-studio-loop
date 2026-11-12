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

export function releaseLinkFocus(event: MouseEvent<HTMLAnchorElement>): void {
  if (!isPlainPrimaryActivation(event)) return;
  const { body } = event.currentTarget.ownerDocument;
  const hadTabIndex = body.hasAttribute('tabindex');
  if (!hadTabIndex) body.tabIndex = -1;
  body.focus({ preventScroll: true });
  if (!hadTabIndex) body.removeAttribute('tabindex');
}

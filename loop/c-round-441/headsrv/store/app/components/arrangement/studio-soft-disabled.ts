import type { MouseEvent } from 'react';

export interface SoftDisabledButtonProps {
  'aria-disabled'?: 'true';
  onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: never;
}

function preventSoftDisabledMouseFocus(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function softDisabledButtonProps(isUnavailable: boolean): SoftDisabledButtonProps {
  return isUnavailable
    ? { 'aria-disabled': 'true', onMouseDown: preventSoftDisabledMouseFocus }
    : {};
}

export function isSoftDisabledButton(button: HTMLButtonElement): boolean {
  return button.getAttribute('aria-disabled') === 'true';
}

export function guardSoftDisabledClick(
  handler: (event: MouseEvent<HTMLButtonElement>) => void,
): (event: MouseEvent<HTMLButtonElement>) => void {
  return (event) => {
    if (isSoftDisabledButton(event.currentTarget)) {
      return;
    }
    handler(event);
  };
}

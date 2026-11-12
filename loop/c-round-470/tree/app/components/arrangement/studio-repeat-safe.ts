import type { KeyboardEvent } from 'react';

export function preventRepeatedEnterKeyDown(event: KeyboardEvent<HTMLElement>): boolean {
  if (event.key !== 'Enter' || !event.repeat) {
    return false;
  }
  event.preventDefault();
  return true;
}

import { act, render } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

describe('jsdom removal', () => {
  it('reports activeElement, blur and ref-detach order', () => {
    const log: string[] = [];
    let hide: () => void = () => {};
    function Probe() {
      const [shown, setShown] = useState(true);
      hide = () => setShown(false);
      return shown ? (
        <button
          type="button"
          ref={(node) => {
            log.push(node ? 'ref:set' : `ref:null active=${document.activeElement?.tagName}`);
          }}
          onBlur={() => log.push('react-blur')}
        >
          x
        </button>
      ) : null;
    }
    const { getByRole } = render(<Probe />);
    const button = getByRole('button');
    button.addEventListener('blur', () => log.push('native-blur'));
    button.addEventListener('focusout', () => log.push('native-focusout'));
    button.focus();
    log.push(`focused=${document.activeElement === button}`);
    act(() => hide());
    log.push(`after: active=${document.activeElement?.tagName} connected=${button.isConnected}`);
    console.log(log.join(' | '));
    expect(true).toBe(true);
  });
});

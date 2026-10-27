import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useScrollLock } from '~/hooks/useScrollLock';

const lm = vi.hoisted(() => ({ close: vi.fn(), state: { shouldShow: false } }));
vi.mock('~/hooks', async () => {
  const actual = await vi.importActual<typeof import('~/hooks/useScrollLock')>('~/hooks/useScrollLock');
  return {
    useScrollLock: actual.useScrollLock,
    useLeadMagnet: () => ({ shouldShow: lm.state.shouldShow, currentStep: 'offer', setStep: vi.fn(), close: lm.close, submitEmail: vi.fn(), isSubmitting: false, error: null }),
  };
});
import { LeadMagnetPopup } from '~/components/marketing/LeadMagnetPopup';

describe('probe', () => {
  afterEach(() => { vi.restoreAllMocks(); });
  it('SL lock keeps the pre-lock scroll position', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => (document.body.style.position === 'fixed' ? 0 : 1500));
    const { rerender } = renderHook(({ on }) => useScrollLock(on), { initialProps: { on: true } });
    expect(document.body.style.top).toBe('-1500px');
    rerender({ on: false });
    expect(scrollTo).toHaveBeenCalledWith(0, 1500);
  });
  it('LM dialog focus', () => {
    const outside = document.createElement('button'); outside.textContent = 'outside'; document.body.appendChild(outside); outside.focus();
    lm.state.shouldShow = true;
    const { rerender } = render(<LeadMagnetPopup isLoggedIn={false} />);
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close');
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(lm.close).toHaveBeenCalledTimes(1);
    lm.state.shouldShow = false;
    act(() => { rerender(<LeadMagnetPopup isLoggedIn={false} />); });
    expect(document.activeElement).toBe(outside);
  });
});

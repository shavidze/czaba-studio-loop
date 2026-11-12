import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LeadMagnetPopup } from '~/components/marketing/LeadMagnetPopup';
import { useScrollLock } from '~/hooks/useScrollLock';

type LeadMagnetFixtureStep = 'offer' | 'email' | 'success';

interface LeadMagnetFixtureState {
  shouldShow: boolean;
  currentStep: LeadMagnetFixtureStep;
  isSubmitting: boolean;
  error: string | null;
}

const leadMagnetMock = vi.hoisted(() => {
  const state: LeadMagnetFixtureState = {
    shouldShow: false,
    currentStep: 'offer',
    isSubmitting: false,
    error: null,
  };
  return {
    state,
    close: vi.fn(() => undefined),
    setStep: vi.fn((_step: LeadMagnetFixtureStep) => undefined),
    submitEmail: vi.fn(async (_email: string) => undefined),
  };
});

vi.mock('~/hooks', async () => {
  const actual =
    await vi.importActual<typeof import('~/hooks/useScrollLock')>('~/hooks/useScrollLock');
  return {
    useScrollLock: actual.useScrollLock,
    useLeadMagnet: () => ({
      ...leadMagnetMock.state,
      close: leadMagnetMock.close,
      setStep: leadMagnetMock.setStep,
      submitEmail: leadMagnetMock.submitEmail,
    }),
  };
});

const STEP_DIALOG_NAMES: Record<LeadMagnetFixtureStep, string> = {
  offer: 'Get Your Tracks, Sound Effects & More',
  email: 'CONTINUE TO CLAIM YOUR OFFER',
  success: "We've sent your free mystery pack to your email!",
};

const STEP_CONTROL_NAMES: Record<LeadMagnetFixtureStep, string[]> = {
  offer: ['Close', 'FREE DOWNLOAD'],
  email: ['Close', 'CONTINUE'],
  success: ['Close', 'BACK TO SITE'],
};

const LEAD_MAGNET_STEPS: LeadMagnetFixtureStep[] = ['offer', 'email', 'success'];

const outsidePageButtons: HTMLButtonElement[] = [];

const popupElement = () => <LeadMagnetPopup isLoggedIn={false} />;

function addOutsideButton(): HTMLButtonElement {
  const outsideButton = document.createElement('button');
  outsideButton.type = 'button';
  outsideButton.textContent = 'Outside page control';
  document.body.appendChild(outsideButton);
  outsidePageButtons.push(outsideButton);
  return outsideButton;
}

function stepControls(step: LeadMagnetFixtureStep): HTMLElement[] {
  const dialog = screen.getByRole('dialog');
  const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button, input'));
  expect(controls.length).toBe(step === 'email' ? 3 : 2);
  return controls;
}

function openPopupAt(step: LeadMagnetFixtureStep) {
  leadMagnetMock.state.shouldShow = true;
  leadMagnetMock.state.currentStep = step;
  return render(popupElement());
}

describe('Store LeadMagnet popup as a modal dialog (R109)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    leadMagnetMock.state.shouldShow = false;
    leadMagnetMock.state.currentStep = 'offer';
    leadMagnetMock.state.isSubmitting = false;
    leadMagnetMock.state.error = null;
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    for (const outsideButton of outsidePageButtons.splice(0)) outsideButton.remove();
  });

  it.each(
    LEAD_MAGNET_STEPS,
  )('LM1 %s step: one modal dialog named by its own heading, unique button names', (step) => {
    openPopupAt(step);

    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0]?.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByRole('dialog', { name: STEP_DIALOG_NAMES[step] })).toBe(dialogs[0]);

    for (const name of STEP_CONTROL_NAMES[step]) {
      expect(screen.getAllByRole('button', { name })).toHaveLength(1);
    }
  });

  it('LM2 opening moves focus from the page to the Close button', () => {
    const outsideButton = addOutsideButton();
    act(() => outsideButton.focus());
    expect(document.activeElement).toBe(outsideButton);

    openPopupAt('offer');

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('LM2 a popup that opens on the email step still starts on the Close button', () => {
    openPopupAt('email');

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('LM3 the email step focuses the email field and the success step focuses BACK TO SITE', () => {
    const { rerender } = openPopupAt('offer');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));

    leadMagnetMock.state.currentStep = 'email';
    rerender(popupElement());
    expect(document.activeElement).toBe(screen.getByRole('textbox'));

    leadMagnetMock.state.currentStep = 'success';
    rerender(popupElement());
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'BACK TO SITE' }));
  });

  it('LM3 a failed submit that left focus on the page returns it to the email field', () => {
    const { rerender } = openPopupAt('email');
    const emailField = screen.getByRole('textbox');
    act(() => emailField.focus());

    act(() => emailField.blur());
    leadMagnetMock.state.isSubmitting = true;
    rerender(popupElement());
    expect(document.activeElement).toBe(document.body);

    leadMagnetMock.state.isSubmitting = false;
    leadMagnetMock.state.error = 'x';
    rerender(popupElement());
    expect(document.activeElement).toBe(emailField);
  });

  it('LM4 Escape inside closes once and stops propagation; Escape while composing is ignored', () => {
    openPopupAt('offer');
    const documentKeydown = vi.fn();
    document.addEventListener('keydown', documentKeydown);

    try {
      const freeDownload = screen.getByRole('button', { name: 'FREE DOWNLOAD' });
      fireEvent.keyDown(freeDownload, { key: 'Escape', isComposing: true });
      expect(leadMagnetMock.close).not.toHaveBeenCalled();

      fireEvent.keyDown(freeDownload, { key: 'Escape' });
      expect(leadMagnetMock.close).toHaveBeenCalledTimes(1);
      expect(documentKeydown).toHaveBeenCalledTimes(1);
      expect(documentKeydown.mock.calls[0]?.[0]).toMatchObject({ isComposing: true });
    } finally {
      document.removeEventListener('keydown', documentKeydown);
    }
  });

  it.each(
    LEAD_MAGNET_STEPS,
  )('LM5 %s step: Tab wraps from the last control and Shift+Tab wraps from the first', (step) => {
    openPopupAt(step);
    const controls = stepControls(step);
    const firstControl = controls[0];
    const lastControl = controls.at(-1);
    if (!firstControl || !lastControl) throw new Error('dialog controls missing');
    expect(firstControl).toBe(screen.getByRole('button', { name: 'Close' }));

    act(() => lastControl.focus());
    expect(fireEvent.keyDown(lastControl, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(firstControl);

    expect(fireEvent.keyDown(firstControl, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(lastControl);
  });

  it('LM5 email step while submitting: Tab on Close stays on the only enabled control', () => {
    leadMagnetMock.state.isSubmitting = true;
    openPopupAt('email');
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(document.activeElement).toBe(closeButton);

    expect(fireEvent.keyDown(closeButton, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(closeButton);
    expect(fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(closeButton);
  });

  it('LM6 Shift+Tab with the dialog element itself focused lands on the last control', () => {
    openPopupAt('offer');
    const dialog = screen.getByRole('dialog');
    act(() => dialog.focus());
    expect(document.activeElement).toBe(dialog);

    expect(fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'FREE DOWNLOAD' }));
  });

  it('LM7 closing returns focus to the pre-open element; a removed element is not forced', () => {
    const outsideButton = addOutsideButton();
    act(() => outsideButton.focus());
    const { rerender, unmount } = openPopupAt('offer');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));

    leadMagnetMock.state.shouldShow = false;
    rerender(popupElement());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(outsideButton);
    unmount();

    const removedButton = addOutsideButton();
    act(() => removedButton.focus());
    const second = openPopupAt('offer');
    removedButton.remove();

    leadMagnetMock.state.shouldShow = false;
    expect(() => second.rerender(popupElement())).not.toThrow();
    expect(document.activeElement).toBe(document.body);
  });

  it('LM7 unmounting while open restores focus and unlocks the body', () => {
    const outsideButton = addOutsideButton();
    act(() => outsideButton.focus());
    const { unmount } = openPopupAt('offer');
    expect(document.body.style.position).toBe('fixed');

    unmount();

    expect(document.activeElement).toBe(outsideButton);
    expect(document.body.style.position).toBe('');
  });

  it('LM9 the hook error is announced with role="alert" and unchanged text', () => {
    leadMagnetMock.state.error = 'x';
    openPopupAt('email');

    const alert = screen.getByRole('alert');
    expect(alert.tagName).toBe('P');
    expect(alert.textContent).toBe('x');
  });

  it('LM9 the empty-submit validation error is announced with role="alert"', () => {
    openPopupAt('email');
    expect(screen.queryByRole('alert')).toBeNull();

    const form = screen.getByRole('textbox').closest('form');
    if (!form) throw new Error('email form missing');
    fireEvent.submit(form);

    expect(screen.getByRole('alert').textContent).toBe('Please enter your email address');
    expect(leadMagnetMock.submitEmail).not.toHaveBeenCalled();
  });
});

describe('Store scroll lock keeps the page position (R110)', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() =>
      document.body.style.position === 'fixed' ? 0 : 1500,
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.body.removeAttribute('style');
  });

  function expectBodyUnlocked() {
    for (const property of ['position', 'overflow', 'top', 'width']) {
      expect(document.body.style.getPropertyValue(property), property).toBe('');
    }
  }

  it('LM8 lock reads scrollY before fixing the body and unlock or unmount restores it', () => {
    const scrollToSpy = vi.mocked(window.scrollTo);
    const { rerender, unmount } = renderHook(({ isLocked }) => useScrollLock(isLocked), {
      initialProps: { isLocked: true },
    });
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-1500px');

    rerender({ isLocked: false });
    expect(scrollToSpy).toHaveBeenCalledWith(0, 1500);
    expectBodyUnlocked();

    scrollToSpy.mockClear();
    rerender({ isLocked: true });
    expect(document.body.style.top).toBe('-1500px');
    unmount();
    expect(scrollToSpy).toHaveBeenCalledWith(0, 1500);
    expectBodyUnlocked();
  });
});

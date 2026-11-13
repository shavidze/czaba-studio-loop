import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccountPage from '~/routes/account';

const spies = vi.hoisted(() => ({
  updateProfile: vi.fn<(firstName: string, lastName: string) => Promise<void>>(),
  showToast: vi.fn(),
  user: {
    id: 7,
    email: 'buyer@example.invalid',
    firstName: 'Probe',
    lastName: 'User',
    name: 'Probe User',
    registrationSource: 'email',
  },
}));

vi.mock('~/hooks', () => ({
  useAuth: () => ({
    user: spies.user,
    updateProfile: spies.updateProfile,
    updatePassword: vi.fn(),
    isLoading: false,
  }),
  useToast: () => ({ showToast: spies.showToast }),
}));
vi.mock('~/components/auth', () => ({
  RequireAuth: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/account']}>
      <AccountPage />
    </MemoryRouter>,
  );
}

function nameButton() {
  return screen.getByRole('button', { name: 'Full Name Probe User' });
}

function deferred() {
  let resolve: () => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.clearAllMocks();
  spies.user.name = 'Probe User';
  spies.updateProfile.mockResolvedValue(undefined);
});
afterEach(() => cleanup());

describe('Account profile name editor (B-R486-PROFILE-NAME-KEYBOARD)', () => {
  it('PN1 the name is a native button named by the Full Name label and its value', () => {
    renderProfile();
    const button = nameButton();
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('tabindex')).toBeNull();
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.textContent).toBe('Probe User');
  });

  it('PN1b with no name the button keeps the visible copy in its name', () => {
    spies.user.name = '';
    renderProfile();
    expect(screen.getByRole('button', { name: 'Full Name Click to add name' })).toBeTruthy();
  });

  it('PN2 opening the editor focuses a labelled First name field; controls have unique names', () => {
    renderProfile();
    fireEvent.click(nameButton());
    const first = screen.getByRole('textbox', { name: 'First name' });
    expect(document.activeElement).toBe(first);
    expect(screen.getByRole('textbox', { name: 'Last name' })).toBeTruthy();
    for (const name of ['Save name', 'Cancel name edit']) {
      const matches = screen.getAllByRole('button', { name });
      expect(matches).toHaveLength(1);
      expect(matches[0].getAttribute('type')).toBe('button');
    }
  });

  it('PN3 Escape and Cancel close the editor and return focus to the name button', () => {
    renderProfile();
    fireEvent.click(nameButton());
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'First name' }), { key: 'Escape' });
    expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
    expect(document.activeElement).toBe(nameButton());

    fireEvent.click(nameButton());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel name edit' }));
    expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
    expect(document.activeElement).toBe(nameButton());
    expect(spies.updateProfile).not.toHaveBeenCalled();
  });

  it('PN4 Enter saves once and returns focus to the name button', async () => {
    renderProfile();
    fireEvent.click(nameButton());
    const first = screen.getByRole('textbox', { name: 'First name' });
    fireEvent.change(first, { target: { value: '  Ada ' } });
    await act(async () => {
      fireEvent.keyDown(first, { key: 'Enter' });
    });
    expect(spies.updateProfile).toHaveBeenCalledTimes(1);
    expect(spies.updateProfile).toHaveBeenCalledWith('Ada', 'User');
    expect(spies.showToast).toHaveBeenCalledWith('Name updated', 'success');
    expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
    expect(document.activeElement).toBe(nameButton());
  });

  it('PN5 a repeated Enter and a second Enter during the save do not send another save', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    const first = screen.getByRole('textbox', { name: 'First name' });
    fireEvent.keyDown(first, { key: 'Enter', repeat: true });
    expect(spies.updateProfile).not.toHaveBeenCalled();
    act(() => {
      fireEvent.keyDown(first, { key: 'Enter' });
      fireEvent.keyDown(first, { key: 'Enter' });
    });
    expect(spies.updateProfile).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(spies.updateProfile).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(nameButton());
  });

  it('PN6 an empty first name keeps the editor open and focuses First name', () => {
    renderProfile();
    fireEvent.click(nameButton());
    const first = screen.getByRole('textbox', { name: 'First name' });
    const last = screen.getByRole('textbox', { name: 'Last name' });
    fireEvent.change(first, { target: { value: '   ' } });
    last.focus();
    fireEvent.keyDown(last, { key: 'Enter' });
    expect(spies.showToast).toHaveBeenCalledWith('First name is required', 'error');
    expect(spies.updateProfile).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(first);
  });

  it('PN7 a failed save keeps the editor open, re-enables it and focuses First name', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    const last = screen.getByRole('textbox', { name: 'Last name' });
    last.focus();
    act(() => {
      fireEvent.keyDown(last, { key: 'Enter' });
    });
    await act(async () => {
      pending.reject(new Error('Stub failure'));
      await pending.promise.catch(() => undefined);
    });
    expect(spies.showToast).toHaveBeenCalledWith('Stub failure', 'error');
    const first = screen.getByRole('textbox', { name: 'First name' });
    expect(document.activeElement).toBe(first);
    expect(screen.getByRole('button', { name: 'Save name' }).hasAttribute('disabled')).toBe(false);
    await act(async () => {
      fireEvent.keyDown(first, { key: 'Enter' });
    });
    expect(spies.updateProfile).toHaveBeenCalledTimes(2);
  });

  it('PN9 Escape during a pending save keeps the editor open; the save then returns focus to the name button', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    const first = screen.getByRole('textbox', { name: 'First name' });
    act(() => {
      fireEvent.keyDown(first, { key: 'Enter' });
    });
    fireEvent.keyDown(first, { key: 'Escape' });
    expect(screen.getByRole('textbox', { name: 'First name' })).toBe(first);
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
    expect(document.activeElement).toBe(nameButton());
    expect(spies.updateProfile).toHaveBeenCalledTimes(1);
  });

  it('PN10 focus moved off the editor during a save stays there when the save succeeds', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    act(() => {
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'First name' }), { key: 'Enter' });
    });
    const passwordLink = screen.getByRole('button', { name: 'Click to change password' });
    passwordLink.focus();
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(spies.showToast).toHaveBeenCalledWith('Name updated', 'success');
    expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
    expect(document.activeElement).toBe(passwordLink);
  });

  it('PN10b focus moved off the editor during a save stays there when the save fails', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    act(() => {
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'First name' }), { key: 'Enter' });
    });
    const passwordLink = screen.getByRole('button', { name: 'Click to change password' });
    passwordLink.focus();
    await act(async () => {
      pending.reject(new Error('Stub failure'));
      await pending.promise.catch(() => undefined);
    });
    expect(spies.showToast).toHaveBeenCalledWith('Stub failure', 'error');
    expect(screen.getByRole('textbox', { name: 'First name' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save name' }).hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(passwordLink);
  });

  it('PN10c a Save name click with focus on the body returns focus to the name button', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    screen.getByRole('textbox', { name: 'First name' }).blur();
    expect(document.activeElement).toBe(document.body);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Save name' }));
    });
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(spies.updateProfile).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
    expect(document.activeElement).toBe(nameButton());
  });

  it('PN10d a Save name click with focus on the body focuses First name when the save fails', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    screen.getByRole('textbox', { name: 'First name' }).blur();
    expect(document.activeElement).toBe(document.body);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Save name' }));
    });
    await act(async () => {
      pending.reject(new Error('Stub failure'));
      await pending.promise.catch(() => undefined);
    });
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'First name' }));
  });

  it('PN10e focus on a clicked account tab during a save stays on that tab after the save settles', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    act(() => {
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'First name' }), { key: 'Enter' });
    });
    const ordersTab = screen.getByRole('link', { name: 'Orders' });
    ordersTab.focus();
    act(() => {
      fireEvent.click(ordersTab);
    });
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(spies.updateProfile).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(ordersTab);
  });

  it('PN10f an unfocused click that opens the password dialog during a save keeps focus off the editor when the save succeeds', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    screen.getByRole('textbox', { name: 'First name' }).blur();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Save name' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Click to change password' }));
    });
    expect(document.activeElement).toBe(document.body);
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(spies.updateProfile).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('textbox', { name: 'First name' })).toBeNull();
    expect(document.activeElement).not.toBe(nameButton());
    expect(document.activeElement).toBe(document.body);
  });

  it('PN10g an unfocused click that opens the password dialog during a save keeps focus off First name when the save fails', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(nameButton());
    screen.getByRole('textbox', { name: 'First name' }).blur();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Save name' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Click to change password' }));
    });
    expect(document.activeElement).toBe(document.body);
    await act(async () => {
      pending.reject(new Error('Stub failure'));
      await pending.promise.catch(() => undefined);
    });
    expect(spies.showToast).toHaveBeenCalledWith('Stub failure', 'error');
    expect(document.activeElement).not.toBe(screen.getByRole('textbox', { name: 'First name' }));
    expect(document.activeElement).toBe(document.body);
  });

  it('PN10h after the password dialog is cancelled, a later save returns focus to the name button', async () => {
    const pending = deferred();
    spies.updateProfile.mockReturnValue(pending.promise);
    renderProfile();
    fireEvent.click(screen.getByRole('button', { name: 'Click to change password' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(nameButton());
    act(() => {
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'First name' }), { key: 'Enter' });
    });
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    expect(spies.updateProfile).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(nameButton());
  });

  it('PN8 a repeated Enter on the name button is suppressed; a first Enter is not', () => {
    renderProfile();
    const button = nameButton();
    expect(fireEvent.keyDown(button, { key: 'Enter', repeat: true })).toBe(false);
    expect(fireEvent.keyDown(button, { key: 'Enter' })).toBe(true);
    expect(fireEvent.keyDown(button, { key: ' ', repeat: true })).toBe(true);
  });
});

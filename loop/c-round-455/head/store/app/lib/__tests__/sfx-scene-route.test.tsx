import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SceneRoute from '~/routes/scenes.$productId';
import { ApiError, apiClient } from '~/services/api/client';

const auth = vi.hoisted(() => ({ token: 'first-token' }));
vi.mock('@remix-run/react', () => ({
  useParams: () => ({ productId: '1004' }),
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock('~/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 7, accessToken: auth.token } }),
}));
vi.mock('~/contexts/AudioContext', () => ({ useAudio: () => ({ closePlayer: vi.fn() }) }));
vi.mock('~/components/auth', () => ({
  RequireAuth: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('~/components/recordings/SfxSceneBuilder', () => ({
  SfxSceneBuilder: () => <div>Scene ready</div>,
}));
vi.mock('~/services/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/services/api/client')>();
  return {
    ...actual,
    apiClient: {
      getProductRecordingCatalog: vi.fn(),
      getSfxLibrary: vi.fn().mockResolvedValue([]),
      setAccessToken: vi.fn(),
    },
  };
});
beforeEach(() => {
  vi.clearAllMocks();
  auth.token = 'first-token';
});
afterEach(() => cleanup());

describe('Scene route bounded catalog loading', () => {
  it('loads once despite new audio callbacks, provider rerenders and token refresh', async () => {
    let calls = 0;
    vi.mocked(apiClient.getProductRecordingCatalog).mockImplementation(() => {
      calls++;
      if (calls > 3) return new Promise(() => {});
      return Promise.resolve({
        productId: 1004,
        productTitle: 'Mall',
        licenseType: 'Universal',
        recordings: [],
      });
    });
    const view = render(<SceneRoute />);
    await screen.findByText('Scene ready');
    for (let i = 0; i < 5; i++) view.rerender(<SceneRoute />);
    auth.token = 'refreshed-token';
    view.rerender(<SceneRoute />);
    await waitFor(() =>
      expect(apiClient.setAccessToken).toHaveBeenLastCalledWith('refreshed-token'),
    );
    expect(apiClient.getProductRecordingCatalog).toHaveBeenCalledOnce();
    expect(screen.getByText('Scene ready')).toBeTruthy();
  });
  it('stops on a failed request until the user explicitly retries', async () => {
    vi.mocked(apiClient.getProductRecordingCatalog).mockRejectedValue(
      new Error('Collection unavailable'),
    );
    render(<SceneRoute />);
    await screen.findByRole('alert');
    expect(apiClient.getProductRecordingCatalog).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(apiClient.getProductRecordingCatalog).toHaveBeenCalledTimes(2));
  });
  it('backs off a rate limit without issuing automatic retries', async () => {
    vi.mocked(apiClient.getProductRecordingCatalog).mockRejectedValue(
      new ApiError('Rate limited', 429),
    );
    render(<SceneRoute />);
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Retry in 15s' })).toHaveProperty('disabled', true);
    expect(apiClient.getProductRecordingCatalog).toHaveBeenCalledOnce();
  });
});

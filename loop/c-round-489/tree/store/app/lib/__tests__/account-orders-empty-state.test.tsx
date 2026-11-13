import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersPage from '~/routes/account.orders';
import { apiClient } from '~/services/api/client';

vi.mock('~/hooks', () => ({
  useAuth: () => ({ user: { id: 7, email: 'buyer@example.invalid', accessToken: 'token' } }),
}));
vi.mock('~/components/auth', () => ({
  RequireAuth: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('~/services/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/services/api/client')>();
  return {
    ...actual,
    apiClient: {
      getMyOrders: vi.fn(),
      setAccessToken: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(apiClient.getMyOrders).mockResolvedValue({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 50,
  });
});
afterEach(() => cleanup());

describe('Account orders empty state (B-R478-DEAD-MUSIC-LINK)', () => {
  it('AO1 Browse Music links to the store catalogue', async () => {
    render(<OrdersPage />);
    await screen.findByText('No orders yet');
    const link = screen.getByRole('link', { name: 'Browse Music' });
    expect(link.getAttribute('href')).toBe('/store');
    expect(link.hasAttribute('data-discover')).toBe(false);
    expect(apiClient.getMyOrders).toHaveBeenCalledWith(1, 50);
  });

  it('AO2 the empty state has exactly one link, to /store', async () => {
    render(<OrdersPage />);
    await screen.findByText('No orders yet');
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['/store']);
  });
});

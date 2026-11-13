import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersPage from '~/routes/account.orders';
import { apiClient, type Order } from '~/services/api/client';

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

const ORDERS: Order[] = [
  {
    id: 101,
    orderNumber: '1001',
    userId: 7,
    status: 'Completed',
    paymentStatus: 'Paid',
    subtotal: 49,
    tax: 0,
    total: 49,
    currency: 'USD',
    createdAt: '2026-11-01T10:00:00Z',
    items: [
      {
        id: 501,
        productId: 11,
        productTitle: 'Middle East',
        variantName: 'Full mix + 4 stems',
        licenseType: 'Standard',
        unitPrice: 49,
        quantity: 1,
        total: 49,
      },
    ],
  },
  {
    id: 102,
    orderNumber: '1002',
    userId: 7,
    status: 'Completed',
    paymentStatus: 'Pending',
    subtotal: 98,
    tax: 0,
    total: 98,
    currency: 'USD',
    createdAt: '2026-11-05T10:00:00Z',
    items: [
      {
        id: 502,
        productId: 12,
        productTitle: 'Night Drive',
        licenseType: 'Extended',
        unitPrice: 59,
        quantity: 1,
        total: 59,
      },
      {
        id: 503,
        productId: 13,
        productTitle: 'Dust Storm',
        licenseType: 'Standard',
        unitPrice: 39,
        quantity: 1,
        total: 39,
      },
    ],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(apiClient.getMyOrders).mockResolvedValue({
    items: ORDERS,
    totalCount: ORDERS.length,
    pageNumber: 1,
    pageSize: 50,
  });
});
afterEach(() => cleanup());

function renderOrders(): void {
  render(<OrdersPage />);
}

async function findToggle(orderNumber: string): Promise<HTMLElement> {
  return screen.findByRole('button', { name: new RegExp(`^Order #${orderNumber}(?!\\d)`) });
}

function controlledPanel(toggle: HTMLElement): HTMLElement {
  const panelId = toggle.getAttribute('aria-controls');
  expect(panelId).toBeTruthy();
  const panel = panelId ? document.getElementById(panelId) : null;
  expect(panel).not.toBeNull();
  if (!panel) throw new Error('controlled panel missing');
  return panel;
}

describe('Account order card disclosure (B-R480-ORDER-CARD-KEYBOARD)', () => {
  it('OC1 each order header is a native button inside its h3, collapsed, controlling a hidden panel', async () => {
    renderOrders();
    const toggle = await findToggle('1001');
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle.getAttribute('type')).toBe('button');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.closest('h3')).not.toBeNull();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    const panel = controlledPanel(toggle);
    expect(panel.hidden).toBe(true);
    expect(toggle.contains(panel)).toBe(false);
    expect(screen.queryByRole('heading', { level: 4, name: 'Middle East' })).toBeNull();
    expect(document.querySelectorAll('[role="button"]')).toHaveLength(0);
  });

  it('OC2 activating the toggle shows items, licence and prices, and activating again hides them', async () => {
    renderOrders();
    const toggle = await findToggle('1001');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const panel = controlledPanel(toggle);
    expect(panel.hidden).toBe(false);
    const inPanel = within(panel);
    expect(inPanel.getByRole('heading', { level: 4, name: 'Middle East' })).toBeTruthy();
    expect(inPanel.getByText('Full mix + 4 stems')).toBeTruthy();
    expect(inPanel.getByText(/Standard License/)).toBeTruthy();
    expect(inPanel.getByText('Total')).toBeTruthy();
    expect(inPanel.getAllByText('$49.00')).toHaveLength(2);
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
    expect(screen.queryByRole('heading', { level: 4, name: 'Middle East' })).toBeNull();
  });

  it('OC3 cards toggle independently and control distinct panels', async () => {
    renderOrders();
    const first = await findToggle('1001');
    const second = await findToggle('1002');
    expect(first.getAttribute('aria-controls')).not.toBe(second.getAttribute('aria-controls'));
    fireEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(controlledPanel(first).hidden).toBe(true);
    const secondPanel = within(controlledPanel(second));
    expect(secondPanel.getByRole('heading', { level: 4, name: 'Night Drive' })).toBeTruthy();
    expect(secondPanel.getByRole('heading', { level: 4, name: 'Dust Storm' })).toBeTruthy();
  });

  it('OC4 the toggle keeps focus and its node across expand and collapse', async () => {
    renderOrders();
    const toggle = await findToggle('1002');
    toggle.focus();
    fireEvent.click(toggle);
    const expanded = await findToggle('1002');
    expect(expanded).toBe(toggle);
    expect(document.activeElement).toBe(toggle);
    fireEvent.click(toggle);
    expect(await findToggle('1002')).toBe(toggle);
    expect(document.activeElement).toBe(toggle);
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GiftCardInput } from '~/components/cart/GiftCardInput';

const cart = vi.hoisted(() => ({
  applyGiftCard: vi.fn(),
  removeGiftCard: vi.fn(),
  isApplyingDiscount: false,
}));
vi.mock('~/hooks', () => ({ useCart: () => cart }));
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  cart.isApplyingDiscount = false;
});

describe('Gift card input', () => {
  it('renders the API masked code and numeric applied amount', () => {
    render(
      <GiftCardInput
        appliedGiftCards={[{ code: 'ABC123', maskedCode: '****123', balance: 50, amountToUse: 25 }]}
      />,
    );
    expect(screen.getByText('Gift Card ****123')).toBeTruthy();
    expect(screen.getByText('-$25.00')).toBeTruthy();
  });

  it('preserves the code and displays rejected application feedback', async () => {
    cart.applyGiftCard.mockRejectedValue(new Error('Gift card expired'));
    render(<GiftCardInput />);
    fireEvent.click(screen.getByText('Have a gift card or promo code?'));
    fireEvent.change(screen.getByLabelText('Gift card code'), { target: { value: 'EXPIRED' } });
    fireEvent.click(screen.getByText('Apply'));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Gift card expired'),
    );
    expect(screen.getByDisplayValue('EXPIRED')).toBeTruthy();
  });

  it('removes the currently applied gift card without a legacy ID', async () => {
    cart.removeGiftCard.mockResolvedValue(undefined);
    render(
      <GiftCardInput
        appliedGiftCards={[{ code: 'ABC123', maskedCode: '****123', balance: 50, amountToUse: 25 }]}
      />,
    );
    fireEvent.click(screen.getByLabelText('Remove gift card'));
    await waitFor(() => expect(cart.removeGiftCard).toHaveBeenCalledWith());
  });
});

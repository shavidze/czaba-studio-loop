import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductDetailPage } from '~/components/product/ProductDetailPage';
import { ProductSidebar } from '~/components/product/ProductSidebar';
import type { Product } from '~/services/api/client';

interface PurchaseMockState {
  isAuthenticated: boolean;
  ownedVersionType: 'standard' | 'premium' | null;
  ownsByHandle: boolean;
  isPurchasesLoading: boolean;
}

const state = vi.hoisted(
  (): PurchaseMockState => ({
    isAuthenticated: false,
    ownedVersionType: null,
    ownsByHandle: false,
    isPurchasesLoading: false,
  }),
);

const spies = vi.hoisted(() => ({
  openModal: vi.fn(),
  showToast: vi.fn(),
  addToCart: vi.fn(),
  buyNow: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@remix-run/react', () => ({
  useSearchParams: () => [new URLSearchParams()],
  useNavigate: () => spies.navigate,
  Link: ({ children, to, className }: { children: ReactNode; to: string; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));
vi.mock('~/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: state.isAuthenticated, openModal: spies.openModal }),
}));
vi.mock('~/hooks/useToast', () => ({ useToast: () => ({ showToast: spies.showToast }) }));
vi.mock('~/hooks/useCart', () => ({
  useCart: () => ({
    addToCart: spies.addToCart,
    buyNow: spies.buyNow,
    isAddingToCart: false,
    isBuyingNow: false,
    isVariantInCart: () => false,
  }),
}));
vi.mock('~/hooks/usePurchases', () => ({
  usePurchases: () => ({
    getProductVersionType: () => state.ownedVersionType,
    isProductOwnedByHandle: () => state.ownsByHandle,
    isLoading: state.isPurchasesLoading,
    purchasedProducts: [],
  }),
}));
vi.mock('~/lib/analytics', () => ({ trackAddToCart: vi.fn(), trackBeginCheckout: vi.fn() }));
vi.mock('~/lib/facebook-pixel', () => ({
  trackFBAddToCart: vi.fn(),
  trackFBInitiateCheckout: vi.fn(),
}));
vi.mock('~/components/audio', () => ({
  AudioPreviewButton: () => <button type="button">Play preview</button>,
}));
vi.mock('~/contexts/StemsContext', () => ({ useStems: () => ({ openStems: vi.fn() }) }));

import { trackAddToCart, trackBeginCheckout } from '~/lib/analytics';
import { trackFBAddToCart, trackFBInitiateCheckout } from '~/lib/facebook-pixel';

const REASON_TEXT = 'Price unavailable — contact us to buy it.';

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 9,
    title: 'Priceless Pack',
    category: 'SFX',
    handle: 'priceless-pack',
    isNew: false,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-31T00:00:00Z',
    ...overrides,
  };
}

const doorSlams = (): Product =>
  createProduct({ id: 3, title: 'Door Slams', handle: 'door-slams', standardPrice: 9 });

const trackWithVariants = (): Product =>
  createProduct({
    id: 1,
    title: 'Middle East',
    category: 'Track',
    handle: 'middle-east',
    variants: [
      { id: 21, productId: 1, name: 'Standard', price: 29, position: 1, createdAt: '2026-10-01' },
      { id: 22, productId: 1, name: 'Premium', price: 99, position: 2, createdAt: '2026-10-01' },
    ],
  });

function renderPage(product: Product) {
  return render(<ProductDetailPage product={product} />);
}

function purchaseButtons() {
  return {
    addToCart: screen.getByRole('button', { name: 'Add to Cart' }),
    buyNow: screen.getByRole('button', { name: 'Buy Now' }),
  };
}

function activateEveryWay(button: HTMLElement) {
  fireEvent.click(button);
  fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
  fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });
  fireEvent.keyDown(button, { key: ' ', code: 'Space' });
  fireEvent.keyUp(button, { key: ' ', code: 'Space' });
}

function expectNoPurchaseSideEffects() {
  expect(spies.openModal).toHaveBeenCalledTimes(0);
  expect(spies.showToast).toHaveBeenCalledTimes(0);
  expect(spies.addToCart).toHaveBeenCalledTimes(0);
  expect(spies.buyNow).toHaveBeenCalledTimes(0);
  expect(trackAddToCart).toHaveBeenCalledTimes(0);
  expect(trackBeginCheckout).toHaveBeenCalledTimes(0);
  expect(trackFBAddToCart).toHaveBeenCalledTimes(0);
  expect(trackFBInitiateCheckout).toHaveBeenCalledTimes(0);
}

beforeEach(() => {
  vi.clearAllMocks();
  state.isAuthenticated = false;
  state.ownedVersionType = null;
  state.ownsByHandle = false;
  state.isPurchasesLoading = false;
});
afterEach(() => cleanup());

describe('product page price fallback (FIX-PD-1a)', () => {
  it('PU1: an SFX product with no variants shows its catalogue price, never $0.00', () => {
    const { container } = renderPage(doorSlams());
    expect(container.textContent).toContain('$9.00');
    expect(container.textContent).not.toContain('$0.00');
    const { addToCart, buyNow } = purchaseButtons();
    for (const button of [addToCart, buyNow]) {
      expect(button.getAttribute('aria-disabled')).toBeNull();
      expect(button.hasAttribute('disabled')).toBe(false);
    }
  });

  it('PU2: a priceless product says Price unavailable, soft-disables both buttons and links the reason', () => {
    const { container } = renderPage(createProduct());
    expect(screen.getAllByText('Price unavailable', { exact: false }).length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain('$');
    const { addToCart, buyNow } = purchaseButtons();
    for (const button of [addToCart, buyNow]) {
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.hasAttribute('disabled')).toBe(false);
      const reasonId = button.getAttribute('aria-describedby');
      expect(reasonId).toBeTruthy();
      const reason = reasonId ? document.getElementById(reasonId) : null;
      expect(reason?.textContent).toBe(REASON_TEXT);
    }
    const link = screen.getByRole('link', { name: 'contact us' });
    expect(link.getAttribute('href')).toBe('/support');
  });

  it('PU3: priceless and signed out, click, Enter and Space on each button do nothing', () => {
    renderPage(createProduct());
    const { addToCart, buyNow } = purchaseButtons();
    activateEveryWay(addToCart);
    activateEveryWay(buyNow);
    expectNoPurchaseSideEffects();
  });

  it('PU4: priceless, signed in and not an owner, the buttons still do nothing', () => {
    state.isAuthenticated = true;
    renderPage(createProduct());
    const { addToCart, buyNow } = purchaseButtons();
    activateEveryWay(addToCart);
    activateEveryWay(buyNow);
    expectNoPurchaseSideEffects();
  });

  it('PU5: priceless, the owner and loading panels keep precedence', () => {
    state.isAuthenticated = true;
    state.ownsByHandle = true;
    const view = renderPage(createProduct());
    expect(screen.getByText('You own this collection')).toBeTruthy();

    state.ownsByHandle = false;
    state.ownedVersionType = 'premium';
    view.rerender(<ProductDetailPage product={createProduct({ id: 10, category: 'Track' })} />);
    expect(screen.getByText('You own Premium')).toBeTruthy();

    state.ownedVersionType = 'standard';
    view.rerender(<ProductDetailPage product={createProduct({ id: 11, category: 'Track' })} />);
    expect(screen.getByText('You own Standard')).toBeTruthy();

    state.ownedVersionType = null;
    state.isPurchasesLoading = true;
    view.rerender(<ProductDetailPage product={createProduct({ id: 12 })} />);
    expect(screen.getByText('Checking purchase status...')).toBeTruthy();
    expect(screen.queryByText(REASON_TEXT)).toBeNull();
  });

  it('PU6: a known-price Track buys exactly as before and Premium shows its own price', async () => {
    const product = trackWithVariants();
    const view = renderPage(product);
    const { container } = view;
    const panelPrice = () => screen.getByText('Total Price').parentElement?.textContent ?? '';
    expect(panelPrice()).toContain('$29.00');
    const { addToCart, buyNow } = purchaseButtons();
    expect(addToCart.getAttribute('aria-disabled')).toBeNull();
    expect(buyNow.getAttribute('aria-disabled')).toBeNull();
    await act(async () => {
      fireEvent.click(addToCart);
    });
    expect(spies.addToCart).toHaveBeenCalledTimes(1);
    expect(spies.addToCart).toHaveBeenCalledWith(1, 'middle-east', 21);
    const knownPriceEvent = {
      productId: '1',
      productTitle: 'Middle East',
      productPrice: 29,
      currency: 'USD',
    };
    expect(trackAddToCart).toHaveBeenCalledWith(knownPriceEvent);
    expect(trackFBAddToCart).toHaveBeenCalledWith(knownPriceEvent);
    fireEvent.click(buyNow);
    expect(spies.openModal).toHaveBeenCalledTimes(1);
    expect(spies.openModal).toHaveBeenCalledWith('signin');
    expect(spies.buyNow).toHaveBeenCalledTimes(0);

    state.isAuthenticated = true;
    view.rerender(<ProductDetailPage product={trackWithVariants()} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Buy Now' }));
    });
    expect(spies.buyNow).toHaveBeenCalledTimes(1);
    expect(spies.buyNow).toHaveBeenCalledWith(1, 21);
    expect(trackBeginCheckout).toHaveBeenCalledWith(knownPriceEvent);
    expect(trackFBInitiateCheckout).toHaveBeenCalledWith(knownPriceEvent);

    const premiumOption = within(container)
      .getAllByRole('button', { name: /Premium/ })
      .find((button) => button.hasAttribute('aria-pressed'));
    expect(premiumOption).toBeTruthy();
    if (premiumOption) fireEvent.click(premiumOption);
    expect(panelPrice()).toContain('$99.00');
  });
});

describe('product sidebar free badge (FIX-PD-1a)', () => {
  it('PU7: Complimentary Download shows only for an explicit 0 price', () => {
    const view = render(<ProductSidebar product={createProduct()} />);
    expect(screen.queryByText('Complimentary Download')).toBeNull();
    view.rerender(<ProductSidebar product={createProduct({ id: 13, standardPrice: 0 })} />);
    expect(screen.getByText('Complimentary Download')).toBeTruthy();
    view.rerender(<ProductSidebar product={createProduct({ id: 14, standardPrice: 9 })} />);
    expect(screen.queryByText('Complimentary Download')).toBeNull();
  });
});

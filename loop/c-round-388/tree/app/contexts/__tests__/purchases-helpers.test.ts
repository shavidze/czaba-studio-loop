import { describe, expect, it } from 'vitest';
import { determineVersionType } from '../PurchasesContext';

describe('determineVersionType', () => {
  it('returns "premium" for "Premium" license', () => {
    expect(determineVersionType('Premium')).toBe('premium');
  });

  it('returns "premium" for "premium" lowercase', () => {
    expect(determineVersionType('premium')).toBe('premium');
  });

  it('returns "premium" for "PREMIUM" uppercase', () => {
    expect(determineVersionType('PREMIUM')).toBe('premium');
  });

  it('returns "premium" for "Premium License"', () => {
    expect(determineVersionType('Premium License')).toBe('premium');
  });

  it('returns "standard" for "Standard" license', () => {
    expect(determineVersionType('Standard')).toBe('standard');
  });

  it('returns "standard" for "standard" lowercase', () => {
    expect(determineVersionType('standard')).toBe('standard');
  });

  it('returns "standard" for "Standard License"', () => {
    expect(determineVersionType('Standard License')).toBe('standard');
  });

  it('returns null for unknown license type', () => {
    expect(determineVersionType('Basic')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(determineVersionType('')).toBeNull();
  });

  it('prioritizes premium over standard when both are in string', () => {
    expect(determineVersionType('Premium Standard')).toBe('premium');
  });

  it('_BUG returns "premium" for "PremiumPlus" (includes "premium" substring)', () => {
    expect(determineVersionType('PremiumPlus')).toBe('premium');
  });

  it('_BUG returns "standard" for "NonStandardFormat" (includes "standard" substring)', () => {
    expect(determineVersionType('NonStandardFormat')).toBe('standard');
  });
});

describe('version upgrade logic', () => {
  it('Premium is higher tier than Standard', () => {
    const premiumType = determineVersionType('Premium');
    const standardType = determineVersionType('Standard');

    expect(premiumType).toBe('premium');
    expect(standardType).toBe('standard');
    expect(premiumType).not.toBe(standardType);
  });

  it('shouldUpdateVersion: premium overrides standard', () => {
    const existingVersionType = determineVersionType('Standard');
    const newVersionType = determineVersionType('Premium');

    const shouldUpdate = newVersionType === 'premium' && existingVersionType !== 'premium';
    expect(shouldUpdate).toBe(true);
  });

  it('shouldUpdateVersion: standard does NOT override premium', () => {
    const existingVersionType = determineVersionType('Premium');
    const newVersionType = determineVersionType('Standard');

    const shouldUpdate = newVersionType === 'premium' && existingVersionType !== 'premium';
    expect(shouldUpdate).toBe(false);
  });

  it('shouldUpdateVersion: premium does NOT override premium', () => {
    const existingVersionType = determineVersionType('Premium');
    const newVersionType = determineVersionType('Premium');

    const shouldUpdate = newVersionType === 'premium' && existingVersionType !== 'premium';
    expect(shouldUpdate).toBe(false);
  });

  it('shouldUpdateVersion: null does NOT override standard', () => {
    const existingVersionType = determineVersionType('Standard');
    const newVersionType = determineVersionType('Unknown');

    const shouldUpdate = newVersionType === 'premium' && existingVersionType !== 'premium';
    expect(shouldUpdate).toBe(false);
  });
});

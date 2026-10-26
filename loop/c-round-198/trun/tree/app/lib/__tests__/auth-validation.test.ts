import { describe, expect, it } from 'vitest';
import { validateEmail, validateEmailSmart, validatePassword } from '../auth';

describe('validateEmailSmart', () => {
  it('rejects invalid email format', () => {
    const result = validateEmailSmart('notanemail');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects email without domain', () => {
    const result = validateEmailSmart('user@');
    expect(result.isValid).toBe(false);
  });

  it('rejects email starting with dot', () => {
    const result = validateEmailSmart('.user@gmail.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('dot');
  });

  it('rejects email ending with dot in local part', () => {
    const result = validateEmailSmart('user.@gmail.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('dot');
  });

  it('rejects email with consecutive dots', () => {
    const result = validateEmailSmart('user..name@gmail.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('consecutive dots');
  });

  it('rejects email with single-char TLD', () => {
    const result = validateEmailSmart('user@domain.x');
    expect(result.isValid).toBe(false);
  });

  it('accepts valid email', () => {
    const result = validateEmailSmart('user@gmail.com');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBeUndefined();
    expect(result.error).toBeUndefined();
  });

  it('accepts valid email with dots in local part', () => {
    const result = validateEmailSmart('first.last@gmail.com');
    expect(result.isValid).toBe(true);
  });

  it('suggests gmail.com for gmail.co typo', () => {
    const result = validateEmailSmart('user@gmail.co');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBe('user@gmail.com');
  });

  it('suggests gmail.com for gmail.con typo', () => {
    const result = validateEmailSmart('user@gmail.con');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBe('user@gmail.com');
  });

  it('suggests gmail.com for gmial.com typo', () => {
    const result = validateEmailSmart('user@gmial.com');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBe('user@gmail.com');
  });

  it('suggests gmail.com for gmai.com typo', () => {
    const result = validateEmailSmart('user@gmai.com');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBe('user@gmail.com');
  });

  it('suggests yahoo.com for yahoo.co typo', () => {
    const result = validateEmailSmart('user@yahoo.co');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBe('user@yahoo.com');
  });

  it('suggests hotmail.com for hotmail.co typo', () => {
    const result = validateEmailSmart('user@hotmail.co');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBe('user@hotmail.com');
  });

  it('suggests outlook.com for outlook.con typo', () => {
    const result = validateEmailSmart('user@outlook.con');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBe('user@outlook.com');
  });

  it('does not suggest for valid non-typo domains', () => {
    const result = validateEmailSmart('user@company.io');
    expect(result.isValid).toBe(true);
    expect(result.suggestion).toBeUndefined();
  });
});

describe('validateEmail', () => {
  it('returns true for valid email', () => {
    expect(validateEmail('user@gmail.com')).toBe(true);
  });

  it('returns false for invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  it('returns true for email with typo (still valid format)', () => {
    expect(validateEmail('user@gmail.co')).toBe(true);
  });
});

describe('validatePassword', () => {
  it('returns false for short password', () => {
    expect(validatePassword('1234567')).toBe(false);
  });

  it('returns true for 8 character password', () => {
    expect(validatePassword('12345678')).toBe(true);
  });

  it('returns true for long password', () => {
    expect(validatePassword('averylongpassword123')).toBe(true);
  });

  it('returns false for empty password', () => {
    expect(validatePassword('')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { validateEmailSmart, validatePassword } from '~/lib/auth';

describe('Auth validation regressions', () => {
  it.each([
    'user@mail.gmail.co',
    'user@not-yahoo.co',
    'user@myhotmail.co',
    'user@outlook.con.example.com',
  ])('does not rewrite a valid non-matching domain: %s', (email) => {
    expect(validateEmailSmart(email)).toEqual({ isValid: true });
  });
  it.each([
    'user@-invalid.com',
    'user@invalid-.com',
    'user@two..dots.com',
    'user@.example.com',
    'user@' + 'a'.repeat(64) + '.com',
  ])('rejects malformed DNS labels: %s', (email) =>
    expect(validateEmailSmart(email).isValid).toBe(false));
  it.each([
    'user@123.co',
    'user@my-domain.com',
    'user@sub.example.com',
    'user@' + 'a'.repeat(63) + '.com',
  ])('accepts valid numeric, hyphenated and boundary-length labels: %s', (email) =>
    expect(validateEmailSmart(email).isValid).toBe(true));
  it('suggests a correction only for an exact known typo', () => {
    expect(validateEmailSmart('user@gmial.com')).toEqual({
      isValid: true,
      suggestion: 'user@gmail.com',
    });
  });
  it('rejects whitespace-only passwords', () => expect(validatePassword('        ')).toBe(false));
  it('retains the existing minimum-length policy without inventing a complexity requirement', () => {
    expect(validatePassword('aaaaaaaa')).toBe(true);
  });
});

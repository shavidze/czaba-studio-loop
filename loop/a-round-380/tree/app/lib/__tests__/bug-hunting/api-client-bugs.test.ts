import { describe, expect, it } from 'vitest';

/**
 * Tests for API client query parameter bugs.
 * These test the getProducts filter logic by reproducing the
 * URLSearchParams construction pattern from client.ts.
 */

function buildProductQuery(params: {
  minPrice?: number;
  maxPrice?: number;
  minBpm?: number;
  maxBpm?: number;
  page?: number;
  pageSize?: number;
}): string {
  const queryParams = new URLSearchParams();

  if (params.minPrice) queryParams.set('minPrice', params.minPrice.toString());
  if (params.maxPrice) queryParams.set('maxPrice', params.maxPrice.toString());
  if (params.minBpm) queryParams.set('minBpm', params.minBpm.toString());
  if (params.maxBpm) queryParams.set('maxBpm', params.maxBpm.toString());
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());

  return queryParams.toString();
}

describe('BUG-HUNTING: API Client Query Parameters', () => {
  describe('Falsy zero values silently dropped from query', () => {
    /**
     * BUG: In client.ts getProducts(), the pattern `if (params.minPrice)`
     * uses truthiness check. The value 0 is falsy, so minPrice=0 is silently
     * dropped from the query string. This means a user cannot filter for
     * free products (price >= 0).
     *
     * FIX: Use `if (params.minPrice !== undefined)` or
     * `if (params.minPrice != null)` instead of truthiness checks.
     */
    it('buildProductQuery_WhenMinPriceIsZero_DropsParameter_BUG', () => {
      const query = buildProductQuery({ minPrice: 0 });
      // BUG: minPrice=0 is dropped because `if (0)` is false
      expect(query).toBe('');
      // FIX: Should be "minPrice=0"
    });

    it('buildProductQuery_WhenMaxPriceIsZero_DropsParameter_BUG', () => {
      const query = buildProductQuery({ maxPrice: 0 });
      // BUG: maxPrice=0 is dropped because `if (0)` is false
      expect(query).toBe('');
      // FIX: Should be "maxPrice=0"
    });

    it('buildProductQuery_WhenMinBpmIsZero_DropsParameter_BUG', () => {
      const query = buildProductQuery({ minBpm: 0 });
      // BUG: minBpm=0 is dropped
      expect(query).toBe('');
      // FIX: Should be "minBpm=0"
    });

    it('buildProductQuery_WhenPageIsZero_DropsParameter_BUG', () => {
      const query = buildProductQuery({ page: 0 });
      // BUG: page=0 is dropped
      expect(query).toBe('');
      // FIX: Should be "page=0" (or page should start at 1)
    });

    it('buildProductQuery_WhenPageSizeIsZero_DropsParameter_BUG', () => {
      const query = buildProductQuery({ pageSize: 0 });
      // BUG: pageSize=0 is dropped
      expect(query).toBe('');
      // FIX: pageSize=0 should either be sent or validated
    });

    it('buildProductQuery_WhenNonZeroValues_IncludesParameters', () => {
      const query = buildProductQuery({ minPrice: 10, maxPrice: 50 });
      expect(query).toContain('minPrice=10');
      expect(query).toContain('maxPrice=50');
    });
  });

  describe('HTTP error message coverage gaps', () => {
    /**
     * BUG: HTTP_ERROR_MESSAGES in client.ts doesn't cover status 405
     * (Method Not Allowed), 413 (Payload Too Large), etc.
     * The fallback message exposes the status code to users.
     *
     * FIX: Add more common HTTP status codes or use a generic message.
     */
    it('getHttpErrorMessage_WhenStatus405_ExposesStatusCode_BUG', () => {
      const HTTP_ERROR_MESSAGES: Record<number, string> = {
        400: 'Invalid request. Please check your input and try again.',
        401: 'Please sign in to continue.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested item was not found.',
        408: 'Request timed out. Please try again.',
        409: 'This action conflicts with existing data.',
        422: 'Unable to process your request. Please check your input.',
        429: 'Too many requests. Please wait a moment and try again.',
        500: 'Something went wrong on our end. Please try again later.',
        502: 'Service temporarily unavailable. Please try again later.',
        503: 'Service is currently unavailable. Please try again later.',
        504: 'Request timed out. Please try again later.',
      };

      function getHttpErrorMessage(status: number): string {
        return HTTP_ERROR_MESSAGES[status] || `An unexpected error occurred (code: ${status}).`;
      }

      // BUG: Status 405 exposes the code to user
      const message = getHttpErrorMessage(405);
      expect(message).toBe('An unexpected error occurred (code: 405).');
      // FIX: Should use generic "Something went wrong" without exposing status code
    });
  });
});

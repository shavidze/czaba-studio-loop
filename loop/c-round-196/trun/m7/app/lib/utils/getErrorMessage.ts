/**
 * Safely extract error message from unknown error type
 * Use in catch blocks: catch (error: unknown) { getErrorMessage(error) }
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

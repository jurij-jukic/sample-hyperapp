export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { message?: string; details?: unknown };
    if (typeof maybeError.details === 'string' && maybeError.details.length > 0) {
      return maybeError.details;
    }
    if (typeof maybeError.message === 'string' && maybeError.message.length > 0) {
      return maybeError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

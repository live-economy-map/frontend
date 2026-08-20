// src/utils/errorHandler.ts
import axios from 'axios';

interface ApiErrorEnvelope {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: unknown;
  error?: string;
  errors?: string[] | Record<string, string>;
}

/**
 * Extracts a user-friendly error message from an API error or unknown exception.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): string {
  if (!error) return fallbackMessage;

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorEnvelope | string | undefined;

    if (data) {
      if (typeof data === 'string') {
        return data;
      }
      if (data.message && typeof data.message === 'string') {
        return data.message;
      }
      if (data.error && typeof data.error === 'string') {
        return data.error;
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.join(', ');
      }
    }

    if (error.response?.status === 401) {
      return 'Session expired or unauthorized. Please log in again.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
      return 'Requested resource was not found.';
    }
    if (error.response?.status === 500) {
      return 'Server error. Please try again later.';
    }

    return error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
}

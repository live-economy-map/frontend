// tests/integration/apiContractParity.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import api, { formatApiError } from '@/lib/axios';
import { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

describe('API Contract Parity & Envelope Verification Suite', () => {
  const originalAdapter = api.defaults.adapter;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  describe('Standard Response Envelope Unwrapping', () => {
    it('unwraps data payload from standard backend success envelope', async () => {
      api.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: {
            statusCode: 200,
            success: true,
            message: 'Retrieved successfully',
            data: {
              id: 'cell_01',
              compositeScore: 84.5,
            },
            errors: [],
          },
        };
      };

      const response = await api.get('/me');
      expect(response.data).toEqual({
        id: 'cell_01',
        compositeScore: 84.5,
      });
    });

    it('handles delete or void operations where data is null by providing success state', async () => {
      api.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: {
            statusCode: 200,
            success: true,
            message: 'Saved area removed successfully',
            data: null,
            errors: [],
          },
        };
      };

      const response = await api.delete('/me/saved-areas/area_123');
      expect(response.data).toEqual({
        success: true,
        message: 'Saved area removed successfully',
      });
    });

    it('preserves binary Blob responses without attempting to unwrap', async () => {
      const mockBlob = new Blob(['sample,csv,data'], { type: 'text/csv' });
      api.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        return {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'text/csv' },
          config,
          data: mockBlob,
        };
      };

      const response = await api.get('/me/export?format=CSV', { responseType: 'blob' });
      expect(response.data).toBe(mockBlob);
      expect(response.data instanceof Blob).toBe(true);
    });
  });

  describe('Error Envelope Formatting & Toast Compatibility', () => {
    it('formats error array of strings from backend 400 validation error', () => {
      const mockResponse: AxiosResponse = {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          statusCode: 400,
          success: false,
          message: 'Validation failed',
          data: null,
          errors: ['Email is invalid', 'Password must be at least 8 characters'],
        },
      };

      const error = new AxiosError(
        'Request failed with status code 400',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        mockResponse
      );

      const formatted = formatApiError(error);
      expect(formatted).toBe('Email is invalid, Password must be at least 8 characters');
    });

    it('formats error array of objects from nested validation error', () => {
      const mockResponse: AxiosResponse = {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          statusCode: 400,
          success: false,
          message: 'Validation error',
          data: null,
          errors: [{ message: 'gridCellId is required' }],
        },
      };

      const error = new AxiosError(
        'Validation failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        mockResponse
      );

      const formatted = formatApiError(error);
      expect(formatted).toBe('gridCellId is required');
    });

    it('falls back to message when errors array is empty', () => {
      const mockResponse: AxiosResponse = {
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          statusCode: 404,
          success: false,
          message: 'Watchlist not found',
          data: null,
          errors: [],
        },
      };

      const error = new AxiosError(
        'Not found',
        'ERR_NOT_FOUND',
        undefined,
        undefined,
        mockResponse
      );

      const formatted = formatApiError(error);
      expect(formatted).toBe('Watchlist not found');
    });
  });

  describe('Global Headers & Tenant Context Injection', () => {
    it('automatically attaches Authorization Bearer and x-org-id headers', async () => {
      localStorage.setItem('auth_token', 'jwt_test_token_123');
      localStorage.setItem('active_org_id', 'org_uuid_456');

      let capturedHeaders: Record<string, unknown> = {};
      api.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        capturedHeaders = config.headers ? { ...config.headers } : {};
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: { statusCode: 200, success: true, message: 'OK', data: { ok: true } },
        };
      };

      await api.get('/watchlists');

      expect(capturedHeaders['Authorization']).toBe('Bearer jwt_test_token_123');
      expect(capturedHeaders['x-org-id']).toBe('org_uuid_456');
    });
  });
});

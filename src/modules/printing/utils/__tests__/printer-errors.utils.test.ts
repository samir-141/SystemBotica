import { describe, it, expect } from 'vitest';
import {
  classifyQzError,
  getErrorMessage,
  formatPrintError,
} from '../printer-errors.utils';

describe('printer-errors.utils', () => {
  describe('classifyQzError', () => {
    it('classifies connection refused error', () => {
      const error = new Error('ECONNREFUSED');
      const result = classifyQzError(error);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('QZ_NOT_RUNNING');
    });

    it('classifies WebSocket error', () => {
      const error = new Error('WebSocket connection failed');
      const result = classifyQzError(error);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('QZ_NOT_RUNNING');
    });

    it('classifies timeout error', () => {
      const error = new Error('Operation timed out');
      const result = classifyQzError(error);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('QZ_CONNECTION_TIMEOUT');
    });

    it('classifies certificate error', () => {
      const error = new Error('SSL certificate error');
      const result = classifyQzError(error);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('QZ_CERTIFICATE_ERROR');
    });

    it('returns QZ_NOT_RUNNING for unrecognized errors', () => {
      const error = new Error('Something went wrong');
      const result = classifyQzError(error);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('QZ_NOT_RUNNING');
    });

    it('handles non-Error objects', () => {
      const result = classifyQzError('string error');
      expect(result.available).toBe(false);
      expect(result.reason).toBe('QZ_NOT_RUNNING');
    });
  });

  describe('getErrorMessage', () => {
    it('returns user-friendly message for QZ_NOT_RUNNING', () => {
      const message = getErrorMessage('QZ_NOT_RUNNING');
      expect(message).toContain('QZ Tray');
    });

    it('returns user-friendly message for PRINTER_NOT_FOUND', () => {
      const message = getErrorMessage('PRINTER_NOT_FOUND');
      expect(message).toContain('impresora');
    });

    it('returns user-friendly message for PRINT_UNKNOWN_ERROR', () => {
      const message = getErrorMessage('PRINT_UNKNOWN_ERROR');
      expect(message).toBeDefined();
    });
  });

  describe('formatPrintError', () => {
    it('formats error with code and detail', () => {
      const result = formatPrintError('QZ_NOT_RUNNING', 'Connection refused');
      expect(result).toContain('QZ Tray');
      expect(result).toContain('Connection refused');
    });

    it('formats error without technical message', () => {
      const result = formatPrintError('PRINTER_NOT_FOUND');
      expect(result).toContain('impresora');
      expect(result).not.toContain('Detalle técnico');
    });
  });
});

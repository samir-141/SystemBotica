import { describe, it, expect } from 'vitest';
import {
  formatMoney,
  formatDate,
  padRight,
  padLeft,
  formatQuantity,
} from '../receipt-format.utils';

describe('receipt-format.utils', () => {
  describe('formatMoney', () => {
    it('formats number as money', () => {
      expect(formatMoney(10)).toBe('10.00');
    });

    it('formats decimal number', () => {
      expect(formatMoney(10.5)).toBe('10.50');
    });

    it('formats zero', () => {
      expect(formatMoney(0)).toBe('0.00');
    });

    it('formats large number', () => {
      expect(formatMoney(1234567.89)).toBe('1234567.89');
    });

    it('formats negative number', () => {
      expect(formatMoney(-10)).toBe('-10.00');
    });
  });

  describe('formatDate', () => {
    it('formats date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('handles invalid date', () => {
      const result = formatDate('invalid');
      expect(result).toBe('invalid');
    });
  });

  describe('padRight', () => {
    it('pads text to specified length', () => {
      expect(padRight('Hi', 5)).toBe('Hi   ');
    });

    it('returns original if already long enough', () => {
      expect(padRight('Hello', 3)).toBe('Hello');
    });

    it('handles empty string', () => {
      expect(padRight('', 5)).toBe('     ');
    });
  });

  describe('padLeft', () => {
    it('pads text to specified length', () => {
      expect(padLeft('Hi', 5)).toBe('   Hi');
    });

    it('returns original if already long enough', () => {
      expect(padLeft('Hello', 3)).toBe('Hello');
    });

    it('handles empty string', () => {
      expect(padLeft('', 5)).toBe('     ');
    });
  });

  describe('formatQuantity', () => {
    it('formats integer quantity', () => {
      expect(formatQuantity(1)).toBe('1');
    });

    it('formats decimal quantity', () => {
      expect(formatQuantity(1.5)).toBe('1.5');
    });

    it('formats zero', () => {
      expect(formatQuantity(0)).toBe('0');
    });

    it('formats large quantity', () => {
      expect(formatQuantity(1000)).toBe('1000');
    });
  });
});

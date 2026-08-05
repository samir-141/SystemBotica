import { describe, it, expect } from 'vitest';
import {
  centerText,
  alignLeftRight,
  wrapText,
  truncateText,
  repeatCharacter,
} from '../text-align.utils';

describe('text-align.utils', () => {
  describe('centerText', () => {
    it('centers text within character limit (left-pads only)', () => {
      expect(centerText('HI', 10)).toBe('    HI');
    });

    it('returns original text if already at or over limit', () => {
      expect(centerText('12345', 5)).toBe('12345');
    });

    it('does not truncate text longer than limit', () => {
      expect(centerText('HELLO WORLD', 5)).toBe('HELLO WORLD');
    });

    it('handles empty string', () => {
      expect(centerText('', 10)).toBe('     ');
    });

    it('handles odd character limit', () => {
      expect(centerText('AB', 7)).toBe('  AB');
    });
  });

  describe('alignLeftRight', () => {
    it('aligns left and right text with spacing', () => {
      const result = alignLeftRight('Total', 'S/ 10.00', 20);
      expect(result).toContain('Total');
      expect(result).toContain('S/ 10.00');
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('truncates left text if too long', () => {
      const result = alignLeftRight('VERY LONG TEXT', 'X', 10);
      expect(result).toContain('X');
    });

    it('handles long right text by truncating left', () => {
      const result = alignLeftRight('A', 'VERY LONG TEXT', 10);
      expect(result).toContain('VERY LONG TEXT');
    });

    it('handles both empty', () => {
      const result = alignLeftRight('', '', 10);
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('wrapText', () => {
    it('returns single line if within limit', () => {
      expect(wrapText('Hello', 10)).toEqual(['Hello']);
    });

    it('wraps long text', () => {
      const result = wrapText('Hello World This Is Long', 10);
      expect(result.length).toBeGreaterThan(1);
      result.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(10);
      });
    });

    it('handles empty string', () => {
      expect(wrapText('', 10)).toEqual(['']);
    });

    it('handles single character limit', () => {
      const result = wrapText('ABC', 1);
      expect(result).toEqual(['A', 'B', 'C']);
    });
  });

  describe('truncateText', () => {
    it('truncates text longer than limit with ellipsis', () => {
      expect(truncateText('Hello World', 5)).toBe('Hell…');
    });

    it('returns original text if within limit', () => {
      expect(truncateText('Hi', 10)).toBe('Hi');
    });

    it('handles empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('handles exact limit', () => {
      expect(truncateText('ABCDE', 5)).toBe('ABCDE');
    });
  });

  describe('repeatCharacter', () => {
    it('repeats character specified times', () => {
      expect(repeatCharacter('-', 5)).toBe('-----');
    });

    it('returns empty string for 0', () => {
      expect(repeatCharacter('-', 0)).toBe('');
    });

    it('handles single character', () => {
      expect(repeatCharacter('*', 1)).toBe('*');
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatMessageTime, formatFullTime, truncateText } from './formatters';

describe('formatters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatMessageTime', () => {
    it('should format today time as HH:mm', () => {
      const today = new Date('2024-03-15T10:30:00').getTime();
      expect(formatMessageTime(today)).toBe('10:30');
    });

    it('should format yesterday as "Yesterday"', () => {
      const yesterday = new Date('2024-03-14T10:30:00').getTime();
      expect(formatMessageTime(yesterday)).toBe('Yesterday');
    });

    it('should format this week as day name', () => {
      const thisWeek = new Date('2024-03-13T10:30:00').getTime();
      expect(formatMessageTime(thisWeek)).toBe('Wednesday');
    });

    it('should format this year as "MMM d"', () => {
      const thisYear = new Date('2024-02-10T10:30:00').getTime();
      expect(formatMessageTime(thisYear)).toBe('Feb 10');
    });

    it('should format previous year as "MMM d, yyyy"', () => {
      const lastYear = new Date('2023-02-10T10:30:00').getTime();
      expect(formatMessageTime(lastYear)).toBe('Feb 10, 2023');
    });
  });

  describe('formatFullTime', () => {
    it('should format timestamp to full date and time', () => {
      const timestamp = new Date('2024-03-15T10:30:00').getTime();
      expect(formatFullTime(timestamp)).toBe('Mar 15, 2024 10:30');
    });
  });

  describe('truncateText', () => {
    it('should return text as-is if shorter than maxLength', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should return text as-is if equal to maxLength', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });

    it('should truncate and add ellipsis if longer than maxLength', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello...');
    });

    it('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });
});

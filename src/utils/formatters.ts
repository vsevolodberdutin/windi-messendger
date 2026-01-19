import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, 'HH:mm');
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  if (isThisWeek(date)) {
    return format(date, 'EEEE');
  }

  if (isThisYear(date)) {
    return format(date, 'MMM d');
  }

  return format(date, 'MMM d, yyyy');
}

export function formatFullTime(timestamp: number): string {
  return format(new Date(timestamp), 'MMM d, yyyy HH:mm');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * DateTime Utilities
 * Functions for parsing, formatting, and generating time arrays
 */

/**
 * Parse a date string to a Date object
 */
export function strToDatetime(dateStr: string, format: string = '%Y-%m-%d'): Date {
  // Handle year-only format
  if (format === '%Y' || /^\d{4}$/.test(dateStr)) {
    return new Date(parseInt(dateStr), 0, 1);
  }

  // Handle ISO date format (YYYY-MM-DD)
  if (format === '%Y-%m-%d' || /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  // Default: try to parse as-is
  return new Date(dateStr);
}

/**
 * Format a Date object to a string
 */
export function datetimeToStr(date: Date, format: string = '%Y-%m-%d'): string {
  if (format === '%Y') {
    return date.getFullYear().toString();
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Generate an array of time strings between start and end dates
 * @param timeExtents - [startDate, endDate] as strings
 * @param timeDelta - 'day' or 'year'
 * @param timeFormat - date format string
 * @returns Array of date strings
 */
export function getTimeArray(
  timeExtents: [string, string],
  timeDelta: 'day' | 'year' = 'day',
  timeFormat: string = '%Y-%m-%d'
): string[] {
  const [startStr, endStr] = timeExtents;
  const start = strToDatetime(startStr, timeFormat);
  const end = strToDatetime(endStr, timeFormat);

  const result: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    result.push(datetimeToStr(current, timeFormat));

    if (timeDelta === 'year') {
      current.setFullYear(current.getFullYear() + 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
  }

  // Add one more for aggregation boundary
  if (timeDelta === 'year') {
    current.setFullYear(current.getFullYear() + 1);
  } else {
    current.setDate(current.getDate() + 1);
  }
  result.push(datetimeToStr(current, timeFormat));

  return result;
}

/**
 * Compare two dates
 */
export function compareDates(a: Date, b: Date): number {
  return a.getTime() - b.getTime();
}

/**
 * Check if a date is between two dates (inclusive)
 */
export function isBetween(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

/**
 * Check if a date string is between two date strings (inclusive)
 */
export function isBetweenStr(
  dateStr: string,
  startStr: string,
  endStr: string,
  format: string = '%Y-%m-%d'
): boolean {
  const date = strToDatetime(dateStr, format);
  const start = strToDatetime(startStr, format);
  const end = strToDatetime(endStr, format);
  return isBetween(date, start, end);
}

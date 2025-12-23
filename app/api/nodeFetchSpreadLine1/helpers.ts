/**
 * SpreadLine Helper Functions
 * Converted from Python: SpreadLine/utils/helpers.py
 *
 * Utility functions for time handling, data validation, and array operations.
 */

import { TopoRow, NodeColorRow, LineColorEntry } from './types';

// ============================================================================
// TIME HANDLING FUNCTIONS
// ============================================================================

/**
 * Parse a string to Date object based on format
 * Python equivalent: str_to_datetime
 */
export function strToDatetime(time: string, timeformat: string): Date {
  // Handle year-only format
  if (timeformat === '%Y') {
    return new Date(parseInt(time), 0, 1);
  }
  // Handle ISO format %Y-%m-%d
  if (timeformat === '%Y-%m-%d') {
    const [year, month, day] = time.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  // Default parsing
  return new Date(time);
}

/**
 * Format a Date object to string based on format
 * Python equivalent: datetime_to_str
 */
export function datetimeToStr(time: Date, timeformat: string): string {
  if (timeformat === '%Y') {
    return time.getFullYear().toString();
  }
  if (timeformat === '%Y-%m-%d') {
    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, '0');
    const day = String(time.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return time.toISOString().split('T')[0];
}

/**
 * Generate an array of timestamps between extents
 * Python equivalent: get_time_array
 */
export function getTimeArray(extents: [string, string], timeDelta: string, timeformat: string): string[] {
  if (timeDelta === 'year') {
    const result: string[] = [];
    for (let year = parseInt(extents[0]); year <= parseInt(extents[1]) + 1; year++) {
      result.push(String(year));
    }
    return result;
  }

  const start = strToDatetime(extents[0], timeformat);
  const end = strToDatetime(extents[1], timeformat);

  if (timeDelta === 'month') {
    const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
    const result: string[] = [];
    for (let idx = 0; idx <= months + 1; idx++) {
      const d = new Date(start);
      d.setMonth(d.getMonth() + idx);
      result.push(datetimeToStr(d, timeformat));
    }
    return result;
  }

  const delta = end.getTime() - start.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  if (timeDelta === 'hour') {
    const hours = Math.floor(delta / (60 * 60 * 1000));
    const result: string[] = [];
    for (let idx = 0; idx <= hours + 1; idx++) {
      const d = new Date(start.getTime() + idx * 60 * 60 * 1000);
      result.push(datetimeToStr(d, timeformat));
    }
    return result;
  }

  if (timeDelta === 'week') {
    const weeks = Math.floor(delta / (7 * dayMs));
    const result: string[] = [];
    for (let idx = 0; idx <= weeks + 1; idx++) {
      const d = new Date(start.getTime() + idx * 7 * dayMs);
      result.push(datetimeToStr(d, timeformat));
    }
    return result;
  }

  if (timeDelta === 'day') {
    const days = Math.floor(delta / dayMs);
    const result: string[] = [];
    for (let idx = 0; idx <= days + 1; idx++) {
      const d = new Date(start.getTime() + idx * dayMs);
      result.push(datetimeToStr(d, timeformat));
    }
    return result;
  }

  throw new Error(`The given delta "${timeDelta}" is not supported`);
}

// ============================================================================
// DATA VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate and rename DataFrame columns based on config
 * Python equivalent: _check_validity
 */
export function checkValidity<T extends Record<string, any>>(
  recipient: T[],
  config: Record<string, string>,
  rules: string[]
): T[] {
  // Check that all rules are present in config keys
  for (const rule of rules) {
    if (!(rule in config)) {
      throw new Error(`Unmatched keys in the config: missing "${rule}"`);
    }
  }

  // Check that all config values exist as columns
  if (recipient.length > 0) {
    const columns = Object.keys(recipient[0]);
    for (const val of Object.values(config)) {
      if (!columns.includes(val)) {
        throw new Error(`Unmatched values in the config: column "${val}" not found`);
      }
    }
  }

  // Create inverse config mapping
  const invConfig: Record<string, string> = {};
  for (const [key, val] of Object.entries(config)) {
    invConfig[val] = key;
  }

  // Rename columns and deduplicate
  const renamed = recipient.map(row => {
    const newRow: Record<string, any> = {};
    for (const [col, value] of Object.entries(row)) {
      const newCol = invConfig[col] || col;
      newRow[newCol] = value;
    }
    return newRow as T;
  });

  // Deduplicate based on JSON string comparison
  const seen = new Set<string>();
  const deduplicated: T[] = [];
  for (const row of renamed) {
    const key = JSON.stringify(row);
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(row);
    }
  }

  return deduplicated;
}

// ============================================================================
// ARRAY UTILITY FUNCTIONS
// ============================================================================

/**
 * Order array indices based on their value, excluding zero elements
 * Python equivalent: _sparse_argsort
 *
 * Returns the sorted entity ids/indices based on their ordering.
 */
export function sparseArgsort(arr: number[]): number[] {
  // Get non-zero indices
  const nonzeroIndices: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      nonzeroIndices.push(i);
    }
  }

  // Sort by the values at those indices
  nonzeroIndices.sort((a, b) => arr[a] - arr[b]);

  return nonzeroIndices;
}

/**
 * Create a 2D array filled with a value
 */
export function full2D<T>(rows: number, cols: number, value: T): T[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(value));
}

/**
 * Create a 1D array filled with a value
 */
export function full1D<T>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

/**
 * Get unique values from an array while preserving order
 */
export function uniquePreserveOrder<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of arr) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

/**
 * Find unique values and their first occurrence indices
 */
export function uniqueWithIndices<T>(arr: T[]): { values: T[], indices: number[] } {
  const values: T[] = [];
  const indices: number[] = [];
  const seen = new Map<string, number>();

  for (let i = 0; i < arr.length; i++) {
    const key = JSON.stringify(arr[i]);
    if (!seen.has(key)) {
      seen.set(key, values.length);
      values.push(arr[i]);
      indices.push(i);
    }
  }

  return { values, indices: indices.sort((a, b) => a - b) };
}

/**
 * Get unique column values from a 2D array
 */
export function uniqueColumns(matrix: number[][]): { indices: number[] } {
  if (matrix.length === 0) return { indices: [] };

  const numCols = matrix[0].length;
  const seen = new Map<string, number>();
  const indices: number[] = [];

  for (let col = 0; col < numCols; col++) {
    const column: number[] = [];
    for (let row = 0; row < matrix.length; row++) {
      column.push(matrix[row][col]);
    }
    const key = column.join(',');
    if (!seen.has(key)) {
      seen.set(key, col);
      indices.push(col);
    }
  }

  indices.sort((a, b) => a - b);
  return { indices };
}

/**
 * Get column from a 2D array
 */
export function getColumn<T>(matrix: T[][], colIndex: number): T[] {
  return matrix.map(row => row[colIndex]);
}

/**
 * Set column in a 2D array
 */
export function setColumn<T>(matrix: T[][], colIndex: number, values: T[]): void {
  for (let i = 0; i < matrix.length; i++) {
    matrix[i][colIndex] = values[i];
  }
}

/**
 * Get indices where array value matches
 */
export function whereEqual<T>(arr: T[], value: T): number[] {
  const indices: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === value) {
      indices.push(i);
    }
  }
  return indices;
}

/**
 * Get indices where condition is true
 */
export function whereTrue(arr: boolean[]): number[] {
  const indices: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      indices.push(i);
    }
  }
  return indices;
}

/**
 * Get non-zero indices from array
 */
export function nonzero(arr: number[]): number[] {
  const indices: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      indices.push(i);
    }
  }
  return indices;
}

/**
 * Array argsort - returns indices that would sort the array
 */
export function argsort(arr: number[]): number[] {
  const indices = arr.map((_, i) => i);
  indices.sort((a, b) => arr[a] - arr[b]);
  return indices;
}

/**
 * Check if a value is NaN (works for both NaN and special -1 markers)
 */
export function isNaN2(val: number): boolean {
  return Number.isNaN(val);
}

/**
 * Get min value ignoring NaN
 */
export function nanmin(arr: number[]): number {
  let min = Infinity;
  for (const val of arr) {
    if (!Number.isNaN(val) && val < min) {
      min = val;
    }
  }
  return min;
}

/**
 * Get max value ignoring NaN
 */
export function nanmax(arr: number[]): number {
  let max = -Infinity;
  for (const val of arr) {
    if (!Number.isNaN(val) && val > max) {
      max = val;
    }
  }
  return max;
}

/**
 * Check if element is in array
 */
export function isin<T>(elements: T[], testElements: T[]): boolean[] {
  const testSet = new Set(testElements);
  return elements.map(el => testSet.has(el));
}

/**
 * Count how many elements from first array are in second array
 */
export function isinCount<T>(elements: T[], testElements: T[]): number {
  const testSet = new Set(testElements);
  let count = 0;
  for (const el of elements) {
    if (testSet.has(el)) count++;
  }
  return count;
}

/**
 * Round to specified decimal places
 */
export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Concatenate arrays
 */
export function concat<T>(...arrays: T[][]): T[] {
  return ([] as T[]).concat(...arrays);
}

/**
 * Group consecutive equal elements
 */
export function groupByConsecutive<T>(arr: T[]): { value: T, start: number, end: number }[] {
  if (arr.length === 0) return [];

  const groups: { value: T, start: number, end: number }[] = [];
  let currentValue = arr[0];
  let start = 0;

  for (let i = 1; i <= arr.length; i++) {
    if (i === arr.length || arr[i] !== currentValue) {
      groups.push({ value: currentValue, start, end: i - 1 });
      if (i < arr.length) {
        currentValue = arr[i];
        start = i;
      }
    }
  }

  return groups;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Compare two values for equality (handles arrays and objects)
 */
export function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

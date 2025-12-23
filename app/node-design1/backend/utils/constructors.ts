/**
 * Network Construction Utilities
 * Functions for constructing egocentric networks and related data structures
 */

import { TopologyRow } from '../types/input';

const HOP_LIMIT = 2;

/**
 * Filter topology data to only include timestamps where the ego exists
 */
export function filterTimeByEgo(
  ego: string,
  data: TopologyRow[]
): TopologyRow[] {
  // Find all timestamps where ego appears
  const egoTimes = new Set<string>();

  for (const row of data) {
    const time = typeof row.time === 'string' ? row.time : row.time.toISOString();
    if (row.source === ego || row.target === ego) {
      egoTimes.add(time);
    }
  }

  // Filter data to only include those timestamps
  return data.filter(row => {
    const time = typeof row.time === 'string' ? row.time : row.time.toISOString();
    return egoTimes.has(time);
  });
}

/**
 * Construct 2-hop egocentric network around the ego
 * Returns only the edges within 2 hops of the ego
 */
export function constructEgocentricNetwork(
  ego: string,
  data: TopologyRow[]
): TopologyRow[] {
  const resultIndices = new Set<number>();

  // Group data by time
  const byTime = new Map<string, TopologyRow[]>();
  data.forEach((row, idx) => {
    const time = typeof row.time === 'string' ? row.time : row.time.toISOString();
    if (!byTime.has(time)) {
      byTime.set(time, []);
    }
    byTime.get(time)!.push({ ...row, _idx: idx } as TopologyRow & { _idx: number });
  });

  // For each timestamp, find 2-hop neighborhood
  for (const [_, entries] of byTime) {
    let waitlist = new Set<string>([ego]);
    let hop = 1;

    while (waitlist.size > 0 && hop <= HOP_LIMIT) {
      const nextWaitlist: string[] = [];

      for (const entity of waitlist) {
        // Find sources (entity is target)
        const sources = entries.filter(row => row.target === entity);
        for (const row of sources) {
          resultIndices.add((row as TopologyRow & { _idx: number })._idx);
          nextWaitlist.push(row.source);
        }

        // Find targets (entity is source)
        const targets = entries.filter(row => row.source === entity);
        for (const row of targets) {
          resultIndices.add((row as TopologyRow & { _idx: number })._idx);
          nextWaitlist.push(row.target);
        }
      }

      // Update waitlist: new entities minus already visited
      waitlist = new Set(nextWaitlist.filter(e => !waitlist.has(e)));
      hop += 1;
    }
  }

  // Return filtered data
  return data.filter((_, idx) => resultIndices.has(idx));
}

/**
 * Find within-session constraints based on hop structure
 * Returns constraints and order for a session
 */
export function findWithinConstraints(
  entries: TopologyRow[],
  ego: string,
  lineColor: Record<string, string>
): [(string[] | Record<number, string[]>)[], string[][]] {
  // Find all entities in this session
  const entities = new Set<string>();
  for (const row of entries) {
    entities.add(row.source);
    entities.add(row.target);
  }

  // Classify entities by hop level from ego
  const oneHopSources = new Set<string>(); // Entities that target ego
  const oneHopTargets = new Set<string>(); // Entities that ego targets
  const twoHopAbove: Set<string> = new Set();
  const twoHopBelow: Set<string> = new Set();

  for (const row of entries) {
    if (row.target === ego) {
      oneHopSources.add(row.source);
    } else if (row.source === ego) {
      oneHopTargets.add(row.target);
    }
  }

  // Find 2-hop neighbors
  for (const row of entries) {
    if (oneHopSources.has(row.target) && row.source !== ego && !oneHopSources.has(row.source) && !oneHopTargets.has(row.source)) {
      twoHopAbove.add(row.source);
    }
    if (oneHopTargets.has(row.source) && row.target !== ego && !oneHopSources.has(row.target) && !oneHopTargets.has(row.target)) {
      twoHopBelow.add(row.target);
    }
  }

  // Remove overlaps
  for (const e of oneHopSources) {
    twoHopAbove.delete(e);
    twoHopBelow.delete(e);
  }
  for (const e of oneHopTargets) {
    twoHopAbove.delete(e);
    twoHopBelow.delete(e);
  }

  // Create order: [2-hop-above, 1-hop-sources, ego, 1-hop-targets, 2-hop-below]
  const order: string[][] = [
    Array.from(twoHopAbove),
    Array.from(oneHopSources),
    [ego],
    Array.from(oneHopTargets),
    Array.from(twoHopBelow)
  ];

  // Create constraints
  const constraints: (string[] | Record<number, string[]>)[] = [
    order[0], // 2-hop above
    order[1].length > 0 ? { 1: order[1] } : {}, // 1-hop sources with weight
    order[2], // ego
    order[3].length > 0 ? { 1: order[3] } : {}, // 1-hop targets with weight
    order[4]  // 2-hop below
  ];

  return [constraints, order];
}

/**
 * Sparse argsort - returns indices that would sort the array, skipping zeros
 */
export function sparseArgsort(arr: number[]): number[] {
  const indexed = arr.map((val, idx) => ({ val, idx }));
  const nonZero = indexed.filter(item => item.val !== 0);
  nonZero.sort((a, b) => a.val - b.val);
  return nonZero.map(item => item.idx);
}

/**
 * Create a 2D array filled with a value
 */
export function create2DArray<T>(rows: number, cols: number, fill: T): T[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

/**
 * Get unique values from array preserving order
 */
export function uniquePreserveOrder<T>(arr: T[]): T[] {
  return Array.from(new Map(arr.map(item => [item, item])).values());
}

/**
 * Find indices where array equals value
 */
export function findIndices<T>(arr: T[], value: T): number[] {
  const indices: number[] = [];
  arr.forEach((v, i) => {
    if (v === value) indices.push(i);
  });
  return indices;
}

/**
 * Check if value is in array (like np.isin)
 */
export function isIn<T>(value: T, arr: T[]): boolean {
  return arr.includes(value);
}

/**
 * Count how many values from arr1 are in arr2
 */
export function countIntersection<T>(arr1: T[], arr2: T[]): number {
  return arr1.filter(v => arr2.includes(v)).length;
}

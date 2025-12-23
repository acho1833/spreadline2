/**
 * SpreadLine Network Constructors
 * Converted from Python: SpreadLine/utils/constructors.py
 *
 * Functions for constructing egocentric networks and finding constraints.
 */

import { TopoRow } from './types';
import { uniquePreserveOrder, concat } from './helpers';

// ============================================================================
// EGOCENTRIC NETWORK CONSTRUCTION
// ============================================================================

/**
 * Filter data to only include timestamps where ego appears
 * Python equivalent: filter_time_by_ego
 */
export function filterTimeByEgo(ego: string, data: TopoRow[]): TopoRow[] {
  // Get all unique timestamps
  const timestamps = new Set(data.map(row => JSON.stringify(row.time)));

  // Find timestamps where ego doesn't appear
  const timestampsToRemove = new Set<string>();

  // Group by time
  const groupedByTime = new Map<string, TopoRow[]>();
  for (const row of data) {
    const timeKey = JSON.stringify(row.time);
    if (!groupedByTime.has(timeKey)) {
      groupedByTime.set(timeKey, []);
    }
    groupedByTime.get(timeKey)!.push(row);
  }

  // Check each timestamp
  for (const [timeKey, group] of groupedByTime) {
    const nodes = new Set<string>();
    for (const row of group) {
      nodes.add(row.source);
      nodes.add(row.target);
    }
    if (!nodes.has(ego)) {
      timestampsToRemove.add(timeKey);
    }
  }

  // Filter out rows with removed timestamps
  return data.filter(row => !timestampsToRemove.has(JSON.stringify(row.time)));
}

/**
 * Construct an egocentric network (2-hop neighborhood)
 * Python equivalent: construct_egocentric_network
 */
export function constructEgocentricNetwork(ego: string, data: TopoRow[]): TopoRow[] {
  const HOP_LIMIT = 2;

  // Reset index equivalent - just create a clean copy with indices
  const dataWithIndex = data.map((row, idx) => ({ ...row, _idx: idx }));

  // Get all entities
  const entities = new Set<string>();
  for (const row of dataWithIndex) {
    entities.add(row.source);
    entities.add(row.target);
  }

  if (!entities.has(ego)) {
    throw new Error('Ego is not found in the data with the given time range.');
  }

  // Collect indices of edges to include
  const indicesToInclude = new Set<number>();

  // Group by time
  const groupedByTime = new Map<string, typeof dataWithIndex>();
  for (const row of dataWithIndex) {
    const timeKey = JSON.stringify(row.time);
    if (!groupedByTime.has(timeKey)) {
      groupedByTime.set(timeKey, []);
    }
    groupedByTime.get(timeKey)!.push(row);
  }

  // BFS for each time period
  for (const [_, entries] of groupedByTime) {
    let waitlist = new Set<string>([ego]);
    let hop = 1;

    while (waitlist.size > 0 && hop <= HOP_LIMIT) {
      const nextWaitlist: string[] = [];

      for (const each of waitlist) {
        // Find rows where this entity is the target (sources pointing to it)
        const sources = entries.filter(row => row.target === each);
        // Find rows where this entity is the source (targets it points to)
        const targets = entries.filter(row => row.source === each);

        // Collect candidates and indices
        const candidates: string[] = [];
        for (const row of sources) {
          candidates.push(row.source);
          indicesToInclude.add(row._idx);
        }
        for (const row of targets) {
          candidates.push(row.target);
          indicesToInclude.add(row._idx);
        }

        // Add unique candidates to next waitlist
        for (const candidate of new Set(candidates)) {
          nextWaitlist.push(candidate);
        }
      }

      // Update waitlist: new candidates minus current waitlist
      const nextSet = new Set(nextWaitlist);
      for (const item of waitlist) {
        nextSet.delete(item);
      }
      waitlist = nextSet;
      hop++;
    }
  }

  // Return filtered data
  return data.filter((_, idx) => indicesToInclude.has(idx));
}

// ============================================================================
// CONSTRAINT FINDING
// ============================================================================

type ConstraintTuple = [string, string, number];

/**
 * Get entities from grouped entries
 */
function getEntities(groupedEntities: [string, number][]): string[] {
  return groupedEntities.map(each => each[0]);
}

/**
 * Order entities within a group based on weight and color
 * Python equivalent: _order_within
 */
function orderWithin(
  constraints: ConstraintTuple[],
  entityColor: Record<string, string>,
  ascending: boolean = true
): [Record<number, string[]>, string[]] {
  const result: Record<number, string[]> = {};
  let sortedEntities: string[] = [];

  // Sort by weight (ascending or descending)
  const sorted = [...constraints].sort((a, b) => {
    return ascending ? a[2] - b[2] : b[2] - a[2];
  });

  // Extract entities: source if ascending, target if descending
  const entities: [string, number][] = sorted.map(each => {
    return ascending ? [each[0], each[2]] : [each[1], each[2]];
  });

  if (entities.length === 0) {
    return [result, sortedEntities];
  }

  // Group by weight
  let currentWeight = entities[0][1];
  let currentGroup: string[] = [];
  let counter = 0;

  for (let i = 0; i < entities.length; i++) {
    const [entity, weight] = entities[i];
    if (weight !== currentWeight) {
      // Finalize current group
      // Sort by color, then by name for deterministic ordering
      currentGroup.sort((a, b) => {
        const colorA = entityColor[a] || '';
        const colorB = entityColor[b] || '';
        if (colorA !== colorB) return colorA.localeCompare(colorB);
        return a.localeCompare(b);  // Secondary sort by name
      });
      if (counter % 2 === 1) {
        currentGroup.reverse();
      }
      result[currentWeight] = currentGroup;
      sortedEntities = sortedEntities.concat(currentGroup);
      counter++;

      // Start new group
      currentWeight = weight;
      currentGroup = [entity];
    } else {
      currentGroup.push(entity);
    }
  }

  // Don't forget the last group
  if (currentGroup.length > 0) {
    // Sort by color, then by name for deterministic ordering
    currentGroup.sort((a, b) => {
      const colorA = entityColor[a] || '';
      const colorB = entityColor[b] || '';
      if (colorA !== colorB) return colorA.localeCompare(colorB);
      return a.localeCompare(b);  // Secondary sort by name
    });
    if (counter % 2 === 1) {
      currentGroup.reverse();
    }
    result[currentWeight] = currentGroup;
    sortedEntities = sortedEntities.concat(currentGroup);
  }

  return [result, sortedEntities];
}

/**
 * Find within-session constraints based on edge weights
 * Python equivalent: find_within_constraints
 *
 * Returns: [constraints, order]
 * - constraints: [[2-hop-tops], sourceGroup, [ego], targetGroup, [2-hop-bottoms]]
 * - order (hops): [[2-hop-tops], sources, [ego], targets, [2-hop-bottoms]]
 */
export function findWithinConstraints(
  entries: TopoRow[],
  ego: string,
  entityColor: Record<string, string>
): [any[], string[][]] {
  // Extract raw tuples
  const raws: ConstraintTuple[] = entries.map(row => [row.source, row.target, row.weight]);

  const constraints = new Set<string>();

  for (const [source, target, weight] of raws) {
    // Check for bidirectional edges
    let hasBidirection = false;
    let bidirectionWeight = 0;
    let bidirectionKey = '';

    for (const key of constraints) {
      const existing = JSON.parse(key) as ConstraintTuple;
      if (existing[0] === target && existing[1] === source) {
        hasBidirection = true;
        bidirectionWeight = existing[2];
        bidirectionKey = key;
        break;
      }
    }

    if (hasBidirection) {
      if (bidirectionWeight > weight) {
        // Keep existing, don't add new
        continue;
      }
      if (bidirectionWeight === weight) {
        // Remove both - equal weight bidirectional edges have no constraint
        constraints.delete(bidirectionKey);
        continue;
      }
      // New weight is higher, remove old and add new
      constraints.delete(bidirectionKey);
    }
    constraints.add(JSON.stringify([source, target, weight]));
  }

  // Parse back to arrays
  const constraintArray: ConstraintTuple[] = Array.from(constraints).map(s => JSON.parse(s));

  // Separate into source (pointing to ego) and target (ego points to) constraints
  const sourceConstraints = constraintArray.filter(x => x[1] === ego);
  const targetConstraints = constraintArray.filter(x => x[0] === ego);

  const [sourceGroup, sources] = orderWithin(sourceConstraints, entityColor, true);
  const [targetGroup, targets] = orderWithin(targetConstraints, entityColor, false);

  const oneHops = [...sources, ...targets];

  // Process remaining constraints (2-hop)
  const remainedConstraints = constraintArray.filter(
    x => !sourceConstraints.some(s => s[0] === x[0] && s[1] === x[1]) &&
         !targetConstraints.some(t => t[0] === x[0] && t[1] === x[1])
  );

  // Sort by weight descending
  remainedConstraints.sort((a, b) => b[2] - a[2]);

  const twoHopTops: string[] = [];
  const twoHopBottoms: string[] = [];
  const twoHops: string[] = [];

  for (const [source, target, weight] of remainedConstraints) {
    if (oneHops.includes(source) && oneHops.includes(target)) continue;

    if (oneHops.includes(target) && !oneHops.includes(source)) {
      // source is ego's two-hop neighbor
      if (sources.includes(target)) {
        // source -> target -> ego
        if (!twoHops.includes(source)) twoHopTops.push(source);
      } else if (targets.includes(target)) {
        // ego -> target; source -> target
        if (!twoHops.includes(source)) twoHopBottoms.push(source);
      }
    } else if (oneHops.includes(source) && !oneHops.includes(target)) {
      // target is two-hop
      if (sources.includes(source)) {
        // source -> ego; source -> target
        if (!twoHops.includes(target)) twoHopTops.push(target);
      } else if (targets.includes(source)) {
        // ego -> source -> target
        if (!twoHops.includes(target)) twoHopBottoms.push(target);
      }
    }
    // Update twoHops for next iteration
    twoHops.length = 0;
    twoHops.push(...twoHopTops, ...twoHopBottoms);
  }

  const order: string[][] = [twoHopTops, sources, [ego], targets, twoHopBottoms];
  const resultConstraints: any[] = [
    twoHopTops,
    sourceGroup,
    [ego],
    targetGroup,
    twoHopBottoms
  ];

  return [resultConstraints, order];
}

// ============================================================================
// VIEWS.PY HELPER FUNCTIONS
// ============================================================================

/**
 * Construct 2-hop ego networks from data
 * Python equivalent: _construct_ego_networks (from views.py)
 */
export function constructEgoNetworks(
  data: any[],
  ego: string,
  HOP_LIMIT: number = 2,
  timeCol: string = 'year',
  sourceCol: string = 'source',
  targetCol: string = 'target'
): any[] {
  const indicesToInclude = new Set<number>();

  // Group by time
  const groupedByTime = new Map<string, { row: any, idx: number }[]>();
  data.forEach((row, idx) => {
    const timeKey = String(row[timeCol]);
    if (!groupedByTime.has(timeKey)) {
      groupedByTime.set(timeKey, []);
    }
    groupedByTime.get(timeKey)!.push({ row, idx });
  });

  for (const [_, entries] of groupedByTime) {
    let waitlist = new Set<string>([ego]);
    let hop = 1;

    while (waitlist.size > 0 && hop <= HOP_LIMIT) {
      const nextWaitlist: string[] = [];

      for (const each of waitlist) {
        // Find edges where target equals current entity
        const sources = entries.filter(e => e.row[targetCol] === each);
        // Find edges where source equals current entity
        const targets = entries.filter(e => e.row[sourceCol] === each);

        const candidates: string[] = [];
        for (const e of sources) {
          candidates.push(e.row[sourceCol]);
          indicesToInclude.add(e.idx);
        }
        for (const e of targets) {
          candidates.push(e.row[targetCol]);
          indicesToInclude.add(e.idx);
        }

        for (const c of new Set(candidates)) {
          nextWaitlist.push(c);
        }
      }

      const nextSet = new Set(nextWaitlist);
      for (const item of waitlist) {
        nextSet.delete(item);
      }
      waitlist = nextSet;
      hop++;
    }
  }

  return data.filter((_, idx) => indicesToInclude.has(idx));
}

/**
 * Remap Jeffrey Heer's affiliations to canonical names
 * Python equivalent: _remap_JH_affiliation
 */
export function remapJHAffiliation(affiliation: string | undefined | null): string {
  if (typeof affiliation !== 'string') return "University of Washington, USA";
  if (affiliation.includes("Berkeley")) {
    return "University of California, Berkeley, USA";
  }
  if (affiliation.includes("PARC") || affiliation.includes("Palo Alto") || affiliation.includes("Xerox")) {
    return "Palo Alto Research Center, USA";
  }
  if (affiliation.includes("Stanford")) {
    return "Stanford University, USA";
  }
  if (affiliation.includes("Washington")) {
    return "University of Washington, USA";
  }
  return affiliation;
}

/**
 * Remap Tamara Munzner's affiliations to canonical names
 * Python equivalent: _remap_TM_affiliation
 */
export function remapTMAffiliation(affiliation: string | undefined | null): string {
  if (typeof affiliation !== 'string') return 'University of British Columbia, Canada';
  if (affiliation.includes('British')) {
    return 'University of British Columbia, Canada';
  }
  if (affiliation.includes('Stanford') || affiliation.includes('STANFORD')) {
    return 'Stanford University, USA';
  }
  if (affiliation.includes('Geometry Center')) {
    return 'Geometry Center, University of Minnesota, USA';
  }
  return affiliation;
}

/**
 * SpreadLine Alignment Algorithm
 * Converted from Python: SpreadLine/align.py
 *
 * Aligns entities across timestamps to maximize straight lines
 * using longest common substring matching.
 */

import { Session, Entity, NumberMatrix, Tables, Locations } from './types';
import { full2D, isinCount } from './helpers';

const ALPHA = 0.1;

interface Liner {
  span: [number, number];
  egoIdx: number;
  entities: Entity[];
  entities_names: string[];
  locations: Locations;
  _tables: Tables;
  getSessionByID: (id: number) => Session | null;
}

/**
 * Get entities in the same session as the given entity
 * Python equivalent: _get_entities_in_session
 */
function getEntitiesInSession(
  rIdx: number,
  cIdx: number,
  liner: Liner,
  orderedIdleEntities: number[]
): number[] {
  const entity = liner.entities[rIdx];
  const sessionID = entity.getAtTimestamp(cIdx);
  const idleLoc = liner.locations.idle;
  const sessionTable = liner._tables.session;

  if (idleLoc.has(sessionID)) {
    return orderedIdleEntities;
  }

  const session = liner.getSessionByID(sessionID);
  if (session) {
    return session.getEntityIDs();
  }

  return [];
}

/**
 * Compute rewards for aligning entities between consecutive timestamps
 * Python equivalent: _compute_rewards
 *
 * The reward considers:
 * 1. Maximum number of straight lines possible
 * 2. Similarity of relative orders
 * 3. Ego must maintain straight line (infinite reward)
 */
function computeRewards(
  liner: Liner,
  orderedEntities: number[][],
  orderedIdleEntities: number[][]
): number[][][] {
  const [_, numTimestamps] = liner.span;
  const rewards: number[][][] = [];
  const ego = liner.egoIdx;

  for (let cIdx = 0; cIdx < numTimestamps - 1; cIdx++) {
    const currentReward: number[][] = [];
    const currentEntities = orderedEntities[cIdx];
    const nextEntities = orderedEntities[cIdx + 1];

    for (let currOrder = 0; currOrder < currentEntities.length; currOrder++) {
      const currEnt = currentEntities[currOrder];
      const currEntReward: number[] = [];

      for (let nextOrder = 0; nextOrder < nextEntities.length; nextOrder++) {
        const nextEnt = nextEntities[nextOrder];
        let reward = 0;

        const currSessionEntIds = getEntitiesInSession(currEnt, cIdx, liner, orderedIdleEntities[cIdx]);
        const nextSessionEntIds = getEntitiesInSession(nextEnt, cIdx + 1, liner, orderedIdleEntities[cIdx + 1]);

        // straight(l_i, r_j): maximum number of straight lines possible
        const numStraightLines = isinCount(currSessionEntIds, nextSessionEntIds);
        reward += numStraightLines;

        // Similarity of relative order
        const compatibility = ALPHA * (1 - Math.abs(
          ((currOrder + 1) / currSessionEntIds.length) -
          ((nextOrder + 1) / nextSessionEntIds.length)
        ));
        reward += compatibility;

        // Ego must align to ego - infinite reward to ensure straight line
        if (currEnt === ego && nextEnt === ego) {
          reward = Infinity;
        }

        currEntReward.push(reward);
      }
      currentReward.push(currEntReward);
    }
    rewards.push(currentReward);
  }

  return rewards;
}

/**
 * Find longest common substring using dynamic programming
 * Python equivalent: longest_common_substring
 *
 * Finds the alignment that maximizes the sum of matched pair rewards.
 */
function longestCommonSubstring(
  currLength: number,
  nextLength: number,
  reward: number[][]
): Record<number, number> {
  // Initialize match table
  const matchTable: number[][] = [];
  for (let i = 0; i < currLength; i++) {
    matchTable.push(new Array(nextLength).fill(0));
  }

  // Initialize direction table
  const direction: number[][] = [];
  for (let i = 0; i < currLength; i++) {
    direction.push(new Array(nextLength).fill(0));
  }

  // Memoization
  for (let i = 0; i < currLength; i++) {
    for (let j = 0; j < nextLength; j++) {
      const diagonal = (i > 0 && j > 0) ? matchTable[i - 1][j - 1] : 0;
      const left = (j > 0) ? matchTable[i][j - 1] : 0;
      const up = (i > 0) ? matchTable[i - 1][j] : 0;

      const candidates = [
        diagonal + reward[i][j],  // i and j should be aligned
        left,                      // i should not align with j, try j-1
        up                         // j should not align with i, try i-1
      ];

      const maxValue = Math.max(...candidates);
      const maxIdx = candidates.indexOf(maxValue);

      matchTable[i][j] = maxValue;
      direction[i][j] = maxIdx;
    }
  }

  // Backtrack to find alignment
  const alignTable: Record<number, number> = {};
  let currPtr = currLength - 1;
  let nextPtr = nextLength - 1;

  while (currPtr >= 0 && nextPtr >= 0) {
    if (direction[currPtr][nextPtr] === 0) {
      // Aligned
      alignTable[currPtr] = nextPtr;
      currPtr--;
      nextPtr--;
    } else if (direction[currPtr][nextPtr] === 1) {
      // This entity in nextTime is not aligning with anyone
      nextPtr--;
    } else if (direction[currPtr][nextPtr] === 2) {
      // This entity in currentTime is not aligning with anyone
      currPtr--;
    } else {
      break;
    }
  }

  return alignTable;
}

/**
 * Align sessions based on entity alignment table
 * Python equivalent: _align_sessions
 */
function alignSessions(
  liner: Liner,
  alignTable: NumberMatrix,
  orderedEntities: number[][]
): Record<number, number>[] {
  const sessionTable = liner._tables.session;
  const ego = liner.egoIdx;
  const [_, numTimestamps] = liner.span;
  const sessionAlignTable: Record<number, number>[] = [];

  for (let cIdx = 0; cIdx < numTimestamps - 1; cIdx++) {
    const aligned: Record<number, number> = {};
    const orderedEnts = orderedEntities[cIdx];

    // Ego must be aligned to itself
    if (orderedEnts.includes(ego)) {
      const sessionID = sessionTable[ego][cIdx];
      const alignedSessionID = sessionTable[ego][cIdx + 1];
      aligned[sessionID] = alignedSessionID;
    }

    for (const cha of orderedEnts) {
      if (cha === ego) continue;

      const sessionID = sessionTable[cha][cIdx];
      const alignedEntity = alignTable[cha][cIdx];
      let alignedSessionID = -1;

      if (alignedEntity !== -1) {
        alignedSessionID = sessionTable[alignedEntity][cIdx + 1];
        if (alignedSessionID === 0) alignedSessionID = -1;
      }

      // If this session has not been aligned yet
      if (aligned[sessionID] === undefined || aligned[sessionID] === -1) {
        // Check if the to-be-aligned session is already taken
        if (Object.values(aligned).includes(alignedSessionID)) {
          aligned[sessionID] = alignedSessionID;
        } else {
          aligned[sessionID] = alignedSessionID;
        }
      }
    }
    sessionAlignTable.push(aligned);
  }

  return sessionAlignTable;
}

/**
 * Main alignment function
 * Python equivalent: aligning
 *
 * Minimizes wiggle lines in the layout by aligning entities
 * across consecutive timestamps.
 */
export function aligning(
  liner: Liner,
  orderedEntities: number[][],
  orderedIdleEntities: number[][]
): [NumberMatrix, Record<number, number>[]] {
  const [numEntities, numTimestamps] = liner.span;

  // Compute rewards for alignment
  const rewards = computeRewards(liner, orderedEntities, orderedIdleEntities);

  // Initialize align table with -1 (no alignment)
  const alignTable = full2D(numEntities, numTimestamps, -1);

  // Find alignment for each consecutive timestamp pair
  for (let cIdx = 0; cIdx < numTimestamps - 1; cIdx++) {
    const alignment = longestCommonSubstring(
      orderedEntities[cIdx].length,
      orderedEntities[cIdx + 1].length,
      rewards[cIdx]
    );

    for (const [currEnt, nextEnt] of Object.entries(alignment)) {
      const currIdx = parseInt(currEnt);
      const nextIdx = nextEnt as number;
      const entityIdx = orderedEntities[cIdx][currIdx];
      const alignedEntityIdx = orderedEntities[cIdx + 1][nextIdx];
      alignTable[entityIdx][cIdx] = alignedEntityIdx;
    }
  }

  // Align sessions based on entity alignment
  const sessionAlignTable = alignSessions(liner, alignTable, orderedEntities);

  return [alignTable, sessionAlignTable];
}

/**
 * Alignment Algorithm
 * Longest Common Substring with rewards for straight line maximization
 */

import { Session, Entity } from '../types/core';

const ALPHA = 0.1;

interface SpreadLiner {
  span: [number, number];
  egoIdx: number;
  entities: Entity[];
  entities_names: string[];
  sessions: Session[];
  locations: { contact: number[]; idle: Set<number> };
  _tables: {
    session: number[][];
    presence: number[][];
  };
  _counts: { numTimestamps: number; numEntities: number };
  getSessionByID(id: number): Session | null;
}

/**
 * Main aligning function
 * Maximizes straight lines using LCS with rewards
 */
export function aligning(
  liner: SpreadLiner,
  orderedEntities: number[][],
  orderedIdleEntities: number[][]
): {
  alignTable: number[][];
  sessionAlignTable: Record<number, number>[];
} {
  const [numEntities, numTimestamps] = liner.span;
  const rewards = computeRewards(liner, orderedEntities, orderedIdleEntities);

  // Initialize align table
  const alignTable: number[][] = Array.from({ length: numEntities }, () =>
    Array(numTimestamps).fill(-1)
  );

  // Compute alignments
  for (let cIdx = 0; cIdx < numTimestamps - 1; cIdx++) {
    const alignment = longestCommonSubstring(
      orderedEntities[cIdx].length,
      orderedEntities[cIdx + 1].length,
      rewards[cIdx]
    );

    for (const [currEnt, nextEnt] of Object.entries(alignment)) {
      const currIdx = parseInt(currEnt);
      alignTable[orderedEntities[cIdx][currIdx]][cIdx] = orderedEntities[cIdx + 1][nextEnt];
    }
  }

  const sessionAlignTable = alignSessions(liner, alignTable, orderedEntities);

  return { alignTable, sessionAlignTable };
}

/**
 * Align sessions based on entity alignments
 */
function alignSessions(
  liner: SpreadLiner,
  alignTable: number[][],
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

      if (
        aligned[sessionID] === undefined &&
        !Object.values(aligned).includes(alignedSessionID)
      ) {
        aligned[sessionID] = alignedSessionID;
      }
    }

    sessionAlignTable.push(aligned);
  }

  return sessionAlignTable;
}

/**
 * Compute rewards for alignment
 */
function computeRewards(
  liner: SpreadLiner,
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

        const currSessionEntIds = getEntitiesInSession(
          currEnt,
          cIdx,
          liner,
          orderedIdleEntities[cIdx]
        );
        const nextSessionEntIds = getEntitiesInSession(
          nextEnt,
          cIdx + 1,
          liner,
          orderedIdleEntities[cIdx + 1]
        );

        // Count straight lines
        const numStraightLines = currSessionEntIds.filter(id =>
          nextSessionEntIds.includes(id)
        ).length;
        reward += numStraightLines;

        // Compatibility based on relative order
        const compatibility =
          ALPHA *
          (1 -
            Math.abs(
              (currOrder + 1) / currSessionEntIds.length -
                (nextOrder + 1) / nextSessionEntIds.length
            ));
        reward += compatibility;

        // Ego always stays straight
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
 * Get entities in the same session as the given entity
 */
function getEntitiesInSession(
  rIdx: number,
  cIdx: number,
  liner: SpreadLiner,
  orderedIdleEntities: number[]
): number[] {
  const sessionID = liner.entities[rIdx].getAtTimestamp(cIdx);
  const idleLoc = liner.locations.idle;
  const session = liner.getSessionByID(sessionID);

  if (idleLoc.has(sessionID)) {
    return orderedIdleEntities;
  }

  return session?.getEntityIDs() ?? [];
}

/**
 * Longest Common Substring with rewards using dynamic programming
 */
function longestCommonSubstring(
  currLength: number,
  nextLength: number,
  reward: number[][]
): Record<number, number> {
  // Initialize DP table
  const matchTable: Record<number, Record<number, number>> = {};
  for (let i = 0; i < currLength; i++) {
    matchTable[i] = {};
    for (let j = 0; j < nextLength; j++) {
      matchTable[i][j] = 0;
    }
  }

  // Direction tracking
  const direction: Record<number, Record<number, number>> = {};
  for (let i = 0; i < currLength; i++) {
    direction[i] = {};
    for (let j = 0; j < nextLength; j++) {
      const candidates = [
        (matchTable[i - 1]?.[j - 1] ?? 0) + reward[i][j], // Align i and j
        matchTable[i]?.[j - 1] ?? 0, // Skip next
        matchTable[i - 1]?.[j] ?? 0, // Skip current
      ];
      const maxValue = Math.max(...candidates);
      const maxIdx = candidates.indexOf(maxValue);
      matchTable[i][j] = maxValue;
      direction[i][j] = maxIdx;
    }
  }

  // Backtrack
  const alignTable: Record<number, number> = {};
  let currPtr = currLength - 1;
  let nextPtr = nextLength - 1;

  while (currPtr >= 0 && nextPtr >= 0) {
    if (direction[currPtr][nextPtr] === 0) {
      alignTable[currPtr] = nextPtr;
      currPtr -= 1;
      nextPtr -= 1;
    } else if (direction[currPtr][nextPtr] === 1) {
      nextPtr -= 1;
    } else if (direction[currPtr][nextPtr] === 2) {
      currPtr -= 1;
    } else {
      break;
    }
  }

  return alignTable;
}

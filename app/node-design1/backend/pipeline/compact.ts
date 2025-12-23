/**
 * Compacting Algorithm
 * Minimizes whitespace or wiggles in the layout
 */

import { Session, Entity } from '../types/core';

const DISTANCE_LINE = 5;
const DISTANCE_HOP = 10;
const DISTANCE_SESSION = 5;
let SQUEEZE_LINE = 5;

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
  _config: { squeezeSameCategory: boolean; minimize: string };
  _line_color: Record<string, string>;
  getSessionByID(id: number): Session | null;
}

/**
 * Main compacting function
 */
export function compacting(
  liner: SpreadLiner,
  orderedEntities: number[][],
  orderedSessions: number[][],
  sessionAlignTable: Record<number, number>[]
): {
  heightTable: number[][];
  sideTable: number[][];
} {
  const focus = liner._config.minimize;
  const { slots, slotsInEntities, egoSlotIdx } = constructSlots(
    liner,
    orderedEntities,
    orderedSessions,
    sessionAlignTable
  );

  let heightTable: number[][];
  if (focus === 'space') {
    heightTable = computeSessionHeightSpace(liner, slots, slotsInEntities, egoSlotIdx);
  } else {
    heightTable = computeSessionHeightLine(liner, slots, slotsInEntities, egoSlotIdx);
  }

  const sideTable = buildSideTable(liner, heightTable);

  // Normalize heights
  const allHeights = heightTable.flat().filter(h => !isNaN(h));
  const minOffset = Math.abs(Math.min(...allHeights));

  for (let i = 0; i < heightTable.length; i++) {
    for (let j = 0; j < heightTable[i].length; j++) {
      if (!isNaN(heightTable[i][j])) {
        heightTable[i][j] += minOffset;
      } else {
        heightTable[i][j] = -1;
      }
    }
  }

  return { heightTable, sideTable };
}

/**
 * Build side table for crossing detection
 */
function buildSideTable(liner: SpreadLiner, heightTable: number[][]): number[][] {
  const [numEntities, numTimestamps] = liner.span;
  const sideTable: number[][] = Array.from({ length: numEntities }, () => [0]);

  for (let rIdx = 0; rIdx < numEntities; rIdx++) {
    const mask = heightTable[rIdx].map(h => !isNaN(h));
    const validHeights = heightTable[rIdx].filter((_, i) => mask[i]);
    const signs = new Set(validHeights.map(h => Math.sign(h)));
    if (signs.size === 2) {
      sideTable[rIdx] = [1];
    }
  }

  return sideTable;
}

/**
 * Construct slots for sessions
 */
function constructSlots(
  liner: SpreadLiner,
  orderedEntities: number[][],
  orderedSessions: number[][],
  sessionAlignTable: Record<number, number>[]
): {
  slots: number[][];
  slotsInEntities: (number[] | null)[][];
  egoSlotIdx: number;
} {
  const sessionTable = liner._tables.session;
  const [numEntities, numTimestamps] = liner.span;
  const ego = liner.egoIdx;
  const egoSessions = sessionTable[ego];

  // Initialization
  const slots: number[][] = [orderedSessions[0].slice()];
  let egoSlotIdx = orderedSessions[0].indexOf(egoSessions[0]);

  for (let cIdx = 1; cIdx < numTimestamps; cIdx++) {
    const dealt = new Set<number>();
    const egoSessionID = egoSessions[cIdx];

    // Ensure ego session goes into same slot
    slots[egoSlotIdx].push(egoSessionID);
    dealt.add(egoSessionID);

    const sessions = orderedSessions[cIdx];
    const alignment = sessionAlignTable[cIdx - 1];
    const egoSessionOrder = sessions.indexOf(egoSessionID);

    // Check existing slots for aligned sessions
    for (let rIdx = 0; rIdx < slots.length; rIdx++) {
      if (rIdx === egoSlotIdx) continue;
      const prevSessionID = slots[rIdx][cIdx - 1];
      let insertSessionID = alignment[prevSessionID] ?? -1;
      if (insertSessionID === egoSessionID) insertSessionID = -1;
      slots[rIdx].push(insertSessionID);
      if (insertSessionID !== -1) dealt.add(insertSessionID);
    }

    // Handle unassigned sessions
    const unassigned = new Set(sessions.filter(s => !dealt.has(s)));
    const aboveSessions = sessions.slice(0, egoSessionOrder).filter(s => unassigned.has(s)).reverse();
    const belowSessions = sessions.slice(egoSessionOrder + 1).filter(s => unassigned.has(s));

    // Place above sessions
    for (const session of aboveSessions) {
      for (let slotIdx = egoSlotIdx - 1; slotIdx >= 0; slotIdx--) {
        if (slots[slotIdx][cIdx] !== -1 || !unassigned.has(session)) continue;
        slots[slotIdx][cIdx] = session;
        unassigned.delete(session);
      }
    }

    // Place below sessions
    for (const session of belowSessions) {
      for (let slotIdx = egoSlotIdx + 1; slotIdx < slots.length; slotIdx++) {
        if (slots[slotIdx][cIdx] !== -1 || !unassigned.has(session)) continue;
        slots[slotIdx][cIdx] = session;
        unassigned.delete(session);
      }
    }

    // Create new slots for remaining unassigned
    const sortedUnassigned = [...unassigned].sort(
      (a, b) => sessions.indexOf(a) - sessions.indexOf(b)
    );

    for (const session of sortedUnassigned) {
      const order = sessions.indexOf(session);
      const newSlot = Array(cIdx).fill(-1);
      newSlot.push(session);

      if (order === 0) {
        slots.unshift(newSlot);
        egoSlotIdx += 1;
      } else if (order === sessions.length - 1) {
        slots.push(newSlot);
      } else {
        const currentSpots = slots.map(s => s[cIdx]);
        const prevIdx = currentSpots.indexOf(sessions[order - 1]);
        slots.splice(prevIdx + 1, 0, newSlot);
        if (prevIdx < egoSlotIdx) egoSlotIdx += 1;
      }
    }
  }

  // Build slotsInEntities
  const slotsInEntities: (number[] | null)[][] = slots.map(slot =>
    slot.map((sessionID, cIdx) => {
      if (sessionID === -1) return null;
      const entities = orderedEntities[cIdx];
      return entities.filter(each => sessionTable[each][cIdx] === sessionID);
    })
  );

  return { slots, slotsInEntities, egoSlotIdx };
}

/**
 * Compute session heights for space minimization
 */
function computeSessionHeightSpace(
  liner: SpreadLiner,
  slots: number[][],
  slotsInEntities: (number[] | null)[][],
  egoSlotIdx: number
): number[][] {
  const [numEntities, numTimestamps] = liner.span;
  const heightTable: number[][] = Array.from({ length: numEntities }, () =>
    Array(numTimestamps).fill(NaN)
  );
  const ego = liner.egoIdx;

  // Process ego sessions
  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const entities = slotsInEntities[egoSlotIdx][cIdx];
    if (!entities) continue;

    const sessionID = slots[egoSlotIdx][cIdx];
    const session = liner.getSessionByID(sessionID);
    const egoIdx = entities.indexOf(ego);

    // Initialize heights
    const heights = [0];
    for (let idx = 1; idx < entities.length; idx++) {
      const distance = determineDistance(liner, entities[idx], entities[idx - 1], session);
      heights.push(heights[heights.length - 1] + distance);
    }

    // Center on ego
    const egoHeight = heights[egoIdx];
    for (let i = 0; i < heights.length; i++) {
      heights[i] -= egoHeight;
    }

    // Assign to height table
    for (let i = 0; i < entities.length; i++) {
      heightTable[entities[i]][cIdx] = heights[i];
    }
  }

  // Process idle sessions
  computeIdleSessionHeight(liner, heightTable, slots, slotsInEntities, egoSlotIdx);

  return heightTable;
}

/**
 * Compute session heights for wiggle minimization
 */
function computeSessionHeightLine(
  liner: SpreadLiner,
  slots: number[][],
  slotsInEntities: (number[] | null)[][],
  egoSlotIdx: number
): number[][] {
  const [numEntities, numTimestamps] = liner.span;
  const heightTable: number[][] = Array.from({ length: numEntities }, () =>
    Array(numTimestamps).fill(NaN)
  );
  const ego = liner.egoIdx;

  if (liner._config.squeezeSameCategory) {
    SQUEEZE_LINE = 2;
  }

  // Process ego sessions
  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const entities = slotsInEntities[egoSlotIdx][cIdx];
    if (!entities) continue;

    const sessionID = slots[egoSlotIdx][cIdx];
    const session = liner.getSessionByID(sessionID);
    const egoIdx = entities.indexOf(ego);

    // Initialize heights
    const heights = [0];
    for (let idx = 1; idx < entities.length; idx++) {
      const distance = determineDistance(liner, entities[idx], entities[idx - 1], session);
      heights.push(heights[heights.length - 1] + distance);
    }

    // Center on ego
    const egoHeight = heights[egoIdx];
    for (let i = 0; i < heights.length; i++) {
      heights[i] -= egoHeight;
    }

    // Assign to height table
    for (let i = 0; i < entities.length; i++) {
      heightTable[entities[i]][cIdx] = heights[i];
    }
  }

  return heightTable;
}

/**
 * Compute heights for idle sessions
 */
function computeIdleSessionHeight(
  liner: SpreadLiner,
  heightTable: number[][],
  slots: number[][],
  slotsInEntities: (number[] | null)[][],
  egoSlotIdx: number
): void {
  const [_, numTimestamps] = liner.span;

  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    for (let slotIdx = 0; slotIdx < slots.length; slotIdx++) {
      if (slotIdx === egoSlotIdx) continue;

      const entities = slotsInEntities[slotIdx][cIdx];
      if (!entities || entities.length === 0) continue;

      const direction = slotIdx < egoSlotIdx ? 'above' : 'below';
      const egoEntities = slotsInEntities[egoSlotIdx][cIdx] ?? [];
      const egoHeights = egoEntities.map(e => heightTable[e][cIdx]).filter(h => !isNaN(h));

      if (egoHeights.length === 0) continue;

      const basePos = direction === 'above'
        ? Math.min(...egoHeights)
        : Math.max(...egoHeights);

      for (const entityIdx of entities) {
        const offset = direction === 'above' ? -DISTANCE_SESSION : DISTANCE_SESSION;
        heightTable[entityIdx][cIdx] = basePos + offset;
      }
    }
  }
}

/**
 * Determine distance between two entities
 */
function determineDistance(
  liner: SpreadLiner,
  currIdx: number,
  prevIdx: number,
  session: Session | null,
  idle: boolean = false
): number {
  const colors = liner._line_color;
  const names = liner.entities_names;
  let distance = DISTANCE_LINE;
  const currentSqueeze = liner._config.squeezeSameCategory ? 2 : DISTANCE_LINE;

  if (colors[names[currIdx]] === colors[names[prevIdx]]) {
    distance = currentSqueeze;
  }

  if (idle) return currentSqueeze;
  if (!session) return distance;

  const result = haveDifferentIdentity(session, names[currIdx], names[prevIdx]);
  if (result === 'ego 2-level' || result === 'different') {
    distance = DISTANCE_HOP;
  }
  if (result === 'ego 1-level') {
    distance = DISTANCE_LINE;
  }

  return distance;
}

/**
 * Check if two entities have different identities in the session
 */
function haveDifferentIdentity(
  session: Session,
  oneEntity: string,
  otherEntity: string
): string {
  const identity = session.getIdentity(oneEntity);
  const otherIdentity = session.getIdentity(otherEntity);

  let result = 'same';
  if (identity !== otherIdentity) result = 'different';

  if ([identity, otherIdentity].includes(2)) {
    if (Math.abs(identity - otherIdentity) === 1) result = 'ego 1-level';
    if (Math.abs(identity - otherIdentity) === 2) result = 'ego 2-level';
  }

  return result;
}

/**
 * SpreadLine Compact - TypeScript port of Python compact.py
 *
 * Minimizes whitespace while maintaining visual clarity.
 * Supports two modes: 'space' or 'line' minimization.
 *
 * This is the most complex module (~800 lines in Python).
 */

import { Session } from './types';
import { nanFull, full2D, nanMin, nanMax, unique, copy2D } from './helpers';
import type { SpreadLine } from './spreadline';

// Constants
const DISTANCE_LINE = 5;      // Between lines
const DISTANCE_HOP = 10;      // Between hop levels
const DISTANCE_SESSION = 5;   // Between ego and idle sessions
let SQUEEZE_LINE = 5;         // Between same-category entities

const THROUGH = false;

/**
 * Check if two values are on the same side (above/below ego)
 */
function areOnSameSide(oneSide: string | number, otherSide: string | number): boolean {
  if (typeof oneSide === 'string' && typeof otherSide === 'string') {
    return oneSide === otherSide;
  } else if (typeof oneSide !== 'string' && typeof otherSide !== 'string') {
    return Math.sign(oneSide) === Math.sign(otherSide);
  } else {
    // One is string, one is number - normalize
    let numVal: number, strVal: string;
    if (typeof oneSide === 'string') {
      strVal = oneSide;
      numVal = otherSide as number;
    } else {
      numVal = oneSide as number;
      strVal = otherSide as string;
    }
    const sign = Math.sign(numVal);
    if (sign === 1 && strVal === 'below') return true;
    if (sign === -1 && strVal === 'above') return true;
    return false;
  }
}

/**
 * Check if entities have different hop identities
 */
function haveDifferentIdentity(session: Session | null, oneEntity: string, otherEntity: string): string {
  if (!session || !(session instanceof Session)) return 'same';

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

/**
 * Determine distance between consecutive entities
 */
function determineDistance(
  liner: SpreadLine,
  currIdx: number,
  prevIdx: number,
  session: Session | null = null,
  idle: boolean = false
): number {
  const colors = liner._line_color;
  const names = liner.entities_names;
  let distance = DISTANCE_LINE;
  let squeezeLine = DISTANCE_LINE;

  if (liner._config.squeezeSameCategory) squeezeLine = 2;

  if (colors[names[currIdx]] === colors[names[prevIdx]] &&
      colors[names[currIdx]] !== undefined) {
    distance = squeezeLine;
  }

  if (idle) return squeezeLine;
  if (!session) return distance;

  const result = haveDifferentIdentity(session, names[currIdx], names[prevIdx]);
  if (result === 'ego 2-level' || result === 'different') distance = DISTANCE_HOP;
  if (result === 'ego 1-level') distance = DISTANCE_LINE;

  return distance;
}

/**
 * Construct slots for sessions across timestamps
 */
function constructSlots(
  liner: SpreadLine,
  orderedEntities: number[][],
  orderedSessions: number[][],
  sessionAlignTable: Record<number, number>[]
): [number[][], (number | number[])[][], number] {
  const sessionTable = liner._tables.session;
  const [, numTimestamps] = liner.span;
  const ego = liner.egoIdx;
  const egoSessions = sessionTable[ego];

  // Initialize with first timestamp's sessions
  const slots: number[][] = [orderedSessions[0].slice()];
  let egoSlotIdx = orderedSessions[0].indexOf(egoSessions[0]);

  for (let cIdx = 1; cIdx < numTimestamps; cIdx++) {
    const dealt = new Set<number>();

    // Ensure ego's session always goes into the same slot
    const egoSessionID = egoSessions[cIdx];

    // Extend each slot
    for (const slot of slots) {
      slot.push(-1);  // Default to unassigned
    }

    slots[egoSlotIdx][cIdx] = egoSessionID;
    dealt.add(egoSessionID);

    // Get current sessions and alignment
    const sessions = orderedSessions[cIdx];
    const alignment = sessionAlignTable[cIdx - 1];
    const egoSessionOrder = sessions.indexOf(egoSessionID);

    // Assign aligned sessions to their slots
    for (let rIdx = 0; rIdx < slots.length; rIdx++) {
      if (rIdx === egoSlotIdx) continue;

      const prevSessionID = slots[rIdx][cIdx - 1];
      let insertSessionID = alignment[prevSessionID] ?? -1;

      // Ensure ego sessions stay aligned
      if (insertSessionID === egoSessionID) insertSessionID = -1;

      slots[rIdx][cIdx] = insertSessionID;
      if (insertSessionID !== -1) dealt.add(insertSessionID);
    }

    // Handle unassigned sessions
    const unassigned = new Set(sessions.filter(s => !dealt.has(s)));
    const aboveSessions = sessions.slice(0, egoSessionOrder).filter(s => unassigned.has(s)).reverse();
    const belowSessions = sessions.slice(egoSessionOrder + 1).filter(s => unassigned.has(s));

    // Assign above sessions (closest to ego first)
    for (const session of aboveSessions) {
      for (let slotIdx = egoSlotIdx - 1; slotIdx >= 0; slotIdx--) {
        if (slots[slotIdx][cIdx] !== -1 || !unassigned.has(session)) continue;
        slots[slotIdx][cIdx] = session;
        unassigned.delete(session);
      }
    }

    // Assign below sessions
    for (const session of belowSessions) {
      for (let slotIdx = egoSlotIdx + 1; slotIdx < slots.length; slotIdx++) {
        if (slots[slotIdx][cIdx] !== -1 || !unassigned.has(session)) continue;
        slots[slotIdx][cIdx] = session;
        unassigned.delete(session);
      }
    }

    // Create new slots for remaining unassigned sessions
    const remainingUnassigned = Array.from(unassigned).sort(
      (a, b) => sessions.indexOf(a) - sessions.indexOf(b)
    );

    for (const session of remainingUnassigned) {
      const order = sessions.indexOf(session);
      const newSlot: number[] = Array(cIdx).fill(-1);
      newSlot.push(session);

      if (order === 0) {
        slots.unshift(newSlot);
        egoSlotIdx++;
      } else if (order === sessions.length - 1) {
        slots.push(newSlot);
      } else {
        const currentSpots = slots.map(slot => slot[cIdx]);
        const prevIdx = currentSpots.indexOf(sessions[order - 1]);
        slots.splice(prevIdx + 1, 0, newSlot);
        if (prevIdx < egoSlotIdx) egoSlotIdx++;
      }
    }
  }

  // Build slotsInEntities
  const slotsInEntities: (number | number[])[][] = slots.map(slot =>
    slot.map(() => -1)
  );

  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    for (let rIdx = 0; rIdx < slots.length; rIdx++) {
      const session = slots[rIdx][cIdx];
      if (session === -1) continue;

      const entities = orderedEntities[cIdx];
      const sessionEntities = entities.filter(
        entityIdx => sessionTable[entityIdx][cIdx] === session
      );
      slotsInEntities[rIdx][cIdx] = sessionEntities;
    }
  }

  return [slots, slotsInEntities, egoSlotIdx];
}

/**
 * Build side table - track entities that cross the ego line
 */
function buildSideTable(liner: SpreadLine, heightTable: number[][]): number[][] {
  const [numEntities,] = liner.span;
  const sideTable = full2D(numEntities, 1, 0);

  for (let rIdx = 0; rIdx < numEntities; rIdx++) {
    const validHeights = heightTable[rIdx].filter(h => !isNaN(h));
    const signs = unique(validHeights.map(h => Math.sign(h)));
    if (signs.length === 2) {
      sideTable[rIdx][0] = 1;
    }
  }

  return sideTable;
}

/**
 * Compute session height for space minimization mode
 */
function computeSessionHeightSpace(
  liner: SpreadLine,
  slots: number[][],
  slotsInEntities: (number | number[])[][],
  egoSlotIdx: number,
  through: boolean
): number[][] {
  const [numEntities, numTimestamps] = liner.span;
  const heightTable = nanFull(numEntities, numTimestamps);
  const ego = liner.egoIdx;
  const blockRange = full2D(2, numTimestamps, -1);

  // Process ego sessions first
  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const entities = slotsInEntities[egoSlotIdx][cIdx];
    if (entities === -1 || !Array.isArray(entities)) continue;

    const sessionID = slots[egoSlotIdx][cIdx];
    const session = liner.getSessionByID(sessionID);
    const egoIdx = (entities as number[]).indexOf(ego);

    // Initialize heights for entities in this session
    const heights: number[] = [0];
    for (let idx = 1; idx < (entities as number[]).length; idx++) {
      const rIdx = (entities as number[])[idx];
      const distance = determineDistance(liner, rIdx, (entities as number[])[idx - 1], session);
      heights.push(heights[heights.length - 1] + distance);
    }

    // Center on ego
    const egoHeight = heights[egoIdx];
    for (let i = 0; i < heights.length; i++) {
      heights[i] -= egoHeight;
    }

    // Update block range and height table
    blockRange[0][cIdx] = Math.min(...heights);
    blockRange[1][cIdx] = Math.max(...heights);

    for (let i = 0; i < (entities as number[]).length; i++) {
      heightTable[(entities as number[])[i]][cIdx] = heights[i];
    }
  }

  // Compute idle session heights
  return computeIdleSessionHeight(liner, heightTable, slots, slotsInEntities, egoSlotIdx, blockRange, through);
}

/**
 * Compute idle session heights
 */
function computeIdleSessionHeight(
  liner: SpreadLine,
  heightTable: number[][],
  slots: number[][],
  slotsInEntities: (number | number[])[][],
  egoSlotIdx: number,
  blockRange: number[][],
  through: boolean
): number[][] {
  const [, numTimestamps] = liner.span;
  const assign: Record<number, Record<number, number>> = {};

  // Helper to check if a position is available
  function isAvailable(number: number, cIdx: number, heights: number[]): boolean {
    const throughFlag = through && blockRange[0][cIdx] < number && number < blockRange[1][cIdx];
    const notConflict = blockRange[0][cIdx] > number || number > blockRange[1][cIdx];
    const sameRange = blockRange[0][cIdx] === blockRange[1][cIdx];
    return (throughFlag || notConflict || sameRange) && !heights.includes(number);
  }

  // Process each timestamp
  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const sessions = slots.map(slot => slot[cIdx]);
    const heights = heightTable.map(row => row[cIdx]);

    for (let slotIdx = 0; slotIdx < sessions.length; slotIdx++) {
      const session = sessions[slotIdx];
      if (session === -1 || session === slots[egoSlotIdx][cIdx]) continue;

      const entities = slotsInEntities[slotIdx][cIdx];
      if (entities === -1 || !Array.isArray(entities) || entities.length !== 1) continue;

      const rIdx = entities[0];
      const direction = slotIdx < egoSlotIdx ? 'above' : 'below';

      if (!assign[rIdx]) assign[rIdx] = {};

      // Find left and right non-NaN heights
      let leftCIdx = cIdx - 1;
      while (leftCIdx >= 0 && isNaN(heightTable[rIdx][leftCIdx])) leftCIdx--;
      let rightCIdx = cIdx + 1;
      while (rightCIdx < numTimestamps && isNaN(heightTable[rIdx][rightCIdx])) rightCIdx++;

      const leftSide = leftCIdx >= 0 ? heightTable[rIdx][leftCIdx] : NaN;
      const rightSide = rightCIdx < numTimestamps ? heightTable[rIdx][rightCIdx] : NaN;
      const sameSide = !isNaN(leftSide) && !isNaN(rightSide) && areOnSameSide(leftSide, rightSide);

      // Calculate positions
      let abovePos = blockRange[0][cIdx];
      let belowPos = blockRange[1][cIdx];
      while (heights.includes(abovePos)) abovePos -= DISTANCE_SESSION;
      while (heights.includes(belowPos)) belowPos += DISTANCE_SESSION;

      let assignment: number;
      if (!sameSide) {
        assignment = direction === 'above' ? abovePos : belowPos;
        if (!isNaN(leftSide) && areOnSameSide(assignment, leftSide) && isAvailable(leftSide, cIdx, heights)) {
          assignment = leftSide;
        }
        if (!isNaN(rightSide) && areOnSameSide(assignment, rightSide) && isAvailable(rightSide, cIdx, heights)) {
          assignment = rightSide;
        }
      } else if (areOnSameSide(leftSide, direction)) {
        assignment = direction === 'above' ? abovePos : belowPos;
        if (!isNaN(leftSide) && areOnSameSide(assignment, leftSide) && isAvailable(leftSide, cIdx, heights)) {
          assignment = leftSide;
        }
        if (!isNaN(rightSide) && areOnSameSide(assignment, rightSide) && isAvailable(rightSide, cIdx, heights)) {
          assignment = rightSide;
        }
      } else {
        assignment = Math.sign(leftSide) === -1 ? abovePos : belowPos;
      }

      heights[rIdx] = assignment;
      assign[rIdx][cIdx] = assignment;
    }
  }

  // Apply assignments to height table
  for (const [rIdxStr, assignments] of Object.entries(assign)) {
    const rIdx = parseInt(rIdxStr);
    for (const [cIdxStr, height] of Object.entries(assignments)) {
      const cIdx = parseInt(cIdxStr);
      heightTable[rIdx][cIdx] = height;
    }
  }

  return heightTable;
}

/**
 * Compute session height for line minimization mode (more complex)
 */
function computeSessionHeightLine(
  liner: SpreadLine,
  slots: number[][],
  slotsInEntities: (number | number[])[][],
  egoSlotIdx: number,
  through: boolean
): number[][] {
  const [numEntities, numTimestamps] = liner.span;
  const heightTable = nanFull(numEntities, numTimestamps);
  const ego = liner.egoIdx;
  const presenceTable = liner._tables.presence;

  if (liner._config.squeezeSameCategory) SQUEEZE_LINE = 2;

  // Initialize block and session tracking
  const block: Record<number, number[]> = {};
  const sessions: Record<number, number> = {};
  const assign: Record<number, number[]> = {};

  // First pass: initialize ego session heights
  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const entities = slotsInEntities[egoSlotIdx][cIdx];
    if (entities === -1 || !Array.isArray(entities)) continue;

    const sessionID = slots[egoSlotIdx][cIdx];
    const session = liner.getSessionByID(sessionID);
    const egoIdx = (entities as number[]).indexOf(ego);

    const heights: number[] = [0];
    for (let idx = 1; idx < (entities as number[]).length; idx++) {
      const rIdx = (entities as number[])[idx];
      const distance = determineDistance(liner, rIdx, (entities as number[])[idx - 1], session);
      heights.push(heights[heights.length - 1] + distance);
    }

    // Center on ego
    const egoHeight = heights[egoIdx];
    for (let i = 0; i < heights.length; i++) {
      heights[i] -= egoHeight;
    }

    // Track for alignment
    const entitiesArr = entities as number[];
    for (const rIdx of [...entitiesArr.slice(0, egoIdx).reverse(), ...entitiesArr.slice(egoIdx + 1)]) {
      if (!assign[rIdx]) assign[rIdx] = [];
      assign[rIdx].push(cIdx);
    }

    block[cIdx] = entitiesArr;
    sessions[cIdx] = sessionID;

    for (let i = 0; i < entitiesArr.length; i++) {
      heightTable[entitiesArr[i]][cIdx] = heights[i];
    }
  }

  const referenceTable = copy2D(heightTable);
  const dealt: Record<number, boolean> = {};

  // Helper function to get block range
  function getBlockRange(cIdx: number): [number, number] {
    const currentBlock = block[cIdx].map(idx => heightTable[idx][cIdx]);
    const pointRadius = 2;
    return [nanMin(currentBlock) - pointRadius, nanMax(currentBlock) + pointRadius];
  }

  // Helper to get other ordered heights
  function getOtherOrderedHeights(heights: number[], egoIdx: number): [number[], number[]] {
    const indexed = heights.map((h, i) => ({ h, i }))
      .filter(({ h, i }) => !isNaN(h) && i !== egoIdx)
      .sort((a, b) => a.h - b.h);
    return [indexed.map(x => x.h), indexed.map(x => x.i)];
  }

  // Process entities that appear in multiple timestamps
  for (const [rIdxStr, times] of Object.entries(assign)) {
    const rIdx = parseInt(rIdxStr);
    if (times.length === 1) continue;
    dealt[rIdx] = true;

    for (let cIdx = times[0]; cIdx <= times[times.length - 1]; cIdx++) {
      // Determine target height
      const timeline = times.map(t => heightTable[rIdx][t]).filter(h => !isNaN(h));
      if (timeline.length === 0) continue;

      const height = Math.sign(timeline[0]) === 1 ? Math.max(...timeline) : Math.min(...timeline);

      // Get other heights at this timestamp
      const [otherHeights, orderedOthers] = getOtherOrderedHeights(heightTable.map(r => r[cIdx]), ego);

      if (!orderedOthers.includes(rIdx)) {
        // Idle session handling
        heightTable[rIdx][cIdx] = height;
        continue;
      }

      const curr = heightTable[rIdx][cIdx];
      if (curr === height || !areOnSameSide(curr, height)) continue;

      // Try to assign new height
      const order = orderedOthers.indexOf(rIdx);
      const restEntities = Math.sign(height) === 1
        ? orderedOthers.slice(order + 1)
        : orderedOthers.slice(0, order).reverse();

      // Check if we can update without affecting others
      let canUpdate = true;
      for (const entity of restEntities) {
        const desiredDiff = (referenceTable[entity][cIdx] - referenceTable[rIdx][cIdx]) * Math.sign(height);
        const currDiff = (heightTable[entity][cIdx] - height) * Math.sign(height);

        if (isNaN(desiredDiff)) continue;
        if (currDiff < desiredDiff && dealt[entity]) {
          canUpdate = false;
          break;
        }
      }

      if (canUpdate) {
        heightTable[rIdx][cIdx] = height;
      }
    }
  }

  return heightTable;
}

/**
 * Main compacting function
 *
 * @param liner - SpreadLine instance
 * @param orderedEntities - Ordered entity indices per timestamp
 * @param orderedSessions - Ordered session IDs per timestamp
 * @param sessionAlignTable - Session alignment mappings
 * @returns [heightTable, sideTable]
 */
export function compacting(
  liner: SpreadLine,
  orderedEntities: number[][],
  orderedSessions: number[][],
  sessionAlignTable: Record<number, number>[]
): [number[][], number[][]] {
  const focus = liner._config.minimize;

  // Construct slots
  const [slots, slotsInEntities, egoSlotIdx] = constructSlots(
    liner, orderedEntities, orderedSessions, sessionAlignTable
  );

  // Compute heights based on minimization mode
  let heightTable: number[][];
  if (focus === 'space') {
    heightTable = computeSessionHeightSpace(liner, slots, slotsInEntities, egoSlotIdx, THROUGH);
  } else {
    heightTable = computeSessionHeightLine(liner, slots, slotsInEntities, egoSlotIdx, THROUGH);
  }

  // Build side table
  const sideTable = buildSideTable(liner, heightTable);

  // Normalize heights (shift so minimum is 0)
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

  // Verify ego has consistent height
  const egoHeights = unique(heightTable[liner.egoIdx].filter(h => h !== -1));
  if (egoHeights.length !== 1) {
    console.warn('Warning: Ego should only have one height, found:', egoHeights);
  }

  return [heightTable, sideTable];
}

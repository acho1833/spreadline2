/**
 * SpreadLine Compacting Algorithm
 * Converted from Python: SpreadLine/compact.py
 *
 * Minimizes whitespace or line wiggles while respecting ordering constraints.
 * Uses slot-based layout with compression.
 */

import { Session, Entity, NumberMatrix, Tables, Locations, SpreadLineConfig } from './types';
import { full2D, nanmin, nanmax } from './helpers';

// Constants
const DISTANCE_LINE = 5;   // Between lines
const DISTANCE_HOP = 10;   // Between hop levels
const DISTANCE_SESSION = 5; // Between sessions
let SQUEEZE_LINE = 5;      // Between lines of same category

const THROUGH = false;

interface Liner {
  span: [number, number];
  egoIdx: number;
  entities: Entity[];
  entities_names: string[];
  locations: Locations;
  _tables: Tables;
  _line_color: Record<string, string>;
  _config: SpreadLineConfig;
  _groups: Record<string, string[][]>;
  effective_timestamps: number[];
  _all_timestamps: string[];
  getSessionByID: (id: number) => Session | null;
}

/**
 * Construct slots for sessions to be rendered
 * Python equivalent: _construct_slots
 */
function constructSlots(
  liner: Liner,
  orderedEntities: number[][],
  orderedSessions: number[][],
  sessionAlignTable: Record<number, number>[]
): [NumberMatrix, any[][], number] {
  const sessionTable = liner._tables.session;
  const [numEntities, numTimestamps] = liner.span;
  const ego = liner.egoIdx;
  const egoSessions = sessionTable[ego];

  // Initialize slots with first timestamp
  const slots: number[][] = [orderedSessions[0].slice()];
  let egoSlotIdx = orderedSessions[0].indexOf(egoSessions[0]);

  for (let cIdx = 1; cIdx < numTimestamps; cIdx++) {
    const dealt = new Set<number>();

    // Ensure ego's session always goes into same slot
    const egoSessionID = egoSessions[cIdx];
    slots[egoSlotIdx].push(egoSessionID);
    dealt.add(egoSessionID);

    const sessions = orderedSessions[cIdx];
    const alignment = sessionAlignTable[cIdx - 1];
    const egoSessionOrder = sessions.indexOf(egoSessionID);

    // Insert aligned sessions into existing slots
    for (let rIdx = 0; rIdx < slots.length; rIdx++) {
      if (rIdx === egoSlotIdx) continue;
      const prevSessionID = slots[rIdx][cIdx - 1];
      let insertSessionID = alignment[prevSessionID] ?? -1;
      if (insertSessionID === egoSessionID) insertSessionID = -1;
      slots[rIdx].push(insertSessionID);
      if (insertSessionID !== -1) dealt.add(insertSessionID);
    }

    // Divide unassigned into above/below ego
    const unassigned = new Set(sessions.filter(s => !dealt.has(s)));
    const aboveSessions = sessions.slice(0, egoSessionOrder).filter(s => unassigned.has(s)).reverse();
    const belowSessions = sessions.slice(egoSessionOrder + 1).filter(s => unassigned.has(s));

    // Fill above slots
    for (const session of aboveSessions) {
      for (let slotIdx = egoSlotIdx - 1; slotIdx >= 0; slotIdx--) {
        if (slots[slotIdx][cIdx] !== -1 || !unassigned.has(session)) continue;
        slots[slotIdx][cIdx] = session;
        unassigned.delete(session);
      }
    }

    // Fill below slots
    for (const session of belowSessions) {
      for (let slotIdx = egoSlotIdx + 1; slotIdx < slots.length; slotIdx++) {
        if (slots[slotIdx][cIdx] !== -1 || !unassigned.has(session)) continue;
        slots[slotIdx][cIdx] = session;
        unassigned.delete(session);
      }
    }

    // Add new slots for remaining unassigned
    const unassignedArr = Array.from(unassigned).sort((a, b) => sessions.indexOf(a) - sessions.indexOf(b));
    for (const session of unassignedArr) {
      const currentSpots = slots.map(s => s[cIdx]);
      const order = sessions.indexOf(session);
      const newSlot: number[] = new Array(cIdx).fill(-1);
      newSlot.push(session);

      if (order === 0) {
        slots.unshift(newSlot);
        egoSlotIdx++;
      } else if (order === sessions.length - 1) {
        slots.push(newSlot);
      } else {
        const prevIdx = currentSpots.indexOf(sessions[order - 1]);
        slots.splice(prevIdx + 1, 0, newSlot);
        if (prevIdx < egoSlotIdx) egoSlotIdx++;
      }
    }
  }

  // Build slotsInEntities
  const slotsInEntities: any[][] = slots.map(row => row.map(() => -1));

  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    for (let rIdx = 0; rIdx < slots.length; rIdx++) {
      const session = slots[rIdx][cIdx];
      if (session === -1) continue;
      const entities = orderedEntities[cIdx];
      const sessionEntities = entities.filter(e => sessionTable[e][cIdx] === session);
      slotsInEntities[rIdx][cIdx] = sessionEntities;
    }
  }

  return [slots, slotsInEntities, egoSlotIdx];
}

/**
 * Check if two values are on the same side (above/below ego)
 */
function areOnSameSide(oneSide: string | number, otherSide: string | number): boolean {
  if (typeof oneSide === 'string' && typeof otherSide === 'string') {
    return oneSide === otherSide;
  }
  if (typeof oneSide === 'number' && typeof otherSide === 'number') {
    return Math.sign(oneSide) === Math.sign(otherSide);
  }
  if (typeof oneSide === 'string') {
    [oneSide, otherSide] = [otherSide, oneSide];
  }
  const sign = Math.sign(oneSide as number);
  if (sign === 1 && otherSide === 'below') return true;
  if (sign === -1 && otherSide === 'above') return true;
  return false;
}

/**
 * Determine distance between two entities based on hop level
 */
function determineDistance(
  liner: Liner,
  currIdx: number,
  prevIdx: number,
  session: Session | null = null,
  idle: boolean = false
): number {
  const colors = liner._line_color;
  const names = liner.entities_names;
  let distance = DISTANCE_LINE;
  let squeezeLine = liner._config.squeezeSameCategory ? 2 : DISTANCE_LINE;

  if (colors[names[currIdx]] === colors[names[prevIdx]] && colors[names[currIdx]] !== undefined) {
    distance = squeezeLine;
  }
  if (idle) return squeezeLine;
  if (session === null) return distance;

  const result = haveDifferentIdentity(session, names[currIdx], names[prevIdx]);
  if (result === 'ego 2-level' || result === 'different') distance = DISTANCE_HOP;
  if (result === 'ego 1-level') distance = DISTANCE_LINE;

  return distance;
}

/**
 * Check if two entities have different identity levels
 */
function haveDifferentIdentity(session: Session, oneEntity: string, otherEntity: string): string {
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
 * Build side table indicating if entity crosses ego line
 */
function buildSideTable(liner: Liner, heightTable: NumberMatrix): number[] {
  const [numEntities, numTimestamps] = liner.span;
  const sideTable: number[] = new Array(numEntities).fill(0);

  for (let rIdx = 0; rIdx < numEntities; rIdx++) {
    const row = heightTable[rIdx].filter(v => !Number.isNaN(v));
    const signs = [...new Set(row.map(v => Math.sign(v)))];
    if (signs.length === 2) sideTable[rIdx] = 1;
  }

  return sideTable;
}

/**
 * Compute session heights minimizing space
 * Python equivalent: _compute_session_height_space
 */
function computeSessionHeightSpace(
  liner: Liner,
  slots: NumberMatrix,
  slotsInEntities: any[][],
  egoSlotIdx: number,
  through: boolean = true
): NumberMatrix {
  const [numEntities, numTimestamps] = liner.span;
  const heightTable: NumberMatrix = full2D(numEntities, numTimestamps, NaN);
  const ego = liner.egoIdx;
  const colors = liner._line_color;

  const blockRange: NumberMatrix = full2D(2, numTimestamps, -1);

  // Process ego sessions first
  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const entities: number[] = slotsInEntities[egoSlotIdx][cIdx];
    if (!Array.isArray(entities) || entities.length === 0) continue;

    const sessionID = slots[egoSlotIdx][cIdx];
    const session = liner.getSessionByID(sessionID);
    const egoIdx = entities.indexOf(ego);

    // Calculate heights within session
    const heights: number[] = [0];
    for (let idx = 1; idx < entities.length; idx++) {
      const rIdx = entities[idx];
      const distance = determineDistance(liner, rIdx, entities[idx - 1], session);
      heights.push(heights[heights.length - 1] + distance);
    }

    // Center on ego
    const egoHeight = heights[egoIdx];
    for (let i = 0; i < heights.length; i++) {
      heights[i] -= egoHeight;
    }

    blockRange[0][cIdx] = nanmin(heights);
    blockRange[1][cIdx] = nanmax(heights);

    // Set heights
    for (let i = 0; i < entities.length; i++) {
      heightTable[entities[i]][cIdx] = heights[i];
    }
  }

  // Process idle sessions
  heightTable.forEach((row, rIdx) => {
    row.forEach((val, cIdx) => {
      if (Number.isNaN(val) && liner._tables.presence[rIdx][cIdx] !== 0) {
        // This is an idle session, assign based on position
        const slotIdx = slotsInEntities.findIndex(slot =>
          Array.isArray(slot[cIdx]) && slot[cIdx].includes(rIdx)
        );
        if (slotIdx !== -1) {
          const direction = slotIdx < egoSlotIdx ? 'above' : 'below';
          const offset = DISTANCE_SESSION * (direction === 'above' ? -1 : 1);
          const baseHeight = direction === 'above' ? blockRange[0][cIdx] : blockRange[1][cIdx];
          heightTable[rIdx][cIdx] = baseHeight + offset;
        }
      }
    });
  });

  return heightTable;
}

/**
 * Get other ordered heights excluding ego
 */
function getOtherOrderedHeights(heights: number[], ego: number): [number[], number[]] {
  const indices = heights.map((_, i) => i);
  const filtered = indices.filter(i => !Number.isNaN(heights[i]) && i !== ego);
  filtered.sort((a, b) => heights[a] - heights[b]);
  const sortedHeights = filtered.map(i => heights[i]);
  return [sortedHeights, filtered];
}

/**
 * Find range of same values
 */
function findSameRange(nums: number[], idx: number, heights: number[], sameSide: boolean = false): [number, number] {
  const value = nums[idx];
  let start = idx;
  while (start > 0 && nums[start - 1] === value) {
    if (sameSide && !areOnSameSide(heights[idx], heights[start - 1])) break;
    start--;
  }
  let end = idx;
  while (end < nums.length - 1 && nums[end + 1] === value) {
    if (sameSide && !areOnSameSide(heights[idx], heights[end + 1])) break;
    end++;
  }
  return [start, end + 1];
}

/**
 * Compute session heights minimizing wiggles (line-based)
 * Python equivalent: _compute_session_height_line
 */
function computeSessionHeightLine(
  liner: Liner,
  slots: NumberMatrix,
  slotsInEntities: any[][],
  egoSlotIdx: number,
  through: boolean = true
): NumberMatrix {
  const [numEntities, numTimestamps] = liner.span;
  const heightTable: NumberMatrix = full2D(numEntities, numTimestamps, NaN);
  const ego = liner.egoIdx;
  const names = liner.entities_names;
  const colors = liner._line_color;
  const presenceTable = liner._tables.presence;

  const squeezeLine = liner._config.squeezeSameCategory ? 2 : DISTANCE_LINE;

  // Initialize block positions and sessions
  const block: Record<number, number[]> = {};
  const sessions: Record<number, number> = {};
  const assign: Record<number, number[]> = {};

  // First pass: set up ego session heights
  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const entities: number[] = slotsInEntities[egoSlotIdx][cIdx];
    if (!Array.isArray(entities) || entities.length === 0) continue;

    const sessionID = slots[egoSlotIdx][cIdx];
    const session = liner.getSessionByID(sessionID);
    const egoIdx = entities.indexOf(ego);

    // Calculate heights
    const heights: number[] = [0];
    for (let idx = 1; idx < entities.length; idx++) {
      const rIdx = entities[idx];
      const distance = determineDistance(liner, rIdx, entities[idx - 1], session);
      heights.push(heights[heights.length - 1] + distance);
    }

    // Center on ego
    const egoHeight = heights[egoIdx];
    for (let i = 0; i < heights.length; i++) {
      heights[i] -= egoHeight;
    }

    // Debug: show first and last timestamp details
    if (DEBUG_COMPACT && (cIdx === 0 || cIdx === numTimestamps - 1)) {
      console.log(`cIdx=${cIdx}: entities=${entities.length}, egoIdx=${egoIdx}`);
      console.log(`  heights: min=${Math.min(...heights)}, max=${Math.max(...heights)}`);
      console.log(`  entity names:`, entities.map(e => names[e]));
    }

    // Track assignments
    const aboveEgo = entities.slice(0, egoIdx).reverse();
    const belowEgo = entities.slice(egoIdx + 1);
    for (const rIdx of [...aboveEgo, ...belowEgo]) {
      if (!assign[rIdx]) assign[rIdx] = [];
      assign[rIdx].push(cIdx);
    }

    block[cIdx] = entities;
    sessions[cIdx] = sessionID;

    // Set heights
    for (let i = 0; i < entities.length; i++) {
      heightTable[entities[i]][cIdx] = heights[i];
    }
  }

  // Copy reference table
  const referenceTable = heightTable.map(row => [...row]);
  const dealt: Record<number, boolean> = {};

  // Second pass: align entities to reduce wiggles
  // SKIP_SECOND_PASS: Skip complex second pass to check if first pass matches Python
  if (SKIP_SECOND_PASS) {
    if (DEBUG_COMPACT) {
      console.log('SKIPPING SECOND PASS');
      const allHeights = heightTable.flat().filter(v => !Number.isNaN(v));
      console.log('After first pass - min:', Math.min(...allHeights), 'max:', Math.max(...allHeights));
    }
    return heightTable;
  }

  for (const [rIdxStr, times] of Object.entries(assign)) {
    const rIdx = parseInt(rIdxStr);
    if (times.length <= 1) continue;
    dealt[rIdx] = true;

    for (let cIdx = times[0]; cIdx <= times[times.length - 1]; cIdx++) {
      // Get timeline values
      const timeline = times.map(t => heightTable[rIdx][t]).filter(v => !Number.isNaN(v));
      if (timeline.length === 0) continue;

      // Determine target height
      let height: number;
      const presence = presenceTable[rIdx];
      const checkSameSide = presence[cIdx] === 1;
      const [start, end] = findSameRange(presence, cIdx, heightTable[rIdx], checkSameSide);
      const selection = heightTable[rIdx].slice(start, end).filter(v => !Number.isNaN(v));

      if (presence[cIdx] === -1 && selection.length === 0) {
        // Idle session with no reference
        const candidates = [heightTable[rIdx][start - 1], heightTable[rIdx][end]].filter(v => !Number.isNaN(v));
        if (candidates.length >= 2 && areOnSameSide(candidates[0], candidates[1])) {
          height = candidates[0];
        } else if (candidates.length >= 2) {
          height = Math.abs(candidates[0]) < Math.abs(candidates[1]) ? candidates[0] : candidates[1];
        } else {
          height = candidates[0] ?? 0;
        }
      } else if (presence[cIdx] === -1) {
        height = selection[0];
      } else {
        height = Math.sign(timeline[0]) === 1 ? nanmax(timeline) : nanmin(timeline);
        const threshold = 50;
        if (Math.abs(height - heightTable[rIdx][cIdx]) > threshold) {
          height = heightTable[rIdx][cIdx];
        }
      }

      // Get other entities and check for conflicts
      const [otherHeights, orderedOthers] = getOtherOrderedHeights(heightTable.map(row => row[cIdx]), ego);

      if (orderedOthers.includes(rIdx)) {
        // Non-idle entity
        const curr = heightTable[rIdx][cIdx];
        if (curr === height || !areOnSameSide(curr, height)) continue;

        // Try to assign without conflict
        const order = orderedOthers.indexOf(rIdx);
        const restEntities = Math.sign(height) === 1
          ? orderedOthers.slice(order + 1)
          : orderedOthers.slice(0, order).reverse();

        // Simple assignment - just set the height
        heightTable[rIdx][cIdx] = height;
      } else {
        // Idle entity
        const assumedDifference = squeezeLine;
        heightTable[rIdx][cIdx] = height;
      }
    }
  }

  return heightTable;
}

// Debug flag - set to true to enable debug output
const DEBUG_COMPACT = true;

// Skip the complex second pass alignment (for debugging)
const SKIP_SECOND_PASS = false;

/**
 * Main compacting function
 * Python equivalent: compacting
 */
export function compacting(
  liner: Liner,
  orderedEntities: number[][],
  orderedSessions: number[][],
  sessionAlignTable: Record<number, number>[]
): [NumberMatrix, number[]] {
  const focus = liner._config.minimize;
  const [slots, slotsInEntities, egoSlotIdx] = constructSlots(
    liner, orderedEntities, orderedSessions, sessionAlignTable
  );

  if (DEBUG_COMPACT) {
    console.log('=== COMPACT DEBUG ===');
    console.log('egoSlotIdx:', egoSlotIdx);
    console.log('slots shape:', slots.length, 'x', slots[0]?.length);
  }

  let heightTable: NumberMatrix;
  if (focus === 'space') {
    heightTable = computeSessionHeightSpace(liner, slots, slotsInEntities, egoSlotIdx, THROUGH);
  } else {
    heightTable = computeSessionHeightLine(liner, slots, slotsInEntities, egoSlotIdx, THROUGH);
  }

  if (DEBUG_COMPACT) {
    // Find min/max before offset
    const allHeights = heightTable.flat().filter(v => !Number.isNaN(v));
    console.log('heightTable before offset - min:', Math.min(...allHeights), 'max:', Math.max(...allHeights));
    console.log('ego row before offset:', heightTable[liner.egoIdx]);
  }

  const sideTable = buildSideTable(liner, heightTable);

  // Offset to make all heights positive
  const minOffset = Math.abs(nanmin(heightTable.flat().filter(v => !Number.isNaN(v))));

  if (DEBUG_COMPACT) {
    console.log('minOffset:', minOffset);
  }

  for (let i = 0; i < heightTable.length; i++) {
    for (let j = 0; j < heightTable[i].length; j++) {
      if (!Number.isNaN(heightTable[i][j])) {
        heightTable[i][j] += minOffset;
      } else {
        heightTable[i][j] = -1;
      }
    }
  }

  // Verify ego has single height
  const egoHeights = [...new Set(heightTable[liner.egoIdx].filter(v => v !== -1))];
  if (egoHeights.length !== 1) {
    console.warn('Warning: Ego should only have one height, found:', egoHeights);
  }

  if (DEBUG_COMPACT) {
    console.log('ego row after offset:', heightTable[liner.egoIdx]);
    console.log('=== END COMPACT DEBUG ===');
  }

  return [heightTable, sideTable];
}

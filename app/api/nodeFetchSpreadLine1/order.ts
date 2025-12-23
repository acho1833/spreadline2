/**
 * SpreadLine Ordering Algorithm
 * Converted from Python: SpreadLine/order.py
 *
 * Performs ordering of sessions to minimize edge crossings using
 * the barycenter algorithm with forward/backward sweeping.
 */

import { Node, Session, Entity, NumberMatrix, Tables, Locations } from './types';
import { sparseArgsort, full2D, uniquePreserveOrder } from './helpers';

interface Liner {
  span: [number, number];
  _counts: { numTimestamps: number };
  locations: Locations;
  _tables: Tables;
  sessions: Session[];
  entities: Entity[];
  entities_names: string[];
  egoIdx: number;
  getSessionByID: (id: number) => Session | null;
}

/**
 * Bundle entities by timestamp, creating session objects for each timestamp
 * Python equivalent: _bundle_entities_by_timestamp
 */
function bundleEntitiesByTimestamp(liner: Liner): Session[][] {
  const sessionTable = liner._tables.session;
  const numTimestamps = liner._counts.numTimestamps;
  const sessionsPerTimestamp: Session[][] = [];
  const idleLocations = liner.locations.idle;
  const names = liner.entities_names;

  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const sessions: Session[] = [];
    const column = sessionTable.map(row => row[cIdx]);

    // Get unique session IDs in this column
    const uniqueSessionIDs = [...new Set(column)].sort((a, b) => a - b);

    for (const sessionID of uniqueSessionIDs) {
      if (sessionID === 0) continue;

      if (!idleLocations.has(sessionID)) {
        // Contact session - get from liner
        const session = liner.getSessionByID(sessionID);
        if (session) {
          sessions.push(session);
        }
      } else {
        // Idle session - create Session objects on demand
        const entitiesIDs: number[] = [];
        for (let rIdx = 0; rIdx < sessionTable.length; rIdx++) {
          if (sessionTable[rIdx][cIdx] === sessionID) {
            entitiesIDs.push(rIdx);
          }
        }
        entitiesIDs.sort((a, b) => a - b);

        const entities = entitiesIDs.map((id, idx) =>
          new Node(names[id], sessionID, idx, -1, id)
        );
        const session = new Session(sessionID, entities, 'idle');
        sessions.push(session);
      }
    }
    sessionsPerTimestamp.push(sessions);
  }

  return sessionsPerTimestamp;
}

/**
 * Sort nodes within a group by their barycenter value
 * Python equivalent: _within_sort
 */
function withinSort(
  group: string[],
  session: Session,
  currNodes: Node[],
  sweepRange: [number, number]
): void {
  const nodes = group.map(name => session.findNode(name) as Node).filter(n => n !== null);
  nodes.sort((a, b) => a.getBarycenterLeaf(currNodes) - b.getBarycenterLeaf(currNodes));
  session.replaceNode(nodes, sweepRange);
}

/**
 * Perform barycenter sort on sessions
 * Python equivalent: _barycenter_sort
 */
function barycenterSort(currNodes: Node[], nextSessions: Session[]): Session[] {
  for (const session of nextSessions) {
    // For those in the same session, find how many exist in the previous session
    const existed = session.entities.map(node => node.findSelf(currNodes)).filter(n => n !== null) as Node[];
    // Sum of their orders
    const barycenterSum = existed.reduce((sum, node) => sum + node.order, 0);
    session.barycenter = barycenterSum / session.entityWeight;
  }

  nextSessions.sort((a, b) => a.barycenter - b.barycenter);

  // Update node orders based on new session order
  const allNodes = nextSessions.flatMap(s => s.entities);
  for (const session of nextSessions) {
    for (const node of session.entities) {
      node.order = allNodes.indexOf(node);
    }
  }

  return nextSessions;
}

/**
 * Constrained crossing reduction between consecutive timestamps
 * Python equivalent: _constrained_crossing_reduction
 */
function constrainedCrossingReduction(
  currentSessions: Session[],
  nextSessions: Session[]
): Session[] {
  const currNodes = currentSessions.flatMap(s => s.entities);
  const result: Session[] = [];

  for (const session of nextSessions) {
    const constraints = session.constraints;
    if (constraints.length === 0) {
      result.push(session);
      continue;
    }

    const [topTwoHops, sourceGroup, _, targetGroup, bottomTwoHops] = constraints;

    // Sort each group by barycenter
    let sweepRange: [number, number] = [0, Array.isArray(topTwoHops) ? topTwoHops.length : 0];

    if (Array.isArray(topTwoHops) && topTwoHops.length > 1) {
      withinSort(topTwoHops, session, currNodes, sweepRange);
    }

    // Process source groups
    if (typeof sourceGroup === 'object' && !Array.isArray(sourceGroup)) {
      for (const [weight, group] of Object.entries(sourceGroup)) {
        if (Array.isArray(group)) {
          sweepRange = [sweepRange[1], sweepRange[1] + group.length];
          if (group.length > 1) {
            withinSort(group, session, currNodes, sweepRange);
          }
        }
      }
    }

    sweepRange = [sweepRange[1], sweepRange[1] + 1]; // ego

    // Process target groups
    if (typeof targetGroup === 'object' && !Array.isArray(targetGroup)) {
      for (const [weight, group] of Object.entries(targetGroup)) {
        if (Array.isArray(group)) {
          sweepRange = [sweepRange[1], sweepRange[1] + group.length];
          if (group.length > 1) {
            withinSort(group, session, currNodes, sweepRange);
          }
        }
      }
    }

    sweepRange = [sweepRange[1], sweepRange[1] + (Array.isArray(bottomTwoHops) ? bottomTwoHops.length : 0)];
    if (Array.isArray(bottomTwoHops) && bottomTwoHops.length > 1) {
      withinSort(bottomTwoHops, session, currNodes, sweepRange);
    }

    result.push(session);
  }

  return barycenterSort(currNodes, result);
}

/**
 * Main ordering function
 * Python equivalent: ordering
 *
 * Performs ordering of sessions using barycenter algorithm with
 * forward and backward sweeping iterations.
 */
export function ordering(
  liner: Liner,
  iteration: number = 10
): [NumberMatrix, number[][], number[][], number[][]] {
  let sessionsPerTimestamp = bundleEntitiesByTimestamp(liner);
  const numTimestamps = liner._counts.numTimestamps;
  const idleLocations = liner.locations.idle;
  const sessionTable = liner._tables.session;

  // Iterative sweeping
  for (let iter = 0; iter < iteration; iter++) {
    // Forward sweeping
    for (let cIdx = 0; cIdx < numTimestamps - 1; cIdx++) {
      const currentSessions = sessionsPerTimestamp[cIdx];
      const nextSessions = sessionsPerTimestamp[cIdx + 1];
      sessionsPerTimestamp[cIdx + 1] = constrainedCrossingReduction(currentSessions, nextSessions);
    }

    // Backward sweeping
    for (let cIdx = numTimestamps - 1; cIdx > 0; cIdx--) {
      const currentSessions = sessionsPerTimestamp[cIdx];
      const prevSessions = sessionsPerTimestamp[cIdx - 1];
      sessionsPerTimestamp[cIdx - 1] = constrainedCrossingReduction(currentSessions, prevSessions);
    }
  }

  // Populate the ordering results in the orderTable
  const orderTable = full2D(liner.span[0], liner.span[1], 0);

  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const sessions = sessionsPerTimestamp[cIdx];
    const nodes = sessions.flatMap(s => s.entities);

    for (const node of nodes) {
      const rIdx = node.id;
      orderTable[rIdx][cIdx] = node.order + 1; // +1 because default order starts from 0
    }
  }

  // Build ordered entities, idle entities, and sessions
  const orderedEntities: number[][] = [];
  const orderedIdleEntities: number[][] = [];
  const orderedSessions: number[][] = [];

  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const column = orderTable.map(row => row[cIdx]);
    const orderedEntity = sparseArgsort(column);
    orderedEntities.push(orderedEntity);

    const orderedIdleEntity = orderedEntity.filter(
      idx => idleLocations.has(sessionTable[idx][cIdx])
    );
    orderedIdleEntities.push(orderedIdleEntity);

    const sessionIDs = orderedEntity.map(idx => sessionTable[idx][cIdx]);
    const orderedSession = uniquePreserveOrder(sessionIDs);
    orderedSessions.push(orderedSession);
  }

  return [orderTable, orderedEntities, orderedIdleEntities, orderedSessions];
}

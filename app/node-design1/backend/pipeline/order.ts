/**
 * Ordering Algorithm
 * Barycenter-based crossing reduction for SpreadLine
 */

import { Node, Session, Entity } from '../types/core';
import { sparseArgsort } from '../utils/constructors';

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
    order?: number[][];
  };
  _counts: { numTimestamps: number; numEntities: number };
  getSessionByID(id: number): Session | null;
}

/**
 * Main ordering function
 * Performs crossing reduction using barycenter algorithm
 */
export function ordering(
  liner: SpreadLiner,
  iteration: number = 10
): {
  orderTable: number[][];
  orderedEntities: number[][];
  orderedIdleEntities: number[][];
  orderedSessions: number[][];
} {
  const sessionsPerTimestamp = bundleEntitiesByTimestamp(liner);
  const numTimestamps = liner._counts.numTimestamps;
  const idleLocations = liner.locations.idle;
  const sessionTable = liner._tables.session;

  // Run barycenter iterations
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

  // Build order table
  const [numEntities, _] = liner.span;
  const orderTable: number[][] = Array.from({ length: numEntities }, () =>
    Array(numTimestamps).fill(0)
  );

  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const sessions = sessionsPerTimestamp[cIdx];
    const nodes: Node[] = sessions.flatMap(session => session.entities);
    for (const node of nodes) {
      const rIdx = node.id;
      orderTable[rIdx][cIdx] = node.order + 1; // 1-indexed
    }
  }

  // Build ordered entities
  const orderedEntities: number[][] = [];
  const orderedIdleEntities: number[][] = [];
  const orderedSessions: number[][] = [];

  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const orderedEntity = sparseArgsort(orderTable.map(row => row[cIdx]));
    orderedEntities.push(orderedEntity);

    const orderedIdleEntity = orderedEntity.filter(
      each => idleLocations.has(sessionTable[each][cIdx])
    );
    orderedIdleEntities.push(orderedIdleEntity);

    const sessionIDs = orderedEntity.map(each => sessionTable[each][cIdx]);
    const orderedSession = [...new Set(sessionIDs)];
    orderedSessions.push(orderedSession);
  }

  return { orderTable, orderedEntities, orderedIdleEntities, orderedSessions };
}

/**
 * Bundle entities by timestamp into sessions
 */
function bundleEntitiesByTimestamp(liner: SpreadLiner): Session[][] {
  const sessionTable = liner._tables.session;
  const numTimestamps = liner._counts.numTimestamps;
  const sessionsPerTimestamp: Session[][] = [];
  const idleLocations = liner.locations.idle;
  const names = liner.entities_names;

  for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
    const sessions: Session[] = [];
    const column = sessionTable.map(row => row[cIdx]);
    const uniqueSessionIDs = [...new Set(column)];

    for (const sessionID of uniqueSessionIDs) {
      if (sessionID === 0) continue;

      let session: Session;
      if (!idleLocations.has(sessionID)) {
        const found = liner.getSessionByID(sessionID);
        if (found) {
          session = found;
        } else {
          continue;
        }
      } else {
        // Create idle session on demand
        const entitiesIDs = column
          .map((v, i) => (v === sessionID ? i : -1))
          .filter(i => i >= 0)
          .sort((a, b) => a - b);

        const entities = entitiesIDs.map(
          (id, idx) => new Node(names[id], sessionID, idx, -1, id)
        );
        session = new Session(sessionID, entities, 'idle');
      }
      sessions.push(session);
    }
    sessionsPerTimestamp.push(sessions);
  }

  return sessionsPerTimestamp;
}

/**
 * Constrained crossing reduction
 */
function constrainedCrossingReduction(
  currentSessions: Session[],
  nextSessions: Session[]
): Session[] {
  const currNodes: Node[] = currentSessions.flatMap(s => s.entities);
  const result: Session[] = [];

  for (const session of nextSessions) {
    const constraints = session.constraints;
    if (constraints.length === 0) {
      result.push(session);
      continue;
    }

    const [topTwoHops, sourceGroup, _, targetGroup, bottomTwoHops] = constraints as [
      string[],
      Record<number, string[]>,
      string[],
      Record<number, string[]>,
      string[]
    ];

    // Sort within groups
    let sweepRange: [number, number] = [0, (topTwoHops as string[]).length];
    if ((topTwoHops as string[]).length > 1) {
      withinSort(topTwoHops as string[], session, currNodes, sweepRange);
    }

    for (const [_, group] of Object.entries(sourceGroup as Record<number, string[]>)) {
      sweepRange = [sweepRange[1], sweepRange[1] + group.length];
      if (group.length > 1) withinSort(group, session, currNodes, sweepRange);
    }

    sweepRange = [sweepRange[1], sweepRange[1] + 1]; // ego

    for (const [_, group] of Object.entries(targetGroup as Record<number, string[]>)) {
      sweepRange = [sweepRange[1], sweepRange[1] + group.length];
      if (group.length > 1) withinSort(group, session, currNodes, sweepRange);
    }

    sweepRange = [sweepRange[1], sweepRange[1] + (bottomTwoHops as string[]).length];
    if ((bottomTwoHops as string[]).length > 1) {
      withinSort(bottomTwoHops as string[], session, currNodes, sweepRange);
    }

    result.push(session);
  }

  return barycenterSort(currNodes, nextSessions);
}

/**
 * Sort within a group based on barycenter
 */
function withinSort(
  group: string[],
  session: Session,
  currNodes: Node[],
  sweepRange: [number, number]
): void {
  const nodes = group.map(name => session.findNode(name) as Node).filter(Boolean);
  nodes.sort((a, b) => a.getBarycenterLeaf(currNodes) - b.getBarycenterLeaf(currNodes));
  session.replaceNode(nodes, sweepRange);
}

/**
 * Barycenter sort for sessions
 */
function barycenterSort(currNodes: Node[], nextSessions: Session[]): Session[] {
  for (const session of nextSessions) {
    // Find existing nodes in current timestamp
    const existed = session.entities.map(node => node.findSelf(currNodes)).filter(Boolean);
    const barycenter = existed.reduce((sum, node) => sum + (node?.order ?? 0), 0);
    session.barycenter = barycenter / session.entityWeight;
  }

  nextSessions.sort((a, b) => a.barycenter - b.barycenter);

  // Update orders
  const allNodes: Node[] = nextSessions.flatMap(s => s.entities);
  for (const session of nextSessions) {
    for (const node of session.entities) {
      node.order = allNodes.indexOf(node);
    }
  }

  return nextSessions;
}

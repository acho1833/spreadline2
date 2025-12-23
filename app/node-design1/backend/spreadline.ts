/**
 * SpreadLine - Main Orchestrator Class
 * TypeScript port of Python SpreadLine class
 */

import { Node, Session, Entity } from './types/core';
import { TopologyRow, SpreadLineConfig, GroupsDict } from './types/input';
import { SpreadLineData } from './types/output';
import { getTimeArray, strToDatetime } from './utils/datetime';
import {
  filterTimeByEgo,
  constructEgocentricNetwork,
  findWithinConstraints,
} from './utils/constructors';
import { ordering } from './pipeline/order';
import { aligning } from './pipeline/align';
import { compacting } from './pipeline/compact';
import { rendering } from './pipeline/render';

interface LoadedData {
  topology: TopologyRow[];
  content: Map<string, { posX: number; posY: number }>;
  nodeColor: Map<string, { context: string | number }>;
  lineColor: Record<string, string>;
}

export class SpreadLine {
  // Core data
  private _data: LoadedData = {
    topology: [],
    content: new Map(),
    nodeColor: new Map(),
    lineColor: {},
  };

  // Configuration
  _config: SpreadLineConfig = {
    bandStretch: [],
    squeezeSameCategory: true,
    minimize: 'space',
  };

  // Computed data
  entities: Entity[] = [];
  entities_names: string[] = [];
  sessions: Session[] = [];
  span: [number, number] = [0, 0];
  egoIdx: number = 0;
  effective_timestamps: number[] = [];
  _all_timestamps: string[] = [];
  _groups: GroupsDict = {};

  // Tables
  _tables: {
    session: number[][];
    presence: number[][];
    order: number[][];
    height: number[][];
    crossing: number[][];
  } = {
    session: [],
    presence: [],
    order: [],
    height: [],
    crossing: [],
  };

  // Counts
  _counts: { numTimestamps: number; numEntities: number } = {
    numTimestamps: 0,
    numEntities: 0,
  };

  // Locations
  locations: { contact: number[]; idle: Set<number> } = {
    contact: [],
    idle: new Set(),
  };

  // Alias for line_color
  get _line_color(): Record<string, string> {
    return this._data.lineColor;
  }

  // Alias for node_color
  get _node_color(): Map<string, { context: string | number }> {
    return this._data.nodeColor;
  }

  // Context
  get context(): { layout: Map<string, { posX: number; posY: number }> } {
    return { layout: this._data.content };
  }

  /**
   * Load topology data
   */
  loadTopology(
    data: TopologyRow[],
    config: { source?: string; target?: string; time?: string; weight?: string } = {}
  ): this {
    // Rename columns if config provided
    const topology = data.map(row => ({
      source: row[config.source as keyof TopologyRow] as string ?? row.source,
      target: row[config.target as keyof TopologyRow] as string ?? row.target,
      time: row[config.time as keyof TopologyRow] as string ?? row.time,
      weight: row[config.weight as keyof TopologyRow] as number ?? row.weight ?? 1,
    }));
    this._data.topology = topology;
    return this;
  }

  /**
   * Load line color data
   */
  loadLineColor(data: { entity: string; color: string }[]): this {
    for (const row of data) {
      this._data.lineColor[row.entity] = row.color;
    }
    return this;
  }

  /**
   * Load node color data
   */
  loadNodeColor(data: { time: string; entity: string; context: string | number }[]): this {
    for (const row of data) {
      const key = `${row.time},${row.entity}`;
      this._data.nodeColor.set(key, { context: row.context });
    }
    return this;
  }

  /**
   * Load content/layout data
   */
  loadContent(data: { id: string; timestamp?: string; posX: number; posY: number }[]): this {
    for (const row of data) {
      const key = `${row.id},${row.timestamp ?? ''}`;
      this._data.content.set(key, { posX: row.posX, posY: row.posY });
    }
    return this;
  }

  /**
   * Center the visualization on an ego
   */
  center(
    ego: string,
    timeExtents: [string, string],
    options: {
      timeDelta?: 'day' | 'year';
      timeFormat?: string;
      groups?: GroupsDict;
    } = {}
  ): this {
    const { timeDelta = 'year', timeFormat = '%Y', groups = {} } = options;

    // Generate time array
    this._all_timestamps = getTimeArray(timeExtents, timeDelta, timeFormat);
    this._groups = groups;

    // Filter and construct egocentric network
    let topology = filterTimeByEgo(ego, this._data.topology);
    topology = constructEgocentricNetwork(ego, topology);

    // Build entities
    const entityNames = new Set<string>();
    for (const row of topology) {
      entityNames.add(row.source);
      entityNames.add(row.target);
    }
    this.entities_names = Array.from(entityNames);
    this.egoIdx = this.entities_names.indexOf(ego);

    // Initialize entities
    this.entities = this.entities_names.map(
      (name, idx) => new Entity(name, [], idx)
    );

    // Construct sessions
    this._constructSessions(ego, topology);

    // Build tables
    this._constructTables();

    return this;
  }

  /**
   * Configure optimization parameters
   */
  configure(config: Partial<SpreadLineConfig>): this {
    this._config = { ...this._config, ...config };
    return this;
  }

  /**
   * Run the optimization pipeline and generate visualization data
   */
  fit(size: { width: number; height: number } = { width: 1200, height: 600 }): SpreadLineData {
    // Phase 1: Ordering
    const { orderTable, orderedEntities, orderedIdleEntities, orderedSessions } = ordering(this);
    this._tables.order = orderTable;

    // Phase 2: Aligning
    const { alignTable, sessionAlignTable } = aligning(this, orderedEntities, orderedIdleEntities);

    // Phase 3: Compacting
    const { heightTable, sideTable } = compacting(this, orderedEntities, orderedSessions, sessionAlignTable);
    this._tables.height = heightTable;
    this._tables.crossing = sideTable;

    // Phase 4: Rendering
    const result = rendering(size, this);

    return result;
  }

  /**
   * Get session by ID
   */
  getSessionByID(id: number): Session | null {
    return this.sessions.find(s => s.id === id) ?? null;
  }

  /**
   * Construct sessions from topology
   */
  private _constructSessions(ego: string, topology: TopologyRow[]): void {
    // Group by time
    const byTime = new Map<string, TopologyRow[]>();
    for (const row of topology) {
      const time = typeof row.time === 'string' ? row.time : row.time.toString();
      if (!byTime.has(time)) {
        byTime.set(time, []);
      }
      byTime.get(time)!.push(row);
    }

    const sessions: Session[] = [];
    const effectiveTimestamps: number[] = [];
    let sessionIdCounter = 1;

    for (const [time, entries] of byTime) {
      const timestamp = this._all_timestamps.indexOf(time);
      if (timestamp === -1) continue;

      effectiveTimestamps.push(timestamp);

      // Find constraints and hops
      const [constraints, hops] = findWithinConstraints(entries, ego, this._data.lineColor);

      // Build session entities
      const entityOrder = hops.flat();
      const nodes = entityOrder.map((name, order) =>
        new Node(name, sessionIdCounter, order, timestamp, this.entities_names.indexOf(name))
      );

      // Build links
      const links: [string, string, number][] = entries.map(row => [
        row.source,
        row.target,
        row.weight,
      ]);

      const session = new Session(sessionIdCounter, nodes, 'contact', timestamp);
      session.set({ hops, links, constraints });
      sessions.push(session);

      sessionIdCounter++;
    }

    this.sessions = sessions;
    this.effective_timestamps = effectiveTimestamps.sort((a, b) => a - b);

    // Set span
    this._counts = {
      numEntities: this.entities_names.length,
      numTimestamps: this.effective_timestamps.length,
    };
    this.span = [this._counts.numEntities, this._counts.numTimestamps];
  }

  /**
   * Construct session and presence tables
   */
  private _constructTables(): void {
    const [numEntities, numTimestamps] = this.span;

    // Initialize tables
    const sessionTable: number[][] = Array.from({ length: numEntities }, () =>
      Array(numTimestamps).fill(0)
    );
    const presenceTable: number[][] = Array.from({ length: numEntities }, () =>
      Array(numTimestamps).fill(0)
    );

    // Track which session IDs are idle
    let idleSessionId = this.sessions.length + 1;
    const idleLocations = new Set<number>();

    // Fill from contact sessions
    for (const session of this.sessions) {
      const cIdx = this.effective_timestamps.indexOf(session.timestamp);
      if (cIdx === -1) continue;

      for (const node of session.entities) {
        const rIdx = node.id;
        sessionTable[rIdx][cIdx] = session.id;
        presenceTable[rIdx][cIdx] = 1; // contact
      }
    }

    // Fill idle sessions for entities present in effective timestamps
    for (let rIdx = 0; rIdx < numEntities; rIdx++) {
      const firstPresence = presenceTable[rIdx].findIndex(p => p === 1);
      const lastPresence = presenceTable[rIdx].length - 1 - [...presenceTable[rIdx]].reverse().findIndex(p => p === 1);

      if (firstPresence === -1) continue;

      for (let cIdx = firstPresence; cIdx <= lastPresence; cIdx++) {
        if (presenceTable[rIdx][cIdx] === 0) {
          // Idle session
          sessionTable[rIdx][cIdx] = idleSessionId;
          presenceTable[rIdx][cIdx] = -1; // idle
          idleLocations.add(idleSessionId);
          idleSessionId++;
        }
      }
    }

    // Build entity timelines
    for (let rIdx = 0; rIdx < numEntities; rIdx++) {
      this.entities[rIdx].timeline = sessionTable[rIdx];
    }

    this._tables.session = sessionTable;
    this._tables.presence = presenceTable;
    this.locations = {
      contact: this.sessions.map(s => s.id),
      idle: idleLocations,
    };
  }
}

/**
 * Create a SpreadLine instance from CSV data
 */
export function createSpreadLine(
  topology: TopologyRow[],
  options: {
    ego: string;
    timeExtents: [string, string];
    timeDelta?: 'day' | 'year';
    timeFormat?: string;
    lineColor?: { entity: string; color: string }[];
    nodeColor?: { time: string; entity: string; context: string | number }[];
    content?: { id: string; timestamp?: string; posX: number; posY: number }[];
    groups?: GroupsDict;
    config?: Partial<SpreadLineConfig>;
  }
): SpreadLine {
  const sl = new SpreadLine();

  sl.loadTopology(topology);

  if (options.lineColor) {
    sl.loadLineColor(options.lineColor);
  }

  if (options.nodeColor) {
    sl.loadNodeColor(options.nodeColor);
  }

  if (options.content) {
    sl.loadContent(options.content);
  }

  sl.center(options.ego, options.timeExtents, {
    timeDelta: options.timeDelta,
    timeFormat: options.timeFormat,
    groups: options.groups,
  });

  if (options.config) {
    sl.configure(options.config);
  }

  return sl;
}

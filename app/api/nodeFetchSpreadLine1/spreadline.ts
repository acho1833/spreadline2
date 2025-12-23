/**
 * SpreadLine Main Class
 * Converted from Python: SpreadLine/spreadline.py
 *
 * Main orchestrator for the visualization pipeline.
 */

import {
  Entity, Node, Session,
  TopoRow, ContentLayoutRow, NodeColorRow,
  SpreadLineConfig, ContentConfigState, Tables, Locations, Counts,
  RenderOutput
} from './types';
import {
  strToDatetime, datetimeToStr, getTimeArray,
  checkValidity, full2D, uniqueColumns
} from './helpers';
import {
  filterTimeByEgo, constructEgocentricNetwork, findWithinConstraints
} from './constructors';
import { ordering } from './order';
import { aligning } from './align';
import { compacting } from './compact';
import { contextualizing } from './contextualize';
import { rendering } from './render';

export class SpreadLine {
  // Topology data
  private _topo: TopoRow[] = [];
  private _groups: Record<string, string[][]> = {};

  // Content data
  private _node_color: NodeColorRow[] = [];
  private _content: ContentLayoutRow[] | null = null;
  private _content_config: ContentConfigState = { dynamic: true, generated: true };
  private _line_color: Record<string, string> = {};

  // Time handling
  private time_format: string = '';
  private _all_timestamps: string[] = [];

  // Session locations
  private locations: Locations = { contact: [], idle: new Set() };

  // Entity data
  public ego: string = '';
  public egoIdx: number = -1;
  public entities: Entity[] = [];
  public entities_names: string[] = [];
  public sessions: Session[] = [];

  // Context and layout
  public context: { layout: Map<string, any> } = { layout: new Map() };

  // Timestamps and tables
  public effective_timestamps: number[] = [];
  private _tables: Tables = { session: [], presence: [] };
  public span: [number, number] = [0, 0];

  private _counts: Counts = {
    numAllTimestamps: 0,
    numTimestamps: 0,
    numEntities: 0
  };

  private _config: SpreadLineConfig = {
    bandStretch: [],
    squeezeSameCategory: false,
    minimize: 'space'
  };

  // Helper methods
  getSessionByID(id: number): Session | null {
    for (const session of this.sessions) {
      if (session.id === id) return session;
    }
    return null;
  }

  getEntityByName(name: string): Entity | null {
    for (const entity of this.entities) {
      if (entity.name === name) return entity;
    }
    return null;
  }

  /**
   * Load data into SpreadLine
   */
  load(
    data: any[] | string,
    config: Record<string, string>,
    key: 'topology' | 'content' | 'node' | 'line' = 'topology'
  ): void {
    let recipient: any[] = [];

    if (Array.isArray(data)) {
      recipient = data;
    } else if (typeof data === 'string') {
      throw new Error('String file paths not supported in browser. Pass data array directly.');
    }

    if (key === 'topology') {
      this._topo = checkValidity(recipient, config, ['time', 'source', 'target', 'weight']);
      return;
    }

    if (key === 'content') {
      if (!['timestamp', 'id', 'posX', 'posY'].every(k => k in config)) {
        throw new Error('Unmatched keys in the config');
      }

      const configCopy = { ...config };

      if (configCopy.timestamp === '') {
        this._content_config.dynamic = false;
        delete configCopy.timestamp;
      }

      if (configCopy.posX === '' && configCopy.posY === '') {
        this._content_config.generated = false;
        delete configCopy.posX;
        delete configCopy.posY;
      }

      // Rename columns
      const invConfig: Record<string, string> = {};
      for (const [k, v] of Object.entries(configCopy)) {
        if (v) invConfig[v] = k;
      }

      this._content = recipient.map(row => {
        const newRow: any = {};
        for (const [col, value] of Object.entries(row)) {
          const newCol = invConfig[col] || col;
          newRow[newCol] = value;
        }
        return newRow;
      });

      // Deduplicate
      const seen = new Set<string>();
      this._content = this._content.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return;
    }

    if (key === 'node') {
      this._node_color = checkValidity(recipient, config, ['time', 'entity', 'context']);
      return;
    }

    if (key === 'line') {
      const validated = checkValidity(recipient, config, ['entity', 'color']);
      for (const row of validated) {
        this._line_color[row.entity] = row.color;
      }
      return;
    }

    throw new Error('Not supported key type');
  }

  /**
   * Center the visualization on an ego entity
   */
  center(
    ego: string,
    timeExtents: [string, string] | null = null,
    timeDelta: string = 'day',
    timeFormat: string = '%Y-%m-%d',
    groups: Record<string, string[][]> = {}
  ): void {
    this.time_format = timeFormat;
    this.ego = ego;
    this._groups = groups;

    // Convert time strings to Date objects
    this._topo = this._topo.map(row => ({
      ...row,
      time: strToDatetime(String(row.time), timeFormat)
    }));

    // Filter to times where ego appears
    this._topo = filterTimeByEgo(ego, this._topo);

    // Determine time extents
    if (!timeExtents) {
      const times = this._topo.map(row => row.time as Date);
      const minTime = new Date(Math.min(...times.map(t => t.getTime())));
      const maxTime = new Date(Math.max(...times.map(t => t.getTime())));
      timeExtents = [
        datetimeToStr(minTime, timeFormat),
        datetimeToStr(maxTime, timeFormat)
      ];
    }

    // Generate all timestamps
    this._all_timestamps = getTimeArray(timeExtents, timeDelta, timeFormat);
    this._counts.numAllTimestamps = this._all_timestamps.length;

    const timeArray = this._all_timestamps.map(t => strToDatetime(t, timeFormat));

    // Filter topology within time range
    const topoWithinTime = this._topo.filter(row => {
      const time = row.time as Date;
      const start = strToDatetime(timeExtents![0], timeFormat);
      const end = strToDatetime(timeExtents![1], timeFormat);
      return time >= start && time <= end;
    });

    // Construct egocentric network
    const network = constructEgocentricNetwork(this.ego, topoWithinTime);

    // Construct entities
    this._constructEntities(network);

    // Construct sessions
    const sessions = this._constructContactSessions(network, timeArray);
    this.locations.contact = sessions.map(s => s.id);

    // Construct timelines and idle sessions
    this._constructTimelinesIdleSessions(sessions);

    // Construct tables
    this._constructTables();
    this.egoIdx = this.entities_names.indexOf(this.ego);
  }

  /**
   * Configure optimization parameters
   */
  configure(config: Partial<SpreadLineConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Construct entities from network
   * NOTE: Python uses pd.concat([source, target]).unique() which adds ALL sources first,
   * then ALL targets. We must match this order exactly.
   */
  private _constructEntities(network: TopoRow[]): void {
    const entityNames = new Set<string>();
    // First add all sources (matches Python's pd.concat behavior)
    for (const row of network) {
      entityNames.add(row.source);
    }
    // Then add all targets
    for (const row of network) {
      entityNames.add(row.target);
    }
    this.entities_names = Array.from(entityNames);

    this.entities = this.entities_names.map((name, idx) => {
      const timeline: number[] = new Array(this._counts.numAllTimestamps).fill(0);
      return new Entity(name, timeline, idx);
    });

    this._counts.numEntities = this.entities.length;
  }

  /**
   * Construct contact sessions from network
   */
  private _constructContactSessions(network: TopoRow[], timeArray: Date[]): Session[] {
    let sessionID = 0;
    const sessions: Session[] = [];
    const names = this.entities_names;

    for (let tIdx = 0; tIdx < timeArray.length - 1; tIdx++) {
      const time = timeArray[tIdx];
      const nextTime = timeArray[tIdx + 1];

      // Filter entries in this time range
      const entries = network.filter(row => {
        const rowTime = row.time as Date;
        return rowTime >= time && rowTime < nextTime;
      });

      if (entries.length === 0) continue;

      sessionID++;
      const count = entries.reduce((sum, row) => sum + row.weight, 0);
      const arcs: [string, string, number][] = entries.map(row => [row.source, row.target, row.weight]);

      // Get groups or compute constraints
      const groupsForTime = this._groups[this._all_timestamps[tIdx]];
      let constraints: any[];
      let order: string[][];

      if (groupsForTime && groupsForTime.length > 0) {
        const groups = groupsForTime.map(g => [...g]);
        order = groups;
        constraints = [
          groups[0],
          groups[1].length ? { 1: groups[1] } : {},
          groups[2],
          groups[3].length ? { 1: groups[3] } : {},
          groups[4]
        ];
      } else {
        [constraints, order] = findWithinConstraints(entries, this.ego, this._line_color);
      }

      // Create nodes for each entity
      const entityNames = order.flat();
      const entitiesIDs = entityNames.map(name => names.indexOf(name));
      const nodes = entitiesIDs.map((id, idx) =>
        new Node(names[id], sessionID, idx, -1, id)
      );

      const indices = entries.map((_, i) => i);
      const session = new Session(sessionID, nodes, 'contact', tIdx, count, indices);
      session.set(order, arcs, constraints);
      sessions.push(session);
    }

    this.sessions = sessions;
    return sessions;
  }

  /**
   * Construct timelines and idle sessions
   */
  private _constructTimelinesIdleSessions(sessions: Session[]): void {
    let idleID = sessions.length + 1;
    const idleLoc = new Set<number>();

    for (const session of sessions) {
      const cIdx = session.timestamp;
      const sessionID = session.id;
      const sessionNames = session.printEntities();

      for (const node of session.entities) {
        const entity = this.getEntityByName(node.name);
        if (!entity) continue;

        const timeline = entity.timeline;

        if (timeline.every(v => v === 0)) {
          // Initialize
          (timeline as number[])[cIdx] = sessionID;
          entity.timeline = timeline;
          continue;
        }

        // Find last non-zero index
        let lastIdx = -1;
        for (let i = timeline.length - 1; i >= 0; i--) {
          if (timeline[i] !== 0) {
            lastIdx = i;
            break;
          }
        }

        timeline[cIdx] = sessionID;

        // Fill gap with idle session
        if (cIdx - lastIdx > 1) {
          for (let i = lastIdx + 1; i < cIdx; i++) {
            timeline[i] = idleID;
          }
          idleLoc.add(idleID);
          idleID++;
        }
      }
    }

    this.locations.idle = idleLoc;
  }

  /**
   * Construct session and presence tables
   */
  private _constructTables(): void {
    // Build timeline matrix
    const timelines: number[][] = this.entities.map(e => [...e.timeline]);

    // Remove last column (used for aggregation)
    const timelinesTrimmed = timelines.map(row => row.slice(0, -1));

    // Find unique columns and their indices
    const { indices: uniqueIndices } = uniqueColumns(timelinesTrimmed);
    uniqueIndices.sort((a, b) => a - b);

    // Extract unique columns to form session table
    const sessionTable = timelinesTrimmed.map(row =>
      uniqueIndices.map(idx => row[idx])
    );

    // Update entity timelines
    for (const entity of this.entities) {
      entity.timeline = sessionTable[entity.id];
    }

    this.span = [sessionTable.length, sessionTable[0].length];

    // Build presence table
    const presenceTable = full2D(this.span[0], this.span[1], 0);
    const idleSessions = this.locations.idle;

    for (let rIdx = 0; rIdx < this.span[0]; rIdx++) {
      for (let cIdx = 0; cIdx < this.span[1]; cIdx++) {
        const sessionID = sessionTable[rIdx][cIdx];
        if (sessionID !== 0) {
          if (idleSessions.has(sessionID)) {
            presenceTable[rIdx][cIdx] = -1;
          } else {
            presenceTable[rIdx][cIdx] = 1;
          }
        }
      }
    }

    this.effective_timestamps = uniqueIndices;
    this._tables = { session: sessionTable, presence: presenceTable };
    this._counts.numTimestamps = this.effective_timestamps.length;
  }

  /**
   * Run the pipeline and generate visualization
   */
  fit(width: number = 1400, height: number = 500): RenderOutput {
    // Step 1: Ordering
    const [orderTable, orderedEntities, orderedIdleEntities, orderedSessions] = ordering({
      span: this.span,
      _counts: this._counts,
      locations: this.locations,
      _tables: this._tables,
      sessions: this.sessions,
      entities: this.entities,
      entities_names: this.entities_names,
      egoIdx: this.egoIdx,
      getSessionByID: this.getSessionByID.bind(this)
    });
    this._tables.order = orderTable;

    // Step 2: Aligning
    const [alignTable, sessionAlignTable] = aligning(
      {
        span: this.span,
        egoIdx: this.egoIdx,
        entities: this.entities,
        entities_names: this.entities_names,
        locations: this.locations,
        _tables: this._tables,
        getSessionByID: this.getSessionByID.bind(this)
      },
      orderedEntities,
      orderedIdleEntities
    );
    this._tables.align = alignTable;

    // Step 3: Compacting
    const [heightTable, sideTable] = compacting(
      {
        span: this.span,
        egoIdx: this.egoIdx,
        entities: this.entities,
        entities_names: this.entities_names,
        locations: this.locations,
        _tables: this._tables,
        _line_color: this._line_color,
        _config: this._config,
        _groups: this._groups,
        effective_timestamps: this.effective_timestamps,
        _all_timestamps: this._all_timestamps,
        getSessionByID: this.getSessionByID.bind(this)
      },
      orderedEntities,
      orderedSessions,
      sessionAlignTable
    );
    this._tables.height = heightTable;
    this._tables.crossing = sideTable;

    // Step 4: Contextualizing
    const context = contextualizing({
      entities_names: this.entities_names,
      sessions: this.sessions,
      _all_timestamps: this._all_timestamps,
      _content: this._content,
      _content_config: this._content_config,
      ego: this.ego
    });
    this.context = context;

    // Step 5: Rendering
    const size = { width, height };
    const result = rendering(size, {
      span: this.span,
      egoIdx: this.egoIdx,
      entities: this.entities,
      entities_names: this.entities_names,
      locations: this.locations,
      _tables: this._tables,
      _line_color: this._line_color,
      _config: this._config,
      _all_timestamps: this._all_timestamps,
      effective_timestamps: this.effective_timestamps,
      sessions: this.sessions,
      _node_color: this._node_color,
      context: this.context,
      getSessionByID: this.getSessionByID.bind(this)
    });

    return result;
  }
}

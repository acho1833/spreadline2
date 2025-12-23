/**
 * SpreadLine TypeScript Type Definitions
 * Converted from Python: SpreadLine/utils/types.py
 *
 * These types define the core data structures used throughout the SpreadLine pipeline.
 */

// ============================================================================
// MATHEMATICAL CONSTANTS (from types.py)
// ============================================================================
export const TAU = 2 * Math.PI;
export const EPSILON = 1e-6;
export const TAU_EPSILON = TAU - EPSILON;

// ============================================================================
// PATH CLASS - SVG Path Generator (D3.js compatible)
// ============================================================================
export class Path {
  private startX: number | null = null;
  private startY: number | null = null;
  private endX: number | null = null;
  private endY: number | null = null;
  private str: string = '';
  private curve: number = 0.5;

  toString(): string {
    return this.str;
  }

  moveTo(x: number, y: number): Path {
    this.startX = +x;
    this.startY = +y;
    this.endX = +x;
    this.endY = +y;
    this.str += `M${+x},${+y}`;
    return this;
  }

  lineTo(x: number, y: number): Path {
    this.endX = +x;
    this.endY = +y;
    this.str += `L${this.endX}, ${this.endY}`;
    return this;
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): Path {
    this.endX = +x;
    this.endY = +y;
    this.str += `Q${+x1}, ${+y1}, ${this.endX}, ${this.endY}`;
    return this;
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): Path {
    this.endX = +x;
    this.endY = +y;
    this.str += `C${+x1}, ${+y1}, ${+x2}, ${+y2}, ${this.endX}, ${this.endY}`;
    return this;
  }

  horizontalEaseCurveTo(x: number, y: number): Path {
    this.bezierCurveTo(
      this.endX! * (1 - this.curve) + x * this.curve, this.endY!,
      this.endX! * this.curve + x * (1 - this.curve), y,
      x, y
    );
    return this;
  }

  easeCurveTo(x: number, y: number): Path {
    let c0x = this.endX!;
    let c0y = this.endY!;
    let c1x = x;
    let c1y = y;
    if ((x - this.endX!) * (y - this.endY!) > 0) {
      c0y = this.endY! * (1 - this.curve) + y * this.curve;
      c1x = this.endX! * this.curve + x * (1 - this.curve);
    } else {
      c0x = this.endX! * (1 - this.curve) + x * this.curve;
      c1y = this.endY! * this.curve + y * (1 - this.curve);
    }
    this.bezierCurveTo(c0x, c0y, c1x, c1y, x, y);
    return this;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, ccw: number = 0): Path {
    x = +x;
    y = +y;
    radius = +radius;
    ccw = ~~ccw; // Bitwise NOT NOT converts to int

    if (radius < 0) throw new Error(`Negative radius: ${radius}`);

    const dx = radius * Math.cos(startAngle);
    const dy = radius * Math.sin(startAngle);
    const x0 = x + dx;
    const y0 = y + dy;
    const cw = 1 ^ ccw;
    let da = ccw === 0 ? endAngle - startAngle : startAngle - endAngle;

    if (this.endX === null) {
      this.str += `M${x0}, ${y0}`;
    } else if (Math.abs(this.endX - x0) > EPSILON || Math.abs(this.endY! - y0) > EPSILON) {
      this.str += `L${x0}, ${y0}`;
    }

    // IMPORTANT: Match Python's behavior exactly
    if (da < 0) da = da % TAU;

    if (da > TAU_EPSILON) {
      // Complete circle
      this.endX = x0;
      this.endY = y0;
      this.str += `A${radius},${radius},0,1,${cw},${x - dx},${y - dy}`;
      this.str += `A${radius},${radius},0,1,${cw},${this.endX},${this.endY}`;
    } else if (da > EPSILON) {
      // Arc
      this.endX = x + radius * Math.cos(endAngle);
      this.endY = y + radius * Math.sin(endAngle);
      this.str += `A${radius},${radius},0,${da >= Math.PI ? 1 : 0},${cw},${this.endX},${this.endY}`;
    }
    return this;
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): Path {
    x1 = +x1;
    y1 = +y1;
    x2 = +x2;
    y2 = +y2;
    r = +r;

    const x0 = this.endX;
    const y0 = this.endY;
    const x21 = x2 - x1;
    const y21 = y2 - y1;
    const x01 = x0! - x1;
    const y01 = y0! - y1;
    const r01 = x01 ** 2 + y01 ** 2;

    if (this.endX === null) {
      this.str += `M${x1},${y1}`;
      this.endX = x1;
      this.endY = y1;
      return this;
    } else if (r01 <= EPSILON) {
      return this;
    } else if (Math.abs(y01 * x21 - y21 * x01) <= EPSILON || r === 0) {
      this.str += `L${x1},${y1}`;
      this.endX = x1;
      this.endY = y1;
      return this;
    }

    const x20 = x2 - x0!;
    const y20 = y2 - y0!;
    const r21 = x21 ** 2 + y21 ** 2;
    const r20 = x20 ** 2 + y20 ** 2;
    const length = r * Math.tan((Math.PI - Math.acos((r21 + r01 - r20) / (2 * Math.sqrt(r21) * Math.sqrt(r01)))) / 2);
    const t01 = length / Math.sqrt(r01);
    const t21 = length / Math.sqrt(r21);

    if (Math.abs(t01 - 1) > EPSILON) {
      this.str += `L${x1 + t01 * x01}, ${y1 + t01 * y01}`;
    }

    this.str += `A${r},${r},0,0,${y01 * x20 > x01 * y20 ? 1 : 0},${x1 + t21 * x21},${y1 + t21 * y21}`;
    this.endX = x1 + t21 * x21;
    this.endY = y1 + t21 * y21;
    return this;
  }
}

// ============================================================================
// NODE CLASS - Represents an entity at a specific timestep
// ============================================================================
export class Node {
  name: string;
  id: number;
  sessionID: number;
  timestamp: number;
  order: number;

  constructor(name: string = '', sessionID: number = 0, order: number = 0, time: number = -1, index: number = -1) {
    this.name = name;
    this.id = index;
    this.sessionID = sessionID;
    this.timestamp = time;
    this.order = order;
  }

  toString(): string {
    return this.name;
  }

  getBarycenterLeaf(nodes: Node[]): number {
    const prevNode = this.findSelf(nodes);
    if (prevNode) {
      return prevNode.order;
    }
    return this.order;
  }

  findSelf(nodes: Node[]): Node | null {
    for (const each of nodes) {
      if (each.name === this.name) {
        return each;
      }
    }
    return null;
  }
}

// ============================================================================
// ENTITY CLASS - Timeline of session involvement for a network actor
// ============================================================================
export class Entity {
  id: number;
  name: string;
  timeline: number[]; // Session IDs at each timestamp

  constructor(name: string = '', timeline: number[] = [], index: number = -1) {
    this.id = index;
    this.name = name;
    this.timeline = timeline;
  }

  setTimeline(timeline: number[]): void {
    this.timeline = timeline;
  }

  getAtTimestamp(time: number): number {
    return this.timeline[time];
  }

  getName(): string {
    return this.name;
  }
}

// ============================================================================
// SESSION CLASS - Snapshot of interactions at one timestamp
// ============================================================================
export class Session {
  id: number;
  entities: Node[];
  entityWeight: number;
  constraints: any[];
  type: 'contact' | 'idle';
  weight: number;
  indices: number[];
  timestamp: number;
  hops: string[][]; // [[top-2-hop], [1-hop-source], [ego], [1-hop-target], [bottom-2-hop]]
  links: [string, string, number][];
  barycenter: number;

  constructor(
    sessionID: number = 0,
    entities: Node[] = [],
    form: 'contact' | 'idle' = 'contact',
    timestamp: number = -1,
    weight: number = 0,
    indices: number[] = []
  ) {
    this.id = sessionID;
    this.entities = entities;
    this.entityWeight = entities.length;
    this.constraints = [];
    this.type = form;
    this.weight = weight;
    this.indices = indices;
    this.timestamp = timestamp;
    this.hops = [];
    this.links = [];
    this.barycenter = 0;
  }

  printEntities(): string[] {
    return this.entities.map(entity => entity.toString());
  }

  getIdentity(name: string): number {
    for (let idx = 0; idx < this.hops.length; idx++) {
      if (this.hops[idx].includes(name)) return idx;
    }
    return -1;
  }

  add(name: string): void {
    // Note: This adds a name but doesn't create a proper Node
    // This may need adjustment based on usage
    this.entityWeight += 1;
  }

  findNode(name: string, returnSession: boolean = false, returnIndex: boolean = false): Node | Session | number | null {
    for (let idx = 0; idx < this.entities.length; idx++) {
      const each = this.entities[idx];
      if (each.name === name) {
        if (returnSession) return this;
        if (returnIndex) return idx;
        return each;
      }
    }
    return null;
  }

  set(hops: string[][] = [], links: [string, string, number][] = [], constraints: any[] = []): void {
    if (hops.length !== 0) this.hops = hops;
    if (links.length !== 0) this.links = links;
    if (constraints.length !== 0) this.constraints = constraints;
  }

  getEntityIDs(): number[] {
    return this.entities.map(node => node.id);
  }

  replaceNode(nodes: Node[], sweepRange: [number, number]): void {
    const [startIdx, endIdx] = sweepRange;
    for (let idx = startIdx; idx < endIdx; idx++) {
      this.entities[idx] = nodes[idx - startIdx];
    }
  }

  getEntityIDsAtTimestamp(time: number): number[] {
    const result: number[] = [];
    for (const each of this.entities) {
      if (each.timestamp !== time) continue;
      result.push(each.id);
    }
    return result;
  }

  setHops(hops: string[][]): void {
    this.hops = hops;
  }

  setLinks(links: [string, string, number][]): void {
    this.links = links;
  }

  setConstraints(constraints: any[]): void {
    this.constraints = constraints;
  }
}

// ============================================================================
// DATA STRUCTURE INTERFACES
// ============================================================================

// Raw CSV row interfaces
export interface RelationRow {
  year: string | number;
  source: string;
  target: string;
  id: string;
  type?: string;
  citationcount?: number;
  count?: number;
}

export interface EntityRow {
  name: string;
  year: string | number;
  citationcount?: number;
  affiliation?: string;
}

export interface CitationRow {
  name: string;
  year: string | number;
  citationcount: number;
  affiliation?: string;
  paperID: string;
}

export interface ContentRow {
  year?: string | number;
  name: string;
  posX: number;
  posY: number;
}

export interface ReferenceRow {
  [key: string]: any;
}

// Topology row after config mapping
export interface TopoRow {
  source: string;
  target: string;
  time: Date | string;
  weight: number;
  [key: string]: any;
}

// Node color row
export interface NodeColorRow {
  time: string;
  entity: string;
  context: number | string;
}

// Line color entry
export interface LineColorEntry {
  entity: string;
  color: string;
}

// Content layout row
export interface ContentLayoutRow {
  id: string;
  timestamp?: string | number;
  posX: number;
  posY: number;
}

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

export interface TopoConfig {
  source: string;
  target: string;
  time: string;
  weight: string;
}

export interface ContentConfig {
  timestamp: string;
  id: string;
  posX: string;
  posY: string;
}

export interface NodeConfig {
  time: string;
  entity: string;
  context: string;
}

export interface LineConfig {
  entity: string;
  color: string;
}

export interface SpreadLineConfig {
  bandStretch: [string, string][];
  squeezeSameCategory: boolean;
  minimize: 'space' | 'wiggles' | 'line';
}

export interface ContentConfigState {
  dynamic: boolean;
  generated: boolean;
}

// ============================================================================
// RENDER OUTPUT INTERFACES
// ============================================================================

export interface TimeLabel {
  label: string;
  posX: number;
}

export interface Mark {
  posX: number;
  posY: number;
  name: string;
  size: number;
  visibility?: 'visible' | 'hidden';
}

export interface LabelInfo {
  posX: number;
  posY: number;
  textAlign: 'start' | 'end';
  line: string;
  label: string;
  name?: string;
  visibility?: 'visible' | 'hidden';
}

export interface InlineLabel {
  posX: number;
  posY: number;
  name: string;
}

export interface Storyline {
  name: string;
  lines: string[];
  marks: Mark[];
  label: LabelInfo;
  inlineLabels: InlineLabel[];
  color: string;
  id: number;
  lifespan: number;
  crossingCheck: boolean;
}

export interface BlockPoint {
  id: number;
  posX: number;
  posY: number;
  name: string;
  group: number;
  aggregateGroup: number;
  scaleX: number;
  scaleY: number;
  label: string | number;
  visibility: 'visible' | 'hidden';
}

export interface BlockOutline {
  top: string;
  bottom: string;
  left: string;
  right: string;
  button: {
    posX: number;
    posY: number;
    width: number;
    height: number;
  };
}

export interface Block {
  id: number;
  time: string;
  names: string[];
  points: BlockPoint[];
  relations: [number, number][];
  outline: BlockOutline;
  moveX: number;
  topPosY: number;
}

export interface RenderOutput {
  bandWidth: number;
  blockWidth: number;
  ego: string;
  timeLabels: TimeLabel[];
  heightExtents: [number, number];
  storylines: Storyline[];
  blocks: Block[];
  mode?: string;
  reference?: any[];
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export type NumberMatrix = number[][];
export type ObjectMatrix = any[][];

export interface Tables {
  session: NumberMatrix;
  presence: NumberMatrix;
  order?: NumberMatrix;
  align?: NumberMatrix;
  height?: NumberMatrix;
  crossing?: number[];
}

// ============================================================================
// LOCATIONS TYPE
// ============================================================================

export interface Locations {
  contact: number[];
  idle: Set<number>;
}

// ============================================================================
// COUNTS TYPE
// ============================================================================

export interface Counts {
  numAllTimestamps: number;
  numTimestamps: number;
  numEntities: number;
}

// ============================================================================
// GROUP ASSIGNMENT TYPE
// ============================================================================

export type GroupAssign = Record<string, (string | Set<string>)[]>;

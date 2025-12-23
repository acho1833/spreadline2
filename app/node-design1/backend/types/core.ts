/**
 * SpreadLine Core Data Structures
 * TypeScript port of Python types.py
 */

const TAU = 2 * Math.PI;
const EPSILON = 1e-6;
const TAU_EPSILON = TAU - EPSILON;

/**
 * Path class - D3-style SVG path generator
 * Generates SVG path strings with moveTo, lineTo, bezierCurveTo, arc, etc.
 */
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

  moveTo(x: number, y: number): this {
    this.startX = +x;
    this.startY = +y;
    this.endX = +x;
    this.endY = +y;
    this.str += `M${+x},${+y}`;
    return this;
  }

  lineTo(x: number, y: number): this {
    this.endX = +x;
    this.endY = +y;
    this.str += `L${this.endX}, ${this.endY}`;
    return this;
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): this {
    this.endX = +x;
    this.endY = +y;
    this.str += `Q${+x1}, ${+y1}, ${this.endX}, ${this.endY}`;
    return this;
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    this.endX = +x;
    this.endY = +y;
    this.str += `C${+x1}, ${+y1}, ${+x2}, ${+y2}, ${this.endX}, ${this.endY}`;
    return this;
  }

  horizontalEaseCurveTo(x: number, y: number): this {
    const endX = this.endX ?? 0;
    const endY = this.endY ?? 0;
    this.bezierCurveTo(
      endX * (1 - this.curve) + x * this.curve, endY,
      endX * this.curve + x * (1 - this.curve), y,
      x, y
    );
    return this;
  }

  easeCurveTo(x: number, y: number): this {
    const endX = this.endX ?? 0;
    const endY = this.endY ?? 0;
    let c0x = endX;
    let c0y = endY;
    let c1x = x;
    let c1y = y;

    if ((x - endX) * (y - endY) > 0) {
      c0y = endY * (1 - this.curve) + y * this.curve;
      c1x = endX * this.curve + x * (1 - this.curve);
    } else {
      c0x = endX * (1 - this.curve) + x * this.curve;
      c1y = endY * this.curve + y * (1 - this.curve);
    }
    this.bezierCurveTo(c0x, c0y, c1x, c1y, x, y);
    return this;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, ccw: number = 0): this {
    x = +x;
    y = +y;
    radius = +radius;
    ccw = ~~ccw; // Bitwise NOT NOT to convert to int

    if (radius < 0) {
      throw new Error(`Negative radius: ${radius}`);
    }

    const dx = radius * Math.cos(startAngle);
    const dy = radius * Math.sin(startAngle);
    const x0 = x + dx;
    const y0 = y + dy;
    const cw = 1 ^ ccw;
    let da = ccw === 0 ? endAngle - startAngle : startAngle - endAngle;

    if (this.endX === null) {
      this.str += `M${x0}, ${y0}`;
    } else if (Math.abs(this.endX - x0) > EPSILON || Math.abs((this.endY ?? 0) - y0) > EPSILON) {
      this.str += `L${x0}, ${y0}`;
    }

    // Important: discrepancy from d3.path
    if (da < 0) da = da % TAU;

    if (da > TAU_EPSILON) {
      // Complete circle, draw two arcs
      this.endX = x0;
      this.endY = y0;
      this.str += `A${radius},${radius},0,1,${cw},${x - dx},${y - dy}`;
      this.str += `A${radius},${radius},0,1,${cw},${this.endX},${this.endY}`;
    } else if (da > EPSILON) {
      // Partial arc
      this.endX = x + radius * Math.cos(endAngle);
      this.endY = y + radius * Math.sin(endAngle);
      this.str += `A${radius},${radius},0,${da >= Math.PI ? 1 : 0},${cw},${this.endX},${this.endY}`;
    }
    return this;
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): this {
    x1 = +x1;
    y1 = +y1;
    x2 = +x2;
    y2 = +y2;
    r = +r;

    const x0 = this.endX ?? 0;
    const y0 = this.endY ?? 0;
    const x21 = x2 - x1;
    const y21 = y2 - y1;
    const x01 = x0 - x1;
    const y01 = y0 - y1;
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

    const x20 = x2 - x0;
    const y20 = y2 - y0;
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

/**
 * Node class - Represents an entity at a specific timestamp in a session
 */
export class Node {
  name: string;
  id: number;
  sessionID: number;
  timestamp: number;
  order: number;

  constructor(
    name: string = '',
    sessionID: number = 0,
    order: number = 0,
    time: number = -1,
    index: number = -1
  ) {
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

  /**
   * Find yourself at a different timestamp
   */
  findSelf(nodes: Node[]): Node | null {
    for (const each of nodes) {
      if (each.name === this.name) {
        return each;
      }
    }
    return null;
  }
}

/**
 * Entity class - Represents a unique network actor across time
 */
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

/**
 * Session class - Snapshot of interactions at one timestamp
 */
export class Session {
  id: number;
  entities: Node[];
  entityWeight: number;
  constraints: (string[] | Record<number, string[]>)[];
  type: 'contact' | 'idle';
  weight: number;
  indices: number[];
  timestamp: number;
  hops: string[][]; // [[top-2-hop], [1-hop source], [ego], [1-hop target], [bottom-2-hop]]
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

  add(node: Node): void {
    this.entities.push(node);
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

  set(options: { hops?: string[][]; links?: [string, string, number][]; constraints?: (string[] | Record<number, string[]>)[] }): void {
    if (options.hops && options.hops.length > 0) this.hops = options.hops;
    if (options.links && options.links.length > 0) this.links = options.links;
    if (options.constraints && options.constraints.length > 0) this.constraints = options.constraints;
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
}

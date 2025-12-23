/**
 * Rendering Pipeline
 * Generates SVG paths and visual elements for SpreadLine
 */

import { Path, Session, Entity } from '../types/core';
import {
  SpreadLineData,
  Storyline,
  Block,
  Point,
  TimeLabel,
  BlockOutline,
  Mark,
  StorylineLabel,
  InlineLabel,
} from '../types/output';

interface SpreadLiner {
  span: [number, number];
  egoIdx: number;
  entities: Entity[];
  entities_names: string[];
  sessions: Session[];
  locations: { contact: number[]; idle: Set<number> };
  effective_timestamps: number[];
  _all_timestamps: string[];
  _tables: {
    session: number[][];
    presence: number[][];
    height: number[][];
    crossing: number[][];
  };
  _counts: { numTimestamps: number; numEntities: number };
  _config: { squeezeSameCategory: boolean; minimize: string; bandStretch: [string, string][] };
  _line_color: Record<string, string>;
  _node_color: Map<string, { context: string | number }>;
  context: { layout: Map<string, { posX: number; posY: number }> };
  getSessionByID(id: number): Session | null;
}

interface ScaleTimer {
  bandWidth: number;
  allTimeLabels: number[];
  allBlocks: [number, number][];
  allBands: [number, number][];
}

interface ScreenSize {
  width: number;
  height: number;
}

/**
 * Main rendering function
 */
export function rendering(size: ScreenSize, liner: SpreadLiner): SpreadLineData {
  const renderer = new Renderer();
  renderer.fit(size, liner);
  return renderer.render as SpreadLineData;
}

type OriginEntry = { x: [number, number]; y: number } | null;

class Renderer {
  private origin: OriginEntry[][] = [];
  private heights: number[][] = [];
  private scaleTimer: ScaleTimer = {
    bandWidth: -1,
    allTimeLabels: [],
    allBlocks: [],
    allBands: [],
  };
  private labelTable: number[][] = [];
  private blockRange: ([number, number] | null)[] = [];

  render: Partial<SpreadLineData> = {
    bandWidth: 0,
    blockWidth: 40,
    ego: '',
    timeLabels: [],
    storylines: [],
    blocks: [],
    heightExtents: [0, 0],
  };

  fit(screenSize: ScreenSize, liner: SpreadLiner): void {
    const { width, height } = screenSize;
    this.fitTime(width, liner._all_timestamps, liner._config.bandStretch);
    this.fitEntities(liner.span, height, liner._tables.presence, liner._tables.height, liner.effective_timestamps);

    this.prepareTimeLabels(liner._all_timestamps);
    this.prepareLineSegments(liner);
    this.preparePointsBlocks(liner);
    this.prepareLabels(liner);
    this.prepareInlineLabels(liner.entities_names);
    this.render.ego = liner.entities_names[liner.egoIdx];
  }

  private fitTime(width: number, domain: string[], bandStretch: [string, string][]): void {
    const domainSize = domain.length;
    const toBeStretched: number[] = [];

    for (const [start, end] of bandStretch) {
      const startIdx = start !== '' ? domain.indexOf(start) : 0;
      const endIdx = end !== '' ? domain.indexOf(end) : domainSize - 1;
      for (let i = startIdx; i <= endIdx; i++) {
        toBeStretched.push(i);
      }
    }

    const align = 0.5;
    const paddingInter = 0.2;
    const paddingOuter = 0.1;

    const step = Math.round((width / (domainSize + paddingOuter * 2 - paddingInter)) * 100) / 100;
    const gap = step * paddingInter;
    const bandwidth = step - gap;
    const paddingLeft = step * paddingOuter * align * 2;

    const bandStart: number[] = new Array(domainSize).fill(0);
    bandStart[0] = paddingLeft;

    for (let idx = 1; idx < domainSize; idx++) {
      const additional = toBeStretched.includes(idx) ? step * 1.1 : 0;
      bandStart[idx] = bandStart[idx - 1] + step + additional;
    }

    const bands: [number, number][] = bandStart.map(s => [s, s + bandwidth]);
    const blockWeight = 0.6;
    const actualBlockWidth = Math.min(blockWeight * bandwidth, this.render.blockWidth!);
    this.render.blockWidth = actualBlockWidth;

    const blockSideWeight = (1 - actualBlockWidth / bandwidth) / 2;
    const blocks: [number, number][] = bandStart.map(s => [
      s + bandwidth * blockSideWeight,
      s + bandwidth * (1 - blockSideWeight),
    ]);

    this.scaleTimer = {
      bandWidth: bandwidth,
      allTimeLabels: bandStart.map(s => s + bandwidth / 2),
      allBands: bands,
      allBlocks: blocks,
    };
    this.render.bandWidth = bandwidth;
  }

  private fitEntities(
    span: [number, number],
    height: number,
    validTable: number[][],
    heightTable: number[][],
    validDomain: number[]
  ): void {
    // Scale heights to pixels
    const heights = heightTable.map(row => row.map(h => (h + 1) * 6));

    const allHeights = heights.flat().filter(h => h !== -1 && !isNaN(h));
    const topY = Math.min(...allHeights);
    const bottomY = Math.max(...allHeights);
    this.render.heightExtents = [topY, bottomY];
    this.heights = heights;

    const [numEntities, numTimestamps] = span;
    const entity: OriginEntry[][] = Array.from({ length: numEntities }, () =>
      Array(numTimestamps).fill(null)
    );
    const markers = validDomain.map(idx => this.scaleTimer.allBlocks[idx]);

    for (let rIdx = 0; rIdx < numEntities; rIdx++) {
      for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
        if (validTable[rIdx][cIdx] === 0) {
          entity[rIdx][cIdx] = null;
        } else {
          const x = markers[cIdx];
          const y = heights[rIdx][cIdx];
          entity[rIdx][cIdx] = { x, y };
        }
      }
    }
    this.origin = entity;
  }

  private prepareTimeLabels(timeLabels: string[]): void {
    const labelPos = this.scaleTimer.allTimeLabels;
    const labels: TimeLabel[] = labelPos.slice(0, -1).map((posX, i) => ({
      label: timeLabels[i],
      posX,
    }));
    this.render.timeLabels = labels;
  }

  private prepareLineSegments(liner: SpreadLiner): void {
    const ego = liner.egoIdx;
    const names = liner.entities_names;
    const color = liner._line_color;
    const effectiveTimestamps = liner.effective_timestamps;
    const [numEntities, numTimestamps] = liner.span;
    const labelTable: number[][] = Array.from({ length: numEntities }, () =>
      Array(numTimestamps).fill(-1)
    );
    const sideTable = liner._tables.crossing;
    const result: Storyline[] = [];

    for (let rIdx = 0; rIdx < numEntities; rIdx++) {
      const marks = this.origin[rIdx];
      const invalidity = marks.map(each => each === null);

      const valids = invalidity.map((inv, idx) => (inv ? -1 : idx)).filter(i => i >= 0);
      const lines: string[] = [];

      const lineColor = rIdx === ego ? '#424242' : color[names[rIdx]] || '#424242';
      const lifeStart = valids[0];
      const lifeEnd = valids[valids.length - 1];

      const chunk: Storyline = {
        name: names[rIdx],
        lines: [],
        marks: [],
        label: {
          posX: 0,
          posY: 0,
          textAlign: 'start',
          line: '',
          label: '',
          visibility: 'visible',
        },
        inlineLabels: [],
        color: lineColor,
        id: rIdx,
        lifespan: effectiveTimestamps[lifeEnd] - effectiveTimestamps[lifeStart] + 1,
        crossingCheck: sideTable[rIdx][0] !== 0,
      };

      if (valids.length === 1) {
        result.push(chunk);
        continue;
      }

      const validLines = valids.map(idx => marks[idx]).filter((m): m is NonNullable<OriginEntry> => m !== null);

      for (let idx = 1; idx < validLines.length; idx++) {
        const cIdx = valids[idx];
        let svgString = '';

        const leftMark = validLines[idx - 1];
        const rightMark = validLines[idx];

        const leftPosY = leftMark.y;
        const rightPosY = rightMark.y;
        const [leftStart, leftEnd] = leftMark.x;
        const [rightStart, rightEnd] = rightMark.x;

        let start: [number, number] = [leftStart, leftPosY];
        let end: [number, number] = [rightEnd, rightPosY];

        if (idx === 1) {
          start = [0.5 * (leftStart + leftEnd), leftPosY];
        }
        if (idx === validLines.length - 1) {
          end = [0.5 * (rightStart + rightEnd), rightPosY];
        }

        if (leftPosY === rightPosY) {
          // Straight line
          labelTable[rIdx][cIdx] = cIdx;
          svgString = `M${toSvgJoin(start)} L${toSvgJoin([rightStart, rightPosY])}`;
        } else {
          // Bezier curve
          const [control1, control2] = computeBezierLine(
            [leftEnd, leftPosY],
            [rightStart, rightPosY]
          );
          svgString = `M${toSvgJoin(start)} L${toSvgJoin([leftEnd, leftPosY])}`;
          svgString += ` C${toSvgJoin(control1)} ${toSvgJoin(control2)} ${toSvgJoin([rightStart, rightPosY])}`;
        }
        lines.push(svgString);
      }

      this.labelTable = labelTable;
      chunk.lines = lines;
      result.push(chunk);
    }

    this.render.storylines = result;
  }

  private prepareLabels(liner: SpreadLiner): void {
    const storylines = this.render.storylines!;
    const ego = liner.egoIdx;
    const names = liner.entities_names;
    const [numEntities, numTimestamps] = liner.span;
    const blockRanges = this.blockRange;

    for (let rIdx = 0; rIdx < numEntities; rIdx++) {
      const marks = this.origin[rIdx];
      const invalidity = marks.map(each => each === null);
      const valids = invalidity.map((inv, idx) => (inv ? -1 : idx)).filter(i => i >= 0);
      const update = storylines[rIdx];

      const lineStart = marks[valids[0]];
      const lineEnd = marks[valids[valids.length - 1]];
      if (!lineStart || !lineEnd) continue;

      const startVisible = 'visible';
      const endVisible = 'visible';

      // Prepare entity marks
      const h = 7;
      const a = (2 * h) / Math.sqrt(3);
      const area = (Math.sqrt(3) / 4) * a * a;
      let symbolMarks: Mark[] = [];

      if (rIdx !== ego) {
        const startMark: Mark = {
          posX: lineStart.x[0] - h / 2,
          posY: lineStart.y,
          name: names[rIdx],
          size: area,
          visibility: startVisible,
        };
        const endMark: Mark = {
          posX: lineEnd.x[1] + h / 2,
          posY: lineEnd.y,
          name: names[rIdx],
          size: area,
          visibility: endVisible,
        };
        symbolMarks = [startMark, endMark];
      }

      // Prepare entity labels
      const dx = 12;
      const dxOffset = 10;
      const markOffset = 2;
      const prevTimestamp = Math.min(valids[0] - 1, 0);

      const label: StorylineLabel = {
        posX: lineStart.x[0] - dx,
        posY: lineStart.y,
        textAlign: 'end',
        line: `M${toSvgJoin([lineStart.x[0] - dxOffset, lineStart.y])} L${toSvgJoin([lineStart.x[0] - markOffset, lineStart.y])}`,
        label: names[rIdx],
        visibility: startVisible,
      };

      const extents = blockRanges[prevTimestamp];
      if (extents && extents[0] <= lineStart.y && lineStart.y <= extents[1] && valids[0] !== 0) {
        label.posX = lineEnd.x[1] + dx;
        label.posY = lineEnd.y;
        label.textAlign = 'start';
        label.line = `M${toSvgJoin([lineEnd.x[1] + markOffset, lineEnd.y])} L${toSvgJoin([lineEnd.x[1] + dxOffset, lineEnd.y])}`;
        label.visibility = endVisible;
      }

      update.marks = symbolMarks;
      update.label = label;
      storylines[rIdx] = update;
    }

    this.render.storylines = storylines;
  }

  private preparePointsBlocks(liner: SpreadLiner): void {
    const validDomain = liner.effective_timestamps;
    const sessions = liner.sessions;
    const names = liner.entities_names;
    const timeLabels = liner._all_timestamps;
    const context = liner.context;
    const nodeContext = liner._node_color;

    const [_, numTimestamps] = liner.span;
    const blockRender: Block[] = [];
    const validLabels = sessions.map(s => s.timestamp);

    const blockRange: [number, number][] = Array(numTimestamps).fill([-1, -1]);
    const blocks = validDomain.map(idx => this.scaleTimer.allBlocks[idx]);
    const validBlocks = validLabels.map(idx => this.scaleTimer.allBlocks[idx]);
    const width = this.render.blockWidth!;

    for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
      const currentBlock = blocks[cIdx];
      if (!validBlocks.some(b => b[0] === currentBlock[0] && b[1] === currentBlock[1])) continue;

      const tIdx = this.scaleTimer.allBlocks.findIndex(
        b => b[0] === currentBlock[0] && b[1] === currentBlock[1]
      );
      const session = sessions.find(s => s.timestamp === tIdx);
      if (!session) continue;

      const timestamp = session.timestamp;
      const entities = session.getEntityIDs();
      entities.forEach(e => {
        this.labelTable[e][cIdx] = -1;
      });

      const hops = session.hops.map(hop => hop.map(name => names.indexOf(name)));

      // Create points
      const points: Point[] = entities.map((idx) => {
        const each = this.origin[idx][cIdx];
        if (!each) {
          return {
            id: idx,
            posX: 0,
            posY: 0,
            name: names[idx],
            group: blockRender.length,
            aggregateGroup: 0,
            visibility: 'hidden' as const,
            scaleX: 0,
            scaleY: 0,
            label: -1,
          };
        }
        return {
          id: idx,
          posX: 0.5 * (each.x[0] + each.x[1]),
          posY: each.y,
          name: names[idx],
          group: blockRender.length,
          aggregateGroup: 0,
          visibility: 'visible' as const,
          scaleX: 0,
          scaleY: 0,
          label: -1,
        };
      });

      // Compute block outline
      const { outline, moveX } = computeBlock(points, hops, width);

      // Get min/max Y
      const posYs = points.map(p => p.posY);
      const minPosY = Math.min(...posYs);
      const maxPosY = Math.max(...posYs);
      blockRange[cIdx] = [minPosY - 5, maxPosY + 5];

      // Add context data to points
      for (const point of points) {
        const layoutKey = `${point.name},${timestamp}`;
        const layout = context.layout.get(layoutKey);
        if (layout) {
          point.scaleX = layout.posX;
          point.scaleY = layout.posY;
        }

        const nodeKey = `${timeLabels[timestamp]},${point.name}`;
        const node = nodeContext.get(nodeKey);
        if (node) {
          point.label = node.context;
        }
      }

      // Create links
      const links: [number, number][] = session.links.map(([source, target]) => {
        const sourcePoint = points.find(p => p.name === source);
        const targetPoint = points.find(p => p.name === target);
        return [sourcePoint?.id ?? 0, targetPoint?.id ?? 0];
      });

      const block: Block = {
        id: blockRender.length,
        time: timeLabels[timestamp],
        outline,
        names: entities.map(e => names[e]),
        relations: links,
        points,
        moveX,
        topPosY: Math.min(...points.map(p => p.posY)),
      };

      blockRender.push(block);
    }

    this.blockRange = blockRange;
    this.render.blocks = blockRender;
  }

  private prepareInlineLabels(names: string[]): void {
    const [numEntities, numTimestamps] = [this.labelTable.length, this.labelTable[0]?.length ?? 0];
    const storylines = this.render.storylines!;

    for (let rIdx = 0; rIdx < numEntities; rIdx++) {
      const result: InlineLabel[] = [];
      const marks = this.origin[rIdx];
      const name = names[rIdx];
      const candidates: number[][] = [];

      // Filter labels inside blocks
      for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
        if (this.labelTable[rIdx][cIdx] === -1) continue;
        const mark = marks[cIdx];
        if (!mark) continue;
        const extents = this.blockRange[cIdx];
        if (extents && extents[0] < mark.y && mark.y < extents[1]) {
          this.labelTable[rIdx][cIdx] = -1;
        }
      }

      // Find consecutive ranges
      let currentGroup: number[] = [];
      for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
        if (this.labelTable[rIdx][cIdx] !== -1) {
          currentGroup.push(this.labelTable[rIdx][cIdx]);
        } else {
          if (currentGroup.length >= 3) {
            candidates.push([...currentGroup]);
          }
          currentGroup = [];
        }
      }
      if (currentGroup.length >= 3) {
        candidates.push([...currentGroup]);
      }

      // Create inline labels
      for (const slots of candidates) {
        const mid = Math.floor(slots.length / 2);
        const targetIdx = slots[mid];
        const mark = marks[targetIdx];
        if (!mark) continue;
        result.push({
          posX: 0.5 * (mark.x[0] + mark.x[1]),
          posY: mark.y,
          name,
        });
      }

      storylines[rIdx].inlineLabels = result;
    }

    this.render.storylines = storylines;
  }
}

/**
 * Compute bezier curve control points
 */
function computeBezierLine(start: [number, number], end: [number, number]): [[number, number], [number, number]] {
  const midX = (start[0] + end[0]) * 0.5;
  const control1: [number, number] = [midX, start[1]];
  const control2: [number, number] = [midX, end[1]];
  return [control1, control2];
}

/**
 * Convert points to SVG path format
 */
function toSvgJoin(points: number[]): string {
  return points.join(',');
}

/**
 * Compute block outline
 */
function computeBlock(
  points: Point[],
  hops: number[][],
  blockWidth: number
): { outline: BlockOutline; moveX: number } {
  const radius = blockWidth / 2;
  const posYs = points.map(p => p.posY);
  const topPosY = Math.min(...posYs);
  const bottomPosY = Math.max(...posYs);
  const posX = points[0].posX;
  const width = Math.abs(bottomPosY - topPosY);

  const button = {
    width: 60,
    height: 18,
    posX,
    posY: bottomPosY + radius,
  };

  const topBar = new Path();
  const bottomBar = new Path();
  topBar.moveTo(posX, topPosY - radius).lineTo(posX + width, topPosY - radius);
  bottomBar.moveTo(posX, bottomPosY + radius).lineTo(posX + width, bottomPosY + radius);

  const leftArc = new Path();
  const rightArc = new Path();
  const offset = 0.005;
  const portion = 0.35;

  // Get entities by hop level
  const topHops = points.filter(p => hops[0].includes(p.id));
  const main = points.filter(p => [...hops[1], ...hops[2], ...hops[3]].includes(p.id));
  const bottomHops = points.filter(p => hops[4].includes(p.id));

  const mainPosYs = main.map(p => p.posY);
  const topMain = Math.min(...mainPosYs);
  const bottomMain = Math.max(...mainPosYs);

  if (hops[0].length === 0) {
    leftArc.arc(posX, topMain, radius, Math.PI * (1.5 + offset), Math.PI, 1);
    rightArc.arc(posX, topMain, radius, Math.PI * (1.5 - offset), 0);
  } else {
    const topHopPosYs = topHops.map(p => p.posY);
    const topTopHop = Math.min(...topHopPosYs);
    const bottomTopHop = Math.max(...topHopPosYs);

    leftArc
      .arc(posX, topTopHop, radius, Math.PI * (1.5 + offset), Math.PI, 1)
      .arc(posX, bottomTopHop, radius, Math.PI, Math.PI * (1 - portion + offset), 1);
    rightArc
      .arc(posX, topTopHop, radius, Math.PI * (1.5 - offset), 0)
      .arc(posX, bottomTopHop, radius, 0, Math.PI * (portion + offset));

    leftArc.arc(posX, topMain, radius, Math.PI * (1 + portion), Math.PI, 1);
    rightArc.arc(posX, topMain, radius, -Math.PI * portion, 0);
  }

  if (hops[4].length === 0) {
    leftArc.arc(posX, bottomMain, radius, Math.PI, Math.PI * (0.5 - offset), 1);
    rightArc.arc(posX, bottomMain, radius, 0, Math.PI * (0.5 + offset));
  } else {
    const bottomHopPosYs = bottomHops.map(p => p.posY);
    const topBottomHop = Math.min(...bottomHopPosYs);
    const bottomBottomHop = Math.max(...bottomHopPosYs);

    leftArc.arc(posX, bottomMain, radius, Math.PI, Math.PI * (1 - portion + offset), 1);
    rightArc.arc(posX, bottomMain, radius, 0, Math.PI * (portion + offset));

    leftArc
      .arc(posX, topBottomHop, radius, Math.PI * (1 + portion), Math.PI, 1)
      .arc(posX, bottomBottomHop, radius, Math.PI, Math.PI * (0.5 - offset), 1);
    rightArc
      .arc(posX, topBottomHop, radius, -Math.PI * portion, 0)
      .arc(posX, bottomBottomHop, radius, 0, Math.PI * (0.5 + offset));
  }

  return {
    outline: {
      left: leftArc.toString(),
      right: rightArc.toString(),
      top: topBar.toString(),
      bottom: bottomBar.toString(),
      button,
    },
    moveX: width,
  };
}

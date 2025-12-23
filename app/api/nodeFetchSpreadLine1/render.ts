/**
 * SpreadLine Rendering
 * Converted from Python: SpreadLine/render.py
 *
 * Generates SVG paths and layout coordinates for visualization.
 */

import {
  Path, Session, Entity, NumberMatrix,
  RenderOutput, Storyline, Block, BlockPoint, BlockOutline,
  TimeLabel, Mark, LabelInfo, InlineLabel,
  Tables, Locations, SpreadLineConfig
} from './types';
import { nanmin, nanmax, full2D, round } from './helpers';

const TIME_UNIT = 10;

interface Liner {
  span: [number, number];
  egoIdx: number;
  entities: Entity[];
  entities_names: string[];
  locations: Locations;
  _tables: Tables;
  _line_color: Record<string, string>;
  _config: SpreadLineConfig;
  _all_timestamps: string[];
  effective_timestamps: number[];
  sessions: Session[];
  _node_color: Array<{ time: string; entity: string; context: number | string }>;
  context: { layout: Map<string, any> };
  getSessionByID: (id: number) => Session | null;
}

interface Size {
  width: number;
  height: number;
}

/**
 * Join points into SVG coordinate string
 */
function toSvgJoin(points: number[]): string {
  return points.map(p => String(p)).join(',');
}

/**
 * Compute bezier control points
 */
function computeBezierLine(start: number[], end: number[]): [number[], number[]] {
  const width = Math.abs(end[0] - start[0]);
  const height = Math.abs(end[1] - start[1]);
  const ratio = round(width / height, 2);

  const midX = (start[0] + end[0]) * 0.5;
  const control1 = [midX, start[1]];
  const control2 = [midX, end[1]];

  return [control1, control2];
}

/**
 * Get min and max from array by key function
 */
function getExtents<T>(array: T[], key: (x: T) => number): [T, T] | [] {
  if (array.length === 0) return [];
  return [
    array.reduce((a, b) => key(a) < key(b) ? a : b),
    array.reduce((a, b) => key(a) > key(b) ? a : b)
  ];
}

/**
 * Compute button and horizontal bars for block outline
 */
function computeButtonAndBarsInBlock(
  posX: number,
  topPosY: number,
  bottomPosY: number,
  radius: number,
  width: number
): Partial<BlockOutline> {
  const height = 18;
  const buttonWidth = 60;

  const button = {
    width: buttonWidth,
    height: height,
    posX: posX,
    posY: bottomPosY + radius
  };

  const topBar = new Path();
  const bottomBar = new Path();
  topBar.moveTo(posX, topPosY - radius).lineTo(posX + width, topPosY - radius);
  bottomBar.moveTo(posX, bottomPosY + radius).lineTo(posX + width, bottomPosY + radius);

  return {
    button,
    top: topBar.toString(),
    bottom: bottomBar.toString()
  };
}

/**
 * Compute block outline paths
 */
function computeBlock(
  points: BlockPoint[],
  hops: number[][],
  blockWidth: number,
  portion: number = 0.35
): [BlockOutline, number] {
  const radius = blockWidth / 2;
  const extents = getExtents(points, p => p.posY);
  if (extents.length === 0) {
    return [{
      top: '', bottom: '', left: '', right: '',
      button: { posX: 0, posY: 0, width: 60, height: 18 }
    }, 0];
  }

  const [topPosY, bottomPosY] = extents as [BlockPoint, BlockPoint];
  const posX = points[0].posX;
  const width = Math.abs(bottomPosY.posY - topPosY.posY);

  const result = computeButtonAndBarsInBlock(posX, topPosY.posY, bottomPosY.posY, radius, width);

  const leftArc = new Path();
  const rightArc = new Path();
  const offset = 0.005;

  // Filter points by hop level
  const topHops = points.filter(p => hops[0].includes(p.id));
  const main = points.filter(p => [...hops[1], ...hops[2], ...hops[3]].includes(p.id));
  const bottomHops = points.filter(p => hops[4].includes(p.id));

  const mainExtents = getExtents(main, p => p.posY);
  const [topMain, bottomMain] = (mainExtents.length > 0 ? mainExtents : [points[0], points[points.length - 1]]) as [BlockPoint, BlockPoint];

  if (hops[0].length === 0) {
    leftArc.arc(posX, topMain.posY, radius, Math.PI * (1.5 + offset), Math.PI, 1);
    rightArc.arc(posX, topMain.posY, radius, Math.PI * (1.5 - offset), 0);
  } else {
    const topHopExtents = getExtents(topHops, p => p.posY) as [BlockPoint, BlockPoint];
    leftArc
      .arc(posX, topHopExtents[0].posY, radius, Math.PI * (1.5 + offset), Math.PI, 1)
      .arc(posX, topHopExtents[1].posY, radius, Math.PI, Math.PI * (1 - portion + offset), 1);
    rightArc
      .arc(posX, topHopExtents[0].posY, radius, Math.PI * (1.5 - offset), 0)
      .arc(posX, topHopExtents[1].posY, radius, 0, Math.PI * (portion + offset));
    leftArc.arc(posX, topMain.posY, radius, Math.PI * (1 + portion), Math.PI, 1);
    rightArc.arc(posX, topMain.posY, radius, -Math.PI * portion, 0);
  }

  if (hops[4].length === 0) {
    leftArc.arc(posX, bottomMain.posY, radius, Math.PI, Math.PI * (0.5 - offset), 1);
    rightArc.arc(posX, bottomMain.posY, radius, 0, Math.PI * (0.5 + offset));
  } else {
    const bottomHopExtents = getExtents(bottomHops, p => p.posY) as [BlockPoint, BlockPoint];
    leftArc.arc(posX, bottomMain.posY, radius, Math.PI, Math.PI * (1 - portion + offset), 1);
    rightArc.arc(posX, bottomMain.posY, radius, 0, Math.PI * (portion + offset));
    leftArc
      .arc(posX, bottomHopExtents[0].posY, radius, Math.PI * (1 + portion), Math.PI, 1)
      .arc(posX, bottomHopExtents[1].posY, radius, Math.PI, Math.PI * (0.5 - offset), 1);
    rightArc
      .arc(posX, bottomHopExtents[0].posY, radius, -Math.PI * portion, 0)
      .arc(posX, bottomHopExtents[1].posY, radius, 0, Math.PI * (0.5 + offset));
  }

  return [{
    ...result,
    left: leftArc.toString(),
    right: rightArc.toString()
  } as BlockOutline, width];
}

/**
 * Main rendering class
 */
class Renderer {
  private origin: any[][] = [];
  private heights: NumberMatrix = [];
  private scaleTimer: {
    bandWidth: number;
    allTimeLabels: number[];
    allBlocks: number[][];
    allBands: number[][];
  } = {
    bandWidth: -1,
    allTimeLabels: [],
    allBlocks: [],
    allBands: []
  };
  private labelTable: NumberMatrix = [];
  private blockRange: NumberMatrix = [];

  render: RenderOutput = {
    bandWidth: 0,
    blockWidth: 40,
    ego: '',
    timeLabels: [],
    storylines: [],
    blocks: [],
    heightExtents: [0, 0]
  };

  fit(screenSize: Size, liner: Liner): void {
    const { width, height } = screenSize;

    this.fitTime(width, liner._all_timestamps, liner._config.bandStretch);
    this.fitEntities(liner.span, height, liner._tables.presence, liner._tables.height!, liner.effective_timestamps);

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

    const step = round(width / (domainSize + paddingOuter * 2 - paddingInter), 2);
    const gap = step * paddingInter;
    const bandwidth = step - gap;
    const paddingLeft = step * paddingOuter * align * 2;

    // Python uses np.full(domainSize, 0) which creates an INTEGER array,
    // causing float values to be truncated. We replicate this behavior.
    const bandStart: number[] = new Array(domainSize).fill(0);
    bandStart[0] = Math.floor(paddingLeft);  // Truncate like Python int array

    for (let idx = 1; idx < domainSize; idx++) {
      const additional = toBeStretched.includes(idx) ? step * 1.1 : 0;
      // Python truncates each assignment due to int array
      bandStart[idx] = Math.floor(bandStart[idx - 1] + step + additional);
    }

    const bands = bandStart.map(start => [start, start + bandwidth]);

    let blockWeight = 0.6;
    if (blockWeight * bandwidth < this.render.blockWidth) {
      this.render.blockWidth = blockWeight * bandwidth;
    } else {
      blockWeight = this.render.blockWidth / bandwidth;
    }

    const blockSideWeight = (1 - blockWeight) / 2;
    const blocks = bandStart.map(start => [
      start + bandwidth * blockSideWeight,
      start + bandwidth * (1 - blockSideWeight)
    ]);

    this.scaleTimer = {
      allTimeLabels: bandStart.map(start => start + bandwidth / 2),
      allBands: bands,
      allBlocks: blocks,
      bandWidth: bandwidth
    };
    this.render.bandWidth = bandwidth;
  }

  private fitEntities(
    span: [number, number],
    height: number,
    validTable: NumberMatrix,
    heightTable: NumberMatrix,
    validDomain: number[]
  ): void {
    // Python: heights = (heightTable+1)*6
    const heights = heightTable.map(row => row.map(h => (h + 1) * 6));

    // Python uses np.nanmin/nanmax on the full array (including 0 values)
    const allHeights = heights.flat();
    const topY = nanmin(allHeights);
    const bottomY = nanmax(allHeights);
    this.render.heightExtents = [topY, bottomY];
    this.heights = heights;

    const entity: any[][] = full2D(span[0], span[1], null);
    const markers = validDomain.map(idx => this.scaleTimer.allBlocks[idx]);

    for (let rIdx = 0; rIdx < span[0]; rIdx++) {
      for (let cIdx = 0; cIdx < span[1]; cIdx++) {
        if (validTable[rIdx][cIdx] === 0) {
          entity[rIdx][cIdx] = [-1, -1];
          continue;
        }
        const x = markers[cIdx];
        const y = heights[rIdx][cIdx];
        entity[rIdx][cIdx] = [x, y];
      }
    }
    this.origin = entity;
  }

  private prepareTimeLabels(timeLabels: string[]): void {
    const labelPos = this.scaleTimer.allTimeLabels;
    this.render.timeLabels = timeLabels.slice(0, -1).map((label, idx) => ({
      label,
      posX: labelPos[idx]
    }));
  }

  private prepareLineSegments(liner: Liner): void {
    const ego = liner.egoIdx;
    const names = liner.entities_names;
    const color = liner._line_color;
    const effectiveTimestamps = liner.effective_timestamps;
    const [numEntities, numTimestamps] = [this.origin.length, this.origin[0].length];
    const labelTable = full2D(numEntities, numTimestamps, -1);
    const sideTable = liner._tables.crossing!;
    const result: Storyline[] = [];

    for (let rIdx = 0; rIdx < numEntities; rIdx++) {
      const marks = this.origin[rIdx];
      const invalidity = marks.map((each: any) =>
        Array.isArray(each) && each[0] === -1 && each[1] === -1
      );
      const valids = invalidity.map((inv, idx) => inv ? -1 : idx).filter(idx => idx !== -1);
      const lines: string[] = [];

      const lineColor = rIdx === ego ? '#424242' : (color[names[rIdx]] || '#424242');
      const lifeStart = valids[0];
      const lifeEnd = valids[valids.length - 1];

      const chunk: Storyline = {
        name: names[rIdx],
        lines: [],
        marks: [
          { posX: 0, posY: 0, name: names[rIdx], size: 0 },
          { posX: 0, posY: 0, name: names[rIdx], size: 0 }
        ],
        label: { posX: 0, posY: 0, name: '', textAlign: 'start', line: '', label: '' },
        inlineLabels: [],
        color: lineColor,
        id: rIdx,
        lifespan: effectiveTimestamps[lifeEnd] - effectiveTimestamps[lifeStart] + 1,
        crossingCheck: sideTable[rIdx] !== 0
      };

      if (valids.length === 1) {
        result.push(chunk);
        continue;
      }

      const validLines = valids.map(v => marks[v]);

      for (let idx = 1; idx < validLines.length; idx++) {
        const cIdx = valids[idx];
        let svgString = '';
        const leftPosY = validLines[idx - 1][1];
        const rightPosY = validLines[idx][1];
        const [leftStart, leftEnd] = validLines[idx - 1][0];
        const [rightStart, rightEnd] = validLines[idx][0];

        let start = [leftStart, leftPosY];
        let end = [rightEnd, rightPosY];

        if (idx === 1) start = [0.5 * (leftStart + leftEnd), leftPosY];
        if (idx === validLines.length - 1) end = [0.5 * (rightStart + rightEnd), rightPosY];

        if (leftPosY === rightPosY) {
          labelTable[rIdx][valids[idx]] = valids[idx];
          svgString = `M${toSvgJoin(start)} L${toSvgJoin([rightStart, rightPosY])}`;
        } else {
          const [control1, control2] = computeBezierLine([leftEnd, leftPosY], [rightStart, rightPosY]);
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

  private prepareLabels(liner: Liner): void {
    const storylines = this.render.storylines;
    const ego = liner.egoIdx;
    const names = liner.entities_names;
    const [numEntities, numTimestamps] = [this.origin.length, this.origin[0].length];
    const blockRanges = this.blockRange;

    for (let rIdx = 0; rIdx < numEntities; rIdx++) {
      const marks = this.origin[rIdx];
      const invalidity = marks.map((each: any) =>
        Array.isArray(each) && each[0] === -1 && each[1] === -1
      );
      const valids = invalidity.map((inv, idx) => inv ? -1 : idx).filter(idx => idx !== -1);

      const update = storylines[rIdx];
      const lineStart = marks[valids[0]];
      const lineEnd = marks[valids[valids.length - 1]];

      // Prepare entity marks (triangles)
      const h = 7;
      const a = 2 * h / Math.sqrt(3);
      const area = Math.sqrt(3) / 4 * a * a;

      let symbolMarks: Mark[] = [];
      if (rIdx !== ego) {
        symbolMarks = [
          { posX: lineStart[0][0] - h / 2, posY: lineStart[1], name: names[rIdx], size: area, visibility: 'visible' },
          { posX: lineEnd[0][1] + h / 2, posY: lineEnd[1], name: names[rIdx], size: area, visibility: 'visible' }
        ];
      }

      // Prepare entity labels
      const dx = 12;
      const dxOffset = 10;
      const markOffset = 2;

      const label: LabelInfo = {
        posX: lineStart[0][0] - dx,
        posY: lineStart[1],
        textAlign: 'end',
        line: `M${toSvgJoin([lineStart[0][0] - dxOffset, lineStart[1]])} L${toSvgJoin([lineStart[0][0] - markOffset, lineStart[1]])}`,
        label: names[rIdx],
        visibility: 'visible'
      };

      update.marks = symbolMarks;
      update.label = label;
      storylines[rIdx] = update;
    }

    this.render.storylines = storylines;
  }

  private preparePointsBlocks(liner: Liner): void {
    const validDomain = liner.effective_timestamps;
    const sessions = liner.sessions;
    const names = liner.entities_names;
    const timeLabels = liner._all_timestamps;
    const context = liner.context;
    const nodeContext = liner._node_color;

    // Create nodeContext index
    const nodeContextIndex = new Map<string, any>();
    for (const row of nodeContext) {
      const key = `${row.time},${row.entity}`;
      nodeContextIndex.set(key, row);
    }

    const [numEntities, numTimestamps] = [this.origin.length, this.origin[0].length];
    const blockRender: Block[] = [];
    const validLabels = sessions.map(s => s.timestamp);

    const blockRange = full2D(2, numTimestamps, -1);
    const blocks = validDomain.map(idx => this.scaleTimer.allBlocks[idx]);
    const validBlocks = validLabels.map(idx => this.scaleTimer.allBlocks[idx]);
    const width = this.render.blockWidth;

    for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
      const block = blocks[cIdx];
      if (!validBlocks.some(vb => vb[0] === block[0] && vb[1] === block[1])) continue;

      const tIdx = this.scaleTimer.allBlocks.findIndex(b => b[0] === block[0] && b[1] === block[1]);
      const session = sessions.find(s => s.timestamp === tIdx);
      if (!session) continue;

      const timestamp = session.timestamp;
      const entities = session.getEntityIDs();
      this.labelTable.forEach((row, r) => {
        if (entities.includes(r)) row[cIdx] = -1;
      });

      const hops = session.hops.map(hop => hop.map(h => names.indexOf(h)));

      const points: BlockPoint[] = entities.map((idx, i) => {
        const each = this.origin[idx][cIdx];
        return {
          id: idx,
          posX: 0.5 * (each[0][0] + each[0][1]),
          posY: each[1],
          name: names[idx],
          group: blockRender.length,
          aggregateGroup: 0,
          scaleX: 0,
          scaleY: 0,
          label: -1,
          visibility: 'visible' as const
        };
      });

      const [blockOutline, moveX] = computeBlock(points, hops, width);

      const pointExtents = getExtents(points, p => p.posY);
      if (pointExtents.length > 0) {
        const [minPoint, maxPoint] = pointExtents as [BlockPoint, BlockPoint];
        blockRange[0][cIdx] = minPoint.posY - 5;
        blockRange[1][cIdx] = maxPoint.posY + 5;
      }

      // Add context info to points
      for (const point of points) {
        const layoutKey = `${point.name},${timestamp}`;
        const layoutEntry = context.layout.get(layoutKey);
        if (layoutEntry) {
          point.scaleX = layoutEntry.posX;
          point.scaleY = layoutEntry.posY;
        }

        const nodeKey = `${timeLabels[timestamp]},${point.name}`;
        const nodeEntry = nodeContextIndex.get(nodeKey);
        if (nodeEntry) {
          point.label = String(nodeEntry.context);
        }
      }

      // Build links
      const links: [number, number][] = [];
      for (const [source, target, weight] of session.links) {
        const sourcePoint = points.find(p => p.name === source);
        const targetPoint = points.find(p => p.name === target);
        if (sourcePoint && targetPoint) {
          links.push([sourcePoint.id, targetPoint.id]);
        }
      }

      blockRender.push({
        id: blockRender.length,
        time: timeLabels[timestamp],
        outline: blockOutline,
        names: entities.map(e => names[e]),
        relations: links,
        points,
        moveX,
        topPosY: Math.min(...points.map(p => p.posY))
      });
    }

    this.blockRange = blockRange;
    this.render.blocks = blockRender;
  }

  private prepareInlineLabels(names: string[]): void {
    const [numEntities, numTimestamps] = [this.labelTable.length, this.labelTable[0]?.length || 0];
    const storylines = this.render.storylines.map(s => s.name);

    for (let rIdx = 0; rIdx < numEntities; rIdx++) {
      const result: InlineLabel[] = [];
      const marks = this.origin[rIdx];
      const name = names[rIdx];
      const storylineIdx = storylines.indexOf(name);

      // Filter out labels inside block range
      for (let cIdx = 0; cIdx < numTimestamps; cIdx++) {
        if (this.labelTable[rIdx][cIdx] === -1) continue;
        const posY = marks[cIdx][1];
        const extents = [this.blockRange[0][cIdx], this.blockRange[1][cIdx]];
        if (extents[0] < posY && posY < extents[1]) {
          this.labelTable[rIdx][cIdx] = -1;
        }
      }

      // Find consecutive sequences of length >= 3
      const labelRow = this.labelTable[rIdx];
      let start = 0;
      let count = 0;

      for (let i = 0; i < labelRow.length; i++) {
        if (labelRow[i] !== -1) {
          if (count === 0) start = i;
          count++;
        } else {
          if (count >= 3) {
            const mid = Math.floor((start + i - 1) / 2);
            const [[startX, endX], posY] = marks[mid];
            result.push({
              posX: 0.5 * (startX + endX),
              posY,
              name
            });
          }
          count = 0;
        }
      }
      // Check last sequence
      if (count >= 3) {
        const mid = Math.floor((start + labelRow.length - 1) / 2);
        const [[startX, endX], posY] = marks[mid];
        result.push({
          posX: 0.5 * (startX + endX),
          posY,
          name
        });
      }

      if (storylineIdx >= 0) {
        this.render.storylines[storylineIdx].inlineLabels = result;
      }
    }
  }
}

/**
 * Main rendering function
 * Python equivalent: rendering
 */
export function rendering(size: Size, liner: Liner): RenderOutput {
  const renderer = new Renderer();
  renderer.fit(size, liner);
  return renderer.render;
}

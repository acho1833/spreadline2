'use client';

/**
 * Technical Design Document v5 - SpreadLine
 *
 * Includes everything from v4 PLUS:
 * - Expandable code reference sections for all components
 * - Syntax-highlighted, human-readable code blocks
 * - Collapsible sections for better navigation
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ============================================
// TABLE OF CONTENTS
// ============================================

const tableOfContents = [
  { id: 'overview', label: '1. Overview', level: 1 },
  { id: 'visual-guide', label: '2. Visual Guide', level: 1 },
  { id: 'visual-anatomy', label: '2.1 Anatomy of SpreadLine', level: 2 },
  { id: 'visual-block-expansion', label: '2.2 Block Expansion Deep Dive', level: 2 },
  { id: 'visual-interactions', label: '2.3 Interactions', level: 2 },
  { id: 'architecture', label: '3. Architecture', level: 1 },
  { id: 'architecture-high-level', label: '3.1 High-Level Architecture', level: 2 },
  { id: 'architecture-data-flow', label: '3.2 Data Flow', level: 2 },
  { id: 'components', label: '4. Components & Code', level: 1 },
  { id: 'components-frontend', label: '4.1 Frontend Components', level: 2 },
  { id: 'components-backend', label: '4.2 Backend Modules', level: 2 },
  { id: 'components-types', label: '4.3 Type Definitions', level: 2 },
  { id: 'pipeline', label: '5. Processing Pipeline', level: 1 },
  { id: 'pipeline-overview', label: '5.1 Pipeline Overview', level: 2 },
  { id: 'pipeline-ordering', label: '5.2 Ordering (order.ts)', level: 2 },
  { id: 'pipeline-aligning', label: '5.3 Aligning (align.ts)', level: 2 },
  { id: 'pipeline-compacting', label: '5.4 Compacting (compact.ts)', level: 2 },
  { id: 'pipeline-rendering', label: '5.5 Rendering (render.ts)', level: 2 },
  { id: 'api-design', label: '6. API Design', level: 1 },
  { id: 'data-models', label: '7. Data Models', level: 1 },
  { id: 'interactions', label: '8. User Interactions', level: 1 },
  { id: 'error-handling', label: '9. Error Handling', level: 1 },
  { id: 'dependencies', label: '10. Dependencies', level: 1 },
  { id: 'assumptions', label: '11. Assumptions', level: 1 },
];

// ============================================
// EXPANDABLE CODE COMPONENT
// ============================================

function ExpandableCode({
  title,
  filePath,
  language = 'typescript',
  code,
  description,
  defaultExpanded = false,
}: {
  title: string;
  filePath: string;
  language?: string;
  code: string;
  description?: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden my-4 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`transform transition-transform ${expanded ? 'rotate-90' : ''}`}>
            &#9654;
          </span>
          <div className="text-left">
            <div className="font-semibold text-gray-900">{title}</div>
            <div className="text-xs font-mono text-blue-600">{filePath}</div>
          </div>
        </div>
        <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600">
          {expanded ? 'Collapse' : 'Expand Code'}
        </span>
      </button>

      {description && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 text-sm text-blue-800">
          {description}
        </div>
      )}

      {expanded && (
        <div className="border-t border-gray-200">
          <pre className="p-4 overflow-auto text-sm bg-slate-900 max-h-[600px]">
            <code className={`language-${language} text-slate-300 whitespace-pre`}>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================
// TOOLTIP COMPONENT
// ============================================

function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="border-b border-dotted border-gray-400 cursor-help">{children}</span>
      {visible && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap">
          {content}
        </span>
      )}
    </span>
  );
}

// ============================================
// ANNOTATED IMAGE COMPONENT
// ============================================

function AnnotatedImage({
  src,
  alt,
  annotations,
  caption,
}: {
  src: string;
  alt: string;
  annotations?: { x: string; y: string; label: string; description?: string; color?: string }[];
  caption?: string;
}) {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-6">
      <div className="relative">
        <img src={src} alt={alt} className="w-full h-auto" />
        {annotations?.map((ann, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: ann.x, top: ann.y, transform: 'translate(-50%, -50%)' }}
            onMouseEnter={() => setHoveredAnnotation(i)}
            onMouseLeave={() => setHoveredAnnotation(null)}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-all hover:scale-125 shadow-lg ${
                ann.color || 'bg-blue-500'
              }`}
              style={{ border: '2px solid white' }}
            >
              {i + 1}
            </div>
            {hoveredAnnotation === i && (
              <div className="absolute left-10 top-0 bg-gray-900 text-white px-4 py-3 rounded-lg text-sm whitespace-nowrap z-20 shadow-xl max-w-xs">
                <div className="font-semibold mb-1">{ann.label}</div>
                {ann.description && (
                  <div className="text-gray-300 text-xs">{ann.description}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {caption && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          {caption}
        </div>
      )}
    </div>
  );
}

// ============================================
// CSV TABLE WITH EXAMPLES
// ============================================

function CSVTable({
  name,
  description,
  purpose,
  columns,
  examples,
}: {
  name: string;
  description: string;
  purpose: string;
  columns: { name: string; type: string; desc: string }[];
  examples: string[][];
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-4">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 border-b border-gray-200">
        <div className="font-mono text-blue-700 font-semibold text-lg">{name}</div>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
        <div className="mt-2 bg-white/50 rounded px-2 py-1 inline-block">
          <span className="text-xs font-semibold text-blue-600">PURPOSE:</span>
          <span className="text-xs text-gray-700 ml-1">{purpose}</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Column Definitions
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {columns.map((col) => (
            <div key={col.name} className="bg-gray-50 rounded p-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-purple-600 font-semibold">{col.name}</span>
                <span className="text-xs text-gray-400">({col.type})</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{col.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Example Data
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((col) => (
                  <th key={col.name} className="px-3 py-2 text-left text-gray-600 font-medium whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {examples.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {cell.length > 30 ? cell.substring(0, 27) + '...' : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INTERFACE TABLE
// ============================================

function InterfaceTable({
  name,
  fields,
  description,
}: {
  name: string;
  fields: { name: string; type: string; required: boolean; desc: string }[];
  description?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-4">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <span className="text-purple-600 font-mono text-sm">interface</span>{' '}
        <span className="text-blue-600 font-mono font-bold">{name}</span>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Field</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Required</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fields.map((field) => (
              <tr key={field.name}>
                <td className="px-4 py-2 font-mono text-blue-700">{field.name}</td>
                <td className="px-4 py-2 font-mono text-green-700">{field.type}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      field.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {field.required ? 'required' : 'optional'}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600">{field.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// SECTION COMPONENTS
// ============================================

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-8 scroll-mt-20">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

// ============================================
// MERMAID DIAGRAM COMPONENT
// ============================================

function MermaidDiagram({ chart, title, height = 'auto' }: { chart: string; title?: string; height?: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // @ts-expect-error mermaid loaded from CDN
        if (window.mermaid) {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          // @ts-expect-error mermaid loaded from CDN
          const { svg } = await window.mermaid.render(id, chart);
          setSvg(svg);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    const checkMermaid = setInterval(() => {
      // @ts-expect-error mermaid loaded from CDN
      if (window.mermaid) {
        clearInterval(checkMermaid);
        renderDiagram();
      }
    }, 100);

    return () => clearInterval(checkMermaid);
  }, [chart]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="text-red-600 text-sm">Diagram Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 my-4 overflow-auto" style={{ minHeight: height }}>
      {title && <div className="text-sm font-semibold text-gray-700 mb-4">{title}</div>}
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />
      ) : (
        <div className="text-gray-400 text-center py-12">Loading diagram...</div>
      )}
    </div>
  );
}

// ============================================
// CODE SNIPPETS
// ============================================

const CODE_SNIPPETS = {
  // Frontend Components
  spreadLineChart: `'use client';

/**
 * SpreadLineChart - React Wrapper for D3 Visualization
 *
 * CRITICAL RENDERING SEPARATION:
 * - React re-renders ONLY when: data, config, or resetKey changes
 * - D3 handles ALL other updates: filtering, block expansion, hover, brush
 */

import { useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { SpreadLinesVisualizer } from './SpreadLineVisualizer';
import { SpreadLineData, SpreadLineConfig, createDefaultConfig } from './types';

interface SpreadLineChartProps {
  data: SpreadLineData;
  config?: Partial<SpreadLineConfig>;
  onBlockExpand?: (blockId: number, expanded: boolean) => void;
  onFilterChange?: (filteredNames: string[]) => void;
  className?: string;
  resetKey?: number;
  yearsFilter?: number;
  crossingOnly?: boolean;
}

export default function SpreadLineChart({
  data,
  config,
  onBlockExpand,
  onFilterChange,
  className = '',
  resetKey = 0,
  yearsFilter = 1,
  crossingOnly = false,
}: SpreadLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const visualizerRef = useRef<SpreadLinesVisualizer | null>(null);

  // Initialize visualization
  const initVisualization = useCallback(() => {
    if (!svgRef.current || !data) return;

    // Destroy existing
    visualizerRef.current?.destroy();
    svgRef.current.innerHTML = '';

    // Create merged config
    const mergedConfig = { ...createDefaultConfig(), ...config };

    // Create and render visualizer
    const visualizer = new SpreadLinesVisualizer(data, mergedConfig);
    visualizer.onBlockExpand = onBlockExpand;
    visualizer.onFilterChange = onFilterChange;
    visualizer.visualize(svgRef.current);
    visualizer.applyFilter(yearsFilter, crossingOnly);

    visualizerRef.current = visualizer;
  }, [data, config]);

  useEffect(() => {
    initVisualization();
    return () => visualizerRef.current?.destroy();
  }, [initVisualization, resetKey]);

  // Handle filter changes via D3 (not React re-render)
  useEffect(() => {
    visualizerRef.current?.applyFilter(yearsFilter, crossingOnly);
  }, [yearsFilter, crossingOnly]);

  return (
    <div className={\`spreadline-chart \${className}\`}>
      <svg ref={svgRef} className="spreadline-svg" />
    </div>
  );
}`,

  visualizerCore: `/**
 * SpreadLineVisualizer - Main D3 Visualization Class
 *
 * Handles all D3-based rendering and interactions:
 * - SVG element creation and management
 * - Transitions and animations (500ms, easeQuadInOut)
 * - Event handling (hover, click, brush)
 * - Force simulation for collision detection
 */

export class SpreadLinesVisualizer {
  data: SpreadLineData;
  config: SpreadLineConfig;
  storylines: Storyline[];

  // Layout constants
  margin = { top: 40, right: 20, bottom: 20, left: 150 };
  _BAND_WIDTH: number;
  _EGO: string;

  // State management
  visibility: Record<string, boolean> = {};
  members = { slider: [], crossing: [], pinned: [] };
  actors: Record<number, Expander | Collapser> = {};

  // Callbacks for React integration
  onFilterChange?: (filteredNames: string[]) => void;
  onBlockExpand?: (blockId: number, expanded: boolean) => void;

  constructor(json: SpreadLineData, config?: Partial<SpreadLineConfig>) {
    this.data = json;
    this.config = { ...createDefaultConfig(), ...config };
    this.storylines = json.storylines.map(s => ({ ...s }));
    this._BAND_WIDTH = json.bandWidth;
    this._EGO = json.ego;
  }

  /**
   * Main visualization entry point
   */
  visualize(container: SVGSVGElement | string): void {
    // Setup D3 selections
    this.chartContainer = d3.select(container);

    // Calculate dimensions
    const timeLabels = this.data.timeLabels;
    const heightExtents = this.data.heightExtents;

    this.chartContainer
      .attr('width', Math.max(...timeLabels.map(d => d.posX)) + 250)
      .attr('height', heightExtents[1] + 150);

    // Initialize visibility
    this.data.storylines.forEach(d => (this.visibility[d.name] = true));

    // Draw all components
    this._drawBackground();
    this._activateBrush(timeLabels, this.data.blocks);
    this._drawLineLegend();
    this._drawNodeLegend();
    this._drawStorylines();
    this._drawBlocksAndPoints();
    this._drawLabels();
  }
}`,

  visualizerStorylines: `/**
 * Draw storyline paths, markers, and interactions
 */
private _drawStorylines(): void {
  const self = this;

  this.chartContainer
    .append('g')
    .attr('id', 'storyline-container')
    .attr('transform', \`translate(\${this.margin.left}, \${this.margin.top + 80})\`)
    .selectAll('g')
    .data(this.data.storylines)
    .join(enter => {
      const container = enter
        .append('g')
        .attr('class', d => (d.name === this._EGO ? 'storyline-ego' : 'storyline-alter'))
        .style('cursor', d => (d.name === this._EGO ? 'default' : 'pointer'));

      // Path segments (the actual lines)
      container
        .append('g')
        .attr('stroke', d => d.color)
        .attr('name', d => d.name)
        .attr('class', d => \`line-\${d.id} line-filter\`)
        .selectAll('path')
        .data(d => d.lines)
        .join('path')
        .attr('d', e => e)
        .attr('class', 'movable path-movable');

      // Entry/exit markers (triangles)
      container
        .append('g')
        .attr('fill', d => d.color)
        .attr('class', d => \`line-\${d.id} marks\`)
        .selectAll('path')
        .data(d => d.marks)
        .join('path')
        .attr('class', 'symbol-movable')
        .attr('d', d3.symbol().type(d3.symbolTriangle).size(e => e.size))
        .attr('transform', (e, idx) =>
          idx % 2 === 0
            ? \`translate(\${e.posX}, \${e.posY}) rotate(90)\`
            : \`translate(\${e.posX}, \${e.posY}) rotate(-90)\`
        );

      return container;
    })
    .on('mouseover', (event, d) => self._lineHover(event, d))
    .on('click', (event, d) => self._linePin(d))
    .on('mouseout', (event, d) => self._lineHoverOut(event, d));
}`,

  expander: `/**
 * Expander - Block Expansion Animation Handler
 *
 * Handles the expansion animation when a block is clicked:
 * - Shifts elements to the right
 * - Creates fill lines for storylines
 * - Expands block background
 * - Uses D3 force simulation for collision detection
 */

export class Expander {
  data: Block;
  posX: number;
  blockWidth: number;
  duration = 500;
  ego: string;

  constructor(block: Block, posX: number, bandWidth: number, ...) {
    this.data = block;
    this.posX = posX;
    this.blockWidth = bandWidth;
    this.growAnimation = d3.transition()
      .duration(this.duration)
      .ease(d3.easeQuadInOut);
  }

  /**
   * Main expand action - coordinates all expansion animations
   */
  act(): void {
    const moveX = this.data.moveX;

    // Shift movable elements to the right
    d3.selectAll('.movable')
      .filter(function() {
        const elem = this as SVGGraphicsElement;
        return elem.getBBox().x >= this.posX;
      })
      .each(this.expandTranslate);

    this._fillDummyLines(this.data.id);
    this._expandBlock(this.data.id);
    this._contextualize(this.data.id);  // Force simulation
    this._updateBrush();
  }

  /**
   * Apply D3 force simulation for collision detection
   */
  private _contextualize(id: number): void {
    const nodes = pointSelection.data().map(d => ({
      ...d,
      x: _compute_embedding(d.scaleX, length),
      y: _compute_embedding(d.scaleY, length),
      width: d.name === ego ? 10 : 6,
      height: d.name === ego ? 10 : 6,
    }));

    // Force simulation prevents node overlap
    const simulation = d3.forceSimulation(nodes)
      .force('x', d3.forceX(d => d.x))
      .force('y', d3.forceY(d => d.y))
      .force('collide', d3.forceCollide(d => d.width))
      .stop();

    // Run simulation
    for (let i = 0; i < 300; ++i) simulation.tick();

    // Animate nodes to final positions
    pointSelection
      .transition(animation)
      .attr('cx', (_, i) => nodes[i].x)
      .attr('cy', (_, i) => baseline + nodes[i].y);
  }
}`,

  // Backend Modules
  typesPath: `/**
 * D3-style SVG path generator
 * Replicates most of d3.path() functionality
 */
export class Path {
  startX: number | null = null;
  startY: number | null = null;
  endX: number | null = null;
  endY: number | null = null;
  str: string = '';
  curve: number = 0.5;

  toString(): string {
    return this.str;
  }

  moveTo(x: number, y: number): this {
    this.startX = +x;
    this.startY = +y;
    this.endX = +x;
    this.endY = +y;
    this.str += \`M\${+x},\${+y}\`;
    return this;
  }

  lineTo(x: number, y: number): this {
    this.endX = +x;
    this.endY = +y;
    this.str += \`L\${this.endX}, \${this.endY}\`;
    return this;
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    this.endX = +x;
    this.endY = +y;
    this.str += \`C\${+x1}, \${+y1}, \${+x2}, \${+y2}, \${this.endX}, \${this.endY}\`;
    return this;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, ccw: number = 0): this {
    // Complex arc calculation for SVG A command
    const dx = radius * Math.cos(startAngle);
    const dy = radius * Math.sin(startAngle);
    const x0 = x + dx;
    const y0 = y + dy;

    // ... arc path generation
    this.str += \`A\${radius},\${radius},0,\${largeArc},\${sweep},\${endX},\${endY}\`;
    return this;
  }
}`,

  typesNode: `/**
 * Represents an entity at a specific timestamp within a session
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

  /**
   * Get the order of this node in the previous timestamp
   * Used by barycenter algorithm
   */
  getBarycenterLeaf(nodes: Node[]): number {
    const prevNode = this.findSelf(nodes);
    return prevNode ? prevNode.order : this.order;
  }

  /**
   * Find yourself at a different timestamp
   */
  findSelf(nodes: Node[]): Node | null {
    return nodes.find(n => n.name === this.name) || null;
  }
}`,

  typesSession: `/**
 * Represents a snapshot of interactions at one timestamp
 */
export class Session {
  id: number;
  entities: Node[];
  entityWeight: number;
  constraints: any[];
  type: 'contact' | 'idle';
  weight: number;
  timestamp: number;
  hops: string[][];  // [[top-2-hop], [1-hop source], [ego], [1-hop target], [bottom-2-hop]]
  links: [string, string, number][];
  barycenter: number;

  constructor(
    sessionID: number = 0,
    entities: Node[] = [],
    form: 'contact' | 'idle' = 'contact',
    timestamp: number = -1
  ) {
    this.id = sessionID;
    this.entities = entities;
    this.entityWeight = entities.length;
    this.type = form;
    this.timestamp = timestamp;
    this.hops = [];
    this.links = [];
    this.barycenter = 0;
  }

  /**
   * Get hop identity for an entity (0-4)
   * Used to determine visual grouping
   */
  getIdentity(name: string): number {
    for (let idx = 0; idx < this.hops.length; idx++) {
      if (this.hops[idx].includes(name)) return idx;
    }
    return -1;
  }

  findNode(name: string): Node | null {
    return this.entities.find(e => e.name === name) || null;
  }

  getEntityIDs(): number[] {
    return this.entities.map(node => node.id);
  }
}`,

  orderMain: `/**
 * Main ordering function - performs barycenter algorithm
 * with forward/backward sweeping
 *
 * The barycenter heuristic positions each entity at the
 * average position of its connected neighbors to minimize
 * edge crossings.
 *
 * @param liner - SpreadLine instance
 * @param iteration - Number of sweeps (default 10)
 */
export function ordering(
  liner: SpreadLine,
  iteration: number = 10
): [number[][], number[][], number[][], number[][]] {
  let sessionsPerTimestamp = bundleEntitiesByTimestamp(liner);
  const numTimestamps = liner._counts.numTimestamps;

  // Forward and backward sweeping
  for (let iter = 0; iter < iteration; iter++) {
    // Forward sweep: left to right
    for (let cIdx = 0; cIdx < numTimestamps - 1; cIdx++) {
      const currentSessions = sessionsPerTimestamp[cIdx];
      const nextSessions = sessionsPerTimestamp[cIdx + 1];
      sessionsPerTimestamp[cIdx + 1] = constrainedCrossingReduction(
        currentSessions,
        nextSessions
      );
    }

    // Backward sweep: right to left
    for (let cIdx = numTimestamps - 1; cIdx > 0; cIdx--) {
      const currentSessions = sessionsPerTimestamp[cIdx];
      const prevSessions = sessionsPerTimestamp[cIdx - 1];
      sessionsPerTimestamp[cIdx - 1] = constrainedCrossingReduction(
        currentSessions,
        prevSessions
      );
    }
  }

  // Build order tables from final session arrangement
  return buildOrderTables(sessionsPerTimestamp, liner);
}`,

  orderBarycenter: `/**
 * Barycenter sort - order sessions based on connected neighbors
 *
 * For each session, calculate barycenter as the average order
 * of entities that exist in the previous/next timestamp.
 * Then sort sessions by their barycenter values.
 */
function barycenterSort(currNodes: Node[], nextSessions: Session[]): Session[] {
  for (const session of nextSessions) {
    // Find entities that exist in current timestamp
    const existed = session.entities
      .map(node => node.findSelf(currNodes))
      .filter(n => n !== null) as Node[];

    // Calculate barycenter as average order
    const barycenter = existed.reduce((sum, node) => sum + node.order, 0);
    session.barycenter = barycenter / session.entityWeight;
  }

  // Sort sessions by barycenter (low to high)
  nextSessions.sort((a, b) => a.barycenter - b.barycenter);

  // Update node orders based on new session order
  const allNodes = nextSessions.flatMap(session => session.entities);
  for (const session of nextSessions) {
    for (const node of session.entities) {
      node.order = allNodes.indexOf(node);
    }
  }

  return nextSessions;
}`,

  alignMain: `/**
 * Main aligning function using Longest Common Subsequence
 *
 * Uses LCS dynamic programming to find the alignment that
 * maximizes straight lines between consecutive timestamps.
 * Ego always has infinite reward to ensure a straight line.
 *
 * @param liner - SpreadLine instance
 * @param orderedEntities - Ordered entity indices per timestamp
 * @returns [alignTable, sessionAlignTable]
 */
export function aligning(
  liner: SpreadLine,
  orderedEntities: number[][],
  orderedIdleEntities: number[][]
): [number[][], Record<number, number>[]] {
  const [numEntities, numTimestamps] = liner.span;

  // Compute rewards for each possible alignment
  const rewards = computeRewards(liner, orderedEntities, orderedIdleEntities);

  // Initialize align table with -1 (no alignment)
  const alignTable = full2D(numEntities, numTimestamps, -1);

  // Process each consecutive timestamp pair
  for (let cIdx = 0; cIdx < numTimestamps - 1; cIdx++) {
    // Find optimal alignment using LCS
    const alignment = longestCommonSubstring(
      orderedEntities[cIdx].length,
      orderedEntities[cIdx + 1].length,
      rewards[cIdx]
    );

    // Populate align table with results
    for (const [currEnt, nextEnt] of Object.entries(alignment)) {
      const currEntityIdx = orderedEntities[cIdx][+currEnt];
      const nextEntityIdx = orderedEntities[cIdx + 1][nextEnt];
      alignTable[currEntityIdx][cIdx] = nextEntityIdx;
    }
  }

  return [alignTable, alignSessions(liner, alignTable, orderedEntities)];
}`,

  alignLCS: `/**
 * Longest Common Substring using dynamic programming
 *
 * Builds a match table where matchTable[i][j] represents
 * the maximum reward achievable aligning first i entities
 * from current with first j entities from next.
 *
 * Direction table tracks which choice was made for backtracking.
 */
function longestCommonSubstring(
  currLength: number,
  nextLength: number,
  reward: number[][]
): Record<number, number> {
  // Initialize tables
  const matchTable: Record<number, Record<number, number>> = {};
  const direction: Record<number, Record<number, number>> = {};

  for (let i = 0; i < currLength; i++) {
    matchTable[i] = {};
    direction[i] = {};

    for (let j = 0; j < nextLength; j++) {
      const candidates = [
        (matchTable[i-1]?.[j-1] ?? 0) + reward[i][j],  // Align i with j
        matchTable[i]?.[j-1] ?? 0,                      // Skip j
        matchTable[i-1]?.[j] ?? 0                       // Skip i
      ];

      const maxValue = Math.max(...candidates);
      matchTable[i][j] = maxValue;
      direction[i][j] = candidates.indexOf(maxValue);
    }
  }

  // Backtrack to build alignment
  const alignTable: Record<number, number> = {};
  let currPtr = currLength - 1;
  let nextPtr = nextLength - 1;

  while (currPtr >= 0 && nextPtr >= 0) {
    const dir = direction[currPtr][nextPtr];
    if (dir === 0) {
      alignTable[currPtr] = nextPtr;  // These are aligned
      currPtr--;
      nextPtr--;
    } else if (dir === 1) {
      nextPtr--;  // j not aligned
    } else {
      currPtr--;  // i not aligned
    }
  }

  return alignTable;
}`,

  compactMain: `/**
 * SpreadLine Compact - Minimizes whitespace while maintaining clarity
 *
 * Assigns Y-positions to entities to minimize either:
 * - 'space': Total vertical space used
 * - 'line': Number of line direction changes (wiggles)
 *
 * Uses 5 strategies for positioning "idle" entities
 * (entities passing through but not in the current session).
 */

// Distance constants
const DISTANCE_LINE = 5;      // Between lines
const DISTANCE_HOP = 10;      // Between hop levels
const DISTANCE_SESSION = 5;   // Between ego and idle sessions

/**
 * Main compacting function
 */
export function compacting(
  liner: SpreadLine,
  orderedEntities: number[][],
  orderedSessions: number[][],
  sessionAlignTable: Record<number, number>[]
): [number[][], Record<number, number>[][]] {
  // Build slots for session positioning
  const [slots, slotsDetails, egoSlotIdx] = constructSlots(
    liner, orderedEntities, orderedSessions, sessionAlignTable
  );

  // Assign Y positions based on minimize mode
  const extentsTable = assignYPositions(liner, slots, slotsDetails, egoSlotIdx);

  // Handle idle entities with 5 strategies
  const idlePositions = positionIdleEntities(liner, extentsTable);

  return [extentsTable, idlePositions];
}`,

  compactStrategies: `/**
 * 5 Strategies for positioning idle entities
 *
 * When an entity is not in the current session but their line
 * needs to pass through, these strategies find a valid position:
 */

// Strategy 1: Simple Insert
// Just slot them in if there's space between existing entities
function simpleInsert(entity: number, extents: number[]): number | null {
  // Find gap in existing positions
  for (let i = 0; i < extents.length - 1; i++) {
    const gap = extents[i + 1] - extents[i];
    if (gap > DISTANCE_LINE * 2) {
      return extents[i] + DISTANCE_LINE;
    }
  }
  return null;
}

// Strategy 2: Simple Push
// Push other idle entities to make room
function simplePush(entity: number, extents: number[], side: 'above' | 'below'): number {
  if (side === 'above') {
    // Push entities up
    const newPos = extents[0] - DISTANCE_LINE;
    return newPos;
  } else {
    // Push entities down
    const newPos = extents[extents.length - 1] + DISTANCE_LINE;
    return newPos;
  }
}

// Strategy 3: Whole Block Push
// Move an entire session block to make room
function wholeBlockPush(session: Session, direction: 'up' | 'down'): void {
  const offset = direction === 'up' ? -DISTANCE_HOP : DISTANCE_HOP;
  session.entities.forEach(node => {
    node.posY += offset;
  });
}

// Strategy 4: Partial Block Push
// Move only part of a session block
function partialBlockPush(session: Session, startIdx: number, direction: 'up' | 'down'): void {
  const offset = direction === 'up' ? -DISTANCE_LINE : DISTANCE_LINE;
  for (let i = startIdx; i < session.entities.length; i++) {
    session.entities[i].posY += offset;
  }
}

// Strategy 5: Last Resort
// Find any available position
function lastResort(entity: number, allPositions: number[]): number {
  // Place at the extreme (top or bottom)
  return Math.max(...allPositions) + DISTANCE_HOP;
}`,

  renderMain: `/**
 * SpreadLine Render - Converts optimized layout into SVG-ready JSON
 *
 * Takes the computed positions and generates:
 * - Time labels and positions
 * - Storyline paths (bezier curves for bends)
 * - Block outlines (arc paths for pill shapes)
 * - Point positions for expanded view
 * - Entry/exit markers (triangles)
 * - Labels and inline labels
 */
export function rendering(
  liner: SpreadLine,
  extentsTable: number[][],
  contextResult: ContextResult
): SpreadLineResult {
  const result: SpreadLineResult = {
    bandWidth: liner._config.bandWidth,
    blockWidth: liner._config.blockWidth,
    ego: liner.ego,
    timeLabels: computeTimeLabels(liner),
    heightExtents: computeHeightExtents(extentsTable),
    storylines: [],
    blocks: [],
  };

  // Generate storyline paths
  for (const entity of liner.entities) {
    const storyline = renderStoryline(entity, liner, extentsTable);
    result.storylines.push(storyline);
  }

  // Generate block outlines
  for (const session of liner.getContactSessions()) {
    const block = renderBlock(session, liner, extentsTable, contextResult);
    result.blocks.push(block);
  }

  return result;
}`,

  renderBezier: `/**
 * Compute bezier control points for curved lines
 *
 * When a line needs to bend (entity moves to different Y position),
 * we use cubic bezier curves for smooth transitions.
 */
function computeBezierLine(start: number[], end: number[]): [number[], number[]] {
  const width = Math.abs(end[0] - start[0]);
  const height = Math.abs(end[1] - start[1]);
  const ratio = height > 0 ? width / height : Infinity;

  if (ratio >= 0) {
    // Use horizontal ease curve
    const midX = (start[0] + end[0]) * 0.5;
    const control1 = [midX, start[1]];
    const control2 = [midX, end[1]];
    return [control1, control2];
  }

  return [[start[0], start[1]], [end[0], end[1]]];
}

/**
 * Generate SVG path string for a storyline segment
 */
function renderStorylineSegment(
  startX: number, startY: number,
  endX: number, endY: number
): string {
  if (startY === endY) {
    // Straight horizontal line
    return \`M\${startX},\${startY} L\${endX},\${endY}\`;
  }

  // Curved line using bezier
  const [ctrl1, ctrl2] = computeBezierLine([startX, startY], [endX, endY]);
  return \`M\${startX},\${startY} C\${ctrl1.join(',')}, \${ctrl2.join(',')}, \${endX},\${endY}\`;
}`,

  renderBlock: `/**
 * Compute block outline shape (pill shape with arcs)
 *
 * Blocks are rendered as pill shapes:
 * - Left arc (semicircle on left)
 * - Right arc (semicircle on right)
 * - Top and bottom bars (horizontal lines, hidden until expanded)
 */
function computeBlock(
  points: PointResult[],
  hops: number[][],
  blockWidth: number
): [Record<string, any>, number] {
  const radius = blockWidth / 2;

  // Find top and bottom points
  const extents = getExtents(points, p => p.posY);
  const [topPosY, bottomPosY] = extents;
  const posX = points[0].posX;
  const height = Math.abs(bottomPosY.posY - topPosY.posY);

  // Create arcs using Path class
  const leftArc = new Path();
  const rightArc = new Path();

  // Left arc: top semicircle going down
  leftArc.arc(posX, topPosY.posY, radius, Math.PI * 1.5, Math.PI, 1);

  // Continue down the left side...
  // (complex arc logic for hop levels omitted for brevity)

  // Bottom arc
  leftArc.arc(posX, bottomPosY.posY, radius, Math.PI, Math.PI * 0.5, 1);

  // Right arc: mirror of left
  rightArc.arc(posX, topPosY.posY, radius, Math.PI * 1.5, 0);
  // ...

  return {
    left: leftArc.toString(),
    right: rightArc.toString(),
    top: topBar.toString(),
    bottom: bottomBar.toString(),
  };
}`,

  resultInterfaces: `/**
 * Result interfaces for the SpreadLine output
 */

export interface SpreadLineResult {
  bandWidth: number;           // Width of each time column
  blockWidth: number;          // Width of pill outlines (default 40)
  ego: string;                 // Central entity name
  timeLabels: TimeLabel[];     // Year labels and positions
  heightExtents: [number, number];  // Min and max Y coordinates
  storylines: StorylineResult[];    // Entity line data
  blocks: BlockResult[];            // Session block data
  mode?: string;               // Visualization mode
  reference?: any[];           // Reference labels for expanded blocks
}

export interface StorylineResult {
  name: string;                // Person name
  id: number;                  // Entity index
  color: string;               // Line color (hex)
  lifespan: number;            // Years active
  crossingCheck: boolean;      // Crosses blocks without membership
  lines: string[];             // SVG path strings
  marks: MarkResult[];         // Entry/exit triangles
  label: LabelResult;          // Name label position
  inlineLabels: InlineLabelResult[];  // Labels on the line
}

export interface BlockResult {
  id: number;                  // Block index
  time: string;                // Year label
  moveX: number;               // Expansion width when clicked
  topPosY: number;             // Top Y position
  names: string[];             // People in this session
  points: PointResult[];       // Node positions with scaleX/scaleY
  relations: [number, number][];  // Connection pairs
  outline: {                   // SVG arc paths
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
}

export interface PointResult {
  id: number;
  posX: number;
  posY: number;
  name: string;
  group: number;               // Block ID
  scaleX?: number;             // Normalized X for topic space (0-1)
  scaleY?: number;             // Normalized Y for topic space (0-1)
  label?: string | number;     // Citation count
  visibility: string;
}`,
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function TechnicalDesignDocumentV5() {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      // @ts-expect-error mermaid loaded from CDN
      window.mermaid?.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map((item) => document.getElementById(item.id));
      const scrollPos = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(tableOfContents[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">
                Technical Design Document <span className="text-yellow-300">v5</span>
              </h1>
              <p className="text-indigo-100 text-sm">SpreadLine - Complete Reference with Code</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/frontend3/demo"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium backdrop-blur"
              >
                Live Demo
              </Link>
              <Link
                href="/spreadline-design4"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium"
              >
                v4
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0">
          <nav className="sticky top-24 bg-white rounded-lg border border-gray-200 shadow-sm p-4 max-h-[calc(100vh-8rem)] overflow-auto">
            <div className="text-sm font-semibold text-gray-900 mb-3">Table of Contents</div>
            <ul className="space-y-0.5">
              {tableOfContents.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block py-1.5 text-sm transition-colors rounded px-2 ${
                      item.level === 2 ? 'pl-5' : ''
                    } ${
                      activeSection === item.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

            {/* ============================================ */}
            {/* SECTION 1: OVERVIEW */}
            {/* ============================================ */}
            <Section id="overview" title="1. Overview">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What is SpreadLine?</h3>
                <p className="text-gray-700 mb-4">
                  SpreadLine is a visualization tool that shows <strong>how one person connects with others over time</strong>.
                  Think of it like a subway map where:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">&#9679;</span>
                    <span>Each <strong>horizontal line</strong> is a person</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">&#9679;</span>
                    <span>Each <strong>vertical column</strong> is a year</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">&#9679;</span>
                    <span>The <strong>pill-shaped blocks</strong> show when people worked together</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="font-semibold text-green-800 mb-2">v5 Enhancement: Code References</div>
                <p className="text-green-700 text-sm">
                  This version includes <strong>expandable code blocks</strong> throughout the document.
                  Click on any code section to see the actual implementation with syntax highlighting.
                </p>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 2: VISUAL GUIDE */}
            {/* ============================================ */}
            <Section id="visual-guide" title="2. Visual Guide">

              <SubSection id="visual-anatomy" title="2.1 Anatomy of SpreadLine">
                <AnnotatedImage
                  src="/tdd/pill2.png"
                  alt="SpreadLine visualization anatomy"
                  annotations={[
                    { x: '3%', y: '18%', label: 'Time Labels', description: 'Years across the top', color: 'bg-blue-500' },
                    { x: '3%', y: '28%', label: 'External Zone', description: 'Collaborators from different institutions', color: 'bg-teal-500' },
                    { x: '2%', y: '55%', label: 'Ego Line', description: 'The central person (thick dark line)', color: 'bg-gray-700' },
                    { x: '3%', y: '72%', label: 'Internal Zone', description: 'Colleagues from same institution', color: 'bg-orange-500' },
                    { x: '25%', y: '50%', label: 'Session Block', description: 'People who collaborated at this time', color: 'bg-purple-500' },
                  ]}
                  caption="The SpreadLine visualization showing Jeffrey Heer's collaboration network"
                />
              </SubSection>

              <SubSection id="visual-block-expansion" title="2.2 Block Expansion Deep Dive">
                <p className="text-gray-700 mb-4">
                  When you click on a pill-shaped block, it expands to reveal a <strong>Research Topic Map</strong>.
                </p>

                <AnnotatedImage
                  src="/tdd/x1.png"
                  alt="Expanded block showing research topic space"
                  annotations={[
                    { x: '12%', y: '45%', label: 'Expanded Block', description: 'White area reveals internal structure', color: 'bg-purple-500' },
                    { x: '8%', y: '55%', label: 'Author Nodes', description: 'Each dot is an author positioned by research area', color: 'bg-blue-500' },
                  ]}
                  caption="Expanded block showing research topic map"
                />

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 my-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Understanding the Research Topic Map</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="font-semibold text-purple-700 mb-2">Position = Topic Similarity</div>
                      <p className="text-gray-700 text-sm">
                        Authors researching similar topics appear closer together.
                        Positions come from PCA dimensionality reduction on paper keywords.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="font-semibold text-blue-700 mb-2">Color = Citation Impact</div>
                      <p className="text-gray-700 text-sm">
                        Higher citations = darker/more saturated dot color.
                        Position is purely about research similarity.
                      </p>
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection id="visual-interactions" title="2.3 Interactions">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li><strong>Click block/year</strong> &#8594; Expand or collapse</li>
                    <li><strong>Hover line</strong> &#8594; Highlight that person</li>
                    <li><strong>Click line</strong> &#8594; Pin that person</li>
                    <li><strong>Drag on timeline</strong> &#8594; Select time range</li>
                  </ul>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 3: ARCHITECTURE */}
            {/* ============================================ */}
            <Section id="architecture" title="3. Architecture">

              <SubSection id="architecture-high-level" title="3.1 High-Level Architecture">
                <MermaidDiagram
                  title="System Overview"
                  height="350px"
                  chart={`
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '14px' }}}%%
flowchart TB
    subgraph Browser["Your Browser"]
        UI["React App"]
        D3["D3.js Visualization"]
    end
    subgraph Server["Next.js Server"]
        API["API Endpoint"]
        PIPE["Processing Pipeline"]
    end
    subgraph Data["Data"]
        CSV["CSV Files"]
    end
    UI --> D3
    UI -->|"Fetches"| API
    API --> PIPE
    PIPE -->|"Reads"| CSV
    style Browser fill:#e0f2fe
    style Server fill:#dcfce7
    style Data fill:#fef3c7
                  `}
                />
              </SubSection>

              <SubSection id="architecture-data-flow" title="3.2 Data Flow">
                <MermaidDiagram
                  title="Request Flow"
                  height="400px"
                  chart={`
sequenceDiagram
    participant You as Browser
    participant API as Server API
    participant Pipe as Pipeline
    participant CSV as CSV Files
    You->>API: GET /api/nodeFetchSpreadLine4
    API->>CSV: Read relations, entities, citations
    CSV-->>API: Raw data
    rect rgb(254, 243, 199)
        API->>Pipe: Process
        Pipe->>Pipe: 1. Order
        Pipe->>Pipe: 2. Align
        Pipe->>Pipe: 3. Compact
        Pipe->>Pipe: 4. Render
    end
    Pipe-->>API: JSON
    API-->>You: Visualization data
                  `}
                />
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 4: COMPONENTS & CODE */}
            {/* ============================================ */}
            <Section id="components" title="4. Components & Code">

              <SubSection id="components-frontend" title="4.1 Frontend Components">
                <p className="text-gray-700 mb-4">
                  The frontend consists of React components that wrap D3.js visualization logic.
                  Click to expand each component&apos;s source code:
                </p>

                <ExpandableCode
                  title="SpreadLineChart.tsx"
                  filePath="app/frontend3/components/SpreadLineChart.tsx"
                  description="React wrapper component - handles lifecycle and passes data to D3"
                  code={CODE_SNIPPETS.spreadLineChart}
                />

                <ExpandableCode
                  title="SpreadLineVisualizer.ts - Core Class"
                  filePath="app/frontend3/components/SpreadLineVisualizer.ts"
                  description="Main D3 visualization class - constructor and visualize method"
                  code={CODE_SNIPPETS.visualizerCore}
                />

                <ExpandableCode
                  title="SpreadLineVisualizer.ts - Drawing Storylines"
                  filePath="app/frontend3/components/SpreadLineVisualizer.ts"
                  description="The _drawStorylines method that creates entity paths and markers"
                  code={CODE_SNIPPETS.visualizerStorylines}
                />

                <ExpandableCode
                  title="Expander.ts"
                  filePath="app/frontend3/components/Expander.ts"
                  description="Handles block expansion animation with D3 force simulation"
                  code={CODE_SNIPPETS.expander}
                />
              </SubSection>

              <SubSection id="components-backend" title="4.2 Backend Modules">
                <p className="text-gray-700 mb-4">
                  The backend processing pipeline transforms raw CSV data into visualization-ready JSON.
                  Each module handles a specific phase of the transformation:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="font-semibold text-blue-700">order.ts</div>
                    <p className="text-sm text-blue-600">Traffic Controller - reduces line crossings</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="font-semibold text-purple-700">align.ts</div>
                    <p className="text-sm text-purple-600">Straightener - maximizes horizontal lines</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="font-semibold text-orange-700">compact.ts</div>
                    <p className="text-sm text-orange-600">Space Saver - minimizes vertical gaps</p>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="font-semibold text-teal-700">render.ts</div>
                    <p className="text-sm text-teal-600">Artist - generates SVG paths</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  See Section 5 for detailed code for each pipeline stage.
                </p>
              </SubSection>

              <SubSection id="components-types" title="4.3 Type Definitions">
                <p className="text-gray-700 mb-4">
                  Core data structures used throughout the pipeline:
                </p>

                <ExpandableCode
                  title="Path Class"
                  filePath="app/api/nodeFetchSpreadLine4/types.ts"
                  description="D3-style SVG path generator - replicates d3.path() functionality"
                  code={CODE_SNIPPETS.typesPath}
                />

                <ExpandableCode
                  title="Node Class"
                  filePath="app/api/nodeFetchSpreadLine4/types.ts"
                  description="Represents an entity at a specific timestamp within a session"
                  code={CODE_SNIPPETS.typesNode}
                />

                <ExpandableCode
                  title="Session Class"
                  filePath="app/api/nodeFetchSpreadLine4/types.ts"
                  description="Represents a snapshot of interactions at one timestamp"
                  code={CODE_SNIPPETS.typesSession}
                />

                <ExpandableCode
                  title="Result Interfaces"
                  filePath="app/api/nodeFetchSpreadLine4/types.ts"
                  description="Output interfaces for SpreadLine, Storyline, Block, and Point results"
                  code={CODE_SNIPPETS.resultInterfaces}
                />
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 5: PROCESSING PIPELINE */}
            {/* ============================================ */}
            <Section id="pipeline" title="5. Processing Pipeline">

              <SubSection id="pipeline-overview" title="5.1 Pipeline Overview">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { num: 1, name: 'Order', desc: 'Reduce crossings', color: 'bg-blue-500' },
                      { num: 2, name: 'Align', desc: 'Maximize straight lines', color: 'bg-purple-500' },
                      { num: 3, name: 'Compact', desc: 'Save space', color: 'bg-orange-500' },
                      { num: 4, name: 'Render', desc: 'Generate SVG', color: 'bg-teal-500' },
                    ].map((step) => (
                      <div key={step.num} className="text-center">
                        <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2`}>
                          {step.num}
                        </div>
                        <div className="font-semibold text-gray-900">{step.name}</div>
                        <div className="text-xs text-gray-600">{step.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </SubSection>

              <SubSection id="pipeline-ordering" title="5.2 Ordering (order.ts)">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-blue-800 mb-2">The Traffic Controller</div>
                  <p className="text-blue-700">
                    Uses the <Tooltip content="Position each node at the average position of its neighbors">barycenter algorithm</Tooltip> with
                    forward/backward sweeping to minimize edge crossings.
                  </p>
                </div>

                <ExpandableCode
                  title="ordering() - Main Function"
                  filePath="app/api/nodeFetchSpreadLine4/order.ts"
                  description="Performs 10 iterations of forward/backward sweeping"
                  code={CODE_SNIPPETS.orderMain}
                />

                <ExpandableCode
                  title="barycenterSort() - Core Algorithm"
                  filePath="app/api/nodeFetchSpreadLine4/order.ts"
                  description="Calculates average neighbor position and sorts sessions"
                  code={CODE_SNIPPETS.orderBarycenter}
                />
              </SubSection>

              <SubSection id="pipeline-aligning" title="5.3 Aligning (align.ts)">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-purple-800 mb-2">The Straightener</div>
                  <p className="text-purple-700">
                    Uses <Tooltip content="Dynamic programming to find optimal alignment">Longest Common Subsequence (LCS)</Tooltip> to
                    maximize straight horizontal lines between timestamps.
                  </p>
                </div>

                <ExpandableCode
                  title="aligning() - Main Function"
                  filePath="app/api/nodeFetchSpreadLine4/align.ts"
                  description="Computes rewards and finds optimal alignment using LCS"
                  code={CODE_SNIPPETS.alignMain}
                />

                <ExpandableCode
                  title="longestCommonSubstring() - LCS Algorithm"
                  filePath="app/api/nodeFetchSpreadLine4/align.ts"
                  description="Dynamic programming implementation with backtracking"
                  code={CODE_SNIPPETS.alignLCS}
                />
              </SubSection>

              <SubSection id="pipeline-compacting" title="5.4 Compacting (compact.ts)">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-orange-800 mb-2">The Space Saver</div>
                  <p className="text-orange-700">
                    Assigns Y-positions to minimize vertical space while using 5 strategies
                    for positioning &quot;idle&quot; entities that pass through without being in the session.
                  </p>
                </div>

                <ExpandableCode
                  title="compacting() - Main Function"
                  filePath="app/api/nodeFetchSpreadLine4/compact.ts"
                  description="Builds slots and assigns Y positions"
                  code={CODE_SNIPPETS.compactMain}
                />

                <ExpandableCode
                  title="5 Strategies for Idle Entities"
                  filePath="app/api/nodeFetchSpreadLine4/compact.ts"
                  description="How idle entities find valid positions"
                  code={CODE_SNIPPETS.compactStrategies}
                />
              </SubSection>

              <SubSection id="pipeline-rendering" title="5.5 Rendering (render.ts)">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-teal-800 mb-2">The Artist</div>
                  <p className="text-teal-700">
                    Converts computed positions into SVG path strings for lines, blocks, and markers.
                    Uses bezier curves for smooth bends.
                  </p>
                </div>

                <ExpandableCode
                  title="rendering() - Main Function"
                  filePath="app/api/nodeFetchSpreadLine4/render.ts"
                  description="Generates the final SpreadLineResult JSON"
                  code={CODE_SNIPPETS.renderMain}
                />

                <ExpandableCode
                  title="Bezier Curve Generation"
                  filePath="app/api/nodeFetchSpreadLine4/render.ts"
                  description="Computing control points for curved lines"
                  code={CODE_SNIPPETS.renderBezier}
                />

                <ExpandableCode
                  title="Block Outline Generation"
                  filePath="app/api/nodeFetchSpreadLine4/render.ts"
                  description="Creating pill-shaped outlines with arcs"
                  code={CODE_SNIPPETS.renderBlock}
                />
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 6: API DESIGN */}
            {/* ============================================ */}
            <Section id="api-design" title="6. API Design">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">GET</span>
                  <code className="text-gray-900">/api/nodeFetchSpreadLine4</code>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4">
                    Returns the complete visualization data for Jeffrey Heer&apos;s collaboration network.
                  </p>
                </div>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 7: DATA MODELS */}
            {/* ============================================ */}
            <Section id="data-models" title="7. Data Models">

              <InterfaceTable
                name="SpreadLineResult"
                description="Main output from the processing pipeline"
                fields={[
                  { name: 'ego', type: 'string', required: true, desc: 'Central entity name' },
                  { name: 'bandWidth', type: 'number', required: true, desc: 'Width of each time column' },
                  { name: 'storylines', type: 'StorylineResult[]', required: true, desc: 'Entity line data' },
                  { name: 'blocks', type: 'BlockResult[]', required: true, desc: 'Session block data' },
                ]}
              />

              <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">CSV Schemas</h4>

              <CSVTable
                name="relations.csv"
                description="Who worked with whom and when"
                purpose="Defines the network edges"
                columns={[
                  { name: 'year', type: 'integer', desc: 'Publication year' },
                  { name: 'source', type: 'string', desc: 'First person' },
                  { name: 'target', type: 'string', desc: 'Second person' },
                  { name: 'citationcount', type: 'float', desc: 'Citations' },
                ]}
                examples={[
                  ['2002', 'Jeffrey Heer', 'Ed H. Chi', '60.0'],
                  ['2005', 'Jeffrey Heer', 'Danah Boyd', '2062.0'],
                ]}
              />

              <CSVTable
                name="content.csv"
                description="Research topic positions for expanded blocks"
                purpose="Pre-computed 2D positions from PCA on paper keywords"
                columns={[
                  { name: 'year', type: 'string', desc: 'Timestamp' },
                  { name: 'name', type: 'string', desc: 'Author name' },
                  { name: 'posX', type: 'float', desc: 'Normalized X (0-1)' },
                  { name: 'posY', type: 'float', desc: 'Normalized Y (0-1)' },
                ]}
                examples={[
                  ['2002', 'Jeffrey Heer', '0.655', '0.592'],
                  ['2002', 'Ed H. Chi', '0.677', '0.625'],
                ]}
              />
            </Section>

            {/* ============================================ */}
            {/* SECTION 8: USER INTERACTIONS */}
            {/* ============================================ */}
            <Section id="interactions" title="8. User Interactions">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Target</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Result</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr><td className="px-4 py-3">Click</td><td className="px-4 py-3">Block</td><td className="px-4 py-3">Expand/collapse</td><td className="px-4 py-3 font-mono text-xs text-blue-600">_blockUpdate()</td></tr>
                    <tr><td className="px-4 py-3">Hover</td><td className="px-4 py-3">Storyline</td><td className="px-4 py-3">Highlight</td><td className="px-4 py-3 font-mono text-xs text-blue-600">_lineHover()</td></tr>
                    <tr><td className="px-4 py-3">Click</td><td className="px-4 py-3">Storyline</td><td className="px-4 py-3">Pin/unpin</td><td className="px-4 py-3 font-mono text-xs text-blue-600">_linePin()</td></tr>
                    <tr><td className="px-4 py-3">Drag</td><td className="px-4 py-3">Timeline</td><td className="px-4 py-3">Brush selection</td><td className="px-4 py-3 font-mono text-xs text-blue-600">_activateBrush()</td></tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 9: ERROR HANDLING */}
            {/* ============================================ */}
            <Section id="error-handling" title="9. Error Handling">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Error</th>
                      <th className="px-3 py-2 text-left">Cause</th>
                      <th className="px-3 py-2 text-left">Handling</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-3 py-2 font-mono text-red-600">CSV not found</td>
                      <td className="px-3 py-2">Data files missing</td>
                      <td className="px-3 py-2">Return 500</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-red-600">Ego not found</td>
                      <td className="px-3 py-2">Ego not in data</td>
                      <td className="px-3 py-2">Return 404</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 10: DEPENDENCIES */}
            {/* ============================================ */}
            <Section id="dependencies" title="10. Dependencies">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Package</th>
                    <th className="px-4 py-2 text-left">Version</th>
                    <th className="px-4 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="px-4 py-2 font-mono text-blue-600">react</td><td className="px-4 py-2">18.x</td><td className="px-4 py-2">UI framework</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-blue-600">d3</td><td className="px-4 py-2">7.x</td><td className="px-4 py-2">SVG visualization</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-blue-600">@tanstack/react-query</td><td className="px-4 py-2">5.x</td><td className="px-4 py-2">Data fetching</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-blue-600">next</td><td className="px-4 py-2">14.x</td><td className="px-4 py-2">Framework</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-blue-600">papaparse</td><td className="px-4 py-2">5.x</td><td className="px-4 py-2">CSV parsing</td></tr>
                </tbody>
              </table>
            </Section>

            {/* ============================================ */}
            {/* SECTION 11: ASSUMPTIONS */}
            {/* ============================================ */}
            <Section id="assumptions" title="11. Assumptions">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ul className="text-green-700 text-sm space-y-1">
                  <li>External API will conform to the defined contract</li>
                  <li>Ego entity always exists with at least one connection</li>
                  <li>Timestamps are discrete (yearly granularity)</li>
                  <li>Single ego per visualization</li>
                </ul>
              </div>
            </Section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p className="font-semibold">Technical Design Document v5 - SpreadLine with Code References</p>
              <p className="mt-1">Last updated: {new Date().toISOString().split('T')[0]}</p>
              <div className="mt-4 flex justify-center gap-4">
                <Link href="/frontend3/demo" className="text-indigo-600 hover:underline">Live Demo</Link>
                <Link href="/spreadline-design4" className="text-indigo-600 hover:underline">v4 Docs</Link>
                <a href="https://arxiv.org/pdf/2408.08992" className="text-indigo-600 hover:underline">Research Paper</a>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

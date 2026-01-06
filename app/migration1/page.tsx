'use client';

/**
 * SpreadLine Migration Guide
 *
 * This document walks you through migrating SpreadLine from server-side to client-side
 * computation in a Next.js/React project. Each step is testable via the browser.
 *
 * Prerequisites:
 * - Next.js 14+ project with App Router
 * - npm install @tanstack/react-query d3
 * - TypeScript configured
 */

import { useState } from 'react';

export default function MigrationGuidePage() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 1, title: 'Step 1: Basic Page Setup', anchor: 'step-1' },
    { id: 2, title: 'Step 2: Add Data Types', anchor: 'step-2' },
    { id: 3, title: 'Step 3: Fetch Raw Data', anchor: 'step-3' },
    { id: 4, title: 'Step 4: Add SpreadLine Core Types', anchor: 'step-4' },
    { id: 5, title: 'Step 5: Add SpreadLine Class', anchor: 'step-5' },
    { id: 6, title: 'Step 6: Compute Layout', anchor: 'step-6' },
    { id: 7, title: 'Step 7: Add D3 Visualization', anchor: 'step-7' },
    { id: 8, title: 'Step 8: Add Interactivity', anchor: 'step-8' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            SpreadLine Migration Guide
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Incremental migration from server to client-side computation
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8 flex flex-wrap gap-2">
          {steps.map(step => (
            <a
              key={step.id}
              href={`#${step.anchor}`}
              onClick={() => setActiveStep(step.id)}
              className={`px-3 py-1.5 rounded text-sm ${
                activeStep === step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}
            >
              {step.title}
            </a>
          ))}
        </nav>

        {/* Content */}
        <div className="space-y-12">
          {/* ========================================== */}
          {/* STEP 1: Basic Page Setup */}
          {/* ========================================== */}
          <section id="step-1" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Step 1: Basic Page Setup
            </h2>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Start with a basic Next.js page that shows loading states. This establishes
                the structure we will build upon.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Create the file</h3>
              <p className="text-gray-600 mb-2">
                Create <code className="bg-gray-100 px-1 rounded">app/spreadline/page.tsx</code>:
              </p>

              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`'use client';

import { useState } from 'react';

export default function SpreadLinePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading for demo
  useState(() => {
    setTimeout(() => setLoading(false), 1000);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold">SpreadLine</h1>
      <p className="text-gray-600 mt-2">Page loaded successfully!</p>
    </div>
  );
}`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">How to test</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Run <code className="bg-gray-100 px-1 rounded">npm run dev</code></li>
                <li>Visit <code className="bg-gray-100 px-1 rounded">http://localhost:3000/spreadline</code></li>
                <li>You should see a loading spinner, then "Page loaded successfully!"</li>
              </ol>
            </div>
          </section>

          {/* ========================================== */}
          {/* STEP 2: Add Data Types */}
          {/* ========================================== */}
          <section id="step-2" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Step 2: Add Data Types
            </h2>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Define TypeScript types for the raw data we will fetch from the API.
                This describes the network topology (who connects to whom over time).
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Add types to page.tsx</h3>
              <p className="text-gray-600 mb-2">
                Add this interface <strong>before</strong> the component:
              </p>

              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Define the shape of raw data from the API
interface RawDataResponse {
  ego: string;                    // The central person (e.g., "Jeffrey Heer")
  dataset: string;                // Dataset name
  topology: {                     // Network connections
    source: string;               // Person A
    target: string;               // Person B
    time: string;                 // When they connected (year)
    weight: number;               // Connection strength
  }[];
  lineColor: {                    // Color for each person's storyline
    entity: string;
    color: string;
  }[];
  groups: Record<string, string[][]>;  // How people are grouped per timestamp
  nodeContext: {                  // Extra info per person per time (e.g., citations)
    entity: string;
    time: string;
    context: number;
  }[];
  config: {                       // Processing configuration
    timeDelta: string;            // Time unit ("year")
    timeFormat: string;           // Format ("%Y")
    squeezeSameCategory: boolean;
    minimize: string;             // Optimization mode
  };
}`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">Full page.tsx so far</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`'use client';

import { useState } from 'react';

// Define the shape of raw data from the API
interface RawDataResponse {
  ego: string;
  dataset: string;
  topology: {
    source: string;
    target: string;
    time: string;
    weight: number;
  }[];
  lineColor: {
    entity: string;
    color: string;
  }[];
  groups: Record<string, string[][]>;
  nodeContext: {
    entity: string;
    time: string;
    context: number;
  }[];
  config: {
    timeDelta: string;
    timeFormat: string;
    squeezeSameCategory: boolean;
    minimize: string;
  };
}

export default function SpreadLinePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    setTimeout(() => setLoading(false), 1000);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold">SpreadLine</h1>
      <p className="text-gray-600 mt-2">Types defined. Ready for data!</p>
    </div>
  );
}`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">How to test</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Save the file</li>
                <li>Check your terminal - TypeScript should compile without errors</li>
                <li>Page should still work as before</li>
              </ol>
            </div>
          </section>

          {/* ========================================== */}
          {/* STEP 3: Fetch Raw Data */}
          {/* ========================================== */}
          <section id="step-3" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Step 3: Fetch Raw Data
            </h2>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Now we fetch data from an API. For testing, we will use hardcoded test data
                that you can later replace with a real API call.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Small test dataset</h3>
              <p className="text-gray-600 mb-2">
                This is a minimal network with 3 people over 2 years:
              </p>

              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Test data - small network with 3 people over 2 years
const TEST_DATA: RawDataResponse = {
  ego: "Alice",
  dataset: "test",
  topology: [
    // Year 2020: Alice connected to Bob and Charlie
    { source: "Alice", target: "Bob", time: "2020", weight: 1 },
    { source: "Alice", target: "Charlie", time: "2020", weight: 1 },
    // Year 2021: Alice connected to Bob (Charlie left)
    { source: "Alice", target: "Bob", time: "2021", weight: 2 },
  ],
  lineColor: [
    { entity: "Alice", color: "#424242" },    // Ego is dark gray
    { entity: "Bob", color: "#FA9902" },      // Colleague is orange
    { entity: "Charlie", color: "#146b6b" },  // Collaborator is teal
  ],
  groups: {
    "2020": [[], ["Bob"], ["Alice"], ["Charlie"], []],
    "2021": [[], ["Bob"], ["Alice"], [], []],
  },
  nodeContext: [
    { entity: "Alice", time: "2020", context: 100 },
    { entity: "Bob", time: "2020", context: 50 },
    { entity: "Charlie", time: "2020", context: 25 },
    { entity: "Alice", time: "2021", context: 150 },
    { entity: "Bob", time: "2021", context: 75 },
  ],
  config: {
    timeDelta: "year",
    timeFormat: "%Y",
    squeezeSameCategory: true,
    minimize: "wiggles",
  },
};`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">Updated page.tsx with data fetching</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`'use client';

import { useState, useEffect } from 'react';

// ... (keep the RawDataResponse interface from Step 2)

interface RawDataResponse {
  ego: string;
  dataset: string;
  topology: { source: string; target: string; time: string; weight: number }[];
  lineColor: { entity: string; color: string }[];
  groups: Record<string, string[][]>;
  nodeContext: { entity: string; time: string; context: number }[];
  config: {
    timeDelta: string;
    timeFormat: string;
    squeezeSameCategory: boolean;
    minimize: string;
  };
}

// Test data - small network
const TEST_DATA: RawDataResponse = {
  ego: "Alice",
  dataset: "test",
  topology: [
    { source: "Alice", target: "Bob", time: "2020", weight: 1 },
    { source: "Alice", target: "Charlie", time: "2020", weight: 1 },
    { source: "Alice", target: "Bob", time: "2021", weight: 2 },
  ],
  lineColor: [
    { entity: "Alice", color: "#424242" },
    { entity: "Bob", color: "#FA9902" },
    { entity: "Charlie", color: "#146b6b" },
  ],
  groups: {
    "2020": [[], ["Bob"], ["Alice"], ["Charlie"], []],
    "2021": [[], ["Bob"], ["Alice"], [], []],
  },
  nodeContext: [
    { entity: "Alice", time: "2020", context: 100 },
    { entity: "Bob", time: "2020", context: 50 },
    { entity: "Charlie", time: "2020", context: 25 },
    { entity: "Alice", time: "2021", context: 150 },
    { entity: "Bob", time: "2021", context: 75 },
  ],
  config: {
    timeDelta: "year",
    timeFormat: "%Y",
    squeezeSameCategory: true,
    minimize: "wiggles",
  },
};

export default function SpreadLinePage() {
  const [rawData, setRawData] = useState<RawDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // For testing, use hardcoded data
        // Replace with: const response = await fetch('/api/spreadline-raw');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network
        setRawData(TEST_DATA);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-700">Fetching raw data...</div>
        </div>
      </div>
    );
  }

  if (error || !rawData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">{error || 'No data'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold">SpreadLine: {rawData.ego}</h1>
      <p className="text-gray-600 mt-2">
        Loaded {rawData.topology.length} connections between{' '}
        {new Set(rawData.topology.flatMap(t => [t.source, t.target])).size} people
      </p>

      {/* Debug: Show raw data */}
      <details className="mt-4">
        <summary className="cursor-pointer text-blue-600">View raw data</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(rawData, null, 2)}
        </pre>
      </details>
    </div>
  );
}`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">How to test</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Save and refresh the page</li>
                <li>You should see "SpreadLine: Alice"</li>
                <li>Click "View raw data" to see the JSON</li>
                <li>Verify: 3 connections, 3 people (Alice, Bob, Charlie)</li>
              </ol>
            </div>
          </section>

          {/* ========================================== */}
          {/* STEP 4: Add SpreadLine Core Types */}
          {/* ========================================== */}
          <section id="step-4" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Step 4: Add SpreadLine Core Types
            </h2>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Create a separate file for SpreadLine types. These describe the output
                of the layout algorithm - where each storyline should be drawn.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Create lib/spreadline/types.ts</h3>
              <p className="text-gray-600 mb-2">
                Create the directory <code className="bg-gray-100 px-1 rounded">lib/spreadline/</code> and add:
              </p>

              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`/**
 * SpreadLine Core Types
 *
 * These describe the OUTPUT of the SpreadLine algorithm:
 * - Where to draw each storyline (SVG path)
 * - Where to place labels and markers
 * - Block (session) outlines
 */

// A single storyline (one person's path through time)
export interface StorylineResult {
  name: string;           // Person's name
  lines: string[];        // SVG path strings (one per time segment)
  marks: MarkResult[];    // Dots showing activity at timestamps
  label: LabelResult;     // Where to show their name
  inlineLabels: InlineLabelResult[];
  color: string;          // Line color
  id: number;
  lifespan: number;       // How many timestamps they're active
  crossingCheck: boolean; // Does this line cross others?
}

// A dot on a storyline
export interface MarkResult {
  posX: number;
  posY: number;
  name: string;
  size: number;
  visibility?: string;
}

// Label position for a storyline
export interface LabelResult {
  posX: number;
  posY: number;
  textAlign: string;
  line: string;           // Connecting line to storyline
  label: string;          // Displayed text (may be truncated)
  fullLabel: string;      // Full name for tooltip
  visibility?: string;
}

// Inline label (shown on the storyline itself)
export interface InlineLabelResult {
  posX: number;
  posY: number;
  name: string;
}

// A block (session) - represents one timestamp's activity
export interface BlockResult {
  id: number;
  time: string;
  outline: any;           // SVG paths for the container shape
  names: string[];        // People in this session
  relations: [number, number][];
  points: PointResult[];  // Positioned nodes in the block
  moveX: number;          // X offset for this block
  topPosY: number;
}

// A positioned node within a block
export interface PointResult {
  id: number;
  posX: number;
  posY: number;
  name: string;
  group: number;          // Which hop group (0-4)
  aggregateGroup: number;
  visibility: string;
  scaleX?: number;
  scaleY?: number;
  label?: string | number;
}

// The complete output of SpreadLine.fit()
export interface SpreadLineResult {
  bandWidth: number;      // Width of each time band
  blockWidth: number;     // Width of each block
  ego: string;
  timeLabels: { label: string; posX: number }[];
  heightExtents: [number, number];
  storylines: StorylineResult[];
  blocks: BlockResult[];
  mode?: string;
  reference?: any[];
}`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">Create lib/spreadline/index.ts</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`/**
 * SpreadLine Library Entry Point
 */

export type {
  StorylineResult,
  MarkResult,
  LabelResult,
  InlineLabelResult,
  BlockResult,
  PointResult,
  SpreadLineResult,
} from './types';`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">How to test</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Create the files in <code className="bg-gray-100 px-1 rounded">lib/spreadline/</code></li>
                <li>TypeScript should compile without errors</li>
                <li>Page should still work (we haven't used the types yet)</li>
              </ol>
            </div>
          </section>

          {/* ========================================== */}
          {/* STEP 5: Add SpreadLine Class (Simplified) */}
          {/* ========================================== */}
          <section id="step-5" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Step 5: Add SpreadLine Class (Simplified)
            </h2>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                The SpreadLine class is the main algorithm. For this migration guide,
                we will use a simplified mock that generates test output. In production,
                copy the full implementation from <code className="bg-gray-100 px-1 rounded">lib/spreadline/spreadline.ts</code>.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Add to lib/spreadline/spreadline.ts</h3>
              <p className="text-gray-600 mb-2">
                This simplified version helps you test the integration:
              </p>

              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`/**
 * SpreadLine Class - Simplified for Migration Testing
 *
 * The full algorithm has 5 phases:
 * 1. load() - Load topology, colors, context data
 * 2. center() - Filter to 2-hop ego network
 * 3. configure() - Set optimization options
 * 4. fit() - Run ordering, aligning, compacting, rendering
 *
 * This simplified version generates mock output for testing.
 */

import { SpreadLineResult, StorylineResult, BlockResult } from './types';

export class SpreadLine {
  private _topo: any[] = [];
  private _lineColor: Record<string, string> = {};
  private _nodeColor: any[] = [];
  private _groups: Record<string, string[][]> = {};
  private _config = {
    timeDelta: 'year',
    timeFormat: '%Y',
    squeezeSameCategory: false,
    minimize: 'space' as const,
  };
  public ego: string = '';

  /**
   * Load data into SpreadLine
   */
  load(
    data: any[],
    config: Record<string, string>,
    key: string = 'topology'
  ): void {
    if (key === 'topology') {
      this._topo = data.map(row => ({
        source: row[config.source || 'source'],
        target: row[config.target || 'target'],
        time: row[config.time || 'time'],
        weight: row[config.weight || 'weight'] || 1,
      }));
    } else if (key === 'line') {
      for (const row of data) {
        this._lineColor[row[config.entity || 'entity']] = row[config.color || 'color'];
      }
    } else if (key === 'node') {
      this._nodeColor = data;
    }
  }

  /**
   * Set the central entity (ego) and build the network
   */
  center(
    ego: string,
    _timeExtents?: [string, string],
    timeDelta: string = 'year',
    timeFormat: string = '%Y',
    groups: Record<string, string[][]> = {}
  ): void {
    this.ego = ego;
    this._config.timeDelta = timeDelta;
    this._config.timeFormat = timeFormat;
    this._groups = groups;
  }

  /**
   * Configure optimization options
   */
  configure(config: { squeezeSameCategory?: boolean; minimize?: string }): void {
    if (config.squeezeSameCategory !== undefined) {
      this._config.squeezeSameCategory = config.squeezeSameCategory;
    }
    if (config.minimize) {
      this._config.minimize = config.minimize as 'space' | 'line' | 'wiggles';
    }
  }

  /**
   * Run the layout algorithm and return renderable data
   */
  fit(width: number = 1400, height: number = 500): SpreadLineResult {
    // Get unique timestamps and entities
    const timestamps = [...new Set(this._topo.map(t => t.time))].sort();
    const entities = [...new Set(this._topo.flatMap(t => [t.source, t.target]))];

    const bandWidth = width / (timestamps.length + 1);
    const entityHeight = height / (entities.length + 2);

    // Generate storylines (one per entity)
    const storylines: StorylineResult[] = entities.map((name, idx) => {
      const yPos = (idx + 1) * entityHeight;
      const color = this._lineColor[name] || '#666666';

      // Build path through active timestamps
      const activeTimestamps = timestamps.filter(t =>
        this._topo.some(row =>
          row.time === t && (row.source === name || row.target === name)
        )
      );

      const pathParts: string[] = [];
      let lastX = 0;

      for (let i = 0; i < activeTimestamps.length; i++) {
        const tIdx = timestamps.indexOf(activeTimestamps[i]);
        const x = (tIdx + 1) * bandWidth;

        if (i === 0) {
          pathParts.push(\`M\${x},\${yPos}\`);
        } else {
          pathParts.push(\`L\${x},\${yPos}\`);
        }
        lastX = x;
      }

      return {
        name,
        id: idx,
        color,
        lines: pathParts.length > 0 ? [pathParts.join(' ')] : [],
        marks: activeTimestamps.map((t, i) => ({
          name,
          posX: (timestamps.indexOf(t) + 1) * bandWidth,
          posY: yPos,
          size: 4,
          visibility: 'visible',
        })),
        label: {
          posX: lastX + 10,
          posY: yPos,
          textAlign: 'start',
          line: '',
          label: name.slice(0, 15),
          fullLabel: name,
          visibility: 'visible',
        },
        inlineLabels: [],
        lifespan: activeTimestamps.length,
        crossingCheck: false,
      };
    });

    // Generate blocks (one per timestamp)
    const blocks: BlockResult[] = timestamps.map((time, tIdx) => {
      const x = (tIdx + 1) * bandWidth;
      const entitiesInBlock = entities.filter(name =>
        this._topo.some(row =>
          row.time === time && (row.source === name || row.target === name)
        )
      );

      return {
        id: tIdx,
        time,
        moveX: x - bandWidth / 4,
        topPosY: entityHeight / 2,
        names: entitiesInBlock,
        relations: [],
        outline: {
          left: \`M\${x - 20},\${entityHeight} L\${x - 20},\${height - entityHeight}\`,
          right: \`M\${x + 20},\${entityHeight} L\${x + 20},\${height - entityHeight}\`,
          top: \`M\${x - 20},\${entityHeight} A20,20 0 0,1 \${x + 20},\${entityHeight}\`,
          bottom: \`M\${x - 20},\${height - entityHeight} A20,20 0 0,0 \${x + 20},\${height - entityHeight}\`,
        },
        points: entitiesInBlock.map((name, pIdx) => ({
          id: pIdx,
          name,
          posX: 0,
          posY: (entities.indexOf(name) + 1) * entityHeight - (tIdx + 1) * bandWidth + bandWidth / 4,
          group: name === this.ego ? 2 : 1,
          aggregateGroup: 0,
          visibility: 'visible',
        })),
      };
    });

    return {
      bandWidth,
      blockWidth: bandWidth / 2,
      ego: this.ego,
      timeLabels: timestamps.map((label, i) => ({
        label,
        posX: (i + 1) * bandWidth,
      })),
      heightExtents: [0, height],
      storylines,
      blocks,
    };
  }
}`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">Update lib/spreadline/index.ts</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`export { SpreadLine } from './spreadline';

export type {
  StorylineResult,
  MarkResult,
  LabelResult,
  InlineLabelResult,
  BlockResult,
  PointResult,
  SpreadLineResult,
} from './types';`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">How to test</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Create <code className="bg-gray-100 px-1 rounded">lib/spreadline/spreadline.ts</code></li>
                <li>Update <code className="bg-gray-100 px-1 rounded">lib/spreadline/index.ts</code></li>
                <li>TypeScript should compile without errors</li>
              </ol>
            </div>
          </section>

          {/* ========================================== */}
          {/* STEP 6: Compute Layout */}
          {/* ========================================== */}
          <section id="step-6" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Step 6: Compute Layout in Browser
            </h2>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Now we connect the pieces: fetch raw data, run SpreadLine, get layout.
                This is the key step - computation happens in the browser!
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Updated page.tsx</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`'use client';

import { useState, useEffect } from 'react';
import { SpreadLine, SpreadLineResult } from '@/lib/spreadline';

// ... (keep RawDataResponse interface and TEST_DATA from Step 3)

interface RawDataResponse {
  ego: string;
  dataset: string;
  topology: { source: string; target: string; time: string; weight: number }[];
  lineColor: { entity: string; color: string }[];
  groups: Record<string, string[][]>;
  nodeContext: { entity: string; time: string; context: number }[];
  config: {
    timeDelta: string;
    timeFormat: string;
    squeezeSameCategory: boolean;
    minimize: string;
  };
}

const TEST_DATA: RawDataResponse = {
  ego: "Alice",
  dataset: "test",
  topology: [
    { source: "Alice", target: "Bob", time: "2020", weight: 1 },
    { source: "Alice", target: "Charlie", time: "2020", weight: 1 },
    { source: "Alice", target: "Bob", time: "2021", weight: 2 },
  ],
  lineColor: [
    { entity: "Alice", color: "#424242" },
    { entity: "Bob", color: "#FA9902" },
    { entity: "Charlie", color: "#146b6b" },
  ],
  groups: {
    "2020": [[], ["Bob"], ["Alice"], ["Charlie"], []],
    "2021": [[], ["Bob"], ["Alice"], [], []],
  },
  nodeContext: [
    { entity: "Alice", time: "2020", context: 100 },
    { entity: "Bob", time: "2020", context: 50 },
    { entity: "Charlie", time: "2020", context: 25 },
    { entity: "Alice", time: "2021", context: 150 },
    { entity: "Bob", time: "2021", context: 75 },
  ],
  config: {
    timeDelta: "year",
    timeFormat: "%Y",
    squeezeSameCategory: true,
    minimize: "wiggles",
  },
};

export default function SpreadLinePage() {
  const [rawData, setRawData] = useState<RawDataResponse | null>(null);
  const [computedData, setComputedData] = useState<SpreadLineResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [computeTime, setComputeTime] = useState<number | null>(null);

  // Step 1: Fetch raw data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        setRawData(TEST_DATA);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Step 2: Compute layout when raw data arrives
  useEffect(() => {
    if (!rawData) return;

    async function computeLayout() {
      try {
        setComputing(true);
        const startTime = performance.now();

        // Create SpreadLine instance
        const spreadline = new SpreadLine();

        // Load topology (network connections)
        spreadline.load(rawData.topology, {
          source: 'source',
          target: 'target',
          time: 'time',
          weight: 'weight',
        }, 'topology');

        // Load line colors
        spreadline.load(rawData.lineColor, {
          entity: 'entity',
          color: 'color',
        }, 'line');

        // Load node context (optional - for node coloring)
        if (rawData.nodeContext?.length > 0) {
          spreadline.load(rawData.nodeContext, {
            entity: 'entity',
            time: 'time',
            context: 'context',
          }, 'node');
        }

        // Set ego and groups
        spreadline.center(
          rawData.ego,
          undefined,
          rawData.config.timeDelta,
          rawData.config.timeFormat,
          rawData.groups
        );

        // Configure optimization
        spreadline.configure({
          squeezeSameCategory: rawData.config.squeezeSameCategory,
          minimize: rawData.config.minimize,
        });

        // Run the algorithm
        const result = spreadline.fit(800, 400);

        const endTime = performance.now();
        setComputeTime(endTime - startTime);
        setComputedData(result);

      } catch (err) {
        console.error('Layout error:', err);
        setError(err instanceof Error ? err.message : 'Layout failed');
      } finally {
        setComputing(false);
      }
    }

    computeLayout();
  }, [rawData]);

  // Loading states
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-700">Fetching data...</div>
        </div>
      </div>
    );
  }

  if (computing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-400 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-700">Computing layout...</div>
        </div>
      </div>
    );
  }

  if (error || !computedData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">{error || 'No data'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold">SpreadLine: {computedData.ego}</h1>
      <p className="text-gray-600 mt-2">
        {computedData.storylines.length} storylines | {computedData.blocks.length} blocks
        {computeTime && <span className="text-green-600 ml-2">
          | Computed in {computeTime.toFixed(0)}ms
        </span>}
      </p>

      {/* Show computed layout info */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Storylines</h3>
          <ul className="text-sm space-y-1">
            {computedData.storylines.map(s => (
              <li key={s.id} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.name} (lifespan: {s.lifespan})
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Time Blocks</h3>
          <ul className="text-sm space-y-1">
            {computedData.blocks.map(b => (
              <li key={b.id}>
                {b.time}: {b.names.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Debug: Show full computed data */}
      <details className="mt-6">
        <summary className="cursor-pointer text-blue-600">View computed data</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(computedData, null, 2)}
        </pre>
      </details>
    </div>
  );
}`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">How to test</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Save and refresh</li>
                <li>You should see "Computed in Xms" (should be under 50ms for test data)</li>
                <li>Verify 3 storylines: Alice, Bob, Charlie</li>
                <li>Verify 2 time blocks: 2020, 2021</li>
                <li>Check Bob is in both blocks, Charlie only in 2020</li>
              </ol>
            </div>
          </section>

          {/* ========================================== */}
          {/* STEP 7: Add D3 Visualization */}
          {/* ========================================== */}
          <section id="step-7" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Step 7: Add D3 Visualization
            </h2>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Now we render the computed layout using D3. This creates SVG paths
                for each storyline based on the positions from SpreadLine.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Install D3</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`npm install d3 @types/d3`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">Add SVG rendering to page.tsx</h3>
              <p className="text-gray-600 mb-2">
                Add this import and ref at the top, then update the return:
              </p>

              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`'use client';

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SpreadLine, SpreadLineResult } from '@/lib/spreadline';

// ... (keep all interfaces and TEST_DATA)

export default function SpreadLinePage() {
  const svgRef = useRef<SVGSVGElement>(null);

  // ... (keep all useState and useEffect hooks)

  // Step 3: Render SVG when computed data is ready
  useEffect(() => {
    if (!svgRef.current || !computedData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 100, bottom: 40, left: 40 };

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

    // Draw time labels
    g.selectAll('.time-label')
      .data(computedData.timeLabels)
      .enter()
      .append('text')
      .attr('class', 'time-label')
      .attr('x', d => d.posX)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .attr('font-size', '14px')
      .text(d => d.label);

    // Draw storylines
    computedData.storylines.forEach(storyline => {
      // Draw path
      if (storyline.lines.length > 0) {
        g.append('path')
          .attr('d', storyline.lines.join(' '))
          .attr('fill', 'none')
          .attr('stroke', storyline.color)
          .attr('stroke-width', 3)
          .attr('stroke-linecap', 'round');
      }

      // Draw marks (dots)
      g.selectAll(\`.mark-\${storyline.id}\`)
        .data(storyline.marks)
        .enter()
        .append('circle')
        .attr('cx', d => d.posX)
        .attr('cy', d => d.posY)
        .attr('r', d => d.size)
        .attr('fill', storyline.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);

      // Draw label
      if (storyline.label.visibility !== 'hidden') {
        g.append('text')
          .attr('x', storyline.label.posX)
          .attr('y', storyline.label.posY)
          .attr('dy', '0.35em')
          .attr('fill', storyline.color)
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(storyline.label.label);
      }
    });

  }, [computedData]);

  // ... (keep loading/error states)

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold">SpreadLine: {computedData.ego}</h1>
      <p className="text-gray-600 mt-2">
        {computedData.storylines.length} storylines | {computedData.blocks.length} blocks
        {computeTime && <span className="text-green-600 ml-2">
          | Computed in {computeTime.toFixed(0)}ms
        </span>}
      </p>

      {/* SVG Visualization */}
      <div className="mt-6 border rounded-lg overflow-auto bg-gray-50 p-4">
        <svg ref={svgRef} />
      </div>

      {/* Keep the debug sections from Step 6 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {/* ... storylines and blocks info ... */}
      </div>
    </div>
  );
}`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">How to test</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Save and refresh</li>
                <li>You should see colored lines (storylines) connecting dots</li>
                <li>Alice (dark gray), Bob (orange), Charlie (teal)</li>
                <li>Time labels "2020" and "2021" at the top</li>
                <li>Names should appear at the end of each storyline</li>
              </ol>
            </div>
          </section>

          {/* ========================================== */}
          {/* STEP 8: Add Interactivity */}
          {/* ========================================== */}
          <section id="step-8" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Step 8: Add Interactivity
            </h2>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Finally, add hover effects and tooltips to make the visualization interactive.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Add hover effects</h3>
              <p className="text-gray-600 mb-2">
                Update the D3 rendering useEffect to add interactivity:
              </p>

              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Inside the D3 rendering useEffect, replace the storyline rendering:

// Create a group for each storyline (for hover effects)
const storylineGroups = g.selectAll('.storyline-group')
  .data(computedData.storylines)
  .enter()
  .append('g')
  .attr('class', 'storyline-group')
  .style('cursor', 'pointer')
  .on('mouseenter', function(event, d) {
    // Highlight this storyline
    d3.select(this).select('path')
      .attr('stroke-width', 5);
    d3.select(this).selectAll('circle')
      .attr('r', 6);
  })
  .on('mouseleave', function(event, d) {
    // Reset
    d3.select(this).select('path')
      .attr('stroke-width', 3);
    d3.select(this).selectAll('circle')
      .attr('r', 4);
  });

// Draw paths within groups
storylineGroups.each(function(storyline) {
  const group = d3.select(this);

  // Path
  if (storyline.lines.length > 0) {
    group.append('path')
      .attr('d', storyline.lines.join(' '))
      .attr('fill', 'none')
      .attr('stroke', storyline.color)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('class', 'storyline-path');
  }

  // Marks
  group.selectAll('.mark')
    .data(storyline.marks)
    .enter()
    .append('circle')
    .attr('class', 'mark')
    .attr('cx', d => d.posX)
    .attr('cy', d => d.posY)
    .attr('r', 4)
    .attr('fill', storyline.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1);

  // Label
  if (storyline.label.visibility !== 'hidden') {
    group.append('text')
      .attr('x', storyline.label.posX)
      .attr('y', storyline.label.posY)
      .attr('dy', '0.35em')
      .attr('fill', storyline.color)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(storyline.label.label);
  }
});`}
              </pre>

              <h3 className="text-lg font-semibold mt-6 mb-2">How to test</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Save and refresh</li>
                <li>Hover over a storyline - it should thicken</li>
                <li>The dots should grow slightly on hover</li>
                <li>Move away - everything returns to normal</li>
              </ol>
            </div>
          </section>

          {/* ========================================== */}
          {/* NEXT STEPS */}
          {/* ========================================== */}
          <section className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              Next Steps
            </h2>

            <div className="prose max-w-none text-blue-900">
              <p className="mb-4">
                You now have a working SpreadLine visualization with client-side computation!
                To get the full algorithm (not the simplified mock), copy these files from
                the original project:
              </p>

              <ul className="list-disc list-inside space-y-2">
                <li><code className="bg-blue-100 px-1 rounded">lib/spreadline/helpers.ts</code> - Utility functions</li>
                <li><code className="bg-blue-100 px-1 rounded">lib/spreadline/constructors.ts</code> - Network construction</li>
                <li><code className="bg-blue-100 px-1 rounded">lib/spreadline/order.ts</code> - Barycenter ordering</li>
                <li><code className="bg-blue-100 px-1 rounded">lib/spreadline/align.ts</code> - Line alignment</li>
                <li><code className="bg-blue-100 px-1 rounded">lib/spreadline/compact.ts</code> - Space compaction</li>
                <li><code className="bg-blue-100 px-1 rounded">lib/spreadline/contextualize.ts</code> - PCA positioning</li>
                <li><code className="bg-blue-100 px-1 rounded">lib/spreadline/render.ts</code> - SVG path generation</li>
                <li><code className="bg-blue-100 px-1 rounded">lib/spreadline/spreadline.ts</code> - Full orchestrator</li>
              </ul>

              <p className="mt-4">
                For the full D3 visualizer with block expansion, hover states, and brushing,
                copy from <code className="bg-blue-100 px-1 rounded">app/react-design11/components/</code>:
              </p>

              <ul className="list-disc list-inside space-y-2">
                <li><code className="bg-blue-100 px-1 rounded">SpreadLineChart.tsx</code> - React wrapper</li>
                <li><code className="bg-blue-100 px-1 rounded">SpreadLineVisualizer.ts</code> - D3 visualization class</li>
                <li><code className="bg-blue-100 px-1 rounded">types.ts</code> - Full type definitions</li>
                <li><code className="bg-blue-100 px-1 rounded">d3-utils.ts</code> - D3 helper utilities</li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * SpreadLine Complete Documentation
 * Combined Frontend + Backend Architecture
 *
 * The most comprehensive documentation for understanding SpreadLine's
 * full-stack implementation from CSV input to interactive visualization.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ============================================
// INTERACTIVE COMPONENTS
// ============================================

function DataFlowVisualizer() {
  const [activePhase, setActivePhase] = useState(0);
  const phases = [
    { name: 'CSV Input', color: '#3b82f6', desc: 'Raw CSV files are loaded' },
    { name: 'Load', color: '#8b5cf6', desc: 'Data parsed into DataFrames' },
    { name: 'Center', color: '#ec4899', desc: '2-hop egocentric network extracted' },
    { name: 'Order', color: '#f59e0b', desc: 'Barycenter crossing reduction' },
    { name: 'Align', color: '#10b981', desc: 'LCS straight line maximization' },
    { name: 'Compact', color: '#06b6d4', desc: 'Space/wiggle minimization' },
    { name: 'Render', color: '#ef4444', desc: 'SVG path generation' },
    { name: 'D3/React', color: '#22c55e', desc: 'Interactive visualization' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhase((p) => (p + 1) % phases.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [phases.length]);

  return (
    <div className="bg-slate-900 rounded-2xl p-8 my-8">
      <h3 className="text-xl font-bold text-white mb-6 text-center">Full-Stack Data Flow Animation</h3>
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
        {phases.map((phase, i) => (
          <div key={phase.name} className="flex items-center">
            <div
              className={`relative px-4 py-3 rounded-xl text-center min-w-[100px] transition-all duration-500 cursor-pointer ${
                i === activePhase
                  ? 'scale-110 shadow-2xl'
                  : i < activePhase
                  ? 'opacity-60'
                  : 'opacity-40'
              }`}
              style={{ backgroundColor: phase.color }}
              onClick={() => setActivePhase(i)}
            >
              <div className="text-white font-bold text-sm">{phase.name}</div>
              {i === activePhase && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
                  {phase.desc}
                </div>
              )}
            </div>
            {i < phases.length - 1 && (
              <div className={`w-8 h-1 mx-1 transition-all duration-300 ${
                i < activePhase ? 'bg-green-500' : 'bg-slate-700'
              }`}>
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: i === activePhase ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CSVExplorer() {
  const [activeTab, setActiveTab] = useState('relations');

  const csvData: Record<string, { headers: string[]; rows: string[][]; description: string; fieldExplanations: Record<string, string> }> = {
    relations: {
      headers: ['year', 'source', 'target', 'id', 'type', 'citationcount', 'count'],
      rows: [
        ['2002', 'Jeffrey Heer', 'Ed Huai-hsin Chi', '53e9...', 'Co-author', '156', '1'],
        ['2002', 'Jeffrey Heer', 'Adam Rosien', '53e9...', 'Co-author', '156', '1'],
        ['2003', 'Jeffrey Heer', 'Stuart K. Card', '53ea...', 'Co-author', '892', '2'],
        ['2004', 'Jeffrey Heer', 'Jock D. Mackinlay', '53eb...', 'Co-author', '1205', '1'],
      ],
      description: 'Network topology - who collaborated with whom and when',
      fieldExplanations: {
        'year': 'Timestamp of the collaboration (granularity: year)',
        'source': 'First author/entity in the collaboration',
        'target': 'Second author/entity in the collaboration',
        'id': 'Unique paper/publication identifier',
        'type': 'Relationship type (Co-author, Co-co-author)',
        'citationcount': 'Number of citations for this publication',
        'count': 'Number of times this pair collaborated at this time',
      }
    },
    entities: {
      headers: ['name', 'year', 'citationcount', 'affiliation'],
      rows: [
        ['Jeffrey Heer', '2002', '156', 'UC Berkeley'],
        ['Jeffrey Heer', '2004', '892', 'PARC'],
        ['Jeffrey Heer', '2009', '2341', 'Stanford University'],
        ['Stuart K. Card', '2003', '892', 'PARC'],
      ],
      description: 'Entity metadata - affiliations and attributes over time',
      fieldExplanations: {
        'name': 'Entity/author name (must match topology)',
        'year': 'Year when this metadata applies',
        'citationcount': 'Total citations at this point in time',
        'affiliation': 'Institution/organization affiliation',
      }
    },
    content: {
      headers: ['year', 'name', 'posX', 'posY'],
      rows: [
        ['2002', 'Jeffrey Heer', '0.655', '0.592'],
        ['2002', 'Ed Huai-hsin Chi', '0.741', '0.698'],
        ['2003', 'Jeffrey Heer', '0.374', '0.597'],
        ['2003', 'Stuart K. Card', '0.470', '0.538'],
      ],
      description: 'Pre-computed layout positions from PCA or manual placement',
      fieldExplanations: {
        'year': 'Timestamp for this position (or empty for static)',
        'name': 'Entity name (must match topology)',
        'posX': 'X coordinate (0-1 normalized, used in expanded blocks)',
        'posY': 'Y coordinate (0-1 normalized, used in expanded blocks)',
      }
    },
    citations: {
      headers: ['name', 'year', 'citationcount', 'affiliation', 'paperID'],
      rows: [
        ['Jeffrey Heer', '2002', '156', 'UC Berkeley', '53e9978db7602d9701f50690'],
        ['Ben Shneiderman', '1992', '2227', 'University of Maryland', '53e9b11db7602d9703b9ef40'],
        ['Tamara Munzner', '2000', '162', 'Stanford University', '53e997ecb7602d9701fe977b'],
      ],
      description: 'Citation counts per author per paper (used for node colors)',
      fieldExplanations: {
        'name': 'Author name',
        'year': 'Publication year',
        'citationcount': 'Citations for this specific paper',
        'affiliation': 'Author affiliation at time of publication',
        'paperID': 'Unique paper identifier',
      }
    },
  };

  const current = csvData[activeTab];

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden my-8">
      <div className="flex border-b border-slate-700">
        {Object.keys(csvData).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === key
                ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {key}.csv
          </button>
        ))}
      </div>

      <div className="p-6">
        <div className="text-slate-300 mb-4">{current.description}</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {current.headers.map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-cyan-400 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2 text-slate-300 font-mono">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {Object.entries(current.fieldExplanations).map(([field, desc]) => (
            <div key={field} className="bg-slate-800 rounded-lg p-3">
              <div className="text-cyan-400 font-mono text-sm">{field}</div>
              <div className="text-slate-400 text-xs mt-1">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransformationStep({
  step,
  title,
  input,
  output,
  code
}: {
  step: number;
  title: string;
  input: string;
  output: string;
  code: string;
}) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 my-4 border-l-4 border-cyan-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
          {step}
        </div>
        <h4 className="text-xl font-bold text-white">{title}</h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Input</div>
          <pre className="bg-slate-950 p-4 rounded-lg text-sm text-green-400 overflow-x-auto">{input}</pre>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Output</div>
          <pre className="bg-slate-950 p-4 rounded-lg text-sm text-orange-400 overflow-x-auto">{output}</pre>
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">TypeScript Implementation</div>
        <pre className="bg-slate-950 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">{code}</pre>
      </div>
    </div>
  );
}

function AlgorithmVisualizer() {
  const [step, setStep] = useState(0);

  const barycenterSteps = [
    { matrix: [[1,0,1],[0,1,0],[1,1,0]], order: [0,1,2], desc: 'Initial order: A, B, C' },
    { matrix: [[1,0,1],[0,1,0],[1,1,0]], order: [0,1,2], desc: 'Calculate barycenters: A=1.0, B=1.0, C=0.5' },
    { matrix: [[1,1,0],[1,0,1],[0,1,0]], order: [2,0,1], desc: 'Reorder by barycenter: C, A, B' },
    { matrix: [[1,1,0],[1,0,1],[0,1,0]], order: [2,0,1], desc: 'Crossings reduced from 3 to 1' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % barycenterSteps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const current = barycenterSteps[step];

  return (
    <div className="bg-slate-900 rounded-2xl p-6 my-8">
      <h4 className="text-lg font-bold text-white mb-4">Barycenter Algorithm - Live Demo</h4>

      <div className="flex items-start gap-8">
        <div>
          <div className="text-xs text-slate-500 mb-2">Adjacency Matrix</div>
          <div className="grid grid-cols-3 gap-1">
            {current.matrix.flat().map((v, i) => (
              <div
                key={i}
                className={`w-10 h-10 flex items-center justify-center rounded ${
                  v ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {v}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-2">Entity Order</div>
          <div className="flex gap-2">
            {current.order.map((idx, i) => (
              <div
                key={i}
                className="w-10 h-10 flex items-center justify-center rounded bg-purple-500 text-white font-bold"
              >
                {String.fromCharCode(65 + idx)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-xs text-slate-500 mb-2">Step {step + 1}/4</div>
          <div className="text-white">{current.desc}</div>
          <div className="flex gap-2 mt-4">
            {barycenterSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === step ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeScriptInterface({ name, fields, description }: {
  name: string;
  fields: { name: string; type: string; desc: string }[];
  description: string;
}) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 my-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-purple-400 font-mono">interface</span>
        <span className="text-cyan-400 font-mono font-bold">{name}</span>
      </div>
      <div className="text-slate-400 text-sm mb-4">{description}</div>
      <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500">{'{'}</div>
        {fields.map((f) => (
          <div key={f.name} className="ml-4 flex items-start gap-4 py-1">
            <span className="text-white">{f.name}:</span>
            <span className="text-green-400">{f.type};</span>
            <span className="text-slate-500">// {f.desc}</span>
          </div>
        ))}
        <div className="text-slate-500">{'}'}</div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function DocumentationPage() {
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    const checkMermaid = setInterval(() => {
      // @ts-expect-error mermaid loaded from CDN
      if (window.mermaid) {
        setMermaidLoaded(true);
        // @ts-expect-error mermaid loaded from CDN
        window.mermaid.run();
        clearInterval(checkMermaid);
      }
    }, 100);
    return () => clearInterval(checkMermaid);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                SpreadLine <span className="text-cyan-400">Full-Stack</span> Architecture
              </h1>
              <p className="text-xl text-slate-400">
                Complete Frontend + Backend Implementation Guide
              </p>
              <div className="flex gap-4 mt-4">
                <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">IEEE TVCG 2024</span>
                <span className="px-3 py-1 bg-cyan-900/50 text-cyan-300 rounded-full text-sm">TypeScript + D3 + React</span>
                <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">Full Pipeline Documented</span>
              </div>
            </div>
            <Link
              href="/frontend1/demo"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-6 overflow-x-auto text-sm">
          <a href="#overview" className="text-slate-400 hover:text-cyan-400">Overview</a>
          <a href="#architecture" className="text-slate-400 hover:text-cyan-400">Architecture</a>
          <a href="#backend" className="text-slate-400 hover:text-cyan-400">Backend</a>
          <a href="#frontend" className="text-slate-400 hover:text-cyan-400">Frontend</a>
          <a href="#algorithms" className="text-slate-400 hover:text-cyan-400">Algorithms</a>
          <a href="#api" className="text-slate-400 hover:text-cyan-400">API Reference</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* ============================================ */}
        {/* SECTION: Overview */}
        {/* ============================================ */}
        <section id="overview" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-lg">1</span>
            What is SpreadLine?
          </h2>

          <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
            <p className="text-slate-300 leading-relaxed mb-6 text-lg">
              SpreadLine is a visualization framework for exploring <strong className="text-cyan-400">egocentric dynamic networks</strong> from
              the perspective of a central node (ego). Based on the IEEE TVCG 2024 paper &quot;SpreadLine: Visualizing Egocentric Dynamic Influence&quot;,
              it shows how influence spreads through networks over time, centered around a focal actor.
            </p>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-cyan-400 font-bold text-3xl mb-1">198</div>
                <div className="text-slate-400 text-sm">Storylines</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-cyan-400 font-bold text-3xl mb-1">21</div>
                <div className="text-slate-400 text-sm">Time Blocks</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-cyan-400 font-bold text-3xl mb-1">~4,550</div>
                <div className="text-slate-400 text-sm">Lines of TypeScript</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-cyan-400 font-bold text-3xl mb-1">5</div>
                <div className="text-slate-400 text-sm">Pipeline Phases</div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-4">Key Capabilities</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Block Expansion', desc: 'Click blocks to expand and see detailed node positions and relationships' },
                { title: 'Brush Selection', desc: 'Drag on timeline to select multiple time periods' },
                { title: 'Storyline Filtering', desc: 'Filter by lifespan (years) and crossing behavior' },
                { title: 'Hover/Pin Interactions', desc: 'Highlight and pin storylines for comparison' },
                { title: 'Reference Labels', desc: 'Show paper/reference labels in expanded blocks' },
                { title: 'Force Simulation', desc: 'D3 force collision detection for node positioning' },
              ].map((cap) => (
                <div key={cap.title} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-slate-300"><strong>{cap.title}:</strong> {cap.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: Full-Stack Architecture */}
        {/* ============================================ */}
        <section id="architecture" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-lg">2</span>
            Full-Stack Architecture
          </h2>

          <DataFlowVisualizer />

          <div className="bg-slate-900 rounded-2xl p-8">
            {mermaidLoaded ? (
              <div className="mermaid bg-slate-950 rounded-xl p-4">
                {`
flowchart TB
    subgraph Backend["Backend (API)"]
        CSV[CSV Files] --> LOAD[Load]
        LOAD --> CENTER[Center]
        CENTER --> ORDER[Order]
        ORDER --> ALIGN[Align]
        ALIGN --> COMPACT[Compact]
        COMPACT --> RENDER[Render]
        RENDER --> JSON[JSON Response]
    end

    subgraph Frontend["Frontend (React + D3)"]
        JSON --> FETCH[useSpreadLineData]
        FETCH --> CHART[SpreadLineChart]
        CHART --> VIS[SpreadLineVisualizer]
        VIS --> D3[D3 SVG Rendering]
        D3 --> EXP[Expander/Collapser]
    end

    style Backend fill:#1e3a5f
    style Frontend fill:#1e3a1e
                `}
              </div>
            ) : (
              <div className="bg-slate-950 rounded-xl p-8 text-center text-slate-500">
                Loading architecture diagram...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-900/50 to-slate-900 rounded-xl p-6 border border-blue-800">
              <h3 className="text-xl font-bold text-blue-400 mb-3">Backend: TypeScript API</h3>
              <p className="text-slate-300 mb-4">
                5-phase optimization pipeline that transforms CSV data into visualization-ready JSON.
              </p>
              <div className="text-sm text-slate-400 font-mono">
                /api/nodeFetchSpreadLine2
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-900/50 to-slate-900 rounded-xl p-6 border border-green-800">
              <h3 className="text-xl font-bold text-green-400 mb-3">Frontend: React + D3 Hybrid</h3>
              <p className="text-slate-300 mb-4">
                React manages lifecycle and state. D3 handles all SVG rendering, animations, and interactions.
              </p>
              <div className="text-sm text-slate-400 font-mono">
                SpreadLineChart → SpreadLineVisualizer
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: Backend Pipeline */}
        {/* ============================================ */}
        <section id="backend" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center text-lg">3</span>
            Backend: Data Pipeline
          </h2>

          <h3 className="text-2xl font-bold text-white mb-4">3.1 Input CSV Files</h3>
          <CSVExplorer />

          <h3 className="text-2xl font-bold text-white mb-4 mt-12">3.2 Data Transformations</h3>

          <TransformationStep
            step={1}
            title="Extract 2-Hop Egocentric Network"
            input={`// Raw relations (1000s of rows)
[
  { source: "A", target: "B", time: "2002" },
  { source: "B", target: "C", time: "2002" },
  { source: "X", target: "Y", time: "2002" },
  ...
]`}
            output={`// 2-hop from ego "A" (filtered)
[
  { source: "A", target: "B" },  // 1-hop
  { source: "B", target: "C" },  // 2-hop
]
// "X"->"Y" excluded (not within 2 hops)`}
            code={`function constructEgocentricNetwork(topo, ego) {
  const included = [];
  let waitlist = new Set([ego]);

  for (let hop = 1; hop <= 2; hop++) {
    topo.forEach((row, idx) => {
      if (waitlist.has(row.source) || waitlist.has(row.target)) {
        included.push(idx);
        waitlist.add(row.source);
        waitlist.add(row.target);
      }
    });
  }
  return topo.filter((_, idx) => included.includes(idx));
}`}
          />

          <TransformationStep
            step={2}
            title="Barycenter Ordering"
            input={`// Session entities at t=0, t=1
t=0: [A:0, B:1, C:2]
t=1: [A, B, C, D] (new entity D)`}
            output={`// Barycenter calculation
A: neighbors=[0] → barycenter=0.0
B: neighbors=[0,1] → barycenter=0.5
C: neighbors=[1,2] → barycenter=1.5
D: no neighbors → barycenter=Infinity

// Final: [A:0, B:1, C:2, D:3]`}
            code={`function barycenterSort(current, next) {
  next.entities.forEach(node => {
    const neighbors = getNeighborsAtPrevious(node, current);
    if (neighbors.length > 0) {
      node.barycenter = neighbors.reduce((sum, n) => sum + n.order, 0) / neighbors.length;
    } else {
      node.barycenter = Infinity;
    }
  });
  next.entities.sort((a, b) => a.barycenter - b.barycenter);
}`}
          />

          <TransformationStep
            step={3}
            title="Render SVG Paths"
            input={`// Height table for entity "Bob"
Bob: [270, 285, 300]
Time X: [100, 250, 400]`}
            output={`// SVG path segments
{
  name: "Bob",
  lines: [
    "M 100,270 C 175,270 175,285 250,285",
    "M 250,285 C 325,285 325,300 400,300"
  ],
  marks: [{ posX: 100, posY: 270 }, ...]
}`}
            code={`function renderStoryline(entity, heightTable, timeScale) {
  const lines = [];
  for (let t = 0; t < heights.length - 1; t++) {
    const x1 = timeScale(t), y1 = heights[t];
    const x2 = timeScale(t+1), y2 = heights[t+1];

    if (y1 === y2) {
      lines.push(\`M \${x1},\${y1} L \${x2},\${y2}\`);
    } else {
      const midX = (x1 + x2) / 2;
      lines.push(\`M \${x1},\${y1} C \${midX},\${y1} \${midX},\${y2} \${x2},\${y2}\`);
    }
  }
  return { name: entity.name, lines };
}`}
          />
        </section>

        {/* ============================================ */}
        {/* SECTION: Frontend Architecture */}
        {/* ============================================ */}
        <section id="frontend" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-lg">4</span>
            Frontend: React + D3 Hybrid
          </h2>

          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl border border-green-700 p-8 mb-8">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Strict Rendering Separation</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              This implementation uses a <strong className="text-cyan-400">&quot;React renders container, D3 takes over&quot;</strong> pattern.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">React Re-renders ONLY when:</h4>
                <ul className="space-y-1 text-slate-300 text-sm">
                  <li>• <code className="text-cyan-400">data</code> prop changes (new dataset)</li>
                  <li>• <code className="text-cyan-400">config</code> prop changes (new settings)</li>
                  <li>• <code className="text-cyan-400">resetKey</code> incremented (explicit reset)</li>
                </ul>
              </div>
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h4 className="text-purple-400 font-medium mb-2">D3 Handles ALL:</h4>
                <ul className="space-y-1 text-slate-300 text-sm">
                  <li>• Filtering (years slider, crossing checkbox)</li>
                  <li>• Block expansion/collapse animations</li>
                  <li>• Hover and pin interactions</li>
                  <li>• Brush selection</li>
                </ul>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">4.1 Component Hierarchy</h3>
          <div className="bg-slate-900 rounded-xl p-6 mb-8">
            <pre className="text-slate-300 font-mono text-sm overflow-x-auto">{`
┌─────────────────────────────────────────────────────────────┐
│                    React Layer (Lifecycle)                   │
├─────────────────────────────────────────────────────────────┤
│  DemoPage (page.tsx)                                        │
│    ├── QueryClientProvider (React Query)                    │
│    ├── useSpreadLineData() - Data fetching from API        │
│    ├── useState() - Filter controls                        │
│    └── SpreadLineChart                                     │
│          ├── useRef() - SVG container ref                  │
│          └── useEffect() - D3 initialization               │
├─────────────────────────────────────────────────────────────┤
│                    D3 Layer (Rendering)                      │
├─────────────────────────────────────────────────────────────┤
│  SpreadLinesVisualizer (class)                              │
│    ├── visualize() - Main entry point                      │
│    ├── _drawBackground() - Time labels, rules              │
│    ├── _drawStorylines() - Path segments, markers          │
│    ├── _drawBlocksAndPoints() - Blocks, points             │
│    ├── applyFilter() - Update visibility                   │
│    └── _blockUpdate() - Expansion handler                  │
│         ├── Expander (class) - Expand animation            │
│         └── Collapser (class) - Collapse animation         │
└─────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">4.2 Key Components</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'SpreadLineChart.tsx', type: 'React', desc: 'Bridge between React and D3. Manages SVG container ref.' },
              { name: 'SpreadLineVisualizer.ts', type: 'D3 Class', desc: 'Main orchestrator. All D3 rendering and interactions.' },
              { name: 'Expander.ts', type: 'D3 Class', desc: 'Block expansion with force simulation and animations.' },
              { name: 'Collapser.ts', type: 'D3 Class', desc: 'Block collapse animation, reverses expansion.' },
              { name: 'useSpreadLineData.ts', type: 'React Hook', desc: 'Fetches data from API using React Query.' },
              { name: 'd3-utils.ts', type: 'Utilities', desc: 'Embedding calculation, text wrapping, CSS injection.' },
            ].map((comp) => (
              <div key={comp.name} className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    comp.type === 'React' ? 'bg-blue-900 text-blue-300' :
                    comp.type === 'D3 Class' ? 'bg-purple-900 text-purple-300' :
                    comp.type === 'React Hook' ? 'bg-green-900 text-green-300' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {comp.type}
                  </span>
                  <span className="text-white font-semibold">{comp.name}</span>
                </div>
                <p className="text-slate-400 text-sm">{comp.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold text-white mb-4 mt-8">4.3 D3 Integration Patterns</h3>
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-cyan-400 font-medium mb-2">1. Preventing React Re-renders</h4>
                <pre className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300">{`// BAD: Creates new object every render
const config = { content: { showLinks: false } };

// GOOD: Memoized, stable reference
const config = useMemo(() => ({ content: { showLinks: false } }), []);`}</pre>
              </div>

              <div>
                <h4 className="text-cyan-400 font-medium mb-2">2. Animation Transitions (500ms, easeQuadInOut)</h4>
                <pre className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300">{`const animation = d3.transition().duration(500).ease(d3.easeQuadInOut);

d3.select(element)
  .transition(animation)
  .attr('transform', \`translate(\${newX}, \${newY})\`);`}</pre>
              </div>

              <div>
                <h4 className="text-cyan-400 font-medium mb-2">3. Force Simulation for Collision Detection</h4>
                <pre className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300">{`const simulation = d3.forceSimulation(nodes)
  .force('x', d3.forceX(d => d.x))
  .force('y', d3.forceY(d => d.y))
  .force('collide', d3.forceCollide(d => d.width))
  .stop();

for (let i = 0; i < 100; i++) simulation.tick();`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: Algorithms */}
        {/* ============================================ */}
        <section id="algorithms" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-lg">5</span>
            Core Algorithms
          </h2>

          <AlgorithmVisualizer />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-900 rounded-xl p-6">
              <h4 className="text-xl font-bold text-green-400 mb-4">Barycenter Heuristic</h4>
              <p className="text-slate-300 mb-4">
                Minimizes edge crossings by positioning each node at the average position of its neighbors.
                10 forward/backward sweeps ensure convergence.
              </p>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-400">
                Time: O(iterations × timestamps × edges)<br/>
                Space: O(entities × timestamps)
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-400 mb-4">LCS Alignment</h4>
              <p className="text-slate-300 mb-4">
                Dynamic programming to maximize straight lines. Reward function considers alignment
                matches and relative order preservation.
              </p>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-400">
                Time: O(n² × timestamps)<br/>
                Space: O(n²) per timestamp pair
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <h4 className="text-xl font-bold text-purple-400 mb-4">Slot-Based Compacting</h4>
              <p className="text-slate-300 mb-4">
                Greedy allocation of vertical slots with distance constraints. Ego fixed at center (Y=0).
              </p>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-400">
                DISTANCE_LINE = 5px<br/>
                DISTANCE_HOP = 10px
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <h4 className="text-xl font-bold text-red-400 mb-4">Bezier Path Generation</h4>
              <p className="text-slate-300 mb-4">
                SVG cubic bezier curves connect entity positions. Control points at horizontal midpoint.
              </p>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-400">
                Straight: M x1,y L x2,y<br/>
                Curve: M x1,y1 C mid,y1 mid,y2 x2,y2
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: API Reference */}
        {/* ============================================ */}
        <section id="api" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-lg">6</span>
            API Reference
          </h2>

          <div className="bg-slate-900 rounded-xl overflow-hidden mb-8">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500 text-white rounded font-bold text-sm">GET</span>
                <span className="font-mono text-white">/api/nodeFetchSpreadLine2</span>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-lg font-bold text-white mb-4">Response Format</h4>
              <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-sm text-slate-300">
{`{
  "ego": "Jeffrey Heer",
  "bandWidth": 101.816,
  "blockWidth": 40,
  "heightExtents": [268, 520],
  "timeLabels": [{ "label": "2002", "posX": 62.908 }, ...],
  "storylines": [{
    "name": "Jeffrey Heer",
    "color": "#424242",
    "lifespan": 21,
    "crossingCheck": false,
    "lines": ["M 62.908,394 L 164.724,394", ...],
    "marks": [{ "posX": 62.908, "posY": 394 }, ...],
    "label": { "label": "Jeffrey Heer", "posX": 2340, "posY": 394 }
  }, ...],
  "blocks": [{
    "id": 0, "time": "2002",
    "moveX": 228, "topPosY": 268,
    "names": ["Ed Huai-hsin Chi", ...],
    "points": [{ "id": 65, "name": "Tara Matthews", ... }],
    "relations": [[65, 66], ...]
  }, ...]
}`}
              </pre>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">SpreadLineChart Props</h3>
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="pb-3 pr-4">Prop</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Default</th>
                    <th className="pb-3">Description</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-t border-slate-700">
                    <td className="py-3 pr-4 font-mono text-cyan-400">data</td>
                    <td className="py-3 pr-4 font-mono">SpreadLineData</td>
                    <td className="py-3 pr-4">required</td>
                    <td className="py-3">The visualization data from API</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="py-3 pr-4 font-mono text-cyan-400">config</td>
                    <td className="py-3 pr-4 font-mono">Partial&lt;SpreadLineConfig&gt;</td>
                    <td className="py-3 pr-4">{'{}'}</td>
                    <td className="py-3">Configuration overrides</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="py-3 pr-4 font-mono text-cyan-400">yearsFilter</td>
                    <td className="py-3 pr-4 font-mono">number</td>
                    <td className="py-3 pr-4">1</td>
                    <td className="py-3">Minimum lifespan threshold</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="py-3 pr-4 font-mono text-cyan-400">crossingOnly</td>
                    <td className="py-3 pr-4 font-mono">boolean</td>
                    <td className="py-3 pr-4">false</td>
                    <td className="py-3">Show only crossing storylines</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: Data Structures */}
        {/* ============================================ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-lg">7</span>
            TypeScript Data Structures
          </h2>

          <TypeScriptInterface
            name="SpreadLineData"
            description="Main data structure returned by the API - contains everything for rendering"
            fields={[
              { name: 'ego', type: 'string', desc: 'Central entity name' },
              { name: 'bandWidth', type: 'number', desc: 'Pixels between blocks' },
              { name: 'blockWidth', type: 'number', desc: 'Collapsed block width' },
              { name: 'storylines', type: 'Storyline[]', desc: 'Entity timeline paths' },
              { name: 'blocks', type: 'Block[]', desc: 'Session snapshots' },
              { name: 'timeLabels', type: 'TimeLabel[]', desc: 'X-axis labels' },
              { name: 'heightExtents', type: '[number, number]', desc: 'Y range' },
            ]}
          />

          <TypeScriptInterface
            name="Storyline"
            description="A single entity's timeline across all timestamps"
            fields={[
              { name: 'id', type: 'number', desc: 'Unique identifier' },
              { name: 'name', type: 'string', desc: 'Entity name' },
              { name: 'color', type: 'string', desc: 'Line color (hex)' },
              { name: 'lines', type: 'string[]', desc: 'SVG path segments' },
              { name: 'marks', type: 'Mark[]', desc: 'Entry/exit markers' },
              { name: 'lifespan', type: 'number', desc: 'Years active' },
              { name: 'crossingCheck', type: 'boolean', desc: 'Crosses ego line?' },
            ]}
          />

          <TypeScriptInterface
            name="Block"
            description="A session snapshot at one timestamp"
            fields={[
              { name: 'id', type: 'number', desc: 'Block index' },
              { name: 'time', type: 'string', desc: 'Year label' },
              { name: 'points', type: 'Point[]', desc: 'Node positions' },
              { name: 'relations', type: '[number, number][]', desc: 'Edge pairs' },
              { name: 'moveX', type: 'number', desc: 'Expansion width' },
              { name: 'outline', type: 'object', desc: 'SVG arc paths' },
            ]}
          />
        </section>

        {/* ============================================ */}
        {/* Footer */}
        {/* ============================================ */}
        <footer className="border-t border-slate-800 pt-8 mt-16">
          <div className="text-center">
            <p className="text-slate-400">
              SpreadLine: Visualizing Egocentric Dynamic Influence
            </p>
            <p className="text-slate-500 text-sm mt-2">
              IEEE TVCG 2024 | <a href="https://arxiv.org/pdf/2408.08992" className="text-cyan-400 hover:underline">Paper</a>
            </p>
            <div className="mt-6">
              <Link
                href="/frontend1/demo"
                className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all"
              >
                Try the Live Demo
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

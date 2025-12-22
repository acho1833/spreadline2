'use client';

import { useState } from 'react';
import Link from 'next/link';
import CodeViewer from './components/CodeViewer';

export default function ReactDesign6Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">SpreadLine React Architecture v6</h1>
              <p className="text-slate-400 text-sm">Component-based visualization with TanStack Query</p>
            </div>
            <Link
              href="/react-design6/demo"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              View Full Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Implementation Order - NEW SECTION */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Implementation Order</h2>
          <p className="text-slate-300 leading-relaxed mb-8">
            When building this visualization from scratch, implement components in this order.
            Each phase builds on the previous one and can be tested independently.
          </p>
          <ImplementationOrderSection />
        </section>

        {/* Overview */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">System Overview</h2>
          <p className="text-slate-300 leading-relaxed mb-8">
            SpreadLine visualizes egocentric dynamic networks showing how influence spreads through
            networks over time. This React implementation uses TanStack Query for data management
            and maps data structures directly to SVG elements.
          </p>
          <DataFlowDiagram />
        </section>

        {/* useSpreadLineData Hook */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Data Layer: useSpreadLineData</h2>
          <UseSpreadLineDataSection />
        </section>

        {/* Component to SVG Mapping */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Component to SVG Mapping</h2>
          <p className="text-slate-400 mb-8">
            Each component maps data properties to SVG elements. Below are detailed breakdowns with props and visualizations.
          </p>
          <ComponentMappingSection />
        </section>

        {/* Layer Ordering */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">SVG Layer Ordering</h2>
          <LayerOrderingDemo />
        </section>

        {/* Full Demo Link */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-slate-400 mb-6">
            See all components working together with interactive data editing.
          </p>
          <Link
            href="/react-design6/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-lg font-medium transition-all"
          >
            Open Full Demo
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>
      </main>
    </div>
  );
}

// ============================================
// Implementation Order Section - NEW
// ============================================
function ImplementationOrderSection() {
  const phases = [
    {
      phase: 1,
      title: 'Data Layer & Types',
      components: ['types.ts', 'useSpreadLineData.ts'],
      description: 'Define TypeScript interfaces and create the data fetching hook.',
      test: 'Log data to console after fetch. Verify all fields are typed correctly.',
      code: `// types.ts - Start with core interfaces
interface SpreadLineData {
  ego: string;
  bandWidth: number;
  blockWidth: number;
  storylines: Storyline[];
  blocks: Block[];
  timeLabels: TimeLabel[];
}

// useSpreadLineData.ts - TanStack Query hook
const { data, loading, error } = useSpreadLineData('/testData.json');
console.log('Loaded:', data?.storylines.length, 'storylines');`
    },
    {
      phase: 2,
      title: 'Static SVG Layout',
      components: ['TimeAxis', 'Basic SVG container'],
      description: 'Render the SVG container and time labels. No interactions yet.',
      test: 'Time labels appear at correct X positions. Dashed vertical lines extend down.',
      code: `// Render time labels at their posX positions
{timeLabels.map((tl) => (
  <g key={tl.label}>
    <text x={tl.posX} y={-40} textAnchor="middle">{tl.label}</text>
    <line x1={tl.posX} y1={-25} x2={tl.posX} y2={height} strokeDasharray="4" />
  </g>
))}`
    },
    {
      phase: 3,
      title: 'Storylines (Static)',
      components: ['Storyline paths', 'Markers', 'Labels'],
      description: 'Render all storyline paths without any interaction or filtering.',
      test: 'All storylines visible. Colors match data. Entry/exit triangles visible.',
      code: `// Render storyline path segments
{storylines.map((sl) => (
  <g key={sl.id}>
    {sl.lines.map((d, i) => (
      <path key={i} d={d} stroke={sl.color} fill="none" />
    ))}
  </g>
))}`
    },
    {
      phase: 4,
      title: 'Blocks (Static)',
      components: ['Block pills', 'NodePoints'],
      description: 'Render collapsed blocks with points. No expansion yet.',
      test: 'Pill-shaped containers visible. Points colored by citation count.',
      code: `// Render block containers and points
{blocks.map((block) => (
  <g key={block.id}>
    <path d={createPillPath(block)} fill="#1e293b" stroke="#475569" />
    {block.points.map((pt) => (
      <circle key={pt.id} cx={tl.posX} cy={pt.posY} r={6} fill={getNodeColor(pt.label)} />
    ))}
  </g>
))}`
    },
    {
      phase: 5,
      title: 'Hover & Pin Interactions',
      components: ['Highlight state', 'Opacity control'],
      description: 'Add hover highlighting and click-to-pin functionality.',
      test: 'Hover dims other storylines. Click pins/unpins. Multiple pins work.',
      code: `// Track interaction state
const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
const [pinnedEntities, setPinnedEntities] = useState<Set<string>>(new Set());

// Compute highlight
const isHighlighted = (name) => {
  if (pinnedEntities.size > 0) return pinnedEntities.has(name);
  if (hoveredEntity) return hoveredEntity === name;
  return true;
};`
    },
    {
      phase: 6,
      title: 'Block Expansion Animation',
      components: ['expandedBlocks state', 'blockAnimProgress', 'Animation loop'],
      description: 'Click to expand blocks. Animate pill shape and point positions.',
      test: 'Click year/block expands. Animation smooth. Collapse reverses expand.',
      code: `// Animation state
const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
const [blockAnimProgress, setBlockAnimProgress] = useState<{[key: number]: number}>({});

// Animation loop - runs every 16ms
useEffect(() => {
  const interval = setInterval(() => {
    setBlockAnimProgress((prev) => {
      expandedBlocks.forEach((id) => {
        if (prev[id] < 1) prev[id] = Math.min(1, (prev[id] || 0) + 0.08);
      });
      // Collapse: animate down when not in expandedBlocks
      Object.keys(prev).forEach((id) => {
        if (!expandedBlocks.has(+id) && prev[+id] > 0) prev[+id] -= 0.08;
      });
      return {...prev};
    });
  }, 16);
  return () => clearInterval(interval);
}, [expandedBlocks]);`
    },
    {
      phase: 7,
      title: 'Position Shifting (getShiftX)',
      components: ['getShiftX function', 'Fill lines'],
      description: 'When blocks expand, shift everything to the right. Add fill lines.',
      test: 'Expand block - elements to right shift. Storylines stay connected.',
      code: `// Calculate cumulative shift based on ALL animating blocks
const getShiftX = (posX: number): number => {
  let shift = 0;
  blocks.forEach((block) => {
    const progress = blockAnimProgress[block.id] || 0;
    // KEY: Check progress > 0, not expandedBlocks.has()
    // This ensures smooth collapse animation
    if (block.posX < posX && progress > 0) {
      shift += block.moveX * easeOutQuad(progress);
    }
  });
  return shift;
};`
    },
    {
      phase: 8,
      title: 'Relation Arcs & Arrows',
      components: ['Arc paths', 'Arrow positioning'],
      description: 'Draw relationship arcs inside expanded blocks with arrowheads.',
      test: 'Arrows point source to target. Arrow tips stop at node border.',
      code: `// Arrow positioning - pull back so tip reaches border
const nodeRadius = 6;
const arrowLength = 8;
const pullBack = nodeRadius + arrowLength;

// Direction from control to target (bezier tangent)
const dx = tx - midX, dy = ty - controlY;
const dist = Math.sqrt(dx*dx + dy*dy);
const endX = tx - pullBack * (dx/dist);
const endY = ty - pullBack * (dy/dist);

<path d={\`M\${sx},\${sy} Q\${midX},\${controlY} \${endX},\${endY}\`} />
<polygon points="0,-4 8,0 0,4" transform={\`translate(\${endX},\${endY}) rotate(\${angle})\`} />`
    },
    {
      phase: 9,
      title: 'Filtering & Controls',
      components: ['Min lifespan slider', 'Crossing only checkbox'],
      description: 'Add UI controls to filter which entities are visible.',
      test: 'Slider filters by year count. Checkbox filters by crossing.',
      code: `// Filter entities
const filteredNames = useMemo(() => {
  return new Set(
    storylines
      .filter(s => s.name === ego || (s.lifespan >= minLifespan && (!crossingOnly || s.crossingCheck)))
      .map(s => s.name)
  );
}, [storylines, minLifespan, crossingOnly]);`
    },
    {
      phase: 10,
      title: 'Data Editor & Refresh',
      components: ['DataEditor', 'Refresh button'],
      description: 'Add JSON editor panel with refresh to update visualization.',
      test: 'Edit bandWidth, click Refresh. Visualization reflects change.',
      code: `// DataEditor with Refresh button
<DataEditor
  initialData={originalJson}
  onDataChange={handleDataChange}
  onRefresh={handleRefresh}
/>

// handleRefresh resets all state and increments key
const handleRefresh = () => {
  setDataVersion(v => v + 1);  // Force re-render
  setExpandedBlocks(new Set());
  setBlockAnimProgress({});
};`
    }
  ];

  return (
    <div className="space-y-6">
      {phases.map(({ phase, title, components, description, test, code }) => (
        <div key={phase} className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold">
                {phase}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <div className="flex gap-2 mt-1">
                  {components.map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded text-xs font-mono">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-slate-300">{description}</p>
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
              <span className="text-green-400 font-medium text-sm">Test: </span>
              <span className="text-green-300 text-sm">{test}</span>
            </div>
            <CodeViewer title={`Phase ${phase} Code`} code={code} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Data Flow Diagram
// ============================================
function DataFlowDiagram() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <h3 className="text-lg font-semibold text-white mb-6">Data Flow Architecture</h3>

      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="w-64 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-center">
          <div className="text-cyan-400 font-mono text-sm">testData.json</div>
          <div className="text-slate-500 text-xs mt-1">SpreadLineData structure</div>
        </div>

        <Arrow />

        <div className="w-64 px-4 py-3 bg-purple-900/30 border border-purple-600 rounded-lg text-center">
          <div className="text-purple-400 font-mono text-sm">useSpreadLineData()</div>
          <div className="text-slate-500 text-xs mt-1">TanStack Query hook</div>
        </div>

        <Arrow />

        <div className="w-64 px-4 py-3 bg-green-900/30 border border-green-600 rounded-lg text-center">
          <div className="text-green-400 font-mono text-sm">React State</div>
          <div className="text-slate-500 text-xs mt-1">blocks, storylines, timeLabels</div>
        </div>

        <Arrow />

        <div className="flex gap-4">
          {['TimeAxis', 'Storylines', 'Blocks'].map((name) => (
            <div key={name} className="px-4 py-2 bg-blue-900/30 border border-blue-600 rounded-lg">
              <div className="text-blue-400 font-mono text-sm">{name}</div>
            </div>
          ))}
        </div>

        <Arrow />

        <div className="w-64 px-4 py-3 bg-orange-900/30 border border-orange-600 rounded-lg text-center">
          <div className="text-orange-400 font-mono text-sm">&lt;svg&gt;</div>
          <div className="text-slate-500 text-xs mt-1">Rendered visualization</div>
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="text-slate-600">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
}

// ============================================
// useSpreadLineData Section
// ============================================
function UseSpreadLineDataSection() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="text-white font-medium">What useSpreadLineData Does</h4>
          {[
            { n: 1, title: 'Fetches Data', desc: 'Uses TanStack Query to fetch JSON from URL' },
            { n: 2, title: 'Caches Results', desc: 'Keeps data in cache for 5 minutes' },
            { n: 3, title: 'Manages State', desc: 'Tracks loading, error, and data states' },
            { n: 4, title: 'Allows Updates', desc: 'setData() updates cache for re-rendering' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">{n}</div>
              <div>
                <div className="text-white font-medium">{title}</div>
                <div className="text-slate-400 text-sm">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-950 rounded-lg p-4">
          <div className="text-slate-400 text-xs mb-2">Return Type</div>
          <pre className="text-sm font-mono text-slate-300">{`{
  data: SpreadLineData | null;
  loading: boolean;
  error: string | null;
  setData: (data: SpreadLineData) => void;
  refetch: () => void;
}`}</pre>
        </div>
      </div>

      <CodeViewer
        title="useSpreadLineData Implementation"
        code={`import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useSpreadLineData(url: string, initialData?: SpreadLineData) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<SpreadLineData>({
    queryKey: ['spreadline-data'],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    initialData: initialData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const setData = (newData: SpreadLineData) => {
    queryClient.setQueryData(['spreadline-data'], newData);
  };

  return { data: data ?? null, loading: isLoading, error: error?.message, setData };
}`}
      />
    </div>
  );
}

// ============================================
// Component Mapping Section
// ============================================
function ComponentMappingSection() {
  return (
    <div className="space-y-8">
      <ComponentCard
        name="TimeAxis"
        description="Renders time period labels at the top. Clickable to toggle block expansion."
        svgElement="<text>, <line>"
        dataSource="timeLabels[]"
        props={[
          { name: 'label', type: 'string', desc: 'The time period text (e.g., "2020")' },
          { name: 'posX', type: 'number', desc: 'X position for centering the label' },
        ]}
        visualization={
          <svg viewBox="0 0 300 80" className="w-full h-20 bg-slate-950 rounded-lg">
            {['2020', '2021', '2022'].map((year, i) => (
              <g key={year}>
                <text x={50 + i * 100} y={25} textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">{year}</text>
                <line x1={50 + i * 100} y1={35} x2={50 + i * 100} y2={75} stroke="#334155" strokeDasharray="4" />
              </g>
            ))}
          </svg>
        }
        code={`{timeLabels.map((tl) => (
  <g key={tl.label}>
    <text x={tl.posX} y={-40} textAnchor="middle" fill="#94a3b8"
      onClick={() => toggleBlockExpansion(blockId)}>
      {tl.label}
    </text>
    <line x1={tl.posX} y1={-25} x2={tl.posX} y2={height}
      stroke="#334155" strokeDasharray="4" />
  </g>
))}`}
      />

      <ComponentCard
        name="Storyline"
        description="Entity's path through time as Bezier curves, with markers and labels."
        svgElement="<path>, <polygon>, <text>"
        dataSource="storylines[]"
        props={[
          { name: 'lines', type: 'string[]', desc: 'SVG path d attributes for curves' },
          { name: 'color', type: 'string', desc: 'Line and marker color' },
          { name: 'marks', type: 'Mark[]', desc: 'Entry/exit marker positions' },
        ]}
        visualization={
          <svg viewBox="0 0 300 100" className="w-full h-24 bg-slate-950 rounded-lg">
            <path d="M 30,50 C 80,50 120,30 170,30 C 220,30 250,60 280,60" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <polygon points="25,45 35,50 25,55" fill="#60a5fa" />
            <text x="20" y="50" textAnchor="end" fill="#60a5fa" fontSize="11">Alice</text>
            <path d="M 30,70 C 80,70 120,80 170,80" stroke="#f472b6" strokeWidth="3" fill="none" />
            <polygon points="25,65 35,70 25,75" fill="#f472b6" />
            <text x="20" y="70" textAnchor="end" fill="#f472b6" fontSize="11">Bob</text>
          </svg>
        }
        code={`{storylines.map((sl) => (
  <g key={sl.id} style={{ opacity: highlighted ? 1 : 0.15 }}>
    {sl.lines.map((d, i) => (
      <path key={i} d={d} stroke={sl.color} strokeWidth={3} fill="none" />
    ))}
    {sl.marks.map((mark, i) => (
      <polygon key={i} points="0,-4 8,0 0,4"
        transform={\`translate(\${mark.posX}, \${mark.posY}) rotate(\${i === 0 ? 0 : 180})\`}
        fill={sl.color} />
    ))}
  </g>
))}`}
      />

      <ComponentCard
        name="Block"
        description="Pill-shaped container for a time period. Expands to show relationships."
        svgElement="<path>, <circle>"
        dataSource="blocks[]"
        props={[
          { name: 'moveX', type: 'number', desc: 'Expansion width when opened' },
          { name: 'points', type: 'Point[]', desc: 'Entities in this block' },
          { name: 'relations', type: '[number, number][]', desc: 'Related entity ID pairs' },
        ]}
        visualization={
          <svg viewBox="0 0 300 120" className="w-full h-28 bg-slate-950 rounded-lg">
            <path d="M 35,25 L 65,25 Q 75,25 75,35 L 75,85 Q 75,95 65,95 L 35,95 Q 25,95 25,85 L 25,35 Q 25,25 35,25 Z" fill="#334155" stroke="#475569" strokeWidth="2" />
            <circle cx="50" cy="50" r="5" fill="#fcdaca" stroke="#000" />
            <circle cx="50" cy="70" r="5" fill="#c94b77" stroke="#000" />
            <text x="50" y="110" textAnchor="middle" fill="#64748b" fontSize="9">Collapsed</text>
            <path d="M 125,20 L 195,20 Q 205,20 205,30 L 205,90 Q 205,100 195,100 L 125,100 Q 115,100 115,90 L 115,30 Q 115,20 125,20 Z" fill="white" stroke="#3b82f6" strokeWidth="3" />
            <circle cx="140" cy="40" r="5" fill="#fcdaca" stroke="#000" />
            <circle cx="180" cy="60" r="5" fill="#c94b77" stroke="#000" />
            <path d="M 140,40 Q 160,20 172,56" stroke="#424242" strokeWidth="1.5" fill="none" />
            <polygon points="0,-3 6,0 0,3" transform="translate(172, 56) rotate(70)" fill="#424242" />
            <text x="160" y="110" textAnchor="middle" fill="#64748b" fontSize="9">Expanded</text>
          </svg>
        }
        code={`{blocks.map((block) => {
  const expandW = block.moveX * animProgress;
  return (
    <g key={block.id}>
      <path d={createPillPath(block, expandW)} fill={expanded ? "white" : "#1e293b"} />
      {block.points.map((pt) => (
        <circle key={pt.id}
          cx={expanded ? embeddedX : pt.posX}
          cy={expanded ? embeddedY : pt.posY}
          r={6} fill={getNodeColor(pt.label)} />
      ))}
      {expanded && block.relations.map(([src, tgt]) => (
        <path d={arcPath} stroke="#424242" fill="none" />
      ))}
    </g>
  );
})}`}
      />
    </div>
  );
}

interface ComponentCardProps {
  name: string;
  description: string;
  svgElement: string;
  dataSource: string;
  props: { name: string; type: string; desc: string }[];
  visualization: React.ReactNode;
  code: string;
}

function ComponentCard({ name, description, svgElement, dataSource, props, visualization, code }: ComponentCardProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-orange-900/50 text-orange-400 rounded text-xs font-mono">{svgElement}</span>
            <span className="px-2 py-1 bg-purple-900/50 text-purple-400 rounded text-xs font-mono">{dataSource}</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm mt-2">{description}</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-white font-medium mb-3">Props</h4>
          <div className="bg-slate-950 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-2 text-left text-slate-400 font-medium">Prop</th>
                  <th className="px-4 py-2 text-left text-slate-400 font-medium">Type</th>
                  <th className="px-4 py-2 text-left text-slate-400 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {props.map((prop) => (
                  <tr key={prop.name} className="border-b border-slate-800/50">
                    <td className="px-4 py-2 text-cyan-400 font-mono">{prop.name}</td>
                    <td className="px-4 py-2 text-purple-400 font-mono">{prop.type}</td>
                    <td className="px-4 py-2 text-slate-300">{prop.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3">Visualization</h4>
          {visualization}
        </div>

        <CodeViewer title={`${name} Implementation`} code={code} />
      </div>
    </div>
  );
}

// ============================================
// Layer Ordering Demo
// ============================================
function LayerOrderingDemo() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <p className="text-slate-300 mb-6">
        SVG elements render in document order. Storylines must render FIRST (behind), then blocks render on top.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-400 text-lg">Correct</span>
          </div>
          <svg viewBox="0 0 200 100" className="w-full h-24 bg-slate-950 rounded-lg">
            <path d="M 20,40 C 50,40 70,50 100,50 C 130,50 150,40 180,40" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <path d="M 20,60 C 50,60 70,55 100,55 C 130,55 150,60 180,60" stroke="#f472b6" strokeWidth="3" fill="none" />
            <rect x="40" y="25" width="40" height="50" rx="10" fill="#334155" stroke="#475569" />
            <rect x="120" y="25" width="40" height="50" rx="10" fill="#334155" stroke="#475569" />
            <circle cx="60" cy="50" r="4" fill="#60a5fa" />
            <circle cx="60" cy="55" r="4" fill="#f472b6" />
            <circle cx="140" cy="50" r="4" fill="#60a5fa" />
            <circle cx="140" cy="55" r="4" fill="#f472b6" />
          </svg>
          <p className="text-slate-500 text-sm mt-2">Blocks cleanly cover storyline paths</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-400 text-lg">Wrong</span>
          </div>
          <svg viewBox="0 0 200 100" className="w-full h-24 bg-slate-950 rounded-lg">
            <rect x="40" y="25" width="40" height="50" rx="10" fill="#334155" stroke="#475569" />
            <rect x="120" y="25" width="40" height="50" rx="10" fill="#334155" stroke="#475569" />
            <path d="M 20,40 C 50,40 70,50 100,50 C 130,50 150,40 180,40" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <path d="M 20,60 C 50,60 70,55 100,55 C 130,55 150,60 180,60" stroke="#f472b6" strokeWidth="3" fill="none" />
          </svg>
          <p className="text-slate-500 text-sm mt-2">Lines visually cut through blocks</p>
        </div>
      </div>

      <CodeViewer
        title="Correct Layer Ordering"
        code={`<svg>
  {/* LAYER 1: Storylines (render first = behind) */}
  <g className="storylines-layer">
    {storylines.map(sl => <StorylinePath key={sl.id} {...sl} />)}
  </g>

  {/* LAYER 2: Blocks (render last = on top) */}
  <g className="blocks-layer">
    {blocks.map(block => <BlockContainer key={block.id} {...block} />)}
  </g>
</svg>`}
      />
    </div>
  );
}

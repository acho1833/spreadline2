'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import CodeViewer from './components/CodeViewer';
import { SpreadLineData, Block, Storyline, TimeLabel, Point } from './components/types';

// Sample data for demos
const sampleData: SpreadLineData = {
  bandWidth: 50,
  blockWidth: 80,
  blocks: [
    {
      id: 0,
      time: "2020",
      moveX: 100,
      names: ["Alice", "Bob"],
      topPosY: 50,
      points: [
        { id: 0, name: "Alice", label: "25", posX: 100, posY: 80, scaleX: 0.5, scaleY: 0.5, group: 0, visibility: "visible" as const },
        { id: 1, name: "Bob", label: "150", posX: 100, posY: 120, scaleX: 0.5, scaleY: 0.5, group: 0, visibility: "visible" as const }
      ],
      relations: [[0, 1]],
      outline: { left: "", right: "", top: "", bottom: "" }
    },
    {
      id: 1,
      time: "2021",
      moveX: 250,
      names: ["Alice", "Bob", "Carol"],
      topPosY: 50,
      points: [
        { id: 0, name: "Alice", label: "75", posX: 250, posY: 70, scaleX: 0.5, scaleY: 0.5, group: 0, visibility: "visible" as const },
        { id: 1, name: "Bob", label: "200", posX: 250, posY: 110, scaleX: 0.5, scaleY: 0.5, group: 0, visibility: "visible" as const },
        { id: 2, name: "Carol", label: "50", posX: 250, posY: 150, scaleX: 0.5, scaleY: 0.5, group: 0, visibility: "visible" as const }
      ],
      relations: [[0, 1], [1, 2]],
      outline: { left: "", right: "", top: "", bottom: "" }
    }
  ],
  storylines: [
    {
      id: 0,
      name: "Alice",
      color: "#60a5fa",
      crossingCheck: false,
      lifespan: 2,
      lines: ["M 100,80 C 150,80 200,70 250,70"],
      marks: [
        { name: "Alice", posX: 100, posY: 80, size: 6, visibility: "visible" as const },
        { name: "Alice", posX: 250, posY: 70, size: 6, visibility: "visible" as const }
      ],
      label: { label: "Alice", line: "", posX: 50, posY: 80, textAlign: "end", visibility: "visible" as const },
      inlineLabels: []
    },
    {
      id: 1,
      name: "Bob",
      color: "#f472b6",
      crossingCheck: false,
      lifespan: 2,
      lines: ["M 100,120 C 150,120 200,110 250,110"],
      marks: [
        { name: "Bob", posX: 100, posY: 120, size: 6, visibility: "visible" as const },
        { name: "Bob", posX: 250, posY: 110, size: 6, visibility: "visible" as const }
      ],
      label: { label: "Bob", line: "", posX: 50, posY: 120, textAlign: "end", visibility: "visible" as const },
      inlineLabels: []
    }
  ],
  timeLabels: [
    { label: "2020", posX: 100 },
    { label: "2021", posX: 250 }
  ],
  heightExtents: [50, 180],
  ego: "Alice"
};

export default function ReactDesign2Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">SpreadLine React Architecture</h1>
              <p className="text-slate-400 text-sm">Component-based visualization system</p>
            </div>
            <Link
              href="/react-design2/demo"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              View Full Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Overview Section */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">System Overview</h2>
          <p className="text-slate-300 leading-relaxed mb-8">
            SpreadLine visualizes egocentric dynamic networks showing how influence spreads through
            networks over time. The React implementation maps data structures directly to SVG elements
            through a component hierarchy.
          </p>

          <DataFlowDiagram />
        </section>

        {/* Data Hook Section */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Data Layer: useSpreadLineData</h2>
          <DataHookExplanation />
        </section>

        {/* Component to SVG Mapping */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Component to SVG Mapping</h2>
          <ComponentSVGMapping />
        </section>

        {/* Layer Ordering */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">SVG Layer Ordering</h2>
          <LayerOrderingDemo />
        </section>

        {/* Interactive Component Demos */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Component Demos</h2>
          <ComponentDemos data={sampleData} />
        </section>

        {/* Full Demo Link */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-slate-400 mb-6">
            See all components working together with interactive data editing.
          </p>
          <Link
            href="/react-design2/demo"
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
// Data Flow Diagram Component
// ============================================
function DataFlowDiagram() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <h3 className="text-lg font-semibold text-white mb-6">Data Flow Architecture</h3>

      {/* Visual Diagram */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {/* JSON Data */}
        <div className="w-64 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-center">
          <div className="text-cyan-400 font-mono text-sm">testData.json</div>
          <div className="text-slate-500 text-xs mt-1">SpreadLineData structure</div>
        </div>

        <Arrow />

        {/* Hook */}
        <div className="w-64 px-4 py-3 bg-purple-900/30 border border-purple-600 rounded-lg text-center">
          <div className="text-purple-400 font-mono text-sm">useSpreadLineData()</div>
          <div className="text-slate-500 text-xs mt-1">Fetch, parse, manage state</div>
        </div>

        <Arrow />

        {/* State */}
        <div className="w-64 px-4 py-3 bg-green-900/30 border border-green-600 rounded-lg text-center">
          <div className="text-green-400 font-mono text-sm">React State</div>
          <div className="text-slate-500 text-xs mt-1">blocks, storylines, timeLabels</div>
        </div>

        <Arrow />

        {/* Components Row */}
        <div className="flex gap-4">
          <ComponentBox name="TimeAxis" color="yellow" />
          <ComponentBox name="Storylines" color="blue" />
          <ComponentBox name="Blocks" color="pink" />
        </div>

        <Arrow />

        {/* SVG Output */}
        <div className="w-64 px-4 py-3 bg-orange-900/30 border border-orange-600 rounded-lg text-center">
          <div className="text-orange-400 font-mono text-sm">&lt;svg&gt;</div>
          <div className="text-slate-500 text-xs mt-1">Rendered visualization</div>
        </div>
      </div>

      <CodeViewer
        title="Data Flow Summary"
        code={`// 1. Load JSON data
const data = await fetch('/testData.json').then(r => r.json());

// 2. useSpreadLineData hook manages the data
const { data, loading, error } = useSpreadLineData('/testData.json');

// 3. Data is destructured into typed arrays
const { blocks, storylines, timeLabels, heightExtents } = data;

// 4. Each array maps to components that render SVG elements
<svg>
  <TimeAxis timeLabels={timeLabels} />
  <Storylines storylines={storylines} />
  <Blocks blocks={blocks} timeLabels={timeLabels} />
</svg>`}
      />
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

function ComponentBox({ name, color }: { name: string; color: string }) {
  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-900/30 border-yellow-600 text-yellow-400',
    blue: 'bg-blue-900/30 border-blue-600 text-blue-400',
    pink: 'bg-pink-900/30 border-pink-600 text-pink-400'
  };
  return (
    <div className={`px-4 py-2 border rounded-lg text-center ${colorClasses[color]}`}>
      <div className="font-mono text-sm">{name}</div>
    </div>
  );
}

// ============================================
// Data Hook Explanation
// ============================================
function DataHookExplanation() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
        <h3 className="text-lg font-semibold text-white mb-4">What useSpreadLineData Does</h3>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">1</div>
              <div>
                <div className="text-white font-medium">Fetches JSON Data</div>
                <div className="text-slate-400 text-sm">Loads testData.json from the server using fetch()</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">2</div>
              <div>
                <div className="text-white font-medium">Parses & Validates</div>
                <div className="text-slate-400 text-sm">Converts JSON string to typed SpreadLineData object</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">3</div>
              <div>
                <div className="text-white font-medium">Manages Loading State</div>
                <div className="text-slate-400 text-sm">Tracks loading, error, and success states</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">4</div>
              <div>
                <div className="text-white font-medium">Provides Type-Safe Data</div>
                <div className="text-slate-400 text-sm">Returns fully typed data for components to consume</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-4">
            <div className="text-slate-400 text-xs mb-2">Hook Return Type</div>
            <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">{`interface UseSpreadLineDataReturn {
  data: SpreadLineData | null;
  loading: boolean;
  error: string | null;
  setData: (data: SpreadLineData) => void;
}`}</pre>
          </div>
        </div>

        <CodeViewer
          title="useSpreadLineData Implementation"
          code={`function useSpreadLineData(url: string) {
  const [data, setData] = useState<SpreadLineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const json: SpreadLineData = await response.json();
        setData(json);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [url]);

  return { data, loading, error, setData };
}`}
        />

        <div className="mt-6">
          <h4 className="text-white font-medium mb-3">How Components Use the Hook</h4>
          <CodeViewer
            title="Usage in SpreadLineViewer"
            code={`function SpreadLineViewer() {
  // Hook returns data and state
  const { data, loading, error, setData } = useSpreadLineData('/testData.json');

  // Handle loading state
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  // Destructure the typed data
  const { blocks, storylines, timeLabels, heightExtents, bandWidth } = data;

  // Pass typed data to child components
  return (
    <svg>
      {/* Each component receives its slice of data */}
      <g className="time-axis">
        {timeLabels.map(tl => <TimeLabel key={tl.label} {...tl} />)}
      </g>
      <g className="storylines">
        {storylines.map(sl => <Storyline key={sl.id} {...sl} />)}
      </g>
      <g className="blocks">
        {blocks.map(block => <Block key={block.id} {...block} />)}
      </g>
    </svg>
  );
}`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Component to SVG Mapping
// ============================================
function ComponentSVGMapping() {
  const mappings = [
    {
      component: 'TimeAxis',
      svgElement: '<text>',
      dataSource: 'timeLabels[]',
      props: 'label, posX',
      description: 'Renders time period labels at the top of each block'
    },
    {
      component: 'Storyline',
      svgElement: '<path>, <circle>',
      dataSource: 'storylines[]',
      props: 'lines[], marks[], color',
      description: 'Bezier curves connecting entity positions across time'
    },
    {
      component: 'Block',
      svgElement: '<path> (pill), <polygon> (arrows)',
      dataSource: 'blocks[]',
      props: 'points[], relations[], moveX',
      description: 'Pill-shaped container with expand/collapse animation'
    },
    {
      component: 'NodePoint',
      svgElement: '<circle>',
      dataSource: 'block.points[]',
      props: 'posX, posY, label (for color)',
      description: 'Colored circles representing entities at a timestep'
    },
    {
      component: 'RelationLine',
      svgElement: '<line>',
      dataSource: 'block.relations[]',
      props: '[sourceId, targetId]',
      description: 'Lines connecting related entities within a block'
    }
  ];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Component</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">SVG Element</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Data Source</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {mappings.map((m, i) => (
            <tr key={i} className="hover:bg-slate-800/50">
              <td className="px-4 py-3">
                <code className="text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">{m.component}</code>
              </td>
              <td className="px-4 py-3">
                <code className="text-orange-400 font-mono text-sm">{m.svgElement}</code>
              </td>
              <td className="px-4 py-3">
                <code className="text-purple-400 font-mono text-sm">{m.dataSource}</code>
              </td>
              <td className="px-4 py-3 text-slate-400 text-sm">{m.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-6 border-t border-slate-700">
        <h4 className="text-white font-medium mb-4">Visual Mapping Example</h4>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Data Structure */}
          <div>
            <div className="text-slate-400 text-xs mb-2 font-medium">DATA STRUCTURE</div>
            <pre className="bg-slate-950 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              <span className="text-purple-400">storylines</span>: [{"{"}<br/>
              {"  "}<span className="text-green-400">lines</span>: [<span className="text-yellow-400">"M 100,80 C 150,80 200,70 250,70"</span>],<br/>
              {"  "}<span className="text-green-400">marks</span>: [{"{"} <span className="text-cyan-400">posX</span>: 100, <span className="text-cyan-400">posY</span>: 80 {"}"}],<br/>
              {"  "}<span className="text-green-400">color</span>: <span className="text-yellow-400">"#60a5fa"</span><br/>
              {"}"}]
            </pre>
          </div>

          {/* SVG Output */}
          <div>
            <div className="text-slate-400 text-xs mb-2 font-medium">SVG OUTPUT</div>
            <pre className="bg-slate-950 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              <span className="text-blue-400">&lt;g</span> <span className="text-cyan-400">className</span>=<span className="text-yellow-400">"storyline"</span><span className="text-blue-400">&gt;</span><br/>
              {"  "}<span className="text-blue-400">&lt;path</span><br/>
              {"    "}<span className="text-cyan-400">d</span>=<span className="text-yellow-400">"M 100,80 C 150,80..."</span><br/>
              {"    "}<span className="text-cyan-400">stroke</span>=<span className="text-yellow-400">"#60a5fa"</span><br/>
              {"  "}<span className="text-blue-400">/&gt;</span><br/>
              {"  "}<span className="text-blue-400">&lt;circle</span> <span className="text-cyan-400">cx</span>=<span className="text-yellow-400">"100"</span> <span className="text-cyan-400">cy</span>=<span className="text-yellow-400">"80"</span> <span className="text-blue-400">/&gt;</span><br/>
              <span className="text-blue-400">&lt;/g&gt;</span>
            </pre>
          </div>
        </div>
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
        SVG elements render in document order - elements that appear later in the code render on top.
        This is critical for SpreadLine where storylines must appear behind block containers.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Wrong Order */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-400 text-lg">✗</span>
            <span className="text-white font-medium">Wrong Order (blocks behind storylines)</span>
          </div>
          <pre className="bg-slate-950 p-4 rounded-lg text-sm font-mono mb-4">
            <span className="text-slate-500">{"// Blocks render first (behind)"}</span><br/>
            <span className="text-blue-400">&lt;g</span> <span className="text-cyan-400">className</span>=<span className="text-yellow-400">"blocks-layer"</span><span className="text-blue-400">&gt;</span>...<span className="text-blue-400">&lt;/g&gt;</span><br/>
            <span className="text-slate-500">{"// Storylines render last (on top)"}</span><br/>
            <span className="text-blue-400">&lt;g</span> <span className="text-cyan-400">className</span>=<span className="text-yellow-400">"storylines-layer"</span><span className="text-blue-400">&gt;</span>...<span className="text-blue-400">&lt;/g&gt;</span>
          </pre>
          <svg viewBox="0 0 200 100" className="w-full h-24 bg-slate-950 rounded-lg">
            {/* Blocks first */}
            <rect x="40" y="20" width="50" height="60" rx="15" fill="#334155" />
            <rect x="110" y="20" width="50" height="60" rx="15" fill="#334155" />
            {/* Lines on top - WRONG */}
            <path d="M 65,40 C 90,40 110,50 135,50" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <path d="M 65,60 C 90,60 110,55 135,55" stroke="#f472b6" strokeWidth="3" fill="none" />
          </svg>
          <p className="text-slate-500 text-sm mt-2">Lines appear on top of blocks</p>
        </div>

        {/* Correct Order */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-400 text-lg">✓</span>
            <span className="text-white font-medium">Correct Order (storylines behind blocks)</span>
          </div>
          <pre className="bg-slate-950 p-4 rounded-lg text-sm font-mono mb-4">
            <span className="text-slate-500">{"// Storylines render first (behind)"}</span><br/>
            <span className="text-blue-400">&lt;g</span> <span className="text-cyan-400">className</span>=<span className="text-yellow-400">"storylines-layer"</span><span className="text-blue-400">&gt;</span>...<span className="text-blue-400">&lt;/g&gt;</span><br/>
            <span className="text-slate-500">{"// Blocks render last (on top)"}</span><br/>
            <span className="text-blue-400">&lt;g</span> <span className="text-cyan-400">className</span>=<span className="text-yellow-400">"blocks-layer"</span><span className="text-blue-400">&gt;</span>...<span className="text-blue-400">&lt;/g&gt;</span>
          </pre>
          <svg viewBox="0 0 200 100" className="w-full h-24 bg-slate-950 rounded-lg">
            {/* Lines first - CORRECT */}
            <path d="M 65,40 C 90,40 110,50 135,50" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <path d="M 65,60 C 90,60 110,55 135,55" stroke="#f472b6" strokeWidth="3" fill="none" />
            {/* Blocks on top */}
            <rect x="40" y="20" width="50" height="60" rx="15" fill="#334155" />
            <rect x="110" y="20" width="50" height="60" rx="15" fill="#334155" />
            {/* Points visible on blocks */}
            <circle cx="65" cy="40" r="4" fill="#60a5fa" />
            <circle cx="65" cy="60" r="4" fill="#f472b6" />
            <circle cx="135" cy="50" r="4" fill="#60a5fa" />
            <circle cx="135" cy="55" r="4" fill="#f472b6" />
          </svg>
          <p className="text-slate-500 text-sm mt-2">Blocks cover storyline paths cleanly</p>
        </div>
      </div>

      <CodeViewer
        title="Correct Layer Ordering in JSX"
        code={`<svg viewBox={viewBox}>
  {/* LAYER 1: Time labels (background) */}
  <g className="time-labels-layer">
    {timeLabels.map(tl => (
      <text key={tl.label} x={tl.posX} y={30}>{tl.label}</text>
    ))}
  </g>

  {/* LAYER 2: Storylines (behind blocks) */}
  <g className="storylines-layer">
    {storylines.map(storyline => (
      <g key={storyline.id}>
        {storyline.lines.map((d, i) => (
          <path key={i} d={d} stroke={storyline.color} fill="none" />
        ))}
      </g>
    ))}
  </g>

  {/* LAYER 3: Blocks (on top, covers storyline paths) */}
  <g className="blocks-layer">
    {blocks.map((block, idx) => (
      <BlockComponent key={block.id} block={block} timeLabel={timeLabels[idx]} />
    ))}
  </g>
</svg>`}
      />
    </div>
  );
}

// ============================================
// Component Demos
// ============================================
function ComponentDemos({ data }: { data: SpreadLineData }) {
  return (
    <div className="space-y-8">
      {/* Storyline Component */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
        <h3 className="text-lg font-semibold text-white mb-4">Storyline Component</h3>
        <p className="text-slate-400 mb-6">
          Each storyline represents an entity's path through time. The <code className="text-cyan-400">lines</code> array
          contains SVG path strings (Bezier curves) and <code className="text-cyan-400">marks</code> define node positions.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-slate-400 text-xs mb-2 font-medium">LIVE DEMO</div>
            <svg viewBox="0 0 350 150" className="w-full h-36 bg-slate-950 rounded-lg">
              {data.storylines.map(storyline => (
                <g key={storyline.id}>
                  {/* Path */}
                  {storyline.lines.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      stroke={storyline.color}
                      strokeWidth={3}
                      fill="none"
                    />
                  ))}
                  {/* Marks */}
                  {storyline.marks.map((mark, i) => (
                    <circle
                      key={i}
                      cx={mark.posX}
                      cy={mark.posY}
                      r={mark.size}
                      fill={storyline.color}
                    />
                  ))}
                  {/* Label */}
                  <text
                    x={storyline.label.posX}
                    y={storyline.label.posY}
                    textAnchor="end"
                    fill={storyline.color}
                    fontSize={12}
                  >
                    {storyline.label.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div>
            <div className="text-slate-400 text-xs mb-2 font-medium">DATA</div>
            <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-36 overflow-y-auto">
{JSON.stringify(data.storylines[0], null, 2)}
            </pre>
          </div>
        </div>

        <CodeViewer
          title="Storyline Component"
          code={`function Storyline({ storyline }: { storyline: Storyline }) {
  return (
    <g className="storyline">
      {/* Render path curves */}
      {storyline.lines.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={storyline.color}
          strokeWidth={3}
          fill="none"
        />
      ))}

      {/* Render node marks */}
      {storyline.marks
        .filter(m => m.visibility === 'visible')
        .map((mark, i) => (
          <circle
            key={i}
            cx={mark.posX}
            cy={mark.posY}
            r={mark.size}
            fill={storyline.color}
          />
        ))}

      {/* Render label */}
      {storyline.label.visibility === 'visible' && (
        <text
          x={storyline.label.posX}
          y={storyline.label.posY}
          textAnchor={storyline.label.textAlign}
          fill={storyline.color}
        >
          {storyline.label.label}
        </text>
      )}
    </g>
  );
}`}
        />
      </div>

      {/* Block Component */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
        <h3 className="text-lg font-semibold text-white mb-4">Block Component</h3>
        <p className="text-slate-400 mb-6">
          Blocks are pill-shaped containers representing a time period. They contain node points and can expand
          to show internal relationships. The pill shape is created with a custom SVG path.
        </p>

        <div className="mb-6">
          <div className="text-slate-400 text-xs mb-2 font-medium">LIVE DEMO</div>
          <svg viewBox="0 0 350 150" className="w-full h-36 bg-slate-950 rounded-lg">
            {/* Pill-shaped block */}
            <path
              d="M 80,40 L 120,40 A 15,15 0 0 1 120,70 A 15,15 0 0 1 120,100 L 80,100 A 15,15 0 0 1 80,70 A 15,15 0 0 1 80,40 Z"
              fill="#334155"
              stroke="#475569"
              strokeWidth={1}
            />
            {/* Arrow markers */}
            <polygon points="70,60 60,55 60,65" fill="#60a5fa" />
            <polygon points="130,70 140,65 140,75" fill="#60a5fa" />
            {/* Node points */}
            <circle cx="100" cy="55" r="5" fill="#fcdaca" />
            <circle cx="100" cy="75" r="5" fill="#c94b77" />

            {/* Second block */}
            <path
              d="M 200,35 L 240,35 A 15,15 0 0 1 240,65 A 15,15 0 0 1 240,95 A 15,15 0 0 1 240,125 L 200,125 A 15,15 0 0 1 200,95 A 15,15 0 0 1 200,65 A 15,15 0 0 1 200,35 Z"
              fill="#334155"
              stroke="#475569"
              strokeWidth={1}
            />
            <polygon points="190,60 180,55 180,65" fill="#60a5fa" />
            <polygon points="250,80 260,75 260,85" fill="#60a5fa" />
            <circle cx="220" cy="50" r="5" fill="#fcdaca" />
            <circle cx="220" cy="80" r="5" fill="#e599a6" />
            <circle cx="220" cy="110" r="5" fill="#ffffff" />

            {/* Time labels */}
            <text x="100" y="25" textAnchor="middle" fill="#94a3b8" fontSize={12}>2020</text>
            <text x="220" y="25" textAnchor="middle" fill="#94a3b8" fontSize={12}>2021</text>
          </svg>
        </div>

        <CodeViewer
          title="Pill Path Generation"
          code={`function createPillPath(block: Block, x: number, width: number): string {
  // Calculate bounds from points
  const minY = Math.min(...block.points.map(p => p.posY)) - 20;
  const maxY = Math.max(...block.points.map(p => p.posY)) + 20;
  const height = maxY - minY;
  const radius = Math.min(15, height / 2);

  // Create pill-shaped path
  return \`
    M \${x - width/2 + radius},\${minY}
    L \${x + width/2 - radius},\${minY}
    A \${radius},\${radius} 0 0 1 \${x + width/2},\${minY + radius}
    L \${x + width/2},\${maxY - radius}
    A \${radius},\${radius} 0 0 1 \${x + width/2 - radius},\${maxY}
    L \${x - width/2 + radius},\${maxY}
    A \${radius},\${radius} 0 0 1 \${x - width/2},\${maxY - radius}
    L \${x - width/2},\${minY + radius}
    A \${radius},\${radius} 0 0 1 \${x - width/2 + radius},\${minY}
    Z
  \`;
}`}
        />
      </div>

      {/* Node Color Scale */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
        <h3 className="text-lg font-semibold text-white mb-4">Node Color Scale</h3>
        <p className="text-slate-400 mb-6">
          Node colors encode attribute values (e.g., citation count). The <code className="text-cyan-400">getNodeColor</code>
          function maps numeric values to a color scale.
        </p>

        <div className="flex items-center gap-4 mb-6">
          {[
            { threshold: '< 10', color: '#ffffff' },
            { threshold: '< 50', color: '#fcdaca' },
            { threshold: '< 100', color: '#e599a6' },
            { threshold: '< 500', color: '#c94b77' },
            { threshold: '>= 500', color: '#740980' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border border-slate-600"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-400 text-sm">{item.threshold}</span>
            </div>
          ))}
        </div>

        <CodeViewer
          title="getNodeColor Function"
          code={`export const getNodeColor = (
  label: number,
  thresholds = [10, 50, 100, 500]
): string => {
  const colors = ['#ffffff', '#fcdaca', '#e599a6', '#c94b77', '#740980'];

  for (let i = 0; i < thresholds.length; i++) {
    if (label < thresholds[i]) return colors[i];
  }

  return colors[colors.length - 1];
};

// Usage in component:
<circle
  cx={point.posX}
  cy={point.posY}
  r={5}
  fill={getNodeColor(parseInt(point.label))}
/>`}
        />
      </div>
    </div>
  );
}

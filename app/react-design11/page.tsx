'use client';

import Link from 'next/link';

export default function ReactDesign11Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">SpreadLine React v11</h1>
              <p className="text-slate-400 text-sm">Strict React/D3 Rendering Separation</p>
            </div>
            <Link
              href="/react-design11/demo"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Overview */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Product Requirements Document</h2>
          <Overview />
        </section>

        {/* Architecture */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">System Architecture</h2>
          <Architecture />
        </section>

        {/* Component Hierarchy */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Component Hierarchy</h2>
          <ComponentHierarchy />
        </section>

        {/* Data Flow */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Data Flow</h2>
          <DataFlow />
        </section>

        {/* Core Components */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Core Components</h2>
          <CoreComponents />
        </section>

        {/* D3 Integration */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">D3 Integration Pattern</h2>
          <D3Integration />
        </section>

        {/* State Management */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">State Management</h2>
          <StateManagement />
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Key Features</h2>
          <KeyFeatures />
        </section>

        {/* API Reference */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">API Reference</h2>
          <APIReference />
        </section>

        {/* Implementation Guide */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Implementation Guide</h2>
          <ImplementationGuide />
        </section>

        {/* Testing Guide */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Testing Guide</h2>
          <TestingGuide />
        </section>

        {/* Demo Link */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-slate-400 mb-6">
            View the live demo to see all features in action.
          </p>
          <Link
            href="/react-design11/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-lg font-medium transition-all"
          >
            Open Live Demo
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
// Overview Section
// ============================================
function Overview() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <h3 className="text-xl font-semibold text-white mb-4">What is SpreadLine?</h3>
      <p className="text-slate-300 leading-relaxed mb-6">
        SpreadLine is a visualization framework for exploring <strong className="text-cyan-400">egocentric dynamic networks</strong> from
        the perspective of a central node (ego). Based on the IEEE TVCG 2024 paper "SpreadLine: Visualizing Egocentric Dynamic Influence",
        it shows how influence spreads through networks over time, centered around a focal actor.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-2xl mb-1">198</div>
          <div className="text-slate-400 text-sm">Storylines (Entities)</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-2xl mb-1">21</div>
          <div className="text-slate-400 text-sm">Time Blocks (Years)</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-2xl mb-1">~600</div>
          <div className="text-slate-400 text-sm">Reference Labels</div>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-4">Key Capabilities</h3>
      <ul className="space-y-2 text-slate-300">
        <li className="flex items-start gap-2">
          <span className="text-green-400 mt-1">✓</span>
          <span><strong>Block Expansion:</strong> Click blocks to expand and see detailed node positions and relationships</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-400 mt-1">✓</span>
          <span><strong>Time Label Clicks:</strong> Click year labels to toggle block expansion</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-400 mt-1">✓</span>
          <span><strong>Brush Selection:</strong> Drag on timeline to select multiple time periods</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-400 mt-1">✓</span>
          <span><strong>Storyline Filtering:</strong> Filter by lifespan (years) and crossing behavior</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-400 mt-1">✓</span>
          <span><strong>Hover/Pin Interactions:</strong> Highlight and pin storylines for comparison</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-400 mt-1">✓</span>
          <span><strong>Reference Labels:</strong> Show paper/reference labels in expanded blocks</span>
        </li>
      </ul>
    </div>
  );
}

// ============================================
// Architecture Section
// ============================================
function Architecture() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
        <h3 className="text-xl font-semibold text-white mb-4">Hybrid React + D3 Architecture</h3>
        <p className="text-slate-300 leading-relaxed mb-6">
          This implementation uses a <strong className="text-cyan-400">"React renders container, D3 takes over"</strong> pattern.
          React manages the component lifecycle, data fetching, and state, while D3 handles all SVG rendering,
          animations, and interactions.
        </p>

        <div className="bg-slate-950 rounded-lg p-6 font-mono text-sm">
          <pre className="text-slate-300">{`
┌─────────────────────────────────────────────────────────────┐
│                    React Layer (Lifecycle)                   │
├─────────────────────────────────────────────────────────────┤
│  DemoPage (page.tsx)                                        │
│    ├── QueryClientProvider (React Query)                    │
│    ├── SpreadLineDemo                                       │
│    │     ├── useSpreadLineData() - Data fetching           │
│    │     ├── useState() - Filter controls                  │
│    │     ├── useMemo() - Config memoization                │
│    │     └── SpreadLineChart                               │
│    │           ├── useRef() - SVG container ref            │
│    │           ├── useCallbackRef() - Stable callbacks     │
│    │           └── useEffect() - D3 initialization         │
│    └── DataEditor (optional sidebar)                       │
├─────────────────────────────────────────────────────────────┤
│                    D3 Layer (Rendering)                      │
├─────────────────────────────────────────────────────────────┤
│  SpreadLinesVisualizer (class)                              │
│    ├── visualize() - Main entry point                      │
│    ├── _drawBackground() - Time labels, rules              │
│    ├── _drawStorylines() - Path segments, markers          │
│    ├── _drawBlocksAndPoints() - Blocks, points             │
│    ├── _drawLabels() - Entity labels                       │
│    ├── _activateBrush() - Brush selection                  │
│    └── _blockUpdate() - Expansion handler                  │
│         ├── Expander (class) - Expand animation            │
│         └── Collapser (class) - Collapse animation         │
└─────────────────────────────────────────────────────────────┘
          `}</pre>
        </div>
      </div>

      {/* v11 Key Improvement */}
      <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl border border-green-700 p-8">
        <h3 className="text-xl font-semibold text-green-400 mb-4">v11: Strict Rendering Separation</h3>
        <p className="text-slate-300 leading-relaxed mb-4">
          In v11, we enforce a strict boundary between React and D3 rendering:
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
        <div className="mt-4 p-3 bg-slate-950/50 rounded-lg font-mono text-xs">
          <pre className="text-slate-300">{`// v10 (BAD): Filters in dependencies → full re-init on filter change
}, [data, config, yearsFilter, crossingOnly]);

// v11 (GOOD): Only data/config → D3 handles filter updates
}, [data, config]);`}</pre>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
        <h3 className="text-xl font-semibold text-white mb-4">Why This Pattern?</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-cyan-400 font-medium mb-2">Benefits</h4>
            <ul className="space-y-1 text-slate-300 text-sm">
              <li>• D3 handles complex SVG path generation</li>
              <li>• Native D3 transitions (500ms, easeQuadInOut)</li>
              <li>• Force simulation for collision detection</li>
              <li>• Brush selection with snap-to-block</li>
              <li>• React manages data fetching and UI state</li>
            </ul>
          </div>
          <div>
            <h4 className="text-orange-400 font-medium mb-2">Considerations</h4>
            <ul className="space-y-1 text-slate-300 text-sm">
              <li>• D3 directly mutates DOM (not React-controlled)</li>
              <li>• Must prevent React re-renders during D3 animations</li>
              <li>• Config/callbacks must be memoized</li>
              <li>• useRef for stable references</li>
              <li>• <strong className="text-green-400">v11:</strong> useValueRef for filter props</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Component Hierarchy
// ============================================
function ComponentHierarchy() {
  const components = [
    {
      name: 'SpreadLineChart.tsx',
      type: 'React Component',
      description: 'Bridge between React and D3. Manages SVG container ref, initializes visualizer on mount.',
      props: ['data', 'config', 'onBlockExpand', 'onFilterChange', 'resetKey', 'yearsFilter', 'crossingOnly'],
    },
    {
      name: 'SpreadLineVisualizer.ts',
      type: 'D3 Class',
      description: 'Main visualization orchestrator. Handles all D3 rendering and interactions.',
      methods: ['visualize()', 'applyFilter()', 'destroy()'],
    },
    {
      name: 'Expander.ts',
      type: 'D3 Class',
      description: 'Handles block expansion animation. Shifts elements, draws fill lines, expands background.',
      methods: ['act()', 'updateBrushedSelection()'],
    },
    {
      name: 'Collapser.ts',
      type: 'D3 Class',
      description: 'Handles block collapse animation. Reverses expansion, removes fill lines.',
      methods: ['act()'],
    },
    {
      name: 'types.ts',
      type: 'TypeScript',
      description: 'Type definitions for all data structures and configuration.',
      exports: ['SpreadLineData', 'SpreadLineConfig', 'Block', 'Storyline', 'TimeLabel'],
    },
    {
      name: 'useSpreadLineData.ts',
      type: 'React Hook',
      description: 'Custom hook for fetching and managing SpreadLine data with React Query.',
      returns: ['data', 'loading', 'error', 'setData'],
    },
    {
      name: 'd3-utils.ts',
      type: 'Utilities',
      description: 'Helper functions for D3 operations, CSS injection, text utilities.',
      exports: ['_compute_embedding()', 'getTextWidth()', 'wrap()', 'createStyleElementFromCSS()'],
    },
    {
      name: 'DataEditor.tsx',
      type: 'React Component',
      description: 'JSON editor sidebar for modifying visualization data in real-time.',
      props: ['initialData', 'onDataChange', 'onRefresh'],
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {components.map((comp) => (
        <div key={comp.name} className="bg-slate-900 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              comp.type === 'React Component' ? 'bg-blue-900 text-blue-300' :
              comp.type === 'D3 Class' ? 'bg-purple-900 text-purple-300' :
              comp.type === 'React Hook' ? 'bg-green-900 text-green-300' :
              'bg-slate-700 text-slate-300'
            }`}>
              {comp.type}
            </span>
          </div>
          <h3 className="text-white font-semibold mb-2">{comp.name}</h3>
          <p className="text-slate-400 text-sm mb-3">{comp.description}</p>
          {comp.props && (
            <div className="text-xs">
              <span className="text-slate-500">Props: </span>
              <span className="text-cyan-400">{comp.props.join(', ')}</span>
            </div>
          )}
          {comp.methods && (
            <div className="text-xs">
              <span className="text-slate-500">Methods: </span>
              <span className="text-purple-400">{comp.methods.join(', ')}</span>
            </div>
          )}
          {comp.exports && (
            <div className="text-xs">
              <span className="text-slate-500">Exports: </span>
              <span className="text-green-400">{comp.exports.join(', ')}</span>
            </div>
          )}
          {comp.returns && (
            <div className="text-xs">
              <span className="text-slate-500">Returns: </span>
              <span className="text-orange-400">{comp.returns.join(', ')}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Data Flow Section
// ============================================
function DataFlow() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <div className="bg-slate-950 rounded-lg p-6 font-mono text-sm mb-6">
        <pre className="text-slate-300">{`
Data Loading Flow:
==================
1. DemoPage mounts
2. useSpreadLineData('/testData.json') called
3. React Query fetches JSON
4. Data validated and typed as SpreadLineData
5. SpreadLineChart receives data prop
6. useEffect triggers initVisualization()
7. SpreadLinesVisualizer.visualize() called
8. D3 renders all SVG elements

Filter Flow:
============
1. User moves slider or toggles checkbox
2. React state updates (yearsFilter, crossingOnly)
3. useEffect detects change
4. visualizer.applyFilter(yearsFilter, crossingOnly)
5. D3 updates element visibility

Block Expansion Flow:
=====================
1. User clicks block or time label
2. D3 click handler fires
3. _blockUpdate(event, block) called
4. Expander/Collapser instantiated
5. actor.act() triggers animations:
   - Shift elements to right
   - Draw fill lines for crossing storylines
   - Expand background rectangle
   - Run force simulation for points
   - Draw reference labels
6. onBlockExpand callback notifies React
        `}</pre>
      </div>

      <h4 className="text-lg font-semibold text-white mb-4">Data Structure</h4>
      <div className="bg-slate-950 rounded-lg p-6 font-mono text-sm overflow-x-auto">
        <pre className="text-slate-300">{`interface SpreadLineData {
  ego: string;                    // Central entity name ("Jeffrey Heer")
  bandWidth: number;              // Block width in pixels (101.816)
  heightExtents: [number, number]; // Y-axis bounds [min, max]
  timeLabels: TimeLabel[];        // Time axis labels with positions
  storylines: Storyline[];        // All entity storylines (198 items)
  blocks: Block[];                // Time period blocks (21 items)
  reference?: Reference[];        // Paper reference labels (~600 items)
}

interface Storyline {
  id: number;
  name: string;
  color: string;
  lifespan: number;              // Years entity is active
  crossingCheck: boolean;        // true = crosses blocks, false = member
  lines: string[];               // SVG path strings
  marks: Mark[];                 // Entry/exit markers
  label: Label;                  // Entity label config
  inlineLabels: InlineLabel[];   // Labels along storyline
}

interface Block {
  id: number;
  time: string;                  // Year ("2005")
  names: string[];               // Member entity names
  points: Point[];               // Node positions
  relations: [number, number][]; // Node connections
  moveX: number;                 // Expansion width
  topPosY: number;               // Top of block
  outline: {                     // Block shape paths
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
}`}</pre>
      </div>
    </div>
  );
}

// ============================================
// Core Components Detail
// ============================================
function CoreComponents() {
  return (
    <div className="space-y-6">
      {/* SpreadLineChart */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">SpreadLineChart.tsx</h3>
          <p className="text-slate-400 text-sm">React wrapper that bridges to D3</p>
        </div>
        <div className="p-6">
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-slate-300">{`// Key implementation pattern
export default function SpreadLineChart({
  data,
  config,
  onBlockExpand,
  yearsFilter = 1,
  crossingOnly = false,
}: SpreadLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const visualizerRef = useRef<SpreadLinesVisualizer | null>(null);

  // Use refs for callbacks to prevent re-initialization
  const onBlockExpandRef = useCallbackRef(onBlockExpand);

  // Initialize D3 visualization
  const initVisualization = useCallback(() => {
    if (!svgRef.current || !data) return;

    // Cleanup existing
    visualizerRef.current?.destroy();
    svgRef.current.innerHTML = '';

    // Create and render
    const visualizer = new SpreadLinesVisualizer(data, config);
    visualizer.onBlockExpand = (id, exp) => onBlockExpandRef.current?.(id, exp);
    visualizer.visualize(svgRef.current);
    visualizer.applyFilter(yearsFilter, crossingOnly);
    visualizerRef.current = visualizer;
  }, [data, config, yearsFilter, crossingOnly]);

  useEffect(() => {
    initVisualization();
    return () => visualizerRef.current?.destroy();
  }, [initVisualization, resetKey]);

  // Filter updates don't require full re-init
  useEffect(() => {
    visualizerRef.current?.applyFilter(yearsFilter, crossingOnly);
  }, [yearsFilter, crossingOnly]);

  return (
    <div className="spreadline-chart relative">
      <svg ref={svgRef} style={{ overflow: 'visible' }} />
    </div>
  );
}`}</pre>
          </div>
        </div>
      </div>

      {/* Expander */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Expander.ts</h3>
          <p className="text-slate-400 text-sm">Block expansion animation handler</p>
        </div>
        <div className="p-6">
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-slate-300">{`class Expander {
  act(): void {
    // 1. Shift all elements to the right
    d3.selectAll('.movable')
      .filter(elem => elem.getBBox().x >= this.posX)
      .each(function() {
        d3.select(this)
          .transition()
          .duration(500)
          .ease(d3.easeQuadInOut)
          .attr('transform', \`translate(\${currX + moveX}, \${currY})\`);
      });

    // 2. Draw fill lines for crossing storylines
    this._fillDummyLines(id);

    // 3. Expand block background
    this._expandBlock(id);

    // 4. Position points with force simulation
    this._contextualize(id);

    // 5. Update brush selection
    this._updateBrush();
  }

  private _contextualize(id: number): void {
    // Force simulation for collision detection
    const simulation = d3.forceSimulation(nodes)
      .force('x', d3.forceX(d => d.x))
      .force('y', d3.forceY(d => d.y))
      .force('collide', d3.forceCollide(d => d.width))
      .stop();

    for (let i = 0; i < 100; i++) simulation.tick();
  }
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// D3 Integration
// ============================================
function D3Integration() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <h3 className="text-xl font-semibold text-white mb-4">Critical Integration Patterns</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-cyan-400 font-medium mb-2">1. Preventing React Re-renders</h4>
          <p className="text-slate-300 text-sm mb-3">
            Use <code className="bg-slate-800 px-1 rounded">useMemo</code> for config objects and
            <code className="bg-slate-800 px-1 rounded">useCallbackRef</code> for callbacks to prevent
            the useEffect from triggering unnecessary D3 re-initialization.
          </p>
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs">
            <pre className="text-slate-300">{`// BAD: Creates new object every render
const config = { content: { showLinks: false } };

// GOOD: Memoized, stable reference
const config = useMemo(() => ({ content: { showLinks: false } }), []);`}</pre>
          </div>
        </div>

        <div>
          <h4 className="text-cyan-400 font-medium mb-2">2. D3 Data Binding</h4>
          <p className="text-slate-300 text-sm mb-3">
            D3 binds data to DOM elements via <code className="bg-slate-800 px-1 rounded">__data__</code> property.
            The join pattern (enter/update/exit) manages element lifecycle.
          </p>
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs">
            <pre className="text-slate-300">{`container.selectAll('g')
  .data(this.data.blocks)
  .join(enter => {
    const g = enter.append('g')
      .attr('class', 'arcs')
      .on('click', (event, d) => this._blockUpdate(event, d));
    return g;
  });`}</pre>
          </div>
        </div>

        <div>
          <h4 className="text-cyan-400 font-medium mb-2">3. Animation Transitions</h4>
          <p className="text-slate-300 text-sm mb-3">
            All animations use D3 transitions with 500ms duration and easeQuadInOut easing.
          </p>
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs">
            <pre className="text-slate-300">{`const animation = d3.transition()
  .duration(500)
  .ease(d3.easeQuadInOut);

d3.select(element)
  .transition(animation)
  .attr('transform', \`translate(\${newX}, \${newY})\`);`}</pre>
          </div>
        </div>

        <div>
          <h4 className="text-cyan-400 font-medium mb-2">4. CSS Injection</h4>
          <p className="text-slate-300 text-sm mb-3">
            Styles are injected directly into the SVG for portability and consistent rendering.
          </p>
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs">
            <pre className="text-slate-300">{`const style = createStyleElementFromCSS();
svgNode.insertBefore(style, svgNode.firstChild);`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// State Management
// ============================================
function StateManagement() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <h3 className="text-xl font-semibold text-white mb-4">State Ownership</h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-blue-400 font-medium mb-3">React State</h4>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>data:</strong> SpreadLine JSON data (via React Query)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>yearsFilter:</strong> Slider value for lifespan threshold</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>crossingOnly:</strong> Checkbox for filtering crossing lines</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>resetKey:</strong> Counter to force full re-initialization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong>showEditor:</strong> Toggle for data editor sidebar</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-purple-400 font-medium mb-3">D3 State (Visualizer)</h4>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span><strong>visibility:</strong> Entity visibility map</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span><strong>members:</strong> Pinned/filtered entity lists</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span><strong>actors:</strong> Active Expander/Collapser instances</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span><strong>brushComponent:</strong> Brush state and selection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span><strong>storylines:</strong> Processed storylines with show flags</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Key Features
// ============================================
function KeyFeatures() {
  const features = [
    {
      title: 'Block Expansion',
      description: 'Click pill-shaped blocks to expand. Shows node positions using force simulation, reference labels, and relation arcs.',
      implementation: '_blockUpdate() → Expander.act() → _contextualize() with d3.forceSimulation'
    },
    {
      title: 'Time Label Click',
      description: 'Click year labels (2002, 2003, etc.) to toggle the corresponding block expansion.',
      implementation: 'Time label .on("click") finds matching block and calls _blockUpdate()'
    },
    {
      title: 'Storyline Filtering',
      description: 'Filter by minimum lifespan (years slider) or show only crossing lines (checkbox).',
      implementation: 'applyFilter(yearsFilter, crossingOnly) updates visibility CSS'
    },
    {
      title: 'Brush Selection',
      description: 'Drag on timeline to select time range. Double-click to clear. Syncs with block expansions.',
      implementation: 'd3.brushX() with snap-to-block behavior and updateBrushedSelection()'
    },
    {
      title: 'Hover Highlighting',
      description: 'Hover storylines to highlight, de-emphasize others. Click to pin for persistent highlight.',
      implementation: '_lineHover(), _lineHoverOut(), _linePin() with CSS classes'
    },
    {
      title: 'Label Visibility',
      description: 'Toggle between Some/Hide/Reveal labels. "Some" shows only high-lifespan entities.',
      implementation: '80th percentile lifespan threshold, toggled via legend button'
    },
    {
      title: 'Reference Labels',
      description: 'Expanded blocks show paper/reference labels positioned using scaleX/scaleY.',
      implementation: 'customizeComponent callback in config, called from _expandBlock()'
    },
  ];

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <div key={feature.title} className="bg-slate-900 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
          <p className="text-slate-400 text-sm mb-3">{feature.description}</p>
          <div className="text-xs bg-slate-800 rounded px-3 py-2">
            <span className="text-slate-500">Implementation: </span>
            <span className="text-cyan-400 font-mono">{feature.implementation}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// API Reference
// ============================================
function APIReference() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">SpreadLineChart Props</h3>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400">
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
              <td className="py-3">The visualization data</td>
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
            <tr className="border-t border-slate-700">
              <td className="py-3 pr-4 font-mono text-cyan-400">resetKey</td>
              <td className="py-3 pr-4 font-mono">number</td>
              <td className="py-3 pr-4">0</td>
              <td className="py-3">Increment to force re-init</td>
            </tr>
            <tr className="border-t border-slate-700">
              <td className="py-3 pr-4 font-mono text-cyan-400">onBlockExpand</td>
              <td className="py-3 pr-4 font-mono">(id, expanded) =&gt; void</td>
              <td className="py-3 pr-4">undefined</td>
              <td className="py-3">Block expansion callback</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Implementation Guide
// ============================================
function ImplementationGuide() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <h3 className="text-xl font-semibold text-white mb-6">Step-by-Step Implementation</h3>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">1</div>
          <div>
            <h4 className="text-white font-medium">Install Dependencies</h4>
            <div className="mt-2 p-3 bg-slate-950 rounded-lg font-mono text-sm">
              npm install d3 @types/d3 @tanstack/react-query
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">2</div>
          <div>
            <h4 className="text-white font-medium">Copy Component Files</h4>
            <p className="text-slate-400 text-sm mt-1">Copy all files from components/ directory to your project.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">3</div>
          <div>
            <h4 className="text-white font-medium">Add Data File</h4>
            <p className="text-slate-400 text-sm mt-1">Place testData.json in public/ directory.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">4</div>
          <div>
            <h4 className="text-white font-medium">Create Page Component</h4>
            <div className="mt-2 p-3 bg-slate-950 rounded-lg font-mono text-sm overflow-x-auto">
              <pre className="text-slate-300">{`import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSpreadLineData } from './components/useSpreadLineData';
import SpreadLineChart from './components/SpreadLineChart';

const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <SpreadLineVisualization />
    </QueryClientProvider>
  );
}

function SpreadLineVisualization() {
  const { data, loading } = useSpreadLineData('/testData.json');

  if (loading || !data) return <div>Loading...</div>;

  return <SpreadLineChart data={data} />;
}`}</pre>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">5</div>
          <div>
            <h4 className="text-white font-medium">Add Filter Controls (Optional)</h4>
            <div className="mt-2 p-3 bg-slate-950 rounded-lg font-mono text-sm overflow-x-auto">
              <pre className="text-slate-300">{`const [yearsFilter, setYearsFilter] = useState(1);
const [crossingOnly, setCrossingOnly] = useState(false);

<input type="range" min="1" max="20" value={yearsFilter}
       onChange={(e) => setYearsFilter(Number(e.target.value))} />
<input type="checkbox" checked={crossingOnly}
       onChange={(e) => setCrossingOnly(e.target.checked)} />

<SpreadLineChart
  data={data}
  yearsFilter={yearsFilter}
  crossingOnly={crossingOnly}
/>`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Testing Guide
// ============================================
function TestingGuide() {
  const tests = [
    {
      category: 'Block Expansion',
      items: [
        'Click any pill block - should expand with smooth animation',
        'Click year label (e.g., "2005") - should toggle corresponding block',
        'Expand multiple blocks - storylines should stay connected',
        'Reference labels appear in expanded blocks',
      ]
    },
    {
      category: 'Filtering',
      items: [
        'Move years slider - low-lifespan storylines disappear',
        'Check "crossing only" - block members hidden, crossers visible',
        'Filters persist across block expansions',
      ]
    },
    {
      category: 'Interactions',
      items: [
        'Hover storyline - highlights it, de-emphasizes others',
        'Click storyline - pins highlight (persists after mouseout)',
        'Drag on timeline - brush selection appears',
        'Double-click brush - clears selection',
      ]
    },
    {
      category: 'Labels',
      items: [
        'Click "Some Labels" - toggles between Some/Hide/Reveal',
        'High-lifespan entities always have visible labels',
        'Ego label always visible',
      ]
    },
  ];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <h3 className="text-lg font-semibold text-white mb-6">Testing Checklist</h3>

      <div className="grid md:grid-cols-2 gap-8">
        {tests.map((test) => (
          <div key={test.category}>
            <h4 className="text-cyan-400 font-medium mb-3">{test.category}</h4>
            <ul className="space-y-2">
              {test.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded border border-slate-600 flex-shrink-0 mt-0.5"></span>
                  <span className="text-slate-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

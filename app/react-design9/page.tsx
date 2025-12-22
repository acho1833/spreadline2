'use client';

/**
 * SpreadLine React + D3.js Documentation
 *
 * This page documents the React + D3 hybrid implementation approach,
 * explaining how D3 handles animations and interactions while React
 * manages the component lifecycle.
 */

import Link from 'next/link';
import CodeViewer from './components/CodeViewer';

export default function ReactDesign9Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SpreadLine <span className="text-orange-600">React + D3.js</span> Architecture
              </h1>
              <p className="text-gray-500 text-sm">
                Light theme version matching the original visualization
              </p>
            </div>
            <Link
              href="/react-design9/demo"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-gray-900 rounded-lg transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Why React + D3 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why React + D3.js?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ComparisonCard
              title="react-design6 (Pure React)"
              items={[
                'Manual animation via setInterval',
                'React state for all positions',
                '~200ms animation duration',
                'No collision detection',
                'No brush selection',
                'Custom easing function',
              ]}
              color="cyan"
            />
            <ComparisonCard
              title="react-design9 (React + D3)"
              items={[
                'D3 transitions (d3.transition)',
                'D3 manages SVG elements',
                '500ms with d3.easeQuadInOut',
                'D3 forceSimulation for collision',
                'D3 brushX for selection',
                'Matches original exactly',
              ]}
              color="orange"
              highlighted
            />
          </div>
        </section>

        {/* Architecture */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Architecture: The Hybrid Pattern</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            React and D3 both want to control the DOM. Our solution: <strong>React renders the container,
            D3 takes over</strong>. React handles lifecycle (mount/unmount), D3 handles rendering and animations.
          </p>
          <ArchitectureDiagram />
        </section>

        {/* D3 Concepts */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">D3 Concepts Used</h2>
          <div className="space-y-8">
            <D3ConceptCard
              title="1. D3 Transitions"
              description="Smooth animations with configurable duration and easing. All animations use 500ms with easeQuadInOut to match the original."
              code={`// Create a reusable transition
const animation = d3.transition()
  .duration(500)
  .ease(d3.easeQuadInOut);

// Apply to any selection
d3.select(element)
  .transition(animation)
  .attr('transform', \`translate(\${x}, \${y})\`);`}
            />

            <D3ConceptCard
              title="2. Force Simulation"
              description="D3's force simulation prevents node overlap in expanded blocks. We run 100 ticks synchronously for immediate positioning."
              code={`// Create force simulation for collision detection
const simulation = d3.forceSimulation(nodes)
  .force('x', d3.forceX(d => d.targetX))
  .force('y', d3.forceY(d => d.targetY))
  .force('collide', d3.forceCollide(d => d.radius + 1))
  .stop();

// Run 100 ticks synchronously
for (let i = 0; i < 100; i++) simulation.tick();

// nodes now have updated x, y positions`}
            />

            <D3ConceptCard
              title="3. Stroke-Dasharray Animation"
              description="Creates a 'drawing' effect where lines appear to be drawn. Uses attrTween with d3.interpolate."
              code={`// Line grows from start to end
function growLineAnimation() {
  const length = this.getTotalLength();
  return d3.interpolate(
    \`0,\${length}\`,      // Start: dash=0, gap=length (invisible)
    \`\${length},\${length}\`  // End: dash=length (fully visible)
  );
}

path.transition(animation)
  .attrTween('stroke-dasharray', growLineAnimation);`}
            />

            <D3ConceptCard
              title="4. D3 Brush"
              description="Enables click-drag selection on the timeline. Snaps to time periods and filters visible data."
              code={`// Create brush
const brush = d3.brushX()
  .extent([[0, 0], [width, height]]);

// Handle brush events
brush.on('end', ({ selection }) => {
  if (selection) {
    const [x0, x1] = selection;
    // Filter data based on selection range
  }
});

// Apply to container
d3.select('#container').call(brush);`}
            />

            <D3ConceptCard
              title="5. Data Joins"
              description="D3's data binding pattern efficiently updates DOM elements. Enter/update/exit for optimal performance."
              code={`// The join pattern
container.selectAll('path')
  .data(storylines)
  .join(
    enter => enter.append('path')
      .attr('d', d => d.pathData)
      .attr('stroke', d => d.color),
    update => update
      .transition(animation)
      .attr('d', d => d.pathData),
    exit => exit
      .transition(animation)
      .style('opacity', 0)
      .remove()
  );`}
            />
          </div>
        </section>

        {/* File Structure */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">File Structure</h2>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <pre className="text-sm font-mono text-gray-700">{`app/react-design9/
├── page.tsx                     # This documentation page
├── demo/
│   └── page.tsx                 # Interactive demo
└── components/
    ├── types.ts                 # TypeScript interfaces + D3 types
    ├── d3-utils.ts              # D3 utility functions
    │   ├── _compute_embedding() # Node positioning
    │   ├── _compute_elliptical_arc() # Relation arcs
    │   ├── growLineAnimation()  # Stroke-dasharray grow
    │   ├── shrinkLineAnimation() # Stroke-dasharray shrink
    │   └── wrap()               # Text wrapping
    ├── SpreadLineVisualizer.ts  # Main D3 visualization class
    │   ├── visualize()          # Entry point
    │   ├── _drawStorylines()    # Entity paths
    │   ├── _drawBlocksAndPoints() # Blocks and nodes
    │   └── Selection helpers    # ENTITY_, BLOCK_, etc.
    ├── Expander.ts              # Block expansion animation
    │   ├── act()                # Main expand action
    │   ├── _contextualize()     # Force simulation
    │   └── _drawLinks()         # Relation arcs
    ├── Collapser.ts             # Block collapse animation
    ├── SpreadLineChart.tsx      # React wrapper component
    ├── useSpreadLineData.ts     # TanStack Query hook
    ├── DataEditor.tsx           # JSON editor
    └── CodeViewer.tsx           # Code display`}</pre>
          </div>
        </section>

        {/* React Integration */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">React Integration Pattern</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            The SpreadLineChart component demonstrates the &quot;ref handoff&quot; pattern where React
            creates the SVG element and D3 takes control via useEffect.
          </p>
          <CodeViewer
            title="SpreadLineChart.tsx - React Wrapper"
            defaultExpanded
            code={`'use client';

import { useEffect, useRef } from 'react';
import { SpreadLinesVisualizer } from './SpreadLineVisualizer';
import { SpreadLineData } from './types';

export default function SpreadLineChart({ data, resetKey }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const visualizerRef = useRef<SpreadLinesVisualizer | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Cleanup previous instance
    visualizerRef.current?.destroy();

    // Create new visualizer - D3 takes over from here
    const visualizer = new SpreadLinesVisualizer(data, config);
    visualizer.visualize(svgRef.current);
    visualizerRef.current = visualizer;

    // Cleanup on unmount
    return () => visualizer.destroy();
  }, [data, resetKey]);

  return (
    <div className="spreadline-chart">
      <svg ref={svgRef} /> {/* D3 controls this element */}
    </div>
  );
}`}
          />
        </section>

        {/* Implementation Phases */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Implementation Phases</h2>
          <p className="text-gray-700 mb-8">
            When building this from scratch, follow these phases. Each builds on the previous.
          </p>
          <ImplementationPhases />
        </section>

        {/* Key Code Patterns */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Code Patterns from Original</h2>
          <div className="space-y-6">
            <PatternCard
              title="Element Shifting on Expand"
              file="Expander.ts"
              description="When a block expands, all elements to the right must shift. Uses filter + each pattern."
              code={`// Filter elements to the right of expanding block
d3.selectAll('.movable')
  .filter(function() {
    const bbox = this.getBBox();
    return bbox.x + bbox.width / 2 >= posX;
  })
  .each(function() {
    const transform = this.getAttribute('transform');
    const currX = +transform.split(',')[0].split('(')[1];
    const currY = +transform.split(',')[1].split(')')[0];

    d3.select(this)
      .transition(animation)
      .attr('transform', \`translate(\${currX + moveX}, \${currY})\`);
  });`}
            />

            <PatternCard
              title="CSS Class-Based Highlighting"
              file="SpreadLineVisualizer.ts"
              description="Hover and pin states use CSS classes, not inline styles. Enables efficient batch updates."
              code={`// Dehighlight non-hovered entities
_massHoverExecution(name, 'others', true) {
  this.MISC_SELECTION(name, 'others')
    .classed('storyline-dehighlight', true);
  this.POINT_SELECTION(name, 'others')
    .classed('storyline-dehighlight', true);
  this.LABEL_SELECTION(name, 'others')
    .classed('storyline-label-dehighlight', true);
}

/* CSS */
.storyline-dehighlight { opacity: 0.1; }
.storyline-label-dehighlight { opacity: 0; }`}
            />

            <PatternCard
              title="Elliptical Arc Calculation"
              file="d3-utils.ts"
              description="Relation arrows use elliptical arcs that curve based on distance between nodes."
              code={`function _compute_elliptical_arc(start, end, startR, endR) {
  const arc = d3.path();
  const [x1, y1] = start;
  const [x2, y2] = end;

  // Calculate distance and direction
  let dy = y2 - y1, dx = x2 - x1;
  const dr = Math.sqrt(dy*dy + dx*dx);
  dy /= dr; dx /= dr;

  // Curve factor based on distance
  const farther = dr > 38 ? 0.2 : dr > 26 ? 0.5 : 0.3;

  // Calculate arc center and radius
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const cx = mx + dy * farther * dr;
  const cy = my - dx * farther * dr;

  // Draw arc accounting for node radii
  arc.arc(rx, ry, r, a1, a2, farther < 0);
  return arc.toString();
}`}
            />
          </div>
        </section>

        {/* Comparison with Original */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Comparison with Original D3 Code</h2>
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-4 py-3 text-left text-gray-700">Aspect</th>
                  <th className="px-4 py-3 text-left text-gray-700">Original (D3 only)</th>
                  <th className="px-4 py-3 text-left text-gray-700">This (React + D3)</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3">Entry Point</td>
                  <td className="px-4 py-3 font-mono text-xs">interface.js</td>
                  <td className="px-4 py-3 font-mono text-xs">SpreadLineChart.tsx</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3">Data Loading</td>
                  <td className="px-4 py-3 font-mono text-xs">fetch() in init</td>
                  <td className="px-4 py-3 font-mono text-xs">TanStack Query hook</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3">Visualization Class</td>
                  <td className="px-4 py-3 font-mono text-xs">visualizer.js</td>
                  <td className="px-4 py-3 font-mono text-xs">SpreadLineVisualizer.ts</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3">Animation Duration</td>
                  <td className="px-4 py-3">500ms</td>
                  <td className="px-4 py-3">500ms (same)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3">Easing</td>
                  <td className="px-4 py-3 font-mono text-xs">d3.easeQuadInOut</td>
                  <td className="px-4 py-3 font-mono text-xs">d3.easeQuadInOut (same)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3">Force Ticks</td>
                  <td className="px-4 py-3">100</td>
                  <td className="px-4 py-3">100 (same)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3">Type Safety</td>
                  <td className="px-4 py-3">JavaScript</td>
                  <td className="px-4 py-3">TypeScript</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">State Management</td>
                  <td className="px-4 py-3">Class properties</td>
                  <td className="px-4 py-3">Class + React state</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Demo Link */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">See It In Action</h2>
          <p className="text-gray-600 mb-6">
            Experience the full React + D3 visualization with all interactions.
          </p>
          <Link
            href="/react-design9/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-gray-900 rounded-lg text-lg font-medium transition-all"
          >
            Open Demo
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
// Helper Components
// ============================================

function ComparisonCard({
  title,
  items,
  color,
  highlighted,
}: {
  title: string;
  items: string[];
  color: 'cyan' | 'orange';
  highlighted?: boolean;
}) {
  const colorClasses = {
    cyan: 'border-cyan-700 bg-cyan-900/20',
    orange: 'border-orange-700 bg-orange-900/20',
  };

  return (
    <div
      className={`rounded-xl border-2 p-6 ${colorClasses[color]} ${
        highlighted ? 'ring-2 ring-orange-500' : ''
      }`}
    >
      <h3 className={`text-lg font-bold mb-4 ${color === 'orange' ? 'text-orange-400' : 'text-cyan-400'}`}>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
            <span className={`w-1.5 h-1.5 rounded-full ${color === 'orange' ? 'bg-orange-400' : 'bg-cyan-400'}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-80 px-4 py-3 bg-cyan-900/30 border border-cyan-600 rounded-lg text-center">
          <div className="text-cyan-400 font-mono text-sm">React Component</div>
          <div className="text-gray-500 text-xs mt-1">SpreadLineChart.tsx</div>
        </div>

        <Arrow />

        <div className="w-80 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-center">
          <div className="text-gray-700 font-mono text-sm">useRef() → SVG Element</div>
          <div className="text-gray-500 text-xs mt-1">React creates, passes to D3</div>
        </div>

        <Arrow />

        <div className="w-80 px-4 py-3 bg-orange-900/30 border border-orange-600 rounded-lg text-center">
          <div className="text-orange-400 font-mono text-sm">useEffect() → D3 Takes Over</div>
          <div className="text-gray-500 text-xs mt-1">SpreadLinesVisualizer.visualize(svg)</div>
        </div>

        <Arrow />

        <div className="flex gap-4">
          {['transition', 'forceSimulation', 'brushX', 'selection'].map((name) => (
            <div key={name} className="px-3 py-2 bg-orange-900/30 border border-orange-600 rounded-lg">
              <div className="text-orange-400 font-mono text-xs">d3.{name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="text-gray-400">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
}

function D3ConceptCard({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-orange-400">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
      <div className="p-6">
        <CodeViewer title="Code Example" code={code} defaultExpanded />
      </div>
    </div>
  );
}

function PatternCard({
  title,
  file,
  description,
  code,
}: {
  title: string;
  file: string;
  description: string;
  code: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="px-2 py-1 bg-orange-900/50 text-orange-400 rounded text-xs font-mono">{file}</span>
        </div>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
      <div className="p-6">
        <CodeViewer title="Implementation" code={code} />
      </div>
    </div>
  );
}

function ImplementationPhases() {
  const phases = [
    {
      phase: 1,
      title: 'Project Setup & Types',
      description: 'Create directory structure, copy types.ts, set up D3 imports.',
      files: ['types.ts', 'd3-utils.ts'],
    },
    {
      phase: 2,
      title: 'D3 Utilities',
      description: 'Port helper functions: _compute_embedding, _compute_elliptical_arc, animations.',
      files: ['d3-utils.ts'],
    },
    {
      phase: 3,
      title: 'SpreadLineVisualizer Class',
      description: 'Port main visualizer with _drawStorylines, _drawBlocks, selection helpers.',
      files: ['SpreadLineVisualizer.ts'],
    },
    {
      phase: 4,
      title: 'Expander Class',
      description: 'Port expansion animation with force simulation and link drawing.',
      files: ['Expander.ts'],
    },
    {
      phase: 5,
      title: 'Collapser Class',
      description: 'Port collapse animation with shrink effects and cleanup.',
      files: ['Collapser.ts'],
    },
    {
      phase: 6,
      title: 'React Wrapper',
      description: 'Create SpreadLineChart.tsx with useRef + useEffect pattern.',
      files: ['SpreadLineChart.tsx'],
    },
    {
      phase: 7,
      title: 'Demo Page',
      description: 'Integrate with TanStack Query, add controls and editor.',
      files: ['demo/page.tsx'],
    },
  ];

  return (
    <div className="space-y-4">
      {phases.map(({ phase, title, description, files }) => (
        <div key={phase} className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-orange-900 flex items-center justify-center text-orange-400 font-bold flex-shrink-0">
            {phase}
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-900 font-semibold">{title}</h4>
              <div className="flex gap-2">
                {files.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

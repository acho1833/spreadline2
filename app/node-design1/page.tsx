'use client';

import Link from 'next/link';

export default function NodeDesign1Documentation() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SpreadLine Node.js Backend
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete TypeScript/Node.js port of the Python SpreadLine visualization pipeline.
            This implementation generates egocentric dynamic network visualizations entirely in Node.js.
          </p>
          <div className="mt-6">
            <Link
              href="/node-design1/demo"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View Live Demo →
            </Link>
          </div>
        </div>

        {/* Architecture Overview */}
        <section className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Architecture Overview</h2>

          <div className="bg-gray-900 rounded-lg p-6 text-sm font-mono text-green-400 overflow-x-auto mb-6">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INPUT DATA (CSV Files)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  relations.csv          entities.csv           citations.csv               │
│  ┌─────────────────┐    ┌────────────────┐    ┌────────────────────┐       │
│  │year,source,     │    │name,year,      │    │name,year,          │       │
│  │target,id,type,  │    │citationcount,  │    │citationcount,      │       │
│  │citationcount    │    │affiliation     │    │affiliation,paperID │       │
│  └─────────────────┘    └────────────────┘    └────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NODE.JS PROCESSING PIPELINE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. loadTopology()  → Parse CSV, map columns                                │
│  2. center()        → Extract 2-hop egocentric network around ego           │
│  3. configure()     → Set optimization parameters                           │
│  4. fit()           → Run 4-phase optimization:                             │
│     ├── ordering()      → Minimize crossings (barycenter algorithm)        │
│     ├── aligning()      → Maximize straight lines (LCS with rewards)       │
│     ├── compacting()    → Minimize whitespace/wiggles                      │
│     └── rendering()     → Generate SVG paths                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OUTPUT DATA (JSON)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  SpreadLineData {                                                           │
│    bandWidth, blockWidth, ego, timeLabels,                                  │
│    storylines: [{ name, color, lines, marks, label }],                      │
│    blocks: [{ id, time, points, relations, outline }],                      │
│    heightExtents: [min, max]                                                │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REACT + D3 FRONTEND                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  - Fetch JSON from API endpoint                                             │
│  - D3.js renders SVG visualization                                          │
│  - Interactive: hover, click, expand blocks, brush selection               │
└─────────────────────────────────────────────────────────────────────────────┘
`}</pre>
          </div>
        </section>

        {/* Directory Structure */}
        <section className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Directory Structure</h2>

          <div className="bg-gray-100 rounded-lg p-6 text-sm font-mono overflow-x-auto">
            <pre className="text-gray-800">{`
app/node-design1/
├── backend/
│   ├── types/
│   │   ├── core.ts         # Path, Node, Entity, Session classes
│   │   ├── input.ts        # TopologyRow, EntityRow, CitationRow types
│   │   └── output.ts       # SpreadLineData, Block, Storyline types
│   ├── utils/
│   │   ├── datetime.ts     # Date handling utilities
│   │   └── constructors.ts # Network construction helpers
│   ├── pipeline/
│   │   ├── order.ts        # Barycenter crossing reduction
│   │   ├── align.ts        # LCS alignment algorithm
│   │   ├── compact.ts      # Height optimization
│   │   └── render.ts       # SVG generation
│   ├── spreadline.ts       # Main orchestrator class
│   └── index.ts            # Barrel exports
├── api/
│   └── spreadline/
│       └── route.ts        # Next.js API route (GET handler)
├── components/             # React components (from react-design11)
│   ├── SpreadLineChart.tsx # Main visualization component
│   ├── SpreadLineVisualizer.ts # D3 rendering class
│   ├── useNodeSpreadLineData.ts # Data fetching hook
│   └── ...
├── demo/
│   └── page.tsx            # Interactive demo page
└── page.tsx                # This documentation page
`}</pre>
          </div>
        </section>

        {/* Data Flow */}
        <section className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Flow Explained</h2>

          <div className="space-y-8">
            {/* Step 1: Input Data */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                1. Input Data (CSV Files)
              </h3>
              <p className="text-gray-600 mb-4">
                The pipeline starts with three CSV files containing co-authorship network data:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">relations.csv</h4>
                  <pre className="text-xs text-gray-600 overflow-x-auto">{`year,source,target,type
2005,Jeffrey Heer,Maneesh Agrawala,Co-author
2006,Jeffrey Heer,Stuart K. Card,Co-author
...`}</pre>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">entities.csv</h4>
                  <pre className="text-xs text-gray-600 overflow-x-auto">{`name,year,citationcount,affiliation
Jeffrey Heer,2005,500,Stanford University
Maneesh Agrawala,2005,300,UC Berkeley
...`}</pre>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">citations.csv</h4>
                  <pre className="text-xs text-gray-600 overflow-x-auto">{`name,year,citationcount,paperID
Jeffrey Heer,2005,162,paper123
...`}</pre>
                </div>
              </div>
            </div>

            {/* Step 2: Pipeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                2. Processing Pipeline
              </h3>

              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <h4 className="font-medium text-blue-900">center() - Egocentric Network Extraction</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Extracts the 2-hop neighborhood around the ego (central node). Only includes
                    timestamps where the ego participates and filters edges to within 2 hops.
                  </p>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <h4 className="font-medium text-green-900">ordering() - Barycenter Crossing Reduction</h4>
                  <p className="text-green-800 text-sm mt-1">
                    Uses the barycenter heuristic to minimize line crossings. Iterates forward
                    and backward through time, sorting sessions by their barycenter (average
                    position of entities from the previous timestamp).
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <h4 className="font-medium text-yellow-900">aligning() - LCS Straight Line Maximization</h4>
                  <p className="text-yellow-800 text-sm mt-1">
                    Uses dynamic programming (Longest Common Substring with rewards) to maximize
                    straight lines between consecutive timestamps. Special reward ensures ego
                    always stays on a straight line.
                  </p>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                  <h4 className="font-medium text-purple-900">compacting() - Height Optimization</h4>
                  <p className="text-purple-800 text-sm mt-1">
                    Assigns vertical positions to minimize whitespace or wiggles. Maintains
                    ordering constraints within sessions and handles idle sessions with
                    relaxed constraints.
                  </p>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <h4 className="font-medium text-red-900">rendering() - SVG Path Generation</h4>
                  <p className="text-red-800 text-sm mt-1">
                    Converts the computed positions into SVG path strings. Generates storylines
                    (bezier curves), block outlines (arcs), points, labels, and time markers.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Output */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                3. Output Data (SpreadLineData)
              </h3>
              <p className="text-gray-600 mb-4">
                The pipeline produces a JSON object ready for D3.js visualization:
              </p>

              <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400 overflow-x-auto">
                <pre>{`{
  "bandWidth": 85.5,
  "blockWidth": 40,
  "ego": "Jeffrey Heer",
  "timeLabels": [
    { "label": "2000", "posX": 42.75 },
    { "label": "2001", "posX": 128.25 }
  ],
  "storylines": [
    {
      "id": 0,
      "name": "Jeffrey Heer",
      "color": "#424242",
      "lines": ["M42.75,300 L128.25,300"],
      "marks": [],
      "label": { "posX": 30, "posY": 300, "label": "Jeffrey Heer" },
      "lifespan": 24,
      "crossingCheck": false
    }
  ],
  "blocks": [
    {
      "id": 0,
      "time": "2005",
      "points": [
        { "id": 0, "posX": 470, "posY": 300, "name": "Jeffrey Heer" },
        { "id": 1, "posX": 470, "posY": 285, "name": "Maneesh Agrawala" }
      ],
      "relations": [[0, 1]],
      "outline": { "left": "M...", "right": "M..." }
    }
  ],
  "heightExtents": [100, 500]
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* API Usage */}
        <section className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">API Usage</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Endpoint</h3>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                GET /node-design1/api/spreadline
              </code>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Query Parameters</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Parameter</th>
                    <th className="text-left py-2">Default</th>
                    <th className="text-left py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-mono">ego</td>
                    <td className="py-2">&quot;Jeffrey Heer&quot;</td>
                    <td className="py-2">Central node name</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">startYear</td>
                    <td className="py-2">&quot;2000&quot;</td>
                    <td className="py-2">Start of time range</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">endYear</td>
                    <td className="py-2">&quot;2024&quot;</td>
                    <td className="py-2">End of time range</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">width</td>
                    <td className="py-2">1200</td>
                    <td className="py-2">Viewport width (px)</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono">height</td>
                    <td className="py-2">600</td>
                    <td className="py-2">Viewport height (px)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Example Request</h3>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>fetch(&apos;/node-design1/api/spreadline?ego=Jeffrey%20Heer&amp;startYear=2000&amp;endYear=2024&apos;)</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Key Algorithms */}
        <section className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Algorithms</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Barycenter Algorithm (Crossing Reduction)
              </h3>
              <p className="text-gray-600 mb-3">
                The barycenter heuristic minimizes edge crossings by positioning each session
                based on the average position of its connected entities in the previous timestamp.
              </p>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`// For each session in the next timestamp:
// 1. Find entities that exist in current timestamp
const existed = session.entities.map(node => node.findSelf(currNodes));

// 2. Compute barycenter (average position)
const barycenter = existed.reduce((sum, n) => sum + n.order, 0) / session.entityWeight;

// 3. Sort sessions by barycenter
sessions.sort((a, b) => a.barycenter - b.barycenter);`}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                LCS with Rewards (Alignment)
              </h3>
              <p className="text-gray-600 mb-3">
                Uses dynamic programming to find the optimal alignment between consecutive
                timestamps, maximizing the number of straight lines.
              </p>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`// Reward matrix computation:
// - Count straight lines: entities present in both sessions
// - Add compatibility bonus based on relative order
// - Ego-to-ego alignment gets infinite reward (always straight)

reward[i][j] = numStraightLines + compatibility;
if (currEnt === ego && nextEnt === ego) reward[i][j] = Infinity;

// DP to find optimal alignment
for each i, j:
  matchTable[i][j] = max(
    matchTable[i-1][j-1] + reward[i][j],  // Align i→j
    matchTable[i][j-1],                    // Skip j
    matchTable[i-1][j]                     // Skip i
  );`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/node-design1/demo"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-semibold text-blue-900">Live Demo</h3>
              <p className="text-blue-700 text-sm">
                Interactive demonstration with configurable parameters
              </p>
            </Link>

            <Link
              href="/react-design11"
              className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="font-semibold text-green-900">React Design v11</h3>
              <p className="text-green-700 text-sm">
                Original React implementation with Python backend
              </p>
            </Link>

            <a
              href="https://arxiv.org/pdf/2408.08992"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h3 className="font-semibold text-purple-900">Research Paper</h3>
              <p className="text-purple-700 text-sm">
                SpreadLine: Visualizing Egocentric Dynamic Influence (IEEE TVCG 2024)
              </p>
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">Source Code</h3>
              <p className="text-gray-700 text-sm">
                View the complete implementation on GitHub
              </p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

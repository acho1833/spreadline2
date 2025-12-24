'use client';

import { useState } from 'react';

export default function SpreadLineDocumentation() {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">SpreadLine TypeScript API</h1>
        <p className="text-gray-400 mb-8">Egocentric Dynamic Network Visualization Framework</p>

        {/* Architecture Overview */}
        <Section
          title="1. Architecture Overview"
          isExpanded={expandedSection === 'overview'}
          onToggle={() => toggleSection('overview')}
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              SpreadLine visualizes egocentric dynamic networks from the perspective of a central node (ego).
              It implements a 5-phase optimization pipeline to generate storyline visualizations.
            </p>

            <MermaidDiagram
              id="architecture"
              chart={`
flowchart TB
    subgraph Input["Input Data"]
        CSV1["relations.csv\n(topology)"]
        CSV2["entities.csv\n(affiliations)"]
        CSV3["citations.csv\n(node context)"]
        CSV4["content.csv\n(2D layout)"]
    end

    subgraph SpreadLine["SpreadLine Pipeline"]
        Load["load()\nParse & validate data"]
        Center["center()\n2-hop egocentric network"]
        Fit["fit()\n5-phase optimization"]
    end

    subgraph Pipeline["5-Phase Optimization"]
        Order["ordering()\nCrossing reduction"]
        Align["aligning()\nLine straightening"]
        Compact["compacting()\nHeight assignment"]
        Context["contextualizing()\nAttribute layout"]
        Render["rendering()\nSVG generation"]
    end

    subgraph Output["Output"]
        JSON["JSON Response"]
        Story["storylines[]"]
        Blocks["blocks[]"]
        Labels["timeLabels[]"]
    end

    CSV1 --> Load
    CSV2 --> Load
    CSV3 --> Load
    CSV4 --> Load
    Load --> Center
    Center --> Fit
    Fit --> Order
    Order --> Align
    Align --> Compact
    Compact --> Context
    Context --> Render
    Render --> JSON
    JSON --> Story
    JSON --> Blocks
    JSON --> Labels
              `}
            />

            <h3 className="text-xl font-semibold mt-6">File Structure</h3>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`app/api/nodeFetchSpreadLine2/
├── route.ts          # Next.js API endpoint
├── spreadline.ts     # Main orchestrator class
├── types.ts          # Path, Node, Entity, Session
├── helpers.ts        # Time utilities, array ops
├── constructors.ts   # Network construction
├── order.ts          # Barycenter algorithm
├── align.ts          # LCS alignment
├── compact.ts        # Height assignment
├── contextualize.ts  # Layout processing
├── render.ts         # SVG rendering
└── test.ts           # Unit tests`}
            </pre>
          </div>
        </Section>

        {/* Data Structures */}
        <Section
          title="2. Core Data Structures"
          isExpanded={expandedSection === 'data'}
          onToggle={() => toggleSection('data')}
        >
          <div className="space-y-6">
            <MermaidDiagram
              id="datastructures"
              chart={`
classDiagram
    class Entity {
        +number id
        +string name
        +number[] timeline
        +getAtTimestamp(t) number
        +setTimeline(t)
    }

    class Session {
        +number id
        +Node[] entities
        +string form
        +number timestamp
        +number weight
        +string[][] hops
        +set(order, arcs, constraints)
        +getEntityIDs() number[]
        +printEntities() string[]
    }

    class Node {
        +string name
        +number id
        +number sessionID
        +number timestamp
        +number order
    }

    class Path {
        +string str
        +number curve
        +moveTo(x, y)
        +lineTo(x, y)
        +bezierCurveTo(...)
        +arc(...)
        +easeCurveTo(...)
    }

    Entity "1" --> "*" Session : participates in
    Session "1" --> "*" Node : contains
              `}
            />

            <h3 className="text-xl font-semibold">Entity Timeline</h3>
            <p className="text-gray-300 mb-2">Each entity has a timeline array tracking which session they belong to at each timestamp:</p>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`// Entity "Jeffrey Heer" timeline
timeline: [1, 2, 3, 4, 5, 6, ...]  // session IDs per timestamp
          ↓  ↓  ↓  ↓  ↓  ↓
         2002 2003 2004 2005 2006 2007

// Session structure
Session {
  id: 1,
  form: 'contact',       // 'contact' or 'idle'
  timestamp: 0,          // index into timestamps array
  entities: [Node, Node, ...],
  hops: [
    ['external-non-first'],  // 2-hop top
    ['external-first'],      // sources
    ['ego'],                 // ego
    ['internal-first'],      // targets
    ['internal-non-first']   // 2-hop bottom
  ]
}`}
            </pre>
          </div>
        </Section>

        {/* Pipeline Details */}
        <Section
          title="3. Pipeline Phases"
          isExpanded={expandedSection === 'pipeline'}
          onToggle={() => toggleSection('pipeline')}
        >
          <div className="space-y-6">
            <MermaidDiagram
              id="pipeline"
              chart={`
sequenceDiagram
    participant User
    participant SpreadLine
    participant Order
    participant Align
    participant Compact
    participant Context
    participant Render

    User->>SpreadLine: fit(width, height)
    SpreadLine->>Order: ordering(liner)
    Note right of Order: Barycenter heuristic<br/>10 iterations<br/>Forward/backward sweep
    Order-->>SpreadLine: orderTable, orderedEntities

    SpreadLine->>Align: aligning(liner, orderedEntities)
    Note right of Align: Longest Common Substring<br/>Dynamic programming<br/>Maximize straight lines
    Align-->>SpreadLine: alignTable, sessionAlignTable

    SpreadLine->>Compact: compacting(liner, orderedEntities)
    Note right of Compact: Slot construction<br/>Height assignment<br/>Space or wiggles minimization
    Compact-->>SpreadLine: heightTable, crossingTable

    SpreadLine->>Context: contextualizing(liner)
    Note right of Context: Profile collection<br/>Normalize to [0,1]<br/>Optional ego centering
    Context-->>SpreadLine: layoutMap

    SpreadLine->>Render: rendering(size, liner)
    Note right of Render: Scale bands<br/>SVG paths<br/>Bezier curves
    Render-->>SpreadLine: JSON result

    SpreadLine-->>User: {storylines, blocks, timeLabels, ...}
              `}
            />

            <h3 className="text-xl font-semibold">Phase 1: Ordering (order.ts)</h3>
            <p className="text-gray-300 mb-2">Crossing reduction using barycenter heuristic:</p>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`// Barycenter calculation for entity ordering
barycenter(entity) = sum(neighbor_positions) / count(neighbors)

// Algorithm:
for iteration in range(10):
    // Forward sweep: left to right
    for timestamp in [1..n]:
        sort_by_barycenter(entities_at_timestamp)

    // Backward sweep: right to left
    for timestamp in [n-1..0]:
        sort_by_barycenter(entities_at_timestamp)

// Result: orderedEntities[timestamp] = [entity_ids...]`}
            </pre>

            <h3 className="text-xl font-semibold mt-4">Phase 2: Aligning (align.ts)</h3>
            <p className="text-gray-300 mb-2">Longest Common Substring for line straightening:</p>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`// LCS Dynamic Programming
for each consecutive timestamp pair (t, t+1):
    reward[i][j] = straight_lines(entity_i, entity_j) + order_similarity

    // DP recurrence:
    match[i][j] = max(
        match[i-1][j-1] + reward[i][j],  // align i with j
        match[i][j-1],                    // skip j
        match[i-1][j]                     // skip i
    )

    // Backtrack to find alignment
    alignTable[entity_i] = aligned_entity_j`}
            </pre>

            <h3 className="text-xl font-semibold mt-4">Phase 3: Compacting (compact.ts)</h3>
            <p className="text-gray-300 mb-2">Height assignment with slot construction:</p>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`// Slot construction
slots = construct_slots(sessions, alignments)

// Height assignment modes:
if (minimize === 'space'):
    // Minimize vertical space
    assign_heights_minimize_space(slots)
else if (minimize === 'wiggles'):
    // Minimize line wiggles (straighter lines)
    assign_heights_minimize_wiggles(slots)

// Result: heightTable[entity][timestamp] = y_position`}
            </pre>

            <h3 className="text-xl font-semibold mt-4">Phase 4: Contextualizing (contextualize.ts)</h3>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`// Collect 2D positions from content layout
for each entity in session:
    if dynamic layout:
        find closest timestamp match
    else:
        use static position

// Normalize to [0, 1]
posX = (posX - minX) / (maxX - minX)
posY = (posY - minY) / (maxY - minY)

// Result: layoutMap["entity,timestamp"] = {posX, posY}`}
            </pre>

            <h3 className="text-xl font-semibold mt-4">Phase 5: Rendering (render.ts)</h3>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`// Scale bands (d3.scaleBand emulation)
bandWidth = width / (numTimestamps + padding)

// Generate SVG paths
for each entity:
    for each timestamp pair:
        if straight line:
            path.lineTo(x2, y2)
        else:
            path.bezierCurveTo(...)  // smooth transition

// Block outlines with arcs
for each session:
    outline = compute_block_outline(session)
    // Uses arcTo for rounded corners`}
            </pre>
          </div>
        </Section>

        {/* CSV Format */}
        <Section
          title="4. Input CSV Formats"
          isExpanded={expandedSection === 'csv'}
          onToggle={() => toggleSection('csv')}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">relations.csv (Topology)</h3>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`year,source,target,id
2002,Jeffrey Heer,Stuart Card,paper_001
2002,Jeffrey Heer,Ben Shneiderman,paper_001
2003,Maneesh Agrawala,Jeffrey Heer,paper_002
...

// Loaded with config:
{
  source: 'source',
  target: 'target',
  time: 'year',
  weight: 'count'
}`}
            </pre>

            <h3 className="text-xl font-semibold">entities.csv (Affiliations)</h3>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`year,name,affiliation
2002,Jeffrey Heer,University of California Berkeley
2003,Jeffrey Heer,Stanford University
2010,Jeffrey Heer,University of Washington
...

// Used to determine internal vs external collaborators
internal = same_affiliation(ego, collaborator)
color = internal ? '#FA9902' : '#166b6b'`}
            </pre>

            <h3 className="text-xl font-semibold">content.csv (Layout Positions)</h3>
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`year,name,posX,posY
2002,Jeffrey Heer,0.5,0.5
2002,Stuart Card,0.3,0.7
2002,Ben Shneiderman,0.8,0.2
...

// Loaded with config:
{
  timestamp: 'year',
  id: 'name',
  posX: 'posX',
  posY: 'posY'
}`}
            </pre>
          </div>
        </Section>

        {/* API Output */}
        <Section
          title="5. API Output Format"
          isExpanded={expandedSection === 'output'}
          onToggle={() => toggleSection('output')}
        >
          <div className="space-y-6">
            <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`// GET /api/nodeFetchSpreadLine2
{
  "bandWidth": 101.816,
  "blockWidth": 40,
  "ego": "Jeffrey Heer",
  "heightExtents": [6, 708],

  "timeLabels": [
    { "label": "2002", "posX": 63.635 },
    { "label": "2003", "posX": 190.905 },
    ...
  ],

  "storylines": [
    {
      "name": "Jeffrey Heer",
      "color": "#FA9902",
      "lines": ["M63.635,350 L190.905,350 ..."],
      "marks": [
        { "posX": 63.635, "posY": 350, "context": 100 }
      ],
      "inlineLabels": [
        { "posX": 100, "posY": 350, "text": "Jeffrey Heer" }
      ]
    },
    ...
  ],

  "blocks": [
    {
      "id": 1,
      "time": "2002",
      "outline": "M43.635,300 L83.635,300 ...",
      "names": ["Jeffrey Heer", "Stuart Card"],
      "relations": [["Jeffrey Heer", "Stuart Card", 1]],
      "points": [...],
      "moveX": 43.635,
      "topPosY": 300
    },
    ...
  ],

  "mode": "author",
  "reference": [...content_reference.csv data...]
}`}
            </pre>

            <h3 className="text-xl font-semibold">Storyline Structure</h3>
            <table className="w-full text-sm bg-gray-800 rounded overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Field</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700">
                  <td className="p-2 font-mono">name</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Entity name</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-2 font-mono">lines</td>
                  <td className="p-2">string[]</td>
                  <td className="p-2">SVG path strings</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-2 font-mono">marks</td>
                  <td className="p-2">object[]</td>
                  <td className="p-2">Node markers with context</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-2 font-mono">color</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Line color (hex)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Python to TypeScript */}
        <Section
          title="6. Python to TypeScript Mapping"
          isExpanded={expandedSection === 'mapping'}
          onToggle={() => toggleSection('mapping')}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">NumPy Equivalents</h3>
            <div className="grid grid-cols-2 gap-4">
              <pre className="bg-gray-800 p-4 rounded text-sm">
{`# Python (NumPy)
import numpy as np

np.zeros((n, m))
np.full((n,), val)
np.argsort(arr)
np.unique(arr)
np.isin(a, b)
np.nonzero(arr)[0]
arr.reshape((n, m))`}
              </pre>
              <pre className="bg-gray-800 p-4 rounded text-sm">
{`// TypeScript
import { full2D, argsort, unique, isin } from './helpers';

full2D(n, m, 0)
Array(n).fill(val)
argsort(arr)
unique(arr)
isin(a, b)
arr.map((v,i) => v !== 0 ? i : -1).filter(i => i >= 0)
// manual reshape`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold mt-4">Pandas Equivalents</h3>
            <div className="grid grid-cols-2 gap-4">
              <pre className="bg-gray-800 p-4 rounded text-sm">
{`# Python (Pandas)
import pandas as pd

df = pd.read_csv('file.csv')
df.groupby('col').agg({'x': 'sum'})
df.loc[mask, :]
df['col'].unique().tolist()
df.apply(lambda x: ...)`}
              </pre>
              <pre className="bg-gray-800 p-4 rounded text-sm">
{`// TypeScript (PapaParse)
import Papa from 'papaparse';

const result = Papa.parse(csv, {header: true});
groupBy(arr, 'col') // custom helper
arr.filter(row => condition)
[...new Set(arr.map(r => r.col))]
arr.map(x => ...)`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold mt-4">Class Conversions</h3>
            <div className="grid grid-cols-2 gap-4">
              <pre className="bg-gray-800 p-4 rounded text-sm">
{`# Python
class Entity:
    def __init__(self, name, timeline, id):
        self.name = name
        self.timeline = timeline
        self.id = id

    def at_timestamp(self, timestamp):
        return self.timeline[timestamp]`}
              </pre>
              <pre className="bg-gray-800 p-4 rounded text-sm">
{`// TypeScript
export class Entity {
  id: number;
  name: string;
  timeline: number[];

  constructor(name: string, timeline: number[], id: number) {
    this.name = name;
    this.timeline = timeline;
    this.id = id;
  }

  getAtTimestamp(timestamp: number): number {
    return this.timeline[timestamp];
  }
}`}
              </pre>
            </div>
          </div>
        </Section>

        {/* NPM Libraries */}
        <Section
          title="7. NPM Dependencies"
          isExpanded={expandedSection === 'npm'}
          onToggle={() => toggleSection('npm')}
        >
          <div className="space-y-4">
            <table className="w-full text-sm bg-gray-800 rounded overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Package</th>
                  <th className="p-2 text-left">Version</th>
                  <th className="p-2 text-left">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700">
                  <td className="p-2 font-mono">papaparse</td>
                  <td className="p-2">^5.4.1</td>
                  <td className="p-2">CSV parsing (replaces pandas read_csv)</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-2 font-mono">@types/papaparse</td>
                  <td className="p-2">^5.3.14</td>
                  <td className="p-2">TypeScript definitions</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-2 font-mono">@d4c/numjs</td>
                  <td className="p-2">^0.17.63</td>
                  <td className="p-2">NumPy-like array operations (optional)</td>
                </tr>
              </tbody>
            </table>

            <pre className="bg-gray-800 p-4 rounded text-sm">
{`# Installation
npm install papaparse @d4c/numjs
npm install -D @types/papaparse`}
            </pre>
          </div>
        </Section>

        {/* Test Running */}
        <Section
          title="8. Running Tests"
          isExpanded={expandedSection === 'tests'}
          onToggle={() => toggleSection('tests')}
        >
          <div className="space-y-4">
            <pre className="bg-gray-800 p-4 rounded text-sm">
{`# Run TypeScript tests
npx tsx app/api/nodeFetchSpreadLine2/test.ts

# Expected output:
================================================================================
SpreadLine TypeScript Test Suite
================================================================================

📁 Loading CSV files...
  relations.csv: 7730 rows
  entities.csv: 9978 rows
  citations.csv: 10139 rows
  content.csv: 427 rows
  content_reference.csv: 243 rows

📊 Constructing author network...
  Network size: 365 rows
  Line colors: 197 entities
  Groups: 21 timestamps

🔧 Testing SpreadLine pipeline...

📋 Post-center state:
  Entities: 198
  Sessions: 21
  Timestamps: 22

⚙️  Running fit() pipeline...

✨ Results:
  Storylines: 198
  Blocks: 21
  Time labels: 21
  Band width: 101.816
  Height extents: [6,708]

🧪 Running assertions...
  ✅ Result has storylines
  ✅ Result has blocks
  ✅ Result has timeLabels
  ... (20 tests)

================================================================================
Test Summary: 20 passed, 0 failed
================================================================================`}
            </pre>

            <p className="text-gray-300">
              Test output is saved to <code className="bg-gray-800 px-1 rounded">fetchspreadline_ts_result.json</code> for manual inspection.
            </p>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-700 text-gray-500 text-sm">
          <p>SpreadLine TypeScript Implementation - Based on IEEE TVCG 2024 paper</p>
          <p className="mt-1">
            <a href="/node-design3/demo" className="text-blue-400 hover:underline">
              View Demo Comparison Page
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Collapsible Section Component
function Section({
  title,
  isExpanded,
  onToggle,
  children
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 bg-gray-800 hover:bg-gray-750 flex justify-between items-center"
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-2xl">{isExpanded ? '-' : '+'}</span>
      </button>
      {isExpanded && (
        <div className="p-6 bg-gray-850">
          {children}
        </div>
      )}
    </div>
  );
}

// Mermaid Diagram Component
function MermaidDiagram({ id, chart }: { id: string; chart: string }) {
  return (
    <div className="bg-gray-800 p-4 rounded overflow-x-auto">
      <pre className="mermaid text-sm">{chart.trim()}</pre>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof mermaid !== 'undefined') {
              mermaid.initialize({ startOnLoad: true, theme: 'dark' });
            }
          `
        }}
      />
    </div>
  );
}

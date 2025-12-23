'use client';

import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

// Types for the documentation
interface StepData {
  id: string;
  title: string;
  description: string;
  pythonCode: string;
  typescriptCode: string;
  inputExample: any;
  outputExample: any;
}

// ============================================================================
// MAIN DOCUMENTATION PAGE
// ============================================================================
export default function SpreadLineDocumentation() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'data' | 'algorithms' | 'api'>('overview');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('Jeffrey Heer');
  const [currentPipelineStep, setCurrentPipelineStep] = useState(0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>SpreadLine: Python to TypeScript Conversion</h1>
        <p>Comprehensive Technical Documentation</p>
      </header>

      <nav className={styles.nav}>
        <button
          className={activeTab === 'overview' ? styles.activeTab : ''}
          onClick={() => setActiveTab('overview')}
        >
          Architecture Overview
        </button>
        <button
          className={activeTab === 'pipeline' ? styles.activeTab : ''}
          onClick={() => setActiveTab('pipeline')}
        >
          Pipeline Steps
        </button>
        <button
          className={activeTab === 'data' ? styles.activeTab : ''}
          onClick={() => setActiveTab('data')}
        >
          Data Transformations
        </button>
        <button
          className={activeTab === 'algorithms' ? styles.activeTab : ''}
          onClick={() => setActiveTab('algorithms')}
        >
          Algorithms
        </button>
        <button
          className={activeTab === 'api' ? styles.activeTab : ''}
          onClick={() => setActiveTab('api')}
        >
          API Reference
        </button>
      </nav>

      <main className={styles.main}>
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'pipeline' && (
          <PipelineSection
            currentStep={currentPipelineStep}
            setCurrentStep={setCurrentPipelineStep}
          />
        )}
        {activeTab === 'data' && (
          <DataTransformationSection
            selectedEntity={selectedEntity}
            setSelectedEntity={setSelectedEntity}
          />
        )}
        {activeTab === 'algorithms' && <AlgorithmsSection />}
        {activeTab === 'api' && <ApiReferenceSection />}
      </main>
    </div>
  );
}

// ============================================================================
// OVERVIEW SECTION
// ============================================================================
function OverviewSection() {
  return (
    <div className={styles.section}>
      <h2>System Architecture</h2>

      <div className={styles.card}>
        <h3>What is SpreadLine?</h3>
        <p>
          SpreadLine is a visualization framework for exploring <strong>egocentric dynamic networks</strong>{' '}
          from the perspective of a central node (ego). It shows how influence spreads through networks
          over time, centered around a focal actor.
        </p>
      </div>

      <div className={styles.architectureDiagram}>
        <h3>High-Level Architecture</h3>
        <pre className={styles.diagram}>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                           INPUT DATA                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  relations.csv    entities.csv    citations.csv    content.csv          │
│  (edges)          (nodes)         (weights)        (positions)          │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SPREADLINE CLASS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌─────────┐    ┌───────────────────┐  │
│  │  load()  │───▶│ center() │───▶│  fit()  │───▶│   RenderOutput    │  │
│  └──────────┘    └──────────┘    └────┬────┘    └───────────────────┘  │
│                                       │                                  │
│                        ┌──────────────┴──────────────┐                  │
│                        ▼                             ▼                  │
│              ┌─────────────────┐          ┌─────────────────┐          │
│              │  5-Phase        │          │    Output:      │          │
│              │  Pipeline       │          │  - storylines   │          │
│              │                 │          │  - blocks       │          │
│              │  1. Ordering    │          │  - timeLabels   │          │
│              │  2. Aligning    │          │  - heightExtents│          │
│              │  3. Compacting  │          └─────────────────┘          │
│              │  4. Context     │                                        │
│              │  5. Rendering   │                                        │
│              └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────┘
        `}</pre>
      </div>

      <div className={styles.card}>
        <h3>File Structure (TypeScript Conversion)</h3>
        <pre className={styles.codeBlock}>{`
app/api/nodeFetchSpreadLine1/
├── route.ts          # Next.js API endpoint (equivalent to Flask /fetchSpreadLine)
├── types.ts          # All TypeScript interfaces and classes
├── helpers.ts        # Utility functions (time, arrays, etc.)
├── constructors.ts   # Network construction functions
├── spreadline.ts     # Main SpreadLine class
├── order.ts          # Ordering algorithm (barycenter)
├── align.ts          # Alignment algorithm (LCS)
├── compact.ts        # Compacting algorithm (slot-based)
├── contextualize.ts  # Context layout (PCA-based)
├── render.ts         # SVG path generation
└── views.ts          # Data loading and processing
        `}</pre>
      </div>

      <div className={styles.comparisonTable}>
        <h3>Python to TypeScript Mapping</h3>
        <table>
          <thead>
            <tr>
              <th>Python File</th>
              <th>TypeScript File</th>
              <th>Lines</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>utils/types.py</td>
              <td>types.ts</td>
              <td>263 → ~350</td>
              <td>Path, Node, Entity, Session classes</td>
            </tr>
            <tr>
              <td>utils/helpers.py</td>
              <td>helpers.ts</td>
              <td>50 → ~200</td>
              <td>Time handling, array utilities</td>
            </tr>
            <tr>
              <td>utils/constructors.py</td>
              <td>constructors.ts</td>
              <td>128 → ~250</td>
              <td>Network construction, constraints</td>
            </tr>
            <tr>
              <td>spreadline.py</td>
              <td>spreadline.ts</td>
              <td>347 → ~350</td>
              <td>Main orchestrator class</td>
            </tr>
            <tr>
              <td>order.py</td>
              <td>order.ts</td>
              <td>155 → ~180</td>
              <td>Barycenter ordering</td>
            </tr>
            <tr>
              <td>align.py</td>
              <td>align.ts</td>
              <td>177 → ~200</td>
              <td>LCS alignment</td>
            </tr>
            <tr>
              <td>compact.py</td>
              <td>compact.ts</td>
              <td>812 → ~400</td>
              <td>Slot-based compacting</td>
            </tr>
            <tr>
              <td>contextualize.py</td>
              <td>contextualize.ts</td>
              <td>149 → ~120</td>
              <td>Context layout</td>
            </tr>
            <tr>
              <td>render.py</td>
              <td>render.ts</td>
              <td>575 → ~450</td>
              <td>SVG generation</td>
            </tr>
            <tr>
              <td>views.py</td>
              <td>views.ts + route.ts</td>
              <td>320 → ~350</td>
              <td>API endpoint logic</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// PIPELINE SECTION
// ============================================================================
const pipelineSteps = [
  {
    id: 'load',
    title: '1. Load Data',
    description: 'Load CSV files and map columns to standard names',
    input: 'CSV files: relations.csv, entities.csv, citations.csv, content.csv',
    output: 'Internal data structures: _topo, _node_color, _line_color, _content',
    details: `
The load() method accepts different types of data:
- topology: Edge data (source, target, time, weight)
- content: Layout positions (id, timestamp, posX, posY)
- node: Node colors/context (time, entity, context)
- line: Line colors (entity, color)

Each type has a config mapping that renames columns to standard names.
    `
  },
  {
    id: 'center',
    title: '2. Center on Ego',
    description: 'Filter to 2-hop neighborhood and construct sessions',
    input: 'Ego name (e.g., "Jeffrey Heer"), time format, groups',
    output: 'entities[], sessions[], _tables.session, _tables.presence',
    details: `
center() performs several key operations:
1. Convert time strings to Date objects
2. Filter to timestamps where ego appears
3. Construct 2-hop egocentric network (BFS)
4. Create Entity objects for each actor
5. Create Session objects for each interaction
6. Build timeline and idle session tracking
7. Construct session and presence tables
    `
  },
  {
    id: 'order',
    title: '3. Ordering',
    description: 'Minimize edge crossings using barycenter algorithm',
    input: 'Session table, presence table',
    output: 'orderTable, orderedEntities, orderedSessions',
    details: `
The ordering phase uses the barycenter algorithm with sweeping:
1. Bundle entities by timestamp
2. For each iteration (default 10):
   a. Forward sweep: t → t+1
   b. Backward sweep: t ← t-1
3. Constrained crossing reduction within groups
4. Barycenter sort between sessions
    `
  },
  {
    id: 'align',
    title: '4. Aligning',
    description: 'Maximize straight lines using LCS matching',
    input: 'Ordered entities, idle entities',
    output: 'alignTable, sessionAlignTable',
    details: `
The alignment phase maximizes straight lines:
1. Compute rewards for each entity pair
   - Number of potential straight lines
   - Order similarity
   - Infinite reward for ego-to-ego
2. Find optimal alignment using Longest Common Substring DP
3. Align sessions based on entity alignment
    `
  },
  {
    id: 'compact',
    title: '5. Compacting',
    description: 'Minimize whitespace or wiggles using slot-based layout',
    input: 'Ordered entities, ordered sessions, session alignment',
    output: 'heightTable, sideTable',
    details: `
Compacting assigns vertical positions:
1. Construct slots for sessions
2. Assign ego to fixed slot
3. Place aligned sessions in same slots
4. Fill unassigned slots
5. Compute heights based on minimize mode:
   - 'space': Minimize whitespace
   - 'wiggles'/'line': Minimize line crossings
    `
  },
  {
    id: 'contextualize',
    title: '6. Contextualizing',
    description: 'Add attribute-driven layout positions',
    input: 'Content layout data',
    output: 'context.layout (entity positions per timestamp)',
    details: `
Contextualization adds optional layout context:
1. Match entities to content layout
2. Handle dynamic vs static layouts
3. Normalize positions to [0, 1]
4. Optionally center on ego
    `
  },
  {
    id: 'render',
    title: '7. Rendering',
    description: 'Generate SVG paths and final output',
    input: 'All tables, context',
    output: 'RenderOutput (storylines, blocks, timeLabels)',
    details: `
The render phase generates visualizable output:
1. Compute time band positions (d3.scaleBand equivalent)
2. Fit entities to screen height
3. Generate SVG paths for storylines
4. Create block outlines with arcs
5. Position labels and markers
    `
  }
];

function PipelineSection({
  currentStep,
  setCurrentStep
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) {
  const step = pipelineSteps[currentStep];

  return (
    <div className={styles.section}>
      <h2>5-Phase Pipeline (Interactive)</h2>

      <div className={styles.pipelineStepper}>
        <div className={styles.stepperControls}>
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            ← Previous
          </button>
          <span>Step {currentStep + 1} of {pipelineSteps.length}</span>
          <button
            disabled={currentStep === pipelineSteps.length - 1}
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Next →
          </button>
        </div>

        <div className={styles.stepIndicators}>
          {pipelineSteps.map((s, idx) => (
            <div
              key={s.id}
              className={`${styles.stepDot} ${idx === currentStep ? styles.active : ''} ${idx < currentStep ? styles.completed : ''}`}
              onClick={() => setCurrentStep(idx)}
              title={s.title}
            />
          ))}
        </div>
      </div>

      <div className={styles.pipelineStep}>
        <h3>{step.title}</h3>
        <p className={styles.stepDescription}>{step.description}</p>

        <div className={styles.stepDetails}>
          <div className={styles.ioBox}>
            <h4>Input</h4>
            <pre>{step.input}</pre>
          </div>
          <div className={styles.arrow}>→</div>
          <div className={styles.ioBox}>
            <h4>Output</h4>
            <pre>{step.output}</pre>
          </div>
        </div>

        <div className={styles.expandableDetails}>
          <h4>How it works:</h4>
          <pre className={styles.detailsText}>{step.details}</pre>
        </div>
      </div>

      <div className={styles.pipelineFlow}>
        <h3>Full Pipeline Flow</h3>
        <pre className={styles.diagram}>{`
CSV Files
    │
    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        load() x 4 times                               │
│  relations.csv ──▶ _topo       (topology)                            │
│  entities.csv  ──▶ _line_color (line colors)                         │
│  citations.csv ──▶ _node_color (node colors/context)                 │
│  content.csv   ──▶ _content    (layout positions)                    │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           center()                                    │
│  Input: ego="Jeffrey Heer", timeDelta="year", timeFormat="%Y"        │
│  ├── filterTimeByEgo() ─────▶ Remove timestamps without ego         │
│  ├── constructEgocentricNetwork() ──▶ 2-hop BFS                      │
│  ├── _constructEntities() ──▶ Entity[] with timelines                │
│  ├── _constructContactSessions() ──▶ Session[] with constraints      │
│  ├── _constructTimelinesIdleSessions() ──▶ Fill gaps with idle       │
│  └── _constructTables() ──▶ sessionTable, presenceTable              │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                            fit()                                      │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Step 1: ordering()                                               │ │
│  │   • 10 iterations of forward/backward sweeping                   │ │
│  │   • Barycenter algorithm for crossing reduction                  │ │
│  │   Output: orderTable, orderedEntities, orderedSessions           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                  │                                    │
│                                  ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Step 2: aligning()                                               │ │
│  │   • Compute rewards for entity pairs                             │ │
│  │   • Longest Common Substring dynamic programming                 │ │
│  │   Output: alignTable, sessionAlignTable                          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                  │                                    │
│                                  ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Step 3: compacting()                                             │ │
│  │   • Construct slots for sessions                                 │ │
│  │   • Assign heights based on minimize mode                        │ │
│  │   Output: heightTable, sideTable                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                  │                                    │
│                                  ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Step 4: contextualizing()                                        │ │
│  │   • Match entities to layout positions                           │ │
│  │   • Normalize to [0, 1] range                                    │ │
│  │   Output: context.layout                                         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                  │                                    │
│                                  ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Step 5: rendering()                                              │ │
│  │   • fitTime() - horizontal positions                             │ │
│  │   • fitEntities() - vertical positions                           │ │
│  │   • prepareLineSegments() - SVG paths                            │ │
│  │   • preparePointsBlocks() - interaction blocks                   │ │
│  │   Output: RenderOutput                                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         RenderOutput                                  │
│  {                                                                    │
│    bandWidth: number,                                                 │
│    blockWidth: number,                                                │
│    ego: string,                                                       │
│    timeLabels: [{label, posX}, ...],                                 │
│    heightExtents: [minY, maxY],                                       │
│    storylines: [{name, lines[], marks[], label, color, ...}, ...],   │
│    blocks: [{id, time, points[], outline, relations, ...}, ...]      │
│  }                                                                    │
└──────────────────────────────────────────────────────────────────────┘
        `}</pre>
      </div>
    </div>
  );
}

// ============================================================================
// DATA TRANSFORMATION SECTION
// ============================================================================
function DataTransformationSection({
  selectedEntity,
  setSelectedEntity
}: {
  selectedEntity: string;
  setSelectedEntity: (entity: string) => void;
}) {
  const [showRaw, setShowRaw] = useState(true);
  const [transformStep, setTransformStep] = useState(0);

  const sampleEntities = ['Jeffrey Heer', 'Maneesh Agrawala', 'Ben Shneiderman'];

  const rawDataExample = {
    relations: [
      { year: 2002, source: 'Jeffrey Heer', target: 'Ed Huai-hsin Chi', id: 'paper1', count: 5 },
      { year: 2002, source: 'Jeffrey Heer', target: 'Adam Rosien', id: 'paper1', count: 5 },
      { year: 2003, source: 'Jeffrey Heer', target: 'Stuart K. Card', id: 'paper2', count: 12 }
    ],
    entities: [
      { name: 'Jeffrey Heer', year: 2002, affiliation: 'University of California, Berkeley' },
      { name: 'Ed Huai-hsin Chi', year: 2002, affiliation: 'Xerox PARC' }
    ]
  };

  const transformedDataExamples = [
    {
      step: 'After load()',
      data: {
        _topo: [
          { source: 'Jeffrey Heer', target: 'Ed Huai-hsin Chi', time: '2002', weight: 5 },
          { source: 'Jeffrey Heer', target: 'Adam Rosien', time: '2002', weight: 5 }
        ],
        _line_color: {
          'Jeffrey Heer': '#424242',
          'Ed Huai-hsin Chi': '#FA9902'
        }
      }
    },
    {
      step: 'After center()',
      data: {
        entities: ['Entity(id=0, name="Jeffrey Heer")', 'Entity(id=1, name="Ed Huai-hsin Chi")'],
        sessions: ['Session(id=1, timestamp=0, entities=[Node("Jeffrey Heer"), Node("Ed Huai-hsin Chi")])'],
        sessionTable: [[1, 0, 0], [1, 2, 0]],
        presenceTable: [[1, 0, 0], [1, -1, 0]]
      }
    },
    {
      step: 'After fit()',
      data: {
        heightTable: [[50, 50, 50], [60, 55, 0]],
        orderTable: [[1, 0, 0], [2, 1, 0]],
        alignTable: [[1, -1], [0, -1]]
      }
    }
  ];

  return (
    <div className={styles.section}>
      <h2>Data Transformations (Interactive)</h2>

      <div className={styles.card}>
        <h3>Entity Tracker</h3>
        <p>Select an entity to see how it flows through the pipeline:</p>
        <div className={styles.entitySelector}>
          {sampleEntities.map(entity => (
            <button
              key={entity}
              className={entity === selectedEntity ? styles.selected : ''}
              onClick={() => setSelectedEntity(entity)}
            >
              {entity}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.transformToggle}>
        <button className={showRaw ? styles.active : ''} onClick={() => setShowRaw(true)}>
          Raw Data
        </button>
        <button className={!showRaw ? styles.active : ''} onClick={() => setShowRaw(false)}>
          Transformed Data
        </button>
      </div>

      {showRaw ? (
        <div className={styles.dataDisplay}>
          <h3>Raw CSV Data (Input)</h3>

          <div className={styles.dataCard}>
            <h4>relations.csv</h4>
            <p>Network edges between authors (co-authorship)</p>
            <pre className={styles.codeBlock}>{`
year,source,target,id,type,citationcount,count
2002,Jeffrey Heer,Ed Huai-hsin Chi,paper1,Co-author,156,1
2002,Jeffrey Heer,Adam Rosien,paper1,Co-author,156,1
2003,Jeffrey Heer,Stuart K. Card,paper2,Co-author,89,1
2004,Jeffrey Heer,Maneesh Agrawala,paper3,Co-author,234,1
...
            `}</pre>
          </div>

          <div className={styles.dataCard}>
            <h4>entities.csv</h4>
            <p>Author information by year</p>
            <pre className={styles.codeBlock}>{`
name,year,citationcount,affiliation
Jeffrey Heer,2002,156,University of California Berkeley
Jeffrey Heer,2003,89,Stanford University
Ed Huai-hsin Chi,2002,156,Xerox PARC
Maneesh Agrawala,2004,234,Stanford University
...
            `}</pre>
          </div>

          <div className={styles.dataCard}>
            <h4>citations.csv</h4>
            <p>Citation counts per paper per author</p>
            <pre className={styles.codeBlock}>{`
name,year,citationcount,affiliation,paperID
Jeffrey Heer,2002,156,UC Berkeley,paper1
Ed Huai-hsin Chi,2002,156,Xerox PARC,paper1
Jeffrey Heer,2003,89,Stanford,paper2
...
            `}</pre>
          </div>

          <div className={styles.dataCard}>
            <h4>content.csv (Heer/)</h4>
            <p>Pre-computed layout positions</p>
            <pre className={styles.codeBlock}>{`
year,name,posX,posY
2002,Jeffrey Heer,0.655,0.591
2002,Ed Huai-hsin Chi,0.740,0.697
2003,Jeffrey Heer,0.373,0.597
2003,Stuart K. Card,0.469,0.538
...
            `}</pre>
          </div>
        </div>
      ) : (
        <div className={styles.dataDisplay}>
          <h3>Transformed Data (Step by Step)</h3>

          <div className={styles.transformStepper}>
            {transformedDataExamples.map((ex, idx) => (
              <button
                key={idx}
                className={transformStep === idx ? styles.active : ''}
                onClick={() => setTransformStep(idx)}
              >
                {ex.step}
              </button>
            ))}
          </div>

          <div className={styles.dataCard}>
            <h4>{transformedDataExamples[transformStep].step}</h4>
            <pre className={styles.codeBlock}>
              {JSON.stringify(transformedDataExamples[transformStep].data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <h3>Key Data Structures</h3>

        <div className={styles.dataStructureGrid}>
          <div className={styles.structureCard}>
            <h4>Entity</h4>
            <pre>{`
class Entity {
  id: number;      // Index in array
  name: string;    // Author name
  timeline: number[]; // Session IDs per timestamp
}
            `}</pre>
          </div>

          <div className={styles.structureCard}>
            <h4>Session</h4>
            <pre>{`
class Session {
  id: number;
  entities: Node[];   // Participants
  type: 'contact' | 'idle';
  timestamp: number;  // Index in _all_timestamps
  hops: string[][];   // 5 levels of hop distance
  links: [src, tgt, weight][];
  constraints: any[];
}
            `}</pre>
          </div>

          <div className={styles.structureCard}>
            <h4>Node</h4>
            <pre>{`
class Node {
  name: string;
  id: number;      // Entity index
  sessionID: number;
  order: number;   // Position in session
}
            `}</pre>
          </div>

          <div className={styles.structureCard}>
            <h4>Tables</h4>
            <pre>{`
sessionTable[entity][time]  // Session ID
presenceTable[entity][time] // 1=contact, -1=idle, 0=absent
orderTable[entity][time]    // Vertical order
alignTable[entity][time]    // Aligned entity at t+1
heightTable[entity][time]   // Pixel height
            `}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ALGORITHMS SECTION
// ============================================================================
function AlgorithmsSection() {
  const [selectedAlgo, setSelectedAlgo] = useState<'barycenter' | 'lcs' | 'slots'>('barycenter');

  return (
    <div className={styles.section}>
      <h2>Algorithm Deep Dive</h2>

      <div className={styles.algoSelector}>
        <button
          className={selectedAlgo === 'barycenter' ? styles.active : ''}
          onClick={() => setSelectedAlgo('barycenter')}
        >
          Barycenter Ordering
        </button>
        <button
          className={selectedAlgo === 'lcs' ? styles.active : ''}
          onClick={() => setSelectedAlgo('lcs')}
        >
          LCS Alignment
        </button>
        <button
          className={selectedAlgo === 'slots' ? styles.active : ''}
          onClick={() => setSelectedAlgo('slots')}
        >
          Slot-based Compacting
        </button>
      </div>

      {selectedAlgo === 'barycenter' && (
        <div className={styles.algoContent}>
          <h3>Barycenter Ordering Algorithm</h3>
          <p>
            The barycenter algorithm minimizes edge crossings by iteratively repositioning
            nodes based on the average position of their neighbors.
          </p>

          <div className={styles.algoVisualization}>
            <pre className={styles.diagram}>{`
Forward Sweep (t → t+1):                 Backward Sweep (t+1 → t):

Time t    Time t+1                       Time t    Time t+1
┌───┐     ┌───┐                          ┌───┐     ┌───┐
│ A │─────│ C │                          │ A │─────│ C │
├───┤  ╲  ├───┤                          ├───┤  ╲  ├───┤
│ B │───╲─│ D │  → Reorder t+1           │ B │───╲─│ D │  ← Reorder t
├───┤  ╱╲ ├───┤    by barycenter         ├───┤  ╱╲ ├───┤    by barycenter
│ C │─╱──╲│ A │                          │ C │─╱──╲│ A │
├───┤╱   ╲├───┤                          ├───┤╱   ╲├───┤
│ D │────╲│ B │                          │ D │────╲│ B │
└───┘     └───┘                          └───┘     └───┘

Barycenter calculation:
  position(v) = average(positions of neighbors in other layer)

Example: D connects to A(0), B(1)
  barycenter(D) = (0 + 1) / 2 = 0.5
            `}</pre>
          </div>

          <div className={styles.codeComparison}>
            <div>
              <h4>Python (order.py)</h4>
              <pre className={styles.codeBlock}>{`
def _barycenter_sort(currNodes, nextSessions):
    for session in nextSessions:
        existed = [node.findSelf(currNodes)
                   for node in session.entities]
        barycenter = sum([each.order
                         for each in filter(None, existed)])
        session.barycenter = barycenter / session.entityWeight
    nextSessions.sort(key=lambda x: x.barycenter)
    return nextSessions
              `}</pre>
            </div>
            <div>
              <h4>TypeScript (order.ts)</h4>
              <pre className={styles.codeBlock}>{`
function barycenterSort(currNodes: Node[],
                        nextSessions: Session[]): Session[] {
  for (const session of nextSessions) {
    const existed = session.entities
      .map(node => node.findSelf(currNodes))
      .filter(n => n !== null) as Node[];
    const sum = existed.reduce((s, n) => s + n.order, 0);
    session.barycenter = sum / session.entityWeight;
  }
  nextSessions.sort((a, b) => a.barycenter - b.barycenter);
  return nextSessions;
}
              `}</pre>
            </div>
          </div>
        </div>
      )}

      {selectedAlgo === 'lcs' && (
        <div className={styles.algoContent}>
          <h3>Longest Common Substring Alignment</h3>
          <p>
            The LCS algorithm finds the optimal alignment between entities at consecutive
            timestamps to maximize straight lines.
          </p>

          <div className={styles.algoVisualization}>
            <pre className={styles.diagram}>{`
Dynamic Programming Table:

           Time t+1 entities
              A   B   C   D
         ┌───┬───┬───┬───┬───┐
         │   │ 0 │ 1 │ 2 │ 3 │
    Time ├───┼───┼───┼───┼───┤
    t    │ 0 │ 0 │ 0 │ 0 │ 0 │ A
  entities├───┼───┼───┼───┼───┤
         │ 1 │ 0 │ 2 │ 2 │ 2 │ B  ← B aligns with B
         ├───┼───┼───┼───┼───┤
         │ 2 │ 0 │ 2 │ 4 │ 4 │ C  ← C aligns with C
         ├───┼───┼───┼───┼───┤
         │ 3 │ 0 │ 2 │ 4 │ 6 │ D  ← D aligns with D
         └───┴───┴───┴───┴───┘

Reward function:
  reward(i, j) = straight_lines(i, j) + α × order_similarity(i, j)

  If ego → ego: reward = ∞ (always align ego to itself)
            `}</pre>
          </div>

          <div className={styles.codeComparison}>
            <div>
              <h4>Python (align.py)</h4>
              <pre className={styles.codeBlock}>{`
def longest_common_substring(currLength, nextLength, reward):
    matchTable = {}
    direction = {}

    for i in range(currLength):
        for j in range(nextLength):
            candidates = [
                matchTable.get(i-1,{}).get(j-1,0) + reward[i,j],
                matchTable.get(i,{}).get(j-1,0),
                matchTable.get(i-1,{}).get(j,0)
            ]
            maxValue = max(candidates)
            matchTable[i][j] = maxValue
            direction[i][j] = candidates.index(maxValue)

    # Backtrack to find alignment
    alignTable = {}
    currPtr, nextPtr = currLength-1, nextLength-1
    while currPtr >= 0 and nextPtr >= 0:
        if direction[currPtr][nextPtr] == 0:
            alignTable[currPtr] = nextPtr
            currPtr -= 1; nextPtr -= 1
        elif direction[currPtr][nextPtr] == 1:
            nextPtr -= 1
        else:
            currPtr -= 1
    return alignTable
              `}</pre>
            </div>
            <div>
              <h4>TypeScript (align.ts)</h4>
              <pre className={styles.codeBlock}>{`
function longestCommonSubstring(
  currLength: number,
  nextLength: number,
  reward: number[][]
): Record<number, number> {
  const matchTable: number[][] = [];
  const direction: number[][] = [];

  for (let i = 0; i < currLength; i++) {
    matchTable[i] = new Array(nextLength).fill(0);
    direction[i] = new Array(nextLength).fill(0);

    for (let j = 0; j < nextLength; j++) {
      const diag = (i>0 && j>0) ? matchTable[i-1][j-1] : 0;
      const candidates = [
        diag + reward[i][j],
        j > 0 ? matchTable[i][j-1] : 0,
        i > 0 ? matchTable[i-1][j] : 0
      ];
      const maxVal = Math.max(...candidates);
      matchTable[i][j] = maxVal;
      direction[i][j] = candidates.indexOf(maxVal);
    }
  }
  // Backtrack...
  return alignTable;
}
              `}</pre>
            </div>
          </div>
        </div>
      )}

      {selectedAlgo === 'slots' && (
        <div className={styles.algoContent}>
          <h3>Slot-based Compacting</h3>
          <p>
            The compacting algorithm assigns vertical positions using a slot-based approach,
            ensuring minimal whitespace while respecting ordering constraints.
          </p>

          <div className={styles.algoVisualization}>
            <pre className={styles.diagram}>{`
Slot Assignment:

        Time 0      Time 1      Time 2
Slot 0  [Session A] [Session C] [-1]      (empty)
Slot 1  [Session B] [Session B] [Session B] ← Ego slot (fixed)
Slot 2  [Session C] [-1]        [Session D]

Height Calculation (minimize='wiggles'):

1. Initialize ego session heights (centered at 0)
2. For each entity with multiple appearances:
   - Calculate target height from reference table
   - Check if assignment conflicts with others
   - Adjust heights to reduce wiggles

Height Table:
             t=0    t=1    t=2
Entity A    -15    -15     NaN
Entity B      0      0       0   ← Ego always at 0
Entity C     15     15      20
Entity D    NaN    NaN      30

After offset (all positive):
             t=0    t=1    t=2
Entity A     35     35      -1   (NaN → -1)
Entity B     50     50      50
Entity C     65     65      70
Entity D     -1     -1      80
            `}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// API REFERENCE SECTION
// ============================================================================
function ApiReferenceSection() {
  return (
    <div className={styles.section}>
      <h2>API Reference</h2>

      <div className={styles.card}>
        <h3>Endpoint</h3>
        <pre className={styles.endpoint}>
          GET /api/nodeFetchSpreadLine1
        </pre>
        <p>Returns the SpreadLine visualization data for Jeffrey Heer's co-authorship network.</p>
      </div>

      <div className={styles.card}>
        <h3>Response Format</h3>
        <pre className={styles.codeBlock}>{`
{
  "resp": {
    "bandWidth": 130.48,
    "blockWidth": 40,
    "ego": "Jeffrey Heer",
    "timeLabels": [
      {"label": "2002", "posX": 71.74},
      {"label": "2003", "posX": 207.22},
      ...
    ],
    "heightExtents": [6, 1200],
    "storylines": [
      {
        "name": "Jeffrey Heer",
        "lines": ["M65.74,600 L135.48,600", ...],
        "marks": [],
        "label": {
          "posX": 53.74,
          "posY": 600,
          "textAlign": "end",
          "line": "M55.74,600 L63.74,600",
          "label": "Jeffrey Heer",
          "visibility": "visible"
        },
        "inlineLabels": [],
        "color": "#424242",
        "id": 0,
        "lifespan": 22,
        "crossingCheck": false
      },
      ...
    ],
    "blocks": [
      {
        "id": 0,
        "time": "2002",
        "names": ["Jeffrey Heer", "Ed Huai-hsin Chi", ...],
        "points": [
          {
            "id": 0,
            "posX": 71.74,
            "posY": 600,
            "name": "Jeffrey Heer",
            "group": 0,
            "aggregateGroup": 0,
            "scaleX": 0.655,
            "scaleY": 0.591,
            "label": "156",
            "visibility": "visible"
          },
          ...
        ],
        "relations": [[0, 1], [0, 2], ...],
        "outline": {
          "top": "M71.74,590...",
          "bottom": "M71.74,610...",
          "left": "A20,20,0,0,1,...",
          "right": "A20,20,0,0,0,...",
          "button": {"posX": 71.74, "posY": 620, "width": 60, "height": 18}
        },
        "moveX": 40,
        "topPosY": 580
      },
      ...
    ],
    "mode": "author",
    "reference": [...]
  }
}
        `}</pre>
      </div>

      <div className={styles.card}>
        <h3>Type Definitions</h3>
        <pre className={styles.codeBlock}>{`
interface RenderOutput {
  bandWidth: number;      // Width of each time band in pixels
  blockWidth: number;     // Width of interaction blocks
  ego: string;            // Central actor name
  timeLabels: TimeLabel[]; // Time axis labels with positions
  heightExtents: [number, number]; // Min/max Y coordinates
  storylines: Storyline[]; // Entity lines with SVG paths
  blocks: Block[];        // Expandable interaction blocks
  mode?: string;          // Visualization mode
  reference?: any[];      // Reference data
}

interface Storyline {
  name: string;           // Entity name
  lines: string[];        // SVG path strings
  marks: Mark[];          // Start/end markers
  label: LabelInfo;       // Label positioning
  inlineLabels: InlineLabel[];
  color: string;          // Line color (hex)
  id: number;             // Entity index
  lifespan: number;       // Number of active timestamps
  crossingCheck: boolean; // Does line cross ego?
}

interface Block {
  id: number;
  time: string;           // Timestamp label
  names: string[];        // Entity names in block
  points: BlockPoint[];   // Entity positions
  relations: [number, number][]; // Edge list
  outline: BlockOutline;  // SVG paths for block shape
  moveX: number;          // Block width
  topPosY: number;        // Top Y coordinate
}
        `}</pre>
      </div>

      <div className={styles.card}>
        <h3>Usage Example</h3>
        <pre className={styles.codeBlock}>{`
// Fetch data from API
const response = await fetch('/api/nodeFetchSpreadLine1');
const data = await response.json();

// Access the render output
const { resp } = data;

// Use with D3.js
const svg = d3.select('#visualization')
  .append('svg')
  .attr('width', 2800)
  .attr('height', 1000);

// Draw storylines
resp.storylines.forEach(storyline => {
  svg.append('g')
    .selectAll('path')
    .data(storyline.lines)
    .enter()
    .append('path')
    .attr('d', d => d)
    .attr('stroke', storyline.color)
    .attr('fill', 'none');
});
        `}</pre>
      </div>
    </div>
  );
}

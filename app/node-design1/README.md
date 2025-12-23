# SpreadLine Node.js Backend

Complete TypeScript/Node.js port of the Python SpreadLine visualization pipeline. This implementation generates egocentric dynamic network visualizations entirely in Node.js, eliminating the need for a Python backend.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Algorithm Details](#algorithm-details)
- [File Structure](#file-structure)

## Overview

SpreadLine is a visualization framework for exploring egocentric dynamic networks from the perspective of a central node (ego). It implements the research paper "SpreadLine: Visualizing Egocentric Dynamic Influence" (IEEE TVCG 2024).

### Key Features

- **Pure TypeScript/Node.js**: No Python dependency required
- **Next.js API Routes**: Seamless integration with Next.js App Router
- **Type-Safe**: Full TypeScript type definitions throughout
- **D3.js Compatible**: Output format matches D3.js visualization requirements

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       INPUT DATA (CSV)                              │
│  relations.csv, entities.csv, citations.csv                         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SPREADLINE PIPELINE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   center()  │→│  ordering() │→│  aligning() │→│ compacting()│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│         │                                                   │       │
│         │              ┌─────────────┐                      │       │
│         └──────────────│ rendering() │←─────────────────────┘       │
│                        └─────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     OUTPUT DATA (JSON)                              │
│  SpreadLineData { storylines, blocks, timeLabels, ... }             │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT + D3 FRONTEND                              │
│  SpreadLineChart → SpreadLineVisualizer → SVG                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Input Data

The pipeline accepts three types of CSV data:

**relations.csv** - Network edges:
```csv
year,source,target,id,type,citationcount
2005,Jeffrey Heer,Maneesh Agrawala,paper123,Co-author,500
```

**entities.csv** - Node metadata:
```csv
name,year,citationcount,affiliation
Jeffrey Heer,2005,500,Stanford University
```

**citations.csv** - Citation data for node coloring:
```csv
name,year,citationcount,paperID
Jeffrey Heer,2005,162,paper123
```

### 2. Processing Pipeline

| Step | Function | Description |
|------|----------|-------------|
| 1 | `center()` | Extract 2-hop egocentric network around ego |
| 2 | `ordering()` | Minimize crossings using barycenter algorithm |
| 3 | `aligning()` | Maximize straight lines using LCS with rewards |
| 4 | `compacting()` | Minimize whitespace or wiggles |
| 5 | `rendering()` | Generate SVG paths and positions |

### 3. Output Data

```typescript
interface SpreadLineData {
  bandWidth: number;        // Width of each time column
  blockWidth: number;       // Width of collapsed blocks
  ego: string;              // Central actor name
  timeLabels: TimeLabel[];  // X-axis labels
  storylines: Storyline[];  // Entity paths through time
  blocks: Block[];          // Contact session blocks
  heightExtents: [min, max];
}
```

## Installation

The backend is already integrated into the Next.js app. No additional installation required.

## Usage

### API Endpoint

```typescript
// GET /node-design1/api/spreadline?ego=Jeffrey%20Heer&startYear=2000&endYear=2024

const response = await fetch('/node-design1/api/spreadline?ego=Jeffrey%20Heer');
const data: SpreadLineData = await response.json();
```

### React Hook

```typescript
import { useNodeSpreadLineData } from './components/useNodeSpreadLineData';

function MyComponent() {
  const { data, loading, error, refetch } = useNodeSpreadLineData({
    ego: 'Jeffrey Heer',
    startYear: '2000',
    endYear: '2024',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <SpreadLineChart data={data} />;
}
```

### Programmatic Usage

```typescript
import { SpreadLine, TopologyRow } from './backend';

// Create SpreadLine instance
const sl = new SpreadLine();

// Load data
sl.loadTopology(topologyData);
sl.loadLineColor(lineColorData);
sl.loadNodeColor(nodeColorData);

// Configure
sl.center('Jeffrey Heer', ['2000', '2024'], {
  timeDelta: 'year',
  timeFormat: '%Y',
});

sl.configure({
  bandStretch: [],
  squeezeSameCategory: true,
  minimize: 'space',
});

// Generate visualization
const result = sl.fit({ width: 1200, height: 600 });
```

## API Reference

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ego` | string | "Jeffrey Heer" | Central node name |
| `startYear` | string | "2000" | Start of time range |
| `endYear` | string | "2024" | End of time range |
| `width` | number | 1200 | Viewport width (pixels) |
| `height` | number | 600 | Viewport height (pixels) |

### Response Format

See the [Output Types](#output-data) section for the full SpreadLineData interface.

## Algorithm Details

### Barycenter Algorithm (Crossing Reduction)

The barycenter heuristic minimizes edge crossings by positioning each session based on the average position of its connected entities in the previous timestamp.

```typescript
// For each session in the next timestamp:
// 1. Find entities that exist in current timestamp
const existed = session.entities.map(node => node.findSelf(currNodes));

// 2. Compute barycenter (weighted average position)
const barycenter = existed.reduce((sum, n) => sum + n.order, 0) / session.entityWeight;

// 3. Sort sessions by barycenter
sessions.sort((a, b) => a.barycenter - b.barycenter);
```

### LCS with Rewards (Alignment)

Uses dynamic programming (Longest Common Substring with rewards) to maximize straight lines between consecutive timestamps.

```typescript
// Reward computation:
reward[i][j] = numStraightLines + compatibility;
if (currEnt === ego && nextEnt === ego) {
  reward[i][j] = Infinity; // Ego always stays straight
}

// DP recurrence:
matchTable[i][j] = max(
  matchTable[i-1][j-1] + reward[i][j],  // Align i→j
  matchTable[i][j-1],                    // Skip j
  matchTable[i-1][j]                     // Skip i
);
```

### Height Computation (Compacting)

Assigns vertical positions to minimize whitespace or wiggles:

- Groups entities into slots based on session alignment
- Maintains ordering constraints within sessions
- Handles idle sessions with relaxed constraints
- Uses configurable distance parameters:
  - `DISTANCE_LINE`: 5px between entities in same line
  - `DISTANCE_HOP`: 10px between 1-hop and 2-hop
  - `DISTANCE_SESSION`: 5px between ego and idle sessions

## File Structure

```
app/node-design1/
├── backend/
│   ├── types/
│   │   ├── core.ts         # Path, Node, Entity, Session classes
│   │   ├── input.ts        # Input data types (TopologyRow, etc.)
│   │   └── output.ts       # Output data types (SpreadLineData, etc.)
│   ├── utils/
│   │   ├── datetime.ts     # Date handling utilities
│   │   └── constructors.ts # Network construction helpers
│   ├── pipeline/
│   │   ├── order.ts        # Barycenter crossing reduction
│   │   ├── align.ts        # LCS alignment algorithm
│   │   ├── compact.ts      # Height optimization
│   │   └── render.ts       # SVG path generation
│   ├── spreadline.ts       # Main orchestrator class
│   └── index.ts            # Barrel exports
├── api/
│   └── spreadline/
│       └── route.ts        # Next.js API route handler
├── components/             # React components
│   ├── SpreadLineChart.tsx
│   ├── SpreadLineVisualizer.ts
│   ├── useNodeSpreadLineData.ts
│   └── ...
├── demo/
│   └── page.tsx            # Interactive demo
├── page.tsx                # Documentation page
└── README.md               # This file
```

## Credits

- Original Python implementation: SpreadLine authors
- Research paper: "SpreadLine: Visualizing Egocentric Dynamic Influence" (IEEE TVCG 2024)
- TypeScript port: Converted from Python for Node.js/Next.js integration

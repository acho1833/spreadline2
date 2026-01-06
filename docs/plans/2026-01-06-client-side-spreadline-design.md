# Client-Side SpreadLine Computation

## Overview

Move all SpreadLine layout computation (ordering, aligning, compacting, rendering) from server to frontend. The server will only send raw graph data, and the browser computes everything.

## Goals

- Enable future interactive features like expand/collapse of hop sections
- Give frontend full control over layout computation
- Keep existing server-computed version for backwards compatibility

## Architecture

### Data Flow

```
Server: CSV files → /api/spreadline-raw → { ego, topology[] }
                                              ↓
Frontend: SpreadLine.load() → center() → fit() → render() → D3 Visualization
```

### Data Contract

**Request:**
```typescript
POST /api/spreadline-raw
{
  dataset: "metoo" | "vis-author",
  ego: string
}
```

**Response:**
```typescript
{
  ego: string;
  topology: {
    source: string;
    target: string;
    time: string;
    weight?: number;
  }[];
}
```

## File Structure

### New: `lib/spreadline/`

Shared algorithm library (browser + server compatible):

```
lib/
  spreadline/
    index.ts          # Main entry point - exports SpreadLine class
    spreadline.ts     # Core orchestrator (load, center, fit)
    order.ts          # Barycenter algorithm
    align.ts          # Longest common substring alignment
    compact.ts        # Whitespace/wiggle minimization
    render.ts         # SVG path generation
    types.ts          # Shared type definitions
    utils.ts          # Helper functions
```

### New: `app/api/spreadline-raw/route.ts`

Serves raw topology data only (no computation).

### New: `app/spreadline-frontend1/`

Demo page using client-side computation:
- Fetches from `/api/spreadline-raw`
- Runs SpreadLine pipeline client-side
- Renders with existing D3 visualizer

### Unchanged: `app/api/nodeFetchSpreadLine4/`

Existing server-computed endpoint remains for backwards compatibility.

## Implementation Steps

1. Create `lib/spreadline/` - Copy files from `app/api/nodeFetchSpreadLine4/`, update imports
2. Create `app/api/spreadline-raw/route.ts` - New endpoint for raw data
3. Create `app/spreadline-frontend1/` - New demo page with client-side computation
4. Test - Compare output between server-computed and client-computed versions

## Frontend Usage

```typescript
import { SpreadLine } from '@/lib/spreadline';

const spreadline = new SpreadLine();
spreadline.load(topology, { source: 'source', target: 'target', time: 'time', weight: 'weight' });
spreadline.load(lineColor, { entity: 'entity', color: 'color' }, 'line');
spreadline.center(ego, undefined, 'year', '%Y', groups);
spreadline.configure({ squeezeSameCategory: true, minimize: 'wiggles' });
const result = spreadline.fit(2800, 1000);
```

## Implementation Complete

### Files Created

**`lib/spreadline/`** - Shared algorithm library:
- `index.ts` - Main exports
- `spreadline.ts` - Core orchestrator class
- `types.ts` - Type definitions
- `helpers.ts` - Utility functions
- `constructors.ts` - Egocentric network construction
- `order.ts` - Barycenter algorithm for crossing reduction
- `align.ts` - Longest common substring alignment
- `compact.ts` - Whitespace/wiggle minimization
- `contextualize.ts` - PCA-based content positioning
- `render.ts` - SVG path generation

**`app/api/spreadline-raw/route.ts`** - Raw data API:
- Serves topology data without SVG computation
- Returns `{ ego, topology, lineColor, groups, config }`

**`app/spreadline-frontend1/page.tsx`** - Client-side demo:
- Fetches raw data from `/api/spreadline-raw`
- Runs full SpreadLine pipeline in browser
- Displays computation time
- Uses existing D3 visualizer from react-design11

### How to Test

1. Start dev server: `npm run dev`
2. Open client-side version: `/spreadline-frontend1`
3. Open server-side version: `/react-design11/demo`
4. Compare visualizations side-by-side

### Benefits

- **Full frontend control**: All layout logic runs in browser
- **Future interactivity**: Can now add expand/collapse of hop sections
- **Reduced server load**: Server only serves static data
- **Faster iteration**: No server round-trip for layout changes

# DESIGN.md - SpreadLine Frontend Architecture

This document describes how the current SpreadLine frontend visualization works.

## Overview

SpreadLine is a storyline visualization that shows egocentric dynamic networks over time. The visualization centers around an "ego" (central entity) and shows how other entities (alters) interact with the ego across different time periods.

**Paper**: https://arxiv.org/pdf/2408.08992

## Data Structure (testData.json)

The backend generates a JSON object with pre-computed SVG paths and positions:

```typescript
interface SpreadLineData {
  bandWidth: number;              // Width of each time band (~101.816)
  blockWidth: number;             // Base block width (40)
  ego: string;                    // Name of central entity ("Jeffrey Heer")
  mode: string;                   // Visualization mode ("author", "metoo", etc.)
  heightExtents: [number, number]; // [minY, maxY] of visualization

  timeLabels: TimeLabel[];        // Time axis labels
  storylines: Storyline[];        // Individual entity paths
  blocks: Block[];                // Pill-shaped containers at each timestep
  reference?: Reference[];        // Optional relationship data
}

interface TimeLabel {
  label: string;                  // Time label ("2002", "2003", etc.)
  posX: number;                   // X position
}

interface Storyline {
  id: number;
  name: string;                   // Entity name
  color: string;                  // Hex color
  lifespan: number;               // Number of timesteps active
  crossingCheck: boolean;         // Whether line crosses ego
  lines: string[];                // SVG path strings (bezier curves)
  marks: Mark[];                  // Triangle markers at endpoints
  label: LabelInfo;               // External label position
  inlineLabels: InlineLabel[];    // Labels along the line
}

interface Block {
  id: number;
  time: string;                   // Timestamp
  names: string[];                // Entities in this block
  moveX: number;                  // Expansion width when clicked
  topPosY: number;                // Top Y position
  outline: {
    left: string;                 // Left arc SVG path
    right: string;                // Right arc SVG path
    top: string;                  // Top horizontal line
    bottom: string;               // Bottom horizontal line
    button: ButtonInfo;           // Expand button position
  };
  points: Point[];                // Circles within the block
  relations: [number, number][];  // Edges between points (source, target IDs)
}

interface Point {
  id: number;
  name: string;
  group: number;                  // Block ID
  posX: number;                   // X position (center of block)
  posY: number;                   // Y position (stacked vertically)
  scaleX: number;                 // 0-1 scale for expanded position
  scaleY: number;                 // 0-1 scale for expanded position
  label: string;                  // Value for tooltip/color
  visibility: string;             // "visible" or "hidden"
}
```

## File Structure

```
demo/frontend/
├── index.html              # HTML shell with filter controls
├── interface.js            # Entry point, configuration, fetch data
├── style.css               # All CSS styles
└── SpreadLiner/
    ├── visualizer.js       # Main SpreadLinesVisualizer class
    ├── expander.js         # Block expansion logic
    ├── collapser.js        # Block collapse logic
    └── helpers.js          # Utility functions
```

## Component Architecture

### 1. Entry Point (interface.js)

- Fetches data from Flask backend (`/fetchSpreadLine`)
- Defines configuration per mode (toy, animal, author, metoo)
- Creates `SpreadLinesVisualizer` instance

**Configuration Structure**:
```javascript
{
  legend: {
    line: { domain, range, offset },  // Line type legend
    node: { scale, title }             // Node color scale (d3.scaleThreshold)
  },
  background: {
    direction: ['External', 'Internal'],  // Y-axis labels
    annotations: [{time, text, color}],   // Time annotations
    timeLabelFormat: (d) => d,            // Format function
  },
  content: {
    customize: function,                  // Custom content in expanded blocks
    collisionDetection: boolean,          // Force layout in expanded view
    showLinks: boolean,                   // Show relation arcs
  },
  tooltip: {
    showPointTooltip: boolean,
    pointTooltipContent: function,
  }
}
```

### 2. Main Visualizer (visualizer.js)

**SpreadLinesVisualizer Class** manages the entire SVG:

**Constructor Sets Up**:
- Margins: `{ top: 40, right: 20, bottom: 20, left: 150 }`
- Band width, ego name, legend offsets
- Brush component for time selection
- Visibility tracking per entity
- Filter members (slider, crossing, pinned)

**Rendering Methods** (called in order):
1. `visualize(tag)` - Main entry, sets up SVG container
2. `_createTooltip()` - Tooltip div for hover info
3. `_drawBackground()` - Direction labels, time labels, annotation markers
4. `_activateBrush()` - D3 brush for time range selection
5. `_drawLineLegend()` - Line type legend (Colleague/Collaborator)
6. `_drawNodeLegend()` - Node color legend (Citation scale)
7. `_drawStorylines()` - Entity paths and triangle marks
8. `_drawBlocksAndPoints()` - Pill containers and circles
9. `_drawLabels()` - Entity name labels
10. `_activateFilter()` - Length slider and crossing checkbox

### 3. SVG Structure

```
<svg id="story-svg">
  <style>...</style>                           <!-- Embedded CSS -->
  <defs><marker id="arrow-head">...</marker></defs>  <!-- Arrow markers -->

  <g id="direction-container">                  <!-- "External"/"Internal" labels -->
  <g id="time-container">                       <!-- Time axis + brush -->
  <g id="time-annotation-container">            <!-- Annotation labels -->
  <g id="line-legend-container">                <!-- Line type legend -->
  <g id="node-legend-container">                <!-- Node color legend -->
  <g id="storyline-container">                  <!-- All storyline paths -->
    <g class="storyline-ego|storyline-alter">
      <g class="line-{id}">
        <path class="movable path-movable" d="M...C..." />
      </g>
      <g class="marks">
        <path d="triangle" transform="translate(x,y) rotate(90)" />
      </g>
    </g>
  </g>
  <g id="block-container">                      <!-- All blocks -->
    <g class="arcs" id="arc-group-{id}">
      <g id="block-click-{id}">                <!-- Click target -->
        <path id="left-arc-{id}" d="M...A..." />   <!-- Pill left side -->
        <path id="right-arc-{id}" d="M...A..." />  <!-- Pill right side -->
        <path id="top-bar-{id}" style="hidden" />  <!-- Expanded top -->
        <path id="bottom-bar-{id}" style="hidden" /><!-- Expanded bottom -->
        <circle class="points-{group}" />          <!-- Entity circles -->
      </g>
    </g>
  </g>
  <g id="label-container">                      <!-- All labels -->
    <g class="pin-check" id="label-{name}">
      <text class="labels line-labels" />
      <text class="inline-labels" />
      <path class="mark-links" />               <!-- Label connector line -->
    </g>
  </g>
</svg>
```

### 4. Expander Class (expander.js)

Handles expanding a block when clicked:

**act() Method**:
1. **Shift elements right**: All `.movable` elements to the right of block move by `moveX`
2. **Fill dummy lines**: Extend storylines through expanded area
3. **Expand block**: Show horizontal bars, add white rectangle background
4. **Contextualize**: Reposition points using `scaleX/scaleY` values
5. **Draw links**: Add arc paths between related points
6. **Update brush**: Adjust brush selection positions

**Key Animation**: D3 transitions with 500ms duration, `easeQuadInOut`

**Force Layout**: Optional collision detection using `d3.forceSimulation` with:
- `forceX/forceY` - Target positions
- `forceCollide` - Prevent circle overlap

### 5. Collapser Class (collapser.js)

Reverses expansion:
1. Shift elements back left
2. Remove dummy lines
3. Collapse block (animate width to 0)
4. Revert points to original positions
5. Remove relation arcs
6. Update brush

### 6. Interactions

**Hover (storyline)**:
- `.classed('storyline-hover', true)` - Thicker stroke
- `ENTITY_SELECTION()` - Highlight related blocks/points/labels
- `_massHoverExecution()` - Dehighlight others

**Pin (click storyline)**:
- Toggle `pin` attribute on label element
- Maintains highlight state after mouseout
- Tracked in `this.members.pinned`

**Block Click**:
- Toggle `active` attribute on left-arc
- Create Expander or Collapser instance
- Track in `this.actors[id]`

**Brush**:
- D3 brush on time-container
- Snaps to time label positions
- Updates `brushedBlocks` array
- Triggers `updateBrushedSelection()` on expanded blocks

**Filters**:
- Length slider: Filter by `lifespan` property
- Crossing checkbox: Filter by `crossingCheck` property

### 7. CSS Classes

**Layout Classes**:
- `.movable` - Elements that shift during expand/collapse
- `.station-arcs` - Block outlines (pill shape)
- `.points` - Circle elements
- `.labels` - Text labels

**State Classes**:
- `.storyline-hover` - Hovered state (stroke-width: 4)
- `.storyline-dehighlight` - Faded state (opacity: 0.1)
- `.storyline-label-dehighlight` - Hidden label (opacity: 0)
- `.storyline-arc-dehighlight` - Faded block (opacity: 0.1)

**Type Classes**:
- `.storyline-ego` - Ego line (stroke-width: 5.5)
- `.storyline-alter` - Other lines (stroke-width: 2)
- `.stroked-text` - White text shadow for readability

## Key D3 Patterns Used

1. **Data Join**: `.data().join()` pattern for enter/update/exit
2. **Transitions**: `d3.transition().duration(500).ease(d3.easeQuadInOut)`
3. **Brush**: `d3.brushX()` for time range selection
4. **Force Simulation**: `d3.forceSimulation()` for collision detection
5. **Scales**: `d3.scaleThreshold()` for color mapping
6. **Path**: `d3.path()` for custom arc generation
7. **Symbols**: `d3.symbol().type(d3.symbolTriangle)` for marks

## SVG Path Formats

**Storylines**: Bezier curves
```
M{x1},{y1} L{x2},{y2} C{cx1},{cy1} {cx2},{cy2} {x3},{y3}
```

**Block Outlines**: Arc segments
```
M{x},{y} A{rx},{ry},0,0,0|1,{endX},{endY} L{x},{y} A...
```

**Relations**: Elliptical arcs (in helpers.js)
```javascript
_compute_elliptical_arc(start, end, startRadius, endRadius)
```

## Animation Patterns

**Line Draw Animation**:
```javascript
.attrTween('stroke-dasharray', function() {
  let length = this.getTotalLength();
  return d3.interpolate(`0,${length}`, `${length},${length}`);
})
```

**Transform Animation**:
```javascript
d3.select(this).transition(animation)
  .attr('transform', `translate(${newX}, ${newY})`)
```

## State Management

All state is managed in the `SpreadLinesVisualizer` instance:
- `this.visibility` - Entity visibility map
- `this.members` - Filter states (slider, crossing, pinned arrays)
- `this.actors` - Active Expander instances by block ID
- `this.brushComponent` - Brush state (selection, blocks)

Pin state stored as DOM attributes:
```javascript
element.getAttribute('pin')  // "0" or "1"
element.getAttribute('active')  // "0" or "1" for blocks
```

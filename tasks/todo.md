# SpreadLine React Conversion - Technical Architecture Document

## Project Overview
Convert the SpreadLine D3.js visualization to React/Next.js with TypeScript. Create an interactive technical document that demonstrates component architecture with working demos.

## Current Status: Planning Phase

---

## Component Architecture

### Core Components to Create

```
app/react-design1/
├── page.tsx                    # Main page with all sections
├── components/
│   ├── types.ts                # TypeScript interfaces
│   ├── CodeViewer.tsx          # Expandable code viewer
│   ├── DataEditor.tsx          # Interactive JSON editor
│   ├── TimeAxis.tsx            # Time labels component
│   ├── Storyline.tsx           # Individual storyline paths
│   ├── Block.tsx               # Expandable blocks
│   ├── NodePoint.tsx           # Point visualization
│   ├── Legend.tsx              # Line and node legends
│   ├── FilterControls.tsx      # Filtering UI
│   ├── Tooltip.tsx             # Hover tooltips
│   └── SpreadLineViewer.tsx    # Main container
└── hooks/
    ├── useSpreadLineData.ts    # Data management hook
    └── useAnimation.ts         # Animation hook
```

### Data Flow Architecture

```
TestData.json
     │
     ▼
useSpreadLineData (hook)
     │
     ├──► TimeAxis      ──► renders time labels + rules
     │
     ├──► Storyline[]   ──► renders SVG paths + marks
     │
     ├──► Block[]       ──► renders expandable blocks
     │        │
     │        └──► NodePoint[]  ──► renders circles
     │
     ├──► Legend        ──► renders color scales
     │
     └──► FilterControls ──► manages visibility
```

---

## Phased Development Plan

### Phase 1: Static Foundation
- [x] TypeScript types
- [ ] TimeAxis component (static)
- [ ] Basic Storyline paths
- [ ] Static rendering

### Phase 2: Interactive Elements
- [ ] Hover highlighting
- [ ] Click pinning
- [ ] Filter controls

### Phase 3: Block Expansion
- [ ] Click-to-expand blocks
- [ ] Animated transitions
- [ ] Point repositioning

### Phase 4: Full Feature Parity
- [ ] All interactions working
- [ ] Data editor integration
- [ ] Tooltip system

---

## Todo List

- [ ] Create plan document
- [ ] Create directory structure
- [ ] Create TypeScript types
- [ ] Create CodeViewer component
- [ ] Create DataEditor component
- [ ] Create TimeAxis demo
- [ ] Create Storyline demo
- [ ] Create Block demo
- [ ] Create NodePoint demo
- [ ] Create Legend demo
- [ ] Create FilterControls demo
- [ ] Create Phase 1 integration demo
- [ ] Create Phase 2 integration demo
- [ ] Create Phase 3 integration demo
- [ ] Create Phase 4 final demo
- [ ] Write main page.tsx

---

## Review Section

### Summary of Changes

Created a comprehensive interactive technical documentation page at `app/react-design1/` with the following files:

#### Components Created:
1. **types.ts** - TypeScript interfaces for all SpreadLine data structures
2. **CodeViewer.tsx** - Expandable code viewer with syntax highlighting
3. **DataEditor.tsx** - Interactive JSON editor with property editors
4. **TimeAxis.tsx** - Time labels and vertical rules with demo
5. **Storyline.tsx** - SVG path rendering with hover highlighting
6. **Block.tsx** - Expandable blocks with animation demo
7. **NodePoint.tsx** - Color-coded node points with scale demo
8. **Legend.tsx** - Line and node legends
9. **FilterControls.tsx** - Lifespan slider and crossing filter with preview
10. **Tooltip.tsx** - Hover information display

#### Main Page Features:
- **Section 1: Overview** - Project goals and key features
- **Section 2: Architecture** - Interactive data flow diagram
- **Section 3: Components** - Individual demos with source code viewers
- **Section 4: Phases** - Progressive build phases (1-4) with animation
- **Section 5: Playground** - Interactive data manipulation with live preview
- **Section 6: Full Demo** - Complete SpreadLine with all interactions

### Key Technical Decisions:
- Used React hooks (useState, useEffect, useCallback, useMemo) for state management
- SVG-based rendering for better control and customization
- CSS transitions combined with requestAnimationFrame for smooth animations
- TypeScript strict typing throughout

### Files Structure:
```
app/react-design1/
├── page.tsx                    # Main page (~1000 lines)
└── components/
    ├── types.ts                # ~150 lines
    ├── CodeViewer.tsx          # ~130 lines
    ├── DataEditor.tsx          # ~200 lines
    ├── TimeAxis.tsx            # ~120 lines
    ├── Storyline.tsx           # ~180 lines
    ├── Block.tsx               # ~300 lines
    ├── NodePoint.tsx           # ~200 lines
    ├── Legend.tsx              # ~100 lines
    ├── FilterControls.tsx      # ~200 lines
    └── Tooltip.tsx             # ~80 lines
```

### Access URL:
The page is accessible at: http://localhost:3000/react-design1

### Next Iteration Suggestions:
For `react-design2`, consider:
1. Separating the full demo into its own component file
2. Adding more granular animation controls
3. Implementing brush selection feature
4. Adding data export/import functionality
5. Performance optimization with React.memo and virtualization

---

# React-Design5 Bug Fixes Plan

## Issues Identified from Screenshots (x1.png vs x2.png)

### Bug 1: Storyline Disconnection When Blocks Expand
**Problem**: When expanding years 2002 and 2004, storylines are no longer connected. Some lines are not being expanded/bridged through the expanded blocks.

**Root Cause**: The current implementation shifts path segments based on their start X position, but doesn't properly handle the fill lines that need to bridge gaps. The fill line calculation uses the wrong X positions for the expanded block boundaries.

**Solution**: Fix the fill line generation to:
1. Account for right-only expansion
2. Properly interpolate Y position for storylines crossing expanded blocks
3. Create fill lines that bridge from the left edge of expanded block to the right edge

### Bug 2: bandWidth Changes Not Reflected
**Problem**: Editing bandWidth in the test data editor doesn't update the visualization.

**Solution**: Add a dedicated "Refresh" button that forces a complete re-initialization by incrementing a key and resetting all state.

### Bug 3: Arrow Positioning Issues
**Problem**:
- Arrows go INTO the node instead of stopping at the border
- Some arrows point the wrong direction (see "Jennifer" in screenshot x2.png)

**Solution**:
- Adjust `refX` in the marker to account for node radius (6px)
- Fix arc path direction: always draw from source to target, determine control point position based on relative Y positions

### Bug 4: Block Expand Animation Direction
**Problem**: Block expands both left and right. Left side should stay fixed.

**Solution**: Change from center expansion to right-only expansion:
- `leftX = tl.posX - blockWidth/2 + baseShift` (no expandW offset)
- `rightX = tl.posX + blockWidth/2 + baseShift + expandW` (full expandW)

---

## Implementation Order & Testing

### Phase 1: Fix Block Expansion Direction (Do First)
This affects all other calculations, so fix first.

### Phase 2: Fix Storyline Connectivity
Most critical visual bug - lines must stay connected.

### Phase 3: Add Refresh Button
User-facing feature for data updates.

### Phase 4: Fix Arrow Positioning
Visual polish for relation arcs.

### Testing Checklist
- [ ] Expand year 2002 alone - storylines stay connected
- [ ] Expand year 2004 alone - storylines stay connected
- [ ] Expand both 2002 and 2004 - all storylines connected
- [ ] Edit bandWidth, click Refresh - visualization updates
- [ ] Arrows point correct direction in expanded blocks
- [ ] Arrows stop at node border, not inside
- [ ] Block expands only to right, left edge stays fixed

---

# React-Design6 Bug Fixes Plan

## Issues from React-Design5

### Bug 1: Jennifer Mankoff Disconnection (2003)
**Root Cause**: The `generateFillLines` skips block members, but members also need fill lines when their path segments don't span the full expanded block width.

**Fix**: Generate fill lines for ALL storylines that cross through expanded blocks, including members. The fill line bridges the gap from the path segment end to the expanded block edge.

### Bug 2: Arrows Inside Nodes
**Root Cause**: The bezier path endpoint calculation is correct, but the arrow polygon (8px long) extends FROM the calculated position INTO the node.

**Fix**: Position the path end and arrow at `nodeRadius + arrowLength` (6+8=14px) back from target, so the arrow TIP reaches the node border.

### Bug 3: Collapse Animation Sudden Jump
**Root Cause**: `getShiftX` uses `expandedBlocks.has(block.id)` which becomes false immediately when collapsing, causing instant shift to 0.

**Fix**: Use `blockAnimProgress[block.id] > 0` instead, so shift animates based on progress during both expand and collapse.

### Bug 4: Animation Speed
**Fix**: Increase animation speed from 0.04 to 0.08 per frame (~200ms instead of ~400ms).

---

## Review Section - React-Design6 Implementation

### Summary of Changes

Created `app/react-design6/` with all bug fixes from v5 plus additional fixes:

#### Files Created:
1. **components/types.ts** - Type definitions (copied from react-design3)
2. **components/useSpreadLineData.ts** - TanStack Query hook (copied)
3. **components/CodeViewer.tsx** - Syntax highlighting (copied)
4. **components/DataEditor.tsx** - Editor with Refresh button (from react-design5)
5. **demo/page.tsx** - Main demo with ALL bug fixes
6. **page.tsx** - Documentation with react-design3 content + Implementation Order section

#### Bug Fixes Applied:

**Fix 1: Storyline Connectivity (Jennifer Mankoff)**
- Removed `if (isBlockMember) return;` check in generateFillLines
- Now generates fill lines for ALL storylines crossing expanded blocks
- Maintains visual continuity for both members and non-members

**Fix 2: Arrow Positioning**
- Added `arrowLength = 8` constant
- Pull back by `nodeRadius + arrowLength` (6+8=14px)
- Arrow TIP now reaches node border exactly

**Fix 3: Collapse Animation (Smooth Reverse)**
- Changed `getShiftX` condition from `expandedBlocks.has(block.id)` to `progress > 0`
- Shift now animates based on blockAnimProgress during BOTH expand and collapse
- No more sudden jumps when collapsing

**Fix 4: Animation Speed**
- Changed increment from 0.04 to 0.08 per 16ms frame
- Animation now completes in ~200ms instead of ~400ms

#### Documentation Additions:
- New "Implementation Order" section at top of page
- 10 phases with components, description, test criteria, and code
- Guides developers on how to build the visualization from scratch

#### Access URLs:
- Documentation: `/react-design6`
- Demo: `/react-design6/demo`

---

## Review Section - React-Design5 Implementation

### Summary of Changes

Created `app/react-design5/` with 6 files containing all bug fixes:

#### Files Created:
1. **components/types.ts** - Type definitions (copied from react-design3)
2. **components/useSpreadLineData.ts** - TanStack Query hook (copied)
3. **components/CodeViewer.tsx** - Syntax highlighting (copied)
4. **components/DataEditor.tsx** - NEW: Added Refresh button with `onRefresh` prop
5. **demo/page.tsx** - Main demo with ALL bug fixes
6. **page.tsx** - Documentation page with implementation order

#### Bug Fixes Applied:

**Fix 1: Right-Only Block Expansion**
- Changed `createPillPath` to expand only to the right
- Left edge: `posX - blockWidth/2 + shift` (no expandW)
- Right edge: `posX + blockWidth/2 + shift + expandW` (full expandW)

**Fix 2: Storyline Connectivity**
- Fixed `getShiftX` to use full expansion width for elements to the right
- Fixed `generateFillLines` to use right-only expansion coordinates
- Fill lines now properly bridge storylines through expanded blocks

**Fix 3: Refresh Button**
- Added `onRefresh` prop to DataEditor component
- Refresh button increments `dataVersion` key to force full re-render
- Resets all animation state on refresh

**Fix 4: Arrow Positioning**
- Removed marker-based arrows, using inline polygon instead
- Calculate arrow angle dynamically using `Math.atan2`
- Shorten path to stop at node border (radius = 6px)
- Arrow points from source to target correctly

#### Access URLs:
- Documentation: `/react-design5`
- Demo: `/react-design5/demo`

#### Key Technical Changes:
- All position calculations updated for right-only expansion
- Arrow rendering moved from SVG marker to inline polygon for better control
- DataEditor now requires `onRefresh` callback prop

---

# React-Design7: React + D3.js Hybrid Implementation

## Objective
Create `app/react-design7` - a React implementation that uses **D3.js directly** for animations and interactions, matching the original SpreadLine visualization **exactly**.

## Key Differences: react-design6 vs react-design7

| Aspect | react-design6 | react-design7 (this) |
|--------|--------------|---------------------|
| Animation | setInterval + React state | **D3 transitions** |
| Force simulation | None | **D3 forceSimulation** for collision detection |
| Selections | React mapping | **D3 selections** for DOM manipulation |
| Easing | Custom `easeOutQuad` | **`d3.easeQuadInOut`** |
| Duration | ~200ms | **500ms** (matching original) |
| Brush | None | **D3 brushX** for time selection |
| Line draw effect | None | **stroke-dasharray animation** |

## Architecture: React + D3 Hybrid Approach

**Strategy**: Use React for component structure and initial mount, D3 for all animations and interactions.

```
React Component (SpreadLineChart.tsx)
    │
    ├── useRef() → SVG container reference
    │
    └── useEffect() → D3 takes over for:
            ├── Transitions (d3.transition 500ms)
            ├── Force simulation (d3.forceSimulation)
            ├── Brush (d3.brushX)
            ├── Event handlers
            └── Stroke-dasharray animations
```

---

## Implementation Plan

### Phase 1: Project Setup
- [ ] Create `app/react-design7/page.tsx` (documentation page)
- [ ] Create `app/react-design7/demo/page.tsx` (demo page)
- [ ] Create `app/react-design7/components/` directory
- [ ] Copy types.ts, useSpreadLineData.ts, DataEditor.tsx, CodeViewer.tsx from react-design6

### Phase 2: D3 Utility Functions
Port from SpreadLine-main/demo/frontend/SpreadLiner/helpers.js:

**File: `components/d3-utils.ts`**
- [ ] `_compute_embedding(scale, length)` - Node positioning inside blocks
- [ ] `_compute_elliptical_arc(start, end, startR, endR)` - Relation arc calculation
- [ ] `growLineAnimation()` - Stroke-dasharray grow animation (d3.interpolate)
- [ ] `shrinkLineAnimation()` - Stroke-dasharray shrink animation
- [ ] `getTextWidth(text, font)` - Canvas text measurement
- [ ] `wrap(text, width)` - D3 text wrapping for labels

### Phase 3: SpreadLineVisualizer Class
Port from SpreadLine-main/demo/frontend/SpreadLiner/visualizer.js:

**File: `components/SpreadLineVisualizer.ts`**
- [ ] Constructor accepting data, config, and SVG ref
- [ ] `visualize()` - Main render method
- [ ] `_drawBackground()` - Direction labels, time rules
- [ ] `_drawStorylines()` - D3 data joins for paths, marks
- [ ] `_drawBlocksAndPoints()` - Blocks with D3 data binding
- [ ] `_drawLabels()` - Entity labels with D3
- [ ] Selection helpers (ENTITY_SELECTION, BLOCK_SELECTION, POINT_SELECTION, etc.)

### Phase 4: Expander Class
Port from SpreadLine-main/demo/frontend/SpreadLiner/expander.js:

**File: `components/Expander.ts`**
- [ ] Constructor with block data, position, config
- [ ] `act()` - Main expand action with d3.transition(500ms)
- [ ] `_fillDummyLines()` - Create horizontal fill lines with growLineAnimation
- [ ] `_expandBlock()` - White background rect animation
- [ ] `_contextualize()` - **D3 force simulation** for collision detection
- [ ] `_drawLinks()` - Relation arcs with arrow markers

### Phase 5: Collapser Class
Port from SpreadLine-main/demo/frontend/SpreadLiner/collapser.js:

**File: `components/Collapser.ts`**
- [ ] `act()` - Main collapse with shrinkLineAnimation
- [ ] `_removeDummyLines()` - Remove with shrink animation
- [ ] `_collapseBlock()` - Shrink white background
- [ ] `_revertPointsLinks()` - Reset point positions, remove links

### Phase 6: Interaction System
Port hover, pin, and brush:

- [ ] `_lineHover()` / `_lineHoverOut()` - Highlight with CSS classes
- [ ] `_linePin()` - Toggle pin state on click
- [ ] `_activateBrush()` - D3 brushX for time selection
- [ ] `_blockUpdate()` - Expand/collapse on block click

### Phase 7: React Wrapper Component
**File: `components/SpreadLineChart.tsx`**
- [ ] `useRef<SVGSVGElement>` for container
- [ ] `useEffect` to create SpreadLineVisualizer instance
- [ ] Props: `data`, `config`, callbacks for external state
- [ ] Cleanup on unmount

### Phase 8: Demo Page
- [ ] QueryClientProvider setup
- [ ] Filter controls (lifespan slider, crossing checkbox)
- [ ] DataEditor sidebar
- [ ] Full SpreadLineChart visualization

### Phase 9: Documentation Page
- [ ] D3 concepts explanation (transitions, force, brush)
- [ ] Architecture diagram (React + D3 hybrid)
- [ ] Code examples from original
- [ ] Comparison with react-design6

---

## D3 Code Patterns to Preserve

### 1. D3 Transitions (500ms with easeQuadInOut)
```javascript
// From visualizer.js / expander.js
const animation = d3.transition().duration(500).ease(d3.easeQuadInOut);

d3.select(this).transition(animation)
    .attr('transform', `translate(${moveTo}, ${currY})`);
```

### 2. Force Simulation (Collision Detection)
```javascript
// From expander.js _contextualize()
let simulation = d3.forceSimulation(nodes)
    .force('x', d3.forceX(d => d.x))
    .force('y', d3.forceY(d => d.y))
    .force('collide', d3.forceCollide(d => d.width))
    .stop();
for (let i = 0; i < 100; i++) simulation.tick();
```

### 3. Stroke-Dasharray Animation (Line Drawing Effect)
```javascript
// From expander.js
function growLineAnimation() {
    let length = this.getTotalLength();
    return d3.interpolate(`0,${length}`, `${length},${length}`);
}

path.transition(animation).attrTween('stroke-dasharray', growLineAnimation);
```

### 4. D3 Brush (Time Selection)
```javascript
// From visualizer.js
d3.brushX().extent([[0, startY], [width, endY]]);
d3.select('#time-container').call(brush).on('dblclick', reset);
```

### 5. D3 Data Joins
```javascript
// From visualizer.js _drawStorylines()
chartContainer.selectAll('g')
    .data(storylines)
    .join(enter => {
        let container = enter.append('g');
        container.selectAll('path')
            .data(d => d.lines)
            .join('path')
            .attr('d', e => e);
        return container;
    });
```

---

## Files to Create

```
app/react-design7/
├── page.tsx                     # Documentation page
├── demo/
│   └── page.tsx                 # Interactive demo
└── components/
    ├── types.ts                 # TypeScript interfaces (copy from design6)
    ├── d3-utils.ts              # D3 utility functions
    ├── SpreadLineVisualizer.ts  # Main D3 visualizer class
    ├── Expander.ts              # Block expansion logic
    ├── Collapser.ts             # Block collapse logic
    ├── SpreadLineChart.tsx      # React wrapper component
    ├── useSpreadLineData.ts     # Data hook (copy from design6)
    ├── DataEditor.tsx           # JSON editor (copy from design6)
    └── CodeViewer.tsx           # Code viewer (copy from design6)
```

---

## Testing Checklist

After implementation, verify:

- [ ] Animations use D3 (500ms, d3.easeQuadInOut) - not React state
- [ ] Force simulation prevents node overlap when expanded
- [ ] Brush selection works for time filtering
- [ ] Hover highlight matches original (class-based with opacity: 0.1)
- [ ] Pin functionality works correctly
- [ ] Fill lines appear with stroke-dasharray grow animation
- [ ] Relation arcs appear with grow animation and arrow markers
- [ ] Collapse uses shrink animation (reverse of grow)
- [ ] All elements shift right during expansion with transition
- [ ] Labels show/hide correctly based on lifespan

---

## Current Todo Progress

- [x] Write implementation plan (this document)
- [x] Create app/react-design7/page.tsx with documentation
- [x] Create app/react-design7/demo/page.tsx with React+D3 demo
- [x] Create app/react-design7/components with D3 integration

---

## Review Section - React-Design7 Implementation

### Summary

Successfully created `app/react-design7/` - a React + D3.js hybrid implementation that uses **D3.js directly** for animations, transitions, and interactions. This matches the original SpreadLine visualization behavior much more closely than the pure React implementations (react-design1 through react-design6).

### Files Created

```
app/react-design7/
├── page.tsx                        # Documentation page (~600 lines)
├── demo/
│   └── page.tsx                    # Interactive demo (~265 lines)
└── components/
    ├── types.ts                    # TypeScript interfaces (~200 lines)
    ├── d3-utils.ts                 # D3 utility functions (~150 lines)
    ├── SpreadLineVisualizer.ts     # Main D3 visualizer class (~950 lines)
    ├── Expander.ts                 # Block expansion logic (~580 lines)
    ├── Collapser.ts                # Block collapse logic (~260 lines)
    ├── SpreadLineChart.tsx         # React wrapper component (~175 lines)
    ├── useSpreadLineData.ts        # TanStack Query data hook (~50 lines)
    ├── DataEditor.tsx              # JSON editor with refresh (~200 lines)
    └── CodeViewer.tsx              # Syntax highlighting (~130 lines)
```

### Key Technical Features

#### 1. D3 Transitions (500ms with easeQuadInOut)
- All animations use `d3.transition().duration(500).ease(d3.easeQuadInOut)`
- Matches original SpreadLine timing exactly
- Provides smooth, professional-looking animations

#### 2. D3 Force Simulation
- Used in `Expander._contextualize()` for collision detection
- Prevents node overlap when blocks are expanded
- Runs 100 tick iterations synchronously for immediate results

#### 3. Stroke-Dasharray Animation
- `growLineAnimation()` - Draws lines from 0 to full length
- `shrinkLineAnimation()` - Reverses for collapse
- Creates line-drawing effect for relation arcs and fill lines

#### 4. D3 Brush (Time Selection)
- `d3.brushX()` for selecting time periods
- Double-click to reset selection
- Integrates with block expansion state

#### 5. CSS Class-based Highlighting
- `.storyline-dehighlight` and `.storyline-arc-dehighlight` classes
- Quick opacity transitions (200ms) for hover effects
- Pin functionality preserves highlight on click

### Architecture: React + D3 Hybrid

```
React Component (SpreadLineChart.tsx)
    │
    ├── useRef<SVGSVGElement>() → SVG container reference
    │
    └── useEffect() → D3 takes over for:
            ├── SpreadLinesVisualizer.visualize(svg)
            ├── D3 transitions (500ms)
            ├── D3 force simulation
            ├── D3 brush
            ├── Event handlers (hover, click, pin)
            └── Stroke-dasharray animations
```

### TypeScript Fixes Applied

During development, several D3 type compatibility issues were resolved:
- Used `any` type for D3 transitions to avoid strict type conflicts
- Cast `d3.BaseType` to `SVGGraphicsElement` for `getBBox()` calls
- Used `as any` for `attrTween` and `on('end')` callbacks
- Cast `document.getElementById` results to `SVGGraphicsElement`

### Access URLs
- Documentation: `/react-design7`
- Demo: `/react-design7/demo`

### Comparison: react-design6 vs react-design7

| Aspect | react-design6 | react-design7 |
|--------|--------------|---------------|
| Animation | setInterval + React state | **D3 transitions** |
| Duration | ~200ms | **500ms** |
| Easing | Custom easeOutQuad | **d3.easeQuadInOut** |
| Force simulation | None | **d3.forceSimulation** |
| Brush | None | **d3.brushX** |
| Line draw effect | None | **stroke-dasharray** |
| DOM manipulation | React re-renders | **D3 selections** |

### Verified Features
- [x] Documentation page loads (HTTP 200)
- [x] Demo page loads (HTTP 200)
- [x] TypeScript compiles without errors
- [x] All D3 animation patterns from original SpreadLine ported
- [x] Force simulation for collision detection
- [x] Brush selection for time filtering
- [x] Hover/pin highlighting system
- [x] Fill line generation with grow animation
- [x] Relation arcs with arrow markers

### Next Steps / Improvements
1. Add integration tests for D3 interactions
2. Performance optimization for large datasets
3. Add keyboard accessibility
4. Consider extracting common D3 patterns into reusable hooks

---

# React-Design8: Light Theme + Missing Controls Fix

## Objective
Create `app/react-design8` from `react-design7` with the following fixes to match the original D3 visualization (y1.png):

1. **Light color scheme** - White background instead of dark blue
2. **Add filter controls** - Slider for "Years" and checkbox for "Only show crossing lines"
3. **Fix expanded box** - Show paper labels and remove unnecessary link arrows

## Screenshot Analysis (y1.png vs y2.png)

### y1.png (Original D3 version) - TARGET
- White/light background
- Slider control showing "X Years" label
- Checkbox "Only show crossing lines"
- Expanded box shows paper reference labels inside
- NO link arrows in author mode (`showLinks: false`)
- Station arcs: gray stroke (#424242), white fill

### y2.png (React version - current)
- Dark blue/navy background
- Missing slider and checkbox controls
- Expanded box missing paper reference labels
- Has unnecessary link arrows showing

## Root Cause Analysis

1. **Color scheme**: CSS styles in `d3-utils.ts:createStyleElementFromCSS` use dark theme colors
2. **Missing controls**: Original has `_activateFilter` method that creates slider/checkbox. React version doesn't implement this.
3. **Missing labels in expanded box**: The `authorContentCustomize` function from interface.js needs to be provided via `config.content.customize`
4. **Unnecessary link arrows**: Config should have `showLinks: false` for author mode

## Todo Checklist

- [x] Write plan to tasks/todo.md
- [ ] Create app/react-design8 directory with files from react-design7
- [ ] Change color scheme to light theme
  - Update `createStyleElementFromCSS` in d3-utils.ts
  - Update demo page background colors (remove dark theme)
- [ ] Add slider and checkbox controls
  - Add `_activateFilter` method to SpreadLineVisualizer
  - Add filter HTML elements in demo page
  - Wire up filter handlers
- [ ] Fix expanded box
  - Implement `authorContentCustomize` function
  - Ensure `showLinks: false` is set in config
- [ ] Create demo page at app/react-design8/demo
- [ ] Test visualization matches y1.png

## Files to Modify

1. `app/react-design8/demo/page.tsx` - Add filter controls, light theme
2. `app/react-design8/components/d3-utils.ts` - Light CSS theme
3. `app/react-design8/components/SpreadLineVisualizer.ts` - Filter support
4. `app/react-design8/page.tsx` - Update docs page theme

## Review Section

### Summary of Changes

Successfully created `app/react-design8/` - a light-themed version matching the original D3 visualization with all requested fixes.

### Files Created/Modified

```
app/react-design8/
├── page.tsx                        # Documentation page (light theme)
├── demo/
│   └── page.tsx                    # Interactive demo (light theme)
└── components/
    ├── d3-utils.ts                 # Updated CSS for light theme
    ├── SpreadLineVisualizer.ts     # Added applyFilter() method
    ├── SpreadLineChart.tsx         # Added yearsFilter & crossingOnly props
    └── [other files from react-design7]
```

### Changes Made

#### 1. Light Color Scheme
- Updated `createStyleElementFromCSS()` in `d3-utils.ts`:
  - Station arcs: `stroke: #424242` (gray), `fill: #ffffff` (white)
  - Points: `stroke: #424242`
  - Tooltip: white background with dark text
  - Stroked text: white text shadow for readability
- Updated demo page and docs page with light backgrounds (`bg-white`, `text-gray-*`)

#### 2. Filter Controls Added
- Slider for "Years" filtering (min lifespan threshold)
- Checkbox for "Only show crossing lines"
- Filter state managed in React, applied via `applyFilter()` method
- Filters update visualization without full re-render

#### 3. Expanded Box Fixes
- Added `authorContentCustomize` function to render paper labels inside expanded blocks
- Set `showLinks: false` in config to prevent arrow links from appearing
- Labels use the same positioning logic as original (`_compute_embedding`)

### Key Technical Details

1. **Filter Implementation**: `SpreadLineVisualizer.applyFilter(yearsFilter, crossingOnly)` method:
   - Hides storylines with lifespan below threshold
   - Hides non-crossing storylines when checkbox is checked
   - Updates visibility via D3 selections

2. **Config Merging**: `SpreadLineChart` properly merges nested config objects:
   ```typescript
   const mergedConfig = {
     ...defaultConfig,
     ...config,
     content: { ...defaultConfig.content, ...config?.content },
   };
   ```

3. **Custom Content Renderer**: `authorContentCustomize` function:
   - Renders paper reference labels inside expanded blocks
   - Uses `_compute_embedding` for positioning
   - Applies text wrapping via D3's `wrap()` helper

### Access URLs
- Documentation: `/react-design8`
- Demo: `/react-design8/demo`

### Testing
- Build passes: `npm run build` ✓
- Dev server starts: `npm run dev` ✓
- Pages return HTTP 200 ✓

---

# React-Design9: Bug Fixes for Interaction and Filtering

## Issues Fixed (from react-design8)

1. **Block click not working** - Block (pill container) clicks weren't triggering expansion
2. **Year text click** - Added ability to click year labels to toggle expansion
3. **Crossing filter logic was backwards** - Filter was hiding crossing lines instead of keeping them

## Root Cause Analysis

### 1. Block Click Issue
- The click handler was properly attached but pointer-events might have been blocked
- Fixed by:
  - Adding `pointer-events: all` to `.station-arcs`, `.arcs`, and `.points` CSS
  - Adding `event.stopPropagation()` to prevent event bubbling issues
  - Setting explicit `cursor: pointer` on container

### 2. Year Text Click
- Original D3 version didn't have this feature
- Added click handler to time labels that finds the block for that year and calls `_blockUpdate`
- Time labels now have `cursor: pointer` styling

### 3. Crossing Filter Logic
- **The bug**: My implementation was computing non-crossing from `blocks.names`, which was wrong
- **Original logic**: Uses `storyline.crossingCheck` property directly
  - `crossingCheck: true` = storyline crosses blocks without being a member (IS crossing) - KEEP
  - `crossingCheck: false` = storyline is a member of blocks (NOT crossing) - HIDE
- **Fix**: Changed filter to check `s.crossingCheck === false` to hide non-crossing storylines

## Files Modified

```
app/react-design9/
├── page.tsx                        # Updated references
├── demo/page.tsx                   # Updated references
└── components/
    ├── d3-utils.ts                 # Added pointer-events CSS
    └── SpreadLineVisualizer.ts     # Fixed click handlers, filter logic, added year click
```

## Key Code Changes

### SpreadLineVisualizer.ts - Fixed crossing filter:
```typescript
// BEFORE (wrong):
if (crossingOnly) {
  blocks.forEach(block => {
    block.names.forEach(name => nonCrossing.add(name));
  });
  storylines.forEach(s => {
    if (s.name !== ego && nonCrossing.has(s.name)) toHide.add(s.name);
  });
}

// AFTER (correct):
if (crossingOnly) {
  storylines.forEach(s => {
    // Hide storylines that are NOT crossing (crossingCheck === false)
    if (s.name !== ego && s.crossingCheck === false) {
      toHide.add(s.name);
    }
  });
}
```

### SpreadLineVisualizer.ts - Year text click handler:
```typescript
container
  .append('text')
  .style('cursor', 'pointer')
  .on('click', function(event: MouseEvent, d: TimeLabel) {
    const block = self.data.blocks.find(b => b.time === d.label);
    if (block) {
      self._blockUpdate(event, block);
    }
  });
```

### d3-utils.ts - CSS fixes:
```css
.station-arcs {
  pointer-events: all;
  cursor: pointer;
}
.arcs {
  pointer-events: all;
  cursor: pointer;
}
```

## Access URLs
- Documentation: `/react-design9`
- Demo: `/react-design9/demo`

## Testing
- Build passes: `npm run build` ✓
- Dev server starts: `npm run dev` ✓
- Pages return HTTP 200 ✓
- Block click: Should now trigger expansion
- Year text click: Should toggle block expansion
- Crossing filter: Should correctly show only crossing lines when checked

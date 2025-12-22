# PLAN.md - React Conversion Strategy

This document outlines the step-by-step approach to convert the SpreadLine visualization from vanilla JS/D3 to React with Next.js 16, TypeScript, and Shadcn/ui.

## Technology Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **D3.js** - SVG manipulation (used declaratively with React)
- **Shadcn/ui** - UI components (Tooltip, Slider, Checkbox, Button)
- **Tailwind CSS** - Styling (via Shadcn)

## Architecture Approach

### Key Principle: Declarative SVG with React

Instead of D3's imperative `.append()` and `.selectAll().data().join()`, we'll:
1. Store visualization state in React state/refs
2. Render SVG elements declaratively in JSX
3. Use D3 only for calculations (scales, paths, forces) not DOM manipulation
4. Use React's reconciliation for updates

### Component Hierarchy

```
SpreadLineVisualization/
├── SpreadLineProvider.tsx      # Context for shared state
├── SpreadLineVisualization.tsx # Main container
├── components/
│   ├── SVGContainer.tsx        # SVG wrapper with dimensions
│   ├── Background/
│   │   ├── DirectionLabels.tsx # "External"/"Internal" labels
│   │   ├── TimeAxis.tsx        # Time labels + vertical rules
│   │   └── Annotations.tsx     # Time annotations
│   ├── Legend/
│   │   ├── LineLegend.tsx      # Line type legend
│   │   └── NodeLegend.tsx      # Node color legend
│   ├── Storylines/
│   │   ├── Storyline.tsx       # Single storyline (path + marks)
│   │   └── StorylineGroup.tsx  # All storylines container
│   ├── Blocks/
│   │   ├── Block.tsx           # Single block (pill container)
│   │   ├── BlockOutline.tsx    # Arc paths
│   │   ├── BlockPoints.tsx     # Circles within block
│   │   └── BlockRelations.tsx  # Relation arcs (when expanded)
│   ├── Labels/
│   │   ├── EntityLabel.tsx     # External label
│   │   └── InlineLabel.tsx     # Inline label
│   ├── Filters/
│   │   ├── LengthSlider.tsx    # Shadcn Slider
│   │   └── CrossingCheckbox.tsx# Shadcn Checkbox
│   └── Brush/
│       └── TimeBrush.tsx       # D3 brush integration
├── hooks/
│   ├── useSpreadLineData.ts    # Data fetching/loading
│   ├── useExpansion.ts         # Block expand/collapse logic
│   ├── useHighlight.ts         # Hover/pin state
│   ├── useBrush.ts             # Brush selection
│   └── useFilters.ts           # Filter state
├── utils/
│   ├── pathUtils.ts            # SVG path calculations
│   ├── forceLayout.ts          # D3 force simulation
│   └── scales.ts               # Color scales
└── types/
    └── index.ts                # TypeScript interfaces
```

## Step-by-Step Implementation

### Step 1: Project Setup
**Test**: Project builds and shows empty page

```bash
npx create-next-app@latest spreadline-react --typescript --tailwind --eslint --app
cd spreadline-react
npx shadcn@latest init
npm install d3 @types/d3
```

Create folder structure:
```
src/
├── app/
│   └── page.tsx
├── components/
│   └── spreadline/
└── lib/
    └── types.ts
```

### Step 2: TypeScript Types
**Test**: Types compile without errors

Create `src/lib/types.ts` with all interfaces from DESIGN.md:
- SpreadLineData
- TimeLabel
- Storyline
- Block
- Point
- etc.

### Step 3: Data Loading
**Test**: Console logs testData.json correctly

- Copy `testData.json` to `public/` folder
- Create `useSpreadLineData` hook to fetch/load data
- Display basic "Data loaded: X storylines, Y blocks" message

### Step 4: SVG Container
**Test**: Empty SVG with correct dimensions renders

- Create `SVGContainer.tsx`
- Calculate dimensions from data (timeLabels, heightExtents)
- Apply margins
- Render empty `<svg>` with computed width/height

### Step 5: Time Axis (Static)
**Test**: Time labels and vertical rules display correctly

- Create `TimeAxis.tsx`
- Map `timeLabels` to `<text>` and `<line>` elements
- Position using `posX` values
- Add `.time-labels` styling

### Step 6: Direction Labels
**Test**: "External"/"Internal" labels display

- Create `DirectionLabels.tsx`
- Position relative to ego's Y position
- Apply large font styling

### Step 7: Storylines (Static)
**Test**: All storyline paths render with correct colors

- Create `Storyline.tsx` and `StorylineGroup.tsx`
- Render `<path>` elements from `storyline.lines` array
- Apply stroke color from `storyline.color`
- Differentiate ego (thicker) vs alter (thinner)
- Add triangle marks using D3 symbol or manual path

### Step 8: Blocks (Static, Collapsed)
**Test**: Pill-shaped blocks render at each timestep

- Create `Block.tsx` and `BlockOutline.tsx`
- Render left/right arc paths from `block.outline`
- Render points as `<circle>` elements
- Apply `.station-arcs` and `.points` styling

### Step 9: Labels (Static)
**Test**: Entity labels display at correct positions

- Create `EntityLabel.tsx`
- Position using `label.posX`, `label.posY`
- Add label connector lines
- Handle `visibility` property

### Step 10: Legends
**Test**: Line and node legends display correctly

- Create `LineLegend.tsx` using Shadcn Button styling
- Create `NodeLegend.tsx` with color swatches
- Use D3 scales for color mapping

**Checkpoint**: Static visualization matches original

---

### Step 11: Highlight State
**Test**: Hovering storyline highlights it, others fade

- Create `useHighlight` hook with state:
  ```typescript
  {
    hoveredEntity: string | null;
    pinnedEntities: Set<string>;
  }
  ```
- Add `onMouseEnter`/`onMouseLeave` to Storyline
- Apply CSS classes conditionally:
  - `.storyline-hover` when hovered
  - `.storyline-dehighlight` for others

### Step 12: Pin Functionality
**Test**: Clicking storyline pins it, clicking again unpins

- Add click handler to toggle pin state
- Pinned entities stay highlighted
- Update label styling for pinned state

### Step 13: Block Expansion State
**Test**: Clicking block expands it with animation

- Create `useExpansion` hook:
  ```typescript
  {
    expandedBlocks: Map<number, { offset: number }>;
  }
  ```
- Calculate total offset for elements to the right
- Use CSS transitions for animation
- Show/hide horizontal bars

### Step 14: Expanded Block Content
**Test**: Points spread out when block expands

- Calculate expanded positions using `scaleX`/`scaleY`
- Apply D3 force simulation for collision detection
- Animate circle positions

### Step 15: Relation Arcs
**Test**: Arcs appear between related points when expanded

- Create `BlockRelations.tsx`
- Port `_compute_elliptical_arc` from helpers.js
- Animate arc drawing with stroke-dasharray

### Step 16: Dummy Lines
**Test**: Storylines extend through expanded blocks

- Calculate which storylines pass through expanded block
- Add temporary line segments
- Animate line drawing

### Step 17: Collapse Animation
**Test**: Clicking expanded block collapses smoothly

- Reverse all expansion transforms
- Animate elements back to original positions
- Remove expanded content

**Checkpoint**: Expand/collapse works like original

---

### Step 18: Brush Selection
**Test**: Dragging on time axis selects time range

- Create `TimeBrush.tsx` using D3 brush
- Use `useRef` for brush element
- Store selection in context
- Snap to time label positions

### Step 19: Brushed Points
**Test**: Brushed time range shows additional points in expanded blocks

- Filter blocks by brush selection
- Add translucent points from other timesteps
- Apply force layout to avoid overlap

### Step 20: Filter Controls
**Test**: Slider filters by lifespan, checkbox filters by crossing

- Create `LengthSlider.tsx` with Shadcn Slider
- Create `CrossingCheckbox.tsx` with Shadcn Checkbox
- Connect to filter state
- Apply dehighlight classes to filtered entities

### Step 21: Label Toggle
**Test**: Button cycles through label visibility modes

- Create label display button
- Cycle: "Some Labels" → "Hide Labels" → "Reveal Labels"
- Apply visibility based on `lifespan` threshold

### Step 22: Tooltips
**Test**: Hovering points shows tooltip with name and value

- Use Shadcn Tooltip component
- Position relative to mouse
- Format content based on configuration

**Checkpoint**: All interactions work

---

### Step 23: Configuration Support
**Test**: Different modes (author, metoo) render correctly

- Create configuration type
- Support different color scales
- Support different legend configurations
- Support custom content functions

### Step 24: Annotations
**Test**: Time annotations display correctly

- Create `Annotations.tsx`
- Position at correct timestamps
- Apply highlight colors

### Step 25: Performance Optimization
**Test**: Large datasets render smoothly

- Memoize components with `React.memo`
- Use `useMemo` for expensive calculations
- Consider virtualization for very large datasets

### Step 26: Responsive Layout
**Test**: Visualization scrolls horizontally

- Apply overflow-x scroll to container
- Calculate dynamic width from data
- Handle resize events

### Step 27: Final Polish
**Test**: Pixel-perfect match with original

- Compare SVG output
- Verify all interactions
- Test edge cases

## Testing Strategy

### Per-Step Testing
Each step has a specific test condition. After completing each step:
1. Run `npm run dev`
2. Verify the test condition
3. Compare visually with original at http://localhost:5173

### Visual Comparison
- Take screenshots of original
- Overlay with React version
- Check for pixel differences

### Interaction Testing
- Test each interaction manually
- Verify state changes correctly
- Check animation timing matches

## File-by-File Porting Guide

| Original File | React Equivalent |
|---------------|------------------|
| `interface.js` (config) | `src/lib/config.ts` |
| `visualizer.js` (class) | `SpreadLineVisualization.tsx` + hooks |
| `expander.js` | `useExpansion.ts` + animation logic |
| `collapser.js` | `useExpansion.ts` (collapse branch) |
| `helpers.js` | `src/lib/utils/*.ts` |
| `style.css` | Tailwind classes + `globals.css` |

## Suggestions

1. **Use Framer Motion**: For smoother animations than CSS transitions, consider adding `framer-motion` for the expand/collapse animations.

2. **State Management**: If state becomes complex, consider Zustand instead of React Context for better performance.

3. **SVG Export**: Add a "Download SVG" button using the same approach as original (embed CSS in SVG).

4. **Storybook**: Consider adding Storybook for component development and visual testing.

5. **Server Components**: Keep visualization as client component (`"use client"`) since it requires D3 and interactivity.

Let me know if you'd like me to:
- Start implementing any specific step
- Add more detail to any section
- Adjust the component architecture
- Change the technology choices

# Collapsible Hop Sections Design

## Overview

Add collapse/expand functionality to 2-hop sections within pill containers. Each pill can independently collapse its top and/or bottom 2-hop sections to reduce visual clutter while showing a count of hidden nodes.

## Visual Behavior

### Expanded State (default)
```
    ╭───╮
    │ • │ Tara Matthews
    │[-]│ ← collapse button
    │ • │ Tim Sohn
    │ • │ Jason I. Hong
    │ • │ James A. Landay
    ╰───╯
```

### Collapsed State
```
    ╭───╮
    │(4)│ ← count circle (clickable to expand)
    ╰───╯
```

## Key Behaviors

1. **Per-pill independence**: Collapsing a section in one timestamp's pill does not affect other pills
2. **Smooth animation**: 500ms transitions using D3's easeQuadInOut (matches existing animations)
3. **Connection lines**: When collapsed, hide storylines connected to hidden nodes; restore on expand
4. **D3-controlled state**: All rendering and interaction state managed by D3, not React

## Data Structure Changes

### BlockResult (types.ts)

```typescript
interface HopSectionInfo {
  nodeCount: number;    // Number of nodes in this section
  centerY: number;      // Y position for button/count circle
  nodeIds: number[];    // Node IDs in this section (for hiding storylines)
  names: string[];      // Entity names in this section
}

interface BlockResult {
  // ... existing fields ...
  hopSections: {
    top: HopSectionInfo | null;     // null if no top 2-hop entities
    bottom: HopSectionInfo | null;  // null if no bottom 2-hop entities
  };
}
```

### SpreadLinesVisualizer State

```typescript
class SpreadLinesVisualizer {
  // ... existing state ...

  // Track collapsed sections: blockId -> Set of collapsed sections ('top' | 'bottom')
  collapsedSections: Map<number, Set<'top' | 'bottom'>> = new Map();
}
```

## Implementation Changes

### File 1: lib/spreadline/types.ts
- Add `HopSectionInfo` interface
- Add `hopSections` to `BlockResult` interface

### File 2: lib/spreadline/render.ts
- In `computeBlock()`: Calculate `hopSections` data
- Return nodeCount, centerY, nodeIds, names for top/bottom sections

### File 3: app/react-design11/components/types.ts
- Mirror the type changes for frontend

### File 4: app/react-design11/components/SpreadLineVisualizer.ts
- Add `collapsedSections` state map
- In `_drawBlocksAndPoints()`: Render [-] buttons and (n) count circles
- Add `_toggleHopSection(blockId: number, section: 'top' | 'bottom')` method
- Add `_animateCollapse(blockId, section)` - shrinks section, hides nodes/lines
- Add `_animateExpand(blockId, section)` - restores section, shows nodes/lines

## Animation Details

### Collapse Animation
1. Fade out nodes in section (opacity 0)
2. Fade out connected storylines (opacity 0)
3. Animate pill arc paths to collapsed shape
4. Hide [-] button, show count circle
5. Set visibility: hidden on faded elements

### Expand Animation
1. Set visibility: visible on hidden elements
2. Animate pill arc paths to expanded shape
3. Fade in nodes (opacity 1)
4. Fade in connected storylines (opacity 1)
5. Hide count circle, show [-] button

## UI Elements

### Collapse Button [-]
- Small rectangle with minus sign
- Positioned at centerY of hop section
- Cursor: pointer
- On click: trigger collapse

### Count Circle (n)
- Circle with node count inside
- Positioned at center of collapsed section
- Cursor: pointer
- On click: trigger expand
- Same styling as regular nodes but slightly larger

## Edge Cases

1. **No 2-hop entities**: If `hopSections.top` or `hopSections.bottom` is null, don't render button for that section
2. **Single node in section**: Still show collapse button, collapsed shows "(1)"
3. **Filter interaction**: If nodes are hidden by lifespan filter, don't count them in collapsed count

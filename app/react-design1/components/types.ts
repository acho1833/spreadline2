// ============================================
// SpreadLine TypeScript Type Definitions
// ============================================

/**
 * Represents a point/node in a block at a specific timestep
 */
export interface Point {
  id: number;
  name: string;
  label: string;         // Citation count or attribute value
  posX: number;          // X position
  posY: number;          // Y position
  scaleX: number;        // PCA-derived X scale (0-1)
  scaleY: number;        // PCA-derived Y scale (0-1)
  group: number;         // Block ID this point belongs to
  visibility: 'visible' | 'hidden';
}

/**
 * Represents a block (session) at a specific timestep
 */
export interface Block {
  id: number;
  time: string;          // Time label (year, date, etc.)
  moveX: number;         // Width to expand when opened
  names: string[];       // Entity names in this block
  topPosY: number;       // Top Y position of the block
  points: Point[];       // Points within this block
  relations: [number, number][]; // Connections between points
  outline: {
    left: string;        // SVG path for left arc
    right: string;       // SVG path for right arc
    top: string;         // SVG path for top bar
    bottom: string;      // SVG path for bottom bar
  };
}

/**
 * Represents a storyline (entity's path through time)
 */
export interface Storyline {
  id: number;
  name: string;
  color: string;         // Line color
  crossingCheck: boolean; // Whether this line crosses the ego
  lifespan: number;      // Number of timesteps active
  lines: string[];       // SVG path strings for each segment
  marks: Mark[];         // Triangle markers at segment ends
  label: StorylineLabel;
  inlineLabels: InlineLabel[];
}

export interface Mark {
  name: string;
  posX: number;
  posY: number;
  size: number;
  visibility: 'visible' | 'hidden';
}

export interface StorylineLabel {
  label: string;
  line: string;          // SVG path for label connector
  posX: number;
  posY: number;
  textAlign: string;
  visibility: 'visible' | 'hidden';
}

export interface InlineLabel {
  name: string;
  posX: number;
  posY: number;
}

/**
 * Time label on the axis
 */
export interface TimeLabel {
  label: string;
  posX: number;
}

/**
 * Annotation at a specific time
 */
export interface Annotation {
  time: string;
  text: string;
  color: string;
}

/**
 * Main SpreadLine data structure
 */
export interface SpreadLineData {
  bandWidth: number;
  blockWidth: number;
  blocks: Block[];
  storylines: Storyline[];
  timeLabels: TimeLabel[];
  heightExtents: [number, number];
  ego: string;           // Name of the central entity
  mode?: string;
}

/**
 * Legend configuration
 */
export interface LegendConfig {
  line: {
    domain: string[];
    range: string[];
    offset: number[];
  };
  node: {
    scale: (value: number) => string;
    title: string;
    domain: number[];
    range: string[];
  };
}

/**
 * Background configuration
 */
export interface BackgroundConfig {
  direction: [string, string];
  directionFontSize: string;
  timeLabelFormat: (d: string) => string;
  annotations: Annotation[];
  sliderTitle: string;
}

/**
 * SpreadLine configuration
 */
export interface SpreadLineConfig {
  legend: LegendConfig;
  background: BackgroundConfig;
  tooltip: {
    showPointTooltip: boolean;
    showLinkTooltip: boolean;
  };
}

// ============================================
// Component Props Types
// ============================================

export interface TimeAxisProps {
  timeLabels: TimeLabel[];
  heightExtent: number;
  getShiftX: (posX: number) => number;
  annotations?: Annotation[];
}

export interface StorylineProps {
  storyline: Storyline;
  isEgo: boolean;
  isHighlighted: boolean;
  isFiltered: boolean;
  isPinned: boolean;
  getShiftX: (posX: number) => number;
  onHover: (name: string | null) => void;
  onPin: (name: string) => void;
}

export interface BlockProps {
  block: Block;
  timeLabel: TimeLabel;
  blockWidth: number;
  isExpanded: boolean;
  animProgress: number;
  filteredNames: Set<string>;
  isHighlighted: (name: string) => boolean;
  getShiftX: (posX: number) => number;
  onToggleExpand: () => void;
  onHover: (name: string | null) => void;
  onPin: (name: string) => void;
  ego: string;
}

export interface NodePointProps {
  point: Point;
  cx: number;
  cy: number;
  isEgo: boolean;
  isHighlighted: boolean;
  isFiltered: boolean;
  showLabel?: boolean;
  onHover: (name: string | null, e?: React.MouseEvent) => void;
  onPin: (name: string) => void;
}

export interface LegendProps {
  lineConfig: LegendConfig['line'];
  nodeConfig: LegendConfig['node'];
}

export interface FilterControlsProps {
  minLifespan: number;
  maxLifespan: number;
  crossingOnly: boolean;
  onLifespanChange: (value: number) => void;
  onCrossingChange: (value: boolean) => void;
  filteredCount: number;
  totalCount: number;
}

export interface TooltipProps {
  x: number;
  y: number;
  name: string;
  label: string;
}

// ============================================
// Utility Types
// ============================================

export type InteractionMode = 'hover' | 'pin' | 'expand' | 'filter';

export interface AnimationState {
  [blockId: number]: number; // 0 to 1 progress
}

// ============================================
// Helper Functions (can be imported by components)
// ============================================

/**
 * Compute embedding position for PCA-based point positioning
 */
export const computeEmbedding = (scale: number, length: number): number => {
  const whiteSpace = 0.15;
  return (scale + whiteSpace / 2) * length * (1 - whiteSpace);
};

/**
 * Get node color based on citation/label value
 */
export const getNodeColor = (label: number, thresholds = [10, 50, 100, 500]): string => {
  const colors = ['#ffffff', '#fcdaca', '#e599a6', '#c94b77', '#740980'];
  for (let i = 0; i < thresholds.length; i++) {
    if (label < thresholds[i]) return colors[i];
  }
  return colors[colors.length - 1];
};

/**
 * Easing function for smooth animations
 */
export const easeOutQuad = (t: number): number => t * (2 - t);

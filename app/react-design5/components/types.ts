// ============================================
// SpreadLine TypeScript Type Definitions
// ============================================

/**
 * Represents a point/node in a block at a specific timestep
 */
export interface Point {
  id: number;
  name: string;
  label: string;
  posX: number;
  posY: number;
  scaleX: number;
  scaleY: number;
  group: number;
  visibility: 'visible' | 'hidden';
}

/**
 * Represents a block (session) at a specific timestep
 */
export interface Block {
  id: number;
  time: string;
  moveX: number;
  names: string[];
  topPosY: number;
  points: Point[];
  relations: [number, number][];
  outline: {
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
}

/**
 * Represents a storyline (entity's path through time)
 */
export interface Storyline {
  id: number;
  name: string;
  color: string;
  crossingCheck: boolean;
  lifespan: number;
  lines: string[];
  marks: Mark[];
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
  line: string;
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

export interface TimeLabel {
  label: string;
  posX: number;
}

export interface SpreadLineData {
  bandWidth: number;
  blockWidth: number;
  blocks: Block[];
  storylines: Storyline[];
  timeLabels: TimeLabel[];
  heightExtents: [number, number];
  ego: string;
  mode?: string;
}

// ============================================
// Helper Functions
// ============================================

export const computeEmbedding = (scale: number, length: number): number => {
  const whiteSpace = 0.15;
  return (scale + whiteSpace / 2) * length * (1 - whiteSpace);
};

export const getNodeColor = (label: number, thresholds = [10, 50, 100, 500]): string => {
  const colors = ['#ffffff', '#fcdaca', '#e599a6', '#c94b77', '#740980'];
  for (let i = 0; i < thresholds.length; i++) {
    if (label < thresholds[i]) return colors[i];
  }
  return colors[colors.length - 1];
};

export const easeOutQuad = (t: number): number => t * (2 - t);

/**
 * Parse an SVG path to extract the starting X coordinate
 */
export const getPathStartX = (pathD: string): number => {
  const match = pathD.match(/M\s*([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
};

/**
 * Parse an SVG path to extract the ending X coordinate
 */
export const getPathEndX = (pathD: string): number => {
  // Match the last number pair in the path (could be after L, C, Q, etc.)
  const parts = pathD.split(/[MLCQZ\s,]+/).filter(Boolean);
  // Get second to last number (x coordinate of last point)
  return parts.length >= 2 ? parseFloat(parts[parts.length - 2]) : 0;
};

/**
 * Parse an SVG path to extract the ending Y coordinate
 */
export const getPathEndY = (pathD: string): number => {
  const parts = pathD.split(/[MLCQZ\s,]+/).filter(Boolean);
  return parts.length >= 1 ? parseFloat(parts[parts.length - 1]) : 0;
};

/**
 * Parse an SVG path to extract the starting Y coordinate
 */
export const getPathStartY = (pathD: string): number => {
  const match = pathD.match(/M\s*[\d.]+[,\s]+([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
};

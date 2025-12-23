/**
 * Output Data Types
 * Types for the SpreadLine visualization data sent to the frontend
 */

/**
 * Point in a block - represents an entity at a specific position
 */
export interface Point {
  id: number;
  name: string;
  label: string | number;
  posX: number;
  posY: number;
  scaleX: number;
  scaleY: number;
  group: number;
  aggregateGroup: number;
  visibility: 'visible' | 'hidden';
}

/**
 * Block outline - SVG paths for the pill-shaped block
 */
export interface BlockOutline {
  left: string;
  right: string;
  top: string;
  bottom: string;
  button: {
    width: number;
    height: number;
    posX: number;
    posY: number;
  };
}

/**
 * Block - represents a contact session at a specific timestamp
 */
export interface Block {
  id: number;
  time: string;
  moveX: number;
  names: string[];
  topPosY: number;
  points: Point[];
  relations: [number, number][];
  outline: BlockOutline;
}

/**
 * Mark - entry/exit triangle marker for storylines
 */
export interface Mark {
  name: string;
  posX: number;
  posY: number;
  size: number;
  visibility: 'visible' | 'hidden';
}

/**
 * Storyline label - label positioning and text
 */
export interface StorylineLabel {
  posX: number;
  posY: number;
  textAlign: 'start' | 'end';
  line: string;
  label: string;
  visibility: 'visible' | 'hidden';
}

/**
 * Inline label - label placed on long straight segments
 */
export interface InlineLabel {
  name: string;
  posX: number;
  posY: number;
}

/**
 * Storyline - represents an entity's path through time
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

/**
 * Time label - X-axis label
 */
export interface TimeLabel {
  label: string;
  posX: number;
}

/**
 * SpreadLineData - Complete visualization output
 * This is what gets sent to the frontend via the API
 */
export interface SpreadLineData {
  bandWidth: number;
  blockWidth: number;
  ego: string;
  timeLabels: TimeLabel[];
  storylines: Storyline[];
  blocks: Block[];
  heightExtents: [number, number];
  mode?: string;
  reference?: Record<string, unknown>[];
}

/**
 * Render result from the rendering pipeline
 */
export interface RenderResult {
  bandWidth: number;
  blockWidth: number;
  ego: string;
  timeLabels: TimeLabel[];
  storylines: Storyline[];
  blocks: Block[];
  heightExtents: [number, number];
}

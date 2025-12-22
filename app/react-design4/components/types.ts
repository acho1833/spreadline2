// SpreadLine Type Definitions

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

// Helper Functions
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

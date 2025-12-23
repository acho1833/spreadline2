/**
 * SpreadLine Backend - Barrel Export
 */

// Core types
export { Path, Node, Entity, Session } from './types/core';

// Input types
export type {
  TopologyRow,
  EntityRow,
  CitationRow,
  NodeColorRow,
  LineColorRow,
  ContentRow,
  TopologyConfig,
  ContentConfig,
  NodeColorConfig,
  LineColorConfig,
  SpreadLineConfig,
  GroupsDict,
} from './types/input';

// Output types
export type {
  Point,
  Block,
  BlockOutline,
  Mark,
  Storyline,
  StorylineLabel,
  InlineLabel,
  TimeLabel,
  SpreadLineData,
  RenderResult,
} from './types/output';

// Utilities
export {
  strToDatetime,
  datetimeToStr,
  getTimeArray,
  compareDates,
  isBetween,
  isBetweenStr,
} from './utils/datetime';

export {
  filterTimeByEgo,
  constructEgocentricNetwork,
  findWithinConstraints,
  sparseArgsort,
  create2DArray,
  uniquePreserveOrder,
  findIndices,
  isIn,
  countIntersection,
} from './utils/constructors';

// Pipeline
export { ordering } from './pipeline/order';
export { aligning } from './pipeline/align';
export { compacting } from './pipeline/compact';
export { rendering } from './pipeline/render';

// Main class
export { SpreadLine, createSpreadLine } from './spreadline';

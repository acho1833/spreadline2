/**
 * Input Data Types
 * Types for CSV data that gets loaded into the SpreadLine pipeline
 */

/**
 * Topology row - Network edges
 * Example: { source: "Jeffrey Heer", target: "Maneesh Agrawala", time: "2005", weight: 1 }
 */
export interface TopologyRow {
  source: string;
  target: string;
  time: string | Date;
  weight: number;
  // Additional optional fields from the original data
  id?: string;
  type?: string;
  citationcount?: number;
  count?: number;
}

/**
 * Entity row - Per-entity metadata with affiliations
 * Example: { name: "Jeffrey Heer", year: "2005", citationcount: 500, affiliation: "Stanford University" }
 */
export interface EntityRow {
  name: string;
  year: string | number;
  citationcount: number;
  affiliation: string;
}

/**
 * Citation row - Citation data for papers
 */
export interface CitationRow {
  name: string;
  year: string | number;
  citationcount: number;
  affiliation: string;
  paperID: string;
}

/**
 * Node color row - Context for node coloring
 * Example: { time: "2005", entity: "Jeffrey Heer", context: 500 }
 */
export interface NodeColorRow {
  time: string;
  entity: string;
  context: string | number;
}

/**
 * Line color row - Color assignment for storylines
 * Example: { entity: "Jeffrey Heer", color: "#FA9902" }
 */
export interface LineColorRow {
  entity: string;
  color: string;
}

/**
 * Content/Layout row - Position data for contextual layout
 * Example: { id: "Jeffrey Heer", timestamp: "2005", posX: 0.5, posY: 0.3 }
 */
export interface ContentRow {
  id: string;
  timestamp?: string;
  posX: number;
  posY: number;
}

/**
 * Configuration for loading topology data
 */
export interface TopologyConfig {
  source: string;
  target: string;
  time: string;
  weight: string;
}

/**
 * Configuration for loading content/layout data
 */
export interface ContentConfig {
  timestamp: string;
  id: string;
  posX: string;
  posY: string;
}

/**
 * Configuration for loading node color data
 */
export interface NodeColorConfig {
  time: string;
  entity: string;
  context: string;
}

/**
 * Configuration for loading line color data
 */
export interface LineColorConfig {
  entity: string;
  color: string;
}

/**
 * SpreadLine configuration options
 */
export interface SpreadLineConfig {
  bandStretch: [string, string][];
  squeezeSameCategory: boolean;
  minimize: 'space' | 'wiggles';
}

/**
 * Groups dictionary - pre-defined ordering for each timestamp
 */
export type GroupsDict = Record<string, string[][]>;

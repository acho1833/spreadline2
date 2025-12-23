/**
 * SpreadLine Views / Data Processing
 * Converted from Python: demo/backend/views.py
 *
 * Contains functions to load and process data for visualization.
 */

import { SpreadLine } from './spreadline';
import { RenderOutput } from './types';
import { constructEgoNetworks, remapJHAffiliation } from './constructors';

// Import data directly - these will be read from the case-studies directory
import path from 'path';
import fs from 'fs';

interface RelationRow {
  year: string | number;
  source: string;
  target: string;
  id: string;
  type?: string;
  citationcount?: number;
  count?: number;
}

interface EntityRow {
  name: string;
  year: string | number;
  citationcount?: number;
  affiliation?: string;
}

interface CitationRow {
  name: string;
  year: string | number;
  citationcount: number;
  affiliation?: string;
  paperID: string;
}

interface ContentRow {
  year: string | number;
  name: string;
  posX: number;
  posY: number;
}

/**
 * Parse CSV string to array of objects
 */
function parseCSV<T>(csvString: string): T[] {
  const lines = csvString.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const result: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const obj: any = {};
    for (let j = 0; j < headers.length; j++) {
      let value: any = values[j] || '';
      // Try to parse as number
      if (value !== '' && !isNaN(Number(value))) {
        value = Number(value);
      }
      obj[headers[j]] = value;
    }
    result.push(obj as T);
  }

  return result;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

/**
 * Get affiliations for an author at a given year
 */
function getAffiliations(
  allEntities: EntityRow[],
  author: string,
  year: string,
  affiliationRemap: (aff: string | undefined) => string
): string[] {
  return allEntities
    .filter(e => e.name === author && String(e.year) === year)
    .map(e => affiliationRemap(e.affiliation))
    .filter((v, i, a) => a.indexOf(v) === i); // unique
}

/**
 * Construct author network with color and group assignments
 * Python equivalent: _construct_author_network
 */
export function constructAuthorNetwork(
  ego: string,
  affiliationRemap: (aff: string | undefined) => string,
  relationsData: RelationRow[],
  entitiesData: EntityRow[],
  times: string[] = []
): [any[], Array<{ entity: string; color: string }>, Record<string, string[][]>] {
  const INTERNAL_COLOR = '#FA9902';
  const EXTERNAL_COLOR = '#166b6b';

  let relations = relationsData.map(r => ({ ...r, year: String(r.year) }));
  let allEntities = entitiesData.map(e => ({ ...e, year: String(e.year) }));

  if (times.length > 0) {
    allEntities = allEntities.filter(e => times.includes(String(e.year)));
    relations = relations.filter(r => times.includes(String(r.year)));
  }

  // Get ego's status by year
  const egoStatus: Record<string, string> = {};
  const egoEntries = allEntities
    .filter(e => e.name === ego)
    .map(e => ({ affiliation: affiliationRemap(e.affiliation), year: String(e.year) }));

  // Deduplicate
  const seen = new Set<string>();
  for (const entry of egoEntries) {
    const key = `${entry.year}`;
    if (!seen.has(key)) {
      seen.add(key);
      egoStatus[entry.year] = entry.affiliation;
    }
  }

  const years = Object.keys(egoStatus);
  relations = relations.filter(r => years.includes(String(r.year)));

  // Construct ego network
  let network = constructEgoNetworks(relations, ego, 2, 'year', 'source', 'target');

  // Remove papers where ego wasn't involved
  const paperGroups = new Map<string, typeof network>();
  for (const row of network) {
    const id = String(row.id);
    if (!paperGroups.has(id)) paperGroups.set(id, []);
    paperGroups.get(id)!.push(row);
  }

  for (const [paperId, group] of paperGroups) {
    const nodes = new Set<string>();
    for (const row of group) {
      nodes.add(row.source);
      nodes.add(row.target);
    }
    if (!nodes.has(ego)) {
      network = network.filter(r => String(r.id) !== paperId);
    }
  }

  // Build color and group assignments
  const colorAssign: Record<string, Record<string, string>> = {};
  const groupAssign: Record<string, Set<string>[]> = {};
  const finalGroupAssign: Record<string, string[][]> = {};

  for (let idx = 0; idx < network.length; idx++) {
    const row = network[idx];
    const firstAuthor = row.source;
    const author = row.target;
    const year = String(row.year);
    const egoAffiliations = getAffiliations(allEntities, ego, year, affiliationRemap);

    // Initialize groups: [external-non-first, external-first, ego, internal-first, internal-non-first]
    if (!groupAssign[year]) {
      groupAssign[year] = [new Set(), new Set(), new Set([ego]), new Set(), new Set()];
    }
    if (!colorAssign[year]) colorAssign[year] = {};

    if (author === ego) {
      // Ego is non-first author
      const affiliations = getAffiliations(allEntities, firstAuthor, year, affiliationRemap);
      const intersection = affiliations.filter(a => egoAffiliations.includes(a));
      const color = intersection.length > 0 ? INTERNAL_COLOR : EXTERNAL_COLOR;

      if (intersection.length > 0) {
        groupAssign[year][3].add(firstAuthor);
      } else {
        groupAssign[year][1].add(firstAuthor);
      }

      if (!colorAssign[year][firstAuthor]) {
        colorAssign[year][firstAuthor] = color;
      }
    } else {
      // Ego is first author or this is about others
      const affiliations = getAffiliations(allEntities, author, year, affiliationRemap);
      const intersection = affiliations.filter(a => egoAffiliations.includes(a));
      const color = intersection.length > 0 ? INTERNAL_COLOR : EXTERNAL_COLOR;

      if (color === INTERNAL_COLOR) {
        groupAssign[year][4].add(author);
      } else {
        groupAssign[year][0].add(author);
      }

      if (!colorAssign[year][author]) {
        colorAssign[year][author] = color;
      }
    }

    // Calculate count (unique paper IDs)
    const collabRows = network.filter(r => r.source === author || r.target === author);
    const uniquePaperIds = new Set(collabRows.map(r => r.id));
    (network[idx] as any).count = uniquePaperIds.size;
  }

  // Handle overlaps between groups and sort
  for (const [key, groups] of Object.entries(groupAssign)) {
    const groupArrays = groups;

    // Check for overlaps between pairs
    const pairs: [number, number][] = [];
    for (let i = 0; i < groupArrays.length; i++) {
      for (let j = i + 1; j < groupArrays.length; j++) {
        if (i !== 2 && j !== 2) { // Skip ego group
          pairs.push([i, j]);
        }
      }
    }

    for (const [firstIdx, secondIdx] of pairs) {
      const first = groupArrays[firstIdx];
      const second = groupArrays[secondIdx];
      const intersection = [...first].filter(x => second.has(x));
      if (intersection.length > 0) {
        if ([0, 4].includes(firstIdx)) {
          for (const item of intersection) first.delete(item);
        } else if ([0, 4].includes(secondIdx)) {
          for (const item of intersection) second.delete(item);
        }
      }
    }

    // Convert sets to sorted arrays
    const newGroups: string[][] = [];
    for (let idx = 0; idx < groupArrays.length; idx++) {
      const group = groupArrays[idx];
      if (group.size <= 1) {
        newGroups.push([...group]);
        continue;
      }

      let newGroup = [...group];
      const toBeReverse = ![0, 1].includes(idx);

      // Sort by number of unique papers, then by name for deterministic ordering
      newGroup.sort((a, b) => {
        const aRows = network.filter(r => r.source === a || r.target === a);
        const bRows = network.filter(r => r.source === b || r.target === b);
        const aCount = new Set(aRows.map(r => r.id)).size;
        const bCount = new Set(bRows.map(r => r.id)).size;
        if (aCount !== bCount) {
          return toBeReverse ? bCount - aCount : aCount - bCount;
        }
        // Secondary sort by name for deterministic ordering
        return toBeReverse ? b.localeCompare(a) : a.localeCompare(b);
      });

      newGroups.push(newGroup);
    }
    finalGroupAssign[key] = newGroups;
  }

  // Build line color frames
  const entities = new Set<string>();
  for (const row of network) {
    entities.add(row.source);
    entities.add(row.target);
  }

  const frames: Array<{ entity: string; color: string }> = [];
  const uniqueYears = [...new Set(network.map(r => String(r.year)))];

  for (const entity of entities) {
    for (const year of uniqueYears) {
      const color = colorAssign[year]?.[entity];
      if (color) {
        frames.push({ entity, color });
        break;
      }
    }
  }

  return [network, frames, finalGroupAssign];
}

/**
 * Compute Jeffrey Heer SpreadLine visualization
 * Python equivalent: computeJHSpreadLine
 */
export function computeJHSpreadLine(
  relationsData: RelationRow[],
  entitiesData: EntityRow[],
  citationsData: CitationRow[],
  contentData: ContentRow[],
  referenceData: any[]
): RenderOutput & { mode: string; reference: any[] } {
  const spreadLiner = new SpreadLine();
  const ego = "Jeffrey Heer";

  // Construct author network
  const [network, lineColor, groups] = constructAuthorNetwork(
    ego,
    remapJHAffiliation,
    relationsData,
    entitiesData
  );

  // Load topology
  spreadLiner.load(network, {
    source: 'source',
    target: 'target',
    time: 'year',
    weight: 'count'
  }, 'topology');

  // Load line colors
  spreadLiner.load(lineColor, {
    entity: 'entity',
    color: 'color'
  }, 'line');

  // Build node content from citations
  const papers = [...new Set(network.map(r => r.id))];
  const nodeFrames: Array<{ entity: string; time: string; context: number }> = [];

  for (const paper of papers) {
    const group = citationsData.filter(c => c.paperID === paper);
    for (const row of group) {
      nodeFrames.push({
        entity: row.name,
        time: String(row.year),
        context: row.citationcount
      });
    }
  }

  // Aggregate by entity and time
  const aggregated = new Map<string, number>();
  for (const frame of nodeFrames) {
    const key = `${frame.entity},${frame.time}`;
    aggregated.set(key, (aggregated.get(key) || 0) + frame.context);
  }

  const nodeContent = [...aggregated.entries()].map(([key, context]) => {
    const [entity, time] = key.split(',');
    return { entity, time, context };
  });

  spreadLiner.load(nodeContent, {
    time: 'time',
    entity: 'entity',
    context: 'context'
  }, 'node');

  // Load content layout
  spreadLiner.load(contentData.map(c => ({
    ...c,
    year: String(c.year)
  })), {
    timestamp: 'year',
    id: 'name',
    posX: 'posX',
    posY: 'posY'
  }, 'content');

  // Center on ego
  spreadLiner.center(ego, null, 'year', '%Y', groups);

  // Configure
  spreadLiner.configure({
    squeezeSameCategory: true,
    minimize: 'wiggles'
  });

  // Fit
  const result = spreadLiner.fit(2800, 1000);

  return {
    ...result,
    mode: 'author',
    reference: referenceData
  };
}

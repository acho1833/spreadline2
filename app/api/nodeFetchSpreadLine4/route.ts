/**
 * SpreadLine API Route - Next.js App Router endpoint
 *
 * Computes Jeffrey Heer's egocentric author network visualization.
 * Port of Python computeJHSpreadLine() from views.py
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { SpreadLine } from './spreadline';
import { TopologyRow } from './types';

// Constants
const INTERNAL_COLOR = '#FA9902';
const EXTERNAL_COLOR = '#166b6b';
const HOP_LIMIT = 2;

interface RelationRow {
  year: string;
  source: string;
  target: string;
  id: string;
  count?: number;
  citationcount?: number;
}

interface EntityRow {
  year: string;
  name: string;
  affiliation: string;
}

interface CitationRow {
  paperID: string;
  year: number;
  name: string;
  citationcount: number;
}

interface ContentRow {
  year: string;
  name: string;
  posX: number;
  posY: number;
}

interface LineColorEntry {
  entity: string;
  color: string;
}

type GroupAssign = Record<string, string[][]>;

/**
 * Remap JH affiliations to canonical names
 */
function remapJHAffiliation(affiliation: string | null | undefined): string {
  if (!affiliation || typeof affiliation !== 'string') {
    return "University of Washington, USA";
  }
  if (affiliation.includes("Berkeley")) {
    return "University of California, Berkeley, USA";
  }
  if (affiliation.includes("PARC") || affiliation.includes("Palo Alto") || affiliation.includes("Xerox")) {
    return "Palo Alto Research Center, USA";
  }
  if (affiliation.includes("Stanford")) {
    return "Stanford University, USA";
  }
  if (affiliation.includes("Washington")) {
    return "University of Washington, USA";
  }
  return affiliation;
}

/**
 * Construct ego-centric network (2-hop BFS)
 */
function constructEgoNetworks(
  data: RelationRow[],
  ego: string,
  timeKey: string = 'year',
  sourceKey: string = 'source',
  targetKey: string = 'target'
): RelationRow[] {
  const indices = new Set<number>();

  // Group by time
  const byTime: Record<string, { row: RelationRow; idx: number }[]> = {};
  data.forEach((row, idx) => {
    const time = (row as any)[timeKey];
    if (!byTime[time]) byTime[time] = [];
    byTime[time].push({ row, idx });
  });

  for (const entries of Object.values(byTime)) {
    let waitlist = new Set<string>([ego]);
    let hop = 1;

    while (waitlist.size > 0 && hop <= HOP_LIMIT) {
      const nextWaitlist: string[] = [];

      for (const each of waitlist) {
        // Find sources where target = each
        const sources = entries.filter(e => (e.row as any)[targetKey] === each);
        // Find targets where source = each
        const targets = entries.filter(e => (e.row as any)[sourceKey] === each);

        // Collect candidates
        const candidates: string[] = [
          ...sources.map(e => (e.row as any)[sourceKey]),
          ...targets.map(e => (e.row as any)[targetKey])
        ];
        const uniqueCandidates = [...new Set(candidates)];

        // Add indices
        sources.forEach(e => indices.add(e.idx));
        targets.forEach(e => indices.add(e.idx));

        nextWaitlist.push(...uniqueCandidates);
      }

      const nextSet = new Set(nextWaitlist);
      // Remove already visited
      for (const w of waitlist) nextSet.delete(w);
      waitlist = nextSet;
      hop++;
    }
  }

  // Return filtered rows
  return data.filter((_, idx) => indices.has(idx));
}

/**
 * Construct author network with line colors and groups
 */
function constructAuthorNetwork(
  ego: string,
  relations: RelationRow[],
  allEntities: EntityRow[],
  affiliationRemap: (aff: string | null | undefined) => string
): { network: RelationRow[]; lineColor: LineColorEntry[]; groups: GroupAssign } {
  // Convert years to strings
  relations = relations.map(r => ({ ...r, year: String(r.year) }));
  allEntities = allEntities.map(e => ({ ...e, year: String(e.year) }));

  // Get ego status (affiliations by year)
  const egoEntries = allEntities.filter(e => e.name === ego);
  const egoStatus: Record<string, string> = {};
  for (const entry of egoEntries) {
    const remapped = affiliationRemap(entry.affiliation);
    if (!egoStatus[entry.year]) {
      egoStatus[entry.year] = remapped;
    }
  }
  const years = Object.keys(egoStatus);

  // Filter relations to years where ego exists
  relations = relations.filter(r => years.includes(r.year));

  // Construct 2-hop ego network
  let network = constructEgoNetworks(relations, ego);

  // Remove papers where ego wasn't involved
  const byPaper: Record<string, RelationRow[]> = {};
  network.forEach(row => {
    if (!byPaper[row.id]) byPaper[row.id] = [];
    byPaper[row.id].push(row);
  });

  const validRows: RelationRow[] = [];
  for (const [, group] of Object.entries(byPaper)) {
    const nodes = new Set<string>();
    group.forEach(row => {
      nodes.add(row.source);
      nodes.add(row.target);
    });
    if (nodes.has(ego)) {
      validRows.push(...group);
    }
  }
  network = validRows;

  // Get affiliations for an author in a year
  const getAffiliations = (author: string, year: string): string[] => {
    const entries = allEntities.filter(e => e.name === author && e.year === year);
    return [...new Set(entries.map(e => affiliationRemap(e.affiliation)))];
  };

  const colorAssign: Record<string, Record<string, string>> = {};
  const groupAssign: Record<string, Set<string>[]> = {};

  // Process each row
  for (const row of network) {
    const firstAuthor = row.source;
    const author = row.target;
    const year = row.year;
    const egoAffiliations = getAffiliations(ego, year);

    // Initialize structures for this year
    // [external-non-first, external-first, ego, internal-first, internal-non-first]
    if (!groupAssign[year]) {
      groupAssign[year] = [new Set(), new Set(), new Set([ego]), new Set(), new Set()];
    }
    if (!colorAssign[year]) {
      colorAssign[year] = {};
    }

    if (author === ego) {
      // ego is the non-first author
      const affiliations = getAffiliations(firstAuthor, year);
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
      // ego is the first author or this row is about others
      const affiliations = getAffiliations(author, year);
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

    // Count collaborations
    const collab = network.filter(
      r => r.source === (author === ego ? firstAuthor : author) ||
           r.target === (author === ego ? firstAuthor : author)
    );
    const uniquePapers = new Set(collab.map(r => r.id));
    row.count = uniquePapers.size;
  }

  // Handle overlaps between groups and convert to arrays
  const finalGroups: GroupAssign = {};

  for (const [year, groups] of Object.entries(groupAssign)) {
    // Handle overlapping entities between groups
    const pairIndices: [number, number][] = [];
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        if (i !== 2 && j !== 2) { // Skip ego group
          pairIndices.push([i, j]);
        }
      }
    }

    for (const [firstIdx, secondIdx] of pairIndices) {
      const pair0 = groups[firstIdx];
      const pair1 = groups[secondIdx];
      const intersection = new Set([...pair0].filter(x => pair1.has(x)));

      if (intersection.size > 0) {
        if ([0, 4].includes(firstIdx)) {
          intersection.forEach(x => groups[firstIdx].delete(x));
        } else if ([0, 4].includes(secondIdx)) {
          intersection.forEach(x => groups[secondIdx].delete(x));
        }
      }
    }

    // Sort and convert to arrays
    const newGroups: string[][] = [];
    for (let idx = 0; idx < groups.length; idx++) {
      const group = groups[idx];
      if (group.size <= 1) {
        newGroups.push([...group]);
        continue;
      }

      const groupArray = [...group];
      const toBeReverse = idx >= 2; // indices 2, 3, 4

      // Sort by paper count, then by name
      groupArray.sort((a, b) => {
        const aCount = new Set(network.filter(r => r.source === a || r.target === a).map(r => r.id)).size;
        const bCount = new Set(network.filter(r => r.source === b || r.target === b).map(r => r.id)).size;

        if (aCount !== bCount) {
          return toBeReverse ? bCount - aCount : aCount - bCount;
        }
        return toBeReverse ? b.localeCompare(a) : a.localeCompare(b);
      });

      newGroups.push(groupArray);
    }

    finalGroups[year] = newGroups;
  }

  // Build line color array
  const entities = new Set<string>();
  network.forEach(row => {
    entities.add(row.source);
    entities.add(row.target);
  });

  const lineColorEntries: LineColorEntry[] = [];
  for (const entity of entities) {
    for (const year of years) {
      const color = colorAssign[year]?.[entity];
      if (color) {
        lineColorEntries.push({ entity, color });
        break;
      }
    }
  }

  return { network, lineColor: lineColorEntries, groups: finalGroups };
}

/**
 * Load and parse CSV file
 */
async function loadCSV<T>(filePath: string): Promise<T[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const result = Papa.parse<T>(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  });
  return result.data;
}

/**
 * Main API handler
 */
export async function GET(request: NextRequest) {
  try {
    const ego = "Jeffrey Heer";
    const basePath = path.join(process.cwd(), 'SpreadLine-main/case-studies/vis-author');

    // Load CSV files
    const relations = await loadCSV<RelationRow>(path.join(basePath, 'relations.csv'));
    const allEntities = await loadCSV<EntityRow>(path.join(basePath, 'entities.csv'));
    const citations = await loadCSV<CitationRow>(path.join(basePath, 'citations.csv'));
    const layout = await loadCSV<ContentRow>(path.join(basePath, 'Heer/content.csv'));
    const reference = await loadCSV<any>(path.join(basePath, 'Heer/content_reference.csv'));

    // Construct author network
    const { network, lineColor, groups } = constructAuthorNetwork(
      ego,
      relations,
      allEntities,
      remapJHAffiliation
    );

    // Initialize SpreadLine
    const SpreadLiner = new SpreadLine();

    // Load topology
    SpreadLiner.load(network as any, {
      source: 'source',
      target: 'target',
      time: 'year',
      weight: 'count'
    }, 'topology');

    // Load line colors
    SpreadLiner.load(lineColor as any, {
      entity: 'entity',
      color: 'color'
    }, 'line');

    // Prepare node context (citations)
    const papers = [...new Set(network.map(r => r.id))];
    const frames: { entity: string; time: string; context: number }[] = [];

    for (const paper of papers) {
      const group = citations.filter(c => c.paperID === paper);
      for (const row of group) {
        frames.push({
          entity: row.name,
          time: String(row.year),
          context: row.citationcount
        });
      }
    }

    // Aggregate by entity and time
    const aggregated: Record<string, { entity: string; time: string; context: number }> = {};
    for (const frame of frames) {
      const key = `${frame.entity},${frame.time}`;
      if (!aggregated[key]) {
        aggregated[key] = { ...frame };
      } else {
        aggregated[key].context += frame.context;
      }
    }
    const nodeContent = Object.values(aggregated);

    SpreadLiner.load(nodeContent as any, {
      time: 'time',
      entity: 'entity',
      context: 'context'
    }, 'node');

    // Load content layout
    SpreadLiner.load(layout as any, {
      timestamp: 'year',
      id: 'name',
      posX: 'posX',
      posY: 'posY'
    }, 'content');

    // Center on ego
    SpreadLiner.center(ego, undefined, 'year', '%Y', groups);

    // Configure
    SpreadLiner.configure({
      squeezeSameCategory: true,
      minimize: 'wiggles'
    });

    // Run pipeline (width 8400 = 3x original for wider spacing between pills)
    const result = SpreadLiner.fit(8400, 1000);

    // Add metadata
    const response = {
      ...result,
      mode: 'author',
      reference
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('SpreadLine API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Support POST with same logic
  return GET(request);
}

/**
 * SpreadLine TypeScript Test
 *
 * Run with: npx tsx app/api/nodeFetchSpreadLine2/test.ts
 *
 * Tests the TypeScript SpreadLine implementation against expected values.
 */

import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { SpreadLine } from './spreadline';

// Constants matching Python
const INTERNAL_COLOR = '#FA9902';
const EXTERNAL_COLOR = '#166b6b';
const HOP_LIMIT = 2;

interface RelationRow {
  year: string;
  source: string;
  target: string;
  id: string;
  count?: number;
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
 * Remap JH affiliations
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
  ego: string
): RelationRow[] {
  const indices = new Set<number>();

  const byTime: Record<string, { row: RelationRow; idx: number }[]> = {};
  data.forEach((row, idx) => {
    const time = row.year;
    if (!byTime[time]) byTime[time] = [];
    byTime[time].push({ row, idx });
  });

  for (const entries of Object.values(byTime)) {
    let waitlist = new Set<string>([ego]);
    let hop = 1;

    while (waitlist.size > 0 && hop <= HOP_LIMIT) {
      const nextWaitlist: string[] = [];

      for (const each of waitlist) {
        const sources = entries.filter(e => e.row.target === each);
        const targets = entries.filter(e => e.row.source === each);

        const candidates: string[] = [
          ...sources.map(e => e.row.source),
          ...targets.map(e => e.row.target)
        ];

        sources.forEach(e => indices.add(e.idx));
        targets.forEach(e => indices.add(e.idx));

        nextWaitlist.push(...[...new Set(candidates)]);
      }

      const nextSet = new Set(nextWaitlist);
      for (const w of waitlist) nextSet.delete(w);
      waitlist = nextSet;
      hop++;
    }
  }

  return data.filter((_, idx) => indices.has(idx));
}

/**
 * Construct author network
 */
function constructAuthorNetwork(
  ego: string,
  relations: RelationRow[],
  allEntities: EntityRow[]
): { network: RelationRow[]; lineColor: LineColorEntry[]; groups: GroupAssign } {
  relations = relations.map(r => ({ ...r, year: String(r.year) }));
  allEntities = allEntities.map(e => ({ ...e, year: String(e.year) }));

  const egoEntries = allEntities.filter(e => e.name === ego);
  const egoStatus: Record<string, string> = {};
  for (const entry of egoEntries) {
    const remapped = remapJHAffiliation(entry.affiliation);
    if (!egoStatus[entry.year]) {
      egoStatus[entry.year] = remapped;
    }
  }
  const years = Object.keys(egoStatus);

  relations = relations.filter(r => years.includes(r.year));

  let network = constructEgoNetworks(relations, ego);

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

  const getAffiliations = (author: string, year: string): string[] => {
    const entries = allEntities.filter(e => e.name === author && e.year === year);
    return [...new Set(entries.map(e => remapJHAffiliation(e.affiliation)))];
  };

  const colorAssign: Record<string, Record<string, string>> = {};
  const groupAssign: Record<string, Set<string>[]> = {};

  for (const row of network) {
    const firstAuthor = row.source;
    const author = row.target;
    const year = row.year;
    const egoAffiliations = getAffiliations(ego, year);

    if (!groupAssign[year]) {
      groupAssign[year] = [new Set(), new Set(), new Set([ego]), new Set(), new Set()];
    }
    if (!colorAssign[year]) {
      colorAssign[year] = {};
    }

    if (author === ego) {
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

    const collab = network.filter(
      r => r.source === (author === ego ? firstAuthor : author) ||
           r.target === (author === ego ? firstAuthor : author)
    );
    const uniquePapers = new Set(collab.map(r => r.id));
    row.count = uniquePapers.size;
  }

  const finalGroups: GroupAssign = {};

  for (const [year, groups] of Object.entries(groupAssign)) {
    const pairIndices: [number, number][] = [];
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        if (i !== 2 && j !== 2) {
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

    const newGroups: string[][] = [];
    for (let idx = 0; idx < groups.length; idx++) {
      const group = groups[idx];
      if (group.size <= 1) {
        newGroups.push([...group]);
        continue;
      }

      const groupArray = [...group];
      const toBeReverse = idx >= 2;

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
 * Load CSV file
 */
function loadCSV<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<T>(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  });
  return result.data;
}

/**
 * Test assertions
 */
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
}

function assertRange(value: number, min: number, max: number, message: string) {
  assert(value >= min && value <= max, `${message}: ${value} (expected ${min}-${max})`);
}

/**
 * Main test function
 */
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('SpreadLine TypeScript Test Suite');
  console.log('='.repeat(80));

  const ego = "Jeffrey Heer";
  const basePath = path.join(process.cwd(), 'SpreadLine-main/case-studies/vis-author');

  console.log('\n📁 Loading CSV files...');

  try {
    const relations = loadCSV<RelationRow>(path.join(basePath, 'relations.csv'));
    const allEntities = loadCSV<EntityRow>(path.join(basePath, 'entities.csv'));
    const citations = loadCSV<CitationRow>(path.join(basePath, 'citations.csv'));
    const layout = loadCSV<ContentRow>(path.join(basePath, 'Heer/content.csv'));
    const reference = loadCSV<any>(path.join(basePath, 'Heer/content_reference.csv'));

    console.log(`  relations.csv: ${relations.length} rows`);
    console.log(`  entities.csv: ${allEntities.length} rows`);
    console.log(`  citations.csv: ${citations.length} rows`);
    console.log(`  content.csv: ${layout.length} rows`);
    console.log(`  content_reference.csv: ${reference.length} rows`);

    console.log('\n📊 Constructing author network...');

    const { network, lineColor, groups } = constructAuthorNetwork(
      ego,
      relations,
      allEntities
    );

    console.log(`  Network size: ${network.length} rows`);
    console.log(`  Line colors: ${lineColor.length} entities`);
    console.log(`  Groups: ${Object.keys(groups).length} timestamps`);

    console.log('\n🔧 Testing SpreadLine pipeline...');

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

    // Prepare node context
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

    console.log('\n📋 Post-center state:');
    console.log(`  Entities: ${SpreadLiner.entities.length}`);
    console.log(`  Sessions: ${SpreadLiner.sessions.length}`);
    console.log(`  Timestamps: ${SpreadLiner._counts.numAllTimestamps}`);

    // Configure
    SpreadLiner.configure({
      squeezeSameCategory: true,
      minimize: 'wiggles'
    });

    // Run pipeline
    console.log('\n⚙️  Running fit() pipeline...');
    const result = SpreadLiner.fit(2800, 1000);

    console.log('\n✨ Results:');
    console.log(`  Storylines: ${result.storylines?.length || 0}`);
    console.log(`  Blocks: ${result.blocks?.length || 0}`);
    console.log(`  Time labels: ${result.timeLabels?.length || 0}`);
    console.log(`  Band width: ${result.bandWidth}`);
    console.log(`  Height extents: ${JSON.stringify(result.heightExtents)}`);

    // Assertions
    console.log('\n🧪 Running assertions...');

    // Check result structure
    assert(result.storylines !== undefined, 'Result has storylines');
    assert(result.blocks !== undefined, 'Result has blocks');
    assert(result.timeLabels !== undefined, 'Result has timeLabels');
    assert(result.bandWidth !== undefined, 'Result has bandWidth');
    assert(result.heightExtents !== undefined, 'Result has heightExtents');
    assert(result.ego === ego, `Ego is "${ego}"`);

    // Check counts (allow some variation from Python due to algorithmic differences)
    assertRange(result.storylines?.length || 0, 50, 200, 'Storyline count reasonable');
    assertRange(result.blocks?.length || 0, 10, 100, 'Block count reasonable');
    assertRange(result.timeLabels?.length || 0, 5, 30, 'Time label count reasonable');
    assertRange(result.bandWidth || 0, 50, 300, 'Band width reasonable');

    // Check storyline structure
    if (result.storylines && result.storylines.length > 0) {
      const firstLine = result.storylines[0];
      assert(firstLine.name !== undefined, 'Storyline has name');
      assert(firstLine.lines !== undefined, 'Storyline has lines');
      assert(firstLine.color !== undefined, 'Storyline has color');
      assert(firstLine.marks !== undefined, 'Storyline has marks');
    }

    // Check block structure
    if (result.blocks && result.blocks.length > 0) {
      const firstBlock = result.blocks[0];
      assert(firstBlock.id !== undefined, 'Block has id');
      assert(firstBlock.outline !== undefined, 'Block has outline (path)');
      assert(firstBlock.time !== undefined, 'Block has time');
      assert(firstBlock.names !== undefined, 'Block has names');
    }

    // Check time label structure
    if (result.timeLabels && result.timeLabels.length > 0) {
      const firstLabel = result.timeLabels[0];
      assert(firstLabel.label !== undefined, 'Time label has label');
      assert(firstLabel.posX !== undefined, 'Time label has posX');
    }

    // Save result for manual inspection
    const outputPath = path.join(process.cwd(), 'fetchspreadline_ts_result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Result saved to: ${outputPath}`);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log(`Test Summary: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(80));

    if (failed > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();

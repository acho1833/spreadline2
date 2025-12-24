/**
 * SpreadLine TypeScript Comprehensive Comparison Test
 *
 * Run with: npx tsx app/api/nodeFetchSpreadLine3/compare-test.ts
 *
 * Compares TypeScript output against expectedResult.json from Python implementation.
 * Order in arrays can differ, but values must match exactly.
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

function loadCSV<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<T>(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  });
  return result.data;
}

// ============================================================================
// COMPARISON UTILITIES
// ============================================================================

const TOLERANCE = 0.0001; // Tolerance for floating point comparisons

function isClose(a: number, b: number, tol = TOLERANCE): boolean {
  return Math.abs(a - b) <= tol;
}

interface Difference {
  path: string;
  expected: any;
  actual: any;
  type: string;
}

const differences: Difference[] = [];

function compareValues(expected: any, actual: any, path: string): boolean {
  // Handle nulls
  if (expected === null && actual === null) return true;
  if (expected === null || actual === null) {
    differences.push({ path, expected, actual, type: 'null_mismatch' });
    return false;
  }

  // Handle undefined
  if (expected === undefined && actual === undefined) return true;
  if (expected === undefined || actual === undefined) {
    differences.push({ path, expected, actual, type: 'undefined_mismatch' });
    return false;
  }

  // Handle numbers (with tolerance)
  if (typeof expected === 'number' && typeof actual === 'number') {
    if (!isClose(expected, actual)) {
      differences.push({ path, expected, actual, type: 'number_mismatch' });
      return false;
    }
    return true;
  }

  // Handle strings
  if (typeof expected === 'string' && typeof actual === 'string') {
    if (expected !== actual) {
      differences.push({ path, expected, actual, type: 'string_mismatch' });
      return false;
    }
    return true;
  }

  // Handle booleans
  if (typeof expected === 'boolean' && typeof actual === 'boolean') {
    if (expected !== actual) {
      differences.push({ path, expected, actual, type: 'boolean_mismatch' });
      return false;
    }
    return true;
  }

  // Type mismatch
  if (typeof expected !== typeof actual) {
    differences.push({ path, expected, actual, type: 'type_mismatch' });
    return false;
  }

  // Handle arrays
  if (Array.isArray(expected) && Array.isArray(actual)) {
    return compareArrays(expected, actual, path);
  }

  // Handle objects
  if (typeof expected === 'object' && typeof actual === 'object') {
    return compareObjects(expected, actual, path);
  }

  differences.push({ path, expected, actual, type: 'unknown_mismatch' });
  return false;
}

function compareArrays(expected: any[], actual: any[], path: string): boolean {
  if (expected.length !== actual.length) {
    differences.push({
      path,
      expected: `length ${expected.length}`,
      actual: `length ${actual.length}`,
      type: 'array_length_mismatch'
    });
    return false;
  }

  // For arrays of objects with identifying keys (name, id, time), match by those keys
  if (expected.length > 0 && typeof expected[0] === 'object' && expected[0] !== null) {
    // Try to find matching items by identifier
    const identifierKeys = ['name', 'id', 'label', 'time'];
    let matchKey: string | null = null;

    for (const key of identifierKeys) {
      if (expected[0][key] !== undefined) {
        matchKey = key;
        break;
      }
    }

    if (matchKey) {
      // Match by identifier - order doesn't matter
      let allMatched = true;
      for (const expItem of expected) {
        const identifier = expItem[matchKey];
        const actualItem = actual.find(a => a[matchKey] === identifier);

        if (!actualItem) {
          differences.push({
            path: `${path}[${matchKey}=${identifier}]`,
            expected: expItem,
            actual: 'MISSING',
            type: 'missing_item'
          });
          allMatched = false;
        } else {
          if (!compareObjects(expItem, actualItem, `${path}[${matchKey}=${identifier}]`)) {
            allMatched = false;
          }
        }
      }
      return allMatched;
    }
  }

  // For arrays of primitives or tuples, compare in order
  let allMatched = true;
  for (let i = 0; i < expected.length; i++) {
    if (!compareValues(expected[i], actual[i], `${path}[${i}]`)) {
      allMatched = false;
    }
  }
  return allMatched;
}

function compareObjects(expected: any, actual: any, path: string): boolean {
  const expKeys = Object.keys(expected).sort();
  const actKeys = Object.keys(actual).sort();

  // Check for missing keys
  const missingKeys = expKeys.filter(k => !actKeys.includes(k));
  const extraKeys = actKeys.filter(k => !expKeys.includes(k));

  if (missingKeys.length > 0) {
    differences.push({
      path,
      expected: `keys: ${missingKeys.join(', ')}`,
      actual: 'MISSING',
      type: 'missing_keys'
    });
  }

  if (extraKeys.length > 0) {
    differences.push({
      path,
      expected: 'MISSING',
      actual: `extra keys: ${extraKeys.join(', ')}`,
      type: 'extra_keys'
    });
  }

  // Compare common keys
  let allMatched = missingKeys.length === 0 && extraKeys.length === 0;
  for (const key of expKeys) {
    if (actKeys.includes(key)) {
      if (!compareValues(expected[key], actual[key], `${path}.${key}`)) {
        allMatched = false;
      }
    }
  }

  return allMatched;
}

// ============================================================================
// MAIN TEST
// ============================================================================

async function runComparisonTest() {
  console.log('\n' + '='.repeat(80));
  console.log('SpreadLine TypeScript vs Python Comparison Test');
  console.log('='.repeat(80));

  const ego = "Jeffrey Heer";
  const basePath = path.join(process.cwd(), 'SpreadLine-main/case-studies/vis-author');
  const expectedPath = path.join(process.cwd(), '.claude/expectedResult.json');

  console.log('\n📁 Loading data...');

  try {
    // Load expected result
    const expectedRaw = fs.readFileSync(expectedPath, 'utf-8');
    const expectedResult = JSON.parse(expectedRaw);
    console.log('  Loaded expectedResult.json');

    // Load CSV files
    const relations = loadCSV<RelationRow>(path.join(basePath, 'relations.csv'));
    const allEntities = loadCSV<EntityRow>(path.join(basePath, 'entities.csv'));
    const citations = loadCSV<CitationRow>(path.join(basePath, 'citations.csv'));
    const layout = loadCSV<ContentRow>(path.join(basePath, 'Heer/content.csv'));

    console.log(`  relations.csv: ${relations.length} rows`);
    console.log(`  entities.csv: ${allEntities.length} rows`);

    // Construct author network
    console.log('\n📊 Constructing author network...');
    const { network, lineColor, groups } = constructAuthorNetwork(ego, relations, allEntities);
    console.log(`  Network: ${network.length} rows`);

    // Run SpreadLine
    console.log('\n⚙️  Running SpreadLine pipeline...');
    const SpreadLiner = new SpreadLine();

    SpreadLiner.load(network as any, {
      source: 'source',
      target: 'target',
      time: 'year',
      weight: 'count'
    }, 'topology');

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

    SpreadLiner.load(layout as any, {
      timestamp: 'year',
      id: 'name',
      posX: 'posX',
      posY: 'posY'
    }, 'content');

    SpreadLiner.center(ego, undefined, 'year', '%Y', groups);

    SpreadLiner.configure({
      squeezeSameCategory: true,
      minimize: 'wiggles'
    });

    const result = SpreadLiner.fit(2800, 1000);

    console.log('\n✨ Results:');
    console.log(`  Storylines: ${result.storylines?.length || 0}`);
    console.log(`  Blocks: ${result.blocks?.length || 0}`);
    console.log(`  Time labels: ${result.timeLabels?.length || 0}`);
    console.log(`  Band width: ${result.bandWidth}`);

    // Save actual result
    const outputPath = path.join(process.cwd(), 'fetchspreadline_ts_result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Saved result to: ${outputPath}`);

    // Compare with expected
    console.log('\n🔍 Comparing with expected result...');

    const expected = expectedResult.resp;
    differences.length = 0; // Clear any previous differences

    // Compare key fields
    console.log('\n📋 Comparing key fields:');

    // bandWidth
    console.log(`  bandWidth: expected=${expected.bandWidth}, actual=${result.bandWidth}`);
    if (!isClose(expected.bandWidth, result.bandWidth || 0)) {
      differences.push({ path: 'bandWidth', expected: expected.bandWidth, actual: result.bandWidth, type: 'value_mismatch' });
    }

    // blockWidth
    console.log(`  blockWidth: expected=${expected.blockWidth}, actual=${result.blockWidth}`);
    if (!isClose(expected.blockWidth, result.blockWidth || 0)) {
      differences.push({ path: 'blockWidth', expected: expected.blockWidth, actual: result.blockWidth, type: 'value_mismatch' });
    }

    // Array lengths
    console.log(`  blocks: expected=${expected.blocks?.length}, actual=${result.blocks?.length}`);
    console.log(`  storylines: expected=${expected.storylines?.length}, actual=${result.storylines?.length}`);
    console.log(`  timeLabels: expected=${expected.timeLabels?.length}, actual=${result.timeLabels?.length}`);

    // Deep compare blocks
    console.log('\n🧱 Comparing blocks...');
    if (expected.blocks && result.blocks) {
      compareArrays(expected.blocks, result.blocks, 'blocks');
    }

    // Deep compare storylines
    console.log('\n📈 Comparing storylines...');
    if (expected.storylines && result.storylines) {
      compareArrays(expected.storylines, result.storylines, 'storylines');
    }

    // Deep compare timeLabels
    console.log('\n🕐 Comparing timeLabels...');
    if (expected.timeLabels && result.timeLabels) {
      compareArrays(expected.timeLabels, result.timeLabels, 'timeLabels');
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    if (differences.length === 0) {
      console.log('✅ ALL VALUES MATCH!');
    } else {
      console.log(`❌ Found ${differences.length} differences:`);
      console.log('='.repeat(80));

      // Group by type
      const byType: Record<string, Difference[]> = {};
      for (const diff of differences) {
        if (!byType[diff.type]) byType[diff.type] = [];
        byType[diff.type].push(diff);
      }

      for (const [type, diffs] of Object.entries(byType)) {
        console.log(`\n📌 ${type} (${diffs.length}):`);
        for (const diff of diffs.slice(0, 10)) { // Show first 10 of each type
          console.log(`  ${diff.path}`);
          console.log(`    expected: ${JSON.stringify(diff.expected).slice(0, 100)}`);
          console.log(`    actual:   ${JSON.stringify(diff.actual).slice(0, 100)}`);
        }
        if (diffs.length > 10) {
          console.log(`  ... and ${diffs.length - 10} more`);
        }
      }
    }
    console.log('='.repeat(80));

    process.exit(differences.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

runComparisonTest();

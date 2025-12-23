/**
 * SpreadLine Next.js API Route
 * Equivalent to Python Flask /fetchSpreadLine endpoint
 */

import { NextResponse } from 'next/server';
import { computeJHSpreadLine } from './views';
import fs from 'fs';
import path from 'path';

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
 * Load data files from the case-studies directory
 */
function loadData() {
  const basePath = path.join(process.cwd(), 'SpreadLine-main', 'case-studies', 'vis-author');

  // Load relations
  const relationsPath = path.join(basePath, 'relations.csv');
  const relationsCSV = fs.readFileSync(relationsPath, 'utf-8');
  const relationsData = parseCSV<RelationRow>(relationsCSV);

  // Load entities
  const entitiesPath = path.join(basePath, 'entities.csv');
  const entitiesCSV = fs.readFileSync(entitiesPath, 'utf-8');
  const entitiesData = parseCSV<EntityRow>(entitiesCSV);

  // Load citations
  const citationsPath = path.join(basePath, 'citations.csv');
  const citationsCSV = fs.readFileSync(citationsPath, 'utf-8');
  const citationsData = parseCSV<CitationRow>(citationsCSV);

  // Load Heer content layout
  const contentPath = path.join(basePath, 'Heer', 'content.csv');
  const contentCSV = fs.readFileSync(contentPath, 'utf-8');
  const contentData = parseCSV<ContentRow>(contentCSV);

  // Load Heer content reference
  const referencePath = path.join(basePath, 'Heer', 'content_reference.csv');
  const referenceCSV = fs.readFileSync(referencePath, 'utf-8');
  const referenceData = parseCSV<Record<string, unknown>>(referenceCSV);

  return {
    relationsData,
    entitiesData,
    citationsData,
    contentData,
    referenceData
  };
}

export async function GET() {
  try {
    // Load data
    const {
      relationsData,
      entitiesData,
      citationsData,
      contentData,
      referenceData
    } = loadData();

    // Compute SpreadLine
    const result = computeJHSpreadLine(
      relationsData,
      entitiesData,
      citationsData,
      contentData,
      referenceData
    );

    // Return in same format as Python: { resp: result }
    return NextResponse.json({ resp: result });
  } catch (error) {
    console.error('Error computing SpreadLine:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

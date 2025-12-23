/**
 * SpreadLine API Route
 * Next.js App Router API endpoint for SpreadLine visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { SpreadLine, TopologyRow } from '../../backend';
import fs from 'fs';
import path from 'path';

/**
 * Parse CSV data into rows
 */
function parseCSV<T extends Record<string, string | number>>(csvContent: string): T[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: Record<string, string | number> = {};
    headers.forEach((header, idx) => {
      let value: string | number = values[idx]?.trim() ?? '';
      // Try to convert to number if possible
      const num = parseFloat(value);
      if (!isNaN(num)) {
        value = num;
      }
      row[header] = value;
    });
    return row as T;
  });
}

/**
 * Load vis-author case study data
 */
async function loadVisAuthorData(ego: string): Promise<{
  topology: TopologyRow[];
  lineColor: { entity: string; color: string }[];
  nodeColor: { time: string; entity: string; context: string | number }[];
}> {
  const basePath = path.join(process.cwd(), 'SpreadLine-main', 'case-studies', 'vis-author');

  // Load relations.csv
  const relationsPath = path.join(basePath, 'relations.csv');
  const relationsContent = fs.readFileSync(relationsPath, 'utf-8');
  const relations = parseCSV<{
    year: number;
    source: string;
    target: string;
    id: string;
    type: string;
    citationcount: number;
    count: number;
  }>(relationsContent);

  const topology: TopologyRow[] = relations.map(row => ({
    source: row.source,
    target: row.target,
    time: row.year.toString(),
    weight: row.count || 1,
    id: row.id,
    type: row.type,
    citationcount: row.citationcount,
  }));

  // Load entities.csv for line colors (using type)
  const entitiesPath = path.join(basePath, 'entities.csv');
  const entitiesContent = fs.readFileSync(entitiesPath, 'utf-8');
  const entities = parseCSV<{
    name: string;
    year: number;
    citationcount: number;
    affiliation: string;
  }>(entitiesContent);

  // Create line colors based on type
  const typeColors: Record<string, string> = {
    'Co-author': '#FA9902',
    'Co-co-author': '#006BB6',
    'default': '#424242',
  };

  const lineColorMap = new Map<string, string>();
  for (const row of relations) {
    if (!lineColorMap.has(row.target)) {
      lineColorMap.set(row.target, typeColors[row.type] || typeColors['default']);
    }
  }

  const lineColor = Array.from(lineColorMap.entries()).map(([entity, color]) => ({
    entity,
    color,
  }));

  // Load citations.csv for node colors
  const citationsPath = path.join(basePath, 'citations.csv');
  const citationsContent = fs.readFileSync(citationsPath, 'utf-8');
  const citations = parseCSV<{
    name: string;
    year: number;
    citationcount: number;
    affiliation: string;
    paperID: string;
  }>(citationsContent);

  const nodeColor = citations.map(row => ({
    time: row.year.toString(),
    entity: row.name,
    context: row.citationcount,
  }));

  return { topology, lineColor, nodeColor };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ego = searchParams.get('ego') || 'Jeffrey Heer';
    const width = parseInt(searchParams.get('width') || '1200', 10);
    const height = parseInt(searchParams.get('height') || '600', 10);
    const startYear = searchParams.get('startYear') || '2000';
    const endYear = searchParams.get('endYear') || '2024';

    // Load data
    const { topology, lineColor, nodeColor } = await loadVisAuthorData(ego);

    // Create SpreadLine instance
    const sl = new SpreadLine();

    sl.loadTopology(topology, {
      source: 'source',
      target: 'target',
      time: 'time',
      weight: 'weight',
    });

    sl.loadLineColor(lineColor);
    sl.loadNodeColor(nodeColor);

    // Center on ego
    sl.center(ego, [startYear, endYear], {
      timeDelta: 'year',
      timeFormat: '%Y',
    });

    // Configure
    sl.configure({
      bandStretch: [],
      squeezeSameCategory: true,
      minimize: 'space',
    });

    // Generate visualization data
    const result = sl.fit({ width, height });

    return NextResponse.json(result);
  } catch (error) {
    console.error('SpreadLine API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate SpreadLine visualization', details: String(error) },
      { status: 500 }
    );
  }
}

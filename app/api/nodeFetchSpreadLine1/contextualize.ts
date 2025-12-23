/**
 * SpreadLine Contextualization
 * Converted from Python: SpreadLine/contextualize.py
 *
 * Handles context layout including pre-defined layouts and PCA-based positioning.
 */

import { Session, Entity, ContentConfigState } from './types';

interface ContentRow {
  id: string;
  timestamp?: string | number;
  posX: number;
  posY: number;
  [key: string]: any;
}

interface LayoutRow {
  entity: string;
  timestamp: number;
  posX: number;
  posY: number;
  label: number;
}

interface Liner {
  entities_names: string[];
  sessions: Session[];
  _all_timestamps: string[];
  _content: ContentRow[] | null;
  _content_config: ContentConfigState;
  ego: string;
}

interface ContextResult {
  layout: Map<string, LayoutRow>;
}

/**
 * Collect profiles from content data
 * Python equivalent: _collect_profiles
 */
function collectProfiles(
  liner: Liner,
  content: ContentRow[],
  config: ContentConfigState,
  missing: string = 'closest'
): LayoutRow[] {
  const profiles: LayoutRow[] = [];

  for (const session of liner.sessions) {
    const time = liner._all_timestamps[session.timestamp];
    const entities = session.printEntities();

    for (const entity of entities) {
      const candidates = content.filter(c => c.id === entity);
      if (candidates.length === 0) continue;

      let match: ContentRow | null = null;

      if (config.dynamic) {
        // Dynamic layout - find matching timestamp
        const exactMatch = candidates.find(c => c.timestamp === time);
        if (exactMatch) {
          match = exactMatch;
        } else if (missing === 'closest') {
          // Find closest timestamp using binary search approximation
          const sorted = [...candidates].sort((a, b) => {
            const aTime = String(a.timestamp || '');
            const bTime = String(b.timestamp || '');
            return aTime.localeCompare(bTime);
          });
          // Find the index where time would be inserted
          let bisectIdx = sorted.findIndex(c => String(c.timestamp || '') >= time);
          if (bisectIdx === -1) bisectIdx = sorted.length;
          bisectIdx = Math.max(0, bisectIdx - 1);
          match = sorted[bisectIdx];
        }
      } else {
        // Static layout - should have single match
        if (candidates.length > 1) {
          throw new Error('Multiple matches when static layout is specified');
        }
        match = candidates[0];
      }

      if (match) {
        profiles.push({
          entity: match.id,
          timestamp: session.timestamp,
          posX: match.posX,
          posY: match.posY,
          label: -1
        });
      }
    }
  }

  return profiles;
}

/**
 * Normalize layout to [0, 1] range
 * Python equivalent: normalize_layout
 */
function normalizeLayout(layout: LayoutRow[]): LayoutRow[] {
  if (layout.length === 0) return layout;

  // Find min/max for posX
  const posXValues = layout.map(l => l.posX);
  const minX = Math.min(...posXValues);
  const maxX = Math.max(...posXValues);
  const rangeX = maxX - minX || 1;

  // Find min/max for posY
  const posYValues = layout.map(l => l.posY);
  const minY = Math.min(...posYValues);
  const maxY = Math.max(...posYValues);
  const rangeY = maxY - minY || 1;

  // Normalize
  return layout.map(l => ({
    ...l,
    posX: (l.posX - minX) / rangeX,
    posY: (l.posY - minY) / rangeY
  }));
}

/**
 * Center layout on ego
 * Python equivalent: center_layout
 */
function centerLayout(layout: LayoutRow[], ego: string): LayoutRow[] {
  const egoEntries = layout.filter(l => l.entity === ego);
  const uniquePositions = new Set(egoEntries.map(e => `${e.posX},${e.posY}`));

  if (uniquePositions.size !== 1) {
    throw new Error('The layout is dynamic, centering is not recommended due to information loss');
  }

  const egoEntry = egoEntries[0];
  const centerX = egoEntry.posX;
  const centerY = egoEntry.posY;

  return layout.map(l => ({
    ...l,
    posX: Math.max(0, Math.min(1, l.posX - centerX + 0.5)),
    posY: Math.max(0, Math.min(1, l.posY - centerY + 0.5))
  }));
}

/**
 * Main contextualization function
 * Python equivalent: contextualizing
 */
export function contextualizing(
  liner: Liner,
  normalize: boolean = true,
  centered: boolean = false
): ContextResult {
  const config = liner._content_config;
  const ego = liner.ego;

  // Empty layout if no content
  if (!liner._content) {
    return {
      layout: new Map<string, LayoutRow>()
    };
  }

  // Filter content to only include known entities
  const content = liner._content.filter(c => liner.entities_names.includes(c.id));

  // Collect profiles
  let layout = collectProfiles(liner, content, config);

  // Add label column (default -1)
  layout = layout.map(l => ({ ...l, label: -1 }));

  // Normalize if requested
  if (normalize) {
    layout = normalizeLayout(layout);
  }

  // Center on ego if requested
  if (centered) {
    layout = centerLayout(layout, ego);
  }

  // Create index map: (entity, timestamp) -> row
  const layoutMap = new Map<string, LayoutRow>();
  for (const row of layout) {
    const key = `${row.entity},${row.timestamp}`;
    layoutMap.set(key, row);
  }

  return { layout: layoutMap };
}

'use client';

/**
 * SpreadLine Frontend v1 - Client-Side Computation Demo
 *
 * This demo runs the entire SpreadLine pipeline (ordering, aligning, compacting, rendering)
 * in the browser. The server only provides raw topology data.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpreadLineData } from '../react-design11/components/types';
import SpreadLineChart from '../react-design11/components/SpreadLineChart';
import { SpreadLine } from '@/lib/spreadline';

const queryClient = new QueryClient();

export default function SpreadLineFrontend1Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <SpreadLineFrontendDemo />
    </QueryClientProvider>
  );
}

interface RawDataResponse {
  ego: string;
  dataset: string;
  topology: {
    source: string;
    target: string;
    time: string;
    weight: number;
  }[];
  lineColor: {
    entity: string;
    color: string;
  }[];
  groups: Record<string, string[][]>;
  nodeContext: {
    entity: string;
    time: string;
    context: number;
  }[];
  config: {
    timeDelta: string;
    timeFormat: string;
    squeezeSameCategory: boolean;
    minimize: string;
  };
}

function SpreadLineFrontendDemo() {
  const [rawData, setRawData] = useState<RawDataResponse | null>(null);
  const [computedData, setComputedData] = useState<SpreadLineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [computeTime, setComputeTime] = useState<number | null>(null);

  // Filter state
  const [yearsFilter, setYearsFilter] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());

  // Fetch raw data from server
  useEffect(() => {
    async function fetchRawData() {
      try {
        setLoading(true);
        const response = await fetch('/api/spreadline-raw?dataset=vis-author');
        if (!response.ok) {
          throw new Error(`Failed to fetch raw data: ${response.statusText}`);
        }
        const data = await response.json();
        setRawData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchRawData();
  }, []);

  // Compute SpreadLine layout client-side when raw data is available
  useEffect(() => {
    if (!rawData) return;

    async function computeLayout() {
      // Capture rawData in local variable to satisfy TypeScript
      const data = rawData;
      if (!data) return;

      try {
        setComputing(true);
        const startTime = performance.now();

        // Run the entire SpreadLine pipeline in the browser
        const spreadline = new SpreadLine();

        // Load topology
        spreadline.load(data.topology, {
          source: 'source',
          target: 'target',
          time: 'time',
          weight: 'weight'
        }, 'topology');

        // Load line colors
        spreadline.load(data.lineColor, {
          entity: 'entity',
          color: 'color'
        }, 'line');

        // Load node context (for citation-based node colors)
        if (data.nodeContext && data.nodeContext.length > 0) {
          spreadline.load(data.nodeContext, {
            time: 'time',
            entity: 'entity',
            context: 'context'
          }, 'node');
        }

        // Center on ego
        spreadline.center(
          data.ego,
          undefined,
          data.config.timeDelta,
          data.config.timeFormat,
          data.groups
        );

        // Configure
        spreadline.configure({
          squeezeSameCategory: data.config.squeezeSameCategory,
          minimize: data.config.minimize as 'space' | 'line' | 'wiggles'
        });

        // Calculate width dynamically based on longest name and number of timestamps
        // Get all unique entity names
        const allNames = new Set<string>();
        data.topology.forEach(t => {
          allNames.add(t.source);
          allNames.add(t.target);
        });
        const longestName = Math.max(...Array.from(allNames).map(n => n.length));

        // Estimate label width: ~8px per character + generous padding for 2x spacing
        const labelWidth = longestName * 8 + 80;

        // Width per timestamp should accommodate the label with 2x spacing
        const numTimestamps = new Set(data.topology.map(t => t.time)).size;
        const minWidthPerTimestamp = Math.max(200, labelWidth);  // Minimum 200px per timestamp for 2x spacing
        const dynamicWidth = numTimestamps * minWidthPerTimestamp;

        console.log('SpreadLine Dynamic Width Calculation:', {
          longestName,
          labelWidth,
          numTimestamps,
          minWidthPerTimestamp,
          dynamicWidth
        });

        const result = spreadline.fit(dynamicWidth, 1000);
        console.log('SpreadLine Result bandWidth:', result.bandWidth, 'blockWidth:', result.blockWidth);

        const endTime = performance.now();
        setComputeTime(endTime - startTime);

        // Add mode for compatibility with existing visualizer
        const dataWithMode = {
          ...result,
          mode: 'author',
          reference: []
        } as SpreadLineData;

        setComputedData(dataWithMode);
      } catch (err) {
        console.error('Layout computation error:', err);
        setError(err instanceof Error ? err.message : 'Layout computation failed');
      } finally {
        setComputing(false);
      }
    }

    computeLayout();
  }, [rawData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setResetKey((k) => k + 1);
    setExpandedBlocks(new Set());
    setYearsFilter(1);
    setCrossingOnly(false);
  }, []);

  // Track block expansions
  const handleBlockExpand = useCallback((blockId: number, expanded: boolean) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (expanded) {
        next.add(blockId);
      } else {
        next.delete(blockId);
      }
      return next;
    });
  }, []);

  // Calculate max lifespan for slider
  const maxLifespan = computedData ? Math.max(...computedData.storylines.map(s => s.lifespan)) : 50;

  // Create config for visualization (no custom content renderer for this demo)
  const config = useMemo(() => ({
    content: {
      customize: () => {},  // No-op customizer
      collisionDetection: true,
      showLinks: false,
    },
  }), []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-700 text-xl">Fetching raw data from server...</div>
        </div>
      </div>
    );
  }

  // Computing state
  if (computing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-700 text-xl">Computing layout in browser...</div>
          <div className="text-gray-500 text-sm mt-2">Running ordering, aligning, compacting algorithms</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !computedData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-red-500">
          <div className="text-red-600 text-xl mb-2">Error</div>
          <div className="text-gray-600">{error || 'Failed to compute layout'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              SpreadLine <span className="text-green-600">Frontend v1</span>
            </h1>
            <p className="text-xs text-gray-500">
              {computedData.storylines.length} entities | {computedData.blocks.length} blocks | Ego: {computedData.ego}
              {computeTime && <span className="ml-2 text-green-600">| Computed in {computeTime.toFixed(0)}ms</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Client-Side Computation
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
            >
              Refresh
            </button>
            <a
              href="/react-design11/demo"
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm"
            >
              Compare: Server-Side
            </a>
          </div>
        </div>
      </header>

      {/* Legend Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {/* Line Legend */}
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700">Some Labels</span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-[#424242]"></span>
              <span className="text-gray-700">Ego</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-[#FA9902]"></span>
              <span className="text-gray-700">Colleague</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-[#146b6b]"></span>
              <span className="text-gray-700">Collaborator</span>
            </span>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2">
              <input
                type="range"
                id="length"
                min="1"
                max={maxLifespan}
                value={yearsFilter}
                onChange={(e) => setYearsFilter(Number(e.target.value))}
                className="w-24 accent-gray-500"
              />
              <output className="font-bold text-gray-700 w-6">{yearsFilter}</output>
              <label htmlFor="length" className="font-bold text-gray-700">Years</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="crossing"
                checked={crossingOnly}
                onChange={(e) => setCrossingOnly(e.target.checked)}
                className="accent-gray-500"
              />
              <label htmlFor="crossing" className="font-bold text-gray-700">Only show crossing lines</label>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Container */}
      <div className="flex-1 overflow-auto bg-white relative">
        <SpreadLineChart
          key={resetKey}
          data={computedData}
          config={config}
          onBlockExpand={handleBlockExpand}
          className="min-w-full"
          resetKey={resetKey}
          yearsFilter={yearsFilter}
          crossingOnly={crossingOnly}
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <div>
            <span className="text-gray-400">Click block:</span>{' '}
            <span className="text-gray-700">Expand/collapse</span>
          </div>
          <div>
            <span className="text-gray-400">Hover storyline:</span>{' '}
            <span className="text-gray-700">Highlight</span>
          </div>
          <div>
            <span className="text-gray-400">Click storyline:</span>{' '}
            <span className="text-gray-700">Pin</span>
          </div>
          <div>
            <span className="text-gray-400">Drag on timeline:</span>{' '}
            <span className="text-gray-700">Brush selection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

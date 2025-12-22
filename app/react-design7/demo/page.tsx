'use client';

/**
 * SpreadLine React + D3 Demo Page
 *
 * This demo showcases the React + D3.js hybrid implementation:
 * - React handles layout, state, and data fetching
 * - D3.js handles all SVG rendering, animations, and interactions
 *
 * Key D3 features demonstrated:
 * - d3.transition() with 500ms duration and easeQuadInOut
 * - d3.forceSimulation() for collision detection
 * - d3.brushX() for time selection
 * - stroke-dasharray animation for line drawing effects
 */

import { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpreadLineData } from '../components/types';
import { useSpreadLineData } from '../components/useSpreadLineData';
import SpreadLineChart from '../components/SpreadLineChart';
import DataEditor from '../components/DataEditor';

const queryClient = new QueryClient();

export default function DemoPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SpreadLineDemo />
    </QueryClientProvider>
  );
}

function SpreadLineDemo() {
  const { data, loading, error, setData } = useSpreadLineData('/testData.json');
  const [originalJson, setOriginalJson] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());

  // Fetch original JSON for editor
  useEffect(() => {
    fetch('/testData.json')
      .then((res) => res.text())
      .then((text) => setOriginalJson(text))
      .catch(() => {});
  }, []);

  // Handle data changes from editor
  const handleDataChange = useCallback(
    (newData: object | null, err: string | null) => {
      if (newData && !err) {
        setData(newData as SpreadLineData);
      }
    },
    [setData]
  );

  // Handle refresh - reinitialize entire visualization
  const handleRefresh = useCallback(() => {
    setResetKey((k) => k + 1);
    setExpandedBlocks(new Set());
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading SpreadLine data...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-900 rounded-xl border border-red-500">
          <div className="text-red-400 text-xl mb-2">Error loading data</div>
          <div className="text-slate-400">{error || 'Unknown error'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showEditor ? 'w-2/3' : 'w-full'}`}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white">
                SpreadLine <span className="text-orange-400">React + D3 Demo</span>
              </h1>
              <p className="text-xs text-slate-500">
                {data.storylines.length} entities | {data.blocks.length} blocks | Ego: {data.ego}
                <span className="ml-2 text-orange-400">D3.js v7 powered</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditor(!showEditor)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  showEditor
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showEditor ? 'Hide Editor' : 'Edit Data'}
              </button>
              <a
                href="/react-design7"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
              >
                Back to Docs
              </a>
            </div>
          </div>
        </header>

        {/* Info Bar */}
        <div className="sticky top-[60px] z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="px-4 py-3 flex flex-wrap items-center gap-6">
            {/* D3 Features Used */}
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">D3 Features:</span>
              {['transition', 'forceSimulation', 'brushX', 'selection'].map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-orange-900/50 text-orange-400 rounded text-xs font-mono"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Expanded Blocks Count */}
            {expandedBlocks.size > 0 && (
              <div className="text-slate-400 text-sm">
                <span className="text-orange-400 font-bold">{expandedBlocks.size}</span> blocks
                expanded
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-800/50 border-b border-slate-800 px-4 py-2">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Lines:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-1.5 bg-[#424242] rounded"></span>
                <span className="text-slate-300">Ego</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 bg-[#146b6b] rounded"></span>
                <span className="text-slate-300">Collaborator</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 bg-[#FA9902] rounded"></span>
                <span className="text-slate-300">Colleague</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Citations:</span>
              {[
                { c: '#ffffff', l: '<10' },
                { c: '#fcdaca', l: '10-50' },
                { c: '#e599a6', l: '50-100' },
                { c: '#c94b77', l: '100-500' },
                { c: '#740980', l: '500+' },
              ].map(({ c, l }) => (
                <span key={l} className="flex items-center gap-1">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-500"
                    style={{ backgroundColor: c }}
                  ></span>
                  <span className="text-slate-400 text-xs">{l}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* D3 Animation Info */}
        <div className="bg-orange-900/20 border-b border-orange-800/50 px-4 py-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-orange-400 font-medium">D3 Animation Settings:</span>
            <span className="text-slate-300">
              Duration: <code className="text-orange-300">500ms</code>
            </span>
            <span className="text-slate-300">
              Easing: <code className="text-orange-300">d3.easeQuadInOut</code>
            </span>
            <span className="text-slate-300">
              Force ticks: <code className="text-orange-300">100</code>
            </span>
          </div>
        </div>

        {/* Visualization Container */}
        <div className="flex-1 overflow-auto bg-slate-950">
          <SpreadLineChart
            key={resetKey}
            data={data}
            onBlockExpand={handleBlockExpand}
            className="min-w-full"
            resetKey={resetKey}
          />
        </div>

        {/* Instructions */}
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3">
          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <div>
              <span className="text-slate-500">Click block:</span>{' '}
              <span className="text-slate-300">Expand/collapse with D3 transition</span>
            </div>
            <div>
              <span className="text-slate-500">Hover storyline:</span>{' '}
              <span className="text-slate-300">Highlight with CSS class toggle</span>
            </div>
            <div>
              <span className="text-slate-500">Click storyline:</span>{' '}
              <span className="text-slate-300">Pin to keep highlighted</span>
            </div>
            <div>
              <span className="text-slate-500">Drag on timeline:</span>{' '}
              <span className="text-slate-300">Brush selection (D3 brushX)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Sidebar */}
      {showEditor && (
        <div className="w-1/3 border-l border-slate-800 flex flex-col">
          <DataEditor
            initialData={originalJson}
            onDataChange={handleDataChange}
            onRefresh={handleRefresh}
          />
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * SpreadLine Node.js Backend Demo
 *
 * This demo uses the same React components from react-design11,
 * but fetches data from the Node.js/TypeScript backend API instead of Python.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpreadLineData, SpreadLineConfig } from '../../react-design11/components/types';
import { useSpreadLineData } from '../../react-design11/components/useSpreadLineData';
import SpreadLineChart from '../../react-design11/components/SpreadLineChart';
import * as d3 from 'd3';
import { _compute_embedding, getTextWidth, wrap } from '../../react-design11/components/d3-utils';

const queryClient = new QueryClient();

export default function DemoPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <NodeSpreadLineDemo />
    </QueryClientProvider>
  );
}

/**
 * Custom content renderer for expanded blocks - shows paper references
 */
function authorContentCustomize(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  supplement: unknown,
  bbox: DOMRect,
  moveX: number,
  currX: number,
  id: number,
  topPosY: number,
  posX: number,
  strokeWidth: number,
  animation: d3.Transition<SVGElement, unknown, null, undefined>
): void {
  const supp = supplement as { reference: Array<{ posX: number; posY: number; name: string }> };
  if (!supp.reference) return;
  const references = supp.reference.map((d, i) => {
    const toBeX = _compute_embedding(d.posX, moveX);
    const textWidth = getTextWidth(d.name, '0.4rem');
    const wrapWidth = (toBeX - currX) < textWidth / 2 ? 0.2 : 0.4;
    return { ...d, wrapWidth, id: i };
  });

  container.selectAll('text.reference-label')
    .data(references)
    .join('text')
    .attr('class', `movable group board-opacity-${id} reference-label`)
    .attr('groupID', id)
    .attr('x', posX)
    .attr('y', (d: { posY: number }) => _compute_embedding(d.posY, moveX))
    .text((d: { name: string }) => d.name)
    .attr('font-size', '.5rem')
    .style('text-anchor', 'middle')
    .attr('transform', (d: { posX: number }) => `translate(${+currX + _compute_embedding(d.posX, moveX)}, ${topPosY})`)
    .call(wrap as any, moveX)
    .on('mouseover', function() {
      d3.select(this).style('fill', '#CB1B45').classed('stroked-text', true).style('font-weight', 'bold').raise();
    })
    .on('mouseout', function() {
      d3.select(this).style('fill', '#000000').classed('stroked-text', false).style('font-weight', 'normal');
      d3.selectAll(`.points-${id}`).raise();
    });
}

function NodeSpreadLineDemo() {
  const [ego, setEgo] = useState('Jeffrey Heer');
  const [startYear, setStartYear] = useState('2000');
  const [endYear, setEndYear] = useState('2024');
  const [resetKey, setResetKey] = useState(0);
  const [yearsFilter, setYearsFilter] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);

  // Measure viewport width
  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Build API URL with parameters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({
      ego,
      startYear,
      endYear,
      width: viewportWidth.toString(),
      height: '600',
    });
    return `/node-design1/api/spreadline?${params}`;
  }, [ego, startYear, endYear, viewportWidth]);

  // Use the same hook from react-design11, but with Node.js API URL
  const { data, loading, error, setData, refetch } = useSpreadLineData(apiUrl);

  const handleRefresh = useCallback(() => {
    setResetKey((k) => k + 1);
    setYearsFilter(1);
    setCrossingOnly(false);
    refetch();
  }, [refetch]);

  const handleBlockExpand = useCallback((blockId: number, expanded: boolean) => {
    console.log('Block expanded:', blockId, expanded);
  }, []);

  const maxLifespan = data ? Math.max(...data.storylines.map(s => s.lifespan)) : 50;

  const config: Partial<SpreadLineConfig> = useMemo(() => ({
    content: {
      customize: authorContentCustomize,
      collisionDetection: true,
      showLinks: false,
    },
  }), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-700 text-xl">Loading SpreadLine data from Node.js backend...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-red-500">
          <div className="text-red-600 text-xl mb-2">Error loading data</div>
          <div className="text-gray-600">{error || 'Unknown error'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">
                SpreadLine <span className="text-blue-600">Node.js Demo</span>
              </h1>
              <p className="text-xs text-gray-500">
                {data.storylines.length} entities | {data.blocks.length} blocks | Ego: {data.ego}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={ego}
                onChange={(e) => setEgo(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="Jeffrey Heer">Jeffrey Heer</option>
                <option value="Tamara Munzner">Tamara Munzner</option>
                <option value="Ben Shneiderman">Ben Shneiderman</option>
                <option value="Daniel A. Keim">Daniel A. Keim</option>
              </select>
              <input
                type="text"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                className="w-16 border rounded-lg px-2 py-2 text-sm"
                placeholder="2000"
              />
              <span className="text-gray-400">-</span>
              <input
                type="text"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                className="w-16 border rounded-lg px-2 py-2 text-sm"
                placeholder="2024"
              />
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Reload
              </button>
              <a
                href="/node-design1"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Back to Docs
              </a>
            </div>
          </div>
        </header>

        {/* Legend Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-700">Lines</span>
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

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Citations</span>
              {[
                { c: '#ffffff', l: '<10' },
                { c: '#fcdaca', l: '10-50' },
                { c: '#e599a6', l: '50-100' },
                { c: '#c94b77', l: '100-500' },
                { c: '#740980', l: '500+' },
              ].map(({ c, l }) => (
                <span key={l} className="flex items-center gap-1">
                  <span
                    className="w-8 h-3"
                    style={{
                      backgroundColor: c,
                      border: c === '#ffffff' ? '1px solid #ccc' : 'none'
                    }}
                  ></span>
                </span>
              ))}
            </div>

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

        {/* Visualization */}
        <div className="flex-1 overflow-auto bg-white relative">
          <SpreadLineChart
            key={resetKey}
            data={data}
            config={config}
            onBlockExpand={handleBlockExpand}
            className="min-w-full"
            resetKey={resetKey}
            yearsFilter={yearsFilter}
            crossingOnly={crossingOnly}
          />
        </div>

        {/* Footer */}
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
            <div className="ml-auto text-gray-400">
              Data from Node.js/TypeScript backend
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

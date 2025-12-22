'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  SpreadLineData,
  computeEmbedding,
  easeOutQuad,
  getNodeColor
} from '../components/types';

export default function FullDemoPage() {
  const [data, setData] = useState<SpreadLineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [pinnedEntities, setPinnedEntities] = useState<Set<string>>(new Set());
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [blockAnimProgress, setBlockAnimProgress] = useState<{ [key: number]: number }>({});
  const [minLifespan, setMinLifespan] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; label: string } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    fetch('/testData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load testData.json');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Animation loop for block expansion
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockAnimProgress((prev) => {
        const next = { ...prev };
        let changed = false;

        // Expand blocks that are in expandedBlocks set
        expandedBlocks.forEach((id) => {
          if ((next[id] || 0) < 1) {
            next[id] = Math.min(1, (next[id] || 0) + 0.05);
            changed = true;
          }
        });

        // Collapse blocks that are not in expandedBlocks set
        Object.keys(next).forEach((k) => {
          const id = parseInt(k);
          if (!expandedBlocks.has(id) && next[id] > 0) {
            next[id] = Math.max(0, next[id] - 0.05);
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [expandedBlocks]);

  // Compute filtered entity names
  const filteredNames = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(
      data.storylines
        .filter(s => s.name === data.ego || (s.lifespan >= minLifespan && (!crossingOnly || s.crossingCheck)))
        .map(s => s.name)
    );
  }, [data, minLifespan, crossingOnly]);

  // Check if entity is highlighted
  const isHighlighted = useCallback((name: string): boolean => {
    if (!data) return false;
    if (name === data.ego) return true;
    if (pinnedEntities.size > 0) return pinnedEntities.has(name);
    if (hoveredEntity) return hoveredEntity === name;
    return true;
  }, [data, pinnedEntities, hoveredEntity]);

  // Calculate X shift based on expanded blocks
  const getShiftX = useCallback((posX: number): number => {
    if (!data) return 0;
    let shift = 0;

    data.blocks.forEach((block) => {
      const blockPosX = data.timeLabels.find(t => t.label === block.time)?.posX || 0;
      const progress = easeOutQuad(blockAnimProgress[block.id] || 0);

      if (blockPosX < posX && expandedBlocks.has(block.id)) {
        shift += block.moveX * progress;
      } else if (blockPosX === posX && expandedBlocks.has(block.id)) {
        shift += (block.moveX / 2) * progress;
      }
    });

    return shift;
  }, [data, expandedBlocks, blockAnimProgress]);

  // Loading state
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

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-900 rounded-xl border border-red-500">
          <div className="text-red-400 text-xl mb-2">Error loading data</div>
          <div className="text-slate-400">{error || 'Unknown error'}</div>
          <div className="text-slate-500 text-sm mt-4">Make sure testData.json is in the public folder</div>
        </div>
      </div>
    );
  }

  // Calculate dimensions
  const margin = { top: 100, right: 150, bottom: 50, left: 200 };
  const totalExpand = Array.from(expandedBlocks).reduce((sum, id) => {
    const block = data.blocks.find(b => b.id === id);
    return sum + (block ? block.moveX * easeOutQuad(blockAnimProgress[id] || 0) : 0);
  }, 0);

  const svgWidth = Math.max(...data.timeLabels.map(t => t.posX)) + margin.left + margin.right + totalExpand + 100;
  const svgHeight = (data.heightExtents?.[1] || 600) + margin.top + margin.bottom + 150;
  const egoStoryline = data.storylines.find(s => s.name === data.ego);
  const egoY = egoStoryline?.label.posY || 400;
  const maxLife = Math.max(...data.storylines.filter(s => s.name !== data.ego).map(s => s.lifespan));

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white">
                SpreadLine <span className="text-cyan-400">Full Demo</span>
              </h1>
              <p className="text-xs text-slate-500">
                {data.storylines.length} entities | {data.blocks.length} blocks | {data.ego}
              </p>
            </div>
            <a href="/react-design1" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm">
              Back to Docs
            </a>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="sticky top-[60px] z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            {/* Lifespan Filter */}
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">Min Years:</span>
              <input
                type="range"
                min="1"
                max={maxLife}
                value={minLifespan}
                onChange={(e) => setMinLifespan(parseInt(e.target.value))}
                className="w-32 accent-cyan-500"
              />
              <span className="text-cyan-400 font-bold w-8">{minLifespan}</span>
            </div>

            {/* Crossing Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={crossingOnly}
                onChange={(e) => setCrossingOnly(e.target.checked)}
                className="w-5 h-5 accent-cyan-500"
              />
              <span className="text-slate-300 text-sm">Crossing Only</span>
            </label>

            {/* Count */}
            <div className="text-slate-400 text-sm">
              <span className="text-cyan-400 font-bold">{filteredNames.size - 1}</span> of {data.storylines.length - 1} alters
            </div>

            {/* Clear Pins */}
            {pinnedEntities.size > 0 && (
              <button
                onClick={() => setPinnedEntities(new Set())}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-colors"
              >
                Clear {pinnedEntities.size} Pin(s)
              </button>
            )}

            {/* Status */}
            <div className="ml-auto flex items-center gap-4 text-sm">
              {expandedBlocks.size > 0 && (
                <span className="text-green-400">{expandedBlocks.size} block(s) expanded</span>
              )}
              <span className="text-slate-500">Hover to highlight | Click line to pin | Click block to expand</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-800/50 border-b border-slate-800">
        <div className="max-w-full mx-auto px-4 py-2">
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
                { c: '#740980', l: '500+' }
              ].map(({ c, l }) => (
                <span key={l} className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full border border-slate-500" style={{ backgroundColor: c }}></span>
                  <span className="text-slate-400 text-xs">{l}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main SVG Container */}
      <div ref={containerRef} className="overflow-auto bg-slate-950" style={{ height: 'calc(100vh - 180px)' }}>
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className="bg-slate-950"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Direction Labels */}
            <text
              x={-margin.left + 30}
              y={egoY - 180}
              fill="#64748b"
              fontSize="50"
              fontWeight="bold"
              opacity="0.12"
            >
              External
            </text>
            <text
              x={-margin.left + 30}
              y={egoY + 220}
              fill="#64748b"
              fontSize="50"
              fontWeight="bold"
              opacity="0.12"
            >
              Internal
            </text>

            {/* Time Labels and Rules */}
            {data.timeLabels.map((tl) => {
              const shift = getShiftX(tl.posX);
              return (
                <g key={tl.label} transform={`translate(${shift}, 0)`}>
                  <text
                    x={tl.posX}
                    y={-40}
                    fill="#94a3b8"
                    fontSize="14"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {tl.label}
                  </text>
                  <line
                    x1={tl.posX}
                    y1={-25}
                    x2={tl.posX}
                    y2={svgHeight - margin.top - margin.bottom}
                    stroke="#334155"
                    strokeDasharray="4"
                    opacity="0.3"
                  />
                </g>
              );
            })}

            {/* Storylines */}
            {data.storylines.map((sl) => {
              const filtered = filteredNames.has(sl.name);
              const highlighted = isHighlighted(sl.name);
              const isEgo = sl.name === data.ego;
              const isPinned = pinnedEntities.has(sl.name);

              return (
                <g
                  key={sl.id}
                  className="transition-opacity duration-300"
                  style={{
                    opacity: !filtered ? 0.08 : highlighted ? 1 : 0.15,
                    cursor: isEgo ? 'default' : 'pointer'
                  }}
                  onMouseEnter={() => filtered && !isEgo && setHoveredEntity(sl.name)}
                  onMouseLeave={() => setHoveredEntity(null)}
                  onClick={() => {
                    if (filtered && !isEgo) {
                      setPinnedEntities(prev => {
                        const next = new Set(prev);
                        if (next.has(sl.name)) {
                          next.delete(sl.name);
                        } else {
                          next.add(sl.name);
                        }
                        return next;
                      });
                    }
                  }}
                >
                  {/* Path segments */}
                  {sl.lines.map((line, idx) => {
                    const match = line.match(/M([\d.]+)/);
                    const startX = match ? parseFloat(match[1]) : 0;
                    return (
                      <path
                        key={idx}
                        d={line}
                        transform={`translate(${getShiftX(startX)}, 0)`}
                        stroke={sl.color}
                        strokeWidth={isEgo ? 6 : highlighted ? 4 : 2}
                        fill="none"
                        className="transition-all duration-200"
                      />
                    );
                  })}

                  {/* Triangle markers - FIXED ROTATION */}
                  {sl.marks.map((mark, idx) => {
                    if (mark.visibility !== 'visible') return null;
                    const sz = Math.sqrt(mark.size) * 2;
                    // First marker points RIGHT (into the vis), others point LEFT
                    const rot = idx === 0 ? 0 : 180;

                    return (
                      <polygon
                        key={`mark-${idx}`}
                        points={`0,${-sz/2} ${sz},0 0,${sz/2}`}
                        transform={`translate(${mark.posX + getShiftX(mark.posX)}, ${mark.posY}) rotate(${rot})`}
                        fill={sl.color}
                      />
                    );
                  })}

                  {/* Labels */}
                  {sl.label.visibility === 'visible' && (sl.lifespan > 5 || isEgo || isPinned) && (
                    <g transform={`translate(${getShiftX(sl.label.posX)}, 0)`}>
                      <text
                        x={sl.label.posX}
                        y={sl.label.posY}
                        fill={sl.color}
                        fontSize={isEgo ? "14" : "12"}
                        fontWeight={isEgo || isPinned ? "bold" : "normal"}
                        textAnchor="end"
                        dy="4"
                        className="select-none"
                      >
                        {sl.label.label}
                      </text>
                      {!isEgo && sl.label.line && (
                        <path
                          d={sl.label.line}
                          stroke={sl.color}
                          strokeWidth="2"
                          fill="none"
                        />
                      )}
                    </g>
                  )}

                  {/* Pin indicator */}
                  {isPinned && (
                    <circle
                      cx={sl.label.posX + getShiftX(sl.label.posX) + 12}
                      cy={sl.label.posY}
                      r="6"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

            {/* Blocks */}
            {data.blocks.map((block) => {
              const tl = data.timeLabels.find(t => t.label === block.time);
              if (!tl) return null;

              const baseShift = getShiftX(tl.posX);
              const progress = easeOutQuad(blockAnimProgress[block.id] || 0);
              const expandW = block.moveX * progress;
              const hasFiltered = block.names.some(n => filteredNames.has(n));

              const minY = Math.min(...block.points.map(p => p.posY)) - 30;
              const maxY = Math.max(...block.points.map(p => p.posY)) + 30;
              const blockHeight = maxY - minY;

              return (
                <g
                  key={block.id}
                  className="transition-opacity duration-300"
                  style={{ opacity: hasFiltered ? 1 : 0.15 }}
                >
                  {/* Clickable area */}
                  <rect
                    x={tl.posX - data.blockWidth / 2 + baseShift - expandW / 2 - 5}
                    y={minY}
                    width={data.blockWidth + expandW + 10}
                    height={blockHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => {
                      if (hasFiltered) {
                        setExpandedBlocks(prev => {
                          const next = new Set(prev);
                          if (next.has(block.id)) {
                            next.delete(block.id);
                          } else {
                            next.add(block.id);
                          }
                          return next;
                        });
                      }
                    }}
                  />

                  {/* White background when expanded */}
                  {progress > 0 && (
                    <rect
                      x={tl.posX - data.blockWidth / 2 + baseShift - expandW / 2}
                      y={minY + 10}
                      width={data.blockWidth + expandW}
                      height={blockHeight - 20}
                      rx="20"
                      fill="white"
                      opacity={progress * 0.95}
                      pointerEvents="none"
                    />
                  )}

                  {/* Left arc */}
                  <path
                    d={block.outline.left}
                    transform={`translate(${baseShift - expandW / 2}, 0)`}
                    stroke={expandedBlocks.has(block.id) ? "#3b82f6" : "#64748b"}
                    strokeWidth="3"
                    fill="none"
                    pointerEvents="none"
                  />

                  {/* Right arc */}
                  <path
                    d={block.outline.right}
                    transform={`translate(${baseShift + expandW / 2}, 0)`}
                    stroke={expandedBlocks.has(block.id) ? "#3b82f6" : "#64748b"}
                    strokeWidth="3"
                    fill="none"
                    pointerEvents="none"
                  />

                  {/* Top/bottom bars when expanded */}
                  {progress > 0.2 && (
                    <>
                      <line
                        x1={tl.posX + baseShift - expandW / 2}
                        y1={minY + 10}
                        x2={tl.posX + baseShift + expandW / 2}
                        y2={minY + 10}
                        stroke="#3b82f6"
                        strokeWidth="3"
                        opacity={progress}
                        pointerEvents="none"
                      />
                      <line
                        x1={tl.posX + baseShift - expandW / 2}
                        y1={maxY - 10}
                        x2={tl.posX + baseShift + expandW / 2}
                        y2={maxY - 10}
                        stroke="#3b82f6"
                        strokeWidth="3"
                        opacity={progress}
                        pointerEvents="none"
                      />
                    </>
                  )}

                  {/* Relation arcs when expanded */}
                  {progress > 0.5 && block.relations.map(([srcId, tgtId], idx) => {
                    const src = block.points.find(p => p.id === srcId);
                    const tgt = block.points.find(p => p.id === tgtId);
                    if (!src || !tgt) return null;

                    const sx = tl.posX + baseShift + computeEmbedding(src.scaleX, expandW) - expandW / 2;
                    const sy = block.topPosY + computeEmbedding(src.scaleY, expandW);
                    const tx = tl.posX + baseShift + computeEmbedding(tgt.scaleX, expandW) - expandW / 2;
                    const ty = block.topPosY + computeEmbedding(tgt.scaleY, expandW);

                    return (
                      <path
                        key={idx}
                        d={`M${sx},${sy} Q${(sx + tx) / 2},${Math.min(sy, ty) - 20} ${tx},${ty}`}
                        stroke="#424242"
                        strokeWidth="1.5"
                        fill="none"
                        opacity={(progress - 0.5) * 2}
                        markerEnd="url(#arrowMarker)"
                        pointerEvents="none"
                      />
                    );
                  })}

                  {/* Points */}
                  {block.points.map((pt) => {
                    const ptFiltered = filteredNames.has(pt.name);
                    const ptHighlighted = isHighlighted(pt.name);
                    const isEgoPt = pt.name === data.ego;

                    // Calculate position
                    let px = tl.posX + baseShift;
                    let py = pt.posY;

                    if (progress > 0) {
                      px = tl.posX + baseShift + computeEmbedding(pt.scaleX, expandW) - expandW / 2;
                      py = block.topPosY + computeEmbedding(pt.scaleY, expandW) * progress +
                           pt.posY * (1 - progress) - block.topPosY * (1 - progress);
                    }

                    return (
                      <g key={`${block.id}-${pt.id}`}>
                        <circle
                          cx={px}
                          cy={py}
                          r={isEgoPt ? 8 : 6}
                          fill={getNodeColor(parseInt(pt.label) || 0)}
                          stroke={ptHighlighted ? "#000" : "#666"}
                          strokeWidth={ptHighlighted ? 2 : 1}
                          opacity={ptFiltered ? (ptHighlighted ? 1 : 0.5) : 0.1}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={(e) => {
                            if (ptFiltered) {
                              setHoveredEntity(pt.name);
                              const rect = svgRef.current?.getBoundingClientRect();
                              if (rect) {
                                setTooltip({
                                  x: e.clientX - rect.left,
                                  y: e.clientY - rect.top,
                                  name: pt.name,
                                  label: pt.label
                                });
                              }
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredEntity(null);
                            setTooltip(null);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (ptFiltered && !isEgoPt) {
                              setPinnedEntities(prev => {
                                const next = new Set(prev);
                                if (next.has(pt.name)) {
                                  next.delete(pt.name);
                                } else {
                                  next.add(pt.name);
                                }
                                return next;
                              });
                            }
                          }}
                        />

                        {/* Point label when expanded */}
                        {progress > 0.7 && (
                          <text
                            x={px + 12}
                            y={py + 4}
                            fill="#333"
                            fontSize="10"
                            opacity={(progress - 0.7) * 3.33}
                            pointerEvents="none"
                          >
                            {pt.name.split(' ')[0]}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowMarker"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#424242" />
              </marker>
            </defs>
          </g>

          {/* Tooltip */}
          {tooltip && (
            <g transform={`translate(${tooltip.x + 20}, ${tooltip.y})`}>
              <rect
                x="0"
                y="-25"
                width="180"
                height="55"
                rx="8"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1"
              />
              <text x="12" y="0" fill="white" fontSize="13" fontWeight="bold">
                {tooltip.name}
              </text>
              <text x="12" y="20" fill="#94a3b8" fontSize="12">
                Citations: {tooltip.label}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

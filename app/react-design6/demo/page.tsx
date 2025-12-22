'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  SpreadLineData,
  Block,
  Storyline,
  TimeLabel,
  computeEmbedding,
  easeOutQuad,
  getNodeColor,
  getPathStartX,
  getPathEndX,
  getPathStartY,
  getPathEndY
} from '../components/types';
import { useSpreadLineData } from '../components/useSpreadLineData';
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
  const [dataVersion, setDataVersion] = useState(0);

  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [pinnedEntities, setPinnedEntities] = useState<Set<string>>(new Set());
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [blockAnimProgress, setBlockAnimProgress] = useState<{ [key: number]: number }>({});
  const [minLifespan, setMinLifespan] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; label: string } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch('/testData.json')
      .then((res) => res.text())
      .then((text) => setOriginalJson(text))
      .catch(() => {});
  }, []);

  const handleDataChange = useCallback((newData: object | null, err: string | null) => {
    if (newData && !err) {
      setData(newData as SpreadLineData);
    }
  }, [setData]);

  const handleRefresh = useCallback(() => {
    setDataVersion(v => v + 1);
    setExpandedBlocks(new Set());
    setBlockAnimProgress({});
    setHoveredEntity(null);
    setPinnedEntities(new Set());
    setTooltip(null);
  }, []);

  // FIX #4: Faster animation - 0.08 instead of 0.04 (~200ms instead of ~400ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockAnimProgress((prev) => {
        const next = { ...prev };
        let changed = false;

        expandedBlocks.forEach((id) => {
          if ((next[id] || 0) < 1) {
            next[id] = Math.min(1, (next[id] || 0) + 0.08);
            changed = true;
          }
        });

        Object.keys(next).forEach((k) => {
          const id = parseInt(k);
          if (!expandedBlocks.has(id) && next[id] > 0) {
            next[id] = Math.max(0, next[id] - 0.08);
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [expandedBlocks]);

  const filteredNames = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(
      data.storylines
        .filter(s => s.name === data.ego || (s.lifespan >= minLifespan && (!crossingOnly || s.crossingCheck)))
        .map(s => s.name)
    );
  }, [data, minLifespan, crossingOnly]);

  const isHighlighted = useCallback((name: string): boolean => {
    if (!data) return false;
    if (name === data.ego) return true;
    if (pinnedEntities.size > 0) return pinnedEntities.has(name);
    if (hoveredEntity) return hoveredEntity === name;
    return true;
  }, [data, pinnedEntities, hoveredEntity]);

  const toggleBlockExpansion = useCallback((blockId: number, hasFiltered: boolean) => {
    if (hasFiltered) {
      setExpandedBlocks(prev => {
        const next = new Set(prev);
        next.has(blockId) ? next.delete(blockId) : next.add(blockId);
        return next;
      });
    }
  }, []);

  // FIX #3: Use blockAnimProgress > 0 instead of expandedBlocks.has() for smooth collapse animation
  const getShiftX = useCallback((posX: number): number => {
    if (!data) return 0;
    let shift = 0;

    data.blocks.forEach((block) => {
      const tl = data.timeLabels.find(t => t.label === block.time);
      if (!tl) return;

      const blockPosX = tl.posX;
      const progress = easeOutQuad(blockAnimProgress[block.id] || 0);
      const expandW = block.moveX * progress;

      // FIX: Check progress > 0 instead of expandedBlocks.has() for smooth collapse
      if (blockPosX < posX && progress > 0) {
        shift += expandW;
      }
    });

    return shift;
  }, [data, blockAnimProgress]);

  const createPillPath = useCallback((block: Block, tl: TimeLabel, expandW: number, baseShift: number): string => {
    if (!data) return '';
    const minY = Math.min(...block.points.map(p => p.posY)) - 20;
    const maxY = Math.max(...block.points.map(p => p.posY)) + 20;
    const height = maxY - minY;
    const radius = Math.min(15, height / 2);

    const leftX = tl.posX - data.blockWidth / 2 + baseShift;
    const rightX = tl.posX + data.blockWidth / 2 + baseShift + expandW;

    return `
      M ${leftX + radius} ${minY}
      L ${rightX - radius} ${minY}
      Q ${rightX} ${minY} ${rightX} ${minY + radius}
      L ${rightX} ${maxY - radius}
      Q ${rightX} ${maxY} ${rightX - radius} ${maxY}
      L ${leftX + radius} ${maxY}
      Q ${leftX} ${maxY} ${leftX} ${maxY - radius}
      L ${leftX} ${minY + radius}
      Q ${leftX} ${minY} ${leftX + radius} ${minY}
      Z
    `;
  }, [data]);

  // FIX #1: Generate fill lines for ALL storylines (including members) that cross expanded blocks
  const generateFillLines = useCallback((storyline: Storyline): string[] => {
    if (!data) return [];
    const fillLines: string[] = [];

    data.blocks.forEach((block) => {
      const progress = easeOutQuad(blockAnimProgress[block.id] || 0);
      if (progress < 0.01) return;

      const tl = data.timeLabels.find(t => t.label === block.time);
      if (!tl) return;

      const expandW = block.moveX * progress;

      // Find the Y position where this storyline crosses this block's X position
      for (let i = 0; i < storyline.lines.length; i++) {
        const line = storyline.lines[i];
        const startX = getPathStartX(line);
        const endX = getPathEndX(line);

        // Check if this segment spans the block's position
        if (startX <= tl.posX && endX >= tl.posX) {
          const startY = getPathStartY(line);
          const endY = getPathEndY(line);
          const t = (tl.posX - startX) / (endX - startX || 1);
          const y = startY + (endY - startY) * t;

          const baseShift = getShiftX(tl.posX);

          // FIX: Create fill line for ALL storylines, not just non-members
          const fillStartX = tl.posX - data.blockWidth / 2 + baseShift;
          const fillEndX = tl.posX + data.blockWidth / 2 + baseShift + expandW;

          fillLines.push(`M ${fillStartX},${y} L ${fillEndX},${y}`);
          break;
        }
      }
    });

    return fillLines;
  }, [data, blockAnimProgress, getShiftX]);

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

  const margin = { top: 100, right: 150, bottom: 50, left: 200 };
  const totalExpand = Array.from(expandedBlocks).reduce((sum, id) => {
    const block = data.blocks.find(b => b.id === id);
    return sum + (block ? block.moveX * easeOutQuad(blockAnimProgress[id] || 0) : 0);
  }, 0);

  const svgWidth = Math.max(...data.timeLabels.map(t => t.posX)) + margin.left + margin.right + totalExpand + 100;
  const svgHeight = (data.heightExtents?.[1] || 600) + margin.top + margin.bottom + 150;
  const egoStoryline = data.storylines.find(s => s.name === data.ego);
  const egoY = egoStoryline?.label.posY || 400;
  const maxLife = Math.max(...data.storylines.filter(s => s.name !== data.ego).map(s => s.lifespan), 1);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className={`flex-1 flex flex-col ${showEditor ? 'w-2/3' : 'w-full'}`}>
        <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white">
                SpreadLine <span className="text-cyan-400">Demo v6</span>
              </h1>
              <p className="text-xs text-slate-500">
                {data.storylines.length} entities | {data.blocks.length} blocks | Ego: {data.ego} | bandWidth: {data.bandWidth}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditor(!showEditor)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  showEditor ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showEditor ? 'Hide Editor' : 'Edit Data'}
              </button>
              <a href="/react-design6" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm">
                Back to Docs
              </a>
            </div>
          </div>
        </header>

        <div className="sticky top-[60px] z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="px-4 py-3 flex flex-wrap items-center gap-6">
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

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={crossingOnly}
                onChange={(e) => setCrossingOnly(e.target.checked)}
                className="w-5 h-5 accent-cyan-500"
              />
              <span className="text-slate-300 text-sm">Crossing Only</span>
            </label>

            <div className="text-slate-400 text-sm">
              <span className="text-cyan-400 font-bold">{filteredNames.size - 1}</span> of {data.storylines.length - 1} alters
            </div>

            {pinnedEntities.size > 0 && (
              <button
                onClick={() => setPinnedEntities(new Set())}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm"
              >
                Clear {pinnedEntities.size} Pin(s)
              </button>
            )}

            {expandedBlocks.size > 0 && (
              <button
                onClick={() => setExpandedBlocks(new Set())}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
              >
                Collapse All
              </button>
            )}
          </div>
        </div>

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

        <div className="flex-1 overflow-auto bg-slate-950">
          <svg
            key={dataVersion}
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="bg-slate-950"
          >
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <text x={-margin.left + 30} y={egoY - 180} fill="#64748b" fontSize="50" fontWeight="bold" opacity="0.12">
                External
              </text>
              <text x={-margin.left + 30} y={egoY + 220} fill="#64748b" fontSize="50" fontWeight="bold" opacity="0.12">
                Internal
              </text>

              {data.timeLabels.map((tl, idx) => {
                const shift = getShiftX(tl.posX);
                const block = data.blocks[idx];
                const hasFiltered = block ? block.names.some(n => filteredNames.has(n)) : false;
                const isExpanded = block ? expandedBlocks.has(block.id) : false;

                return (
                  <g key={tl.label} transform={`translate(${shift}, 0)`}>
                    <text
                      x={tl.posX}
                      y={-40}
                      fill={isExpanded ? "#3b82f6" : "#94a3b8"}
                      fontSize="14"
                      textAnchor="middle"
                      fontWeight="bold"
                      className={hasFiltered ? "cursor-pointer hover:fill-cyan-400" : ""}
                      onClick={() => block && toggleBlockExpansion(block.id, hasFiltered)}
                    >
                      {tl.label}
                    </text>
                    <line
                      x1={tl.posX} y1={-25}
                      x2={tl.posX} y2={svgHeight - margin.top - margin.bottom}
                      stroke="#334155" strokeDasharray="4" opacity="0.3"
                    />
                  </g>
                );
              })}

              <g className="storylines-layer">
                {data.storylines.map((sl) => {
                  const filtered = filteredNames.has(sl.name);
                  const highlighted = isHighlighted(sl.name);
                  const isEgo = sl.name === data.ego;
                  const isPinned = pinnedEntities.has(sl.name);
                  const fillLines = generateFillLines(sl);

                  return (
                    <g
                      key={sl.id}
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
                            next.has(sl.name) ? next.delete(sl.name) : next.add(sl.name);
                            return next;
                          });
                        }
                      }}
                    >
                      {sl.lines.map((line, idx) => {
                        const startX = getPathStartX(line);
                        return (
                          <path
                            key={idx}
                            d={line}
                            transform={`translate(${getShiftX(startX)}, 0)`}
                            stroke={sl.color}
                            strokeWidth={isEgo ? 6 : highlighted ? 4 : 2}
                            fill="none"
                          />
                        );
                      })}

                      {fillLines.map((fillLine, idx) => (
                        <path
                          key={`fill-${idx}`}
                          d={fillLine}
                          stroke={sl.color}
                          strokeWidth={isEgo ? 6 : highlighted ? 4 : 2}
                          fill="none"
                        />
                      ))}

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
                          >
                            {sl.label.label}
                          </text>
                          {!isEgo && sl.label.line && (
                            <path d={sl.label.line} stroke={sl.color} strokeWidth="2" fill="none" />
                          )}
                        </g>
                      )}

                      {sl.marks.map((mark, idx) => {
                        if (mark.visibility !== 'visible') return null;
                        const sz = Math.sqrt(mark.size) * 2;
                        const rot = idx === 0 ? 0 : 180;
                        const offsetX = idx === 0 ? -8 : 8;

                        return (
                          <polygon
                            key={`mark-${idx}`}
                            points={`0,${-sz/2} ${sz},0 0,${sz/2}`}
                            transform={`translate(${mark.posX + getShiftX(mark.posX) + offsetX}, ${mark.posY}) rotate(${rot})`}
                            fill={sl.color}
                          />
                        );
                      })}

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
              </g>

              <g className="blocks-layer">
                {data.blocks.map((block) => {
                  const tl = data.timeLabels.find(t => t.label === block.time);
                  if (!tl) return null;

                  const baseShift = getShiftX(tl.posX);
                  const progress = easeOutQuad(blockAnimProgress[block.id] || 0);
                  const expandW = block.moveX * progress;
                  const hasFiltered = block.names.some(n => filteredNames.has(n));
                  const isExpanded = expandedBlocks.has(block.id);

                  const nodeRadius = 6;
                  const arrowLength = 8;

                  return (
                    <g
                      key={block.id}
                      style={{ opacity: hasFiltered ? 1 : 0.15 }}
                    >
                      <path
                        d={createPillPath(block, tl, expandW, baseShift)}
                        fill="#1e293b"
                        stroke={isExpanded ? "#3b82f6" : "#475569"}
                        strokeWidth={isExpanded ? 3 : 2}
                        className={hasFiltered ? "cursor-pointer" : ""}
                        onClick={() => toggleBlockExpansion(block.id, hasFiltered)}
                      />

                      {progress > 0 && (
                        <path
                          d={createPillPath(block, tl, expandW, baseShift)}
                          fill="white"
                          opacity={progress * 0.95}
                          stroke="none"
                          pointerEvents="none"
                        />
                      )}

                      {/* FIX #2: Relation arcs with correct arrow positioning */}
                      {progress > 0.5 && block.relations.map(([srcId, tgtId], idx) => {
                        const src = block.points.find(p => p.id === srcId);
                        const tgt = block.points.find(p => p.id === tgtId);
                        if (!src || !tgt) return null;

                        const sx = tl.posX + baseShift + computeEmbedding(src.scaleX, expandW);
                        const sy = block.topPosY + computeEmbedding(src.scaleY, expandW);
                        const tx = tl.posX + baseShift + computeEmbedding(tgt.scaleX, expandW);
                        const ty = block.topPosY + computeEmbedding(tgt.scaleY, expandW);

                        const midX = (sx + tx) / 2;
                        const controlY = Math.min(sy, ty) - 25;

                        // Direction from control point to target (bezier tangent at end)
                        const dx = tx - midX;
                        const dy = ty - controlY;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 1) return null;

                        const nx = dx / dist;
                        const ny = dy / dist;

                        // FIX: Pull back by nodeRadius + arrowLength so arrow TIP reaches node border
                        const pullBack = nodeRadius + arrowLength;
                        const endX = tx - pullBack * nx;
                        const endY = ty - pullBack * ny;

                        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                        return (
                          <g key={idx} opacity={(progress - 0.5) * 2}>
                            <path
                              d={`M${sx},${sy} Q${midX},${controlY} ${endX},${endY}`}
                              stroke="#424242"
                              strokeWidth="1.5"
                              fill="none"
                              pointerEvents="none"
                            />
                            <polygon
                              points="0,-4 8,0 0,4"
                              transform={`translate(${endX}, ${endY}) rotate(${angle})`}
                              fill="#424242"
                            />
                          </g>
                        );
                      })}

                      {block.points.map((pt) => {
                        const ptFiltered = filteredNames.has(pt.name);
                        const ptHighlighted = isHighlighted(pt.name);
                        const isEgoPt = pt.name === data.ego;

                        let px = tl.posX + baseShift;
                        let py = pt.posY;

                        if (progress > 0) {
                          px = tl.posX + baseShift + computeEmbedding(pt.scaleX, expandW);
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
                                    next.has(pt.name) ? next.delete(pt.name) : next.add(pt.name);
                                    return next;
                                  });
                                }
                              }}
                            />

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
              </g>
            </g>

            {tooltip && (
              <g transform={`translate(${tooltip.x + 20}, ${tooltip.y})`}>
                <rect x="0" y="-25" width="180" height="55" rx="8" fill="#1e293b" stroke="#475569" />
                <text x="12" y="0" fill="white" fontSize="13" fontWeight="bold">{tooltip.name}</text>
                <text x="12" y="20" fill="#94a3b8" fontSize="12">Citations: {tooltip.label}</text>
              </g>
            )}
          </svg>
        </div>
      </div>

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

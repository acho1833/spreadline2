'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  SpreadLineData,
  Block,
  Storyline,
  TimeLabel,
  computeEmbedding,
  easeOutQuad,
  getNodeColor
} from '../components/types';

export default function DemoPage() {
  const [data, setData] = useState<SpreadLineData | null>(null);
  const [originalJson, setOriginalJson] = useState<string>('');
  const [editorJson, setEditorJson] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Interaction state
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [pinnedEntities, setPinnedEntities] = useState<Set<string>>(new Set());
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [animProgress, setAnimProgress] = useState<Record<number, number>>({});
  const [minLifespan, setMinLifespan] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; label: string } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/testData.json');
      if (!res.ok) throw new Error('Failed to load testData.json');
      const text = await res.text();
      setOriginalJson(text);
      setEditorJson(text);
      setData(JSON.parse(text));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh visualization with current editor data
  const handleRefresh = useCallback(() => {
    try {
      const parsed = JSON.parse(editorJson);
      setData(parsed);
      setExpandedBlocks(new Set());
      setAnimProgress({});
      setRenderKey(k => k + 1);
    } catch (e) {
      alert('Invalid JSON: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  }, [editorJson]);

  // Animation using requestAnimationFrame
  useEffect(() => {
    let lastTime = 0;
    const animationSpeed = 0.003; // Progress per millisecond

    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      setAnimProgress(prev => {
        const next = { ...prev };
        let changed = false;

        // Expand blocks that are in expandedBlocks set
        expandedBlocks.forEach(id => {
          const current = next[id] || 0;
          if (current < 1) {
            next[id] = Math.min(1, current + delta * animationSpeed);
            changed = true;
          }
        });

        // Collapse blocks that are NOT in expandedBlocks set
        Object.keys(next).forEach(k => {
          const id = parseInt(k);
          if (!expandedBlocks.has(id) && next[id] > 0) {
            next[id] = Math.max(0, next[id] - delta * animationSpeed);
            changed = true;
            if (next[id] === 0) delete next[id];
          }
        });

        return changed ? next : prev;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [expandedBlocks]);

  // Filtered entities based on lifespan and crossing filters
  const filteredNames = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(
      data.storylines
        .filter(s => s.name === data.ego || (s.lifespan >= minLifespan && (!crossingOnly || s.crossingCheck)))
        .map(s => s.name)
    );
  }, [data, minLifespan, crossingOnly]);

  // Check if entity should be highlighted
  const isHighlighted = useCallback((name: string): boolean => {
    if (!data) return false;
    if (name === data.ego) return true;
    if (pinnedEntities.size > 0) return pinnedEntities.has(name);
    if (hoveredEntity) return hoveredEntity === name;
    return true;
  }, [data, pinnedEntities, hoveredEntity]);

  // Toggle block expansion
  const toggleBlock = useCallback((blockId: number) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  }, []);

  // Calculate horizontal shift for a given X position
  // Elements shift right when blocks to their left expand
  const getShiftForX = useCallback((posX: number): number => {
    if (!data) return 0;
    let shift = 0;

    data.blocks.forEach(block => {
      const blockX = data.timeLabels.find(t => t.label === block.time)?.posX || 0;
      const progress = easeOutQuad(animProgress[block.id] || 0);

      if (blockX < posX) {
        // Blocks to the left: full shift
        shift += block.moveX * progress;
      }
    });

    return shift;
  }, [data, animProgress]);

  // Get expansion width for a block
  const getExpandWidth = useCallback((blockId: number): number => {
    if (!data) return 0;
    const block = data.blocks.find(b => b.id === blockId);
    if (!block) return 0;
    return block.moveX * easeOutQuad(animProgress[blockId] || 0);
  }, [data, animProgress]);

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

  // Calculate dimensions
  const margin = { top: 100, right: 150, bottom: 50, left: 200 };
  const totalExpand = data.blocks.reduce((sum, block) => {
    return sum + block.moveX * easeOutQuad(animProgress[block.id] || 0);
  }, 0);

  const svgWidth = Math.max(...data.timeLabels.map(t => t.posX)) + margin.left + margin.right + totalExpand + 100;
  const svgHeight = (data.heightExtents?.[1] || 600) + margin.top + margin.bottom + 150;
  const egoStoryline = data.storylines.find(s => s.name === data.ego);
  const egoY = egoStoryline?.label.posY || 400;
  const maxLife = Math.max(...data.storylines.filter(s => s.name !== data.ego).map(s => s.lifespan), 1);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Main visualization */}
      <div className={`flex-1 flex flex-col ${showEditor ? 'w-2/3' : 'w-full'}`}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white">
                SpreadLine <span className="text-cyan-400">Demo v4</span>
              </h1>
              <p className="text-xs text-slate-500">
                {data.storylines.length} entities | {data.blocks.length} blocks | Ego: {data.ego}
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
              <a href="/react-design4" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm">
                Back to Docs
              </a>
            </div>
          </div>
        </header>

        {/* Controls */}
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

        {/* SVG */}
        <div className="flex-1 overflow-auto bg-slate-950">
          <svg
            key={renderKey}
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="bg-slate-950"
          >
            <defs>
              <marker
                id="relationArrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L6,3 z" fill="#424242" />
              </marker>
            </defs>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Background labels */}
              <text x={-margin.left + 30} y={egoY - 180} fill="#64748b" fontSize="50" fontWeight="bold" opacity="0.12">
                External
              </text>
              <text x={-margin.left + 30} y={egoY + 220} fill="#64748b" fontSize="50" fontWeight="bold" opacity="0.12">
                Internal
              </text>

              {/* Time labels - CLICKABLE */}
              {data.timeLabels.map((tl, idx) => {
                const block = data.blocks[idx];
                const shift = getShiftForX(tl.posX) + getExpandWidth(block?.id || 0) / 2;
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
                      className={hasFiltered ? "cursor-pointer" : ""}
                      style={{ cursor: hasFiltered ? 'pointer' : 'default' }}
                      onClick={() => hasFiltered && block && toggleBlock(block.id)}
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

              {/* === LAYER 1: BLOCK BACKGROUNDS === */}
              <g className="block-backgrounds">
                {data.blocks.map((block, idx) => {
                  const tl = data.timeLabels[idx];
                  if (!tl) return null;

                  const expandW = getExpandWidth(block.id);
                  const shift = getShiftForX(tl.posX);
                  const hasFiltered = block.names.some(n => filteredNames.has(n));
                  const isExpanded = expandedBlocks.has(block.id);
                  const progress = easeOutQuad(animProgress[block.id] || 0);

                  // Calculate pill bounds
                  const minY = Math.min(...block.points.map(p => p.posY)) - 20;
                  const maxY = Math.max(...block.points.map(p => p.posY)) + 20;
                  const height = maxY - minY;
                  const radius = Math.min(15, height / 2);

                  // Block center stays in place, expands symmetrically
                  const centerX = tl.posX + shift + expandW / 2;
                  const halfWidth = (data.blockWidth + expandW) / 2;

                  const pillPath = `
                    M ${centerX - halfWidth + radius} ${minY}
                    L ${centerX + halfWidth - radius} ${minY}
                    Q ${centerX + halfWidth} ${minY} ${centerX + halfWidth} ${minY + radius}
                    L ${centerX + halfWidth} ${maxY - radius}
                    Q ${centerX + halfWidth} ${maxY} ${centerX + halfWidth - radius} ${maxY}
                    L ${centerX - halfWidth + radius} ${maxY}
                    Q ${centerX - halfWidth} ${maxY} ${centerX - halfWidth} ${maxY - radius}
                    L ${centerX - halfWidth} ${minY + radius}
                    Q ${centerX - halfWidth} ${minY} ${centerX - halfWidth + radius} ${minY}
                    Z
                  `;

                  return (
                    <g key={`bg-${block.id}`} style={{ opacity: hasFiltered ? 1 : 0.15 }}>
                      {/* Dark background */}
                      <path
                        d={pillPath}
                        fill="#1e293b"
                        stroke={isExpanded ? "#3b82f6" : "#475569"}
                        strokeWidth={isExpanded ? 2 : 1}
                        className="cursor-pointer"
                        onClick={() => hasFiltered && toggleBlock(block.id)}
                      />
                      {/* White overlay when expanded */}
                      {progress > 0 && (
                        <path
                          d={pillPath}
                          fill="white"
                          opacity={progress * 0.95}
                          pointerEvents="none"
                        />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* === LAYER 2: STORYLINES + FILL LINES === */}
              <g className="storylines-layer">
                {data.storylines.map(sl => {
                  const filtered = filteredNames.has(sl.name);
                  const highlighted = isHighlighted(sl.name);
                  const isEgo = sl.name === data.ego;
                  const isPinned = pinnedEntities.has(sl.name);
                  const strokeWidth = isEgo ? 6 : highlighted ? 4 : 2;

                  // Generate fill lines for this storyline through expanded blocks
                  const fillLines: { x1: number; x2: number; y: number }[] = [];

                  data.blocks.forEach((block, blockIdx) => {
                    const expandW = getExpandWidth(block.id);
                    if (expandW < 1) return;

                    // Skip if storyline is a member of this block
                    if (block.names.includes(sl.name)) return;

                    const tl = data.timeLabels[blockIdx];
                    if (!tl) return;

                    // Find Y position for this storyline at this block's X
                    // Use marks to find the nearest Y position
                    let y: number | null = null;

                    // Check if storyline has marks around this position
                    for (let i = 0; i < sl.marks.length - 1; i++) {
                      const m1 = sl.marks[i];
                      const m2 = sl.marks[i + 1];
                      if (m1.posX <= tl.posX && m2.posX >= tl.posX) {
                        // Interpolate Y
                        const t = (tl.posX - m1.posX) / (m2.posX - m1.posX || 1);
                        y = m1.posY + (m2.posY - m1.posY) * t;
                        break;
                      }
                    }

                    if (y === null) return;

                    const shift = getShiftForX(tl.posX);
                    const centerX = tl.posX + shift + expandW / 2;
                    const halfWidth = (data.blockWidth + expandW) / 2;

                    fillLines.push({
                      x1: centerX - halfWidth,
                      x2: centerX + halfWidth,
                      y: y
                    });
                  });

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
                      {/* Original path segments with shift */}
                      {sl.lines.map((line, lineIdx) => {
                        // Extract start X from path
                        const match = line.match(/M\s*([\d.]+)/);
                        const startX = match ? parseFloat(match[1]) : 0;
                        const shift = getShiftForX(startX);

                        // Find which block this segment starts at
                        const startBlockIdx = data.timeLabels.findIndex(tl => Math.abs(tl.posX - startX) < 1);
                        const startBlock = data.blocks[startBlockIdx];
                        const startExpand = startBlock ? getExpandWidth(startBlock.id) / 2 : 0;

                        return (
                          <path
                            key={lineIdx}
                            d={line}
                            transform={`translate(${shift + startExpand}, 0)`}
                            stroke={sl.color}
                            strokeWidth={strokeWidth}
                            fill="none"
                          />
                        );
                      })}

                      {/* Fill lines through expanded blocks */}
                      {fillLines.map((fl, i) => (
                        <line
                          key={`fill-${i}`}
                          x1={fl.x1}
                          y1={fl.y}
                          x2={fl.x2}
                          y2={fl.y}
                          stroke={sl.color}
                          strokeWidth={strokeWidth}
                        />
                      ))}

                      {/* Labels */}
                      {sl.label.visibility === 'visible' && (sl.lifespan > 5 || isEgo || isPinned) && (
                        <g transform={`translate(${getShiftForX(sl.label.posX)}, 0)`}>
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
                        </g>
                      )}

                      {/* Entry/Exit markers - both point RIGHT (direction of time) */}
                      {sl.marks.length > 0 && sl.marks[0].visibility === 'visible' && (
                        <g>
                          {/* Entry marker - first mark, arrow points RIGHT */}
                          {(() => {
                            const mark = sl.marks[0];
                            const sz = Math.sqrt(mark.size) * 2;
                            const shift = getShiftForX(mark.posX);
                            const blockIdx = data.timeLabels.findIndex(tl => Math.abs(tl.posX - mark.posX) < 1);
                            const expand = data.blocks[blockIdx] ? getExpandWidth(data.blocks[blockIdx].id) / 2 : 0;
                            return (
                              <polygon
                                points={`0,${-sz/2} ${sz},0 0,${sz/2}`}
                                transform={`translate(${mark.posX + shift + expand - 10}, ${mark.posY})`}
                                fill={sl.color}
                              />
                            );
                          })()}
                          {/* Exit marker - last mark, arrow points RIGHT */}
                          {sl.marks.length > 1 && (() => {
                            const mark = sl.marks[sl.marks.length - 1];
                            if (mark.visibility !== 'visible') return null;
                            const sz = Math.sqrt(mark.size) * 2;
                            const shift = getShiftForX(mark.posX);
                            const blockIdx = data.timeLabels.findIndex(tl => Math.abs(tl.posX - mark.posX) < 1);
                            const expand = data.blocks[blockIdx] ? getExpandWidth(data.blocks[blockIdx].id) / 2 : 0;
                            return (
                              <polygon
                                points={`0,${-sz/2} ${sz},0 0,${sz/2}`}
                                transform={`translate(${mark.posX + shift + expand + 10}, ${mark.posY})`}
                                fill={sl.color}
                              />
                            );
                          })()}
                        </g>
                      )}

                      {isPinned && (
                        <circle
                          cx={sl.label.posX + getShiftForX(sl.label.posX) + 12}
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

              {/* === LAYER 3: BLOCK FOREGROUNDS (nodes, arcs) === */}
              <g className="block-foregrounds">
                {data.blocks.map((block, idx) => {
                  const tl = data.timeLabels[idx];
                  if (!tl) return null;

                  const expandW = getExpandWidth(block.id);
                  const shift = getShiftForX(tl.posX);
                  const progress = easeOutQuad(animProgress[block.id] || 0);
                  const hasFiltered = block.names.some(n => filteredNames.has(n));
                  const centerX = tl.posX + shift + expandW / 2;

                  return (
                    <g key={`fg-${block.id}`} style={{ opacity: hasFiltered ? 1 : 0.15 }}>
                      {/* Relation arcs - BEHIND nodes */}
                      {progress > 0.3 && block.relations.map(([srcId, tgtId], relIdx) => {
                        const src = block.points.find(p => p.id === srcId);
                        const tgt = block.points.find(p => p.id === tgtId);
                        if (!src || !tgt) return null;

                        const nodeRadius = src.name === data.ego ? 8 : 6;
                        const tgtRadius = tgt.name === data.ego ? 8 : 6;

                        // Source position
                        const sx = centerX + computeEmbedding(src.scaleX, expandW) - expandW / 2;
                        const sy = block.topPosY + computeEmbedding(src.scaleY, expandW);

                        // Target position
                        const tx = centerX + computeEmbedding(tgt.scaleX, expandW) - expandW / 2;
                        const ty = block.topPosY + computeEmbedding(tgt.scaleY, expandW);

                        // Shorten path to stop at target node border
                        const dx = tx - sx;
                        const dy = ty - sy;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const shortenBy = tgtRadius + 4; // Stop before reaching node center
                        const ratio = dist > 0 ? (dist - shortenBy) / dist : 1;
                        const endX = sx + dx * ratio;
                        const endY = sy + dy * ratio;

                        // Control point for curve
                        const midX = (sx + endX) / 2;
                        const midY = Math.min(sy, endY) - 25;

                        return (
                          <path
                            key={relIdx}
                            d={`M${sx},${sy} Q${midX},${midY} ${endX},${endY}`}
                            stroke="#424242"
                            strokeWidth="1.5"
                            fill="none"
                            opacity={(progress - 0.3) / 0.7}
                            markerEnd="url(#relationArrow)"
                          />
                        );
                      })}

                      {/* Node points */}
                      {block.points.map(pt => {
                        const ptFiltered = filteredNames.has(pt.name);
                        const ptHighlighted = isHighlighted(pt.name);
                        const isEgoPt = pt.name === data.ego;
                        const r = isEgoPt ? 8 : 6;

                        // Calculate position
                        let px: number, py: number;
                        if (progress > 0) {
                          px = centerX + computeEmbedding(pt.scaleX, expandW) - expandW / 2;
                          const embY = block.topPosY + computeEmbedding(pt.scaleY, expandW);
                          py = pt.posY * (1 - progress) + embY * progress;
                        } else {
                          px = centerX;
                          py = pt.posY;
                        }

                        return (
                          <g key={`${block.id}-${pt.id}`}>
                            <circle
                              cx={px}
                              cy={py}
                              r={r}
                              fill={getNodeColor(parseInt(pt.label) || 0)}
                              stroke={ptHighlighted ? "#000" : "#666"}
                              strokeWidth={ptHighlighted ? 2 : 1}
                              opacity={ptFiltered ? (ptHighlighted ? 1 : 0.5) : 0.1}
                              className="cursor-pointer"
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
                            {/* Name label when expanded */}
                            {progress > 0.7 && (
                              <text
                                x={px + 12}
                                y={py + 4}
                                fill="#333"
                                fontSize="10"
                                opacity={(progress - 0.7) / 0.3}
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

            {/* Tooltip */}
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

      {/* Data Editor Panel */}
      {showEditor && (
        <div className="w-1/3 border-l border-slate-800 flex flex-col bg-slate-900">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-white font-semibold">Data Editor</h2>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold"
            >
              Refresh Visualization
            </button>
          </div>
          <textarea
            value={editorJson}
            onChange={(e) => setEditorJson(e.target.value)}
            className="flex-1 p-4 bg-slate-950 text-slate-300 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
          <div className="p-2 bg-slate-800 text-xs text-slate-500">
            Edit JSON above, then click "Refresh Visualization" to apply changes
          </div>
        </div>
      )}
    </div>
  );
}

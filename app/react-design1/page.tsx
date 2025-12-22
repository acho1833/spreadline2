'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CodeViewer, { CODE_SNIPPETS } from './components/CodeViewer';
import DataEditor, { PropertyEditor, PointEditor } from './components/DataEditor';
import { TimeAxisDemo } from './components/TimeAxis';
import { StorylineDemo } from './components/Storyline';
import { BlockDemo } from './components/Block';
import { NodeColorDemo, NodePlacementDemo } from './components/NodePoint';
import { LegendDemo } from './components/Legend';
import { FilterDemo } from './components/FilterControls';
import { TooltipDemo } from './components/Tooltip';
import {
  SpreadLineData,
  Point,
  Block,
  Storyline,
  TimeLabel,
  computeEmbedding,
  easeOutQuad,
  getNodeColor
} from './components/types';

// ============================================
// SECTION: Architecture Diagram
// ============================================
function ArchitectureDiagram() {
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  const boxes = [
    { id: 'data', x: 50, y: 20, w: 100, h: 40, label: 'testData.json', color: '#22c55e' },
    { id: 'hook', x: 50, y: 90, w: 100, h: 40, label: 'useSpreadLineData', color: '#3b82f6' },
    { id: 'time', x: 200, y: 30, w: 80, h: 35, label: 'TimeAxis', color: '#8b5cf6' },
    { id: 'story', x: 200, y: 80, w: 80, h: 35, label: 'Storyline', color: '#f59e0b' },
    { id: 'block', x: 200, y: 130, w: 80, h: 35, label: 'Block', color: '#ef4444' },
    { id: 'node', x: 320, y: 130, w: 70, h: 35, label: 'NodePoint', color: '#ec4899' },
    { id: 'legend', x: 320, y: 30, w: 70, h: 35, label: 'Legend', color: '#06b6d4' },
    { id: 'filter', x: 320, y: 80, w: 70, h: 35, label: 'Filter', color: '#14b8a6' },
  ];

  const arrows = [
    { from: 'data', to: 'hook' },
    { from: 'hook', to: 'time' },
    { from: 'hook', to: 'story' },
    { from: 'hook', to: 'block' },
    { from: 'block', to: 'node' },
    { from: 'hook', to: 'legend' },
    { from: 'hook', to: 'filter' },
  ];

  return (
    <svg viewBox="0 0 420 190" className="w-full max-w-2xl bg-slate-950 rounded-xl p-4">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
      </defs>

      {/* Arrows */}
      {arrows.map((arrow, i) => {
        const from = boxes.find(b => b.id === arrow.from)!;
        const to = boxes.find(b => b.id === arrow.to)!;
        const x1 = from.x + from.w;
        const y1 = from.y + from.h / 2;
        const x2 = to.x;
        const y2 = to.y + to.h / 2;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        );
      })}

      {/* Boxes */}
      {boxes.map((box) => (
        <g key={box.id}
          onMouseEnter={() => setHoveredBox(box.id)}
          onMouseLeave={() => setHoveredBox(null)}
          className="cursor-pointer">
          <rect
            x={box.x} y={box.y} width={box.w} height={box.h}
            rx="6"
            fill={hoveredBox === box.id ? box.color : '#1e293b'}
            stroke={box.color}
            strokeWidth="2"
            className="transition-all duration-200"
          />
          <text
            x={box.x + box.w / 2} y={box.y + box.h / 2 + 4}
            fill={hoveredBox === box.id ? 'white' : box.color}
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            {box.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ============================================
// SECTION: Phase Progress Demo
// ============================================
function PhaseProgressDemo() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const phases = [
    {
      id: 0,
      name: 'Phase 1: Static Foundation',
      desc: 'Types, TimeAxis, basic SVG structure',
      features: ['TypeScript interfaces', 'TimeAxis component', 'SVG container'],
    },
    {
      id: 1,
      name: 'Phase 2: Storylines',
      desc: 'Render paths with hover highlighting',
      features: ['Storyline paths', 'Direction labels', 'Hover effects'],
    },
    {
      id: 2,
      name: 'Phase 3: Blocks & Points',
      desc: 'Interactive blocks with nodes',
      features: ['Block outlines', 'Node points', 'Color scale'],
    },
    {
      id: 3,
      name: 'Phase 4: Full Interaction',
      desc: 'Expansion, filtering, pinning',
      features: ['Block expansion', 'Filter controls', 'Pin/highlight'],
    },
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentPhase(p => (p + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${
            autoPlay ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {autoPlay ? 'Auto Playing' : 'Auto Play'}
        </button>
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => { setAutoPlay(false); setCurrentPhase(phase.id); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentPhase === phase.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Phase {phase.id + 1}
          </button>
        ))}
      </div>

      {/* Phase info */}
      <div className="p-4 bg-slate-800 rounded-xl">
        <h4 className="text-white font-bold text-lg">{phases[currentPhase].name}</h4>
        <p className="text-slate-400 text-sm mt-1">{phases[currentPhase].desc}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {phases[currentPhase].features.map((f, i) => (
            <span key={i} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Visual demo based on phase */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
        <PhaseVisualization phase={currentPhase} />
      </div>
    </div>
  );
}

function PhaseVisualization({ phase }: { phase: number }) {
  const years = ['2002', '2004', '2006', '2008', '2010'];

  return (
    <svg viewBox="0 0 600 250" className="w-full bg-slate-950 rounded-xl">
      {/* Phase 1: Time Axis */}
      {phase >= 0 && years.map((year, i) => (
        <g key={year}>
          <text x={80 + i * 110} y="30" fill="#94a3b8" fontSize="12" textAnchor="middle" fontWeight="bold">
            {year}
          </text>
          <line x1={80 + i * 110} y1="40" x2={80 + i * 110} y2="220" stroke="#334155" strokeDasharray="4" opacity="0.4" />
        </g>
      ))}

      {/* Direction labels */}
      {phase >= 0 && (
        <>
          <text x="20" y="80" fill="#64748b" fontSize="14" opacity="0.3">External</text>
          <text x="20" y="190" fill="#64748b" fontSize="14" opacity="0.3">Internal</text>
        </>
      )}

      {/* Phase 2: Storylines */}
      {phase >= 1 && (
        <>
          {/* Ego line */}
          <path d="M80,130 L520,130" stroke="#424242" strokeWidth="5" fill="none" />
          <polygon points="75,130 88,123 88,137" fill="#424242" />
          <text x="65" y="134" fill="#424242" fontSize="10" fontWeight="bold" textAnchor="end">Ego</text>

          {/* Alter lines */}
          <path d="M80,80 C160,80 200,170 300,170 C400,170 440,100 520,100" stroke="#FA9902" strokeWidth="2" fill="none" />
          <polygon points="75,80 88,73 88,87" fill="#FA9902" />
          <text x="65" y="84" fill="#FA9902" fontSize="9" textAnchor="end">Ed Chi</text>

          <path d="M130,180 C210,180 250,90 350,90 L520,90" stroke="#146b6b" strokeWidth="2" fill="none" />
          <polygon points="125,180 138,173 138,187" fill="#146b6b" />
          <text x="115" y="184" fill="#146b6b" fontSize="9" textAnchor="end">Jock M.</text>
        </>
      )}

      {/* Phase 3: Blocks & Points */}
      {phase >= 2 && years.map((_, i) => (
        <g key={`block-${i}`}>
          {/* Block outline */}
          <path
            d={`M${80 + i * 110},55 A12,12,0,0,0,${68 + i * 110},67 L${68 + i * 110},203 A12,12,0,0,0,${80 + i * 110},215`}
            stroke="#64748b" strokeWidth="2" fill="none"
          />
          <path
            d={`M${80 + i * 110},55 A12,12,0,0,1,${92 + i * 110},67 L${92 + i * 110},203 A12,12,0,0,1,${80 + i * 110},215`}
            stroke="#64748b" strokeWidth="2" fill="none"
          />

          {/* Points */}
          {[0, 1, 2].map((j) => (
            <circle
              key={j}
              cx={80 + i * 110}
              cy={80 + j * 50}
              r="5"
              fill={['#fcdaca', '#e599a6', '#c94b77'][j]}
              stroke="#424242"
              strokeWidth="0.5"
            />
          ))}
        </g>
      ))}

      {/* Phase 4: Expanded block */}
      {phase >= 3 && (
        <g>
          {/* Expanded block at position 2 */}
          <rect x={178} y={55} width={130} height={160} rx="12" fill="white" opacity="0.95" />
          <path d="M190,55 A12,12,0,0,0,178,67 L178,203 A12,12,0,0,0,190,215" stroke="#3b82f6" strokeWidth="2" fill="none" />
          <path d="M300,55 A12,12,0,0,1,312,67 L312,203 A12,12,0,0,1,300,215" stroke="#3b82f6" strokeWidth="2" fill="none" />
          <line x1="190" y1="55" x2="300" y2="55" stroke="#3b82f6" strokeWidth="2" />
          <line x1="190" y1="215" x2="300" y2="215" stroke="#3b82f6" strokeWidth="2" />

          {/* Spread points */}
          <circle cx={200} cy={80} r="6" fill="#fcdaca" stroke="#333" strokeWidth="1" />
          <circle cx={250} cy={120} r="7" fill="#424242" stroke="#333" strokeWidth="2" />
          <circle cx={280} cy={160} r="6" fill="#c94b77" stroke="#333" strokeWidth="1" />

          {/* Relation arc */}
          <path d="M250,120 Q265,90 280,160" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#phaseArrow)" />

          {/* Labels */}
          <text x="212" y="78" fill="#333" fontSize="8">Tara</text>
          <text x="262" y="118" fill="#333" fontSize="8" fontWeight="bold">Jeff</text>
          <text x="292" y="158" fill="#333" fontSize="8">Ed</text>
        </g>
      )}

      <defs>
        <marker id="phaseArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#333" />
        </marker>
      </defs>
    </svg>
  );
}

// ============================================
// SECTION: Interactive Block Expansion
// ============================================
function InteractiveBlockDemo() {
  const [step, setStep] = useState(0);
  const steps = [
    { name: 'Collapsed', desc: 'Initial state - nodes stacked vertically' },
    { name: 'Shift', desc: 'Elements to the right shift over' },
    { name: 'Extend', desc: 'Storylines extend with dummy lines' },
    { name: 'Expand', desc: 'Block outline grows wider' },
    { name: 'Position', desc: 'Points spread using PCA values' },
  ];

  return (
    <div className="space-y-6">
      {/* Step buttons */}
      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              step === i
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {i}. {s.name}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="p-3 bg-blue-900/30 rounded-xl text-blue-300 text-sm border border-blue-700">
        {steps[step].desc}
      </div>

      {/* Visualization */}
      <BlockDemo step={step} />

      {/* Progress indicators */}
      <div className="grid grid-cols-5 gap-2">
        {['Shift', 'Extend', 'Expand', 'Position', 'Labels'].map((action, i) => {
          const active = i < step;
          return (
            <div
              key={action}
              className={`p-3 rounded-xl text-center text-xs font-semibold transition-all ${
                active ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {active ? '✓' : '○'} {action}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// SECTION: Interactive Data Playground
// ============================================
function DataPlayground() {
  const [points, setPoints] = useState([
    { name: 'Alice', scaleX: 0.2, scaleY: 0.3, label: 50 },
    { name: 'Bob', scaleX: 0.5, scaleY: 0.5, label: 150 },
    { name: 'Charlie', scaleX: 0.8, scaleY: 0.7, label: 300 },
  ]);
  const [expandWidth, setExpandWidth] = useState(180);

  const handlePointChange = (idx: number, field: string, value: number) => {
    setPoints(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Controls */}
      <div className="space-y-4">
        <div className="p-4 bg-slate-800 rounded-xl">
          <h4 className="text-white font-bold mb-4">Block Width</h4>
          <PropertyEditor
            label="expandWidth"
            value={expandWidth}
            onChange={(v) => setExpandWidth(v as number)}
            min={100}
            max={250}
          />
        </div>

        <div className="p-4 bg-slate-800 rounded-xl">
          <h4 className="text-white font-bold mb-4">Point Positions (PCA values)</h4>
          {points.map((pt, idx) => (
            <div key={idx} className="mb-4 p-3 bg-slate-900 rounded-lg">
              <div className="text-cyan-400 font-semibold text-sm mb-2">{pt.name}</div>
              <div className="space-y-2">
                <PropertyEditor
                  label="scaleX"
                  value={pt.scaleX}
                  onChange={(v) => handlePointChange(idx, 'scaleX', v as number)}
                  min={0}
                  max={1}
                  step={0.05}
                />
                <PropertyEditor
                  label="scaleY"
                  value={pt.scaleY}
                  onChange={(v) => handlePointChange(idx, 'scaleY', v as number)}
                  min={0}
                  max={1}
                  step={0.05}
                />
                <PropertyEditor
                  label="citations"
                  value={pt.label}
                  onChange={(v) => handlePointChange(idx, 'label', v as number)}
                  min={0}
                  max={1000}
                  step={10}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visualization */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
        <h4 className="text-white font-bold mb-4">Live Preview</h4>
        <svg viewBox="0 0 300 300" className="w-full bg-white rounded-xl">
          {/* Block outline */}
          <rect
            x={30}
            y={30}
            width={expandWidth}
            height={expandWidth}
            rx="15"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />

          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v} opacity="0.15">
              <line
                x1={30 + computeEmbedding(v, expandWidth)}
                y1={30}
                x2={30 + computeEmbedding(v, expandWidth)}
                y2={30 + expandWidth}
                stroke="#333"
              />
              <line
                x1={30}
                y1={30 + computeEmbedding(v, expandWidth)}
                x2={30 + expandWidth}
                y2={30 + computeEmbedding(v, expandWidth)}
                stroke="#333"
              />
            </g>
          ))}

          {/* Points */}
          {points.map((pt, i) => {
            const cx = 30 + computeEmbedding(pt.scaleX, expandWidth);
            const cy = 30 + computeEmbedding(pt.scaleY, expandWidth);
            const color = getNodeColor(pt.label);

            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r="12" fill={color} stroke="#333" strokeWidth="2" />
                <text x={cx} y={cy - 18} fill="#333" fontSize="11" textAnchor="middle" fontWeight="bold">
                  {pt.name}
                </text>
                <text x={cx} y={cy + 4} fill="#333" fontSize="9" textAnchor="middle">
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Formula display */}
        <div className="mt-4 p-3 bg-slate-800 rounded-lg font-mono text-xs">
          <div className="text-slate-400">// Position formula</div>
          <div className="text-cyan-400">
            x = 30 + (scaleX + 0.075) * {expandWidth} * 0.85
          </div>
          <div className="text-green-400">
            y = 30 + (scaleY + 0.075) * {expandWidth} * 0.85
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION: Full SpreadLine Demo
// ============================================
function FullSpreadLineDemo() {
  const [data, setData] = useState<SpreadLineData | null>(null);
  const [loading, setLoading] = useState(true);
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
      .then((res) => res.json())
      .then((json) => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockAnimProgress((prev) => {
        const next = { ...prev };
        let changed = false;
        expandedBlocks.forEach((id) => {
          if ((next[id] || 0) < 1) { next[id] = Math.min(1, (next[id] || 0) + 0.05); changed = true; }
        });
        Object.keys(next).forEach((k) => {
          const id = parseInt(k);
          if (!expandedBlocks.has(id) && next[id] > 0) { next[id] = Math.max(0, next[id] - 0.05); changed = true; }
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

  const getShiftX = useCallback((posX: number): number => {
    if (!data) return 0;
    let shift = 0;
    data.blocks.forEach((block) => {
      const blockPosX = data.timeLabels.find(t => t.label === block.time)?.posX || 0;
      const progress = easeOutQuad(blockAnimProgress[block.id] || 0);
      if (blockPosX < posX && expandedBlocks.has(block.id)) shift += block.moveX * progress;
      else if (blockPosX === posX && expandedBlocks.has(block.id)) shift += (block.moveX / 2) * progress;
    });
    return shift;
  }, [data, expandedBlocks, blockAnimProgress]);

  if (loading || !data) {
    return (
      <div className="bg-slate-900 rounded-2xl p-12 border border-slate-700 text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white">Loading SpreadLine data...</div>
        <div className="text-slate-400 text-sm mt-2">Make sure testData.json is in the public folder</div>
      </div>
    );
  }

  const margin = { top: 80, right: 150, bottom: 50, left: 180 };
  const totalExpand = Array.from(expandedBlocks).reduce((sum, id) => {
    const block = data.blocks.find(b => b.id === id);
    return sum + (block ? block.moveX * easeOutQuad(blockAnimProgress[id] || 0) : 0);
  }, 0);
  const svgWidth = Math.max(...data.timeLabels.map(t => t.posX)) + margin.left + margin.right + totalExpand;
  const svgHeight = (data.heightExtents?.[1] || 600) + margin.top + margin.bottom + 100;
  const egoY = data.storylines.find(s => s.name === data.ego)?.label.posY || 414;
  const maxLife = Math.max(...data.storylines.filter(s => s.name !== data.ego).map(s => s.lifespan));

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Min Years:</span>
          <input type="range" min="1" max={maxLife} value={minLifespan}
            onChange={(e) => setMinLifespan(parseInt(e.target.value))} className="w-24 accent-cyan-500" />
          <span className="text-cyan-400 font-bold w-8">{minLifespan}</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={crossingOnly}
            onChange={(e) => setCrossingOnly(e.target.checked)} className="w-5 h-5 accent-cyan-500" />
          <span className="text-slate-300 text-sm">Crossing Only</span>
        </label>
        <div className="text-slate-400 text-sm">
          <span className="text-cyan-400">{filteredNames.size - 1}</span> of {data.storylines.length - 1} alters
        </div>
        {pinnedEntities.size > 0 && (
          <button onClick={() => setPinnedEntities(new Set())}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm">
            Clear {pinnedEntities.size} Pin(s)
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Lines:</span>
          <span className="flex items-center gap-1"><span className="w-4 h-1 bg-[#424242] rounded"></span>Ego</span>
          <span className="flex items-center gap-1"><span className="w-4 h-1 bg-[#146b6b] rounded"></span>Collaborator</span>
          <span className="flex items-center gap-1"><span className="w-4 h-1 bg-[#FA9902] rounded"></span>Colleague</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Citations:</span>
          {[{ c: '#ffffff', l: '<10' }, { c: '#fcdaca', l: '10-50' }, { c: '#e599a6', l: '50-100' },
            { c: '#c94b77', l: '100-500' }, { c: '#740980', l: '500+' }].map(({ c, l }) => (
            <span key={l} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border border-slate-500" style={{ backgroundColor: c }}></span>
              <span className="text-slate-400 text-xs">{l}</span>
            </span>
          ))}
        </div>
      </div>

      {/* SVG Container */}
      <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700" style={{ maxHeight: '550px' }}>
        <svg ref={svgRef} width={svgWidth} height={svgHeight} className="bg-slate-950">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Direction Labels */}
            <text x={-margin.left + 20} y={egoY - 150} fill="#64748b" fontSize="40" fontWeight="bold" opacity="0.15">External</text>
            <text x={-margin.left + 20} y={egoY + 180} fill="#64748b" fontSize="40" fontWeight="bold" opacity="0.15">Internal</text>

            {/* Time Labels */}
            {data.timeLabels.map((tl) => {
              const shift = getShiftX(tl.posX);
              return (
                <g key={tl.label} transform={`translate(${shift}, 0)`}>
                  <text x={tl.posX} y={-30} fill="#94a3b8" fontSize="13" textAnchor="middle" fontWeight="bold">{tl.label}</text>
                  <line x1={tl.posX} y1={-20} x2={tl.posX} y2={svgHeight - margin.top - margin.bottom}
                    stroke="#334155" strokeDasharray="4" opacity="0.4" />
                </g>
              );
            })}

            {/* Storylines */}
            {data.storylines.map((sl) => {
              const filtered = filteredNames.has(sl.name);
              const highlighted = isHighlighted(sl.name);
              const isEgo = sl.name === data.ego;

              return (
                <g key={sl.id}
                  className={`transition-opacity duration-300 ${!filtered ? 'opacity-10' : highlighted ? 'opacity-100' : 'opacity-20'}`}
                  style={{ cursor: isEgo ? 'default' : 'pointer' }}
                  onMouseEnter={() => filtered && !isEgo && setHoveredEntity(sl.name)}
                  onMouseLeave={() => setHoveredEntity(null)}
                  onClick={() => filtered && !isEgo && setPinnedEntities(prev => {
                    const n = new Set(prev);
                    n.has(sl.name) ? n.delete(sl.name) : n.add(sl.name);
                    return n;
                  })}>

                  {sl.lines.map((line, idx) => {
                    const match = line.match(/M([\d.]+)/);
                    const startX = match ? parseFloat(match[1]) : 0;
                    return (
                      <path key={idx} d={line} transform={`translate(${getShiftX(startX)}, 0)`}
                        stroke={sl.color} strokeWidth={isEgo ? 6 : highlighted ? 4 : 2} fill="none" />
                    );
                  })}

                  {sl.marks.map((mark, idx) => {
                    // First marker points RIGHT (into vis), others point LEFT
                    const rot = idx === 0 ? 0 : 180;
                    const sz = Math.sqrt(mark.size) * 2;
                    return (
                      <polygon key={idx} points={`0,${-sz/2} ${sz},0 0,${sz/2}`}
                        transform={`translate(${mark.posX + getShiftX(mark.posX)}, ${mark.posY}) rotate(${rot})`}
                        fill={sl.color} opacity={mark.visibility === 'visible' ? 1 : 0} />
                    );
                  })}

                  {sl.label.visibility === 'visible' && (sl.lifespan > 5 || isEgo || pinnedEntities.has(sl.name)) && (
                    <g transform={`translate(${getShiftX(sl.label.posX)}, 0)`}>
                      <text x={sl.label.posX} y={sl.label.posY} fill={sl.color}
                        fontSize={isEgo ? '13' : '11'} fontWeight={isEgo || pinnedEntities.has(sl.name) ? 'bold' : 'normal'}
                        textAnchor="end" dy="4">
                        {sl.label.label}
                      </text>
                      {!isEgo && sl.label.line && <path d={sl.label.line} stroke={sl.color} strokeWidth="2" fill="none" />}
                    </g>
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

              return (
                <g key={block.id} className={`transition-opacity duration-300 ${hasFiltered ? 'opacity-100' : 'opacity-20'}`}>
                  <rect x={tl.posX - data.blockWidth/2 + baseShift - expandW/2 - 5} y={minY}
                    width={data.blockWidth + expandW + 10} height={maxY - minY}
                    fill="transparent" className="cursor-pointer"
                    onClick={() => hasFiltered && setExpandedBlocks(prev => {
                      const n = new Set(prev);
                      n.has(block.id) ? n.delete(block.id) : n.add(block.id);
                      return n;
                    })} />

                  {progress > 0 && (
                    <rect x={tl.posX - data.blockWidth/2 + baseShift - expandW/2} y={minY + 10}
                      width={data.blockWidth + expandW} height={maxY - minY - 20}
                      rx="20" fill="white" opacity={progress * 0.95} pointerEvents="none" />
                  )}

                  <path d={block.outline.left} transform={`translate(${baseShift - expandW/2}, 0)`}
                    stroke={expandedBlocks.has(block.id) ? '#3b82f6' : '#64748b'} strokeWidth="2" fill="none" pointerEvents="none" />
                  <path d={block.outline.right} transform={`translate(${baseShift + expandW/2}, 0)`}
                    stroke={expandedBlocks.has(block.id) ? '#3b82f6' : '#64748b'} strokeWidth="2" fill="none" pointerEvents="none" />

                  {progress > 0.5 && block.relations.map(([srcId, tgtId], idx) => {
                    const src = block.points.find(p => p.id === srcId);
                    const tgt = block.points.find(p => p.id === tgtId);
                    if (!src || !tgt) return null;
                    const sx = tl.posX + baseShift + computeEmbedding(src.scaleX, expandW) - expandW/2;
                    const sy = block.topPosY + computeEmbedding(src.scaleY, expandW);
                    const tx = tl.posX + baseShift + computeEmbedding(tgt.scaleX, expandW) - expandW/2;
                    const ty = block.topPosY + computeEmbedding(tgt.scaleY, expandW);
                    return (
                      <path key={idx} d={`M${sx},${sy} Q${(sx+tx)/2},${Math.min(sy,ty)-15} ${tx},${ty}`}
                        stroke="#424242" strokeWidth="1.5" fill="none" opacity={(progress-0.5)*2}
                        markerEnd="url(#mainArrow)" pointerEvents="none" />
                    );
                  })}

                  {block.points.map((pt) => {
                    const ptFiltered = filteredNames.has(pt.name);
                    const ptHighlighted = isHighlighted(pt.name);
                    const isEgoPt = pt.name === data.ego;
                    let px = tl.posX + baseShift;
                    let py = pt.posY;
                    if (progress > 0) {
                      px = tl.posX + baseShift + computeEmbedding(pt.scaleX, expandW) - expandW/2;
                      py = block.topPosY + computeEmbedding(pt.scaleY, expandW) * progress + pt.posY * (1-progress) - block.topPosY * (1-progress);
                    }
                    return (
                      <g key={`${block.id}-${pt.id}`}>
                        <circle cx={px} cy={py} r={isEgoPt ? 8 : 6}
                          fill={getNodeColor(parseInt(pt.label) || 0)}
                          stroke={ptHighlighted ? '#000' : '#666'} strokeWidth={ptHighlighted ? 2 : 1}
                          opacity={ptFiltered ? (ptHighlighted ? 1 : 0.5) : 0.1}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={(e) => {
                            if (ptFiltered) {
                              setHoveredEntity(pt.name);
                              const rect = svgRef.current?.getBoundingClientRect();
                              if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, name: pt.name, label: pt.label });
                            }
                          }}
                          onMouseLeave={() => { setHoveredEntity(null); setTooltip(null); }}
                          onClick={(e) => { e.stopPropagation(); if (ptFiltered && !isEgoPt) setPinnedEntities(prev => { const n = new Set(prev); n.has(pt.name) ? n.delete(pt.name) : n.add(pt.name); return n; }); }} />
                        {progress > 0.7 && (
                          <text x={px + 10} y={py + 4} fill="#333" fontSize="9" opacity={(progress-0.7)*3.33} pointerEvents="none">
                            {pt.name.split(' ')[0]}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            <defs>
              <marker id="mainArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#424242" />
              </marker>
            </defs>
          </g>

          {tooltip && (
            <g transform={`translate(${tooltip.x + 15}, ${tooltip.y - 10})`}>
              <rect x="0" y="-20" width="150" height="45" rx="6" fill="#1e293b" stroke="#475569" />
              <text x="10" y="-2" fill="white" fontSize="12" fontWeight="bold">{tooltip.name}</text>
              <text x="10" y="16" fill="#94a3b8" fontSize="11">Citations: {tooltip.label}</text>
            </g>
          )}
        </svg>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-xl p-3 flex items-center justify-between text-sm text-slate-400">
        <div>
          <span className="text-cyan-400">{data.storylines.length}</span> entities |{' '}
          <span className="text-cyan-400">{data.blocks.length}</span> blocks |{' '}
          <span className="text-cyan-400">{data.timeLabels[0]?.label} - {data.timeLabels[data.timeLabels.length - 1]?.label}</span>
        </div>
        <div>
          {expandedBlocks.size > 0 && <span className="text-green-400 mr-4">{expandedBlocks.size} expanded</span>}
          {pinnedEntities.size > 0 && <span className="text-red-400">{pinnedEntities.size} pinned</span>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function ReactDesign1Page() {
  const sections = [
    { id: 'overview', title: 'Overview', icon: '1' },
    { id: 'architecture', title: 'Architecture', icon: '2' },
    { id: 'components', title: 'Components', icon: '3' },
    { id: 'phases', title: 'Phases', icon: '4' },
    { id: 'playground', title: 'Playground', icon: '5' },
    { id: 'demo', title: 'Full Demo', icon: '6' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-cyan-900/20 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                SpreadLine React Architecture
              </h1>
              <p className="text-xs text-slate-500">Interactive Technical Documentation - react-design1</p>
            </div>
            <div className="flex gap-1">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">{s.icon}</span>
                  <span className="hidden sm:inline">{s.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-8 space-y-16">

        {/* Section 1: Overview */}
        <section id="overview" className="scroll-mt-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-full border border-purple-700 mb-4">
              <span className="text-purple-400">Phase 1</span>
              <span className="text-slate-400">of the React Conversion</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Converting <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">SpreadLine</span> to React
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              This document outlines the component architecture for converting the D3.js SpreadLine visualization to React/Next.js with TypeScript.
              Each component is demonstrated interactively with viewable source code.
            </p>
          </div>

          {/* Key Goals */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '🎯', title: 'Type Safety', desc: 'Full TypeScript interfaces for all data structures' },
              { icon: '🧩', title: 'Composable', desc: 'Modular components that can be reused and tested' },
              { icon: '⚡', title: 'Reactive', desc: 'State-driven rendering with React hooks' },
              { icon: '🎨', title: 'Animated', desc: 'Smooth transitions for all interactions' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="text-white font-bold">{item.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Architecture */}
        <section id="architecture" className="scroll-mt-20">
          <h2 className="text-2xl font-black text-white mb-2">Component Architecture</h2>
          <p className="text-slate-400 mb-6">How data flows through the React component tree</p>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
              <h3 className="text-white font-bold mb-4">Data Flow Diagram</h3>
              <ArchitectureDiagram />
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                <h3 className="text-white font-bold mb-3">File Structure</h3>
                <pre className="text-sm text-slate-400 font-mono">
{`app/react-design1/
├── page.tsx           # Main page
├── components/
│   ├── types.ts       # TypeScript interfaces
│   ├── CodeViewer.tsx # Code display
│   ├── DataEditor.tsx # JSON editor
│   ├── TimeAxis.tsx   # Time labels
│   ├── Storyline.tsx  # Line paths
│   ├── Block.tsx      # Expandable blocks
│   ├── NodePoint.tsx  # Circle nodes
│   ├── Legend.tsx     # Color scales
│   ├── FilterControls.tsx
│   └── Tooltip.tsx`}
                </pre>
              </div>

              <CodeViewer code={CODE_SNIPPETS.types} title="TypeScript Types (types.ts)" />
            </div>
          </div>
        </section>

        {/* Section 3: Components */}
        <section id="components" className="scroll-mt-20">
          <h2 className="text-2xl font-black text-white mb-2">Component Demos</h2>
          <p className="text-slate-400 mb-6">Each component with interactive demo and source code</p>

          <div className="space-y-8">
            {/* TimeAxis Demo */}
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="text-white font-bold text-lg">TimeAxis Component</h3>
                  <p className="text-slate-400 text-sm">Renders time labels and vertical guide lines</p>
                </div>
              </div>
              <TimeAxisDemo showLabels={true} showRules={true} animated={true} />
              <CodeViewer code={CODE_SNIPPETS.timeAxis} title="TimeAxis.tsx" />
            </div>

            {/* Storyline Demo */}
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Storyline Component</h3>
                  <p className="text-slate-400 text-sm">SVG paths representing entity timelines</p>
                </div>
              </div>
              <StorylineDemo showEgo={true} showAlters={true} />
              <CodeViewer code={CODE_SNIPPETS.storyline} title="Storyline.tsx" />
            </div>

            {/* NodePoint Demo */}
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="text-white font-bold text-lg">NodePoint Component</h3>
                  <p className="text-slate-400 text-sm">Color-coded circles representing attributes</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <NodeColorDemo />
                <NodePlacementDemo />
              </div>
              <CodeViewer code={CODE_SNIPPETS.nodePoint} title="NodePoint.tsx" />
            </div>

            {/* Legend Demo */}
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">4</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Legend Component</h3>
                  <p className="text-slate-400 text-sm">Line and node color scales</p>
                </div>
              </div>
              <LegendDemo />
            </div>

            {/* Filter Demo */}
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">5</div>
                <div>
                  <h3 className="text-white font-bold text-lg">FilterControls Component</h3>
                  <p className="text-slate-400 text-sm">Lifespan slider and crossing filter</p>
                </div>
              </div>
              <FilterDemo />
              <CodeViewer code={CODE_SNIPPETS.filterControls} title="FilterControls.tsx" />
            </div>

            {/* Tooltip Demo */}
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">6</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Tooltip Component</h3>
                  <p className="text-slate-400 text-sm">Hover information display</p>
                </div>
              </div>
              <TooltipDemo />
            </div>
          </div>
        </section>

        {/* Section 4: Phases */}
        <section id="phases" className="scroll-mt-20">
          <h2 className="text-2xl font-black text-white mb-2">Progressive Build Phases</h2>
          <p className="text-slate-400 mb-6">Watch the visualization build up step by step</p>

          <PhaseProgressDemo />

          <div className="mt-8">
            <h3 className="text-white font-bold text-lg mb-4">Block Expansion Animation</h3>
            <InteractiveBlockDemo />
            <CodeViewer code={CODE_SNIPPETS.animation} title="Animation Logic" />
          </div>
        </section>

        {/* Section 5: Playground */}
        <section id="playground" className="scroll-mt-20">
          <h2 className="text-2xl font-black text-white mb-2">Interactive Data Playground</h2>
          <p className="text-slate-400 mb-6">Modify values and see changes in real-time</p>

          <DataPlayground />

          <div className="mt-8">
            <CodeViewer code={CODE_SNIPPETS.computeEmbedding} title="Position Calculation" />
          </div>
        </section>

        {/* Section 6: Full Demo */}
        <section id="demo" className="scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-3">
              Full <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">SpreadLine Demo</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Complete interactive visualization with all features. Hover to highlight, click to pin, click blocks to expand.
            </p>
          </div>

          <FullSpreadLineDemo />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-800">
          <p className="text-slate-500">SpreadLine: Visualizing Egocentric Dynamic Influence</p>
          <p className="text-slate-600 text-sm mt-1">React Design v1 - Component Architecture Documentation</p>
          <p className="text-slate-700 text-xs mt-2">Created with Next.js 16 + TypeScript + Tailwind CSS</p>
        </footer>
      </main>
    </div>
  );
}

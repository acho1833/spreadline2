'use client';

interface FilterControlsProps {
  minLifespan: number;
  maxLifespan: number;
  crossingOnly: boolean;
  onLifespanChange: (value: number) => void;
  onCrossingChange: (value: boolean) => void;
  filteredCount: number;
  totalCount: number;
  pinnedCount?: number;
  onClearPins?: () => void;
}

export default function FilterControls({
  minLifespan,
  maxLifespan,
  crossingOnly,
  onLifespanChange,
  onCrossingChange,
  filteredCount,
  totalCount,
  pinnedCount = 0,
  onClearPins
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-800 rounded-xl">
      {/* Lifespan slider */}
      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-sm">Min Years:</span>
        <input
          type="range"
          min="1"
          max={maxLifespan}
          value={minLifespan}
          onChange={(e) => onLifespanChange(parseInt(e.target.value))}
          className="w-24 accent-cyan-500"
        />
        <span className="text-cyan-400 font-bold w-8">{minLifespan}</span>
      </div>

      {/* Crossing checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={crossingOnly}
          onChange={(e) => onCrossingChange(e.target.checked)}
          className="w-5 h-5 accent-cyan-500"
        />
        <span className="text-slate-300 text-sm">Crossing Only</span>
      </label>

      {/* Count display */}
      <div className="text-slate-400 text-sm">
        <span className="text-cyan-400">{filteredCount}</span> of {totalCount} alters
      </div>

      {/* Clear pins button */}
      {pinnedCount > 0 && onClearPins && (
        <button
          onClick={onClearPins}
          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
        >
          Clear {pinnedCount} Pin(s)
        </button>
      )}

      {/* Help text */}
      <div className="text-slate-500 text-xs ml-auto hidden md:block">
        Hover to highlight | Click line to pin | Click block to expand
      </div>
    </div>
  );
}

// Interactive demo
interface FilterDemoProps {
  onFilterChange?: (minYears: number, crossingOnly: boolean) => void;
}

export function FilterDemo({ onFilterChange }: FilterDemoProps) {
  const demoStorylines = [
    { id: 0, name: 'Jeffrey Heer', color: '#424242', lifespan: 21, isEgo: true, crossingCheck: false },
    { id: 1, name: 'Ed H. Chi', color: '#FA9902', lifespan: 8, isEgo: false, crossingCheck: true },
    { id: 2, name: 'Jock D. Mackinlay', color: '#146b6b', lifespan: 14, isEgo: false, crossingCheck: true },
    { id: 3, name: 'Tamara Munzner', color: '#146b6b', lifespan: 12, isEgo: false, crossingCheck: false },
    { id: 4, name: 'Wesley Willett', color: '#146b6b', lifespan: 6, isEgo: false, crossingCheck: true },
  ];

  const [minYears, setMinYears] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);

  const visible = demoStorylines.filter(
    s => s.isEgo || (s.lifespan >= minYears && (!crossingOnly || s.crossingCheck))
  );

  const handleLifespanChange = (value: number) => {
    setMinYears(value);
    onFilterChange?.(value, crossingOnly);
  };

  const handleCrossingChange = (value: boolean) => {
    setCrossingOnly(value);
    onFilterChange?.(minYears, value);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid md:grid-cols-3 gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-700">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Minimum Years</span>
            <span className="text-3xl font-black text-cyan-400">{minYears}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={minYears}
            onChange={(e) => handleLifespanChange(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-full accent-cyan-500"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl cursor-pointer w-full">
            <input
              type="checkbox"
              checked={crossingOnly}
              onChange={(e) => handleCrossingChange(e.target.checked)}
              className="w-6 h-6 accent-cyan-500"
            />
            <div>
              <div className="text-white font-semibold">Crossing Only</div>
              <div className="text-slate-400 text-sm">Cross the ego line</div>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-center p-4 bg-gradient-to-r from-purple-900 to-cyan-900 rounded-xl w-full">
            <div className="text-4xl font-black text-white">{visible.length - 1}</div>
            <div className="text-purple-200">alters showing</div>
          </div>
        </div>
      </div>

      {/* Visual preview */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-700">
        <h4 className="text-white font-bold mb-4">Filtered Preview</h4>

        <svg viewBox="0 0 700 200" className="w-full bg-slate-950 rounded-xl">
          {/* Direction labels */}
          <text x="10" y="50" fill="#64748b" fontSize="12" opacity="0.5">External</text>
          <text x="10" y="160" fill="#64748b" fontSize="12" opacity="0.5">Internal</text>

          {/* Time labels */}
          {['2002', '2004', '2006', '2008', '2010', '2012'].map((year, i) => (
            <g key={year}>
              <text x={100 + i * 100} y="20" fill="#94a3b8" fontSize="10" textAnchor="middle">{year}</text>
              <line x1={100 + i * 100} y1="28" x2={100 + i * 100} y2="180" stroke="#334155" strokeDasharray="3" opacity="0.3" />
            </g>
          ))}

          {/* Ego */}
          <path d="M100,100 L600,100" stroke="#424242" strokeWidth="5" fill="none" />
          <polygon points="95,100 108,93 108,107" fill="#424242" />
          <text x="85" y="104" fill="#424242" fontSize="10" fontWeight="bold" textAnchor="end">Ego</text>

          {/* Alters */}
          {demoStorylines.filter(s => !s.isEgo).map((s, i) => {
            const isVis = visible.includes(s);
            const startY = s.crossingCheck ? [50, 150][i % 2] : (i < 2 ? 70 : 130);
            const endY = s.crossingCheck ? [150, 50][i % 2] : startY;

            return (
              <g key={s.id} opacity={isVis ? 1 : 0.1} className="transition-opacity duration-500">
                <path
                  d={`M${100 + i * 30},${startY} C${200 + i * 30},${startY} ${400},${endY} 600,${endY}`}
                  stroke={s.color}
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points={`${95 + i * 30},${startY} ${108 + i * 30},${startY - 7} ${108 + i * 30},${startY + 7}`}
                  fill={s.color}
                />
                <text x={85 + i * 30} y={startY + 4} fill={s.color} fontSize="9" textAnchor="end">
                  {s.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Entity list */}
        <div className="mt-4 flex flex-wrap gap-2">
          {demoStorylines.map((s) => (
            <div
              key={s.id}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-opacity ${
                s.isEgo ? 'bg-cyan-900' :
                visible.includes(s) ? 'bg-slate-800' : 'bg-slate-900 opacity-30'
              }`}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-white">{s.name}</span>
              {!s.isEgo && <span className="text-slate-500 text-xs">{s.lifespan}y</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Need to import useState for the FilterDemo
import { useState } from 'react';

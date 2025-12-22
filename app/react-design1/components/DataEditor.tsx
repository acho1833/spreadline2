'use client';

import { useState, useCallback } from 'react';

interface DataEditorProps {
  data: object;
  onChange: (newData: object) => void;
  title?: string;
}

export default function DataEditor({ data, onChange, title = 'Edit Data' }: DataEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);
    setIsDirty(true);
    setError(null);

    try {
      const parsed = JSON.parse(newText);
      onChange(parsed);
    } catch {
      setError('Invalid JSON');
    }
  }, [onChange]);

  const handleReset = useCallback(() => {
    setJsonText(JSON.stringify(data, null, 2));
    setError(null);
    setIsDirty(false);
  }, [data]);

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      setError('Cannot format: Invalid JSON');
    }
  }, [jsonText]);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-850 hover:from-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-cyan-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white font-semibold text-sm">{title}</span>
          <span className="px-2 py-0.5 bg-cyan-900 text-cyan-300 rounded text-xs">Interactive</span>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>}
          {error && <span className="text-red-400 text-xs">{error}</span>}
        </div>
      </button>

      {/* Editor */}
      {isExpanded && (
        <div className="relative">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-y border-slate-700">
            <div className="flex items-center gap-2">
              <button
                onClick={handleFormat}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
              >
                Format
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="text-slate-500 text-xs">
              {jsonText.split('\n').length} lines | Changes apply instantly
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={jsonText}
              onChange={handleTextChange}
              className={`w-full h-80 p-4 bg-slate-950 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                error ? 'text-red-300 border-l-2 border-red-500' : 'text-slate-300'
              }`}
              spellCheck={false}
            />
          </div>

          {/* Tips */}
          <div className="px-4 py-2 bg-slate-800 text-xs text-slate-500">
            Tip: Edit values and watch the visualization update in real-time
          </div>
        </div>
      )}
    </div>
  );
}

// Simple data editor for specific properties
interface PropertyEditorProps {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  type?: 'number' | 'text' | 'color';
  min?: number;
  max?: number;
  step?: number;
}

export function PropertyEditor({
  label,
  value,
  onChange,
  type = 'number',
  min = 0,
  max = 100,
  step = 1
}: PropertyEditorProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-slate-400 text-sm min-w-[100px]">{label}</label>
      {type === 'number' ? (
        <>
          <input
            type="range"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="flex-1 accent-cyan-500"
          />
          <span className="text-cyan-400 font-mono text-sm w-16 text-right">{value}</span>
        </>
      ) : type === 'color' ? (
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded cursor-pointer"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
      )}
    </div>
  );
}

// Point editor for interactive demos
interface PointEditorProps {
  points: Array<{ name: string; scaleX: number; scaleY: number; color?: string }>;
  onChange: (index: number, field: string, value: number | string) => void;
}

export function PointEditor({ points, onChange }: PointEditorProps) {
  return (
    <div className="space-y-4">
      {points.map((pt, idx) => (
        <div key={idx} className="p-3 bg-slate-800 rounded-xl">
          <div className="text-white font-semibold text-sm mb-2">{pt.name}</div>
          <div className="space-y-2">
            <PropertyEditor
              label="scaleX"
              value={pt.scaleX}
              onChange={(v) => onChange(idx, 'scaleX', v)}
              min={0}
              max={1}
              step={0.01}
            />
            <PropertyEditor
              label="scaleY"
              value={pt.scaleY}
              onChange={(v) => onChange(idx, 'scaleY', v)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Storyline editor
interface StorylineEditorProps {
  storylines: Array<{ name: string; color: string; lifespan: number }>;
  onChange: (index: number, field: string, value: string | number) => void;
}

export function StorylineEditor({ storylines, onChange }: StorylineEditorProps) {
  return (
    <div className="space-y-2">
      {storylines.map((sl, idx) => (
        <div key={idx} className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg">
          <input
            type="color"
            value={sl.color}
            onChange={(e) => onChange(idx, 'color', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <span className="text-slate-300 text-sm flex-1">{sl.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">lifespan:</span>
            <input
              type="number"
              value={sl.lifespan}
              onChange={(e) => onChange(idx, 'lifespan', parseInt(e.target.value))}
              className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-300 text-sm"
              min={1}
              max={50}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

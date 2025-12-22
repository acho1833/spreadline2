'use client';

import { useState, useCallback, useRef } from 'react';

interface DataEditorProps {
  initialData: string;
  onDataChange: (data: object | null, error: string | null) => void;
  onRefresh: () => void;
}

export default function DataEditor({ initialData, onDataChange, onRefresh }: DataEditorProps) {
  const [jsonText, setJsonText] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const lastValidData = useRef<object | null>(null);

  const validateJson = useCallback((text: string): object | null => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      setIsValid(true);
      return parsed;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Invalid JSON';
      setError(errMsg);
      setIsValid(false);
      return null;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);
    setHasChanges(true);

    const parsed = validateJson(newText);
    if (parsed) {
      lastValidData.current = parsed;
      onDataChange(parsed, null);
    } else {
      onDataChange(null, error);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
      setIsValid(true);
    } catch {
      setError('Cannot format: Invalid JSON');
    }
  };

  const handleReset = () => {
    setJsonText(initialData);
    setHasChanges(false);
    const parsed = validateJson(initialData);
    if (parsed) {
      lastValidData.current = parsed;
      onDataChange(parsed, null);
    }
  };

  const handleRefresh = () => {
    const parsed = validateJson(jsonText);
    if (parsed) {
      lastValidData.current = parsed;
      onDataChange(parsed, null);
      onRefresh();
      setHasChanges(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">Data Editor</span>
          {isValid ? (
            <span className="px-2 py-0.5 bg-green-900 text-green-300 rounded text-xs">Valid</span>
          ) : (
            <span className="px-2 py-0.5 bg-red-900 text-red-300 rounded text-xs">Invalid</span>
          )}
          {hasChanges && isValid && (
            <span className="px-2 py-0.5 bg-yellow-900 text-yellow-300 rounded text-xs">Modified</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
          >
            Format
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
          >
            Reset
          </button>
          <button
            onClick={handleRefresh}
            disabled={!isValid}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              isValid
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-900/50 text-red-300 text-xs border-b border-red-800">
          {error}
        </div>
      )}

      <textarea
        value={jsonText}
        onChange={handleChange}
        className={`flex-1 w-full p-4 bg-slate-950 text-sm font-mono resize-none focus:outline-none ${
          isValid ? 'text-slate-300' : 'text-red-300'
        }`}
        spellCheck={false}
        placeholder="Paste JSON data here..."
      />

      <div className="px-4 py-2 bg-slate-800 text-xs text-slate-500 border-t border-slate-700">
        Edit the JSON, then click <span className="text-cyan-400 font-semibold">Refresh</span> to update the visualization
      </div>
    </div>
  );
}

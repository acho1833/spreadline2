'use client';

import { useState, useCallback } from 'react';

interface DataEditorProps {
  initialData: string;
  onDataChange: (data: object | null, error: string | null) => void;
}

export default function DataEditor({ initialData, onDataChange }: DataEditorProps) {
  const [jsonText, setJsonText] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  const validateAndNotify = useCallback((text: string) => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      setIsValid(true);
      onDataChange(parsed, null);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Invalid JSON';
      setError(errMsg);
      setIsValid(false);
      onDataChange(null, errMsg);
    }
  }, [onDataChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);
    validateAndNotify(newText);
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
    validateAndNotify(initialData);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">Data Editor</span>
          {isValid ? (
            <span className="px-2 py-0.5 bg-green-900 text-green-300 rounded text-xs">Valid</span>
          ) : (
            <span className="px-2 py-0.5 bg-red-900 text-red-300 rounded text-xs">Invalid</span>
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
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-900/50 text-red-300 text-xs border-b border-red-800">
          {error}
        </div>
      )}

      {/* Editor */}
      <textarea
        value={jsonText}
        onChange={handleChange}
        className={`flex-1 w-full p-4 bg-slate-950 text-sm font-mono resize-none focus:outline-none ${
          isValid ? 'text-slate-300' : 'text-red-300'
        }`}
        spellCheck={false}
        placeholder="Paste JSON data here..."
      />

      {/* Help text */}
      <div className="px-4 py-2 bg-slate-800 text-xs text-slate-500 border-t border-slate-700">
        Edit the JSON and the visualization will update automatically when valid
      </div>
    </div>
  );
}

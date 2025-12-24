'use client';

import { useState, useEffect } from 'react';

interface ComparisonResult {
  python: any | null;
  typescript: any | null;
  pythonError: string | null;
  typescriptError: string | null;
  loading: boolean;
}

export default function DemoComparisonPage() {
  const [result, setResult] = useState<ComparisonResult>({
    python: null,
    typescript: null,
    pythonError: null,
    typescriptError: null,
    loading: false
  });
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['root']));
  const [diffMode, setDiffMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const fetchData = async () => {
    setResult(prev => ({ ...prev, loading: true }));

    // Fetch from Python endpoint
    let pythonData = null;
    let pythonError = null;
    try {
      const pythonRes = await fetch('https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine');
      if (!pythonRes.ok) throw new Error(`HTTP ${pythonRes.status}`);
      pythonData = await pythonRes.json();
    } catch (e) {
      pythonError = e instanceof Error ? e.message : 'Unknown error';
    }

    // Fetch from TypeScript endpoint
    let typescriptData = null;
    let typescriptError = null;
    try {
      const tsRes = await fetch('/api/nodeFetchSpreadLine2');
      if (!tsRes.ok) throw new Error(`HTTP ${tsRes.status}`);
      typescriptData = await tsRes.json();
    } catch (e) {
      typescriptError = e instanceof Error ? e.message : 'Unknown error';
    }

    setResult({
      python: pythonData,
      typescript: typescriptData,
      pythonError,
      typescriptError,
      loading: false
    });
  };

  const toggleKey = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const compareValues = (py: any, ts: any): 'match' | 'mismatch' | 'partial' => {
    if (py === ts) return 'match';
    if (typeof py !== typeof ts) return 'mismatch';
    if (typeof py === 'number' && typeof ts === 'number') {
      // Allow small floating point differences
      if (Math.abs(py - ts) < 0.01) return 'match';
      if (Math.abs(py - ts) < 1) return 'partial';
    }
    if (Array.isArray(py) && Array.isArray(ts)) {
      if (py.length !== ts.length) return 'partial';
    }
    return 'mismatch';
  };

  const getSummary = () => {
    if (!result.python || !result.typescript) return null;

    const py = result.python;
    const ts = result.typescript;

    return {
      ego: { py: py.ego, ts: ts.ego, match: py.ego === ts.ego },
      mode: { py: py.mode, ts: ts.mode, match: py.mode === ts.mode },
      bandWidth: {
        py: py.bandWidth,
        ts: ts.bandWidth,
        match: Math.abs((py.bandWidth || 0) - (ts.bandWidth || 0)) < 1
      },
      storylines: {
        py: py.storylines?.length,
        ts: ts.storylines?.length,
        match: py.storylines?.length === ts.storylines?.length
      },
      blocks: {
        py: py.blocks?.length,
        ts: ts.blocks?.length,
        match: py.blocks?.length === ts.blocks?.length
      },
      timeLabels: {
        py: py.timeLabels?.length,
        ts: ts.timeLabels?.length,
        match: py.timeLabels?.length === ts.timeLabels?.length
      }
    };
  };

  const summary = getSummary();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">SpreadLine API Comparison</h1>
            <p className="text-gray-400">Python vs TypeScript Implementation</p>
          </div>
          <div className="flex gap-4">
            <select
              value={diffMode}
              onChange={(e) => setDiffMode(e.target.value as any)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
            >
              <option value="side-by-side">Side by Side</option>
              <option value="unified">Unified</option>
            </select>
            <button
              onClick={fetchData}
              disabled={result.loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded font-semibold"
            >
              {result.loading ? 'Loading...' : 'Fetch & Compare'}
            </button>
          </div>
        </div>

        {/* Endpoints */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold text-yellow-400 mb-2">Python Endpoint</h3>
            <code className="text-xs text-gray-400 break-all">
              https://reimagined-spoon-jj45xv6j7jjpcj6w6-5300.app.github.dev/fetchSpreadLine
            </code>
            {result.pythonError && (
              <p className="text-red-400 mt-2 text-sm">Error: {result.pythonError}</p>
            )}
            {result.python && (
              <p className="text-green-400 mt-2 text-sm">Connected</p>
            )}
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold text-blue-400 mb-2">TypeScript Endpoint</h3>
            <code className="text-xs text-gray-400 break-all">
              /api/nodeFetchSpreadLine2
            </code>
            {result.typescriptError && (
              <p className="text-red-400 mt-2 text-sm">Error: {result.typescriptError}</p>
            )}
            {result.typescript && (
              <p className="text-green-400 mt-2 text-sm">Connected</p>
            )}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="bg-gray-800 p-4 rounded mb-6">
            <h3 className="font-semibold mb-4">Comparison Summary</h3>
            <div className="grid grid-cols-6 gap-4 text-sm">
              {Object.entries(summary).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-gray-400 mb-1">{key}</div>
                  <div className={`font-mono ${value.match ? 'text-green-400' : 'text-yellow-400'}`}>
                    {value.match ? '=' : '~'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="text-yellow-400">{String(value.py)}</span>
                    {' / '}
                    <span className="text-blue-400">{String(value.ts)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JSON Comparison */}
        {diffMode === 'side-by-side' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Python Response</h3>
              <div className="bg-gray-800 p-4 rounded max-h-[600px] overflow-auto">
                {result.python ? (
                  <JsonTree
                    data={result.python}
                    path="root"
                    expandedKeys={expandedKeys}
                    toggleKey={toggleKey}
                    compareWith={result.typescript}
                  />
                ) : (
                  <p className="text-gray-500">Click "Fetch & Compare" to load data</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">TypeScript Response</h3>
              <div className="bg-gray-800 p-4 rounded max-h-[600px] overflow-auto">
                {result.typescript ? (
                  <JsonTree
                    data={result.typescript}
                    path="root"
                    expandedKeys={expandedKeys}
                    toggleKey={toggleKey}
                    compareWith={result.python}
                  />
                ) : (
                  <p className="text-gray-500">Click "Fetch & Compare" to load data</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">Unified Diff</h3>
            <div className="bg-gray-800 p-4 rounded max-h-[600px] overflow-auto">
              {result.python && result.typescript ? (
                <UnifiedDiff python={result.python} typescript={result.typescript} />
              ) : (
                <p className="text-gray-500">Click "Fetch & Compare" to load data</p>
              )}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 pt-4 border-t border-gray-700">
          <a href="/node-design3" className="text-blue-400 hover:underline">
            Back to Documentation
          </a>
        </div>
      </div>
    </div>
  );
}

// JSON Tree Component
function JsonTree({
  data,
  path,
  expandedKeys,
  toggleKey,
  compareWith,
  depth = 0
}: {
  data: any;
  path: string;
  expandedKeys: Set<string>;
  toggleKey: (key: string) => void;
  compareWith?: any;
  depth?: number;
}) {
  if (data === null) return <span className="text-gray-500">null</span>;
  if (data === undefined) return <span className="text-gray-500">undefined</span>;

  if (typeof data !== 'object') {
    const compareValue = compareWith;
    const isDiff = compareValue !== undefined && data !== compareValue;
    return (
      <span className={isDiff ? 'text-yellow-300' : 'text-green-300'}>
        {typeof data === 'string' ? `"${data}"` : String(data)}
      </span>
    );
  }

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);
  const isExpanded = expandedKeys.has(path);

  if (keys.length === 0) {
    return <span className="text-gray-500">{isArray ? '[]' : '{}'}</span>;
  }

  const previewCount = 3;
  const preview = keys.slice(0, previewCount).map(k =>
    isArray ? '...' : k
  ).join(', ');

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <button
        onClick={() => toggleKey(path)}
        className="text-gray-400 hover:text-white"
      >
        {isExpanded ? '-' : '+'} {isArray ? '[' : '{'}{!isExpanded && ` ${preview}${keys.length > previewCount ? ', ...' : ''} `}{!isExpanded && (isArray ? ']' : '}')}
        <span className="text-gray-600 ml-2 text-xs">{keys.length} items</span>
      </button>

      {isExpanded && (
        <div>
          {keys.map((key, idx) => (
            <div key={key} className="flex">
              <span className="text-purple-400 mr-2">
                {isArray ? `[${key}]` : `"${key}":`}
              </span>
              <JsonTree
                data={data[key]}
                path={`${path}.${key}`}
                expandedKeys={expandedKeys}
                toggleKey={toggleKey}
                compareWith={compareWith?.[key]}
                depth={depth + 1}
              />
              {idx < keys.length - 1 && <span className="text-gray-600">,</span>}
            </div>
          ))}
          <span className="text-gray-400">{isArray ? ']' : '}'}</span>
        </div>
      )}
    </div>
  );
}

// Unified Diff Component
function UnifiedDiff({ python, typescript }: { python: any; typescript: any }) {
  const allKeys = new Set([
    ...Object.keys(python || {}),
    ...Object.keys(typescript || {})
  ]);

  return (
    <div className="space-y-2 font-mono text-sm">
      {[...allKeys].map(key => {
        const pyVal = python?.[key];
        const tsVal = typescript?.[key];
        const pyStr = JSON.stringify(pyVal, null, 2)?.split('\n')[0] || 'undefined';
        const tsStr = JSON.stringify(tsVal, null, 2)?.split('\n')[0] || 'undefined';

        const isMatch = JSON.stringify(pyVal) === JSON.stringify(tsVal);
        const pyLen = Array.isArray(pyVal) ? pyVal.length : typeof pyVal === 'object' ? Object.keys(pyVal || {}).length : null;
        const tsLen = Array.isArray(tsVal) ? tsVal.length : typeof tsVal === 'object' ? Object.keys(tsVal || {}).length : null;

        return (
          <div key={key} className={`p-2 rounded ${isMatch ? 'bg-gray-800' : 'bg-yellow-900/30'}`}>
            <div className="text-purple-400 font-semibold">{key}</div>
            <div className="flex gap-4 text-xs">
              <div className="flex-1">
                <span className="text-yellow-400">Python: </span>
                <span className="text-gray-300">
                  {pyLen !== null ? `[${pyLen} items]` : pyStr.slice(0, 50)}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-blue-400">TypeScript: </span>
                <span className="text-gray-300">
                  {tsLen !== null ? `[${tsLen} items]` : tsStr.slice(0, 50)}
                </span>
              </div>
              <div className={isMatch ? 'text-green-400' : 'text-yellow-400'}>
                {isMatch ? 'Match' : 'Different'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles.module.css';

interface ComparisonResult {
  match: boolean;
  differences: string[];
  pythonKeys: string[];
  tsKeys: string[];
}

export default function ComparePage() {
  const [pythonData, setPythonData] = useState<any>(null);
  const [tsData, setTsData] = useState<any>(null);
  const [loading, setLoading] = useState({ python: false, ts: false });
  const [error, setError] = useState({ python: '', ts: '' });
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [activeView, setActiveView] = useState<'side-by-side' | 'diff'>('side-by-side');

  // Fetch TypeScript API data
  const fetchTsData = async () => {
    setLoading(prev => ({ ...prev, ts: true }));
    setError(prev => ({ ...prev, ts: '' }));
    try {
      const response = await fetch('/api/nodeFetchSpreadLine1');
      const data = await response.json();
      setTsData(data);
    } catch (err) {
      setError(prev => ({ ...prev, ts: String(err) }));
    } finally {
      setLoading(prev => ({ ...prev, ts: false }));
    }
  };

  // Compare two objects deeply
  const deepCompare = (obj1: any, obj2: any, path: string = ''): string[] => {
    const differences: string[] = [];

    if (obj1 === obj2) return differences;

    if (typeof obj1 !== typeof obj2) {
      differences.push(`Type mismatch at ${path}: ${typeof obj1} vs ${typeof obj2}`);
      return differences;
    }

    if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
      if (typeof obj1 === 'number' && typeof obj2 === 'number') {
        // Allow small floating point differences
        if (Math.abs(obj1 - obj2) > 0.0001) {
          differences.push(`Value mismatch at ${path}: ${obj1} vs ${obj2}`);
        }
      } else if (obj1 !== obj2) {
        differences.push(`Value mismatch at ${path}: ${JSON.stringify(obj1)} vs ${JSON.stringify(obj2)}`);
      }
      return differences;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) {
        differences.push(`Array length mismatch at ${path}: ${obj1.length} vs ${obj2.length}`);
      }
      const minLen = Math.min(obj1.length, obj2.length);
      for (let i = 0; i < minLen; i++) {
        differences.push(...deepCompare(obj1[i], obj2[i], `${path}[${i}]`));
      }
      return differences;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      if (!(key in obj1)) {
        differences.push(`Missing key in Python at ${path}.${key}`);
      } else if (!(key in obj2)) {
        differences.push(`Missing key in TypeScript at ${path}.${key}`);
      } else {
        differences.push(...deepCompare(obj1[key], obj2[key], path ? `${path}.${key}` : key));
      }
    }

    return differences;
  };

  // Run comparison when both datasets are loaded
  useEffect(() => {
    if (pythonData && tsData) {
      const differences = deepCompare(pythonData, tsData);
      setComparison({
        match: differences.length === 0,
        differences: differences.slice(0, 100), // Limit to first 100 differences
        pythonKeys: Object.keys(pythonData?.resp || {}),
        tsKeys: Object.keys(tsData?.resp || {})
      });
    }
  }, [pythonData, tsData]);

  // Load TS data on mount
  useEffect(() => {
    fetchTsData();
  }, []);

  const formatJSON = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Invalid JSON';
    }
  };

  const getStructureSummary = (data: any) => {
    if (!data?.resp) return null;
    const resp = data.resp;
    return {
      storylines: resp.storylines?.length || 0,
      blocks: resp.blocks?.length || 0,
      xAxis: resp.xAxis?.length || 0,
      yAxis: resp.yAxis?.length || 0,
      mode: resp.mode,
      reference: resp.reference?.length || 0
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>API Output Comparison</h1>
        <p>Compare Python Flask API vs TypeScript Next.js API responses</p>
      </div>

      <div className={styles.nav}>
        <button
          className={activeView === 'side-by-side' ? styles.activeTab : ''}
          onClick={() => setActiveView('side-by-side')}
        >
          Side by Side
        </button>
        <button
          className={activeView === 'diff' ? styles.activeTab : ''}
          onClick={() => setActiveView('diff')}
        >
          Difference Analysis
        </button>
      </div>

      <div className={styles.main}>
        {/* Status Section */}
        <div className={styles.section}>
          <h2>Data Sources</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Python Data Card */}
            <div className={styles.card}>
              <h3>Python Flask API</h3>
              <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                External endpoint (requires manual input)
              </p>
              <div style={{ marginTop: '15px' }}>
                <textarea
                  placeholder="Paste Python API response JSON here..."
                  style={{
                    width: '100%',
                    height: '150px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem'
                  }}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setPythonData(parsed);
                      setError(prev => ({ ...prev, python: '' }));
                    } catch {
                      setError(prev => ({ ...prev, python: 'Invalid JSON' }));
                    }
                  }}
                />
                {error.python && (
                  <p style={{ color: '#dc3545', marginTop: '5px' }}>{error.python}</p>
                )}
                {pythonData && (
                  <p style={{ color: '#28a745', marginTop: '5px' }}>✓ Python data loaded</p>
                )}
              </div>
            </div>

            {/* TypeScript Data Card */}
            <div className={styles.card}>
              <h3>TypeScript Next.js API</h3>
              <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                /api/nodeFetchSpreadLine1
              </p>
              <div style={{ marginTop: '15px' }}>
                <button
                  onClick={fetchTsData}
                  disabled={loading.ts}
                  style={{
                    padding: '10px 20px',
                    background: '#4361ee',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading.ts ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading.ts ? 'Loading...' : 'Fetch TypeScript API'}
                </button>
                {error.ts && (
                  <p style={{ color: '#dc3545', marginTop: '10px' }}>{error.ts}</p>
                )}
                {tsData && (
                  <p style={{ color: '#28a745', marginTop: '10px' }}>✓ TypeScript data loaded</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Result */}
        {comparison && (
          <div className={styles.section}>
            <h2>Comparison Result</h2>
            <div className={styles.card} style={{
              borderLeft: comparison.match ? '4px solid #28a745' : '4px solid #dc3545'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{
                  fontSize: '3rem',
                  color: comparison.match ? '#28a745' : '#dc3545'
                }}>
                  {comparison.match ? '✓' : '✗'}
                </span>
                <div>
                  <h3 style={{ margin: 0, color: comparison.match ? '#28a745' : '#dc3545' }}>
                    {comparison.match ? 'Outputs Match!' : 'Outputs Differ'}
                  </h3>
                  <p style={{ margin: '5px 0 0', color: '#6c757d' }}>
                    {comparison.match
                      ? 'The Python and TypeScript APIs produce identical results.'
                      : `Found ${comparison.differences.length}+ differences between outputs.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Structure Summary */}
        {(pythonData || tsData) && (
          <div className={styles.section}>
            <h2>Structure Summary</h2>
            <div className={styles.comparisonTable}>
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Python</th>
                    <th>TypeScript</th>
                    <th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {['storylines', 'blocks', 'xAxis', 'yAxis', 'mode', 'reference'].map(key => {
                    const pySummary = getStructureSummary(pythonData);
                    const tsSummary = getStructureSummary(tsData);
                    const pyVal = pySummary?.[key as keyof typeof pySummary];
                    const tsVal = tsSummary?.[key as keyof typeof tsSummary];
                    const match = pyVal === tsVal;
                    return (
                      <tr key={key}>
                        <td><strong>{key}</strong></td>
                        <td>{pyVal ?? '-'}</td>
                        <td>{tsVal ?? '-'}</td>
                        <td style={{ color: match ? '#28a745' : '#dc3545' }}>
                          {match ? '✓' : '✗'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Difference Analysis View */}
        {activeView === 'diff' && comparison && !comparison.match && (
          <div className={styles.section}>
            <h2>Differences Found</h2>
            <div className={styles.codeBlock} style={{ maxHeight: '400px', overflow: 'auto' }}>
              {comparison.differences.map((diff, idx) => (
                <div key={idx} style={{
                  padding: '5px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {diff}
                </div>
              ))}
              {comparison.differences.length >= 100 && (
                <div style={{ color: '#ffc107', marginTop: '10px' }}>
                  ... and more differences (showing first 100)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Side by Side View */}
        {activeView === 'side-by-side' && (
          <div className={styles.section}>
            <h2>JSON Output</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ color: '#4361ee' }}>Python Response</h4>
                <div className={styles.codeBlock} style={{
                  maxHeight: '500px',
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
                  {pythonData ? formatJSON(pythonData).slice(0, 10000) + '...' : 'No data loaded'}
                </div>
              </div>
              <div>
                <h4 style={{ color: '#4361ee' }}>TypeScript Response</h4>
                <div className={styles.codeBlock} style={{
                  maxHeight: '500px',
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
                  {tsData ? formatJSON(tsData).slice(0, 10000) + '...' : 'No data loaded'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={styles.section}>
          <h2>How to Compare</h2>
          <div className={styles.card}>
            <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
              <li>
                Open the Python Flask API in your browser:
                <code style={{
                  background: '#e9ecef',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  marginLeft: '10px'
                }}>
                  /fetchSpreadLine
                </code>
              </li>
              <li>Copy the entire JSON response</li>
              <li>Paste it into the Python textarea above</li>
              <li>Click "Fetch TypeScript API" to load the TypeScript response</li>
              <li>The comparison will run automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

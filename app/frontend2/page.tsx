'use client';

/**
 * SpreadLine Complete Documentation v2
 * Enhanced with:
 * - Expanded blocks explanation
 * - content.csv clarification
 * - citations/paper names clarification
 * - More visual data transformations
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ============================================
// INTERACTIVE COMPONENTS
// ============================================

function DataFlowVisualizer() {
  const [activePhase, setActivePhase] = useState(0);
  const phases = [
    { name: 'CSV Input', color: '#3b82f6', desc: 'Raw CSV files are loaded' },
    { name: 'Load', color: '#8b5cf6', desc: 'Data parsed into DataFrames' },
    { name: 'Center', color: '#ec4899', desc: '2-hop egocentric network extracted' },
    { name: 'Order', color: '#f59e0b', desc: 'Barycenter crossing reduction' },
    { name: 'Align', color: '#10b981', desc: 'LCS straight line maximization' },
    { name: 'Compact', color: '#06b6d4', desc: 'Space/wiggle minimization' },
    { name: 'Render', color: '#ef4444', desc: 'SVG path generation' },
    { name: 'D3/React', color: '#22c55e', desc: 'Interactive visualization' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhase((p) => (p + 1) % phases.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [phases.length]);

  return (
    <div className="bg-slate-900 rounded-2xl p-8 my-8">
      <h3 className="text-xl font-bold text-white mb-6 text-center">Full-Stack Data Flow Animation</h3>
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
        {phases.map((phase, i) => (
          <div key={phase.name} className="flex items-center">
            <div
              className={`relative px-4 py-3 rounded-xl text-center min-w-[100px] transition-all duration-500 cursor-pointer ${
                i === activePhase
                  ? 'scale-110 shadow-2xl'
                  : i < activePhase
                  ? 'opacity-60'
                  : 'opacity-40'
              }`}
              style={{ backgroundColor: phase.color }}
              onClick={() => setActivePhase(i)}
            >
              <div className="text-white font-bold text-sm">{phase.name}</div>
              {i === activePhase && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
                  {phase.desc}
                </div>
              )}
            </div>
            {i < phases.length - 1 && (
              <div className={`w-8 h-1 mx-1 transition-all duration-300 ${
                i < activePhase ? 'bg-green-500' : 'bg-slate-700'
              }`}>
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: i === activePhase ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// NEW: Expanded Block Visualizer
function ExpandedBlockVisualizer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900 rounded-2xl p-8 my-8">
      <h4 className="text-xl font-bold text-white mb-6">Interactive: Click to Expand Block</h4>

      <div className="flex items-center justify-center gap-8">
        {/* Collapsed State */}
        <div className="text-center">
          <div className="text-slate-400 text-sm mb-2">Collapsed</div>
          <div
            className={`relative cursor-pointer transition-all duration-500 ${isExpanded ? 'opacity-30' : ''}`}
            onClick={() => setIsExpanded(true)}
          >
            <svg width="60" height="200" className="mx-auto">
              {/* Pill shape */}
              <rect x="10" y="20" width="40" height="160" rx="20" fill="#fff" stroke="#424242" strokeWidth="3"/>
              {/* Points */}
              <circle cx="30" cy="50" r="6" fill="#fcdaca" stroke="#424242"/>
              <circle cx="30" cy="80" r="6" fill="#e599a6" stroke="#424242"/>
              <circle cx="30" cy="110" r="6" fill="#c94b77" stroke="#424242"/>
              <circle cx="30" cy="140" r="6" fill="#740980" stroke="#424242"/>
            </svg>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-4xl text-cyan-400 animate-pulse">
          {isExpanded ? '←' : '→'}
        </div>

        {/* Expanded State */}
        <div className="text-center">
          <div className="text-slate-400 text-sm mb-2">Expanded</div>
          <div
            className={`relative cursor-pointer transition-all duration-500 ${!isExpanded ? 'opacity-30' : ''}`}
            onClick={() => setIsExpanded(false)}
          >
            <svg width="250" height="200" className="mx-auto">
              {/* Expanded pill shape */}
              <rect x="10" y="20" width="230" height="160" rx="20" fill="#fff" stroke="#424242" strokeWidth="3"/>
              {/* Points (repositioned with force simulation) */}
              <circle cx="40" cy="50" r="6" fill="#fcdaca" stroke="#424242"/>
              <circle cx="40" cy="100" r="6" fill="#e599a6" stroke="#424242"/>
              <circle cx="40" cy="150" r="6" fill="#c94b77" stroke="#424242"/>
              <circle cx="80" cy="75" r="6" fill="#740980" stroke="#424242"/>

              {/* Reference labels (topics/keywords) */}
              <text x="100" y="55" fill="#666" fontSize="10">visualization</text>
              <text x="140" y="85" fill="#666" fontSize="10">HCI</text>
              <text x="110" y="115" fill="#666" fontSize="10">data mining</text>
              <text x="160" y="145" fill="#666" fontSize="10">interaction</text>

              {/* Relations (if showLinks: true) */}
              <line x1="46" y1="50" x2="74" y2="75" stroke="#ccc" strokeWidth="1" strokeDasharray="2"/>
              <line x1="46" y1="100" x2="74" y2="75" stroke="#ccc" strokeWidth="1" strokeDasharray="2"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-slate-400">
        Click on either block to toggle expansion state
      </div>

      {/* Explanation */}
      <div className="mt-8 bg-slate-800 rounded-xl p-6">
        <h5 className="text-lg font-semibold text-cyan-400 mb-3">What Happens When You Click a Block?</h5>
        <ol className="space-y-3 text-slate-300 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">1</span>
            <span><strong>Block expands:</strong> The pill-shaped container widens to show more detail (moveX pixels)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">2</span>
            <span><strong>Points reposition:</strong> D3 force simulation moves nodes to avoid overlap</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">3</span>
            <span><strong>Reference labels appear:</strong> Topics/keywords from content_reference.csv are shown (NOT paper titles)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">4</span>
            <span><strong>Relations drawn (optional):</strong> If showLinks: true, arrows show paper co-authorship</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

// NEW: CSV Data Flow Diagram
function CSVDataFlowDiagram() {
  const [highlightedFile, setHighlightedFile] = useState<string | null>(null);

  return (
    <div className="bg-slate-900 rounded-2xl p-8 my-8">
      <h4 className="text-xl font-bold text-white mb-6">CSV File Relationships</h4>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* relations.csv */}
        <div
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            highlightedFile === 'relations' ? 'border-cyan-400 bg-cyan-900/30' : 'border-slate-700 hover:border-slate-500'
          }`}
          onClick={() => setHighlightedFile(highlightedFile === 'relations' ? null : 'relations')}
        >
          <div className="text-cyan-400 font-mono text-sm mb-2">relations.csv</div>
          <div className="text-slate-400 text-xs">Network edges (who collaborated)</div>
          <div className="mt-2 text-xs font-mono text-slate-500">
            source, target, year, paperID
          </div>
        </div>

        {/* entities.csv */}
        <div
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            highlightedFile === 'entities' ? 'border-green-400 bg-green-900/30' : 'border-slate-700 hover:border-slate-500'
          }`}
          onClick={() => setHighlightedFile(highlightedFile === 'entities' ? null : 'entities')}
        >
          <div className="text-green-400 font-mono text-sm mb-2">entities.csv</div>
          <div className="text-slate-400 text-xs">Author metadata</div>
          <div className="mt-2 text-xs font-mono text-slate-500">
            name, year, affiliation
          </div>
        </div>

        {/* content.csv */}
        <div
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            highlightedFile === 'content' ? 'border-purple-400 bg-purple-900/30' : 'border-slate-700 hover:border-slate-500'
          }`}
          onClick={() => setHighlightedFile(highlightedFile === 'content' ? null : 'content')}
        >
          <div className="text-purple-400 font-mono text-sm mb-2">content.csv</div>
          <div className="text-slate-400 text-xs">AUTHOR positions in expanded blocks</div>
          <div className="mt-2 text-xs font-mono text-slate-500">
            year, name, posX, posY
          </div>
        </div>

        {/* citations.csv */}
        <div
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            highlightedFile === 'citations' ? 'border-orange-400 bg-orange-900/30' : 'border-slate-700 hover:border-slate-500'
          }`}
          onClick={() => setHighlightedFile(highlightedFile === 'citations' ? null : 'citations')}
        >
          <div className="text-orange-400 font-mono text-sm mb-2">citations.csv</div>
          <div className="text-slate-400 text-xs">Citation counts per author per paper</div>
          <div className="mt-2 text-xs font-mono text-slate-500">
            name, paperID, citationcount
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {highlightedFile && (
        <div className="bg-slate-800 rounded-xl p-6 animate-in fade-in duration-300">
          {highlightedFile === 'relations' && (
            <div>
              <h5 className="text-cyan-400 font-semibold mb-3">relations.csv - Network Topology</h5>
              <p className="text-slate-300 text-sm mb-4">
                This is the primary input. Each row represents a collaboration edge.
              </p>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <div className="text-slate-500">year,source,target,id,type,citationcount</div>
                <div className="text-green-400">2002,Jeffrey Heer,Ed Chi,53e9...,Co-author,156</div>
                <div className="text-green-400">2003,Jeffrey Heer,Stuart Card,53ea...,Co-author,892</div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                <strong>Links to:</strong> entities.csv (via source/target names), citations.csv (via paperID)
              </div>
            </div>
          )}

          {highlightedFile === 'entities' && (
            <div>
              <h5 className="text-green-400 font-semibold mb-3">entities.csv - Author Metadata</h5>
              <p className="text-slate-300 text-sm mb-4">
                Provides time-varying attributes for each author (affiliation, citation counts).
              </p>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <div className="text-slate-500">name,year,citationcount,affiliation</div>
                <div className="text-green-400">Jeffrey Heer,2002,156,UC Berkeley</div>
                <div className="text-green-400">Jeffrey Heer,2009,2341,Stanford University</div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                <strong>Used for:</strong> Line coloring (internal vs external affiliation)
              </div>
            </div>
          )}

          {highlightedFile === 'content' && (
            <div>
              <h5 className="text-purple-400 font-semibold mb-3">content.csv - Layout Positions</h5>
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-4">
                <div className="text-red-400 font-semibold text-sm">Important Clarification</div>
                <div className="text-slate-300 text-xs mt-1">
                  The &quot;name&quot; column is the <strong>AUTHOR name</strong>, NOT content/paper name!
                  posX/posY are normalized (0-1) coordinates for positioning authors inside expanded blocks.
                </div>
              </div>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <div className="text-slate-500">year,name,posX,posY</div>
                <div className="text-green-400">2002,Jeffrey Heer,0.655,0.592</div>
                <div className="text-green-400">2002,Ed Chi,0.741,0.698</div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                <strong>Used for:</strong> Positioning nodes when a block expands (contextualize phase)
              </div>
            </div>
          )}

          {highlightedFile === 'citations' && (
            <div>
              <h5 className="text-orange-400 font-semibold mb-3">citations.csv - Paper Citation Data</h5>
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-4">
                <div className="text-red-400 font-semibold text-sm">Important Clarification</div>
                <div className="text-slate-300 text-xs mt-1">
                  The &quot;name&quot; column is the <strong>AUTHOR name</strong>, NOT paper title!
                  Paper titles are NOT stored in the vis-author dataset. Reference labels come from content_reference.csv (topics/keywords).
                </div>
              </div>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <div className="text-slate-500">name,year,citationcount,affiliation,paperID</div>
                <div className="text-green-400">Jeffrey Heer,2002,156,UC Berkeley,53e9978db7602...</div>
                <div className="text-green-400">Ed Chi,2002,156,PARC,53e9978db7602...</div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                <strong>Used for:</strong> Node colors (citation count determines fill color)
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-slate-400">
        Click on each CSV file to see details
      </div>
    </div>
  );
}

// NEW: Visual Pipeline Steps
function VisualPipelineSteps() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: '1. CSV Input',
      visual: (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-blue-900/50 rounded p-2">
            <div className="text-blue-300 font-mono">relations.csv</div>
            <div className="text-slate-400 mt-1">7,731 rows</div>
          </div>
          <div className="bg-green-900/50 rounded p-2">
            <div className="text-green-300 font-mono">entities.csv</div>
            <div className="text-slate-400 mt-1">9,979 rows</div>
          </div>
          <div className="bg-purple-900/50 rounded p-2">
            <div className="text-purple-300 font-mono">citations.csv</div>
            <div className="text-slate-400 mt-1">10,140 rows</div>
          </div>
        </div>
      ),
      description: 'Raw CSV files containing network topology, entity metadata, and citation data.',
    },
    {
      title: '2. Extract 2-Hop Network',
      visual: (
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">E</div>
            <div className="text-xs text-slate-400 mt-1">Ego</div>
          </div>
          <div className="text-slate-500">→</div>
          <div className="flex flex-col gap-1">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">1</div>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">1</div>
          </div>
          <div className="text-slate-500">→</div>
          <div className="flex flex-col gap-1">
            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">2</div>
            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">2</div>
            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">2</div>
          </div>
        </div>
      ),
      description: 'BFS from ego to find all entities within 2 hops. Filter out distant nodes.',
    },
    {
      title: '3. Construct Sessions',
      visual: (
        <div className="flex items-end justify-center gap-1 h-24">
          {[2002, 2003, 2004, 2005, 2006].map((year, i) => (
            <div key={year} className="text-center">
              <div
                className="w-8 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t"
                style={{ height: `${20 + i * 15}px` }}
              />
              <div className="text-xs text-slate-500 mt-1">{year}</div>
            </div>
          ))}
        </div>
      ),
      description: 'Group interactions by timestamp. Each bar = one session with active entities.',
    },
    {
      title: '4. Barycenter Ordering',
      visual: (
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">Before</div>
            <div className="flex flex-col gap-1">
              {['C', 'A', 'B'].map((n) => (
                <div key={n} className="w-8 h-6 bg-slate-700 rounded flex items-center justify-center text-white text-xs">{n}</div>
              ))}
            </div>
          </div>
          <div className="text-2xl text-cyan-400">→</div>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">After</div>
            <div className="flex flex-col gap-1">
              {['A', 'B', 'C'].map((n) => (
                <div key={n} className="w-8 h-6 bg-cyan-700 rounded flex items-center justify-center text-white text-xs">{n}</div>
              ))}
            </div>
          </div>
          <div className="text-xs text-green-400 ml-4">-3 crossings</div>
        </div>
      ),
      description: 'Minimize edge crossings by sorting entities by neighbor average positions.',
    },
    {
      title: '5. LCS Alignment',
      visual: (
        <div className="flex items-center justify-center gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="w-32 h-1 bg-slate-600 rounded"></div>
            <div className="w-32 h-1 bg-cyan-500 rounded"></div>
            <div className="w-32 h-1 bg-slate-600 rounded"></div>
          </div>
          <div className="text-xs text-slate-400 ml-2">
            <div>Before: 1 straight</div>
            <div className="text-green-400">After: 3 straight</div>
          </div>
        </div>
      ),
      description: 'Maximize straight horizontal lines using dynamic programming.',
    },
    {
      title: '6. Compact & Render',
      visual: (
        <div className="flex items-center justify-center">
          <svg width="200" height="60" className="mx-auto">
            <path d="M 10,20 C 50,20 50,40 90,40 C 130,40 130,30 170,30" fill="none" stroke="#06b6d4" strokeWidth="2"/>
            <path d="M 10,40 L 170,40" fill="none" stroke="#424242" strokeWidth="3"/>
            <circle cx="10" cy="20" r="3" fill="#06b6d4"/>
            <circle cx="90" cy="40" r="3" fill="#06b6d4"/>
            <circle cx="170" cy="30" r="3" fill="#06b6d4"/>
          </svg>
        </div>
      ),
      description: 'Assign vertical slots, generate SVG bezier curves for storylines.',
    },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl p-8 my-8">
      <h4 className="text-xl font-bold text-white mb-6">Data Transformation Pipeline (Interactive)</h4>

      {/* Step indicators */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex-1 cursor-pointer ${i < steps.length - 1 ? 'relative' : ''}`}
            onClick={() => setActiveStep(i)}
          >
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold transition-all ${
              i === activeStep
                ? 'bg-cyan-500 text-white scale-110'
                : i < activeStep
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {i < activeStep ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                i < activeStep ? 'bg-green-600' : 'bg-slate-700'
              }`} />
            )}
            <div className={`text-center text-xs mt-2 ${
              i === activeStep ? 'text-cyan-400' : 'text-slate-500'
            }`}>
              Step {i + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Active step content */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h5 className="text-lg font-semibold text-white mb-4">{steps[activeStep].title}</h5>
        <div className="bg-slate-950 rounded-lg p-6 mb-4">
          {steps[activeStep].visual}
        </div>
        <p className="text-slate-300 text-sm">{steps[activeStep].description}</p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          className={`px-4 py-2 rounded-lg text-sm ${
            activeStep === 0 ? 'bg-slate-800 text-slate-500' : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
          disabled={activeStep === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
          className={`px-4 py-2 rounded-lg text-sm ${
            activeStep === steps.length - 1 ? 'bg-slate-800 text-slate-500' : 'bg-cyan-600 text-white hover:bg-cyan-500'
          }`}
          disabled={activeStep === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function AlgorithmVisualizer() {
  const [step, setStep] = useState(0);

  const barycenterSteps = [
    { matrix: [[1,0,1],[0,1,0],[1,1,0]], order: [0,1,2], desc: 'Initial order: A, B, C' },
    { matrix: [[1,0,1],[0,1,0],[1,1,0]], order: [0,1,2], desc: 'Calculate barycenters: A=1.0, B=1.0, C=0.5' },
    { matrix: [[1,1,0],[1,0,1],[0,1,0]], order: [2,0,1], desc: 'Reorder by barycenter: C, A, B' },
    { matrix: [[1,1,0],[1,0,1],[0,1,0]], order: [2,0,1], desc: 'Crossings reduced from 3 to 1' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % barycenterSteps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const current = barycenterSteps[step];

  return (
    <div className="bg-slate-900 rounded-2xl p-6 my-8">
      <h4 className="text-lg font-bold text-white mb-4">Barycenter Algorithm - Live Demo</h4>

      <div className="flex items-start gap-8">
        <div>
          <div className="text-xs text-slate-500 mb-2">Adjacency Matrix</div>
          <div className="grid grid-cols-3 gap-1">
            {current.matrix.flat().map((v, i) => (
              <div
                key={i}
                className={`w-10 h-10 flex items-center justify-center rounded ${
                  v ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {v}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-2">Entity Order</div>
          <div className="flex gap-2">
            {current.order.map((idx, i) => (
              <div
                key={i}
                className="w-10 h-10 flex items-center justify-center rounded bg-purple-500 text-white font-bold"
              >
                {String.fromCharCode(65 + idx)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-xs text-slate-500 mb-2">Step {step + 1}/4</div>
          <div className="text-white">{current.desc}</div>
          <div className="flex gap-2 mt-4">
            {barycenterSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === step ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeScriptInterface({ name, fields, description }: {
  name: string;
  fields: { name: string; type: string; desc: string }[];
  description: string;
}) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 my-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-purple-400 font-mono">interface</span>
        <span className="text-cyan-400 font-mono font-bold">{name}</span>
      </div>
      <div className="text-slate-400 text-sm mb-4">{description}</div>
      <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm">
        <div className="text-slate-500">{'{'}</div>
        {fields.map((f) => (
          <div key={f.name} className="ml-4 flex items-start gap-4 py-1">
            <span className="text-white">{f.name}:</span>
            <span className="text-green-400">{f.type};</span>
            <span className="text-slate-500">// {f.desc}</span>
          </div>
        ))}
        <div className="text-slate-500">{'}'}</div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function DocumentationPage() {
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    const checkMermaid = setInterval(() => {
      // @ts-expect-error mermaid loaded from CDN
      if (window.mermaid) {
        setMermaidLoaded(true);
        // @ts-expect-error mermaid loaded from CDN
        window.mermaid.run();
        clearInterval(checkMermaid);
      }
    }, 100);
    return () => clearInterval(checkMermaid);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                SpreadLine <span className="text-cyan-400">Documentation</span> <span className="text-green-400 text-lg">v2</span>
              </h1>
              <p className="text-xl text-slate-400">
                Enhanced Full-Stack Implementation Guide
              </p>
              <div className="flex gap-4 mt-4">
                <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">IEEE TVCG 2024</span>
                <span className="px-3 py-1 bg-cyan-900/50 text-cyan-300 rounded-full text-sm">TypeScript + D3 + React</span>
                <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">Fixed API v3</span>
              </div>
            </div>
            <Link
              href="/frontend2/demo"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-6 overflow-x-auto text-sm">
          <a href="#overview" className="text-slate-400 hover:text-cyan-400">Overview</a>
          <a href="#expanded-blocks" className="text-slate-400 hover:text-cyan-400">Expanded Blocks</a>
          <a href="#csv-files" className="text-slate-400 hover:text-cyan-400">CSV Files</a>
          <a href="#pipeline" className="text-slate-400 hover:text-cyan-400">Pipeline</a>
          <a href="#algorithms" className="text-slate-400 hover:text-cyan-400">Algorithms</a>
          <a href="#api" className="text-slate-400 hover:text-cyan-400">API Reference</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* ============================================ */}
        {/* SECTION: Overview */}
        {/* ============================================ */}
        <section id="overview" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-lg">1</span>
            What is SpreadLine?
          </h2>

          <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
            <p className="text-slate-300 leading-relaxed mb-6 text-lg">
              SpreadLine is a visualization framework for exploring <strong className="text-cyan-400">egocentric dynamic networks</strong> from
              the perspective of a central node (ego). Based on the IEEE TVCG 2024 paper &quot;SpreadLine: Visualizing Egocentric Dynamic Influence&quot;,
              it shows how influence spreads through networks over time, centered around a focal actor.
            </p>

            <DataFlowVisualizer />
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: Expanded Blocks (NEW) */}
        {/* ============================================ */}
        <section id="expanded-blocks" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-lg">2</span>
            Understanding Expanded Blocks
          </h2>

          <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
            <p className="text-slate-300 leading-relaxed mb-6">
              Blocks represent <strong className="text-cyan-400">time periods</strong> (sessions). When collapsed, they show nodes as stacked circles.
              Clicking a block <strong className="text-purple-400">expands</strong> it to reveal detailed information.
            </p>

            <ExpandedBlockVisualizer />

            <div className="bg-slate-800 rounded-xl p-6 mt-8">
              <h4 className="text-lg font-semibold text-cyan-400 mb-4">Reference Labels: What Are They?</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-white font-medium mb-2">What They Show</h5>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Topics/keywords from <code className="text-cyan-400">content_reference.csv</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Positioned using posX/posY coordinates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Filtered by the block&apos;s year/time</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-white font-medium mb-2">What They Are NOT</h5>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Paper titles (not stored in vis-author dataset)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Author names (those are the nodes/circles)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Citation counts (shown via node colors)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: CSV Files (ENHANCED) */}
        {/* ============================================ */}
        <section id="csv-files" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-lg">3</span>
            CSV Input Files
          </h2>

          <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
            <p className="text-slate-300 leading-relaxed mb-6">
              SpreadLine uses 4 CSV files. Understanding their relationships is crucial.
              <strong className="text-red-400"> Common confusion: &quot;name&quot; always means AUTHOR name, never paper title!</strong>
            </p>

            <CSVDataFlowDiagram />

            {/* Paper Names Clarification */}
            <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 mt-8">
              <h4 className="text-red-400 font-semibold text-lg mb-3">FAQ: Where Do I Get Paper Names?</h4>
              <div className="text-slate-300 space-y-3">
                <p>
                  <strong>Short answer:</strong> You don&apos;t. The vis-author dataset only stores <code className="text-cyan-400">paperID</code>s, not paper titles.
                </p>
                <p>
                  <strong>What about citations.csv?</strong> The &quot;name&quot; column is the <em>author</em> name, not paper name. Each row represents one author&apos;s contribution to one paper.
                </p>
                <p>
                  <strong>What are the reference labels then?</strong> They come from <code className="text-cyan-400">content_reference.csv</code> which contains <em>topics/keywords</em> (like &quot;visualization&quot;, &quot;HCI&quot;), not full paper titles.
                </p>
                <p>
                  <strong>If I need paper titles:</strong> You would need to join paperID with an external database (like DBLP, Semantic Scholar) that maps IDs to titles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: Pipeline (ENHANCED) */}
        {/* ============================================ */}
        <section id="pipeline" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-lg">4</span>
            Data Transformation Pipeline
          </h2>

          <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
            <p className="text-slate-300 leading-relaxed mb-6">
              The backend transforms CSV data through 6 stages. Click through each step to see visual representations.
            </p>

            <VisualPipelineSteps />
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: Algorithms */}
        {/* ============================================ */}
        <section id="algorithms" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center text-lg">5</span>
            Core Algorithms
          </h2>

          <AlgorithmVisualizer />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-900 rounded-xl p-6">
              <h4 className="text-xl font-bold text-green-400 mb-4">Barycenter Heuristic</h4>
              <p className="text-slate-300 mb-4">
                Minimizes edge crossings by positioning each node at the average position of its neighbors.
                10 forward/backward sweeps ensure convergence.
              </p>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-400">
                Time: O(iterations x timestamps x edges)<br/>
                Space: O(entities x timestamps)
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-400 mb-4">LCS Alignment</h4>
              <p className="text-slate-300 mb-4">
                Dynamic programming to maximize straight lines. Reward function considers alignment
                matches and relative order preservation.
              </p>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-400">
                Time: O(n^2 x timestamps)<br/>
                Space: O(n^2) per timestamp pair
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION: API Reference */}
        {/* ============================================ */}
        <section id="api" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-lg">6</span>
            API Reference
          </h2>

          <div className="bg-slate-900 rounded-xl overflow-hidden mb-8">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500 text-white rounded font-bold text-sm">GET</span>
                <span className="font-mono text-white">/api/nodeFetchSpreadLine3</span>
                <span className="px-2 py-0.5 bg-green-900 text-green-300 rounded text-xs">Fixed v3</span>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-lg font-bold text-white mb-4">Response Format</h4>
              <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-sm text-slate-300">
{`{
  "ego": "Jeffrey Heer",
  "bandWidth": 101.816,
  "blockWidth": 40,
  "heightExtents": [268, 520],
  "timeLabels": [{ "label": "2002", "posX": 62.908 }, ...],
  "storylines": [{
    "name": "Jeffrey Heer",
    "color": "#424242",
    "lifespan": 21,
    "crossingCheck": false,
    "lines": ["M 62.908,394 L 164.724,394", ...],
    "marks": [{ "posX": 62.908, "posY": 394 }, ...]
  }, ...],
  "blocks": [{
    "id": 0, "time": "2002",
    "moveX": 228,
    "names": ["Ed Huai-hsin Chi", ...],
    "points": [{ "id": 65, "name": "Tara Matthews", ... }],
    "outline": { "left": "M...", "right": "M...", ... }
  }, ...],
  "reference": [{ "year": "2002", "name": "visualization", "posX": 0.5, "posY": 0.3 }, ...]
}`}
              </pre>
            </div>
          </div>

          <TypeScriptInterface
            name="SpreadLineData"
            description="Main data structure returned by the API"
            fields={[
              { name: 'ego', type: 'string', desc: 'Central entity name' },
              { name: 'storylines', type: 'Storyline[]', desc: 'Entity timeline paths' },
              { name: 'blocks', type: 'Block[]', desc: 'Session snapshots' },
              { name: 'reference', type: 'Reference[]', desc: 'Labels for expanded blocks' },
            ]}
          />
        </section>

        {/* ============================================ */}
        {/* Footer */}
        {/* ============================================ */}
        <footer className="border-t border-slate-800 pt-8 mt-16">
          <div className="text-center">
            <p className="text-slate-400">
              SpreadLine: Visualizing Egocentric Dynamic Influence
            </p>
            <p className="text-slate-500 text-sm mt-2">
              IEEE TVCG 2024 | <a href="https://arxiv.org/pdf/2408.08992" className="text-cyan-400 hover:underline">Paper</a>
            </p>
            <div className="mt-6">
              <Link
                href="/frontend2/demo"
                className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all"
              >
                Try the Live Demo
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

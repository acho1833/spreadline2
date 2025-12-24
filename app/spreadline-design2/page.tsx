'use client';

/**
 * Technical Design Document v2 - SpreadLine
 *
 * Enhanced documentation with interactive visualizations,
 * tooltips, real examples, and improved diagrams.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

// ============================================
// TABLE OF CONTENTS
// ============================================

const tableOfContents = [
  { id: 'overview', label: '1. Overview', level: 1 },
  { id: 'architecture', label: '2. Architecture', level: 1 },
  { id: 'architecture-high-level', label: '2.1 High-Level Architecture', level: 2 },
  { id: 'architecture-data-flow', label: '2.2 Data Flow', level: 2 },
  { id: 'components', label: '3. Components', level: 1 },
  { id: 'components-frontend', label: '3.1 Frontend', level: 2 },
  { id: 'components-backend', label: '3.2 Backend', level: 2 },
  { id: 'components-external', label: '3.3 External Services', level: 2 },
  { id: 'api-design', label: '4. API Design', level: 1 },
  { id: 'api-current', label: '4.1 Current API', level: 2 },
  { id: 'api-external', label: '4.2 External API Contract', level: 2 },
  { id: 'data-models', label: '5. Data Models', level: 1 },
  { id: 'data-models-backend', label: '5.1 Backend Types', level: 2 },
  { id: 'data-models-frontend', label: '5.2 Frontend Types', level: 2 },
  { id: 'data-models-csv', label: '5.3 CSV Schema', level: 2 },
  { id: 'core-flows', label: '6. Core Flows', level: 1 },
  { id: 'flow-pipeline', label: '6.1 Processing Pipeline', level: 2 },
  { id: 'flow-rendering', label: '6.2 Rendering Flow', level: 2 },
  { id: 'flow-interaction', label: '6.3 User Interactions', level: 2 },
  { id: 'error-handling', label: '7. Error Handling & Edge Cases', level: 1 },
  { id: 'nfr', label: '8. Non-Functional Requirements', level: 1 },
  { id: 'dependencies', label: '9. Dependencies', level: 1 },
  { id: 'assumptions', label: '10. Assumptions & Open Questions', level: 1 },
];

// ============================================
// TOOLTIP COMPONENT
// ============================================

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
          <span
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}
          />
        </span>
      )}
    </span>
  );
}

// ============================================
// MERMAID DIAGRAM COMPONENT (Enhanced)
// ============================================

function MermaidDiagram({ chart, title, height = 'auto' }: { chart: string; title?: string; height?: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // @ts-expect-error mermaid loaded from CDN
        if (window.mermaid) {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          // @ts-expect-error mermaid loaded from CDN
          const { svg } = await window.mermaid.render(id, chart);
          setSvg(svg);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    const checkMermaid = setInterval(() => {
      // @ts-expect-error mermaid loaded from CDN
      if (window.mermaid) {
        clearInterval(checkMermaid);
        renderDiagram();
      }
    }, 100);

    return () => clearInterval(checkMermaid);
  }, [chart]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="text-red-600 text-sm">Diagram Error: {error}</div>
        <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 my-4 overflow-auto" style={{ minHeight: height }}>
      {title && <div className="text-sm font-semibold text-gray-700 mb-4">{title}</div>}
      {svg ? (
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: svg }}
          className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
        />
      ) : (
        <div className="text-gray-400 text-center py-12">Loading diagram...</div>
      )}
    </div>
  );
}

// ============================================
// CODE BLOCK COMPONENT
// ============================================

function CodeBlock({ code, language = 'typescript', title }: { code: string; language?: string; title?: string }) {
  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden my-4">
      {title && (
        <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 border-b border-slate-700">
          {title}
        </div>
      )}
      <pre className="p-4 overflow-auto text-sm max-h-96">
        <code className={`language-${language} text-slate-300`}>{code}</code>
      </pre>
    </div>
  );
}

// ============================================
// INTERACTIVE STORYLINE VISUALIZATION
// ============================================

function InteractiveStorylineDemo() {
  const [step, setStep] = useState(0);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const steps = [
    { label: 'Initial View', description: 'Storylines show entity paths through time. Each line represents one entity.' },
    { label: 'Hover Storyline', description: 'Hovering highlights the entity\'s path and dims others for focus.' },
    { label: 'Block View', description: 'Blocks (pills) show sessions where entities interact together.' },
    { label: 'Expand Block', description: 'Clicking a block expands it to show internal node positions and relations.' },
    { label: 'Filter Applied', description: 'Filters can hide short-lived entities or show only crossing lines.' },
  ];

  const tooltips: Record<string, string> = {
    'ego-line': 'Ego Line: The central entity (Jeffrey Heer). Thicker stroke (5.5px), always visible.',
    'alter-line-1': 'Alter Line: A collaborator. Color indicates relationship type.',
    'alter-line-2': 'Alter Line: Another collaborator with different affiliation.',
    'block-1': 'Session Block: Entities present at this timestamp. Click to expand.',
    'block-2': 'Session Block: Shows 4 entities collaborating in 2005.',
    'time-label': 'Time Label: Year on the horizontal axis. Click to expand that block.',
    'entity-label': 'Entity Label: Name positioned at line start. Hover shows tooltip.',
    'marker-start': 'Entry Marker: Triangle showing when entity enters the visualization.',
    'marker-end': 'Exit Marker: Triangle showing when entity exits.',
    'node-ego': 'Ego Node: Central entity in expanded block. Larger radius (7px).',
    'node-alter': 'Alter Node: Collaborator node. Color indicates citation count.',
    'relation-arc': 'Relation Arc: Co-authorship link between nodes in this session.',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-6">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-900">Interactive Storyline Visualization</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 w-20 text-center">
              {step + 1} / {steps.length}
            </span>
            <button
              onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
              disabled={step === steps.length - 1}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Next
            </button>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-sm font-medium text-blue-700">{steps[step].label}</div>
          <div className="text-sm text-gray-600">{steps[step].description}</div>
        </div>
      </div>

      {/* SVG Visualization */}
      <div className="p-4 relative">
        {hoveredElement && (
          <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg max-w-xs z-10">
            {tooltips[hoveredElement]}
          </div>
        )}

        <svg viewBox="0 0 600 250" className="w-full h-auto">
          {/* Background */}
          <rect width="600" height="250" fill="#fafafa" />

          {/* Time labels */}
          {['2002', '2003', '2004', '2005', '2006'].map((year, i) => (
            <g key={year}>
              <text
                x={80 + i * 110}
                y={230}
                textAnchor="middle"
                className="text-xs fill-gray-500"
                onMouseEnter={() => setHoveredElement('time-label')}
                onMouseLeave={() => setHoveredElement(null)}
                style={{ cursor: 'pointer' }}
              >
                {year}
              </text>
              <line
                x1={80 + i * 110}
                y1={20}
                x2={80 + i * 110}
                y2={210}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4"
              />
            </g>
          ))}

          {/* Storylines */}
          {/* Ego line - Jeffrey Heer */}
          <path
            d="M 80 120 L 190 120 L 300 120 L 410 120 L 520 120"
            stroke={step >= 1 ? '#424242' : '#424242'}
            strokeWidth={step >= 1 ? 5.5 : 5.5}
            fill="none"
            opacity={step === 4 ? 1 : 1}
            onMouseEnter={() => setHoveredElement('ego-line')}
            onMouseLeave={() => setHoveredElement(null)}
            style={{ cursor: 'pointer' }}
          />

          {/* Alter line 1 - Ed Chi (colleague) */}
          <path
            d={step >= 2 ? 'M 80 80 L 190 80 L 300 95' : 'M 80 80 L 190 80 L 300 95'}
            stroke="#FA9902"
            strokeWidth={step === 1 ? 4 : 2}
            fill="none"
            opacity={step === 1 ? 0.3 : step === 4 ? 0.3 : 1}
            onMouseEnter={() => setHoveredElement('alter-line-1')}
            onMouseLeave={() => setHoveredElement(null)}
            style={{ cursor: 'pointer' }}
          />

          {/* Alter line 2 - Maneesh Agrawala (collaborator) */}
          <path
            d="M 300 160 C 355 160, 355 145, 410 145 L 520 145"
            stroke="#146b6b"
            strokeWidth={step === 1 ? 4 : 2}
            fill="none"
            opacity={step === 1 ? 0.3 : step === 4 ? 1 : 1}
            onMouseEnter={() => setHoveredElement('alter-line-2')}
            onMouseLeave={() => setHoveredElement(null)}
            style={{ cursor: 'pointer' }}
          />

          {/* Alter line 3 - Danah Boyd */}
          <path
            d="M 300 175 L 410 175 L 520 185"
            stroke="#FA9902"
            strokeWidth={2}
            fill="none"
            opacity={step === 4 ? 0.1 : 1}
          />

          {/* Session blocks */}
          {step >= 2 && (
            <>
              {/* Block 1 - 2002 */}
              <g
                onMouseEnter={() => setHoveredElement('block-1')}
                onMouseLeave={() => setHoveredElement(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="60"
                  y="60"
                  width="40"
                  height="80"
                  rx="20"
                  fill="white"
                  stroke="#424242"
                  strokeWidth="3"
                />
              </g>

              {/* Block 2 - 2005 */}
              <g
                onMouseEnter={() => setHoveredElement('block-2')}
                onMouseLeave={() => setHoveredElement(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="390"
                  y="100"
                  width="40"
                  height="100"
                  rx="20"
                  fill="white"
                  stroke="#424242"
                  strokeWidth="3"
                />
              </g>
            </>
          )}

          {/* Expanded block content */}
          {step >= 3 && (
            <g transform="translate(395, 0)">
              {/* Expansion background */}
              <rect x="0" y="100" width="120" height="100" rx="20" fill="white" stroke="#424242" strokeWidth="3" />

              {/* Nodes */}
              <circle
                cx="40"
                cy="120"
                r="7"
                fill="#c94b77"
                stroke="#424242"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredElement('node-ego')}
                onMouseLeave={() => setHoveredElement(null)}
                style={{ cursor: 'pointer' }}
              />
              <circle
                cx="80"
                cy="140"
                r="5"
                fill="#e599a6"
                stroke="#424242"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredElement('node-alter')}
                onMouseLeave={() => setHoveredElement(null)}
                style={{ cursor: 'pointer' }}
              />
              <circle cx="60" cy="170" r="5" fill="#fcdaca" stroke="#424242" strokeWidth="0.5" />
              <circle cx="100" cy="180" r="5" fill="#ffffff" stroke="#424242" strokeWidth="0.5" />

              {/* Relation arc */}
              <path
                d="M 47 120 Q 70 100 78 135"
                stroke="#424242"
                strokeWidth="1"
                fill="none"
                markerEnd="url(#arrowhead)"
                onMouseEnter={() => setHoveredElement('relation-arc')}
                onMouseLeave={() => setHoveredElement(null)}
                style={{ cursor: 'pointer' }}
              />

              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#424242" />
                </marker>
              </defs>
            </g>
          )}

          {/* Entity labels */}
          <text
            x="30"
            y="124"
            className="text-xs fill-gray-700 font-medium"
            onMouseEnter={() => setHoveredElement('entity-label')}
            onMouseLeave={() => setHoveredElement(null)}
            style={{ cursor: 'pointer' }}
          >
            J. Heer
          </text>
          <text x="30" y="84" className="text-xs fill-gray-500">Ed Chi</text>
          <text x="540" y="149" className="text-xs fill-gray-500">M. Agrawala</text>

          {/* Entry/exit markers */}
          <polygon
            points="75,80 80,72 85,80"
            fill="#FA9902"
            onMouseEnter={() => setHoveredElement('marker-start')}
            onMouseLeave={() => setHoveredElement(null)}
            style={{ cursor: 'pointer' }}
          />
          <polygon
            points="295,95 300,87 305,95"
            fill="#FA9902"
            transform="rotate(180, 300, 91)"
            onMouseEnter={() => setHoveredElement('marker-end')}
            onMouseLeave={() => setHoveredElement(null)}
            style={{ cursor: 'pointer' }}
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-gray-700 rounded"></div>
          <span>Ego (Central Entity)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-orange-500 rounded"></div>
          <span>Colleague</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-teal-700 rounded"></div>
          <span>Collaborator</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-700"></div>
          <span>Session Block</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INTERACTIVE BLOCK EXPANSION DEMO
// ============================================

function InteractiveBlockDemo() {
  const [expanded, setExpanded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const nodes = [
    { id: 0, name: 'Jeffrey Heer', x: 60, y: 50, citations: 3140, isEgo: true },
    { id: 1, name: 'James A. Landay', x: 40, y: 80, citations: 1078, isEgo: false },
    { id: 2, name: 'Stuart K. Card', x: 80, y: 75, citations: 1078, isEgo: false },
    { id: 3, name: 'Danah Boyd', x: 55, y: 110, citations: 2062, isEgo: false },
  ];

  const relations = [[0, 1], [0, 2], [0, 3]];

  const getCitationColor = (citations: number) => {
    if (citations >= 500) return '#740980';
    if (citations >= 100) return '#c94b77';
    if (citations >= 50) return '#e599a6';
    if (citations >= 10) return '#fcdaca';
    return '#ffffff';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-6">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-900">Block Expansion Demo</div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`px-4 py-2 text-sm rounded transition-all ${
              expanded
                ? 'bg-gray-700 text-white hover:bg-gray-800'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {expanded ? 'Collapse Block' : 'Expand Block'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {expanded
            ? 'Block expanded: Nodes positioned by force simulation, relations shown as arcs.'
            : 'Click to expand the block and see internal structure.'}
        </p>
      </div>

      <div className="p-6 flex items-center justify-center bg-gray-50">
        <svg
          viewBox="0 0 200 150"
          className="transition-all duration-500"
          style={{ width: expanded ? '400px' : '100px', height: expanded ? '200px' : '150px' }}
        >
          {/* Block outline */}
          <rect
            x="10"
            y="10"
            width={expanded ? 180 : 40}
            height="130"
            rx="20"
            fill="white"
            stroke="#424242"
            strokeWidth="3"
            className="transition-all duration-500"
          />

          {expanded && (
            <>
              {/* Relations */}
              {relations.map(([from, to], i) => {
                const fromNode = nodes[from];
                const toNode = nodes[to];
                return (
                  <path
                    key={i}
                    d={`M ${fromNode.x + 60} ${fromNode.y + 10} Q ${(fromNode.x + toNode.x) / 2 + 80} ${Math.min(fromNode.y, toNode.y) - 10} ${toNode.x + 60} ${toNode.y + 10}`}
                    stroke="#424242"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.6"
                    markerEnd="url(#arrow)"
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x + 60}
                    cy={node.y + 10}
                    r={node.isEgo ? 10 : 7}
                    fill={getCitationColor(node.citations)}
                    stroke="#424242"
                    strokeWidth="1"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {hoveredNode === node.id && (
                    <text x={node.x + 60} y={node.y + 35} textAnchor="middle" className="text-xs fill-gray-700">
                      {node.name}
                    </text>
                  )}
                </g>
              ))}

              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#424242" />
                </marker>
              </defs>
            </>
          )}

          {!expanded && (
            <>
              {/* Collapsed nodes stacked */}
              {nodes.map((node, i) => (
                <circle
                  key={node.id}
                  cx="30"
                  cy={30 + i * 25}
                  r={node.isEgo ? 7 : 5}
                  fill={getCitationColor(node.citations)}
                  stroke="#424242"
                  strokeWidth="0.5"
                />
              ))}
            </>
          )}
        </svg>
      </div>

      {/* Citation legend */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">Citation Count Color Scale:</div>
        <div className="flex gap-3">
          {[
            { color: '#ffffff', label: '<10' },
            { color: '#fcdaca', label: '10-50' },
            { color: '#e599a6', label: '50-100' },
            { color: '#c94b77', label: '100-500' },
            { color: '#740980', label: '500+' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PIPELINE STEP VISUALIZATION
// ============================================

function PipelineStepDemo() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'load',
      name: '1. Load',
      description: 'Parse CSV files and build network topology with entity metadata.',
      input: 'relations.csv, entities.csv, citations.csv',
      output: 'Topology graph, Entity metadata, Line colors',
      visual: (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-cyan-100 p-2 rounded">relations.csv</div>
          <div className="bg-green-100 p-2 rounded">entities.csv</div>
          <div className="bg-purple-100 p-2 rounded">citations.csv</div>
        </div>
      ),
    },
    {
      id: 'center',
      name: '2. Center',
      description: '2-hop BFS from ego to extract egocentric neighborhood. Construct sessions by timestamp.',
      input: 'Full network, Ego name',
      output: 'Filtered entities, Sessions[], Hop distances',
      visual: (
        <svg viewBox="0 0 200 100" className="w-full h-20">
          <circle cx="100" cy="50" r="15" fill="#424242" />
          <text x="100" y="54" textAnchor="middle" fill="white" fontSize="8">Ego</text>
          {[30, 70, 130, 170].map((x, i) => (
            <g key={i}>
              <line x1="100" y1="50" x2={x} y2={i < 2 ? 30 : 70} stroke="#ddd" />
              <circle cx={x} cy={i < 2 ? 30 : 70} r="8" fill={i < 2 ? '#FA9902' : '#146b6b'} />
            </g>
          ))}
          <text x="100" y="90" textAnchor="middle" fontSize="8" fill="#666">2-hop neighborhood</text>
        </svg>
      ),
    },
    {
      id: 'order',
      name: '3. Order',
      description: 'Barycenter heuristic: position entities at average of neighbors. 10 forward/backward sweeps.',
      input: 'Entities per timestamp',
      output: 'Ordered entity indices per timestamp',
      visual: (
        <svg viewBox="0 0 200 80" className="w-full h-16">
          <text x="10" y="15" fontSize="8" fill="#666">Before:</text>
          {[1, 3, 2, 4].map((v, i) => (
            <rect key={`b${i}`} x={50 + i * 35} y={5} width="30" height="15" fill="#fca5a5" rx="2" />
          ))}
          <text x="10" y="55" fontSize="8" fill="#666">After:</text>
          {[1, 2, 3, 4].map((v, i) => (
            <rect key={`a${i}`} x={50 + i * 35} y={45} width="30" height="15" fill="#86efac" rx="2" />
          ))}
          <path d="M 100 25 L 100 40" stroke="#666" strokeWidth="1" markerEnd="url(#arr)" />
        </svg>
      ),
    },
    {
      id: 'align',
      name: '4. Align',
      description: 'LCS dynamic programming to maximize straight horizontal lines across timestamps.',
      input: 'Ordered entities',
      output: 'Session alignment table',
      visual: (
        <svg viewBox="0 0 200 60" className="w-full h-12">
          <line x1="20" y1="20" x2="180" y2="20" stroke="#16a34a" strokeWidth="2" />
          <line x1="20" y1="30" x2="100" y2="30" stroke="#eab308" strokeWidth="2" />
          <line x1="100" y1="30" x2="180" y2="40" stroke="#eab308" strokeWidth="2" />
          <line x1="20" y1="45" x2="60" y2="45" stroke="#dc2626" strokeWidth="2" />
          <line x1="60" y1="45" x2="120" y2="35" stroke="#dc2626" strokeWidth="2" />
          <line x1="120" y1="35" x2="180" y2="50" stroke="#dc2626" strokeWidth="2" />
          <text x="185" y="22" fontSize="7" fill="#16a34a">straight</text>
          <text x="185" y="42" fontSize="7" fill="#eab308">1 bend</text>
          <text x="185" y="52" fontSize="7" fill="#dc2626">2 bends</text>
        </svg>
      ),
    },
    {
      id: 'compact',
      name: '5. Compact',
      description: 'Assign vertical heights minimizing space or wiggles. 5 strategies for idle entities.',
      input: 'Aligned sessions',
      output: 'Height table (entity × timestamp)',
      visual: (
        <svg viewBox="0 0 200 80" className="w-full h-16">
          <text x="5" y="15" fontSize="7" fill="#666">Heights:</text>
          {[0, 1, 2, 3, 4].map((t) => (
            <g key={t}>
              <line x1={40 + t * 35} y1="10" x2={40 + t * 35} y2="70" stroke="#e5e7eb" strokeDasharray="2" />
              <circle cx={40 + t * 35} cy={30 + Math.sin(t) * 10} r="4" fill="#3b82f6" />
              <circle cx={40 + t * 35} cy={50 + Math.cos(t) * 8} r="4" fill="#f97316" />
            </g>
          ))}
        </svg>
      ),
    },
    {
      id: 'render',
      name: '6. Render',
      description: 'Convert layout to SVG paths. Generate bezier curves, arc outlines, labels.',
      input: 'Height table, Sessions',
      output: 'SpreadLineResult JSON',
      visual: (
        <svg viewBox="0 0 200 60" className="w-full h-12">
          <path d="M 20 30 C 50 30, 60 20, 90 20 L 120 20 C 150 20, 160 40, 180 40" fill="none" stroke="#3b82f6" strokeWidth="2" />
          <path d="M 20 40 L 90 40 L 120 40 C 150 40, 160 25, 180 25" fill="none" stroke="#f97316" strokeWidth="2" />
          <rect x="85" y="10" width="40" height="40" rx="10" fill="none" stroke="#424242" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-6">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="font-semibold text-gray-900">Processing Pipeline (Step-by-Step)</div>
        <p className="text-sm text-gray-600">Click each phase to see details. No auto-play.</p>
      </div>

      {/* Step buttons */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(i)}
            className={`flex-1 min-w-[100px] px-3 py-3 text-sm font-medium transition-colors ${
              activeStep === i
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {step.name}
          </button>
        ))}
      </div>

      {/* Active step content */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">{steps[activeStep].name}</h4>
            <p className="text-gray-600 text-sm mb-4">{steps[activeStep].description}</p>

            <div className="space-y-3">
              <div className="bg-green-50 rounded p-3">
                <div className="text-xs font-medium text-green-700 mb-1">Input</div>
                <div className="text-sm text-green-800">{steps[activeStep].input}</div>
              </div>
              <div className="bg-blue-50 rounded p-3">
                <div className="text-xs font-medium text-blue-700 mb-1">Output</div>
                <div className="text-sm text-blue-800">{steps[activeStep].output}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
            {steps[activeStep].visual}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CSV SCHEMA TABLE WITH EXAMPLES
// ============================================

function CSVSchemaTable({ name, description, columns, examples }: {
  name: string;
  description: string;
  columns: { name: string; type: string; desc: string }[];
  examples: string[][];
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-4">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="font-mono text-blue-700 font-semibold">{name}</div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      {/* Column definitions */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Columns</div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {columns.map((col) => (
            <Tooltip key={col.name} content={col.desc}>
              <div className="bg-gray-50 px-2 py-1 rounded cursor-help">
                <span className="font-mono text-purple-600">{col.name}</span>
                <span className="text-gray-400 ml-1">({col.type})</span>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Example rows */}
      <div className="p-4">
        <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Example Rows</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((col) => (
                  <th key={col.name} className="px-3 py-2 text-left text-gray-600 font-medium">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {examples.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-gray-700 truncate max-w-[200px]" title={cell}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INTERFACE TABLE COMPONENT
// ============================================

function InterfaceTable({ name, fields, description }: {
  name: string;
  fields: { name: string; type: string; required: boolean; desc: string }[];
  description?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-4">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <span className="text-purple-600 font-mono text-sm">interface</span>{' '}
        <span className="text-blue-600 font-mono font-bold">{name}</span>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Field</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Required</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {fields.map((field) => (
            <tr key={field.name}>
              <td className="px-4 py-2 font-mono text-blue-700">{field.name}</td>
              <td className="px-4 py-2 font-mono text-green-700">{field.type}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-0.5 rounded text-xs ${field.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {field.required ? 'required' : 'optional'}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-600">{field.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// SECTION COMPONENTS
// ============================================

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-8 scroll-mt-20">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function FileRef({ path, line }: { path: string; line?: number }) {
  return (
    <Tooltip content={`Source file: ${path}${line ? ` at line ${line}` : ''}`}>
      <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono cursor-help">
        {path}{line ? `:${line}` : ''}
      </code>
    </Tooltip>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function TechnicalDesignDocumentV2() {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    // Initialize mermaid
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      // @ts-expect-error mermaid loaded from CDN
      window.mermaid?.initialize({
        startOnLoad: false,
        theme: 'default',
        flowchart: { useMaxWidth: true, htmlLabels: true },
        securityLevel: 'loose',
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(item => document.getElementById(item.id));
      const scrollPos = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(tableOfContents[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Technical Design Document <span className="text-blue-600">v2</span>
              </h1>
              <p className="text-gray-500 text-sm">SpreadLine Feature - Enhanced Interactive Documentation</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/frontend3/demo"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                View Demo
              </Link>
              <Link
                href="/spreadline-design1"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                v1 Docs
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="sticky top-24 bg-white rounded-lg border border-gray-200 p-4 max-h-[calc(100vh-8rem)] overflow-auto">
            <div className="text-sm font-semibold text-gray-900 mb-3">Table of Contents</div>
            <ul className="space-y-1">
              {tableOfContents.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block py-1 text-sm transition-colors ${
                      item.level === 2 ? 'pl-4' : ''
                    } ${
                      activeSection === item.id
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-lg border border-gray-200 p-8">

            {/* ============================================ */}
            {/* SECTION 1: OVERVIEW */}
            {/* ============================================ */}
            <Section id="overview" title="1. Overview">
              <p className="text-gray-700 mb-4">
                <Tooltip content="Visualization framework from IEEE TVCG 2024">
                  <strong className="cursor-help">SpreadLine</strong>
                </Tooltip>{' '}
                is a visualization framework for exploring{' '}
                <Tooltip content="Network centered on one focal entity">
                  <em className="cursor-help">egocentric dynamic networks</em>
                </Tooltip>{' '}
                from the perspective of a central node (ego). It shows how influence spreads through networks over time.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="font-semibold text-blue-800 mb-2">Key Capabilities</div>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { icon: '📊', text: 'Temporal network visualization with storyline layout' },
                    { icon: '🎯', text: '2-hop egocentric network filtering' },
                    { icon: '🔍', text: 'Interactive block expansion with force simulation' },
                    { icon: '📉', text: 'Crossing reduction via barycenter algorithm' },
                    { icon: '📏', text: 'Wiggle minimization via LCS alignment' },
                    { icon: '🎨', text: 'Customizable color scales and content rendering' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-blue-700">
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <InteractiveStorylineDemo />

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Source of Truth</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><FileRef path="app/frontend3" /> - Frontend implementation</li>
                    <li><FileRef path="app/api/nodeFetchSpreadLine4" /> - Backend API</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Reference</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Paper: <a href="https://arxiv.org/pdf/2408.08992" className="text-blue-600 hover:underline">arXiv:2408.08992</a></li>
                    <li>Design Doc v1: <FileRef path="app/spreadline-design1/page.tsx" /></li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 2: ARCHITECTURE */}
            {/* ============================================ */}
            <Section id="architecture" title="2. Architecture">

              <SubSection id="architecture-high-level" title="2.1 High-Level Architecture">
                <MermaidDiagram
                  title="System Architecture"
                  height="400px"
                  chart={`
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '14px' }}}%%
flowchart TB
    subgraph Client["Frontend (React + D3.js)"]
        direction TB
        UI["SpreadLineChart.tsx<br/>React Component"]
        VIS["SpreadLinesVisualizer.ts<br/>D3 Visualization"]
        EXP["Expander.ts<br/>Block Expansion"]
        COL["Collapser.ts<br/>Block Collapse"]
        HOOK["useSpreadLineData.ts<br/>TanStack Query"]
    end

    subgraph API["Next.js API Route"]
        direction TB
        ROUTE["route.ts<br/>HTTP Handler"]
        SL["SpreadLine Class<br/>Orchestrator"]
    end

    subgraph Pipeline["5-Phase Optimization Pipeline"]
        direction LR
        P1["1. order.ts<br/>Barycenter"]
        P2["2. align.ts<br/>LCS"]
        P3["3. compact.ts<br/>Heights"]
        P4["4. contextualize.ts<br/>Layout"]
        P5["5. render.ts<br/>SVG Paths"]
        P1 --> P2 --> P3 --> P4 --> P5
    end

    subgraph Data["Data Sources"]
        CSV["CSV Files<br/>relations, entities, citations"]
        EXT["External API<br/>(Future)"]
    end

    UI --> VIS
    VIS --> EXP
    VIS --> COL
    UI --> HOOK
    HOOK -->|"GET /api/nodeFetchSpreadLine4"| ROUTE
    ROUTE --> SL
    SL --> Pipeline
    ROUTE --> CSV
    ROUTE -.->|"Future Integration"| EXT

    style Client fill:#e0f2fe,stroke:#0284c7
    style API fill:#dcfce7,stroke:#16a34a
    style Pipeline fill:#fef3c7,stroke:#d97706
    style Data fill:#f3e8ff,stroke:#9333ea
                  `}
                />
              </SubSection>

              <SubSection id="architecture-data-flow" title="2.2 Data Flow">
                <MermaidDiagram
                  title="Request-Response Sequence"
                  height="500px"
                  chart={`
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '12px' }}}%%
sequenceDiagram
    autonumber
    participant User
    participant React as SpreadLineChart
    participant Hook as useSpreadLineData
    participant API as /api/nodeFetchSpreadLine4
    participant SL as SpreadLine
    participant CSV as CSV Files

    User->>React: Load /frontend3/demo
    React->>Hook: Initialize TanStack Query
    Hook->>API: GET request

    rect rgb(240, 253, 244)
        Note over API,CSV: Data Loading Phase
        API->>CSV: fs.readFile(relations.csv)
        API->>CSV: fs.readFile(entities.csv)
        API->>CSV: fs.readFile(citations.csv)
        CSV-->>API: Raw CSV data
    end

    rect rgb(254, 243, 199)
        Note over API,SL: Processing Pipeline
        API->>SL: new SpreadLine()
        API->>SL: load(topology, lineColor, nodeContext)
        API->>SL: center("Jeffrey Heer")
        API->>SL: configure({minimize: "wiggles"})
        API->>SL: fit(2337, 800)

        Note over SL: Phase 1: ordering()
        Note over SL: Phase 2: aligning()
        Note over SL: Phase 3: compacting()
        Note over SL: Phase 4: contextualizing()
        Note over SL: Phase 5: rendering()
    end

    SL-->>API: SpreadLineResult JSON
    API-->>Hook: HTTP 200 Response
    Hook-->>React: data object

    rect rgb(224, 242, 254)
        Note over React,User: Rendering Phase
        React->>React: Create SpreadLinesVisualizer
        React->>React: visualize(svgElement)
        React-->>User: Interactive visualization
    end
                  `}
                />
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 3: COMPONENTS */}
            {/* ============================================ */}
            <Section id="components" title="3. Components">

              <SubSection id="components-frontend" title="3.1 Frontend">
                <p className="text-gray-700 mb-4">
                  The frontend uses React for component lifecycle and D3.js for all SVG rendering and animations.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      color: 'blue',
                      name: 'SpreadLineChart.tsx',
                      path: 'app/frontend3/components/SpreadLineChart.tsx',
                      desc: 'React wrapper managing D3 visualization lifecycle. Re-renders on data/config/resetKey changes.',
                      props: 'data, config, yearsFilter, crossingOnly, onBlockExpand',
                    },
                    {
                      color: 'green',
                      name: 'SpreadLinesVisualizer.ts',
                      path: 'app/frontend3/components/SpreadLineVisualizer.ts',
                      desc: 'Core D3 class (1077 lines). Handles SVG, storylines, blocks, labels, hover/pin, brush.',
                      props: 'visualize(), applyFilter(), _blockUpdate(), _lineHover()',
                    },
                    {
                      color: 'purple',
                      name: 'Expander.ts / Collapser.ts',
                      path: 'app/frontend3/components/Expander.ts',
                      desc: 'Animation handlers. Expander: shift right, dummy lines, force simulation. Collapser: reverse.',
                      props: 'act(), updateBrushedSelection()',
                    },
                    {
                      color: 'orange',
                      name: 'useSpreadLineData.ts',
                      path: 'app/frontend3/components/useSpreadLineData.ts',
                      desc: 'TanStack Query hook for data fetching. 5-minute staleTime, provides setData() for updates.',
                      props: 'data, loading, error, setData, refetch',
                    },
                  ].map((item) => (
                    <div key={item.name} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full bg-${item.color}-500`} style={{ backgroundColor: item.color === 'blue' ? '#3b82f6' : item.color === 'green' ? '#22c55e' : item.color === 'purple' ? '#a855f7' : '#f97316' }}></div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 mb-2"><FileRef path={item.path} /></div>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            Key: <code className="bg-gray-100 px-1 rounded">{item.props}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <InteractiveBlockDemo />
              </SubSection>

              <SubSection id="components-backend" title="3.2 Backend">
                <p className="text-gray-700 mb-4">
                  The backend is a Next.js App Router API endpoint orchestrating the SpreadLine processing pipeline.
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-gray-900 mb-2">Pipeline Modules</div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Module</th>
                        <th className="px-3 py-2 text-left">Function</th>
                        <th className="px-3 py-2 text-left">Complexity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-3 py-2 font-mono text-purple-600">order.ts</td>
                        <td className="px-3 py-2 text-gray-600">Barycenter heuristic - 10 forward/backward sweeps</td>
                        <td className="px-3 py-2 text-gray-500">O(iter × T × E)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-purple-600">align.ts</td>
                        <td className="px-3 py-2 text-gray-600">LCS dynamic programming for straight lines</td>
                        <td className="px-3 py-2 text-gray-500">O(N² × T)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-purple-600">compact.ts</td>
                        <td className="px-3 py-2 text-gray-600">Height assignment with 5 idle strategies</td>
                        <td className="px-3 py-2 text-gray-500">947 lines</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-purple-600">contextualize.ts</td>
                        <td className="px-3 py-2 text-gray-600">Layout positions for expanded blocks</td>
                        <td className="px-3 py-2 text-gray-500">O(N × T)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-purple-600">render.ts</td>
                        <td className="px-3 py-2 text-gray-600">SVG path generation (beziers, arcs)</td>
                        <td className="px-3 py-2 text-gray-500">656 lines</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <PipelineStepDemo />
              </SubSection>

              <SubSection id="components-external" title="3.3 External Services">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-amber-800 mb-2">Future Integration</div>
                  <p className="text-amber-700 text-sm">
                    An external backend will replace the current CSV data source. See{' '}
                    <a href="#api-external" className="underline">Section 4.2</a> for the full API contract including the{' '}
                    <code className="bg-amber-100 px-1 rounded">mode</code> field.
                  </p>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 4: API DESIGN */}
            {/* ============================================ */}
            <Section id="api-design" title="4. API Design">

              <SubSection id="api-current" title="4.1 Current API">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-gray-900">/api/nodeFetchSpreadLine4</code>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-4">
                      Computes SpreadLine visualization for Jeffrey Heer&apos;s egocentric author network.
                    </p>

                    <div className="text-sm font-medium text-gray-700 mb-2">Response (with real example values)</div>
                    <CodeBlock
                      language="json"
                      code={`{
  "mode": "author",
  "ego": "Jeffrey Heer",
  "bandWidth": 101.816,
  "blockWidth": 40,
  "heightExtents": [268, 520],
  "timeLabels": [
    { "label": "2002", "posX": 62.908 },
    { "label": "2003", "posX": 164.724 },
    { "label": "2004", "posX": 266.54 }
  ],
  "storylines": [{
    "name": "Jeffrey Heer",
    "id": 2,
    "color": "#424242",
    "lifespan": 21,
    "crossingCheck": false,
    "lines": [
      "M62.908,414 L164.724,414",
      "M164.724,414 L266.54,414"
    ],
    "marks": [
      { "posX": 55.908, "posY": 414, "name": "Jeffrey Heer", "size": 21.2 },
      { "posX": 525.908, "posY": 414, "name": "Jeffrey Heer", "size": 21.2 }
    ],
    "label": {
      "posX": 50.908,
      "posY": 414,
      "textAlign": "end",
      "line": "M52.908,414 L60.908,414",
      "label": "Jeffrey Heer"
    },
    "inlineLabels": []
  }],
  "blocks": [{
    "id": 0,
    "time": "2002",
    "moveX": 228,
    "topPosY": 288,
    "names": ["Tara Matthews", "Tim Sohn", "Jeffrey Heer", "Ed H. Chi"],
    "points": [
      {
        "id": 65,
        "name": "Tara Matthews",
        "posX": 62.908,
        "posY": 288,
        "group": 0,
        "label": "60",
        "scaleX": 0.1917,
        "scaleY": 0.0,
        "visibility": "visible"
      },
      {
        "id": 2,
        "name": "Jeffrey Heer",
        "posX": 62.908,
        "posY": 414,
        "group": 0,
        "label": "295",
        "scaleX": 0.5220,
        "scaleY": 0.5923,
        "visibility": "visible"
      }
    ],
    "relations": [[65, 2], [66, 2], [64, 2]],
    "outline": {
      "left": "M63.22,268.00A20,20,0,0,0,42.91,288...",
      "right": "M62.59,268.00A20,20,0,0,1,82.91,288...",
      "top": "M62.908,268.0L290.908,268.0",
      "bottom": "M62.908,536.0L290.908,536.0",
      "button": { "width": 60, "height": 18, "posX": 62.908, "posY": 536 }
    }
  }],
  "reference": [
    { "year": "2002", "name": "visualization", "posX": 0.5, "posY": 0.3 },
    { "year": "2007", "name": "many eyes", "posX": 0.615, "posY": 0.468 }
  ]
}`}
                    />
                  </div>
                </div>
              </SubSection>

              <SubSection id="api-external" title="4.2 External API Contract">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-blue-800 mb-2">Contract Definition</div>
                  <p className="text-blue-700 text-sm">
                    The external API must provide network topology data. We control this contract.
                    Note the <code className="bg-blue-100 px-1 rounded">mode</code> field which determines visualization behavior.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-gray-900">/external/network/{'{'}ego{'}'}</code>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Query Parameters</div>
                    <table className="w-full text-sm mb-4">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Parameter</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-left">Default</th>
                          <th className="px-3 py-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-mono text-blue-600">mode</td>
                          <td className="px-3 py-2">string</td>
                          <td className="px-3 py-2">&quot;author&quot;</td>
                          <td className="px-3 py-2 text-gray-600">Visualization mode: &quot;author&quot; | &quot;hashtag&quot; | &quot;custom&quot;</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-mono text-blue-600">hopLimit</td>
                          <td className="px-3 py-2">integer</td>
                          <td className="px-3 py-2">2</td>
                          <td className="px-3 py-2 text-gray-600">Maximum hops from ego (1-3)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-mono text-blue-600">startTime</td>
                          <td className="px-3 py-2">string</td>
                          <td className="px-3 py-2">-</td>
                          <td className="px-3 py-2 text-gray-600">ISO 8601 date (e.g., &quot;2002-01-01&quot;)</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-mono text-blue-600">endTime</td>
                          <td className="px-3 py-2">string</td>
                          <td className="px-3 py-2">-</td>
                          <td className="px-3 py-2 text-gray-600">ISO 8601 date (e.g., &quot;2023-12-31&quot;)</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="text-sm font-medium text-gray-700 mb-2">Response (with example values)</div>
                    <CodeBlock
                      language="json"
                      code={`{
  "mode": "author",
  "ego": "Jeffrey Heer",
  "timeRange": {
    "start": "2002-01-01",
    "end": "2023-12-31"
  },
  "relations": [
    {
      "source": "Jeffrey Heer",
      "target": "Ed H. Chi",
      "time": "2002",
      "id": "53e9981db7602d970203d5ca",
      "weight": 1,
      "type": "co-author",
      "citationCount": 60
    },
    {
      "source": "Jeffrey Heer",
      "target": "James A. Landay",
      "time": "2002",
      "id": "53e9981db7602d970203d5cb",
      "weight": 1,
      "type": "co-author",
      "citationCount": 60
    }
  ],
  "entities": [
    {
      "name": "Jeffrey Heer",
      "year": "2002",
      "affiliation": "UC Berkeley",
      "metadata": { "department": "CS" }
    },
    {
      "name": "Ed H. Chi",
      "year": "2002",
      "affiliation": "PARC",
      "metadata": {}
    }
  ],
  "nodeContext": [
    { "entity": "Jeffrey Heer", "time": "2002", "context": 295 },
    { "entity": "Ed H. Chi", "time": "2002", "context": 60 }
  ],
  "contentLayout": [
    { "id": "Jeffrey Heer", "timestamp": "2002", "posX": 0.522, "posY": 0.592 },
    { "id": "Ed H. Chi", "timestamp": "2002", "posX": 0.191, "posY": 0.0 }
  ],
  "reference": [
    { "year": "2002", "name": "visualization", "posX": 0.5, "posY": 0.3 }
  ]
}`}
                    />

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <div className="font-semibold text-yellow-800 text-sm mb-1">Mode Field Semantics</div>
                      <ul className="text-yellow-700 text-sm space-y-1">
                        <li><code className="bg-yellow-100 px-1 rounded">&quot;author&quot;</code> - Academic collaboration network (vis-author dataset)</li>
                        <li><code className="bg-yellow-100 px-1 rounded">&quot;hashtag&quot;</code> - Social media influence network (#MeToo dataset)</li>
                        <li><code className="bg-yellow-100 px-1 rounded">&quot;custom&quot;</code> - Generic network with user-defined semantics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 5: DATA MODELS */}
            {/* ============================================ */}
            <Section id="data-models" title="5. Data Models">

              <SubSection id="data-models-backend" title="5.1 Backend Types">
                <InterfaceTable
                  name="SpreadLineResult"
                  description="Main output structure from the rendering pipeline"
                  fields={[
                    { name: 'mode', type: 'string', required: false, desc: 'Visualization mode: "author" | "hashtag" | "custom"' },
                    { name: 'ego', type: 'string', required: true, desc: 'Name of the central entity' },
                    { name: 'bandWidth', type: 'number', required: true, desc: 'Width of each time band in pixels' },
                    { name: 'blockWidth', type: 'number', required: true, desc: 'Width of block outline (default 40)' },
                    { name: 'heightExtents', type: '[number, number]', required: true, desc: 'Min and max Y coordinates' },
                    { name: 'timeLabels', type: 'TimeLabel[]', required: true, desc: 'Position of time axis labels' },
                    { name: 'storylines', type: 'StorylineResult[]', required: true, desc: 'Entity path data' },
                    { name: 'blocks', type: 'BlockResult[]', required: true, desc: 'Session block data' },
                    { name: 'reference', type: 'any[]', required: false, desc: 'Reference labels for expanded blocks' },
                  ]}
                />

                <InterfaceTable
                  name="PointResult"
                  description="Node position within an expanded block"
                  fields={[
                    { name: 'id', type: 'number', required: true, desc: 'Entity index (e.g., 65)' },
                    { name: 'name', type: 'string', required: true, desc: 'Entity name (e.g., "Tara Matthews")' },
                    { name: 'posX', type: 'number', required: true, desc: 'X position in pixels (e.g., 62.908)' },
                    { name: 'posY', type: 'number', required: true, desc: 'Y position in pixels (e.g., 288)' },
                    { name: 'group', type: 'number', required: true, desc: 'Block ID this point belongs to' },
                    { name: 'label', type: 'string', required: true, desc: 'Citation count as string (e.g., "60")' },
                    { name: 'scaleX', type: 'number', required: true, desc: 'Normalized X for force sim (0-1)' },
                    { name: 'scaleY', type: 'number', required: true, desc: 'Normalized Y for force sim (0-1)' },
                    { name: 'visibility', type: 'string', required: true, desc: '"visible" | "hidden"' },
                  ]}
                />
              </SubSection>

              <SubSection id="data-models-frontend" title="5.2 Frontend Types">
                <InterfaceTable
                  name="SpreadLineConfig"
                  description="Configuration for visualization behavior and appearance"
                  fields={[
                    { name: 'legend.line', type: 'object', required: true, desc: 'Line color legend config' },
                    { name: 'legend.node', type: 'object', required: true, desc: 'Node color scale (threshold)' },
                    { name: 'content.customize', type: 'function', required: true, desc: 'Custom renderer for expanded blocks' },
                    { name: 'content.collisionDetection', type: 'boolean', required: true, desc: 'Enable D3 force collision' },
                    { name: 'content.showLinks', type: 'boolean', required: true, desc: 'Show relation arcs' },
                  ]}
                />
              </SubSection>

              <SubSection id="data-models-csv" title="5.3 CSV Schema">
                <p className="text-gray-700 mb-4">
                  Current data source uses CSV files in <FileRef path="SpreadLine-main/case-studies/vis-author" />.
                </p>

                <CSVSchemaTable
                  name="relations.csv"
                  description="Network topology - collaboration edges between entities"
                  columns={[
                    { name: 'year', type: 'integer', desc: 'Publication year' },
                    { name: 'source', type: 'string', desc: 'Source entity name' },
                    { name: 'target', type: 'string', desc: 'Target entity name' },
                    { name: 'id', type: 'string', desc: 'Paper/event ID' },
                    { name: 'type', type: 'string', desc: 'Relation type (e.g., Co-co-author)' },
                    { name: 'citationcount', type: 'float', desc: 'Citation count of paper' },
                    { name: 'count', type: 'integer', desc: 'Edge weight' },
                  ]}
                  examples={[
                    ['2002', 'Jeffrey Heer', 'Ed H. Chi', '53e9981db7602d970203d5ca', 'Co-co-author', '60.0', '1'],
                    ['2002', 'Jeffrey Heer', 'James A. Landay', '53e9981db7602d970203d5ca', 'Co-co-author', '60.0', '1'],
                    ['2005', 'Jeffrey Heer', 'Danah Boyd', '53e998aab7602d97020f61bc', 'Co-co-author', '2062.0', '1'],
                    ['2007', 'Jeffrey Heer', 'Martin Wattenberg', '53e99b72b7602d9702460fe7', 'Co-co-author', '361.0', '1'],
                  ]}
                />

                <CSVSchemaTable
                  name="entities.csv"
                  description="Entity metadata - affiliations by year"
                  columns={[
                    { name: 'name', type: 'string', desc: 'Author name' },
                    { name: 'year', type: 'integer', desc: 'Year of affiliation' },
                    { name: 'citationcount', type: 'integer', desc: 'Total citations that year' },
                    { name: 'affiliation', type: 'string', desc: 'Institution/organization' },
                  ]}
                  examples={[
                    ['Jeffrey Heer', '2002', '60', 'UC Berkeley'],
                    ['Ed H. Chi', '2002', '60', 'PARC'],
                    ['Ben Shneiderman', '1992', '2227', 'University of Maryland'],
                    ['John Stasko', '2004', '6', 'Georgia Institute of Technology'],
                  ]}
                />

                <CSVSchemaTable
                  name="citations.csv"
                  description="Paper citation counts per author per year"
                  columns={[
                    { name: 'name', type: 'string', desc: 'Author name' },
                    { name: 'year', type: 'integer', desc: 'Publication year' },
                    { name: 'citationcount', type: 'integer', desc: 'Citation count' },
                    { name: 'affiliation', type: 'string', desc: 'Affiliation at publication' },
                    { name: 'paperID', type: 'string', desc: 'Unique paper identifier' },
                  ]}
                  examples={[
                    ['Jeffrey Heer', '2002', '60', 'UC Berkeley', '53e9981db7602d970203d5ca'],
                    ['Jeffrey Heer', '2005', '3140', 'UC Berkeley', '53e998aab7602d97020f61bc'],
                    ['Danah Boyd', '2005', '2062', 'UC Berkeley', '53e998aab7602d97020f61bc'],
                    ['Ben Shneiderman', '1992', '2227', 'University of Maryland', '53e9b11db7602d9703b9ef40'],
                  ]}
                />

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="font-semibold text-red-700 text-sm mb-1">Important Clarification</div>
                  <p className="text-red-600 text-sm">
                    The <code>name</code> column refers to <strong>author names</strong>, not paper titles.
                    Paper titles are not stored in the vis-author dataset.
                  </p>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 6: CORE FLOWS */}
            {/* ============================================ */}
            <Section id="core-flows" title="6. Core Flows">

              <SubSection id="flow-pipeline" title="6.1 Processing Pipeline">
                <PipelineStepDemo />

                <MermaidDiagram
                  title="Pipeline Data Flow (Detailed)"
                  height="350px"
                  chart={`
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '12px' }}}%%
flowchart TD
    subgraph Input["Input Data"]
        CSV["CSV Files"]
        EGO["Ego: Jeffrey Heer"]
        SIZE["Size: 2337×800"]
    end

    subgraph Phase1["Phase 1: Load & Center"]
        PARSE["Parse CSV → Topology"]
        BFS["2-hop BFS from Ego"]
        SESSIONS["Construct Sessions"]
    end

    subgraph Phase2["Phase 2: Order"]
        BC1["Forward Sweep"]
        BC2["Backward Sweep"]
        BC3["Repeat 10×"]
    end

    subgraph Phase3["Phase 3: Align"]
        LCS["LCS Dynamic Programming"]
        REWARD["Reward: alignment + order"]
    end

    subgraph Phase4["Phase 4: Compact"]
        SLOTS["Construct Slots"]
        HEIGHTS["Assign Heights"]
        IDLE["5 Idle Strategies"]
    end

    subgraph Phase5["Phase 5: Render"]
        SCALE["scaleBand() emulation"]
        BEZIER["Bezier curves"]
        ARCS["Arc outlines"]
        LABELS["Labels & markers"]
    end

    subgraph Output["Output"]
        JSON["SpreadLineResult JSON"]
    end

    Input --> Phase1
    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
    Phase4 --> Phase5
    Phase5 --> Output

    PARSE --> BFS --> SESSIONS
    BC1 --> BC2 --> BC3
    LCS --> REWARD
    SLOTS --> HEIGHTS --> IDLE
    SCALE --> BEZIER --> ARCS --> LABELS

    style Phase1 fill:#dcfce7
    style Phase2 fill:#fef3c7
    style Phase3 fill:#dbeafe
    style Phase4 fill:#fce7f3
    style Phase5 fill:#f3e8ff
                  `}
                />
              </SubSection>

              <SubSection id="flow-rendering" title="6.2 Rendering Flow">
                <MermaidDiagram
                  title="Frontend Rendering Sequence"
                  height="400px"
                  chart={`
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '11px' }}}%%
sequenceDiagram
    participant React as SpreadLineChart
    participant Vis as SpreadLinesVisualizer
    participant D3 as D3.js

    React->>Vis: new SpreadLinesVisualizer(data, config)
    React->>Vis: visualize(svgElement)

    Vis->>D3: Create SVG structure
    Note over Vis,D3: _drawBackground()
    Vis->>D3: Direction labels
    Vis->>D3: Time labels
    Vis->>D3: Vertical rules

    Note over Vis,D3: _activateBrush()
    Vis->>D3: d3.brushX() on time axis

    Note over Vis,D3: _drawLineLegend()
    Vis->>D3: Color swatches

    Note over Vis,D3: _drawNodeLegend()
    Vis->>D3: Citation color scale

    Note over Vis,D3: _drawStorylines()
    Vis->>D3: Path elements
    Vis->>D3: Entry/exit markers (triangles)

    Note over Vis,D3: _drawBlocksAndPoints()
    Vis->>D3: Arc outlines (pills)
    Vis->>D3: Node circles

    Note over Vis,D3: _drawLabels()
    Vis->>D3: Entity name labels

    Vis->>D3: Inject CSS styles
    Vis->>D3: Create arrow marker def

    Note over React,D3: Initial render complete

    React->>Vis: applyFilter(yearsFilter, crossingOnly)
    Vis->>D3: Update visibility
                  `}
                />
              </SubSection>

              <SubSection id="flow-interaction" title="6.3 User Interactions">
                <MermaidDiagram
                  title="Block Expand/Collapse State Machine"
                  height="350px"
                  chart={`
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '12px' }}}%%
stateDiagram-v2
    [*] --> Collapsed

    Collapsed --> Expanding: Click block
    Expanding --> Expanded: Animation done (500ms)
    Expanded --> Collapsing: Click block
    Collapsing --> Collapsed: Animation done (500ms)

    state Expanding {
        [*] --> ShiftRight: Move elements right
        ShiftRight --> DummyLines: Create fill lines
        DummyLines --> ExpandBG: Expand background rect
        ExpandBG --> ForceSim: D3 force collision
        ForceSim --> DrawArcs: Relation arcs
        DrawArcs --> [*]
    }

    state Collapsing {
        [*] --> RemoveArcs: Shrink animation
        RemoveArcs --> RevertNodes: Reset positions
        RevertNodes --> CollapseBG: Shrink rect
        CollapseBG --> RemoveDummy: Remove fill lines
        RemoveDummy --> ShiftLeft: Move elements left
        ShiftLeft --> [*]
    }
                  `}
                />

                <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                  <div className="font-semibold text-gray-900 mb-2">Interaction Summary</div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Action</th>
                        <th className="px-3 py-2 text-left">Target</th>
                        <th className="px-3 py-2 text-left">Effect</th>
                        <th className="px-3 py-2 text-left">Handler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-3 py-2">
                          <Tooltip content="Toggles block expansion with 500ms animation">
                            <span className="cursor-help">Click</span>
                          </Tooltip>
                        </td>
                        <td className="px-3 py-2">Block / Time label</td>
                        <td className="px-3 py-2 text-gray-600">Expand/collapse block</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">_blockUpdate()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">
                          <Tooltip content="Highlights storyline, dims others to 0.1 opacity">
                            <span className="cursor-help">Hover</span>
                          </Tooltip>
                        </td>
                        <td className="px-3 py-2">Storyline / Point</td>
                        <td className="px-3 py-2 text-gray-600">Highlight line, dim others</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">_lineHover()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">
                          <Tooltip content="Pins storyline permanently until clicked again">
                            <span className="cursor-help">Click</span>
                          </Tooltip>
                        </td>
                        <td className="px-3 py-2">Storyline</td>
                        <td className="px-3 py-2 text-gray-600">Pin/unpin storyline</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">_linePin()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">
                          <Tooltip content="Creates time range selection with d3.brushX">
                            <span className="cursor-help">Drag</span>
                          </Tooltip>
                        </td>
                        <td className="px-3 py-2">Time axis</td>
                        <td className="px-3 py-2 text-gray-600">Brush selection</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">_activateBrush()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Slider</td>
                        <td className="px-3 py-2">Years filter</td>
                        <td className="px-3 py-2 text-gray-600">Hide short-lived entities</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">applyFilter()</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 7: ERROR HANDLING */}
            {/* ============================================ */}
            <Section id="error-handling" title="7. Error Handling & Edge Cases">
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Backend Errors</div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Error</th>
                        <th className="px-3 py-2 text-left">Cause</th>
                        <th className="px-3 py-2 text-left">Handling</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-3 py-2 font-mono text-red-600">CSV not found</td>
                        <td className="px-3 py-2 text-gray-600">Missing data files</td>
                        <td className="px-3 py-2 text-gray-600">Return 500 with message</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-red-600">Ego not found</td>
                        <td className="px-3 py-2 text-gray-600">Ego not in relations</td>
                        <td className="px-3 py-2 text-gray-600">Return 404</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-red-600">Empty network</td>
                        <td className="px-3 py-2 text-gray-600">No 2-hop entities</td>
                        <td className="px-3 py-2 text-gray-600">Return minimal result</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold text-yellow-800 mb-2">Known Limitations</div>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>Large networks (&gt;500 entities) may cause performance issues</li>
                    <li>Force simulation in expanded blocks is synchronous</li>
                    <li>Overlapping labels not automatically resolved</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 8: NFR */}
            {/* ============================================ */}
            <Section id="nfr" title="8. Non-Functional Requirements">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Performance</div>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li><strong>API Response:</strong> &lt;2s for ~100 entities</li>
                    <li><strong>Initial Render:</strong> &lt;500ms</li>
                    <li><strong>Animation:</strong> 500ms, d3.easeQuadInOut</li>
                    <li><strong>Filter Updates:</strong> &lt;100ms</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Browser Support</div>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li><strong>Required:</strong> ES2020+, SVG</li>
                    <li><strong>D3.js:</strong> v7</li>
                    <li><strong>React:</strong> 18.x</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 9: DEPENDENCIES */}
            {/* ============================================ */}
            <Section id="dependencies" title="9. Dependencies">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Package</th>
                      <th className="px-3 py-2 text-left">Version</th>
                      <th className="px-3 py-2 text-left">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-3 py-2 font-mono text-blue-600">react</td>
                      <td className="px-3 py-2">18.x</td>
                      <td className="px-3 py-2 text-gray-600">UI framework</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-blue-600">d3</td>
                      <td className="px-3 py-2">7.x</td>
                      <td className="px-3 py-2 text-gray-600">SVG visualization, force simulation</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-blue-600">@tanstack/react-query</td>
                      <td className="px-3 py-2">5.x</td>
                      <td className="px-3 py-2 text-gray-600">Data fetching and caching</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-blue-600">next</td>
                      <td className="px-3 py-2">14.x</td>
                      <td className="px-3 py-2 text-gray-600">React framework, API routes</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-blue-600">papaparse</td>
                      <td className="px-3 py-2">5.x</td>
                      <td className="px-3 py-2 text-gray-600">CSV parsing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 10: ASSUMPTIONS */}
            {/* ============================================ */}
            <Section id="assumptions" title="10. Assumptions & Open Questions">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold text-green-800 mb-2">Assumptions</div>
                  <ul className="text-green-700 text-sm space-y-2">
                    <li><strong>Data Format:</strong> External API will provide data per Section 4.2 contract</li>
                    <li><strong>Mode Field:</strong> Determines visualization semantics (author/hashtag/custom)</li>
                    <li><strong>Ego Existence:</strong> Ego always exists with at least one relation</li>
                    <li><strong>Timestamps:</strong> Discrete (yearly). Sub-year requires format changes</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="font-semibold text-amber-800 mb-2">Open Questions</div>
                  <ol className="text-amber-700 text-sm space-y-2 list-decimal list-inside">
                    <li><strong>External API Auth:</strong> API key, OAuth, or other mechanism?</li>
                    <li><strong>Caching Strategy:</strong> How long to cache external responses?</li>
                    <li><strong>Real-time Updates:</strong> Refresh-on-demand or live updates?</li>
                    <li><strong>Mobile Support:</strong> Touch interaction required?</li>
                  </ol>
                </div>
              </div>
            </Section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>Technical Design Document v2 - SpreadLine Feature</p>
              <p className="mt-1">Last updated: {new Date().toISOString().split('T')[0]}</p>
              <div className="mt-4 flex justify-center gap-4">
                <Link href="/frontend3/demo" className="text-blue-600 hover:underline">View Demo</Link>
                <Link href="/spreadline-design1" className="text-blue-600 hover:underline">v1 Docs</Link>
                <a href="https://arxiv.org/pdf/2408.08992" className="text-blue-600 hover:underline">Paper</a>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

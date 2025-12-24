'use client';

/**
 * Technical Design Document - SpreadLine
 *
 * Comprehensive documentation for the SpreadLine feature
 * covering architecture, APIs, data models, and core flows.
 */

import { useEffect, useState } from 'react';
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
// MERMAID DIAGRAM COMPONENT
// ============================================

function MermaidDiagram({ chart, title }: { chart: string; title?: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // @ts-expect-error mermaid loaded from CDN
        if (window.mermaid) {
          // @ts-expect-error mermaid loaded from CDN
          const { svg } = await window.mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart);
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
        <pre className="text-xs text-gray-600 mt-2 overflow-auto">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 my-4 overflow-auto">
      {title && <div className="text-sm font-semibold text-gray-700 mb-3">{title}</div>}
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} className="flex justify-center" />
      ) : (
        <div className="text-gray-400 text-center py-8">Loading diagram...</div>
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
      <pre className="p-4 overflow-auto text-sm">
        <code className={`language-${language} text-slate-300`}>{code}</code>
      </pre>
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
// SECTION COMPONENT
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

// ============================================
// FILE REFERENCE COMPONENT
// ============================================

function FileRef({ path, line }: { path: string; line?: number }) {
  return (
    <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">
      {path}{line ? `:${line}` : ''}
    </code>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function TechnicalDesignDocument() {
  const [activeSection, setActiveSection] = useState('overview');

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
      {/* Mermaid CDN */}
      <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js" async />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Technical Design Document
              </h1>
              <p className="text-gray-500 text-sm">SpreadLine Feature - v1.0</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/frontend3/demo"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                View Demo
              </Link>
              <Link
                href="/frontend2"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                Design v2
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar - Table of Contents */}
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
                <strong>SpreadLine</strong> is a visualization framework for exploring <em>egocentric dynamic networks</em> from
                the perspective of a central node (ego). Based on the IEEE TVCG 2024 paper
                &quot;SpreadLine: Visualizing Egocentric Dynamic Influence&quot;, it shows how influence spreads through networks
                over time, centered around a focal actor.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="font-semibold text-blue-800 mb-2">Key Capabilities</div>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>Temporal network visualization with storyline-based layout</li>
                  <li>2-hop egocentric network filtering around a central entity</li>
                  <li>Interactive block expansion with force-directed node positioning</li>
                  <li>Crossing reduction via barycenter heuristic algorithm</li>
                  <li>Wiggle minimization via longest common substring (LCS) alignment</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                    <li>Design Doc v2: <FileRef path="app/frontend2/page.tsx" /></li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="font-semibold text-yellow-800 mb-2">Scope Note</div>
                <p className="text-yellow-700 text-sm">
                  This document covers the TypeScript implementation in <code>app/api/nodeFetchSpreadLine4</code> and
                  <code>app/frontend3</code>. An external backend will replace the current CSV data source.
                  We define only the API contract for this external service (see <a href="#api-external" className="underline">Section 4.2</a>).
                </p>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 2: ARCHITECTURE */}
            {/* ============================================ */}
            <Section id="architecture" title="2. Architecture">

              <SubSection id="architecture-high-level" title="2.1 High-Level Architecture">
                <MermaidDiagram
                  title="System Architecture"
                  chart={`
flowchart TB
    subgraph Client["Frontend (React + D3)"]
        UI["SpreadLineChart.tsx"]
        VIS["SpreadLinesVisualizer.ts"]
        EXP["Expander.ts / Collapser.ts"]
        HOOK["useSpreadLineData.ts"]
    end

    subgraph API["Next.js API Route"]
        ROUTE["route.ts"]
        SL["SpreadLine Class"]
        subgraph Pipeline["5-Phase Pipeline"]
            ORD["order.ts"]
            ALN["align.ts"]
            CMP["compact.ts"]
            CTX["contextualize.ts"]
            RND["render.ts"]
        end
    end

    subgraph Data["Data Sources"]
        CSV["CSV Files"]
        EXT["External API (Future)"]
    end

    UI --> HOOK
    HOOK -->|"fetch /api/nodeFetchSpreadLine4"| ROUTE
    UI --> VIS
    VIS --> EXP

    ROUTE --> SL
    SL --> ORD --> ALN --> CMP --> CTX --> RND
    ROUTE --> CSV
    ROUTE -.->|"Future"| EXT
                  `}
                />

                <p className="text-gray-700 mb-4">
                  The system follows a client-server architecture where the backend processes network data through
                  a 5-phase optimization pipeline, and the frontend renders the result using D3.js.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-purple-700 mb-2">Frontend Layer</div>
                    <p className="text-purple-600 text-sm">
                      React components with D3.js for SVG rendering. TanStack Query for data fetching and caching.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-green-700 mb-2">API Layer</div>
                    <p className="text-green-600 text-sm">
                      Next.js App Router endpoint that orchestrates the SpreadLine processing pipeline.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-orange-700 mb-2">Data Layer</div>
                    <p className="text-orange-600 text-sm">
                      Currently CSV files; future external API will provide network topology data.
                    </p>
                  </div>
                </div>
              </SubSection>

              <SubSection id="architecture-data-flow" title="2.2 Data Flow">
                <MermaidDiagram
                  title="Data Flow Sequence"
                  chart={`
sequenceDiagram
    participant User
    participant React as SpreadLineChart
    participant Hook as useSpreadLineData
    participant API as /api/nodeFetchSpreadLine4
    participant SL as SpreadLine Class
    participant CSV as CSV Files

    User->>React: Load page
    React->>Hook: Initialize query
    Hook->>API: GET request
    API->>CSV: Load relations.csv, entities.csv, citations.csv
    CSV-->>API: Raw data
    API->>SL: load(topology, lineColor, nodeContext)
    API->>SL: center(ego)
    API->>SL: configure({minimize: 'wiggles'})
    API->>SL: fit(width, height)

    Note over SL: 5-Phase Pipeline
    SL->>SL: 1. ordering() - barycenter
    SL->>SL: 2. aligning() - LCS
    SL->>SL: 3. compacting() - height assignment
    SL->>SL: 4. contextualizing() - layout positions
    SL->>SL: 5. rendering() - SVG paths

    SL-->>API: SpreadLineResult JSON
    API-->>Hook: Response
    Hook-->>React: data
    React->>React: D3 visualization
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
                  The frontend is built with React and D3.js, following a separation of concerns where React handles
                  component lifecycle and state, while D3 handles all SVG rendering and animations.
                </p>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-semibold text-gray-900">SpreadLineChart.tsx</div>
                        <div className="text-sm text-gray-500 mb-2"><FileRef path="app/frontend3/components/SpreadLineChart.tsx" /></div>
                        <p className="text-gray-600 text-sm">
                          React wrapper component that manages D3 visualization lifecycle. Re-renders only when data, config,
                          or resetKey changes. Filter changes are handled by D3 directly via <code>applyFilter()</code>.
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          Props: <code>data</code>, <code>config</code>, <code>yearsFilter</code>, <code>crossingOnly</code>,
                          <code>onBlockExpand</code>, <code>onFilterChange</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                      <div>
                        <div className="font-semibold text-gray-900">SpreadLinesVisualizer.ts</div>
                        <div className="text-sm text-gray-500 mb-2"><FileRef path="app/frontend3/components/SpreadLineVisualizer.ts" /></div>
                        <p className="text-gray-600 text-sm">
                          Core D3 visualization class (1077 lines). Handles SVG creation, storyline rendering, block drawing,
                          label positioning, hover/pin interactions, and brush selection.
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          Key methods: <code>visualize()</code>, <code>applyFilter()</code>, <code>_blockUpdate()</code>,
                          <code>_lineHover()</code>, <code>_linePin()</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Expander.ts / Collapser.ts</div>
                        <div className="text-sm text-gray-500 mb-2">
                          <FileRef path="app/frontend3/components/Expander.ts" /> | <FileRef path="app/frontend3/components/Collapser.ts" />
                        </div>
                        <p className="text-gray-600 text-sm">
                          Animation handlers for block expand/collapse. Expander shifts elements right, creates dummy fill lines,
                          applies D3 force simulation for node collision detection, and draws relation arcs. Collapser reverses all animations.
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          Animation duration: 500ms, easing: <code>d3.easeQuadInOut</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-orange-500"></div>
                      <div>
                        <div className="font-semibold text-gray-900">useSpreadLineData.ts</div>
                        <div className="text-sm text-gray-500 mb-2"><FileRef path="app/frontend3/components/useSpreadLineData.ts" /></div>
                        <p className="text-gray-600 text-sm">
                          TanStack Query hook for fetching and caching SpreadLine data. Provides <code>setData()</code> for
                          external updates and <code>refetch()</code> for invalidation.
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          Query key: <code>[&apos;spreadline-data&apos;]</code>, staleTime: 5 minutes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection id="components-backend" title="3.2 Backend">
                <p className="text-gray-700 mb-4">
                  The backend is a Next.js App Router API endpoint that orchestrates the SpreadLine processing pipeline.
                  It loads CSV data, constructs the egocentric network, and runs the 5-phase optimization.
                </p>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-cyan-500"></div>
                      <div>
                        <div className="font-semibold text-gray-900">route.ts</div>
                        <div className="text-sm text-gray-500 mb-2"><FileRef path="app/api/nodeFetchSpreadLine4/route.ts" /></div>
                        <p className="text-gray-600 text-sm">
                          Next.js API route handler. Loads CSV files, constructs author network with ego-centric 2-hop BFS,
                          determines line colors based on affiliation, and invokes SpreadLine pipeline.
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          Endpoints: <code>GET /api/nodeFetchSpreadLine4</code>, <code>POST /api/nodeFetchSpreadLine4</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-semibold text-gray-900">SpreadLine Class</div>
                        <div className="text-sm text-gray-500 mb-2"><FileRef path="app/api/nodeFetchSpreadLine4/spreadline.ts" /></div>
                        <p className="text-gray-600 text-sm">
                          Main orchestrator class managing the 5-phase pipeline. Stores topology, entity metadata,
                          session data, and configuration. Entry point: <code>fit(width, height)</code>.
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          Methods: <code>load()</code>, <code>center()</code>, <code>configure()</code>, <code>fit()</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Pipeline Modules</div>
                        <div className="text-sm text-gray-500 mb-2">
                          <FileRef path="app/api/nodeFetchSpreadLine4/order.ts" /> |
                          <FileRef path="app/api/nodeFetchSpreadLine4/align.ts" /> |
                          <FileRef path="app/api/nodeFetchSpreadLine4/compact.ts" /> |
                          <FileRef path="app/api/nodeFetchSpreadLine4/render.ts" />
                        </div>
                        <table className="w-full text-sm mt-2">
                          <tbody>
                            <tr className="border-b border-gray-100">
                              <td className="py-1 font-mono text-purple-600">order.ts</td>
                              <td className="py-1 text-gray-600">Barycenter heuristic for crossing reduction (10 sweeps)</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-1 font-mono text-purple-600">align.ts</td>
                              <td className="py-1 text-gray-600">LCS-based alignment for straight line maximization</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-1 font-mono text-purple-600">compact.ts</td>
                              <td className="py-1 text-gray-600">Height assignment minimizing space or wiggles (947 lines)</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-1 font-mono text-purple-600">contextualize.ts</td>
                              <td className="py-1 text-gray-600">Layout positions for expanded block content</td>
                            </tr>
                            <tr>
                              <td className="py-1 font-mono text-purple-600">render.ts</td>
                              <td className="py-1 text-gray-600">SVG path generation (bezier curves, arcs)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection id="components-external" title="3.3 External Services">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-amber-800 mb-2">Future Integration</div>
                  <p className="text-amber-700 text-sm">
                    An external backend will replace the current CSV data source. This section defines the API contract
                    that the external service must implement. See <a href="#api-external" className="underline">Section 4.2</a> for the full specification.
                  </p>
                </div>

                <MermaidDiagram
                  title="External Service Integration (Future)"
                  chart={`
flowchart LR
    subgraph Current["Current Implementation"]
        CSV["CSV Files<br/>(relations.csv, entities.csv)"]
    end

    subgraph Future["Future Implementation"]
        EXT["External API"]
        DB["External Database"]
    end

    API["SpreadLine Backend"]

    CSV -->|"fs.readFile"| API
    EXT -.->|"HTTP GET"| API
    DB --> EXT
                  `}
                />
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
                      Computes SpreadLine visualization data for Jeffrey Heer&apos;s egocentric author network.
                    </p>
                    <div className="text-sm font-medium text-gray-700 mb-2">Response</div>
                    <CodeBlock
                      language="json"
                      code={`{
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
    "marks": [{ "posX": 62.908, "posY": 394 }],
    "label": { "posX": 50, "posY": 394, "textAlign": "end", ... },
    "inlineLabels": []
  }, ...],
  "blocks": [{
    "id": 0, "time": "2002",
    "moveX": 228,
    "names": ["Ed Chi", "Jeffrey Heer"],
    "points": [{ "id": 65, "name": "Ed Chi", "posX": 62.908, ... }],
    "outline": { "left": "M...", "right": "M...", "top": "M...", "bottom": "M..." },
    "relations": [[65, 0], [65, 12]]
  }, ...],
  "reference": [{ "year": "2002", "name": "visualization", "posX": 0.5, "posY": 0.3 }, ...],
  "mode": "author"
}`}
                    />
                  </div>
                </div>
              </SubSection>

              <SubSection id="api-external" title="4.2 External API Contract">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-blue-800 mb-2">Contract Definition</div>
                  <p className="text-blue-700 text-sm">
                    The external API must provide network topology data that the SpreadLine backend will ingest.
                    We control this contract - the external service must conform to this specification.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-gray-900">/external/network/{'{'}ego{'}'}</code>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-4">
                      Retrieves egocentric network data for a specified central entity.
                    </p>

                    <div className="text-sm font-medium text-gray-700 mb-2">Path Parameters</div>
                    <table className="w-full text-sm mb-4">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Parameter</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-mono text-blue-600">ego</td>
                          <td className="px-3 py-2">string</td>
                          <td className="px-3 py-2 text-gray-600">URL-encoded name of central entity</td>
                        </tr>
                      </tbody>
                    </table>

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
                          <td className="px-3 py-2 font-mono text-blue-600">hopLimit</td>
                          <td className="px-3 py-2">integer</td>
                          <td className="px-3 py-2">2</td>
                          <td className="px-3 py-2 text-gray-600">Maximum hops from ego (1-3)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-mono text-blue-600">startTime</td>
                          <td className="px-3 py-2">string</td>
                          <td className="px-3 py-2">-</td>
                          <td className="px-3 py-2 text-gray-600">ISO 8601 date for time range start</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2 font-mono text-blue-600">endTime</td>
                          <td className="px-3 py-2">string</td>
                          <td className="px-3 py-2">-</td>
                          <td className="px-3 py-2 text-gray-600">ISO 8601 date for time range end</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="text-sm font-medium text-gray-700 mb-2">Success Response (200 OK)</div>
                    <CodeBlock
                      language="json"
                      code={`{
  "ego": "Jeffrey Heer",
  "timeRange": {
    "start": "2002-01-01",
    "end": "2023-12-31"
  },
  "relations": [
    {
      "source": "Jeffrey Heer",
      "target": "Ed Chi",
      "time": "2002",
      "id": "paper-53e9...",
      "weight": 1,
      "type": "co-author"
    }
  ],
  "entities": [
    {
      "name": "Jeffrey Heer",
      "year": "2002",
      "affiliation": "UC Berkeley",
      "metadata": {}
    }
  ],
  "nodeContext": [
    {
      "entity": "Jeffrey Heer",
      "time": "2002",
      "context": 156
    }
  ],
  "contentLayout": [
    {
      "id": "Jeffrey Heer",
      "timestamp": "2002",
      "posX": 0.655,
      "posY": 0.592
    }
  ],
  "reference": [
    {
      "year": "2002",
      "name": "visualization",
      "posX": 0.5,
      "posY": 0.3
    }
  ]
}`}
                    />

                    <div className="text-sm font-medium text-gray-700 mb-2 mt-4">Error Responses</div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Error Code</th>
                          <th className="px-3 py-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-3 py-2">400</td>
                          <td className="px-3 py-2 font-mono text-red-600">INVALID_EGO</td>
                          <td className="px-3 py-2 text-gray-600">Ego entity not found in database</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2">400</td>
                          <td className="px-3 py-2 font-mono text-red-600">INVALID_TIME_RANGE</td>
                          <td className="px-3 py-2 text-gray-600">startTime &gt; endTime or invalid format</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-3 py-2">404</td>
                          <td className="px-3 py-2 font-mono text-red-600">NO_DATA</td>
                          <td className="px-3 py-2 text-gray-600">No relations found for ego in time range</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">500</td>
                          <td className="px-3 py-2 font-mono text-red-600">INTERNAL_ERROR</td>
                          <td className="px-3 py-2 text-gray-600">Server error - include trace ID for debugging</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Backend Ingestion</div>
                  <p className="text-gray-600 text-sm mb-3">
                    The SpreadLine backend should parse the external API response and map it to internal data structures:
                  </p>
                  <CodeBlock
                    language="typescript"
                    title="External API Ingestion (Future)"
                    code={`// In route.ts - replace CSV loading with API fetch
async function fetchExternalData(ego: string): Promise<ExternalNetworkResponse> {
  const url = \`\${EXTERNAL_API_BASE}/network/\${encodeURIComponent(ego)}\`;
  const response = await fetch(url, {
    headers: { 'Authorization': \`Bearer \${API_KEY}\` }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(\`External API error: \${error.code} - \${error.message}\`);
  }

  return response.json();
}

// Map to SpreadLine format
function mapExternalToInternal(external: ExternalNetworkResponse) {
  const relations: RelationRow[] = external.relations.map(r => ({
    year: r.time,
    source: r.source,
    target: r.target,
    id: r.id,
    count: r.weight
  }));

  // ... continue mapping entities, nodeContext, etc.
}`}
                  />
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 5: DATA MODELS */}
            {/* ============================================ */}
            <Section id="data-models" title="5. Data Models">

              <SubSection id="data-models-backend" title="5.1 Backend Types">
                <p className="text-gray-700 mb-4">
                  Core data structures defined in <FileRef path="app/api/nodeFetchSpreadLine4/types.ts" />.
                </p>

                <InterfaceTable
                  name="SpreadLineResult"
                  description="Main output structure from the rendering pipeline"
                  fields={[
                    { name: 'ego', type: 'string', required: true, desc: 'Name of the central entity' },
                    { name: 'bandWidth', type: 'number', required: true, desc: 'Width of each time band in pixels' },
                    { name: 'blockWidth', type: 'number', required: true, desc: 'Width of block outline (default 40)' },
                    { name: 'heightExtents', type: '[number, number]', required: true, desc: 'Min and max Y coordinates' },
                    { name: 'timeLabels', type: 'TimeLabel[]', required: true, desc: 'Position of time axis labels' },
                    { name: 'storylines', type: 'StorylineResult[]', required: true, desc: 'Entity path data' },
                    { name: 'blocks', type: 'BlockResult[]', required: true, desc: 'Session block data' },
                    { name: 'reference', type: 'any[]', required: false, desc: 'Reference labels for expanded blocks' },
                    { name: 'mode', type: 'string', required: false, desc: 'Visualization mode (e.g., "author")' },
                  ]}
                />

                <InterfaceTable
                  name="StorylineResult"
                  description="Path and metadata for a single entity's storyline"
                  fields={[
                    { name: 'name', type: 'string', required: true, desc: 'Entity name' },
                    { name: 'id', type: 'number', required: true, desc: 'Entity index' },
                    { name: 'color', type: 'string', required: true, desc: 'Line color (hex)' },
                    { name: 'lifespan', type: 'number', required: true, desc: 'Number of timestamps entity is active' },
                    { name: 'crossingCheck', type: 'boolean', required: true, desc: 'True if line crosses blocks without being member' },
                    { name: 'lines', type: 'string[]', required: true, desc: 'SVG path d-attributes for each segment' },
                    { name: 'marks', type: 'MarkResult[]', required: true, desc: 'Entry/exit triangle markers' },
                    { name: 'label', type: 'LabelResult', required: true, desc: 'Entity name label position' },
                    { name: 'inlineLabels', type: 'InlineLabelResult[]', required: true, desc: 'Labels placed on straight segments' },
                  ]}
                />

                <InterfaceTable
                  name="BlockResult"
                  description="Session block (pill shape) data"
                  fields={[
                    { name: 'id', type: 'number', required: true, desc: 'Block index' },
                    { name: 'time', type: 'string', required: true, desc: 'Timestamp label' },
                    { name: 'moveX', type: 'number', required: true, desc: 'Expansion width in pixels' },
                    { name: 'topPosY', type: 'number', required: true, desc: 'Top Y position of block' },
                    { name: 'names', type: 'string[]', required: true, desc: 'Entity names in this block' },
                    { name: 'points', type: 'PointResult[]', required: true, desc: 'Node positions' },
                    { name: 'relations', type: '[number, number][]', required: true, desc: 'Entity ID pairs for relation arcs' },
                    { name: 'outline', type: 'object', required: true, desc: 'SVG paths for left, right, top, bottom arcs' },
                  ]}
                />

                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Core Classes</div>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 font-mono text-purple-600 w-32">Path</td>
                        <td className="py-2 text-gray-600">D3-style SVG path generator with moveTo, lineTo, bezierCurveTo, arc methods</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 font-mono text-purple-600">Node</td>
                        <td className="py-2 text-gray-600">Entity at a specific timestamp within a session (name, id, sessionID, order)</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 font-mono text-purple-600">Entity</td>
                        <td className="py-2 text-gray-600">Actor across all timestamps with timeline of session IDs</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-purple-600">Session</td>
                        <td className="py-2 text-gray-600">Snapshot at one timestamp with entities, hops, links, constraints</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SubSection>

              <SubSection id="data-models-frontend" title="5.2 Frontend Types">
                <p className="text-gray-700 mb-4">
                  Frontend types in <FileRef path="app/frontend3/components/types.ts" /> mirror backend types with
                  additional D3-specific extensions.
                </p>

                <InterfaceTable
                  name="SpreadLineData"
                  description="Main data structure received from API (matches SpreadLineResult)"
                  fields={[
                    { name: 'bandWidth', type: 'number', required: true, desc: 'Time band width' },
                    { name: 'blockWidth', type: 'number', required: true, desc: 'Block outline width' },
                    { name: 'blocks', type: 'Block[]', required: true, desc: 'Session blocks' },
                    { name: 'storylines', type: 'Storyline[]', required: true, desc: 'Entity paths' },
                    { name: 'timeLabels', type: 'TimeLabel[]', required: true, desc: 'Time axis labels' },
                    { name: 'heightExtents', type: '[number, number]', required: true, desc: 'Y coordinate range' },
                    { name: 'ego', type: 'string', required: true, desc: 'Central entity name' },
                    { name: 'reference', type: 'array', required: false, desc: 'Reference labels data' },
                  ]}
                />

                <InterfaceTable
                  name="SpreadLineConfig"
                  description="Configuration for visualization behavior and appearance"
                  fields={[
                    { name: 'legend.line', type: 'object', required: true, desc: 'Line color legend (domain, range, offset)' },
                    { name: 'legend.node', type: 'object', required: true, desc: 'Node color scale (threshold scale, title)' },
                    { name: 'background', type: 'object', required: true, desc: 'Direction labels, time format, annotations' },
                    { name: 'content.customize', type: 'function', required: true, desc: 'Custom content renderer for expanded blocks' },
                    { name: 'content.collisionDetection', type: 'boolean', required: true, desc: 'Enable D3 force collision' },
                    { name: 'content.showLinks', type: 'boolean', required: true, desc: 'Show relation arcs in expanded blocks' },
                    { name: 'tooltip', type: 'object', required: true, desc: 'Tooltip configuration' },
                  ]}
                />

                <InterfaceTable
                  name="ForceNode"
                  description="D3 force simulation node for collision detection"
                  fields={[
                    { name: 'name', type: 'string', required: true, desc: 'Entity name' },
                    { name: 'id', type: 'number', required: true, desc: 'Entity index' },
                    { name: 'x', type: 'number', required: true, desc: 'Current X position (simulation)' },
                    { name: 'y', type: 'number', required: true, desc: 'Current Y position (simulation)' },
                    { name: 'posX', type: 'number', required: true, desc: 'Original X position' },
                    { name: 'posY', type: 'number', required: true, desc: 'Original Y position' },
                    { name: 'width', type: 'number', required: true, desc: 'Collision radius' },
                    { name: 'height', type: 'number', required: true, desc: 'Collision radius' },
                    { name: 'fx', type: 'number | null', required: false, desc: 'Fixed X position' },
                    { name: 'fy', type: 'number | null', required: false, desc: 'Fixed Y position' },
                  ]}
                />
              </SubSection>

              <SubSection id="data-models-csv" title="5.3 CSV Schema">
                <p className="text-gray-700 mb-4">
                  Current data source uses CSV files located in <FileRef path="SpreadLine-main/case-studies/vis-author" />.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <div className="font-mono text-cyan-700 text-sm mb-2">relations.csv</div>
                    <p className="text-cyan-600 text-xs mb-2">Network topology - collaboration edges</p>
                    <code className="text-xs text-cyan-800">year, source, target, id, type, citationcount</code>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="font-mono text-green-700 text-sm mb-2">entities.csv</div>
                    <p className="text-green-600 text-xs mb-2">Entity metadata - affiliations by year</p>
                    <code className="text-xs text-green-800">name, year, citationcount, affiliation</code>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="font-mono text-purple-700 text-sm mb-2">citations.csv</div>
                    <p className="text-purple-600 text-xs mb-2">Paper citation counts per author</p>
                    <code className="text-xs text-purple-800">name, year, citationcount, affiliation, paperID</code>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="font-mono text-orange-700 text-sm mb-2">content.csv</div>
                    <p className="text-orange-600 text-xs mb-2">Layout positions for expanded blocks</p>
                    <code className="text-xs text-orange-800">year, name, posX, posY</code>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="font-semibold text-red-700 text-sm mb-1">Important Clarification</div>
                  <p className="text-red-600 text-sm">
                    In all CSV files, the <code>name</code> column refers to <strong>author names</strong>, not paper titles.
                    Paper titles are not stored in the vis-author dataset. Reference labels come from
                    <code>content_reference.csv</code> which contains topics/keywords.
                  </p>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 6: CORE FLOWS */}
            {/* ============================================ */}
            <Section id="core-flows" title="6. Core Flows">

              <SubSection id="flow-pipeline" title="6.1 Processing Pipeline">
                <MermaidDiagram
                  title="5-Phase Optimization Pipeline"
                  chart={`
flowchart LR
    subgraph Load["1. Load"]
        L1["Parse CSV"]
        L2["Build topology"]
    end

    subgraph Center["2. Center"]
        C1["2-hop BFS from ego"]
        C2["Filter entities"]
        C3["Construct sessions"]
    end

    subgraph Order["3. Order"]
        O1["Barycenter heuristic"]
        O2["10 forward/backward sweeps"]
        O3["Minimize crossings"]
    end

    subgraph Align["4. Align"]
        A1["LCS dynamic programming"]
        A2["Maximize straight lines"]
    end

    subgraph Compact["5. Compact"]
        CP1["Assign heights"]
        CP2["Minimize space/wiggles"]
        CP3["5 idle strategies"]
    end

    subgraph Render["6. Render"]
        R1["Compute X positions"]
        R2["Generate SVG paths"]
        R3["Build blocks"]
    end

    Load --> Center --> Order --> Align --> Compact --> Render
                  `}
                />

                <div className="space-y-4 mt-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">Phase 1-2: Load &amp; Center</div>
                    <p className="text-gray-600 text-sm">
                      Load CSV data and extract 2-hop egocentric neighborhood. BFS from ego finds all entities within
                      2 hops at each timestamp. Sessions are constructed by grouping interactions by time.
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      Files: <FileRef path="app/api/nodeFetchSpreadLine4/route.ts" line={81} />,
                      <FileRef path="app/api/nodeFetchSpreadLine4/constructors.ts" />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">Phase 3: Ordering (Barycenter)</div>
                    <p className="text-gray-600 text-sm">
                      Minimizes edge crossings by iteratively repositioning entities at the average position of their
                      neighbors. Performs 10 forward/backward sweeps. Time complexity: O(iterations &times; timestamps &times; edges).
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      File: <FileRef path="app/api/nodeFetchSpreadLine4/order.ts" />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">Phase 4: Aligning (LCS)</div>
                    <p className="text-gray-600 text-sm">
                      Maximizes straight horizontal lines using dynamic programming on longest common subsequences.
                      Reward function considers alignment matches and relative order preservation.
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      File: <FileRef path="app/api/nodeFetchSpreadLine4/align.ts" />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">Phase 5: Compacting</div>
                    <p className="text-gray-600 text-sm">
                      Assigns vertical positions (heights) to entities. Supports two modes: &apos;space&apos; minimizes vertical
                      extent, &apos;wiggles&apos; minimizes line direction changes. Uses 5 strategies for idle entity positioning:
                      simple insert, simple push, whole block push, partial block push, last resort insertion.
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      File: <FileRef path="app/api/nodeFetchSpreadLine4/compact.ts" /> (947 lines)
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">Phase 6: Rendering</div>
                    <p className="text-gray-600 text-sm">
                      Converts optimized layout to SVG-ready JSON. Computes horizontal X positions using d3.scaleBand()
                      emulation. Generates bezier curves for non-straight segments, arc paths for block outlines.
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      File: <FileRef path="app/api/nodeFetchSpreadLine4/render.ts" />
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection id="flow-rendering" title="6.2 Rendering Flow">
                <MermaidDiagram
                  title="Frontend Rendering Sequence"
                  chart={`
sequenceDiagram
    participant React as SpreadLineChart
    participant Vis as SpreadLinesVisualizer
    participant D3 as D3.js

    React->>Vis: new SpreadLinesVisualizer(data, config)
    React->>Vis: visualize(svgElement)

    Vis->>D3: Create SVG structure
    Vis->>Vis: _drawBackground() - direction labels, time labels, rules
    Vis->>Vis: _activateBrush() - time range selection
    Vis->>Vis: _drawLineLegend() - color swatches
    Vis->>Vis: _drawNodeLegend() - citation scale
    Vis->>Vis: _drawStorylines() - paths, markers
    Vis->>Vis: _drawBlocksAndPoints() - arcs, circles
    Vis->>Vis: _drawLabels() - entity names

    Vis->>D3: Inject CSS styles
    Vis->>D3: Create arrow marker def

    Note over React,D3: Initial render complete

    React->>Vis: applyFilter(yearsFilter, crossingOnly)
    Vis->>D3: Update visibility of paths, points, labels
                  `}
                />
              </SubSection>

              <SubSection id="flow-interaction" title="6.3 User Interactions">
                <MermaidDiagram
                  title="Block Expand/Collapse Interaction"
                  chart={`
stateDiagram-v2
    [*] --> Collapsed
    Collapsed --> Expanding: Click block
    Expanding --> Expanded: Animation complete (500ms)
    Expanded --> Collapsing: Click block
    Collapsing --> Collapsed: Animation complete (500ms)

    state Expanding {
        [*] --> ShiftRight
        ShiftRight --> CreateDummyLines
        CreateDummyLines --> ExpandBackground
        ExpandBackground --> ForceSimulation
        ForceSimulation --> DrawRelationArcs
        DrawRelationArcs --> [*]
    }

    state Collapsing {
        [*] --> RemoveArcs
        RemoveArcs --> RevertNodes
        RevertNodes --> CollapseBackground
        CollapseBackground --> RemoveDummyLines
        RemoveDummyLines --> ShiftLeft
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
                        <td className="px-3 py-2">Click</td>
                        <td className="px-3 py-2">Block/Time label</td>
                        <td className="px-3 py-2 text-gray-600">Expand/collapse block</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">_blockUpdate()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Hover</td>
                        <td className="px-3 py-2">Storyline/Point</td>
                        <td className="px-3 py-2 text-gray-600">Highlight line, dim others</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">_lineHover()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Click</td>
                        <td className="px-3 py-2">Storyline</td>
                        <td className="px-3 py-2 text-gray-600">Pin/unpin storyline</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">_linePin()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Drag</td>
                        <td className="px-3 py-2">Time axis</td>
                        <td className="px-3 py-2 text-gray-600">Brush time range selection</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">_activateBrush()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Double-click</td>
                        <td className="px-3 py-2">Brush</td>
                        <td className="px-3 py-2 text-gray-600">Clear brush selection</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">dblclicked()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Slider</td>
                        <td className="px-3 py-2">Years filter</td>
                        <td className="px-3 py-2 text-gray-600">Hide short-lived entities</td>
                        <td className="px-3 py-2 font-mono text-xs text-blue-600">applyFilter()</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Checkbox</td>
                        <td className="px-3 py-2">Crossing only</td>
                        <td className="px-3 py-2 text-gray-600">Show only crossing lines</td>
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
                        <td className="px-3 py-2 text-gray-600">Return 500 with descriptive error message</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-red-600">Ego not found</td>
                        <td className="px-3 py-2 text-gray-600">Ego entity not in relations</td>
                        <td className="px-3 py-2 text-gray-600">Return empty result or 404</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-red-600">Invalid time format</td>
                        <td className="px-3 py-2 text-gray-600">Malformed date strings</td>
                        <td className="px-3 py-2 text-gray-600">Default to current year range</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-red-600">Empty network</td>
                        <td className="px-3 py-2 text-gray-600">No entities within 2 hops</td>
                        <td className="px-3 py-2 text-gray-600">Return minimal result with ego only</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Frontend Edge Cases</div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Case</th>
                        <th className="px-3 py-2 text-left">Handling</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-3 py-2">Empty blocks array</td>
                        <td className="px-3 py-2 text-gray-600">Skip block rendering, show storylines only</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Missing label positions</td>
                        <td className="px-3 py-2 text-gray-600">Use default positioning based on line start</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Invalid SVG path</td>
                        <td className="px-3 py-2 text-gray-600">Skip segment, log warning</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Filter hides all entities</td>
                        <td className="px-3 py-2 text-gray-600">Keep ego visible always</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Rapid expand/collapse clicks</td>
                        <td className="px-3 py-2 text-gray-600">Animations use D3 transitions that interrupt gracefully</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold text-yellow-800 mb-2">Known Limitations</div>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>Large networks (&gt;500 entities) may cause performance degradation</li>
                    <li>Very long timelines may require horizontal scrolling</li>
                    <li>Overlapping labels are not automatically resolved</li>
                    <li>Force simulation in expanded blocks is synchronous (may block UI briefly)</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 8: NON-FUNCTIONAL REQUIREMENTS */}
            {/* ============================================ */}
            <Section id="nfr" title="8. Non-Functional Requirements">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Performance</div>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li><strong>API Response:</strong> &lt;2s for typical networks (100 entities, 20 timestamps)</li>
                    <li><strong>Initial Render:</strong> &lt;500ms after data load</li>
                    <li><strong>Animation Duration:</strong> 500ms for all transitions</li>
                    <li><strong>Filter Updates:</strong> &lt;100ms (DOM manipulation only)</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Scalability</div>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li><strong>Max Entities:</strong> ~500 (tested)</li>
                    <li><strong>Max Timestamps:</strong> ~50 (practical limit)</li>
                    <li><strong>Max Blocks:</strong> One per timestamp</li>
                    <li><strong>Force Simulation:</strong> 100 iterations, O(n) per iteration</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Browser Support</div>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li><strong>Required:</strong> ES2020+, SVG support</li>
                    <li><strong>Tested:</strong> Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</li>
                    <li><strong>D3.js Version:</strong> v7</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Accessibility</div>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li><strong>Color:</strong> Distinguishable colors for line categories</li>
                    <li><strong>Keyboard:</strong> Not currently supported for interactions</li>
                    <li><strong>Screen Reader:</strong> SVG lacks ARIA labels (improvement needed)</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 9: DEPENDENCIES */}
            {/* ============================================ */}
            <Section id="dependencies" title="9. Dependencies">
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Frontend Dependencies</div>
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
                        <td className="px-3 py-2 text-gray-600">SVG visualization, animations, force simulation</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-blue-600">@tanstack/react-query</td>
                        <td className="px-3 py-2">5.x</td>
                        <td className="px-3 py-2 text-gray-600">Data fetching and caching</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-blue-600">next</td>
                        <td className="px-3 py-2">14.x</td>
                        <td className="px-3 py-2 text-gray-600">React framework</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Backend Dependencies</div>
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
                        <td className="px-3 py-2 font-mono text-blue-600">next</td>
                        <td className="px-3 py-2">14.x</td>
                        <td className="px-3 py-2 text-gray-600">API routes (App Router)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-blue-600">papaparse</td>
                        <td className="px-3 py-2">5.x</td>
                        <td className="px-3 py-2 text-gray-600">CSV parsing</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-blue-600">fs/promises</td>
                        <td className="px-3 py-2">Node built-in</td>
                        <td className="px-3 py-2 text-gray-600">File system access</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Development Dependencies</div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Package</th>
                        <th className="px-3 py-2 text-left">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-3 py-2 font-mono text-blue-600">typescript</td>
                        <td className="px-3 py-2 text-gray-600">Type checking</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-blue-600">@types/d3</td>
                        <td className="px-3 py-2 text-gray-600">D3 type definitions</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-blue-600">tailwindcss</td>
                        <td className="px-3 py-2 text-gray-600">CSS styling</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 10: ASSUMPTIONS & OPEN QUESTIONS */}
            {/* ============================================ */}
            <Section id="assumptions" title="10. Assumptions & Open Questions">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold text-green-800 mb-2">Assumptions</div>
                  <ul className="text-green-700 text-sm space-y-2">
                    <li>
                      <strong>Data Format:</strong> External API will provide data in the format specified in Section 4.2.
                      We control this contract.
                    </li>
                    <li>
                      <strong>Ego Existence:</strong> The ego entity always exists in the network and has at least one
                      relation.
                    </li>
                    <li>
                      <strong>Timestamp Granularity:</strong> Timestamps are discrete (yearly in the vis-author case).
                      Sub-year granularity would require format changes.
                    </li>
                    <li>
                      <strong>Browser Environment:</strong> Frontend runs in modern browsers with JavaScript enabled.
                      SSR is not used for the visualization component.
                    </li>
                    <li>
                      <strong>Single Ego:</strong> Each visualization shows one ego&apos;s perspective. Multi-ego views
                      would require significant refactoring.
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="font-semibold text-amber-800 mb-2">Open Questions</div>
                  <ol className="text-amber-700 text-sm space-y-2 list-decimal list-inside">
                    <li>
                      <strong>External API Authentication:</strong> What authentication mechanism will the external API use?
                      (API key, OAuth, etc.)
                    </li>
                    <li>
                      <strong>Real-time Updates:</strong> Should the visualization support real-time data updates, or is
                      refresh-on-demand sufficient?
                    </li>
                    <li>
                      <strong>Caching Strategy:</strong> How long should external API responses be cached? Should we
                      implement stale-while-revalidate?
                    </li>
                    <li>
                      <strong>Error Recovery:</strong> If the external API is unavailable, should we fall back to cached
                      data or show an error state?
                    </li>
                    <li>
                      <strong>Performance Monitoring:</strong> What metrics should we track for the pipeline performance?
                      (processing time, render time, etc.)
                    </li>
                    <li>
                      <strong>Accessibility Requirements:</strong> What level of keyboard navigation and screen reader
                      support is required?
                    </li>
                    <li>
                      <strong>Mobile Support:</strong> Is touch interaction required? The current implementation assumes
                      mouse/pointer input.
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-semibold text-blue-800 mb-2">Future Enhancements</div>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>Lazy loading for large networks</li>
                    <li>WebWorker-based pipeline processing</li>
                    <li>Export to PNG/SVG functionality</li>
                    <li>Configurable ego selection</li>
                    <li>Multiple color schemes/themes</li>
                    <li>Annotation persistence</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>Technical Design Document - SpreadLine Feature v1.0</p>
              <p className="mt-1">Last updated: {new Date().toISOString().split('T')[0]}</p>
              <div className="mt-4 flex justify-center gap-4">
                <Link href="/frontend3/demo" className="text-blue-600 hover:underline">View Demo</Link>
                <Link href="/frontend2" className="text-blue-600 hover:underline">Design v2</Link>
                <a href="https://arxiv.org/pdf/2408.08992" className="text-blue-600 hover:underline">Paper</a>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

/**
 * Technical Design Document v3 - SpreadLine
 *
 * The Ultimate TDD with:
 * - Real screenshots from the application
 * - Layman's term explanations
 * - Annotated visualizations showing what each algorithm does
 * - Complete CSV schemas with examples
 * - All content from v1 and v2
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ============================================
// TABLE OF CONTENTS
// ============================================

const tableOfContents = [
  { id: 'overview', label: '1. Overview', level: 1 },
  { id: 'visual-guide', label: '2. Visual Guide', level: 1 },
  { id: 'visual-anatomy', label: '2.1 Anatomy of SpreadLine', level: 2 },
  { id: 'visual-interactions', label: '2.2 Interactions', level: 2 },
  { id: 'architecture', label: '3. Architecture', level: 1 },
  { id: 'architecture-high-level', label: '3.1 High-Level Architecture', level: 2 },
  { id: 'architecture-data-flow', label: '3.2 Data Flow', level: 2 },
  { id: 'components', label: '4. Components', level: 1 },
  { id: 'components-frontend', label: '4.1 Frontend', level: 2 },
  { id: 'components-backend', label: '4.2 Backend (Plain English)', level: 2 },
  { id: 'components-external', label: '4.3 External Services', level: 2 },
  { id: 'pipeline', label: '5. The Magic: How It Works', level: 1 },
  { id: 'pipeline-overview', label: '5.1 Pipeline Overview', level: 2 },
  { id: 'pipeline-ordering', label: '5.2 Step 1: Ordering', level: 2 },
  { id: 'pipeline-aligning', label: '5.3 Step 2: Aligning', level: 2 },
  { id: 'pipeline-compacting', label: '5.4 Step 3: Compacting', level: 2 },
  { id: 'pipeline-rendering', label: '5.5 Step 4: Rendering', level: 2 },
  { id: 'api-design', label: '6. API Design', level: 1 },
  { id: 'api-current', label: '6.1 Current API', level: 2 },
  { id: 'api-external', label: '6.2 External API Contract', level: 2 },
  { id: 'data-models', label: '7. Data Models', level: 1 },
  { id: 'data-models-types', label: '7.1 TypeScript Interfaces', level: 2 },
  { id: 'data-models-csv', label: '7.2 CSV Schemas', level: 2 },
  { id: 'interactions', label: '8. User Interactions', level: 1 },
  { id: 'error-handling', label: '9. Error Handling', level: 1 },
  { id: 'nfr', label: '10. Non-Functional Requirements', level: 1 },
  { id: 'dependencies', label: '11. Dependencies', level: 1 },
  { id: 'assumptions', label: '12. Assumptions & Open Questions', level: 1 },
];

// ============================================
// TOOLTIP COMPONENT
// ============================================

function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="border-b border-dotted border-gray-400 cursor-help">{children}</span>
      {visible && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap">
          {content}
        </span>
      )}
    </span>
  );
}

// ============================================
// ANNOTATED IMAGE COMPONENT
// ============================================

function AnnotatedImage({
  src,
  alt,
  annotations,
  caption,
}: {
  src: string;
  alt: string;
  annotations?: { x: string; y: string; label: string; color?: string }[];
  caption?: string;
}) {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-6">
      <div className="relative">
        <img src={src} alt={alt} className="w-full h-auto" />
        {annotations?.map((ann, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: ann.x, top: ann.y }}
            onMouseEnter={() => setHoveredAnnotation(ann.label)}
            onMouseLeave={() => setHoveredAnnotation(null)}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-transform hover:scale-125 ${
                ann.color || 'bg-blue-500'
              }`}
            >
              {i + 1}
            </div>
            {hoveredAnnotation === ann.label && (
              <div className="absolute left-8 top-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10">
                {ann.label}
              </div>
            )}
          </div>
        ))}
      </div>
      {caption && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          {caption}
        </div>
      )}
    </div>
  );
}

// ============================================
// STEP-BY-STEP EXPLAINER COMPONENT
// ============================================

function StepExplainer({
  steps,
  title,
}: {
  steps: { title: string; plain: string; technical?: string; visual?: React.ReactNode }[];
  title: string;
}) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
        <div className="font-semibold text-white">{title}</div>
      </div>

      {/* Step tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
              activeStep === i
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Step {i + 1}
          </button>
        ))}
      </div>

      {/* Active step content */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">{steps[activeStep].title}</h4>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
            Plain English
          </div>
          <p className="text-green-800">{steps[activeStep].plain}</p>
        </div>

        {steps[activeStep].technical && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Technical Details
            </div>
            <p className="text-gray-700 text-sm">{steps[activeStep].technical}</p>
          </div>
        )}

        {steps[activeStep].visual && (
          <div className="mt-4">{steps[activeStep].visual}</div>
        )}
      </div>
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
// CSV TABLE WITH EXAMPLES
// ============================================

function CSVTable({
  name,
  description,
  purpose,
  columns,
  examples,
}: {
  name: string;
  description: string;
  purpose: string;
  columns: { name: string; type: string; desc: string }[];
  examples: string[][];
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden my-4">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 border-b border-gray-200">
        <div className="font-mono text-blue-700 font-semibold text-lg">{name}</div>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
        <div className="mt-2 bg-white/50 rounded px-2 py-1 inline-block">
          <span className="text-xs font-semibold text-blue-600">PURPOSE:</span>
          <span className="text-xs text-gray-700 ml-1">{purpose}</span>
        </div>
      </div>

      {/* Column definitions */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Column Definitions
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {columns.map((col) => (
            <div key={col.name} className="bg-gray-50 rounded p-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-purple-600 font-semibold">{col.name}</span>
                <span className="text-xs text-gray-400">({col.type})</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{col.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Example rows */}
      <div className="p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Example Data
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((col) => (
                  <th key={col.name} className="px-3 py-2 text-left text-gray-600 font-medium whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {examples.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {cell.length > 40 ? cell.substring(0, 37) + '...' : cell}
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
// INTERFACE TABLE
// ============================================

function InterfaceTable({
  name,
  fields,
  description,
}: {
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
      <div className="overflow-x-auto">
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
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      field.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {field.required ? 'required' : 'optional'}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600">{field.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// SECTION COMPONENTS
// ============================================

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">{title}</h2>
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

function FileRef({ path }: { path: string }) {
  return (
    <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm font-mono">
      {path}
    </code>
  );
}

// ============================================
// MERMAID DIAGRAM COMPONENT
// ============================================

function MermaidDiagram({ chart, title, height = 'auto' }: { chart: string; title?: string; height?: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 my-4 overflow-auto" style={{ minHeight: height }}>
      {title && <div className="text-sm font-semibold text-gray-700 mb-4">{title}</div>}
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />
      ) : (
        <div className="text-gray-400 text-center py-12">Loading diagram...</div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function TechnicalDesignDocumentV3() {
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
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map((item) => document.getElementById(item.id));
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
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">
                Technical Design Document <span className="text-yellow-300">v3</span>
              </h1>
              <p className="text-blue-100 text-sm">SpreadLine - The Ultimate Guide</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/frontend3/demo"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium backdrop-blur"
              >
                Live Demo
              </Link>
              <Link
                href="/spreadline-design2"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium"
              >
                v2
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0">
          <nav className="sticky top-24 bg-white rounded-lg border border-gray-200 shadow-sm p-4 max-h-[calc(100vh-8rem)] overflow-auto">
            <div className="text-sm font-semibold text-gray-900 mb-3">Table of Contents</div>
            <ul className="space-y-0.5">
              {tableOfContents.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block py-1.5 text-sm transition-colors rounded px-2 ${
                      item.level === 2 ? 'pl-5' : ''
                    } ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

            {/* ============================================ */}
            {/* SECTION 1: OVERVIEW */}
            {/* ============================================ */}
            <Section id="overview" title="1. Overview">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What is SpreadLine?</h3>
                <p className="text-gray-700 mb-4">
                  SpreadLine is a visualization tool that shows <strong>how one person connects with others over time</strong>.
                  Think of it like a subway map where:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">&#9679;</span>
                    <span>Each <strong>horizontal line</strong> is a person (like a subway line)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">&#9679;</span>
                    <span>Each <strong>vertical column</strong> is a year (like subway stations)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">&#9679;</span>
                    <span>The <strong>pill-shaped blocks</strong> show when people worked together (like transfer stations)</span>
                  </li>
                </ul>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-3xl mb-2">&#128101;</div>
                  <div className="font-semibold text-gray-900">Ego-Centric</div>
                  <p className="text-sm text-gray-600">Shows the world from one person&apos;s perspective (the &quot;ego&quot;)</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-3xl mb-2">&#128337;</div>
                  <div className="font-semibold text-gray-900">Temporal</div>
                  <p className="text-sm text-gray-600">Shows how relationships change over time (years)</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-3xl mb-2">&#128200;</div>
                  <div className="font-semibold text-gray-900">Interactive</div>
                  <p className="text-sm text-gray-600">Click blocks to expand and see detailed connections</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="font-semibold text-yellow-800 mb-2">Based on Research</div>
                <p className="text-yellow-700 text-sm">
                  SpreadLine is based on the IEEE TVCG 2024 paper &quot;SpreadLine: Visualizing Egocentric Dynamic Influence&quot;.
                  <a href="https://arxiv.org/pdf/2408.08992" className="underline ml-1">Read the paper</a>
                </p>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 2: VISUAL GUIDE */}
            {/* ============================================ */}
            <Section id="visual-guide" title="2. Visual Guide">

              <SubSection id="visual-anatomy" title="2.1 Anatomy of SpreadLine">
                <p className="text-gray-700 mb-4">
                  Here&apos;s a real screenshot from the application. Hover over the numbers to learn what each part does:
                </p>

                <AnnotatedImage
                  src="/tdd/pill3.png"
                  alt="SpreadLine visualization anatomy"
                  annotations={[
                    { x: '5%', y: '30%', label: 'Entity Labels - Names of people on the left', color: 'bg-red-500' },
                    { x: '15%', y: '8%', label: 'Time Labels - Years across the top (2002, 2003, etc.)', color: 'bg-blue-500' },
                    { x: '30%', y: '45%', label: 'Ego Line - The central person (thick dark line)', color: 'bg-gray-700' },
                    { x: '25%', y: '25%', label: 'Alter Lines - Other people (colored thin lines)', color: 'bg-orange-500' },
                    { x: '45%', y: '40%', label: 'Session Block (Pill) - People who worked together at this time', color: 'bg-purple-500' },
                    { x: '60%', y: '15%', label: 'Direction Labels - External (above ego) vs Internal (below)', color: 'bg-green-500' },
                  ]}
                  caption="The SpreadLine visualization showing Jeffrey Heer's collaboration network from 2002-2013"
                />

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-3">Line Colors Meaning</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-1 bg-gray-700 rounded"></div>
                        <span className="text-sm text-gray-700"><strong>Dark Gray</strong> = Ego (central person)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-0.5 bg-orange-500 rounded"></div>
                        <span className="text-sm text-gray-700"><strong>Orange</strong> = Colleague (same affiliation)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-0.5 bg-teal-600 rounded"></div>
                        <span className="text-sm text-gray-700"><strong>Teal</strong> = Collaborator (different affiliation)</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-3">Node Colors (Citations)</div>
                    <div className="space-y-2">
                      {[
                        { color: '#ffffff', border: true, label: '<10 citations' },
                        { color: '#fcdaca', label: '10-50 citations' },
                        { color: '#e599a6', label: '50-100 citations' },
                        { color: '#c94b77', label: '100-500 citations' },
                        { color: '#740980', label: '500+ citations' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: item.color,
                              border: item.border ? '1px solid #ccc' : 'none',
                            }}
                          ></div>
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection id="visual-interactions" title="2.2 Interactions">
                <p className="text-gray-700 mb-4">
                  Here&apos;s what happens when you click a block to expand it:
                </p>

                <AnnotatedImage
                  src="/tdd/screen2.png"
                  alt="Expanded block showing internal structure"
                  annotations={[
                    { x: '12%', y: '35%', label: 'Expanded Block - White area shows internal structure', color: 'bg-purple-500' },
                    { x: '8%', y: '42%', label: 'Nodes - Each circle is a person in this session', color: 'bg-blue-500' },
                    { x: '15%', y: '48%', label: 'Relation Arcs - Lines show who collaborated on what', color: 'bg-green-500' },
                    { x: '25%', y: '40%', label: 'Force Layout - Nodes positioned to avoid overlap', color: 'bg-orange-500' },
                  ]}
                  caption="An expanded block showing the internal structure with nodes and relation arcs (dark theme)"
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="font-semibold text-blue-800 mb-2">Interaction Summary</div>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li><strong>Click block/year</strong> &#8594; Expand or collapse the block</li>
                    <li><strong>Hover line</strong> &#8594; Highlight that person, dim others</li>
                    <li><strong>Click line</strong> &#8594; Pin that person (stays highlighted)</li>
                    <li><strong>Drag on timeline</strong> &#8594; Select a time range (brush)</li>
                    <li><strong>Use slider</strong> &#8594; Filter out people with short careers</li>
                  </ul>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 3: ARCHITECTURE */}
            {/* ============================================ */}
            <Section id="architecture" title="3. Architecture">

              <SubSection id="architecture-high-level" title="3.1 High-Level Architecture">
                <MermaidDiagram
                  title="System Overview"
                  height="400px"
                  chart={`
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '14px' }}}%%
flowchart TB
    subgraph Browser["Your Browser"]
        direction TB
        UI["React App<br/>(SpreadLineChart)"]
        D3["D3.js<br/>(Draws the visualization)"]
    end

    subgraph Server["Next.js Server"]
        direction TB
        API["API Endpoint<br/>(/api/nodeFetchSpreadLine4)"]
        MAGIC["The Magic Box<br/>(Processing Pipeline)"]
    end

    subgraph Data["Data Sources"]
        CSV["CSV Files<br/>(Current)"]
        EXT["External API<br/>(Future)"]
    end

    UI --> D3
    UI -->|"Fetches data"| API
    API --> MAGIC
    MAGIC -->|"Reads"| CSV
    MAGIC -.->|"Will read"| EXT

    style Browser fill:#e0f2fe,stroke:#0284c7
    style Server fill:#dcfce7,stroke:#16a34a
    style Data fill:#fef3c7,stroke:#d97706
                  `}
                />
              </SubSection>

              <SubSection id="architecture-data-flow" title="3.2 Data Flow">
                <MermaidDiagram
                  title="What Happens When You Load the Page"
                  height="450px"
                  chart={`
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '12px' }}}%%
sequenceDiagram
    autonumber
    participant You as You (Browser)
    participant React as React App
    participant API as Server API
    participant Magic as Processing Pipeline
    participant CSV as CSV Files

    You->>React: Visit /frontend3/demo
    React->>API: "Give me the visualization data"
    API->>CSV: Read relations.csv, entities.csv, citations.csv
    CSV-->>API: Raw data (who worked with whom, when)

    rect rgb(254, 243, 199)
        Note over API,Magic: The Magic Happens Here
        API->>Magic: Process this data
        Magic->>Magic: 1. Order lines to reduce crossings
        Magic->>Magic: 2. Align to create straight lines
        Magic->>Magic: 3. Compact to save space
        Magic->>Magic: 4. Render to SVG coordinates
    end

    Magic-->>API: Visualization-ready JSON
    API-->>React: Here's your data
    React->>React: Draw with D3.js
    React-->>You: Interactive visualization appears!
                  `}
                />
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 4: COMPONENTS */}
            {/* ============================================ */}
            <Section id="components" title="4. Components">

              <SubSection id="components-frontend" title="4.1 Frontend">
                <div className="space-y-4">
                  {[
                    {
                      name: 'SpreadLineChart.tsx',
                      purpose: 'The main React component that holds everything together',
                      plain: 'Like a picture frame - it holds the canvas where the visualization is drawn',
                    },
                    {
                      name: 'SpreadLinesVisualizer.ts',
                      purpose: 'The D3.js code that actually draws the visualization',
                      plain: 'Like the artist - it paints all the lines, blocks, and labels on the canvas',
                    },
                    {
                      name: 'Expander.ts',
                      purpose: 'Handles the animation when you click to expand a block',
                      plain: 'Like opening a book - it smoothly reveals the hidden details inside a block',
                    },
                    {
                      name: 'Collapser.ts',
                      purpose: 'Handles the animation when you click to collapse a block',
                      plain: 'Like closing a book - it smoothly hides the details and returns to the compact view',
                    },
                  ].map((item) => (
                    <div key={item.name} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="font-mono text-blue-600 font-semibold">{item.name}</div>
                      <p className="text-gray-600 text-sm mt-1">{item.purpose}</p>
                      <div className="mt-2 bg-green-50 rounded px-3 py-2">
                        <span className="text-xs font-semibold text-green-600">ANALOGY:</span>
                        <span className="text-sm text-green-700 ml-1">{item.plain}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SubSection>

              <SubSection id="components-backend" title="4.2 Backend (Plain English)">
                <p className="text-gray-700 mb-4">
                  The backend has several modules that work together. Here&apos;s what each one does in plain English:
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-blue-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                      <div className="font-mono text-blue-700 font-semibold">order.ts - The Traffic Controller</div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">
                        <strong>What it does:</strong> Decides the order of lines from top to bottom at each point in time.
                      </p>
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <div className="text-sm font-semibold text-green-700 mb-1">Plain English:</div>
                        <p className="text-green-700">
                          Imagine you&apos;re organizing people in a photo. This module arranges them so that people who
                          are connected stand near each other, reducing the number of times their &quot;connection lines&quot;
                          have to cross over other people. It does this 10 times back and forth until it finds a good arrangement.
                        </p>
                      </div>
                      <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <img src="/tdd/screen1.png" alt="Ordering visualization" className="w-full opacity-90" />
                        <div className="p-2 text-xs text-gray-600 text-center">
                          The lines are ordered to minimize crossings
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-purple-200 rounded-lg overflow-hidden">
                    <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                      <div className="font-mono text-purple-700 font-semibold">align.ts - The Straightener</div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">
                        <strong>What it does:</strong> Tries to make lines as straight as possible across time.
                      </p>
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <div className="text-sm font-semibold text-green-700 mb-1">Plain English:</div>
                        <p className="text-green-700">
                          Imagine you&apos;re drawing lines on graph paper. If someone is at position #3 in 2002, and
                          also at position #3 in 2003, we can draw a straight line. This module finds the best way to
                          assign positions so we get as many straight lines as possible (instead of wavy ones).
                        </p>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-2 text-center">Before: Wavy lines</div>
                          <svg viewBox="0 0 100 40" className="w-full h-10">
                            <path d="M 10 10 C 30 30, 50 5, 90 25" fill="none" stroke="#ef4444" strokeWidth="2" />
                          </svg>
                        </div>
                        <div className="text-2xl text-gray-400">&#8594;</div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-2 text-center">After: Straight lines</div>
                          <svg viewBox="0 0 100 40" className="w-full h-10">
                            <path d="M 10 20 L 90 20" fill="none" stroke="#22c55e" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-orange-200 rounded-lg overflow-hidden">
                    <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
                      <div className="font-mono text-orange-700 font-semibold">compact.ts - The Space Saver</div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">
                        <strong>What it does:</strong> Assigns the actual Y-positions (vertical positions) to minimize wasted space.
                      </p>
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <div className="text-sm font-semibold text-green-700 mb-1">Plain English:</div>
                        <p className="text-green-700">
                          Think of Tetris. This module packs the lines together efficiently so there aren&apos;t big gaps.
                          It also makes sure lines that don&apos;t wiggle too much (to make it easy to follow with your eyes).
                          It&apos;s the most complex part - 947 lines of code with 5 different strategies!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-teal-200 rounded-lg overflow-hidden">
                    <div className="bg-teal-50 px-4 py-3 border-b border-teal-200">
                      <div className="font-mono text-teal-700 font-semibold">render.ts - The Artist</div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">
                        <strong>What it does:</strong> Converts all the calculations into SVG drawing instructions.
                      </p>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-sm font-semibold text-green-700 mb-1">Plain English:</div>
                        <p className="text-green-700">
                          After all the math is done, this module creates the actual &quot;brush strokes&quot; - the SVG paths
                          that tell the browser how to draw each line, each pill-shaped block, each label. It&apos;s like
                          translating a blueprint into actual construction instructions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection id="components-external" title="4.3 External Services">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="font-semibold text-amber-800 mb-2">Future Integration</div>
                  <p className="text-amber-700 text-sm">
                    Currently, SpreadLine reads from CSV files. In the future, it will fetch data from an external API.
                    See <a href="#api-external" className="underline">Section 6.2</a> for the API contract.
                  </p>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 5: THE MAGIC (PIPELINE) */}
            {/* ============================================ */}
            <Section id="pipeline" title="5. The Magic: How It Works">

              <SubSection id="pipeline-overview" title="5.1 Pipeline Overview">
                <p className="text-gray-700 mb-4">
                  The processing pipeline transforms raw data into a beautiful visualization in 4 main steps:
                </p>

                <StepExplainer
                  title="The 4-Step Transformation"
                  steps={[
                    {
                      title: 'Step 1: Load & Center',
                      plain: 'Read the data files and focus on one person (the "ego"). Find everyone within 2 connections of them.',
                      technical: 'Parse CSV files, perform 2-hop BFS from ego node, construct Session objects for each timestamp.',
                      visual: (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-center text-sm text-gray-600 mb-2">Finding the ego&apos;s network</div>
                          <svg viewBox="0 0 200 100" className="w-full h-24">
                            <circle cx="100" cy="50" r="15" fill="#424242" />
                            <text x="100" y="54" textAnchor="middle" fill="white" fontSize="8">Ego</text>
                            {[[40, 30], [50, 70], [150, 35], [160, 65]].map(([x, y], i) => (
                              <g key={i}>
                                <line x1="100" y1="50" x2={x} y2={y} stroke="#ddd" strokeWidth="1" />
                                <circle cx={x} cy={y} r="8" fill={i < 2 ? '#FA9902' : '#146b6b'} />
                                <text x={x} y={y + 3} textAnchor="middle" fill="white" fontSize="6">
                                  {i < 2 ? '1' : '2'}
                                </text>
                              </g>
                            ))}
                          </svg>
                          <div className="text-center text-xs text-gray-500">Numbers show hop distance from ego</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Step 2: Order (Reduce Crossings)',
                      plain: 'Arrange the lines from top to bottom so connected people are near each other. Less crossing = easier to read.',
                      technical: 'Barycenter heuristic: position each entity at the average position of its neighbors. Repeat 10 forward/backward sweeps.',
                      visual: (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-red-50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-red-600 mb-2">Before: Many crossings</div>
                            <svg viewBox="0 0 100 60" className="w-full h-12">
                              <line x1="10" y1="10" x2="90" y2="50" stroke="#ef4444" strokeWidth="2" />
                              <line x1="10" y1="30" x2="90" y2="10" stroke="#ef4444" strokeWidth="2" />
                              <line x1="10" y1="50" x2="90" y2="30" stroke="#ef4444" strokeWidth="2" />
                            </svg>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-green-600 mb-2">After: Fewer crossings</div>
                            <svg viewBox="0 0 100 60" className="w-full h-12">
                              <line x1="10" y1="10" x2="90" y2="10" stroke="#22c55e" strokeWidth="2" />
                              <line x1="10" y1="30" x2="90" y2="30" stroke="#22c55e" strokeWidth="2" />
                              <line x1="10" y1="50" x2="90" y2="50" stroke="#22c55e" strokeWidth="2" />
                            </svg>
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: 'Step 3: Align & Compact',
                      plain: 'Make lines as straight as possible, and pack everything together to save space.',
                      technical: 'LCS dynamic programming for alignment. 5 strategies for positioning "idle" entities (not in current session).',
                      visual: (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-600 mb-2">Goal: Straight lines + No wasted space</div>
                          <svg viewBox="0 0 200 80" className="w-full h-16">
                            <line x1="20" y1="20" x2="180" y2="20" stroke="#22c55e" strokeWidth="2" />
                            <line x1="20" y1="40" x2="180" y2="40" stroke="#3b82f6" strokeWidth="2" />
                            <line x1="20" y1="60" x2="180" y2="60" stroke="#f97316" strokeWidth="2" />
                            {[40, 80, 120, 160].map((x) => (
                              <line key={x} x1={x} y1="10" x2={x} y2="70" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                            ))}
                          </svg>
                        </div>
                      ),
                    },
                    {
                      title: 'Step 4: Render',
                      plain: 'Convert all the positions into actual drawing instructions (SVG paths) that the browser can display.',
                      technical: 'Generate bezier curves for line segments, arc paths for block outlines, position labels and markers.',
                      visual: (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-2 text-center">Final SVG output</div>
                          <code className="text-xs text-gray-500 block">
                            M 62.908,414 L 164.724,414 C 200,414 220,420 240,430
                          </code>
                        </div>
                      ),
                    },
                  ]}
                />
              </SubSection>

              <SubSection id="pipeline-ordering" title="5.2 Step 1: Ordering (The Traffic Controller)">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-blue-800 mb-2">What Problem Does This Solve?</div>
                  <p className="text-blue-700">
                    When you have many people, their connection lines might cross each other, making the visualization
                    look like spaghetti. Ordering rearranges who goes on top so there are fewer crossings.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-3">How It Works (Barycenter Algorithm)</div>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                      <span>Start with any random order of people</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                      <span>For each person, calculate the &quot;average position&quot; of their connections</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                      <span>Move each person to their average position</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
                      <span>Repeat steps 2-3, going forward and backward through time, 10 times total</span>
                    </li>
                  </ol>
                </div>
              </SubSection>

              <SubSection id="pipeline-aligning" title="5.3 Step 2: Aligning (The Straightener)">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-purple-800 mb-2">What Problem Does This Solve?</div>
                  <p className="text-purple-700">
                    Wavy lines are hard to follow with your eyes. This step tries to keep each person&apos;s line as
                    straight as possible across years.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-3">How It Works (LCS - Longest Common Subsequence)</div>
                  <p className="text-gray-700 mb-3">
                    It&apos;s like finding matching items in two lists. If the same people appear at the same positions
                    in consecutive years, we can draw straight lines between them.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Year 2002:</div>
                        <ol className="list-decimal list-inside text-gray-600">
                          <li>Alice</li>
                          <li>Bob</li>
                          <li>Charlie</li>
                        </ol>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Year 2003:</div>
                        <ol className="list-decimal list-inside text-gray-600">
                          <li>Alice &#10003;</li>
                          <li>Bob &#10003;</li>
                          <li>Charlie &#10003;</li>
                        </ol>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Same order = straight lines!</div>
                  </div>
                </div>
              </SubSection>

              <SubSection id="pipeline-compacting" title="5.4 Step 3: Compacting (The Space Saver)">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-orange-800 mb-2">What Problem Does This Solve?</div>
                  <p className="text-orange-700">
                    After ordering and aligning, there might be big gaps between lines. Compacting pushes everything
                    together while keeping lines from overlapping.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-3">The 5 Strategies for &quot;Idle&quot; Entities</div>
                  <p className="text-gray-600 text-sm mb-3">
                    When someone isn&apos;t in a session but their line needs to pass through, these strategies decide where to put them:
                  </p>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li><strong>1. Simple Insert</strong> - Just slot them in if there&apos;s space</li>
                    <li><strong>2. Simple Push</strong> - Push other lines to make room</li>
                    <li><strong>3. Whole Block Push</strong> - Move an entire session block to make room</li>
                    <li><strong>4. Partial Block Push</strong> - Move part of a session block</li>
                    <li><strong>5. Last Resort</strong> - Find any available position</li>
                  </ol>
                </div>
              </SubSection>

              <SubSection id="pipeline-rendering" title="5.5 Step 4: Rendering (The Artist)">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-teal-800 mb-2">What Does This Do?</div>
                  <p className="text-teal-700">
                    Converts all the math into actual SVG drawing instructions. This is the final step that produces
                    the JSON that the frontend uses to draw the visualization.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-3">What It Creates</div>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Storylines:</strong> SVG paths for each person&apos;s line (bezier curves for bends)</li>
                    <li><strong>Blocks:</strong> Pill-shaped outlines using arc commands</li>
                    <li><strong>Points:</strong> Circle positions for nodes inside expanded blocks</li>
                    <li><strong>Labels:</strong> Text positions for names and time labels</li>
                    <li><strong>Markers:</strong> Triangle positions for entry/exit points</li>
                  </ul>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 6: API DESIGN */}
            {/* ============================================ */}
            <Section id="api-design" title="6. API Design">

              <SubSection id="api-current" title="6.1 Current API">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-gray-900">/api/nodeFetchSpreadLine4</code>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-4">
                      Returns the complete visualization data for Jeffrey Heer&apos;s collaboration network.
                    </p>
                    <CodeBlock
                      language="json"
                      title="Response (abbreviated)"
                      code={`{
  "mode": "author",
  "ego": "Jeffrey Heer",
  "bandWidth": 101.816,
  "blockWidth": 40,
  "heightExtents": [268, 520],
  "timeLabels": [
    { "label": "2002", "posX": 62.908 },
    { "label": "2003", "posX": 164.724 }
  ],
  "storylines": [{
    "name": "Jeffrey Heer",
    "id": 2,
    "color": "#424242",
    "lifespan": 21,
    "lines": ["M62.908,414 L164.724,414", ...],
    "marks": [{ "posX": 55.908, "posY": 414 }],
    "label": { "posX": 50, "posY": 414, "label": "Jeffrey Heer" }
  }],
  "blocks": [{
    "id": 0,
    "time": "2002",
    "moveX": 228,
    "names": ["Jeffrey Heer", "Ed H. Chi", "James A. Landay"],
    "points": [{ "id": 2, "name": "Jeffrey Heer", "posX": 62.908, "posY": 414, "label": "295" }],
    "relations": [[2, 65], [2, 66]],
    "outline": { "left": "M63.22,268...", "right": "M62.59,268..." }
  }]
}`}
                    />
                  </div>
                </div>
              </SubSection>

              <SubSection id="api-external" title="6.2 External API Contract">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-blue-800 mb-2">Future Integration</div>
                  <p className="text-blue-700 text-sm">
                    This is the API contract the external service must implement. We control this contract.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                    <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">GET</span>
                    <code className="text-gray-900">/external/network/{'{ego}'}</code>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Query Parameters</div>
                    <table className="w-full text-sm mb-4">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Param</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-3 py-2 font-mono text-blue-600">mode</td>
                          <td className="px-3 py-2">string</td>
                          <td className="px-3 py-2 text-gray-600">&quot;author&quot; | &quot;hashtag&quot; | &quot;custom&quot;</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-mono text-blue-600">hopLimit</td>
                          <td className="px-3 py-2">integer</td>
                          <td className="px-3 py-2 text-gray-600">Max hops from ego (default: 2)</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-mono text-blue-600">startTime</td>
                          <td className="px-3 py-2">string</td>
                          <td className="px-3 py-2 text-gray-600">ISO date (e.g., &quot;2002-01-01&quot;)</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-mono text-blue-600">endTime</td>
                          <td className="px-3 py-2">string</td>
                          <td className="px-3 py-2 text-gray-600">ISO date (e.g., &quot;2023-12-31&quot;)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 7: DATA MODELS */}
            {/* ============================================ */}
            <Section id="data-models" title="7. Data Models">

              <SubSection id="data-models-types" title="7.1 TypeScript Interfaces">
                <InterfaceTable
                  name="SpreadLineResult"
                  description="Main output from the processing pipeline"
                  fields={[
                    { name: 'mode', type: 'string', required: false, desc: 'Visualization mode ("author", "hashtag")' },
                    { name: 'ego', type: 'string', required: true, desc: 'Central entity name' },
                    { name: 'bandWidth', type: 'number', required: true, desc: 'Width of each time column in pixels' },
                    { name: 'blockWidth', type: 'number', required: true, desc: 'Width of pill outlines (default 40)' },
                    { name: 'heightExtents', type: '[number, number]', required: true, desc: 'Min and max Y coordinates' },
                    { name: 'timeLabels', type: 'TimeLabel[]', required: true, desc: 'Year labels and positions' },
                    { name: 'storylines', type: 'StorylineResult[]', required: true, desc: 'Entity line data' },
                    { name: 'blocks', type: 'BlockResult[]', required: true, desc: 'Session block data' },
                    { name: 'reference', type: 'any[]', required: false, desc: 'Reference labels for expanded blocks' },
                  ]}
                />

                <InterfaceTable
                  name="StorylineResult"
                  description="One entity's path through time"
                  fields={[
                    { name: 'name', type: 'string', required: true, desc: 'Person name' },
                    { name: 'id', type: 'number', required: true, desc: 'Entity index' },
                    { name: 'color', type: 'string', required: true, desc: 'Line color (hex)' },
                    { name: 'lifespan', type: 'number', required: true, desc: 'Years active' },
                    { name: 'crossingCheck', type: 'boolean', required: true, desc: 'Crosses without membership' },
                    { name: 'lines', type: 'string[]', required: true, desc: 'SVG path strings' },
                    { name: 'marks', type: 'MarkResult[]', required: true, desc: 'Entry/exit triangles' },
                    { name: 'label', type: 'LabelResult', required: true, desc: 'Name label position' },
                  ]}
                />

                <InterfaceTable
                  name="BlockResult"
                  description="A session (pill-shaped block) at one timestamp"
                  fields={[
                    { name: 'id', type: 'number', required: true, desc: 'Block index' },
                    { name: 'time', type: 'string', required: true, desc: 'Year label' },
                    { name: 'moveX', type: 'number', required: true, desc: 'Expansion width when clicked' },
                    { name: 'topPosY', type: 'number', required: true, desc: 'Top Y position' },
                    { name: 'names', type: 'string[]', required: true, desc: 'People in this session' },
                    { name: 'points', type: 'PointResult[]', required: true, desc: 'Node positions' },
                    { name: 'relations', type: '[number, number][]', required: true, desc: 'Connection pairs' },
                    { name: 'outline', type: 'object', required: true, desc: 'SVG arc paths' },
                  ]}
                />
              </SubSection>

              <SubSection id="data-models-csv" title="7.2 CSV Schemas">
                <p className="text-gray-700 mb-4">
                  The following CSV files in <FileRef path="SpreadLine-main/case-studies/vis-author/Heer/" /> are used:
                </p>

                <CSVTable
                  name="relations.csv"
                  description="Who worked with whom and when"
                  purpose="Defines the network edges - each row is a collaboration"
                  columns={[
                    { name: 'year', type: 'integer', desc: 'Publication year' },
                    { name: 'source', type: 'string', desc: 'First person' },
                    { name: 'target', type: 'string', desc: 'Second person' },
                    { name: 'id', type: 'string', desc: 'Paper ID' },
                    { name: 'type', type: 'string', desc: 'Relation type' },
                    { name: 'citationcount', type: 'float', desc: 'Citations' },
                    { name: 'count', type: 'integer', desc: 'Weight' },
                  ]}
                  examples={[
                    ['2002', 'Jeffrey Heer', 'Ed H. Chi', '53e9981db7602d970203d5ca', 'Co-co-author', '60.0', '1'],
                    ['2005', 'Jeffrey Heer', 'Danah Boyd', '53e998aab7602d97020f61bc', 'Co-co-author', '2062.0', '1'],
                    ['2007', 'Jeffrey Heer', 'Martin Wattenberg', '53e99b72b7602d9702460fe7', 'Co-co-author', '361.0', '1'],
                  ]}
                />

                <CSVTable
                  name="entities.csv"
                  description="Metadata about each person"
                  purpose="Provides affiliations to determine line colors (colleague vs collaborator)"
                  columns={[
                    { name: 'name', type: 'string', desc: 'Person name' },
                    { name: 'year', type: 'integer', desc: 'Year of this record' },
                    { name: 'citationcount', type: 'integer', desc: 'Total citations' },
                    { name: 'affiliation', type: 'string', desc: 'Institution' },
                  ]}
                  examples={[
                    ['Jeffrey Heer', '2002', '60', 'UC Berkeley'],
                    ['Ed H. Chi', '2002', '60', 'PARC'],
                    ['Ben Shneiderman', '1992', '2227', 'University of Maryland'],
                  ]}
                />

                <CSVTable
                  name="citations.csv"
                  description="Citation counts per paper per author"
                  purpose="Provides node colors based on citation impact"
                  columns={[
                    { name: 'name', type: 'string', desc: 'Author name' },
                    { name: 'year', type: 'integer', desc: 'Publication year' },
                    { name: 'citationcount', type: 'integer', desc: 'Citations' },
                    { name: 'affiliation', type: 'string', desc: 'Institution' },
                    { name: 'paperID', type: 'string', desc: 'Paper identifier' },
                  ]}
                  examples={[
                    ['Jeffrey Heer', '2002', '60', 'UC Berkeley', '53e9981db7602d970203d5ca'],
                    ['Jeffrey Heer', '2005', '3140', 'UC Berkeley', '53e998aab7602d97020f61bc'],
                  ]}
                />

                <CSVTable
                  name="content.csv"
                  description="Layout positions for expanded block content"
                  purpose="Pre-computed positions for nodes when a block is expanded (from PCA dimensionality reduction)"
                  columns={[
                    { name: 'year', type: 'string', desc: 'Timestamp' },
                    { name: 'name', type: 'string', desc: 'Entity name' },
                    { name: 'posX', type: 'float', desc: 'Normalized X position (0-1)' },
                    { name: 'posY', type: 'float', desc: 'Normalized Y position (0-1)' },
                  ]}
                  examples={[
                    ['2002', 'Jeffrey Heer', '0.655', '0.592'],
                    ['2002', 'Ed H. Chi', '0.677', '0.625'],
                    ['2003', 'Stuart K. Card', '0.470', '0.538'],
                  ]}
                />

                <CSVTable
                  name="content_reference.csv"
                  description="Reference labels shown in expanded blocks"
                  purpose="Keywords/topics to display inside expanded blocks for context"
                  columns={[
                    { name: 'posX', type: 'float', desc: 'Normalized X position (0-1)' },
                    { name: 'posY', type: 'float', desc: 'Normalized Y position (0-1)' },
                    { name: 'name', type: 'string', desc: 'Keyword/topic label' },
                    { name: 'year', type: 'string', desc: 'Timestamp' },
                  ]}
                  examples={[
                    ['0.734', '0.597', 'clustering', '2002'],
                    ['0.755', '0.831', 'log analysis', '2002'],
                    ['0.563', '0.600', 'visualization', '2005'],
                    ['0.308', '0.493', 'human factors', '2006'],
                  ]}
                />
              </SubSection>
            </Section>

            {/* ============================================ */}
            {/* SECTION 8: USER INTERACTIONS */}
            {/* ============================================ */}
            <Section id="interactions" title="8. User Interactions">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Target</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">What Happens</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3">Click</td>
                      <td className="px-4 py-3">Block or Year label</td>
                      <td className="px-4 py-3 text-gray-600">Expand/collapse block with 500ms animation</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">_blockUpdate()</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Hover</td>
                      <td className="px-4 py-3">Storyline or Node</td>
                      <td className="px-4 py-3 text-gray-600">Highlight that person, dim others to 10% opacity</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">_lineHover()</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Click</td>
                      <td className="px-4 py-3">Storyline</td>
                      <td className="px-4 py-3 text-gray-600">Pin/unpin that person (stays highlighted)</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">_linePin()</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Drag</td>
                      <td className="px-4 py-3">Time axis</td>
                      <td className="px-4 py-3 text-gray-600">Create time range selection (brush)</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">_activateBrush()</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Double-click</td>
                      <td className="px-4 py-3">Brush selection</td>
                      <td className="px-4 py-3 text-gray-600">Clear the selection</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">dblclicked()</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Slider</td>
                      <td className="px-4 py-3">Years filter</td>
                      <td className="px-4 py-3 text-gray-600">Hide people with careers shorter than N years</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">applyFilter()</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Checkbox</td>
                      <td className="px-4 py-3">Crossing filter</td>
                      <td className="px-4 py-3 text-gray-600">Show only lines that cross blocks</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">applyFilter()</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 9: ERROR HANDLING */}
            {/* ============================================ */}
            <Section id="error-handling" title="9. Error Handling">
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-3">Backend Errors</div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Error</th>
                        <th className="px-3 py-2 text-left">Cause</th>
                        <th className="px-3 py-2 text-left">Handling</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-3 py-2 font-mono text-red-600">CSV not found</td>
                        <td className="px-3 py-2 text-gray-600">Data files missing</td>
                        <td className="px-3 py-2 text-gray-600">Return 500 with error message</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-red-600">Ego not found</td>
                        <td className="px-3 py-2 text-gray-600">Ego not in data</td>
                        <td className="px-3 py-2 text-gray-600">Return 404</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-red-600">Empty network</td>
                        <td className="px-3 py-2 text-gray-600">No connections found</td>
                        <td className="px-3 py-2 text-gray-600">Return minimal result with ego only</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold text-yellow-800 mb-2">Known Limitations</div>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>Large networks (&gt;500 entities) may be slow</li>
                    <li>Force simulation blocks UI briefly during expansion</li>
                    <li>Overlapping labels not automatically resolved</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 10: NFR */}
            {/* ============================================ */}
            <Section id="nfr" title="10. Non-Functional Requirements">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Performance</div>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li><strong>API:</strong> &lt;2s for ~100 entities</li>
                    <li><strong>Render:</strong> &lt;500ms initial</li>
                    <li><strong>Animation:</strong> 500ms, easeQuadInOut</li>
                    <li><strong>Filter:</strong> &lt;100ms</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Browser Support</div>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li><strong>Required:</strong> ES2020+, SVG</li>
                    <li><strong>Tested:</strong> Chrome 90+, Firefox 88+, Safari 14+</li>
                    <li><strong>D3.js:</strong> v7</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* ============================================ */}
            {/* SECTION 11: DEPENDENCIES */}
            {/* ============================================ */}
            <Section id="dependencies" title="11. Dependencies">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Package</th>
                    <th className="px-4 py-2 text-left">Version</th>
                    <th className="px-4 py-2 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-2 font-mono text-blue-600">react</td>
                    <td className="px-4 py-2">18.x</td>
                    <td className="px-4 py-2 text-gray-600">UI framework</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-blue-600">d3</td>
                    <td className="px-4 py-2">7.x</td>
                    <td className="px-4 py-2 text-gray-600">SVG visualization</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-blue-600">@tanstack/react-query</td>
                    <td className="px-4 py-2">5.x</td>
                    <td className="px-4 py-2 text-gray-600">Data fetching</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-blue-600">next</td>
                    <td className="px-4 py-2">14.x</td>
                    <td className="px-4 py-2 text-gray-600">Framework</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-blue-600">papaparse</td>
                    <td className="px-4 py-2">5.x</td>
                    <td className="px-4 py-2 text-gray-600">CSV parsing</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* ============================================ */}
            {/* SECTION 12: ASSUMPTIONS */}
            {/* ============================================ */}
            <Section id="assumptions" title="12. Assumptions & Open Questions">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold text-green-800 mb-2">Assumptions</div>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>External API will conform to Section 6.2 contract</li>
                    <li>Ego entity always exists with at least one connection</li>
                    <li>Timestamps are discrete (yearly granularity)</li>
                    <li>Single ego per visualization</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="font-semibold text-amber-800 mb-2">Open Questions</div>
                  <ol className="text-amber-700 text-sm space-y-1 list-decimal list-inside">
                    <li>External API authentication method?</li>
                    <li>Caching strategy for external responses?</li>
                    <li>Real-time updates or refresh-on-demand?</li>
                    <li>Touch/mobile interaction support?</li>
                    <li>Accessibility (keyboard nav, screen readers)?</li>
                  </ol>
                </div>
              </div>
            </Section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p className="font-semibold">Technical Design Document v3 - SpreadLine</p>
              <p className="mt-1">Last updated: {new Date().toISOString().split('T')[0]}</p>
              <div className="mt-4 flex justify-center gap-4">
                <Link href="/frontend3/demo" className="text-blue-600 hover:underline">Live Demo</Link>
                <Link href="/spreadline-design2" className="text-blue-600 hover:underline">v2 Docs</Link>
                <Link href="/spreadline-design1" className="text-blue-600 hover:underline">v1 Docs</Link>
                <a href="https://arxiv.org/pdf/2408.08992" className="text-blue-600 hover:underline">Research Paper</a>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

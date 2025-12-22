'use client';

import Link from 'next/link';

export default function ReactDesign4Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">SpreadLine React v4</h1>
              <p className="text-slate-400 text-sm">Fixed layer ordering and storyline continuity</p>
            </div>
            <Link
              href="/react-design4/demo"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Key Fixes */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Key Fixes in v4</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <FixCard
              title="Three-Layer Rendering"
              description="Block backgrounds render first, then storylines (visible through white expanded blocks), then block foregrounds (nodes, arcs)."
              before="Storylines hidden behind white blocks"
              after="Storylines visible through expanded blocks"
            />

            <FixCard
              title="Fill Lines"
              description="Horizontal line segments maintain storyline continuity through expanded blocks for non-member entities."
              before="Gaps in storylines when blocks expand"
              after="Continuous storylines through all blocks"
            />

            <FixCard
              title="Refresh Button"
              description="Dedicated button to apply data editor changes, ensuring complete re-render of visualization."
              before="Some changes didn't reflect"
              after="All changes applied on refresh"
            />

            <FixCard
              title="Relation Arc Arrows"
              description="Arrow markers positioned at node borders (not inside), with correct direction from source to target."
              before="Arrows inside nodes, wrong direction"
              after="Arrows at node edges, correct direction"
            />

            <FixCard
              title="Smooth Animation"
              description="Using requestAnimationFrame instead of setInterval for smoother 60fps animations."
              before="Choppy animation"
              after="Smooth expansion/collapse"
            />

            <FixCard
              title="Click Areas"
              description="Year labels and pill containers are both clickable to toggle block expansion."
              before="Had to click border"
              after="Click anywhere on block or year"
            />
          </div>
        </section>

        {/* Layer Diagram */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Rendering Layers</h2>
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
            <div className="space-y-4">
              <LayerBox number={1} name="Block Backgrounds" desc="Pill shapes with dark fill, white fill when expanded" />
              <LayerBox number={2} name="Storylines + Fill Lines" desc="Path curves + horizontal fill segments (render ON TOP of white)" />
              <LayerBox number={3} name="Block Foregrounds" desc="Relation arcs (behind), then node circles (on top)" />
            </div>

            <div className="mt-8 p-4 bg-slate-950 rounded-lg">
              <pre className="text-sm font-mono text-slate-300">{`<svg>
  {/* Layer 1: Block backgrounds */}
  <g className="block-backgrounds">
    {blocks.map(b => <path d={pillPath} fill={expanded ? "white" : "#1e293b"} />)}
  </g>

  {/* Layer 2: Storylines + fill lines */}
  <g className="storylines-layer">
    {storylines.map(sl => (
      <>
        {sl.lines.map(line => <path d={line} />)}
        {fillLines.map(fl => <line x1={fl.x1} x2={fl.x2} y={fl.y} />)}
      </>
    ))}
  </g>

  {/* Layer 3: Block foregrounds */}
  <g className="block-foregrounds">
    {blocks.map(b => (
      <>
        {b.relations.map(rel => <path d={arc} markerEnd="url(#arrow)" />)}
        {b.points.map(pt => <circle cx={px} cy={py} />)}
      </>
    ))}
  </g>
</svg>`}</pre>
            </div>
          </div>
        </section>

        {/* Demo Link */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Try the Demo</h2>
          <p className="text-slate-400 mb-6">
            Test block expansion, data editing, and storyline continuity.
          </p>
          <Link
            href="/react-design4/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-lg font-medium transition-all"
          >
            Open Demo
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>
      </main>
    </div>
  );
}

function FixCard({ title, description, before, after }: { title: string; description: string; before: string; after: string }) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4">{description}</p>
      <div className="flex gap-4 text-xs">
        <div className="flex-1">
          <span className="text-red-400 font-medium">Before:</span>
          <p className="text-slate-500 mt-1">{before}</p>
        </div>
        <div className="flex-1">
          <span className="text-green-400 font-medium">After:</span>
          <p className="text-slate-500 mt-1">{after}</p>
        </div>
      </div>
    </div>
  );
}

function LayerBox({ number, name, desc }: { number: number; name: string; desc: string }) {
  const colors = ['bg-blue-900/30 border-blue-600', 'bg-purple-900/30 border-purple-600', 'bg-green-900/30 border-green-600'];
  return (
    <div className={`p-4 rounded-lg border ${colors[number - 1]}`}>
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">{number}</span>
        <div>
          <div className="text-white font-medium">{name}</div>
          <div className="text-slate-400 text-sm">{desc}</div>
        </div>
      </div>
    </div>
  );
}

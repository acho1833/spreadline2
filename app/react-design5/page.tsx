'use client';

import Link from 'next/link';
import CodeViewer from './components/CodeViewer';

export default function ReactDesign5Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">SpreadLine React Architecture v5</h1>
              <p className="text-slate-400 text-sm">Bug fixes: connectivity, refresh, arrows, right-only expansion</p>
            </div>
            <Link
              href="/react-design5/demo"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              View Full Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Overview */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Bug Fixes in v5</h2>
          <p className="text-slate-300 leading-relaxed mb-8">
            This version fixes 4 critical bugs identified from comparing the expected visualization (x1.png)
            with the buggy version (x2.png). All fixes are minimal and focused on the specific issues.
          </p>
          <BugFixSummary />
        </section>

        {/* Implementation Order */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Implementation Order</h2>
          <ImplementationOrder />
        </section>

        {/* Bug Fix Details */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Bug Fix Details</h2>
          <BugFixDetails />
        </section>

        {/* Testing Guide */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Testing Guide</h2>
          <TestingGuide />
        </section>

        {/* Full Demo Link */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Test?</h2>
          <p className="text-slate-400 mb-6">
            Open the demo to verify all bug fixes work correctly.
          </p>
          <Link
            href="/react-design5/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-lg font-medium transition-all"
          >
            Open Full Demo
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>
      </main>
    </div>
  );
}

// ============================================
// Bug Fix Summary
// ============================================
function BugFixSummary() {
  const fixes = [
    {
      id: 1,
      title: 'Storyline Connectivity',
      status: 'fixed',
      description: 'Lines now stay connected when multiple blocks (e.g., 2002 and 2004) are expanded',
      impact: 'Critical visual bug'
    },
    {
      id: 2,
      title: 'Right-Only Expansion',
      status: 'fixed',
      description: 'Blocks now expand only to the right, keeping the left edge fixed',
      impact: 'Animation behavior'
    },
    {
      id: 3,
      title: 'Refresh Button',
      status: 'fixed',
      description: 'Dedicated Refresh button in Data Editor to apply bandWidth and other changes',
      impact: 'Data editing workflow'
    },
    {
      id: 4,
      title: 'Arrow Positioning',
      status: 'fixed',
      description: 'Arrows now stop at node border and point in correct direction',
      impact: 'Visual polish'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {fixes.map((fix) => (
        <div key={fix.id} className="bg-slate-900 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-green-900 flex items-center justify-center text-green-400 font-bold text-sm">
              {fix.id}
            </span>
            <h3 className="text-white font-semibold">{fix.title}</h3>
            <span className="px-2 py-0.5 bg-green-900 text-green-300 rounded text-xs uppercase">{fix.status}</span>
          </div>
          <p className="text-slate-400 text-sm mb-2">{fix.description}</p>
          <p className="text-slate-500 text-xs">Impact: {fix.impact}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Implementation Order
// ============================================
function ImplementationOrder() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <h3 className="text-lg font-semibold text-white mb-6">Components to Implement First</h3>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">1</div>
          <div>
            <h4 className="text-white font-medium">Fix Block Expansion Direction (createPillPath)</h4>
            <p className="text-slate-400 text-sm mt-1">
              This must be done FIRST because it affects all position calculations. Change from center expansion to right-only:
            </p>
            <div className="mt-2 p-3 bg-slate-950 rounded-lg font-mono text-sm">
              <span className="text-red-400">- leftX = posX - blockWidth/2 + shift - expandW/2</span><br/>
              <span className="text-green-400">+ leftX = posX - blockWidth/2 + shift</span><br/>
              <span className="text-red-400">- rightX = posX + blockWidth/2 + shift + expandW/2</span><br/>
              <span className="text-green-400">+ rightX = posX + blockWidth/2 + shift + expandW</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">2</div>
          <div>
            <h4 className="text-white font-medium">Fix getShiftX Calculation</h4>
            <p className="text-slate-400 text-sm mt-1">
              Update shift calculation for right-only expansion. Elements to the right get the FULL expansion width:
            </p>
            <div className="mt-2 p-3 bg-slate-950 rounded-lg font-mono text-sm">
              <span className="text-slate-300">if (blockPosX &lt; posX) shift += expandW; // Full width, not half</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">3</div>
          <div>
            <h4 className="text-white font-medium">Fix generateFillLines</h4>
            <p className="text-slate-400 text-sm mt-1">
              Update fill line generation to match right-only expansion. Left edge stays fixed, right edge includes full expansion:
            </p>
            <div className="mt-2 p-3 bg-slate-950 rounded-lg font-mono text-sm">
              <span className="text-slate-300">fillStartX = posX - blockWidth/2 + shift;</span><br/>
              <span className="text-slate-300">fillEndX = posX + blockWidth/2 + shift + expandW;</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">4</div>
          <div>
            <h4 className="text-white font-medium">Fix Point Positions in Expanded Blocks</h4>
            <p className="text-slate-400 text-sm mt-1">
              Points should expand to the right only, not from center:
            </p>
            <div className="mt-2 p-3 bg-slate-950 rounded-lg font-mono text-sm">
              <span className="text-red-400">- px = posX + shift + embedding(scaleX, expandW) - expandW/2</span><br/>
              <span className="text-green-400">+ px = posX + shift + embedding(scaleX, expandW)</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">5</div>
          <div>
            <h4 className="text-white font-medium">Add Refresh Button to DataEditor</h4>
            <p className="text-slate-400 text-sm mt-1">
              Add onRefresh prop and Refresh button that triggers full visualization re-render via dataVersion key increment.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">6</div>
          <div>
            <h4 className="text-white font-medium">Fix Arrow Positioning in Relations</h4>
            <p className="text-slate-400 text-sm mt-1">
              Calculate arrow angle dynamically and shorten path to stop at node border (radius = 6px).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Bug Fix Details
// ============================================
function BugFixDetails() {
  return (
    <div className="space-y-8">
      {/* Fix 1: Right-Only Expansion */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Fix 1: Right-Only Block Expansion</h3>
          <p className="text-slate-400 text-sm mt-1">The left edge stays fixed while the block expands to the right</p>
        </div>
        <div className="p-6">
          <CodeViewer
            title="createPillPath fix"
            code={`// FIX: Create pill-shaped path - RIGHT-ONLY EXPANSION
const createPillPath = (block, tl, expandW, baseShift) => {
  const minY = Math.min(...block.points.map(p => p.posY)) - 20;
  const maxY = Math.max(...block.points.map(p => p.posY)) + 20;
  const radius = Math.min(15, (maxY - minY) / 2);

  // FIX: Left side stays fixed, expansion only goes right
  const leftX = tl.posX - data.blockWidth / 2 + baseShift;  // No expandW offset
  const rightX = tl.posX + data.blockWidth / 2 + baseShift + expandW;  // Full expandW

  return \`
    M \${leftX + radius} \${minY}
    L \${rightX - radius} \${minY}
    Q \${rightX} \${minY} \${rightX} \${minY + radius}
    L \${rightX} \${maxY - radius}
    Q \${rightX} \${maxY} \${rightX - radius} \${maxY}
    L \${leftX + radius} \${maxY}
    Q \${leftX} \${maxY} \${leftX} \${maxY - radius}
    L \${leftX} \${minY + radius}
    Q \${leftX} \${minY} \${leftX + radius} \${minY}
    Z
  \`;
};`}
          />
        </div>
      </div>

      {/* Fix 2: Storyline Connectivity */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Fix 2: Storyline Connectivity</h3>
          <p className="text-slate-400 text-sm mt-1">Fill lines bridge storylines through expanded blocks</p>
        </div>
        <div className="p-6">
          <CodeViewer
            title="generateFillLines fix"
            code={`// FIX: Generate fill lines for storylines through expanded blocks
const generateFillLines = (storyline) => {
  const fillLines = [];

  data.blocks.forEach((block) => {
    if (!expandedBlocks.has(block.id)) return;

    const tl = data.timeLabels.find(t => t.label === block.time);
    if (!tl) return;

    const progress = easeOutQuad(blockAnimProgress[block.id] || 0);
    const expandW = block.moveX * progress;
    if (expandW < 1) return;

    // Skip block members - they don't need fill lines
    if (block.names.includes(storyline.name)) return;

    // Find where storyline crosses this block
    for (const line of storyline.lines) {
      const startX = getPathStartX(line);
      const endX = getPathEndX(line);

      if (startX <= tl.posX && endX >= tl.posX) {
        // Interpolate Y position
        const startY = getPathStartY(line);
        const endY = getPathEndY(line);
        const t = (tl.posX - startX) / (endX - startX || 1);
        const y = startY + (endY - startY) * t;

        const baseShift = getShiftX(tl.posX);

        // FIX: Right-only expansion fill line
        const fillStartX = tl.posX - data.blockWidth / 2 + baseShift;
        const fillEndX = tl.posX + data.blockWidth / 2 + baseShift + expandW;

        fillLines.push(\`M \${fillStartX},\${y} L \${fillEndX},\${y}\`);
        break;
      }
    }
  });

  return fillLines;
};`}
          />
        </div>
      </div>

      {/* Fix 3: Arrow Positioning */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Fix 3: Arrow Positioning & Direction</h3>
          <p className="text-slate-400 text-sm mt-1">Arrows stop at node border and point correctly</p>
        </div>
        <div className="p-6">
          <CodeViewer
            title="Relation arc with correct arrow"
            code={`// FIX: Relation arcs with correct arrow direction
{block.relations.map(([srcId, tgtId], idx) => {
  const src = block.points.find(p => p.id === srcId);
  const tgt = block.points.find(p => p.id === tgtId);
  if (!src || !tgt) return null;

  const sx = tl.posX + baseShift + computeEmbedding(src.scaleX, expandW);
  const sy = block.topPosY + computeEmbedding(src.scaleY, expandW);
  const tx = tl.posX + baseShift + computeEmbedding(tgt.scaleX, expandW);
  const ty = block.topPosY + computeEmbedding(tgt.scaleY, expandW);

  const midX = (sx + tx) / 2;
  const controlY = Math.min(sy, ty) - 25;

  // FIX: Calculate arrow angle
  const dx = tx - midX;
  const dy = ty - controlY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // FIX: Shorten path to stop at node border (radius = 6)
  const nodeRadius = 6;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ratio = (dist - nodeRadius) / dist;
  const endX = midX + dx * ratio;
  const endY = controlY + dy * ratio;

  return (
    <g key={idx}>
      <path
        d={\`M\${sx},\${sy} Q\${midX},\${controlY} \${endX},\${endY}\`}
        stroke="#424242"
        strokeWidth="1.5"
        fill="none"
      />
      <polygon
        points="0,-4 8,0 0,4"
        transform={\`translate(\${endX}, \${endY}) rotate(\${angle})\`}
        fill="#424242"
      />
    </g>
  );
})}`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Testing Guide
// ============================================
function TestingGuide() {
  const tests = [
    {
      category: 'Block Expansion',
      items: [
        'Expand year 2002 alone - storylines stay connected',
        'Expand year 2004 alone - storylines stay connected',
        'Expand both 2002 and 2004 - all storylines connected through both blocks',
        'Block expands only to the right, left edge stays fixed',
        'Collapse animation contracts from the right'
      ]
    },
    {
      category: 'Data Editor',
      items: [
        'Click "Edit Data" to open editor panel',
        'Change bandWidth value (e.g., from 101 to 50)',
        'Click "Refresh" button',
        'Visualization should update to reflect new bandWidth',
        '"Modified" badge appears when changes are made'
      ]
    },
    {
      category: 'Arrow Positioning',
      items: [
        'Expand a block with relations',
        'Arrows should point FROM source TO target',
        'Arrow tips stop at node border, not inside',
        'Arrow direction should follow the arc curve'
      ]
    }
  ];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
      <h3 className="text-lg font-semibold text-white mb-6">Testing Checklist</h3>

      <div className="space-y-8">
        {tests.map((test) => (
          <div key={test.category}>
            <h4 className="text-cyan-400 font-medium mb-3">{test.category}</h4>
            <ul className="space-y-2">
              {test.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded border border-slate-600 flex-shrink-0 mt-0.5"></span>
                  <span className="text-slate-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

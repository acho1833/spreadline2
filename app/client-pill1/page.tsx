'use client';

import React, { useState } from 'react';

/**
 * Interactive presentation explaining how SpreadLine renders pill containers
 */

// Simplified Path class for demonstration
class Path {
  str: string = '';
  endX: number | null = null;
  endY: number | null = null;

  toString(): string {
    return this.str;
  }

  moveTo(x: number, y: number): this {
    this.endX = x;
    this.endY = y;
    this.str += `M${x},${y}`;
    return this;
  }

  lineTo(x: number, y: number): this {
    this.endX = x;
    this.endY = y;
    this.str += ` L${x},${y}`;
    return this;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, ccw: number = 0): this {
    const tau = 2 * Math.PI;
    const epsilon = 1e-6;

    const dx = radius * Math.cos(startAngle);
    const dy = radius * Math.sin(startAngle);
    const x0 = x + dx;
    const y0 = y + dy;
    const cw = 1 ^ ccw;
    let da = ccw === 0 ? endAngle - startAngle : startAngle - endAngle;

    if (this.endX === null) {
      this.str += `M${x0},${y0}`;
    } else if (Math.abs(this.endX - x0) > epsilon || Math.abs(this.endY! - y0) > epsilon) {
      this.str += ` L${x0},${y0}`;
    }

    if (da < 0) da = (da % tau) + tau;

    if (da > epsilon) {
      this.endX = x + radius * Math.cos(endAngle);
      this.endY = y + radius * Math.sin(endAngle);
      this.str += ` A${radius},${radius},0,${da >= Math.PI ? 1 : 0},${cw},${this.endX},${this.endY}`;
    }
    return this;
  }
}

// Step components
function Step1_DataStructure() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 1: Input Data Structure</h3>
      <p className="text-gray-700">
        The pill receives two key inputs: <strong>points</strong> (nodes/people) and <strong>hops</strong> (groupings).
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Points Array</h4>
          <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`points = [
  { id: 0, posX: 200, posY: 50,  name: "Alice" },   // 2-hop
  { id: 1, posX: 200, posY: 100, name: "Bob" },     // 1-hop
  { id: 2, posX: 200, posY: 150, name: "EGO" },     // ego
  { id: 3, posX: 200, posY: 200, name: "Carol" },   // 1-hop
  { id: 4, posX: 200, posY: 250, name: "Dave" },    // 2-hop
]`}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Hops Array (5 groups)</h4>
          <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`hops = [
  [0],        // index 0: top 2-hop entities
  [1],        // index 1: 1-hop sources
  [2],        // index 2: ego (center)
  [3],        // index 3: 1-hop targets
  [4],        // index 4: bottom 2-hop entities
]`}
          </pre>
        </div>
      </div>

      <svg width="400" height="320" className="border rounded bg-white mx-auto block">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#666" />
          </marker>
        </defs>

        {/* Labels */}
        <text x="50" y="60" className="text-sm" fill="#666">2-hop (top)</text>
        <text x="50" y="110" className="text-sm" fill="#666">1-hop source</text>
        <text x="50" y="160" className="text-sm" fill="#666">EGO</text>
        <text x="50" y="210" className="text-sm" fill="#666">1-hop target</text>
        <text x="50" y="260" className="text-sm" fill="#666">2-hop (bottom)</text>

        {/* Points */}
        <circle cx="200" cy="50" r="15" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
        <text x="200" y="55" textAnchor="middle" className="text-xs" fill="#1e40af">Alice</text>

        <circle cx="200" cy="100" r="15" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
        <text x="200" y="105" textAnchor="middle" className="text-xs" fill="#166534">Bob</text>

        <circle cx="200" cy="150" r="20" fill="#fcd34d" stroke="#f59e0b" strokeWidth="3" />
        <text x="200" y="155" textAnchor="middle" className="text-xs font-bold" fill="#92400e">EGO</text>

        <circle cx="200" cy="200" r="15" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
        <text x="200" y="205" textAnchor="middle" className="text-xs" fill="#166534">Carol</text>

        <circle cx="200" cy="250" r="15" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
        <text x="200" y="255" textAnchor="middle" className="text-xs" fill="#1e40af">Dave</text>

        {/* Bracket annotations */}
        <path d="M240,40 L260,40 L260,60 L240,60" fill="none" stroke="#3b82f6" strokeWidth="2" />
        <text x="270" y="55" className="text-xs" fill="#3b82f6">hops[0]</text>

        <path d="M240,90 L260,90 L260,110 L240,110" fill="none" stroke="#22c55e" strokeWidth="2" />
        <text x="270" y="105" className="text-xs" fill="#22c55e">hops[1]</text>

        <path d="M240,140 L260,140 L260,160 L240,160" fill="none" stroke="#f59e0b" strokeWidth="2" />
        <text x="270" y="155" className="text-xs" fill="#f59e0b">hops[2]</text>

        <path d="M240,190 L260,190 L260,210 L240,210" fill="none" stroke="#22c55e" strokeWidth="2" />
        <text x="270" y="205" className="text-xs" fill="#22c55e">hops[3]</text>

        <path d="M240,240 L260,240 L260,260 L240,260" fill="none" stroke="#3b82f6" strokeWidth="2" />
        <text x="270" y="255" className="text-xs" fill="#3b82f6">hops[4]</text>
      </svg>
    </div>
  );
}

function Step2_FindExtents() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 2: Find Extents (Top & Bottom)</h3>
      <p className="text-gray-700">
        First, we find the <strong>topmost</strong> and <strong>bottommost</strong> points to determine pill height.
      </p>

      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`function getExtents(points, key) {
  // Find min and max by posY
  const topPoint = points[0];     // posY = 50 (smallest)
  const bottomPoint = points[4];  // posY = 250 (largest)
  return [topPoint, bottomPoint];
}

// Result:
const topPosY = 50;      // Alice's Y position
const bottomPosY = 250;  // Dave's Y position
const posX = 200;        // X position (center of pill)`}
        </pre>
      </div>

      <svg width="400" height="320" className="border rounded bg-white mx-auto block">
        {/* Extent lines */}
        <line x1="100" y1="50" x2="300" y2="50" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
        <text x="310" y="55" className="text-sm font-bold" fill="#ef4444">topPosY = 50</text>

        <line x1="100" y1="250" x2="300" y2="250" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
        <text x="310" y="255" className="text-sm font-bold" fill="#ef4444">bottomPosY = 250</text>

        {/* Height indicator */}
        <line x1="350" y1="50" x2="350" y2="250" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
        <text x="360" y="155" className="text-sm" fill="#8b5cf6">height = 200</text>

        {/* Points */}
        <circle cx="200" cy="50" r="15" fill="#fca5a5" stroke="#ef4444" strokeWidth="3" />
        <text x="200" y="55" textAnchor="middle" className="text-xs" fill="#7f1d1d">TOP</text>

        <circle cx="200" cy="100" r="12" fill="#d1d5db" stroke="#6b7280" strokeWidth="2" />
        <circle cx="200" cy="150" r="12" fill="#d1d5db" stroke="#6b7280" strokeWidth="2" />
        <circle cx="200" cy="200" r="12" fill="#d1d5db" stroke="#6b7280" strokeWidth="2" />

        <circle cx="200" cy="250" r="15" fill="#fca5a5" stroke="#ef4444" strokeWidth="3" />
        <text x="200" y="255" textAnchor="middle" className="text-xs" fill="#7f1d1d">BOTTOM</text>

        {/* Center line */}
        <line x1="200" y1="30" x2="200" y2="280" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,3" />
        <text x="200" y="295" textAnchor="middle" className="text-sm" fill="#6b7280">posX = 200</text>
      </svg>
    </div>
  );
}

function Step3_GroupByHops() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 3: Group Points by Hop Level</h3>
      <p className="text-gray-700">
        We separate points into three regions: <strong>top 2-hop</strong>, <strong>main</strong> (1-hop + ego), and <strong>bottom 2-hop</strong>.
      </p>

      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`// Filter points by hop level
const topHops = points.filter(p => hops[0].includes(p.id));     // 2-hop top
const main = points.filter(p =>
  hops[1].includes(p.id) ||  // 1-hop source
  hops[2].includes(p.id) ||  // ego
  hops[3].includes(p.id)     // 1-hop target
);
const bottomHops = points.filter(p => hops[4].includes(p.id));  // 2-hop bottom

// Results:
topHops    = [Alice]           // posY: 50
main       = [Bob, EGO, Carol] // posY: 100, 150, 200
bottomHops = [Dave]            // posY: 250`}
        </pre>
      </div>

      <svg width="450" height="350" className="border rounded bg-white mx-auto block">
        {/* Region boxes */}
        <rect x="140" y="30" width="120" height="50" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" rx="5" />
        <text x="200" y="20" textAnchor="middle" className="text-sm font-bold" fill="#3b82f6">Top 2-hop Region</text>

        <rect x="130" y="85" width="140" height="140" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" rx="5" />
        <text x="200" y="75" textAnchor="middle" className="text-sm font-bold" fill="#22c55e">Main Region</text>

        <rect x="140" y="230" width="120" height="50" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" rx="5" />
        <text x="200" y="295" textAnchor="middle" className="text-sm font-bold" fill="#3b82f6">Bottom 2-hop Region</text>

        {/* Points */}
        <circle cx="200" cy="55" r="12" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
        <text x="200" y="60" textAnchor="middle" className="text-xs" fill="#1e40af">Alice</text>

        <circle cx="200" cy="110" r="12" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
        <text x="200" y="115" textAnchor="middle" className="text-xs" fill="#166534">Bob</text>

        <circle cx="200" cy="155" r="15" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
        <text x="200" y="160" textAnchor="middle" className="text-xs font-bold" fill="#92400e">EGO</text>

        <circle cx="200" cy="200" r="12" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
        <text x="200" y="205" textAnchor="middle" className="text-xs" fill="#166534">Carol</text>

        <circle cx="200" cy="255" r="12" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
        <text x="200" y="260" textAnchor="middle" className="text-xs" fill="#1e40af">Dave</text>

        {/* Annotations */}
        <text x="290" y="55" className="text-xs" fill="#3b82f6">topHops extents: 50-50</text>
        <text x="290" y="155" className="text-xs" fill="#22c55e">main extents: 100-200</text>
        <text x="290" y="255" className="text-xs" fill="#3b82f6">bottomHops extents: 250-250</text>
      </svg>
    </div>
  );
}

function Step4_ArcAngles() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 4: Understanding Arc Angles</h3>
      <p className="text-gray-700">
        SVG arcs use <strong>radians</strong>. Here&apos;s the angle reference (like a clock):
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Angle Reference</h4>
          <pre className="text-sm bg-white p-2 rounded border">
{`Math.PI * 0   = 0°    → Right  (3 o'clock)
Math.PI * 0.5 = 90°   → Bottom (6 o'clock)
Math.PI * 1   = 180°  → Left   (9 o'clock)
Math.PI * 1.5 = 270°  → Top    (12 o'clock)
Math.PI * 2   = 360°  → Right  (full circle)`}
          </pre>
        </div>

        <svg width="200" height="200" className="border rounded bg-white">
          {/* Circle */}
          <circle cx="100" cy="100" r="60" fill="none" stroke="#d1d5db" strokeWidth="2" />

          {/* Center */}
          <circle cx="100" cy="100" r="3" fill="#374151" />

          {/* Angle markers */}
          <line x1="100" y1="100" x2="160" y2="100" stroke="#ef4444" strokeWidth="2" />
          <text x="165" y="105" className="text-xs font-bold" fill="#ef4444">0 (right)</text>

          <line x1="100" y1="100" x2="100" y2="160" stroke="#22c55e" strokeWidth="2" />
          <text x="85" y="175" className="text-xs font-bold" fill="#22c55e">0.5π</text>

          <line x1="100" y1="100" x2="40" y2="100" stroke="#3b82f6" strokeWidth="2" />
          <text x="10" y="105" className="text-xs font-bold" fill="#3b82f6">π (left)</text>

          <line x1="100" y1="100" x2="100" y2="40" stroke="#f59e0b" strokeWidth="2" />
          <text x="85" y="30" className="text-xs font-bold" fill="#f59e0b">1.5π</text>
        </svg>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">Key Insight</h4>
        <p className="text-yellow-700 text-sm">
          To draw a <strong>top semicircle</strong> (cap of pill): go from 1.5π (top) → π (left) for left side,
          and 1.5π → 0 (right) for right side.
        </p>
        <p className="text-yellow-700 text-sm mt-2">
          To draw a <strong>bottom semicircle</strong>: go from π (left) → 0.5π (bottom) for left side,
          and 0 (right) → 0.5π (bottom) for right side.
        </p>
      </div>
    </div>
  );
}

function Step5_DrawLeftArc() {
  const [step, setStep] = useState(0);
  const radius = 25;
  const posX = 200;

  // Build path progressively
  const leftArc = new Path();

  // Simple case - main region only (no 2-hop bulges for clarity)
  const topY = 100;
  const bottomY = 200;

  if (step >= 1) {
    leftArc.arc(posX, topY, radius, Math.PI * 1.5, Math.PI, 1);
  }
  if (step >= 2) {
    leftArc.arc(posX, bottomY, radius, Math.PI, Math.PI * 0.5, 1);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 5: Drawing the Left Arc</h3>
      <p className="text-gray-700">
        The left side of the pill is drawn with two arcs: top curve and bottom curve.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setStep(0)}
          className={`px-3 py-1 rounded ${step === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Reset
        </button>
        <button
          onClick={() => setStep(1)}
          className={`px-3 py-1 rounded ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Top Arc
        </button>
        <button
          onClick={() => setStep(2)}
          className={`px-3 py-1 rounded ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Bottom Arc
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Code</h4>
          <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`const leftArc = new Path();

// Step 1: Top-left curve
${step >= 1 ? '→ ' : '  '}leftArc.arc(
    posX,              // center X = 200
    topY,              // center Y = 100
    radius,            // radius = 25
    Math.PI * 1.5,     // start: top (270°)
    Math.PI,           // end: left (180°)
    1                  // counter-clockwise
  );

// Step 2: Bottom-left curve
${step >= 2 ? '→ ' : '  '}leftArc.arc(
    posX,              // center X = 200
    bottomY,           // center Y = 200
    radius,            // radius = 25
    Math.PI,           // start: left (180°)
    Math.PI * 0.5,     // end: bottom (90°)
    1                  // counter-clockwise
  );`}
          </pre>
        </div>

        <svg width="300" height="280" className="border rounded bg-white">
          {/* Grid lines */}
          <line x1="200" y1="20" x2="200" y2="260" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="100" y1="100" x2="280" y2="100" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="100" y1="200" x2="280" y2="200" stroke="#e5e7eb" strokeWidth="1" />

          {/* Center points */}
          <circle cx="200" cy="100" r="4" fill="#ef4444" />
          <text x="210" y="95" className="text-xs" fill="#ef4444">top center</text>

          <circle cx="200" cy="200" r="4" fill="#ef4444" />
          <text x="210" y="195" className="text-xs" fill="#ef4444">bottom center</text>

          {/* Radius indicators */}
          {step >= 1 && (
            <>
              <circle cx="200" cy="100" r="25" fill="none" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="200" y1="100" x2="175" y2="100" stroke="#fca5a5" strokeWidth="1" />
              <text x="180" y="115" className="text-xs" fill="#fca5a5">r=25</text>
            </>
          )}

          {step >= 2 && (
            <circle cx="200" cy="200" r="25" fill="none" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3,3" />
          )}

          {/* The actual path */}
          {leftArc.str && (
            <path d={leftArc.str} fill="none" stroke="#3b82f6" strokeWidth="3" />
          )}

          {/* Points on curve */}
          {step >= 1 && (
            <>
              <circle cx="200" cy="75" r="5" fill="#22c55e" />
              <text x="208" y="72" className="text-xs" fill="#22c55e">start</text>
              <circle cx="175" cy="100" r="5" fill="#f59e0b" />
              <text x="150" y="97" className="text-xs" fill="#f59e0b">end 1</text>
            </>
          )}

          {step >= 2 && (
            <>
              <circle cx="175" cy="200" r="5" fill="#22c55e" />
              <circle cx="200" cy="225" r="5" fill="#f59e0b" />
              <text x="208" y="230" className="text-xs" fill="#f59e0b">end 2</text>
            </>
          )}

          {/* SVG path string */}
          <text x="10" y="260" className="text-xs" fill="#6b7280">
            Path: {leftArc.str || '(empty)'}
          </text>
        </svg>
      </div>
    </div>
  );
}

function Step6_DrawRightArc() {
  const [step, setStep] = useState(0);
  const radius = 25;
  const posX = 200;

  const rightArc = new Path();
  const topY = 100;
  const bottomY = 200;

  if (step >= 1) {
    rightArc.arc(posX, topY, radius, Math.PI * 1.5, 0, 0);
  }
  if (step >= 2) {
    rightArc.arc(posX, bottomY, radius, 0, Math.PI * 0.5, 0);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 6: Drawing the Right Arc</h3>
      <p className="text-gray-700">
        The right side mirrors the left, but goes <strong>clockwise</strong> (ccw=0).
      </p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setStep(0)}
          className={`px-3 py-1 rounded ${step === 0 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Reset
        </button>
        <button
          onClick={() => setStep(1)}
          className={`px-3 py-1 rounded ${step === 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Top Arc
        </button>
        <button
          onClick={() => setStep(2)}
          className={`px-3 py-1 rounded ${step === 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Bottom Arc
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Code</h4>
          <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`const rightArc = new Path();

// Step 1: Top-right curve
${step >= 1 ? '→ ' : '  '}rightArc.arc(
    posX,              // center X = 200
    topY,              // center Y = 100
    radius,            // radius = 25
    Math.PI * 1.5,     // start: top (270°)
    0,                 // end: right (0°)
    0                  // CLOCKWISE (not ccw)
  );

// Step 2: Bottom-right curve
${step >= 2 ? '→ ' : '  '}rightArc.arc(
    posX,              // center X = 200
    bottomY,           // center Y = 200
    radius,            // radius = 25
    0,                 // start: right (0°)
    Math.PI * 0.5,     // end: bottom (90°)
    0                  // clockwise
  );`}
          </pre>
        </div>

        <svg width="300" height="280" className="border rounded bg-white">
          {/* Grid lines */}
          <line x1="200" y1="20" x2="200" y2="260" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="100" y1="100" x2="280" y2="100" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="100" y1="200" x2="280" y2="200" stroke="#e5e7eb" strokeWidth="1" />

          {/* Center points */}
          <circle cx="200" cy="100" r="4" fill="#ef4444" />
          <circle cx="200" cy="200" r="4" fill="#ef4444" />

          {/* Radius circles */}
          {step >= 1 && (
            <circle cx="200" cy="100" r="25" fill="none" stroke="#bbf7d0" strokeWidth="1" strokeDasharray="3,3" />
          )}
          {step >= 2 && (
            <circle cx="200" cy="200" r="25" fill="none" stroke="#bbf7d0" strokeWidth="1" strokeDasharray="3,3" />
          )}

          {/* The actual path */}
          {rightArc.str && (
            <path d={rightArc.str} fill="none" stroke="#22c55e" strokeWidth="3" />
          )}

          {/* Points on curve */}
          {step >= 1 && (
            <>
              <circle cx="200" cy="75" r="5" fill="#3b82f6" />
              <text x="185" y="70" className="text-xs" fill="#3b82f6">start</text>
              <circle cx="225" cy="100" r="5" fill="#f59e0b" />
              <text x="230" y="97" className="text-xs" fill="#f59e0b">end 1</text>
            </>
          )}

          {step >= 2 && (
            <>
              <circle cx="225" cy="200" r="5" fill="#3b82f6" />
              <circle cx="200" cy="225" r="5" fill="#f59e0b" />
              <text x="208" y="230" className="text-xs" fill="#f59e0b">end 2</text>
            </>
          )}

          {/* SVG path string */}
          <text x="10" y="260" className="text-xs" fill="#6b7280">
            Path: {rightArc.str || '(empty)'}
          </text>
        </svg>
      </div>
    </div>
  );
}

function Step7_CompletePill() {
  const radius = 25;
  const posX = 200;
  const topY = 100;
  const bottomY = 200;

  const leftArc = new Path();
  leftArc.arc(posX, topY, radius, Math.PI * 1.5, Math.PI, 1);
  leftArc.arc(posX, bottomY, radius, Math.PI, Math.PI * 0.5, 1);

  const rightArc = new Path();
  rightArc.arc(posX, topY, radius, Math.PI * 1.5, 0, 0);
  rightArc.arc(posX, bottomY, radius, 0, Math.PI * 0.5, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 7: Complete Simple Pill</h3>
      <p className="text-gray-700">
        Combining left and right arcs creates the complete pill outline.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Final Output</h4>
          <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`return {
  left: "${leftArc.str}",

  right: "${rightArc.str}",

  // Plus horizontal bars at top/bottom
  top: "M175,75 L225,75",
  bottom: "M175,225 L225,225"
}`}
          </pre>
        </div>

        <svg width="300" height="280" className="border rounded bg-white">
          {/* Fill area */}
          <path
            d={`${leftArc.str} L200,225 ${rightArc.str.replace('M', 'L')} L200,75 Z`}
            fill="#e0f2fe"
            stroke="none"
          />

          {/* Left arc */}
          <path d={leftArc.str} fill="none" stroke="#3b82f6" strokeWidth="3" />

          {/* Right arc */}
          <path d={rightArc.str} fill="none" stroke="#22c55e" strokeWidth="3" />

          {/* Top and bottom bars */}
          <line x1="175" y1="75" x2="225" y2="75" stroke="#8b5cf6" strokeWidth="2" />
          <line x1="175" y1="225" x2="225" y2="225" stroke="#8b5cf6" strokeWidth="2" />

          {/* Nodes inside */}
          <circle cx="200" cy="110" r="10" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
          <circle cx="200" cy="150" r="12" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="200" cy="190" r="10" fill="#86efac" stroke="#22c55e" strokeWidth="2" />

          {/* Labels */}
          <text x="140" y="150" className="text-xs font-bold" fill="#3b82f6">Left Arc</text>
          <text x="235" y="150" className="text-xs font-bold" fill="#22c55e">Right Arc</text>

          <text x="150" y="20" className="text-sm font-bold" fill="#374151">Simple Pill (no 2-hop)</text>
        </svg>
      </div>
    </div>
  );
}

function Step8_PillWithBulges() {
  const radius = 25;
  const posX = 200;
  const portion = 0.35;

  // With 2-hop bulges
  const topTopHop = 50;
  const bottomTopHop = 70;
  const topMain = 100;
  const bottomMain = 200;
  const topBottomHop = 230;
  const bottomBottomHop = 250;

  const leftArc = new Path();
  // Top 2-hop bulge
  leftArc.arc(posX, topTopHop, radius, Math.PI * 1.5, Math.PI, 1);
  leftArc.arc(posX, bottomTopHop, radius, Math.PI, Math.PI * (1 - portion), 1);
  // Transition to main
  leftArc.arc(posX, topMain, radius, Math.PI * (1 + portion), Math.PI, 1);
  // Main region
  leftArc.arc(posX, bottomMain, radius, Math.PI, Math.PI * (1 - portion), 1);
  // Transition to bottom bulge
  leftArc.arc(posX, topBottomHop, radius, Math.PI * (1 + portion), Math.PI, 1);
  // Bottom 2-hop bulge
  leftArc.arc(posX, bottomBottomHop, radius, Math.PI, Math.PI * 0.5, 1);

  const rightArc = new Path();
  // Top 2-hop bulge
  rightArc.arc(posX, topTopHop, radius, Math.PI * 1.5, 0, 0);
  rightArc.arc(posX, bottomTopHop, radius, 0, Math.PI * portion, 0);
  // Transition to main
  rightArc.arc(posX, topMain, radius, -Math.PI * portion, 0, 0);
  // Main region
  rightArc.arc(posX, bottomMain, radius, 0, Math.PI * portion, 0);
  // Transition to bottom bulge
  rightArc.arc(posX, topBottomHop, radius, -Math.PI * portion, 0, 0);
  // Bottom 2-hop bulge
  rightArc.arc(posX, bottomBottomHop, radius, 0, Math.PI * 0.5, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 8: Pill with 2-Hop Bulges</h3>
      <p className="text-gray-700">
        When there are 2-hop entities, the pill has <strong>bulges</strong> at top and bottom to show hierarchy.
      </p>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
        <h4 className="font-semibold text-yellow-800 mb-2">The &quot;portion&quot; parameter</h4>
        <p className="text-yellow-700 text-sm">
          <code>portion = 0.35</code> controls how much the bulge extends.
          The arcs use <code>Math.PI * (1 + portion)</code> and <code>Math.PI * (1 - portion)</code>
          to create the indentation between sections.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Complex Arc Sequence</h4>
          <pre className="text-sm bg-white p-2 rounded border overflow-x-auto text-xs">
{`// LEFT ARC with bulges
leftArc
  // Top 2-hop cap
  .arc(posX, topTopHop, r, 1.5π, π, ccw)
  .arc(posX, bottomTopHop, r, π, 0.65π, ccw)
  // Indent to main
  .arc(posX, topMain, r, 1.35π, π, ccw)
  // Main section
  .arc(posX, bottomMain, r, π, 0.65π, ccw)
  // Indent to bottom bulge
  .arc(posX, topBottomHop, r, 1.35π, π, ccw)
  // Bottom 2-hop cap
  .arc(posX, bottomBottomHop, r, π, 0.5π, ccw)

// RIGHT ARC mirrors this clockwise`}
          </pre>
        </div>

        <svg width="300" height="320" className="border rounded bg-white">
          {/* Left arc */}
          <path d={leftArc.str} fill="none" stroke="#3b82f6" strokeWidth="2" />

          {/* Right arc */}
          <path d={rightArc.str} fill="none" stroke="#22c55e" strokeWidth="2" />

          {/* Section labels */}
          <rect x="165" y="45" width="70" height="35" fill="#dbeafe" fillOpacity="0.5" stroke="#3b82f6" strokeDasharray="3,3" />
          <text x="200" y="67" textAnchor="middle" className="text-xs" fill="#3b82f6">2-hop</text>

          <rect x="160" y="90" width="80" height="120" fill="#dcfce7" fillOpacity="0.5" stroke="#22c55e" strokeDasharray="3,3" />
          <text x="200" y="155" textAnchor="middle" className="text-xs" fill="#22c55e">main</text>

          <rect x="165" y="220" width="70" height="40" fill="#dbeafe" fillOpacity="0.5" stroke="#3b82f6" strokeDasharray="3,3" />
          <text x="200" y="245" textAnchor="middle" className="text-xs" fill="#3b82f6">2-hop</text>

          {/* Nodes */}
          <circle cx="200" cy="60" r="8" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="200" cy="110" r="8" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
          <circle cx="200" cy="150" r="10" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="200" cy="190" r="8" fill="#86efac" stroke="#22c55e" strokeWidth="2" />
          <circle cx="200" cy="240" r="8" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />

          {/* Indent annotations */}
          <path d="M150,80 Q170,85 175,100" fill="none" stroke="#f59e0b" strokeWidth="1" />
          <text x="130" y="78" className="text-xs" fill="#f59e0b">indent</text>

          <path d="M150,220 Q170,215 175,200" fill="none" stroke="#f59e0b" strokeWidth="1" />
          <text x="130" y="225" className="text-xs" fill="#f59e0b">indent</text>

          <text x="150" y="15" className="text-sm font-bold" fill="#374151">Pill with Bulges</text>
        </svg>
      </div>
    </div>
  );
}

function Step9_SVGArcCommand() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 9: SVG Arc Command Breakdown</h3>
      <p className="text-gray-700">
        The <code>Path.arc()</code> method generates SVG <code>A</code> commands. Here&apos;s the format:
      </p>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">SVG Arc Syntax</h4>
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`A rx,ry rotation large-arc-flag sweep-flag x,y

Example: A25,25,0,0,1,175,100

Breakdown:
  rx = 25          // X radius
  ry = 25          // Y radius (same = circle)
  rotation = 0     // Ellipse rotation (0 for circles)
  large-arc = 0    // 0 = smaller arc, 1 = larger arc
  sweep = 1        // 0 = clockwise, 1 = counter-clockwise
  x = 175          // End point X
  y = 100          // End point Y`}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h4 className="font-semibold mb-2">Large Arc Flag</h4>
          <svg width="200" height="150" className="border rounded bg-white">
            <circle cx="60" cy="75" r="3" fill="#374151" />
            <circle cx="140" cy="75" r="3" fill="#374151" />

            {/* Small arc (large-arc=0) */}
            <path d="M60,75 A40,40,0,0,1,140,75" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <text x="100" y="50" textAnchor="middle" className="text-xs" fill="#3b82f6">large-arc=0</text>

            {/* Large arc (large-arc=1) */}
            <path d="M60,75 A40,40,0,1,1,140,75" fill="none" stroke="#ef4444" strokeWidth="2" />
            <text x="100" y="130" textAnchor="middle" className="text-xs" fill="#ef4444">large-arc=1</text>
          </svg>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Sweep Flag</h4>
          <svg width="200" height="150" className="border rounded bg-white">
            <circle cx="60" cy="75" r="3" fill="#374151" />
            <circle cx="140" cy="75" r="3" fill="#374151" />

            {/* Clockwise (sweep=0) - but we use counter-clockwise convention */}
            <path d="M60,75 A40,40,0,0,0,140,75" fill="none" stroke="#22c55e" strokeWidth="2" />
            <text x="100" y="50" textAnchor="middle" className="text-xs" fill="#22c55e">sweep=0 (CW)</text>

            {/* Counter-clockwise (sweep=1) */}
            <path d="M60,75 A40,40,0,0,1,140,75" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x="100" y="130" textAnchor="middle" className="text-xs" fill="#f59e0b">sweep=1 (CCW)</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

function Step10_FinalStructure() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-600">Step 10: Final BlockResult Structure</h3>
      <p className="text-gray-700">
        The complete pill data is returned as part of a <code>BlockResult</code> object.
      </p>

      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`interface BlockResult {
  id: number;           // Block index
  time: string;         // Timestamp label (e.g., "2020")
  outline: {
    left: string;       // Left arc SVG path
    right: string;      // Right arc SVG path
    top: string;        // Top horizontal line
    bottom: string;     // Bottom horizontal line
    button: {           // Expand/collapse button
      width: number;
      height: number;
      posX: number;
      posY: number;
    }
  };
  names: string[];      // Entity names in this block
  relations: [number, number][];  // Links between entities
  points: PointResult[]; // Node positions and metadata
  moveX: number;        // Width of the pill
  topPosY: number;      // Top Y coordinate
}

// PointResult for each node inside the pill:
interface PointResult {
  id: number;
  posX: number;
  posY: number;
  name: string;
  label?: string;       // Color/citation info
  scaleX?: number;      // PCA layout X
  scaleY?: number;      // PCA layout Y
}`}
        </pre>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-800 mb-2">Key Takeaways for Adding Features</h4>
        <ul className="text-green-700 text-sm space-y-1">
          <li>Modify <code>computeBlock()</code> to change pill shape</li>
          <li>Add properties to <code>BlockResult</code> for new data</li>
          <li>The <code>points</code> array contains all node info for interactions</li>
          <li>Use the <code>Path</code> class to generate SVG paths</li>
          <li>The <code>hops</code> array controls the bulge structure</li>
        </ul>
      </div>
    </div>
  );
}

export default function PillPresentationPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Input Data', component: Step1_DataStructure },
    { title: 'Find Extents', component: Step2_FindExtents },
    { title: 'Group by Hops', component: Step3_GroupByHops },
    { title: 'Arc Angles', component: Step4_ArcAngles },
    { title: 'Left Arc', component: Step5_DrawLeftArc },
    { title: 'Right Arc', component: Step6_DrawRightArc },
    { title: 'Complete Pill', component: Step7_CompletePill },
    { title: 'Pill with Bulges', component: Step8_PillWithBulges },
    { title: 'SVG Arc Command', component: Step9_SVGArcCommand },
    { title: 'Final Structure', component: Step10_FinalStructure },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">SpreadLine Pill Rendering</h1>
          <p className="text-gray-600">Interactive step-by-step visualization</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex gap-1 overflow-x-auto">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`px-3 py-2 text-sm rounded whitespace-nowrap transition-colors ${
                  currentStep === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {idx + 1}. {step.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CurrentStepComponent />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>

          <span className="text-gray-600 self-center">
            Step {currentStep + 1} of {steps.length}
          </span>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className={`px-4 py-2 rounded ${
              currentStep === steps.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        <p>
          Source: <code>lib/spreadline/render.ts</code> - <code>computeBlock()</code> function
        </p>
        <p className="mt-1">
          Path class: <code>lib/spreadline/types.ts</code>
        </p>
      </div>
    </div>
  );
}

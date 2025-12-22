"use client";

import { useState, useEffect, useRef } from "react";

// ============================================
// 1. FILTER CONTROLS SECTION
// ============================================
function FilterControlsExplanation() {
  const [sliderValue, setSliderValue] = useState(1);
  const [crossingChecked, setCrossingChecked] = useState(false);

  // Sample storylines data
  const storylines = [
    { name: "Jeffrey Heer", lifespan: 23, crossingCheck: true, isEgo: true, color: "#146b6b" },
    { name: "Ed H. Chi", lifespan: 18, crossingCheck: true, isEgo: false, color: "#FA9902" },
    { name: "Tamara Munzner", lifespan: 15, crossingCheck: true, isEgo: false, color: "#146b6b" },
    { name: "Ben Shneiderman", lifespan: 12, crossingCheck: false, isEgo: false, color: "#FA9902" },
    { name: "Mary Czerwinski", lifespan: 8, crossingCheck: true, isEgo: false, color: "#146b6b" },
    { name: "John Smith", lifespan: 5, crossingCheck: false, isEgo: false, color: "#FA9902" },
    { name: "Alice Brown", lifespan: 3, crossingCheck: false, isEgo: false, color: "#146b6b" },
    { name: "Bob Wilson", lifespan: 2, crossingCheck: true, isEgo: false, color: "#FA9902" },
  ];

  const filteredStorylines = storylines.filter(s => {
    if (s.isEgo) return true;
    const passLifespan = s.lifespan >= sliderValue;
    const passCrossing = !crossingChecked || s.crossingCheck;
    return passLifespan && passCrossing;
  });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Interactive Demo */}
        <div className="bg-gray-900 p-6 rounded-xl">
          <h4 className="text-lg font-bold text-white mb-4">Try It Yourself</h4>

          {/* Slider Control */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 block mb-2">
              Lifespan Filter (Years): <span className="text-yellow-400 font-bold">{sliderValue}</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>Show entities active for at least {sliderValue} years</span>
              <span>20</span>
            </div>
          </div>

          {/* Checkbox Control */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={crossingChecked}
                onChange={(e) => setCrossingChecked(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-gray-300">Show only crossing entities</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              Entities whose paths cross the ego line (moved between External/Internal)
            </p>
          </div>

          {/* Results */}
          <div className="border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400 mb-2">
              Showing <span className="text-green-400 font-bold">{filteredStorylines.length}</span> of {storylines.length} entities
            </p>
          </div>
        </div>

        {/* Visual Result */}
        <div className="bg-gray-900 p-6 rounded-xl">
          <h4 className="text-lg font-bold text-white mb-4">Filtered Storylines</h4>
          <svg viewBox="0 0 300 250" className="w-full">
            {/* Y-axis labels */}
            <text x="10" y="60" fill="#888" fontSize="10" opacity="0.5">External</text>
            <text x="10" y="200" fill="#888" fontSize="10" opacity="0.5">Internal</text>

            {/* Ego line (always visible) */}
            <line x1="50" y1="130" x2="280" y2="130" stroke="#146b6b" strokeWidth="4" />
            <text x="285" y="134" fill="#146b6b" fontSize="9">Ego</text>

            {/* Sample storylines */}
            {storylines.map((s, i) => {
              if (s.isEgo) return null;
              const isVisible = filteredStorylines.includes(s);
              const yBase = s.crossingCheck ? (i % 2 === 0 ? 80 : 180) : (i < 4 ? 70 : 190);
              const yEnd = s.crossingCheck ? (i % 2 === 0 ? 180 : 80) : yBase;

              return (
                <g key={s.name} opacity={isVisible ? 1 : 0.1}>
                  <path
                    d={`M50,${yBase} C150,${yBase} 150,${yEnd} 280,${yEnd}`}
                    stroke={s.color}
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="50" cy={yBase} r="4" fill={s.color} />
                  <circle cx="280" cy={yEnd} r="4" fill={s.color} />
                  {isVisible && (
                    <text x="282" y={yEnd + 4} fill={s.color} fontSize="7">{s.name.split(' ')[0]}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Explanation Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-950 border border-blue-800 p-4 rounded-lg">
          <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Lifespan Slider
          </h5>
          <p className="text-gray-300 text-sm mb-2">
            <strong>What it does:</strong> Filters entities by how many time periods they appear in.
          </p>
          <p className="text-gray-400 text-sm">
            <strong>When to use:</strong> When the visualization is too cluttered and you want to focus on
            the most persistent/important collaborators who worked with the ego over many years.
          </p>
        </div>

        <div className="bg-green-950 border border-green-800 p-4 rounded-lg">
          <h5 className="font-bold text-green-400 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Crossing Checkbox
          </h5>
          <p className="text-gray-300 text-sm mb-2">
            <strong>What it does:</strong> Shows only entities whose lines cross the ego&apos;s horizontal line.
          </p>
          <p className="text-gray-400 text-sm">
            <strong>When to use:</strong> To find collaborators who transitioned between &quot;External&quot; (outside ego&apos;s
            organization) and &quot;Internal&quot; (same organization as ego) - showing career movements.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 2. SVG DOM STRUCTURE WITH VISUAL EXAMPLES
// ============================================
function SVGDOMStructureVisual() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const elements = [
    {
      id: "direction",
      label: "Direction Labels",
      color: "#8b5cf6",
      description: "Large watermark text showing 'External' and 'Internal' zones",
    },
    {
      id: "time",
      label: "Time Axis",
      color: "#3b82f6",
      description: "Year labels at the top with vertical dashed guide lines",
    },
    {
      id: "annotation",
      label: "Event Annotations",
      color: "#ef4444",
      description: "Career milestones like 'UC Berkeley', 'Stanford University' marked at specific years",
    },
    {
      id: "storyline",
      label: "Storylines",
      color: "#10b981",
      description: "Colored paths showing entity trajectories with triangle endpoints",
    },
    {
      id: "block",
      label: "Blocks (Pills)",
      color: "#f59e0b",
      description: "Pill-shaped containers at each timestep containing entity circles",
    },
    {
      id: "label",
      label: "Entity Labels",
      color: "#ec4899",
      description: "Names shown at the end of storylines or inline along paths",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive SVG with highlighted regions */}
      <div className="bg-gray-900 p-4 rounded-xl">
        <svg viewBox="0 0 800 400" className="w-full">
          {/* Background */}
          <rect x="0" y="0" width="800" height="400" fill="#0f172a" />

          {/* Direction Labels */}
          <g opacity={selectedElement === "direction" || !selectedElement ? 1 : 0.2}>
            <text x="30" y="120" fill="#6b7280" fontSize="40" fontWeight="bold" opacity="0.3">External</text>
            <text x="30" y="320" fill="#6b7280" fontSize="40" fontWeight="bold" opacity="0.3">Internal</text>
            {selectedElement === "direction" && (
              <rect x="20" y="80" width="200" height="260" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="8" rx="8" />
            )}
          </g>

          {/* Time Axis */}
          <g opacity={selectedElement === "time" || !selectedElement ? 1 : 0.2}>
            {[2002, 2004, 2006, 2008, 2010, 2012].map((year, i) => (
              <g key={year}>
                <text x={150 + i * 110} y="45" fill="#94a3b8" fontSize="12" textAnchor="middle">{year}</text>
                <line x1={150 + i * 110} y1="55" x2={150 + i * 110} y2="380" stroke="#475569" strokeWidth="1" strokeDasharray="4" opacity="0.4" />
              </g>
            ))}
            {selectedElement === "time" && (
              <rect x="130" y="25" width="570" height="35" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="8" rx="8" />
            )}
          </g>

          {/* Event Annotations */}
          <g opacity={selectedElement === "annotation" || !selectedElement ? 1 : 0.2}>
            <text x="150" y="75" fill="#ef4444" fontSize="10" textAnchor="middle">Xerox Research</text>
            <text x="260" y="75" fill="#ef4444" fontSize="10" textAnchor="middle">UC Berkeley</text>
            <text x="480" y="75" fill="#ef4444" fontSize="10" textAnchor="middle">Stanford</text>
            {selectedElement === "annotation" && (
              <>
                <circle cx="150" cy="75" r="35" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8" />
                <circle cx="260" cy="75" r="35" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8" />
                <circle cx="480" cy="75" r="30" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8" />
              </>
            )}
          </g>

          {/* Storylines */}
          <g opacity={selectedElement === "storyline" || !selectedElement ? 1 : 0.2}>
            {/* Ego line */}
            <path d="M150,220 L700,220" stroke="#146b6b" strokeWidth="5" fill="none" />
            {/* Triangle markers */}
            <polygon points="145,220 155,215 155,225" fill="#146b6b" />
            <polygon points="705,220 695,215 695,225" fill="#146b6b" />

            {/* Alter lines */}
            <path d="M150,140 C250,140 300,280 400,280 C500,280 550,160 700,160" stroke="#FA9902" strokeWidth="2" fill="none" />
            <polygon points="145,140 155,135 155,145" fill="#FA9902" />

            <path d="M260,300 C350,300 400,180 500,180 C600,180 650,250 700,250" stroke="#146b6b" strokeWidth="2" fill="none" />
            <polygon points="255,300 265,295 265,305" fill="#146b6b" />

            {selectedElement === "storyline" && (
              <rect x="140" y="130" width="580" height="180" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8" rx="8" />
            )}
          </g>

          {/* Blocks */}
          <g opacity={selectedElement === "block" || !selectedElement ? 1 : 0.2}>
            {[150, 260, 370, 480, 590, 700].map((x, i) => (
              <g key={x}>
                {/* Pill shape */}
                <rect x={x-15} y="130" width="30" height="180" rx="15" fill="none" stroke="#64748b" strokeWidth="2" />
                {/* Points inside */}
                <circle cx={x} cy={150 + i * 5} r="5" fill="#fcdaca" />
                <circle cx={x} cy={180 + (i % 3) * 10} r="5" fill="#e599a6" />
                <circle cx={x} cy={220} r="7" fill="#146b6b" />
                <circle cx={x} cy={260 - (i % 2) * 15} r="5" fill="#c94b77" />
                <circle cx={x} cy={290} r="5" fill="#fcdaca" />
              </g>
            ))}
            {selectedElement === "block" && (
              <rect x="130" y="120" width="600" height="200" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8" rx="8" />
            )}
          </g>

          {/* Labels */}
          <g opacity={selectedElement === "label" || !selectedElement ? 1 : 0.2}>
            <text x="720" y="224" fill="#146b6b" fontSize="11" fontWeight="bold">Jeffrey Heer</text>
            <text x="720" y="164" fill="#FA9902" fontSize="10">Ed H. Chi</text>
            <text x="720" y="254" fill="#146b6b" fontSize="10">Tamara Munzner</text>
            {/* Inline label */}
            <text x="400" y="270" fill="#146b6b" fontSize="9" textAnchor="middle">Ben S.</text>

            {selectedElement === "label" && (
              <rect x="710" y="150" width="85" height="120" fill="none" stroke="#ec4899" strokeWidth="3" strokeDasharray="8" rx="8" />
            )}
          </g>
        </svg>
      </div>

      {/* Element Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {elements.map((el) => (
          <button
            key={el.id}
            onClick={() => setSelectedElement(selectedElement === el.id ? null : el.id)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedElement === el.id
                ? `border-[${el.color}] bg-gray-800`
                : "border-gray-700 bg-gray-900 hover:border-gray-500"
            }`}
            style={{ borderColor: selectedElement === el.id ? el.color : undefined }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: el.color }} />
              <span className="font-semibold text-sm text-white">{el.label}</span>
            </div>
            <p className="text-xs text-gray-400">{el.description}</p>
          </button>
        ))}
      </div>

      {/* Screenshot Reference */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-400">
          <strong className="text-white">Tip:</strong> Compare this with the actual visualization.
          Each element type is rendered in a specific &lt;g&gt; container in the SVG, making it easy to
          style and animate independently.
        </p>
      </div>
    </div>
  );
}

// ============================================
// 3. INTERACTIVE DATA STRUCTURE EXPLORER
// ============================================
function DataStructureExplorer() {
  const [bandWidth, setBandWidth] = useState(100);
  const [blockWidth, setBlockWidth] = useState(40);
  const [heightExtents, setHeightExtents] = useState<[number, number]>([100, 300]);

  const timeLabels = ["2002", "2003", "2004", "2005", "2006"];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <label className="text-sm text-gray-400 block mb-2">
            bandWidth: <span className="text-blue-400 font-bold">{bandWidth}px</span>
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={bandWidth}
            onChange={(e) => setBandWidth(parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-2">Distance between time labels (horizontal spacing)</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <label className="text-sm text-gray-400 block mb-2">
            blockWidth: <span className="text-green-400 font-bold">{blockWidth}px</span>
          </label>
          <input
            type="range"
            min="20"
            max="80"
            value={blockWidth}
            onChange={(e) => setBlockWidth(parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-2">Width of pill-shaped blocks at each timestep</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <label className="text-sm text-gray-400 block mb-2">
            heightExtents: <span className="text-yellow-400 font-bold">[{heightExtents[0]}, {heightExtents[1]}]</span>
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min="50"
              max="150"
              value={heightExtents[0]}
              onChange={(e) => setHeightExtents([parseInt(e.target.value), heightExtents[1]])}
              className="w-1/2"
            />
            <input
              type="range"
              min="250"
              max="400"
              value={heightExtents[1]}
              onChange={(e) => setHeightExtents([heightExtents[0], parseInt(e.target.value)])}
              className="w-1/2"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Vertical bounds [minY, maxY] of visualization</p>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-gray-900 p-4 rounded-xl">
        <h4 className="text-sm font-bold text-white mb-4">Live Preview</h4>
        <svg viewBox="0 0 700 450" className="w-full bg-gray-950 rounded-lg">
          {/* Measurement annotations */}
          {/* bandWidth annotation */}
          <g>
            <line x1={100} y1="30" x2={100 + bandWidth} y2="30" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowBlue)" markerStart="url(#arrowBlueStart)" />
            <text x={100 + bandWidth/2} y="20" fill="#3b82f6" fontSize="10" textAnchor="middle">bandWidth: {bandWidth}px</text>
          </g>

          {/* heightExtents annotation */}
          <g>
            <line x1="30" y1={heightExtents[0]} x2="30" y2={heightExtents[1]} stroke="#eab308" strokeWidth="2" />
            <line x1="25" y1={heightExtents[0]} x2="35" y2={heightExtents[0]} stroke="#eab308" strokeWidth="2" />
            <line x1="25" y1={heightExtents[1]} x2="35" y2={heightExtents[1]} stroke="#eab308" strokeWidth="2" />
            <text x="40" y={(heightExtents[0] + heightExtents[1])/2} fill="#eab308" fontSize="9" transform={`rotate(-90, 40, ${(heightExtents[0] + heightExtents[1])/2})`} textAnchor="middle">
              heightExtents
            </text>
          </g>

          {/* Direction labels */}
          <text x="60" y={heightExtents[0] + 40} fill="#6b7280" fontSize="14" opacity="0.3">External</text>
          <text x="60" y={heightExtents[1] - 20} fill="#6b7280" fontSize="14" opacity="0.3">Internal</text>

          {/* Time labels and blocks */}
          {timeLabels.map((label, i) => {
            const x = 100 + i * bandWidth;
            const blockHeight = heightExtents[1] - heightExtents[0];

            return (
              <g key={label}>
                {/* Time label */}
                <text x={x} y="55" fill="#94a3b8" fontSize="11" textAnchor="middle">{label}</text>

                {/* Vertical guide line */}
                <line x1={x} y1="65" x2={x} y2={heightExtents[1] + 20} stroke="#475569" strokeWidth="1" strokeDasharray="4" opacity="0.3" />

                {/* Block (pill) */}
                <rect
                  x={x - blockWidth/2}
                  y={heightExtents[0]}
                  width={blockWidth}
                  height={blockHeight}
                  rx={blockWidth/2}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                />

                {/* blockWidth annotation for first block */}
                {i === 0 && (
                  <g>
                    <line x1={x - blockWidth/2} y1={heightExtents[1] + 30} x2={x + blockWidth/2} y2={heightExtents[1] + 30} stroke="#10b981" strokeWidth="2" />
                    <text x={x} y={heightExtents[1] + 45} fill="#10b981" fontSize="9" textAnchor="middle">blockWidth: {blockWidth}px</text>
                  </g>
                )}

                {/* Sample points */}
                <circle cx={x} cy={heightExtents[0] + 30} r="5" fill="#fcdaca" />
                <circle cx={x} cy={(heightExtents[0] + heightExtents[1])/2} r="7" fill="#146b6b" />
                <circle cx={x} cy={heightExtents[1] - 30} r="5" fill="#e599a6" />
              </g>
            );
          })}

          {/* Ego storyline */}
          <path
            d={`M${100},${(heightExtents[0] + heightExtents[1])/2} L${100 + (timeLabels.length-1) * bandWidth},${(heightExtents[0] + heightExtents[1])/2}`}
            stroke="#146b6b"
            strokeWidth="4"
            fill="none"
          />

          {/* Definitions for arrows */}
          <defs>
            <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
            </marker>
            <marker id="arrowBlueStart" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto">
              <path d="M9,0 L9,6 L0,3 z" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Impact Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-950 border border-blue-800 p-4 rounded-lg">
          <h5 className="font-bold text-blue-400 mb-2">bandWidth Impact</h5>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>Larger = more horizontal space</li>
            <li>Affects storyline curve smoothness</li>
            <li>Controls overall visualization width</li>
          </ul>
        </div>
        <div className="bg-green-950 border border-green-800 p-4 rounded-lg">
          <h5 className="font-bold text-green-400 mb-2">blockWidth Impact</h5>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>Larger = wider pill containers</li>
            <li>More room for entity circles</li>
            <li>Affects click target size</li>
          </ul>
        </div>
        <div className="bg-yellow-950 border border-yellow-800 p-4 rounded-lg">
          <h5 className="font-bold text-yellow-400 mb-2">heightExtents Impact</h5>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>Controls vertical visualization bounds</li>
            <li>[minY, maxY] from top to bottom</li>
            <li>Determines External/Internal zone sizes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. POINT CONTEXTUALIZATION EXPLANATION
// ============================================
function PointContextualizationVisual() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleX, setScaleX] = useState(0.5);
  const [scaleY, setScaleY] = useState(0.5);
  const moveX = 200;
  const whiteSpace = 0.15;

  // The actual formula from helpers.js
  const computeEmbedding = (scale: number, length: number) => {
    return (scale + whiteSpace / 2) * length * (1 - whiteSpace);
  };

  const computedX = computeEmbedding(scaleX, moveX);
  const computedY = computeEmbedding(scaleY, moveX);

  const points = [
    { name: "Jeffrey Heer", scaleX: 0.52, scaleY: 0.58, color: "#146b6b", isEgo: true },
    { name: "Ed H. Chi", scaleX: 0.79, scaleY: 0.65, color: "#FA9902", isEgo: false },
    { name: "Tamara Munzner", scaleX: 0.19, scaleY: 0.0, color: "#146b6b", isEgo: false },
    { name: "James Landay", scaleX: 0.51, scaleY: 0.32, color: "#FA9902", isEgo: false },
  ];

  return (
    <div className="space-y-6">
      {/* What is Point Contextualization */}
      <div className="bg-gradient-to-r from-purple-950 to-blue-950 p-6 rounded-xl border border-purple-800">
        <h4 className="text-xl font-bold text-white mb-3">What is Point Contextualization?</h4>
        <p className="text-gray-300 mb-4">
          When you click a block to expand it, the circles inside need to spread out to show relationships.
          <strong className="text-purple-400"> Point Contextualization</strong> is the process of calculating
          where each circle should move based on <strong className="text-blue-400">PCA coordinates</strong> (scaleX, scaleY).
        </p>
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-sm font-mono text-green-400">
            // The magic formula from helpers.js<br/>
            const whiteSpace = 0.15;<br/>
            position = (scale + whiteSpace/2) * moveX * (1 - whiteSpace);
          </p>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before/After Visualization */}
        <div className="bg-gray-900 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-white">Block State</h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isExpanded
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {isExpanded ? "Expanded" : "Collapsed"} - Click to Toggle
            </button>
          </div>

          <svg viewBox="0 0 350 250" className="w-full">
            {/* Block outline */}
            <rect
              x={isExpanded ? 30 : 130}
              y="30"
              width={isExpanded ? 290 : 90}
              height="190"
              rx={isExpanded ? 20 : 45}
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              className="transition-all duration-500"
            />

            {/* Points */}
            {points.map((p, i) => {
              const collapsedY = 60 + i * 40;
              const expandedX = 45 + computeEmbedding(p.scaleX, moveX);
              const expandedY = 45 + computeEmbedding(p.scaleY, 160);

              return (
                <g key={p.name}>
                  <circle
                    cx={isExpanded ? expandedX : 175}
                    cy={isExpanded ? expandedY : collapsedY}
                    r={p.isEgo ? 10 : 7}
                    fill={p.color}
                    className="transition-all duration-500"
                  />
                  {isExpanded && (
                    <text
                      x={expandedX + 12}
                      y={expandedY + 4}
                      fill={p.color}
                      fontSize="9"
                      className="transition-opacity duration-500"
                    >
                      {p.name.split(' ')[0]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Labels */}
            <text x="175" y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">
              {isExpanded ? "Points spread based on PCA values" : "Points stacked vertically"}
            </text>
          </svg>
        </div>

        {/* Formula Explorer */}
        <div className="bg-gray-900 p-4 rounded-xl">
          <h4 className="font-bold text-white mb-4">Try the Formula</h4>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm text-gray-400">scaleX (PCA X): <span className="text-blue-400">{scaleX.toFixed(2)}</span></label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={scaleX}
                onChange={(e) => setScaleX(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">scaleY (PCA Y): <span className="text-green-400">{scaleY.toFixed(2)}</span></label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={scaleY}
                onChange={(e) => setScaleY(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-400 mb-2">Computed positions (moveX = {moveX}px):</p>
            <p className="font-mono">
              <span className="text-blue-400">X = {computedX.toFixed(1)}px</span>
              <span className="text-gray-500 mx-2">|</span>
              <span className="text-green-400">Y = {computedY.toFixed(1)}px</span>
            </p>
          </div>

          <svg viewBox="0 0 220 220" className="w-full bg-gray-800 rounded-lg">
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <g key={v}>
                <line x1={10 + v * 200} y1="10" x2={10 + v * 200} y2="210" stroke="#374151" strokeWidth="1" />
                <line x1="10" y1={10 + v * 200} x2="210" y2={10 + v * 200} stroke="#374151" strokeWidth="1" />
              </g>
            ))}

            {/* Axes labels */}
            <text x="110" y="225" fill="#94a3b8" fontSize="10" textAnchor="middle">scaleX</text>
            <text x="5" y="110" fill="#94a3b8" fontSize="10" textAnchor="middle" transform="rotate(-90, 5, 110)">scaleY</text>

            {/* Current position */}
            <circle
              cx={10 + computedX}
              cy={10 + computedY}
              r="8"
              fill="#8b5cf6"
              stroke="white"
              strokeWidth="2"
            />

            {/* Guide lines */}
            <line x1={10 + computedX} y1="10" x2={10 + computedX} y2={10 + computedY} stroke="#8b5cf6" strokeDasharray="4" />
            <line x1="10" y1={10 + computedY} x2={10 + computedX} y2={10 + computedY} stroke="#8b5cf6" strokeDasharray="4" />
          </svg>
        </div>
      </div>

      {/* Why PCA? */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h5 className="font-bold text-white mb-2">Why use PCA values?</h5>
        <p className="text-sm text-gray-300">
          The backend runs <strong className="text-purple-400">Principal Component Analysis</strong> on entity attributes
          (like citation counts, publication years). This creates 2D coordinates (scaleX, scaleY) that cluster similar
          entities together. When you expand a block, entities with similar characteristics appear near each other!
        </p>
      </div>
    </div>
  );
}

// ============================================
// 5. INTERACTION SEQUENCES - ANIMATED FLOW
// ============================================
function InteractionSequencesVisual() {
  const [activeStep, setActiveStep] = useState(0);
  const [scenario, setScenario] = useState<"hover" | "click" | "expand">("hover");

  const scenarios = {
    hover: {
      title: "Storyline Hover",
      description: "What happens when you hover over a storyline",
      steps: [
        { actor: "You", action: "Move mouse over a storyline", visual: "cursor" },
        { actor: "Browser", action: "Fires 'mouseover' event", visual: "event" },
        { actor: "Visualizer", action: "Calls _lineHover(event, data)", visual: "code" },
        { actor: "D3", action: "Adds 'storyline-hover' class (thicker line)", visual: "style" },
        { actor: "D3", action: "ENTITY_SELECTION() highlights related blocks", visual: "highlight" },
        { actor: "D3", action: "_massHoverExecution() fades other elements", visual: "fade" },
      ],
    },
    click: {
      title: "Storyline Pin",
      description: "What happens when you click a storyline to pin it",
      steps: [
        { actor: "You", action: "Click on a storyline", visual: "cursor" },
        { actor: "Browser", action: "Fires 'click' event", visual: "event" },
        { actor: "Visualizer", action: "Calls _linePin(data)", visual: "code" },
        { actor: "DOM", action: "Toggles 'pin' attribute (0 ↔ 1)", visual: "attr" },
        { actor: "State", action: "Updates this.members.pinned array", visual: "state" },
        { actor: "Effect", action: "Highlight persists after mouseout", visual: "persist" },
      ],
    },
    expand: {
      title: "Block Expansion",
      description: "What happens when you click a block to expand it",
      steps: [
        { actor: "You", action: "Click on a pill-shaped block", visual: "cursor" },
        { actor: "Visualizer", action: "_blockUpdate() toggles 'active' attribute", visual: "code" },
        { actor: "Expander", action: "new Expander() created, calls act()", visual: "create" },
        { actor: "Animation", action: "All .movable elements shift right by moveX", visual: "shift" },
        { actor: "D3", action: "_fillDummyLines() extends storylines", visual: "extend" },
        { actor: "D3", action: "_expandBlock() shows horizontal bars", visual: "bars" },
        { actor: "D3", action: "_contextualize() repositions points using PCA", visual: "pca" },
        { actor: "D3", action: "_drawLinks() adds relationship arcs", visual: "links" },
      ],
    },
  };

  const currentScenario = scenarios[scenario];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % currentScenario.steps.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [scenario, currentScenario.steps.length]);

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="flex gap-3 flex-wrap">
        {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
          <button
            key={key}
            onClick={() => { setScenario(key); setActiveStep(0); }}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              scenario === key
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {scenarios[key].title}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Animated Flow */}
        <div className="bg-gray-900 p-6 rounded-xl">
          <h4 className="font-bold text-white mb-2">{currentScenario.title}</h4>
          <p className="text-gray-400 text-sm mb-6">{currentScenario.description}</p>

          <div className="space-y-3">
            {currentScenario.steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  i === activeStep
                    ? "bg-purple-900 border border-purple-500"
                    : i < activeStep
                    ? "bg-gray-800 opacity-50"
                    : "bg-gray-800 opacity-30"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === activeStep ? "bg-purple-500 text-white" : "bg-gray-700 text-gray-400"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">{step.actor}</p>
                  <p className={`text-sm ${i === activeStep ? "text-white font-semibold" : "text-gray-400"}`}>
                    {step.action}
                  </p>
                </div>
                {i === activeStep && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visual Representation */}
        <div className="bg-gray-900 p-6 rounded-xl">
          <h4 className="font-bold text-white mb-4">Visual State</h4>
          <svg viewBox="0 0 300 200" className="w-full bg-gray-950 rounded-lg">
            {/* Base visualization */}
            <rect x="20" y="20" width="260" height="160" fill="#1e293b" rx="8" />

            {/* Ego line */}
            <path d="M40,100 L260,100" stroke="#146b6b" strokeWidth="4" />

            {/* Sample storyline */}
            <path
              d="M40,60 C100,60 150,140 260,140"
              stroke="#FA9902"
              strokeWidth={scenario === "hover" && activeStep >= 3 ? 4 : 2}
              fill="none"
              opacity={scenario === "hover" && activeStep >= 5 ? 1 : 0.3}
              className="transition-all duration-300"
            />

            {/* Block */}
            <g>
              <rect
                x={scenario === "expand" && activeStep >= 3 ? 100 : 140}
                y="50"
                width={scenario === "expand" && activeStep >= 3 ? 100 : 40}
                height="100"
                rx={scenario === "expand" && activeStep >= 3 ? 10 : 20}
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                className="transition-all duration-500"
              />

              {/* Points inside */}
              <circle
                cx={scenario === "expand" && activeStep >= 6 ? 130 : 160}
                cy={scenario === "expand" && activeStep >= 6 ? 70 : 70}
                r="6"
                fill="#fcdaca"
                className="transition-all duration-500"
              />
              <circle
                cx={scenario === "expand" && activeStep >= 6 ? 170 : 160}
                cy={scenario === "expand" && activeStep >= 6 ? 110 : 100}
                r="8"
                fill="#146b6b"
                className="transition-all duration-500"
              />
              <circle
                cx={scenario === "expand" && activeStep >= 6 ? 140 : 160}
                cy={scenario === "expand" && activeStep >= 6 ? 140 : 130}
                r="6"
                fill="#e599a6"
                className="transition-all duration-500"
              />

              {/* Relationship arc */}
              {scenario === "expand" && activeStep >= 7 && (
                <path
                  d="M130,70 Q150,90 170,110"
                  stroke="#424242"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd="url(#arrowGray)"
                />
              )}
            </g>

            {/* Pin indicator */}
            {scenario === "click" && activeStep >= 4 && (
              <circle cx="260" cy="140" r="5" fill="#ec4899" />
            )}

            <defs>
              <marker id="arrowGray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#424242" />
              </marker>
            </defs>
          </svg>

          <p className="text-center text-sm text-gray-400 mt-4">
            Step {activeStep + 1} of {currentScenario.steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. STATE MANAGEMENT VISUAL
// ============================================
function StateManagementVisual() {
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const stateCategories = [
    {
      id: "instance",
      title: "Instance State",
      color: "#3b82f6",
      location: "SpreadLinesVisualizer class",
      items: [
        { key: "this.visibility", value: "{ 'Ed Chi': true, ... }", desc: "Which entities are visible" },
        { key: "this.members.slider", value: "['Ed Chi', ...]", desc: "Filtered by lifespan slider" },
        { key: "this.members.crossing", value: "['Tamara', ...]", desc: "Filtered by crossing checkbox" },
        { key: "this.members.pinned", value: "['James', ...]", desc: "User-pinned entities" },
        { key: "this.actors", value: "{ 0: Expander, ... }", desc: "Active expander instances by block ID" },
        { key: "this.brushComponent", value: "{ brush, brushedBlocks, ... }", desc: "D3 brush state" },
      ],
    },
    {
      id: "dom",
      title: "DOM Attributes",
      color: "#10b981",
      location: "SVG element attributes",
      items: [
        { key: "pin", value: "\"0\" or \"1\"", desc: "On label elements - is entity pinned?" },
        { key: "active", value: "\"0\" or \"1\"", desc: "On left-arc elements - is block expanded?" },
        { key: "transform", value: "\"translate(X, Y)\"", desc: "Current position offset" },
        { key: "embX", value: "\"123.45\"", desc: "Expanded X position (for collapse revert)" },
        { key: "groupID", value: "\"0\"", desc: "Which block this element belongs to" },
      ],
    },
    {
      id: "css",
      title: "CSS Classes (State)",
      color: "#f59e0b",
      location: "Applied dynamically via D3",
      items: [
        { key: ".storyline-hover", value: "stroke-width: 4", desc: "Currently hovered line" },
        { key: ".storyline-dehighlight", value: "opacity: 0.1", desc: "Faded non-focused elements" },
        { key: ".storyline-label-dehighlight", value: "opacity: 0", desc: "Hidden labels" },
        { key: ".storyline-arc-dehighlight", value: "opacity: 0.1", desc: "Faded blocks" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Diagram */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h4 className="font-bold text-white mb-4">State Flow Overview</h4>
        <svg viewBox="0 0 700 250" className="w-full">
          {/* User Action */}
          <g>
            <rect x="20" y="100" width="100" height="50" rx="8" fill="#6366f1" />
            <text x="70" y="130" fill="white" fontSize="12" textAnchor="middle">User Action</text>
          </g>

          {/* Arrow 1 */}
          <path d="M125,125 L175,125" stroke="#64748b" strokeWidth="2" markerEnd="url(#flowArrow)" />

          {/* Event Handler */}
          <g>
            <rect x="180" y="100" width="120" height="50" rx="8" fill="#8b5cf6" />
            <text x="240" y="125" fill="white" fontSize="11" textAnchor="middle">Event Handler</text>
            <text x="240" y="140" fill="#c4b5fd" fontSize="9" textAnchor="middle">(_lineHover, etc)</text>
          </g>

          {/* Arrow 2 - splits */}
          <path d="M305,110 L355,70" stroke="#64748b" strokeWidth="2" markerEnd="url(#flowArrow)" />
          <path d="M305,125 L355,125" stroke="#64748b" strokeWidth="2" markerEnd="url(#flowArrow)" />
          <path d="M305,140 L355,180" stroke="#64748b" strokeWidth="2" markerEnd="url(#flowArrow)" />

          {/* Instance State */}
          <g onClick={() => setShowDetail(showDetail === "instance" ? null : "instance")} className="cursor-pointer">
            <rect x="360" y="45" width="130" height="50" rx="8" fill="#3b82f6" stroke={showDetail === "instance" ? "white" : "none"} strokeWidth="2" />
            <text x="425" y="70" fill="white" fontSize="11" textAnchor="middle">Instance State</text>
            <text x="425" y="85" fill="#93c5fd" fontSize="9" textAnchor="middle">this.members, etc</text>
          </g>

          {/* DOM Attributes */}
          <g onClick={() => setShowDetail(showDetail === "dom" ? null : "dom")} className="cursor-pointer">
            <rect x="360" y="100" width="130" height="50" rx="8" fill="#10b981" stroke={showDetail === "dom" ? "white" : "none"} strokeWidth="2" />
            <text x="425" y="125" fill="white" fontSize="11" textAnchor="middle">DOM Attributes</text>
            <text x="425" y="140" fill="#6ee7b7" fontSize="9" textAnchor="middle">pin, active, etc</text>
          </g>

          {/* CSS Classes */}
          <g onClick={() => setShowDetail(showDetail === "css" ? null : "css")} className="cursor-pointer">
            <rect x="360" y="155" width="130" height="50" rx="8" fill="#f59e0b" stroke={showDetail === "css" ? "white" : "none"} strokeWidth="2" />
            <text x="425" y="180" fill="white" fontSize="11" textAnchor="middle">CSS Classes</text>
            <text x="425" y="195" fill="#fcd34d" fontSize="9" textAnchor="middle">.storyline-hover</text>
          </g>

          {/* Converge arrows */}
          <path d="M495,70 L545,110" stroke="#64748b" strokeWidth="2" markerEnd="url(#flowArrow)" />
          <path d="M495,125 L545,125" stroke="#64748b" strokeWidth="2" markerEnd="url(#flowArrow)" />
          <path d="M495,180 L545,140" stroke="#64748b" strokeWidth="2" markerEnd="url(#flowArrow)" />

          {/* Visual Update */}
          <g>
            <rect x="550" y="100" width="130" height="50" rx="8" fill="#ec4899" />
            <text x="615" y="125" fill="white" fontSize="11" textAnchor="middle">Visual Update</text>
            <text x="615" y="140" fill="#fbcfe8" fontSize="9" textAnchor="middle">D3 transitions</text>
          </g>

          <defs>
            <marker id="flowArrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Click hint */}
          <text x="425" y="230" fill="#64748b" fontSize="10" textAnchor="middle">Click a box for details</text>
        </svg>
      </div>

      {/* Detail Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {stateCategories.map((cat) => (
          <div
            key={cat.id}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              showDetail === cat.id
                ? `border-[${cat.color}] bg-gray-800`
                : "border-gray-700 bg-gray-900 hover:border-gray-500"
            }`}
            style={{ borderColor: showDetail === cat.id ? cat.color : undefined }}
            onClick={() => setShowDetail(showDetail === cat.id ? null : cat.id)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <h5 className="font-bold text-white">{cat.title}</h5>
            </div>
            <p className="text-xs text-gray-400 mb-3">{cat.location}</p>

            {showDetail === cat.id && (
              <div className="space-y-2 mt-4 pt-4 border-t border-gray-700">
                {cat.items.map((item, i) => (
                  <div key={i} className="text-xs">
                    <code className="text-yellow-400">{item.key}</code>
                    <span className="text-gray-500"> = </span>
                    <code className="text-green-400">{item.value}</code>
                    <p className="text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key Insight */}
      <div className="bg-gradient-to-r from-blue-950 to-purple-950 p-4 rounded-lg border border-blue-800">
        <h5 className="font-bold text-white mb-2">Key Insight: Hybrid State Management</h5>
        <p className="text-sm text-gray-300">
          SpreadLine uses a <strong className="text-blue-400">hybrid approach</strong>: JavaScript instance variables
          for complex state (arrays, objects), DOM attributes for element-specific state (pin, active),
          and CSS classes for visual state (hover, dehighlight). This avoids a central state store but
          requires careful coordination.
        </p>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function DesignV2Page() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: "filters", title: "1. Filter Controls (Slider & Checkbox)", component: FilterControlsExplanation },
    { id: "svg", title: "2. SVG DOM Structure", component: SVGDOMStructureVisual },
    { id: "data", title: "3. Data Structure Explorer", component: DataStructureExplorer },
    { id: "context", title: "4. Point Contextualization", component: PointContextualizationVisual },
    { id: "interactions", title: "5. Interaction Sequences", component: InteractionSequencesVisual },
    { id: "state", title: "6. State Management", component: StateManagementVisual },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-blue-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">SpreadLine Design Document v2</h1>
          <p className="text-purple-200">Interactive visual guide to understanding the SpreadLine visualization</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 bg-gray-900 border-b border-gray-800 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                {section.title.split('.')[0]}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <div className="bg-gray-900 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">
                {section.title}
              </h2>
              <section.component />
            </div>
          </section>
        ))}

        {/* Footer */}
        <footer className="text-center py-8 text-gray-500 text-sm">
          <p>SpreadLine: Visualizing Egocentric Dynamic Influence</p>
          <p className="mt-1">Interactive design document v2 - Created for visual learners</p>
        </footer>
      </main>
    </div>
  );
}

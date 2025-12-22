"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useState } from "react";

// Architecture Diagram Component
function ArchitectureDiagram() {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const components = [
    { id: "interface", x: 50, y: 30, w: 120, h: 50, label: "interface.js", desc: "Entry point, fetches data, creates visualizer" },
    { id: "visualizer", x: 200, y: 30, w: 140, h: 50, label: "visualizer.js", desc: "SpreadLinesVisualizer class - orchestrates all rendering" },
    { id: "expander", x: 370, y: 30, w: 110, h: 50, label: "expander.js", desc: "Handles block expansion animations" },
    { id: "collapser", x: 510, y: 30, w: 110, h: 50, label: "collapser.js", desc: "Handles block collapse animations" },
    { id: "helpers", x: 650, y: 30, w: 100, h: 50, label: "helpers.js", desc: "Utility functions for SVG paths, text width" },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 800 120" className="w-full min-w-[600px]">
        {/* Connections */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
        </defs>

        {/* interface -> visualizer */}
        <line x1="170" y1="55" x2="195" y2="55" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        {/* visualizer -> expander */}
        <line x1="340" y1="55" x2="365" y2="55" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        {/* visualizer -> collapser */}
        <path d="M340,65 Q400,95 505,65" fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        {/* expander -> helpers */}
        <line x1="480" y1="45" x2="645" y2="45" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" markerEnd="url(#arrowhead)" />
        {/* collapser -> helpers */}
        <line x1="620" y1="55" x2="645" y2="55" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" markerEnd="url(#arrowhead)" />
        {/* visualizer -> helpers */}
        <path d="M340,35 Q500,5 645,35" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" markerEnd="url(#arrowhead)" />

        {/* Component boxes */}
        {components.map((c) => (
          <g
            key={c.id}
            onMouseEnter={() => setHoveredComponent(c.id)}
            onMouseLeave={() => setHoveredComponent(null)}
            className="cursor-pointer"
          >
            <rect
              x={c.x}
              y={c.y}
              width={c.w}
              height={c.h}
              rx="6"
              fill={hoveredComponent === c.id ? "#3b82f6" : "#1e293b"}
              stroke={hoveredComponent === c.id ? "#60a5fa" : "#475569"}
              strokeWidth="2"
            />
            <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 4} textAnchor="middle" fill="white" fontSize="11" fontFamily="monospace">
              {c.label}
            </text>
          </g>
        ))}

        {/* Tooltip */}
        {hoveredComponent && (
          <g>
            <rect x="50" y="95" width="700" height="20" fill="#0f172a" rx="4" />
            <text x="400" y="109" textAnchor="middle" fill="#94a3b8" fontSize="11">
              {components.find((c) => c.id === hoveredComponent)?.desc}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// Pipeline Diagram Component
function PipelineDiagram() {
  const stages = [
    { id: 1, label: "Fetch Data", color: "#3b82f6", desc: "Load JSON from Flask backend" },
    { id: 2, label: "Configure", color: "#8b5cf6", desc: "Set up legend, scales, tooltips" },
    { id: 3, label: "Background", color: "#06b6d4", desc: "Draw time labels, direction labels" },
    { id: 4, label: "Brush", color: "#10b981", desc: "Initialize D3 brush for time selection" },
    { id: 5, label: "Legends", color: "#f59e0b", desc: "Draw line/node color legends" },
    { id: 6, label: "Storylines", color: "#ef4444", desc: "Draw entity paths (bezier curves)" },
    { id: 7, label: "Blocks", color: "#ec4899", desc: "Draw pill containers + points" },
    { id: 8, label: "Labels", color: "#6366f1", desc: "Draw entity name labels" },
    { id: 9, label: "Filters", color: "#14b8a6", desc: "Initialize length/crossing filters" },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 900 100" className="w-full min-w-[700px]">
        <defs>
          <marker id="pipeline-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
        </defs>

        {stages.map((stage, i) => (
          <g key={stage.id}>
            {/* Connection arrow */}
            {i < stages.length - 1 && (
              <line
                x1={55 + i * 95}
                y1="35"
                x2={70 + i * 95}
                y2="35"
                stroke="#64748b"
                strokeWidth="2"
                markerEnd="url(#pipeline-arrow)"
              />
            )}
            {/* Stage box */}
            <rect x={10 + i * 95} y="15" width="55" height="40" rx="4" fill={stage.color} />
            <text x={37 + i * 95} y="32" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {stage.id}
            </text>
            <text x={37 + i * 95} y="47" textAnchor="middle" fill="white" fontSize="6">
              {stage.label}
            </text>
            {/* Description */}
            <text x={37 + i * 95} y="70" textAnchor="middle" fill="#94a3b8" fontSize="6">
              {stage.desc.split(" ").slice(0, 3).join(" ")}
            </text>
            <text x={37 + i * 95} y="80" textAnchor="middle" fill="#94a3b8" fontSize="6">
              {stage.desc.split(" ").slice(3).join(" ")}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// SVG Structure Diagram
function SVGStructureDiagram() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    root: true,
    storyline: false,
    block: false,
    label: false,
  });

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="font-mono text-sm space-y-1">
      <div className="text-blue-400">&lt;svg id=&quot;story-svg&quot;&gt;</div>
      <div className="pl-4 text-gray-400">&lt;style&gt;...&lt;/style&gt;</div>
      <div className="pl-4 text-gray-400">&lt;defs&gt;&lt;marker id=&quot;arrow-head&quot;&gt;...&lt;/marker&gt;&lt;/defs&gt;</div>
      <div className="pl-4 text-purple-400">&lt;g id=&quot;direction-container&quot;&gt; <span className="text-gray-500">← &quot;External&quot;/&quot;Internal&quot;</span>&lt;/g&gt;</div>
      <div className="pl-4 text-purple-400">&lt;g id=&quot;time-container&quot;&gt; <span className="text-gray-500">← Time axis + brush</span>&lt;/g&gt;</div>
      <div className="pl-4 text-purple-400">&lt;g id=&quot;time-annotation-container&quot;&gt; <span className="text-gray-500">← Event annotations</span>&lt;/g&gt;</div>
      <div className="pl-4 text-purple-400">&lt;g id=&quot;line-legend-container&quot;&gt; <span className="text-gray-500">← Line type legend</span>&lt;/g&gt;</div>
      <div className="pl-4 text-purple-400">&lt;g id=&quot;node-legend-container&quot;&gt; <span className="text-gray-500">← Node color legend</span>&lt;/g&gt;</div>

      <div className="pl-4">
        <button onClick={() => toggle("storyline")} className="text-green-400 hover:text-green-300">
          {expanded.storyline ? "▼" : "►"} &lt;g id=&quot;storyline-container&quot;&gt;
        </button>
        {expanded.storyline && (
          <div className="pl-4 text-gray-400 border-l border-gray-700 ml-2">
            <div>&lt;g class=&quot;storyline-ego|storyline-alter&quot;&gt;</div>
            <div className="pl-4">&lt;g class=&quot;line-&#123;id&#125;&quot;&gt;</div>
            <div className="pl-8">&lt;path class=&quot;movable path-movable&quot; d=&quot;M...C...&quot; /&gt;</div>
            <div className="pl-4">&lt;/g&gt;</div>
            <div className="pl-4">&lt;g class=&quot;marks&quot;&gt;</div>
            <div className="pl-8">&lt;path d=&quot;triangle&quot; transform=&quot;translate(x,y) rotate(90)&quot; /&gt;</div>
            <div className="pl-4">&lt;/g&gt;</div>
            <div>&lt;/g&gt;</div>
          </div>
        )}
      </div>

      <div className="pl-4">
        <button onClick={() => toggle("block")} className="text-yellow-400 hover:text-yellow-300">
          {expanded.block ? "▼" : "►"} &lt;g id=&quot;block-container&quot;&gt;
        </button>
        {expanded.block && (
          <div className="pl-4 text-gray-400 border-l border-gray-700 ml-2">
            <div>&lt;g class=&quot;arcs&quot; id=&quot;arc-group-&#123;id&#125;&quot;&gt;</div>
            <div className="pl-4">&lt;g id=&quot;block-click-&#123;id&#125;&quot;&gt;</div>
            <div className="pl-8">&lt;path id=&quot;left-arc-&#123;id&#125;&quot; d=&quot;M...A...&quot; /&gt; <span className="text-gray-500">← Pill left side</span></div>
            <div className="pl-8">&lt;path id=&quot;right-arc-&#123;id&#125;&quot; d=&quot;M...A...&quot; /&gt; <span className="text-gray-500">← Pill right side</span></div>
            <div className="pl-8">&lt;path id=&quot;top-bar-&#123;id&#125;&quot; /&gt; <span className="text-gray-500">← Expanded top (hidden)</span></div>
            <div className="pl-8">&lt;path id=&quot;bottom-bar-&#123;id&#125;&quot; /&gt; <span className="text-gray-500">← Expanded bottom (hidden)</span></div>
            <div className="pl-8">&lt;circle class=&quot;points-&#123;group&#125;&quot; /&gt; <span className="text-gray-500">← Entity circles</span></div>
            <div className="pl-4">&lt;/g&gt;</div>
            <div>&lt;/g&gt;</div>
          </div>
        )}
      </div>

      <div className="pl-4">
        <button onClick={() => toggle("label")} className="text-orange-400 hover:text-orange-300">
          {expanded.label ? "▼" : "►"} &lt;g id=&quot;label-container&quot;&gt;
        </button>
        {expanded.label && (
          <div className="pl-4 text-gray-400 border-l border-gray-700 ml-2">
            <div>&lt;g class=&quot;pin-check&quot; id=&quot;label-&#123;name&#125;&quot;&gt;</div>
            <div className="pl-4">&lt;text class=&quot;labels line-labels&quot; /&gt;</div>
            <div className="pl-4">&lt;text class=&quot;inline-labels&quot; /&gt;</div>
            <div className="pl-4">&lt;path class=&quot;mark-links&quot; /&gt; <span className="text-gray-500">← Label connector line</span></div>
            <div>&lt;/g&gt;</div>
          </div>
        )}
      </div>

      <div className="text-blue-400">&lt;/svg&gt;</div>
    </div>
  );
}

// Data Structure Visualization
function DataStructureViz() {
  const [activeTab, setActiveTab] = useState<"toplevel" | "storyline" | "block" | "point">("toplevel");

  const examples = {
    toplevel: `{
  "bandWidth": 101.816,        // Width of each time band
  "blockWidth": 40,            // Base block width
  "ego": "Jeffrey Heer",       // Central entity name
  "mode": "author",            // Visualization mode
  "heightExtents": [268, 656], // [minY, maxY] bounds
  "timeLabels": [...],         // Time axis labels
  "storylines": [...],         // Entity paths
  "blocks": [...],             // Pill containers
  "reference": [...]           // Optional relationship data
}`,
    storyline: `{
  "id": 0,
  "name": "Jeffrey Heer",     // Entity name
  "color": "#146b6b",         // Line color
  "lifespan": 23,             // Number of active timesteps
  "crossingCheck": true,      // Crosses ego line?
  "lines": [                  // SVG bezier curves
    "M62.908,414.0 L164.724,414.0 C..."
  ],
  "marks": [                  // Triangle markers
    { "posX": 42.908, "posY": 414, "size": 45 }
  ],
  "label": {                  // External label position
    "label": "Jeffrey Heer",
    "posX": 900, "posY": 414,
    "textAlign": "start",
    "visibility": "visible"
  },
  "inlineLabels": [...]       // Labels along the line
}`,
    block: `{
  "id": 0,
  "time": "2002",             // Timestamp
  "moveX": 228,               // Expansion width
  "topPosY": 288,             // Top Y position
  "names": [                  // Entities in this block
    "Tara Matthews", "Tim Sohn", "Jeffrey Heer"...
  ],
  "outline": {
    "left": "M63.22...A20.0,20.0,0,0,0...", // SVG arc
    "right": "M62.59...A20.0,20.0,0,0,1...",
    "top": "M62.908,268.0L290.908,268.0",
    "bottom": "M62.908,536.0L290.908,536.0",
    "button": { "posX": 62.908, "posY": 536, "width": 60 }
  },
  "points": [...],            // Circles within block
  "relations": [[1,61],[1,2],...] // Edges [sourceId, targetId]
}`,
    point: `{
  "id": 2,
  "name": "Jeffrey Heer",
  "group": 0,                 // Block ID
  "posX": 62.908,             // X position (center of block)
  "posY": 414,                // Y position (stacked)
  "scaleX": 0.522,            // 0-1 scale for expanded X
  "scaleY": 0.583,            // 0-1 scale for expanded Y
  "label": "295",             // Citation count (for tooltip)
  "visibility": "visible"
}`
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["toplevel", "storyline", "block", "point"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded text-sm ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {tab === "toplevel" ? "Top Level" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <pre className="bg-gray-900 p-4 rounded-lg text-xs overflow-x-auto text-gray-300">
        <code>{examples[activeTab]}</code>
      </pre>
    </div>
  );
}

// SVG Path Generation Explanation
function SVGPathExplanation() {
  const [pathType, setPathType] = useState<"bezier" | "arc" | "elliptical">("bezier");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["bezier", "arc", "elliptical"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setPathType(type)}
            className={`px-3 py-1 rounded text-sm ${
              pathType === type ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {type === "bezier" ? "Bezier Curves" : type === "arc" ? "Arc Segments" : "Elliptical Arcs"}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <svg viewBox="0 0 300 150" className="w-full bg-gray-900 rounded-lg">
            {pathType === "bezier" && (
              <>
                <circle cx="30" cy="75" r="4" fill="#3b82f6" />
                <circle cx="270" cy="75" r="4" fill="#3b82f6" />
                <circle cx="100" cy="30" r="3" fill="#ef4444" opacity="0.6" />
                <circle cx="200" cy="120" r="3" fill="#ef4444" opacity="0.6" />
                <path d="M30,75 C100,30 200,120 270,75" stroke="#10b981" strokeWidth="2" fill="none" />
                <line x1="30" y1="75" x2="100" y2="30" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" />
                <line x1="270" y1="75" x2="200" y2="120" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" />
                <text x="150" y="140" textAnchor="middle" fill="#94a3b8" fontSize="10">Cubic Bezier: M x1,y1 C cx1,cy1 cx2,cy2 x2,y2</text>
              </>
            )}
            {pathType === "arc" && (
              <>
                <path d="M60,120 A40,40,0,0,0,60,40 L60,120" stroke="#f59e0b" strokeWidth="2" fill="none" />
                <path d="M80,120 A40,40,0,0,1,80,40 L80,120" stroke="#8b5cf6" strokeWidth="2" fill="none" />
                <circle cx="60" cy="80" r="3" fill="#f59e0b" />
                <circle cx="80" cy="80" r="3" fill="#8b5cf6" />
                <text x="70" y="140" textAnchor="middle" fill="#94a3b8" fontSize="10">Arc: A rx,ry,rotation,large-arc,sweep,x,y</text>
                <text x="200" y="50" fill="#f59e0b" fontSize="9">sweep=0 (left arc)</text>
                <text x="200" y="70" fill="#8b5cf6" fontSize="9">sweep=1 (right arc)</text>
              </>
            )}
            {pathType === "elliptical" && (
              <>
                <circle cx="80" cy="60" r="8" fill="#3b82f6" />
                <circle cx="220" cy="90" r="8" fill="#10b981" />
                <path d="M88,60 A80,40,0,0,1,212,90" stroke="#ef4444" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <text x="150" y="140" textAnchor="middle" fill="#94a3b8" fontSize="10">Elliptical arc for relation links</text>
              </>
            )}
          </svg>
        </div>

        <div className="text-sm space-y-2">
          {pathType === "bezier" && (
            <>
              <p className="text-gray-300"><strong>Storylines</strong> use cubic Bezier curves to create smooth transitions between timesteps.</p>
              <pre className="bg-gray-900 p-2 rounded text-xs text-green-400">M62.908,414.0 L164.724,414.0 C189.724,414.0 189.724,414.0 214.724,414.0</pre>
              <p className="text-gray-400 text-xs">The control points (C) create the smooth curve. Midpoint X coordinates help maintain flow.</p>
            </>
          )}
          {pathType === "arc" && (
            <>
              <p className="text-gray-300"><strong>Block outlines</strong> use SVG arcs to create pill-shaped containers.</p>
              <pre className="bg-gray-900 p-2 rounded text-xs text-yellow-400">M63.22,268.0 A20.0,20.0,0,0,0,42.908,288.0 L42.908,324.0...</pre>
              <p className="text-gray-400 text-xs">Left arc uses sweep=0, right arc uses sweep=1 to create mirrored curves.</p>
            </>
          )}
          {pathType === "elliptical" && (
            <>
              <p className="text-gray-300"><strong>Relation arcs</strong> connect points within expanded blocks.</p>
              <pre className="bg-gray-900 p-2 rounded text-xs text-red-400">arc.arc(rx, ry, r, startAngle, endAngle, counterclockwise)</pre>
              <p className="text-gray-400 text-xs">Computed in helpers.js _compute_elliptical_arc() with dynamic curvature based on distance.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Interaction Sequence Diagram
function SequenceDiagram() {
  const [scenario, setScenario] = useState<"hover" | "click" | "expand">("hover");

  const scenarios = {
    hover: [
      { actor: "User", action: "mouseover storyline", target: "" },
      { actor: "Visualizer", action: "_lineHover()", target: "" },
      { actor: "", action: "LINE_SELECTION().classed('storyline-hover', true)", target: "" },
      { actor: "", action: "ENTITY_SELECTION() - highlight related blocks", target: "" },
      { actor: "", action: "_massHoverExecution() - dehighlight others", target: "" },
    ],
    click: [
      { actor: "User", action: "click storyline", target: "" },
      { actor: "Visualizer", action: "_linePin()", target: "" },
      { actor: "", action: "Toggle 'pin' attribute on label element", target: "" },
      { actor: "", action: "Update this.members.pinned array", target: "" },
      { actor: "", action: "Maintain highlight state after mouseout", target: "" },
    ],
    expand: [
      { actor: "User", action: "click block", target: "" },
      { actor: "Visualizer", action: "_blockUpdate()", target: "" },
      { actor: "", action: "Toggle 'active' attribute", target: "" },
      { actor: "", action: "Create Expander/Collapser instance", target: "" },
      { actor: "Expander", action: "act()", target: "" },
      { actor: "", action: "1. Shift .movable elements right by moveX", target: "" },
      { actor: "", action: "2. _fillDummyLines() - extend storylines", target: "" },
      { actor: "", action: "3. _expandBlock() - show horizontal bars", target: "" },
      { actor: "", action: "4. _contextualize() - reposition points using scaleX/Y", target: "" },
      { actor: "", action: "5. _drawLinks() - add relation arcs", target: "" },
      { actor: "", action: "6. _updateBrush() - adjust brush selection", target: "" },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["hover", "click", "expand"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScenario(s)}
            className={`px-3 py-1 rounded text-sm ${
              scenario === s ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {s === "hover" ? "Storyline Hover" : s === "click" ? "Storyline Pin" : "Block Expand"}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 p-4 rounded-lg space-y-2">
        {scenarios[scenario].map((step, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className="text-gray-500 w-6">{i + 1}.</span>
            {step.actor && <span className="text-blue-400 font-medium min-w-[80px]">{step.actor}</span>}
            {!step.actor && <span className="min-w-[80px]"></span>}
            <span className="text-gray-300 font-mono text-xs">{step.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// State Management Diagram
function StateManagementDiagram() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Instance State (SpreadLinesVisualizer)</h4>
          <pre className="text-xs text-gray-300">{`this.visibility = {}      // Entity visibility map
this.members = {
  slider: [],             // Filtered by length
  crossing: [],           // Filtered by crossing
  pinned: []              // User-pinned entities
}
this.actors = {}          // Active Expander instances
this.brushComponent = {
  brush: null,            // D3 brush instance
  brushedBlocks: [],      // Selected blocks
  brushedSelection: []    // [startIdx, endIdx]
}`}</pre>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-green-400 mb-2">DOM Attributes</h4>
          <pre className="text-xs text-gray-300">{`// Pin state on labels
element.getAttribute('pin')     // "0" or "1"

// Block active state
element.getAttribute('active')  // "0" or "1"

// Transform for position
element.getAttribute('transform')
// "translate(X, Y)"

// Embedded X for collapse revert
element.getAttribute('embX')    // expanded X offset`}</pre>
        </div>
      </div>
    </div>
  );
}

// CSS Classes Reference
function CSSClassesReference() {
  const classes = [
    { name: ".movable", desc: "Elements that shift during expand/collapse", type: "layout" },
    { name: ".station-arcs", desc: "Block outlines (pill shape)", type: "layout" },
    { name: ".points", desc: "Circle elements", type: "layout" },
    { name: ".labels", desc: "Text labels", type: "layout" },
    { name: ".storyline-hover", desc: "Hovered state (stroke-width: 4)", type: "state" },
    { name: ".storyline-dehighlight", desc: "Faded state (opacity: 0.1)", type: "state" },
    { name: ".storyline-label-dehighlight", desc: "Hidden label (opacity: 0)", type: "state" },
    { name: ".storyline-arc-dehighlight", desc: "Faded block (opacity: 0.1)", type: "state" },
    { name: ".storyline-ego", desc: "Ego line (stroke-width: 5.5)", type: "type" },
    { name: ".storyline-alter", desc: "Other lines (stroke-width: 2)", type: "type" },
    { name: ".stroked-text", desc: "White text shadow for readability", type: "type" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-700">
            <th className="py-2 px-3">Class</th>
            <th className="py-2 px-3">Type</th>
            <th className="py-2 px-3">Description</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.name} className="border-b border-gray-800">
              <td className="py-2 px-3 font-mono text-yellow-400">{c.name}</td>
              <td className="py-2 px-3">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    c.type === "layout"
                      ? "bg-blue-900 text-blue-300"
                      : c.type === "state"
                      ? "bg-green-900 text-green-300"
                      : "bg-purple-900 text-purple-300"
                  }`}
                >
                  {c.type}
                </span>
              </td>
              <td className="py-2 px-3 text-gray-400">{c.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// D3 Patterns Reference
function D3PatternsReference() {
  const patterns = [
    {
      name: "Data Join",
      code: `.data(storylines).join(
  enter => enter.append('g'),
  update => update,
  exit => exit.remove()
)`,
      desc: "Bind data to DOM elements with enter/update/exit",
    },
    {
      name: "Transitions",
      code: `d3.transition()
  .duration(500)
  .ease(d3.easeQuadInOut)`,
      desc: "Smooth animations for expand/collapse",
    },
    {
      name: "Brush",
      code: `d3.brushX()
  .extent([[0, y], [width, y+30]])
  .on('end.snap', brushEnd)`,
      desc: "Time range selection with snapping",
    },
    {
      name: "Force Simulation",
      code: `d3.forceSimulation(nodes)
  .force('x', d3.forceX(d => d.x))
  .force('y', d3.forceY(d => d.y))
  .force('collide', d3.forceCollide(r))`,
      desc: "Collision detection in expanded blocks",
    },
    {
      name: "Line Animation",
      code: `.attrTween('stroke-dasharray', function() {
  let len = this.getTotalLength();
  return d3.interpolate(
    \`0,\${len}\`, \`\${len},\${len}\`
  );
})`,
      desc: "Draw line animation effect",
    },
  ];

  return (
    <div className="space-y-4">
      {patterns.map((p) => (
        <div key={p.name} className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400 font-semibold">{p.name}</span>
            <span className="text-gray-500 text-xs">{p.desc}</span>
          </div>
          <pre className="text-xs text-green-400 overflow-x-auto">{p.code}</pre>
        </div>
      ))}
    </div>
  );
}

// Embedding Calculation Visualization
function EmbeddingVisualization() {
  const [scale, setScale] = useState(0.5);
  const [length, setLength] = useState(200);
  const whiteSpace = 0.15;
  const computed = (scale + whiteSpace / 2) * length * (1 - whiteSpace);

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-green-400 mb-4">_compute_embedding(scale, length)</h4>
        <pre className="text-xs text-gray-300 mb-4">{`const whiteSpace = 0.15;
return (scale + whiteSpace/2) * length * (1 - whiteSpace);`}</pre>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Scale (scaleX/scaleY): {scale.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Length (moveX): {length}</label>
            <input
              type="range"
              min="100"
              max="300"
              step="10"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-800 rounded">
          <span className="text-gray-400">Result: </span>
          <span className="text-yellow-400 font-mono">{computed.toFixed(2)}px</span>
          <span className="text-gray-500 text-xs ml-2">(offset from block center)</span>
        </div>

        <svg viewBox="0 0 320 80" className="w-full mt-4">
          <rect x="10" y="20" width={length} height="40" fill="#1e293b" stroke="#475569" />
          <line x1="10" y1="40" x2={10 + computed} y2="40" stroke="#10b981" strokeWidth="2" />
          <circle cx={10 + computed} cy="40" r="6" fill="#3b82f6" />
          <text x={10 + computed} y="70" textAnchor="middle" fill="#94a3b8" fontSize="10">{computed.toFixed(0)}px</text>
          <text x={10 + length / 2} y="15" textAnchor="middle" fill="#64748b" fontSize="10">Expanded block width: {length}px</text>
        </svg>
      </div>
    </div>
  );
}

// Main Page Component
export default function DesignPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">SpreadLine Frontend Architecture</h1>
          <p className="text-muted-foreground">
            Reverse-engineered documentation of the SpreadLine visualization framework
          </p>
          <p className="text-sm text-muted-foreground">
            Based on: <a href="https://arxiv.org/pdf/2408.08992" className="text-blue-400 hover:underline">IEEE TVCG 2024 Paper</a>
          </p>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              SpreadLine visualizes egocentric dynamic networks centered around a focal entity (ego)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-2">Storylines</h4>
                <p className="text-gray-400">
                  Bezier curves showing entity paths over time, with triangle markers at endpoints.
                </p>
              </div>
              <div className="bg-green-950 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">Blocks</h4>
                <p className="text-gray-400">
                  Pill-shaped containers at each timestep containing entity circles. Click to expand.
                </p>
              </div>
              <div className="bg-purple-950 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-400 mb-2">Interactions</h4>
                <p className="text-gray-400">
                  Hover, pin storylines, brush time ranges, expand blocks with PCA positioning.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Architecture */}
        <Card>
          <CardHeader>
            <CardTitle>File Architecture</CardTitle>
            <CardDescription>Module dependencies and responsibilities (hover for details)</CardDescription>
          </CardHeader>
          <CardContent>
            <ArchitectureDiagram />
          </CardContent>
        </Card>

        {/* Rendering Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Rendering Pipeline</CardTitle>
            <CardDescription>Sequential rendering stages in visualize() method</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineDiagram />
          </CardContent>
        </Card>

        {/* SVG Structure */}
        <Card>
          <CardHeader>
            <CardTitle>SVG DOM Structure</CardTitle>
            <CardDescription>Hierarchical structure of the generated SVG (click to expand)</CardDescription>
          </CardHeader>
          <CardContent>
            <SVGStructureDiagram />
          </CardContent>
        </Card>

        {/* Data Structures */}
        <Card>
          <CardHeader>
            <CardTitle>Data Structures</CardTitle>
            <CardDescription>JSON data format from backend (testData.json)</CardDescription>
          </CardHeader>
          <CardContent>
            <DataStructureViz />
          </CardContent>
        </Card>

        {/* SVG Path Generation */}
        <Card>
          <CardHeader>
            <CardTitle>SVG Path Generation</CardTitle>
            <CardDescription>How storylines, blocks, and relations are rendered</CardDescription>
          </CardHeader>
          <CardContent>
            <SVGPathExplanation />
          </CardContent>
        </Card>

        {/* Embedding Calculation */}
        <Card>
          <CardHeader>
            <CardTitle>Point Contextualization</CardTitle>
            <CardDescription>How scaleX/scaleY are converted to pixel positions in expanded blocks</CardDescription>
          </CardHeader>
          <CardContent>
            <EmbeddingVisualization />
          </CardContent>
        </Card>

        {/* Interaction Sequences */}
        <Card>
          <CardHeader>
            <CardTitle>Interaction Sequences</CardTitle>
            <CardDescription>Step-by-step execution flow for user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <SequenceDiagram />
          </CardContent>
        </Card>

        {/* State Management */}
        <Card>
          <CardHeader>
            <CardTitle>State Management</CardTitle>
            <CardDescription>How state is tracked across the visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <StateManagementDiagram />
          </CardContent>
        </Card>

        {/* CSS Classes */}
        <Card>
          <CardHeader>
            <CardTitle>CSS Classes Reference</CardTitle>
            <CardDescription>Key CSS classes used for styling and state</CardDescription>
          </CardHeader>
          <CardContent>
            <CSSClassesReference />
          </CardContent>
        </Card>

        {/* D3 Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>D3.js Patterns</CardTitle>
            <CardDescription>Key D3 patterns used in the visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <D3PatternsReference />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8">
          <p>SpreadLine: Visualizing Egocentric Dynamic Influence</p>
          <p className="text-xs mt-1">
            Frontend architecture reverse-engineered for documentation purposes
          </p>
        </div>
      </div>
    </div>
  );
}

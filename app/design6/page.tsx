"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================
// TYPES
// ============================================
interface Point {
  id: number;
  name: string;
  label: string;
  posX: number;
  posY: number;
  scaleX: number;
  scaleY: number;
  group: number;
  visibility: string;
}

interface Block {
  id: number;
  time: string;
  moveX: number;
  names: string[];
  topPosY: number;
  points: Point[];
  relations: [number, number][];
  outline: {
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
}

interface Storyline {
  id: number;
  name: string;
  color: string;
  crossingCheck: boolean;
  lifespan: number;
  lines: string[];
  marks: { name: string; posX: number; posY: number; size: number; visibility: string }[];
  label: { label: string; line: string; posX: number; posY: number; textAlign: string; visibility: string };
  inlineLabels: { name: string; posX: number; posY: number }[];
}

interface TimeLabel {
  label: string;
  posX: number;
}

interface SpreadLineData {
  bandWidth: number;
  blockWidth: number;
  blocks: Block[];
  storylines: Storyline[];
  timeLabels: TimeLabel[];
  heightExtents: [number, number];
  ego: string;
}

// ============================================
// SAMPLE DATA FOR INTERACTIVE DEMOS
// ============================================
const DEMO_STORYLINES = [
  { id: 0, name: "Jeffrey Heer", color: "#424242", lifespan: 21, isEgo: true, crossingCheck: false },
  { id: 1, name: "Ed H. Chi", color: "#FA9902", lifespan: 8, isEgo: false, crossingCheck: true },
  { id: 2, name: "Jock D. Mackinlay", color: "#146b6b", lifespan: 14, isEgo: false, crossingCheck: true },
  { id: 3, name: "Tamara Munzner", color: "#146b6b", lifespan: 12, isEgo: false, crossingCheck: false },
  { id: 4, name: "Wesley Willett", color: "#146b6b", lifespan: 6, isEgo: false, crossingCheck: true },
];

const DEMO_POINTS = [
  { id: 1, name: "Tara Matthews", scaleX: 0.19, scaleY: 0.0 },
  { id: 2, name: "Jason I. Hong", scaleX: 0.39, scaleY: 0.35 },
  { id: 3, name: "Jeffrey Heer", scaleX: 0.52, scaleY: 0.58 },
  { id: 4, name: "Ed H. Chi", scaleX: 0.79, scaleY: 0.65 },
  { id: 5, name: "Stuart K. Card", scaleX: 0.47, scaleY: 0.41 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const computeEmbedding = (scale: number, length: number): number => {
  const whiteSpace = 0.15;
  return (scale + whiteSpace / 2) * length * (1 - whiteSpace);
};

const getNodeColor = (label: number): string => {
  if (label < 10) return "#ffffff";
  if (label < 50) return "#fcdaca";
  if (label < 100) return "#e599a6";
  if (label < 500) return "#c94b77";
  return "#740980";
};

const easeOutQuad = (t: number) => t * (2 - t);

// ============================================
// SECTION 1: ANIMATED HERO
// ============================================
function AnimatedHero() {
  const [phase, setPhase] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const phases = [
    { name: "Start", desc: "Empty canvas" },
    { name: "Time Axis", desc: "Year markers appear" },
    { name: "Ego Line", desc: "The central person's timeline (Jeffrey Heer)" },
    { name: "Storylines", desc: "Other researchers' paths through time" },
    { name: "Blocks", desc: "Interaction points at each timestep" },
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => setPhase((p) => (p + 1) % 5), 2500);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const years = ["2002", "2004", "2006", "2008", "2010", "2012"];

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${autoPlay ? "bg-green-500 text-white" : "bg-slate-700 text-slate-300"}`}
        >
          {autoPlay ? "Auto" : "Manual"}
        </button>
        {phases.map((p, i) => (
          <button
            key={i}
            onClick={() => { setAutoPlay(false); setPhase(i); }}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${phase === i ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
          >
            {i + 1}. {p.name}
          </button>
        ))}
      </div>

      <div className="mb-4 p-3 bg-slate-800 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">{phase + 1}</div>
        <div>
          <div className="text-white font-bold">{phases[phase].name}</div>
          <div className="text-slate-400 text-sm">{phases[phase].desc}</div>
        </div>
      </div>

      <svg viewBox="0 0 700 300" className="w-full bg-slate-950 rounded-xl">
        {/* Direction Labels - LEFT */}
        <text x="10" y="80" fill="#64748b" fontSize="20" fontWeight="bold" opacity="0.3">External</text>
        <text x="10" y="240" fill="#64748b" fontSize="20" fontWeight="bold" opacity="0.3">Internal</text>

        {/* Phase 1: Time Axis */}
        {phase >= 1 && years.map((year, i) => (
          <g key={year}>
            <text x={100 + i * 100} y="30" fill="#94a3b8" fontSize="12" textAnchor="middle" fontWeight="bold">{year}</text>
            <line x1={100 + i * 100} y1="40" x2={100 + i * 100} y2="270" stroke="#334155" strokeDasharray="4" opacity="0.5" />
          </g>
        ))}

        {/* Phase 2: Ego Line */}
        {phase >= 2 && (
          <g>
            <path d="M100,150 L600,150" stroke="#424242" strokeWidth="6" fill="none" />
            <polygon points="95,150 108,143 108,157" fill="#424242" />
            <text x="85" y="154" fill="#424242" fontSize="11" fontWeight="bold" textAnchor="end">Jeffrey Heer</text>
          </g>
        )}

        {/* Phase 3: Storylines */}
        {phase >= 3 && (
          <g>
            <path d="M100,100 C180,100 220,200 300,200 C380,200 420,120 500,120 L600,120" stroke="#FA9902" strokeWidth="2" fill="none" />
            <polygon points="95,100 108,93 108,107" fill="#FA9902" />
            <text x="85" y="104" fill="#FA9902" fontSize="10" textAnchor="end">Ed H. Chi</text>

            <path d="M200,220 C280,220 320,100 400,100 L600,100" stroke="#146b6b" strokeWidth="2" fill="none" />
            <polygon points="195,220 208,213 208,227" fill="#146b6b" />
            <text x="185" y="224" fill="#146b6b" fontSize="10" textAnchor="end">Jock M.</text>

            <path d="M150,200 C230,200 270,180 350,180 L600,180" stroke="#146b6b" strokeWidth="2" fill="none" opacity="0.7" />
            <polygon points="145,200 158,193 158,207" fill="#146b6b" />
            <text x="135" y="204" fill="#146b6b" fontSize="10" textAnchor="end">Tamara</text>
          </g>
        )}

        {/* Phase 4: Blocks */}
        {phase >= 4 && [0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <path d={`M${100 + i * 100},60 A15,15,0,0,0,${85 + i * 100},75 L${85 + i * 100},225 A15,15,0,0,0,${100 + i * 100},240`} stroke="#64748b" strokeWidth="2" fill="none" />
            <path d={`M${100 + i * 100},60 A15,15,0,0,1,${115 + i * 100},75 L${115 + i * 100},225 A15,15,0,0,1,${100 + i * 100},240`} stroke="#64748b" strokeWidth="2" fill="none" />
            {[0, 1, 2, 3].map((j) => (
              <circle key={j} cx={100 + i * 100} cy={90 + j * 45} r="5" fill={["#fcdaca", "#e599a6", "#c94b77", "#146b6b"][j]} />
            ))}
          </g>
        ))}
      </svg>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-2 bg-[#424242] rounded"></div><span className="text-slate-400">Ego</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-2 bg-[#146b6b] rounded"></div><span className="text-slate-400">Collaborator</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-2 bg-[#FA9902] rounded"></div><span className="text-slate-400">Colleague</span></div>
      </div>
    </div>
  );
}

// ============================================
// SECTION 2: BEZIER CURVE BUILDER
// ============================================
function BezierDemo() {
  const [points, setPoints] = useState({ start: { x: 50, y: 150 }, control1: { x: 150, y: 50 }, control2: { x: 250, y: 250 }, end: { x: 350, y: 150 } });
  const [dragging, setDragging] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 400;
    const y = ((e.clientY - rect.top) / rect.height) * 300;
    setPoints(prev => ({ ...prev, [dragging]: { x: Math.max(0, Math.min(400, x)), y: Math.max(0, Math.min(300, y)) } }));
  }, [dragging]);

  const pathD = `M${points.start.x},${points.start.y} C${points.control1.x},${points.control1.y} ${points.control2.x},${points.control2.y} ${points.end.x},${points.end.y}`;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
        <p className="text-slate-400 text-sm mb-3">Drag the colored dots to shape the curve</p>
        <svg ref={svgRef} viewBox="0 0 400 300" className="w-full bg-slate-950 rounded-xl cursor-crosshair"
          onMouseMove={handleMouseMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)}>
          {[0, 100, 200, 300, 400].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#1e293b" />)}
          {[0, 100, 200, 300].map(y => <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#1e293b" />)}
          <line x1={points.start.x} y1={points.start.y} x2={points.control1.x} y2={points.control1.y} stroke="#f472b6" strokeDasharray="4" opacity="0.5" />
          <line x1={points.end.x} y1={points.end.y} x2={points.control2.x} y2={points.control2.y} stroke="#a78bfa" strokeDasharray="4" opacity="0.5" />
          <path d={pathD} stroke="#22d3ee" strokeWidth="4" fill="none" />
          <circle cx={points.start.x} cy={points.start.y} r="14" fill="#22c55e" className="cursor-grab" onMouseDown={() => setDragging("start")} />
          <circle cx={points.control1.x} cy={points.control1.y} r="12" fill="#f472b6" className="cursor-grab" onMouseDown={() => setDragging("control1")} />
          <circle cx={points.control2.x} cy={points.control2.y} r="12" fill="#a78bfa" className="cursor-grab" onMouseDown={() => setDragging("control2")} />
          <circle cx={points.end.x} cy={points.end.y} r="14" fill="#ef4444" className="cursor-grab" onMouseDown={() => setDragging("end")} />
          <text x={points.start.x} y={points.start.y - 20} fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">Start</text>
          <text x={points.control1.x} y={points.control1.y - 18} fill="#f472b6" fontSize="10" textAnchor="middle">Curve 1</text>
          <text x={points.control2.x} y={points.control2.y + 25} fill="#a78bfa" fontSize="10" textAnchor="middle">Curve 2</text>
          <text x={points.end.x} y={points.end.y - 20} fill="#ef4444" fontSize="11" textAnchor="middle" fontWeight="bold">End</text>
        </svg>
      </div>
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
        <h4 className="text-white font-bold mb-3">Generated SVG Path</h4>
        <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm">
          <div className="text-slate-500">// Path command</div>
          <div className="text-cyan-400 mt-2">d = "</div>
          <div className="pl-4 text-green-400">M{points.start.x.toFixed(0)},{points.start.y.toFixed(0)}</div>
          <div className="pl-4 text-pink-400">C{points.control1.x.toFixed(0)},{points.control1.y.toFixed(0)}</div>
          <div className="pl-4 text-purple-400">{points.control2.x.toFixed(0)},{points.control2.y.toFixed(0)}</div>
          <div className="pl-4 text-red-400">{points.end.x.toFixed(0)},{points.end.y.toFixed(0)}</div>
          <div className="text-cyan-400">"</div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span className="text-slate-300">Start = Where storyline begins</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-pink-500"></div><span className="text-slate-300">Curve controls = Pull the line</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div><span className="text-slate-300">End = Where storyline ends</span></div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION 3: BLOCK EXPANSION DEMO
// ============================================
function BlockExpansionDemo() {
  const [step, setStep] = useState(0);
  const moveX = 180;

  const steps = [
    { name: "Collapsed", shift: 0, extend: 0, expand: 0, position: 0 },
    { name: "Shift", shift: 1, extend: 0, expand: 0, position: 0, desc: "Everything to the RIGHT moves over" },
    { name: "Extend", shift: 1, extend: 1, expand: 0, position: 0, desc: "Storylines stretch with dotted lines" },
    { name: "Expand", shift: 1, extend: 1, expand: 1, position: 0, desc: "Block outline grows wider" },
    { name: "Position", shift: 1, extend: 1, expand: 1, position: 1, desc: "Points spread using PCA values" },
  ];

  const s = steps[step];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-4">Click each step:</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {steps.map((st, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${step === i ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {i}. {st.name}
            </button>
          ))}
        </div>
        {s.desc && <div className="p-3 bg-blue-900/30 rounded-xl text-blue-300 text-sm border border-blue-700">{s.desc}</div>}
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <svg viewBox="0 0 650 280" className="w-full bg-slate-950 rounded-xl">
          <text x="10" y="60" fill="#64748b" fontSize="12" opacity="0.5">External</text>
          <text x="10" y="230" fill="#64748b" fontSize="12" opacity="0.5">Internal</text>

          {["t0", "t1", "t2", "t3"].map((t, i) => {
            const shift = i > 1 ? s.shift * moveX : i === 1 ? s.shift * moveX / 2 : 0;
            return <text key={t} x={80 + i * 100 + shift} y="25" fill="#94a3b8" fontSize="12" textAnchor="middle">{t}</text>;
          })}

          {/* Ego line */}
          <path d={`M50,140 L${300 + s.shift * moveX},140`} stroke="#424242" strokeWidth="5" fill="none" />
          <polygon points="45,140 55,135 55,145" fill="#424242" />
          <text x="35" y="144" fill="#424242" fontSize="10" fontWeight="bold" textAnchor="end">Ego</text>

          {/* Dummy extension line */}
          {s.extend > 0 && <path d={`M80,100 L${80 + s.extend * moveX},100`} stroke="#FA9902" strokeWidth="2" strokeDasharray="6 3" fill="none" />}

          {/* Storyline */}
          <path d={`M${180 + s.shift * moveX},90 C${220 + s.shift * moveX},90 ${260 + s.shift * moveX},200 ${300 + s.shift * moveX},200`} stroke="#FA9902" strokeWidth="2" fill="none" />

          {/* Block */}
          <g>
            {s.expand > 0 && <rect x={65} y="50" width={30 + s.expand * moveX} height="180" rx="15" fill="white" opacity="0.95" />}
            <path d="M80,50 A15,15,0,0,0,65,65 L65,215 A15,15,0,0,0,80,230" stroke={s.expand > 0 ? "#3b82f6" : "#64748b"} strokeWidth="2" fill="none" />
            <path d={`M${80 + s.expand * moveX},50 A15,15,0,0,1,${95 + s.expand * moveX},65 L${95 + s.expand * moveX},215 A15,15,0,0,1,${80 + s.expand * moveX},230`} stroke={s.expand > 0 ? "#3b82f6" : "#64748b"} strokeWidth="2" fill="none" />
            {s.expand > 0 && <>
              <line x1="80" y1="50" x2={80 + s.expand * moveX} y2="50" stroke="#3b82f6" strokeWidth="2" />
              <line x1="80" y1="230" x2={80 + s.expand * moveX} y2="230" stroke="#3b82f6" strokeWidth="2" />
            </>}

            {/* Points */}
            {DEMO_POINTS.map((pt, i) => {
              const px = 80 + computeEmbedding(pt.scaleX, s.expand * moveX) * s.position;
              const py = 60 + computeEmbedding(pt.scaleY, 160) * s.position + (1 - s.position) * i * 35;
              return (
                <g key={pt.id}>
                  <circle cx={px} cy={py} r={pt.name === "Jeffrey Heer" ? 8 : 6} fill={["#fcdaca", "#e599a6", "#c94b77", "#424242", "#740980"][i]} stroke={s.position > 0 ? "#333" : "none"} strokeWidth="1" />
                  {s.position > 0.5 && <text x={px + 12} y={py + 4} fill="#333" fontSize="9">{pt.name.split(' ')[0]}</text>}
                </g>
              );
            })}

            {/* Relation arcs */}
            {s.position > 0.5 && (
              <path d={`M${80 + computeEmbedding(0.52, s.expand * moveX)},${60 + computeEmbedding(0.58, 160)} Q${80 + computeEmbedding(0.65, s.expand * moveX)},${60 + computeEmbedding(0.3, 160)} ${80 + computeEmbedding(0.79, s.expand * moveX)},${60 + computeEmbedding(0.65, 160)}`}
                stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#demoArrow)" opacity={(s.position - 0.5) * 2} />
            )}
          </g>
          <defs>
            <marker id="demoArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#333" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {["Shift", "Extend", "Expand", "Position"].map((action, i) => {
          const active = [s.shift, s.extend, s.expand, s.position][i] > 0;
          return (
            <div key={action} className={`p-3 rounded-xl text-center text-sm font-semibold ${active ? "bg-green-500 text-white" : "bg-slate-800 text-slate-500"}`}>
              {active ? "✓" : "○"} {action}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// SECTION 4: PCA PLAYGROUND
// ============================================
function PCAPlayground() {
  const [selected, setSelected] = useState(0);
  const [width, setWidth] = useState(180);
  const [height, setHeight] = useState(180);

  const pt = DEMO_POINTS[selected];
  const cx = (scale: number) => 30 + computeEmbedding(scale, width);
  const cy = (scale: number) => 30 + computeEmbedding(scale, height);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-4">Point Positions (click to select)</h4>
        <svg viewBox="0 0 260 260" className="w-full bg-white rounded-xl">
          <rect x="20" y="20" width={width + 20} height={height + 20} fill="none" stroke="#3b82f6" strokeWidth="2" rx="10" />
          {DEMO_POINTS.map((p, i) => (
            <g key={p.id} onClick={() => setSelected(i)} className="cursor-pointer">
              <circle cx={cx(p.scaleX)} cy={cy(p.scaleY)} r={i === selected ? 14 : 10}
                fill={["#fcdaca", "#e599a6", "#c94b77", "#424242", "#740980"][i]}
                stroke={i === selected ? "#000" : "none"} strokeWidth="3" />
              <text x={cx(p.scaleX)} y={cy(p.scaleY) - 18} fill="#333" fontSize="9" textAnchor="middle">{p.name.split(' ')[0]}</text>
            </g>
          ))}
          <text x={30 + width * 0.4} y={55 + height} fill="#666" fontSize="10" textAnchor="middle">X Position</text>
        </svg>
      </div>
      <div className="space-y-4">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h4 className="text-white font-bold mb-4">Selected: {pt.name}</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-xs">scaleX</div>
              <div className="text-2xl font-bold text-blue-400">{pt.scaleX.toFixed(2)}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-xs">scaleY</div>
              <div className="text-2xl font-bold text-green-400">{pt.scaleY.toFixed(2)}</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between mb-2"><span className="text-slate-400 text-sm">Block Width (moveX)</span><span className="text-blue-400 font-bold">{width}px</span></div>
            <input type="range" min="100" max="220" value={width} onChange={(e) => setWidth(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="mb-4">
            <div className="flex justify-between mb-2"><span className="text-slate-400 text-sm">Block Height (moveY)</span><span className="text-green-400 font-bold">{height}px</span></div>
            <input type="range" min="100" max="220" value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-900/50 rounded-xl p-3 text-center border border-blue-700">
              <div className="text-blue-300 text-xs">Final X</div>
              <div className="text-xl font-bold text-white">{cx(pt.scaleX).toFixed(0)}px</div>
            </div>
            <div className="bg-green-900/50 rounded-xl p-3 text-center border border-green-700">
              <div className="text-green-300 text-xs">Final Y</div>
              <div className="text-xl font-bold text-white">{cy(pt.scaleY).toFixed(0)}px</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION 5: FILTER CONTROLS
// ============================================
function FilterDemo() {
  const [minYears, setMinYears] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);

  const visible = DEMO_STORYLINES.filter(s => s.isEgo || (s.lifespan >= minYears && (!crossingOnly || s.crossingCheck)));
  const years = ["2002", "2004", "2006", "2008", "2010", "2012"];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between mb-2"><span className="text-slate-400">Minimum Years</span><span className="text-3xl font-black text-cyan-400">{minYears}</span></div>
            <input type="range" min="1" max="20" value={minYears} onChange={(e) => setMinYears(parseInt(e.target.value))} className="w-full h-3 bg-slate-700 rounded-full" />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl cursor-pointer w-full">
              <input type="checkbox" checked={crossingOnly} onChange={(e) => setCrossingOnly(e.target.checked)} className="w-6 h-6 accent-cyan-500" />
              <div><div className="text-white font-semibold">Crossing Only</div><div className="text-slate-400 text-sm">Cross the ego line</div></div>
            </label>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center p-4 bg-gradient-to-r from-purple-900 to-cyan-900 rounded-xl w-full">
              <div className="text-4xl font-black text-white">{visible.length - 1}</div>
              <div className="text-purple-200">alters showing</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-4">Filtered Preview</h4>
        <svg viewBox="0 0 700 200" className="w-full bg-slate-950 rounded-xl">
          <text x="10" y="50" fill="#64748b" fontSize="12" opacity="0.5">External</text>
          <text x="10" y="160" fill="#64748b" fontSize="12" opacity="0.5">Internal</text>

          {years.map((year, i) => (
            <g key={year}>
              <text x={100 + i * 100} y="20" fill="#94a3b8" fontSize="10" textAnchor="middle">{year}</text>
              <line x1={100 + i * 100} y1="28" x2={100 + i * 100} y2="180" stroke="#334155" strokeDasharray="3" opacity="0.3" />
            </g>
          ))}

          {/* Ego */}
          <path d="M100,100 L600,100" stroke="#424242" strokeWidth="5" fill="none" />
          <polygon points="95,100 108,93 108,107" fill="#424242" />
          <text x="85" y="104" fill="#424242" fontSize="10" fontWeight="bold" textAnchor="end">Ego</text>

          {DEMO_STORYLINES.filter(s => !s.isEgo).map((s, i) => {
            const isVis = visible.includes(s);
            const startY = s.crossingCheck ? [50, 150][i % 2] : (i < 2 ? 70 : 130);
            const endY = s.crossingCheck ? [150, 50][i % 2] : startY;
            return (
              <g key={s.id} opacity={isVis ? 1 : 0.1} className="transition-opacity duration-500">
                <path d={`M${100 + i * 30},${startY} C${200 + i * 30},${startY} ${400},${endY} 600,${endY}`} stroke={s.color} strokeWidth="2" fill="none" />
                <polygon points={`${95 + i * 30},${startY} ${108 + i * 30},${startY - 7} ${108 + i * 30},${startY + 7}`} fill={s.color} />
                <text x={85 + i * 30} y={startY + 4} fill={s.color} fontSize="9" textAnchor="end">{s.name.split(' ')[0]}</text>
              </g>
            );
          })}
        </svg>

        <div className="mt-4 flex flex-wrap gap-2">
          {DEMO_STORYLINES.map((s) => (
            <div key={s.id} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${s.isEgo ? "bg-cyan-900" : visible.includes(s) ? "bg-slate-800" : "bg-slate-900 opacity-30"}`}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-white">{s.name}</span>
              {!s.isEgo && <span className="text-slate-500 text-xs">{s.lifespan}y</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION 6: HOW IT WORKS
// ============================================
function HowItWorks() {
  const [scenario, setScenario] = useState(0);
  const [animStep, setAnimStep] = useState(0);

  const scenarios = [
    { name: "Hover", icon: "👆", analogy: "Like pointing at someone in a photo", steps: ["You point", "That person highlighted", "Others fade", "Focus achieved!"] },
    { name: "Pin", icon: "📌", analogy: "Like putting a sticky note", steps: ["You click", "Stays highlighted", "Move away - still there", "Click again to unpin"] },
    { name: "Expand", icon: "📦", analogy: "Like opening a folder", steps: ["Click the block", "Block opens up", "Points spread out", "See connections!"] },
    { name: "Filter", icon: "🎚️", analogy: "Like adjusting brightness", steps: ["Move slider", "Some fade out", "Important ones stay", "Cleaner view!"] },
  ];

  const sc = scenarios[scenario];

  useEffect(() => {
    setAnimStep(0);
    const interval = setInterval(() => setAnimStep(s => (s + 1) % sc.steps.length), 1500);
    return () => clearInterval(interval);
  }, [scenario, sc.steps.length]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-2xl p-6 border border-purple-700">
        <h3 className="text-2xl font-bold text-white mb-2">How Does SpreadLine Respond?</h3>
        <p className="text-purple-200">You interact, it responds. Simple as that!</p>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {scenarios.map((s, i) => (
            <button key={i} onClick={() => setScenario(i)}
              className={`p-4 rounded-xl text-left ${scenario === i ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-semibold text-sm">{s.name}</div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-800 rounded-xl mb-4">
          <div className="text-cyan-400 text-sm">{sc.analogy}</div>
        </div>

        <div className="space-y-2">
          {sc.steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${animStep === i ? "bg-cyan-900 border border-cyan-500 scale-[1.02]" : "bg-slate-800/50"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${animStep === i ? "bg-cyan-500 text-white" : animStep > i ? "bg-green-600 text-white" : "bg-slate-700 text-slate-400"}`}>
                {animStep > i ? "✓" : i + 1}
              </div>
              <div className={`font-semibold ${animStep === i ? "text-white" : "text-slate-400"}`}>{step}</div>
              {animStep === i && <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping ml-auto" />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6">
        <h4 className="text-white font-bold mb-3">In Simple Terms:</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-900 rounded-xl"><div className="text-3xl mb-2">👆</div><div className="text-white font-semibold">You Act</div></div>
          <div className="p-4 bg-slate-900 rounded-xl"><div className="text-3xl mb-2">⚡</div><div className="text-white font-semibold">It Notices</div></div>
          <div className="p-4 bg-slate-900 rounded-xl"><div className="text-3xl mb-2">✨</div><div className="text-white font-semibold">View Updates</div></div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION 7: FULL SPREADLINE DEMO
// ============================================
function FullSpreadLineDemo() {
  const [data, setData] = useState<SpreadLineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [pinnedEntities, setPinnedEntities] = useState<Set<string>>(new Set());
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [blockAnimProgress, setBlockAnimProgress] = useState<{ [key: number]: number }>({});
  const [minLifespan, setMinLifespan] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; label: string } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch("/testData.json")
      .then((res) => res.json())
      .then((json) => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockAnimProgress((prev) => {
        const next = { ...prev };
        let changed = false;
        expandedBlocks.forEach((id) => {
          if ((next[id] || 0) < 1) { next[id] = Math.min(1, (next[id] || 0) + 0.05); changed = true; }
        });
        Object.keys(next).forEach((k) => {
          const id = parseInt(k);
          if (!expandedBlocks.has(id) && next[id] > 0) { next[id] = Math.max(0, next[id] - 0.05); changed = true; }
        });
        return changed ? next : prev;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [expandedBlocks]);

  const filteredNames = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(data.storylines.filter(s => s.name === data.ego || (s.lifespan >= minLifespan && (!crossingOnly || s.crossingCheck))).map(s => s.name));
  }, [data, minLifespan, crossingOnly]);

  const isHighlighted = useCallback((name: string): boolean => {
    if (!data) return false;
    if (name === data.ego) return true;
    if (pinnedEntities.size > 0) return pinnedEntities.has(name);
    if (hoveredEntity) return hoveredEntity === name;
    return true;
  }, [data, pinnedEntities, hoveredEntity]);

  const getShiftX = useCallback((posX: number): number => {
    if (!data) return 0;
    let shift = 0;
    data.blocks.forEach((block) => {
      const blockPosX = data.timeLabels.find(t => t.label === block.time)?.posX || 0;
      const progress = easeOutQuad(blockAnimProgress[block.id] || 0);
      if (blockPosX < posX && expandedBlocks.has(block.id)) shift += block.moveX * progress;
      else if (blockPosX === posX && expandedBlocks.has(block.id)) shift += (block.moveX / 2) * progress;
    });
    return shift;
  }, [data, expandedBlocks, blockAnimProgress]);

  if (loading || !data) {
    return (
      <div className="bg-slate-900 rounded-2xl p-12 border border-slate-700 text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white">Loading SpreadLine data...</div>
        <div className="text-slate-400 text-sm mt-2">Make sure testData.json is in the public folder</div>
      </div>
    );
  }

  const margin = { top: 80, right: 150, bottom: 50, left: 180 };
  const totalExpand = Array.from(expandedBlocks).reduce((sum, id) => {
    const block = data.blocks.find(b => b.id === id);
    return sum + (block ? block.moveX * easeOutQuad(blockAnimProgress[id] || 0) : 0);
  }, 0);
  const svgWidth = Math.max(...data.timeLabels.map(t => t.posX)) + margin.left + margin.right + totalExpand;
  const svgHeight = (data.heightExtents?.[1] || 600) + margin.top + margin.bottom + 100;
  const egoY = data.storylines.find(s => s.name === data.ego)?.label.posY || 414;
  const maxLife = Math.max(...data.storylines.filter(s => s.name !== data.ego).map(s => s.lifespan));

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Min Years:</span>
          <input type="range" min="1" max={maxLife} value={minLifespan} onChange={(e) => setMinLifespan(parseInt(e.target.value))} className="w-24" />
          <span className="text-cyan-400 font-bold w-8">{minLifespan}</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={crossingOnly} onChange={(e) => setCrossingOnly(e.target.checked)} className="w-5 h-5 accent-cyan-500" />
          <span className="text-slate-300 text-sm">Crossing Only</span>
        </label>
        <div className="text-slate-400 text-sm">
          <span className="text-cyan-400">{filteredNames.size - 1}</span> of {data.storylines.length - 1} alters
        </div>
        {pinnedEntities.size > 0 && (
          <button onClick={() => setPinnedEntities(new Set())} className="px-3 py-1 bg-red-600 text-white rounded text-sm">
            Clear {pinnedEntities.size} Pin(s)
          </button>
        )}
        <div className="text-slate-500 text-xs ml-auto">
          Hover to highlight | Click line to pin | Click block to expand
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Lines:</span>
          <span className="flex items-center gap-1"><span className="w-4 h-1 bg-[#424242] rounded"></span>Ego</span>
          <span className="flex items-center gap-1"><span className="w-4 h-1 bg-[#146b6b] rounded"></span>Collaborator</span>
          <span className="flex items-center gap-1"><span className="w-4 h-1 bg-[#FA9902] rounded"></span>Colleague</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Citations:</span>
          {[{ c: "#ffffff", l: "<10" }, { c: "#fcdaca", l: "10-50" }, { c: "#e599a6", l: "50-100" }, { c: "#c94b77", l: "100-500" }, { c: "#740980", l: "500+" }].map(({ c, l }) => (
            <span key={l} className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-slate-500" style={{ backgroundColor: c }}></span><span className="text-slate-400 text-xs">{l}</span></span>
          ))}
        </div>
      </div>

      {/* SVG Container */}
      <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700" style={{ maxHeight: "600px" }}>
        <svg ref={svgRef} width={svgWidth} height={svgHeight} className="bg-slate-950">
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Direction Labels */}
            <text x={-margin.left + 20} y={egoY - 150} fill="#64748b" fontSize="40" fontWeight="bold" opacity="0.15">External</text>
            <text x={-margin.left + 20} y={egoY + 180} fill="#64748b" fontSize="40" fontWeight="bold" opacity="0.15">Internal</text>

            {/* Time Labels */}
            {data.timeLabels.map((tl) => {
              const shift = getShiftX(tl.posX);
              return (
                <g key={tl.label} transform={`translate(${shift}, 0)`}>
                  <text x={tl.posX} y={-30} fill="#94a3b8" fontSize="13" textAnchor="middle" fontWeight="bold">{tl.label}</text>
                  <line x1={tl.posX} y1={-20} x2={tl.posX} y2={svgHeight - margin.top - margin.bottom} stroke="#334155" strokeDasharray="4" opacity="0.4" />
                </g>
              );
            })}

            {/* Storylines */}
            {data.storylines.map((sl) => {
              const filtered = filteredNames.has(sl.name);
              const highlighted = isHighlighted(sl.name);
              const isEgo = sl.name === data.ego;

              return (
                <g key={sl.id} className={`transition-opacity duration-300 ${!filtered ? "opacity-10" : highlighted ? "opacity-100" : "opacity-20"}`}
                  style={{ cursor: isEgo ? "default" : "pointer" }}
                  onMouseEnter={() => filtered && !isEgo && setHoveredEntity(sl.name)}
                  onMouseLeave={() => setHoveredEntity(null)}
                  onClick={() => filtered && !isEgo && setPinnedEntities(prev => { const n = new Set(prev); n.has(sl.name) ? n.delete(sl.name) : n.add(sl.name); return n; })}>

                  {sl.lines.map((line, idx) => {
                    const match = line.match(/M([\d.]+)/);
                    const startX = match ? parseFloat(match[1]) : 0;
                    return (
                      <path key={idx} d={line} transform={`translate(${getShiftX(startX)}, 0)`}
                        stroke={sl.color} strokeWidth={isEgo ? 6 : highlighted ? 4 : 2} fill="none" />
                    );
                  })}

                  {sl.marks.map((mark, idx) => {
                    const rot = idx === 0 ? 90 : -90;
                    const sz = Math.sqrt(mark.size) * 2;
                    return (
                      <polygon key={idx} points={`0,${-sz / 2} ${sz},0 0,${sz / 2}`}
                        transform={`translate(${mark.posX + getShiftX(mark.posX)}, ${mark.posY}) rotate(${rot})`}
                        fill={sl.color} opacity={mark.visibility === "visible" ? 1 : 0} />
                    );
                  })}

                  {sl.label.visibility === "visible" && (sl.lifespan > 5 || isEgo || pinnedEntities.has(sl.name)) && (
                    <g transform={`translate(${getShiftX(sl.label.posX)}, 0)`}>
                      <text x={sl.label.posX} y={sl.label.posY} fill={sl.color} fontSize={isEgo ? "13" : "11"}
                        fontWeight={isEgo || pinnedEntities.has(sl.name) ? "bold" : "normal"} textAnchor="end" dy="4">
                        {sl.label.label}
                      </text>
                      {!isEgo && sl.label.line && <path d={sl.label.line} stroke={sl.color} strokeWidth="2" fill="none" />}
                    </g>
                  )}

                  {pinnedEntities.has(sl.name) && (
                    <circle cx={sl.label.posX + getShiftX(sl.label.posX) + 10} cy={sl.label.posY} r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
                  )}
                </g>
              );
            })}

            {/* Blocks */}
            {data.blocks.map((block) => {
              const tl = data.timeLabels.find(t => t.label === block.time);
              if (!tl) return null;

              const baseShift = getShiftX(tl.posX);
              const progress = easeOutQuad(blockAnimProgress[block.id] || 0);
              const expandW = block.moveX * progress;
              const hasFiltered = block.names.some(n => filteredNames.has(n));

              // Calculate block bounds for click area
              const minY = Math.min(...block.points.map(p => p.posY)) - 30;
              const maxY = Math.max(...block.points.map(p => p.posY)) + 30;
              const blockHeight = maxY - minY;

              return (
                <g key={block.id} className={`transition-opacity duration-300 ${hasFiltered ? "opacity-100" : "opacity-20"}`}>
                  {/* CLICKABLE AREA - full block body */}
                  <rect
                    x={tl.posX - data.blockWidth / 2 + baseShift - expandW / 2 - 5}
                    y={minY}
                    width={data.blockWidth + expandW + 10}
                    height={blockHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => hasFiltered && setExpandedBlocks(prev => { const n = new Set(prev); n.has(block.id) ? n.delete(block.id) : n.add(block.id); return n; })}
                  />

                  {/* White background when expanded */}
                  {progress > 0 && (
                    <rect x={tl.posX - data.blockWidth / 2 + baseShift - expandW / 2}
                      y={minY + 10} width={data.blockWidth + expandW} height={blockHeight - 20}
                      rx="20" fill="white" opacity={progress * 0.95} pointerEvents="none" />
                  )}

                  {/* Arcs */}
                  <path d={block.outline.left} transform={`translate(${baseShift - expandW / 2}, 0)`}
                    stroke={expandedBlocks.has(block.id) ? "#3b82f6" : "#64748b"} strokeWidth="2" fill="none" pointerEvents="none" />
                  <path d={block.outline.right} transform={`translate(${baseShift + expandW / 2}, 0)`}
                    stroke={expandedBlocks.has(block.id) ? "#3b82f6" : "#64748b"} strokeWidth="2" fill="none" pointerEvents="none" />

                  {/* Top/bottom bars */}
                  {progress > 0.2 && (
                    <>
                      <line x1={tl.posX + baseShift - expandW / 2} y1={minY + 10}
                        x2={tl.posX + baseShift + expandW / 2} y2={minY + 10}
                        stroke="#3b82f6" strokeWidth="2" opacity={progress} pointerEvents="none" />
                      <line x1={tl.posX + baseShift - expandW / 2} y1={maxY - 10}
                        x2={tl.posX + baseShift + expandW / 2} y2={maxY - 10}
                        stroke="#3b82f6" strokeWidth="2" opacity={progress} pointerEvents="none" />
                    </>
                  )}

                  {/* Relation arcs */}
                  {progress > 0.5 && block.relations.map(([srcId, tgtId], idx) => {
                    const src = block.points.find(p => p.id === srcId);
                    const tgt = block.points.find(p => p.id === tgtId);
                    if (!src || !tgt) return null;
                    const sx = tl.posX + baseShift + computeEmbedding(src.scaleX, expandW) - expandW / 2;
                    const sy = block.topPosY + computeEmbedding(src.scaleY, expandW);
                    const tx = tl.posX + baseShift + computeEmbedding(tgt.scaleX, expandW) - expandW / 2;
                    const ty = block.topPosY + computeEmbedding(tgt.scaleY, expandW);
                    return (
                      <path key={idx} d={`M${sx},${sy} Q${(sx + tx) / 2},${Math.min(sy, ty) - 15} ${tx},${ty}`}
                        stroke="#424242" strokeWidth="1.5" fill="none" opacity={(progress - 0.5) * 2}
                        markerEnd="url(#mainArrow)" pointerEvents="none" />
                    );
                  })}

                  {/* Points */}
                  {block.points.map((pt) => {
                    const ptFiltered = filteredNames.has(pt.name);
                    const ptHighlighted = isHighlighted(pt.name);
                    let px = tl.posX + baseShift;
                    let py = pt.posY;
                    if (progress > 0) {
                      px = tl.posX + baseShift + computeEmbedding(pt.scaleX, expandW) - expandW / 2;
                      py = block.topPosY + computeEmbedding(pt.scaleY, expandW) * progress + pt.posY * (1 - progress) - block.topPosY * (1 - progress);
                    }
                    const isEgoPt = pt.name === data.ego;
                    return (
                      <g key={`${block.id}-${pt.id}`}>
                        <circle cx={px} cy={py} r={isEgoPt ? 8 : 6}
                          fill={getNodeColor(parseInt(pt.label) || 0)}
                          stroke={ptHighlighted ? "#000" : "#666"} strokeWidth={ptHighlighted ? 2 : 1}
                          opacity={ptFiltered ? (ptHighlighted ? 1 : 0.5) : 0.1}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={(e) => {
                            if (ptFiltered) {
                              setHoveredEntity(pt.name);
                              const rect = svgRef.current?.getBoundingClientRect();
                              if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, name: pt.name, label: pt.label });
                            }
                          }}
                          onMouseLeave={() => { setHoveredEntity(null); setTooltip(null); }}
                          onClick={(e) => { e.stopPropagation(); if (ptFiltered && !isEgoPt) setPinnedEntities(prev => { const n = new Set(prev); n.has(pt.name) ? n.delete(pt.name) : n.add(pt.name); return n; }); }}
                        />
                        {progress > 0.7 && (
                          <text x={px + 10} y={py + 4} fill="#333" fontSize="9" opacity={(progress - 0.7) * 3.33} pointerEvents="none">
                            {pt.name.split(" ")[0]}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Arrow marker */}
            <defs>
              <marker id="mainArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#424242" />
              </marker>
            </defs>
          </g>

          {/* Tooltip */}
          {tooltip && (
            <g transform={`translate(${tooltip.x + 15}, ${tooltip.y - 10})`}>
              <rect x="0" y="-20" width="150" height="45" rx="6" fill="#1e293b" stroke="#475569" />
              <text x="10" y="-2" fill="white" fontSize="12" fontWeight="bold">{tooltip.name}</text>
              <text x="10" y="16" fill="#94a3b8" fontSize="11">Citations: {tooltip.label}</text>
            </g>
          )}
        </svg>
      </div>

      {/* Status */}
      <div className="bg-slate-800 rounded-xl p-3 flex items-center justify-between text-sm text-slate-400">
        <div><span className="text-cyan-400">{data.storylines.length}</span> entities | <span className="text-cyan-400">{data.blocks.length}</span> blocks | <span className="text-cyan-400">{data.timeLabels[0]?.label} - {data.timeLabels[data.timeLabels.length - 1]?.label}</span></div>
        <div>
          {expandedBlocks.size > 0 && <span className="text-green-400 mr-4">{expandedBlocks.size} expanded</span>}
          {pinnedEntities.size > 0 && <span className="text-red-400">{pinnedEntities.size} pinned</span>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function Design6Page() {
  const sections = [
    { id: "overview", title: "Overview", icon: "✨" },
    { id: "curves", title: "Curves", icon: "〰️" },
    { id: "blocks", title: "Blocks", icon: "📦" },
    { id: "pca", title: "PCA", icon: "📍" },
    { id: "filters", title: "Filters", icon: "🎚️" },
    { id: "how", title: "How It Works", icon: "💡" },
    { id: "demo", title: "Full Demo", icon: "🚀" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-cyan-900/20 pointer-events-none" />

      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">SpreadLine Ultimate Guide</h1>
              <p className="text-xs text-slate-500">Complete Interactive Tutorial + Full Demo</p>
            </div>
            <div className="flex gap-1">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800">
                  <span className="mr-1">{s.icon}</span><span className="hidden sm:inline">{s.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-8 space-y-16">
        <section id="overview" className="scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-3">Understanding <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">SpreadLine</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Visualize how one person connects with others over time. Watch the animation or click phases!</p>
          </div>
          <AnimatedHero />
        </section>

        <section id="curves" className="scroll-mt-20">
          <h2 className="text-2xl font-black text-white mb-2">〰️ How Lines Are Drawn</h2>
          <p className="text-slate-400 mb-6">Each storyline is a smooth Bezier curve. Drag the control points!</p>
          <BezierDemo />
        </section>

        <section id="blocks" className="scroll-mt-20">
          <h2 className="text-2xl font-black text-white mb-2">📦 Block Expansion</h2>
          <p className="text-slate-400 mb-6">Click each step to see how blocks open up: Shift → Extend → Expand → Position</p>
          <BlockExpansionDemo />
        </section>

        <section id="pca" className="scroll-mt-20">
          <h2 className="text-2xl font-black text-white mb-2">📍 Point Positioning (PCA)</h2>
          <p className="text-slate-400 mb-6">Points spread based on attributes. Drag sliders to see real-time changes!</p>
          <PCAPlayground />
        </section>

        <section id="filters" className="scroll-mt-20">
          <h2 className="text-2xl font-black text-white mb-2">🎚️ Filter Controls</h2>
          <p className="text-slate-400 mb-6">Use sliders to focus on what matters most</p>
          <FilterDemo />
        </section>

        <section id="how" className="scroll-mt-20">
          <h2 className="text-2xl font-black text-white mb-2">💡 How SpreadLine Responds</h2>
          <p className="text-slate-400 mb-6">Understanding the conversation between you and the visualization</p>
          <HowItWorks />
        </section>

        <section id="demo" className="scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-3">🚀 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Full SpreadLine Demo</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">The complete interactive visualization with all {`67+`} storylines. Try all the interactions!</p>
          </div>
          <FullSpreadLineDemo />
        </section>

        <footer className="text-center py-8 border-t border-slate-800">
          <p className="text-slate-500">SpreadLine: Visualizing Egocentric Dynamic Influence</p>
          <p className="text-slate-600 text-sm mt-1">Design v6 - The Ultimate Interactive Guide + Full Demo</p>
        </footer>
      </main>
    </div>
  );
}

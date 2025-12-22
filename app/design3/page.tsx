"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// SAMPLE DATA (from actual testData.json)
// ============================================
const SAMPLE_STORYLINES = [
  { id: 0, name: "Jeffrey Heer", color: "#146b6b", lifespan: 23, isEgo: true, crossingCheck: true },
  { id: 1, name: "Ed H. Chi", color: "#FA9902", lifespan: 18, isEgo: false, crossingCheck: true },
  { id: 2, name: "Tamara Munzner", color: "#146b6b", lifespan: 15, isEgo: false, crossingCheck: true },
  { id: 3, name: "Ben Shneiderman", color: "#FA9902", lifespan: 12, isEgo: false, crossingCheck: false },
  { id: 4, name: "Mary Czerwinski", color: "#146b6b", lifespan: 8, isEgo: false, crossingCheck: true },
  { id: 5, name: "Maneesh Agrawala", color: "#FA9902", lifespan: 10, isEgo: false, crossingCheck: false },
];

const SAMPLE_POINTS = [
  { id: 65, name: "Tara Matthews", label: "60", scaleX: 0.19, scaleY: 0.0 },
  { id: 64, name: "Jason I. Hong", label: "60", scaleX: 0.39, scaleY: 0.35 },
  { id: 63, name: "James A. Landay", label: "60", scaleX: 0.51, scaleY: 0.32 },
  { id: 2, name: "Jeffrey Heer", label: "295", scaleX: 0.52, scaleY: 0.58 },
  { id: 1, name: "Ed Huai-hsin Chi", label: "95", scaleX: 0.79, scaleY: 0.65 },
  { id: 62, name: "Ed H. Chi", label: "140", scaleX: 0.72, scaleY: 0.54 },
];

const TIME_LABELS = ["2002", "2004", "2006", "2008", "2010", "2012", "2014"];

// ============================================
// ANIMATED HERO - MINI SPREADLINE
// ============================================
function AnimatedHero() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  useEffect(() => {
    const phases = [0, 1, 2, 3, 4];
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setAnimationPhase(phases[currentIndex]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const storylineData = [
    { id: 1, path: "M80,200 L200,200 C250,200 280,120 350,120 C420,120 450,180 520,180 C590,180 620,140 720,140", yStart: 200, yEnd: 140 },
    { id: 2, path: "M80,280 C150,280 200,320 280,320 C360,320 400,240 480,240 C560,240 600,280 720,280", yStart: 280, yEnd: 280 },
    { id: 3, path: "M200,160 C280,160 320,100 400,100 C480,100 520,160 600,160 L720,160", yStart: 160, yEnd: 160 },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-1">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl" />

      <div className="relative bg-slate-950/80 backdrop-blur-xl rounded-[22px] p-8">
        <div className="absolute top-4 right-4 flex gap-2">
          {[0, 1, 2, 3, 4].map((phase) => (
            <div
              key={phase}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                animationPhase === phase ? "bg-purple-400 scale-125" : "bg-slate-600"
              }`}
            />
          ))}
        </div>

        <svg viewBox="0 0 800 400" className="w-full">
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="heroGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#146b6b" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
            <linearGradient id="heroGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FA9902" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background direction labels */}
          <text x="30" y="130" fill="#475569" fontSize="28" fontWeight="bold" opacity="0.3">External</text>
          <text x="30" y="320" fill="#475569" fontSize="28" fontWeight="bold" opacity="0.3">Internal</text>

          {/* Time labels */}
          {TIME_LABELS.map((label, i) => (
            <g key={label} opacity={animationPhase >= 1 ? 1 : 0} className="transition-opacity duration-1000">
              <text x={80 + i * 100} y="50" fill="#94a3b8" fontSize="12" textAnchor="middle">{label}</text>
              <line x1={80 + i * 100} y1="60" x2={80 + i * 100} y2="360" stroke="#334155" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
            </g>
          ))}

          {/* Ego line */}
          <path
            d="M80,220 L720,220"
            stroke="url(#heroGradient1)"
            strokeWidth="6"
            fill="none"
            filter="url(#glow)"
            strokeDasharray={animationPhase >= 2 ? "0" : "1000"}
            strokeDashoffset={animationPhase >= 2 ? "0" : "1000"}
            className="transition-all duration-1000"
          />

          {/* Alter storylines */}
          {storylineData.map((line, i) => (
            <g key={line.id}>
              <path
                d={line.path}
                stroke={i === 0 ? "url(#heroGradient2)" : "#146b6b"}
                strokeWidth={hoveredLine === line.id ? 4 : 2}
                fill="none"
                opacity={animationPhase >= 3 ? (hoveredLine === line.id ? 1 : 0.7) : 0}
                className="transition-all duration-500 cursor-pointer"
                onMouseEnter={() => setHoveredLine(line.id)}
                onMouseLeave={() => setHoveredLine(null)}
              />
              {/* Start marker */}
              <polygon
                points={`${line.path.split(' ')[0].slice(1).split(',')[0]},${parseInt(line.path.split(' ')[0].slice(1).split(',')[1]) - 5} ${parseInt(line.path.split(' ')[0].slice(1).split(',')[0]) + 8},${line.path.split(' ')[0].slice(1).split(',')[1]} ${line.path.split(' ')[0].slice(1).split(',')[0]},${parseInt(line.path.split(' ')[0].slice(1).split(',')[1]) + 5}`}
                fill={i === 0 ? "#FA9902" : "#146b6b"}
                opacity={animationPhase >= 3 ? 1 : 0}
                className="transition-opacity duration-500"
              />
            </g>
          ))}

          {/* Blocks */}
          {[180, 350, 520].map((x, i) => (
            <g key={x} opacity={animationPhase >= 4 ? 1 : 0} className="transition-opacity duration-700">
              <rect
                x={x - 20}
                y="100"
                width="40"
                height="200"
                rx="20"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
              />
              {/* Points */}
              {[0, 1, 2, 3].map((j) => (
                <circle
                  key={j}
                  cx={x}
                  cy={130 + j * 50}
                  r="6"
                  fill={["#fcdaca", "#e599a6", "#146b6b", "#c94b77"][j]}
                  className="transition-all duration-300"
                />
              ))}
            </g>
          ))}

          {/* Labels */}
          <text x="740" y="224" fill="#146b6b" fontSize="12" fontWeight="bold" opacity={animationPhase >= 2 ? 1 : 0} className="transition-opacity duration-500">Jeffrey Heer</text>
          <text x="740" y="144" fill="#FA9902" fontSize="11" opacity={animationPhase >= 3 ? 1 : 0} className="transition-opacity duration-500">Ed H. Chi</text>
        </svg>

        {/* Phase indicators */}
        <div className="flex justify-center gap-4 mt-4 text-xs text-slate-400">
          <span className={animationPhase >= 1 ? "text-purple-400" : ""}>Time Axis</span>
          <span className={animationPhase >= 2 ? "text-cyan-400" : ""}>Ego Line</span>
          <span className={animationPhase >= 3 ? "text-orange-400" : ""}>Storylines</span>
          <span className={animationPhase >= 4 ? "text-pink-400" : ""}>Blocks</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INTERACTIVE BEZIER CURVE BUILDER
// ============================================
function BezierCurveBuilder() {
  const [points, setPoints] = useState({
    start: { x: 50, y: 150 },
    control1: { x: 150, y: 50 },
    control2: { x: 250, y: 250 },
    end: { x: 350, y: 150 },
  });
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
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Interactive Canvas */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-3">Drag the colored dots to shape the curve</p>
          <svg
            ref={svgRef}
            viewBox="0 0 400 300"
            className="w-full bg-slate-950 rounded-xl cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={() => setDragging(null)}
            onMouseLeave={() => setDragging(null)}
          >
            {/* Grid */}
            {[0, 100, 200, 300, 400].map(x => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#1e293b" strokeWidth="1" />
            ))}
            {[0, 100, 200, 300].map(y => (
              <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#1e293b" strokeWidth="1" />
            ))}

            {/* Control lines */}
            <line x1={points.start.x} y1={points.start.y} x2={points.control1.x} y2={points.control1.y} stroke="#f472b6" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
            <line x1={points.end.x} y1={points.end.y} x2={points.control2.x} y2={points.control2.y} stroke="#a78bfa" strokeWidth="1" strokeDasharray="4" opacity="0.5" />

            {/* The curve */}
            <path d={pathD} stroke="#22d3ee" strokeWidth="3" fill="none" />

            {/* Draggable points */}
            <circle cx={points.start.x} cy={points.start.y} r="12" fill="#22c55e" className="cursor-grab" onMouseDown={() => setDragging("start")} />
            <circle cx={points.control1.x} cy={points.control1.y} r="10" fill="#f472b6" className="cursor-grab" onMouseDown={() => setDragging("control1")} />
            <circle cx={points.control2.x} cy={points.control2.y} r="10" fill="#a78bfa" className="cursor-grab" onMouseDown={() => setDragging("control2")} />
            <circle cx={points.end.x} cy={points.end.y} r="12" fill="#ef4444" className="cursor-grab" onMouseDown={() => setDragging("end")} />

            {/* Labels */}
            <text x={points.start.x} y={points.start.y - 18} fill="#22c55e" fontSize="10" textAnchor="middle">Start</text>
            <text x={points.control1.x} y={points.control1.y - 15} fill="#f472b6" fontSize="10" textAnchor="middle">Control 1</text>
            <text x={points.control2.x} y={points.control2.y + 22} fill="#a78bfa" fontSize="10" textAnchor="middle">Control 2</text>
            <text x={points.end.x} y={points.end.y - 18} fill="#ef4444" fontSize="10" textAnchor="middle">End</text>
          </svg>
        </div>

        {/* Generated Code */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-3">Generated SVG Path</p>
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm overflow-x-auto">
            <div className="text-slate-500">// SVG path command</div>
            <div className="mt-2">
              <span className="text-cyan-400">d</span>
              <span className="text-slate-400">=</span>
              <span className="text-amber-400">&quot;</span>
            </div>
            <div className="pl-4">
              <span className="text-green-400">M</span>
              <span className="text-green-300">{points.start.x.toFixed(0)},{points.start.y.toFixed(0)}</span>
              <span className="text-slate-500"> {/* Move to start */}</span>
            </div>
            <div className="pl-4">
              <span className="text-pink-400">C</span>
              <span className="text-pink-300">{points.control1.x.toFixed(0)},{points.control1.y.toFixed(0)}</span>
              <span className="text-slate-500"> {/* Control 1 */}</span>
            </div>
            <div className="pl-4">
              <span className="text-purple-300">{points.control2.x.toFixed(0)},{points.control2.y.toFixed(0)}</span>
              <span className="text-slate-500"> {/* Control 2 */}</span>
            </div>
            <div className="pl-4">
              <span className="text-red-300">{points.end.x.toFixed(0)},{points.end.y.toFixed(0)}</span>
              <span className="text-slate-500"> {/* End point */}</span>
            </div>
            <div><span className="text-amber-400">&quot;</span></div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-cyan-950 to-purple-950 rounded-xl border border-cyan-800">
            <p className="text-xs text-cyan-300 font-semibold mb-1">How SpreadLine Uses This</p>
            <p className="text-xs text-slate-300">
              Each storyline is a series of these cubic Bezier curves connected together.
              The backend pre-computes optimal control points for smooth transitions between timesteps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LIVE BLOCK EXPANSION SIMULATOR
// ============================================
function BlockExpansionSimulator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showStep, setShowStep] = useState(0);
  const moveX = 180;

  useEffect(() => {
    if (isExpanded) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.02;
        if (progress >= 1) {
          progress = 1;
          clearInterval(interval);
        }
        setAnimationProgress(progress);
      }, 16);
      return () => clearInterval(interval);
    } else {
      setAnimationProgress(0);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded && animationProgress > 0) {
      if (animationProgress < 0.25) setShowStep(1);
      else if (animationProgress < 0.5) setShowStep(2);
      else if (animationProgress < 0.75) setShowStep(3);
      else setShowStep(4);
    } else {
      setShowStep(0);
    }
  }, [isExpanded, animationProgress]);

  const easeOutQuad = (t: number) => t * (2 - t);
  const easedProgress = easeOutQuad(animationProgress);

  const computeEmbedding = (scale: number) => {
    const whiteSpace = 0.15;
    return (scale + whiteSpace / 2) * moveX * (1 - whiteSpace);
  };

  return (
    <div className="space-y-6">
      {/* Main visualization */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                isExpanded
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                  : "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30"
              }`}
            >
              {isExpanded ? "Collapse Block" : "Expand Block"}
            </button>
            <span className="text-slate-400 text-sm">Click to see the magic!</span>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2">
            {["Shift", "Extend", "Expand", "Position"].map((step, i) => (
              <div
                key={step}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  showStep > i
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <svg viewBox="0 0 700 300" className="w-full bg-slate-950 rounded-xl">
          {/* Background zones */}
          <text x="20" y="80" fill="#475569" fontSize="14" opacity="0.3">External</text>
          <text x="20" y="240" fill="#475569" fontSize="14" opacity="0.3">Internal</text>

          {/* Time labels */}
          {["2002", "2003", "2004", "2005"].map((label, i) => {
            const baseX = 100 + i * 120;
            const shiftX = i > 0 ? easedProgress * moveX : (i === 0 ? easedProgress * moveX / 2 : 0);
            return (
              <text
                key={label}
                x={baseX + shiftX}
                y="30"
                fill="#94a3b8"
                fontSize="12"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}

          {/* Ego line */}
          <path
            d={`M60,150 L${340 + easedProgress * moveX},150`}
            stroke="#146b6b"
            strokeWidth="5"
            fill="none"
          />

          {/* Dummy line extension (shows during expansion) */}
          {isExpanded && easedProgress > 0.25 && (
            <path
              d={`M100,100 L${100 + easedProgress * moveX},100`}
              stroke="#FA9902"
              strokeWidth="2"
              fill="none"
              opacity={easedProgress > 0.25 ? (easedProgress - 0.25) * 4 : 0}
              strokeDasharray="4"
            />
          )}

          {/* Alter storylines that shift */}
          <path
            d={`M${220 + easedProgress * moveX},100 C${280 + easedProgress * moveX},100 ${300 + easedProgress * moveX},200 ${340 + easedProgress * moveX},200`}
            stroke="#FA9902"
            strokeWidth="2"
            fill="none"
          />

          {/* THE BLOCK */}
          <g>
            {/* White background rectangle (only when expanded) */}
            {isExpanded && (
              <rect
                x={80}
                y="60"
                width={40 + easedProgress * moveX}
                height="180"
                fill="white"
                rx="4"
                opacity={easedProgress * 0.95}
              />
            )}

            {/* Left arc */}
            <path
              d={`M100,60 A20,20,0,0,0,80,80 L80,220 A20,20,0,0,0,100,240`}
              stroke="#64748b"
              strokeWidth="2"
              fill="none"
            />

            {/* Right arc */}
            <path
              d={`M${100 + easedProgress * moveX},60 A20,20,0,0,1,${120 + easedProgress * moveX},80 L${120 + easedProgress * moveX},220 A20,20,0,0,1,${100 + easedProgress * moveX},240`}
              stroke="#64748b"
              strokeWidth="2"
              fill="none"
            />

            {/* Top bar (only when expanded) */}
            {isExpanded && easedProgress > 0.5 && (
              <line
                x1="100"
                y1="60"
                x2={100 + easedProgress * moveX}
                y2="60"
                stroke="#64748b"
                strokeWidth="2"
                opacity={(easedProgress - 0.5) * 2}
              />
            )}

            {/* Bottom bar */}
            {isExpanded && easedProgress > 0.5 && (
              <line
                x1="100"
                y1="240"
                x2={100 + easedProgress * moveX}
                y2="240"
                stroke="#64748b"
                strokeWidth="2"
                opacity={(easedProgress - 0.5) * 2}
              />
            )}

            {/* Points inside the block */}
            {SAMPLE_POINTS.slice(0, 5).map((point, i) => {
              const collapsedX = 100;
              const collapsedY = 80 + i * 35;
              const expandedX = 100 + computeEmbedding(point.scaleX) * easedProgress;
              const expandedY = 70 + computeEmbedding(point.scaleY) * easedProgress + (1 - easedProgress) * (i * 35);

              return (
                <g key={point.id}>
                  <circle
                    cx={isExpanded ? expandedX : collapsedX}
                    cy={isExpanded ? expandedY : collapsedY}
                    r={point.name === "Jeffrey Heer" ? 8 : 6}
                    fill={["#fcdaca", "#e599a6", "#c94b77", "#146b6b", "#740980"][i]}
                    className="transition-all"
                    style={{ transitionDuration: "0ms" }}
                  />
                  {isExpanded && easedProgress > 0.8 && (
                    <text
                      x={expandedX + 10}
                      y={expandedY + 4}
                      fill="#64748b"
                      fontSize="8"
                      opacity={(easedProgress - 0.8) * 5}
                    >
                      {point.name.split(' ')[0]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Relationship arcs */}
            {isExpanded && easedProgress > 0.75 && (
              <g opacity={(easedProgress - 0.75) * 4}>
                <path
                  d={`M${100 + computeEmbedding(0.52)},${70 + computeEmbedding(0.58)} Q${100 + computeEmbedding(0.65)},${70 + computeEmbedding(0.4)} ${100 + computeEmbedding(0.79)},${70 + computeEmbedding(0.65)}`}
                  stroke="#424242"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd="url(#arrowHead)"
                />
              </g>
            )}
          </g>

          <defs>
            <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#424242" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Step-by-step explanation */}
      <div className="grid md:grid-cols-4 gap-3">
        {[
          { step: 1, title: "Shift Elements", desc: "All .movable elements to the right shift by moveX pixels", color: "from-blue-500 to-cyan-500" },
          { step: 2, title: "Extend Lines", desc: "_fillDummyLines() creates connecting segments", color: "from-purple-500 to-pink-500" },
          { step: 3, title: "Expand Block", desc: "Horizontal bars appear, white background fills", color: "from-green-500 to-emerald-500" },
          { step: 4, title: "Position Points", desc: "_contextualize() moves points using PCA values", color: "from-orange-500 to-red-500" },
        ].map((item) => (
          <div
            key={item.step}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              showStep >= item.step
                ? `bg-gradient-to-br ${item.color} border-transparent shadow-lg`
                : "bg-slate-900 border-slate-700"
            }`}
          >
            <div className={`text-2xl font-black mb-2 ${showStep >= item.step ? "text-white" : "text-slate-600"}`}>
              {item.step}
            </div>
            <div className={`font-bold text-sm mb-1 ${showStep >= item.step ? "text-white" : "text-slate-400"}`}>
              {item.title}
            </div>
            <div className={`text-xs ${showStep >= item.step ? "text-white/80" : "text-slate-500"}`}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PCA CONTEXTUALIZATION PLAYGROUND
// ============================================
function PCAPlayground() {
  const [selectedPoint, setSelectedPoint] = useState(0);
  const [moveX, setMoveX] = useState(200);
  const whiteSpace = 0.15;

  const computeEmbedding = (scale: number, length: number) => {
    return (scale + whiteSpace / 2) * length * (1 - whiteSpace);
  };

  const points = SAMPLE_POINTS;
  const currentPoint = points[selectedPoint];
  const computedX = computeEmbedding(currentPoint.scaleX, moveX);
  const computedY = computeEmbedding(currentPoint.scaleY, moveX);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* 2D Position Visualizer */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h4 className="font-bold text-white mb-4">2D Position Space</h4>

          <svg viewBox="0 0 280 280" className="w-full bg-slate-950 rounded-xl">
            {/* Grid */}
            <defs>
              <pattern id="smallGrid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="280" height="280" fill="url(#smallGrid)" />

            {/* Axes */}
            <line x1="20" y1="260" x2="260" y2="260" stroke="#475569" strokeWidth="2" />
            <line x1="20" y1="20" x2="20" y2="260" stroke="#475569" strokeWidth="2" />
            <text x="140" y="278" fill="#94a3b8" fontSize="10" textAnchor="middle">scaleX (PCA dimension 1)</text>
            <text x="10" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle" transform="rotate(-90, 10, 140)">scaleY (PCA dimension 2)</text>

            {/* All points */}
            {points.map((p, i) => {
              const x = 20 + computeEmbedding(p.scaleX, 240);
              const y = 20 + computeEmbedding(p.scaleY, 240);
              const isSelected = i === selectedPoint;

              return (
                <g key={p.id} onClick={() => setSelectedPoint(i)} className="cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 14 : 10}
                    fill={isSelected ? "#8b5cf6" : "#3b82f6"}
                    stroke={isSelected ? "#c4b5fd" : "none"}
                    strokeWidth="3"
                    className="transition-all duration-300"
                  />
                  {isSelected && (
                    <>
                      <line x1="20" y1={y} x2={x} y2={y} stroke="#8b5cf6" strokeDasharray="4" opacity="0.5" />
                      <line x1={x} y1="260" x2={x} y2={y} stroke="#8b5cf6" strokeDasharray="4" opacity="0.5" />
                    </>
                  )}
                  <text x={x} y={y - 18} fill="#94a3b8" fontSize="8" textAnchor="middle">
                    {p.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Formula & Values */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
            <h4 className="font-bold text-white mb-4">Selected: {currentPoint.name}</h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">scaleX (PCA)</div>
                <div className="text-2xl font-bold text-blue-400">{currentPoint.scaleX.toFixed(2)}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">scaleY (PCA)</div>
                <div className="text-2xl font-bold text-green-400">{currentPoint.scaleY.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm mb-4">
              <div className="text-slate-500 mb-2">// _compute_embedding formula</div>
              <div>
                <span className="text-purple-400">position</span>
                <span className="text-slate-400"> = </span>
                <span className="text-slate-400">(</span>
                <span className="text-blue-400">scale</span>
                <span className="text-slate-400"> + </span>
                <span className="text-yellow-400">0.075</span>
                <span className="text-slate-400">) × </span>
                <span className="text-green-400">moveX</span>
                <span className="text-slate-400"> × </span>
                <span className="text-yellow-400">0.85</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-slate-400">moveX:</span>
              <input
                type="range"
                min="100"
                max="300"
                value={moveX}
                onChange={(e) => setMoveX(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-bold text-purple-400 w-16">{moveX}px</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-xl p-4 border border-blue-700">
                <div className="text-xs text-blue-300 mb-1">Computed X</div>
                <div className="text-3xl font-black text-white">{computedX.toFixed(1)}<span className="text-lg">px</span></div>
              </div>
              <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-4 border border-green-700">
                <div className="text-xs text-green-300 mb-1">Computed Y</div>
                <div className="text-3xl font-black text-white">{computedY.toFixed(1)}<span className="text-lg">px</span></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-4 border border-purple-700">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="font-bold text-white mb-1">Why PCA?</div>
                <div className="text-sm text-purple-200">
                  Similar entities cluster together! PCA reduces attributes (citations, year, collaborations)
                  to 2D coordinates. This makes the expanded view meaningful - related researchers appear near each other.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FILTER CONTROLS DEEP DIVE
// ============================================
function FilterDeepDive() {
  const [lifespan, setLifespan] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);

  const filtered = SAMPLE_STORYLINES.filter(s => {
    if (s.isEgo) return true;
    return s.lifespan >= lifespan && (!crossingOnly || s.crossingCheck);
  });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h4 className="font-bold text-white mb-6">Filter Controls</h4>

          {/* Lifespan Slider */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-400">Lifespan (Years)</span>
              <span className="text-lg font-black text-cyan-400">{lifespan}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={lifespan}
              onChange={(e) => setLifespan(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 year</span>
              <span>20 years</span>
            </div>
          </div>

          {/* Crossing Checkbox */}
          <label className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-750 transition-colors">
            <input
              type="checkbox"
              checked={crossingOnly}
              onChange={(e) => setCrossingOnly(e.target.checked)}
              className="w-6 h-6 rounded-lg"
            />
            <div>
              <div className="font-semibold text-white">Crossing Only</div>
              <div className="text-xs text-slate-400">Show entities that cross the ego line</div>
            </div>
          </label>

          {/* Result count */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900 to-cyan-900 rounded-xl text-center">
            <div className="text-3xl font-black text-white">{filtered.length - 1}</div>
            <div className="text-sm text-purple-200">entities visible</div>
          </div>
        </div>

        {/* Entity List */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h4 className="font-bold text-white mb-4">Entities</h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {SAMPLE_STORYLINES.map((s) => {
              const isVisible = filtered.includes(s);
              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl transition-all ${
                    s.isEgo
                      ? "bg-gradient-to-r from-cyan-900 to-teal-900 border border-cyan-700"
                      : isVisible
                      ? "bg-slate-800 border border-slate-600"
                      : "bg-slate-900 border border-slate-800 opacity-30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className={`font-semibold ${s.isEgo ? "text-cyan-200" : "text-white"}`}>
                        {s.name}
                      </span>
                      {s.isEgo && <span className="text-xs bg-cyan-700 text-cyan-100 px-2 py-0.5 rounded-full">EGO</span>}
                    </div>
                    {!s.isEgo && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">{s.lifespan}y</span>
                        {s.crossingCheck && <span className="text-xs">↕️</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Result */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h4 className="font-bold text-white mb-4">Visualization</h4>
          <svg viewBox="0 0 250 300" className="w-full">
            <text x="10" y="50" fill="#475569" fontSize="12" opacity="0.5">External</text>
            <text x="10" y="250" fill="#475569" fontSize="12" opacity="0.5">Internal</text>

            {/* Ego line */}
            <path d="M30,150 L220,150" stroke="#146b6b" strokeWidth="4" />

            {/* Storylines */}
            {SAMPLE_STORYLINES.filter(s => !s.isEgo).map((s, i) => {
              const isVisible = filtered.includes(s);
              const yVariation = s.crossingCheck ? [60, 240][i % 2] : (i < 3 ? 80 : 220);
              const yEnd = s.crossingCheck ? [240, 60][i % 2] : yVariation;

              return (
                <path
                  key={s.id}
                  d={`M30,${yVariation} C100,${yVariation} 150,${yEnd} 220,${yEnd}`}
                  stroke={s.color}
                  strokeWidth="2"
                  fill="none"
                  opacity={isVisible ? 1 : 0.1}
                  className="transition-opacity duration-300"
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STATE FLOW ANIMATION
// ============================================
function StateFlowAnimation() {
  const [step, setStep] = useState(0);
  const totalSteps = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % totalSteps);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: "User Action", desc: "Click/Hover on element", color: "#8b5cf6", x: 80 },
    { label: "Event Handler", desc: "_lineHover(), _blockUpdate()", color: "#3b82f6", x: 230 },
    { label: "State Update", desc: "this.members, DOM attrs", color: "#10b981", x: 380 },
    { label: "D3 Selection", desc: "ENTITY_SELECTION()", color: "#f59e0b", x: 530 },
    { label: "Visual Change", desc: "CSS classes, transitions", color: "#ef4444", x: 680 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 overflow-x-auto">
        <svg viewBox="0 0 800 180" className="w-full min-w-[600px]">
          {/* Flow line */}
          <path
            d="M80,90 L680,90"
            stroke="#334155"
            strokeWidth="4"
            fill="none"
          />

          {/* Animated pulse */}
          <circle
            cx={steps[step].x}
            cy="90"
            r="30"
            fill={steps[step].color}
            opacity="0.3"
            className="animate-ping"
          />

          {/* Steps */}
          {steps.map((s, i) => (
            <g key={i}>
              {/* Connection dot */}
              <circle
                cx={s.x}
                cy="90"
                r={step === i ? 20 : 12}
                fill={step >= i ? s.color : "#1e293b"}
                stroke={s.color}
                strokeWidth="3"
                className="transition-all duration-500"
              />

              {/* Arrow */}
              {i < steps.length - 1 && (
                <polygon
                  points={`${s.x + 40},85 ${s.x + 55},90 ${s.x + 40},95`}
                  fill={step > i ? "#94a3b8" : "#334155"}
                  className="transition-all duration-300"
                />
              )}

              {/* Label */}
              <text
                x={s.x}
                y="40"
                fill={step === i ? s.color : "#94a3b8"}
                fontSize="12"
                fontWeight={step === i ? "bold" : "normal"}
                textAnchor="middle"
                className="transition-all duration-300"
              >
                {s.label}
              </text>
              <text
                x={s.x}
                y="140"
                fill="#64748b"
                fontSize="9"
                textAnchor="middle"
              >
                {s.desc}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Current step detail */}
      <div
        className="p-6 rounded-2xl border-2 transition-all duration-500"
        style={{ borderColor: steps[step].color, backgroundColor: `${steps[step].color}15` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: steps[step].color }} />
          <h4 className="text-xl font-bold text-white">{steps[step].label}</h4>
        </div>
        <p className="text-slate-300">
          {step === 0 && "The user interacts with the visualization - hovering over a storyline, clicking to pin, or clicking a block to expand."}
          {step === 1 && "The appropriate event handler is called: _lineHover() for hover, _linePin() for click, _blockUpdate() for block interaction."}
          {step === 2 && "State is updated in multiple places: this.members arrays, DOM attributes (pin='1', active='1'), and class instance variables."}
          {step === 3 && "D3 selections (ENTITY_SELECTION, BLOCK_SELECTION, etc.) identify which elements need visual updates based on the state change."}
          {step === 4 && "CSS classes are toggled (.storyline-hover, .storyline-dehighlight) and D3 transitions animate the visual changes smoothly."}
        </p>
      </div>
    </div>
  );
}

// ============================================
// MINI SPREADLINE PLAYGROUND
// ============================================
function MiniSpreadLinePlayground() {
  const [config, setConfig] = useState({
    bandWidth: 100,
    blockWidth: 40,
    showLabels: true,
    showBlocks: true,
    animateLines: false,
  });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <label className="text-xs text-slate-400 block mb-2">Band Width</label>
          <input
            type="range"
            min="60"
            max="140"
            value={config.bandWidth}
            onChange={(e) => setConfig({ ...config, bandWidth: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-cyan-400 font-bold">{config.bandWidth}px</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <label className="text-xs text-slate-400 block mb-2">Block Width</label>
          <input
            type="range"
            min="20"
            max="60"
            value={config.blockWidth}
            onChange={(e) => setConfig({ ...config, blockWidth: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-green-400 font-bold">{config.blockWidth}px</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showLabels}
              onChange={(e) => setConfig({ ...config, showLabels: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="text-white">Show Labels</span>
          </label>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showBlocks}
              onChange={(e) => setConfig({ ...config, showBlocks: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="text-white">Show Blocks</span>
          </label>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <svg viewBox="0 0 800 350" className="w-full bg-slate-950 rounded-xl">
          {/* Direction labels */}
          <text x="30" y="100" fill="#475569" fontSize="20" opacity="0.3">External</text>
          <text x="30" y="280" fill="#475569" fontSize="20" opacity="0.3">Internal</text>

          {/* Time axis */}
          {TIME_LABELS.slice(0, 6).map((label, i) => (
            <g key={label}>
              <text x={80 + i * config.bandWidth} y="40" fill="#94a3b8" fontSize="11" textAnchor="middle">{label}</text>
              <line
                x1={80 + i * config.bandWidth}
                y1="50"
                x2={80 + i * config.bandWidth}
                y2="320"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4"
                opacity="0.5"
              />
            </g>
          ))}

          {/* Ego line */}
          <path
            d={`M80,190 L${80 + 5 * config.bandWidth},190`}
            stroke="#146b6b"
            strokeWidth="5"
            fill="none"
          />
          <polygon points="75,190 85,185 85,195" fill="#146b6b" />
          {config.showLabels && (
            <text x={90 + 5 * config.bandWidth} y="194" fill="#146b6b" fontSize="11" fontWeight="bold">Jeffrey Heer</text>
          )}

          {/* Alter storylines */}
          <path
            d={`M80,120 C${80 + config.bandWidth},120 ${80 + 1.5 * config.bandWidth},260 ${80 + 2 * config.bandWidth},260 C${80 + 2.5 * config.bandWidth},260 ${80 + 3 * config.bandWidth},140 ${80 + 4 * config.bandWidth},140 L${80 + 5 * config.bandWidth},140`}
            stroke="#FA9902"
            strokeWidth="2"
            fill="none"
          />
          {config.showLabels && (
            <text x={90 + 5 * config.bandWidth} y="144" fill="#FA9902" fontSize="10">Ed H. Chi</text>
          )}

          <path
            d={`M${80 + config.bandWidth},280 C${80 + 1.5 * config.bandWidth},280 ${80 + 2 * config.bandWidth},160 ${80 + 3 * config.bandWidth},160 L${80 + 5 * config.bandWidth},160`}
            stroke="#146b6b"
            strokeWidth="2"
            fill="none"
          />
          {config.showLabels && (
            <text x={90 + 5 * config.bandWidth} y="164" fill="#146b6b" fontSize="10">Tamara Munzner</text>
          )}

          {/* Blocks */}
          {config.showBlocks && [0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <rect
                x={80 + i * config.bandWidth - config.blockWidth / 2}
                y="80"
                width={config.blockWidth}
                height="220"
                rx={config.blockWidth / 2}
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
              />
              {/* Points */}
              {[0, 1, 2].map((j) => (
                <circle
                  key={j}
                  cx={80 + i * config.bandWidth}
                  cy={120 + j * 70}
                  r="5"
                  fill={["#fcdaca", "#146b6b", "#e599a6"][j]}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function Design3Page() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: "hero", title: "Overview", icon: "✨" },
    { id: "curves", title: "Bezier Curves", icon: "〰️" },
    { id: "expansion", title: "Block Expansion", icon: "📦" },
    { id: "pca", title: "PCA Positioning", icon: "📍" },
    { id: "filters", title: "Filter Controls", icon: "🎚️" },
    { id: "state", title: "State Flow", icon: "🔄" },
    { id: "playground", title: "Playground", icon: "🎮" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-cyan-900/20 pointer-events-none" />

      {/* Header */}
      <header className="relative sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                SpreadLine Design v3
              </h1>
              <p className="text-sm text-slate-400">The Ultimate Interactive Guide</p>
            </div>
            <div className="flex gap-2">
              {sections.map((section, i) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(i)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    activeSection === i
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span className="mr-1">{section.icon}</span>
                  <span className="hidden md:inline">{section.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section id="hero" className="scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white mb-4">
              Understanding <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">SpreadLine</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              An egocentric dynamic network visualization that shows how influence spreads through time
            </p>
          </div>
          <AnimatedHero />
        </section>

        {/* Bezier Curves */}
        <section id="curves" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">〰️ How Storylines Are Drawn</h2>
            <p className="text-slate-400">Each storyline is a series of cubic Bezier curves. Drag the control points to see how they work!</p>
          </div>
          <BezierCurveBuilder />
        </section>

        {/* Block Expansion */}
        <section id="expansion" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">📦 Block Expansion Animation</h2>
            <p className="text-slate-400">Click a block to see the 4-phase expansion process in action</p>
          </div>
          <BlockExpansionSimulator />
        </section>

        {/* PCA Positioning */}
        <section id="pca" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">📍 Point Contextualization (PCA)</h2>
            <p className="text-slate-400">How points are positioned in expanded blocks using Principal Component Analysis</p>
          </div>
          <PCAPlayground />
        </section>

        {/* Filter Controls */}
        <section id="filters" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">🎚️ Filter Controls Deep Dive</h2>
            <p className="text-slate-400">The lifespan slider and crossing checkbox - how they filter the visualization</p>
          </div>
          <FilterDeepDive />
        </section>

        {/* State Flow */}
        <section id="state" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">🔄 State Management Flow</h2>
            <p className="text-slate-400">How user interactions flow through the system to produce visual changes</p>
          </div>
          <StateFlowAnimation />
        </section>

        {/* Playground */}
        <section id="playground" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">🎮 Mini SpreadLine Playground</h2>
            <p className="text-slate-400">Experiment with configuration values and see how they affect the visualization</p>
          </div>
          <MiniSpreadLinePlayground />
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-slate-800">
          <p className="text-slate-500">SpreadLine: Visualizing Egocentric Dynamic Influence</p>
          <p className="text-sm text-slate-600 mt-2">Design Document v3 - The Ultimate Interactive Guide</p>
        </footer>
      </main>
    </div>
  );
}

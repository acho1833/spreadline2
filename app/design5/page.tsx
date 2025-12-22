"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// SAMPLE DATA
// ============================================
const SAMPLE_STORYLINES = [
  { id: 0, name: "Jeffrey Heer", color: "#146b6b", lifespan: 23, isEgo: true, crossingCheck: true },
  { id: 1, name: "Ed H. Chi", color: "#FA9902", lifespan: 18, isEgo: false, crossingCheck: true },
  { id: 2, name: "Tamara Munzner", color: "#146b6b", lifespan: 15, isEgo: false, crossingCheck: true },
  { id: 3, name: "Ben Shneiderman", color: "#FA9902", lifespan: 12, isEgo: false, crossingCheck: false },
  { id: 4, name: "Mary Czerwinski", color: "#146b6b", lifespan: 8, isEgo: false, crossingCheck: true },
];

const SAMPLE_POINTS = [
  { id: 65, name: "Tara Matthews", label: "60", scaleX: 0.19, scaleY: 0.0 },
  { id: 64, name: "Jason I. Hong", label: "60", scaleX: 0.39, scaleY: 0.35 },
  { id: 63, name: "James A. Landay", label: "60", scaleX: 0.51, scaleY: 0.32 },
  { id: 2, name: "Jeffrey Heer", label: "295", scaleX: 0.52, scaleY: 0.58 },
  { id: 1, name: "Ed Huai-hsin Chi", label: "95", scaleX: 0.79, scaleY: 0.65 },
];

const TIME_LABELS = ["2002", "2004", "2006", "2008", "2010", "2012", "2014"];

// ============================================
// ANIMATED HERO WITH PHASE CONTROL
// ============================================
function AnimatedHero() {
  const [phase, setPhase] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);
  const [blockProgress, setBlockProgress] = useState(0);

  const phases = [
    { name: "Start", desc: "Empty canvas" },
    { name: "Time Axis", desc: "Year markers appear" },
    { name: "Ego Line", desc: "The central person's timeline" },
    { name: "Storylines", desc: "Other people's paths" },
    { name: "Blocks", desc: "Interaction points at each time" },
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 5);
    }, 2500);
    return () => clearInterval(interval);
  }, [autoPlay]);

  // Block expansion animation
  useEffect(() => {
    if (expandedBlock !== null) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.04;
        if (progress >= 1) {
          progress = 1;
          clearInterval(interval);
        }
        setBlockProgress(progress);
      }, 20);
      return () => clearInterval(interval);
    } else {
      setBlockProgress(0);
    }
  }, [expandedBlock]);

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const animProgress = easeOut(blockProgress);
  const blockMoveX = 140;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            autoPlay ? "bg-green-500 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          {autoPlay ? "Auto" : "Manual"}
        </button>

        {phases.map((p, i) => (
          <button
            key={i}
            onClick={() => { setAutoPlay(false); setPhase(i); setExpandedBlock(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              phase === i
                ? "bg-cyan-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {i + 1}. {p.name}
          </button>
        ))}
      </div>

      {/* Current Phase Info */}
      <div className="mb-4 p-3 bg-slate-800 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg">
          {phase + 1}
        </div>
        <div>
          <div className="text-white font-bold">{phases[phase].name}</div>
          <div className="text-slate-400 text-sm">{phases[phase].desc}</div>
        </div>
      </div>

      {/* Main SVG */}
      <svg viewBox="0 0 800 380" className="w-full bg-slate-950 rounded-xl">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Direction Labels - LEFT SIDE */}
        <text x="15" y="100" fill="#64748b" fontSize="24" fontWeight="bold" opacity="0.3">External</text>
        <text x="15" y="300" fill="#64748b" fontSize="24" fontWeight="bold" opacity="0.3">Internal</text>

        {/* Phase 1: Time Axis */}
        {phase >= 1 && TIME_LABELS.map((year, i) => {
          const baseX = 120 + i * 95;
          const shiftX = expandedBlock !== null && i > 1 ? animProgress * blockMoveX : 0;
          return (
            <g key={year} className="transition-all duration-500" style={{ opacity: phase >= 1 ? 1 : 0 }}>
              <text x={baseX + shiftX} y="45" fill="#94a3b8" fontSize="13" textAnchor="middle" fontWeight="bold">{year}</text>
              <line x1={baseX + shiftX} y1="55" x2={baseX + shiftX} y2="340" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
            </g>
          );
        })}

        {/* Phase 2: EGO LINE - THE MAIN CHARACTER */}
        {phase >= 2 && (
          <g>
            {/* Ego line - thick and prominent */}
            <path
              d={`M120,200 L${690 + (expandedBlock !== null ? animProgress * blockMoveX : 0)},200`}
              stroke="#146b6b"
              strokeWidth="8"
              fill="none"
              filter="url(#glow)"
              className="transition-all duration-700"
              strokeLinecap="round"
            />
            {/* Start triangle marker */}
            <polygon points="115,200 130,192 130,208" fill="#146b6b" />
            {/* LEFT side label */}
            <text x="105" y="205" fill="#146b6b" fontSize="13" fontWeight="bold" textAnchor="end">Jeffrey Heer</text>
            <text x="105" y="220" fill="#146b6b" fontSize="10" textAnchor="end" opacity="0.7">(Ego)</text>
          </g>
        )}

        {/* Phase 3: ALTER STORYLINES - Other people */}
        {phase >= 3 && (
          <g>
            {/* Ed H. Chi - crosses ego line */}
            <path
              d={`M120,120 C200,120 250,280 350,280 C450,280 500,140 ${600 + (expandedBlock !== null ? animProgress * blockMoveX : 0)},140`}
              stroke="#FA9902"
              strokeWidth="3"
              fill="none"
              opacity="0.8"
            />
            <polygon points="115,120 130,112 130,128" fill="#FA9902" />
            <text x="105" y="125" fill="#FA9902" fontSize="11" textAnchor="end">Ed H. Chi</text>

            {/* Tamara Munzner */}
            <path
              d={`M200,280 C300,280 350,160 450,160 L${600 + (expandedBlock !== null ? animProgress * blockMoveX : 0)},160`}
              stroke="#146b6b"
              strokeWidth="2"
              fill="none"
              opacity="0.7"
            />
            <polygon points="195,280 210,272 210,288" fill="#146b6b" />
            <text x="185" y="285" fill="#146b6b" fontSize="10" textAnchor="end">Tamara M.</text>

            {/* Ben Shneiderman */}
            <path
              d={`M280,100 C360,100 400,100 ${500 + (expandedBlock !== null ? animProgress * blockMoveX : 0)},100`}
              stroke="#FA9902"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <polygon points="275,100 290,92 290,108" fill="#FA9902" />
            <text x="265" y="105" fill="#FA9902" fontSize="10" textAnchor="end">Ben S.</text>
          </g>
        )}

        {/* Phase 4: BLOCKS - Interaction points */}
        {phase >= 4 && [0, 1, 2, 3].map((blockIdx) => {
          const baseX = 120 + blockIdx * 95 + 95;
          const isExpanded = expandedBlock === blockIdx;
          const shiftX = expandedBlock !== null && blockIdx > expandedBlock ? animProgress * blockMoveX : 0;
          const expandWidth = isExpanded ? animProgress * blockMoveX : 0;

          return (
            <g
              key={blockIdx}
              className="cursor-pointer transition-all"
              onClick={() => setExpandedBlock(isExpanded ? null : blockIdx)}
            >
              {/* White background when expanded */}
              {isExpanded && (
                <rect
                  x={baseX - 15}
                  y="80"
                  width={30 + expandWidth}
                  height="220"
                  rx="15"
                  fill="white"
                  opacity={animProgress * 0.95}
                />
              )}

              {/* Left arc */}
              <path
                d={`M${baseX + shiftX},80 A15,15,0,0,0,${baseX - 15 + shiftX},95 L${baseX - 15 + shiftX},285 A15,15,0,0,0,${baseX + shiftX},300`}
                stroke={isExpanded ? "#3b82f6" : "#64748b"}
                strokeWidth="2"
                fill="none"
              />

              {/* Right arc */}
              <path
                d={`M${baseX + expandWidth + shiftX},80 A15,15,0,0,1,${baseX + 15 + expandWidth + shiftX},95 L${baseX + 15 + expandWidth + shiftX},285 A15,15,0,0,1,${baseX + expandWidth + shiftX},300`}
                stroke={isExpanded ? "#3b82f6" : "#64748b"}
                strokeWidth="2"
                fill="none"
              />

              {/* Top/bottom bars when expanded */}
              {isExpanded && expandWidth > 10 && (
                <>
                  <line x1={baseX + shiftX} y1="80" x2={baseX + expandWidth + shiftX} y2="80" stroke="#3b82f6" strokeWidth="2" />
                  <line x1={baseX + shiftX} y1="300" x2={baseX + expandWidth + shiftX} y2="300" stroke="#3b82f6" strokeWidth="2" />
                </>
              )}

              {/* Points inside block */}
              {SAMPLE_POINTS.slice(0, 4).map((point, j) => {
                const px = isExpanded
                  ? baseX + point.scaleX * expandWidth * 0.85 + shiftX
                  : baseX + shiftX;
                const py = isExpanded
                  ? 100 + point.scaleY * 180 * animProgress + (1 - animProgress) * j * 45
                  : 110 + j * 45;

                return (
                  <circle
                    key={point.id}
                    cx={px}
                    cy={py}
                    r={point.name === "Jeffrey Heer" ? 8 : 6}
                    fill={["#fcdaca", "#e599a6", "#c94b77", "#146b6b"][j]}
                  />
                );
              })}

              {/* Click hint */}
              {!isExpanded && (
                <text x={baseX + shiftX} y="320" fill="#64748b" fontSize="9" textAnchor="middle">Click me</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-[#146b6b] rounded"></div>
          <span className="text-slate-400">Collaborator</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-[#FA9902] rounded"></div>
          <span className="text-slate-400">Colleague</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-slate-500"></div>
          <span className="text-slate-400">Block (click to expand)</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// BLOCK EXPANSION - CLICKABLE PHASES
// ============================================
function BlockExpansionDemo() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      name: "Collapsed",
      desc: "Block shows stacked points at one position",
      shiftAmount: 0,
      extendAmount: 0,
      expandAmount: 0,
      positionAmount: 0,
    },
    {
      name: "Shift",
      desc: "Everything to the RIGHT moves over to make room",
      shiftAmount: 1,
      extendAmount: 0,
      expandAmount: 0,
      positionAmount: 0,
    },
    {
      name: "Extend",
      desc: "Storylines stretch with dotted lines to stay connected",
      shiftAmount: 1,
      extendAmount: 1,
      expandAmount: 0,
      positionAmount: 0,
    },
    {
      name: "Expand",
      desc: "Block outline grows wider with top/bottom bars",
      shiftAmount: 1,
      extendAmount: 1,
      expandAmount: 1,
      positionAmount: 0,
    },
    {
      name: "Position",
      desc: "Points spread out based on their attributes (using PCA)",
      shiftAmount: 1,
      extendAmount: 1,
      expandAmount: 1,
      positionAmount: 1,
    },
  ];

  const step = steps[currentStep];
  const moveX = 160;

  return (
    <div className="space-y-6">
      {/* Step buttons */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-4">Click each step to see what happens:</h4>
        <div className="flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`px-5 py-3 rounded-xl font-bold transition-all ${
                currentStep === i
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {i}. {s.name}
            </button>
          ))}
        </div>

        {/* Current step explanation */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl border border-blue-700">
          <div className="text-xl font-bold text-white mb-1">{step.name}</div>
          <div className="text-blue-200">{step.desc}</div>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <svg viewBox="0 0 700 300" className="w-full bg-slate-950 rounded-xl">
          {/* Labels - LEFT */}
          <text x="15" y="70" fill="#64748b" fontSize="12" opacity="0.5">External</text>
          <text x="15" y="250" fill="#64748b" fontSize="12" opacity="0.5">Internal</text>

          {/* Time labels */}
          {["t0", "t1", "t2", "t3"].map((t, i) => {
            const shiftX = i > 1 ? step.shiftAmount * moveX : (i === 1 ? step.shiftAmount * moveX / 2 : 0);
            return (
              <text key={t} x={80 + i * 100 + shiftX} y="25" fill="#94a3b8" fontSize="12" textAnchor="middle">{t}</text>
            );
          })}

          {/* Ego line - extends */}
          <path
            d={`M50,150 L${300 + step.shiftAmount * moveX},150`}
            stroke="#146b6b"
            strokeWidth="5"
            fill="none"
          />
          <polygon points="45,150 55,145 55,155" fill="#146b6b" />
          <text x="40" y="154" fill="#146b6b" fontSize="10" fontWeight="bold" textAnchor="end">Ego</text>

          {/* Dummy extension line (step 2) */}
          {step.extendAmount > 0 && (
            <path
              d={`M80,100 L${80 + step.extendAmount * moveX},100`}
              stroke="#FA9902"
              strokeWidth="2"
              strokeDasharray="6 3"
              fill="none"
              opacity="0.8"
            />
          )}

          {/* Storyline that shifts */}
          <path
            d={`M${180 + step.shiftAmount * moveX},90 C${220 + step.shiftAmount * moveX},90 ${250 + step.shiftAmount * moveX},220 ${300 + step.shiftAmount * moveX},220`}
            stroke="#FA9902"
            strokeWidth="2"
            fill="none"
          />

          {/* THE BLOCK */}
          <g>
            {/* White background (step 3+) */}
            {step.expandAmount > 0 && (
              <rect
                x={65}
                y="50"
                width={30 + step.expandAmount * moveX}
                height="200"
                rx="15"
                fill="white"
                opacity="0.95"
              />
            )}

            {/* Left arc */}
            <path
              d="M80,50 A15,15,0,0,0,65,65 L65,235 A15,15,0,0,0,80,250"
              stroke={step.expandAmount > 0 ? "#3b82f6" : "#64748b"}
              strokeWidth="2"
              fill="none"
            />

            {/* Right arc */}
            <path
              d={`M${80 + step.expandAmount * moveX},50 A15,15,0,0,1,${95 + step.expandAmount * moveX},65 L${95 + step.expandAmount * moveX},235 A15,15,0,0,1,${80 + step.expandAmount * moveX},250`}
              stroke={step.expandAmount > 0 ? "#3b82f6" : "#64748b"}
              strokeWidth="2"
              fill="none"
            />

            {/* Top bar (step 3+) */}
            {step.expandAmount > 0 && (
              <line x1="80" y1="50" x2={80 + step.expandAmount * moveX} y2="50" stroke="#3b82f6" strokeWidth="2" />
            )}

            {/* Bottom bar (step 3+) */}
            {step.expandAmount > 0 && (
              <line x1="80" y1="250" x2={80 + step.expandAmount * moveX} y2="250" stroke="#3b82f6" strokeWidth="2" />
            )}

            {/* Points */}
            {SAMPLE_POINTS.slice(0, 5).map((point, i) => {
              const collapsedX = 80;
              const collapsedY = 70 + i * 35;
              const expandedX = 80 + point.scaleX * moveX * 0.85 * step.positionAmount;
              const expandedY = 60 + point.scaleY * 170 * step.positionAmount + (1 - step.positionAmount) * i * 35;

              return (
                <g key={point.id}>
                  <circle
                    cx={expandedX || collapsedX}
                    cy={expandedY || collapsedY}
                    r={point.name === "Jeffrey Heer" ? 8 : 6}
                    fill={["#fcdaca", "#e599a6", "#c94b77", "#146b6b", "#740980"][i]}
                    stroke={step.positionAmount > 0 ? "#000" : "none"}
                    strokeWidth="1"
                  />
                  {step.positionAmount > 0.5 && (
                    <text
                      x={expandedX + 12}
                      y={expandedY + 4}
                      fill="#333"
                      fontSize="9"
                    >
                      {point.name.split(' ')[0]}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* What's happening indicator */}
      <div className="grid grid-cols-4 gap-2">
        {["Shift Right", "Extend Lines", "Expand Block", "Position Points"].map((action, i) => {
          const isActive = [step.shiftAmount, step.extendAmount, step.expandAmount, step.positionAmount][i] > 0;
          return (
            <div
              key={action}
              className={`p-3 rounded-xl text-center text-sm font-semibold transition-all ${
                isActive ? "bg-green-500 text-white" : "bg-slate-800 text-slate-500"
              }`}
            >
              {isActive ? "✓" : "○"} {action}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// PCA PLAYGROUND WITH MOVEY
// ============================================
function PCAPlayground() {
  const [selectedPoint, setSelectedPoint] = useState(0);
  const [blockWidth, setBlockWidth] = useState(180);
  const [blockHeight, setBlockHeight] = useState(180);

  const computeX = (scaleX: number) => 30 + scaleX * blockWidth * 0.85;
  const computeY = (scaleY: number) => 30 + scaleY * blockHeight * 0.85;

  const point = SAMPLE_POINTS[selectedPoint];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Visual */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-4">Point Positions in Expanded Block</h4>

        <svg viewBox="0 0 260 260" className="w-full bg-white rounded-xl">
          {/* Block boundary */}
          <rect
            x="20"
            y="20"
            width={blockWidth + 20}
            height={blockHeight + 20}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            rx="10"
          />

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v} opacity="0.3">
              <line x1={30 + v * blockWidth * 0.85} y1="25" x2={30 + v * blockWidth * 0.85} y2={35 + blockHeight} stroke="#ccc" strokeDasharray="2" />
              <line x1="25" y1={30 + v * blockHeight * 0.85} x2={35 + blockWidth} y2={30 + v * blockHeight * 0.85} stroke="#ccc" strokeDasharray="2" />
            </g>
          ))}

          {/* All points */}
          {SAMPLE_POINTS.map((p, i) => {
            const isSelected = i === selectedPoint;
            return (
              <g key={p.id} onClick={() => setSelectedPoint(i)} className="cursor-pointer">
                <circle
                  cx={computeX(p.scaleX)}
                  cy={computeY(p.scaleY)}
                  r={isSelected ? 14 : 10}
                  fill={["#fcdaca", "#e599a6", "#c94b77", "#146b6b", "#740980"][i]}
                  stroke={isSelected ? "#000" : "none"}
                  strokeWidth="3"
                />
                <text
                  x={computeX(p.scaleX)}
                  y={computeY(p.scaleY) - 18}
                  fill="#333"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {p.name.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={30 + blockWidth * 0.4} y={55 + blockHeight} fill="#666" fontSize="10" textAnchor="middle">X Position (scaleX)</text>
          <text x="12" y={30 + blockHeight * 0.5} fill="#666" fontSize="10" textAnchor="middle" transform={`rotate(-90, 12, ${30 + blockHeight * 0.5})`}>Y Position (scaleY)</text>
        </svg>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h4 className="text-white font-bold mb-4">Selected: {point.name}</h4>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">scaleX</div>
              <div className="text-2xl font-bold text-blue-400">{point.scaleX.toFixed(2)}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">scaleY</div>
              <div className="text-2xl font-bold text-green-400">{point.scaleY.toFixed(2)}</div>
            </div>
          </div>

          {/* Block Width (moveX) */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-slate-400 text-sm">Block Width (moveX)</span>
              <span className="text-blue-400 font-bold">{blockWidth}px</span>
            </div>
            <input
              type="range"
              min="100"
              max="220"
              value={blockWidth}
              onChange={(e) => setBlockWidth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Block Height (moveY) */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-slate-400 text-sm">Block Height (moveY)</span>
              <span className="text-green-400 font-bold">{blockHeight}px</span>
            </div>
            <input
              type="range"
              min="100"
              max="220"
              value={blockHeight}
              onChange={(e) => setBlockHeight(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-900/50 rounded-xl p-3 text-center border border-blue-700">
              <div className="text-blue-300 text-xs mb-1">Final X</div>
              <div className="text-xl font-bold text-white">{computeX(point.scaleX).toFixed(0)}px</div>
            </div>
            <div className="bg-green-900/50 rounded-xl p-3 text-center border border-green-700">
              <div className="text-green-300 text-xs mb-1">Final Y</div>
              <div className="text-xl font-bold text-white">{computeY(point.scaleY).toFixed(0)}px</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-700">
          <div className="text-white font-bold mb-2">Why does this matter?</div>
          <div className="text-purple-200 text-sm">
            Similar researchers (by citations, publications, collaborations) get similar scaleX/scaleY values.
            When the block expands, they cluster together - making patterns visible!
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SIMPLIFIED FILTER CONTROLS
// ============================================
function FilterControls() {
  const [minYears, setMinYears] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);

  const visible = SAMPLE_STORYLINES.filter(s => {
    if (s.isEgo) return true;
    return s.lifespan >= minYears && (!crossingOnly || s.crossingCheck);
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Minimum Years Active</span>
              <span className="text-3xl font-black text-cyan-400">{minYears}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={minYears}
              onChange={(e) => setMinYears(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-full"
            />
            <div className="text-slate-500 text-sm mt-1">Only show people active for at least {minYears} year{minYears > 1 ? 's' : ''}</div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center">
            <label className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl cursor-pointer w-full">
              <input
                type="checkbox"
                checked={crossingOnly}
                onChange={(e) => setCrossingOnly(e.target.checked)}
                className="w-6 h-6 accent-cyan-500"
              />
              <div>
                <div className="text-white font-semibold">Crossing Only</div>
                <div className="text-slate-400 text-sm">People who cross the ego line</div>
              </div>
            </label>
          </div>

          {/* Count */}
          <div className="flex items-center justify-center">
            <div className="text-center p-4 bg-gradient-to-r from-purple-900 to-cyan-900 rounded-xl w-full">
              <div className="text-4xl font-black text-white">{visible.length - 1}</div>
              <div className="text-purple-200">people showing</div>
            </div>
          </div>
        </div>
      </div>

      {/* SpreadLine Preview */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-4">Filtered SpreadLine Preview</h4>

        <svg viewBox="0 0 800 220" className="w-full bg-slate-950 rounded-xl">
          {/* Direction labels - LEFT */}
          <text x="15" y="50" fill="#64748b" fontSize="12" opacity="0.5">External</text>
          <text x="15" y="180" fill="#64748b" fontSize="12" opacity="0.5">Internal</text>

          {/* Time axis */}
          {TIME_LABELS.map((year, i) => (
            <g key={year}>
              <text x={100 + i * 95} y="20" fill="#94a3b8" fontSize="10" textAnchor="middle">{year}</text>
              <line x1={100 + i * 95} y1="28" x2={100 + i * 95} y2="200" stroke="#334155" strokeDasharray="3" opacity="0.3" />
            </g>
          ))}

          {/* Ego line */}
          <path d="M100,110 L720,110" stroke="#146b6b" strokeWidth="5" fill="none" />
          <polygon points="95,110 110,103 110,117" fill="#146b6b" />
          <text x="85" y="114" fill="#146b6b" fontSize="11" fontWeight="bold" textAnchor="end">Ego</text>

          {/* Storylines */}
          {SAMPLE_STORYLINES.filter(s => !s.isEgo).map((s, i) => {
            const isVisible = visible.includes(s);
            const startY = s.crossingCheck ? [50, 170][i % 2] : (i < 2 ? 70 : 150);
            const endY = s.crossingCheck ? [170, 50][i % 2] : startY;
            const startX = 100 + i * 40;

            return (
              <g key={s.id}>
                <path
                  d={`M${startX},${startY} C${startX + 150},${startY} ${startX + 300},${endY} 720,${endY}`}
                  stroke={s.color}
                  strokeWidth="2"
                  fill="none"
                  opacity={isVisible ? 1 : 0.1}
                  className="transition-opacity duration-500"
                />
                <polygon
                  points={`${startX - 5},${startY} ${startX + 10},${startY - 7} ${startX + 10},${startY + 7}`}
                  fill={s.color}
                  opacity={isVisible ? 1 : 0.1}
                  className="transition-opacity duration-500"
                />
                {/* LEFT side label */}
                <text
                  x={startX - 15}
                  y={startY + 4}
                  fill={s.color}
                  fontSize="9"
                  textAnchor="end"
                  opacity={isVisible ? 1 : 0.15}
                  className="transition-opacity duration-500"
                >
                  {s.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Entity list */}
        <div className="mt-4 flex flex-wrap gap-2">
          {SAMPLE_STORYLINES.map((s) => {
            const isVisible = visible.includes(s);
            return (
              <div
                key={s.id}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  s.isEgo
                    ? "bg-cyan-900 border border-cyan-700"
                    : isVisible
                    ? "bg-slate-800"
                    : "bg-slate-900 opacity-30"
                }`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className={`text-sm ${s.isEgo ? "text-cyan-200 font-bold" : "text-white"}`}>
                  {s.name}
                </span>
                {!s.isEgo && <span className="text-slate-500 text-xs">{s.lifespan}y</span>}
                {s.crossingCheck && !s.isEgo && <span className="text-xs">↕</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STATE MANAGEMENT - SIMPLE EVERYDAY ANALOGY
// ============================================
function HowItWorks() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);

  const scenarios = [
    {
      name: "Hover over a line",
      icon: "👆",
      everyday: "Like pointing at someone in a group photo",
      steps: [
        { action: "You point", visual: "mouse-hover", result: "SpreadLine sees your mouse" },
        { action: "That person highlighted", visual: "line-bright", result: "The storyline gets brighter" },
        { action: "Others fade", visual: "others-dim", result: "Other lines become dimmer" },
        { action: "You see clearly", visual: "focused", result: "Now you can focus on that person!" },
      ],
    },
    {
      name: "Click to pin",
      icon: "📌",
      everyday: "Like putting a sticky note on something important",
      steps: [
        { action: "You click", visual: "click", result: "SpreadLine remembers your choice" },
        { action: "Line stays highlighted", visual: "pinned", result: "Even when you move away, it stays visible" },
        { action: "Click again to unpin", visual: "unpin", result: "The sticky note comes off" },
      ],
    },
    {
      name: "Expand a block",
      icon: "📦",
      everyday: "Like opening a folder to see what's inside",
      steps: [
        { action: "Click the block", visual: "click-block", result: "SpreadLine knows you want details" },
        { action: "Block opens up", visual: "expanding", result: "Everything shifts to make room" },
        { action: "See the connections", visual: "see-points", result: "Now you can see who interacted when!" },
      ],
    },
    {
      name: "Use the filter",
      icon: "🎚️",
      everyday: "Like adjusting a TV's brightness",
      steps: [
        { action: "Move the slider", visual: "slider", result: "SpreadLine checks each person" },
        { action: "Some disappear", visual: "filtering", result: "People below the threshold fade out" },
        { action: "Cleaner view", visual: "filtered", result: "Easier to see the important relationships!" },
      ],
    },
  ];

  const scenario = scenarios[selectedScenario];

  // Animate through steps
  useEffect(() => {
    setAnimationStep(0);
    const steps = scenario.steps.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      if (current >= steps) {
        current = 0;
      }
      setAnimationStep(current);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedScenario, scenario.steps.length]);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-2xl p-6 border border-purple-700">
        <h3 className="text-2xl font-bold text-white mb-2">How Does SpreadLine Respond to You?</h3>
        <p className="text-purple-200">
          When you interact with SpreadLine, it's like having a conversation.
          You do something, and it responds to help you understand the data better.
        </p>
      </div>

      {/* Scenario selector */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-4">Choose an interaction to learn about:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scenarios.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedScenario(i)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedScenario === i
                  ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-semibold text-sm">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected scenario detail */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl">{scenario.icon}</div>
          <div>
            <h4 className="text-2xl font-bold text-white">{scenario.name}</h4>
            <p className="text-cyan-400">{scenario.everyday}</p>
          </div>
        </div>

        {/* Step-by-step animation */}
        <div className="space-y-3">
          {scenario.steps.map((step, i) => {
            const isActive = animationStep === i;
            const isPast = animationStep > i;

            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-900 to-blue-900 border-2 border-cyan-500 scale-[1.02]"
                    : isPast
                    ? "bg-slate-800 opacity-60"
                    : "bg-slate-800/50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all ${
                    isActive
                      ? "bg-cyan-500 text-white scale-110"
                      : isPast
                      ? "bg-green-600 text-white"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {isPast ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${isActive ? "text-white text-lg" : "text-slate-300"}`}>
                    {step.action}
                  </div>
                  <div className={`text-sm ${isActive ? "text-cyan-300" : "text-slate-500"}`}>
                    {step.result}
                  </div>
                </div>
                {isActive && (
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple summary */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h4 className="text-white font-bold mb-3">In Simple Terms:</h4>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-900 rounded-xl">
            <div className="text-3xl mb-2">👆</div>
            <div className="text-white font-semibold">You Do Something</div>
            <div className="text-slate-400 text-sm">hover, click, drag</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-white font-semibold">SpreadLine Notices</div>
            <div className="text-slate-400 text-sm">processes your action</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-white font-semibold">View Updates</div>
            <div className="text-slate-400 text-sm">highlights, expands, filters</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// BEZIER CURVES
// ============================================
function BezierDemo() {
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
    setPoints(prev => ({
      ...prev,
      [dragging]: { x: Math.max(0, Math.min(400, x)), y: Math.max(0, Math.min(300, y)) }
    }));
  }, [dragging]);

  const pathD = `M${points.start.x},${points.start.y} C${points.control1.x},${points.control1.y} ${points.control2.x},${points.control2.y} ${points.end.x},${points.end.y}`;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-2">Drag the dots to shape the curve!</h4>
        <p className="text-slate-400 text-sm mb-4">This is how storylines are drawn</p>

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
          <path d={pathD} stroke="#22d3ee" strokeWidth="4" fill="none" />

          {/* Draggable points */}
          <circle cx={points.start.x} cy={points.start.y} r="14" fill="#22c55e" className="cursor-grab" onMouseDown={() => setDragging("start")} />
          <circle cx={points.control1.x} cy={points.control1.y} r="12" fill="#f472b6" className="cursor-grab" onMouseDown={() => setDragging("control1")} />
          <circle cx={points.control2.x} cy={points.control2.y} r="12" fill="#a78bfa" className="cursor-grab" onMouseDown={() => setDragging("control2")} />
          <circle cx={points.end.x} cy={points.end.y} r="14" fill="#ef4444" className="cursor-grab" onMouseDown={() => setDragging("end")} />

          {/* Labels */}
          <text x={points.start.x} y={points.start.y - 20} fill="#22c55e" fontSize="12" textAnchor="middle" fontWeight="bold">Start</text>
          <text x={points.control1.x} y={points.control1.y - 18} fill="#f472b6" fontSize="11" textAnchor="middle">Curve 1</text>
          <text x={points.control2.x} y={points.control2.y + 25} fill="#a78bfa" fontSize="11" textAnchor="middle">Curve 2</text>
          <text x={points.end.x} y={points.end.y - 20} fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">End</text>
        </svg>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-4">What You're Creating</h4>

        <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm mb-4">
          <div className="text-slate-500 mb-2">// This is the path data:</div>
          <div className="text-cyan-400">d = "</div>
          <div className="pl-4 text-green-400">M{points.start.x.toFixed(0)},{points.start.y.toFixed(0)}</div>
          <div className="pl-4 text-pink-400">C{points.control1.x.toFixed(0)},{points.control1.y.toFixed(0)}</div>
          <div className="pl-4 text-purple-400">{points.control2.x.toFixed(0)},{points.control2.y.toFixed(0)}</div>
          <div className="pl-4 text-red-400">{points.end.x.toFixed(0)},{points.end.y.toFixed(0)}</div>
          <div className="text-cyan-400">"</div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-white">Start = Where the storyline begins</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
            <div className="w-4 h-4 rounded-full bg-pink-500"></div>
            <span className="text-white">Curve 1 = Pulls the line in this direction</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-white">Curve 2 = Pulls from the other end</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-white">End = Where the storyline ends</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function Design5Page() {
  const sections = [
    { id: "overview", title: "Overview", icon: "✨" },
    { id: "curves", title: "Curves", icon: "〰️" },
    { id: "blocks", title: "Blocks", icon: "📦" },
    { id: "positions", title: "Positions", icon: "📍" },
    { id: "filters", title: "Filters", icon: "🎚️" },
    { id: "how", title: "How It Works", icon: "💡" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-cyan-900/20 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                SpreadLine Guide
              </h1>
              <p className="text-xs text-slate-500">Interactive Visualization Explained</p>
            </div>
            <div className="flex gap-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <span className="mr-1">{s.icon}</span>
                  <span className="hidden sm:inline">{s.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-6xl mx-auto px-4 py-8 space-y-16">
        {/* Overview */}
        <section id="overview" className="scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-3">
              Understanding <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">SpreadLine</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              SpreadLine shows how one person (the "ego") connects with others over time.
              Watch the animation or click each phase to learn how it's built!
            </p>
          </div>
          <AnimatedHero />
        </section>

        {/* Curves */}
        <section id="curves" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">〰️ How Lines Are Drawn</h2>
            <p className="text-slate-400">Each storyline is a smooth curve. Drag the control points to see how it works!</p>
          </div>
          <BezierDemo />
        </section>

        {/* Blocks */}
        <section id="blocks" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">📦 Block Expansion</h2>
            <p className="text-slate-400">Click each step to see how blocks open up to reveal detailed information</p>
          </div>
          <BlockExpansionDemo />
        </section>

        {/* Positions */}
        <section id="positions" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">📍 Point Positioning</h2>
            <p className="text-slate-400">When a block expands, points spread out based on their attributes. Drag the sliders!</p>
          </div>
          <PCAPlayground />
        </section>

        {/* Filters */}
        <section id="filters" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">🎚️ Filter Controls</h2>
            <p className="text-slate-400">Use sliders and checkboxes to focus on what matters</p>
          </div>
          <FilterControls />
        </section>

        {/* How It Works */}
        <section id="how" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">💡 How SpreadLine Responds</h2>
            <p className="text-slate-400">Understanding the conversation between you and the visualization</p>
          </div>
          <HowItWorks />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-800">
          <p className="text-slate-500">SpreadLine: Visualizing Egocentric Dynamic Influence</p>
          <p className="text-slate-600 text-sm mt-1">Design v5 - The Friendly Interactive Guide</p>
        </footer>
      </main>
    </div>
  );
}

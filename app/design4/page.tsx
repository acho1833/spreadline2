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

const TIME_LABELS = ["2002", "2004", "2006", "2008", "2010", "2012", "2014", "2016", "2018", "2020"];

// ============================================
// ANIMATED HERO WITH MANUAL PHASE CONTROL
// ============================================
function AnimatedHero() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const phases = [
    { id: 0, name: "Initial", desc: "Empty canvas ready for visualization" },
    { id: 1, name: "Time Axis", desc: "Temporal grid appears with year markers" },
    { id: 2, name: "Ego Line", desc: "Central ego (Jeffrey Heer) line draws" },
    { id: 3, name: "Storylines", desc: "Alter storylines appear showing relationships" },
    { id: 4, name: "Blocks", desc: "Timestep blocks with interaction points" },
    { id: 5, name: "Block Expansion", desc: "Click a block to see detailed PCA view" },
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % phases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoPlay, phases.length]);

  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);
  const [blockAnimProgress, setBlockAnimProgress] = useState(0);

  useEffect(() => {
    if (expandedBlock !== null) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.03;
        if (progress >= 1) {
          progress = 1;
          clearInterval(interval);
        }
        setBlockAnimProgress(progress);
      }, 16);
      return () => clearInterval(interval);
    } else {
      setBlockAnimProgress(0);
    }
  }, [expandedBlock]);

  const storylineData = [
    { id: 1, path: "M80,200 L200,200 C250,200 280,120 350,120 C420,120 450,180 520,180 C590,180 620,140 720,140", color: "#FA9902", name: "Ed H. Chi" },
    { id: 2, path: "M80,280 C150,280 200,320 280,320 C360,320 400,240 480,240 C560,240 600,280 720,280", color: "#146b6b", name: "Tamara Munzner" },
    { id: 3, path: "M200,160 C280,160 320,100 400,100 C480,100 520,160 600,160 L720,160", color: "#FA9902", name: "Ben Shneiderman" },
  ];

  const easeOutQuad = (t: number) => t * (2 - t);
  const easedBlockProgress = easeOutQuad(blockAnimProgress);
  const moveX = 150;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-1">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl" />

      <div className="relative bg-slate-950/80 backdrop-blur-xl rounded-[22px] p-8">
        {/* Phase Control Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              autoPlay
                ? "bg-green-500 text-white"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            {autoPlay ? "Auto Playing" : "Manual Mode"}
          </button>
          <div className="h-6 w-px bg-slate-600 mx-2" />
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => {
                setAutoPlay(false);
                setAnimationPhase(phase.id);
                if (phase.id < 5) setExpandedBlock(null);
              }}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                animationPhase === phase.id
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {phase.name}
            </button>
          ))}
        </div>

        {/* Phase Description */}
        <div className="mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse" />
            <span className="text-cyan-400 font-semibold">{phases[animationPhase].name}:</span>
            <span className="text-slate-300">{phases[animationPhase].desc}</span>
          </div>
        </div>

        <svg viewBox="0 0 800 400" className="w-full">
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

          {/* Direction labels - LEFT SIDE */}
          <text x="10" y="100" fill="#475569" fontSize="14" fontWeight="bold" opacity="0.5">External</text>
          <text x="10" y="340" fill="#475569" fontSize="14" fontWeight="bold" opacity="0.5">Internal</text>

          {/* Time labels */}
          {TIME_LABELS.slice(0, 7).map((label, i) => (
            <g key={label} opacity={animationPhase >= 1 ? 1 : 0} className="transition-opacity duration-1000">
              <text x={80 + i * 100} y="50" fill="#94a3b8" fontSize="12" textAnchor="middle">{label}</text>
              <line x1={80 + i * 100} y1="60" x2={80 + i * 100} y2="360" stroke="#334155" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
            </g>
          ))}

          {/* Ego line */}
          <g>
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
            {/* LEFT side label for ego */}
            <text
              x="60"
              y="224"
              fill="#146b6b"
              fontSize="11"
              fontWeight="bold"
              textAnchor="end"
              opacity={animationPhase >= 2 ? 1 : 0}
              className="transition-opacity duration-500"
            >
              Jeffrey Heer
            </text>
            <polygon
              points="75,220 85,215 85,225"
              fill="#146b6b"
              opacity={animationPhase >= 2 ? 1 : 0}
              className="transition-opacity duration-500"
            />
          </g>

          {/* Alter storylines */}
          {storylineData.map((line, i) => (
            <g key={line.id}>
              <path
                d={line.path}
                stroke={line.color}
                strokeWidth={hoveredLine === line.id ? 4 : 2}
                fill="none"
                opacity={animationPhase >= 3 ? (hoveredLine === line.id ? 1 : 0.7) : 0}
                className="transition-all duration-500 cursor-pointer"
                onMouseEnter={() => setHoveredLine(line.id)}
                onMouseLeave={() => setHoveredLine(null)}
              />
              {/* LEFT side labels for storylines */}
              <text
                x="60"
                y={[144, 284, 164][i]}
                fill={line.color}
                fontSize="10"
                textAnchor="end"
                opacity={animationPhase >= 3 ? 1 : 0}
                className="transition-opacity duration-500"
              >
                {line.name}
              </text>
            </g>
          ))}

          {/* Blocks */}
          {[180, 350, 520].map((x, blockIdx) => {
            const isExpanded = expandedBlock === blockIdx && animationPhase >= 5;
            const blockMoveX = isExpanded ? easedBlockProgress * moveX : 0;

            return (
              <g
                key={x}
                opacity={animationPhase >= 4 ? 1 : 0}
                className="transition-opacity duration-700 cursor-pointer"
                onClick={() => {
                  if (animationPhase >= 4) {
                    setAutoPlay(false);
                    setAnimationPhase(5);
                    setExpandedBlock(expandedBlock === blockIdx ? null : blockIdx);
                  }
                }}
              >
                {/* White background when expanded */}
                {isExpanded && (
                  <rect
                    x={x - 20}
                    y="100"
                    width={40 + blockMoveX}
                    height="200"
                    rx="20"
                    fill="white"
                    opacity={easedBlockProgress * 0.9}
                  />
                )}

                {/* Left arc */}
                <path
                  d={`M${x},100 A20,20,0,0,0,${x - 20},120 L${x - 20},280 A20,20,0,0,0,${x},300`}
                  stroke={isExpanded ? "#3b82f6" : "#64748b"}
                  strokeWidth="2"
                  fill="none"
                />

                {/* Right arc */}
                <path
                  d={`M${x + blockMoveX},100 A20,20,0,0,1,${x + 20 + blockMoveX},120 L${x + 20 + blockMoveX},280 A20,20,0,0,1,${x + blockMoveX},300`}
                  stroke={isExpanded ? "#3b82f6" : "#64748b"}
                  strokeWidth="2"
                  fill="none"
                />

                {/* Top and bottom bars when expanded */}
                {isExpanded && easedBlockProgress > 0.3 && (
                  <>
                    <line x1={x} y1="100" x2={x + blockMoveX} y2="100" stroke="#3b82f6" strokeWidth="2" opacity={easedBlockProgress} />
                    <line x1={x} y1="300" x2={x + blockMoveX} y2="300" stroke="#3b82f6" strokeWidth="2" opacity={easedBlockProgress} />
                  </>
                )}

                {/* Points */}
                {SAMPLE_POINTS.slice(0, 4).map((point, j) => {
                  const collapsedX = x;
                  const collapsedY = 130 + j * 45;
                  const expandedX = x + point.scaleX * blockMoveX * 0.85;
                  const expandedY = 120 + point.scaleY * 160 * easedBlockProgress + (1 - easedBlockProgress) * (j * 45);

                  return (
                    <circle
                      key={point.id}
                      cx={isExpanded ? expandedX : collapsedX}
                      cy={isExpanded ? expandedY : collapsedY}
                      r={point.name === "Jeffrey Heer" ? 8 : 6}
                      fill={["#fcdaca", "#e599a6", "#c94b77", "#146b6b"][j]}
                      className="transition-all"
                      style={{ transitionDuration: "0ms" }}
                    />
                  );
                })}

                {/* Click hint */}
                {animationPhase === 4 && !isExpanded && (
                  <text x={x} y="320" fill="#64748b" fontSize="8" textAnchor="middle" className="animate-pulse">
                    Click to expand
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ============================================
// BLOCK EXPANSION WITH CLICKABLE PHASES
// ============================================
function BlockExpansionSimulator() {
  const [currentPhase, setCurrentPhase] = useState(0); // 0: initial, 1: shift, 2: extend, 3: expand, 4: position
  const [animationProgress, setAnimationProgress] = useState(0);
  const moveX = 200;

  const phases = [
    { id: 0, name: "Initial", desc: "Block in collapsed state, all elements at original positions", color: "#64748b" },
    { id: 1, name: "Shift", desc: "All .movable elements shift right by moveX pixels", color: "#3b82f6" },
    { id: 2, name: "Extend", desc: "_fillDummyLines() creates connecting line segments", color: "#8b5cf6" },
    { id: 3, name: "Expand", desc: "Block outline expands, horizontal bars appear", color: "#10b981" },
    { id: 4, name: "Position", desc: "_contextualize() positions points using PCA scaleX/scaleY", color: "#f59e0b" },
  ];

  useEffect(() => {
    // Animate to the target phase
    const targetProgress = currentPhase / 4;
    let current = animationProgress;
    const step = targetProgress > current ? 0.02 : -0.02;

    const interval = setInterval(() => {
      current += step;
      if ((step > 0 && current >= targetProgress) || (step < 0 && current <= targetProgress)) {
        current = targetProgress;
        clearInterval(interval);
      }
      setAnimationProgress(Math.max(0, Math.min(1, current)));
    }, 16);

    return () => clearInterval(interval);
  }, [currentPhase]);

  const easeOutQuad = (t: number) => t * (2 - t);
  const easedProgress = easeOutQuad(animationProgress);

  // Calculate phase-specific progress
  const shiftProgress = Math.min(1, animationProgress * 4);
  const extendProgress = Math.max(0, Math.min(1, (animationProgress - 0.25) * 4));
  const expandProgress = Math.max(0, Math.min(1, (animationProgress - 0.5) * 4));
  const positionProgress = Math.max(0, Math.min(1, (animationProgress - 0.75) * 4));

  const whiteSpace = 0.15;
  const computeEmbedding = (scale: number) => {
    return (scale + whiteSpace / 2) * moveX * (1 - whiteSpace);
  };

  return (
    <div className="space-y-6">
      {/* Phase Control Buttons */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-bold mb-4">Click each phase to see the transformation:</h4>
        <div className="flex flex-wrap gap-3">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setCurrentPhase(phase.id)}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
                currentPhase === phase.id
                  ? "text-white shadow-lg scale-105"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
              style={{
                backgroundColor: currentPhase === phase.id ? phase.color : undefined,
                boxShadow: currentPhase === phase.id ? `0 10px 30px ${phase.color}40` : undefined,
              }}
            >
              {phase.id}. {phase.name}
            </button>
          ))}
        </div>

        {/* Current Phase Description */}
        <div
          className="mt-4 p-4 rounded-xl border-2 transition-all duration-300"
          style={{
            borderColor: phases[currentPhase].color,
            backgroundColor: `${phases[currentPhase].color}15`
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ backgroundColor: phases[currentPhase].color }}
            />
            <span className="text-white font-bold">{phases[currentPhase].name}</span>
          </div>
          <p className="text-slate-300 text-sm">{phases[currentPhase].desc}</p>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <svg viewBox="0 0 700 350" className="w-full bg-slate-950 rounded-xl">
          {/* Background zones */}
          <text x="15" y="80" fill="#475569" fontSize="12" opacity="0.5">External</text>
          <text x="15" y="290" fill="#475569" fontSize="12" opacity="0.5">Internal</text>

          {/* Time labels - shift with animation */}
          {["2002", "2003", "2004", "2005"].map((label, i) => {
            const baseX = 100 + i * 120;
            const shiftX = i > 0 ? shiftProgress * moveX : shiftProgress * moveX / 2;
            return (
              <g key={label}>
                <text x={baseX + shiftX} y="30" fill="#94a3b8" fontSize="12" textAnchor="middle">{label}</text>
                <line
                  x1={baseX + shiftX}
                  y1="40"
                  x2={baseX + shiftX}
                  y2="320"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4"
                  opacity="0.3"
                />
              </g>
            );
          })}

          {/* Ego line - extends */}
          <path
            d={`M50,180 L${340 + shiftProgress * moveX},180`}
            stroke="#146b6b"
            strokeWidth="5"
            fill="none"
          />
          <polygon points="45,180 55,175 55,185" fill="#146b6b" />
          <text x="35" y="184" fill="#146b6b" fontSize="10" fontWeight="bold" textAnchor="end">Ego</text>

          {/* Dummy line extension (phase 2) */}
          {extendProgress > 0 && (
            <path
              d={`M100,120 L${100 + extendProgress * moveX},120`}
              stroke="#FA9902"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6 3"
              opacity={extendProgress}
            />
          )}

          {/* Alter storyline that shifts */}
          <path
            d={`M${220 + shiftProgress * moveX},100 C${280 + shiftProgress * moveX},100 ${300 + shiftProgress * moveX},250 ${340 + shiftProgress * moveX},250`}
            stroke="#FA9902"
            strokeWidth="2"
            fill="none"
          />

          {/* THE BLOCK */}
          <g>
            {/* White background rectangle (phase 3+) */}
            {expandProgress > 0 && (
              <rect
                x={75}
                y="60"
                width={50 + expandProgress * moveX}
                height="220"
                fill="white"
                rx="4"
                opacity={expandProgress * 0.95}
              />
            )}

            {/* Left arc */}
            <path
              d="M100,60 A20,20,0,0,0,80,80 L80,260 A20,20,0,0,0,100,280"
              stroke={currentPhase >= 3 ? "#10b981" : "#64748b"}
              strokeWidth="2"
              fill="none"
            />

            {/* Right arc - shifts */}
            <path
              d={`M${100 + expandProgress * moveX},60 A20,20,0,0,1,${120 + expandProgress * moveX},80 L${120 + expandProgress * moveX},260 A20,20,0,0,1,${100 + expandProgress * moveX},280`}
              stroke={currentPhase >= 3 ? "#10b981" : "#64748b"}
              strokeWidth="2"
              fill="none"
            />

            {/* Top bar (phase 3+) */}
            {expandProgress > 0.3 && (
              <line
                x1="100"
                y1="60"
                x2={100 + expandProgress * moveX}
                y2="60"
                stroke="#10b981"
                strokeWidth="2"
                opacity={expandProgress}
              />
            )}

            {/* Bottom bar (phase 3+) */}
            {expandProgress > 0.3 && (
              <line
                x1="100"
                y1="280"
                x2={100 + expandProgress * moveX}
                y2="280"
                stroke="#10b981"
                strokeWidth="2"
                opacity={expandProgress}
              />
            )}

            {/* Points inside the block */}
            {SAMPLE_POINTS.slice(0, 5).map((point, i) => {
              const collapsedX = 100;
              const collapsedY = 80 + i * 40;
              const posX = computeEmbedding(point.scaleX);
              const posY = computeEmbedding(point.scaleY);
              const expandedX = 100 + posX * positionProgress;
              const expandedY = 70 + posY * positionProgress + (1 - positionProgress) * (i * 40);

              return (
                <g key={point.id}>
                  <circle
                    cx={expandedX}
                    cy={expandedY}
                    r={point.name === "Jeffrey Heer" ? 9 : 6}
                    fill={["#fcdaca", "#e599a6", "#c94b77", "#146b6b", "#740980"][i]}
                    stroke={currentPhase === 4 ? "#f59e0b" : "none"}
                    strokeWidth="2"
                  />
                  {positionProgress > 0.5 && (
                    <text
                      x={expandedX + 12}
                      y={expandedY + 4}
                      fill="#475569"
                      fontSize="9"
                      opacity={(positionProgress - 0.5) * 2}
                    >
                      {point.name.split(' ')[0]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Relationship arc (phase 4) */}
            {positionProgress > 0.5 && (
              <g opacity={(positionProgress - 0.5) * 2}>
                <path
                  d={`M${100 + computeEmbedding(0.52) * positionProgress},${70 + computeEmbedding(0.58) * positionProgress} Q${100 + computeEmbedding(0.65) * positionProgress},${70 + computeEmbedding(0.4) * positionProgress} ${100 + computeEmbedding(0.79) * positionProgress},${70 + computeEmbedding(0.65) * positionProgress}`}
                  stroke="#424242"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd="url(#arrowHead2)"
                />
              </g>
            )}
          </g>

          <defs>
            <marker id="arrowHead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#424242" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Progress Indicator */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-slate-400 text-sm">Animation Progress:</span>
          <span className="text-cyan-400 font-bold">{(animationProgress * 100).toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-yellow-500 transition-all duration-100"
            style={{ width: `${animationProgress * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Shift</span>
          <span>Extend</span>
          <span>Expand</span>
          <span>Position</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// POINT CONTEXTUALIZATION WITH MOVEY
// ============================================
function PCAPlayground() {
  const [selectedPoint, setSelectedPoint] = useState(0);
  const [moveX, setMoveX] = useState(200);
  const [moveY, setMoveY] = useState(200);
  const whiteSpace = 0.15;

  const computeEmbeddingX = (scale: number) => {
    return (scale + whiteSpace / 2) * moveX * (1 - whiteSpace);
  };

  const computeEmbeddingY = (scale: number) => {
    return (scale + whiteSpace / 2) * moveY * (1 - whiteSpace);
  };

  const points = SAMPLE_POINTS;
  const currentPoint = points[selectedPoint];
  const computedX = computeEmbeddingX(currentPoint.scaleX);
  const computedY = computeEmbeddingY(currentPoint.scaleY);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* 2D Position Visualizer */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h4 className="font-bold text-white mb-4">2D Position Space (Interactive)</h4>
          <p className="text-slate-400 text-sm mb-4">Click points to select. Adjust moveX/moveY sliders to see real-time positioning.</p>

          <svg viewBox="0 0 300 300" className="w-full bg-slate-950 rounded-xl">
            {/* Grid */}
            <defs>
              <pattern id="pcaGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="300" height="300" fill="url(#pcaGrid)" />

            {/* Block boundary */}
            <rect
              x={20}
              y={20}
              width={Math.min(260, moveX * 1.1)}
              height={Math.min(260, moveY * 1.1)}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="8 4"
              rx="4"
            />
            <text x={25} y={15} fill="#3b82f6" fontSize="10">Block Area ({moveX}x{moveY})</text>

            {/* Axes */}
            <line x1="20" y1="280" x2="280" y2="280" stroke="#475569" strokeWidth="2" />
            <line x1="20" y1="20" x2="20" y2="280" stroke="#475569" strokeWidth="2" />
            <text x="150" y="296" fill="#94a3b8" fontSize="10" textAnchor="middle">scaleX → Position X</text>
            <text x="8" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle" transform="rotate(-90, 8, 150)">scaleY → Position Y</text>

            {/* All points */}
            {points.map((p, i) => {
              const x = 20 + computeEmbeddingX(p.scaleX);
              const y = 20 + computeEmbeddingY(p.scaleY);
              const isSelected = i === selectedPoint;

              return (
                <g key={p.id} onClick={() => setSelectedPoint(i)} className="cursor-pointer">
                  {/* Guide lines for selected */}
                  {isSelected && (
                    <>
                      <line x1="20" y1={y} x2={x} y2={y} stroke="#8b5cf6" strokeDasharray="4" opacity="0.7" />
                      <line x1={x} y1="280" x2={x} y2={y} stroke="#8b5cf6" strokeDasharray="4" opacity="0.7" />
                      {/* Value labels on axes */}
                      <text x={x} y="292" fill="#8b5cf6" fontSize="9" textAnchor="middle">{computedX.toFixed(0)}</text>
                      <text x="5" y={y + 3} fill="#8b5cf6" fontSize="9" textAnchor="start">{computedY.toFixed(0)}</text>
                    </>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 14 : 10}
                    fill={isSelected ? "#8b5cf6" : "#3b82f6"}
                    stroke={isSelected ? "#c4b5fd" : "none"}
                    strokeWidth="3"
                    className="transition-all duration-300 hover:scale-110"
                  />
                  <text x={x} y={y - 18} fill="#94a3b8" fontSize="9" textAnchor="middle">
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
                <div className="text-xs text-slate-400 mb-1">scaleX (from PCA)</div>
                <div className="text-2xl font-bold text-blue-400">{currentPoint.scaleX.toFixed(2)}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">scaleY (from PCA)</div>
                <div className="text-2xl font-bold text-green-400">{currentPoint.scaleY.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm mb-4">
              <div className="text-slate-500 mb-2">// _compute_embedding formula</div>
              <div className="text-purple-400 mb-1">posX = (scaleX + 0.075) × moveX × 0.85</div>
              <div className="text-green-400">posY = (scaleY + 0.075) × moveY × 0.85</div>
            </div>

            {/* moveX slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">moveX (block width):</span>
                <span className="text-lg font-bold text-blue-400">{moveX}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="250"
                value={moveX}
                onChange={(e) => setMoveX(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* moveY slider - THIS IS THE NEW ADDITION */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">moveY (block height):</span>
                <span className="text-lg font-bold text-green-400">{moveY}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="250"
                value={moveY}
                onChange={(e) => setMoveY(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-xl p-4 border border-blue-700">
                <div className="text-xs text-blue-300 mb-1">Computed X Position</div>
                <div className="text-3xl font-black text-white">{computedX.toFixed(1)}<span className="text-lg">px</span></div>
              </div>
              <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-4 border border-green-700">
                <div className="text-xs text-green-300 mb-1">Computed Y Position</div>
                <div className="text-3xl font-black text-white">{computedY.toFixed(1)}<span className="text-lg">px</span></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-4 border border-purple-700">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="font-bold text-white mb-1">Interactive PCA Positioning</div>
                <div className="text-sm text-purple-200">
                  Drag both sliders to see how moveX and moveY affect point distribution.
                  Similar entities (by citations, collaborations) cluster together in the expanded block view!
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
// FILTER CONTROLS - WIDER VISUALIZATION WITH TIMELINE
// ============================================
function FilterDeepDive() {
  const [lifespan, setLifespan] = useState(1);
  const [crossingOnly, setCrossingOnly] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);

  const filtered = SAMPLE_STORYLINES.filter(s => {
    if (s.isEgo) return true;
    return s.lifespan >= lifespan && (!crossingOnly || s.crossingCheck);
  });

  // Timeline data for each entity
  const entityTimelines: { [key: number]: { start: number; end: number } } = {
    0: { start: 2000, end: 2023 }, // Jeffrey Heer (ego)
    1: { start: 2002, end: 2020 }, // Ed H. Chi
    2: { start: 2004, end: 2019 }, // Tamara Munzner
    3: { start: 2006, end: 2018 }, // Ben Shneiderman
    4: { start: 2010, end: 2018 }, // Mary Czerwinski
    5: { start: 2008, end: 2018 }, // Maneesh Agrawala
  };

  const minYear = 2000;
  const maxYear = 2024;
  const yearRange = maxYear - minYear;

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Lifespan Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-400">Minimum Lifespan</span>
              <span className="text-2xl font-black text-cyan-400">{lifespan} years</span>
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
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
            </div>
          </div>

          {/* Crossing Checkbox */}
          <div className="flex items-center">
            <label className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-750 transition-colors w-full">
              <input
                type="checkbox"
                checked={crossingOnly}
                onChange={(e) => setCrossingOnly(e.target.checked)}
                className="w-6 h-6 rounded-lg accent-cyan-500"
              />
              <div>
                <div className="font-semibold text-white">Crossing Only</div>
                <div className="text-xs text-slate-400">Show only entities that cross ego line</div>
              </div>
            </label>
          </div>

          {/* Result count */}
          <div className="flex items-center justify-center">
            <div className="text-center p-4 bg-gradient-to-r from-purple-900 to-cyan-900 rounded-xl w-full">
              <div className="text-4xl font-black text-white">{filtered.length - 1}</div>
              <div className="text-sm text-purple-200">alters visible (+ 1 ego)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wide Timeline Visualization */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="font-bold text-white mb-4">Entity Lifespans on Timeline</h4>
        <p className="text-slate-400 text-sm mb-4">Hover over bars to see details. Red line shows current filter threshold.</p>

        <svg viewBox="0 0 900 280" className="w-full bg-slate-950 rounded-xl">
          {/* Year axis */}
          {Array.from({ length: 13 }, (_, i) => 2000 + i * 2).map((year) => {
            const x = 100 + ((year - minYear) / yearRange) * 700;
            return (
              <g key={year}>
                <line x1={x} y1="30" x2={x} y2="240" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                <text x={x} y="20" fill="#94a3b8" fontSize="10" textAnchor="middle">{year}</text>
              </g>
            );
          })}

          {/* Lifespan threshold indicator */}
          <g>
            <line
              x1={100 + (lifespan / yearRange) * 700}
              y1="25"
              x2={100 + (lifespan / yearRange) * 700}
              y2="245"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
            <text
              x={105 + (lifespan / yearRange) * 700}
              y="255"
              fill="#ef4444"
              fontSize="10"
            >
              {lifespan}y threshold
            </text>
          </g>

          {/* Entity bars */}
          {SAMPLE_STORYLINES.map((s, i) => {
            const isVisible = filtered.includes(s);
            const timeline = entityTimelines[s.id];
            const startX = 100 + ((timeline.start - minYear) / yearRange) * 700;
            const endX = 100 + ((timeline.end - minYear) / yearRange) * 700;
            const width = endX - startX;
            const y = 45 + i * 32;
            const isSelected = selectedEntity === s.id;

            return (
              <g
                key={s.id}
                className="cursor-pointer"
                onMouseEnter={() => setSelectedEntity(s.id)}
                onMouseLeave={() => setSelectedEntity(null)}
              >
                {/* Entity name - LEFT side */}
                <text
                  x="95"
                  y={y + 15}
                  fill={isVisible ? (s.isEgo ? "#2dd4bf" : "#e2e8f0") : "#475569"}
                  fontSize="11"
                  textAnchor="end"
                  fontWeight={s.isEgo ? "bold" : "normal"}
                >
                  {s.name}
                </text>

                {/* Lifespan bar */}
                <rect
                  x={startX}
                  y={y}
                  width={width}
                  height="24"
                  rx="4"
                  fill={s.color}
                  opacity={isVisible ? (isSelected ? 1 : 0.8) : 0.15}
                  stroke={isSelected ? "#fff" : "none"}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* Ego badge */}
                {s.isEgo && (
                  <rect
                    x={startX + 4}
                    y={y + 5}
                    width="32"
                    height="14"
                    rx="7"
                    fill="#0f766e"
                  />
                )}
                {s.isEgo && (
                  <text x={startX + 20} y={y + 15} fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">EGO</text>
                )}

                {/* Lifespan value */}
                <text
                  x={endX + 8}
                  y={y + 15}
                  fill={isVisible ? "#94a3b8" : "#475569"}
                  fontSize="10"
                >
                  {s.lifespan}y
                </text>

                {/* Crossing indicator */}
                {s.crossingCheck && !s.isEgo && (
                  <text x={endX + 35} y={y + 15} fill="#94a3b8" fontSize="10">↕</text>
                )}

                {/* Selected tooltip */}
                {isSelected && (
                  <g>
                    <rect x={startX + width/2 - 60} y={y - 28} width="120" height="22" rx="4" fill="#1e293b" stroke="#475569" />
                    <text x={startX + width/2} y={y - 13} fill="#fff" fontSize="9" textAnchor="middle">
                      {timeline.start} - {timeline.end} ({s.lifespan} years)
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* SpreadLine Preview */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="font-bold text-white mb-4">Filtered SpreadLine Preview</h4>
        <svg viewBox="0 0 800 250" className="w-full bg-slate-950 rounded-xl">
          {/* Direction labels - LEFT */}
          <text x="15" y="60" fill="#475569" fontSize="12" opacity="0.5">External</text>
          <text x="15" y="200" fill="#475569" fontSize="12" opacity="0.5">Internal</text>

          {/* Time labels */}
          {TIME_LABELS.slice(0, 8).map((label, i) => (
            <g key={label}>
              <text x={100 + i * 90} y="25" fill="#94a3b8" fontSize="10" textAnchor="middle">{label}</text>
              <line x1={100 + i * 90} y1="35" x2={100 + i * 90} y2="220" stroke="#334155" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
            </g>
          ))}

          {/* Ego line */}
          <g>
            <path d="M100,125 L730,125" stroke="#146b6b" strokeWidth="4" />
            <polygon points="95,125 105,120 105,130" fill="#146b6b" />
            <text x="85" y="129" fill="#146b6b" fontSize="10" fontWeight="bold" textAnchor="end">Ego</text>
          </g>

          {/* Storylines */}
          {SAMPLE_STORYLINES.filter(s => !s.isEgo).map((s, i) => {
            const isVisible = filtered.includes(s);
            const yVariation = s.crossingCheck ? [60, 190][i % 2] : (i < 3 ? 80 : 170);
            const yEnd = s.crossingCheck ? [190, 60][i % 2] : yVariation;
            const startX = 100 + i * 50;

            return (
              <g key={s.id}>
                <path
                  d={`M${startX},${yVariation} C${startX + 100},${yVariation} ${startX + 200},${yEnd} 730,${yEnd}`}
                  stroke={s.color}
                  strokeWidth="2"
                  fill="none"
                  opacity={isVisible ? 1 : 0.1}
                  className="transition-opacity duration-500"
                />
                {/* LEFT side label */}
                <text
                  x="85"
                  y={yVariation + 4}
                  fill={s.color}
                  fontSize="9"
                  textAnchor="end"
                  opacity={isVisible ? 1 : 0.2}
                  className="transition-opacity duration-500"
                >
                  {s.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ============================================
// STATE MANAGEMENT FLOW - COMPLETELY REDESIGNED
// ============================================
function StateFlowAnimation() {
  const [activeInteraction, setActiveInteraction] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<number[]>([]);

  // Define the state management architecture
  const interactions = [
    {
      id: "hover",
      name: "Hover Storyline",
      icon: "👆",
      steps: [
        { id: 0, name: "User hovers on path", type: "trigger" },
        { id: 1, name: "_lineHover(entity)", type: "handler" },
        { id: 2, name: "Set .hoverMembers = [entity]", type: "state" },
        { id: 3, name: "Add class 'storyline-hover'", type: "dom" },
        { id: 4, name: "Other lines get 'storyline-dehighlight'", type: "dom" },
        { id: 5, name: "Line stroke-width: 4px", type: "visual" },
      ],
    },
    {
      id: "pin",
      name: "Pin Storyline",
      icon: "📌",
      steps: [
        { id: 0, name: "User clicks on path", type: "trigger" },
        { id: 1, name: "_linePin(entity)", type: "handler" },
        { id: 2, name: "Set attr pin='1'", type: "dom" },
        { id: 3, name: "Add to .pinnedMembers", type: "state" },
        { id: 4, name: "Toggle 'storyline-pin' class", type: "dom" },
        { id: 5, name: "Line stays highlighted", type: "visual" },
      ],
    },
    {
      id: "expand",
      name: "Expand Block",
      icon: "📦",
      steps: [
        { id: 0, name: "User clicks block", type: "trigger" },
        { id: 1, name: "_blockUpdate(block)", type: "handler" },
        { id: 2, name: "Calculate moveX from data", type: "compute" },
        { id: 3, name: "_shiftOutline(moveX)", type: "animate" },
        { id: 4, name: "_fillDummyLines()", type: "animate" },
        { id: 5, name: "_contextualize(points)", type: "animate" },
        { id: 6, name: "Block shows PCA view", type: "visual" },
      ],
    },
    {
      id: "filter",
      name: "Filter Change",
      icon: "🎚️",
      steps: [
        { id: 0, name: "User moves slider", type: "trigger" },
        { id: 1, name: "filterLifespan(value)", type: "handler" },
        { id: 2, name: "Update visibility state", type: "state" },
        { id: 3, name: "ENTITY_SELECTION.filter()", type: "selection" },
        { id: 4, name: "Set opacity on paths", type: "dom" },
        { id: 5, name: "Lines fade in/out", type: "visual" },
      ],
    },
  ];

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      trigger: "#f59e0b",
      handler: "#3b82f6",
      state: "#8b5cf6",
      dom: "#10b981",
      compute: "#ec4899",
      animate: "#06b6d4",
      selection: "#f97316",
      visual: "#22c55e",
    };
    return colors[type] || "#64748b";
  };

  return (
    <div className="space-y-6">
      {/* Interaction Selector */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h4 className="font-bold text-white mb-4">Select an interaction to trace the state flow:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {interactions.map((interaction) => (
            <button
              key={interaction.id}
              onClick={() => {
                setActiveInteraction(interaction.id);
                setHighlightedPath([]);
                // Animate through steps
                interaction.steps.forEach((_, i) => {
                  setTimeout(() => {
                    setHighlightedPath(prev => [...prev, i]);
                  }, i * 500);
                });
              }}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                activeInteraction === interaction.id
                  ? "border-cyan-500 bg-cyan-500/20"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <div className="text-3xl mb-2">{interaction.icon}</div>
              <div className="text-white font-semibold text-sm">{interaction.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Flow Visualization */}
      {activeInteraction && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h4 className="font-bold text-white mb-6">
            {interactions.find(i => i.id === activeInteraction)?.icon}{" "}
            {interactions.find(i => i.id === activeInteraction)?.name} - State Flow
          </h4>

          <div className="space-y-4">
            {interactions
              .find((i) => i.id === activeInteraction)
              ?.steps.map((step, index) => {
                const isActive = highlightedPath.includes(index);
                const color = getTypeColor(step.type);

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Step Number */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                        isActive ? "scale-110" : "scale-100 opacity-50"
                      }`}
                      style={{
                        backgroundColor: isActive ? color : "#1e293b",
                        color: isActive ? "white" : "#64748b",
                        boxShadow: isActive ? `0 0 20px ${color}60` : "none",
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Connector Line */}
                    {index < (interactions.find((i) => i.id === activeInteraction)?.steps.length || 0) - 1 && (
                      <div className="absolute ml-5 mt-10 w-0.5 h-8 bg-slate-700" />
                    )}

                    {/* Step Content */}
                    <div
                      className={`flex-1 p-4 rounded-xl border-2 transition-all duration-500 ${
                        isActive ? "border-opacity-100" : "border-opacity-30 opacity-50"
                      }`}
                      style={{
                        borderColor: color,
                        backgroundColor: isActive ? `${color}15` : "#0f172a",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="px-2 py-1 rounded text-xs font-bold uppercase"
                          style={{ backgroundColor: `${color}30`, color: color }}
                        >
                          {step.type}
                        </span>
                        <span className={`font-semibold ${isActive ? "text-white" : "text-slate-500"}`}>
                          {step.name}
                        </span>
                      </div>

                      {/* Code snippet for certain types */}
                      {isActive && (step.type === "handler" || step.type === "state" || step.type === "selection") && (
                        <div className="mt-2 p-2 bg-slate-950 rounded font-mono text-sm text-slate-400">
                          {step.type === "handler" && <code>this.{step.name.replace(/\(.*\)/, "()")}</code>}
                          {step.type === "state" && <code>{step.name}</code>}
                          {step.type === "selection" && <code>d3.selectAll('.storyline').{step.name.split('.')[1]}</code>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-slate-800 rounded-xl">
            <div className="text-sm text-slate-400 mb-2">Step Types:</div>
            <div className="flex flex-wrap gap-2">
              {["trigger", "handler", "state", "dom", "compute", "animate", "selection", "visual"].map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 rounded text-xs font-bold uppercase"
                  style={{ backgroundColor: `${getTypeColor(type)}30`, color: getTypeColor(type) }}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Architecture Overview */}
      <div className="bg-gradient-to-r from-slate-900 to-purple-900/50 rounded-2xl p-6 border border-purple-700">
        <h4 className="font-bold text-white mb-4">SpreadLine State Architecture</h4>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-purple-400 font-bold mb-2">📥 Inputs</div>
            <ul className="text-slate-300 space-y-1">
              <li>• Mouse events (hover, click)</li>
              <li>• Slider/checkbox changes</li>
              <li>• Block interactions</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-cyan-400 font-bold mb-2">🔄 State</div>
            <ul className="text-slate-300 space-y-1">
              <li>• this.hoverMembers[]</li>
              <li>• this.pinnedMembers[]</li>
              <li>• DOM attributes (pin, active)</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-green-400 font-bold mb-2">📤 Outputs</div>
            <ul className="text-slate-300 space-y-1">
              <li>• CSS class changes</li>
              <li>• D3 transitions</li>
              <li>• SVG path updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// BEZIER CURVE BUILDER
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
            {[0, 100, 200, 300, 400].map(x => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#1e293b" strokeWidth="1" />
            ))}
            {[0, 100, 200, 300].map(y => (
              <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#1e293b" strokeWidth="1" />
            ))}
            <line x1={points.start.x} y1={points.start.y} x2={points.control1.x} y2={points.control1.y} stroke="#f472b6" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
            <line x1={points.end.x} y1={points.end.y} x2={points.control2.x} y2={points.control2.y} stroke="#a78bfa" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
            <path d={pathD} stroke="#22d3ee" strokeWidth="3" fill="none" />
            <circle cx={points.start.x} cy={points.start.y} r="12" fill="#22c55e" className="cursor-grab" onMouseDown={() => setDragging("start")} />
            <circle cx={points.control1.x} cy={points.control1.y} r="10" fill="#f472b6" className="cursor-grab" onMouseDown={() => setDragging("control1")} />
            <circle cx={points.control2.x} cy={points.control2.y} r="10" fill="#a78bfa" className="cursor-grab" onMouseDown={() => setDragging("control2")} />
            <circle cx={points.end.x} cy={points.end.y} r="12" fill="#ef4444" className="cursor-grab" onMouseDown={() => setDragging("end")} />
            <text x={points.start.x} y={points.start.y - 18} fill="#22c55e" fontSize="10" textAnchor="middle">Start</text>
            <text x={points.control1.x} y={points.control1.y - 15} fill="#f472b6" fontSize="10" textAnchor="middle">Control 1</text>
            <text x={points.control2.x} y={points.control2.y + 22} fill="#a78bfa" fontSize="10" textAnchor="middle">Control 2</text>
            <text x={points.end.x} y={points.end.y - 18} fill="#ef4444" fontSize="10" textAnchor="middle">End</text>
          </svg>
        </div>

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
              <span className="text-slate-500"> // Move to start</span>
            </div>
            <div className="pl-4">
              <span className="text-pink-400">C</span>
              <span className="text-pink-300">{points.control1.x.toFixed(0)},{points.control1.y.toFixed(0)}</span>
              <span className="text-slate-500"> // Control 1</span>
            </div>
            <div className="pl-4">
              <span className="text-purple-300">{points.control2.x.toFixed(0)},{points.control2.y.toFixed(0)}</span>
              <span className="text-slate-500"> // Control 2</span>
            </div>
            <div className="pl-4">
              <span className="text-red-300">{points.end.x.toFixed(0)},{points.end.y.toFixed(0)}</span>
              <span className="text-slate-500"> // End point</span>
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
// MAIN PAGE
// ============================================
export default function Design4Page() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: "hero", title: "Overview", icon: "✨" },
    { id: "curves", title: "Bezier Curves", icon: "〰️" },
    { id: "expansion", title: "Block Expansion", icon: "📦" },
    { id: "pca", title: "PCA Positioning", icon: "📍" },
    { id: "filters", title: "Filter Controls", icon: "🎚️" },
    { id: "state", title: "State Flow", icon: "🔄" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-cyan-900/20 pointer-events-none" />

      {/* Header */}
      <header className="relative sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                SpreadLine Design v4
              </h1>
              <p className="text-sm text-slate-400">The Ultimate Interactive Guide - Enhanced Edition</p>
            </div>
            <div className="flex gap-2 flex-wrap">
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
              An egocentric dynamic network visualization that shows how influence spreads through time.
              <br />
              <span className="text-cyan-400 font-semibold">Control each animation phase manually!</span>
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
            <p className="text-slate-400">Click each phase button to see the 4-step expansion process: Shift → Extend → Expand → Position</p>
          </div>
          <BlockExpansionSimulator />
        </section>

        {/* PCA Positioning */}
        <section id="pca" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">📍 Point Contextualization (PCA)</h2>
            <p className="text-slate-400">How points are positioned in expanded blocks. Adjust both moveX <strong>and moveY</strong> to see real-time changes!</p>
          </div>
          <PCAPlayground />
        </section>

        {/* Filter Controls */}
        <section id="filters" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">🎚️ Filter Controls Deep Dive</h2>
            <p className="text-slate-400">Wide timeline visualization showing entity lifespans and how filters affect visibility</p>
          </div>
          <FilterDeepDive />
        </section>

        {/* State Flow */}
        <section id="state" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">🔄 State Management Flow</h2>
            <p className="text-slate-400">Click an interaction type to see how user actions flow through handlers, state, and visual changes</p>
          </div>
          <StateFlowAnimation />
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-slate-800">
          <p className="text-slate-500">SpreadLine: Visualizing Egocentric Dynamic Influence</p>
          <p className="text-sm text-slate-600 mt-2">Design Document v4 - The Greatest Interactive Guide</p>
        </footer>
      </main>
    </div>
  );
}

'use client';

import { Block as BlockType, TimeLabel, Point, computeEmbedding, easeOutQuad, getNodeColor } from './types';

interface BlockProps {
  block: BlockType;
  timeLabel: TimeLabel;
  blockWidth: number;
  isExpanded: boolean;
  animProgress: number;
  filteredNames: Set<string>;
  isHighlighted: (name: string) => boolean;
  getShiftX?: (posX: number) => number;
  onToggleExpand?: () => void;
  onHover?: (name: string | null, e?: React.MouseEvent) => void;
  onPin?: (name: string) => void;
  ego: string;
}

export default function Block({
  block,
  timeLabel,
  blockWidth,
  isExpanded,
  animProgress,
  filteredNames,
  isHighlighted,
  getShiftX = () => 0,
  onToggleExpand,
  onHover,
  onPin,
  ego
}: BlockProps) {
  const baseShift = getShiftX(timeLabel.posX);
  const progress = easeOutQuad(animProgress);
  const expandW = block.moveX * progress;
  const hasFiltered = block.names.some(n => filteredNames.has(n));

  // Calculate bounds
  const minY = Math.min(...block.points.map(p => p.posY)) - 30;
  const maxY = Math.max(...block.points.map(p => p.posY)) + 30;
  const blockHeight = maxY - minY;

  return (
    <g className={`transition-opacity duration-300 ${hasFiltered ? 'opacity-100' : 'opacity-20'}`}>
      {/* Clickable area */}
      <rect
        x={timeLabel.posX - blockWidth / 2 + baseShift - expandW / 2 - 5}
        y={minY}
        width={blockWidth + expandW + 10}
        height={blockHeight}
        fill="transparent"
        className="cursor-pointer"
        onClick={() => hasFiltered && onToggleExpand?.()}
      />

      {/* White background when expanded */}
      {progress > 0 && (
        <rect
          x={timeLabel.posX - blockWidth / 2 + baseShift - expandW / 2}
          y={minY + 10}
          width={blockWidth + expandW}
          height={blockHeight - 20}
          rx="20"
          fill="white"
          opacity={progress * 0.95}
          pointerEvents="none"
        />
      )}

      {/* Left arc */}
      <path
        d={block.outline.left}
        transform={`translate(${baseShift - expandW / 2}, 0)`}
        stroke={isExpanded ? "#3b82f6" : "#64748b"}
        strokeWidth="2"
        fill="none"
        pointerEvents="none"
      />

      {/* Right arc */}
      <path
        d={block.outline.right}
        transform={`translate(${baseShift + expandW / 2}, 0)`}
        stroke={isExpanded ? "#3b82f6" : "#64748b"}
        strokeWidth="2"
        fill="none"
        pointerEvents="none"
      />

      {/* Top/bottom bars when expanded */}
      {progress > 0.2 && (
        <>
          <line
            x1={timeLabel.posX + baseShift - expandW / 2}
            y1={minY + 10}
            x2={timeLabel.posX + baseShift + expandW / 2}
            y2={minY + 10}
            stroke="#3b82f6"
            strokeWidth="2"
            opacity={progress}
            pointerEvents="none"
          />
          <line
            x1={timeLabel.posX + baseShift - expandW / 2}
            y1={maxY - 10}
            x2={timeLabel.posX + baseShift + expandW / 2}
            y2={maxY - 10}
            stroke="#3b82f6"
            strokeWidth="2"
            opacity={progress}
            pointerEvents="none"
          />
        </>
      )}

      {/* Relation arcs */}
      {progress > 0.5 && block.relations.map(([srcId, tgtId], idx) => {
        const src = block.points.find(p => p.id === srcId);
        const tgt = block.points.find(p => p.id === tgtId);
        if (!src || !tgt) return null;

        const sx = timeLabel.posX + baseShift + computeEmbedding(src.scaleX, expandW) - expandW / 2;
        const sy = block.topPosY + computeEmbedding(src.scaleY, expandW);
        const tx = timeLabel.posX + baseShift + computeEmbedding(tgt.scaleX, expandW) - expandW / 2;
        const ty = block.topPosY + computeEmbedding(tgt.scaleY, expandW);

        return (
          <path
            key={idx}
            d={`M${sx},${sy} Q${(sx + tx) / 2},${Math.min(sy, ty) - 15} ${tx},${ty}`}
            stroke="#424242"
            strokeWidth="1.5"
            fill="none"
            opacity={(progress - 0.5) * 2}
            markerEnd="url(#blockArrow)"
            pointerEvents="none"
          />
        );
      })}

      {/* Points */}
      {block.points.map((pt) => {
        const ptFiltered = filteredNames.has(pt.name);
        const ptHighlighted = isHighlighted(pt.name);
        const isEgoPt = pt.name === ego;

        // Calculate position based on expansion progress
        let px = timeLabel.posX + baseShift;
        let py = pt.posY;

        if (progress > 0) {
          px = timeLabel.posX + baseShift + computeEmbedding(pt.scaleX, expandW) - expandW / 2;
          py = block.topPosY + computeEmbedding(pt.scaleY, expandW) * progress + pt.posY * (1 - progress) - block.topPosY * (1 - progress);
        }

        return (
          <g key={`${block.id}-${pt.id}`}>
            <circle
              cx={px}
              cy={py}
              r={isEgoPt ? 8 : 6}
              fill={getNodeColor(parseInt(pt.label) || 0)}
              stroke={ptHighlighted ? "#000" : "#666"}
              strokeWidth={ptHighlighted ? 2 : 1}
              opacity={ptFiltered ? (ptHighlighted ? 1 : 0.5) : 0.1}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={(e) => ptFiltered && onHover?.(pt.name, e)}
              onMouseLeave={() => onHover?.(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (ptFiltered && !isEgoPt) onPin?.(pt.name);
              }}
            />

            {/* Point label when expanded */}
            {progress > 0.7 && (
              <text
                x={px + 10}
                y={py + 4}
                fill="#333"
                fontSize="9"
                opacity={(progress - 0.7) * 3.33}
                pointerEvents="none"
              >
                {pt.name.split(' ')[0]}
              </text>
            )}
          </g>
        );
      })}

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="blockArrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L6,3 z" fill="#424242" />
        </marker>
      </defs>
    </g>
  );
}

// Demo component for block expansion animation
interface BlockDemoProps {
  step: number;  // 0-4: collapsed, shift, extend, expand, position
}

export function BlockDemo({ step }: BlockDemoProps) {
  const moveX = 180;
  const s = {
    shift: step >= 1 ? 1 : 0,
    extend: step >= 2 ? 1 : 0,
    expand: step >= 3 ? 1 : 0,
    position: step >= 4 ? 1 : 0,
  };

  const demoPoints = [
    { name: 'Tara Matthews', scaleX: 0.19, scaleY: 0.0 },
    { name: 'Jason I. Hong', scaleX: 0.39, scaleY: 0.35 },
    { name: 'Jeffrey Heer', scaleX: 0.52, scaleY: 0.58, isEgo: true },
    { name: 'Ed H. Chi', scaleX: 0.79, scaleY: 0.65 },
    { name: 'Stuart K. Card', scaleX: 0.47, scaleY: 0.41 },
  ];

  return (
    <svg viewBox="0 0 650 280" className="w-full bg-slate-950 rounded-xl">
      {/* Direction labels */}
      <text x="10" y="60" fill="#64748b" fontSize="12" opacity="0.5">External</text>
      <text x="10" y="230" fill="#64748b" fontSize="12" opacity="0.5">Internal</text>

      {/* Time labels */}
      {['t0', 't1', 't2', 't3'].map((t, i) => {
        const shift = i > 1 ? s.shift * moveX : i === 1 ? s.shift * moveX / 2 : 0;
        return (
          <text key={t} x={80 + i * 100 + shift} y="25" fill="#94a3b8" fontSize="12" textAnchor="middle">
            {t}
          </text>
        );
      })}

      {/* Ego line */}
      <path
        d={`M50,140 L${300 + s.shift * moveX},140`}
        stroke="#424242"
        strokeWidth="5"
        fill="none"
      />
      <polygon points="45,140 55,135 55,145" fill="#424242" />
      <text x="35" y="144" fill="#424242" fontSize="10" fontWeight="bold" textAnchor="end">Ego</text>

      {/* Dummy extension line */}
      {s.extend > 0 && (
        <path
          d={`M80,100 L${80 + s.extend * moveX},100`}
          stroke="#FA9902"
          strokeWidth="2"
          strokeDasharray="6 3"
          fill="none"
        />
      )}

      {/* Alter storyline */}
      <path
        d={`M${180 + s.shift * moveX},90 C${220 + s.shift * moveX},90 ${260 + s.shift * moveX},200 ${300 + s.shift * moveX},200`}
        stroke="#FA9902"
        strokeWidth="2"
        fill="none"
      />

      {/* Block */}
      <g>
        {/* White background when expanded */}
        {s.expand > 0 && (
          <rect
            x={65}
            y={50}
            width={30 + s.expand * moveX}
            height={180}
            rx="15"
            fill="white"
            opacity="0.95"
          />
        )}

        {/* Left arc */}
        <path
          d="M80,50 A15,15,0,0,0,65,65 L65,215 A15,15,0,0,0,80,230"
          stroke={s.expand > 0 ? "#3b82f6" : "#64748b"}
          strokeWidth="2"
          fill="none"
        />

        {/* Right arc */}
        <path
          d={`M${80 + s.expand * moveX},50 A15,15,0,0,1,${95 + s.expand * moveX},65 L${95 + s.expand * moveX},215 A15,15,0,0,1,${80 + s.expand * moveX},230`}
          stroke={s.expand > 0 ? "#3b82f6" : "#64748b"}
          strokeWidth="2"
          fill="none"
        />

        {/* Top/bottom bars when expanded */}
        {s.expand > 0 && (
          <>
            <line x1="80" y1="50" x2={80 + s.expand * moveX} y2="50" stroke="#3b82f6" strokeWidth="2" />
            <line x1="80" y1="230" x2={80 + s.expand * moveX} y2="230" stroke="#3b82f6" strokeWidth="2" />
          </>
        )}

        {/* Points */}
        {demoPoints.map((pt, i) => {
          const px = 80 + computeEmbedding(pt.scaleX, s.expand * moveX) * s.position;
          const py = 60 + computeEmbedding(pt.scaleY, 160) * s.position + (1 - s.position) * i * 35;
          const colors = ['#fcdaca', '#e599a6', '#424242', '#c94b77', '#740980'];

          return (
            <g key={pt.name}>
              <circle
                cx={px}
                cy={py}
                r={pt.isEgo ? 8 : 6}
                fill={colors[i]}
                stroke={s.position > 0 ? "#333" : "none"}
                strokeWidth="1"
              />
              {s.position > 0.5 && (
                <text x={px + 12} y={py + 4} fill="#333" fontSize="9">
                  {pt.name.split(' ')[0]}
                </text>
              )}
            </g>
          );
        })}

        {/* Relation arc when positioned */}
        {s.position > 0.5 && (
          <path
            d={`M${80 + computeEmbedding(0.52, s.expand * moveX)},${60 + computeEmbedding(0.58, 160)} Q${80 + computeEmbedding(0.65, s.expand * moveX)},${60 + computeEmbedding(0.3, 160)} ${80 + computeEmbedding(0.79, s.expand * moveX)},${60 + computeEmbedding(0.65, 160)}`}
            stroke="#333"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#demoArrow)"
            opacity={(s.position - 0.5) * 2}
          />
        )}
      </g>

      <defs>
        <marker id="demoArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#333" />
        </marker>
      </defs>
    </svg>
  );
}

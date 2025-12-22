'use client';

import { Storyline as StorylineType } from './types';

interface StorylineProps {
  storyline: StorylineType;
  isEgo: boolean;
  isHighlighted: boolean;
  isFiltered: boolean;
  isPinned: boolean;
  getShiftX?: (posX: number) => number;
  onHover?: (name: string | null) => void;
  onPin?: (name: string) => void;
}

export default function Storyline({
  storyline,
  isEgo,
  isHighlighted,
  isFiltered,
  isPinned,
  getShiftX = () => 0,
  onHover,
  onPin
}: StorylineProps) {
  const opacity = !isFiltered ? 0.1 : isHighlighted ? 1 : 0.2;

  return (
    <g
      className="transition-opacity duration-300"
      style={{
        cursor: isEgo ? 'default' : 'pointer',
        opacity
      }}
      onMouseEnter={() => isFiltered && !isEgo && onHover?.(storyline.name)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => isFiltered && !isEgo && onPin?.(storyline.name)}
    >
      {/* Path segments */}
      {storyline.lines.map((line, idx) => {
        const match = line.match(/M([\d.]+)/);
        const startX = match ? parseFloat(match[1]) : 0;

        return (
          <path
            key={idx}
            d={line}
            transform={`translate(${getShiftX(startX)}, 0)`}
            stroke={storyline.color}
            strokeWidth={isEgo ? 6 : isHighlighted ? 4 : 2}
            fill="none"
            className="transition-all duration-200"
          />
        );
      })}

      {/* Triangle markers */}
      {storyline.marks.map((mark, idx) => {
        if (mark.visibility !== 'visible') return null;
        // First marker points RIGHT (into vis), others point LEFT
        const rot = idx === 0 ? 0 : 180;
        const sz = Math.sqrt(mark.size) * 2;

        return (
          <polygon
            key={`mark-${idx}`}
            points={`0,${-sz/2} ${sz},0 0,${sz/2}`}
            transform={`translate(${mark.posX + getShiftX(mark.posX)}, ${mark.posY}) rotate(${rot})`}
            fill={storyline.color}
          />
        );
      })}

      {/* Label */}
      {storyline.label.visibility === 'visible' && (storyline.lifespan > 5 || isEgo || isPinned) && (
        <g transform={`translate(${getShiftX(storyline.label.posX)}, 0)`}>
          {/* Label text */}
          <text
            x={storyline.label.posX}
            y={storyline.label.posY}
            fill={storyline.color}
            fontSize={isEgo ? "13" : "11"}
            fontWeight={isEgo || isPinned ? "bold" : "normal"}
            textAnchor="end"
            dy="4"
            className="select-none"
          >
            {storyline.label.label}
          </text>

          {/* Label connector line */}
          {!isEgo && storyline.label.line && (
            <path
              d={storyline.label.line}
              stroke={storyline.color}
              strokeWidth="2"
              fill="none"
            />
          )}
        </g>
      )}

      {/* Pin indicator */}
      {isPinned && (
        <circle
          cx={storyline.label.posX + getShiftX(storyline.label.posX) + 10}
          cy={storyline.label.posY}
          r="5"
          fill="#ef4444"
          stroke="white"
          strokeWidth="2"
        />
      )}
    </g>
  );
}

// Demo component for interactive testing
interface StorylineDemoProps {
  showEgo?: boolean;
  showAlters?: boolean;
  highlightedName?: string | null;
}

export function StorylineDemo({
  showEgo = true,
  showAlters = true,
  highlightedName = null
}: StorylineDemoProps) {
  const demoLines = [
    {
      name: 'Jeffrey Heer',
      color: '#424242',
      isEgo: true,
      path: 'M100,100 L500,100'
    },
    {
      name: 'Ed H. Chi',
      color: '#FA9902',
      isEgo: false,
      path: 'M100,60 C200,60 250,140 350,140 C400,140 450,80 500,80'
    },
    {
      name: 'Jock D. Mackinlay',
      color: '#146b6b',
      isEgo: false,
      path: 'M150,150 C250,150 300,60 400,60 L500,60'
    },
    {
      name: 'Tamara Munzner',
      color: '#146b6b',
      isEgo: false,
      path: 'M120,130 C220,130 270,120 370,120 L500,120'
    },
  ];

  return (
    <svg viewBox="0 0 600 200" className="w-full bg-slate-950 rounded-xl">
      <g>
        {/* Direction labels */}
        <text x="20" y="50" fill="#64748b" fontSize="14" opacity="0.3">External</text>
        <text x="20" y="170" fill="#64748b" fontSize="14" opacity="0.3">Internal</text>

        {/* Storylines */}
        {demoLines.map((line) => {
          if (line.isEgo && !showEgo) return null;
          if (!line.isEgo && !showAlters) return null;

          const isHighlighted = highlightedName === null || highlightedName === line.name || line.isEgo;

          return (
            <g key={line.name} className="transition-opacity duration-300" style={{ opacity: isHighlighted ? 1 : 0.2 }}>
              {/* Path */}
              <path
                d={line.path}
                stroke={line.color}
                strokeWidth={line.isEgo ? 6 : 2}
                fill="none"
              />

              {/* Start marker (triangle) */}
              <polygon
                points={`0,-6 10,0 0,6`}
                transform={`translate(${line.path.match(/M(\d+)/)?.[1]},${line.path.match(/M\d+,(\d+)/)?.[1]}) rotate(90)`}
                fill={line.color}
              />

              {/* Label */}
              <text
                x={parseInt(line.path.match(/M(\d+)/)?.[1] || '100') - 10}
                y={parseInt(line.path.match(/M\d+,(\d+)/)?.[1] || '100') + 4}
                fill={line.color}
                fontSize={line.isEgo ? "12" : "10"}
                fontWeight={line.isEgo ? "bold" : "normal"}
                textAnchor="end"
              >
                {line.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

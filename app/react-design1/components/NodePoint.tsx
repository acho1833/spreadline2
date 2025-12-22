'use client';

import { Point, getNodeColor } from './types';

interface NodePointProps {
  point: Point;
  cx: number;
  cy: number;
  isEgo: boolean;
  isHighlighted: boolean;
  isFiltered: boolean;
  showLabel?: boolean;
  onHover?: (name: string | null, e?: React.MouseEvent) => void;
  onPin?: (name: string) => void;
}

export default function NodePoint({
  point,
  cx,
  cy,
  isEgo,
  isHighlighted,
  isFiltered,
  showLabel = false,
  onHover,
  onPin
}: NodePointProps) {
  const label = parseInt(point.label) || 0;
  const color = getNodeColor(label);
  const radius = isEgo ? 8 : 6;

  return (
    <g className="node-point">
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={color}
        stroke={isHighlighted ? "#000" : "#666"}
        strokeWidth={isHighlighted ? 2 : 0.5}
        opacity={isFiltered ? (isHighlighted ? 1 : 0.5) : 0.1}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={(e) => isFiltered && onHover?.(point.name, e)}
        onMouseLeave={() => onHover?.(null)}
        onClick={(e) => {
          e.stopPropagation();
          if (isFiltered && !isEgo) onPin?.(point.name);
        }}
      />

      {showLabel && (
        <text
          x={cx + radius + 4}
          y={cy + 4}
          fill="#333"
          fontSize="9"
          className="select-none pointer-events-none"
        >
          {point.name.split(' ')[0]}
        </text>
      )}
    </g>
  );
}

// Demo component showing color scale
interface NodeColorDemoProps {
  interactive?: boolean;
}

export function NodeColorDemo({ interactive = true }: NodeColorDemoProps) {
  const thresholds = [
    { label: '<10', value: 5, color: '#ffffff' },
    { label: '10-50', value: 30, color: '#fcdaca' },
    { label: '50-100', value: 75, color: '#e599a6' },
    { label: '100-500', value: 250, color: '#c94b77' },
    { label: '500+', value: 750, color: '#740980' },
  ];

  return (
    <div className="space-y-4">
      {/* Visual scale */}
      <div className="flex items-center justify-center gap-3 p-4 bg-slate-800 rounded-xl">
        {thresholds.map((t, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <svg width="50" height="50">
              <circle
                cx="25"
                cy="25"
                r="18"
                fill={t.color}
                stroke="#424242"
                strokeWidth="1"
                className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
              />
            </svg>
            <span className="text-slate-400 text-xs">{t.label}</span>
          </div>
        ))}
      </div>

      {/* Code explanation */}
      <div className="p-4 bg-slate-900 rounded-xl font-mono text-sm">
        <div className="text-slate-500">// Color scale function</div>
        <div className="text-purple-400">function <span className="text-yellow-300">getNodeColor</span>(label: number) {'{'}</div>
        <div className="pl-4">
          <div className="text-cyan-400">if (label &lt; 10) return <span className="text-green-400">&apos;#ffffff&apos;</span>;</div>
          <div className="text-cyan-400">if (label &lt; 50) return <span className="text-green-400">&apos;#fcdaca&apos;</span>;</div>
          <div className="text-cyan-400">if (label &lt; 100) return <span className="text-green-400">&apos;#e599a6&apos;</span>;</div>
          <div className="text-cyan-400">if (label &lt; 500) return <span className="text-green-400">&apos;#c94b77&apos;</span>;</div>
          <div className="text-cyan-400">return <span className="text-green-400">&apos;#740980&apos;</span>;</div>
        </div>
        <div className="text-purple-400">{'}'}</div>
      </div>
    </div>
  );
}

// Interactive node placement demo
interface NodePlacementDemoProps {
  width?: number;
  height?: number;
}

export function NodePlacementDemo({ width = 200, height = 200 }: NodePlacementDemoProps) {
  const demoPoints = [
    { name: 'Tara Matthews', scaleX: 0.19, scaleY: 0.0, label: 25 },
    { name: 'Jason I. Hong', scaleX: 0.39, scaleY: 0.35, label: 150 },
    { name: 'Jeffrey Heer', scaleX: 0.52, scaleY: 0.58, label: 1200, isEgo: true },
    { name: 'Ed H. Chi', scaleX: 0.79, scaleY: 0.65, label: 85 },
    { name: 'Stuart K. Card', scaleX: 0.47, scaleY: 0.41, label: 520 },
  ];

  const computeEmbedding = (scale: number, length: number) => {
    const whiteSpace = 0.15;
    return (scale + whiteSpace / 2) * length * (1 - whiteSpace);
  };

  return (
    <svg viewBox="0 0 280 280" className="w-full bg-white rounded-xl">
      {/* Block outline */}
      <rect
        x="30"
        y="30"
        width={width}
        height={height}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        rx="15"
      />

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v} opacity="0.2">
          <line
            x1={30 + computeEmbedding(v, width)}
            y1={30}
            x2={30 + computeEmbedding(v, width)}
            y2={30 + height}
            stroke="#333"
            strokeDasharray="2"
          />
          <line
            x1={30}
            y1={30 + computeEmbedding(v, height)}
            x2={30 + width}
            y2={30 + computeEmbedding(v, height)}
            stroke="#333"
            strokeDasharray="2"
          />
        </g>
      ))}

      {/* Points */}
      {demoPoints.map((pt) => {
        const cx = 30 + computeEmbedding(pt.scaleX, width);
        const cy = 30 + computeEmbedding(pt.scaleY, height);
        const color = getNodeColor(pt.label);

        return (
          <g key={pt.name}>
            <circle
              cx={cx}
              cy={cy}
              r={pt.isEgo ? 12 : 9}
              fill={color}
              stroke="#333"
              strokeWidth="2"
              className="cursor-pointer"
            />
            <text
              x={cx}
              y={cy - (pt.isEgo ? 18 : 14)}
              fill="#333"
              fontSize="9"
              textAnchor="middle"
              fontWeight={pt.isEgo ? 'bold' : 'normal'}
            >
              {pt.name.split(' ')[0]}
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text x={30 + width / 2} y={height + 55} fill="#666" fontSize="10" textAnchor="middle">
        scaleX (PCA component 1)
      </text>
      <text
        x={-height / 2 - 30}
        y={15}
        fill="#666"
        fontSize="10"
        textAnchor="middle"
        transform="rotate(-90)"
      >
        scaleY (PCA component 2)
      </text>
    </svg>
  );
}

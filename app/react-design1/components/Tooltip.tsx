'use client';

interface TooltipProps {
  x: number;
  y: number;
  name: string;
  label: string;
  visible?: boolean;
}

export default function Tooltip({ x, y, name, label, visible = true }: TooltipProps) {
  if (!visible) return null;

  return (
    <g transform={`translate(${x + 15}, ${y - 10})`} className="pointer-events-none">
      <rect
        x="0"
        y="-20"
        width="150"
        height="45"
        rx="6"
        fill="#1e293b"
        stroke="#475569"
      />
      <text x="10" y="-2" fill="white" fontSize="12" fontWeight="bold">
        {name}
      </text>
      <text x="10" y="16" fill="#94a3b8" fontSize="11">
        Citations: {label}
      </text>
    </g>
  );
}

// HTML-based tooltip for more flexibility
interface HTMLTooltipProps {
  x: number;
  y: number;
  name: string;
  label: string;
  visible?: boolean;
}

export function HTMLTooltip({ x, y, name, label, visible = true }: HTMLTooltipProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-lg z-50"
      style={{
        left: x + 15,
        top: y - 10,
        transform: 'translateY(-50%)'
      }}
    >
      <div className="text-white font-semibold text-sm">{name}</div>
      <div className="text-slate-400 text-xs">Citations: {label}</div>
    </div>
  );
}

// Demo component
export function TooltipDemo() {
  return (
    <div className="relative p-8 bg-slate-900 rounded-xl border border-slate-700 min-h-[200px]">
      <p className="text-slate-400 text-sm mb-4">
        Tooltips appear when hovering over points. They show entity name and attribute value.
      </p>

      <svg viewBox="0 0 400 150" className="w-full bg-slate-950 rounded-lg">
        {/* Demo points */}
        {[
          { x: 80, y: 75, name: 'Jeffrey Heer', label: '1234', color: '#424242' },
          { x: 180, y: 50, name: 'Ed H. Chi', label: '456', color: '#FA9902' },
          { x: 280, y: 100, name: 'Tamara Munzner', label: '789', color: '#146b6b' },
        ].map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="10"
              fill={pt.color}
              stroke="white"
              strokeWidth="2"
            />
            <text x={pt.x} y={pt.y + 25} fill="#94a3b8" fontSize="10" textAnchor="middle">
              {pt.name.split(' ')[0]}
            </text>
          </g>
        ))}

        {/* Example tooltip */}
        <Tooltip x={180} y={50} name="Ed H. Chi" label="456" />
      </svg>

      <div className="mt-4 p-3 bg-slate-800 rounded-lg">
        <div className="text-slate-500 text-xs font-mono">
          {'<Tooltip x={180} y={50} name="Ed H. Chi" label="456" />'}
        </div>
      </div>
    </div>
  );
}
